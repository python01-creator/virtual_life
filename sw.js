const CACHE='life-hq-place-icon-20261024-v63';
const APP_FILES=['./features/interior-catalog.js?v=room-scroll-20261022','./features/room-motion.js?v=room-isolation-20261021','./features/journey-diary.js?v=screen-cleanup-20261023','./features/diary-durable.js?v=journey-diary-20261021','./','./config.js?v=google-auth-live-20261020','./cloud.js?v=stable-boot-20261024','./enhancements.js?v=13','./icon.svg','./manifest.webmanifest',
 './assets/avatar-modern.png','./assets/mongle.webp','./assets/avatar-cute-stand.webp','./assets/avatar-cute-sit.webp','./assets/avatar-cute-lie.webp',
 './features/room-core.js?v=remove-small-office-title-20261024','./features/mobile-joystick.js?v=20261024','./features/calendar.js?v=20261026','./features/legacy-core.js?v=privacy-fix-20261021','./features/room-places.js?v=manual-work-20261022','./features/work-time.js?v=work-sync-20261023','./features/navigation.js?v=stable-boot-20261024','./features/wall-switch.js?v=20261019','./features/object-navigation.js?v=cozy-tidy-20261021','./features/todo-furniture.js?v=note-size-20261021','./features/character-controls.js?v=20261019','./features/avatar-radial.js?v=room-isolation-20261021','./features/popup-layout.js?v=20261019','./features/dialog-dismiss.js?v=20261019','./features/today-room.js?v=room-scroll-20261022','./features/walk-ui.js?v=20261019','./features/family-albums.js?v=room-scroll-20261022','./features/plant.js?v=plant-click-20261021','./features/memory-popup.js?v=choco-wall-20261020','./features/study-core.js?v=20261019','./features/study.js?v=20261019','./features/room-furniture.js?v=bedroom-20261021','./features/writing-furniture.js?v=20261019','./features/notion-monitor.js?v=plant-click-20261021','./features/writing-popup.js?v=20261019','./features/room-layout.js?v=note-size-20261021','./features/growth.js?v=20261019'];
APP_FILES.push('./features/room-places.js?v=place-icon-20261024','./features/work-time.js?v=work-sync-20261023e','./features/navigation.js?v=work-sync-20261023b');
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(c=>c.addAll(APP_FILES)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('life-hq-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;event.respondWith(fetch(event.request).then(response=>{if(response.ok){const clone=response.clone();caches.open(CACHE).then(c=>c.put(event.request,clone));}return response;}).catch(()=>caches.match(event.request).then(r=>r||(event.request.mode==='navigate'?caches.match('./'):Response.error()))));});

















