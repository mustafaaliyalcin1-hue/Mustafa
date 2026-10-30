// "Beni Elazığ'da bir köfteciye götür" + Boğaz kıyısı (balıkçılar, banklar, köprü) videosu için çekim.
// Sanal saat; kesit dışındaki kareler çizilmeden hızla geçilir, kesitler JPEG olarak kaydedilir.
const {chromium}=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');const fs=require('fs');
const PAGE='http://localhost:8790/cap2.html',W=1280,H=720,OUT=__dirname+'/../public/guncelleme5/',which=process.argv[2];
(async()=>{fs.mkdirSync(OUT,{recursive:true});const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--disable-background-timer-throttling']});
  const p=await b.newPage({viewport:{width:W,height:H}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.addInitScript(()=>{let T=0;const cbs=[];performance.now=()=>T;window.requestAnimationFrame=cb=>{cbs.push(cb);return cbs.length;};window.__cubeEvery=6;window.__tick=ms=>{T+=ms;const l=cbs.splice(0);for(const cb of l)try{cb(T);}catch(e){console.error(e);}};try{localStorage.clear();}catch(_){}});
  await p.goto(PAGE,{waitUntil:'domcontentloaded',timeout:120000});await p.waitForFunction(()=>window.__tepeReady,null,{timeout:120000});
  await p.waitForFunction(()=>__T.TCARS.ready,null,{timeout:60000}).catch(()=>{});
  await p.evaluate(()=>{__T.SET.hide=false;__T.SET.ultra=true;__T.SET.mute=true;__T.SET.police=0;__T.applySet();__T.SET.lo.veh='voltra';__T.SET.voltraOpen=true;__T.SET.lo.paint=0xa50f1d;__T.startMode('serbest');__T.AP.spd=2;});
  const E=f=>p.evaluate(f);
  const rec=async(name,n,each)=>{fs.rmSync(OUT+name,{recursive:true,force:true});fs.mkdirSync(OUT+name,{recursive:true});for(let i=0;i<n;i++){await p.evaluate(`(${each||'()=>{}'})(${i});window.__noRender=false;__tick(1000/30)`);await p.screenshot({path:OUT+name+'/'+String(i).padStart(4,'0')+'.jpg',type:'jpeg',quality:88});}console.log(name,n);};
  const ff=async(cond,max)=>{for(let i=0;i<max;i++){const ok=await p.evaluate(`window.__noRender=true;__tick(1000/30);(${cond})()`);if(ok)return i;}return -1;};
  await ff('()=>false',30);
  const say=(me,t1)=>`i=>{if(i<${t1})__T.askShow(${JSON.stringify(me)},'me');else{if(i===${t1})__T.askCommand(${JSON.stringify(me.replace(/^Hey Tepetaklak, /,''))});const s=document.getElementById('askTxt').textContent;window.__s=window.__s&&i>${t1}?window.__s:s;__T.askShow(window.__s,'tesla');}}`;
  if(which==='elazig'){
    await rec('e_komut',80,say("Hey Tepetaklak, beni Elazığ'da bir köfteciye götür",30));
    await ff('()=>__T.TUN.ph==="down"',3000);await rec('e_asansor',60);
    await ff('()=>__T.TUN.ph==="ride"&&__T.TUN.t>6',3000);await rec('e_tunel',60);
    await ff('()=>__T.TUN.ph==="up"',3000);await rec('e_varis',80);
    await ff('()=>__T.AP.on&&__T.IL.cur===23',3000);await ff('()=>false',90);await rec('e_kofte',70);
    await ff('()=>!__T.AP.on',3000);await rec('e_vardi',50);}
  if(which==='bogaz'){
    await rec('b_komut',70,say("Hey Tepetaklak, beni Boğaz'a götür",28));
    await ff('()=>{const c=__T.car;return Math.abs(c.pos.z-__T.CITY.shoreZ(1))<80}',4000);await rec('b_yol',70);
    await ff('()=>!__T.AP.on',3000);
    await E(()=>{const c=__T.car;c.v=0;c.vel.set(0,0,0);__tick(2);__T.footToggle();const F=__T.FOOT,C=__T.CITY;const q=C.shoreSpots(C.ci(F.pos.x)-1,C.ci(F.pos.x)+1).filter(q=>q.t==='fish'&&q.s>0).sort((a,b)=>Math.abs(a.x-F.pos.x)-Math.abs(b.x-F.pos.x))[0];window.__q=q;F.pos.set(q.x-9,0,q.z-2.6);F.yaw=Math.atan2(1.9,9);F.cam=F.yaw;});
    await ff('()=>false',25);
    await rec('b_balikci',110,"i=>{const F=__T.FOOT,q=window.__q,dx=q.x-1.2-F.pos.x,dz=q.z-.7-F.pos.z;F.yaw=Math.atan2(dz,dx);__T.keys.gas=Math.hypot(dx,dz)>.8?1:0;}");
    await E(()=>{__T.keys.gas=0;const F=__T.FOOT,C=__T.CITY;const q=C.shoreSpots(C.ci(F.pos.x)-1,C.ci(F.pos.x)+1).filter(q=>q.t==='bench'&&q.s>0).sort((a,b)=>Math.abs(a.x-F.pos.x)-Math.abs(b.x-F.pos.x))[0];F.pos.set(q.x+.5,0,q.z-.6);});
    await ff('()=>false',20);await E(()=>__T.footToggle());await ff('()=>false',10);
    await rec('b_bank',90,"i=>{__T.FOOT.cam=__T.FOOT.yaw+Math.sin(i/90*Math.PI)*.5;}");
    await E(()=>{__T.footToggle();const F=__T.FOOT,c=__T.car;F.pos.set(c.pos.x+1,0,c.pos.z+1);__T.footToggle();});
    await rec('b_kopru_komut',50,say("Hey Tepetaklak, beni İstanbul köprüsüne götür",22));
    await ff('()=>{const c=__T.car;return c.pos.z>__T.CITY.shoreZ(1)-25&&Math.abs(c.pos.x-__T.CITY.nx(Math.round(__T.CITY.ci(c.pos.x)/8)*8))<9}',4000);await rec('b_kopru',80);}
  console.log('bitti',errs.slice(0,3));await b.close();})().catch(e=>{console.error('FAIL',e.message);process.exit(1);});
