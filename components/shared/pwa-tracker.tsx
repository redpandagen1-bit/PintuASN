'use client';

import { useEffect } from 'react';

/**
 * Mencatat perangkat yang membuka aplikasi dalam mode terpasang (standalone).
 * - Hanya berjalan saat standalone (user yang sudah memasang PWA) → nol overhead
 *   untuk pengunjung browser biasa.
 * - Dedup sekali per hari per perangkat via localStorage → tulis DB sangat minim.
 * - Fire-and-forget, tidak memblokir UI.
 */
export function PwaTracker() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window.navigator as any).standalone === true;
    if (!isStandalone) return;

    const today = new Date().toISOString().slice(0, 10);
    if (localStorage.getItem('pwa_tracked') === today) return;

    let deviceId = localStorage.getItem('pwa_device_id');
    if (!deviceId) {
      deviceId =
        (crypto?.randomUUID?.() as string | undefined) ??
        `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem('pwa_device_id', deviceId);
    }

    const ua = navigator.userAgent;
    const platform = /iphone|ipad|ipod/i.test(ua)
      ? 'ios'
      : /android/i.test(ua)
      ? 'android'
      : 'desktop';

    fetch('/api/pwa/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId, platform }),
      keepalive: true,
    })
      .then(() => localStorage.setItem('pwa_tracked', today))
      .catch(() => {});
  }, []);

  return null;
}
