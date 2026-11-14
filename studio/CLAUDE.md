# Video Edit Stüdyosu (`studio/`)

Komut satırından çalışan video kurgu araçları: ffmpeg + Python (OpenCV, librosa, PySceneDetect, faster-whisper).
Kullanıcıyla Türkçe konuş.

## Oturum başında
- Araçlar eksikse (ör. `python3 -c "import librosa, cv2, scenedetect"` hata verirse ya da `assets/sfx/katalog.json`
  yoksa) önce şunu çalıştır: `bash studio/setup.sh` (10 sn–birkaç dk; ağ adımları başarısız olursa uyarıp geçer).
- Tam doğrulama: `bash studio/scripts/test_hepsi.sh` (her araç ✓/✗ + örnek edit).

## Her edit isteğinde iş akışı
1. **İncele:** `ffprobe -v error -show_entries format=duration:stream=codec_type,width,height,r_frame_rate -of compact <video>`
   (gerekirse `python3 studio/scripts/sahne.py <video> --kontakt` ile sahnelere bak). Kısa bir plan çıkar (2–5 madde).
2. **Önizleme:** araçları `--onizleme` ile çalıştır (540p, hızlı). Birkaç kare çıkarıp kendin bak:
   `ffmpeg -ss 2 -i out.mp4 -frames:v 1 -vf scale=360:-1 temp/kare.png` → Read ile görüntüle. Yazı taşması, kırpma,
   renk, zamanlama sorunlarını düzelt.
3. **Final:** aynı komutları `--onizleme` olmadan çalıştır, en sonda `export.py` ile platforma göre kodla.
4. **Orijinal dosyaların üzerine asla yazma.** Çıktılar `studio/output/` içine tarihli isimle gider
   (`<ad>_<islem>_<YYYYMMDD_HHMMSS>.mp4`; araçlar bunu otomatik yapar, `-o` ile girdinin üstüne yazmayı reddeder).
5. **Varsayılanlar:** 9:16 dikey Reels, 1080x1920, 30 fps, SFX açık (`auto_sfx.py` her kurgunun export'tan önceki
   son adımı).
   - **Ses:** her export'ta ortalama ≤ -14 LUFS (iki geçişli loudnorm) + limiter ile true peak ≤ -1 dBTP; kodlanmış
     dosya ölçülüp gerekirse otomatik düzeltilir (`_ortak.ses_normalize / ses_sinirla / ses_olc`).
   - **Güvenli alan:** dikey videoda yazı/altyazı/alt bant üstten %12, alttan %25 boş bırakır (`_ortak.guvenli_alan`;
     yatayda %6/%10). Altyazı varsayılan olarak güvenli alanın alt sınırına oturur, konumlar buna kırpılır.
   - **Altyazı:** satırlar asla üst üste binmez (her olay bir sonrakinin başladığı santisaniyede biter).
6. **Bitince:** dosyayı kullanıcıya gönder (SendUserFile) ve yaptıklarını 2–3 satırla özetle.

## Klasörler
`input/` kaynak videolar · `output/` çıktılar · `temp/` ara dosyalar · `assets/fonts` (Montserrat Black/ExtraBold/Bold,
Anton, Bebas Neue — hepsi Türkçe karakterli; yedek DejaVu Sans Bold) · `assets/music` · `assets/sfx` (20 sentez ses +
`katalog.json`; `real/` gerçek CC0 sesler + `KAYNAKLAR.csv`) · `assets/luts` (6 sinematik .cube) · `assets/models`
(whisper) · `scripts/`

## Olay zinciri (.olaylar.json)
`kesim/gecis/yazi/efekt/beat` her çıktının yanına `<çıktı>.olaylar.json` yazar (kesim, geçiş türü, yazı giriş anı,
vurgu). Sonraki araçlar bunu taşır (`kirp/renk/ses/altyazi/export` zamanları korur, `hiz` yeniden ölçekler).
`auto_sfx.py` bu kesin işaretleri görüntü analiziyle birleştirir; bu yüzden **SFX'i zincirin sonunda** çalıştır.

## Araçlar ve örnekler (hepsi `studio/` içinden: `cd studio`)
Tüm video araçlarında ortak: `-o çıktı.mp4`, `--onizleme`, `-h` (ayrıntılı yardım).

