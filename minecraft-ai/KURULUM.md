# Yapay Zeka Yardımcı — Minecraft'a katılan yapay zeka arkadaş

İki sürüm var, ikisi de aynı "beyni" (Claude) kullanır:

| | **Bedrock** (Windows / telefon / konsol) | **Java Edition** |
|---|---|---|
| Nasıl katılır | Eklenti (`yapay-zeka-yardimci.mcaddon`) dünyaya bir NPC ekler | Bot gerçek bir oyuncu gibi dünyana ya da sunucuya girer |
| Komut | Kumanda eşyası (menü) **veya** köprü açıksa sohbetten yazarak | Sohbetten yazarak |
| İlerleme | odun → tahta kazma → taş → kömür/demir → elmas → obsidyen → portal → Nether → ancient debris → netherite | aynı, gerçek üretim/fırın pencereleriyle |
| İnşaat | 5 şema (kulübe, taş ev, kule, köy evi, Viking evi) malzemesini toplayıp blok blok | aynı + `semalar/` klasörüne attığın her `.schem` |

## X-ray kuralı (iki sürümde de aynı)

| Nerede | X-ray |
|---|---|
| Kendi dünyan, tek başınasın | **Açık**: yeraltını görür, doğrudan elmasa tünel kazar |
| Dünyada başka bir oyuncu var (çok oyunculu, LAN, Realm) | **Kapalı** |
| Dışarıdaki bir sunucu (Java) | **Kapalı** |

X-ray kapalıyken cevheri, sandığı, obsidyeni sadece gerçekten **gözüyle görüyorsa** bulur. Görmüyorsa normal oyuncu gibi
doğru seviyeye merdiven kazarak iner (elmas için y=-58) ve dal madenciliği yapar. Arkadaşın girince sohbete
"x-ray kapattım" yazar, çıkınca tekrar açar. İstersen elle de değiştirebilirsin:
- Bedrock: kumanda → **X-ray ayarı** (otomatik / hep kapalı / hep açık)
- Java: `.env` → `XRAY=otomatik` (ya da `kapali` / `acik`)

Lavı her zaman fark eder ve kaçar. Bu bir güvenlik önlemi, cevher bulmaya yaramıyor.

---

## 1) Bilgisayar hazırlığı (bir kere) — API anahtarı yok

Yardımcı, bilgisayarındaki **Claude Code** ile, yani **kendi Claude hesabınla** düşünür. Anahtar, kopya, ödeme bilgisi gerekmez.
Kullandıkça Claude planının kullanım hakkından gider.

Dispatch'e (bilgisayarındaki Claude) şunu yapıştır:

```
Windows bilgisayarımda şunları yap:
1. Node.js LTS kurulu değilse kur:  winget install OpenJS.NodeJS.LTS
2. Git kurulu değilse kur:  winget install Git.Git
3. Claude Code kurulu değilse kur:  npm install -g @anthropic-ai/claude-code
4. Belgeler klasörüne github.com/mustafaaliyalcin1-hue/Mustafa deposunu klonla
   (dal: claude/optimistic-dirac-2vlcv4), sonra minecraft-ai klasöründe  npm install  çalıştır.
5. minecraft-ai\.env.example dosyasını .env olarak kopyala.
6. Bir terminal açıp "claude" yazdır ki Claude hesabımla giriş yapayım (tarayıcı açılacak, ben onaylayacağım).
```

Giriş yapmazsan da çalışır; o zaman sadece basit komutları anlar: "gel", "takip et", "elmas bul", "ev yap", "netherite", "dur".

---

## 2) Bedrock

1. `minecraft-ai\yapay-zeka-yardimci.mcaddon` dosyasına çift tıkla. Minecraft açılır ve paketleri içe aktarır.
2. Yeni dünya oluştur (ya da var olanı düzenle):
   - **Hileler: AÇIK** (yardımcı blok koymak için komut kullanıyor)
   - Davranış Paketleri → **Yapay Zeka Yardımcı** → Etkinleştir
3. Dünyaya girince envanterine **Yardımcı Kumandası** gelir. Kullan → **Yardımcıyı çağır**.
   Kumandayı kaybedersen: çubuk + kızıltaş ile üretebilirsin.
4. Kumanda menüsünden görev ver: Elmas, Netherite, Yapı inşa et, Takip et, X-ray ayarı...

**Sohbetle konuşmak için (Claude):**
1. Minecraft → Ayarlar → Genel → **"Şifreli Websocket gerektir"** kapalı olsun.
2. `minecraft-ai` klasöründe terminal: `npm run bedrock`
3. Oyunda sohbete yaz: `/connect localhost:3000`
4. Artık sohbete normal yaz: *"reis bize göl kenarına küçük bir ev yap"*, *"netherite yapalım"*.

Bağlanmazsa (eski Microsoft Store sürümü), yönetici PowerShell'de bir kere:
`CheckNetIsolation LoopbackExempt -a -n="Microsoft.MinecraftUWP_8wekyb3d8bbwe"`

**Çok oyunculu Bedrock:** Eklenti sadece eklentinin yüklü olduğu dünyalarda çalışır. Bunlar senin dünyan, senin dünyana
giren arkadaşların ve paketi eklediğin Realm. Hive gibi büyük hazır sunucular eklentiye izin vermez, oralara yardımcı giremez.
Arkadaşın dünyaya girdiği anda x-ray kendiliğinden kapanır.

**Bilmen gerekenler:**
- Yardımcı lavda ve ateşte yanmaz, düşünce hasar almaz (takılıp ölmesin diye).
- Nether'e **seninle birlikte** geçer: portalı kurar, sen girince peşinden gelir.
- Netherite yükseltme şablonunu (bastion sandıklarında çıkar) yanına at (Q), kendisi alıp kazmayı yükseltir.

---

## 3) Java Edition

**Kendi dünyan:** Esc → **LAN'a Aç** → oyunun yazdığı portu `.env` dosyasında `MC_PORT=` satırına yaz → terminal: `npm run java`.

**Sunucu:** `.env` → `MC_HOST=sunucu.adresi`, `MC_PORT=25565`, `SAHIP=kendi_kullanıcı_adın`.
- Sunucuda x-ray kendiliğinden kapalı. Yardımcı sadece seni dinler.
- Hesap doğrulaması olan (normal) sunucular için botun **kendi Minecraft hesabı** olmalı: `MC_AUTH=microsoft`
  (ilk açılışta terminalde bir giriş kodu çıkar).
- **Dikkat:** X-ray kapalı olsa bile birçok sunucu bot / otomatik oyuncu kullanmayı kurallarıyla yasaklar ve banlayabilir.
  Önce sunucunun kurallarına bak ya da yöneticiye sor. Arkadaşlarınla kurduğun sunucularda sorun olmaz.

LAN dünyasında `Failed to verify username` hatası alırsan: Dispatch'e *"Minecraft Java X.Y.Z için resmi sunucuyu kur,
online-mode=false yap, başlat"* dedirt ve yardımcıyı o sunucuya bağla.

Sohbet örnekleri: *"elmas bul"*, *"bana kule yap"*, *"netherite kazmaya kadar her şeyi yap"*, *"dur"*.

Kendi şematiğini eklemek için `.schem` / `.schematic` dosyasını `minecraft-ai\semalar\` klasörüne at
(Bedrock'a da eklemek için `npm run eklenti` ile paketi yeniden üret).

---

## Takılırsa

Terminalde yazanların ekran görüntüsünü bana gönder. Bot takıldığı yeri sohbete de yazar ("Takıldım: ..."), birlikte düzeltiriz.
