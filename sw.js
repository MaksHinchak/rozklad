/* Кеш для офлайн-роботи. Змінюй CACHE при оновленні файлів. */
var CACHE = "rozklad-v6";
var FILES = ["./","./index.html","./manifest.webmanifest",
             "./icon-192.png","./icon-512.png","./apple-touch-icon.png"];

self.addEventListener("install", function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(FILES);})
    .then(function(){return self.skipWaiting();}));
});

self.addEventListener("activate", function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.map(function(k){return k===CACHE?null:caches.delete(k);}));
  }).then(function(){return self.clients.claim();}));
});

/* спершу з кешу (працює без інтернету), паралельно тихо оновлюємо */
self.addEventListener("fetch", function(e){
  if(e.request.method!=="GET") return;
  e.respondWith(caches.match(e.request).then(function(hit){
    var net = fetch(e.request).then(function(res){
      if(res && res.status===200){
        var copy=res.clone();
        caches.open(CACHE).then(function(c){c.put(e.request,copy);});
      }
      return res;
    }).catch(function(){return hit;});
    return hit || net;
  }));
});
