// Meslekler (112 / polis), rastgele NPC kazaları, canlı yayın, sesli komutla ekranda şarkı açma, yeni mobese açısı.
const {chromium}=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');const fs=require('fs');
const PAGE='http://localhost:8790/cap2.html',W=1280,H=720,OUT=__dirname+'/../public/guncelleme16/';
(async()=>{fs.mkdirSync(OUT,{recursive:true});const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--disable-background-timer-throttling']});
  const p=await b.newPage({viewport:{width:W,height:H}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.addInitScript(()=>{let T=0;const cbs=[];performance.now=()=>T;window.requestAnimationFrame=cb=>{cbs.push(cb);return cbs.length;};window.__tick=ms=>{T+=ms;const l=cbs.splice(0);for(const cb of l)try{cb(T);}catch(e){console.error(e);}};try{localStorage.clear();}catch(_){}});
  await p.route(/piped|youtube|ytimg|nocookie/,r=>{const u=r.request().url();if(/search/.test(u))return r.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify({items:[{url:'/watch?v=abcdefghijk',title:'Tarkan - Kuzu Kuzu',uploaderName:'Tarkan',duration:215,thumbnail:''}]})});r.fulfill({status:200,contentType:'text/html',body:'<body style="margin:0;background:#111;color:#fff;font:700 28px sans-serif;display:grid;place-items:center;height:100vh">▶ Tarkan · Kuzu Kuzu</body>'});});
  await p.goto(PAGE,{waitUntil:'domcontentloaded',timeout:120000});await p.waitForFunction(()=>window.__tepeReady,null,{timeout:120000});
  const rec=async(name,n,each,stride=1)=>{fs.rmSync(OUT+name,{recursive:true,force:true});fs.mkdirSync(OUT+name,{recursive:true});for(let i=0;i<n;i++){for(let s=0;s<stride-1;s++)await p.evaluate(`(${each||'()=>{}'})(${i});window.__noRender=true;__tick(1000/30)`);await p.evaluate(`(${each||'()=>{}'})(${i});window.__noRender=false;__tick(1000/30)`);await p.screenshot({path:OUT+name+'/'+String(i).padStart(4,'0')+'.jpg',type:'jpeg',quality:88});}console.log(name,n);};
  const ff=async n=>{for(let i=0;i<n;i++)await p.evaluate('window.__noRender=true;__tick(1000/30)');};
  await p.evaluate(()=>{__T.SET.hide=false;__T.SET.ultra=true;__T.SET.mute=true;__T.SET.police=0;__T.applySet();Object.assign(__T.SET.lo,{veh:'kartal',paint:0xffffff});__T.applyLoadout();__T.startMode('serbest');__T.NACC.next=1e9;});await ff(30);
  await rec('meslek',70,`i=>{if(i===8)document.getElementById('bJob').click();if(i===45)__T.jobSet('saglik');}`);
  // an NPC accident ~45 m ahead; the 112 call comes in
  await p.evaluate(()=>{__T.NACC.next=0;});await ff(3);
  await p.evaluate(()=>{const n=__T.NACC,c=__T.car,R=__T.CITY;const dx=n.pos.x-c.pos.x,dz=n.pos.z-c.pos.z,d=Math.hypot(dx,dz);c.pos.x=n.pos.x-dx/d*60;c.pos.z=n.pos.z-dz/d*60;c.v=0;c.vel.set(0,0,0);});await ff(10);
  await rec('ihbar',60,`i=>{}`);
  await p.evaluate(()=>{__T.naccGo();});
  await rec('git',90,`i=>{}`,3);
  await p.evaluate(()=>{const n=__T.NACC,c=__T.car;if(Math.hypot(n.pos.x-c.pos.x,n.pos.z-c.pos.z)>10){c.pos.x=n.pos.x+7;c.pos.z=n.pos.z+5;}c.v=0;c.vel.set(0,0,0);__T.AP&&__T.apStop&&__T.apStop();});await ff(20);
  await rec('mudahale',110,`i=>{if(i===10)__T.jobAct();}`);
  await p.evaluate(()=>{__T.NACC.next=1e9;__T.naccClear();__T.NACC.on=false;__T.NACC.next=0;});await ff(3);
  await rec('canli',100,`i=>{if(i===0){const it=__T.NEWS.list.find(n=>n.live);__T.newsPlay(it);}}`);
  await p.evaluate(()=>{document.getElementById('ntClose')&&document.getElementById('ntClose').click();__T.NACC.next=1e9;});await ff(5);
  await rec('sesli',100,`i=>{if(i===5)__T.askShow('Hey Tepetaklak, ekrandan Tarkan Kuzu Kuzu şarkısını aç','me');if(i===15)__T.askCommand('ekrandan Tarkan Kuzu Kuzu şarkısını aç');}`);
  console.log('bitti',errs.slice(0,3));await b.close();})().catch(e=>{console.error('FAIL',e.message);process.exit(1);});
