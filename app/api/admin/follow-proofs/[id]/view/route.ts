// ============================================================
// app/api/admin/follow-proofs/[id]/view/route.ts  —  POST
// Generate signed URL (short-lived) untuk lihat screenshot, dan tandai
// viewed_at kalau ini pertama kali dilihat. File belum dihapus di sini —
// baru dihapus lewat DELETE saat admin menutup viewer (lihat [id]/route.ts).
// ============================================================

import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/check-admin';
import { createAdminClient } from '@/lib/supabase/server';

interface Ctx { params: Promise<{ id: string }> }

export async function POST(_req: Request, { params }: Ctx) {
  try {
    await requireAdmin();
    const { id } = await params;
    const supabase = await createAdminClient();

    const { data: submission, error } = await supabase
      .from('follow_proof_submissions')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !submission) {
      return NextResponse.json({ error: 'Submission tidak ditemukan' }, { status: 404 });
    }
    if (submission.file_deleted_at) {
      return NextResponse.json({ error: 'File sudah terhapus (kedaluwarsa atau sudah pernah dilihat sebelumnya)' }, { status: 410 });
    }

    const { data: signed, error: signError } = await supabase.storage
      .from('follow-proof')
      .createSignedUrls(submission.storage_paths, 120);

    if (signError) throw signError;

    if (!submission.viewed_at) {
      await supabase
        .from('follow_proof_submissions')
        .update({ viewed_at: new Date().toISOString() })
        .eq('id', id);
    }

    return NextResponse.json({
      urls: (signed ?? []).map(s => s.signedUrl).filter(Boolean),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
