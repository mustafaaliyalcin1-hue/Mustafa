# Uzak Kumanda — Adım Adım Kurulum Rehberi

Bu rehber, telefondan bilgisayarını kontrol edebilmen için gereken her adımı sırasıyla anlatır.
Toplam süre: yaklaşık **10 dakika** (sadece ilk seferde).

---

## Neye ihtiyacın var?

- Kontrol edilecek bir **bilgisayar** (Windows 10/11, Mac ya da Linux)
- Bir **telefon** (Android ya da iPhone, herhangi bir tarayıcı yeterli)
- İkisinin de bağlı olduğu **aynı Wi-Fi ağı** (aynı modem)
- `uzak_kumanda.zip` dosyası

> Telefona uygulama yüklemen gerekmez. Telefonda sadece tarayıcı (Chrome, Safari…) kullanılır.

---

## BÖLÜM 1 — Bilgisayara Python kurmak (sadece bir kere)

Uygulama Python ile çalışır. Bilgisayarında yoksa kurman gerekir.

### Windows

1. Bilgisayarda tarayıcıyı aç ve şu adrese git: **https://www.python.org/downloads/**
2. Sarı **"Download Python 3.x.x"** düğmesine tıkla. Bir kurulum dosyası iner
   (adı `python-3.x.x-amd64.exe` gibi bir şeydir).
3. İnen dosyaya çift tıkla.
4. ⚠️ **ÇOK ÖNEMLİ:** Açılan pencerenin en altında
   **"Add python.exe to PATH"** yazan bir kutu var. **Bu kutuyu mutlaka işaretle.**
   İşaretlemezsen uygulama çalışmaz.
5. **"Install Now"** yazısına tıkla.
6. "Bu uygulamanın cihazınızda değişiklik yapmasına izin veriyor musunuz?" diye sorarsa **Evet** de.
7. Kurulum bitince **"Setup was successful"** yazar. **Close** ile kapat.

**Kurulduğunu kontrol etmek istersen:**
- Klavyede `Windows` tuşuna bas, `cmd` yaz, Enter'a bas. Siyah bir pencere açılır.
- İçine `python --version` yazıp Enter'a bas.
- `Python 3.12.x` gibi bir şey yazıyorsa her şey tamam. Pencereyi kapatabilirsin.
- "Python bulunamadı" yazıyorsa veya Microsoft Store açılıyorsa → 4. adımdaki kutu işaretlenmemiştir.
  Python kurulum dosyasını tekrar çalıştır, **"Modify"** de, sonraki ekranda
  **"Add Python to environment variables"** kutusunu işaretle ve bitir.

### Mac

1. **https://www.python.org/downloads/** adresinden Python'u indir.
2. İnen `.pkg` dosyasını aç ve **Devam / Kabul / Yükle** diyerek kurulumu bitir.

---

## BÖLÜM 2 — Uygulamayı bilgisayara yerleştirmek

