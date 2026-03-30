// app/api/payment/status/[orderId]/route.ts
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest, { params }: { params: { orderId: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const serverKey = process.env.MIDTRANS_SERVER_KEY!;
    const encodedKey = Buffer.from(`${serverKey}:`).toString('base64');

    const response = await fetch(`https://api.sandbox.midtrans.com/v2/${params.orderId}/status`, {
      headers: { 'Authorization': `Basic ${encodedKey}` },
    });

    const data = await response.json();

    // Update status di Supabase kalau sudah settlement
    if (data.transaction_status === 'settlement' || data.transaction_status === 'capture') {
      const supabase = await createClient();
      await supabase.from('payment_orders')
        .update({ status: 'settlement' })
        .eq('order_id', params.orderId);
    }

    return NextResponse.json({ status: data.transaction_status });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}