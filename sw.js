// NaijaVoice Service Worker
const CACHE_NAME = 'naijavoice-v4';

// Only cache static assets — never HTML
const STATIC_ASSETS = [
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  // Never cache Supabase calls
  if (event.request.url.includes('supabase.co')) return;

  // Never cache HTML — always fetch fresh
  if (
    event.request.destination === 'document' ||
    event.request.url.endsWith('.html') ||
    event.request.url.includes('.html?')
  ) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // For static assets — cache first, then network
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request);
    })
  );
});
