// NajaVoice Service Worker
// Enables offline support and app-like experience

const CACHE_NAME = 'najavoice-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/feed.html',
  '/auth.html',
  '/post-problem.html',
  '/problem.html',
  '/profile.html',
  '/search.html',
  '/government.html',
  '/supabase.js',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
];

// Install — cache all assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('NajaVoice: Caching app assets');
      return cache.addAll(ASSETS.map(url => new Request(url, {mode: 'no-cors'})));
    }).catch(err => console.log('Cache error:', err))
  );
  self.skipWaiting();
});

// Activate — clean old caches
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

// Fetch — serve from cache, fallback to network
self.addEventListener('fetch', event => {
  // Skip non-GET and Supabase API requests (always need live data)
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('supabase.co')) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // Cache new pages
        if (response && response.status === 200) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        }
        return response;
      }).catch(() => {
        // Offline fallback
        if (event.request.destination === 'document') {
          return caches.match('/index.html');
        }
      });
    })
  );
});

// Push Notifications
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'NajaVoice 🇳🇬';
  const options = {
    body: data.body || 'A new update on NajaVoice!',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    data: { url: data.url || '/feed.html' },
    actions: [
      { action: 'view', title: '👁️ View Now' },
      { action: 'close', title: '✕ Close' }
    ]
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click
self.addEventListener('notificationclick', event => {
  event.notification.close();
  if (event.action === 'view' || !event.action) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/feed.html')
    );
  }
});
