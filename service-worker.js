const CACHE_NAME = 'crm-cache-v4'; // Cambia il nome della cache per forzare l'aggiornamento
const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './script.js',
  './manifest.json',
  './icons/icons_crm-192x192.png',
  './icons/icons_crm-512x512.png',
  './offline.html', // Pagina di fallback per la modalità offline
];

// Durante l'installazione, cachea tutte le risorse statiche
self.addEventListener('install', event => {
  console.log('[Service Worker] Installazione iniziata');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[Service Worker] Cache aperta');
      return cache.addAll(urlsToCache);
    }).then(() => {
      // Forza l'attivazione del nuovo SW
      return self.skipWaiting();
    }).catch(err => console.error('[Service Worker] Errore durante il caching', err))
  );
});

// Intercetta le richieste e risponde con la cache o con la rete
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // Ritorna la risorsa dalla cache se disponibile
      if (response) {
        console.log('[Service Worker] Risorsa trovata nella cache:', event.request.url);
        return response;
      }
      // Altrimenti, prova a ottenere la risorsa dalla rete
      return fetch(event.request).then(networkResponse => {
        if (networkResponse && networkResponse.status === 200) {
          // Salva la risposta nella cache
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Fallback per richieste specifiche in caso di errore di rete
        if (event.request.destination === 'document') {
          return caches.match('./offline.html'); // Pagina offline di fallback
        }
        if (event.request.destination === 'image') {
          return caches.match('./icons/icons_crm-192x192.png'); // Icona di fallback
        }
      });
    })
  );
});

// Attiva il Service Worker e gestisce l'eliminazione delle vecchie cache
self.addEventListener('activate', event => {
  console.log('[Service Worker] Attivazione iniziata');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(keyList =>
      Promise.all(
        keyList.map(key => {
          if (!cacheWhitelist.includes(key)) {
            console.log('[Service Worker] Cache eliminata:', key);
            return caches.delete(key);
          }
        })
      )
    ).then(() => {
      // Prende immediatamente il controllo delle schede aperte
      return self.clients.claim();
    })
  );
});
