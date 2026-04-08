// ============================================================
// app/api/admin/upload/promo/route.ts
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { checkIsAdmin }              from '@/lib/auth/check-admin';
import { createAdminClient }         from '@/lib/supabase/server'; // ← ganti ini

export async function POST(req: NextRequest) {
  await checkIsAdmin();
  const supabase = await createAdminClient(); // ← dan ini

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
}