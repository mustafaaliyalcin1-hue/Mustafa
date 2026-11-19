#!/usr/bin/env bash
# Video Edit Stüdyosu — tek komutla kurulum (yeni/sıfırlanmış oturum için).
#   bash studio/setup.sh            # kur + doğrula
#   bash studio/setup.sh --test     # kur + tüm araç testleri + örnek edit
# Ağ adımları 1 kez yeniden denenir; olmazsa yedeğe geçilir, kurulum asla takılmaz.
set -u
cd "$(dirname "$0")"
ST=$(pwd)
ok()   { echo "  ✓ $*"; }
uyar() { echo "  ⚠ $*"; }
dene2() { "$@" || { sleep 2; "$@"; }; }   # 1 kez yeniden dene

echo "== 1. Klasörler"
mkdir -p input output temp assets/{fonts,music,sfx/real,luts,models} scripts && ok "input/ output/ temp/ assets/ scripts/"

echo "== 2. ffmpeg / ffprobe"
if command -v ffmpeg >/dev/null && command -v ffprobe >/dev/null; then ok "$(ffmpeg -version | head -1 | cut -d' ' -f1-3)"
else
  if command -v apt-get >/dev/null && dene2 timeout 300 bash -c "apt-get update -qq && DEBIAN_FRONTEND=noninteractive apt-get install -y -qq ffmpeg" >/dev/null 2>&1; then
    ok "apt ile kuruldu"
  else
    uyar "apt olmadı → pip static-ffmpeg / imageio-ffmpeg"
    pip install -q --break-system-packages static-ffmpeg imageio-ffmpeg 2>/dev/null || pip install -q static-ffmpeg imageio-ffmpeg
    python3 -c "import static_ffmpeg; static_ffmpeg.add_paths()" 2>/dev/null
    BIN=$(python3 -c "import static_ffmpeg.run as r; f,p=r.get_or_fetch_platform_executables_else_raise(); print(f)" 2>/dev/null \
          || python3 -c "import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())")
    mkdir -p "$HOME/.local/bin"; ln -sf "$BIN" "$HOME/.local/bin/ffmpeg"
    [ -f "$(dirname "$BIN")/ffprobe" ] && ln -sf "$(dirname "$BIN")/ffprobe" "$HOME/.local/bin/ffprobe"
    export PATH="$HOME/.local/bin:$PATH"
    grep -q '.local/bin' "$HOME/.bashrc" 2>/dev/null || echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$HOME/.bashrc"
    command -v ffmpeg >/dev/null && ok "ffmpeg: $BIN" || uyar "ffmpeg kurulamadı!"
  fi
fi
for f in libass lut3d xfade drawtext zoompan sidechaincompress loudnorm; do
  ffmpeg -hide_banner -filters 2>/dev/null | grep -q " ${f/libass/ass} " || uyar "ffmpeg filtresi eksik: $f"
done

echo "== 3. Python paketleri"
PIPF="-q --disable-pip-version-check"; pip install $PIPF --break-system-packages pip >/dev/null 2>&1 && PIPF="$PIPF --break-system-packages"
PAK="moviepy opencv-python-headless<5 pillow numpy scipy pydub librosa scenedetect faster-whisper fonttools soundfile"
python3 -c "import sys; sys.exit(0 if sys.version_info >= (3,13) else 1)" && PAK="$PAK audioop-lts"
dene2 pip install $PIPF $PAK 2>&1 | grep -vE "WARNING|already|dependency resolver|requires" | head -5
# opencv 5 Haar yüz tespitini içermez: 4.x'e sabitle
python3 -c "import cv2,sys; sys.exit(0 if hasattr(cv2,'CascadeClassifier') else 1)" 2>/dev/null || {
  pip uninstall -y -q opencv-python opencv-python-headless >/dev/null 2>&1; pip install $PIPF "opencv-python-headless<5" >/dev/null 2>&1; }
python3 - <<'E'
mods = ['moviepy', 'cv2', 'PIL', 'numpy', 'scipy', 'pydub', 'librosa', 'scenedetect', 'faster_whisper']
for m in mods:
    try:
        __import__(m); print(f'  ✓ {m}')
    except Exception as e:
        print(f'  ✗ {m}: {e}')
E

echo "== 4. Fontlar (Türkçe destekli kalın)"
GF=https://raw.githubusercontent.com/google/fonts/main/ofl
indir() { [ -s "assets/fonts/$2" ] && return 0; dene2 curl -sSfL -m 40 -o "assets/fonts/$2" "$1" 2>/dev/null; }
indir "$GF/anton/Anton-Regular.ttf" Anton-Regular.ttf && ok Anton || uyar "Anton inmedi"
indir "$GF/bebasneue/BebasNeue-Regular.ttf" BebasNeue-Regular.ttf && ok "Bebas Neue" || uyar "Bebas Neue inmedi"
for w in Black ExtraBold Bold; do
  indir "https://raw.githubusercontent.com/JulietaUla/Montserrat/master/fonts/ttf/Montserrat-$w.ttf" "Montserrat-$w.ttf" \
    && ok "Montserrat $w" || uyar "Montserrat $w inmedi"
done
find assets/fonts -size 0 -delete
[ -f /usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf ] && ok "yedek: DejaVu Sans Bold (eksik font yerine otomatik)"

