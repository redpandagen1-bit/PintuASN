import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin }              from '@/lib/auth/check-admin';
import { createAdminClient }         from '@/lib/supabase/server';

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  await requireAdmin();
  const { id } = await params;
  const supabase = await createAdminClient();
  const body = await req.json() as {
    is_active?: boolean;
    name?: string | null;
    discount_type?: 'percent' | 'fixed';
    discount_value?: number;
    max_uses?: number | null;
    expired_at?: string | null;
    allowed_tiers?: ('premium' | 'platinum')[] | null;
  };

  const update: Record<string, unknown> = {};
  if (body.is_active      !== undefined) update.is_active      = body.is_active;
  if (body.name           !== undefined) update.name           = body.name;
  if (body.discount_type  !== undefined) update.discount_type  = body.discount_type;
  if (body.discount_value !== undefined) update.discount_value = body.discount_value;
  if (body.max_uses       !== undefined) update.max_uses       = body.max_uses;
  if (body.expired_at     !== undefined) update.expired_at     = body.expired_at;
  if (body.allowed_tiers  !== undefined) update.allowed_tiers  = body.allowed_tiers?.length ? body.allowed_tiers : null;

  const { data, error } = await supabase
    .from('referral_codes')
    .update(update)
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

  const { error } = await supabase.from('referral_codes').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}