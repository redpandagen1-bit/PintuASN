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

// Hitung tanggal berakhir subscription berdasarkan package:
// premium  → 6 bulan dari sekarang
// platinum → 1 tahun dari sekarang
function getSubscriptionEnd(packageId: string): string {
  const end = new Date();
  if (packageId === 'premium') {
    end.setMonth(end.getMonth() + 6);
  } else {
    end.setFullYear(end.getFullYear() + 1);
  }
  return end.toISOString();
}

// Normalize order_id — strip suffix -methodId-timestamp kalau ada
// Format asli:        PINTUASN-PAIOXG-1775989365468
// Format dengan suffix: PINTUASN-PAIOXG-1775989365468-bri_va-1234567890
function normalizeOrderId(id: string): string {
  // Order ID format: PINTUASN-{userId.slice(-6).toUpperCase()}-{timestamp}
  // userId suffix bisa alfanumerik (mis. "5GVMR2"), bukan hanya huruf
  const match = id.match(/^(PINTUASN-[A-Z0-9]+-\d+)/);
  return match ? match[1] : id;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
    } = body;

    console.log(`[midtrans-webhook] Received: order_id=${order_id} status=${transaction_status} tx_status=${status_code}`);

    // ── Verifikasi signature Midtrans ──────────────────────────────────
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (!serverKey) {
      console.error('[midtrans-webhook] MIDTRANS_SERVER_KEY is not set');
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    // gross_amount dari Midtrans selalu string (mis. "99000.00").
    // Paksa ke string untuk mencegah mismatch kalau JSON parse hasilkan number.
    const grossAmountStr = String(gross_amount);
    const expectedSignature = crypto
      .createHash('sha512')
      .update(`${order_id}${status_code}${grossAmountStr}${serverKey}`)
      .digest('hex');

    if (signature_key !== expectedSignature) {
      console.error(`[midtrans-webhook] Signature mismatch for order_id=${order_id}. gross_amount="${grossAmountStr}" status_code="${status_code}"`);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
    }

    console.log(`[midtrans-webhook] Signature verified for order_id=${order_id}`);

    // ── Normalize order_id (handle suffix dari retry charge) ───────────
    const normalizedOrderId = normalizeOrderId(order_id);

    // ── Cek apakah pembayaran berhasil ─────────────────────────────────
    const isSuccess =
      transaction_status === 'settlement' ||
      (transaction_status === 'capture' && fraud_status === 'accept');

    const isExpiredOrCancelled =
      transaction_status === 'expire' ||
      transaction_status === 'cancel' ||
      transaction_status === 'deny';

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

    // Hindari proses ulang kalau sudah settlement
    if (order.status === 'settlement' || order.status === 'capture') {
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
        console.error('Failed to update order status:', orderUpdateError.code);
      }

      // ── Update tier user di profiles ─────────────────────────────────
      const newTier = PACKAGE_TIER[order.package_id];
      if (newTier) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            subscription_tier:  newTier,
            subscription_start: new Date().toISOString(),
            subscription_end:   getSubscriptionEnd(order.package_id),
            updated_at:         new Date().toISOString(),
          })
          .eq('user_id', order.user_id);

        if (profileError) {
          console.error('Failed to update profile tier:', profileError.code);
        }
      } else {
        console.error('Unknown package_id, skipping tier upgrade:', order.package_id);
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
        console.error('Failed to update order to cancelled/expired:', cancelError.code);
      }
    }
    // Status lain: pending, authorize, dll — tidak perlu action

    // Selalu return 200 ke Midtrans
    return NextResponse.json({ message: 'OK' });

  } catch (error) {
    console.error('Webhook error:', error);
    // Tetap return 200 agar Midtrans tidak retry
    return NextResponse.json({ message: 'acknowledged' });
  }
}