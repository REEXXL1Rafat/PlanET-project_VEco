const CACHE_NAME = 'ecoverify-v1';
const RUNTIME_CACHE = 'ecoverify-runtime-v1';

// Static assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => {
      console.log('[Service Worker] Skip waiting');
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
          .map((name) => {
            console.log('[Service Worker] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      console.log('[Service Worker] Claiming clients');
      return self.clients.claim();
    })
  );
});

// Fetch event - network first, fall back to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // API requests - network first, cache as fallback
  if (url.pathname.includes('/functions/v1/') || url.pathname.includes('/rest/v1/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone response before caching
          const responseToCache = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          // If network fails, try cache
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Return offline response
            return new Response(
              JSON.stringify({ error: 'Offline', offline: true }),
              {
                headers: { 'Content-Type': 'application/json' },
                status: 503,
              }
            );
          });
        })
    );
    return;
  }

  // Static assets - cache first, network as fallback
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached version and update cache in background
        fetch(request).then((response) => {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, response);
          });
        }).catch(() => {
          // Network request failed, but we have cache
        });
        return cachedResponse;
      }

      // Not in cache, fetch from network
      return fetch(request).then((response) => {
        // Cache successful responses
        if (response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return response;
      });
    })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync:', event.tag);
  
  if (event.tag === 'sync-scans') {
    event.waitUntil(syncOfflineScans());
  }
});

// Sync offline scans when back online
async function syncOfflineScans() {
  try {
    const cache = await caches.open(RUNTIME_CACHE);
    const requests = await cache.keys();
    
    // Find pending scan requests
    const scanRequests = requests.filter((req) => 
      req.url.includes('/functions/v1/barcode-lookup') && 
      req.method === 'POST'
    );

    // Retry each scan
    for (const request of scanRequests) {
      try {
        await fetch(request);
        await cache.delete(request);
      } catch (error) {
        console.error('[Service Worker] Failed to sync scan:', error);
      }
    }
  } catch (error) {
    console.error('[Service Worker] Background sync failed:', error);
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  const options = {
    body: data.body || 'New update available',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    data: data,
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'EcoVerify', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window open
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Open new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
