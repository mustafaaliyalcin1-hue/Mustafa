# J.A.R.V.I.S. — Kişisel Yapay Zekâ Asistanı

Iron Man tarzı, Türkçe konuşan, sesli ve bol animasyonlu kişisel asistan.
Her isteğe o konuya özel sinematik bir animasyon eşlik eder.

```
jarvis/
├── web/                 React + Vite + TypeScript + Tailwind (arayüz, PWA, Capacitor APK)
│   └── src/
│       ├── core/        olay protokolü, durum deposu, ses, efekt sesleri, performans
│       ├── animations/  ANİMASYON REGISTRY + konu sahneleri (scenes/)
│       ├── components/  ark reaktörü (3D), HUD, açılış, altyazı, sohbet çubuğu
│       ├── demo/        demo beyni (backend olmadan sahte verilerle çalışır)
│       └── pages/       animasyon galerisi
├── server/              Node.js (Fastify) backend: Claude ajanı, araçlar, ses, zamanlanmış görevler
│   └── src/
│       ├── agent.ts     ajan döngüsü (Claude + araçlar + web araması), SSE olayları
│       ├── tools/       ARAÇ REGISTRY: her yetenek bir dosya (hava, hafıza, …)
│       └── index.ts     HTTP uçları: /health, /api/chat, /api/tts, /cron/tick
└── .env.example         tüm API anahtarlarının listesi
```

## Aşama durumu

| # | Aşama | Durum |
|---|-------|-------|
| 1 | Arayüz + temel durum animasyonları + animasyon registry (demo modu) | ✅ |
| 2 | Claude API beyni + ses (barge-in, “Jarvis” eller serbest modu) | ✅ (anahtar girilince canlı) |
| 3 | Araştırma, haber doğrulama, hava, haberler, spor, finans + animasyonları | ✅ |
| 4 | Harita, çeviri, takvim, hatırlatıcı, görsel analiz, hafıza + animasyonları | 🟡 hafıza animasyonu hazır |
| 5 | Home Assistant + akıllı ev + Matter | ⏸ şimdilik ertelendi (kullanıcı kararı) |
| 6 | Roborock oda bazlı kontrol — doğrudan Roborock hesabıyla, HA'sız; odalar otomatik çekilecek | ⏳ |
| 7 | WhatsApp ajanı (Meta Cloud API) + bildirimler + sabah brifingi | ⏳ |
| 8 | APK build + Firebase deploy | ⏳ |

## Çalıştırma (geliştirme)

```bash
cd jarvis/web
npm install
npm run dev          # http://localhost:5173
```

Kullanışlı adres parametreleri:
- `?noboot` → açılış sekansını atla
- `?galeri` → doğrudan animasyon galerisini aç
- `?soru=bugün hava nasıl` → açılışta bu soruyu sor

### Sesli komut
- **🎙 düğmesi:** bas, konuş; Jarvis konuşuyorsa anında susar ve seni dinler.
- **Eller serbest (J● düğmesi veya Ayarlar):** uygulama açıkken “Jarvis” demen yeter.
  “Jarvis, hava nasıl?” gibi tek cümle de olur. Chrome / Android Chrome'da çalışır; mikrofon izni ister.
  Ekran kapalıyken veya uygulama arka plandayken tarayıcılar mikrofonu kapattığı için çalışmaz.

Demo modunda deneyebileceğiniz cümleler: *"Fenerbahçe maçı kaç bitti"*, *"dolar ve altın ne kadar"*,
*"gündem manşetleri"*, *"elektrikli araba mı hibrit mi araştır"*, *"bugün hava nasıl"*, *"yağmur yağacak mı"*,
*"köprüler ücretsiz haberi gerçek mi"*, *"kahve haberi doğru mu"*,
*"Jarvis, kahvemi şekersiz içerim, unutma"*, *"selam"*.

## Mimari: olay protokolü

Backend her adımda arayüze bir olay gönderir (SSE/WebSocket). Arayüz olayları **sırayla** oynatır;
`say` olayı seslendirme bitene kadar bekler, böylece animasyon ve ses senkron kalır.

