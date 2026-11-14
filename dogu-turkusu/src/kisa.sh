#!/usr/bin/env bash
# Kısa dikey video (Reels/Shorts): şarkının en güçlü ~40 sn'lik bölümü (genelde nakarat),
# ilk 3 sn kanca cümlesi, sonra nakarat sözleri ekranda, daha belirgin zoom.
# Önce: node kapak.cjs ... ve node yazilar.cjs ... çalışmış olmalı.
# Kullanım: bash kisa.sh <klasör> [süre_sn=40] [başlangıç_sn=otomatik]
set -euo pipefail
D="$1"; SURE="${2:-40}"; BAS="${3:-}"
if [ -z "$BAS" ]; then
  # Saniye saniye ses yüksekliği -> en yüksek ortalamalı SURE'lik pencere (nakarat genelde en güçlü kısımdır)
  BAS=$(ffmpeg -hide_banner -i "$D/sarki.mp3" -af "aresample=8000,asetnsamples=8000,astats=metadata=1:reset=1,ametadata=print:key=lavfi.astats.Overall.RMS_level" -f null - 2>&1 \
    | grep -o 'RMS_level=[-0-9.inf]*' | cut -d= -f2 | python3 -c "
import sys
v=[]
for x in sys.stdin:
    x=x.strip()
    try: f=float(x)
    except: f=-90.0
    v.append(max(f,-90.0))
w=int($SURE); best=(0,-1e9)
for i in range(0,max(1,len(v)-w)):
    s=sum(v[i:i+w])/w
    if s>best[1]+0.3: best=(i,s)
print(best[0])")
fi
KARE=$(( SURE * 30 + 30 ))
SON=$(python3 -c "print(max(0,$SURE-1.5))")
OLC=$(ffmpeg -hide_banner -ss "$BAS" -t "$SURE" -i "$D/sarki.mp3" -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
LN=$(python3 -c "
import json,sys; m=json.loads(sys.stdin.read())
print(f\"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true\")" <<< "$OLC")
ffmpeg -y -hide_banner -loglevel error \
  -loop 1 -framerate 30 -i "$D/arkaplan.png" \
  -loop 1 -framerate 30 -i "$D/yazi.png" \
  -loop 1 -framerate 30 -i "$D/kanca.png" \
  -loop 1 -framerate 30 -i "$D/nakarat.png" \
  -ss "$BAS" -t "$SURE" -i "$D/sarki.mp3" \
  -filter_complex "
    [0:v]scale=2160:3840,zoompan=z='1+0.22*on/${KARE}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1080x1920:fps=30,format=yuv420p[bg];
    [4:a]asplit=2[a1][a2];
    [a1]aformat=channel_layouts=mono,showwaves=s=960x240:mode=cline:rate=30:scale=sqrt:draw=full:colors=#F2B45A,format=rgba,colorchannelmixer=aa=0.85[dalga];
    [bg][dalga]overlay=(W-w)/2:1560[v1];
    [v1][1:v]overlay=0:0[v2];
    [2:v]format=rgba,fade=out:st=3.0:d=0.4:alpha=1[kanca];
    [3:v]format=rgba,fade=in:st=3.2:d=0.5:alpha=1[nak];
    [v2][kanca]overlay=0:0:enable='lt(t,3.5)'[v3];
    [v3][nak]overlay=0:0:enable='gte(t,3.2)',fade=out:st=${SON}:d=1.5,format=yuv420p[v];
    [a2]${LN},afade=in:st=0:d=0.3,afade=out:st=${SON}:d=1.5,aresample=48000[a]" \
  -map "[v]" -map "[a]" -t "$SURE" \
  -c:v libx264 -preset medium -crf 22 -pix_fmt yuv420p -r 30 \
  -c:a aac -b:a 192k -movflags +faststart "$D/video_kisa.mp4"
echo "kısa video hazır: $D/video_kisa.mp4 (başlangıç ${BAS} sn, ${SURE} sn)"
