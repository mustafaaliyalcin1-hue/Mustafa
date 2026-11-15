#!/usr/bin/env bash
# Video skill'lerini tek komutla (yeniden) kurar — setup.sh çağırır, tek başına da çalışır:
#   bash studio/skills_kur.sh
# Her repo, güvenlik incelemesi yapılmış commit'e SABİTLİDİR (yeni sürüm = yeniden inceleme gerekir).
# Ağ adımı başarısız olursa 1 kez yeniden denenir, olmazsa not düşülüp geçilir. Ücretli servis çağrılmaz,
# API anahtarı istenmez/yazılmaz.
set -u
cd "$(dirname "$0")"
ST=$(pwd); REPO=$(cd .. && pwd); SRC=$ST/temp/skills_src; mkdir -p "$SRC" "$HOME/.claude/skills"
ok()   { echo "  ✓ $*"; }
uyar() { echo "  ⚠ $*"; }
dene2() { "$@" || { sleep 3; "$@"; }; }

# incelenen commit'ler (2026-11-15)
FFMPEG_SKILL=29fe4d42256f1305173b838f14f1a7f74fc23fd6
GHOST=ce172726c36293722b08eb57b5b307d4f06389e8
SHORTS=a369fad9d84287edbb8fa3ab515f268e770f683b
OPENMONTAGE=fecb9a1e3cc23ef84de30b272059457a427f16f8

klon() {  # klon owner/repo hedef commit
  local r=$1 d=$2 c=$3
  if [ ! -d "$d/.git" ]; then
    rm -rf "$d"; dene2 git clone -q --filter=blob:none "https://github.com/$r" "$d" 2>/dev/null || return 1
  fi
  git -C "$d" cat-file -e "$c^{commit}" 2>/dev/null || dene2 git -C "$d" fetch -q origin "$c" 2>/dev/null || return 1
  git -C "$d" -c advice.detachedHead=false checkout -q "$c"
}
PIPF="-q --disable-pip-version-check --break-system-packages"

echo "== Skill 1: ffmpeg-skill (proje skill'i: .claude/skills/ffmpeg-skill, repoda)"
if [ -f "$REPO/.claude/skills/ffmpeg-skill/SKILL.md" ]; then ok "repoda mevcut"
elif klon kajisho5/ffmpeg-skill "$SRC/ffmpeg-skill" $FFMPEG_SKILL; then
  (cd "$REPO" && node "$SRC/ffmpeg-skill/bin/install.js" --project >/dev/null) && ok "kuruldu" || uyar "kurulamadı"
else uyar "klonlanamadı (ağ)"; fi
python3 "$REPO/.claude/skills/ffmpeg-skill/scripts/_contract.py" doctor 2>/dev/null | grep -E "^ok:" | sed 's/^/    /'

echo "== Skill 2: Ghost Editor (~/.claude/skills/ghost-editor)"
G=$HOME/.claude/skills/ghost-editor
if klon kurbaitaev/ghost-editor "$G" $GHOST; then
  pip install $PIPF openai-whisper google-genai >/dev/null 2>&1 && ok "openai-whisper, google-genai (yalnız kütüphane)" || uyar "pip paketleri kurulamadı"
  if [ "$(ls "$G/library/music" 2>/dev/null | wc -l)" -le 1 ] && ! curl -sf -m 10 -o /dev/null https://assets.mixkit.co 2>/dev/null; then
    uyar "Mixkit kütüphanesi atlandı (mixkit.co erişilemiyor) — repo içi CC0 sesler var"
  else [ "$(ls "$G/library/music" 2>/dev/null | wc -l)" -gt 1 ] || (timeout 600 python3 "$G/scripts/library_restore.py" >/dev/null 2>&1 \
    && ok "Mixkit kütüphanesi" || uyar "Mixkit kütüphanesi inmedi — repo içi CC0 sesler var"); fi
  bash "$G/scripts/hf.sh" --version >/dev/null 2>&1 && ok "HyperFrames $(cat "$G/scripts/HF_VERSION")" || uyar "HyperFrames npx önbelleği yok"
  echo "    not: render öncesi bash studio/scripts/ghost_gsap_yerel.sh <proje> (jsdelivr engelli)"
else uyar "klonlanamadı (ağ)"; fi

