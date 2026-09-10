// ============================================================
// app/api/admin/follow-proofs/[id]/route.ts  —  DELETE
// Hapus file screenshot dari storage (dipanggil otomatis saat admin
// menutup viewer setelah melihat). Row metadata tetap disimpan untuk riwayat.
// ============================================================

import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/check-admin';
import { createAdminClient } from '@/lib/supabase/server';

interface Ctx { params: Promise<{ id: string }> }

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    await requireAdmin();
    const { id } = await params;
    const supabase = await createAdminClient();

    const { data: submission, error } = await supabase
      .from('follow_proof_submissions')
      .select('storage_paths, file_deleted_at')
      .eq('id', id)
      .single();

    if (error || !submission) {
      return NextResponse.json({ error: 'Submission tidak ditemukan' }, { status: 404 });
    }
    if (submission.file_deleted_at) {
      return NextResponse.json({ success: true }); // sudah terhapus sebelumnya
    }

    await supabase.storage.from('follow-proof').remove(submission.storage_paths);

    await supabase
      .from('follow_proof_submissions')
      .update({ file_deleted_at: new Date().toISOString(), storage_paths: [] })
      .eq('id', id);

    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
