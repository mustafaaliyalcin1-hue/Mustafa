# Uzak Kumanda — telefondan bilgisayarı kontrol et

## Kurulum (bir kere)
1. Bilgisayara **Python** kur: https://www.python.org/downloads/ (kurarken **"Add Python to PATH"** kutusunu işaretle).
2. Bu `uzak` klasörünü bilgisayara kopyala.

## Çalıştırma
- **Windows:** `baslat.bat` dosyasına çift tıkla.
- **Mac / Linux:** terminalde `./baslat.sh`
  (Mac'te ilk açılışta Sistem Ayarları → Gizlilik → *Erişilebilirlik* ve *Ekran Kaydı* izni ver.)

Pencerede şöyle bir yazı çıkar:
```
Telefonda ac :  http://192.168.1.25:8765
PIN          :  396849
```
Telefonu **aynı Wi-Fi'a** bağla, tarayıcıda bu adresi aç, PIN'i gir. Bitti.
Windows "güvenlik duvarı" sorarsa **Özel ağlar → İzin ver** de.

İpucu: Tarayıcı menüsünden "Ana ekrana ekle" dersen uygulama gibi açılır. Ekranı büyük görmek için telefonu yan çevir.

## Kullanım
- **📺 Ekran modu:** bilgisayar ekranını görürsün. Dokun = o noktaya tıkla, uzun bas = sağ tık, parmağı sürükle = fareyi götür.
- **🖱️ Touchpad modu:** laptop touchpad'i gibi. Kaydır = fare, dokun = tık.
- **İki parmakla kaydır** = sayfa aşağı/yukarı.
- **Yaz ve Gönder** kutusu: telefonda yazdığın metin bilgisayara yazılır (Türkçe karakter dahil).
- **Tuşlar ▾:** ok tuşları, Alt+Tab, kopyala/yapıştır, ses aç/kıs, pencere kapat vb.
- **HD:** daha net görüntü (biraz daha yavaş).

## Güvenlik
- PIN ilk açılışta rastgele üretilir ve `pin.txt`'ye kaydedilir. Değiştirmek istersen bu dosyayı düzenle (silersen yenisi üretilir).
- 8 yanlış PIN denemesinde o cihaz 1 dakika engellenir.
- Sadece ev/iş ağında kullan; modemden dışarıya port açma.
- Port değiştirmek için: `UZAK_PORT=9000` ortam değişkeni.
