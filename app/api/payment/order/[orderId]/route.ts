// app/api/payment/order/[orderId]/route.ts
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    const { orderId } = await params;
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = await createAdminClient();

    // Auto-expire jika sudah melewati expired_at
    await supabase
      .from('payment_orders')
      .update({ status: 'expired' })
      .eq('order_id', orderId)
      .eq('status', 'pending')
      .lt('expired_at', new Date().toISOString());

    const { data: order, error } = await supabase
      .from('payment_orders')
      .select('*')
      .eq('order_id', orderId)
      .eq('user_id', userId)
      .single();

    if (error || !order) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json({
      order: {
        orderId:        order.order_id,
        packageName:    order.package_name,
        basePrice:      order.base_price,
        adminFee:       order.admin_fee ?? 0,
        discountAmount: order.discount_amount ?? 0,
        referralCode:   order.referral_code ?? null,
        total:          order.total,
        finalPrice:     order.final_price ?? order.total,
        expiredAt:      order.expired_at,
        // createdAt digunakan client untuk hitung countdown yang akurat
        createdAt:      order.created_at,
        status:         order.status,
        paymentMethod:  order.payment_method,
        vaNumber:       order.va_number ?? null,
        qrisUrl:        order.qris_url ?? null,
        ewalletUrl:     order.ewallet_url ?? null,
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    const { orderId } = await params;
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = await createAdminClient();
    // Hanya boleh batalkan order yang masih pending — jangan timpa order
    // yang sudah settlement/expired.
    await supabase
      .from('payment_orders')
      .update({ status: 'cancel' })
      .eq('order_id', orderId)
      .eq('user_id', userId)
      .eq('status', 'pending');

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}