const CACHE_NAME = 'inventory-cache-v2';
const urlsToCache = [
    '/',
    '/index.html',
    '/boxes.png',
    '/manifest.json',
    '/favicon.ico',
];

//Install event
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) =>{
            console.log('Opened cache');
            return cache.addAll(urlsToCache);
        })
    );
});

//Fetch event
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            // Cache hit - return the response from cache
            if(response){
                return response;
            }
            // Not in cache - return the result from the fetch request
            // and add the response to the cache for future use

            return fetch(event.request).then((networkResponse) => {
                if (event.request.url.startsWith('http')) {
                    return caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });
                }
                return networkResponse;
            });

            /*
            return fetch(event.request).then((response) => {
                if(!response || response.status !== 200 || response.type !== 'basic'){
                    return response;
                }
                const responseToCache = response.clone();
                caches.open(CACHE_NAME).then((cache) =>{
                    cache.put(event.request, responseToCache);
                });
                return response;
            });
            */
        }).catch(() =>{
            //fallback to cache or default response for offline
            return caches.match('.index.html');
        })
    );
});

//Active event
self.addEventListener('activate', (event) =>{
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) =>{
            return Promise.all(
                cacheNames.map((cacheName) =>{
                    if(cacheWhitelist.indexOf(cacheName) === -1){
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});