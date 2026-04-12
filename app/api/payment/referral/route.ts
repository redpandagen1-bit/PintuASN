// app/api/payment/referral/route.ts
// Hanya VALIDASI kode referral — tidak mengubah database
// Gunakan endpoint /referral/apply untuk menyimpan ke order

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { code, basePrice } = await req.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Kode tidak boleh kosong' }, { status: 400 });
    }

    if (!basePrice || typeof basePrice !== 'number' || basePrice <= 0) {
      return NextResponse.json({ error: 'Base price tidak valid' }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: referral, error } = await supabase
      .from('referral_codes')
      .select('*')
      .eq('code', code.toUpperCase().trim())
      .eq('is_active', true)
      .single();

    if (error || !referral) {
      return NextResponse.json({ error: 'Kode referral tidak valid' }, { status: 404 });
    }

    // Cek expired
    if (referral.expired_at && new Date(referral.expired_at) < new Date()) {
      return NextResponse.json({ error: 'Kode referral sudah kadaluarsa' }, { status: 400 });
    }

    // Cek max uses
    if (referral.max_uses !== null && referral.used_count >= referral.max_uses) {
      return NextResponse.json({ error: 'Kode referral sudah mencapai batas penggunaan' }, { status: 400 });
    }

    // Hitung diskon
    const discountAmount =
      referral.discount_type === 'percent'
        ? Math.round((basePrice * referral.discount_value) / 100)
        : referral.discount_value;

    const finalPrice = Math.max(basePrice - discountAmount, 0);

    return NextResponse.json({
      valid: true,
      code: referral.code,
      discountAmount,
      finalPrice,
      discountType: referral.discount_type,
      discountValue: referral.discount_value,
    });
  } catch (e) {
    console.error('[referral/validate]', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}