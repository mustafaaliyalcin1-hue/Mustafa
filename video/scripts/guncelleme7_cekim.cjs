// Arayüz cilası videosu için çekim: eski/yeni ekran görüntüleri (masaüstü + telefon) ve yeni HUD ile sürüş.
const {chromium}=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');const fs=require('fs');
const BASE='http://localhost:8790/',OUT=__dirname+'/../public/guncelleme7/',which=process.argv[2];
const clock=()=>{let T=0;const cbs=[];performance.now=()=>T;window.requestAnimationFrame=cb=>{cbs.push(cb);return cbs.length;};window.__tick=ms=>{T+=ms;const l=cbs.splice(0);for(const cb of l)try{cb(T);}catch(e){}};try{localStorage.clear();}catch(_){}};
(async()=>{fs.mkdirSync(OUT,{recursive:true});const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--disable-background-timer-throttling']});
  if(which==='kare'){fs.mkdirSync(OUT+'kare',{recursive:true});
    for(const [ver,page] of [['eski','ttest_old.html'],['yeni','ttest.html']])for(const [dev,opt] of [['pc',{viewport:{width:1280,height:720}}],['tel',{viewport:{width:844,height:390},isMobile:true,hasTouch:true,deviceScaleFactor:2}]]){
      const ctx=await b.newContext(opt);const p=await ctx.newPage();await p.addInitScript(clock);
      await p.goto(BASE+page,{waitUntil:'domcontentloaded',timeout:120000});await p.waitForFunction(()=>window.__tepeReady,null,{timeout:120000});
      await p.evaluate(()=>{__T.SET.ultra=false;__T.applySet();for(let i=0;i<10;i++)__tick(50);});
      await p.evaluate(()=>document.querySelector('.mode.tour').scrollIntoView({block:'center'}));await p.screenshot({path:`${OUT}kare/${ver}_${dev}_menu.png`});
      await p.evaluate(()=>{__T.startMode('serbest');for(let i=0;i<30;i++)__tick(50);});await p.screenshot({path:`${OUT}kare/${ver}_${dev}_hud.png`});
      await ctx.close();console.log(ver,dev);}}
  if(which==='surus'){const p=await b.newPage({viewport:{width:1280,height:720}});await p.addInitScript(clock);
    await p.goto(BASE+'cap2.html',{waitUntil:'domcontentloaded',timeout:120000});await p.waitForFunction(()=>window.__tepeReady,null,{timeout:120000});
    await p.evaluate(()=>{__T.SET.hide=false;__T.SET.ultra=true;__T.SET.mute=true;__T.SET.police=0;__T.applySet();__T.startMode('serbest');});
    for(let i=0;i<60;i++)await p.evaluate('window.__noRender=true;__tick(1000/30)');
    await p.evaluate(()=>{const c=__T.car;__T.apStart('road',false,__T.apDestFromPoint(c.pos.x+900,c.pos.z+300));});
    const d=OUT+'surus/';fs.rmSync(d,{recursive:true,force:true});fs.mkdirSync(d,{recursive:true});
    for(let i=0;i<150;i++){await p.evaluate('window.__noRender=false;__tick(1000/30)');await p.screenshot({path:d+String(i).padStart(4,'0')+'.jpg',type:'jpeg',quality:88});}
    console.log('surus 150');}
  await b.close();})().catch(e=>{console.error('FAIL',e.message);process.exit(1);});
