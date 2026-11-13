# Galaxy Z Fold8 Ultra + Fold8 reklamı — çalışma notları

- Kaynak: `source/samsung_film.mp4` (35,10 s, 1280x720, 25 fps). Ses tamamen atılır.
- Hız: her şey doğal hızda kurgulanır, sonra 1.2x. 25 fps kaynak × 1.2 = 30 fps teslim (kare kaybı yok). Son kart 1.5 s sabit.
- Motor: three.js (yerel `node_modules/three@0.170.0`), headless Chrome WebGL2 (SwiftShader), `renderFrame(f)` deterministik.
- Cycles testi: basit sahne, 1080p, 256 spp, 4 çekirdek → 93,6 s/kare, Blender 4.0.2 apt paketinde OIDN yok → kullanılmıyor.
- samsung.com / news.samsung.com bu ortamdan erişilemiyor (DNS engelli); resmi 3D (.glb/.usdz) kontrolü yapılamadı.
- Baskılı yazı kararları: src 17.6–19.8 ("New shape Unfolds") ve 19.6–20.8 ("So flat") ekran ortasında → S7b/S7c 3D.
  S4 "Ultra camera" (x≥700, y 318–388): delogo iz bırakıyor → kırpma (16:9) / dikey kadraj (9:16) + 3D lens adası.
- Renkler (filmden): stüdyo kenar #A395BD, merkez #CABCDD, packshot açık #E6D8FB; Violet Shadow ~#3A2838; Lavender ~#C2B4C8.
- Fazlar: 1 storyboard ✔ · 2 motor · 3 3D görünüm testi · 4 ilk önizleme · 5 düzeltmeler · 6 ses · 7 final.
