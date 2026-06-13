// app/api/payment/status/[orderId]/route.ts
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { activatePaidOrder } from '@/lib/payment/activate-order';

export async function GET(req: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    const { orderId } = await params;
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = await createAdminClient();

    // Cek expired_at di DB dulu sebelum hit Midtrans
    const { data: localOrder } = await supabase
      .from('payment_orders')
      .select('expired_at, status, midtrans_transaction_id')
      .eq('order_id', orderId)
      .eq('user_id', userId)
      .single();

    // Jika sudah expired berdasarkan waktu, langsung update tanpa hit Midtrans
    if (localOrder && localOrder.expired_at && new Date(localOrder.expired_at) < new Date()) {
      if (localOrder.status === 'pending') {
        await supabase
          .from('payment_orders')
          .update({ status: 'expired' })
          .eq('order_id', orderId);
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

    // Pakai midtrans_transaction_id (UUID dari Midtrans) kalau tersedia,
    // karena kita charge Midtrans dengan order_id yang punya suffix
    // (PINTUASN-XXX-timestamp-methodId-ts), bukan base orderId.
    // Midtrans menerima keduanya untuk endpoint /status, tapi UUID lebih reliable.
    const midtransId = localOrder?.midtrans_transaction_id ?? orderId;
    const response = await fetch(`${baseUrl}/v2/${midtransId}/status`, {
      headers: { Authorization: `Basic ${encodedKey}` },
    });

    const data = await response.json();
    const txStatus = data.transaction_status as string;

    // Sync status ke DB
    if (txStatus === 'settlement' || txStatus === 'capture') {
      // Jaring pengaman: kalau webhook gagal/tidak sampai, polling sekalian
      // mengaktifkan order (naikkan tier user). Atomic & idempotent.
      await activatePaidOrder(supabase, orderId);
    } else if (txStatus === 'expire' || txStatus === 'cancel' || txStatus === 'deny') {
      await supabase
        .from('payment_orders')
        .update({ status: txStatus === 'expire' ? 'expired' : txStatus })
        .eq('order_id', orderId);
    }

    return NextResponse.json({ status: txStatus });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}