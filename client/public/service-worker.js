//import { response } from "express";

const CACHE_NAME = 'inventory-cache-v2';
const urlsToCache = [
    '/',
    '/index.html',
    '/icons/boxes.png',
    '/manifest.json',
    '/favicon.ico',
];

//Install event
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) =>{
            console.log('Opened cache');
            return cache.addAll(urlsToCache).catch((error) =>{
                console.error("Failed to cache some resources", error);
            });
        })
    );
});

//Fetch event
self.addEventListener('fetch', (event) => {
  // Use a different strategy for API requests vs static assets
  if (event.request.url.includes('/inventory') || event.request.url.includes('/change-csv')) {
    // Network first strategy for API requests
    event.respondWith(
        fetch(event.request)
        .then((response) =>{

            if(response && response.status===200 && response.type === 'basic'){
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then((cache) =>{
                    cache.put(event.request, responseClone);
                });
            }
            return response;
        })
        .catch(()=>{
            //if network fetch fails, look in the cache
            return caches.match(event.request);
        })
    );
    } else{
        event.respondWith(
            caches.match(event.request).then((cachedResponse) =>{
                return(
                    cachedResponse ||
                    fetch(event.request).then((networkResponse) =>{
                        //cache the network response if it is valid
                        if(networkResponse && networkResponse.status === 200){
                            const networkResponseClone = networkResponse.clone();
                            caches.open(CACHE_NAME).then((cache) =>{
                                cache.put(event.request, networkResponseClone);
                            });
                        }
                        return networkResponse;
                    }).catch((error) =>{
                        console.error("Fetch failed; returning offline page instead.", error);
                        //provide fallback response here
                    })
                );
            })
        );
    }
});

//Active event
self.addEventListener('activate', (event) =>{
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) =>{
            return Promise.all(
                cacheNames.map((cacheName) =>{
                    if(!cacheWhitelist.includes(cacheName)){
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});