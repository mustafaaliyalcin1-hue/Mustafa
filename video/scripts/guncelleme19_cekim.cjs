// Havalimanı terminali, bilet, güvenlik, kafe, ekonomi kabini, polis çevirmesi ve kılık güncellemesinin çekimi.
const {chromium}=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');const fs=require('fs');
const PAGE='http://localhost:8790/cap2.html',W=1280,H=720,OUT=__dirname+'/../public/guncelleme19/';
(async()=>{fs.mkdirSync(OUT,{recursive:true});const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--disable-background-timer-throttling']});
  const p=await b.newPage({viewport:{width:W,height:H}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.addInitScript(()=>{let T=0;const cbs=[];performance.now=()=>T;window.requestAnimationFrame=cb=>{cbs.push(cb);return cbs.length;};window.__noAO=true;window.__tick=ms=>{T+=ms;const l=cbs.splice(0);for(const cb of l)try{cb(T);}catch(e){console.error(e);}};try{localStorage.clear();}catch(_){}});
  await p.goto(PAGE,{waitUntil:'domcontentloaded',timeout:180000});await p.waitForFunction(()=>window.__tepeReady,null,{timeout:180000});
  // only the 3D view, plus the dialogs we want to show
  await p.addStyleTag({content:'body.noui *{visibility:hidden!important}body.noui #c,body.noui #airPick,body.noui #airPick *,body.noui #secBox,body.noui #secBox *{visibility:visible!important}'});
  await p.evaluate(()=>document.body.classList.add('noui'));
  const rec=async(name,n,each)=>{fs.rmSync(OUT+name,{recursive:true,force:true});fs.mkdirSync(OUT+name,{recursive:true});for(let i=0;i<n;i++){await p.evaluate(`(${each||'()=>{}'})(${i});window.__noRender=false;__tick(1000/30)`);await p.screenshot({path:OUT+name+'/'+String(i).padStart(4,'0')+'.jpg',type:'jpeg',quality:90});}console.log(name,n);};
  const ff=async n=>{for(let i=0;i<n;i++)await p.evaluate('window.__noRender=true;__tick(1000/30)');};
  await p.evaluate(()=>{Object.assign(__T.SET,{ultra:true,mute:true,police:2});__T.applySet();__T.startMode('serbest');__T.NACC.next=1e9;__T.CHK.next=1e9;__T.CB.own.add('tabanca');__T.CB.own.add('rpg');__T.cbSave&&__T.cbSave();});await ff(30);
  const only=process.argv[2];if(only!=='polis'){
  // walk into the terminal and up to the ticket desk
  await p.evaluate(()=>{const s=__T.airSpot(),c=__T.car;c.pos.set(s.cx-17,0,s.cz+2);c.v=0;});await ff(10);
  await p.evaluate(()=>__T.termEnter());await ff(75);
  await rec('terminal',110,`i=>{const w=__T.INT.o,F=__T.FOOT,k=Math.min(1,i/100),a=[w.x,w.z+11],b=[w.x-10,w.z+6.8];F.pos.set(a[0]+(b[0]-a[0])*k,__T.INT.Y,a[1]+(b[1]-a[1])*k);F.yaw=Math.atan2(b[1]-a[1],b[0]-a[0]);}`);
  await rec('bilet',75,`i=>{if(i===2){__T.TERM.cls='eko';__T.airPickOpen();}if(i===30){__T.TERM.cls='first';document.querySelector('#airCls [data-c=first]').click();}if(i===52){document.querySelector('#airCls [data-c=eko]').click();}}`);
  await p.evaluate(()=>{__T.termBuy(__T.IL.by(7));});await ff(10);
  // security: the gun dialog, then the metal detector
  await p.evaluate(()=>{const w=__T.INT.o;__T.FOOT.pos.set(w.x,__T.INT.Y,w.z+1.6);__T.FOOT.yaw=-Math.PI/2;});await ff(5);
  await rec('guvenlik',100,`i=>{if(i===2)__T.termAct('sec');if(i===40)__T.termStash();}`);
  await ff(30);
  // cafe
  await p.evaluate(()=>{const w=__T.INT.o;__T.FOOT.pos.set(w.x+15.6,__T.INT.Y,w.z-6);__T.menuPick(__T.MENUS.havakafe[0]);});await ff(10);
  await rec('kafe',75,`i=>{}`);
  await ff(220);await p.evaluate(()=>{__T.INT.mode='walk';});
  // board at gate A3, economy cabin
  await p.evaluate(()=>{const w=__T.INT.o;__T.FOOT.pos.set(w.x-3,__T.INT.Y,w.z-10);__T.termAct('gate');});await ff(40);
  await rec('kabin',90,`i=>{}`);
  for(let i=0;i<40&&await p.evaluate(()=>__T.AIR.on);i++)await ff(30);await ff(60);
  }
  if(only!=='hava'){
  // police checkpoint: wanted but in disguise -> they let you go
  const setup=async()=>p.evaluate(()=>{const c=__T.car,C=__T.CITY;if(__T.FOOT.on)__T.footToggle();const i0=C.ci(c.pos.x);let J=3;for(let j=3;j<14;j++){if([0,1,2,3,4,5].every(k=>!C.closedE(i0+k,j,0))){J=j;break;}}
    c.pos.set(C.nx(i0)+10,0,C.nz(J)+1.9);c.yaw=0;c.v=13;c.vel.set(13,0,0);C.update(c.pos.x,c.pos.z);__T.chkClear();__T.chkSpawn();c.pos.x=__T.CHK.x-62;C.update(c.pos.x,c.pos.z);window.__x0=c.pos.x;window.__z0=c.pos.z;});
  await p.evaluate(()=>{__T.SAB.heat=80;__T.SAB.sig={pat:'ekose',c1:1,hair:'kisa',hairC:2,beard:'yok',face:0,print:0,veh:'x',paint:3};__T.lookSet('pat','cicek');__T.lookSet('hair','uzun');__T.lookSet('beard','sakal');});
  await setup();await ff(3);
  const drive=`i=>{const c=__T.car,K=__T.CHK;if(!K.on||K.st!=="wait"){if(__T.KAZA.st==="off"){c.v=0;c.vel.set(0,0,0);}return;}const stopX=K.x-3,d=stopX-c.pos.x;const v=d>40?13:Math.max(0,d*.32);c.v=v;c.vel.set(v,0,0);c.pos.x+=v/30;c.pos.z=K.z+1.9;c.yaw=0;}`;
  await p.evaluate(()=>{window.__r=Math.random;Math.random=()=>.6;});
  await rec('cevirme',150,drive);await p.evaluate(()=>{Math.random=window.__r;});await ff(30);
  // same again without the disguise: recognised and arrested
  await p.evaluate(()=>{__T.SAB.heat=90;__T.SAB.sig=JSON.parse(JSON.stringify({pat:__T.LOOK.pat,c1:__T.LOOK.c1,hair:__T.LOOK.hair,hairC:__T.LOOK.hairC,beard:__T.LOOK.beard,face:0,print:0,veh:__T.SET.lo.veh,paint:__T.SET.lo.paint}));});
  await setup();await ff(3);await p.evaluate(()=>{window.__r=Math.random;Math.random=()=>0;});
  await rec('yakalandi',170,drive);await p.evaluate(()=>{Math.random=window.__r;});
  }
  console.log('bitti',errs.slice(0,3));await b.close();})().catch(e=>{console.error('FAIL',e.message);process.exit(1);});