### Kesme / birleştirme / sıralama — `kesim.py`
```bash
python3 scripts/kesim.py kes input/v.mp4 --bas 2 --son 7.5
python3 scripts/kesim.py kes input/v.mp4 --bas 1 --sure 3
python3 scripts/kesim.py parcala input/v.mp4 "0-2,4.5-6,8-10"      # aralıkları alıp sırayla birleştir
python3 scripts/kesim.py birlestir a.mp4 b.mp4 c.mp4 --sira 3,1,2   # farklı boyut/fps olsa da
python3 scripts/kesim.py sirala liste.txt                           # satır: dosya [bas son]
```
### En-boy / akıllı kırpma — `kirp.py` (yüz > hareket > belirginlik takibi, yumuşatılmış kamera)
```bash
python3 scripts/kirp.py input/v.mp4                         # 9:16 akıllı, 1080x1920
python3 scripts/kirp.py input/v.mp4 --oran 1:1 --mod bulanik  # kırpmadan bulanık arka plan
python3 scripts/kirp.py input/v.mp4 --oran 16:9 --mod merkez  # 4:5 de var
```
### Hız — `hiz.py`
```bash
python3 scripts/hiz.py v.mp4 --kat 0.5 --akici     # akıcı slow-motion (kare enterpolasyonu)
python3 scripts/hiz.py v.mp4 --kat 2               # hızlandır
python3 scripts/hiz.py v.mp4 --ramp hizli-yavas-hizli   # hazır: yavas-hizli, hizli-yavas, nefes
python3 scripts/hiz.py v.mp4 --ramp "0:1,2:1,2.5:0.3,4:0.3,4.5:2"   # kaynak_sn:hız
```
### Geçişler — `gecis.py` (fade, crossfade, zoom, whip, flash, glitch, kaydir-sol, daire + tüm xfade adları)
```bash
python3 scripts/gecis.py a.mp4 b.mp4 c.mp4 --tur whip,flash
python3 scripts/gecis.py a.mp4 b.mp4 --tur crossfade --sure 0.8
```
### Efektler — `efekt.py` (biçim: `ad[@bas-son][=güç]`)
```bash
python3 scripts/efekt.py v.mp4 -e zoomin -e vignette
python3 scripts/efekt.py v.mp4 -e punch@3-4=0.2 -e shake@3-3.5=1.5 -e flash@3-3.3
python3 scripts/efekt.py v.mp4 -e bw@0-2 -e glow=0.6 -e blur@0-0.5=20 -e glitch@5-5.4
# hepsi: zoomin zoomout punch shake glow blur bw vignette glitch flash sepya keskin
```
### Renk — `renk.py` (LUT'lar `scripts/lut_uret.py` ile üretilir)
```bash
python3 scripts/renk.py --liste
python3 scripts/renk.py v.mp4 --preset sinematik_teal_turuncu        # + sicak_altin_saat, soguk_gece_gerilim,
python3 scripts/renk.py v.mp4 --preset vintage_film --yogunluk 0.6   #   vintage_film, noir_kontrast, canli_reels
python3 scripts/renk.py v.mp4 --lut benim.cube
python3 scripts/renk.py v.mp4 --kontrast 1.15 --doygunluk 1.3 --parlaklik 0.03 --sicaklik 7000
```
### Yazı — `yazi.py` (libass; `*kelime*` vurgu rengi; uzun metin otomatik 2 satıra bölünüp sığdırılır)
```bash
python3 scripts/yazi.py v.mp4 --baslik "BÜYÜK *AÇILIŞ*" --animasyon pop --bas 0.3 --sure 2.5
python3 scripts/yazi.py v.mp4 -y "İLK|0.5|2.5|kay|ust" -y "ŞİMDİ İZLE|4|6|zoom|orta" -y "Merhaba|1|3|daktilo|alt"
python3 scripts/yazi.py v.mp4 --bant "Ayşe Çelik" --bant-alt "YÖNETMEN" --bas 1 --sure 4 --bant-renk "#E63946"
# animasyonlar: pop kay zoom fade daktilo kelime parlama sallan · fontlar: montserrat anton bebas · --boyut 0.075
```
### Otomatik altyazı — `altyazi.py` (kelime kelime vurgulu, videoya gömülü + .srt)
```bash
python3 scripts/altyazi.py v.mp4                      # faster-whisper (model gerekir; yoksa "model yok", kod 3)
python3 scripts/altyazi.py v.mp4 --model medium --buyuk --kelime 3 --konum 0.6   # konum güvenli alana kırpılır
python3 scripts/altyazi.py v.mp4 --metin "Merhaba arkadaşlar" --bas 0.5 --son 3   # model olmadan
python3 scripts/altyazi.py v.mp4 --srt konusma.srt
```
Model elle: `assets/models/faster-whisper-small/` içine (model.bin, config.json, tokenizer.json, vocabulary.*).
### Ses — `ses.py`
```bash
python3 scripts/ses.py v.mp4 --muzik assets/music/parca.mp3 --muzik-db -12 --orijinal 0.4 --fade-out 2
python3 scripts/ses.py v.mp4 --muzik otomatik --ducking       # konuşmada müzik otomatik kısılır
python3 scripts/ses.py v.mp4 --muzik parca.mp3 --sil --muzik-bas 30   # orijinal ses yok, müziğin 30. sn'si
python3 scripts/ses.py v.mp4 --orijinal 1.5 --normalize
```
### Beat sync — `beat.py`
```bash
python3 scripts/beat.py analiz parca.mp3
python3 scripts/beat.py montaj parca.mp3 input/*.mp4 --vurus 2 --sure 15 --vurgu --boyut 1080x1920
python3 scripts/beat.py montaj parca.mp3 a.mp4 b.mp4 --vurus 1,1,2,4      # ritim deseni
python3 scripts/beat.py hizala v.mp4 parca.mp3     # mevcut sahne kesimlerini en yakın beat'e kaydır
```
### Sahne tespiti — `sahne.py`
```bash
python3 scripts/sahne.py v.mp4                      # JSON sahne listesi
python3 scripts/sahne.py v.mp4 --bol --kontakt      # her sahne ayrı dosya + kontakt baskı PNG
```
### Otomatik SFX — `auto_sfx.py` (çıktı: `<ad>_sfx_<tarih>.mp4` + `.sfx.json` plan)
```bash
python3 scripts/auto_sfx.py v.mp4
python3 scripts/auto_sfx.py v.mp4 --yogunluk cok --seviye +2
python3 scripts/auto_sfx.py v.mp4 --yogunluk az --dramatik-yok
python3 scripts/auto_sfx.py v.mp4 --rapor           # sadece plan
```
Kesim→whoosh/swoosh, whip→sert whoosh, flash→hafif impact, yazı→pop/click, bant→swoosh, ani hareket→swoosh/impact,
durağan sahne→deklanşör, en güçlü an→riser + derin impact/bass drop. Aynı ses art arda gelmez; tepe noktası olay
karesine hizalanır; seviye yerel müzik/konuşmaya göre ayarlanır.
SFX listesi: `assets/sfx/katalog.json` (whoosh_yumusak/sert/kisa/uzun, swoosh_ince/tonal, pop_balon/tiz/agiz,
click_ui/mekanik/yumusak, impact_hafif/orta/derin, riser_gurultu/tonal, bass_drop, glitch, shutter).
Yeniden üret: `python3 scripts/sfx_uret.py --onizleme`. Gerçek CC0 sesler: `python3 scripts/sfx_indir.py`.
### Export — `export.py`
```bash
python3 scripts/export.py v.mp4                                 # reels 1080x1920 30fps
python3 scripts/export.py v.mp4 --platform tiktok --fps 60      # shorts, youtube, kare, 4x5
python3 scripts/export.py v.mp4 --platform youtube --fps 60 --akici --sigdir bulanik
python3 scripts/export.py v.mp4 --hepsi                         # reels + youtube + kare
```
H.264 High 4.2, CRF 16 + maxrate (25M dikey / 40M YouTube), AAC 320k 48 kHz, ≤ -14 LUFS, true peak ≤ -1 dBTP
(`--normalize-yok` verilse bile limiter açık), BT.709, +faststart. Sonuç ses değerleri çıktıda yazdırılır.

