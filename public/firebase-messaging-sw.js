// public/firebase-messaging-sw.js
// Service worker untuk Firebase Cloud Messaging (background notifications)

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

// Background messages (tab tertutup / tidak aktif)
messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title ?? 'PintuASN';
  const body  = payload.notification?.body  ?? 'Ada pengingat belajar untukmu!';
  const link  = payload.fcmOptions?.link    ?? '/roadmap';

  self.registration.showNotification(title, {
    body,
    icon:  '/images/Logo.svg',
    badge: '/images/Logo.svg',
    data:  { url: link },
    requireInteraction: false,
  });
});

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
