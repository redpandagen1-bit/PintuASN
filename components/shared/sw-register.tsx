'use client';

import { useEffect } from 'react';

/**
 * Mendaftarkan service worker tunggal (/sw.js) — HANYA di production.
 *
 * Di development SW dimatikan & SW lama di-unregister + cache dibersihkan,
 * karena SW yang meng-cache artefak build bikin file basi tiap recompile
 * (gejala: hydration mismatch & "Server Action not found").
 *
 * Wajib di production agar Chrome memunculkan prompt install
 * (beforeinstallprompt) dan untuk cache offline.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    if (process.env.NODE_ENV !== 'production') {
      // Bersihkan SW & cache yang nyangkut dari sesi sebelumnya di dev.
      navigator.serviceWorker.getRegistrations?.()
        .then((regs) => regs.forEach((r) => r.unregister()))
        .catch(() => {});
      if ('caches' in window) {
        caches.keys().then((keys) => keys.forEach((k) => caches.delete(k))).catch(() => {});
      }
      return;
    }

    const register = () => {
      navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {});
    };
    if (document.readyState === 'complete') register();
    else window.addEventListener('load', register, { once: true });
  }, []);

  return null;
}
