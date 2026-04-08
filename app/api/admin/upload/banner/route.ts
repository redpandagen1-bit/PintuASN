import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin }              from '@/lib/auth/check-admin';
import { createAdminClient }         from '@/lib/supabase/server';

// Ukuran wajib banner: 1200 × 400 px
export const BANNER_WIDTH  = 1200;
export const BANNER_HEIGHT = 400;

export async function POST(req: NextRequest) {
  await requireAdmin();
  const supabase = await createAdminClient();

  const formData = await req.formData();
  const file     = formData.get('file') as File | null;

  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

  const ext      = file.name.split('.').pop();
  const fileName = `banner-${Date.now()}.${ext}`;
  const buffer   = Buffer.from(await file.arrayBuffer());

  const { data, error } = await supabase.storage
    .from('banners')          // buat bucket "banners" di Supabase Storage dulu
    .upload(fileName, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: { publicUrl } } = supabase.storage
    .from('banners')
    .getPublicUrl(data.path);

  return NextResponse.json({ url: publicUrl });
}