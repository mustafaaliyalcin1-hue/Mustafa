# Doğu Türküsü / Arabesk AI Kanalı — Araştırma ve Plan (Adım 1)

Tarih: 2026-11-08

## Kararlar (kısa)

| Konu | Karar | Neden |
|---|---|---|
| Müzik | **Google Lyria 3.5** (Gemini API, `lyria-3.5`), yedek: Lyria 3 Pro Preview | Resmi API, vokal + söz desteği, şarkı başına ~0,08 $, birkaç dakikalık tam şarkı |
| B müzik sağlayıcısı | ElevenLabs Music API (ücretli plan) | Resmi API, 10 sn–dakikalarca vokalli şarkı, ticari kullanım ücretli planda serbest |
| Kullanılmayan | Suno vb. | Resmi API'leri yok (gayriresmi yollar yasak) |
| Söz/prompt | Gemini metin modeli (aynı API anahtarı) | Tek anahtar, ucuz |
| Kapak | Gemini görsel modeli (Nano Banana 2.1) | Imagen 4 Gemini API'de kapatıldı; ~0,03 $/görsel |
| Video | ffmpeg: 1080x1920, hafif zoom, ses dalgası, şarkı adı | Ücretsiz |
| Süre | Tek dikey 2 dk video hem Reels hem Shorts'a | Shorts 3 dk'ya çıktı; Reels 3 dk (ilk paylaşımda doğrulanacak) |
| Paylaşım | Metricool (MCP bağlı ve çalışıyor) | Bu oturumdan blogId 7958672 görünüyor; sosyal ağ bekleniyor |
| Medya barındırma | Cloudflare R2 (ücretsiz katman) veya Metricool'un yükleme yolu | Metricool herkese açık URL ister; paylaşımdan sonra silinir |
| Zamanlayıcı | GitHub Actions (günde ~10 dk, ücretsiz kotada) | Bilgisayar kapalıyken de çalışır |
| Bildirim | Telegram bot | En kolay kurulum, ücretsiz, önizleme videosu da gönderilebilir |

## Önemli bulgular / riskler

1. **Lyria ve Türkçe vokal:** Lyria 3/3.5 prompt dilinde söz söylüyor, ama Türkçe kalitesi resmi olarak
   belgelenmemiş. Adım 5'te gerçek bir örnekle test edeceğiz; kötü çıkarsa ElevenLabs'e geçilir
   (`generate_track(prompt) -> wav` arayüzü sayesinde tek satır değişiklik).
2. **Türkiye'den erişim:** Gemini API Türkiye'de kullanılabiliyor olmalı; anahtarla ilk çağrıda doğrulanacak.
3. **Metricool REST API yalnızca Advanced/Custom planda** (yaklaşık 43 €/ay + KDV). MCP ücretsiz planda da var
   ama MCP her gün benim (Claude oturumu) çalışmamı gerektirir; tam otomatik değil.
4. Her çıktıda Google'ın SynthID filigranı var (AI bildirimiyle uyumlu, sorun değil).

## Aylık maliyet tahmini (30 şarkı)

| Kalem | Tahmin |
|---|---|
| Lyria (yeniden denemelerle) | 3–5 $ |
| Söz/prompt üretimi | ~1 $ |
| Kapak görselleri | ~2 $ |
| GitHub Actions, Telegram, R2 | 0 $ |
| **Toplam (Metricool hariç)** | **~6–8 $/ay** |
| Metricool Advanced (tam otomatik için) | +~43 €/ay + KDV |

**Öneri:** İlk "onaylı hafta" boyunca Metricool ücretsiz plan + MCP ile ilerleriz (ben her gün önizleme
gönderirim, sen onaylarsın, ben planlarım). Hafta sonunda sonuçlara bakıp karar veririz:
Metricool Advanced'a geçmek **veya** (onayınla) YouTube/Instagram'ın kendi ücretsiz API'lerine bağlanmak.

## Klasör yapısı (sonraki adımlarda kurulacak)

```
dogu-turkusu/
  config/ (stil_rehberi.yaml, ayarlar.yaml)
  src/ (prompt_uretici, muzik, gorsel, video, metricool, bildirim)
  output/YYYY-MM-DD/
  history.json
  README.md (Türkçe, senin yapacakların)
```

## Kaynaklar
- Lyria fiyat/model: https://cellcog.ai/blog/lyria-3-5/ , https://openrouter.ai/google/lyria-3-pro-preview , https://invideo.io/blog/lyria-ai-music-generator/
- Metricool API/plan: https://help.metricool.com/pt/planos-complementos-e-acesso-a-api-explicados-xux1u , https://help.metricool.com/wli-scheduler-endpoint-example-on-a-custom-backend-proxy-frko7
- ElevenLabs Music: https://elevenlabs.io/docs/product-guides/products/music
- Görsel fiyatları: https://invideo.io/blog/ai-image-model-pricing/
- Shorts/Reels süreleri: https://blitzcutai.com/blog/youtube-shorts-length-2026 , https://www.tryordinal.com/blog/how-long-can-an-instagram-reel-be
