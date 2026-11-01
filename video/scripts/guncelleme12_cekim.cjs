// Hastane/karakol içi videosu: olay yeri ifadesi + mobese, araba çarpması, hastane yatağı, geçmiş olsun, hücre + sorgu, taret botlara.
const {chromium}=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');const fs=require('fs');
const PAGE='http://localhost:8790/cap2.html',W=1280,H=720,OUT=__dirname+'/../public/guncelleme12/';
(async()=>{fs.mkdirSync(OUT,{recursive:true});const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--disable-background-timer-throttling']});
  const p=await b.newPage({viewport:{width:W,height:H}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.addInitScript(()=>{let T=0;const cbs=[];performance.now=()=>T;window.requestAnimationFrame=cb=>{cbs.push(cb);return cbs.length;};window.__tick=ms=>{T+=ms;const l=cbs.splice(0);for(const cb of l)try{cb(T);}catch(e){console.error(e);}};try{localStorage.clear();}catch(_){}});
  await p.goto(PAGE,{waitUntil:'domcontentloaded',timeout:120000});await p.waitForFunction(()=>window.__tepeReady,null,{timeout:120000});
  const rec=async(name,n,each,stride=1)=>{fs.rmSync(OUT+name,{recursive:true,force:true});fs.mkdirSync(OUT+name,{recursive:true});for(let i=0;i<n;i++){for(let s=0;s<stride-1;s++)await p.evaluate(`(${each||'()=>{}'})(${i});window.__noRender=true;__tick(1000/30)`);await p.evaluate(`(${each||'()=>{}'})(${i});window.__noRender=false;__tick(1000/30)`);await p.screenshot({path:OUT+name+'/'+String(i).padStart(4,'0')+'.jpg',type:'jpeg',quality:88});}console.log(name,n);};
  const ff=async n=>{for(let i=0;i<n;i++)await p.evaluate('window.__noRender=true;__tick(1000/30)');};
  const until=async(cond,max)=>{for(let i=0;i<max;i++){if(await p.evaluate(cond))return i;await ff(3);}return -1;};
  await p.evaluate(()=>{__T.SET.hide=false;__T.SET.ultra=true;__T.SET.mute=true;__T.SET.police=0;__T.applySet();Object.assign(__T.SET.lo,{veh:'voltra',paint:0x15181e});__T.SET.voltraOpen=true;__T.applyLoadout();__T.startMode('serbest');});await ff(40);
  // 1) statement at the scene and the CCTV of the moment of the hit
  await p.evaluate(()=>{__T.car.v=9;});await ff(25);
  await p.evaluate(()=>{const c=__T.car,ped=__T.PEDS[0];ped.st='walk';ped.g.visible=true;ped.g.position.set(c.pos.x+Math.cos(c.yaw)*2.5,0,c.pos.z+Math.sin(c.yaw)*2.5);__T.accHit(ped,c);__T.ACC.live=true;c.v=0;c.vel.set(0,0,0);});
  await until(()=>!document.getElementById('ifade').hidden,400);
  await rec('ifade',70,`i=>{if(i===20)document.getElementById('ifIn').value='Yaya kırmızı ışıkta aniden önüme çıktı';if(i===45)document.getElementById('ifGo').click();}`);
  await until(()=>__T.ACC.cctv,200);await ff(20);await rec('mobese',120,'()=>{}');
  await until(()=>__T.ACC.st==='off',900);
  // 2) a car hits you on foot: police + ambulance, the driver is arrested
  await p.evaluate(()=>{const c=__T.car;c.v=0;c.vel.set(0,0,0);if(!__T.FOOT.on)__T.footToggle();});await ff(10);
  await p.evaluate(()=>{const F=__T.FOOT,a=__T.TRAF.cars.find(a=>!a.voltra);a.x=F.pos.x+3;a.z=F.pos.z+1;a.v=12;__T.injHit(a,52,true,false);const q=F.pos.clone();window.__camOverride=(P,L,U)=>{const f=window.__f||0,an=.4+f*.004;P.set(q.x+Math.cos(an)*15,6.5,q.z+Math.sin(an)*15);L.set(q.x,1,q.z);U.set(0,1,0);return 4;};});
  await rec('carpma',160,`i=>{window.__f=i;}`,3);await p.evaluate(()=>{window.__camOverride=null;});
  await until(()=>__T.INT.on,500);await p.evaluate(()=>{__T.HOSP.other=true;__T.INTP.pat.visible=true;__T.HOSP.visit={at:.5,done:false};__T.INT.t=0;});
  await rec('yatak',150,'()=>{}',2);
  await p.evaluate(()=>{__T.CB.hp=99.99;});await ff(10);
  await p.evaluate(()=>{__T.HOSP.patient=true;const b=__T.INT.H.beds[1],F=__T.FOOT;F.pos.set(__T.INT.o.x+b[0]-2,300,__T.INT.o.z+b[1]+3.5);F.yaw=-Math.PI/2+.5;__T.INTP.vis.visible=false;});
  await rec('gecmis',90,`i=>{const F=__T.FOOT,b=__T.INT.H.beds[1];__T.keys.gas=i<25?1:0;if(i===40)__T.intGetWell();}`);await p.evaluate(()=>{__T.keys.gas=0;__T.intExit();});await ff(10);
  // 3) police station: cell and interrogation room
  await p.evaluate(()=>{const K=__T.ACC;Object.assign(K,{inside:true,lock:true,st:'arrest'});__T.INT.asked=false;__T.intEnter('kara','cell');});
  await rec('hucre',120,'()=>{}',2);await until(()=>!document.getElementById('ifade').hidden,200);await rec('sorgu',50,'()=>{}');
  await p.evaluate(()=>{document.getElementById('ifade').hidden=true;__T.ACC.ifq=null;__T.intExit();Object.assign(__T.ACC,{inside:false,lock:false,st:'off'});});await ff(20);
  // 4) the turret now shoots the bots too
  await p.evaluate(()=>{const c=__T.car,F=__T.FOOT;c.pos.x=F.pos.x;c.pos.z=F.pos.z+2;if(F.on)__T.footToggle();__T.CB.hp=100;});await ff(10);
  await p.evaluate(()=>{const c=__T.car;window.__camOverride=(P,L,U)=>{const f=window.__f||0,a=2.4+f*.006;P.set(c.pos.x+Math.cos(a)*8,3.4,c.pos.z+Math.sin(a)*8);L.set(c.pos.x,1.4,c.pos.z);U.set(0,1,0);return 99;};__T.cbTurret(true);});
  await rec('bot',150,`i=>{window.__f=i;}`,2);
  console.log('bitti',errs.slice(0,3));await b.close();})().catch(e=>{console.error('FAIL',e.message);process.exit(1);});
