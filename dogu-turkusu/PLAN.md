# Doğu Türküsü / Arabesk AI Kanalı — Plan (ÜCRETSİZ YOL)

Güncelleme: 2026-11-08 — kullanıcı "ücretsiz yol" istedi; Metricool Advanced (≈43 €/ay) iptal.

## Kararlar

| Konu | Karar | Ücret |
|---|---|---|
| Söz + prompt | Gemini API **ücretsiz katman** (Flash metin modeli) | 0 |
| Kapak görseli | Cloudflare Workers AI ücretsiz günlük kota (FLUX) | 0 |
| Video | ffmpeg (GitHub Actions içinde) | 0 |
| Instagram paylaşım | Instagram'ın kendi resmi API'si (kendi hesabın için inceleme gerekmez); dosya doğrudan yüklenir, barındırma gerekmez | 0 |
| YouTube paylaşım | YouTube Data API (ücretsiz kota). Denetim (audit) onayı gelene kadar YouTube'a Metricool ücretsiz planla (ayda 20 yayın) | 0 |
| Metricool | Ücretsiz plan: istatistik, en iyi saat, geçici YouTube planlama (MCP bağlı ve çalışıyor) | 0 |
| Zamanlayıcı | GitHub Actions (günde ~10 dk, ücretsiz kota içinde) | 0 |
| Bildirim / onay | Telegram bot (önizleme videosu + "onayla" butonu) | 0 |
| **Müzik** | Lyria (Google). **Vokalli, ticari kullanıma izinli, ücretsiz resmi API yok.** İlk denemede Vertex AI'nin 300 $ deneme kredisi kullanılabiliyor mu bakılacak; olmazsa Gemini API ~0,08 $/şarkı | 0 – ~2,5 $/ay |

## Neden müzik tamamen bedava olamıyor
- Suno, MusicGPT vb. ücretsiz katmanların resmi API'si yok veya **ticari kullanım yasak** → kanal para kazanırsa
  sorun çıkar, gayriresmi yollar da yasak (proje kuralı).
- Açık kaynak modeller (ACE-Step vb.) GPU ister; GitHub Actions'ta çalışmaz, ücretsiz GPU servisleri otomasyona uygun değil.
- Sonuç: tek ücretli kalem müzik, ayda yaklaşık **2,5 $ (≈ 100 TL)**; deneme kredisi işe yararsa ilk 3 ay 0.

## Riskler
1. **YouTube API denetimi:** Denetimden geçmemiş projeyle yüklenen videolar kalıcı olarak "gizli" kalır.
   Bu yüzden denetim onayı gelmeden YouTube'a API ile yükleme YAPILMAYACAK; arada Metricool ücretsiz kullanılacak.
   Metricool ücretsiz plan ayda 20 yayınla sınırlı → onay gelene kadar YouTube'a ~her gün değil, ayda 20 şarkı.
2. **Türkçe vokal kalitesi** (Lyria) — 5. adımda test edilecek.
3. Ücretsiz kotalar değişebilir; değişirse bildirim gelir.

## Klasör yapısı (sonraki adımlarda kurulacak)
```
dogu-turkusu/
  config/ (stil_rehberi.yaml, ayarlar.yaml)
  src/ (prompt_uretici, muzik, gorsel, video, instagram, youtube, metricool, bildirim)
  output/YYYY-MM-DD/
  history.json
  README.md (Türkçe, senin yapacakların)
```

## Kaynaklar
- Lyria fiyat: https://cellcog.ai/blog/lyria-3-5/ , https://openrouter.ai/google/lyria-3-pro-preview
- Deneme kredisi ve Gemini API: https://docs.cloud.google.com/free/docs/free-cloud-features
- Metricool ücretsiz plan: https://help.metricool.com/main-differences-between-free-and-paid-plans-bl0v9.md
- Instagram API (kendi hesap, inceleme yok): https://developers.facebook.com/documentation/instagram-platform/overview
- YouTube API gizli kilit / denetim: https://www.rapidevelopers.com/md/api-automations/how-to-automate-youtube-video-uploads-using-the-api
