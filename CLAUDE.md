# Proje notları

- Kullanıcıyla Türkçe konuş.
- Tepetaklak Rampa oyunu: `rampa/index.html` (tek dosya). Her önemli güncellemeden sonra kısa bir tanıtım videosu yap
  (kullanıcı istedi): oyundan sahne sahne çekim `video/scripts/*_cekim.cjs`, kurgu `video/src/fragman/*.tsx` (Remotion),
  müzik `video/public/fragman/muzik.mp3`, çıktı `rampa/<ad>.mp4`; videoyu kullanıcıya dosya olarak gönder.
- Dikey Instagram tanıtımı (1080x1920): `video/src/reels/TanitimReels.tsx`. Claude Stüdyo eklentileri kullanılmıyor (kullanıcı kapattırdı);
  videolar her zamanki gibi oyundan çekim + Remotion kurgusuyla yapılır.
- İl simgeleri: `LANDM.defs` (plaka → yerler), modeller `LMK`. Diyarbakır'a (21) hiçbir şey konmayacak (kullanıcı istedi).
- Fütüristik tasarım ana uygulamaya taşındı (kullanıcı ayrı panel istemedi): ana ekran "komuta merkezi" `js/activities/home.js`,
  tema `styles.css` sonundaki "FÜTÜRİSTİK TEMA" bölümü (bulanıklık yok, iPhone siyah ekran yapıyordu). `panel/` yalnızca uygulamaya yönlendirir;
  `arayuz/` (React + Tailwind v4 bileşenleri) kaynak olarak duruyor, derlemesi `arayuz/dist`.
- Hata Kumandası: `kumanda/index.html` (tek dosya) → localStorage `konusan-arkadasim:hatalar` ile ana uygulamada bilerek hata açar/kapatır;
  uygulama tarafı `js/chaos.js` + `styles.css` (bug-*). Uzaktan: Yönetim paneli (#/parent) en altındaki "Sürüm 2.4.0 · Yapı <kod>" satırındaki 6 haneli kod — sürüm kodu gibi görünür, kumanda
  geçmez (kullanıcı istedi; uygulamadan kumandaya bağlantı yok) → ntfy.sh konusu `ka-surum-<kod>` (kumanda POST eder, uygulama SSE ile dinler). Hatalar ilerlemeye dokunmaz. `main` dalı da proje dalıyla güncel tutulur.
