/* Tepetaklak offline: the page fills the cache when the player taps "İnternetsiz modu indir".
   Pages are network-first (so updates arrive when online), everything else cache-first. */
const CACHE='tepetaklak-off-v2';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const url=new URL(req.url);if(url.hostname.endsWith('peerjs.com'))return;
  if(req.mode==='navigate'){
    e.respondWith((async()=>{const c=await caches.open(CACHE);
      try{const r=await fetch(req);if(r.ok&&url.origin===location.origin)c.put(new URL('./',self.registration.scope).href,r.clone());return r;}
      catch(_){return (await c.match(new URL('./',self.registration.scope).href))||(await c.match(req,{ignoreSearch:true}))||Response.error();}})());
    return;}
  e.respondWith((async()=>{const c=await caches.open(CACHE),hit=await c.match(req,{ignoreVary:true});if(hit)return hit;
    const r=await fetch(req);
    if(r.ok&&/^(cdn\.jsdelivr\.net|fonts\.(googleapis|gstatic)\.com)$/.test(url.hostname)||r.ok&&url.origin===location.origin)c.put(req,r.clone()).catch(()=>{});
    return r;})());
});
