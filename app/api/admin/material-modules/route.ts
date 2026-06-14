import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { requireAdmin } from '@/lib/auth/check-admin';
import { createClient } from '@supabase/supabase-js';

function admin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

// List semua modul aktif (untuk panel admin)
export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  const { data, error } = await admin()
    .from('material_modules')
    .select('id, category, topic, title, tier, read_minutes, topic_order, sub_order, is_new')
    .eq('is_deleted', false)
    .order('category').order('topic_order').order('topic').order('sub_order');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ modules: data ?? [] });
}

// Soft-delete: 1 modul (body.id) ATAU seluruh topik (body.category + body.topic)
export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Body harus JSON' }, { status: 400 }); }

  const q = admin().from('material_modules').update({ is_deleted: true, is_active: false });
  if (body?.id) {
    const { error } = await q.eq('id', body.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else if (body?.category && body?.topic) {
    const { error } = await q.eq('category', body.category).eq('topic', body.topic).eq('is_deleted', false);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    return NextResponse.json({ error: 'Butuh id, atau category + topic' }, { status: 400 });
  }
  revalidateTag('material-modules');
  return NextResponse.json({ ok: true });
}
