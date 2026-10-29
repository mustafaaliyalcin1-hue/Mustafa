// Deterministic game capture: virtual clock, one rAF tick per video frame (30 fps), JPEG per frame.
const {chromium}=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');const fs=require('fs');
const shot=process.argv[2];const W=1280,H=720,FPS=30;
const SHOTS={
  ramp:{pre:75,n:282,setup:()=>{__T.SET.lo.veh='voltra';__T.SET.voltraOpen=true;__T.SET.lo.paint=0xa50f1d;__T.S.auto=true;__T.S.autoSeq=0;__T.S.cargo=false;__T.startMode('rampa');}},
  chase:{pre:20,n:148,setup:()=>{__T.SET.lo.veh='voltra';__T.SET.voltraOpen=true;__T.SET.lo.paint=0xa50f1d;__T.S.cargo=false;__T.S.auto=false;__T.startMode('serbest');__T.setCamMode(4);__T.keys.gas=1;},
    tick:i=>{__T.keys.boost=i>40&&i<120?1:0;}},
  jramp:{pre:20,n:230,setup:()=>{__T.SET.lo.veh='voltra';__T.SET.lo.paint=0xf2f4f7;__T.S.cargo=false;__T.startMode('serbest');__T.CITY.update(__T.car.pos.x,__T.car.pos.z);
      const r=__T.CITY.ramps.filter(r=>r.kind==='j').sort((a,b)=>Math.hypot(a.ox-__T.car.pos.x,a.oz-__T.car.pos.z)-Math.hypot(b.ox-__T.car.pos.x,b.oz-__T.car.pos.z))[0];
      const c=__T.car;c.pos.set(r.ox-r.dx*26,0,r.oz-r.dz*26);c.yaw=r.a;c.v=17;c.vel.set(r.dx*17,0,r.dz*17);__T.keys.gas=1;},tick:i=>{__T.keys.gas=1;}},
  hwy:{pre:20,n:240,setup:()=>{__T.SET.lo.veh='car';__T.SET.lo.paint=0x2350c4;__T.S.cargo=false;__T.startMode('serbest');
      let r=null;for(let k=0;k<30&&!r;k++){__T.CITY.update(__T.car.pos.x+k*140,__T.car.pos.z);r=__T.CITY.ramps.find(q=>q.kind==='hwy');if(!r){__T.car.pos.x+=140;}}
      const c=__T.car;c.pos.set(r.ox-24,0,r.oz+1.5);c.yaw=0;c.v=20;c.vel.set(20,0,0);__T.CITY.update(c.pos.x,c.pos.z);__T.keys.gas=1;},tick:i=>{__T.keys.gas=1;}},
  police:{pre:10,n:150,setup:()=>{__T.SET.lo.veh='voltra';__T.SET.lo.paint=0x15181e;__T.SET.police=3;__T.S.cargo=false;__T.startMode('serbest');
      const C=__T.CITY,c=__T.car,i0=C.ci(c.pos.x);let J=3;for(let j=3;j<14;j++){if([0,1,2,3,4,5,6,7].every(k=>!C.closedE(i0+k,j,0))){J=j;break;}}
      c.pos.set(C.nx(i0)+10,0,C.nz(J)+1.9);c.yaw=0;c.v=22;c.vel.set(22,0,0);C.update(c.pos.x,c.pos.z);__T.POL.wanted=3;__T.POL.cars.length=0;
      for(let k=0;k<3;k++){const p=__T.polSpawnOne(30,60);p.x=c.pos.x-14-k*9;p.z=c.pos.z+(k%2?3.4:-1.4);p.yaw=0;p.v=24;__T.POL.cars.push(p);}
      const H=__T.HELI;H.on=true;H.leave=false;H.pos.set(c.pos.x-25,26,c.pos.z+6);H.vel.set(22,0,0);
      window.__cap0={x:c.pos.x+95,z:c.pos.z+11};
      window.__camOverride=(dPos,dLook,dUp)=>{const c=__T.car,f=window.__capF||0;if(f<95){dPos.set(window.__cap0.x,4.5,window.__cap0.z);dLook.set(c.pos.x-4,c.pos.y+2.5,c.pos.z);}else{dPos.set(c.pos.x-22,c.pos.y+9,c.pos.z+10);dLook.set(c.pos.x+6,c.pos.y+3,c.pos.z);}dUp.set(0,1,0);return f===95?1000:30;};__T.keys.gas=1;},
    tick:i=>{window.__capF=i;__T.POL.wanted=3;__T.keys.gas=1;__T.keys.boost=i>20&&i<70?1:0;}},
  cargo:{pre:30,n:145,setup:()=>{__T.CAREER.lo.veh='voltra';__T.CAREER.voltra=true;__T.CAREER.lo.paint=0xe3a412;__T.S.cargo=true;__T.startMode('serbest');__T.JOB.wait=0;},
    tick:i=>{const J=__T.JOB,c=__T.car;if(i===2&&J.st==='pick'){const sh=__T.SHOPM.g.position,vert=Math.abs(sh.x-J.x)>Math.abs(sh.z-J.z),dx=vert?0:1,dz=vert?1:0;c.pos.set(J.x-dx*16,0,J.z-dz*16);c.yaw=Math.atan2(dz,dx);c.v=8;c.vel.set(dx*8,0,dz*8);__T.setCamMode(2);}
      __T.keys.gas=0;__T.keys.brake=i>2&&Math.hypot(c.pos.x-J.x,c.pos.z-J.z)<9&&J.st==='pick'?1:0;}},
  moto:{pre:20,n:160,setup:()=>{__T.SET.lo.veh='moto';__T.SET.lo.paint=0xff5a1f;__T.S.cargo=false;__T.startMode('serbest');__T.setCamMode(4);__T.keys.gas=1;},tick:i=>{__T.keys.right=i%80>50?1:0;__T.keys.lift=(i===110)?1:0;}},
  cab:{pre:40,n:112,setup:()=>{__T.SET.lo.veh='voltra';__T.SET.voltraOpen=true;__T.SET.lo.paint=0xa50f1d;__T.S.cargo=false;__T.startMode('serbest');const c=__T.car;__T.apStart('road',false,__T.apDestFromPoint(c.pos.x+260,c.pos.z+150));__T.setCamMode(3);}},
  fly:{pre:20,n:200,setup:()=>{__T.SET.lo.veh='voltra';__T.SET.lo.paint=0xa50f1d;__T.S.cargo=false;__T.startMode('serbest');__T.setCamMode(5);const F=__T.FPV,c=__T.car;F.init=true;F.pos.set(c.pos.x-60,55,c.pos.z+40);F.yaw=Math.atan2(-40,60);F.spd=22;F.vel.set(0,0,0);},
    tick:i=>{const F=__T.FPV;__T.keys.gas=1;__T.keys.boost=i<150?1:0;__T.keys.lift=0;}},
};
(async()=>{const S=SHOTS[shot];if(!S)throw new Error('shot?');const dir=__dirname+'/shots/'+shot;fs.rmSync(dir,{recursive:true,force:true});fs.mkdirSync(dir,{recursive:true});
  const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--disable-background-timer-throttling']});
  const p=await b.newPage({viewport:{width:W,height:H}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.addInitScript(()=>{let T=0;const cbs=[];performance.now=()=>T;window.requestAnimationFrame=cb=>{cbs.push(cb);return cbs.length;};window.__cubeEvery=6;window.__tick=ms=>{T+=ms;const l=cbs.splice(0);for(const cb of l)try{cb(T);}catch(e){console.error(e);}};
    try{localStorage.clear();}catch(_){}});
  await p.goto('http://localhost:8790/cap.html',{waitUntil:'domcontentloaded',timeout:120000});await p.waitForFunction(()=>window.__tepeReady,null,{timeout:120000});
  await p.waitForFunction(()=>__T.TCARS.ready,null,{timeout:60000}).catch(()=>{});
  await p.evaluate(()=>{__T.SET.hide=true;__T.SET.ultra=true;__T.SET.easy=true;__T.SET.police=__T.SET.police||2;__T.applySet();});
  await p.evaluate(`(${S.setup.toString()})()`);
  const tick=S.tick?S.tick.toString():'()=>{}';
  for(let i=0;i<S.pre;i++)await p.evaluate(`(${tick})(${-S.pre+i});__tick(${1000/FPS})`);
  for(let i=0;i<S.n;i++){await p.evaluate(`(${tick})(${i});__tick(${1000/FPS})`);await p.screenshot({path:dir+'/'+String(i).padStart(4,'0')+'.jpg',type:'jpeg',quality:90});
    if(i%50===0)console.log(shot,i,'/',S.n);}
  console.log(shot,'done',errs.slice(0,3));await b.close();})().catch(e=>{console.error('FAIL',shot,e.message);process.exit(1);});
