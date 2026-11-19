# Osmo 360 → VR canlı önizleme

Osmo 360'ın **canlı** görüntüsünü VR gözlükte (Quest vb.) izlersin; başını çevirdikçe 360° etrafa bakarsın.

## Nasıl çalışır
Osmo 360'ın resmi bir USB webcam modu yok. Canlı görüntü almanın resmi yolu **DJI Mimo'nun canlı yayın (RTMP)** özelliği:

```
Osmo 360 ──Wi-Fi──> Telefon (DJI Mimo, RTMP canlı yayın)
        ──> PC: MediaMTX (RTMP alır, WebRTC'ye çevirir)
        ──> PC: node server.js (HTTPS sayfa)
        ──> VR gözlük tarayıcısı (WebXR, 360° küre)
```
Telefon, PC ve gözlük **aynı Wi-Fi ağında** olmalı.

## Kurulum (bir kere)
1. **Node.js** kur (nodejs.org, LTS).
2. **MediaMTX** indir: github.com/bluenviron/mediamtx/releases → Windows için `mediamtx_..._windows_amd64.zip`.
   Klasöre çıkar, bu klasördeki `mediamtx.yml`'yi onun yanına kopyala (eskisinin üstüne yaz).
3. `mediamtx.yml` içinde `webrtcAdditionalHosts: [192.168.1.100]` satırına **PC'nin IP'sini** yaz
   (`node server.js` açılınca ekrana yazar).
4. Windows'ta güvenlik duvarı sorarsa ikisine de **izin ver** (1935, 8189 UDP, 8443 portları).
5. HTTPS sertifikası için `openssl` gerekir (Git for Windows ile gelir). Yoksa sunucu HTTP açar ama Quest'te VR çalışmaz.

## Her kullanımda
1. `mediamtx.exe`'yi çalıştır.
2. Bu klasörde: `node server.js`, ekrana çıkan adresleri not et.
3. Telefonda **DJI Mimo** → Osmo 360'a bağlan → **Canlı yayın → RTMP** →
   adres: `rtmp://PC-IP:1935/osmo` → yayını başlat. Mimo'da 360° (panoramik) yayın modunu seç.
4. VR gözlük tarayıcısında `https://PC-IP:8443` aç → "güvenli değil" uyarısında **Gelişmiş → Devam et**.
5. **Görüntüyü başlat** → görüntü gelince **ENTER VR**. Artık başını çevirdikçe etrafa bakarsın.

## Ayarlar
- **Görüntü biçimi:** Mimo genelde 360° düz (2:1) gönderir. Görüntü iki daire şeklinde geliyorsa **Çift balıkgözü** seç;
  **lens açısı** ile dikiş yerini düzelt (190 civarı).
- **Yön kaydır:** İlk açılışta "ön" taraf yanlışsa buradan döndür.
- **Kaynak: webcam (USB):** DJI ileride Osmo 360'a webcam modu getirirse (ya da başka bir 360 kamerada) Mimo'ya gerek kalmadan doğrudan çalışır.
  Bu modda sayfayı kamerayı taktığın PC'de aç; gözlüğü Quest Link / Air Link ile PC'ye bağla.

## Gecikme
Sayfa ve MediaMTX tarafı ~0,2–0,5 sn ekler. Toplam gecikmenin çoğu Mimo'nun yayın kodlamasından gelir (genelde 1–2 sn).
Mimo'da düşük çözünürlük/bit hızı seçmek gecikmeyi azaltır.
