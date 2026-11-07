// Türkçe tanıtım (1920x1080) için oyundan sahne sahne çekim (dosya adı ilk plandan kaldı). Kullanım: node almanca_cekim.cjs a|b|c|d (d: kıyafet sahnesini yeniden çeker)
// a: drone, rampa, polis, şehir, kale, taret · b: yürüme, restoran, kıyafet, berber, hastane, 112 görevi, haber · c: havalimanı, kabin, uçuş
const {chromium}=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');const fs=require('fs');
const PAGE='http://localhost:8790/cap2.html',W=1920,H=1080,OUT=__dirname+'/../public/almanca/',which=process.argv[2];
(async()=>{fs.mkdirSync(OUT,{recursive:true});const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--disable-background-timer-throttling']});
  const p=await b.newPage({viewport:{width:W,height:H}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.addInitScript(()=>{let T=0;const cbs=[];performance.now=()=>T;window.requestAnimationFrame=cb=>{cbs.push(cb);return cbs.length;};window.__cubeEvery=4;window.__noAO=true;window.__tick=ms=>{T+=ms;const l=cbs.splice(0);for(const cb of l)try{cb(T);}catch(e){console.error(e);}};try{localStorage.clear();}catch(_){}});
  await p.goto(PAGE,{waitUntil:'domcontentloaded',timeout:180000});await p.waitForFunction(()=>window.__tepeReady,null,{timeout:180000});
  await p.waitForFunction(()=>__T.TCARS.ready,null,{timeout:60000}).catch(()=>{});
  await p.addStyleTag({content:'body.noui *{visibility:hidden!important}body.noui #c{visibility:visible!important}'});
  const ui=on=>p.evaluate(on=>document.body.classList.toggle('noui',!on),on);
  const rec=async(name,n,each,stride=1)=>{fs.rmSync(OUT+name,{recursive:true,force:true});fs.mkdirSync(OUT+name,{recursive:true});
    for(let i=0;i<n;i++){for(let s=0;s<stride-1;s++)await p.evaluate(`(${each||'()=>{}'})(${i});window.__noRender=true;__tick(1000/30)`);
      await p.evaluate(`(${each||'()=>{}'})(${i});window.__noRender=false;__tick(1000/30)`);await p.screenshot({path:OUT+name+'/'+String(i).padStart(4,'0')+'.jpg',type:'jpeg',quality:92});
      if(i%40===0)console.log(name,i,'/',n);}console.log(name,'ok');};
  const ff=async n=>{for(let i=0;i<n;i++)await p.evaluate('window.__noRender=true;__tick(1000/30)');};
  const start=async(lo,extra)=>{await p.evaluate(([lo,extra])=>{window.__camOverride=null;Object.assign(__T.SET,{hide:true,ultra:true,mute:true,police:0,easy:true,voltraOpen:true});__T.applySet();Object.assign(__T.SET.lo,lo);__T.applyLoadout();__T.S.cargo=false;__T.S.auto=false;
    for(const k in __T.keys)__T.keys[k]=0;if(extra==='rampa'){__T.S.auto=true;__T.S.autoSeq=0;__T.startMode('rampa');}else __T.startMode('serbest');if(__T.NACC)__T.NACC.next=1e9;},[lo,extra]);};
  await ui(false);
  if(which==='a'){
    // drone flight over the new city
    await start({veh:'voltra',paint:0xa50f1d});await ff(10);
    await p.evaluate(()=>{__T.setCamMode(5);const F=__T.FPV,c=__T.car;F.init=true;F.pos.set(c.pos.x-60,48,c.pos.z+40);F.yaw=Math.atan2(-40,60);F.spd=18;F.vel.set(0,0,0);});await ff(20);
    await rec('flug',280,`i=>{__T.keys.gas=1;__T.keys.boost=i>60&&i<200?1:0;__T.keys.lift=0;}`);
    // ramp stunts (ceiling, loops)
    await start({veh:'voltra',paint:0xa50f1d},'rampa');await ff(75);
    await rec('rampe',170,`i=>{}`);
    // police chase with helicopter
    await start({veh:'voltra',paint:0x15181e});await ff(10);
    await p.evaluate(()=>{__T.SET.police=3;__T.applySet();const C=__T.CITY,c=__T.car,i0=C.ci(c.pos.x);let J=3;for(let j=3;j<14;j++){if([0,1,2,3,4,5,6,7].every(k=>!C.closedE(i0+k,j,0))){J=j;break;}}
      c.pos.set(C.nx(i0)+10,0,C.nz(J)+1.9);c.yaw=0;c.v=22;c.vel.set(22,0,0);C.update(c.pos.x,c.pos.z);__T.POL.wanted=3;__T.POL.cars.length=0;
      for(let k=0;k<3;k++){const q=__T.polSpawnOne(30,60);q.x=c.pos.x-14-k*9;q.z=c.pos.z+(k%2?3.4:-1.4);q.yaw=0;q.v=24;__T.POL.cars.push(q);}
      const Hh=__T.HELI;Hh.on=true;Hh.leave=false;Hh.pos.set(c.pos.x-25,26,c.pos.z+6);Hh.vel.set(22,0,0);window.__cap0={x:c.pos.x+80,z:c.pos.z+11};
      window.__camOverride=(dPos,dLook,dUp)=>{const c=__T.car,f=window.__capF||0;if(f<80){dPos.set(window.__cap0.x,4.5,window.__cap0.z);dLook.set(c.pos.x-4,c.pos.y+2.5,c.pos.z);}else{dPos.set(c.pos.x-22,c.pos.y+9,c.pos.z+10);dLook.set(c.pos.x+6,c.pos.y+3,c.pos.z);}dUp.set(0,1,0);return f===80?1000:30;};});
    await rec('polizei',168,`i=>{window.__capF=i;__T.POL.wanted=3;__T.keys.gas=1;__T.keys.boost=i>20&&i<70?1:0;}`);
    await p.evaluate(()=>{window.__camOverride=null;__T.POL.wanted=0;__T.POL.cars.length=0;__T.HELI.on=false;__T.SET.police=0;__T.applySet();});
    // city street: new facades, glass, asphalt, sidewalks (low tracking shot beside the car)
    await start({veh:'car',paint:0xf2f4f7});await ff(10);
    await p.evaluate(()=>{const c=__T.car;__T.apStart('road',false,__T.apDestFromPoint(c.pos.x+420,c.pos.z));
      window.__camOverride=(P,L,U)=>{const c=__T.car,fx=Math.cos(c.yaw),fz=Math.sin(c.yaw);P.set(c.pos.x-fx*7.5-fz*3.2,1.9,c.pos.z-fz*7.5+fx*3.2);L.set(c.pos.x+fx*12,2.4,c.pos.z+fz*12);U.set(0,1,0);return 6;};});await ff(60);
    await rec('stadt',112,`i=>{}`);
    await p.evaluate(()=>{window.__camOverride=null;__T.apStop&&__T.apStop();});
    // Harput castle orbit (Elazığ)
    await start({veh:'voltra',paint:0x15181e});await ff(5);
    await p.evaluate(()=>{__T.ilApply(23,__T.CITY.seed);const s=__T.landSpots().find(q=>q.d.id==='harput'),c=__T.car;c.pos.x=s.cx+40;c.pos.z=__T.CITY.nz(s.j+1);
      window.__camOverride=(P,L,U)=>{const f=window.__f||0,a=.5+f*.007,r=58-f*.1;P.set(s.cx+Math.cos(a)*r,30-f*.06,s.cz+Math.sin(a)*r);L.set(s.cx,7,s.cz);U.set(0,1,0);return 99;};});
    await ff(20);await rec('burg',130,`i=>{window.__f=i;}`);
    // Voltra R turret: minigun, laser, rockets
    await start({veh:'voltra',paint:0x15181e});await ff(10);
    await p.evaluate(()=>{const c=__T.car,F=__T.FOOT,d=__T.DUMMY[1];c.pos.x=d.x-26;c.pos.z=d.z+8;c.yaw=0;c.v=0;c.vel.set(0,0,0);F.pos.set(c.pos.x,0,c.pos.z+1.6);__T.footToggle();
      window.__camOverride=(P,L,U)=>{const f=window.__f||0,a=2.3+f*.004;P.set(c.pos.x+Math.cos(a)*7.5,3.2,c.pos.z+Math.sin(a)*7.5);L.set(c.pos.x+3,1.4,c.pos.z-2);U.set(0,1,0);return 99;};});await ff(10);
    await rec('turm',170,`i=>{window.__f=i;if(i===2)__T.cbTurret(true);if(i===60){__T.turMode('laser');__T.DUMMY.forEach(d=>{d.hp=100;d.down=0;d.g.rotation.z=0;});}if(i===115){__T.turMode('rpg');__T.DUMMY.forEach(d=>{d.hp=100;d.down=0;d.g.rotation.z=0;});}}`);
  }
  if(which==='b'){
    await start({veh:'kartal',paint:0xff5a1f});await ff(30);
    await p.evaluate(()=>{const L=__T.LOOK;Object.assign(L,{pat:'ekose',c1:0xe63946,c2:0x111111,pants:0x1b263b,hair:'yan',hairC:0x2b1d14,beard:'yok'});__T.heroApply();__T.car.v=0;__T.footToggle();});await ff(10);
    // on foot: orbit round the new character
    await p.evaluate(()=>{window.__camOverride=(P,L,U)=>{const F=__T.FOOT.pos,f=window.__f||0,a=__T.FOOT.yaw+Math.PI*.75+f*.02;P.set(F.x+Math.cos(a)*3.6,1.7,F.z+Math.sin(a)*3.6);L.set(F.x,1.15,F.z);U.set(0,1,0);return 99;};});
    await rec('fuss',112,`i=>{window.__f=i;}`);await p.evaluate(()=>{window.__camOverride=null;});
    // restaurant: walk in, sit, eat
    await p.evaluate(()=>{__T.LIFE.hun=25;__T.bldEnter('rest',__T.REST.list[0]);});await ff(5);
    await rec('restaurant',150,`i=>{const F=__T.FOOT,o=__T.INT.o;if(i<55){F.pos.set(o.x+Math.sin(i*.03)*.3,__T.INT.Y,o.z+5.4-i*.13);F.yaw=-Math.PI/2;}
      if(i===55){const r=__T.INT.shop;__T.menuPick(__T.MENUS[r.kind][0]);__T.BLDS.eat.dur=3.2;}}`);
    await ff(20);await p.evaluate(()=>{__T.FOOT.pos.z=__T.INT.o.z+7;});await ff(5);
    // clothes shop: patterns change on the character, then a printed photo
    await p.evaluate(()=>{const r=__T.storeIn(-30,30,-30,30).find(q=>q.kind==='giyim');__T.bldEnter('giyim',r);const w=__T.INT.o;__T.FOOT.pos.set(w.x,__T.INT.Y,w.z-2.6);__T.FOOT.yaw=-Math.PI/2;__T.lookOpen('tisort');
      window.__camOverride=(P,L,U)=>{const F=__T.FOOT.pos,y=__T.FOOT.yaw,fx=Math.cos(y),fz=Math.sin(y);P.set(F.x+fx*2.7,F.y+1.45,F.z+fz*2.7);L.set(F.x,F.y+1.15,F.z);U.set(0,1,0);return 99;};});await ff(5);
    const mk=`(()=>{const c=document.createElement('canvas');c.width=c.height=240;const g=c.getContext('2d');const gr=g.createLinearGradient(0,0,240,240);gr.addColorStop(0,'#ff3b4e');gr.addColorStop(1,'#ffd34d');g.fillStyle=gr;g.fillRect(0,0,240,240);g.fillStyle='#111';g.font='900 70px sans-serif';g.textAlign='center';g.fillText('TEPE',120,110);g.fillText('TAKLAK',120,185);return c.toDataURL();})()`;
    await rec('mode',150,`i=>{const P=[['cizgi',0x1d3557,0xf1faee],['ekose',0xe63946,0x111111],['kamu',0x3a5a40,0x8d99ae],['cicek',0x7b2cbf,0xffd60a],['batik',0x06d6a0,0xff70a6],['yildiz',0x111111,0xffd60a],['forma',0xffd60a,0x1d3557]];
      if(i<105&&i%15===0){const q=P[(i/15)%P.length];__T.lookSet('c1',q[1]);__T.lookSet('c2',q[2]);__T.lookSet('pat',q[0]);}if(i===108){__T.lookSet('pat','duz');__T.lookSet('c1',0x111111);__T.lookSet('print',${mk});}}`);
    await p.evaluate(()=>{__T.lookClose(true);window.__camOverride=null;__T.FOOT.pos.z=__T.INT.o.z+7;});await ff(5);
    // barber: sit in the chair, hair styles and beard change
    await p.evaluate(()=>{const r=__T.storeIn(-30,30,-30,30).find(q=>q.kind==='berber');__T.bldEnter('berber',r);const w=__T.INT.o;__T.FOOT.pos.set(w.x,__T.INT.Y,w.z-3.4);__T.bldAct();
      window.__camOverride=(P,L,U)=>{const F=__T.FOOT.pos,f=window.__f||0,a=-Math.PI/2+.5-f*.006;P.set(F.x+Math.cos(a)*2.4,F.y+1.5,F.z+Math.sin(a)*2.4);L.set(F.x,F.y+1.1,F.z);U.set(0,1,0);return 99;};});await ff(5);
    await rec('friseur',150,`i=>{window.__f=i;const Hs=[['kisa',0x2b1d14],['kivir',0x111111],['mohi',0xb5502d],['uzun',0xd8b25a],['topuz',0x5a3a22],['yan',0x111111]];if(i<110&&i%18===0){const h=Hs[(i/18)%Hs.length];__T.lookSet('hairC',h[1]);__T.lookSet('hair',h[0]);}if(i===115)__T.lookSet('beard','sakal');}`);
    await p.evaluate(()=>{__T.lookClose(true);window.__camOverride=null;__T.FOOT.pos.z=__T.INT.o.z+7;});await ff(5);
    // hospital: ill, serum, healed
    await p.evaluate(()=>{__T.lifeSick();__T.intEnter('hosp','walk');const w=__T.INT.o;__T.FOOT.pos.set(w.x+9,__T.INT.Y,w.z+7.6);});await ff(5);
    await rec('klinik',112,`i=>{if(i===4){const r=Math.random;Math.random=()=>.1;__T.lifeTreat();Math.random=r;__T.TREAT.dur=3.2;}}`);
    await p.evaluate(()=>{__T.FOOT.pos.z=__T.INT.o.z+11;});await ff(10);
    // paramedic job: an NPC crash, drive there, help
    await p.evaluate(()=>{const F=__T.FOOT,c=__T.car;if(__T.INT.on){__T.INT.mode='walk';}c.pos.set(F.pos.x+2,0,F.pos.z);__T.footToggle();});await ff(5);
    await p.evaluate(()=>{if(__T.FOOT.on)__T.footToggle();__T.jobSet('saglik');__T.NACC.next=0;});await ff(4);
    await p.evaluate(()=>{const n=__T.NACC,c=__T.car,dx=n.pos.x-c.pos.x,dz=n.pos.z-c.pos.z,d=Math.hypot(dx,dz);c.pos.x=n.pos.x-dx/d*55;c.pos.z=n.pos.z-dz/d*55;c.v=0;c.vel.set(0,0,0);__T.setCamMode(1);});await ff(10);
    await p.evaluate(()=>{__T.naccGo();});
    await rec('einsatz',170,`i=>{const n=__T.NACC,c=__T.car;if(i===95){__T.apStop&&__T.apStop();if(Math.hypot(n.pos.x-c.pos.x,n.pos.z-c.pos.z)>10){c.pos.x=n.pos.x+7;c.pos.z=n.pos.z+5;}c.v=0;c.vel.set(0,0,0);}if(i===100)__T.jobAct();}`,2);
    // news: live broadcast from the crash scene with the CCTV camera (news UI stays on)
    await ui(true);await p.evaluate(()=>{const it=__T.NEWS.list.find(n=>n.live)||__T.NEWS.list[0];__T.newsPlay(it);});
    await rec('news',150,`i=>{}`);await ui(false);
  }
  if(which==='c'){
    await start({veh:'voltra',paint:0xa50f1d});await ff(10);
    await p.evaluate(()=>{const s=__T.airSpot(),c=__T.car;c.pos.set(s.cx-6,0,__T.CITY.nz(s.j+1)+1.9);c.yaw=0;c.v=0;c.vel.set(0,0,0);
      window.__camOverride=(P,L,U)=>{const s=__T.airSpot(),f=window.__f||0,a=.35+f*.006,r=46-f*.08;P.set(s.cx+8+Math.cos(a)*r,9+f*.04,s.cz+10+Math.sin(a)*r);L.set(s.cx+6,2.5,s.cz+8);U.set(0,1,0);return 99;};});await ff(30);
    await rec('hava',80,`i=>{window.__f=i;}`);
    await p.evaluate(()=>{window.__camOverride=null;__T.airGo(__T.IL.by(7));});await ff(30);
    await rec('kabin',70,`i=>{}`);
    await ff(85);await rec('ucus',110,`i=>{}`);
  }
  if(which==='d'){
    await start({veh:'kartal',paint:0xff5a1f});await ff(30);
    await p.evaluate(()=>{const L=__T.LOOK;Object.assign(L,{pat:'ekose',c1:0xe63946,c2:0x111111,pants:0x1b263b,hair:'yan',hairC:0x2b1d14,beard:'yok'});__T.heroApply();__T.car.v=0;__T.footToggle();});await ff(10);
    // clothes shop: patterns change on the character, then a printed photo
    await p.evaluate(()=>{const r=__T.storeIn(-30,30,-30,30).find(q=>q.kind==='giyim');__T.bldEnter('giyim',r);const w=__T.INT.o;__T.FOOT.pos.set(w.x,__T.INT.Y,w.z-2.6);__T.FOOT.yaw=-Math.PI/2;__T.lookOpen('tisort');
      window.__camOverride=(P,L,U)=>{const F=__T.FOOT.pos,y=__T.FOOT.yaw,fx=Math.cos(y),fz=Math.sin(y);P.set(F.x+fx*2.7,F.y+1.45,F.z+fz*2.7);L.set(F.x,F.y+1.15,F.z);U.set(0,1,0);return 99;};});await ff(5);
    const mk=`(()=>{const c=document.createElement('canvas');c.width=c.height=240;const g=c.getContext('2d');const gr=g.createLinearGradient(0,0,240,240);gr.addColorStop(0,'#ff3b4e');gr.addColorStop(1,'#ffd34d');g.fillStyle=gr;g.fillRect(0,0,240,240);g.fillStyle='#111';g.font='900 70px sans-serif';g.textAlign='center';g.fillText('TEPE',120,110);g.fillText('TAKLAK',120,185);return c.toDataURL();})()`;
    await rec('mode',150,`i=>{const P=[['cizgi',0x1d3557,0xf1faee],['ekose',0xe63946,0x111111],['kamu',0x3a5a40,0x8d99ae],['cicek',0x7b2cbf,0xffd60a],['batik',0x06d6a0,0xff70a6],['yildiz',0x111111,0xffd60a],['forma',0xffd60a,0x1d3557]];
      if(i<105&&i%15===0){const q=P[(i/15)%P.length];__T.lookSet('c1',q[1]);__T.lookSet('c2',q[2]);__T.lookSet('pat',q[0]);}if(i===108){__T.lookSet('pat','duz');__T.lookSet('c1',0x111111);__T.lookSet('print',${mk});}}`);
    await p.evaluate(()=>{__T.lookClose(true);window.__camOverride=null;__T.FOOT.pos.z=__T.INT.o.z+7;});await ff(5);
  }
  console.log('bitti',which,errs.slice(0,5));await b.close();})().catch(e=>{console.error('FAIL',which,e.message);process.exit(1);});
