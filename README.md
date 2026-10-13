# 🦉 Konuşan Baykuş — Türkçe Telaffuz Pekiştirme

1. ve 2. sınıf öğrencileri için, yapay zekâ destekli Türkçe telaffuz ve sesli okuma uygulaması.
Çocuk cümleyi dinler, mikrofona söyler; **Bilge Baykuş** dinler:

- **Doğruysa:** tebrik eder, yıldız ve konfeti verir, **kendiliğinden sonraki cümleye geçer**.
- **Çok yaklaştıysa (uzun cümlede küçük bir hata):** doğru sayar, kısa bir ipucu ekler.
- **Yanlışsa:** hatalı kelimeyi renklendirir, hangi sesin karıştığını bulur ve
  **nasıl doğru söyleneceğini hem yazılı hem sesli anlatır**. Örnek:
  > *kuş → “kus” duydum. “ş” yerine “s” söyledin. “ş”de dudaklarını öne uzat, “sus” der gibi: “şşşş” 🤫*

  Ardından kelimeyi hece hece örnekler. 2 denemeden sonra “Sonrakine geç” seçeneği çıkar.

## Etkinlikler

| | Etkinlik | Ne yapar? |
|---|---|---|
| 🗣️ | **Dinle ve Söyle** | 6 tema (Ailem, Okulum, Hayvanlar, Doğa, Yiyecekler, Tekerlemeler); 1. ve 2. sınıfa ayrı içerik |
| 📚 | **Hikâye Oku** | Baykuş hikâyeyi kelime kelime vurgulayarak okur (karaoke), sonra çocuk cümle cümle okur |
| 🦸 | **Zor Seslerim** | **Kişisel**: çocuğun zorlandığı seslere göre kelime seçer |
| 🔠 | **Harflerin Sesi** | 29 harf: ses, örnek kelime, resim, ağız/dil ipucu ve “Ben söyleyeyim” |
| 🎧 | **Benzer Sesler** | ı-i, o-ö, u-ü, s-ş, c-ç, r-l, k-g: dinle, seç, sonra kendin söyle |
| 🖼️ | **Dinle Bul** | Kelimeyi dinle, doğru resmi bul |
| 🧩 | **Hece Yapbozu** | Heceleri sırayla dizerek kelimeyi kur (sınıfa göre zorluk) |
| 🔍 | **Eksik Ses** | Kelimede eksik olan, karıştırılan sesi bul |

**Motivasyon:** yıldızlar, günlük hedef (15 ⭐), gün serisi 🔥, 8 rozet, baykuş maskot, ses efektleri.

**Veli / Öğretmen paneli** (çocuklar için uygulamalarda Google Play'in istediği çarpma sorulu kapının arkasında):
doğruluk oranı, ilk denemede doğru oranı, son 7 gün grafiği, zorlanılan sesler, konu bazında ilerleme,
rozetler; ad/sınıf/avatar, okuma hızı, ses efektleri ayarları ve sıfırlama.

## Çalıştırma

Kurulum gerekmez:

```bash
npm start          # = python3 -m http.server 8000
# Tarayıcıda: http://localhost:8000
npm test           # değerlendirme motoru testleri
```

> Mikrofonun çalışması için sayfa **https** veya **localhost** üzerinden açılmalıdır.
> Ses tanıma en iyi **Android ve bilgisayarda Google Chrome**'da çalışır (internet gerekir).
> Tarayıcıda ses tanıma yoksa öğretmen/veli “Doğru okudu” düğmesiyle değerlendirebilir.

## Teknik yapı

```
index.html, styles.css         Arayüz (telefon öncelikli, karanlık mod, erişilebilir)
js/main.js                     Giriş noktası
js/ui.js                       Yönlendirme, baykuş maskot, bildirimler
js/speech.js                   Dinleme (speechSynthesis tr-TR) + konuşma (SpeechRecognition tr-TR)
js/coach.js                    ★ Telaffuz koçu: kelime/harf hizalama, hata tespiti, ipucu
js/tips.js                     Her sesin nasıl söylendiği + sık karışan sesler için ipuçları (r→l, ş→s, ç→c…)
js/text.js                     Türkçe küçültme, heceleme, benzerlik
js/content.js                  Tüm içerik (temalar, hikâyeler, kelimeler) — kolayca düzenlenebilir
js/store.js                    Cihazda ilerleme, istatistik, rozetler
js/fx.js                       Ses efektleri, konfeti
js/activities/*.js             Ekranlar
tests/coach.test.js            14 birim testi
privacy.html                   Gizlilik politikası (Play Store için gerekli)
manifest.json, sw.js, icons/   Telefona yüklenebilir uygulama (PWA), çevrimdışı açılış
```

**Değerlendirme nasıl çalışır?** Ses tanımanın en fazla 5 tahmini, hedef cümleyle kelime kelime hizalanır
(eksik/fazla kelimeye ve kelimelerin birleşmesine dayanıklı). Uymayan her kelimede harf düzeyinde fark bulunur;
örneğin “ü” yerine “u” söylendiyse `tips.js` içindeki ilgili ipucu gösterilir ve sesli okunur. Karışan her ses
istatistiğe yazılır ve **Zor Seslerim** etkinliği bunlardan oluşturulur.

## Google Play'de yayınlama

1. Uygulamayı bir https adresinde yayınla (GitHub Pages veya Firebase Hosting).
2. Google'ın **Bubblewrap** aracıyla Android paketine (`.aab`) dönüştür (Trusted Web Activity):
   `npx @bubblewrap/cli init --manifest https://<adres>/manifest.json`
3. Play Console'da: **Aileler / Öğretmen Onaylı** bölümünde hedef kitle 6–8 yaş,
   gizlilik politikası (`privacy.html`, iletişim e-postasını doldur) ve mikrofon izni açıklaması.
4. Dahili test → kapalı test (öğretmen/veliler) → yayın.

## Sonraki adımlar

- Sunucu tarafında bir yapay zekâ modeli (ör. Claude) ile daha kişisel geri bildirim
- Öğretmen paneli: birden çok öğrenci için sınıf raporu
- İçeriği MEB 1–2. sınıf Türkçe ders kitabı temalarına göre genişletme
- Çocuğun kendi sesini kaydedip geri dinletme