echo "== 5. Üretilen varlıklar (LUT, SFX, test medyası)"
[ -f assets/luts/vintage_film.cube ] || python3 scripts/lut_uret.py 2>/dev/null; ok "$(ls assets/luts/*.cube | wc -l) LUT"
[ -f assets/sfx/katalog.json ] || python3 scripts/sfx_uret.py 2>/dev/null; ok "$(ls assets/sfx/*.wav | wc -l) sentez SFX"
[ -f assets/music/test_muzik_120bpm.mp3 ] || python3 scripts/test_medya.py 2>/dev/null; ok "test medyası"

echo "== 6. Ağ gerektiren isteğe bağlı adımlar"
# 6a. faster-whisper modeli (altyazı)
if ls assets/models/*whisper* >/dev/null 2>&1; then ok "whisper modeli mevcut"
else
  HF_HUB_ETAG_TIMEOUT=10 HF_HUB_DOWNLOAD_TIMEOUT=60 timeout 900 python3 -c "
from faster_whisper import download_model
download_model('small', output_dir='assets/models/faster-whisper-small')" >/dev/null 2>&1 \
    && ok "whisper small indirildi" || uyar "whisper modeli inmedi (huggingface.co erişimi yok) → altyazi.py 'model yok' der; --metin/--srt çalışır"
fi
# 6b. gerçek CC0 SFX (Openverse / freesound)
if [ -s assets/sfx/real/katalog.json ] && [ "$(cat assets/sfx/real/katalog.json)" != "[]" ]; then ok "gerçek SFX mevcut"
else python3 scripts/sfx_indir.py >/dev/null 2>&1 && ok "gerçek CC0 SFX indirildi" || uyar "Openverse erişilemedi → yalnız sentez SFX"; fi
# 6c. earshot (incelendi: kod temiz; modelleri HuggingFace'ten iner). HF yoksa kurulmaz.
if curl -sf -m 10 -o /dev/null https://huggingface.co/api/models/laion/larger_clap_general 2>/dev/null; then
  echo "  HuggingFace erişilebilir → earshot deneniyor"
  E=$ST/temp/earshot
  [ -d "$E" ] || git clone -q --depth 1 https://github.com/Leonxlnx/earshot "$E"
  if [ -d "$E" ] && pip install $PIPF torch --index-url https://download.pytorch.org/whl/cpu >/dev/null 2>&1 \
     && pip install $PIPF -e "$E[mcp]" >/dev/null 2>&1 && timeout 1200 earshot doctor --fetch >/dev/null 2>&1; then
    command -v claude >/dev/null && claude mcp add earshot -- python3 -m earshot.mcp_server >/dev/null 2>&1
    ok "earshot kuruldu + MCP"
  else
    pip uninstall -y -q earshot >/dev/null 2>&1; uyar "earshot modelleri inmedi → kaldırıldı"
  fi
else uyar "earshot atlandı (huggingface.co erişimi yok; modeller inemez)"; fi

# 6d. Konuşan kafa modu: kişi maskesi (mediapipe), TTS test girdisi (espeak-ng)
command -v apt-get >/dev/null && timeout 300 apt-get install -y -qq libegl1 libgles2 libgl1 espeak-ng rsync jq >/dev/null 2>&1
pip install $PIPF mediapipe >/dev/null 2>&1
MP=https://storage.googleapis.com/mediapipe-models/image_segmenter
for m in "selfie_multiclass_256x256/float32/latest/selfie_multiclass_256x256.tflite" "selfie_segmenter/float16/latest/selfie_segmenter.tflite"; do
  f=assets/models/$(basename "$m"); [ -s "$f" ] || dene2 curl -sSfL -m 120 -o "$f" "$MP/$m" 2>/dev/null || rm -f "$f"
done
ls assets/models/*.tflite >/dev/null 2>&1 && ok "kişi maskesi modelleri (mediapipe)" || uyar "mediapipe modelleri inmedi → kk_maske.py rembg'ye düşer"

echo "== 6e. Video skill'leri (ffmpeg-skill, Ghost Editor, Claude Shorts, OpenMontage, Higgsfield notu)"
bash skills_kur.sh

echo "== 6f. Mobil uygulama (APK) derleme araçları"
command -v apt-get >/dev/null && timeout 600 apt-get install -y -qq android-sdk-platform-23 aapt zipalign apksigner dalvik-exchange >/dev/null 2>&1
[ -f /usr/lib/android-sdk/platforms/android-23/android.jar ] && ok "Android SDK (API 23) + aapt/dx/apksigner — APK: bash mobil/derle.sh" || uyar "Android derleme araçları kurulamadı"

echo "== 7. Hızlı doğrulama"
python3 scripts/kesim.py kes input/klip1_mandelbrot.mp4 --bas 0 --son 1 --onizleme -o temp/_setup_test.mp4 >/dev/null 2>&1 \
  && ok "araç zinciri çalışıyor" || uyar "hızlı test başarısız: bash scripts/test_hepsi.sh ile ayrıntı"
rm -f temp/_setup_test.mp4*
[ "${1:-}" = "--test" ] && bash scripts/test_hepsi.sh
echo "Kurulum bitti. Kullanım: studio/CLAUDE.md"
