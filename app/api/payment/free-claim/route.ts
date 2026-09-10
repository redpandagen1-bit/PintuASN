// ============================================================
// app/api/payment/free-claim/route.ts
// Klaim order yang harganya sudah Rp0 (diskon referral 100%) TANPA lewat
// Midtrans — gateway pembayaran menolak transaksi nominal 0, jadi order
// gratis diaktifkan langsung di sini lalu ditandai settlement.
// ============================================================

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { activatePaidOrder } from '@/lib/payment/activate-order';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const rl = await rateLimit(`payment-free-claim:${userId}`, 10, 10 * 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Terlalu banyak permintaan. Coba lagi nanti.' }, { status: 429 });
    }

    const { orderId } = await req.json();
    if (!orderId || typeof orderId !== 'string') {
      return NextResponse.json({ error: 'Order ID tidak valid' }, { status: 400 });
    }

    const supabase = await createAdminClient();

    const { data: order, error } = await supabase
      .from('payment_orders')
      .select('*')
      .eq('order_id', orderId)
      .eq('user_id', userId)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: 'Order tidak ditemukan' }, { status: 404 });
    }
    if (order.status !== 'pending') {
      return NextResponse.json({ error: 'Order ini sudah tidak dapat diklaim.' }, { status: 400 });
    }

    const finalPrice = order.final_price ?? order.base_price;
    if (finalPrice !== 0) {
      return NextResponse.json({ error: 'Order ini tidak gratis — silakan lanjutkan ke pembayaran.' }, { status: 400 });
    }

    await supabase
      .from('payment_orders')
      .update({ total: 0, admin_fee: 0, payment_method: 'free', updated_at: new Date().toISOString() })
      .eq('order_id', orderId)
      .eq('user_id', userId);

    await activatePaidOrder(supabase, orderId);

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('[payment/free-claim]', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
