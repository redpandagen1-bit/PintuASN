// app/api/payment/status/[orderId]/route.ts
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest, { params }: { params: { orderId: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = await createClient();

    // Cek expired_at di DB dulu sebelum hit Midtrans
    const { data: localOrder } = await supabase
      .from('payment_orders')
      .select('expired_at, status')
      .eq('order_id', params.orderId)
      .eq('user_id', userId)
      .single();

    // Jika sudah expired berdasarkan waktu, langsung update tanpa hit Midtrans
    if (localOrder && localOrder.expired_at && new Date(localOrder.expired_at) < new Date()) {
      if (localOrder.status === 'pending') {
        await supabase
          .from('payment_orders')
          .update({ status: 'expired' })
          .eq('order_id', params.orderId);
      }
      return NextResponse.json({ status: 'expire' });
    }

    // Jika sudah settlement di DB, kembalikan langsung
    if (localOrder?.status === 'settlement' || localOrder?.status === 'capture') {
      return NextResponse.json({ status: 'settlement' });
    }

    // Hit Midtrans untuk status terbaru
    const serverKey    = process.env.MIDTRANS_SERVER_KEY!;
    const encodedKey   = Buffer.from(`${serverKey}:`).toString('base64');
    const isSandbox    = process.env.MIDTRANS_IS_SANDBOX === 'true';
    const baseUrl      = isSandbox
      ? 'https://api.sandbox.midtrans.com'
      : 'https://api.midtrans.com';

    const response = await fetch(`${baseUrl}/v2/${params.orderId}/status`, {
      headers: { Authorization: `Basic ${encodedKey}` },
    });

    const data = await response.json();
    const txStatus = data.transaction_status as string;

    // Sync status ke DB
    if (txStatus === 'settlement' || txStatus === 'capture') {
      await supabase
        .from('payment_orders')
        .update({ status: 'settlement' })
        .eq('order_id', params.orderId);
    } else if (txStatus === 'expire' || txStatus === 'cancel' || txStatus === 'deny') {
      await supabase
        .from('payment_orders')
        .update({ status: txStatus === 'expire' ? 'expired' : txStatus })
        .eq('order_id', params.orderId);
    }

    return NextResponse.json({ status: txStatus });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}