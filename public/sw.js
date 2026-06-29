// public/sw.js
// Service worker tunggal PintuASN: cache aset statis + Firebase Cloud Messaging.
// Satu SW di scope '/' agar tidak bentrok antar registrasi.

const CACHE_NAME = 'pintuasn-v4';
// Hanya aset statis & ringan yang di-precache. HTML/API TIDAK di-cache.
const STATIC_ASSETS = [
  '/manifest.json',
  '/images/icon-p-light.svg',
  '/images/icon-192.png',
];

// Halaman fallback saat navigasi gagal (offline). Tidak menyimpan HTML asli.
const OFFLINE_HTML = `<!doctype html><html lang="id"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Offline — PintuASN</title>
<style>html,body{height:100%;margin:0}body{display:flex;align-items:center;justify-content:center;
font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#0f172a;color:#e2e8f0;text-align:center;padding:24px}
.card{max-width:340px}h1{font-size:20px;margin:16px 0 8px;color:#fff}p{font-size:14px;color:#94a3b8;line-height:1.6;margin:0 0 20px}
button{background:#facc15;color:#1e293b;border:none;font-weight:800;font-size:14px;padding:12px 22px;border-radius:12px;cursor:pointer}
.dot{width:56px;height:56px;border-radius:16px;background:#1e293b;display:inline-flex;align-items:center;justify-content:center;
color:#0ea5e9;font-weight:900;font-size:26px;border:1px solid #334155}</style></head>
<body><div class="card"><div class="dot">P</div>
<h1>Kamu sedang offline</h1>
<p>Koneksi internet terputus. Sambungkan kembali lalu coba lagi untuk membuka PintuASN.</p>
<button onclick="location.reload()">Coba lagi</button></div></body></html>`;

function offlineResponse() {
  return new Response(OFFLINE_HTML, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

// ── Firebase Cloud Messaging (background push) ─────────────────
// Dibungkus try/catch: kalau gstatic tak terjangkau saat install,
// caching tetap berfungsi.
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

// ── Lifecycle ──────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .catch(() => {}) // jangan gagalkan install kalau salah satu aset tak terjangkau
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Hapus semua cache versi lama (termasuk pintuasn-v1 yang tak terbatas).
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── Fetch strategy ─────────────────────────────────────────────
// - Aset statis immutable  → cache-first (sumber utama win performa)
// - Navigasi/HTML          → network-only, fallback halaman offline
// - /api & lainnya         → network-only, TIDAK di-cache (anti-stale & privasi)
const STATIC_RE = /\.(?:js|css|woff2?|ttf|otf|png|jpg|jpeg|gif|svg|webp|ico)$/i;

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // lewati cross-origin (Supabase, gstatic, dst.)

  // Jangan sentuh route API — selalu jaringan, tidak di-cache.
  if (url.pathname.startsWith('/api/')) return;

  // Banner: network-first — konten promosi yang sering ganti.
  // Selalu ambil versi terbaru saat online; cache hanya cadangan offline.
  if (url.pathname.startsWith('/images/banners/')) {
    event.respondWith(
      fetch(request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      }).catch(() => caches.match(request))
    );
    return;
  }

  const isStatic =
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/images/') ||
    url.pathname.startsWith('/fonts/') ||
    STATIC_RE.test(url.pathname);

  // Aset statis: cache-first
  if (isStatic) {
    event.respondWith(
      caches.match(request).then((cached) =>
        cached ||
        fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        }).catch(() => cached)
      )
    );
    return;
  }

  // Navigasi halaman (HTML): network-only + fallback offline
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => offlineResponse()));
    return;
  }

  // Sisanya: biarkan default (langsung ke jaringan, tanpa cache)
});
