import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin }              from '@/lib/auth/check-admin';
import { createAdminClient }         from '@/lib/supabase/server';

export async function GET() {
  try { await requireAdmin(); } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const supabase = await createAdminClient();
  const { data, error } = await supabase
    .from('referral_codes')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  try { await requireAdmin(); } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const supabase = await createAdminClient();
  const body = await req.json() as {
    name?: string;
    code: string;
    discount_type: 'percent' | 'fixed';
    discount_value: number;
    max_uses?: number | null;
    is_active?: boolean;
    expired_at?: string | null;
    allowed_tiers?: ('premium' | 'platinum')[] | null;
    override_duration_days?: number | null;
  };

  // Cek duplikat kode
  const { data: existing } = await supabase
    .from('referral_codes')
    .select('id')
    .eq('code', body.code.trim().toUpperCase())
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: 'Kode sudah digunakan, pilih kode lain.' }, { status: 409 });
  }

  if (body.override_duration_days != null && (!Number.isFinite(body.override_duration_days) || body.override_duration_days <= 0)) {
    return NextResponse.json({ error: 'Durasi akses khusus harus lebih dari 0 hari' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('referral_codes')
    .insert({
      name:           body.name?.trim() || null,
      code:           body.code.trim().toUpperCase(),
      discount_type:  body.discount_type,
      discount_value: body.discount_value,
      max_uses:       body.max_uses ?? null,
      is_active:      body.is_active ?? true,
      expired_at:     body.expired_at ?? null,
      allowed_tiers:  body.allowed_tiers?.length ? body.allowed_tiers : null,
      override_duration_days: body.override_duration_days ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}