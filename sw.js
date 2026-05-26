// NajaVoice Service Worker - Updated to NOT cache HTML files
const CACHE_NAME = 'najavoice-v3';

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => caches.delete(key)))
    )
  );
  self.clients.claim();
});

// Never cache HTML - always fetch fresh from network
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('supabase.co')) return;
  
  // For HTML files - always go to network, never cache
  if (event.request.destination === 'document' || 
      event.request.url.endsWith('.html') ||
      event.request.url.includes('.html?')) {
    event.respondWith(fetch(event.request));
    return;
  }
});
