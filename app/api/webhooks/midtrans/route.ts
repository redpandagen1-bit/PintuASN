// app/api/webhooks/midtrans/route.ts

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

// Normalize order_id — strip suffix -methodId-timestamp kalau ada
// Format asli:        PINTUASN-PAIOXG-1775989365468
// Format dengan suffix: PINTUASN-PAIOXG-1775989365468-bri_va-1234567890
function normalizeOrderId(id: string): string {
  const match = id.match(/^(PINTUASN-[A-Z]+-\d+)/);
  return match ? match[1] : id;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Midtrans webhook received:', JSON.stringify(body));

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
      console.error('Invalid Midtrans signature. Expected:', expectedSignature, 'Got:', signature_key);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
    }

    // ── Normalize order_id (handle suffix dari retry charge) ───────────
    const normalizedOrderId = normalizeOrderId(order_id);
    console.log('Raw order_id:', order_id, '→ Normalized:', normalizedOrderId);

    // ── Cek apakah pembayaran berhasil ─────────────────────────────────
    const isSuccess =
      transaction_status === 'settlement' ||
      (transaction_status === 'capture' && fraud_status === 'accept');

    const isExpiredOrCancelled =
      transaction_status === 'expire' ||
      transaction_status === 'cancel' ||
      transaction_status === 'deny';

    console.log('Transaction status:', transaction_status, '| isSuccess:', isSuccess);

    // ── Ambil data order dari Supabase ─────────────────────────────────
    const { data: order, error: orderError } = await supabase
      .from('payment_orders')
      .select('*')
      .eq('order_id', normalizedOrderId)
      .single();

    if (orderError || !order) {
      console.error('Order not found for id:', normalizedOrderId, '| error:', orderError);
      // Return 200 ke Midtrans agar tidak retry terus
      return NextResponse.json({ message: 'Order not found, acknowledged' });
    }

    console.log('Order found:', order.order_id, '| current status:', order.status);

    // Hindari proses ulang kalau sudah settlement
    if (order.status === 'settlement' || order.status === 'capture') {
      console.log('Order already settled, skipping.');
      return NextResponse.json({ message: 'Already settled' });
    }

    if (isSuccess) {
      // ── Update status order ──────────────────────────────────────────
      const { error: orderUpdateError } = await supabase
        .from('payment_orders')
        .update({
          status:     'settlement',
          updated_at: new Date().toISOString(),
        })
        .eq('order_id', normalizedOrderId);

      if (orderUpdateError) {
        console.error('Failed to update order status:', orderUpdateError);
      } else {
        console.log('✅ Order status updated to settlement:', normalizedOrderId);
      }

      // ── Update tier user di profiles ─────────────────────────────────
      const newTier = PACKAGE_TIER[order.package_id];
      if (newTier) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            subscription_tier:  newTier,
            subscription_start: new Date().toISOString(),
            subscription_end:   getSubscriptionEnd(),
            updated_at:         new Date().toISOString(),
          })
          .eq('user_id', order.user_id);

        if (profileError) {
          console.error('Failed to update profile tier:', profileError);
        } else {
          console.log(`✅ User ${order.user_id} upgraded to ${newTier}`);
        }
      } else {
        console.warn('Unknown package_id, skipping tier upgrade:', order.package_id);
      }

    } else if (isExpiredOrCancelled) {
      const { error: cancelError } = await supabase
        .from('payment_orders')
        .update({
          status:     transaction_status,
          updated_at: new Date().toISOString(),
        })
        .eq('order_id', normalizedOrderId);

      if (cancelError) {
        console.error('Failed to update order to cancelled/expired:', cancelError);
      } else {
        console.log(`Order ${normalizedOrderId} marked as ${transaction_status}`);
      }
    } else {
      // Status lain: pending, authorize, dll — tidak perlu action
      console.log('Unhandled transaction_status:', transaction_status, '— no action taken');
    }

    // Selalu return 200 ke Midtrans
    return NextResponse.json({ message: 'OK' });

  } catch (error) {
    console.error('Webhook error:', error);
    // Tetap return 200 agar Midtrans tidak retry
    return NextResponse.json({ message: 'acknowledged' });
  }
}