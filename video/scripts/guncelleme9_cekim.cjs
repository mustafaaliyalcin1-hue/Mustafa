// Kaleler + silahlar videosu için çekim: Harput ve Ankara kalesi, kaçakçı, oyuncu silahları, Voltra R tareti.
const {chromium}=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');const fs=require('fs');
const PAGE='http://localhost:8790/cap2.html',W=1280,H=720,OUT=__dirname+'/../public/guncelleme9/',which=process.argv[2];
(async()=>{fs.mkdirSync(OUT,{recursive:true});const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--disable-background-timer-throttling']});
  const p=await b.newPage({viewport:{width:W,height:H}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.addInitScript(()=>{let T=0;const cbs=[];performance.now=()=>T;window.requestAnimationFrame=cb=>{cbs.push(cb);return cbs.length;};window.__tick=ms=>{T+=ms;const l=cbs.splice(0);for(const cb of l)try{cb(T);}catch(e){console.error(e);}};try{localStorage.clear();}catch(_){}});
  await p.goto(PAGE,{waitUntil:'domcontentloaded',timeout:120000});await p.waitForFunction(()=>window.__tepeReady,null,{timeout:120000});
  const rec=async(name,n,each)=>{fs.rmSync(OUT+name,{recursive:true,force:true});fs.mkdirSync(OUT+name,{recursive:true});for(let i=0;i<n;i++){await p.evaluate(`(${each||'()=>{}'})(${i});window.__noRender=false;__tick(1000/30)`);await p.screenshot({path:OUT+name+'/'+String(i).padStart(4,'0')+'.jpg',type:'jpeg',quality:88});}console.log(name,n);};
  const ff=async n=>{for(let i=0;i<n;i++)await p.evaluate('window.__noRender=true;__tick(1000/30)');};
  await p.evaluate(h=>{__T.SET.hide=h;__T.SET.ultra=true;__T.SET.mute=true;__T.SET.police=0;__T.applySet();__T.SET.voltraOpen=true;Object.assign(__T.SET.lo,{veh:'voltra',paint:0x15181e});__T.applyLoadout();__T.startMode('serbest');},which==='kale');await ff(20);
  if(which==='kale'){for(const [pl,id] of [[23,'harput'],[6,'ankara']]){
      await p.evaluate(([pl,id])=>{__T.ilApply(pl,__T.CITY.seed);const s=__T.landSpots().find(q=>q.d.id===id),c=__T.car;c.pos.x=s.cx+40;c.pos.z=__T.CITY.nz(s.j+1);window.__S=s;
        window.__camOverride=(P,L,U)=>{const f=window.__f||0,a=.5+f*.006,r=58-f*.08;P.set(s.cx+Math.cos(a)*r,30-f*.05,s.cz+Math.sin(a)*r);L.set(s.cx,7,s.cz);U.set(0,1,0);return 99;};},[pl,id]);
      await ff(20);await rec(id,150,`i=>{window.__f=i;}`);}
    await p.evaluate(()=>{window.__camOverride=null;});}
  if(which==='silah'){await p.evaluate(()=>{const s=__T.smugSpot(),c=__T.car;c.pos.x=s.cx-33;c.pos.z=s.cz-4;c.yaw=0;c.v=0;c.vel.set(0,0,0);});await ff(10);
    await p.evaluate(()=>{__T.footToggle();const F=__T.FOOT,s=__T.smugSpot();F.pos.set(s.cx-27,0,s.cz+2);F.yaw=0;F.cam=0;});await ff(10);
    await rec('kacakci',90,`i=>{const F=__T.FOOT,s=__T.smugSpot();if(i<40){__T.keys.gas=1;F.yaw=Math.atan2(s.cz+2-F.pos.z,s.cx-21.4-F.pos.x);}else __T.keys.gas=0;if(i===44)__T.shopOpen(true);if(i===62){[...document.querySelectorAll('#shopList button')][1].click();}if(i===70){[...document.querySelectorAll('#shopList button')][3].click();[...document.querySelectorAll('#shopList button')][4].click();[...document.querySelectorAll('#shopList button')][1].click();}if(i===86)__T.shopOpen(false);}`);
    await p.evaluate(()=>{__T.keys.gas=0;const F=__T.FOOT,d=__T.DUMMY[1];F.pos.set(d.x-15,0,d.z+1.2);F.yaw=Math.atan2(d.z-F.pos.z,d.x-F.pos.x);F.cam=F.yaw;__T.CB.pitch=-.03;});await ff(15);
    await rec('tufek',80,`i=>{__T.keys.fire=i>8&&i<70?1:0;}`);
    await p.evaluate(()=>{__T.keys.fire=0;__T.DUMMY.forEach(d=>{d.hp=100;d.down=0;d.g.rotation.z=0;});__T.cbEquip('sniper');const F=__T.FOOT,d=__T.DUMMY[2];F.pos.set(d.x-40,0,d.z+.3);F.yaw=Math.atan2(d.z-F.pos.z,d.x-F.pos.x);F.cam=F.yaw;__T.CB.pitch=-.02;});await ff(10);
    await rec('sniper',70,`i=>{if(i===10)__T.CB.zoom=true;__T.keys.fire=i===40?1:0;if(i===58)__T.CB.zoom=false;}`);
    await p.evaluate(()=>{__T.keys.fire=0;__T.DUMMY.forEach(d=>{d.hp=100;d.down=0;d.g.rotation.z=0;});__T.cbEquip('rpg');const F=__T.FOOT,d=__T.DUMMY[1];F.pos.set(d.x-24,0,d.z+1.2);F.yaw=Math.atan2(d.z-F.pos.z,d.x-F.pos.x);F.cam=F.yaw;__T.CB.pitch=.0;});await ff(15);
    await rec('rpg',80,`i=>{__T.keys.fire=i===12?1:0;}`);
    // Voltra R turret
    await p.evaluate(()=>{__T.keys.fire=0;__T.cbEquip(null);__T.DUMMY.forEach(d=>{d.hp=100;d.down=0;d.g.rotation.z=0;});const c=__T.car,F=__T.FOOT,d=__T.DUMMY[1];c.pos.x=d.x-26;c.pos.z=d.z+8;c.yaw=0;F.pos.set(c.pos.x,0,c.pos.z+1.6);__T.footToggle();});await ff(10);
    await p.evaluate(()=>{const c=__T.car;window.__camOverride=(P,L,U)=>{const f=window.__f||0,a=2.3+f*.004;P.set(c.pos.x+Math.cos(a)*7.5,3.2,c.pos.z+Math.sin(a)*7.5);L.set(c.pos.x+3,1.4,c.pos.z-2);U.set(0,1,0);return 99;};});
    await rec('taret',200,`i=>{window.__f=i;if(i===2)__T.cbTurret(true);if(i===70){__T.turMode('laser');__T.DUMMY.forEach(d=>{d.hp=100;d.down=0;d.g.rotation.z=0;});}if(i===135){__T.turMode('rpg');__T.DUMMY.forEach(d=>{d.hp=100;d.down=0;d.g.rotation.z=0;});}}`);}
  console.log('bitti',errs.slice(0,3));await b.close();})().catch(e=>{console.error('FAIL',e.message);process.exit(1);});
