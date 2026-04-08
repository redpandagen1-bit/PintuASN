// app/api/payment/history/route.ts
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const PAYMENT_METHOD_NAMES: Record<string, string> = {
  bri_va:     'BRI Virtual Account',
  bca_va:     'BCA Virtual Account',
  mandiri_va: 'Mandiri Virtual Account',
  qris:       'QRIS',
  gopay:      'GoPay',
  dana:       'DANA',
  shopeepay:  'ShopeePay',
  other_bank: 'SeaBank & Bank Lain',
};

// Bank key dari payment_method ID
const METHOD_TO_BANK: Record<string, string> = {
  bri_va:     'bri',
  bca_va:     'bca',
  mandiri_va: 'mandiri',
  other_bank: 'permata',
};

// e-wallet key
const METHOD_TO_EWALLET: Record<string, string> = {
  gopay:     'gopay',
  dana:      'dana',
  shopeepay: 'shopeepay',
};

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = await createClient();

    // Auto-expire orders yang sudah melewati expired_at tapi masih 'pending'
    await supabase
      .from('payment_orders')
      .update({ status: 'expired' })
      .eq('user_id', userId)
      .eq('status', 'pending')
      .lt('expired_at', new Date().toISOString());

    const { data: orders, error } = await supabase
      .from('payment_orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const mapped = (orders ?? []).map((o: any) => {
      const methodId: string = o.payment_method ?? '';
      const methodName = PAYMENT_METHOD_NAMES[methodId] ?? o.payment_method_name ?? methodId ?? '-';
      const bankKey    = METHOD_TO_BANK[methodId] ?? null;
      const ewalletKey = METHOD_TO_EWALLET[methodId] ?? null;

      // Normalize status
      const rawStatus = (o.status as string ?? 'pending').toLowerCase();
      let status: string;
      if (rawStatus === 'settlement' || rawStatus === 'capture' || rawStatus === 'success') {
        status = 'SETTLEMENT';
      } else if (rawStatus === 'pending') {
        // Cek apakah sudah expire berdasarkan expired_at (double-check client side)
        const isExpired = o.expired_at && new Date(o.expired_at) < new Date();
        status = isExpired ? 'EXPIRED' : 'PENDING';
      } else if (rawStatus === 'expired' || rawStatus === 'expire') {
        status = 'EXPIRED';
      } else if (rawStatus === 'cancel' || rawStatus === 'cancelled') {
        status = 'CANCEL';
      } else if (rawStatus === 'failed' || rawStatus === 'failure' || rawStatus === 'deny') {
        status = 'FAILED';
      } else {
        status = rawStatus.toUpperCase();
      }

      return {
        id:           o.id,
        orderId:      o.order_id,
        name:         o.package_name,
        method:       methodName,
        methodId:     methodId,
        bankKey:      bankKey,
        ewalletKey:   ewalletKey,
        methodDetail: o.va_number ?? null,
        createdAt:    o.created_at,
        expiredAt:    o.expired_at,
        date: new Date(o.created_at).toLocaleString('id-ID', {
          day: 'numeric', month: 'short', year: 'numeric',
          hour: '2-digit', minute: '2-digit',
        }),
        status,
        total: o.total ?? o.final_price ?? 0,
      };
    });

    return NextResponse.json({ orders: mapped });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}