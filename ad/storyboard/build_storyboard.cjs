// Faz 1 storyboard: gerçek karelerle, teslim zaman kodlu (1.2x sonrası)
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const shots=[
 // id, teslim in-out, kaynak, thumb, süper, notlar, 16:9 kırpma [x,y,w,h] (1280x720), 9:16 kırpma x
 ['S1','0.00–1.96','3D','t_1.0.png','Galaxy Z Fold8 Ultra','Ultra yarı açık, sağdan dev giriş. KLİK kapanır 0.26 → 90° 0.65 → DROP: 180° 1.04. HUD hap: açı (°), menteşede çizgi iletki.',null,null,true],
 ['S2','1.96–2.83','src 4.75–5.79','t_5.5.png','Ultra açılıyor.','Sayfa çevirme geçişi (merkez kat çizgisi). 5.8 s’de baskılı “Ultra Unfolds” giriyor → 5.79’da kesiyoruz.',null,470],
 ['S3a','2.83–3.80','src 2.40–3.56','t_3.0.png','—','Menteşe sırtı makro, SAMSUNG gravürü, hayalet “ULTRA” (baskı yazı değil, ürün arka planı).',null,190],
 ['S3b','3.80–4.79','3D','t_4.2.png','4,1 mm','Açık Ultra tam kenardan: jilet çizgisi; çizgi kumpas çeneleri kapanır.',null,null,true],
 ['S4','4.79–6.29','src 8.77–9.74 + 3D','t_9.6.png','200MP Ultra kamera','Baskılı “Ultra camera” x≥700’de; delogo lensin üstünde iz bıraktı → kullanılmaz. 16:9: sarı kutu kırpma (1.8x büyütme), 9:16: camgöbeği. Deklanşör 5.60 → 3D lens adası yakın plan, odak köşeleri.',[0,300,690,388],90],
 ['S5','6.29–7.83','src 7.05–7.84 / 10.90–11.96','t_7.4.png','Ve karşınızda','Parmak şıklatma; şıklatmada kes → iki telefon yan yana (11.5 karesi aşağıda). 9:16: Ultra’dan Fold8’e pan.',null,560],
 ['S5b','','src 10.90–11.96','t_11.5.png','Ve karşınızda (devam)','İki el, iki telefon. Temiz.',null,330],
 ['S6','7.83–8.75','src 13.90–14.98','t_14.4.png','Galaxy Z Fold8','Fold8 kapak ekranı, hayalet “FOLD”. 13.85’e kadar baskılı “The all-new…” var → 13.90 sonrası temiz. Süper vuruşta silinerek girer.',null,360],
 ['S7a','8.75–9.35','src 16.60–17.32','t_17.0.png','—','Lavanta tarlası tam kadraj (gerçek tarla görüntüsü).',null,440],
 ['S7b','9.35–10.10','3D (lavanta görüntüsü ekranda)','t_18.0.png','Yeni form açılıyor.','Kaynakta 17.6–19.8 boyunca “New shape Unfolds” ekranın tam ortasında → kırpılamıyor. Öneri: geri çekilme 3D’de; lavanta klibi (src 16.6–17.3) açık Fold8 ekranına doku olarak.',null,null,true],
 ['S7c','10.10–10.83','3D','t_20.4.png','Dümdüz.','Kaynakta 19.6–20.8 “So flat” ekranın ortasında → kullanılamaz. Öneri: açık Fold8 eğilip kenardan görünür, çizgi cetvel üstünden kayar.',null,null,true],
 ['S8','10.83–12.46','3D','t_23.5.png','Samsung’un en hafif Fold’u','Fold8 süzülür, çizgi sayaç 0 → 201 g (tik sesleri). Sonra iki telefon dönüp arkalarını gösterir.',null,null,true],
 ['S9','12.46–14.17','3D','t_25.6.png','Galaxy Z Fold8 Ultra | Fold8 · Yepyeni açılış. · Galaxy AI','İki telefon yan yana objektife doğru açılır, iki ekran kadrajı doldurur; kapanış yazıları ekranların içinde.',null,null,true],
 ['EC','14.17–15.67','Son kart','logo_full.png','SAMSUNG / × / maybeta','Wordmark src 29.5’ten luma matte (çizim yok). Ortalı, üst üste. Başka hiçbir şey yok.',null,null],
];
const img=f=>'data:image/png;base64,'+fs.readFileSync(path.join(__dirname,'frames',f)).toString('base64');
const fontcss=['400','600','700'].map(w=>fs.readFileSync(require.resolve(`@fontsource/inter/${w}.css`,{paths:[path.join(__dirname,'..')]}),'utf8')
 .replace(/url\(\.\/files\/([^)]+)\)/g,(m,f)=>`url(data:font/woff2;base64,${fs.readFileSync(path.join(__dirname,'../node_modules/@fontsource/inter/files',f)).toString('base64')})`)).join('\n');
