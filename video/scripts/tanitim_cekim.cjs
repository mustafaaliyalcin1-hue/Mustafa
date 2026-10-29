// Tanıtım videosu çekimi: sanal saat, video karesi başına bir oyun karesi (30 fps), her sahne ayrı klasöre JPEG.
const {chromium}=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');const fs=require('fs');
const shot=process.argv[2],PAGE=process.argv[3]||'http://localhost:8790/cap2.html';const W=1280,H=720,FPS=30;
const base=lo=>()=>{__T.SET.voltraOpen=true;Object.assign(__T.SET.lo,{veh:'voltra',paint:0xa50f1d,kit:0,rimT:0,spT:0,neon:-1,fin:0,rimCol:-2,spCol:-1,kitCol:0x1a1b1e},lo||{});__T.S.cargo=false;__T.S.auto=false;};
const SHOTS={
  // İstanbul Boğazı: köprüye giriş, alçak drone kamerası
  bogaz:{pre:20,n:150,setup:()=>{__T.SET.lo.veh='voltra';__T.SET.voltraOpen=true;__T.SET.lo.paint=0xf2f4f7;__T.S.cargo=false;__T.startMode('serbest');const c=__T.car,C=__T.CITY;
      __T.SET.safety=false;c.pos.set(C.nx(0)+2.6,0,C.nz(6)-50);c.yaw=Math.PI/2;c.v=20;c.vel.set(0,0,20);C.update(c.pos.x,c.pos.z);for(const b of __T.TRAF.cars)if(Math.abs(b.x-c.pos.x)<12)b.x+=300;
      window.__camOverride=(P,L,U)=>{const c=__T.car,f=window.__f||0;P.set(c.pos.x-22+f*.04,9+f*.05,c.pos.z-24);L.set(c.pos.x,2,c.pos.z+26);U.set(0,1,0);return 6;};},
    tick:i=>{window.__f=i;__T.keys.gas=1;const c=__T.car;__T.keys.left=c.yaw>Math.PI/2+.02?1:0;__T.keys.right=c.yaw<Math.PI/2-.02?1:0;}},
  // araç asansörü: park et, 3 sn bekle, aşağı in
  asansor:{pre:4,n:165,setup:()=>{__T.SET.lo.veh='voltra';__T.SET.voltraOpen=true;__T.SET.lo.paint=0x2350c4;__T.S.cargo=false;__T.startMode('serbest');const c=__T.car,E=__T.elevList(1,1,3,3)[0];
      c.pos.set(E.x,0,E.z);c.yaw=E.yaw;c.v=0;c.vel.set(0,0,0);__T.ELEV.t=0;__T.ELEV.wait=.9;
      window.__camOverride=(P,L,U)=>{const f=window.__f||0,a=.9+f*.004;P.set(E.x+Math.cos(a)*9,3.2+f*.01,E.z+Math.sin(a)*9+ (E.sg>0?-3:3));L.set(E.x,.4,E.z);U.set(0,1,0);return 8;};},
    tick:i=>{window.__f=i;__T.keys.gas=0;}},
  // tünel: il seçimi + Hey Tesla + hyperloop
  tunel:{pre:8,n:190,setup:()=>{__T.SET.lo.veh='voltra';__T.SET.voltraOpen=true;__T.SET.lo.paint=0x2350c4;__T.S.cargo=false;__T.startMode('serbest');const c=__T.car,E=__T.elevList(1,1,3,3)[0];
      c.pos.set(E.x,0,E.z);c.yaw=E.yaw;c.v=0;c.vel.set(0,0,0);__T.ELEV.t=0;__T.ELEV.wait=2.99;window.__camOverride=null;},
    tick:i=>{const T=__T.TUN;if(i<0&&T.ph==='down'){T.t=3.19;}
      if(i===38){__T.askShow('Hey Tesla, beni Trabzon\'a götür','me');}
      if(i===62){__T.askCommand('beni Trabzon\'a götür');window.__say='Tamam, Trabzon yönüne gidiyoruz.';}
      if(i>62&&i<120)__T.askShow(window.__say,'tesla');if(i===120)document.getElementById('askBox').hidden=true;
      if(T.ph==='ride'&&T.t>T.dur-6)T.t=T.dur-6;}},
  // varış: Trabzon'da asansörden çıkış
  varis:{pre:6,n:110,setup:()=>{__T.SET.lo.veh='voltra';__T.SET.voltraOpen=true;__T.SET.lo.paint=0x2350c4;__T.S.cargo=false;__T.startMode('serbest');const c=__T.car,E=__T.elevList(1,1,3,3)[0];
      c.pos.set(E.x,0,E.z);c.yaw=E.yaw;__T.ELEV.t=0;__T.ELEV.wait=2.99;window.__camOverride=null;},
    tick:i=>{const T=__T.TUN;if(T.ph==='down')T.t=3.19;if(T.ph==='pick')__T.tunGo(__T.IL.by(61));if(T.ph==='ride')T.t=T.dur-.02;
      if(T.ph==='up'||(!T.on&&i>0)){const E=T.pad&&T.pad.spot;if(E&&!window.__E)window.__E={x:E.x,z:E.z};}
      window.__f=i;if(window.__E&&!window.__camOverride){const E=window.__E;window.__camOverride=(P,L,U)=>{const f=window.__f;P.set(E.x+8-f*.02,2.4+f*.02,E.z-7);L.set(E.x,__T.car.pos.y+1,E.z);U.set(0,1,0);return 10;};}}},
  // Hey Tesla: köfteciye götür (iç kamera)
  tesla:{pre:30,n:150,setup:()=>{__T.SET.lo.veh='voltra';__T.SET.voltraOpen=true;__T.SET.lo.paint=0xa50f1d;__T.S.cargo=false;__T.startMode('serbest');__T.setCamMode(3);window.__camOverride=null;},
    tick:i=>{if(i===5)__T.askShow('Dinliyorum…','listen');if(i===25)__T.askShow('Hey Tesla, beni en yakın köfteciye götür','me');if(i>5&&i<25)__T.askShow('Dinliyorum…','listen');if(i>25&&i<52)__T.askShow('Hey Tesla, beni en yakın köfteciye götür','me');
      if(i===52){__T.askCommand('beni en yakın köfteciye götür');window.__say=document.getElementById('askTxt').textContent;}if(i>52&&i<140)__T.askShow(window.__say,'tesla');if(i===60)__T.AP.spd=2;}},
  // yaya geçidi: kırmızıda karşıya geçenler
  yaya:{pre:260,n:110,setup:()=>{__T.SET.lo.veh='voltra';__T.SET.voltraOpen=true;__T.SET.lo.paint=0xf2f4f7;__T.S.cargo=false;__T.startMode('serbest');window.__camOverride=null;__T.keys.gas=0;},
    tick:i=>{if(i===0){const P=__T.PEDS.filter(p=>p.st==='walk'||p.st==='wait').sort((a,b)=>(b.st==='walk')-(a.st==='walk'))[0];if(P){const g=P.g,dx=P.bx-P.ax,dz=P.bz-P.az,l=Math.hypot(dx,dz),nx=-dz/l,nz=dx/l,mx=(P.ax+P.bx)/2,mz=(P.az+P.bz)/2;
        window.__camOverride=(Pp,L,U)=>{const f=window.__f;Pp.set(mx+nx*13+dx/l*(f*.02),2.2,mz+nz*13+dz/l*(f*.02));L.set(mx,1.1,mz);U.set(0,1,0);return 8;};
        for(const q of __T.PEDS)if(q!==P&&q.st!=='off'){}}}window.__f=i;}},
  // kaza önleme: duran arabaya doğru, yan iticiyle kaçış
  kaza:{pre:6,n:100,setup:()=>{__T.SET.lo.veh='voltra';__T.SET.voltraOpen=true;__T.SET.lo.paint=0xf2f4f7;__T.SET.safety=true;__T.S.cargo=false;__T.startMode('serbest');const c=__T.car,C=__T.CITY,a=__T.TRAF.cars[0];
      const x=C.nx(1)+4,z=C.nz(3)+1.9;c.pos.set(x,0,z);c.yaw=0;c.v=27;c.vel.set(27,0,0);a.x=x+78;a.z=z;a.yaw=0;a.v=0;a.cruise=0;a.seg={t:'s',x0:a.x,z0:a.z,x1:a.x+200,z1:a.z,len:200};a.s=0;window.__A=a;window.__ax=a.x;
      for(const b of __T.TRAF.cars)if(b!==a&&Math.abs(b.z-z)<10&&b.x>x-20&&b.x<x+120){b.x+=400;}
      window.__camOverride=(P,L,U)=>{const c=__T.car;P.set(c.pos.x-9,3.4,c.pos.z+3);L.set(c.pos.x+22,1,c.pos.z-1);U.set(0,1,0);return 14;};},
    tick:i=>{const a=window.__A,c=__T.car;a.v=0;a.cruise=0;a.s=0;a.x=window.__ax;const past=c.pos.x>window.__ax+8;__T.keys.gas=past?0:1;__T.keys.brake=past?1:0;__T.keys.left=c.yaw>.04?1:0;__T.keys.right=c.yaw<-.04?1:0;}},
  // arabadan in, koş, restorana gir
  yuru:{pre:20,n:130,setup:()=>{__T.SET.lo.veh='voltra';__T.SET.voltraOpen=true;__T.SET.lo.paint=0xa50f1d;__T.S.cargo=false;__T.startMode('serbest');window.__camOverride=null;},
    tick:i=>{const F=__T.FOOT,c=__T.car;if(i===-15){__T.REST.t=0;}if(i===-5){const r=__T.REST.list[0];window.__R=r;const ax=-r.nz,az=r.nx;c.pos.set(r.door.x-r.nx*3.2+ax*16,0,r.door.z-r.nz*3.2+az*16);c.yaw=Math.atan2(-az,-ax);c.v=0;c.vel.set(0,0,0);}
      if(i===10)__T.footToggle();if(i===30)__T.footRun();const r=window.__R;
      if(F.on&&r){const tx=r.door.x,tz=r.door.z,dx=tx-F.pos.x,dz=tz-F.pos.z;F.yaw=Math.atan2(dz,dx);__T.keys.gas=Math.hypot(dx,dz)>1.2?1:0;}}},
  // modifiye: döner platform, parçalar değişiyor
  modif:{pre:10,n:200,setup:()=>{__T.SET.lo.veh='car';__T.S.cargo=false;__T.startMode('serbest');const c=__T.car;c.v=0;c.vel.set(0,0,0);
      window.__camOverride=(P,L,U)=>{const c=__T.car,f=window.__f||0,a=f*.035+2.4,r=6.2;P.set(c.pos.x+Math.cos(a)*r,1.7,c.pos.z+Math.sin(a)*r);L.set(c.pos.x,.7,c.pos.z);U.set(0,1,0);return 30;};},
    tick:i=>{window.__f=i;const L=[[{veh:'car',paint:0x2350c4,kit:2,kitCol:0x111214,rimT:5,rimCol:0xd4af37,spT:3,spCol:0x111214,fin:1,neon:0x00e5ff}],[{veh:'car',paint:0x7ac143,kit:3,kitCol:0x111214,rimT:3,rimCol:0xffffff,spT:1,spCol:-1,fin:2,neon:-1}],
      [{veh:'car',paint:0xff4fa3,kit:4,kitCol:-1,rimT:4,rimCol:0xffffff,spT:4,spCol:0xffffff,fin:4,neon:0xff2fd0}],[{veh:'voltra',paint:0xffffff,kit:4,kitCol:-1,rimT:1,rimCol:0xff5a1f,spT:2,spCol:0x111214,fin:4,neon:0xff2fd0}],
      [{veh:'voltra',paint:0x111214,kit:2,kitCol:0xd62828,rimT:2,rimCol:0xd62828,spT:3,spCol:0xd62828,fin:2,neon:0xff3b30}],[{veh:'moto',paint:0x15181e,kit:2,kitCol:0xffd60a,rimT:2,rimCol:0xd62828,spT:2,spCol:0xffd60a,fin:3,neon:0x39ff6a}],
      [{veh:'car',paint:0xd4af37,kit:1,kitCol:0x111214,rimT:5,rimCol:0x111214,spT:2,spCol:0x111214,fin:3,neon:0xffe14d}]];
      if(i%30===0||i===-10){const k=Math.max(0,Math.floor(i/30))%L.length;Object.assign(__T.SET.lo,L[k][0]);__T.SET.voltraOpen=true;__T.applyLoadout();const c=__T.car;c.v=0;c.vel.set(0,0,0);}}},
};
(async()=>{const S=SHOTS[shot];if(!S)throw new Error('shot?');const dir=__dirname+'/../public/tanitim/'+shot;fs.rmSync(dir,{recursive:true,force:true});fs.mkdirSync(dir,{recursive:true});
  const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--disable-background-timer-throttling']});
  const p=await b.newPage({viewport:{width:W,height:H}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.addInitScript(()=>{let T=0;const cbs=[];performance.now=()=>T;window.requestAnimationFrame=cb=>{cbs.push(cb);return cbs.length;};window.__cubeEvery=6;window.__tick=ms=>{T+=ms;const l=cbs.splice(0);for(const cb of l)try{cb(T);}catch(e){console.error(e);}};
    try{localStorage.clear();}catch(_){}});
  await p.goto(PAGE,{waitUntil:'domcontentloaded',timeout:120000});await p.waitForFunction(()=>window.__tepeReady,null,{timeout:120000});
  await p.waitForFunction(()=>__T.TCARS.ready,null,{timeout:60000}).catch(()=>{});
  await p.evaluate(()=>{__T.SET.hide=true;__T.SET.ultra=true;__T.SET.mute=true;__T.applySet();});
  await p.evaluate(`(${S.setup.toString()})()`);
  const tick=S.tick?S.tick.toString():'()=>{}';
  for(let i=0;i<S.pre;i++)await p.evaluate(`(${tick})(${-S.pre+i});__tick(${1000/FPS})`);
  for(let i=0;i<S.n;i++){await p.evaluate(`(${tick})(${i});__tick(${1000/FPS})`);await p.screenshot({path:dir+'/'+String(i).padStart(4,'0')+'.jpg',type:'jpeg',quality:88});
    if(i%50===0)console.log(shot,i,'/',S.n);}
  console.log(shot,'done',errs.slice(0,3));await b.close();})().catch(e=>{console.error('FAIL',shot,e.message);process.exit(1);});
