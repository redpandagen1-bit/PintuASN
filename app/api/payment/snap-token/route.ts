import { auth, currentUser } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { rateLimit } from '@/lib/rate-limit';

// Sanitasi nama agar aman di sisi Midtrans (hanya huruf/angka/spasi)
function sanitizeName(input: string, fallback = 'PintuASN User'): string {
  const cleaned = (input || '').replace(/[^A-Za-z0-9 ]+/g, ' ').trim().slice(0, 40);
  return cleaned || fallback;
}

// Format waktu yang diwajibkan Midtrans untuk `expiry.start_time`:
// "yyyy-MM-dd HH:mm:ss Z" (mis. "2026-09-10 22:32:12 +0000").
function formatMidtransTime(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const offsetMin = -d.getTimezoneOffset();
  const sign = offsetMin >= 0 ? '+' : '-';
  const offH = pad(Math.floor(Math.abs(offsetMin) / 60));
  const offM = pad(Math.abs(offsetMin) % 60);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} ${sign}${offH}${offM}`;
}

/**
 * Membuat Snap transaction token untuk dibayar via popup (window.snap.pay).
 *
 * Berbeda dengan Core API (/select-method) yang mem-charge metode spesifik,
 * Snap menampilkan semua metode aktif di popup-nya sendiri. Harga dikunci di
 * sini berdasarkan order di DB (sudah termasuk logika upgrade 29.000 & diskon
 * referral). Mode Snap = tanpa biaya admin per-metode (Opsi A).
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Rate limit: 10 pembuatan token per user per 10 menit
    const rl = await rateLimit(`payment-snap-token:${userId}`, 10, 10 * 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Terlalu banyak permintaan. Coba lagi nanti.' },
        { status: 429 }
      );
    }

    const { orderId } = await req.json();
    if (!orderId || typeof orderId !== 'string') {
      return NextResponse.json({ error: 'Order ID tidak valid' }, { status: 400 });
    }

    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;
    if (!serverKey || !clientKey) {
      console.error('MIDTRANS_SERVER_KEY / NEXT_PUBLIC_MIDTRANS_CLIENT_KEY belum di-set');
      return NextResponse.json(
        { error: 'Konfigurasi pembayaran belum lengkap. Hubungi admin.' },
        { status: 500 }
      );
    }

    const supabase = await createAdminClient();

    // Ambil order milik user ini
    const { data: order, error: fetchError } = await supabase
      .from('payment_orders')
      .select('*')
      .eq('order_id', orderId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !order) {
      return NextResponse.json({ error: 'Order tidak ditemukan' }, { status: 404 });
    }
    if (order.status !== 'pending') {
      return NextResponse.json({ error: 'Order ini sudah tidak dapat dibayar.' }, { status: 400 });
    }

    // Harga final = setelah diskon referral (disimpan oleh /referral/apply).
    // Mode Snap tidak menambah biaya admin per-metode.
    const grossAmount = Math.round(order.final_price ?? order.base_price);
    if (!grossAmount || grossAmount < 1) {
      return NextResponse.json({ error: 'Nominal pembayaran tidak valid.' }, { status: 400 });
    }

    const isSandbox = process.env.MIDTRANS_IS_SANDBOX === 'true';
    const apiBase = isSandbox
      ? 'https://app.sandbox.midtrans.com'
      : 'https://app.midtrans.com';
    const snapUrl = `${apiBase}/snap/snap.js`;

    // Lanjutkan billing sebelumnya: kalau order masih punya Snap token yang valid
    // (nominal sama & belum kedaluwarsa), pakai ulang token itu supaya user
    // melanjutkan ke VA/QR yang SAMA — bukan membuat billing/VA baru.
    const notExpired = order.expired_at ? new Date(order.expired_at) > new Date() : true;
    if (order.snap_token && order.total === grossAmount && notExpired) {
      return NextResponse.json({
        token: order.snap_token,
        redirectUrl: order.snap_redirect_url ?? null,
        clientKey,
        snapUrl,
      });
    }

    // Customer details (Midtrans butuh minimal email untuk beberapa metode)
    const clerkUser = await currentUser();
    const email =
      clerkUser?.emailAddresses?.[0]?.emailAddress ||
      `${userId}@users.pintuasn.com`;
    const firstName = sanitizeName(clerkUser?.firstName || clerkUser?.fullName || 'PintuASN User');
    const lastName  = sanitizeName(clerkUser?.lastName || '', '');
    const phone     = clerkUser?.phoneNumbers?.[0]?.phoneNumber;

    const customerDetails: Record<string, string> = { first_name: firstName, email };
    if (lastName) customerDetails.last_name = lastName;
    if (phone)    customerDetails.phone     = phone;

    // order_id Midtrans harus unik tiap attempt. Suffix akan di-strip oleh
    // normalizeOrderId di webhook sehingga tetap memetakan ke order DB.
    const midtransOrderId = `${orderId}-${Date.now().toString(36)}`;
    const encodedKey = Buffer.from(`${serverKey}:`).toString('base64');

    // Samakan masa berlaku popup Snap dengan countdown yang kita tampilkan
    // sendiri (order.expired_at) — supaya dua-duanya tidak beda waktu.
    const startTime = formatMidtransTime(new Date());
    const durationMinutes = Math.max(
      5,
      Math.round((new Date(order.expired_at).getTime() - Date.now()) / 60000)
    );

    const snapBody = {
      transaction_details: {
        order_id: midtransOrderId,
        gross_amount: grossAmount,
      },
      item_details: [
        {
          id: order.package_id ?? 'package',
          price: grossAmount,
          quantity: 1,
          name: String(order.package_name ?? 'Paket PintuASN').slice(0, 50),
        },
      ],
      customer_details: customerDetails,
      expiry: {
        start_time: startTime,
        unit: 'minutes',
        duration: durationMinutes,
      },
      callbacks: {
        finish: `${process.env.NEXT_PUBLIC_APP_URL}/beli-paket?tab=riwayat`,
      },
    };

    const response = await fetch(`${apiBase}/snap/v1/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Basic ${encodedKey}`,
      },
      body: JSON.stringify(snapBody),
    });

    const data = await response.json();

    if (!response.ok || !data.token) {
      console.error('Snap token error:', response.status, data.error_messages || data.status_message);
      const msg =
        (Array.isArray(data.error_messages) && data.error_messages.join('; ')) ||
        data.status_message ||
        'Gagal memulai pembayaran. Silakan coba lagi.';
      return NextResponse.json({ error: `Pembayaran gagal: ${msg}` }, { status: 400 });
    }

    // Tandai metode = snap & simpan referensi order Midtrans.
    // midtrans_transaction_id diisi `midtransOrderId` (bukan UUID transaksi,
    // karena Snap belum tentu langsung punya itu sebelum user bayar) — dipakai
    // /api/payment/status/[orderId] untuk query GET /v2/{id}/status ke Midtrans.
    await supabase
      .from('payment_orders')
      .update({
        payment_method: 'snap',
        total: grossAmount,
        admin_fee: 0,
        snap_token: data.token,
        snap_redirect_url: data.redirect_url ?? null,
        midtrans_transaction_id: midtransOrderId,
        updated_at: new Date().toISOString(),
      })
      .eq('order_id', orderId)
      .eq('user_id', userId);

    return NextResponse.json({
      token: data.token,
      redirectUrl: data.redirect_url ?? null,
      clientKey,
      snapUrl,
    });
  } catch (error) {
    console.error('Snap token error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
