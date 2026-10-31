// Yaya kazası videosu için çekim: kaza yeri (polis + ambulans), mobese, karakol + basın, ifade, YouTube araç ekranı, ban.
const {chromium}=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');const fs=require('fs');
const PAGE='http://localhost:8790/cap2.html',W=1280,H=720,OUT=__dirname+'/../public/guncelleme10/',YT=process.argv[3],which=process.argv[2];
(async()=>{fs.mkdirSync(OUT,{recursive:true});const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--disable-background-timer-throttling']});
  const p=await b.newPage({viewport:{width:W,height:H}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
  if(YT){const J=fs.readFileSync(YT,'utf8');await p.route(/piped/,r=>r.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:J}));}
  await p.addInitScript(()=>{let T=0;const cbs=[];performance.now=()=>T;const _now=Date.now;window.requestAnimationFrame=cb=>{cbs.push(cb);return cbs.length;};window.__tick=ms=>{T+=ms;const l=cbs.splice(0);for(const cb of l)try{cb(T);}catch(e){console.error(e);}};try{localStorage.clear();}catch(_){}});
  await p.goto(PAGE,{waitUntil:'domcontentloaded',timeout:120000});await p.waitForFunction(()=>window.__tepeReady,null,{timeout:120000});
  const rec=async(name,n,each,stride=1)=>{fs.rmSync(OUT+name,{recursive:true,force:true});fs.mkdirSync(OUT+name,{recursive:true});for(let i=0;i<n;i++){for(let s=0;s<stride-1;s++)await p.evaluate(`(${each||'()=>{}'})(${i});window.__noRender=true;__tick(1000/30)`);await p.evaluate(`(${each||'()=>{}'})(${i});window.__noRender=false;__tick(1000/30)`);await p.screenshot({path:OUT+name+'/'+String(i).padStart(4,'0')+'.jpg',type:'jpeg',quality:88});}console.log(name,n);};
  const ff=async n=>{for(let i=0;i<n;i++)await p.evaluate('window.__noRender=true;__tick(1000/30)');};
  await p.evaluate(()=>{__T.SET.hide=false;__T.SET.ultra=true;__T.SET.mute=true;__T.SET.police=2;__T.applySet();Object.assign(__T.SET.lo,{veh:'kartal',paint:0xff5a1f});__T.applyLoadout();__T.startMode('serbest');});await ff(30);
  // the accident: a pedestrian steps out, police and ambulance arrive
  if(which!=='yt'){await p.evaluate(()=>{const c=__T.car;c.v=8;window.__hitDone=false;});
  await rec('kaza',150,`i=>{const c=__T.car,K=__T.ACC;if(i===12&&!window.__hitDone){window.__hitDone=true;const ped=__T.PEDS[0];ped.st='walk';ped.g.visible=true;ped.g.position.set(c.pos.x+Math.cos(c.yaw)*2.5,0,c.pos.z+Math.sin(c.yaw)*2.5);__T.accHit(ped,c);K.live=false;c.v=0;c.vel.set(0,0,0);}
    if(i>12){c.v=0;c.vel.set(0,0,0);if(!window.__camOverride){const q=K.pos;window.__camOverride=(P,L,U)=>{const f=window.__f||0,a=.9+f*.004;P.set(q.x+Math.cos(a)*16,7,q.z+Math.sin(a)*16);L.set(q.x,1,q.z);U.set(0,1,0);return 3;};}window.__f=i;}}`,3);
  await rec('mobese',150,`i=>{window.__f=150+i;}`,1);}
  const until=async(cond,max)=>{for(let i=0;i<max;i++){if(await p.evaluate(cond))return i;await ff(3);}return -1;};
  if(which!=='yt'){await until(()=>__T.ACC.st==='arrest',600);await p.evaluate(()=>{window.__camOverride=null;});
  await rec('karakol',110,'()=>{}',2);await until(()=>__T.ACC.toKara,300);
  await rec('basin',220,'()=>{}',2);await until(()=>!document.getElementById('ifade').hidden,400);await ff(20);
  await rec('ifade',90,`i=>{if(i===30){document.getElementById('ifIn').value='Bilerek değil, yaya birden önüme çıktı';}if(i===50)document.getElementById('ifGo').click();}`,1);}
  if(which==='yt'){// YouTube on the car screen
  await p.evaluate(()=>{if(!document.getElementById('ifade').hidden){__T.ACC&&0;}document.getElementById('ifade').hidden=true;window.__camOverride=null;if(__T.FOOT.on)__T.footToggle();});await ff(10);
  await p.evaluate(()=>{const c=__T.car,F=__T.FOOT;c.pos.x=F.pos.x;c.pos.z=F.pos.z+1;if(F.on)__T.footToggle();__T.setCamMode(3);});await ff(20);
  await rec('yt',100,`i=>{if(i===8)__T.osOpen();if(i===20)__T.osApp('yt');if(i===34){document.getElementById('osYtIn').value='uçan araba';__T.ytSearch('uçan araba');}}`,1);}
  console.log('bitti',errs.slice(0,3));await b.close();})().catch(e=>{console.error('FAIL',e.message);process.exit(1);});
