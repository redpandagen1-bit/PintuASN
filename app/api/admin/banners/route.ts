import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin }              from '@/lib/auth/check-admin';
import { createAdminClient }         from '@/lib/supabase/server';

export async function GET() {
  try { await requireAdmin(); } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const supabase = await createAdminClient();
  const { data, error } = await supabase
    .from('banners')
    .select('*')
    .order('order_index', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  try { await requireAdmin(); } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const supabase = await createAdminClient();
  const body = await req.json();

  const { data, error } = await supabase
    .from('banners')
    .insert({
      title:       body.title,
      image_url:   body.image_url,
      button_link: body.button_link ?? '/daftar-tryout',
      is_active:   body.is_active  ?? true,
      order_index: body.order_index ?? 99,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}