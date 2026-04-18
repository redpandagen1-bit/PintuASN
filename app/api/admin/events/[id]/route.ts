// ============================================================
// app/api/admin/events/[id]/route.ts  —  PATCH | DELETE
// ============================================================

import { createClient }     from '@/lib/supabase/server';
import { requireAdmin }     from '@/lib/auth/check-admin';
import { NextResponse }     from 'next/server';
import type { NextRequest } from 'next/server';

interface Ctx { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    await requireAdmin();
    const { id } = await params;
    const supabase = await createAdminClient();
    const body     = await req.json() as Record<string, unknown>;

    const { data, error } = await supabase
      .from('events')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try {
    await requireAdmin();
    const { id } = await params;
    const supabase = await createAdminClient();

    // 1. Ambil banner_url dulu sebelum dihapus
    const { data: event } = await supabase
      .from('events')
      .select('banner_url')
      .eq('id', id)
      .single();

    // 2. Hapus dari database
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) throw error;

    // 3. Hapus gambar dari storage jika ada
    if (event?.banner_url) {
      const path = event.banner_url.split('/storage/v1/object/public/promo-images/')[1];
      if (path) {
        await supabase.storage.from('promo-images').remove([path]);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}