```ts
{ type: 'state', state: 'thinking' }                     // temel durum
{ type: 'scene', scene: 'weather', data: {...} }         // konuya özel animasyon
{ type: 'say',   text: 'İstanbul’da hava güneşli efendim' }
{ type: 'end' }
```

## Yeni animasyon eklemek

1. `web/src/animations/scenes/Benim.tsx` oluşturun:
   ```tsx
   import { registerScene, type SceneProps } from '../registry'
   function Benim({ data, low }: SceneProps<{ metin: string }>) { return <div>{data.metin}</div> }
   registerScene({ id: 'benim', title: 'Benim sahnem', category: 'Araçlar', component: Benim,
     demo: [{ label: 'Örnek', data: { metin: 'Merhaba' }, say: 'Merhaba efendim' }] })
   ```
2. `web/src/animations/index.ts` dosyasına `import './scenes/Benim'` ekleyin.
3. Galeri otomatik olarak yeni kartı gösterir. Backend tarafında tool sonucu `{type:'scene', scene:'benim'}` gönderir.

Bilinmeyen bir sahne kimliği gelirse genel "İşlem yapılıyor" animasyonu oynar.

## Performans modu

Ayarlar → Performans: Otomatik / Yüksek / Düşük. Otomatik modda zayıf cihazlar (≤4 çekirdek,
düşük bellek, "hareketi azalt" tercihi) veya 40 FPS altına düşen cihazlarda partikül sayısı,
çözünürlük ve bulanıklık efektleri otomatik azaltılır.

## Backend'i ücretsiz yayınlama (Render)

Mimari, ücretsiz katmana göre tasarlandı:

| Parça | Servis | Ücret |
|---|---|---|
| Backend (Claude ajanı, araçlar) | **Render** Free Web Service | Ücretsiz, kart gerekmez |
| Uyanık tutma + zamanlanmış görevler | **cron-job.org** | Ücretsiz |
| Web arayüzü (link) | **Firebase Hosting** (8. aşama) | Ücretsiz |
| Hafıza / hatırlatmalar | **Firebase Firestore** (4. aşama) | Ücretsiz kota |
| Hava durumu | Open-Meteo | Ücretsiz, anahtarsız |
| Haberler | Google News RSS | Ücretsiz, anahtarsız |
| Futbol (Süper Lig, Avrupa) | ESPN açık veri uçları | Ücretsiz, anahtarsız |
| Döviz / altın / kripto | Frankfurter (ECB) + CoinGecko | Ücretsiz, anahtarsız |
| Sesli komut + “Jarvis” uyandırma | Tarayıcının Web Speech API'si | Ücretsiz |
| **Yapay zekâ beyni** | **Google Gemini** (ücretsiz katman, Google Arama dahil) | **Ücretsiz** — günlük istek sınırı var; kişisel kullanıma yeter |
| (isteğe bağlı) daha güçlü beyin | Claude API | Ücretli, kullandıkça |

> Render'ın ücretsiz sunucusu 15 dakika istek gelmezse uyur; uyandığında ilk istek ~1 dakika sürer.
> Bunu önlemek için cron-job.org sunucuyu birkaç dakikada bir dürter. Bu çağrı aynı zamanda
> hatırlatıcı ve sabah brifingi gibi zamanlanmış görevleri tetikler. Ayda 750 ücretsiz saat,
> tek bir sunucunun 7/24 çalışmasına yeter.

### Adım adım

1. **Ücretsiz Gemini anahtarı:** aistudio.google.com → Google hesabınla giriş → *Get API key* → *Create API key*.
   Kart istemez. (Ücretsiz katmanda Google, gönderilen içerikleri ürünlerini geliştirmek için kullanabilir;
   hassas bilgi paylaşmayın.)
   *İsteğe bağlı:* Daha güçlü ve ücretli beyin için console.anthropic.com'dan Claude anahtarı.
2. **Render hesabı:** render.com → GitHub ile giriş yapın (kart istemez).
3. **New + → Blueprint** → bu depoyu seçin. Render, kök dizindeki `render.yaml` dosyasını okuyup
   `jarvis-server` servisini oluşturur.
