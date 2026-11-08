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
| **Yapay zekâ beyni** | **Claude API** | **Ücretli (kullandıkça):** sohbet başına ~1-2 kuruş, web araması 1.000 aramada 10 $ |

> Render'ın ücretsiz sunucusu 15 dakika istek gelmezse uyur; uyandığında ilk istek ~1 dakika sürer.
> Bunu önlemek için cron-job.org sunucuyu birkaç dakikada bir dürter. Bu çağrı aynı zamanda
> hatırlatıcı ve sabah brifingi gibi zamanlanmış görevleri tetikler. Ayda 750 ücretsiz saat,
> tek bir sunucunun 7/24 çalışmasına yeter.

### Adım adım

1. **Anthropic API anahtarı:** console.anthropic.com → Settings → API Keys → *Create Key*. Hesaba bakiye
   eklemeniz gerekir (Claude API ücretlidir, kullandıkça ödenir; günlük kişisel kullanımda genelde aylık birkaç dolar).
2. **Render hesabı:** render.com → GitHub ile giriş yapın (kart istemez).
3. **New + → Blueprint** → bu depoyu seçin. Render, kök dizindeki `render.yaml` dosyasını okuyup
   `jarvis-server` servisini oluşturur.
4. İstenen gizli değerleri girin: `ANTHROPIC_API_KEY` (zorunlu), `ELEVENLABS_API_KEY` ve `ELEVENLABS_VOICE_ID`
   (isteğe bağlı, yoksa telefonun kendi Türkçe sesi kullanılır). `JARVIS_APP_SECRET` otomatik üretilir.
5. Dağıtım bitince servis adresinizi kopyalayın (ör. `https://jarvis-server-xxxx.onrender.com`) ve
   tarayıcıda `/health` adresini açın: `"ai": true` görmelisiniz.
6. Render panelinde **Environment** sekmesinden `JARVIS_APP_SECRET` değerini kopyalayın.
7. **Jarvis uygulaması → ⚙ Ayarlar → Sunucu bağlantısı:** adresi ve anahtarı girip *Kaydet ve bağlan*.
   Artık sorular gerçek beyne gider; açılış ekranında "YAPAY ZEKÂ ÇEKİRDEĞİ ✓" görünür.
8. **cron-job.org** → ücretsiz hesap → *Create cronjob*:
   - URL: `https://jarvis-server-xxxx.onrender.com/cron/tick`, istek tipi **POST**
   - Sıklık: her 10 dakika
   - *Advanced → Headers:* `x-jarvis-key: <JARVIS_APP_SECRET>`

### ElevenLabs sesi (isteğe bağlı)
elevenlabs.io → ücretsiz hesap (ayda ~10.000 karakter) → *Profile → API Keys*. *Voices → Voice Library*'de
"British butler", "calm British male" gibi aramalarla bir ses seçip *Add to my voices* deyin; ses
sayfasındaki **Voice ID**'yi kopyalayın. Türkçe için `eleven_multilingual_v2` modeli kullanılıyor.

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
