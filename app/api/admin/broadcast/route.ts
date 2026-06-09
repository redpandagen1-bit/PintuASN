// app/api/admin/broadcast/route.ts
import { requireAdmin }      from '@/lib/auth/check-admin';
import { createAdminClient } from '@/lib/supabase/server';
import { NextResponse }      from 'next/server';

// Kirim broadcast ke SEMUA user (fan-out: 1 baris notifikasi per user).
// Body: { title: string; body?: string; link?: string }
export async function POST(req: Request) {
  let adminId: string;
  try {
    adminId = await requireAdmin();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const payload = await req.json().catch(() => ({}));
  const title = String(payload.title ?? '').trim();
  const body  = payload.body ? String(payload.body).trim() : null;
  const link  = payload.link ? String(payload.link).trim() : null;

  if (!title) {
    return NextResponse.json({ error: 'Judul wajib diisi' }, { status: 400 });
  }
  if (title.length > 120) {
    return NextResponse.json({ error: 'Judul maksimal 120 karakter' }, { status: 400 });
  }

  const supabase = await createAdminClient();

  // Ambil semua user_id penerima
  const { data: users, error: usersErr } = await supabase
    .from('profiles')
    .select('user_id');

  if (usersErr) {
    return NextResponse.json({ error: usersErr.message }, { status: 500 });
  }

  const recipients = (users ?? [])
    .map((u: { user_id: string }) => u.user_id)
    .filter(Boolean);

  if (recipients.length === 0) {
    return NextResponse.json({ error: 'Tidak ada penerima' }, { status: 400 });
  }

  // Fan-out: 1 baris notifikasi per user
  const rows = recipients.map((uid) => ({
    user_id: uid,
    type:    'broadcast',
    title,
    body,
    link,
  }));

  const { error: insertErr } = await supabase.from('notifications').insert(rows);
  if (insertErr) {
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  // Catat ke log broadcast (history admin)
  await supabase.from('broadcasts').insert({
    title,
    body,
    link,
    sent_by:         adminId,
    recipient_count: recipients.length,
  });

  return NextResponse.json({ ok: true, recipientCount: recipients.length });
}

// Riwayat broadcast (untuk panel admin)
export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const supabase = await createAdminClient();
  const { data } = await supabase
    .from('broadcasts')
    .select('id, title, body, link, recipient_count, created_at')
    .order('created_at', { ascending: false })
    .limit(10);

  return NextResponse.json({ broadcasts: data ?? [] });
}
