/* Service worker : garde tous les fichiers en mémoire pour fonctionner sans Internet.
   Après une modification du site, change le numéro de VERSION pour forcer la mise à jour. */
var VERSION = "v1";
var PREFIX = "mesures-informatique-3d-";
var CACHE = PREFIX + VERSION;
var FILES = ["./", "index.html", "three.min.js", "manifest.webmanifest", "icon-192.png", "icon-512.png"];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k.indexOf(PREFIX) === 0 && k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(function (cache) {
    return cache.match(req, { ignoreSearch: true }).then(function (hit) {
      var net = fetch(req).then(function (res) { if (res && res.ok) cache.put(req, res.clone()); return res; }).catch(function () { return null; });
      return hit || net.then(function (r) { return r || cache.match("index.html"); });
    });
  }));
});
