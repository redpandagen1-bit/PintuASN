// ============================================================
// app/api/events/route.ts  —  public: ambil event aktif
// ============================================================

import { createClient } from '@/lib/supabase/server';
import { NextResponse }  from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const now      = new Date().toISOString();

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('is_active', true)
      // hanya tampilkan event yang belum berakhir (atau tanpa end_date)
      .or(`end_date.is.null,end_date.gte.${now}`)
      .order('order_index', { ascending: true })
      .order('created_at',  { ascending: false });

    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}