import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { pickDrillingQuestions } from '@/lib/supabase/drilling';
import {
  DRILLING_TOPICS,
  DRILLING_LIMITS,
  type DrillingCategory,
} from '@/constants/drilling';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Catatan: fitur drilling sementara terbuka untuk semua user.
    // Gating tier (rencana: premium) menyusul.

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const rawSelections = Array.isArray(body?.selections) ? body.selections : [];
    const count = Number(body?.count);
    const durationMinutes = Number(body?.durationMinutes);

    // ── Validasi selections (pasangan kategori + topik) ───────
    const pairs: { category: DrillingCategory; topic: string }[] = [];
    const catSet = new Set<DrillingCategory>();
    for (const s of rawSelections) {
      const category = s?.category as DrillingCategory;
      const topic = s?.topic as string;
      if (category in DRILLING_TOPICS && DRILLING_TOPICS[category].includes(topic)) {
        pairs.push({ category, topic });
        catSet.add(category);
      }
    }
    if (pairs.length === 0) {
      return NextResponse.json({ error: 'Pilih minimal satu topik' }, { status: 400 });
    }
    if (
      !Number.isFinite(count) ||
      count < DRILLING_LIMITS.MIN_QUESTIONS ||
      count > DRILLING_LIMITS.MAX_QUESTIONS
    ) {
      return NextResponse.json(
        { error: `Jumlah soal harus ${DRILLING_LIMITS.MIN_QUESTIONS}-${DRILLING_LIMITS.MAX_QUESTIONS}` },
        { status: 400 },
      );
    }
    if (
      !Number.isFinite(durationMinutes) ||
      durationMinutes < DRILLING_LIMITS.MIN_MINUTES ||
      durationMinutes > DRILLING_LIMITS.MAX_MINUTES
    ) {
      return NextResponse.json(
        { error: `Durasi harus ${DRILLING_LIMITS.MIN_MINUTES}-${DRILLING_LIMITS.MAX_MINUTES} menit` },
        { status: 400 },
      );
    }

    // ── Pilih soal lintas kategori (prioritas belum dikerjakan) ──
    const questionIds = await pickDrillingQuestions(userId, pairs, Math.floor(count));
    if (questionIds.length === 0) {
      return NextResponse.json(
        { error: 'Tidak ada soal untuk topik yang dipilih' },
        { status: 404 },
      );
    }

    const supabase = await createAdminClient();

    const cats = Array.from(catSet);
    const catLabel = cats.join('/');
    const titleTopics =
      pairs.length <= 2 ? pairs.map((p) => p.topic).join(', ') : `${pairs.length} topik`;

    // ── Buat paket drilling (tersembunyi dari daftar tryout) ──
    const { data: pkg, error: pkgError } = await supabase
      .from('packages')
      .insert({
        title: `Drilling ${catLabel}: ${titleTopics}`,
        description: `Sesi drilling ${pairs.map((p) => p.topic).join(', ')}`,
        difficulty: 'medium',
        duration_minutes: Math.floor(durationMinutes),
        tier: 'free',
        is_active: false,
        is_deleted: false,
        kind: 'drilling',
        total_questions: questionIds.length,
        created_by: userId,
      })
      .select('id')
      .single();

    if (pkgError || !pkg) {
      console.error('Drilling: create package failed', pkgError?.message);
      return NextResponse.json({ error: 'Gagal membuat sesi drilling' }, { status: 500 });
    }

    const packageQuestions = questionIds.map((qid, i) => ({
      package_id: pkg.id,
      question_id: qid,
      position: i + 1,
    }));

    const { error: pqError } = await supabase.from('package_questions').insert(packageQuestions);
    if (pqError) {
      console.error('Drilling: insert package_questions failed', pqError.message);
      return NextResponse.json({ error: 'Gagal menyiapkan soal' }, { status: 500 });
    }

    const { data: attempt, error: attemptError } = await supabase
      .from('attempts')
      .insert({
        user_id: userId,
        package_id: pkg.id,
        kind: 'drilling',
        status: 'in_progress',
        started_at: new Date().toISOString(),
        time_remaining: Math.floor(durationMinutes) * 60 * 1000,
      })
      .select('id')
      .single();

    if (attemptError || !attempt) {
      console.error('Drilling: create attempt failed', attemptError?.message);
      return NextResponse.json({ error: 'Gagal memulai sesi' }, { status: 500 });
    }

    return NextResponse.json({
      attemptId: attempt.id,
      total: questionIds.length,
      requested: Math.floor(count),
    });
  } catch (error) {
    console.error('Drilling start error:', error instanceof Error ? error.message : 'unknown');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
