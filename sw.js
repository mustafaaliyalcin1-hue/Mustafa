// Basit çevrimdışı önbellek: uygulama dosyaları internet olmadan da açılır.
// (Ses tanıma çoğu cihazda yine de internet ister.)
const CACHE = "konusan-baykus-v1";
const FILES = ["./", "./index.html", "./styles.css", "./app.js", "./data.js", "./manifest.json", "./icons/icon.svg"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)));
  self.skipWaiting();
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const copy = res.clone();
        if (new URL(e.request.url).origin === location.origin) caches.open(CACHE).then((c) => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
