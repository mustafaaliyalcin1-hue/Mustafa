# 🦉 Konuşan Baykuş — Türkçe Telaffuz Pekiştirme (Taslak)

1. ve 2. sınıf öğrencileri için, yapay zekâ ile sesli okuma ve telaffuz çalışması yapılan uygulama taslağı.
Çocuk cümleyi dinler, mikrofona söyler; **Bilge Baykuş** söyleneni dinler:

- **Doğruysa** tebrik eder, yıldız verir ve otomatik olarak sonraki cümleye geçer.
- **Yanlışsa** hangi kelimenin/sesin hatalı olduğunu renkle gösterir ve nasıl düzelteceğini anlatır
  (ör. *“süt: ü yerine u gibi duydum. ü sesinde dudakların u gibi yuvarlak, dilin i gibi önde olsun”*).
  Cümleyi hece hece yavaş okuyabilir; 2 denemeden sonra “Sonrakine geç” seçeneği çıkar.

## Etkinlikler

| Etkinlik | Tür | Açıklama |
|---|---|---|
| 🎤 Dinle ve Söyle | Konuşma | Kelimeler → kısa cümleler → uzun cümleler → tekerlemeler (4 seviye) |
| 🔠 Harflerin Sesi | Dinleme | 29 harf, örnek kelime, resim ve ağız/dil ipucu |
| 👂 Zor Sesler | Dinleme + Konuşma | ı-i, o-ö, u-ü, s-ş, c-ç, k-g çiftleri: önce hangisini duyduğunu bul, sonra kendin söyle |
| 🖼️ Dinle Bul | Dinleme | Kelimeyi dinle, doğru resmi seç |
| 🧩 Hece Yapbozu | Okuma | Heceleri doğru sırayla dizerek kelimeyi kur |

İlerleme ve yıldızlar cihazda saklanır.

## Nasıl çalıştırılır?

Kurulum gerekmez, dosyaları bir web sunucusundan açmak yeterli:

```bash
python3 -m http.server 8000
# Tarayıcıda: http://localhost:8000
```

> Mikrofon için sayfa **https** veya **localhost** üzerinden açılmalıdır.
> Ses tanıma en iyi **Android ve bilgisayarda Google Chrome**'da çalışır (internet gerekir).

## Teknik yapı

- `index.html`, `styles.css` — arayüz (telefona uygun, karanlık mod destekli)
- `app.js` — etkinlikler, ses ve **telaffuz koçu**
  - Dinleme: tarayıcının Türkçe sesi (`speechSynthesis`, tr-TR)
  - Konuşma: yapay zekâ ses tanıma (`SpeechRecognition`, tr-TR, 5 alternatif)
  - Değerlendirme: kelime ve harf düzeyinde hizalama → hatalı sesi bulur → `SOUND_TIPS` ipucunu gösterir
  - Türkçe hece bölme kuralıyla yavaş, hece hece okuma
- `data.js` — tüm kelime/cümle/ipucu içeriği (öğretmen kolayca yeni içerik ekleyebilir)
- `manifest.json`, `sw.js` — telefona yüklenebilir uygulama (PWA), çevrimdışı açılış

## Google Play'de yayınlama yol haritası

1. Uygulamayı bir https adresinde yayınla (GitHub Pages / Firebase Hosting).
2. PNG ikonları üret (192×192, 512×512) ve `manifest.json`'a ekle.
3. Google'ın **Bubblewrap** aracıyla PWA'yı Android paketine (TWA, `.aab`) dönüştür.
4. Google Play Console'da uygulama oluştur; **“Aileler / Çocuklar için”** politikalarını doldur
   (gizlilik politikası, mikrofon izni açıklaması, yaş grubu 6–8).
5. Dahili test → kapalı test → yayın.

## Sonraki adımlar (öneriler)

- Daha akıllı geri bildirim için sunucu tarafında bir yapay zekâ modeli (ör. Claude) ile kişiselleştirilmiş, çocuk diline uygun açıklamalar
- Öğretmen paneli: sınıf ve öğrenci bazında ilerleme
- MEB 1. ve 2. sınıf Türkçe ders kitabı temalarına göre içerik
- Kaydedilen sesi çocuğa geri dinletme
- Rozetler, günlük görevler
