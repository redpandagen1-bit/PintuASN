import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

// Harga paket (dalam Rupiah)
const PACKAGE_PRICES: Record<string, { name: string; price: number }> = {
  premium: { name: 'PintuASN Premium - Hingga November 2026', price: 149000 },
  platinum: { name: 'PintuASN Platinum - Hingga November 2026', price: 249000 },
};

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { package_id } = await req.json();

    const pkg = PACKAGE_PRICES[package_id];
    if (!pkg) {
      return NextResponse.json({ error: 'Paket tidak ditemukan' }, { status: 400 });
    }

    const orderId = `PINTUASN-${userId.slice(-6)}-${Date.now()}`;

    const midtransPayload = {
      transaction_details: {
        order_id: orderId,
        gross_amount: pkg.price,
      },
      item_details: [
        {
          id: package_id,
          price: pkg.price,
          quantity: 1,
          name: pkg.name,
        },
      ],
      customer_details: {
        user_id: userId,
      },
      enabled_payments: [
        'credit_card',
        'bca_va',
        'bni_va',
        'bri_va',
        'mandiri_va',
        'gopay',
        'shopeepay',
        'qris',
      ],
      expiry: {
        duration: 24,
        unit: 'hours',
      },
    };

    const serverKey = process.env.MIDTRANS_SERVER_KEY!;
    const encodedKey = Buffer.from(`${serverKey}:`).toString('base64');

    const response = await fetch('https://app.sandbox.midtrans.com/snap/v1/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${encodedKey}`,
      },
      body: JSON.stringify(midtransPayload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Midtrans error:', data);
      return NextResponse.json({ error: 'Gagal membuat transaksi' }, { status: 500 });
    }

    return NextResponse.json({ snap_token: data.token, redirect_url: data.redirect_url });

  } catch (error) {
    console.error('Payment charge error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}