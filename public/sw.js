// public/sw.js
// Service worker tunggal PintuASN: cache (installability/offline) + Firebase Cloud Messaging.
// Satu SW di scope '/' agar tidak bentrok antar registrasi.

const CACHE_NAME = 'pintuasn-v1';
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/manifest.json',
];

// ── Firebase Cloud Messaging (background push) ─────────────────
// Dibungkus try/catch: kalau gstatic tak terjangkau saat install,
// caching + installability tetap berfungsi.
try {
  importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
  importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

  firebase.initializeApp({
    apiKey:            'AIzaSyADvFiOy54J2w-orq9LJ5a6IVS-AT3Mdh4',
    authDomain:        'pintuasn-3000.firebaseapp.com',
    projectId:         'pintuasn-3000',
    storageBucket:     'pintuasn-3000.firebasestorage.app',
    messagingSenderId: '168566684289',
    appId:             '1:168566684289:web:e66604e3e7fcb1fa8f6b80',
  });

  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    const title = payload.notification?.title ?? 'PintuASN';
    const body  = payload.notification?.body  ?? 'Ada pengingat belajar untukmu!';
    const link  = payload.fcmOptions?.link    ?? '/roadmap';

    self.registration.showNotification(title, {
      body,
      icon:  '/images/icon-192.png',
      badge: '/images/icon-192.png',
      data:  { url: link },
      requireInteraction: false,
    });
  });
} catch (e) {
  // Push tidak tersedia di SW ini — caching tetap jalan.
}

// Klik notifikasi — buka atau fokus tab
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? '/roadmap';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if ('focus' in client) return client.focus();
      }
      return clients.openWindow(url);
    }),
  );
});

// ── Caching ────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .catch(() => {}) // jangan gagalkan install kalau salah satu aset tak terjangkau
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
