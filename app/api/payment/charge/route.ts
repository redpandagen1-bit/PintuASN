import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { rateLimit } from '@/lib/rate-limit';

const PACKAGE_PRICES: Record<string, { name: string; price: number }> = {
  premium:  { name: 'PintuASN Premium - Hingga November 2026',  price: 149000 },
  platinum: { name: 'PintuASN Platinum - Hingga November 2026', price: 249000 },
};

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Rate limit: 5 order baru per user per 10 menit
    const rl = rateLimit(`payment-charge:${userId}`, 5, 10 * 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Terlalu banyak permintaan. Coba lagi nanti.' },
        { status: 429 }
      );
    }

    const { package_id } = await req.json();
    const pkg = PACKAGE_PRICES[package_id];
    if (!pkg) return NextResponse.json({ error: 'Paket tidak ditemukan' }, { status: 400 });

    const orderId = `PINTUASN-${userId.slice(-6).toUpperCase()}-${Date.now()}`;
    const expiredAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 jam

    // Simpan order ke Supabase
    const supabase = await createClient();
    const { error: dbError } = await supabase.from('payment_orders').insert({
      order_id: orderId,
      user_id: userId,
      package_id,
      package_name: pkg.name,
      base_price: pkg.price,
      admin_fee: 0,
      total: pkg.price,
      final_price: pkg.price,
      status: 'pending',
      expired_at: expiredAt,
    });

    if (dbError) {
      console.error('DB error:', dbError);
      return NextResponse.json({ error: 'Gagal menyimpan order' }, { status: 500 });
    }

    return NextResponse.json({ orderId, redirectUrl: `/pembayaran/${orderId}` });

  } catch (error) {
    console.error('Charge error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}