const CACHE_NAME = "glix-shell-v7";
const APP_SHELL = [
  "/",
  "/manifest.webmanifest",
  "/favicon.svg",
  "/icon.svg",
  "/assets/stage/portrait-arena-deck-v1.webp",
  "/assets/stage/landscape-arena-deck-v1.webp",
  "/assets/common/hud/timer-bezel-v1.svg",
  "/assets/common/icons/connection-radar-v1.svg",
  "/assets/common/overlays/rotate-phone-icon-v1.svg",
  "/assets/avatars/hud-pips/p1-cyan-arrow.svg",
  "/assets/avatars/hud-pips/p2-magenta-heart.svg",
  "/assets/avatars/hud-pips/p3-amber-bolt.svg",
  "/assets/avatars/hud-pips/p4-lime-bars.svg",
  "/assets/avatars/hud-pips/p5-violet-wave.svg",
  "/assets/avatars/hud-pips/p6-orange-hazard.svg",
  "/assets/avatars/hud-pips/p7-emerald-gem.svg",
  "/assets/avatars/hud-pips/p8-cobalt-cross.svg"
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
