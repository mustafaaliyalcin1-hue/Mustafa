# Konuşma Bozucu (gecikmeli işitsel geri bildirim)

Mikrofona konuştuğunu kulaklığa biraz gecikmeli verir. Beyin kendi sesini geç duyunca konuşma takılır, yavaşlar, kekelemeye döner.
Buna DAF (gecikmeli işitsel geri bildirim) deniyor, "SpeechJammer" de bunun bir uygulaması.

**Hangi gecikme?** Araştırmalara göre yetişkinlerde en çok bozan gecikme **~200 ms**. Çocuklarda daha uzun gecikme (~400–500 ms)
daha etkili, yaşlılarda da ~400 ms. Kişiden kişiye değiştiği için 200–500 ms arasını dene.

## 1) Tarayıcı sürümü (kurulum yok)
`index.html`'yi Chrome/Edge ile aç → **Başlat** → mikrofon izni ver. Telefonda da çalışır (kablolu kulaklık daha iyi).
- Hazır ayarlar: 200 ms (en etkili), 300, 500 ms (yarım saniye), 2 sn.
- **Yankı:** gecikmiş sesi tekrar tekrar geri verir, daha da zorlaştırır.
- Program, tarayıcının kendi gecikmesini otomatik düşer; yazan sayı gerçek toplam gecikmedir.

## 2) Bilgisayar programı (Python)
```
pip install sounddevice numpy
python konusma_bozucu.py 200
```
Çalışırken sayı yazıp Enter'a basınca gecikme değişir, `q` ile çıkılır.

⚠️ **Bluetooth kulaklık** kendi başına 150–300 ms gecikme ekler; kablolu kulaklık kullan. Hoparlörle kullanma, cızırtı (geri besleme) yapar.
