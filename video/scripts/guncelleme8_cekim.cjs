// "Araba kendi park eder" videosu için çekim: yayayken uygulamadan Park et, sonra sesli "park et".
const {chromium}=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');const fs=require('fs');
const PAGE='http://localhost:8790/cap2.html',W=1280,H=720,OUT=__dirname+'/../public/guncelleme8/',which=process.argv[2];
(async()=>{fs.mkdirSync(OUT,{recursive:true});const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--disable-background-timer-throttling']});
  const p=await b.newPage({viewport:{width:W,height:H}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.addInitScript(()=>{let T=0;const cbs=[];performance.now=()=>T;window.requestAnimationFrame=cb=>{cbs.push(cb);return cbs.length;};window.__tick=ms=>{T+=ms;const l=cbs.splice(0);for(const cb of l)try{cb(T);}catch(e){console.error(e);}};try{localStorage.clear();}catch(_){}});
  await p.goto(PAGE,{waitUntil:'domcontentloaded',timeout:120000});await p.waitForFunction(()=>window.__tepeReady,null,{timeout:120000});
  await p.evaluate(()=>{__T.SET.hide=false;__T.SET.ultra=true;__T.SET.mute=true;__T.SET.police=0;__T.applySet();Object.assign(__T.SET.lo,{veh:'kartal',paint:0xff5a1f});__T.applyLoadout&&__T.applyLoadout();__T.startMode('serbest');});
  const rec=async(name,n,each,stride=1)=>{fs.rmSync(OUT+name,{recursive:true,force:true});fs.mkdirSync(OUT+name,{recursive:true});for(let i=0;i<n;i++){for(let s=0;s<stride-1;s++)await p.evaluate(`(${each||'()=>{}'})(${i});window.__noRender=true;__tick(1000/30)`);await p.evaluate(`(${each||'()=>{}'})(${i});window.__noRender=false;__tick(1000/30)`);await p.screenshot({path:OUT+name+'/'+String(i).padStart(4,'0')+'.jpg',type:'jpeg',quality:88});}console.log(name,n);};
  const ff=async n=>{for(let i=0;i<n;i++)await p.evaluate('window.__noRender=true;__tick(1000/30)');};
  await ff(40);await p.evaluate(()=>{const c=__T.car;c.v=0;c.vel.set(0,0,0);if(!__T.FOOT.on)__T.footToggle();});await ff(20);
  if(which==='app'){await p.evaluate(()=>__T.tappOpen());await ff(10);
    await rec('app',170,`i=>{if(i===24)document.getElementById('taPark').click();}`,2);}
  if(which==='ses'){await rec('ses',170,`i=>{if(i===4)__T.askShow('Hey Tepetaklak, park et','me');if(i===22)__T.askCommand('park et');if(i>22&&i<60)__T.askShow('Tamam, araba kendi kendine en yakın park yerine gidiyor.','tesla');}`,2);}
  console.log('bitti',errs.slice(0,3));await b.close();})().catch(e=>{console.error('FAIL',e.message);process.exit(1);});
