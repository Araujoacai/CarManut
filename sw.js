// CarManut Service Worker — Offline Cache + Push Notifications
const CACHE_NAME   = 'carmanut-v2';
const DYNAMIC_CACHE = 'carmanut-dynamic-v2';
const KEY_CACHE    = 'cm_maintenance_cache'; // sync com notifications.js

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/css/styles.css',
  '/src/app.js',
  '/src/auth.js',
  '/src/db.js',
  '/src/notifications.js',
  '/src/maintenance-data.js',
  '/src/pages/login.js',
  '/src/pages/home.js',
  '/src/pages/vehicle-form.js',
  '/src/pages/vehicle-detail.js',
  '/src/pages/add-service.js',
  '/src/pages/reminders.js',
  '/src/pages/settings.js',
  '/src/components/navbar.js',
  '/src/components/toast.js',
  '/src/components/quick-register-modal.js',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// ── Install ──────────────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS.filter(u => !u.startsWith('http'))))
      .then(() => self.skipWaiting())
  );
});

// ── Activate ─────────────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME && k !== DYNAMIC_CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// ── Fetch: Cache First para estáticos, Network First para o resto ──
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Pular extensões e Firebase (devem ser live)
  if (url.protocol === 'chrome-extension:' ||
      url.hostname.includes('firebase') ||
      url.hostname.includes('google') ||
      url.hostname.includes('gstatic')) {
    return;
  }

  // Estáticos → Cache First
  if (STATIC_ASSETS.some(a => url.pathname === a || url.pathname === '/')) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(res => {
          if (res.ok) caches.open(CACHE_NAME).then(c => c.put(request, res.clone()));
          return res;
        });
      })
    );
    return;
  }

  // Dinâmicos → Network First
  event.respondWith(
    fetch(request)
      .then(res => {
        if (res.ok) caches.open(DYNAMIC_CACHE).then(c => c.put(request, res.clone()));
        return res;
      })
      .catch(() => caches.match(request))
  );
});

// ── Push (FCM / Web Push) ────────────────────────────────────
self.addEventListener('push', event => {
  let data = { title: 'CarManut', body: 'Verifique a manutenção do seu veículo.' };
  try { data = event.data?.json() || data; } catch {}

  event.waitUntil(
    self.registration.showNotification(data.title || 'CarManut', {
      body:    data.body  || 'Você tem itens de manutenção pendentes.',
      icon:    '/icons/icon-192.png',
      badge:   '/icons/icon-72.png',
      tag:     data.tag   || 'carmanut-push',
      data:    data.data  || { url: '/' },
      actions: [
        { action: 'open',    title: '🚗 Ver Lembretes' },
        { action: 'dismiss', title: 'Ignorar' },
      ],
      requireInteraction: false,
    })
  );
});

// ── Periodic Background Sync ─────────────────────────────────
self.addEventListener('periodicsync', event => {
  if (event.tag !== 'check-maintenance') return;

  event.waitUntil(
    (async () => {
      // Lê cache gerado pelo app (notifications.js → localStorage)
      // Como o SW não acessa localStorage diretamente, usamos os clients
      const clients = await self.clients.matchAll({ type: 'window' });

      // Se o app estiver aberto, ele mesmo gerencia as notificações
      if (clients.some(c => c.visibilityState === 'visible')) return;

      // App fechado — usa dados do cache armazenado via postMessage
      const cache = await getCachedMaintenanceData();

      if (!cache || cache.alertCount === 0) return;

      const { overdue, warning, items } = cache;

      let title, body;
      if (overdue > 0) {
        const names = items.filter(i => i.status === 'overdue').slice(0, 2).map(i => `${i.emoji} ${i.itemName}`);
        title = `🔴 CarManut — ${overdue} item${overdue !== 1 ? 's' : ''} vencido${overdue !== 1 ? 's' : ''}`;
        body  = names.join(' · ') + (overdue > 2 ? ` e mais ${overdue - 2}...` : '');
      } else if (warning > 0) {
        const names = items.filter(i => i.status === 'warning').slice(0, 2).map(i => `${i.emoji} ${i.itemName}`);
        title = `⚠️ CarManut — ${warning} revisão${warning !== 1 ? 'ões' : ''} próxima${warning !== 1 ? 's' : ''}`;
        body  = names.join(' · ');
      } else {
        return;
      }

      await self.registration.showNotification(title, {
        body,
        icon:    '/icons/icon-192.png',
        badge:   '/icons/icon-72.png',
        tag:     'carmanut-periodic',
        data:    { url: '/'},
        actions: [{ action: 'open', title: '🚗 Abrir CarManut' }],
      });
    })()
  );
});

// ── Notification Click ───────────────────────────────────────
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clients => {
        // Se o app já estiver aberto, foca
        const existing = clients.find(c => c.url.includes(self.location.origin));
        if (existing) {
          existing.focus();
          existing.postMessage({ type: 'NAVIGATE', url });
          return;
        }
        // Senão, abre
        return self.clients.openWindow(url);
      })
  );
});

// ── Helpers ──────────────────────────────────────────────────

// Lê o cache de manutenção via Cache API (salvo pelo app)
async function getCachedMaintenanceData() {
  try {
    const cache    = await caches.open('carmanut-notif-cache');
    const response = await cache.match('/notif-data.json');
    if (!response) return null;
    return await response.json();
  } catch {
    return null;
  }
}
