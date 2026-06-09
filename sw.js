// ===== sw.js · MediShort360 · Service Worker v3 =====
const CACHE_NAME = 'medishort360-v3';

const PRECACHE_URLS = [
  './',
  './index.html',
  './app.js',
  './activacion.js',
  './style.css',
  './manifest.json',
  './icono-192.png',
  './icono-512.png',
];

// Dominios que NUNCA se interceptan (Firebase + Google APIs)
const BYPASS_ORIGINS = [
  'firestore.googleapis.com',
  'firebase.googleapis.com',
  'identitytoolkit.googleapis.com',
  'securetoken.googleapis.com',
  'www.gstatic.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
];

// ——— Install: pre-cachear recursos locales ———
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

// ——— Activate: limpiar caches viejos ———
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ——— Fetch: estrategia network-first ———
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Nunca interceptar Firebase ni Google APIs
  if (BYPASS_ORIGINS.some((origin) => url.hostname.includes(origin))) {
    return; // deja pasar al navegador directamente
  }

  // Solo interceptar GET
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Guardar copia fresca en cache
        const clone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return networkResponse;
      })
      .catch(() => {
        // Sin red → servir desde cache
        return caches.match(event.request).then(
          (cached) => cached || new Response('Sin conexión', { status: 503 })
        );
      })
  );
});
