// Toplu güncelleme videosu için çekim: yeni uçan arabalar, uçuş + havada fren, araç ekranı, online'da yürüyen arkadaş.
const {chromium}=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');const fs=require('fs');
const PAGE='http://localhost:8790/cap2.html',W=1280,H=720,OUT=__dirname+'/../public/guncelleme6/',which=process.argv[2];
(async()=>{fs.mkdirSync(OUT,{recursive:true});const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--disable-background-timer-throttling']});
  const p=await b.newPage({viewport:{width:W,height:H}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.addInitScript(()=>{let T=0;const cbs=[];performance.now=()=>T;window.requestAnimationFrame=cb=>{cbs.push(cb);return cbs.length;};window.__cubeEvery=6;window.__tick=ms=>{T+=ms;const l=cbs.splice(0);for(const cb of l)try{cb(T);}catch(e){console.error(e);}};try{localStorage.clear();}catch(_){}});
  await p.goto(PAGE,{waitUntil:'domcontentloaded',timeout:120000});await p.waitForFunction(()=>window.__tepeReady,null,{timeout:120000});
  await p.waitForFunction(()=>__T.TCARS.ready,null,{timeout:60000}).catch(()=>{});
  await p.evaluate(hide=>{__T.SET.hide=hide;__T.SET.ultra=true;__T.SET.mute=true;__T.SET.police=0;__T.applySet();__T.SET.voltraOpen=true;Object.assign(__T.SET.lo,{veh:'kartal',paint:0xff5a1f,kit:0,rimT:0,spT:0,neon:-1,fin:1});__T.startMode('serbest');},!(which==='ekran'||which==='online'));
  const E=f=>p.evaluate(f);
  const rec=async(name,n,each,stride=1)=>{fs.rmSync(OUT+name,{recursive:true,force:true});fs.mkdirSync(OUT+name,{recursive:true});for(let i=0;i<n;i++){for(let s=0;s<stride-1;s++)await p.evaluate(`(${each||'()=>{}'})(${i});window.__noRender=true;__tick(1000/30)`);await p.evaluate(`(${each||'()=>{}'})(${i});window.__noRender=false;__tick(1000/30)`);await p.screenshot({path:OUT+name+'/'+String(i).padStart(4,'0')+'.jpg',type:'jpeg',quality:88});}console.log(name,n);};
  const ff=async(cond,max)=>{for(let i=0;i<max;i++){const ok=await p.evaluate(`window.__noRender=true;__tick(1000/30);(${cond})()`);if(ok)return i;}return -1;};
  await ff('()=>false',30);
  if(which==='modeller'){const looks=[['kartal',0xff5a1f],['bulut',0x2350c4],['kapsul',0xffffff]];
    await E(()=>{window.__camOverride=(P,L,U)=>{const c=__T.car,f=window.__f||0,a=f*.03+2.2;P.set(c.pos.x+Math.cos(a)*7.4,2.1+Math.sin(f*.02)*.4,c.pos.z+Math.sin(a)*7.4);L.set(c.pos.x,.9,c.pos.z);U.set(0,1,0);return 30;};});
    await rec('modeller',240,`i=>{window.__f=i;const L=${JSON.stringify(looks)};if(i%80===0){const k=L[i/80|0];Object.assign(__T.SET.lo,{veh:k[0],paint:k[1]});__T.applyLoadout();}const c=__T.car;c.v=0;c.vel.set(0,0,0);c.fanOn=true;}`);}
  if(which==='ucus'){await E(()=>{__T.AP.spd=2;const c=__T.car;__T.apStart('fly',false,__T.apDestFromPoint(c.pos.x+1400,c.pos.z+700));});
    await ff('()=>__T.car.pos.y>100',3000);await ff('()=>false',90);await rec('ucus',80);
    await rec('fren',110,`i=>{if(i===6)__T.askShow('Hey Tepetaklak, beni en yakın köfteciye yoldan götür','me');if(i===24)__T.askCommand('beni en yakın köfteciye yoldan götür');if(i>24&&i<100)__T.askShow('Havada fren · hızla iniyor, sonra köfteciye','tesla');}`,3);}
  if(which==='ekran'){await E(()=>{__T.setCamMode(3);});await ff('()=>false',20);
    await rec('ekran',130,`i=>{if(i===14){const v=new (__T.COCK.scr.position.constructor)();__T.COCK.scr.getWorldPosition(v);v.project(__T.camera);__T.osOpen({x:(v.x+1)/2*innerWidth,y:(1-v.y)/2*innerHeight,w:120});}if(i===80)__T.osApp('yt');}`);}
  if(which==='online'){await E(()=>{const N=__T.NET;N.on=true;N.host=true;N.seed=__T.CITY.seed;N.code='KANKA';N.conns=new Map();__T.addPlayer('ali','Ali',0x2350c4,'bulut');const c=__T.car;c.v=0;c.vel.set(0,0,0);__T.footToggle();window.__a0={x:c.pos.x+10,z:c.pos.z+4};});
    await rec('online',120,`i=>{const a=window.__a0,F=__T.FOOT,t=i/30;__T.netRecv('ali',[a.x+3,0,a.z+6,0,0,0,1,0,0,34,a.x-4+t*1.6,0,a.z+1.5+Math.sin(t)*.8,0]);F.yaw=Math.atan2(a.z+1.5-F.pos.z,a.x-4+t*1.6-F.pos.x);F.cam=F.yaw-.3;}`);}
  console.log('bitti',errs.slice(0,3));await b.close();})().catch(e=>{console.error('FAIL',e.message);process.exit(1);});
