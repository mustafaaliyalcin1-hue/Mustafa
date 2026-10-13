// Çevrimdışı önbellek: uygulama internet olmadan da açılır.
// (Konuşma tanıma çoğu cihazda yine de internet ister.)
const CACHE = "konusan-baykus-v2";
const FILES = [
  "./", "./index.html", "./styles.css", "./manifest.json", "./privacy.html",
  "./icons/icon.svg", "./icons/icon-192.png", "./icons/icon-512.png",
  "./js/main.js", "./js/ui.js", "./js/store.js", "./js/speech.js", "./js/fx.js",
  "./js/text.js", "./js/tips.js", "./js/coach.js", "./js/content.js",
  "./js/activities/home.js", "./js/activities/practice.js", "./js/activities/stories.js",
  "./js/activities/games.js", "./js/activities/parent.js",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});

// Önce ağ (güncel sürüm), ağ yoksa önbellek.
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res.ok && new URL(e.request.url).origin === location.origin) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(e.request).then((r) => r || caches.match("./index.html")))
  );
});
