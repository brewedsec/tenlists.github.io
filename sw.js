const APP_VERSION = "1.3.0";
const CACHE_NAME = `ten-lists-tracker-${APP_VERSION}`;
const APP_CACHE_PREFIX = "ten-lists-tracker";

const CORE_ASSETS = [
  "./",
  "./index.html",
  `./styles.css?v=${APP_VERSION}`,
  `./app.js?v=${APP_VERSION}`,
  "./manifest.webmanifest",
  "./assets/favicon.svg",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
  "./assets/apple-touch-icon.png",
];

async function addCoreAssets() {
  const cache = await caches.open(CACHE_NAME);
  await cache.addAll(CORE_ASSETS.map((asset) => new Request(asset, { cache: "reload" })));
}

async function deleteOldCaches() {
  const keys = await caches.keys();
  await Promise.all(
    keys
      .filter((key) => key.startsWith(APP_CACHE_PREFIX) && key !== CACHE_NAME)
      .map((key) => caches.delete(key))
  );
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);

  try {
    const response = await fetch(new Request(request, { cache: "no-store" }));
    if (response && response.ok) {
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;

    if (request.mode === "navigate") {
      return cache.match("./index.html");
    }

    throw new Error("Network unavailable and no cached response exists.");
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response && response.ok) {
    const cache = await caches.open(CACHE_NAME);
    await cache.put(request, response.clone());
  }
  return response;
}

self.addEventListener("install", (event) => {
  event.waitUntil(addCoreAssets().then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(deleteOldCaches().then(() => self.clients.claim()));
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
    return;
  }

  if (["script", "style", "manifest"].includes(request.destination)) {
    event.respondWith(networkFirst(request));
    return;
  }

  event.respondWith(cacheFirst(request));
});