echo "== Skill 3: Claude Shorts (~/.claude/skills/shorts)"
if klon AgriciDaniel/claude-shorts "$SRC/claude-shorts" $SHORTS; then
  command -v rsync >/dev/null || timeout 200 apt-get install -y -qq rsync jq >/dev/null 2>&1
  V=$HOME/.shorts-skill
  if ! "$V/bin/python" -c "import mediapipe as m, faster_whisper; assert hasattr(m,'solutions')" 2>/dev/null; then
    # mp.solutions için mediapipe 0.10.21 gerekir → Python 3.11 venv (uv). download.pytorch.org engelli: torch atlanır (gerekmiyor).
    rm -rf "$V"
    if command -v uv >/dev/null && timeout 600 uv venv -q --python 3.11 "$V" && timeout 900 uv pip install -q --python "$V/bin/python" \
        faster-whisper "mediapipe==0.10.21" numpy opencv-python; then ok "venv (py3.11, mediapipe 0.10.21)"
    else uyar "shorts venv kurulamadı (uv/python3.11 yok?)"; fi
  else ok "venv mevcut"; fi
  bash "$SRC/claude-shorts/install.sh" >/dev/null 2>&1 && ok "skill kopyalandı" || uyar "install.sh başarısız"
  (cd "$HOME/.claude/skills/shorts/remotion" && dene2 npm install --silent >/dev/null 2>&1) && ok "Remotion bağımlılıkları" || uyar "npm install başarısız"
  bash "$ST/scripts/remotion_yerel_chrome.sh" "$HOME/.claude/skills/shorts/remotion" >/dev/null 2>&1 && ok "yerel Chromium bağlandı" \
    || uyar "render motoru yok (Chromium bulunamadı)"
else uyar "klonlanamadı (ağ)"; fi

echo "== Skill 4: OpenMontage (studio/vendor/OpenMontage, GPU kurulumu YOK)"
O=$ST/vendor/OpenMontage
if klon calesthio/OpenMontage "$O" $OPENMONTAGE; then
  if [ ! -x "$O/.venv/bin/python" ] || [ ! -d "$O/remotion-composer/node_modules" ]; then
    (cd "$O" && timeout 2400 make setup >/dev/null 2>&1 || (sleep 3; cd "$O" && timeout 2400 make setup >/dev/null 2>&1)) \
      && ok "make setup" || uyar "make setup başarısız (log: cd $O && make setup)"
  else ok "kurulu"; fi
  # yerel Chromium + ücretli çağrı kapalı (bütçe tavanı 0 $)
  cat > "$O/remotion-composer/remotion.config.ts" <<'TS'
// Stüdyo eki: remotion.media engelli; makinedeki Playwright headless Chromium kullanılır.
import { Config } from "@remotion/cli/config";
Config.setBrowserExecutable(process.env.REMOTION_CHROME ?? "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell");
Config.setChromiumOpenGlRenderer("swangle");
TS
  python3 - "$O/config.yaml" <<'PY'
import re, sys
p = sys.argv[1]; s = open(p).read()
s = re.sub(r'(?m)^  mode: \w+.*$', '  mode: cap                      # stüdyo: ücretli çağrı KAPALI (onaysız harcama yok)', s, count=1)
s = re.sub(r'(?m)^  total_usd: [\d.]+', '  total_usd: 0.00', s, count=1)
s = re.sub(r'(?m)^  single_action_approval_usd: [\d.]+', '  single_action_approval_usd: 0.00', s, count=1)
open(p, 'w').write(s)
PY
  ok "bütçe tavanı 0 \$ (config.yaml), Remotion → yerel Chromium"
  [ -f "$O/.env" ] && grep -qE '^(FAL_KEY|OPENAI_API_KEY|ELEVENLABS_API_KEY)=.+' "$O/.env" && uyar ".env içinde API anahtarı var: ücretli sağlayıcılar açılabilir!"
else uyar "klonlanamadı (ağ)"; fi

echo "== Skill 5: Higgsfield Editorial Motion Graphics (bulut MCP — hesap + kredi ister)"
if curl -sf -m 10 -o /dev/null https://mcp.higgsfield.ai/mcp 2>/dev/null; then
  echo "    mcp.higgsfield.ai erişilebilir. Etkinleştirmek KULLANICI işi: claude.ai → Customize → Connectors →"
  echo "    https://mcp.higgsfield.ai/mcp ekle ve Higgsfield hesabıyla giriş yap (ayrıntı: studio/skills_notlar/higgsfield.md)"
else uyar "mcp.higgsfield.ai erişilemiyor (ağ) — kurulum hazır, etkin değil: studio/skills_notlar/higgsfield.md"; fi
