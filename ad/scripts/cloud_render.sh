#!/bin/bash
# Bulut oturumu için: teslim karelerinden [N0, N1) aralığını 1080p render + kompozisyon + video parçası.
#   bash ad/scripts/cloud_render.sh <H|V> <N0> <N1> [spp]
# Çıktı: ad/out/chunks/<H|V>_<N0>.mp4  (30 fps, CRF 14, sessiz)
set -e
ASP=$1; N0=$2; N1=$3; SPP=${4:-16}
cd "$(dirname "$0")/.."
python3 -c "import bpy" 2>/dev/null || pip install -q bpy==5.3.0
python3 -c "import bpy" 2>/dev/null || (apt-get update -qq && DEBIAN_FRONTEND=noninteractive apt-get install -y -qq libxi6 libxxf86vm1 libxfixes3 libxrender1 libxkbcommon0 libsm6 libgl1 libegl1 >/dev/null)
python3 -c "import scipy, PIL, numpy" 2>/dev/null || pip install -q scipy pillow numpy
W=1920; [ "$ASP" = V ] && W=1080
FR=$(python3 -c "import sys; sys.path.insert(0,'scripts'); import timeline as T; print(','.join(str(g) for g in T.ORDER[$N0:$N1]))")
RD=build/f_${ASP}; CD=build/c_${ASP}_${N0}
EGL_PLATFORM=surfaceless python3 scripts/anim.py --aspect $ASP --w $W --spp $SPP --out $RD --frames $FR
python3 scripts/comp_anim.py $RD $CD $ASP $(python3 -c "print(','.join(str(i) for i in range($N0,$N1)))")
mkdir -p out/chunks
ffmpeg -v error -y -framerate 30 -start_number $N0 -i $CD/%04d.png -frames:v $((N1-N0)) -c:v libx264 -preset slow -crf 14 -pix_fmt yuv420p out/chunks/${ASP}_$(printf %04d $N0).mp4
ls -la out/chunks/
