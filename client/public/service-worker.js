import { response } from "express";

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
  // Use a different strategy for API requests vs static assets
  if (event.request.url.includes('/inventory') || event.request.url.includes('/change-csv')) {
    // Network first strategy for API requests
    event.respondWith(
        fetch(event.request)
        .then((response) =>{
            if(response.status===200){
                caches.open(CACHE_NAME).then((cache) =>{
                    cache.put(event.request, response.clone());
                });
            }
            return response;
        })
        .catch(()=>{
            return caches.match(event.request);
        })
    );
    } else{
        event.respondWith(
            caches.match(event.request).then((response) =>{
                return response || fetch(event.request);
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