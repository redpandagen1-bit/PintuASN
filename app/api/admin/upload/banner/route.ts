import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin }              from '@/lib/auth/check-admin';
import { createAdminClient }         from '@/lib/supabase/server';

// Ukuran wajib banner: 1200 × 400 px
// Tidak boleh di-export: file route Next.js hanya boleh meng-export handler HTTP
// dan field konfigurasi resmi (mis. runtime, dynamic). Konstanta ini hanya
// dipakai internal di route ini.
const BANNER_WIDTH  = 1200;
const BANNER_HEIGHT = 400;

export async function POST(req: NextRequest) {
  // Konsisten dengan route admin lain: requireAdmin dibungkus try/catch agar
  // request tanpa hak admin mendapat 403 (bukan 500 dari throw yang tak tertangani).
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
    const fileName = `banner-${Date.now()}.${ext}`;
    const buffer   = Buffer.from(await file.arrayBuffer());

    const { data, error } = await supabase.storage
      .from('promo-images')     // bucket "banners" belum ada → pakai promo-images
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
    console.error('[banner upload]', err instanceof Error ? err.message : 'unknown');
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}