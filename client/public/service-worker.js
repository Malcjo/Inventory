const CACHE_NAME = 'inventory-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/boxes.png',
    '/manifest.json',
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