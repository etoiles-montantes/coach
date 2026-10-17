// Service worker minimal : réseau d'abord, cache en secours hors connexion.
// Les appels Google (Drive, connexion) ne passent pas par le cache.
const CACHE = 'coach-v1';
const SHELL = ['/coach/', '/coach/index.html', '/coach/icon-192.png', '/coach/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(SHELL.map(u => c.add(u).catch(() => {})))));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(req)
      .then(res => {
        if (res.ok) caches.open(CACHE).then(c => c.put(req, res.clone()));
        return res;
      })
      .catch(() => caches.match(req).then(m => m || caches.match('/coach/index.html')))
  );
});
