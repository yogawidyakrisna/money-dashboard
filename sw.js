// App shell cache: the page opens instantly from cache, then refreshes itself in the background.
// Only the page, its icon and the account logos are cached; data requests always go to the network.
const CACHE = 'money-v28';
const SHELL = ['./', 'index.html', 'icon-180.png', 'logos/mandiri.svg', 'logos/jago.svg', 'logos/gopay.svg', 'logos/ovo.svg', 'logos/dana.svg'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  const isShell = e.request.mode === 'navigate' || url.pathname.endsWith('/icon-180.png') || url.pathname.includes('/logos/');
  if (e.request.method !== 'GET' || url.origin !== location.origin || !isShell) return;
  const key = new Request(url.origin + url.pathname);
  e.respondWith(caches.open(CACHE).then(async (cache) => {
    const cached = await cache.match(key);
    const fresh = fetch(e.request)
      .then((res) => { if (res.ok) cache.put(key, res.clone()); return res; })
      .catch(() => cached);
    return cached || fresh;
  }));
});
