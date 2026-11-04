// Yeni şehir dokuları: gerçek ölçekli cepheler, yansıyan camlar, asfalt ve kaldırım.
const {chromium}=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');const fs=require('fs');
const PAGE='http://localhost:8790/cap2.html',W=1280,H=720,OUT=__dirname+'/../public/guncelleme18/';
(async()=>{fs.mkdirSync(OUT,{recursive:true});const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--disable-background-timer-throttling']});
  const p=await b.newPage({viewport:{width:W,height:H}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.addInitScript(()=>{let T=0;const cbs=[];performance.now=()=>T;window.requestAnimationFrame=cb=>{cbs.push(cb);return cbs.length;};window.__tick=ms=>{T+=ms;const l=cbs.splice(0);for(const cb of l)try{cb(T);}catch(e){console.error(e);}};try{localStorage.clear();}catch(_){}});
  await p.goto(PAGE,{waitUntil:'domcontentloaded',timeout:120000});await p.waitForFunction(()=>window.__tepeReady,null,{timeout:120000});
  const rec=async(name,n,each,stride=1)=>{fs.rmSync(OUT+name,{recursive:true,force:true});fs.mkdirSync(OUT+name,{recursive:true});for(let i=0;i<n;i++){for(let s=0;s<stride-1;s++)await p.evaluate(`(${each||'()=>{}'})(${i});window.__noRender=true;__tick(1000/30)`);await p.evaluate(`(${each||'()=>{}'})(${i});window.__noRender=false;__tick(1000/30)`);await p.screenshot({path:OUT+name+'/'+String(i).padStart(4,'0')+'.jpg',type:'jpeg',quality:88});}console.log(name,n);};
  const ff=async n=>{for(let i=0;i<n;i++)await p.evaluate('window.__noRender=true;__tick(1000/30)');};
  await p.evaluate(()=>{window.__noAO=true;__T.SET.hide=true;__T.SET.ultra=true;__T.SET.mute=true;__T.SET.police=0;__T.applySet();__T.startMode('serbest');__T.NACC.next=1e9;});await ff(30);
  await p.evaluate(()=>{__T.setCamMode&&__T.setCamMode(1);});
  await rec('surus',120,`i=>{__T.car.v=Math.min(14,2+i*.3);}`);
  await p.evaluate(()=>{__T.car.v=0;__T.car.vel.set(0,0,0);});await ff(40);
  await p.evaluate(()=>{__T.footToggle();});await ff(10);
  await rec('yuru',110,`i=>{__T.FOOT.yaw+=.012;__T.FOOT.cam=__T.FOOT.yaw;}`);
  await rec('yan',90,`i=>{__T.FOOT.yaw+=.02;__T.FOOT.cam=__T.FOOT.yaw;}`);
  console.log('bitti',errs.slice(0,3));await b.close();})().catch(e=>{console.error('FAIL',e.message);process.exit(1);});
