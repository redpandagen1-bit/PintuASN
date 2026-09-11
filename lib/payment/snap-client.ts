// lib/payment/snap-client.ts
// Helper client-side untuk memuat & membuka popup Midtrans Snap — dipakai
// bersama oleh halaman /pembayaran/[orderId] dan popup detail di Riwayat
// (beli-paket) supaya tidak duplikasi logika.

export const IS_SNAP_MODE = process.env.NEXT_PUBLIC_PAYMENT_MODE === 'snap';

declare global {
  interface Window {
    snap?: { pay: (token: string, options: Record<string, () => void>) => void };
  }
}

export function ensureSnapLoaded(snapUrl: string, clientKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('No window'));
    if (window.snap) return resolve();
    const existing = document.getElementById('midtrans-snap') as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Gagal memuat Snap')));
      return;
    }
    const s = document.createElement('script');
    s.id = 'midtrans-snap';
    s.src = snapUrl;
    s.setAttribute('data-client-key', clientKey);
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Gagal memuat Snap'));
    document.body.appendChild(s);
  });
}

interface SnapCallbacks {
  onSuccess?: () => void;
  onPending?: () => void;
  onError?: () => void;
  onClose?: () => void;
}

/**
 * Ambil Snap token untuk `orderId` lalu buka popup pembayaran Midtrans.
 * Melempar Error kalau gagal ambil token/memuat Snap — tangkap di pemanggil.
 */
export async function openSnapForOrder(orderId: string, callbacks: SnapCallbacks) {
  const res = await fetch('/api/payment/snap-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Gagal memproses pembayaran');

  await ensureSnapLoaded(data.snapUrl, data.clientKey);
  if (!window.snap) throw new Error('Snap belum siap. Coba lagi.');

  window.snap.pay(data.token, {
    onSuccess: () => callbacks.onSuccess?.(),
    onPending: () => callbacks.onPending?.(),
    onError:   () => callbacks.onError?.(),
    onClose:   () => callbacks.onClose?.(),
  });
}
