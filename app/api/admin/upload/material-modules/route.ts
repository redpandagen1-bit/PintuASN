import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { requireAdmin } from '@/lib/auth/check-admin';
import { createClient } from '@supabase/supabase-js';

// ── Upload BULK materi modul via 1 file JSON ────────────────────
// Struktur: { groups: [ { category, topic, tier?, topic_order?, modules: [...] } ] }
// atau langsung 1 group { category, topic, modules: [...] }, atau array of groups.
// Tiap module: { title, content_body, tier?, read_minutes?, sub_order?, is_new?, quiz? }
//
// Mode 'add'       : insert; lewati modul yang judulnya sudah ada di topik tsb.
// Mode 'overwrite' : arsipkan SEMUA modul aktif di (category, topic) lalu insert ulang.

const VALID_CATEGORY = ['TWK', 'TIU', 'TKP', 'INFORMASI'] as const;
const VALID_TIER     = ['free', 'premium', 'platinum'] as const;
// Tolak SVG berbahaya (script/handler) — sama seperti uploader figural.
const DANGEROUS_SVG  = /<script|javascript:|\son\w+\s*=|<foreignObject|<!ENTITY/i;

interface QuizItem { question?: string; choices?: string[]; answer?: number; explanation?: string }
interface PageInput { content?: string; info?: string | null; quiz?: QuizItem[] | null }
interface ModuleInput {
  title?: string; content_body?: string; tier?: string;
  read_minutes?: number; sub_order?: number; is_new?: boolean;
  pages?: PageInput[]; quiz?: QuizItem[];   // pages = format baru; content_body+quiz = legacy
}
interface GroupInput {
  category?: string; topic?: string; tier?: string; topic_order?: number; modules?: ModuleInput[];
}

function validateQuiz(quiz: unknown): string | null {
  if (quiz == null) return null;
  if (!Array.isArray(quiz)) return 'quiz harus berupa array';
  for (const [i, q] of quiz.entries()) {
    if (!q || typeof q.question !== 'string' || !q.question.trim()) return `quiz[${i}].question wajib`;
    if (!Array.isArray(q.choices) || q.choices.length < 2) return `quiz[${i}].choices minimal 2`;
    if (typeof q.answer !== 'number' || q.answer < 0 || q.answer >= q.choices.length) return `quiz[${i}].answer index tidak valid`;
  }
  return null;
}

