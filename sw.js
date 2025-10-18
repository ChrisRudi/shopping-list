/* sw.js v1.0 */
const PRECACHE = 'precache-v1';
const PRECACHE_URLS = [
  './',
  './Shopping.html',
  './install.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(PRECACHE)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== PRECACHE).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle GET
  if(req.method !== 'GET'){ return; }

  // Cache-first for precached assets
  if (PRECACHE_URLS.some(p => url.pathname.endsWith(p.replace('./','/')))) {
    event.respondWith(
      caches.match(req).then(cached => cached || fetch(req))
    );
    return;
  }

  // Network-first for others
  event.respondWith(
    fetch(req).then(res => {
      const resClone = res.clone();
      caches.open(PRECACHE).then(cache => cache.put(req, resClone));
      return res;
    }).catch(() => caches.match(req))
  );
});
