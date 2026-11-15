# Her Yerden Bağlanmak (Aynı Wi-Fi Olmadan)

Telefon mobil veride, başka bir evde ya da başka bir şehirdeyken de bilgisayarını kontrol edebilirsin.
Bunun için **Tailscale** adlı ücretsiz bir uygulama kullanıyoruz.

## Tailscale ne yapar?

Bilgisayarın ile telefonun arasında internet üzerinden **sadece ikisinin görebildiği, şifreli bir özel ağ** kurar.
Telefon nerede olursa olsun, bilgisayar ona aynı evdeymiş gibi görünür.

- ✅ Modemde ayar yapmak, port açmak gerekmez.
- ✅ Bağlantı şifrelidir; senin hesabına eklenmemiş hiçbir cihaz bilgisayarına ulaşamaz.
- ✅ Kişisel kullanım ücretsizdir.
- ✅ Uzak Kumanda internete açılmaz. Ona sadece senin cihazların ulaşabilir, üstüne bir de PIN ister.

> ⚠️ Uygulamayı internete açmak için modemden port yönlendirme yapma.
> Uzak Kumanda o şekilde kullanılmak için tasarlanmadı. Bağlantı şifrelenmez ve PIN tek başına yeterli koruma sağlamaz.

---

## Kurulum (bir kere, yaklaşık 5 dakika)

Önce Uzak Kumanda'nın kurulu ve aynı Wi-Fi'dan çalışır durumda olduğundan emin ol (KURULUM.md).

### 1) Bilgisayara Tailscale kur

1. Bilgisayarda **https://tailscale.com/download** adresine git.
2. **Windows** için indir ve kur (Mac'te App Store'dan "Tailscale").
3. Kurulum bitince sağ altta saatin yanında Tailscale simgesi çıkar.
   Bir giriş sayfası açılır. **Google hesabınla** (ya da Microsoft/Apple hesabınla) giriş yap.
4. "Connect" / "Bağlan" de. Simge aktif hâle gelir.

### 2) Telefona Tailscale kur

1. Telefonda **Play Store** (Android) ya da **App Store**'dan (iPhone) **"Tailscale"** uygulamasını indir.
2. Uygulamayı aç, **bilgisayarda kullandığın hesabın aynısıyla** giriş yap. Bu çok önemli.
3. "VPN bağlantısı eklensin mi?" diye sorarsa **İzin ver** de.
4. Açılan listede bilgisayarının adını görmelisin. Görüyorsan ikisi birbirine bağlanmış demektir.

### 3) Güvenlik duvarına Tailscale izni ver (Windows)

Windows, Tailscale bağlantısını "Ortak ağ" sayabilir ve telefonu engelleyebilir. Bunu önlemek için tek seferlik bir kural ekle:

1. Başlat menüsüne `cmd` yaz, **Komut İstemi**'ne sağ tıkla → **Yönetici olarak çalıştır**.
2. Şu satırı kopyalayıp yapıştır ve Enter'a bas:

```
netsh advfirewall firewall add rule name="Uzak Kumanda (Tailscale)" dir=in action=allow protocol=TCP localport=8765 remoteip=100.64.0.0/10
```

Bu kural, 8765 portuna **sadece Tailscale ağından** (100.64.0.0/10) gelen bağlantılara izin verir. İnternetin geri kalanına kapalı kalır.

### 4) Uzak Kumanda'yı yeniden başlat

`baslat.bat`'ı kapatıp tekrar aç. Siyah pencerede yeni bir satır görürsün:

```
  Aynı Wi-Fi'dan  :  http://192.168.1.25:8765
  Her yerden      :  http://100.101.102.103:8765   (Tailscale)
  PIN             :  396849
```

**"Her yerden"** satırındaki adresi not al. Bu adres değişmez, hep aynı kalır.

> Bu satırda "Tailscale kurulu değil / kapalı" yazıyorsa bilgisayardaki Tailscale bağlı değildir.
> Sağ alttaki simgeye tıklayıp **Connect** de, sonra Uzak Kumanda'yı yeniden başlat.

---

## Kullanım

1. Telefonda **Tailscale** uygulamasını aç ve bağlı (Connected / Active) olduğundan emin ol.
2. Tarayıcıda **"Her yerden"** adresini aç (örnek: `http://100.101.102.103:8765`) ve PIN'i gir.
3. Bu adresi de ana ekrana ekleyebilirsin. Böylece evde de dışarıda da aynı simgeyi kullanırsın:
   Tailscale açıkken bu adres her yerde çalışır.

**İpuçları:**
- Mobil veride görüntü biraz daha geç gelir. **HD**'yi kapalı tut.
- Dışarıdayken internet kotası harcar (ekran açık kaldığı sürece dakikada yaklaşık 5-15 MB). İşin bitince sayfayı kapat.
- Bilgisayar **açık** olmalı (uyku modunda olmamalı) ve Uzak Kumanda'nın siyah penceresi çalışıyor olmalı.
  Uzun süre dışarıdaysan Windows'ta uyku modunu kapat: **Ayarlar → Sistem → Güç → Ekran ve uyku → "Takılıyken uyku: Hiçbir zaman"**.
  Ekranın kapanması sorun değil, sadece bilgisayar uykuya geçmemeli.
- Bilgisayar açılınca Uzak Kumanda'nın kendiliğinden başlaması için KURULUM.md Bölüm 6'ya bak. Tailscale zaten kendiliğinden başlar.

---

## Sorun çözme

| Sorun | Çözüm |
|---|---|
| "Her yerden" adresi telefonda açılmıyor | 1) Telefonda Tailscale **bağlı** mı? 2) Telefon ve bilgisayar **aynı hesapla** mı giriş yaptı? 3) Bilgisayar açık ve uyanık mı? 4) 3. adımdaki güvenlik duvarı kuralını ekledin mi? |
| Telefondaki Tailscale listesinde bilgisayarım görünmüyor | Bilgisayardaki Tailscale simgesine tıkla ve bağlı olduğunu kontrol et. Aynı hesapla giriş yaptığından emin ol. |
| Siyah pencerede "Tailscale kurulu değil / kapalı" yazıyor | Bilgisayarda Tailscale'i bağla, sonra Uzak Kumanda'yı kapatıp yeniden aç. |
| Çok yavaş | HD'yi kapat. Mobil veri zayıfsa normaldir. |
| Telefonda başka bir VPN açık | Aynı anda tek VPN çalışır. Diğer VPN'i kapat. |

---

## Güvenlik özeti

- Bilgisayarına ulaşmak için iki kilit gerekir: **senin Tailscale hesabın** ve **PIN**.
- Tailscale hesabını (Google hesabını) iki adımlı doğrulamayla koru.
- Kayıp ya da çalıntı bir telefonun bağlantısını **https://login.tailscale.com/admin/machines** sayfasından tek tıkla kaldırabilirsin.
- Bu sırada PIN'i de değiştir (pin.txt).