export async function POST(req: NextRequest) {
  let userId: string;
  try {
    userId = await requireAdmin();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Body harus JSON valid' }, { status: 400 });
  }

  const mode: 'add' | 'overwrite' = body?.mode === 'overwrite' ? 'overwrite' : 'add';

  // Normalisasi input → array of groups
  let groups: GroupInput[];
  if (Array.isArray(body)) groups = body;
  else if (Array.isArray(body?.groups)) groups = body.groups;
  else if (body?.category && body?.topic) groups = [body];
  else return NextResponse.json({ error: 'Format JSON tidak dikenali — butuh { groups: [...] } atau 1 group { category, topic, modules }' }, { status: 400 });

  if (groups.length === 0) return NextResponse.json({ error: 'Tidak ada materi untuk diproses' }, { status: 400 });

  // ── Validasi semua dulu (all-or-nothing) ───────────────────────
  const invalid: { group: string; errors: string[] }[] = [];
  const clean: { category: string; topic: string; topic_order: number;
    rows: { title: string; pages: PageInput[]; tier: string; read_minutes: number | null;
            sub_order: number; is_new: boolean }[] }[] = [];

  groups.forEach((g, gi) => {
    const label  = g.topic ? `Topik "${g.topic}"` : `Group #${gi + 1}`;
    const errors: string[] = [];

    if (!g.category || !VALID_CATEGORY.includes(g.category as any)) errors.push('category wajib (TWK/TIU/TKP/INFORMASI)');
    if (!g.topic?.trim()) errors.push('topic wajib');
    if (!Array.isArray(g.modules) || g.modules.length === 0) errors.push('modules wajib (minimal 1 sub-topik)');
    const groupTier = g.tier && VALID_TIER.includes(g.tier as any) ? g.tier : 'free';

    const rows: typeof clean[number]['rows'] = [];
    (g.modules ?? []).forEach((m, mi) => {
      const mLabel = `modul #${mi + 1} "${m.title ?? ''}"`;
      if (!m.title?.trim()) errors.push(`modul #${mi + 1}: title wajib`);

      // Normalisasi → array pages (dukung legacy content_body)
      let pages: PageInput[] = [];
      if (Array.isArray(m.pages) && m.pages.length > 0) pages = m.pages;
      else if (m.content_body?.trim()) pages = [{ content: m.content_body, info: null, quiz: m.quiz ?? null }];
      else errors.push(`${mLabel}: butuh "pages" (atau content_body)`);

      pages.forEach((p, pi) => {
        if (!p || typeof p.content !== 'string' || !p.content.trim()) errors.push(`${mLabel} hal.${pi + 1}: content wajib`);
        else if (DANGEROUS_SVG.test(p.content)) errors.push(`${mLabel} hal.${pi + 1}: content mengandung script/handler berbahaya`);
        if (p?.info && DANGEROUS_SVG.test(p.info)) errors.push(`${mLabel} hal.${pi + 1}: info mengandung script/handler berbahaya`);
        const quizErr = validateQuiz(p?.quiz);
        if (quizErr) errors.push(`${mLabel} hal.${pi + 1}: ${quizErr}`);
      });

      const tier = m.tier && VALID_TIER.includes(m.tier as any) ? m.tier : groupTier;
      rows.push({
        title:        (m.title ?? '').trim(),
        pages:        pages.map(p => ({
          content: (p.content ?? '').trim(),
          info:    p.info?.trim() || null,
          quiz:    Array.isArray(p.quiz) ? p.quiz : null,
        })),
        tier,
        read_minutes: typeof m.read_minutes === 'number' ? m.read_minutes : null,
        sub_order:    typeof m.sub_order === 'number' ? m.sub_order : mi + 1,
        is_new:       m.is_new === true,
      });
    });

    if (errors.length > 0) { invalid.push({ group: label, errors }); return; }
    clean.push({
      category:    g.category!,
      topic:       g.topic!.trim(),
      topic_order: typeof g.topic_order === 'number' ? g.topic_order : gi,
      rows,
    });
  });

  if (invalid.length > 0) {
    return NextResponse.json({ inserted: 0, invalid }, { status: 200 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  let inserted = 0, archived = 0, skipped = 0;
  try {
    for (const grp of clean) {
      // Judul yang sudah ada (aktif) di topik ini
      const { data: existing } = await supabase
        .from('material_modules')
        .select('id, title')
        .eq('category', grp.category).eq('topic', grp.topic)
        .eq('is_active', true).eq('is_deleted', false);
      const existingTitles = new Set((existing ?? []).map((r: any) => r.title));

      if (mode === 'overwrite' && existing && existing.length > 0) {
        const { error: delErr } = await supabase
          .from('material_modules')
          .update({ is_deleted: true, is_active: false })
          .in('id', existing.map((r: any) => r.id));
        if (delErr) throw delErr;
        archived += existing.length;
        existingTitles.clear();
      }

      const toInsert = grp.rows
        .filter(r => mode === 'overwrite' || !existingTitles.has(r.title))
        .map(r => ({
          category: grp.category, topic: grp.topic, topic_order: grp.topic_order,
          title: r.title, content_body: null, pages: r.pages, tier: r.tier,
          read_minutes: r.read_minutes, sub_order: r.sub_order, is_new: r.is_new,
          quiz: null, created_by: userId,
        }));
      skipped += grp.rows.length - toInsert.length;

      if (toInsert.length > 0) {
        const { error: insErr } = await supabase.from('material_modules').insert(toInsert);
        if (insErr) throw insErr;
        inserted += toInsert.length;
      }
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Gagal menyimpan';
    return NextResponse.json({ error: msg, inserted, archived, partial: true }, { status: 500 });
  }

  revalidateTag('material-modules');
  return NextResponse.json({ inserted, archived, skipped, invalid: [] });
}
