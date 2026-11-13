// Kendi duvar kâğıdımız: pembe/mor kurdele "8", 12:45 saat, Türkçe tarih. node wallpaper.cjs <ad> <genişlik> <yükseklik> [saat=1]
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const [name,W,H,clock='1']=process.argv.slice(2);const w=+W,h=+H;
const font=w2=>fs.readFileSync(path.join(__dirname,`../fonts/Inter-${w2}.ttf`)).toString('base64');
const html=`<html><head><style>@font-face{font-family:I;src:url(data:font/ttf;base64,${font(600)})}@font-face{font-family:I4;src:url(data:font/ttf;base64,${font(400)})}
body{margin:0}</style></head><body><canvas id=c width=${w} height=${h}></canvas><script>
(async()=>{await document.fonts.load('600 40px I');await document.fonts.load('400 40px I4');
const c=document.getElementById('c'),g=c.getContext('2d'),W=${w},H=${h};
let bg=g.createLinearGradient(0,0,W*0.3,H);bg.addColorStop(0,'#F3E3F4');bg.addColorStop(0.5,'#F6D5E0');bg.addColorStop(1,'#DCCBF2');g.fillStyle=bg;g.fillRect(0,0,W,H);
let rg=g.createRadialGradient(W*0.8,H*0.15,0,W*0.8,H*0.15,W*0.9);rg.addColorStop(0,'rgba(255,214,200,0.55)');rg.addColorStop(1,'rgba(255,214,200,0)');g.fillStyle=rg;g.fillRect(0,0,W,H);
// kurdele 8: dikey sekiz, üst üste yarı saydam şeritler
const S=Math.min(W,H*0.62),cx=W/2,cy=H*0.60,A=S*0.42,B=H*0.30;
const pt=(t,o)=>{const x=cx+A*Math.sin(2*t)/1.6, y=cy-B*Math.sin(t);const dx=A*2*Math.cos(2*t)/1.6, dy=-B*Math.cos(t);const L=Math.hypot(dx,dy)||1;return [x-dy/L*o,y+dx/L*o]};
const cols=[[238,120,170],[225,120,200],[176,120,226],[140,110,220],[246,160,180]];
const N=70,wid=S*0.24;
for(let k=0;k<N;k++){const o=(k/(N-1)-0.5)*wid;const col=cols[Math.floor(k/N*cols.length)];
 g.beginPath();for(let i=0;i<=600;i++){const t=i/600*Math.PI*2;const [x,y]=pt(t,o*(0.55+0.45*Math.cos(t*3+1.2)));i?g.lineTo(x,y):g.moveTo(x,y)}
 const sh=0.55+0.45*Math.sin(k/N*Math.PI);g.strokeStyle=\`rgba(\${col[0]},\${col[1]},\${col[2]},\${0.16*sh})\`;g.lineWidth=S*0.014;g.stroke()}
// parlak kenar
g.beginPath();for(let i=0;i<=600;i++){const t=i/600*Math.PI*2;const [x,y]=pt(t,wid*0.5*(0.55+0.45*Math.cos(t*3+1.2)));i?g.lineTo(x,y):g.moveTo(x,y)}g.strokeStyle='rgba(255,255,255,0.55)';g.lineWidth=S*0.004;g.stroke();
if(${clock}){g.fillStyle='rgba(255,255,255,0.96)';g.textAlign='center';g.font='400 '+(H*0.028)+'px I4';g.fillText('Çar, 22 Temmuz',W/2,H*0.115);
 g.font='600 '+(H*0.105)+'px I';g.fillText('12:45',W/2,H*0.215)}
window.done=1})();
</script></body></html>`;
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:w,height:h}});await p.setContent(html);await p.evaluate(()=>document.fonts.ready);await p.waitForFunction(()=>window.done);
const d=await p.evaluate(()=>document.getElementById('c').toDataURL('image/png'));fs.writeFileSync(path.join(__dirname,'../tex',name+'.png'),Buffer.from(d.split(',')[1],'base64'));await b.close()})();
