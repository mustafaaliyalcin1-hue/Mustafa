# Proje notları

- Kullanıcıyla Türkçe konuş.
- Tepetaklak Rampa oyunu: `rampa/index.html` (tek dosya). Her önemli güncellemeden sonra kısa bir tanıtım videosu yap
  (kullanıcı istedi): oyundan sahne sahne çekim `video/scripts/*_cekim.cjs`, kurgu `video/src/fragman/*.tsx` (Remotion),
  müzik `video/public/fragman/muzik.mp3`, çıktı `rampa/<ad>.mp4`; videoyu kullanıcıya dosya olarak gönder.
- Dikey Instagram tanıtımı (1080x1920): `video/src/reels/TanitimReels.tsx`. Claude Stüdyo eklentileri kullanılmıyor (kullanıcı kapattırdı);
  videolar her zamanki gibi oyundan çekim + Remotion kurgusuyla yapılır.
- İl simgeleri: `LANDM.defs` (plaka → yerler), modeller `LMK`. Diyarbakır'a (21) hiçbir şey konmayacak (kullanıcı istedi).
- Minecraft yapay zeka yardımcı: `minecraft-ai/` (Java botu `java/`, Bedrock eklentisi `bedrock/eklenti/scripts/` + köprü `bedrock/kopru.js`,
  ortak Claude beyni `ortak/beyin.js`). Eklenti `npm run eklenti` ile `minecraft-ai/yapay-zeka-yardimci.mcaddon` olarak üretilir;
  testler `npm test` (hızlı) ve `npm run test:sim` (sahte Bedrock dünyasında elmas→netherite). Kurulum notu `minecraft-ai/KURULUM.md`.