1. `uzak_kumanda.zip` dosyasını bilgisayara indir (örneğin İndirilenler klasörüne).
2. Zip dosyasına **sağ tıkla → "Tümünü ayıkla…" → "Ayıkla"** de.
   (Mac'te zip dosyasına çift tıklaman yeterli.)
3. Açılan klasörü kalıcı bir yere taşı, örneğin **Belgeler** içine. Adı `uzak_kumanda` olabilir.

Klasörün içinde şunlar olmalı:

| Dosya | Ne işe yarar |
|---|---|
| `baslat.bat` | Windows'ta uygulamayı başlatır (bunu kullanacaksın) |
| `baslat.sh` | Mac/Linux'ta başlatır |
| `uzak_kontrol.py` | Uygulamanın kendisi |
| `kumanda.html` | Telefonda görünen ekran |
| `gereksinimler.txt` | Gerekli ek paketlerin listesi |

> ⚠️ Zip'i ayıklamadan, zip'in içinden çift tıklayarak çalıştırma. Önce mutlaka ayıkla.

---

## BÖLÜM 3 — Uygulamayı ilk kez çalıştırmak

### Windows

1. Klasördeki **`baslat.bat`** dosyasına çift tıkla.
2. **Mavi bir "Windows bilgisayarınızı korudu" uyarısı** çıkarsa:
   **"Ek bilgi"** yazısına tıkla → **"Yine de çalıştır"** düğmesine bas.
   (Bu dosyayı internetten indirdiğin için çıkar. Dosya sadece uygulamayı başlatır.)
3. Siyah bir pencere açılır. İlk seferde gerekli paketleri internetten indirir.
   Bu **1-2 dakika** sürebilir, bekle.
4. **Güvenlik duvarı penceresi** çıkarsa ("Windows Defender Güvenlik Duvarı bu uygulamanın
   bazı özelliklerini engelledi"):
   - **"Özel ağlar"** kutusunun işaretli olduğundan emin ol,
   - **"Erişime izin ver"** düğmesine bas.
   - Bunu yapmazsan telefon bilgisayara bağlanamaz.
5. Siyah pencerede şöyle bir yazı görürsün:

```
==============================================
  UZAK KUMANDA calisiyor
  Telefonda ac :  http://192.168.1.25:8765
  PIN          :  396849
  (Telefon ve bilgisayar ayni Wi-Fi'da olmali)
  Kapatmak icin bu pencereyi kapat / Ctrl+C
==============================================
```

Buradaki **adresi** ve **PIN'i** bir kenara not al. (Senin numaraların farklı olacak.)

> ⚠️ Bu siyah pencere açık kaldığı sürece uygulama çalışır. **Pencereyi kapatma**, simge durumuna küçültebilirsin.

### Mac

1. **Terminal**'i aç (Spotlight'a `Terminal` yaz).
2. `cd ` yaz (sonunda bir boşluk bırak), klasörü Terminal penceresine sürükleyip bırak, Enter'a bas.
3. `sh baslat.sh` yazıp Enter'a bas.
4. İlk seferde Mac iki izin isteyecek. **Sistem Ayarları → Gizlilik ve Güvenlik** bölümünde:
   - **Erişilebilirlik** → Terminal'i aç (fare/klavye kontrolü için)
   - **Ekran Kaydı** → Terminal'i aç (ekranı telefonda görmek için)
5. İzinleri verdikten sonra Terminal'i kapatıp 1-3. adımları tekrarla.

---

## BÖLÜM 4 — Telefondan bağlanmak

1. Telefonun **bilgisayarla aynı Wi-Fi'a** bağlı olduğundan emin ol
   (mobil veri ile değil, Wi-Fi ile).
2. Telefonda **Chrome** veya **Safari**'yi aç.
3. Üstteki adres çubuğuna, siyah pencerede yazan adresi **aynen** yaz.
   Örnek: `http://192.168.1.25:8765`
   - Başındaki `http://` ve sonundaki `:8765` dahil yaz.
4. Açılan ekranda **PIN'i** gir ve **Bağlan**'a bas.
5. Bilgisayarın ekranı telefonda görünür. 🎉

Telefon PIN'i hatırlar, bir dahakine tekrar sormaz.

### Uygulama gibi kullanmak için (önerilir)

Her seferinde adresi yazmamak için ana ekrana ekle:

- **Android (Chrome):** sağ üstteki **⋮** menüsü → **"Ana ekrana ekle"**
- **iPhone (Safari):** alttaki **Paylaş** (kare ve ok) düğmesi → **"Ana Ekrana Ekle"**

Telefonun ana ekranında bir simge çıkar. Ona dokunarak doğrudan açılır.

---

## BÖLÜM 5 — Kullanım

### Üstteki düğmeler

| Düğme | Ne yapar |
|---|---|
| 🟢 / 🔴 nokta | Yeşilse bağlantı var, kırmızıysa yok |
| **📺 Ekran** | Bilgisayar ekranını görerek kontrol |
| **🖱️ Touchpad** | Dizüstü bilgisayar touchpad'i gibi kontrol |
| **HD** | Daha net görüntü (biraz daha yavaş) |

### Ekran modunda

- **Bir yere dokun** → orası tıklanır
- **Uzun bas** (yarım saniye) → sağ tık
- **Parmağını sürükle** → fare imleci parmağını takip eder
- **İki parmakla yukarı/aşağı kaydır** → sayfa kaydırma

### Touchpad modunda

- **Parmağını kaydır** → fare hareket eder (hızlı kaydırınca daha uzağa gider)
- **Kısa dokun** → sol tık
- **Uzun bas** → sağ tık
- **İki parmakla kaydır** → sayfa kaydırma

### Alttaki düğmeler

- **Sol tık / Çift tık / Sağ tık** — farenin olduğu yerde tıklar
- **Basılı tut** — sol tuşu basılı tutar (bir şeyi sürüklemek için). Bırakmak için tekrar bas.
- **Yaz ve Gönder** — telefonda yazdığın metni bilgisayara yazar. Türkçe karakterler çalışır.
  Kutu boşken klavyedeki Enter'a basarsan bilgisayara Enter gönderir.
- **Enter / Sil / Esc** — tek tuş
- **Tuşlar ▾** — açınca daha fazlası: ok tuşları, Tab, Windows tuşu, Alt+Tab,
  Kopyala, Yapıştır, Geri al, Pencere kapat, Masaüstü, F5, Tam ekran, ses aç/kıs/kapat, oynat/durdur

> 💡 **Ekranı büyük görmek için telefonu yan çevir.**

---

## BÖLÜM 6 — Her gün kullanım

1. Bilgisayarda **`baslat.bat`**'a çift tıkla (siyah pencere açılsın).
2. Telefonda ana ekrandaki simgeye dokun.
3. İşin bitince siyah pencereyi kapat.

### Bilgisayar açılınca kendiliğinden başlasın istersen (Windows)

1. `baslat.bat`'a **sağ tıkla → "Kısayol oluştur"**.
2. Klavyede `Windows + R`'ye bas, `shell:startup` yaz, Enter'a bas. Bir klasör açılır.
3. Oluşturduğun kısayolu bu klasöre taşı.

Artık bilgisayar her açıldığında uygulama kendiliğinden başlar.

---

## BÖLÜM 7 — Sorun çözme

| Sorun | Çözüm |
|---|---|
| `baslat.bat`'a tıklayınca pencere açılıp hemen kapanıyor / "python tanınmıyor" yazıyor | Python kurulu değil veya **"Add to PATH"** işaretlenmemiş. Bölüm 1'e dön. |
| Telefonda sayfa açılmıyor ("siteye ulaşılamıyor") | 1) Telefon Wi-Fi'da mı, mobil veride mi? 2) Aynı modeme mi bağlılar? 3) Adresi doğru yazdın mı (`http://` ve `:8765` dahil)? 4) Güvenlik duvarına izin verdin mi? (Aşağıya bak) |
| Güvenlik duvarı sorusunu yanlışlıkla kapattım | Başlat menüsüne **"Güvenlik duvarı üzerinden uygulamaya izin ver"** yaz → **Ayarları değiştir** → listede **Python**'u bul → **Özel** kutusunu işaretle → Tamam. |
| Wi-Fi ağı "Ortak" olarak ayarlı | Windows Ayarlar → Ağ ve İnternet → Wi-Fi → bağlı olduğun ağ → **Ağ profili türü: Özel** yap. |
| "PIN yanlış" diyor | Siyah penceredeki PIN'i tekrar kontrol et. 8 kez yanlış girilirse 1 dakika beklemen gerekir. |
| Adres her gün değişiyor | Modem bilgisayara her seferinde farklı numara verebilir. Siyah pencerede yazan güncel adresi kullan. Sabitlemek istersen modem ayarlarından bilgisayara "sabit IP" verilebilir. |
| Tıklamalar yanlış yere gidiyor | Ekran ölçeklendirmesi yüksek olan dizüstü bilgisayarlarda olabilir. Bana haber ver, düzeltelim. |
| Görüntü yavaş / takılıyor | **HD**'yi kapat. Telefonu modeme yaklaştır. |
| Mac'te ekran siyah görünüyor | **Ekran Kaydı** izni verilmemiş. Bölüm 3 → Mac → 4. adım. |

---

## Güvenlik notları

- PIN ilk çalıştırmada rastgele oluşturulur ve klasördeki **`pin.txt`** dosyasına kaydedilir.
  - PIN'i değiştirmek istersen `pin.txt`'yi Not Defteri ile açıp istediğin sayıyı yaz, kaydet,
    uygulamayı yeniden başlat.
  - `pin.txt`'yi silersen bir sonraki açılışta yeni bir PIN üretilir.
- PIN'i kimseyle paylaşma. Aynı Wi-Fi'daki biri PIN'i bilirse bilgisayarını kontrol edebilir.
- Uygulama sadece **ev veya iş ağının içinde** çalışır. Dışarıdan (başka bir yerden, mobil veriyle)
  erişim yoktur ve modemden port açarak bunu sağlamaya çalışma.
- Kullanmadığın zamanlarda siyah pencereyi kapatman en güvenlisidir.
