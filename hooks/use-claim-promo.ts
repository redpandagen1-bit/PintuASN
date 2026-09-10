'use client';

// ============================================================
// hooks/use-claim-promo.ts
// CTA "payment": buat order untuk event.cta_package, auto-apply
// event.referral_code (best-effort), lalu redirect ke /pembayaran/[orderId].
// ============================================================

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Event } from '@/types/events';

export function useClaimPromo() {
  const router = useRouter();
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const claim = async (event: Event) => {
    if (!event.cta_package || claiming) return;
    setClaiming(true);
    setError(null);
    try {
      const chargeRes = await fetch('/api/payment/charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ package_id: event.cta_package }),
      });

      if (chargeRes.status === 401) {
        router.push('/sign-in');
        return;
      }

      const chargeData = await chargeRes.json();
      if (!chargeRes.ok) throw new Error(chargeData.error ?? 'Gagal membuat pesanan');

      if (event.referral_code) {
        // Best-effort — kalau kode tidak cocok/berlaku, user tetap bisa
        // masukkan kode lain secara manual di halaman pembayaran.
        await fetch('/api/payment/referral/apply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: event.referral_code, orderId: chargeData.orderId }),
        }).catch(() => {});
      }

      router.push(chargeData.redirectUrl ?? `/pembayaran/${chargeData.orderId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal memproses klaim promo');
      setClaiming(false);
    }
  };

  return { claim, claiming, error };
}
