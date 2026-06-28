// app/api/webhooks/midtrans/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { activatePaidOrder } from '@/lib/payment/activate-order';

// Pakai service role key agar bisa update tanpa RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Normalize order_id — strip suffix -methodId-timestamp kalau ada
// Format asli:        PINTUASN-PAIOXG-1775989365468
// Format dengan suffix: PINTUASN-PAIOXG-1775989365468-bri_va-1234567890
function normalizeOrderId(id: string): string {
  // Order ID format: PINTUASN-{userId.slice(-6).toUpperCase()}-{timestamp}
  // userId suffix bisa alfanumerik (mis. "5GVMR2"), bukan hanya huruf
  const match = id.match(/^(PINTUASN-[A-Z0-9]+-\d+)/);
  return match ? match[1] : id;
}

type PaymentDetail = { methodId: string | null; vaNumber: string | null; paymentCode: string | null };

// Terjemahkan payload notifikasi Midtrans → metode (sesuai ID di app) + nomor VA
// / kode bayar, supaya riwayat menampilkan metode asli (bukan "snap").
function extractPaymentDetail(body: Record<string, unknown>): PaymentDetail {
  const paymentType = typeof body.payment_type === 'string' ? body.payment_type : '';
  const vaArr = Array.isArray(body.va_numbers)
    ? (body.va_numbers as Array<{ bank?: string; va_number?: string }>)
    : [];
  const firstVa = vaArr[0];
  const str = (v: unknown) => (typeof v === 'string' && v ? v : null);

  const BANK_TO_METHOD: Record<string, string> = {
    bri: 'bri_va', bca: 'bca_va', bni: 'bni_va', mandiri: 'mandiri_va',
    permata: 'other_bank', cimb: 'other_bank',
  };

  let methodId: string | null = null;
  let vaNumber: string | null = null;
  let paymentCode: string | null = null;

  switch (paymentType) {
    case 'bank_transfer':
      methodId = BANK_TO_METHOD[(firstVa?.bank ?? '').toLowerCase()] ?? 'bri_va';
      vaNumber = str(firstVa?.va_number) ?? str(body.permata_va_number);
      break;
    case 'permata':
      methodId = 'other_bank';
      vaNumber = str(body.permata_va_number) ?? str(firstVa?.va_number);
      break;
    case 'echannel': // Mandiri bill payment
      methodId = 'mandiri_va';
      vaNumber = str(body.bill_key);
      break;
    case 'qris':       methodId = 'qris';       break;
    case 'gopay':      methodId = 'gopay';      break;
    case 'shopeepay':  methodId = 'shopeepay';  break;
    case 'cstore':
      methodId = str(body.store) ?? 'indomaret';
      paymentCode = str(body.payment_code);
      break;
    default:
      methodId = paymentType || null;
  }

  return { methodId, vaNumber, paymentCode };
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

    // ── Tangkap metode asli + VA/kode bayar (untuk ditampilkan di riwayat) ──
    // Dilakukan untuk semua status (termasuk pending) supaya begitu user memilih
    // metode di popup Snap, riwayat langsung menampilkan metode & nomor VA-nya.
    const detail = extractPaymentDetail(body);
    if (detail.methodId || detail.vaNumber || detail.paymentCode) {
      const patch: Record<string, string> = { updated_at: new Date().toISOString() };
      if (detail.methodId)    patch.payment_method = detail.methodId;
      if (detail.vaNumber)    patch.va_number      = detail.vaNumber;
      if (detail.paymentCode) patch.payment_code   = detail.paymentCode;
      const { error: detailErr } = await supabase
        .from('payment_orders')
        .update(patch)
        .eq('order_id', normalizedOrderId);
      if (detailErr) console.error('[midtrans-webhook] Gagal simpan detail metode:', detailErr.code);
    }

    // ── Cek apakah pembayaran berhasil ─────────────────────────────────
    const isSuccess =
      transaction_status === 'settlement' ||
      (transaction_status === 'capture' && fraud_status === 'accept');

    const isExpiredOrCancelled =
      transaction_status === 'expire' ||
      transaction_status === 'cancel' ||
      transaction_status === 'deny';

    if (isSuccess) {
      // Aktivasi atomic + idempotent (klaim status + naikkan tier + referral).
      // Logika dipakai bersama dengan endpoint polling status.
      const activated = await activatePaidOrder(supabase, normalizedOrderId);
      if (!activated) {
        console.log(`[midtrans-webhook] Already processed or not found: ${normalizedOrderId}`);
        return NextResponse.json({ message: 'Already processed' });
      }
      console.log(`[midtrans-webhook] Settlement activated for order: ${normalizedOrderId}`);

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