const CACHE_NAME = 'streamapp-v1';
const API_CACHE_NAME = 'streamapp-api-v1';
const IMAGE_CACHE_NAME = 'streamapp-images-v1';

// Cache URLs
const CACHE_URLS = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/offline.html'
];

// API routes to cache
const API_ROUTES = [
  '/api/videos',
  '/api/auth'
];

// Image domains to cache
const IMAGE_DOMAINS = [
  'localhost',
  '127.0.0.1',
  'telegra.ph',
  't.me',
  'cdn.telegram.org'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(CACHE_URLS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && 
              cacheName !== API_CACHE_NAME && 
              cacheName !== IMAGE_CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Handle API requests
  if (API_ROUTES.some(route => url.pathname.startsWith(route))) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Clone the response
          const responseToCache = response.clone();
          
          // Cache successful API responses
          if (response.status === 200) {
            caches.open(API_CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          
          return response;
        })
        .catch(() => {
          // Return cached response if network fails
          return caches.match(event.request);
        })
    );
    return;
  }
  
  // Handle image requests
  if (event.request.destination === 'image' || 
      IMAGE_DOMAINS.some(domain => url.hostname.includes(domain))) {
    event.respondWith(
      caches.open(IMAGE_CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response) {
            return response;
          }
          
          return fetch(event.request).then((networkResponse) => {
            // Cache the image for future use
            if (networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          });
        });
      })
    );
    return;
  }
  
  // Handle other requests
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version if available
        if (response) {
          return response;
        }
        
        // Otherwise, fetch from network
        return fetch(event.request)
          .then((response) => {
            // Cache successful responses for static assets
            if (response.status === 200 && 
                (event.request.destination === 'script' || 
                 event.request.destination === 'style' ||
                 event.request.destination === 'manifest')) {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache);
              });
            }
            return response;
          })
          .catch(() => {
            // Return offline page for HTML requests
            if (event.request.destination === 'document') {
              return caches.match('/offline.html');
            }
            
            // Return a basic offline response for other requests
            return new Response('Offline', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-watch-history') {
    event.waitUntil(syncWatchHistory());
  }
  
  if (event.tag === 'sync-likes') {
    event.waitUntil(syncLikes());
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      vibrate: [100, 50, 100],
      data: {
        url: data.url || '/'
      },
      actions: [
        {
          action: 'view',
          title: 'View Video',
          icon: '/icons/view-icon.png'
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
          icon: '/icons/dismiss-icon.png'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'view') {
    const url = event.notification.data.url;
    event.waitUntil(
      clients.openWindow(url)
    );
  }
});

// Sync functions
async function syncWatchHistory() {
  // Get pending watch history from IndexedDB
  // Send to server when online
  console.log('Syncing watch history...');
}

async function syncLikes() {
  // Get pending likes from IndexedDB
  // Send to server when online
  console.log('Syncing likes...');
}

// Message handling
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});