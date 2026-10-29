# VAR ODASI

Tamamen Türkçe, **reklamsız**, **satın almasız**, **internetsiz** çalışan bir futbol **VAR hakemi** simülasyonu.
Sen saha hakemi değilsin: VAR odasındaki video hakemisin.

## Çalıştırma

```bash
cd var-odasi
npm install
npm run dev      # geliştirme sunucusu (http://localhost:5173)
npm run build    # dist/ klasörüne çevrimdışı çalışan derleme
npm test         # gerçek cevap ve puanlama testleri
```

## Temel fikir

Simülasyon her kritik pozisyonu kare kare kurgular ve kaydeder. "Doğru karar" tahmin edilmez,
**kayıttan ölçülür**: ofsayt farkı (cm), temas var mı ve nerede, topun çarptığı vücut bölgesi,
kolun açısı, krampon yüksekliği, top çizgiyi tamamen geçti mi… Ekranda gördüğün 3D vücut ile
ölçümde kullanılan geometri aynı fonksiyondan (`src/sim/skeleton.js`) gelir. Kollar ofsayta sayılmaz.

Puanlama VAR protokolüne uyar: yalnızca **açık ve net hata** varsa müdahale edilir; gri alanda
saha kararına dokunmamak doğrudur. Olgusal kararlar doğrudan düzeltilir, yoruma dayalı kararlar
için hakem monitöre (OFR) çağrılır.

## Pozisyon türleri

| Tür | Gerçek cevap |
|---|---|
| Ofsayt şüpheli gol | Pas karesinde hücumcu ile sondan ikinci savunmacının (kol hariç) en uç noktaları |
| Penaltı şüphesi | Bacaklar arası temas mesafesi, temas noktasının ceza sahası çizgisine göre yeri, dalış |
| Elle oynama | Topun çarptığı bölge (kol / omuz / gövde) ve kolun açılma açısı |
| Kırmızı kart | Sert faul: temas yüksekliği ve hız · Gol fırsatı: kale tarafındaki savunmacılar |
| Gol öncesi faul | APP içinde ellerle itme ve rakibin düşmesi |
| Kimlik karışıklığı | Gerçekten temas eden oyuncu |
| Top oyun dışı | Topun kale çizgisinin dış kenarını tamamen geçip geçmediği |

## Modüller

- `src/sim` — maç simülasyonu, yapay zekâ, iskelet, koreografi ve senaryo jeneratörleri
- `src/replay` — kare kare kayıt ve kamera açıları
- `src/var` — gerçek cevap ölçümleri, protokol ve puanlama
- `src/ui` — arayüz, VAR inceleme ekranı, menüler
- `src/career` — kayıt (localStorage), kariyer, istatistikler
- `src/audio` — Web Audio ile prosedürel sesler (dosya yok)
- `src/data` — kurgusal takımlar, isimler, kural açıklamaları, metinler
- `src/render` — Three.js sahne, saha, stadyum, insan modelleri

Tüm takımlar, oyuncular, yorumcular ve sosyal medya hesapları kurgusaldır.
