// Taksi + telefon tuşları güncellemesinin videosu için çekim: sanal saat, video karesi başına bir oyun karesi (30 fps), her sahne ayrı klasöre JPEG.
const {chromium}=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');const fs=require('fs');
const shot=process.argv[2],PAGE=process.argv[3]||'http://localhost:8790/cap2.html';const W=1280,H=720,FPS=30;
const _base=lo=>()=>{__T.SET.voltraOpen=true;Object.assign(__T.SET.lo,{veh:'voltra',paint:0xa50f1d,kit:0,rimT:0,spT:0,neon:-1,fin:0,rimCol:-2,spCol:-1,kitCol:0x1a1b1e},lo||{});__T.S.cargo=false;__T.S.auto=false;};
const SHOTS={
  // telefon: dokunmatik tuşlar ve Tesla uygulaması (mobil görünüm)
  telefon:{mobile:true,pre:20,n:90,setup:()=>{__T.SET.lo.veh='voltra';__T.SET.voltraOpen=true;__T.SET.lo.paint=0xa50f1d;__T.S.cargo=false;__T.startMode('serbest');window.__camOverride=null;},
    tick:i=>{const F=__T.FOOT;if(i===-12){__T.car.v=0;__T.car.vel.set(0,0,0);__T.footToggle();F.yaw=-.3;F.cam=-.3;}if(i===-4)__T.tappOpen(true);
      const tap=(id)=>{const b=document.getElementById(id);b.classList.add('on');setTimeout(()=>b.classList.remove('on'),400);};if(i===30)__T.TAPP.flashT=1;if(i===55){document.getElementById('taLock').click();}}},
  // Hey Tesla, bana taksi çağır: taksi gelir
  tcagir:{pre:20,n:200,setup:()=>{__T.SET.lo.veh='voltra';__T.SET.voltraOpen=true;__T.SET.lo.paint=0xa50f1d;__T.S.cargo=false;__T.startMode('serbest');window.__camOverride=null;},
    tick:i=>{const F=__T.FOOT,T=__T.TAXI;if(i===-12){__T.car.v=0;__T.car.vel.set(0,0,0);__T.footToggle();F.pos.x+=6;}
      if(i>=4&&i<22)__T.askShow('Dinliyorum…','listen');if(i>=22&&i<46)__T.askShow('Hey Tesla, bana taksi çağır','me');if(i===46){__T.taxiCall(null,110);window.__say=document.getElementById('askTxt').textContent;T.s=Math.max(T.s,T.L[T.L.length-1]-75);}
      if(i>46&&i<120)__T.askShow(window.__say,'tesla');if(i===120)document.getElementById('askBox').hidden=true;
      if(T.st!=='off'){const a=Math.atan2(T.pos.z-F.pos.z,T.pos.x-F.pos.x);F.yaw=a;}
      if(T.st==='wait'&&!window.__w){window.__w=i;}if(window.__w&&i===window.__w+25){F.pos.set(T.pos.x-Math.sin(T.yaw)*2.2,0,T.pos.z+Math.cos(T.yaw)*2.2);__T.footToggle();}}},
  // taksiye bin, "beni dönerciye götür"
  tbin:{pre:20,n:210,setup:()=>{__T.SET.lo.veh='voltra';__T.SET.voltraOpen=true;__T.SET.lo.paint=0xa50f1d;__T.S.cargo=false;__T.startMode('serbest');window.__camOverride=null;},
    tick:i=>{const F=__T.FOOT,T=__T.TAXI;if(i===-16){__T.car.v=0;__T.car.vel.set(0,0,0);__T.footToggle();__T.taxiCall(null,60);}
      if(i<0&&T.st==='come'){T.s=T.L[T.L.length-1]-.2;T.v=0;}if(i<0&&T.st==='wait'&&!F.inTaxi){F.pos.set(T.pos.x+1,0,T.pos.z+1);__T.footToggle();}
      if(i>=10&&i<36)__T.askShow('Hey Tesla, beni en yakın dönerciye götür','me');if(i===36){__T.askCommand('beni en yakın dönerciye götür');window.__say=document.getElementById('askTxt').textContent;}
      if(i>36&&i<120)__T.askShow(window.__say,'tesla');if(i===120)document.getElementById('askBox').hidden=true;}},
};
(async()=>{const S=SHOTS[shot];if(!S)throw new Error('shot?');const dir=__dirname+'/../public/guncelleme3/'+shot;fs.rmSync(dir,{recursive:true,force:true});fs.mkdirSync(dir,{recursive:true});
  const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--disable-background-timer-throttling']});
  const ctx=await b.newContext(S.mobile?{viewport:{width:W,height:H},isMobile:true,hasTouch:true}:{viewport:{width:W,height:H}});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.addInitScript(()=>{let T=0;const cbs=[];performance.now=()=>T;window.requestAnimationFrame=cb=>{cbs.push(cb);return cbs.length;};window.__cubeEvery=6;window.__tick=ms=>{T+=ms;const l=cbs.splice(0);for(const cb of l)try{cb(T);}catch(e){console.error(e);}};
    try{localStorage.clear();}catch(_){}});
  await p.goto(PAGE,{waitUntil:'domcontentloaded',timeout:120000});await p.waitForFunction(()=>window.__tepeReady,null,{timeout:120000});
  await p.waitForFunction(()=>__T.TCARS.ready,null,{timeout:60000}).catch(()=>{});
  await p.evaluate(()=>{__T.SET.hide=false;__T.SET.ultra=true;__T.SET.mute=true;__T.applySet();});
  await p.evaluate(`(${S.setup.toString()})()`);
  const tick=S.tick?S.tick.toString():'()=>{}';
  for(let i=0;i<S.pre;i++)await p.evaluate(`(${tick})(${-S.pre+i});__tick(${1000/FPS})`);
  for(let i=0;i<S.n;i++){await p.evaluate(`(${tick})(${i});__tick(${1000/FPS})`);await p.screenshot({path:dir+'/'+String(i).padStart(4,'0')+'.jpg',type:'jpeg',quality:88});
    if(i%50===0)console.log(shot,i,'/',S.n);}
  console.log(shot,'done',errs.slice(0,3));await b.close();})().catch(e=>{console.error('FAIL',shot,e.message);process.exit(1);});
