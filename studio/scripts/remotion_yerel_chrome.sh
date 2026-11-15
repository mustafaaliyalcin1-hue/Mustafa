#!/usr/bin/env bash
# Bir Remotion projesine makinedeki headless Chromium'u "önceden indirilmiş tarayıcı" olarak tanıtır.
# Neden: Remotion'ın kendi Chrome indirmesi (remotion.media) bu bulut ortamında engelli. Skill kodunu değiştirmeden,
# Remotion'ın arayacağı önbellek yoluna (<proje>/node_modules/.remotion/chrome-headless-shell/linux64/...) bağlantı +
# beklediği VERSION dosyası konur. Render komutunu o proje klasöründen (cwd) çalıştırmak gerekir.
#   bash studio/scripts/remotion_yerel_chrome.sh ~/.claude/skills/shorts/remotion
set -euo pipefail
P="${1:?Remotion proje klasörü ver}"
CH="${REMOTION_CHROME:-$(ls -d /opt/pw-browsers/chromium_headless_shell-*/chrome-headless-shell-linux64 2>/dev/null | tail -1)}"
[ -d "$CH" ] || { echo "headless Chromium bulunamadı (/opt/pw-browsers)"; exit 1; }
F="$P/node_modules/@remotion/renderer/dist/browser/get-chrome-download-url.js"
[ -f "$F" ] || { echo "Remotion yüklü değil: $P (önce npm install)"; exit 1; }
VER=$(node -e "console.log(require('$F').TESTED_VERSION)")
D="$P/node_modules/.remotion/chrome-headless-shell"
mkdir -p "$D/linux64"
ln -sfn "$CH" "$D/linux64/chrome-headless-shell-linux64"
printf '%s' "$VER" > "$D/VERSION"
echo "Remotion ($P) → yerel Chromium: $CH (VERSION $VER)"
