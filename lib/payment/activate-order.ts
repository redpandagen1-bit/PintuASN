// lib/payment/activate-order.ts
// Aktivasi order yang sudah dibayar — dipakai bersama oleh webhook Midtrans
// dan endpoint polling status, supaya tier user pasti naik walau salah satu
// jalur gagal. Idempotent & atomic: tier hanya dinaikkan tepat sekali per order.

import type { SupabaseClient } from '@supabase/supabase-js';

const PACKAGE_TIER: Record<string, 'premium' | 'platinum'> = {
  premium:  'premium',
  platinum: 'platinum',
};

// Masa aktif: premium → 6 bulan dari tanggal beli, platinum → 1 tahun.
export function getSubscriptionEnd(packageId: string): string {
  const end = new Date();
  if (packageId === 'premium') {
    end.setMonth(end.getMonth() + 6);
  } else {
    end.setFullYear(end.getFullYear() + 1);
  }
  return end.toISOString();
}

/**
 * Tandai order sebagai settlement DAN naikkan tier user, atomic + idempotent.
 *
 * Kondisi `.neq()` memastikan update status hanya berjalan jika order belum
 * pernah final. Kalau dua pemanggilan datang bersamaan (mis. webhook + polling),
 * hanya satu yang mendapat baris kembali — yang lain otomatis no-op.
 *
 * @returns true jika order BARU diaktifkan oleh pemanggilan ini.
 */
export async function activatePaidOrder(
  supabase: SupabaseClient,
  orderId: string,
): Promise<boolean> {
  const { data: claimed } = await supabase
    .from('payment_orders')
    .update({ status: 'settlement', updated_at: new Date().toISOString() })
    .eq('order_id', orderId)
    .neq('status', 'settlement')
    .neq('status', 'capture')
    .neq('status', 'expire')
    .neq('status', 'cancel')
    .neq('status', 'deny')
    .select('user_id, package_id, referral_code')
    .maybeSingle();

  if (!claimed) return false; // sudah diproses / tidak ada → aman, no-op

  // ── Naikkan tier user ────────────────────────────────────────────────
  const newTier = PACKAGE_TIER[claimed.package_id];
  if (newTier) {
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        subscription_tier:  newTier,
        subscription_start: new Date().toISOString(),
        subscription_end:   getSubscriptionEnd(claimed.package_id),
        updated_at:         new Date().toISOString(),
      })
      .eq('user_id', claimed.user_id);
    if (profileError) {
      console.error('[activate-order] Gagal update tier:', profileError.code);
    }
  } else {
    console.error('[activate-order] package_id tidak dikenal:', claimed.package_id);
  }

  // ── Increment used_count referral (aman karena guard atomic di atas) ──
  if (claimed.referral_code) {
    const { data: ref } = await supabase
      .from('referral_codes')
      .select('used_count')
      .eq('code', claimed.referral_code)
      .single();
    if (ref) {
      const { error: refError } = await supabase
        .from('referral_codes')
        .update({ used_count: ref.used_count + 1 })
        .eq('code', claimed.referral_code);
      if (refError) {
        console.error('[activate-order] Gagal increment referral:', refError.code);
      }
    }
  }

  return true;
}
