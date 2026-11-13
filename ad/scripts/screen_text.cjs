// Ekran içerikleri: açılış yazısı ve kapanış künyeleri. node screen_text.cjs
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const f=w=>fs.readFileSync(path.join(__dirname,`../fonts/Inter-${w}.ttf`)).toString('base64');
const css=`@font-face{font-family:I;font-weight:400;src:url(data:font/ttf;base64,${f(400)})}@font-face{font-family:I;font-weight:600;src:url(data:font/ttf;base64,${f(600)})}@font-face{font-family:I;font-weight:700;src:url(data:font/ttf;base64,${f(700)})}
*{margin:0;box-sizing:border-box}body{font-family:I;-webkit-font-smoothing:antialiased}`;
const wall=n=>'data:image/png;base64,'+fs.readFileSync(path.join(__dirname,'../tex',n+'.png')).toString('base64');
const jobs=[
 ['u_text',1800,1990,`<div style="width:1800px;height:1990px;background:#fff;display:flex;align-items:center;justify-content:center">
   <div style="font-weight:700;font-size:200px;line-height:1.08;color:#0b0b0b;letter-spacing:-6px;text-align:center">Onun<br>geç kalmışlık.</div></div>`],
 ['u_lock',1800,1990,`<div style="width:1800px;height:1990px;background:url(${wall('u_wall0')});background-size:cover;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;text-align:center">
   <div style="position:absolute;inset:0;background:rgba(90,50,110,.28)"></div>
   <div style="position:relative;font-weight:700;font-size:190px;line-height:1.02;letter-spacing:-4px">Galaxy Z<br>Fold8 Ultra</div>
   <div style="position:relative;font-weight:600;font-size:96px;margin-top:70px">Yepyeni açılış.</div></div>`],
 ['f8_lock',2048,1567,`<div style="width:2048px;height:1567px;background:url(${wall('f8_wall0')});background-size:cover;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;text-align:center">
   <div style="position:absolute;inset:0;background:rgba(90,50,110,.28)"></div>
   <div style="position:relative;font-weight:700;font-size:190px;line-height:1.02;letter-spacing:-4px">Galaxy Z<br>Fold8</div>
   <div style="position:relative;font-weight:600;font-size:96px;margin-top:70px">Galaxy AI</div></div>`],
];
(async()=>{const b=await chromium.launch();for(const [n,w,h,body] of jobs){const p=await b.newPage({viewport:{width:w,height:h}});
 await p.setContent(`<html><head><style>${css}</style></head><body>${body}</body></html>`);await p.evaluate(()=>document.fonts.ready);
 await p.screenshot({path:path.join(__dirname,'../tex',n+'.png')});await p.close()}await b.close()})();
