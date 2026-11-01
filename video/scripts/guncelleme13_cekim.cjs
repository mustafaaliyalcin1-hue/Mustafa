// Araç ekranı videosu: büyük ekran, iç kamerada küçük ekran, yolcu arkadaş. (YouTube yerine yerel örnek görüntü; çekim ortamında internet yok.)
const {chromium}=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');const fs=require('fs');
const PAGE='http://localhost:8790/cap2.html',W=1280,H=720,OUT=__dirname+'/../public/guncelleme13/';
const MOCK='<html><body style="margin:0;height:100vh;overflow:hidden;font:700 34px system-ui;color:#fff;display:grid;place-items:center;background:linear-gradient(120deg,#ff3b4e,#7b2ff7,#1fb6ff);background-size:300% 300%;animation:g 4s ease infinite"><div style="text-align:center">▶ Tepetaklak Klip<br><small style="font-size:18px;opacity:.85">arabanın ekranında oynuyor</small></div><style>@keyframes g{0%{background-position:0 50%}50%{background-position:100% 50%}100%{background-position:0 50%}}</style></body></html>';
(async()=>{fs.mkdirSync(OUT,{recursive:true});const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--disable-background-timer-throttling']});
  const p=await b.newPage({viewport:{width:W,height:H}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.route(/youtube/,r=>r.fulfill({status:200,contentType:'text/html; charset=utf-8',body:MOCK}));
  await p.addInitScript(()=>{let T=0;const cbs=[];performance.now=()=>T;window.requestAnimationFrame=cb=>{cbs.push(cb);return cbs.length;};window.__tick=ms=>{T+=ms;const l=cbs.splice(0);for(const cb of l)try{cb(T);}catch(e){console.error(e);}};try{localStorage.clear();}catch(_){}});
  await p.goto(PAGE,{waitUntil:'domcontentloaded',timeout:120000});await p.waitForFunction(()=>window.__tepeReady,null,{timeout:120000});
  const rec=async(name,n,each,stride=1)=>{fs.rmSync(OUT+name,{recursive:true,force:true});fs.mkdirSync(OUT+name,{recursive:true});for(let i=0;i<n;i++){for(let s=0;s<stride-1;s++)await p.evaluate(`(${each||'()=>{}'})(${i});window.__noRender=true;__tick(1000/30)`);await p.evaluate(`(${each||'()=>{}'})(${i});window.__noRender=false;__tick(1000/30)`);await p.screenshot({path:OUT+name+'/'+String(i).padStart(4,'0')+'.jpg',type:'jpeg',quality:88});}console.log(name,n);};
  const ff=async n=>{for(let i=0;i<n;i++)await p.evaluate('window.__noRender=true;__tick(1000/30)');};
  await p.evaluate(()=>{__T.SET.hide=false;__T.SET.ultra=true;__T.SET.mute=true;__T.SET.police=0;__T.applySet();Object.assign(__T.SET.lo,{veh:'kartal',paint:0xff5a1f});__T.applyLoadout();__T.startMode('serbest');__T.setCamMode(3);});await ff(30);
  await rec('buyuk',70,`i=>{if(i===5){__T.osOpen();__T.osApp('yt');__T.osYt('dQw4w9WgXcQ');}}`);
  await rec('kucuk',140,`i=>{if(i===10){document.getElementById('carOS').hidden=true;__T.OS.open=false;}__T.keys.gas=i>20?1:0;}`);
  await p.evaluate(()=>{__T.keys.gas=0;const c=__T.car;c.v=0;c.vel.set(0,0,0);__T.setCamMode(0);const N=__T.NET;N.on=true;N.host=false;N.id='p1';N.conn={open:true,send:()=>{}};__T.addPlayer('h','Ali',0x2350c4,'car');
    __T.footToggle();for(let k=0;k<4;k++)__tick(33);const F=__T.FOOT;F.pos.x+=12;window.__fp={x:F.pos.x+2,z:F.pos.z};for(let k=0;k<6;k++){__T.netRecv('h',[__fp.x,0,__fp.z,0,0,0,1,0,0,__T.IL.cur]);__tick(33);}__T.footToggle();__T.cbRecv2('h',{k:'vid',to:'p1',id:'dQw4w9WgXcQ',sec:30});});
  await rec('yolcu',120,`i=>{window.__fp.x+=.35;__T.netRecv('h',[window.__fp.x,0,window.__fp.z,0,0,0,1,10,1,__T.IL.cur]);}`);
  console.log('bitti',errs.slice(0,3));await b.close();})().catch(e=>{console.error('FAIL',e.message);process.exit(1);});
