const CACHE_NAME = 'portal-utilidades-v2'
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/login',
  '/checklists',
  '/manutencao',
  '/utilidades',
  '/insumos',
  '/residuos',
  '/laboratorio',
  '/relatorios',
  '/clima',
  '/indicadores',
  '/supervisao',
  '/historico',
  '/alertas',
  '/usuarios',
  '/configuracoes',
  '/atividades-preventivas',
  '/manifest.json',
  '/favicon.svg',
  '/icons/icon-192.svg',
]

// Install - Cache all static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.log('Some assets failed to cache:', err)
      })
    })
  )
  self.skipWaiting()
})

// Activate - Clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      )
    })
  )
  self.clients.claim()
})

// Fetch - Network first with cache fallback
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return

  // Skip API requests and Supabase
  if (event.request.url.includes('/api/') ||
      event.request.url.includes('supabase') ||
      event.request.url.includes('openweathermap')) {
    return
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone the response before caching
        const responseToCache = response.clone()
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache)
        })
        return response
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(event.request).then((response) => {
          if (response) return response

          // Return offline page for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match('/dashboard')
          }

          return new Response('Offline', { status: 503 })
        })
      })
  )
})

// Push notifications
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {}
  const options = {
    body: data.body || 'Nova notificação',
    icon: '/icons/icon-192.svg',
    badge: '/icons/icon-192.svg',
    vibrate: [100, 50, 100],
    data: data,
    actions: [
      { action: 'open', title: 'Abrir' },
      { action: 'dismiss', title: 'Dispensar' },
    ],
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'Portal de Utilidades', options)
  )
})

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'dismiss') return

  event.waitUntil(
    self.clients.matchAll().then((clients) => {
      // Check if there's already a window open
      for (const client of clients) {
        if (client.url.includes('/dashboard') && 'focus' in client) {
          return client.focus()
        }
      }
      // Open new window
      return self.clients.openWindow(event.notification.data?.url || '/dashboard')
    })
  )
})

// Background sync for offline data
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-checklists') {
    event.waitUntil(syncOfflineData())
  }
})

async function syncOfflineData() {
  try {
    const cache = await caches.open('offline-data')
    const requests = await cache.keys()

    for (const request of requests) {
      const response = await cache.match(request)
      const data = await response.json()

      // Try to sync with server
      await fetch(request.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      // Remove from offline cache after successful sync
      await cache.delete(request)
    }
  } catch (err) {
    console.log('Sync failed:', err)
  }
}