4. İstenen gizli değerleri girin: `GEMINI_API_KEY` (zorunlu, ücretsiz), `ANTHROPIC_API_KEY` (boş bırakılabilir), `ELEVENLABS_API_KEY` ve `ELEVENLABS_VOICE_ID`
   (isteğe bağlı, yoksa telefonun kendi Türkçe sesi kullanılır). `JARVIS_APP_SECRET` otomatik üretilir.
5. Dağıtım bitince servis adresinizi kopyalayın (ör. `https://jarvis-server-xxxx.onrender.com`) ve
   tarayıcıda `/health` adresini açın: `"ai": true` görmelisiniz.
6. Render panelinde **Environment** sekmesinden `JARVIS_APP_SECRET` değerini kopyalayın.
7. **Jarvis uygulaması → ⚙ Ayarlar → Sunucu bağlantısı:** adresi ve anahtarı girip *Kaydet ve bağlan*.
   Artık sorular gerçek beyne gider; açılış ekranında "YAPAY ZEKÂ ÇEKİRDEĞİ ✓" görünür.
8. **Sunucuyu uyanık tut (önerilir, yoksa ilk soru ~1 dk bekler):** cron-job.org → ücretsiz hesap → *Create cronjob* →
   URL: `https://jarvis-server-xxxx.onrender.com/health`, her 10 dakikada bir (GET, başlık gerekmez).
   Zamanlanmış görevler eklendiğinde (7. aşama) aşağıdaki POST çağrısı da kullanılacak:
9. **cron-job.org** (zamanlanmış görevler) → *Create cronjob*:
   - URL: `https://jarvis-server-xxxx.onrender.com/cron/tick`, istek tipi **POST**
   - Sıklık: her 10 dakika
   - *Advanced → Headers:* `x-jarvis-key: <JARVIS_APP_SECRET>`

### ElevenLabs sesi (isteğe bağlı)
elevenlabs.io → ücretsiz hesap (ayda ~10.000 karakter) → *Profile → API Keys*. *Voices → Voice Library*'de
"British butler", "calm British male" gibi aramalarla bir ses seçip *Add to my voices* deyin; ses
sayfasındaki **Voice ID**'yi kopyalayın. Türkçe için `eleven_multilingual_v2` modeli kullanılıyor.

## Komut çözücü (yapay zekâsız, ücretsiz, 1-2 saniye)

Sık komutlar yapay zekâya gitmeden kodla anlaşılır ve çalıştırılır; animasyonlar aynen oynar, kota harcanmaz
(`server/src/intents/`). Anlaşılmayan ya da yorum isteyen sorular ("doğru mu", "araştır", "neden", "hangi kanalda")
yapay zekâya gider. Takip soruları desteklenir: *"Fener yendi mi?" → "Peki sıradaki maç?" → "Ya Galatasaray?"*

| Konu | Örnek cümleler |
|---|---|
| Futbol | Fener yendi mi · maç kaç kaç bitti · Galatasaray kazandı mı · maç şu an kaç kaç · sıradaki maç ne zaman · Fenerbahçe kaçıncı sırada · Real Madrid kazandı mı |
| Hava | hava nasıl · yarın yağmur yağacak mı · şemsiye alayım mı · bu akşam soğuk mu · Erzurum'da kar yağacak mı · hafta sonu İzmir hava · peki öbür gün? |
| Döviz/altın/kripto | dolar ne kadar · 100 dolar kaç TL · 5000 lira kaç euro · çeyrek altın ne kadar · altın yükseldi mi · bitcoin düştü mü |
| Haberler | gündem · son dakika · spor/ekonomi/teknoloji haberleri · Fenerbahçe ile ilgili haberler |
| Saat/tarih | saat kaç · bugün ayın kaçı · bugün günlerden ne |
| Hesap | 15 çarpı 23 · 1250'nin yüzde 18'i · karekök 144 · 2 üzeri 10 |
| Hafıza | kahvemi şekersiz içerim, unutma · hakkımda ne biliyorsun · kahve bilgisini unut |
| Sohbet | selam · günaydın (kısa hava özetiyle) · nasılsın · teşekkürler · kimsin · ne yapabilirsin |

