import { auth, currentUser } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { rateLimit } from '@/lib/rate-limit';

// Sanitasi first_name agar aman di sisi Midtrans (hanya huruf/angka/spasi)
function sanitizeName(input: string, fallback = 'PintuASN User'): string {
  const cleaned = (input || '').replace(/[^A-Za-z0-9 ]+/g, ' ').trim().slice(0, 40);
  return cleaned || fallback;
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Rate limit: 10 pemilihan metode per user per 10 menit
    const rl = rateLimit(`payment-select-method:${userId}`, 10, 10 * 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Terlalu banyak permintaan. Coba lagi nanti.' },
        { status: 429 }
      );
    }

    const { orderId, methodId, bank } = await req.json();

    const supabase = await createClient();

    // Ambil order dari Supabase
    const { data: order, error: fetchError } = await supabase
      .from('payment_orders')
      .select('*')
      .eq('order_id', orderId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !order) {
      return NextResponse.json({ error: 'Order tidak ditemukan' }, { status: 404 });
    }

    // Kalau sudah punya VA number sebelumnya dengan metode sama, return langsung
    if (order.va_number && order.payment_method === methodId) {
      return NextResponse.json({
        vaNumber: order.va_number,
        total: order.total,
      });
    }

    const adminFee = ['bri_va', 'bca_va', 'mandiri_va', 'other_bank'].includes(methodId) ? 4000 : 0;

    // final_price sudah mengandung diskon referral (disimpan oleh /referral/apply)
    const baseAfterDiscount = order.final_price ?? order.base_price;
    const total = baseAfterDiscount + adminFee;

    // Midtrans menolak `order_id` yang sudah pernah di-charge. Selalu pakai
    // suffix unik supaya tiap attempt memilih metode menghasilkan order_id
    // Midtrans yang baru. Original orderId tetap disimpan di kolom order_id
    // Supabase sebagai referensi internal; kolom midtrans_transaction_id
    // menyimpan transaction_id hasil charge.
    const midtransOrderId = `${orderId}-${methodId}-${Date.now().toString(36)}`;

    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (!serverKey) {
      console.error('MIDTRANS_SERVER_KEY is not set');
      return NextResponse.json(
        { error: 'Konfigurasi pembayaran belum lengkap. Hubungi admin.' },
        { status: 500 }
      );
    }
    const encodedKey = Buffer.from(`${serverKey}:`).toString('base64');

    const isSandbox = process.env.MIDTRANS_IS_SANDBOX === 'true';
    const baseUrl = isSandbox
      ? 'https://api.sandbox.midtrans.com'
      : 'https://api.midtrans.com';

    // Ambil email & nama dari Clerk — Midtrans production butuh customer_details
    // yang valid (minimal email) untuk beberapa metode
    const clerkUser = await currentUser();
    const email =
      clerkUser?.emailAddresses?.[0]?.emailAddress ||
      `${userId}@users.pintuasn.com`;
    const firstNameRaw = clerkUser?.firstName || clerkUser?.fullName || 'PintuASN User';
    const lastName = sanitizeName(clerkUser?.lastName || '', '');
    const firstName = sanitizeName(firstNameRaw);
    const phone = clerkUser?.phoneNumbers?.[0]?.phoneNumber;

    // Build payload berdasarkan metode
    const customerDetails: Record<string, string> = {
      first_name: firstName,
      email,
    };
    if (lastName) customerDetails.last_name = lastName;
    if (phone)    customerDetails.phone     = phone;

    let midtransBody: Record<string, unknown> = {
      transaction_details: {
        order_id: midtransOrderId,
        gross_amount: total,
      },
      customer_details: customerDetails,
    };

    if (methodId === 'qris') {
      midtransBody = {
        ...midtransBody,
        payment_type: 'qris',
        qris: { acquirer: 'gopay' },
      };
    } else if (methodId === 'gopay') {
      midtransBody = {
        ...midtransBody,
        payment_type: 'gopay',
        gopay: { enable_callback: true },
      };
    } else if (methodId === 'shopeepay') {
      midtransBody = {
        ...midtransBody,
        payment_type: 'shopeepay',
        shopeepay: {
          callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/pembayaran/${orderId}`,
        },
      };
    } else if (methodId === 'dana') {
      midtransBody = {
        ...midtransBody,
        payment_type: 'gopay',
        gopay: { enable_callback: true },
      };
    } else if (methodId === 'alfamart' || methodId === 'indomaret') {
      // Convenience Store
      midtransBody = {
        ...midtransBody,
        payment_type: 'cstore',
        cstore: {
          store:   methodId,
          message: 'PintuASN',
        },
      };
    } else {
      // Virtual Account
      const bankMap: Record<string, string> = {
        bri_va:     'bri',
        bca_va:     'bca',
        mandiri_va: 'mandiri',
        bni_va:     'bni',
        other_bank: 'permata',
      };
      const bankCode = bankMap[methodId] || bank || 'bri';
      midtransBody = {
        ...midtransBody,
        payment_type: 'bank_transfer',
        bank_transfer: { bank: bankCode },
      };
    }

    const response = await fetch(`${baseUrl}/v2/charge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${encodedKey}`,
      },
      body: JSON.stringify(midtransBody),
    });

    const data = await response.json();

    // Handle error dari Midtrans
    if (!response.ok || (data.status_code && !['200', '201'].includes(data.status_code))) {
      console.error(
        'Midtrans charge error:',
        data.status_code,
        data.status_message,
        Array.isArray(data.validation_messages) ? data.validation_messages : undefined
      );
      // Forward status_message Midtrans (string aman, bukan stack) agar user
      // tahu penyebab konkret (mis. "Order ID has already been taken",
      // "transaction_details.gross_amount is less than minimum amount")
      const midtransMsg =
        (Array.isArray(data.validation_messages) && data.validation_messages.join('; ')) ||
        data.status_message ||
        'Gagal memproses pembayaran. Silakan coba lagi.';
      return NextResponse.json(
        {
          error: `Pembayaran gagal: ${midtransMsg}`,
          code: data.status_code ?? null,
        },
        { status: 400 }
      );
    }

    // Ekstrak VA / QRIS / eWallet URL
    let vaNumber:    string | undefined;
    let qrisUrl:     string | undefined;
    let ewalletUrl:  string | undefined;
    let paymentCode: string | undefined;

    if (data.payment_type === 'bank_transfer') {
      vaNumber =
        data.va_numbers?.[0]?.va_number ||
        data.permata_va_number ||
        data.bill_key;
    } else if (data.payment_type === 'qris') {
      qrisUrl = data.actions?.find(
        (a: { name: string; url: string }) => a.name === 'generate-qr-code'
      )?.url;
    } else if (['gopay', 'shopeepay'].includes(data.payment_type)) {
      ewalletUrl =
        data.actions?.find((a: { name: string; url: string }) => a.name === 'deeplink-redirect')?.url ||
        data.actions?.find((a: { name: string; url: string }) => a.name === 'get-status')?.url;
    } else if (data.payment_type === 'cstore') {
      paymentCode = data.payment_code;
    }

    // Update order di Supabase dengan total final (setelah admin fee)
    const { error: updateError } = await supabase
      .from('payment_orders')
      .update({
        payment_method:          methodId,
        admin_fee:               adminFee,
        total,
        va_number:               vaNumber ?? null,
        payment_code:            paymentCode ?? null,
        midtrans_transaction_id: data.transaction_id,
      })
      .eq('order_id', orderId);

    if (updateError) {
      console.error('Supabase update error:', updateError.code);
    }

    return NextResponse.json({
      vaNumber,
      qrisUrl,
      ewalletUrl,
      paymentCode,
      total,
    });
  } catch (error) {
    console.error('Select method error:', error instanceof Error ? error.message : 'unknown');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
