const CACHE_NAME = "glix-shell-v7";
const APP_SHELL = [
  "/",
  "/manifest.webmanifest",
  "/favicon.svg",
  "/icon.svg",
  "/assets/stage/neon-toybox-arcade-deck-v1.png",
  "/assets/characters/neon-toybox-roster-v1.png",
  "/assets/games/butona-bas-neon-toybox-v1.png",
  "/assets/games/sizma-neon-toybox-v1.png",
  "/assets/games/zaman-bombasi-hafizasi-neon-toybox-v1.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET" || request.url.startsWith("ws:")) {
    return;
  }

  event.respondWith(
    fetch(request).catch(() => caches.match(request).then((cached) => cached ?? caches.match("/")))
  );
});
