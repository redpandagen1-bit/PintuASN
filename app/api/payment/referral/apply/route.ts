// app/api/payment/referral/apply/route.ts
// APPLY kode referral ke order — validasi + simpan diskon ke database
// Dipanggil saat user klik tombol "Gunakan" / "Apply" kode referral

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { code, orderId } = await req.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Kode tidak boleh kosong' }, { status: 400 });
    }

    if (!orderId || typeof orderId !== 'string') {
      return NextResponse.json({ error: 'Order ID tidak valid' }, { status: 400 });
    }

    const supabase = await createClient();

    // 1. Ambil order — pastikan milik user ini dan masih pending
    const { data: order, error: orderError } = await supabase
      .from('payment_orders')
      .select('*')
      .eq('order_id', orderId)
      .eq('user_id', userId)
      .eq('status', 'pending')
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order tidak ditemukan atau sudah tidak aktif' }, { status: 404 });
    }

    // 2. Validasi kode referral
    const { data: referral, error: referralError } = await supabase
      .from('referral_codes')
      .select('*')
      .eq('code', code.toUpperCase().trim())
      .eq('is_active', true)
      .single();

    if (referralError || !referral) {
      return NextResponse.json({ error: 'Kode referral tidak valid' }, { status: 404 });
    }

    if (referral.expired_at && new Date(referral.expired_at) < new Date()) {
      return NextResponse.json({ error: 'Kode referral sudah kadaluarsa' }, { status: 400 });
    }

    if (referral.max_uses !== null && referral.used_count >= referral.max_uses) {
      return NextResponse.json({ error: 'Kode referral sudah mencapai batas penggunaan' }, { status: 400 });
    }

    // 3. Hitung diskon berdasarkan base_price (bukan final_price — hindari double diskon)
    const basePrice = order.base_price;
    const discountAmount =
      referral.discount_type === 'percent'
        ? Math.round((basePrice * referral.discount_value) / 100)
        : referral.discount_value;

    const finalPrice = Math.max(basePrice - discountAmount, 0);

    // 4. Simpan ke database — update order dengan info diskon
    const { error: updateError } = await supabase
      .from('payment_orders')
      .update({
        referral_code:  referral.code,
        discount_amount: discountAmount,
        discount_type:  referral.discount_type,
        discount_value: referral.discount_value,
        final_price:    finalPrice,
        // total akan dihitung ulang saat select-method (final_price + admin_fee)
      })
      .eq('order_id', orderId)
      .eq('user_id', userId);

    if (updateError) {
      console.error('[referral/apply] Supabase update error:', updateError);
      return NextResponse.json({ error: 'Gagal menyimpan referral ke order' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      code: referral.code,
      discountAmount,
      finalPrice,
      discountType: referral.discount_type,
      discountValue: referral.discount_value,
    });
  } catch (e) {
    console.error('[referral/apply]', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Endpoint untuk menghapus referral dari order
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID tidak valid' }, { status: 400 });
    }

    const supabase = await createClient();

    // Ambil order untuk mendapatkan base_price
    const { data: order, error: orderError } = await supabase
      .from('payment_orders')
      .select('base_price')
      .eq('order_id', orderId)
      .eq('user_id', userId)
      .eq('status', 'pending')
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order tidak ditemukan' }, { status: 404 });
    }

    // Reset diskon — kembalikan final_price ke base_price
    const { error: updateError } = await supabase
      .from('payment_orders')
      .update({
        referral_code:   null,
        discount_amount: 0,
        discount_type:   null,
        discount_value:  null,
        final_price:     order.base_price,
      })
      .eq('order_id', orderId)
      .eq('user_id', userId);

    if (updateError) {
      console.error('[referral/apply] DELETE error:', updateError);
      return NextResponse.json({ error: 'Gagal menghapus referral' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('[referral/apply] DELETE', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}