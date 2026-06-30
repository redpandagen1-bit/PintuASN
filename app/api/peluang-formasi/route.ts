import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

// Bandingkan nilai user dengan peserta di instansi tertentu (untuk dropdown
// "bandingkan dengan instansi lain" di halaman Peluang Formasi).
export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const instansi = new URL(req.url).searchParams.get('instansi')?.trim();
  if (!instansi) return NextResponse.json({ error: 'instansi wajib' }, { status: 400 });

  const supabase = await createAdminClient();
  const { data, error } = await supabase.rpc('instansi_comparison', {
    p_user_id: userId,
    p_instansi: instansi,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const row = (Array.isArray(data) ? data[0] : data) as { total: number; better: number } | undefined;
  const total = Number(row?.total) || 0;
  const better = Number(row?.better) || 0;
  return NextResponse.json({
    instansi,
    peers: total,
    better,
    percentile: total > 0 ? Math.round((better / total) * 100) : null,
    rank: total > 0 ? total - better + 1 : null,
  });
}
