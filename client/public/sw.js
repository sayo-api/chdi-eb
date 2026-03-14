/* ─────────────────────────────────────────────────────────────────────────────
   C.H.D.I · 1º RCG — Service Worker
   Handles background push notifications for Web Push API
───────────────────────────────────────────────────────────────────────────── */

const CACHE_NAME = 'chdi-v1';

// Install — skip waiting immediately
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

/* ── Push event ──────────────────────────────────────────────────────────── */
self.addEventListener('push', event => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: 'C.H.D.I · 1º RCG', body: event.data?.text() || '' };
  }

  const title   = data.title  || 'C.H.D.I · 1º RCG';
  const options = {
    body:             data.body   || '',
    icon:             data.icon   || '/favicon.svg',
    badge:            '/favicon.svg',
    tag:              data.tag    || 'chdi-push',
    renotify:         true,
    requireInteraction: false,
    vibrate:          [200, 100, 200],
    data:             { url: (data.data && data.data.url) || '/escala' },
    actions: [
      { action: 'view', title: '👁 Ver' },
      { action: 'close', title: '✕ Fechar' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

/* ── Notification click ──────────────────────────────────────────────────── */
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'close') return;

  const url = (event.notification.data && event.notification.data.url) || '/escala';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      // Focus existing window if open
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      // Otherwise open new window
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});

/* ── Push subscription change ────────────────────────────────────────────── */
self.addEventListener('pushsubscriptionchange', event => {
  event.waitUntil(
    // Notify the page so it can re-subscribe
    clients.matchAll({ type: 'window' }).then(windowClients => {
      windowClients.forEach(client => client.postMessage({ type: 'PUSH_SUBSCRIPTION_CHANGED' }));
    })
  );
});
