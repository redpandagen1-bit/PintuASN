import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin }              from '@/lib/auth/check-admin';
import { createAdminClient }         from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createAdminClient();
  const { data, error } = await supabase
    .from('referral_codes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  await requireAdmin();
  const supabase = await createAdminClient();
  const body = await req.json() as {
    name?: string;
    code: string;
    discount_type: 'percent' | 'fixed';
    discount_value: number;
    max_uses?: number | null;
    is_active?: boolean;
    expired_at?: string | null;
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
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}