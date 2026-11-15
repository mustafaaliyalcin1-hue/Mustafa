# Her Yerden Bağlanmak (Aynı Wi-Fi Olmadan)

Uzak Kumanda'nın **internet modu** açıkken (varsayılan olarak açık) telefon nerede olursa olsun
(mobil veri, başka ev, başka şehir) bilgisayarına bağlanabilirsin.
**Telefona uygulama kurmak, hesap açmak ya da modemde ayar yapmak gerekmez.**

## Nasıl çalışır?

1. Bilgisayardaki uygulama, Cloudflare'in ücretsiz ve hesap gerektirmeyen **hızlı tünel** servisine
   kendisi bağlanır. Bunun için gereken `cloudflared` programını ilk açılışta kendisi indirir.
2. Cloudflare bir internet adresi verir. Örnek: `https://ornek-kelimeler.trycloudflare.com`
   (bağlantı şifrelidir: https).
3. Bu adres bilgisayar her yeniden başladığında **değişir**. Bu yüzden uygulama yeni adresi
   **ntfy.sh** adlı ücretsiz bildirim servisinde sana özel, tahmin edilemez bir sayfaya gönderir.
4. Sen telefonda sadece **o sayfayı** yer imi olarak saklarsın. Bağlanmak istediğinde sayfayı açar,
   en son gelen linke dokunursun. Şifre linkin içinde olduğu için doğrudan girersin.

## Telefonda yapılacak tek şey

Kurulumu yapan kişi (ya da Claude) sana bir **bildirim sayfası linki** verecek:
```
https://ntfy.sh/uzak-xxxxxxxxxxxxxxxxxxxxxxxx
```
- Bu linki telefonda aç ve **yer imlerine ekle** ya da **ana ekrana ekle**.
- Bağlanmak istediğinde bu sayfayı aç ve **en alttaki (en yeni)** "Uzak Kumanda adresi" mesajındaki linke dokun.

Sayfada mesaj görünmüyorsa:
- Bilgisayara yeniden başlat yaptırmak ya da birkaç dakika beklemek yeterli olabilir (adres 3 saatte bir yeniden gönderilir).
- Ya da Claude'a "Uzak Kumanda adresi ne?" diye sor. Adres bilgisayarda `adres.txt` dosyasında yazar.

## Bilmen gerekenler

- Bilgisayar **açık ve uyanık** olmalı, Uzak Kumanda çalışıyor olmalı. Ekranın kapanması sorun değil.
- Mobil veride görüntü biraz daha geç gelir ve kota harcar (ekran açıkken dakikada yaklaşık 5-15 MB). HD'yi kapalı tut.
- Cloudflare'in hızlı tüneli ücretsiz bir hizmettir ve çalışma garantisi yoktur. Nadiren kopabilir.
  Uygulama kendiliğinden yeniden bağlanır, ama adres değişir. Yeni adres bildirim sayfasına gelir.

## Güvenlik

- İnternet modunda 6 haneli PIN yerine **güçlü bir şifre** kullanılır (`kx7m-p9qt-4bnz` gibi). Şifre `pin.txt` dosyasında durur.
- Bağlantı şifrelidir (https). Tünel adresi rastgele, bildirim sayfasının adı da tahmin edilemez.
- **Bildirim sayfasının linki bir anahtar gibidir:** içindeki linklerde şifre de var. **Kimseyle paylaşma.**
- Yanlış şifre denemeleri bilgisayardaki siyah pencerede görünür. Aynı adresten 8 yanlış deneme olursa o adres 1 dakika engellenir.
- Linkin başkasının eline geçtiğinden şüphelenirsen `pin.txt` ve `bildirim_konusu.txt` dosyalarını sil ve uygulamayı yeniden başlat.
  Yeni bir şifre ve yeni bir bildirim sayfası üretilir. Telefona yeni sayfa linkini kaydetmen gerekir.

## İnternet modunu kapatmak

Klasördeki `ayarlar.json` dosyasını Not Defteri ile aç ve `"tunel": true` satırını `"tunel": false` yap.
O zaman uygulama sadece aynı Wi-Fi'dan çalışır.

## Daha kapalı bir alternatif: Tailscale (isteğe bağlı)

Telefona da bir uygulama kurmayı dert etmiyorsan **Tailscale** daha da güvenlidir. Bu yöntemde uygulama hiç internete açılmaz.
Bilgisayara ve telefona Tailscale kurup aynı hesapla giriş yaparsın. Uzak Kumanda siyah pencerede
`Her yerden: http://100.x.x.x:8765 (Tailscale)` adresini kendisi gösterir.
Windows'ta bir kere şu güvenlik duvarı kuralı eklenmeli (yönetici olarak):
```
netsh advfirewall firewall add rule name="Uzak Kumanda (Tailscale)" dir=in action=allow protocol=TCP localport=8765 remoteip=100.64.0.0/10
```
