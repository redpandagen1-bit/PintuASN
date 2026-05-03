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
    // Baca raw body sebagai teks dulu agar gross_amount tidak kehilangan
    // format desimal saat JSON.parse mengonversi "99000.00" → number 99000.
    const rawBody = await req.text();
    let body: Record<string, unknown>;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const {
      order_id,
      status_code,
      signature_key,
      transaction_status,
      fraud_status,
    } = body as Record<string, string>;

    console.log(`[midtrans-webhook] Received: order_id=${order_id} status=${transaction_status} tx_status=${status_code}`);

    // ── Verifikasi signature Midtrans ──────────────────────────────────
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (!serverKey) {
      console.error('[midtrans-webhook] MIDTRANS_SERVER_KEY is not set');
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    // Ekstrak gross_amount langsung dari raw JSON teks untuk menjaga format
    // desimal persis seperti yang Midtrans kirim (mis. "99000.00").
    // JSON.parse bisa mengonversi "99000.00" → number 99000, menyebabkan
    // signature mismatch karena String(99000) = "99000" bukan "99000.00".
    const rawGrossMatch = rawBody.match(/"gross_amount"\s*:\s*"([^"]+)"/);
    const grossAmountStr = rawGrossMatch
      ? rawGrossMatch[1]
      : String(body.gross_amount);

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

    if (isSuccess) {
      // ── Atomic idempotency guard ──────────────────────────────────────
      // Gabungkan "cek sudah diproses" + "update status" jadi SATU operasi
      // database. Kondisi .neq() memastikan update HANYA berjalan jika status
      // masih belum settlement/capture. Kalau dua webhook datang bersamaan,
      // hanya satu yang mendapat baris kembali — yang lain skip otomatis.
      const { data: claimed } = await supabase
        .from('payment_orders')
        .update({
          status:     'settlement',
          updated_at: new Date().toISOString(),
        })
        .eq('order_id', normalizedOrderId)
        .neq('status', 'settlement')
        .neq('status', 'capture')
        .neq('status', 'expire')
        .neq('status', 'cancel')
        .neq('status', 'deny')
        .select('user_id, package_id, referral_code')
        .maybeSingle();

      if (!claimed) {
        // Order tidak ditemukan ATAU sudah diproses sebelumnya — keduanya aman
        console.log(`[midtrans-webhook] Already processed or not found: ${normalizedOrderId}`);
        return NextResponse.json({ message: 'Already processed' });
      }

      console.log(`[midtrans-webhook] Settlement claimed for order: ${normalizedOrderId}`);

      // ── Update tier user di profiles ─────────────────────────────────
      const newTier = PACKAGE_TIER[claimed.package_id];
      if (newTier) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            subscription_tier:  newTier,
            subscription_start: new Date().toISOString(),
            subscription_end:   getSubscriptionEnd(claimed.package_id),
            updated_at:         new Date().toISOString(),
          })
          .eq('user_id', claimed.user_id);

        if (profileError) {
          console.error('Failed to update profile tier:', profileError.code);
        }
      } else {
        console.error('Unknown package_id, skipping tier upgrade:', claimed.package_id);
      }

      // ── Increment referral used_count jika order pakai kode referral ──
      // Aman non-atomic karena idempotency guard di atas memastikan blok ini
      // hanya dijalankan tepat satu kali per order.
      if (claimed.referral_code) {
        const { data: ref } = await supabase
          .from('referral_codes')
          .select('used_count')
          .eq('code', claimed.referral_code)
          .single();

        if (ref) {
          const { error: refError } = await supabase
            .from('referral_codes')
            .update({ used_count: ref.used_count + 1 })
            .eq('code', claimed.referral_code);

          if (refError) {
            console.error('Failed to increment referral used_count:', refError.code);
          } else {
            console.log(`[midtrans-webhook] Incremented used_count for referral: ${claimed.referral_code}`);
          }
        }
      }

    } else if (isExpiredOrCancelled) {
      // ── Ambil data order untuk cancel/expire ─────────────────────────
      const { data: order, error: orderError } = await supabase
        .from('payment_orders')
        .select('status')
        .eq('order_id', normalizedOrderId)
        .single();

      if (orderError || !order) {
        console.error('Order not found for cancel/expire:', normalizedOrderId);
        return NextResponse.json({ message: 'Order not found, acknowledged' });
      }

      // Jangan override order yang sudah settlement
      if (order.status === 'settlement' || order.status === 'capture') {
        return NextResponse.json({ message: 'Order already settled, skip cancel' });
      }

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
    } else {
      // Status lain (pending, authorize, dll) — tidak ada action
      console.log(`[midtrans-webhook] No action for status: ${transaction_status}`);
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