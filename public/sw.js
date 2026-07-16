const CACHE_NAME = 'portal-utilidades-v1'
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/login',
  '/checklists',
  '/manutencao',
  '/utilidades',
]

// Install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

// Activate
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

// Fetch
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return

  // Skip API requests
  if (event.request.url.includes('/api/') || event.request.url.includes('supabase')) {
    return
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) return response

      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200) return response

        const responseToCache = response.clone()
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache)
        })

        return response
      })
    })
  )
})

// Push notifications
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {}
  const options = {
    body: data.body || 'Nova notificação',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    vibrate: [100, 50, 100],
    data: data,
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'Portal de Utilidades', options)
  )
})

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    self.clients.openWindow(event.notification.data?.url || '/dashboard')
  )
})
