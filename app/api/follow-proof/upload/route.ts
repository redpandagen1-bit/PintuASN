// ============================================================
// app/api/follow-proof/upload/route.ts
// Upload screenshot bukti follow sosmed — auto-approved (honor system),
// disimpan di bucket privat 'follow-proof'. File dihapus nanti oleh admin
// saat dilihat atau oleh cron backstop (lihat supabase/functions/expire-follow-proofs).
// ============================================================

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { rateLimit } from '@/lib/rate-limit';

const MAX_FILES = 1;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const rl = await rateLimit(`follow-proof-upload:${userId}`, 10, 10 * 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Terlalu banyak percobaan. Coba lagi nanti.' }, { status: 429 });
    }

    const formData   = await req.formData();
    const files       = formData.getAll('files').filter((f): f is File => f instanceof File);
    const packageId   = formData.get('packageId');
    const eventId     = formData.get('eventId');

    if (files.length === 0) {
      return NextResponse.json({ error: 'Upload minimal 1 screenshot' }, { status: 400 });
    }
    if (files.length > MAX_FILES) {
      return NextResponse.json({ error: `Maksimal ${MAX_FILES} gambar` }, { status: 400 });
    }
    for (const f of files) {
      if (!ALLOWED_TYPES.includes(f.type)) {
        return NextResponse.json({ error: 'Format file harus JPG, PNG, atau WEBP' }, { status: 400 });
      }
      if (f.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: 'Ukuran tiap file maksimal 5MB' }, { status: 400 });
      }
    }

    const supabase = await createAdminClient();
    const storagePaths: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file   = files[i];
      const ext    = file.name.split('.').pop() ?? 'jpg';
      const path   = `${userId}/${Date.now()}-${i}.${ext}`;
      const buffer = Buffer.from(await file.arrayBuffer());

      const { error: uploadError } = await supabase.storage
        .from('follow-proof')
        .upload(path, buffer, { contentType: file.type, upsert: false });

      if (uploadError) {
        // Bersihkan yang sudah sempat ter-upload sebelum gagal
        if (storagePaths.length) await supabase.storage.from('follow-proof').remove(storagePaths);
        return NextResponse.json({ error: 'Gagal upload: ' + uploadError.message }, { status: 500 });
      }
      storagePaths.push(path);
    }

    const { error: insertError } = await supabase.from('follow_proof_submissions').insert({
      user_id:       userId,
      package_id:    typeof packageId === 'string' && packageId ? packageId : null,
      event_id:      typeof eventId === 'string' && eventId ? eventId : null,
      storage_paths: storagePaths,
    });

    if (insertError) {
      await supabase.storage.from('follow-proof').remove(storagePaths);
      return NextResponse.json({ error: 'Gagal menyimpan data: ' + insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('[follow-proof/upload]', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
