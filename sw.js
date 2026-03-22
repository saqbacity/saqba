/* ═══════════════════════════════════════════════
   Service Worker — بوابة سقبا الرقمية
   v2.0 — مع دعم Push Notifications (FCM)
   ═══════════════════════════════════════════════ */

importScripts('https://www.gstatic.com/firebasejs/12.11.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.11.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey:            'AIzaSyCz5f8XWKtEmbc980X_KRBvRy-nkmrGDZE',
  authDomain:        'saqba-portal.firebaseapp.com',
  projectId:         'saqba-portal',
  storageBucket:     'saqba-portal.firebasestorage.app',
  messagingSenderId: '135534184893',
  appId:             '1:135534184893:web:87feb3535016b650052ad4',
});

const messaging = firebase.messaging();

/* إشعارات الخلفية */
messaging.onBackgroundMessage(payload => {
  const { title, body, icon, click_action } = payload.notification || {};
  const data = payload.data || {};
  self.registration.showNotification(title || 'بوابة سقبا', {
    body:    body || 'لديك إشعار جديد',
    icon:    icon || './icons/icon-192.png',
    badge:        './icons/icon-192.png',
    tag:          data.tag || 'saqba',
    data: { url: click_action || data.url || './citizen.html' },
    actions: [{ action:'open', title:'فتح' },{ action:'dismiss', title:'إغلاق' }],
    dir: 'rtl', lang: 'ar', vibrate:[200,100,200],
  });
});

/* ضغط على الإشعار */
self.addEventListener('notificationclick', event => {
  event.notification.close();
  if(event.action==='dismiss') return;
  const url = event.notification.data?.url || './citizen.html';
  event.waitUntil(
    clients.matchAll({type:'window',includeUncontrolled:true}).then(list => {
      for(const c of list){
        if(c.url.includes('saqbacity.github.io') && 'focus' in c){
          c.navigate(url); return c.focus();
        }
      }
      if(clients.openWindow) return clients.openWindow(url);
    })
  );
});

/* Cache + Offline */
const CACHE = 'saqba-v2';
const URLS  = ['./', './index.html', './citizen.html', './martyrs.html', './manifest.json'];

self.addEventListener('install',  e => { e.waitUntil(caches.open(CACHE).then(c=>c.addAll(URLS).catch(()=>{}))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', event => {
  const url = event.request.url;
  if(url.includes('firebase')||url.includes('googleapis')||url.includes('gstatic')||url.includes('fonts.')||event.request.method!=='GET') return;
  event.respondWith(
    fetch(event.request).then(r=>{ if(r&&r.status===200){const c=r.clone();caches.open(CACHE).then(cache=>cache.put(event.request,c))} return r; })
    .catch(()=>caches.match(event.request).then(c=>c||(event.request.destination==='document'?caches.match('./index.html'):undefined)))
  );
});