Yeni komut eklemek: `server/src/intents/` altına `detect` (tanı) + `run` (çalıştır, sahne yayınla, cevabı döndür)
içeren bir dosya yazıp `intents/index.ts`'deki `INTENTS` listesine ekleyin.

## Ücretsiz beyin zinciri (kota dolunca otomatik geçiş)

Sunucu, anahtarı tanımlı ücretsiz beyinleri sırayla dener: **Gemini → Groq → OpenRouter → Ollama (yerel)**.
Biri kotasını doldurursa (429) 10 dakika, yoğunsa 1 dakika dinlendirilir ve soru otomatik olarak
sıradakine gider. `/health` adresinde hangi beyinlerin hazır olduğu görünür.

| Beyin | Nereden | Not |
|---|---|---|
| Gemini | aistudio.google.com → Get API key | Google Arama dahil; kota düşük |
| **Groq** | console.groq.com → API Keys → Create | Çok hızlı, kart istemez; model başına günlük sınır var |
| OpenRouter | openrouter.ai → Keys | `:free` modeller; günde ~50 istek |
| **Ollama (yerel)** | ollama.com | Kendi bilgisayarında, **sınırsız ve tamamen ücretsiz**; bilgisayar açık olmalı |

Render → jarvis-server → Environment'a ilgili anahtarı eklemek yeterli (`GROQ_API_KEY`, `OPENROUTER_API_KEY`, `OLLAMA_URL`).
Gemini dışındaki beyinlerde internet araması, Gemini kotası doluysa DuckDuckGo ile (anahtarsız) yapılır.

### Yerel model (Ollama) kurulumu
Gerekenler: Windows/Mac/Linux bir bilgisayar, en az 16 GB RAM (8 GB'ta `qwen3:4b` kullanın).
1. ollama.com'dan Ollama'yı kurun.
2. Terminal / PowerShell: `ollama pull qwen3:8b`
3. Render'daki sunucunun bilgisayarınıza ulaşabilmesi için ücretsiz Cloudflare tüneli:
   cloudflared'i kurun (developers.cloudflare.com → cloudflared indir) ve çalıştırın:
   `cloudflared tunnel --url http://localhost:11434 --http-host-header localhost:11434`
   Çıktıdaki `https://….trycloudflare.com` adresinin sonuna `/v1` ekleyip Render'da `OLLAMA_URL` yapın.
   (Bu hızlı tünelin adresi her çalıştırmada değişir; kalıcı adres için ücretsiz Cloudflare hesabıyla adlandırılmış tünel kurulabilir.)
4. Yalnızca yerel modeli kullanmak için `BRAIN_ORDER=ollama` yapın.
> Tünel adresini bilen herkes modelinizi kullanabilir; adresi paylaşmayın.

## Testler

```bash
cd jarvis/server && npm install && npm test   # ajan döngüsü (sahte Claude ile), hava aracı
cd jarvis/web && npm run build                # tip kontrolü + derleme
```

## Yeni araç (yetenek) eklemek

```ts
// jarvis/server/src/tools/kur.ts
import { z } from 'zod'
import { defineTool } from './registry.ts'
defineTool({
  name: 'get_rate', description: 'Döviz kuru getir',
  schema: z.object({ code: z.string() }),
  async run({ code }) { const rate = 42.1; return { result: { rate }, scene: { scene: 'finance', data: { code, rate } } } },
})
```
Sonra `tools/index.ts`'e `import './kur.ts'` ekleyin. Claude aracı ne zaman kullanacağına kendisi karar verir;
`scene` alanı arayüzde ilgili animasyonu oynatır.

---
Kurulum rehberinin geri kalanı (API anahtarları, Home Assistant token'ı, Roborock, Telegram botu,
APK ve Firebase) ilgili aşamalarla birlikte bu dosyaya eklenecek.
