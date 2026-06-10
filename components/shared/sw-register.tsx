'use client';

import { useEffect } from 'react';

/**
 * Mendaftarkan service worker tunggal (/sw.js) saat app dibuka.
 * Wajib agar Chrome memunculkan prompt install (beforeinstallprompt)
 * dan untuk cache offline. Aman dipanggil berulang — browser dedup.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
    const register = () => {
      navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {});
    };
    if (document.readyState === 'complete') register();
    else window.addEventListener('load', register, { once: true });
  }, []);

  return null;
}
