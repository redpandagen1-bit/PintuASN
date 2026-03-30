// app/api/payment/order/[orderId]/route.ts
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest, { params }: { params: { orderId: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = await createClient();
    const { data: order, error } = await supabase
      .from('payment_orders')
      .select('*')
      .eq('order_id', params.orderId)
      .eq('user_id', userId)
      .single();

    if (error || !order) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json({
      order: {
        orderId: order.order_id,
        packageName: order.package_name,
        basePrice: order.base_price,
        adminFee: order.admin_fee,
        total: order.total,
        expiredAt: order.expired_at,
        status: order.status,
        paymentMethod: order.payment_method,
        vaNumber: order.va_number,
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}