const CACHE_NAME = 'degree-unlocker-v3.4.0';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/version.json',
  '/favicon.ico',
  '/icon.svg',
  '/icon-48.png',
  '/icon-72.png',
  '/icon-96.png',
  '/icon-128.png',
  '/icon-144.png',
  '/icon-152.png',
  '/icon-192.png',
  '/icon-384.png',
  '/icon-512.png',
  '/icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('[SW] Pre-cache warning:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Network-First with Stale-While-Revalidate & Cache Fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  if (request.method !== 'GET' || !request.url.startsWith('http')) {
    return;
  }

  // Handle API calls: try Network first, cache successful responses, fallback on offline
  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            if (cached) return cached;
            return new Response(JSON.stringify({ offline: true }), {
              status: 503,
              headers: { 'Content-Type': 'application/json' },
            });
          });
        })
    );
    return;
  }

  // Bypass stale cache for dev source modules to prevent dynamic import mismatches
  if (request.url.includes('/src/') || request.url.includes('/@vite/') || request.url.includes('node_modules')) {
    event.respondWith(
      fetch(request).catch(() => caches.match(request))
    );
    return;
  }

  // SPA app shell & static assets handling
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => cachedResponse || caches.match('/index.html'));

        return cachedResponse || fetchPromise;
      });
    })
  );
});
