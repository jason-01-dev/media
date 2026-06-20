// Simple service worker: cache shell and serve stale-while-revalidate
const CACHE_NAME = 'actu24-shell-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/file.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req).then((res) => {
      // optionally cache
      return res;
    }))
  );
});
