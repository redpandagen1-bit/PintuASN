// lib/firebase/subscribe.ts
'use client';

import { getToken, deleteToken } from 'firebase/messaging';
import { getFirebaseMessaging } from './client';

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY!;

/**
 * Minta izin notifikasi → dapatkan FCM token → kirim ke /api/push/register.
 * Returns token, atau null jika tidak didukung / ditolak.
 */
export async function subscribeToPush(): Promise<string | null> {
  if (typeof window === 'undefined' || !('Notification' in window)) return null;

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return null;

  try {
    const messaging = await getFirebaseMessaging();
    if (!messaging) return null;

    // Daftarkan service worker tunggal (cache + FCM), lalu tunggu aktif
    await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    const registration = await navigator.serviceWorker.ready;

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (token) {
      await fetch('/api/push/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, platform: 'web' }),
      });
    }

    return token ?? null;
  } catch (err) {
    console.error('[Push] subscribeToPush error:', err);
    return null;
  }
}

/**
 * Hapus FCM token dari Firebase + dari Supabase.
 */
export async function unsubscribeFromPush(): Promise<void> {
  try {
    const messaging = await getFirebaseMessaging();
    if (messaging) await deleteToken(messaging);
  } catch {
    // ignore — token may already be gone
  }

  try {
    await fetch('/api/push/unregister', { method: 'POST' });
  } catch (err) {
    console.error('[Push] unsubscribeFromPush error:', err);
  }
}
