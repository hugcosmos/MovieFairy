const CACHE_NAME = "moviefairy-v8";
const ASSETS = [
  "/css/style.css",
  "/js/data.js",
  "/js/questions.js",
  "/js/recommender.js",
  "/js/app.js",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  var url = new URL(e.request.url);
  // HTML: network-first, always get latest version
  if (e.request.mode === "navigate" || url.pathname === "/" || url.pathname === "/index.html") {
    e.respondWith(
      fetch(e.request).then(function (response) {
        var clone = response.clone();
        caches.open(CACHE_NAME).then(function (cache) { cache.put(e.request, clone); });
        return response;
      }).catch(function () {
        return caches.match(e.request);
      })
    );
    return;
  }
  // Other assets: cache-first
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request))
  );
});
