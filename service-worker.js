// service-worker.js

const CACHE_NAME = 'crm-pwa-cache-v1';
const FILES_TO_CACHE = [
    './',
    './index.html',
    './offline.html',
    './styles.css',
    './app.js',
    './manifest.json',
    './icons/icons_crm-192x192.png',
    './icons/icons_crm-512x512.png'
];

// Durante l'installazione, mettiamo in cache i file principali
self.addEventListener('install', (evt) => {
    evt.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[ServiceWorker] Caching offline page and assets');
            return cache.addAll(FILES_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// Attivazione: pulizia vecchi caches
self.addEventListener('activate', (evt) => {
    evt.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(
                keyList.map((key) => {
                    if (key !== CACHE_NAME) {
                        console.log('[ServiceWorker] Removing old cache', key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Intercettiamo le richieste di rete: se offline, usiamo i file in cache
self.addEventListener('fetch', (evt) => {
    evt.respondWith(
        caches.match(evt.request).then((response) => {
            return response || fetch(evt.request).catch(() => {
                // Se la richiesta non è in cache e non c'è rete, mostriamo la pagina offline
                return caches.match('./offline.html');
            });
        })
    );
});
