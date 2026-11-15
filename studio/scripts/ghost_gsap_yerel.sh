#!/usr/bin/env bash
# Ghost Editor (HyperFrames) projesinde GSAP'ı CDN yerine yerel dosyadan yükler.
# Neden: cdn.jsdelivr.net bu bulut ortamında engelli; render "sub_timeline_script_failure" ile durur.
# Aynı gsap sürümü npm kayıt defterinden alınır (erişilebilir), studio/vendor/ altında önbelleklenir.
# build.mjs'ten SONRA, finals.py preview/render'dan ÖNCE çalıştır:
#   node $S/scripts/build.mjs $P && bash studio/scripts/ghost_gsap_yerel.sh $P && python3 $S/scripts/finals.py preview $P
set -euo pipefail
P="${1:?ghost-editor proje klasörü ver}"
I="$P/index.html"
[ -f "$I" ] || { echo "index.html yok: önce build.mjs"; exit 1; }
VER=$(grep -oE 'cdn\.jsdelivr\.net/npm/gsap@[0-9.]+' "$I" | head -1 | sed 's/.*@//')
[ -n "$VER" ] || { echo "CDN gsap referansı yok (zaten yerel)"; exit 0; }
V="$(cd "$(dirname "$0")/.." && pwd)/vendor"; mkdir -p "$V"
J="$V/gsap-$VER.min.js"
if [ ! -s "$J" ]; then
  T=$(mktemp -d); (cd "$T" && npm pack "gsap@$VER" --silent >/dev/null && tar xzf "gsap-$VER.tgz")
  cp "$T/package/dist/gsap.min.js" "$J"; rm -rf "$T"
fi
mkdir -p "$P/assets"; cp "$J" "$P/assets/gsap.min.js"
sed -i "s|https://cdn.jsdelivr.net/npm/gsap@$VER/dist/gsap.min.js|assets/gsap.min.js|g" "$I"
echo "gsap $VER yerel: $P/assets/gsap.min.js"
