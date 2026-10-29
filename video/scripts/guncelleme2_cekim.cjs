// Tesla uygulaması güncellemesinin videosu için çekim: sanal saat, video karesi başına bir oyun karesi (30 fps), her sahne ayrı klasöre JPEG.
const {chromium}=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');const fs=require('fs');
const shot=process.argv[2],PAGE=process.argv[3]||'http://localhost:8790/cap2.html';const W=1280,H=720,FPS=30;
const _base=lo=>()=>{__T.SET.voltraOpen=true;Object.assign(__T.SET.lo,{veh:'voltra',paint:0xa50f1d,kit:0,rimT:0,spT:0,neon:-1,fin:0,rimCol:-2,spCol:-1,kitCol:0x1a1b1e},lo||{});__T.S.cargo=false;__T.S.auto=false;};
const SHOTS={
  // arabadan in, uygulamayı aç, koşarak uzaklaş: araba kendini kilitler
  app:{pre:20,n:120,setup:()=>{__T.SET.lo.veh='voltra';__T.SET.voltraOpen=true;__T.SET.lo.paint=0xa50f1d;__T.S.cargo=false;__T.startMode('serbest');window.__camOverride=null;},
    tick:i=>{const F=__T.FOOT;if(i===-12){__T.car.v=0;__T.car.vel.set(0,0,0);__T.footToggle();}if(i===-6){__T.tappOpen(true);F.yaw=-.35;F.cam=-.35;}if(i===8){F.run=true;}__T.keys.gas=i>=8&&i<95?1:0;if(i>40)F.yaw=0;}},
  // Hey Tesla, gel beni buradan al: boş araba kendi kendine gelir
  cagir:{pre:20,n:240,setup:()=>{__T.SET.lo.veh='voltra';__T.SET.voltraOpen=true;__T.SET.lo.paint=0xa50f1d;__T.S.cargo=false;__T.startMode('serbest');window.__camOverride=null;__T.AP.spd=1;},
    tick:i=>{const F=__T.FOOT,C=__T.CITY;if(i===-15){__T.car.v=0;__T.car.vel.set(0,0,0);__T.footToggle();F.pos.set(C.nx(1)+34,0,C.nz(3)+8.6);F.yaw=Math.PI+.25;F.cam=F.yaw;__T.tappOpen(true);}
      if(i>=8&&i<26)__T.askShow('Dinliyorum…','listen');if(i>=26&&i<52)__T.askShow('Hey Tesla, gel beni buradan al','me');if(i===52){__T.askCommand('gel beni buradan al');window.__say=document.getElementById('askTxt').textContent;}
      if(i>52&&i<130)__T.askShow(window.__say,'tesla');if(i===130)document.getElementById('askBox').hidden=true;
      const c=__T.car;if(i>60){const a=Math.atan2(c.pos.z-F.pos.z,c.pos.x-F.pos.x);F.yaw=a;}}},
  // arabadayken: beni eve götür
  eve:{pre:20,n:160,setup:()=>{__T.SET.lo.veh='voltra';__T.SET.voltraOpen=true;__T.SET.lo.paint=0xa50f1d;__T.S.cargo=false;__T.startMode('serbest');window.__camOverride=null;__T.AP.spd=2;
      const c=__T.car;c.pos.x+=280;c.v=0;c.vel.set(0,0,0);__T.CITY.update(c.pos.x,c.pos.z);},
    tick:i=>{if(i>=4&&i<30)__T.askShow('Hey Tesla, beni eve götür','me');if(i===30){__T.askCommand('beni eve götür');window.__say=document.getElementById('askTxt').textContent;}if(i>30&&i<110)__T.askShow(window.__say,'tesla');if(i===110)document.getElementById('askBox').hidden=true;}},
  // arabadan in, "eve git": araba sensiz gider
  yalniz:{pre:20,n:170,setup:()=>{__T.SET.lo.veh='voltra';__T.SET.voltraOpen=true;__T.SET.lo.paint=0xa50f1d;__T.S.cargo=false;__T.startMode('serbest');window.__camOverride=null;__T.AP.spd=1;
      const c=__T.car;c.pos.x+=280;c.v=0;c.vel.set(0,0,0);__T.CITY.update(c.pos.x,c.pos.z);},
    tick:i=>{const F=__T.FOOT,c=__T.car;if(i===-14){__T.footToggle();F.pos.set(c.pos.x-5,0,c.pos.z+4.5);F.yaw=Math.atan2(c.pos.z-F.pos.z,c.pos.x-F.pos.x);F.cam=F.yaw;window.__F0=F.pos.clone();
        window.__camOverride=(P,L,U)=>{const q=window.__F0,c=__T.car;P.set(q.x-4.5,2.6,q.z+2.2);L.set(c.pos.x*.6+q.x*.4,1.1,c.pos.z*.6+q.z*.4);U.set(0,1,0);return 5;};}
      if(i>=6&&i<32)__T.askShow('Hey Tesla, eve git','me');if(i===32){__T.askCommand('eve git');window.__say=document.getElementById('askTxt').textContent;}if(i>32&&i<120)__T.askShow(window.__say,'tesla');if(i===120)document.getElementById('askBox').hidden=true;
      if(i>40){F.yaw=Math.atan2(c.pos.z-F.pos.z,c.pos.x-F.pos.x);}}},
};
(async()=>{const S=SHOTS[shot];if(!S)throw new Error('shot?');const dir=__dirname+'/../public/guncelleme2/'+shot;fs.rmSync(dir,{recursive:true,force:true});fs.mkdirSync(dir,{recursive:true});
  const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--disable-background-timer-throttling']});
  const p=await b.newPage({viewport:{width:W,height:H}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
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
