# Proje notları

- Kullanıcıyla Türkçe konuş.
- Tepetaklak Rampa oyunu: `rampa/index.html` (tek dosya). Her önemli güncellemeden sonra kısa bir tanıtım videosu yap
  (kullanıcı istedi): oyundan sahne sahne çekim `video/scripts/*_cekim.cjs`, kurgu `video/src/fragman/*.tsx` (Remotion),
  müzik `video/public/fragman/muzik.mp3`, çıktı `rampa/<ad>.mp4`; videoyu kullanıcıya dosya olarak gönder.
- Dikey Instagram tanıtımı (1080x1920): `video/src/reels/TanitimReels.tsx`. Claude Stüdyo eklentileri kullanılmıyor (kullanıcı kapattırdı);
  videolar her zamanki gibi oyundan çekim + Remotion kurgusuyla yapılır.
- İl simgeleri: `LANDM.defs` (plaka → yerler), modeller `LMK`. Diyarbakır'a (21) hiçbir şey konmayacak (kullanıcı istedi).
- Öğrenme paneli (fütüristik arayüz): kaynak `arayuz/` (React + Tailwind v4, bileşenler `arayuz/src/components/ui/`),
  `cd arayuz && npm install && npm run build` → çıktı `panel/` (commit edilir, GitHub Pages'te /panel/). İçeriği ana uygulamanın `js/` dosyalarından okur.
- Hata Kumandası: `kumanda/index.html` (tek dosya) → localStorage `konusan-arkadasim:hatalar` ile ana uygulamada bilerek hata açar/kapatır;
  uygulama tarafı `js/chaos.js` + `styles.css` (bug-*). Hatalar ilerlemeye dokunmaz. `main` dalı da proje dalıyla güncel tutulur.
