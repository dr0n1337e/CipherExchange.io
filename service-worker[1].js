
self.addEventListener('install', e => {
  e.waitUntil(caches.open('cx-v1').then(cache => cache.addAll([
    './',
    './index.html','./shop.html','./auctions.html','./sell.html','./item.html','./profile.html',
    './styles.css','./app.js','./manifest.webmanifest',
  ])));
});
self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(resp => resp || fetch(e.request)));
});
