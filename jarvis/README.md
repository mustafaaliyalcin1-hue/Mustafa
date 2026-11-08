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
├── server/              (2. aşama) Node.js backend: Claude ajanı, araçlar, HA, Telegram
└── .env.example         tüm API anahtarlarının listesi
```

## Aşama durumu

| # | Aşama | Durum |
|---|-------|-------|
| 1 | Arayüz + temel durum animasyonları + animasyon registry (demo modu) | ✅ |
| 2 | Claude API beyni + ses (ElevenLabs, wake word, barge-in) | ⏳ |
| 3 | Araştırma, haber doğrulama, hava, haberler, spor, finans + animasyonları | 🟡 hava ve doğrulama animasyonları hazır |
| 4 | Harita, çeviri, takvim, hatırlatıcı, görsel analiz, hafıza + animasyonları | 🟡 hafıza animasyonu hazır |
| 5 | Home Assistant + akıllı ev + Matter | ⏳ |
| 6 | Roborock oda bazlı kontrol | ⏳ |
| 7 | Telegram ajanı + bildirimler + sabah brifingi | ⏳ |
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

Demo modunda deneyebileceğiniz cümleler: *"bugün hava nasıl"*, *"yağmur yağacak mı"*,
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

---
Kurulum rehberinin geri kalanı (API anahtarları, Home Assistant token'ı, Roborock, Telegram botu,
APK ve Firebase) ilgili aşamalarla birlikte bu dosyaya eklenecek.
