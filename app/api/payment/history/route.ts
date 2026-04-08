// app/api/payment/history/route.ts
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = await createClient();
    const { data: orders, error } = await supabase
      .from('payment_orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const mapped = (orders ?? []).map((o: any) => ({
      id:           o.id,
      orderId:      o.order_id,
      name:         o.package_name,
      method:       o.payment_method_name ?? o.payment_method ?? '-',
      methodDetail: o.va_number ?? o.qris_url ?? o.ewallet_url ?? null,
      date:         new Date(o.created_at).toLocaleString('id-ID', {
                      day: 'numeric', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    }),
      status: (o.status as string).toUpperCase(),
    }));

    return NextResponse.json({ orders: mapped });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}