const CACHE_NAME = 'lovtaro-v1'
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.svg',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return

  const url = new URL(event.request.url)

  // Network-first for navigation (HTML pages)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match('/').then((cached) => cached ?? fetch(event.request))
      )
    )
    return
  }

  // Cache-first for static assets (JS, CSS, fonts)
  if (
    url.origin === self.location.origin &&
    (url.pathname.startsWith('/assets/') || url.pathname.endsWith('.svg') || url.pathname === '/manifest.json')
  ) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached
        return fetch(event.request).then((response) => {
          if (response.ok) {
            const clone = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
          }
          return response
        })
      })
    )
  }
})
