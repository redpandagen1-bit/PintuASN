import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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

    // Kalau sudah punya VA number sebelumnya, return langsung tanpa hit Midtrans lagi
    if (order.va_number && order.payment_method === methodId) {
      return NextResponse.json({
        vaNumber: order.va_number,
        total: order.total,
      });
    }

    const adminFee = ['bri_va', 'bca_va', 'mandiri_va', 'other_bank'].includes(methodId) ? 4000 : 0;
    const total = order.base_price + adminFee;

    // Kalau order_id sudah pernah di-charge Midtrans dengan metode berbeda,
    // buat order_id baru dengan suffix metode agar tidak konflik
    const midtransOrderId = order.midtrans_transaction_id
      ? `${orderId}-${methodId}-${Date.now()}`
      : orderId;

    const serverKey = process.env.MIDTRANS_SERVER_KEY!;
    const encodedKey = Buffer.from(`${serverKey}:`).toString('base64');

    // Build payload berdasarkan metode
    let midtransBody: Record<string, unknown> = {
      transaction_details: {
        order_id: midtransOrderId,
        gross_amount: total,
      },
      customer_details: {
        first_name: userId,
      },
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
    } else {
      // Virtual Account
      const bankMap: Record<string, string> = {
        bri_va: 'bri',
        bca_va: 'bca',
        mandiri_va: 'mandiri',
        other_bank: 'permata',
      };
      const bankCode = bankMap[methodId] || bank || 'bri';
      midtransBody = {
        ...midtransBody,
        payment_type: 'bank_transfer',
        bank_transfer: { bank: bankCode },
      };
    }

    console.log('Sending to Midtrans:', JSON.stringify(midtransBody));

    const response = await fetch('https://api.sandbox.midtrans.com/v2/charge', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${encodedKey}`,
      },
      body: JSON.stringify(midtransBody),
    });

    const data = await response.json();
    console.log('Midtrans full response:', JSON.stringify(data));

    // Handle error dari Midtrans
    if (!response.ok || (data.status_code && !['200', '201'].includes(data.status_code))) {
      console.error('Midtrans error:', data);
      return NextResponse.json({
        error: `Midtrans error: ${data.status_message || data.error_messages?.join(', ') || 'Unknown error'}`,
        midtransResponse: data,
      }, { status: 400 });
    }

    // Ekstrak VA / QRIS / eWallet URL
    let vaNumber: string | undefined;
    let qrisUrl: string | undefined;
    let ewalletUrl: string | undefined;

    if (data.payment_type === 'bank_transfer') {
      // BRI, BCA, BNI pakai va_numbers array
      // Mandiri pakai bill_key + biller_code
      // Permata pakai permata_va_number
      vaNumber =
        data.va_numbers?.[0]?.va_number ||
        data.permata_va_number ||
        data.bill_key;

      console.log('VA extracted:', vaNumber, '| raw va_numbers:', data.va_numbers);
    } else if (data.payment_type === 'qris') {
      qrisUrl = data.actions?.find(
        (a: { name: string; url: string }) => a.name === 'generate-qr-code'
      )?.url;
    } else if (['gopay', 'shopeepay'].includes(data.payment_type)) {
      ewalletUrl =
        data.actions?.find((a: { name: string; url: string }) => a.name === 'deeplink-redirect')?.url ||
        data.actions?.find((a: { name: string; url: string }) => a.name === 'get-status')?.url;
    }

    // Update order di Supabase
    const { error: updateError } = await supabase
      .from('payment_orders')
      .update({
        payment_method: methodId,
        admin_fee: adminFee,
        total,
        va_number: vaNumber,
        midtrans_transaction_id: data.transaction_id,
      })
      .eq('order_id', orderId);

    if (updateError) {
      console.error('Supabase update error:', updateError);
    }

    return NextResponse.json({
      vaNumber,
      qrisUrl,
      ewalletUrl,
      total,
    });

  } catch (error) {
    console.error('Select method error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}