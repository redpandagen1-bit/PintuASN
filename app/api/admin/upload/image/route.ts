import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/check-admin';
import { createClient } from '@supabase/supabase-js';
import { MAX_IMAGE_UPLOAD_BYTES, MAX_IMAGE_UPLOAD_LABEL } from '@/lib/upload-limits';

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const packageId = formData.get('packageId') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      );
    }

    // Validate file type — raster images + SVG (untuk soal figural)
    const ALLOWED_TYPES = [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/webp',
      'image/svg+xml',
    ];
    const isSvg = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');
    if (!ALLOWED_TYPES.includes(file.type) && !isSvg) {
      return NextResponse.json(
        { error: 'Hanya file gambar (PNG, JPG, WEBP, SVG) yang diperbolehkan' },
        { status: 400 }
      );
    }

    // Validate file size — harus sama dengan file_size_limit bucket 'question-images'
    if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: `Ukuran file terlalu besar (maksimal ${MAX_IMAGE_UPLOAD_LABEL}). Kompres gambar terlebih dahulu.` },
        { status: 400 }
      );
    }

    // Sanitasi SVG — tolak markup berbahaya (script / event handler / external ref).
    // Cek sekali saat upload; tidak ada dampak ke performa render exam.
    let contentType = file.type || 'application/octet-stream';
    if (isSvg) {
      const svgText = await file.text();
      const dangerous = /<script|javascript:|\son\w+\s*=|<foreignObject|<!ENTITY/i;
      if (dangerous.test(svgText)) {
        return NextResponse.json(
          { error: 'File SVG mengandung konten yang tidak diizinkan (script/handler).' },
          { status: 400 }
        );
      }
      contentType = 'image/svg+xml';
    }

    // Create Supabase Storage client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const ext = isSvg ? 'svg' : file.name.split('.').pop();
    const fileName = `${packageId || 'general'}_${timestamp}_${randomStr}.${ext}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('question-images')
      .upload(fileName, file, {
        contentType,
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      // Bucket bisa menolak karena ukuran (file_size_limit). Beri pesan jelas
      // alih-alih 500 generik kalau app & bucket sempat mismatch.
      const status = (error as any).statusCode;
      const tooLarge =
        status === '413' ||
        status === 413 ||
        /maximum allowed size|payload too large|exceeded/i.test(error.message);
      if (tooLarge) {
        return NextResponse.json(
          { error: `Ukuran file terlalu besar (maksimal ${MAX_IMAGE_UPLOAD_LABEL}). Kompres gambar terlebih dahulu.` },
          { status: 400 }
        );
      }
      throw error;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('question-images')
      .getPublicUrl(fileName);

    return NextResponse.json({ url: urlData.publicUrl });
  } catch (error: any) {
    console.error('Image upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload image' },
      { status: 500 }
    );
  }
}