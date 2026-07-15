import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { attemptId, timeRemaining } = await req.json();

    // Validasi input: timeRemaining wajib angka non-negatif & tidak melebihi
    // durasi ujian penuh (100 menit). Mencegah payload sampah / negatif.
    const EXAM_DURATION_MS = 6_000_000;
    if (!attemptId || typeof timeRemaining !== 'number' || !Number.isFinite(timeRemaining)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }
    const requested = Math.min(Math.max(Math.floor(timeRemaining), 0), EXAM_DURATION_MS);

    const supabase = await createAdminClient();

    // Ambil attempt milik user untuk verifikasi status & sisa waktu saat ini.
    const { data: current, error: fetchErr } = await supabase
      .from('attempts')
      .select('time_remaining, status')
      .eq('id', attemptId)
      .eq('user_id', userId)
      .single();

    if (fetchErr || !current) {
      return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
    }
    // Hanya ujian yang sedang berjalan yang boleh diperbarui sisa waktunya.
    if (current.status !== 'in_progress') {
      return NextResponse.json({ error: 'Attempt not in progress' }, { status: 400 });
    }

    // INTEGRITAS WAKTU: sisa waktu hanya boleh BERKURANG. Ini menutup celah
    // di mana client mengirim nilai besar untuk memperpanjang ujiannya sendiri
    // (tidak ada deadline server absolut, jadi nilai ini yang dipakai saat resume).
    const currentRemaining = typeof current.time_remaining === 'number'
      ? current.time_remaining
      : EXAM_DURATION_MS;
    const safeRemaining = Math.min(requested, currentRemaining);

    const { error } = await supabase
      .from('attempts')
      .update({
        time_remaining: safeRemaining,
        updated_at: new Date().toISOString(),
      })
      .eq('id', attemptId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error saving progress:', error);
      return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Save progress error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}