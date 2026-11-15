# Yapay Zeka Yardımcı — Minecraft'a katılan yapay zeka arkadaş

İki sürüm var, ikisi de aynı "beyni" (Claude) kullanır:

| | **Bedrock** (Windows / telefon / konsol) | **Java Edition** |
|---|---|---|
| Nasıl katılır | Eklenti (`yapay-zeka-yardimci.mcaddon`) dünyaya bir NPC ekler | Bot gerçek bir oyuncu gibi dünyana girer |
| Komut | Kumanda eşyası (menü) **veya** köprü açıksa sohbetten yazarak | Sohbetten yazarak |
| X-ray | Yeraltını tarar, cevhere tünel kazar, lavı taşla kapatır | Yüklü bütün blokları görür, yol bulucu lavın yanını kazmaz |
| İlerleme | odun → tahta kazma → taş → kömür/demir → elmas → obsidyen → portal → Nether → ancient debris → netherite | aynı, gerçek üretim/fırın pencereleriyle |
| İnşaat | 5 şema (kulübe, taş ev, kule, köy evi, Viking evi) malzemesini toplayıp blok blok | aynı + `semalar/` klasörüne attığın her `.schem` |

> X-ray'i sadece **kendi dünyanda** ya da izin verilen sunucuda kullan.

---

## 1) Bilgisayar hazırlığı (bir kere)

Dispatch'e (bilgisayarındaki Claude) şunu yapıştırabilirsin:

```
Windows bilgisayarımda şunları yap:
1. Node.js LTS kurulu değilse kur:  winget install OpenJS.NodeJS.LTS
2. Git kurulu değilse kur:  winget install Git.Git
3. Belgeler klasörüne github.com/mustafaaliyalcin1-hue/Mustafa deposunu klonla
   (dal: claude/optimistic-dirac-2vlcv4), sonra minecraft-ai klasöründe  npm install  çalıştır.
4. minecraft-ai\.env.example dosyasını .env olarak kopyala. ANTHROPIC_API_KEY satırını bana sor, ben yazacağım.
5. Bitince minecraft-ai klasörünü Gezgin'de aç.
```

**API anahtarı:** https://console.anthropic.com → API Keys → Create Key. Anahtarı `.env` dosyasına sen yaz, sohbete yapıştırma.
Anahtar yoksa da çalışır; o zaman sadece basit komutları anlar: "gel", "takip et", "elmas bul", "ev yap", "netherite", "dur".

---

## 2) Bedrock

1. `minecraft-ai\yapay-zeka-yardimci.mcaddon` dosyasına çift tıkla. Minecraft açılır ve paketleri içe aktarır.
2. Yeni dünya oluştur (ya da var olanı düzenle):
   - **Hileler: AÇIK** (yardımcı blok koymak için komut kullanıyor)
   - Davranış Paketleri → **Yapay Zeka Yardımcı** → Etkinleştir (kaynak paketi kendiliğinden gelir)
3. Dünyaya girince envanterine **Yardımcı Kumandası** gelir. Kullan → **Yardımcıyı çağır**.
   Kumandayı kaybedersen: çubuk + kızıltaş ile üretebilirsin.
4. Kumanda menüsünden görev ver: Elmas, Netherite, Yapı inşa et, Takip et...

**Sohbetle konuşmak için (Claude):**
1. Minecraft → Ayarlar → Genel → **"Şifreli Websocket gerektir"** kapalı olsun.
2. `minecraft-ai` klasöründe bir terminal aç: `npm run bedrock`
3. Oyunda sohbete yaz: `/connect localhost:3000`
4. Artık sohbete normal yaz: *"reis bize göl kenarına küçük bir ev yap"*, *"elmas kazmaya kadar git"*, *"netherite yapalım"*.

Bağlanmazsa (eski Microsoft Store sürümü), yönetici PowerShell'de bir kere:
`CheckNetIsolation LoopbackExempt -a -n="Microsoft.MinecraftUWP_8wekyb3d8bbwe"`

**Bedrock'ta bilmen gerekenler:**
- Yardımcı lavda ve ateşte yanmaz, düşünce hasar almaz (takılıp ölmesin diye). Canavarlar ona vurabilir, o da onlara vurur.
- Nether'e **seninle birlikte** geçer: portal kurar, sen girersin, o da peşinden ışınlanır.
- Netherite yükseltme şablonu bastion sandıklarından çıkar. Bulunca yardımcının yanına at (Q), kendisi alır ve kazmayı yükseltir.
- Ona eşya vermek için yanına at; o da "Eşyaları bana ver" deyince hepsini önüne bırakır.

---

## 3) Java Edition

1. Minecraft Java'da tek oyunculu dünyanı aç → Esc → **LAN'a Aç** (Hileler: Açık) → oyun bir port yazar (ör. `51234`).
2. `.env` dosyasında `MC_PORT=51234` yap. `SAHIP=` satırına kendi kullanıcı adını yazarsan sadece seni dinler.
3. Terminal: `npm run java`. "Yardimci" adında bir oyuncu dünyaya girer.
4. Sohbete yaz: *"elmas bul"*, *"bana kule yap"*, *"netherite kazmaya kadar her şeyi yap"*, *"dur"*.

`Failed to verify username` hatası alırsan LAN dünyası hesap doğrulaması istiyor demektir. İki çözüm var:
- Bilgisayarda küçük bir sunucu kur (`server.properties` içinde `online-mode=false`). Dispatch bunu kurabilir:
  *"Minecraft Java X.Y.Z sürümü için resmi sunucuyu kur, online-mode=false yap, başlat."*
- Ya da bot için ayrı bir Minecraft hesabı kullan: `.env` → `MC_AUTH=microsoft`.

Kendi şematiğini eklemek için `.schem` ya da `.schematic` dosyasını `minecraft-ai\semalar\` klasörüne at.
İstersen `semalar\aciklamalar.json` dosyasına bir açıklama da yaz. Bedrock'a da eklemek için `npm run eklenti` ile paketi yeniden üret.

---

## Takılırsa

Terminalde ne yazdığının ekran görüntüsünü ya da son satırlarını bana gönder. Bot takıldığı yeri sohbete de yazar ("Takıldım: ..."), birlikte düzeltiriz.
