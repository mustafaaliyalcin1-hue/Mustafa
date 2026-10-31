// 81 il videosu için çekim: seçilmiş ünlü yerlerin etrafında dönen kamera.
const {chromium}=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');const fs=require('fs');
const PAGE='http://localhost:8790/cap2.html',W=1280,H=720,OUT=__dirname+'/../public/guncelleme11/';
const IDS=['sultanahmet','galata','anitkabir','kapadokya','pamukkale','nemrut','mevlana','gobeklitepe','truva','kizkalesi','sumela','akdamar'];
(async()=>{fs.mkdirSync(OUT,{recursive:true});const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--disable-background-timer-throttling']});
  const p=await b.newPage({viewport:{width:W,height:H}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.addInitScript(()=>{let T=0;const cbs=[];performance.now=()=>T;window.requestAnimationFrame=cb=>{cbs.push(cb);return cbs.length;};window.__tick=ms=>{T+=ms;const l=cbs.splice(0);for(const cb of l)try{cb(T);}catch(e){console.error(e);}};try{localStorage.clear();}catch(_){}});
  await p.goto(PAGE,{waitUntil:'domcontentloaded',timeout:120000});await p.waitForFunction(()=>window.__tepeReady,null,{timeout:120000});
  await p.evaluate(()=>{__T.SET.hide=true;__T.SET.ultra=true;__T.SET.mute=true;__T.SET.police=0;__T.applySet();__T.startMode('serbest');});
  for(const id of IDS){await p.evaluate(id=>{window.__noRender=true;let pl=0;for(const[k,v]of Object.entries(__T.LANDM.defs))if(v.some(d=>d.id===id))pl=+k;__T.ilApply(pl,4321);__tick(33);const s=__T.landSpots().find(q=>q.d.id===id),c=__T.car;c.pos.x=s.cx+60;c.pos.z=__T.CITY.nz(s.j+1);for(let k=0;k<4;k++)__tick(33);
      window.__camOverride=(P,L,U)=>{const f=window.__f||0,a=.6+f*.012,r=50-f*.12;P.set(s.cx+Math.cos(a)*r,24-f*.06,s.cz+Math.sin(a)*r);L.set(s.cx,7,s.cz);U.set(0,1,0);return 99;};},id);
    const d=OUT+id;fs.rmSync(d,{recursive:true,force:true});fs.mkdirSync(d,{recursive:true});
    for(let i=0;i<60;i++){await p.evaluate(i=>{window.__f=i;window.__noRender=false;__tick(1000/30);},i);await p.screenshot({path:d+'/'+String(i).padStart(4,'0')+'.jpg',type:'jpeg',quality:88});}console.log(id);}
  console.log('bitti',errs.slice(0,3));await b.close();})().catch(e=>{console.error('FAIL',e.message);process.exit(1);});