## Tipik tam kurgu (örnek)
```bash
cd studio
python3 scripts/gecis.py input/a.mp4 input/b.mp4 input/c.mp4 --tur whip,flash -o temp/1.mp4
python3 scripts/kirp.py temp/1.mp4 -o temp/2.mp4
python3 scripts/renk.py temp/2.mp4 --preset sinematik_teal_turuncu -o temp/3.mp4
python3 scripts/yazi.py temp/3.mp4 --baslik "BAŞLIK" --animasyon pop -o temp/4.mp4
python3 scripts/ses.py temp/4.mp4 --muzik otomatik --ducking -o temp/5.mp4
python3 scripts/auto_sfx.py temp/5.mp4 -o temp/6.mp4
python3 scripts/export.py temp/6.mp4 --platform reels
```

## Bilinen kısıtlar (bu bulut ortamı)
- huggingface.co, api.openverse.org, freesound engelli → whisper modeli, gerçek CC0 SFX ve earshot kurulamadı.
  Erişim açılınca `bash studio/setup.sh` hepsini otomatik dener.
- earshot (github.com/Leonxlnx/earshot) incelendi: kod temiz (ağ erişimi yalnızca HF model indirme, isteğe bağlı
  ve onaylı Gemini eleştirisi, lisans sayfası karşılaştırması). Modelleri HF'den indiği için şimdilik kurulmadı.
- opencv-python-headless 4.x'e sabit (5.x Haar yüz tespitini içermiyor; akıllı crop'ta yüz önceliği için gerekli).
- Fontlar SIL OFL lisanslı (Google Fonts / JulietaUla); sentez SFX'ler projeye ait, telifsiz.
