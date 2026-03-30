import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Pakai service role key agar bisa update tanpa RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PACKAGE_TIER: Record<string, 'premium' | 'platinum'> = {
  premium:  'premium',
  platinum: 'platinum',
};

// Tanggal berakhir subscription → November 2026
function getSubscriptionEnd(): string {
  return new Date('2026-11-30T23:59:59.000Z').toISOString();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Midtrans webhook received:', body);

    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
    } = body;

    // ── Verifikasi signature Midtrans ──────────────────────────────────
    const serverKey = process.env.MIDTRANS_SERVER_KEY!;
    const expectedSignature = crypto
      .createHash('sha512')
      .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
      .digest('hex');

    if (signature_key !== expectedSignature) {
      console.error('Invalid Midtrans signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
    }

    // ── Cek apakah pembayaran berhasil ─────────────────────────────────
    const isSuccess =
      transaction_status === 'settlement' ||
      transaction_status === 'capture' && fraud_status === 'accept';

    const isExpiredOrCancelled =
      transaction_status === 'expire' ||
      transaction_status === 'cancel' ||
      transaction_status === 'deny';

    // ── Ambil data order dari Supabase ─────────────────────────────────
    const { data: order, error: orderError } = await supabase
      .from('payment_orders')
      .select('*')
      .eq('order_id', order_id)
      .single();

    if (orderError || !order) {
      console.error('Order not found:', order_id);
      // Return 200 ke Midtrans agar tidak retry terus
      return NextResponse.json({ message: 'Order not found, acknowledged' });
    }

    if (isSuccess) {
      // ── Update status order ──────────────────────────────────────────
      await supabase
        .from('payment_orders')
        .update({
          status: 'settlement',
          updated_at: new Date().toISOString(),
        })
        .eq('order_id', order_id);

      // ── Update tier user di profiles ─────────────────────────────────
      const newTier = PACKAGE_TIER[order.package_id];
      if (newTier) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            subscription_tier: newTier,
            subscription_start: new Date().toISOString(),
            subscription_end: getSubscriptionEnd(),
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', order.user_id);

        if (profileError) {
          console.error('Failed to update profile tier:', profileError);
        } else {
          console.log(`✅ User ${order.user_id} upgraded to ${newTier}`);
        }
      }
    } else if (isExpiredOrCancelled) {
      // Update status order saja
      await supabase
        .from('payment_orders')
        .update({ status: transaction_status })
        .eq('order_id', order_id);
    }

    // Selalu return 200 ke Midtrans
    return NextResponse.json({ message: 'OK' });

  } catch (error) {
    console.error('Webhook error:', error);
    // Tetap return 200 agar Midtrans tidak retry
    return NextResponse.json({ message: 'acknowledged' });
  }
}