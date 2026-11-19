#!/usr/bin/env bash
# web/ klasörüne ffmpeg.wasm, fontlar ve müziği toplar (derle.sh çağırır)
set -euo pipefail
cd "$(dirname "$0")"
[ -d node_modules/@ffmpeg/core ] || npm install --no-audit --no-fund >/dev/null
mkdir -p web/ffmpeg web/core web/fonts web/muzik
cp node_modules/@ffmpeg/ffmpeg/dist/esm/*.js web/ffmpeg/
cp node_modules/@ffmpeg/core/dist/esm/ffmpeg-core.js node_modules/@ffmpeg/core/dist/esm/ffmpeg-core.wasm web/core/
cp ../assets/fonts/Montserrat-Black.ttf ../assets/fonts/Montserrat-Bold.ttf web/fonts/
[ -s web/muzik/melodik.mp3 ] || ffmpeg -loglevel error -y -i ../assets/music/melodik_92bpm.wav -c:a libmp3lame -b:a 128k web/muzik/melodik.mp3
echo "web varlıkları hazır: $(du -sh web | cut -f1)"
