// supabase/functions/expire-follow-proofs/index.ts
// Dipanggil oleh pg_cron secara berkala. Menghapus file screenshot bukti
// follow dari bucket 'follow-proof' agar tidak membebani kuota storage:
//   - sudah pernah dilihat admin (viewed_at terisi) → langsung hapus
//   - belum pernah dilihat sama sekali → hapus setelah 3 hari (backstop)
// Row metadata di follow_proof_submissions TETAP disimpan untuk riwayat;
// hanya storage_paths yang dikosongkan + file_deleted_at diisi.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const BACKSTOP_DAYS = 3;

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const cronSecret = Deno.env.get('CRON_SECRET');
  if (cronSecret) {
    const incoming = req.headers.get('X-Cron-Secret') ?? '';
    if (incoming !== cronSecret) {
      return new Response('Unauthorized', { status: 401 });
    }
  }

  const supabaseUrl    = Deno.env.get('SUPABASE_URL')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase        = createClient(supabaseUrl, serviceRoleKey);

  const cutoff = new Date(Date.now() - BACKSTOP_DAYS * 86_400_000).toISOString();

  const { data: rows, error } = await supabase
    .from('follow_proof_submissions')
    .select('id, storage_paths')
    .is('file_deleted_at', null)
    .or(`viewed_at.not.is.null,created_at.lt.${cutoff}`)
    .not('storage_paths', 'eq', '{}');

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }

  let deletedFiles = 0;
  let deletedRows  = 0;

  for (const row of rows ?? []) {
    const paths = (row as { id: string; storage_paths: string[] }).storage_paths;
    if (!paths?.length) continue;

    const { error: removeError } = await supabase.storage.from('follow-proof').remove(paths);
    if (removeError) continue; // coba lagi di run berikutnya

    deletedFiles += paths.length;

    await supabase
      .from('follow_proof_submissions')
      .update({ file_deleted_at: new Date().toISOString(), storage_paths: [] })
      .eq('id', row.id);
    deletedRows++;
  }

  return new Response(
    JSON.stringify({ scanned: rows?.length ?? 0, deletedRows, deletedFiles }),
    { headers: { 'Content-Type': 'application/json' } },
  );
});
