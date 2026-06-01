// CarManut Service Worker — Offline Cache Strategy
const CACHE_NAME = 'carmanut-v1';
const DYNAMIC_CACHE = 'carmanut-dynamic-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/css/styles.css',
  '/src/app.js',
  '/src/auth.js',
  '/src/db.js',
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
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap'
];

// Install: cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS.filter(url => !url.startsWith('http')));
    }).then(() => self.skipWaiting())
  );
});

// Activate: clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME && k !== DYNAMIC_CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: Cache First for static, Network First for API
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip Chrome extensions and Firebase requests (must be live)
  if (url.protocol === 'chrome-extension:' || url.hostname.includes('firebase') || url.hostname.includes('google')) {
    return;
  }

  // Static assets — Cache First
  if (STATIC_ASSETS.some(a => request.url.endsWith(a) || a === '/')) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(c => c.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // Dynamic — Network First, fallback cache
  event.respondWith(
    fetch(request).then(response => {
      if (response.ok) {
        const clone = response.clone();
        caches.open(DYNAMIC_CACHE).then(c => c.put(request, clone));
      }
      return response;
    }).catch(() => caches.match(request))
  );
});
