// Sunum modu videosu için çekim: tur baştan sona sanal saatle oynar, her adımdan kısa bir kesit JPEG olarak kaydedilir.
const {chromium}=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');const fs=require('fs');
const PAGE=process.argv[2]||'http://localhost:8790/cap2.html',W=1280,H=720,FPS=30,OUT=__dirname+'/../public/guncelleme4/';
// adım -> [adım başlangıcından kaç kare sonra, kaç kare]
const ONLY=process.argv[3]||'';
const CUT={0:[40,60],1:[90,60],2:[420,60],3:[200,60],4:[115,70],5:[140,75],6:[120,60],7:[150,60],8:[100,60],9:[40,80],10:[80,60],12:[220,60],13:[10,60]};
(async()=>{if(!ONLY){fs.rmSync(OUT,{recursive:true,force:true});}fs.mkdirSync(OUT,{recursive:true});
  const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--disable-background-timer-throttling']});
  // 1) telefonda Hey Tesla: hızlı komut düğmeleri
  if(ONLY!=='tunel'){const ctx=await b.newContext({viewport:{width:W,height:H},isMobile:true,hasTouch:true});const p=await ctx.newPage();
    await p.addInitScript(()=>{let T=0;const cbs=[];performance.now=()=>T;window.requestAnimationFrame=cb=>{cbs.push(cb);return cbs.length;};window.__tick=ms=>{T+=ms;const l=cbs.splice(0);for(const cb of l)try{cb(T);}catch(e){console.error(e);}};try{localStorage.clear();}catch(_){}
      window.SpeechRecognition=window.webkitSpeechRecognition=function(){const r=this;r.start=()=>{setTimeout(()=>{const res=[{transcript:'hey tesla beni en yakın kofteciye götür'}];res.isFinal=true;r.onresult&&r.onresult({results:[res]});r.onend&&r.onend();},900);};r.stop=()=>{};r.abort=()=>{};};});
    await p.goto(PAGE,{waitUntil:'domcontentloaded',timeout:120000});await p.waitForFunction(()=>window.__tepeReady,null,{timeout:120000});
    await p.evaluate(()=>{__T.SET.hide=false;__T.SET.ultra=true;__T.SET.mute=true;__T.applySet();__T.startMode('serbest');});
    for(let i=0;i<40;i++)await p.evaluate(()=>__tick(1000/30));fs.mkdirSync(OUT+'hey',{recursive:true});
    for(let i=0;i<90;i++){if(i===8){const bb=await p.locator('#tbAsk').boundingBox();await p.touchscreen.tap(bb.x+bb.width/2,bb.y+bb.height/2);}
      // the capture runs slower than real time, so keep the dialog on screen the way a player would see it
      await p.evaluate(i=>{const b=document.getElementById('askBox');if(i>=8&&i<34){__T.askShow('Dinliyorum… şimdi konuş','listen');document.getElementById('askChips').hidden=false;}
        else if(i>=34&&i<58){__T.askShow('hey tesla beni en yakın kofteciye götür','me');document.getElementById('askChips').hidden=true;}else if(i>=58){if(!window.__say)window.__say=document.getElementById('askTxt').textContent.startsWith('Tamam')?document.getElementById('askTxt').textContent:'Tamam, en yakın köfteciye gidiyoruz.';__T.askShow(window.__say,'tesla');}},i);
      await p.evaluate(()=>__tick(1000/30));await p.screenshot({path:OUT+'hey/'+String(i).padStart(4,'0')+'.jpg',type:'jpeg',quality:88});}
    await ctx.close();console.log('hey done');}
  if(ONLY==='hey'){await b.close();return;}
  // 2) sunum modu turu
  const p=await b.newPage({viewport:{width:W,height:H}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.addInitScript(()=>{let T=0;const cbs=[];performance.now=()=>T;window.requestAnimationFrame=cb=>{cbs.push(cb);return cbs.length;};window.__cubeEvery=6;window.__tick=ms=>{T+=ms;const l=cbs.splice(0);for(const cb of l)try{cb(T);}catch(e){console.error(e);}};try{localStorage.clear();}catch(_){}});
  await p.goto(PAGE,{waitUntil:'domcontentloaded',timeout:120000});await p.waitForFunction(()=>window.__tepeReady,null,{timeout:120000});
  await p.waitForFunction(()=>__T.TCARS.ready,null,{timeout:60000}).catch(()=>{});
  await p.evaluate(()=>{__T.SET.hide=false;__T.SET.ultra=true;__T.SET.mute=true;__T.applySet();__T.tourStart();});
  if(ONLY==='tunel'){await p.evaluate(()=>{__tick(33);window.__tourJump(11);});}
  let step=-1,fr=0,saved={};const tunDown={done:false};
  const want=(step,fr,ph)=>{if(step===11)return ph==='down'&&!tunDown.done;const c=CUT[step];return !!c&&fr+1>=c[0]&&fr+1<c[0]+c[1];};let nextRender=true;
  for(let k=0;k<12000;k++){const st=await p.evaluate(r=>{window.__noRender=!r;__tick(1000/30);return [__T.TOUR.on,__T.TOUR.i,__T.TUN.ph];},nextRender);
    if(!st[0])break;if(st[1]!==step){step=st[1];fr=0;console.log('adım',step,'kare',k);}else fr++;
    let cut=CUT[step],name='s'+String(step).padStart(2,'0');nextRender=want(step,fr,st[2])||(step===11&&st[2]==='down');
    if(step===11&&st[2]==='down'&&!tunDown.done){if(!tunDown.f)tunDown.f=0;name='s11';cut=[0,70];if(tunDown.f<70){fs.mkdirSync(OUT+name,{recursive:true});await p.screenshot({path:OUT+name+'/'+String(tunDown.f).padStart(4,'0')+'.jpg',type:'jpeg',quality:88});tunDown.f++;}else tunDown.done=true;continue;}
    if(cut&&step!==11&&fr>=cut[0]&&fr<cut[0]+cut[1]){fs.mkdirSync(OUT+name,{recursive:true});await p.screenshot({path:OUT+name+'/'+String(fr-cut[0]).padStart(4,'0')+'.jpg',type:'jpeg',quality:88});saved[name]=(saved[name]||0)+1;}}
  console.log('kayıtlar',JSON.stringify(saved),'tünel',tunDown.f,'hatalar',errs.slice(0,3));await b.close();})().catch(e=>{console.error('FAIL',e.message);process.exit(1);});
