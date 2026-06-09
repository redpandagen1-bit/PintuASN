import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/check-admin';
import { createClient } from '@supabase/supabase-js';

// ── Upload BULK soal figural (SVG) via 1 file JSON ──────────────
// Mirror alur CSV: 1 file → banyak soal → insert ke paket pada posisi.
// SVG di-inline di JSON, di sini disanitasi → diunggah ke Storage → URL
// disimpan di questions.image_url / choices.image_url / explanation_image_url.

const VALID_ANSWERS  = ['A', 'B', 'C', 'D', 'E'] as const;
const VALID_DIFF     = ['easy', 'medium', 'hard'] as const;
const DANGEROUS_SVG  = /<script|javascript:|\son\w+\s*=|<foreignObject|<!ENTITY/i;

function getExpectedCategory(position: number): 'TWK' | 'TIU' | 'TKP' {
  if (position <= 30) return 'TWK';
  if (position <= 65) return 'TIU';
  return 'TKP';
}

interface FiguralChoice { label?: string; svg?: string }
interface FiguralQuestion {
  position?: number;
  content?: string;
  question_svg?: string;
  explanation?: string;
  explanation_svg?: string;
  correct_answer?: string;
  difficulty?: string;
  choices?: FiguralChoice[];
}

function isSvg(s: unknown): s is string {
  return typeof s === 'string' && s.includes('<svg') && s.includes('</svg>');
}

export async function POST(req: NextRequest) {
  let userId: string;
  try {
    userId = await requireAdmin();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  let body: { packageId?: string; questions?: FiguralQuestion[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Body harus JSON valid' }, { status: 400 });
  }

  const packageId = body.packageId;
  const questions = body.questions;
  if (!packageId) return NextResponse.json({ error: 'packageId wajib' }, { status: 400 });
  if (!Array.isArray(questions) || questions.length === 0) {
    return NextResponse.json({ error: 'JSON harus berupa array soal yang tidak kosong' }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  // Posisi yang sudah terisi di paket ini
  const { data: existing } = await supabase
    .from('package_questions')
    .select('position')
    .eq('package_id', packageId);
  const occupied = new Set((existing ?? []).map((p: { position: number }) => p.position));

  // ── Validasi semua soal dulu (all-or-nothing) ─────────────────
  const invalid: { index: number; position?: number; errors: string[] }[] = [];
  const skipped: { index: number; position: number; reason: string }[] = [];
  const valid:   (FiguralQuestion & { position: number })[] = [];

  questions.forEach((q, i) => {
    const errors: string[] = [];
    const position = Number(q.position);

    if (!q.position || isNaN(position) || position < 1 || position > 110) {
      errors.push('position wajib & harus angka 1–110');
      invalid.push({ index: i, position: q.position, errors });
      return;
    }
    if (occupied.has(position)) {
      skipped.push({ index: i, position, reason: 'Posisi sudah terisi' });
      return;
    }

    if (!isSvg(q.question_svg)) errors.push('question_svg wajib & harus berupa SVG valid');
    else if (DANGEROUS_SVG.test(q.question_svg!)) errors.push('question_svg mengandung konten berbahaya (script/handler)');

    if (!q.correct_answer || !VALID_ANSWERS.includes(q.correct_answer as typeof VALID_ANSWERS[number])) {
      errors.push('correct_answer harus salah satu dari A–E');
    }

    if (!Array.isArray(q.choices) || q.choices.length !== 5) {
      errors.push('harus tepat 5 pilihan (A–E)');
    } else {
      for (const L of VALID_ANSWERS) {
        const c = q.choices.find((x) => x.label === L);
        if (!c) { errors.push(`pilihan ${L} hilang`); continue; }
        if (!isSvg(c.svg)) errors.push(`pilihan ${L}: svg wajib & harus SVG valid`);
        else if (DANGEROUS_SVG.test(c.svg!)) errors.push(`pilihan ${L}: svg mengandung konten berbahaya`);
      }
    }

    if (q.explanation_svg) {
      if (!isSvg(q.explanation_svg)) errors.push('explanation_svg bukan SVG valid');
      else if (DANGEROUS_SVG.test(q.explanation_svg)) errors.push('explanation_svg mengandung konten berbahaya');
    }

    if (errors.length > 0) invalid.push({ index: i, position, errors });
    else valid.push({ ...q, position });
  });

  if (invalid.length > 0) {
    return NextResponse.json({ inserted: 0, valid: valid.length, invalid, skipped });
  }

  // ── Helper upload satu SVG ke Storage ─────────────────────────
  const uploadSvg = async (svg: string, slot: string, position: number): Promise<string> => {
    const rand = Math.random().toString(36).substring(2, 7);
    const fileName = `figural_${packageId}_${position}_${slot}_${Date.now()}_${rand}.svg`;
    const { error } = await supabase.storage
      .from('question-images')
      .upload(fileName, Buffer.from(svg, 'utf-8'), {
        contentType: 'image/svg+xml',
        upsert: false,
      });
    if (error) throw error;
    const { data } = supabase.storage.from('question-images').getPublicUrl(fileName);
    return data.publicUrl;
  };

  // ── Insert (semua sudah tervalidasi) ──────────────────────────
  let inserted = 0;
  try {
    for (const q of valid) {
      const category = getExpectedCategory(q.position);

      const questionImg = await uploadSvg(q.question_svg!, 'soal', q.position);
      const explanationImg = q.explanation_svg
        ? await uploadSvg(q.explanation_svg, 'pembahasan', q.position)
        : null;

      const { data: question, error: qErr } = await supabase
        .from('questions')
        .insert({
          category,
          content:               q.content?.trim() || '',     // kolom NOT NULL → '' untuk soal gambar
          image_url:             questionImg,
          explanation:           q.explanation?.trim() || null,
          explanation_image_url: explanationImg,
          difficulty:            VALID_DIFF.includes(q.difficulty as typeof VALID_DIFF[number]) ? q.difficulty : 'medium',
          is_published:          true,
          status:                'published',
          created_by:            userId,
        })
        .select()
        .single();
      if (qErr) throw qErr;

      const choiceRows = [];
      for (const L of VALID_ANSWERS) {
        const c = q.choices!.find((x) => x.label === L)!;
        const choiceImg = await uploadSvg(c.svg!, `pilihan_${L}`, q.position);
        choiceRows.push({
          question_id: question.id,
          label:       L,
          content:     '',                       // kolom NOT NULL → '' untuk pilihan gambar
          image_url:   choiceImg,
          is_answer:   L === q.correct_answer,
          score:       null,
        });
      }
      const { error: cErr } = await supabase.from('choices').insert(choiceRows);
      if (cErr) throw cErr;

      const { error: pqErr } = await supabase
        .from('package_questions')
        .insert({ package_id: packageId, question_id: question.id, position: q.position });
      if (pqErr) throw pqErr;

      inserted++;
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Gagal menyimpan';
    return NextResponse.json(
      { error: msg, inserted, partial: true },
      { status: 500 },
    );
  }

  return NextResponse.json({ inserted, valid: valid.length, invalid, skipped });
}
