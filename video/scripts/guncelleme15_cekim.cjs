// Haber videosu (bülten): kaza olur, haber listesinden "Haber videosu"na basılır, mobese kaydıyla bülten oynar.
const {chromium}=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');const fs=require('fs');
const PAGE='http://localhost:8790/cap2.html',W=1280,H=720,OUT=__dirname+'/../public/guncelleme15/';
(async()=>{fs.mkdirSync(OUT,{recursive:true});const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--disable-background-timer-throttling']});
  const p=await b.newPage({viewport:{width:W,height:H}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.addInitScript(()=>{let T=0;const cbs=[];performance.now=()=>T;window.requestAnimationFrame=cb=>{cbs.push(cb);return cbs.length;};window.__tick=ms=>{T+=ms;const l=cbs.splice(0);for(const cb of l)try{cb(T);}catch(e){console.error(e);}};try{localStorage.clear();}catch(_){}});
  await p.goto(PAGE,{waitUntil:'domcontentloaded',timeout:120000});await p.waitForFunction(()=>window.__tepeReady,null,{timeout:120000});
  const rec=async(name,n,each,stride=1)=>{fs.rmSync(OUT+name,{recursive:true,force:true});fs.mkdirSync(OUT+name,{recursive:true});for(let i=0;i<n;i++){for(let s=0;s<stride-1;s++)await p.evaluate(`(${each||'()=>{}'})(${i});window.__noRender=true;__tick(1000/30)`);await p.evaluate(`(${each||'()=>{}'})(${i});window.__noRender=false;__tick(1000/30)`);await p.screenshot({path:OUT+name+'/'+String(i).padStart(4,'0')+'.jpg',type:'jpeg',quality:88});}console.log(name,n);};
  const ff=async n=>{for(let i=0;i<n;i++)await p.evaluate('window.__noRender=true;__tick(1000/30)');};
  await p.evaluate(()=>{__T.SET.hide=false;__T.SET.ultra=true;__T.SET.mute=true;__T.SET.police=0;__T.applySet();Object.assign(__T.SET.lo,{veh:'kartal',paint:0xff5a1f});__T.applyLoadout();__T.startMode('serbest');});await ff(30);
  await p.evaluate(()=>{__T.car.v=12;});await ff(30);
  await p.evaluate(()=>{const c=__T.car,ped=__T.PEDS[0];ped.st='walk';ped.g.visible=true;ped.g.position.set(c.pos.x+Math.cos(c.yaw)*3,0,c.pos.z+Math.sin(c.yaw)*3);c.v=12;__T.accHit(ped,c);});
  await ff(80);await p.evaluate(()=>{__T.car.v=0;__T.car.vel.set(0,0,0);__T.ACC.ifq=['Polis: Olay nasıl oldu?'];__T.ACC.qi=0;__T.ACC.ifDone=()=>{};__T.ifadeAnswer('Yaya birden önüme çıktı, fren yaptım ama yetişemedim');});await ff(5);
  await rec('liste',50,`i=>{if(i===5)__T.newsOpen(true);}`);
  await rec('bulten',180,`i=>{if(i===0){const n=__T.NEWS.list.find(n=>n.clip);__T.newsOpen(false);__T.newsPlay(n);}}`);
  console.log('bitti',errs.slice(0,3));await b.close();})().catch(e=>{console.error('FAIL',e.message);process.exit(1);});
