// Minimal service worker, present for one reason: Chrome will not fire
// `beforeinstallprompt` — and so will not offer "Add to Home Screen" — unless
// a service worker with a fetch handler is registered.
//
// Deliberately network-only. Caching a Next.js app properly means versioning
// hashed build assets and invalidating them on deploy; done casually it
// serves people a stale bundle after a release, which is a far worse bug
// than not having offline support. If offline is wanted later, add it as a
// considered piece of work rather than a side effect of the install prompt.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  // Passing the request straight through still counts as a fetch handler for
  // installability, without taking responsibility for the response.
  event.respondWith(fetch(event.request));
});
