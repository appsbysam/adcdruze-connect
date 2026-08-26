const CACHE_NAME = 'adc-druze-link-v0.3.1';
const APP_SCOPE = '/adcdruze-connect/';
const APP_SHELL = [
  `${APP_SCOPE}index.html?v=031`,
  `${APP_SCOPE}manifest.webmanifest?v=031`,
  `${APP_SCOPE}version.json?v=031`,
  `${APP_SCOPE}assets/icon-48.webp?v=031`,
  `${APP_SCOPE}assets/icon-180.webp?v=031`,
  `${APP_SCOPE}assets/icon-192.webp?v=031`,
  `${APP_SCOPE}assets/icon-512.webp?v=031`,
  `${APP_SCOPE}assets/icon-maskable-512.webp?v=031`,
];
self.addEventListener('install', event => { event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))); self.skipWaiting(); });
self.addEventListener('activate', event => { event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))); self.clients.claim(); });
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url); if (url.origin !== self.location.origin) return;
  if (event.request.mode === 'navigate') { event.respondWith(fetch(event.request,{cache:'no-store'}).then(response=>{if(response&&response.ok)caches.open(CACHE_NAME).then(cache=>cache.put(`${APP_SCOPE}index.html?v=031`,response.clone()));return response;}).catch(()=>caches.match(`${APP_SCOPE}index.html?v=031`))); return; }
  if (url.pathname.endsWith('/version.json') || url.pathname.endsWith('/manifest.webmanifest') || url.pathname.endsWith('/sw.js')) { event.respondWith(fetch(event.request,{cache:'no-store'})); return; }
  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{if(response&&response.status===200&&response.type==='basic')caches.open(CACHE_NAME).then(cache=>cache.put(event.request,response.clone()));return response;})));
});
