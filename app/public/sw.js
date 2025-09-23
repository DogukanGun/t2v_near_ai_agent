const CACHE_NAME = 'mythos-v1.0.0'
const STATIC_CACHE_NAME = 'mythos-static-v1.0.0'
const DYNAMIC_CACHE_NAME = 'mythos-dynamic-v1.0.0'

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/offline',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
]

// API endpoints to cache dynamically
const API_CACHE_PATTERNS = [
  /^https:\/\/api\./,
  /\/api\//
]

// Network-first patterns (always try network first)
const NETWORK_FIRST_PATTERNS = [
  /\/api\/auth/,
  /\/api\/user/,
  /\/api\/wallet/
]

// Cache-first patterns (serve from cache if available)
const CACHE_FIRST_PATTERNS = [
  /\.(css|js|png|jpg|jpeg|gif|svg|woff|woff2)$/,
  /\/icons\//,
  /\/images\//
]

self.addEventListener('install', (event) => {
  console.log('Service Worker: Install event')
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log('Service Worker: Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      }),
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  )
})

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activate event')
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME &&
                cacheName !== CACHE_NAME) {
              console.log('Service Worker: Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      }),
      // Take control of all clients
      self.clients.claim()
    ])
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Skip cross-origin requests unless they're API calls
  if (url.origin !== location.origin && !isApiRequest(url)) {
    return
  }

  event.respondWith(handleRequest(request))
})

async function handleRequest(request) {
  const url = new URL(request.url)

  try {
    // Network-first strategy for critical API endpoints
    if (isNetworkFirstPattern(url)) {
      return await networkFirst(request)
    }

    // Cache-first strategy for static assets
    if (isCacheFirstPattern(url)) {
      return await cacheFirst(request)
    }

    // Stale-while-revalidate for API requests
    if (isApiRequest(url)) {
      return await staleWhileRevalidate(request)
    }

    // Default: Network-first with cache fallback
    return await networkFirst(request)

  } catch (error) {
    console.error('Service Worker: Request failed:', error)
    return await getOfflineFallback(request)
  }
}

async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request)
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    // Network failed, try cache
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    throw error
  }
}

async function cacheFirst(request) {
  const cachedResponse = await caches.match(request)
  
  if (cachedResponse) {
    // Update cache in background
    fetch(request).then((networkResponse) => {
      if (networkResponse.ok) {
        const cache = caches.open(STATIC_CACHE_NAME)
        cache.then(c => c.put(request, networkResponse))
      }
    }).catch(() => {
      // Ignore network failures for cache-first resources
    })
    
    return cachedResponse
  }

  // Not in cache, fetch from network
  const networkResponse = await fetch(request)
  
  if (networkResponse.ok) {
    const cache = await caches.open(STATIC_CACHE_NAME)
    cache.put(request, networkResponse.clone())
  }
  
  return networkResponse
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME)
  const cachedResponse = await cache.match(request)

  // Fetch from network in parallel
  const networkPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  })

  // Return cached version immediately if available
  if (cachedResponse) {
    return cachedResponse
  }

  // Otherwise wait for network
  return networkPromise
}

async function getOfflineFallback(request) {
  const url = new URL(request.url)

  // For navigation requests, return offline page
  if (request.mode === 'navigate') {
    const offlinePage = await caches.match('/offline')
    if (offlinePage) {
      return offlinePage
    }
  }

  // For API requests, return offline JSON response
  if (isApiRequest(url)) {
    return new Response(JSON.stringify({
      error: 'Offline',
      message: 'This feature requires an internet connection',
      offline: true,
      timestamp: new Date().toISOString()
    }), {
      status: 503,
      statusText: 'Service Unavailable',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      }
    })
  }

  // For other requests, throw error
  throw new Error('Offline and no cache available')
}

// Helper functions
function isApiRequest(url) {
  return API_CACHE_PATTERNS.some(pattern => pattern.test(url.href))
}

function isNetworkFirstPattern(url) {
  return NETWORK_FIRST_PATTERNS.some(pattern => pattern.test(url.href))
}

function isCacheFirstPattern(url) {
  return CACHE_FIRST_PATTERNS.some(pattern => pattern.test(url.href))
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync:', event.tag)
  
  if (event.tag === 'sync-offline-actions') {
    event.waitUntil(syncOfflineActions())
  }
})

async function syncOfflineActions() {
  try {
    // Get offline actions from IndexedDB or localStorage
    const offlineActions = await getOfflineActions()
    
    for (const action of offlineActions) {
      try {
        await processOfflineAction(action)
        await removeOfflineAction(action.id)
      } catch (error) {
        console.error('Service Worker: Failed to sync action:', error)
      }
    }
  } catch (error) {
    console.error('Service Worker: Sync failed:', error)
  }
}

async function getOfflineActions() {
  // Implementation would read from IndexedDB
  return []
}

async function processOfflineAction(action) {
  // Implementation would replay the action
  console.log('Processing offline action:', action)
}

async function removeOfflineAction(id) {
  // Implementation would remove from IndexedDB
  console.log('Removing offline action:', id)
}

// Push notification handling
self.addEventListener('push', (event) => {
  if (!event.data) return

  const data = event.data.json()
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: data.tag || 'default',
    data: data.data || {},
    actions: data.actions || [],
    requireInteraction: data.requireInteraction || false
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'Myth.OS', options)
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const action = event.action
  const data = event.notification.data

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Focus existing window if available
      for (const client of clientList) {
        if (client.url.includes(location.origin) && 'focus' in client) {
          return client.focus()
        }
      }
      
      // Open new window
      if (clients.openWindow) {
        const url = data.url || '/'
        return clients.openWindow(url)
      }
    })
  )
})