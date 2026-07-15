// ============================================================
// app/api/admin/upload/promo/route.ts
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin }              from '@/lib/auth/check-admin';
import { createAdminClient }         from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  // KEAMANAN: sebelumnya memanggil checkIsAdmin() tanpa memeriksa hasilnya —
  // artinya otorisasi admin TIDAK ditegakkan (siapa pun bisa upload ke storage
  // via service-role client). Pakai requireAdmin() yang melempar bila bukan admin.
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const supabase = await createAdminClient();

    const formData = await req.formData();
    const file     = formData.get('file') as File | null;

    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

    const ext      = file.name.split('.').pop();
    const fileName = `promo-${Date.now()}.${ext}`;
    const buffer   = Buffer.from(await file.arrayBuffer());

    const { data, error } = await supabase.storage
      .from('promo-images')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const { data: { publicUrl } } = supabase.storage
      .from('promo-images')
      .getPublicUrl(data.path);

    return NextResponse.json({ url: publicUrl });
  } catch (err) {
    console.error('[promo upload]', err instanceof Error ? err.message : 'unknown');
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}