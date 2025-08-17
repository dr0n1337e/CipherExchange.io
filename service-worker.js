
const CACHE = 'silkx-v2';
const PRECACHE = [
  './',
  './index.html','./shop.html','./auctions.html','./sell.html','./item.html','./profile.html','./leaderboard.html','./admin.html',
  './styles.css?v=8','./app.js?v=8','./manifest.webmanifest',
];
self.addEventListener('install', e => {
  e.waitUntil((async ()=>{
    const cache = await caches.open(CACHE);
    await cache.addAll(PRECACHE);
    self.skipWaiting();
  })());
});
self.addEventListener('activate', e => {
  e.waitUntil((async ()=>{
    const keys = await caches.keys();
    await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', e => {
  const req = e.request;
  const isDocOrAsset = req.destination==='document'||req.destination==='script'||req.destination==='style';
  if(isDocOrAsset){
    e.respondWith((async ()=>{
      try{
        const fresh = await fetch(req, {cache:'no-store'});
        const cache = await caches.open(CACHE); cache.put(req, fresh.clone());
        return fresh;
      }catch{
        const cached = await caches.match(req);
        return cached || fetch(req);
      }
    })());
  }
});
