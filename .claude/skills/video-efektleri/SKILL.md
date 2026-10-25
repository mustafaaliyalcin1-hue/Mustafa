---
name: video-efektleri
description: Remotion ile kodla video efektleri. Kullanıcı bir efekt adı söylediğinde (orbit, screen wall, ui world, frame break, digital zoom, phone mockup, checklist, headline wall, zoom-through cut, chart grow, pull-back reveal, green screen, paper cut, doodle boil, vertigo, cover story, glass type, kinetic captions, freeze frame, speed ramp) ya da "bu videoya ... efekti ekle" dediğinde kullan.
---

# Video efektleri (Remotion)

Proje `video/` klasöründe. Remotion kuralları için önce `remotion-best-practices` skill'ini yükle.

## Çalışma şekli

1. Gerekirse `cd video && npm install`.
2. Her efekt `video/src/efektler/<EfektAdi>.tsx` içinde ayrı bir bileşen olsun.
   Var olanlar: `KineticCaptions`, `DoodleBoil`, `ChartGrow`, `Vertigo`.
3. Kullanıcının videosu `video/public/` içine konur ve `@remotion/media` paketinin
   `<Video src={staticFile("...")} />` bileşeniyle gösterilir (`npx remotion add @remotion/media`).
4. Bileşeni `src/Root.tsx` içinde bir `<Composition>` ya da `EfektDemo.tsx` içindeki `<Series>` içine ekle.
5. Kontrol: `npx tsc -p .`, sonra `npx remotion still <Id> out/kare.png --frame=N` ile
   kareye bakıp `npx remotion render <Id> out/video.mp4` ile videoyu çıkar.
6. Tüm animasyonlar `useCurrentFrame()` ile yapılır; CSS transition/animation kullanma.

## Efekt sözlüğü

| Efekt | Ne yapar | Nasıl yapılır |
|---|---|---|
| orbit | Nesneler konuşmacının etrafında döner | `Math.cos/sin(frame/fps*hız)` ile x/y, arkadakiler için `zIndex` ve küçük `scale` |
| screen wall | Ekran görüntülerinden duvar | Kart ızgarası, `spring` ile sırayla içeri girer, duvar yavaşça kayar |
| ui world | Arayüz parçaları 3B alanda süzülür | `perspective` + `translateZ`/`rotateY`, kamera yaklaşması |
| frame break | Nesne video çerçevesinden dışarı taşar | Çerçeveli video + çerçeve dışında maskelenmiş kopya (`clipPath`) |
| digital zoom | Bir noktaya ani yakınlaşma | `transform-origin` hedef noktada, `interpolate` ile `scale` 1→2 |
| phone mockup | Video telefon ekranında | Yuvarlak köşeli telefon kasası içinde `<Video>`, hafif dönme |
| checklist | Maddeler tek tek işaretlenir | Her madde gecikmeli `spring`, onay işareti SVG `strokeDashoffset` ile çizilir |
| headline wall | Haber başlıkları duvarı | Başlık kartları ızgarası, rastgele (`random(seed)`) açı ve gecikme |
| zoom-through cut | Bir nesnenin içinden geçip sonraki sahneye kesme | Sahne A'da hedefe büyük `scale`, `@remotion/transitions` ile geçiş |
| chart grow | Grafik büyür | Çubuk yüksekliği `spring` ile 0→değer |
| pull-back reveal | Yakından uzaklaşıp ortamı gösterir | `scale` 3→1, çevre öğeleri sonradan belirir |
| green screen | Yeşil arka planı silip yenisini koyar | `@remotion/effects` ile chroma key ya da canvas'ta piksel işleme (`effects.md`) |
| paper cut | Kâğıt kesik görünümlü katmanlar | Düzensiz `clipPath` kenarlar, gölge, parçalar `spring` ile kayar |
| doodle boil | El çizimi titreyen çizgiler | Her 2–3 karede `random()` ile değişen SVG yol, `strokeDashoffset` ile çizilme |
| vertigo | Dolly zoom: ön plan sabit, arka plan büyür | Arka plan `scale` artar, ön plan sabit (ön plana `position: relative`) |
| cover story | Dergi kapağı düzeni | Kare videonun üstünde büyük başlık, logo, yan yazılar |
| glass type | Buzlu cam yazı | `backdropFilter: blur()`, yarı saydam arka plan, ince kenar |
| kinetic captions | Kelime kelime hareketli altyazı | `remotion-captions` skill'i; kelime başına `spring` |
| freeze frame | Video durur, kare vurgulanır | `<Video>` için `<Freeze frame={n}>`, üstüne beyaz çerçeve + etiket |
| speed ramp | Hız yavaşlar/hızlanır | Bölümlere ayrılmış `<Sequence>` + `playbackRate`, ya da `<Freeze>`/zaman eşleme |

Sözlükte olmayan bir efekt istenirse adından ne kastedildiğini tahmin et, kısa bir
örnek kareyi `remotion still` ile göster ve kullanıcıya onaylat.