const card=s=>{const [id,tc,src,th,sup,note,c169,c916,is3d]=s;
 let ov='';if(c169)ov+=`<div class=box style="left:${c169[0]/2}px;top:${c169[1]/2}px;width:${c169[2]/2}px;height:${c169[3]/2}px;border-color:#FFD400"></div>`;
 if(c916!=null)ov+=`<div class=box style="left:${c916/2}px;top:0;width:202px;height:360px;border-color:#00E5FF;border-style:dashed"></div>`;
 return `<div class=card><div class=th><img src="${img(th)}" style="${is3d?'opacity:.38;filter:saturate(.6)':''}">${ov}
 ${is3d?'<div class=tag3d>3D render · kaynak = modelleme referansı</div>':''}<div class=tc>${id} · ${tc}</div></div>
 <div class=meta><div class=src>${src}</div><div class=sup>${sup}</div><div class=note>${note}</div></div></div>`};
const html=`<html><head><meta charset=utf-8><style>${fontcss}
body{margin:0;background:#1c1824;color:#eee;font-family:Inter;width:2040px;padding:30px;box-sizing:border-box}
h1{font-weight:700;font-size:40px;margin:0 0 6px}.sub{color:#bbb;font-size:20px;margin-bottom:24px}
.grid{display:grid;grid-template-columns:repeat(3,640px);gap:26px 30px}
.card{background:#2a2433;border-radius:10px;overflow:hidden}.th{position:relative;width:640px;height:360px;background:#B9A6D6}
.th img{width:640px;height:360px;display:block}.box{position:absolute;border:3px solid;box-sizing:border-box}
.tc{position:absolute;left:10px;top:10px;background:rgba(0,0,0,.7);padding:4px 10px;border-radius:5px;font-weight:700;font-size:20px}
.tag3d{position:absolute;right:10px;bottom:10px;background:#5b3d73;padding:4px 10px;border-radius:5px;font-size:16px;font-weight:600}
.meta{padding:12px 16px 16px}.src{color:#c9b3ec;font-size:16px;font-weight:600}.sup{font-size:26px;font-weight:700;margin:6px 0}.note{font-size:15px;color:#ccc;line-height:1.35}
.row{display:flex;gap:30px;margin-top:30px;align-items:flex-start}.panel{background:#2a2433;border-radius:10px;padding:18px}
.sw{display:inline-block;width:150px;height:80px;border-radius:6px;margin-right:8px;vertical-align:top;font-size:14px;padding:6px;box-sizing:border-box;color:#222;font-weight:600}
.glyph{padding:22px 26px;border-radius:8px;background:linear-gradient(135deg,#A698C0,#CEC0E0);color:#fff}
</style></head><body>
<h1>Galaxy Z Fold8 Ultra + Fold8 — Faz 1 storyboard</h1>
<div class=sub>Zaman kodları teslim süresi (1.2x hızlandırma sonrası). “src” = Samsung filmi saniyesi (doğal hız). Sarı = 16:9 kırpma, camgöbeği kesikli = 9:16 kadraj. Soluk kareler 3D çekimlerin referansıdır.</div>
<div class=grid>${shots.map(card).join('')}</div>
<div class=row>
 <div class=panel style="width:620px"><div class=src>Stüdyo renkleri (filmden ölçüldü)</div><br>
 <div class=sw style="background:#A395BD">kenar #A395BD</div><div class=sw style="background:#BBB0D5">kenar açık #BBB0D5</div><div class=sw style="background:#CABCDD">merkez #CABCDD</div><br><br>
 <div class=sw style="background:#E6D8FB">packshot açık #E6D8FB</div><div class=sw style="background:#3A2838;color:#eee">Violet Shadow ~#3A2838</div><div class=sw style="background:#C2B4C8">Lavender ~#C2B4C8</div></div>
 <div class=panel><div class=src>Ekran duvar kâğıdı referansı (filmden)</div><br><img src="${img('wall_ultra.png')}" height=260> <img src="${img('wall_fold8.png')}" height=260></div>
 <div class=panel style="flex:1"><div class=src>Inter Türkçe karakter testi</div><br>
  <div class=glyph><div style="font-weight:700;font-size:54px">İı Ğğ Şş Çç Öö Üü</div>
  <div style="font-weight:600;font-size:34px;margin-top:8px">Ultra açılıyor. Dümdüz. Yepyeni açılış.</div>
  <div style="font-weight:400;font-size:28px;margin-top:6px">Samsung’un en hafif Fold’u · Ve karşınızda · 4,1 mm · 201 g</div></div>
  <div class=glyph style="background:#EFE7F8;color:#2a1f33;margin-top:12px;font-weight:600;font-size:30px">KÜÇÜK GÖRÜNÜM: İSTANBUL · ışık · ğüşiöç</div></div>
</div></body></html>`;
fs.writeFileSync(path.join(__dirname,'storyboard.html'),html);
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:2040,height:1000}});
 await p.setContent(html);await p.evaluate(()=>document.fonts.ready);
 await p.screenshot({path:path.join(__dirname,'faz1_storyboard.png'),fullPage:true});await b.close()})();
