import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin }              from '@/lib/auth/check-admin';
import { createAdminClient }         from '@/lib/supabase/server';

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  await requireAdmin();
  const { id } = await params;
  const supabase = await createAdminClient();
  const body = await req.json();

  const { data, error } = await supabase
    .from('banners')
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_: NextRequest, { params }: Params) {
  await requireAdmin();
  const { id } = await params;
  const supabase = await createAdminClient();

  const { error } = await supabase.from('banners').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}