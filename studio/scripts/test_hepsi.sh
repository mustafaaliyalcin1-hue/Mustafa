#!/usr/bin/env bash
# Stüdyo testi: her aracı tek tek dener (✓/✗), sonra hepsini birleştiren tam örnek edit yapar.
# Kullanım: bash scripts/test_hepsi.sh            (studio/ klasöründen ya da herhangi bir yerden)
#           bash scripts/test_hepsi.sh --sadece-edit
set -u
cd "$(dirname "$0")/.."
S=scripts; T=temp/test; mkdir -p "$T"
IN=input; M=assets/music/test_muzik_120bpm.mp3
[ -f "$IN/ham_cekim.mp4" ] && [ -f "$M" ] || python3 $S/test_medya.py
[ -f assets/sfx/katalog.json ] || python3 $S/sfx_uret.py
[ -f assets/luts/vintage_film.cube ] || python3 $S/lut_uret.py
GECTI=0; KALDI=0
dene() {  # dene "ad" komut...
  local ad="$1"; shift
  if "$@" >"$T/log_${ad// /_}.txt" 2>&1; then echo "✓ $ad"; GECTI=$((GECTI+1)); else
    local k=$?; if [ $k -eq 3 ] || [ $k -eq 4 ]; then echo "⚠ $ad (atlandı: $(grep -m1 UYARI "$T/log_${ad// /_}.txt" | sed 's/.*UYARI: //'))";
    else echo "✗ $ad (log: $T/log_${ad// /_}.txt)"; KALDI=$((KALDI+1)); fi; fi
}
if [ "${1:-}" != "--sadece-edit" ]; then
  echo "== Araç testleri =="
  dene "kesim kes"        python3 $S/kesim.py kes $IN/klip1_mandelbrot.mp4 --bas 1 --son 3 --onizleme -o $T/kes.mp4
  dene "kesim parcala"    python3 $S/kesim.py parcala $IN/ham_cekim.mp4 "0-1.5,5-6,9-10" --onizleme -o $T/parca.mp4
  dene "kesim birlestir"  python3 $S/kesim.py birlestir $IN/klip1_mandelbrot.mp4 $IN/klip2_gradyan.mp4 --sira 2,1 --onizleme -o $T/birlesik.mp4
  printf 'klip3_testsrc.mp4 0 2\nklip1_mandelbrot.mp4 1 2.5\n' > $IN/_test_liste.txt
  dene "kesim sirala"     python3 $S/kesim.py sirala $IN/_test_liste.txt --onizleme -o $T/sirali.mp4
  dene "kirp 9:16 akilli" python3 $S/kirp.py $IN/ham_cekim.mp4 --onizleme -o $T/916.mp4
  dene "kirp 1:1 bulanik" python3 $S/kirp.py $IN/klip3_testsrc.mp4 --oran 1:1 --mod bulanik --onizleme -o $T/11.mp4
  dene "kirp 16:9"        python3 $S/kirp.py $T/916.mp4 --oran 16:9 --mod bulanik --onizleme -o $T/169.mp4
  dene "hiz slow-mo"      python3 $S/hiz.py $IN/klip1_mandelbrot.mp4 --kat 0.5 --onizleme -o $T/slow.mp4
  dene "hiz akici slow"   python3 $S/hiz.py $IN/klip1_mandelbrot.mp4 --kat 0.5 --akici --onizleme -o $T/slow_akici.mp4
  dene "hiz hizlandir"    python3 $S/hiz.py $IN/klip2_gradyan.mp4 --kat 2 --onizleme -o $T/fast.mp4
  dene "hiz speed ramp"   python3 $S/hiz.py $IN/ham_cekim.mp4 --ramp hizli-yavas-hizli --onizleme -o $T/ramp.mp4
  for g in fade crossfade zoom whip flash; do
    dene "gecis $g"       python3 $S/gecis.py $IN/klip1_mandelbrot.mp4 $IN/klip2_gradyan.mp4 --tur $g --onizleme -o $T/gecis_$g.mp4
  done
  for e in zoomin zoomout punch@1-2 shake@1-2 glow blur@0-1 bw vignette glitch@1-2 flash@1-1.5; do
    dene "efekt $e"       python3 $S/efekt.py $IN/klip3_testsrc.mp4 -e $e --onizleme -o "$T/efekt_${e%%@*}.mp4"
  done
  dene "renk ayar"        python3 $S/renk.py $IN/klip2_gradyan.mp4 --kontrast 1.2 --doygunluk 1.3 --sicaklik 7000 --onizleme -o $T/renk.mp4
  for p in sinematik_teal_turuncu sicak_altin_saat soguk_gece_gerilim vintage_film noir_kontrast canli_reels; do
    dene "renk $p"        python3 $S/renk.py $IN/klip2_gradyan.mp4 --preset $p --onizleme -o $T/lut_$p.mp4
  done
  dene "renk LUT dosya"   python3 $S/renk.py $IN/klip2_gradyan.mp4 --lut assets/luts/vintage_film.cube --yogunluk 0.5 --onizleme -o $T/lut_dosya.mp4
  dene "yazi baslik"      python3 $S/yazi.py $IN/klip1_mandelbrot.mp4 --baslik "BÜYÜK *AÇILIŞ*" --animasyon zoom --onizleme -o $T/yazi1.mp4
  dene "yazi animasyonlar" python3 $S/yazi.py $IN/klip1_mandelbrot.mp4 -y "POP|0.2|1.5|pop|ust" -y "KAY|1.5|3|kay|orta" -y "Daktilo yazısı|3|5|daktilo|alt" -y "kelime kelime geliyor|0.5|3|kelime|orta" --onizleme -o $T/yazi2.mp4
  dene "yazi bant"        python3 $S/yazi.py $IN/klip1_mandelbrot.mp4 --bant "Ayşe Çelik" --bant-alt "SES TASARIMI" --onizleme -o $T/yazi3.mp4
  dene "altyazi whisper"  python3 $S/altyazi.py $IN/klip1_mandelbrot.mp4 --onizleme -o $T/alt_whisper.mp4
  dene "altyazi metin"    python3 $S/altyazi.py $IN/klip1_mandelbrot.mp4 --metin "Bugün size harika bir şey göstereceğim" --buyuk --onizleme -o $T/alt_metin.mp4
  dene "ses muzik+duck"   python3 $S/ses.py $IN/klip1_mandelbrot.mp4 --muzik $M --ducking --orijinal 0.5 -o $T/ses1.mp4
  dene "ses sessiz"       python3 $S/ses.py $IN/klip1_mandelbrot.mp4 --sil -o $T/ses2.mp4
  dene "beat analiz"      python3 $S/beat.py analiz $M
  dene "beat montaj"      python3 $S/beat.py montaj $M $IN/klip1_mandelbrot.mp4 $IN/klip2_gradyan.mp4 $IN/klip3_testsrc.mp4 --vurus 2 --sure 8 --vurgu --onizleme -o $T/beat.mp4
  dene "beat hizala"      python3 $S/beat.py hizala $IN/ham_cekim.mp4 $M --onizleme -o $T/hizala.mp4
  dene "sahne tespit"     python3 $S/sahne.py $IN/ham_cekim.mp4
  dene "sahne bol"        python3 $S/sahne.py $IN/ham_cekim.mp4 --bol --kontakt
  dene "export reels 60"  python3 $S/export.py $IN/klip3_testsrc.mp4 --platform reels --fps 60 -o $T/reels60.mp4
  dene "export youtube"   python3 $S/export.py $IN/klip3_testsrc.mp4 --platform youtube -o $T/youtube.mp4
  dene "sfx sentez"       python3 $S/sfx_uret.py
  dene "sfx gercek (openverse)" python3 $S/sfx_indir.py
  dene "auto_sfx"         python3 $S/auto_sfx.py $T/gecis_whip.mp4 -o $T/sfx.mp4
  rm -f $IN/_test_liste.txt
  echo "== $GECTI geçti, $KALDI başarısız =="
fi

echo "== Tam örnek edit =="
E=$T/edit; mkdir -p $E
set -e
python3 $S/kesim.py kes $IN/klip1_mandelbrot.mp4 --bas 0.5 --son 4.5 -o $E/a.mp4 2>/dev/null
python3 $S/kesim.py kes $IN/klip2_gradyan.mp4 --bas 1 --son 4.5 -o $E/b.mp4 2>/dev/null
python3 $S/kesim.py kes $IN/klip3_testsrc.mp4 --bas 0 --son 4 -o $E/c.mp4 2>/dev/null
python3 $S/gecis.py $E/a.mp4 $E/b.mp4 $E/c.mp4 --tur whip,flash -o $E/1_gecis.mp4 2>/dev/null          # kesim + geçiş
python3 $S/kirp.py $E/1_gecis.mp4 --oran 9:16 -o $E/2_dikey.mp4 2>/dev/null                            # 9:16 akıllı crop
python3 $S/renk.py $E/2_dikey.mp4 --preset sinematik_teal_turuncu --yogunluk 0.85 -o $E/3_renk.mp4 2>/dev/null
python3 $S/efekt.py $E/3_renk.mp4 -e zoomin@0-3.6=0.12 -e punch@7.2-7.8=0.15 -e vignette=0.8 -o $E/4_efekt.mp4 2>/dev/null
python3 $S/yazi.py $E/4_efekt.mp4 -y "TEPETAKLAK *STÜDYO*|0.3|3.3|pop|orta" \
  -y "Her kare beat'te|4.2|6.6|kelime|ust" -y "ŞİMDİ *İZLE*|8.3|10.6|zoom|orta" \
  --bant "Video Edit Stüdyosu" --bant-alt "OTOMATİK SFX · RENK · ALTYAZI" --bas 4.4 --sure 3 -o $E/5_yazi.mp4 2>/dev/null
python3 $S/altyazi.py $E/5_yazi.mp4 --metin "Kes, birleştir, renklendir ve sesi otomatik ekle" --bas 0.8 --son 3.4 --buyuk --boyut 0.045 -o $E/6_altyazi.mp4 2>/dev/null
python3 $S/ses.py $E/6_altyazi.mp4 --muzik $M --muzik-db -4 --orijinal 0.15 --ducking -o $E/7_ses.mp4 2>/dev/null
python3 $S/auto_sfx.py $E/7_ses.mp4 -o $E/8_sfx.mp4 2>/dev/null > $E/sfx_plan.json
TARIH=$(date +%Y%m%d_%H%M%S)
python3 $S/export.py $E/8_sfx.mp4 --platform reels --fps 30 -o output/ornek_edit_$TARIH.mp4 2>/dev/null
echo "✓ örnek edit: output/ornek_edit_$TARIH.mp4"
