// Haberler uygulaması videosu: bir kaza olur, haber araba ekranına ve telefona düşer.
const {chromium}=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');const fs=require('fs');
const PAGE='http://localhost:8790/cap2.html',W=1280,H=720,OUT=__dirname+'/../public/guncelleme14/';
(async()=>{fs.mkdirSync(OUT,{recursive:true});const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--disable-background-timer-throttling']});
  const p=await b.newPage({viewport:{width:W,height:H}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.addInitScript(()=>{let T=0;const cbs=[];performance.now=()=>T;window.requestAnimationFrame=cb=>{cbs.push(cb);return cbs.length;};window.__tick=ms=>{T+=ms;const l=cbs.splice(0);for(const cb of l)try{cb(T);}catch(e){console.error(e);}};try{localStorage.clear();}catch(_){}});
  await p.goto(PAGE,{waitUntil:'domcontentloaded',timeout:120000});await p.waitForFunction(()=>window.__tepeReady,null,{timeout:120000});
  const rec=async(name,n,each,stride=1)=>{fs.rmSync(OUT+name,{recursive:true,force:true});fs.mkdirSync(OUT+name,{recursive:true});for(let i=0;i<n;i++){for(let s=0;s<stride-1;s++)await p.evaluate(`(${each||'()=>{}'})(${i});window.__noRender=true;__tick(1000/30)`);await p.evaluate(`(${each||'()=>{}'})(${i});window.__noRender=false;__tick(1000/30)`);await p.screenshot({path:OUT+name+'/'+String(i).padStart(4,'0')+'.jpg',type:'jpeg',quality:88});}console.log(name,n);};
  const ff=async n=>{for(let i=0;i<n;i++)await p.evaluate('window.__noRender=true;__tick(1000/30)');};
  await p.evaluate(()=>{__T.SET.hide=false;__T.SET.ultra=true;__T.SET.mute=true;__T.SET.police=2;__T.applySet();Object.assign(__T.SET.lo,{veh:'kartal',paint:0xff5a1f});__T.applyLoadout();__T.startMode('serbest');});await ff(30);
  await p.evaluate(()=>{__T.car.v=11;});await ff(10);
  await rec('kaza',60,`i=>{if(i===8){const c=__T.car,ped=__T.PEDS[0];ped.st='walk';ped.g.visible=true;ped.g.position.set(c.pos.x+Math.cos(c.yaw)*2.5,0,c.pos.z+Math.sin(c.yaw)*2.5);__T.accHit(ped,c);c.v=0;c.vel.set(0,0,0);}}`);
  await p.evaluate(()=>{__T.ACC.ifq=['Polis: Olay nasıl oldu?'];__T.ACC.qi=0;__T.ACC.ifDone=()=>{};__T.ifadeAnswer('Yaya kırmızıda birden önüme çıktı, hemen fren yaptım');__T.cbDamage(500,'Ali','Sniper');});await ff(5);
  await rec('arabaekrani',80,`i=>{if(i===10){__T.osOpen();__T.osApp('news');}}`);
  await p.evaluate(()=>{document.getElementById('carOS').hidden=true;__T.OS.open=false;});await ff(3);
  await rec('telefon',70,`i=>{if(i===8)__T.tappOpen();if(i===28){__T.tappOpen(false);__T.newsOpen(true);}}`);
  console.log('bitti',errs.slice(0,3));await b.close();})().catch(e=>{console.error('FAIL',e.message);process.exit(1);});
