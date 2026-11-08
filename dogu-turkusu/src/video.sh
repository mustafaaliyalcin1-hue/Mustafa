#!/usr/bin/env bash
# Video üretici: arkaplan.png + yazi.png + sarki.mp3 -> video.mp4 (1080x1920, hafif zoom, ses dalgası, -14 LUFS)
# Kullanım: bash video.sh <klasör> [dikey|yatay]   (yatay: 1920x1080 YouTube uzun video -> video_yatay.mp4)
set -euo pipefail
D="$1"; MOD="${2:-dikey}"
if [ "$MOD" = yatay ]; then BG=arkaplan_yatay.png; YZ=yazi_yatay.png; BUYUK=3840:2160; S=1920x1080; DS=1300x200; DY=800; OUT=video_yatay.mp4
else BG=arkaplan.png; YZ=yazi.png; BUYUK=2160:3840; S=1080x1920; DS=960x240; DY=1560; OUT=video.mp4; fi
SURE=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$D/sarki.mp3")
KARE=$(python3 -c "print(int(float('$SURE')*30)+30)")
SON=$(python3 -c "print(max(0,float('$SURE')-3))")
# -14 LUFS, iki geçişli loudnorm (ölç, sonra uygula)
OLC=$(ffmpeg -hide_banner -i "$D/sarki.mp3" -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
LN=$(python3 -c "
import json,sys; m=json.loads(sys.stdin.read())
print(f\"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true\")" <<< "$OLC")
ffmpeg -y -hide_banner -loglevel error \
  -loop 1 -framerate 30 -i "$D/$BG" \
  -loop 1 -framerate 30 -i "$D/$YZ" \
  -i "$D/sarki.mp3" \
  -filter_complex "
    [0:v]scale=${BUYUK},zoompan=z='1+0.12*on/${KARE}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=${S}:fps=30,format=yuv420p[bg];
    [2:a]asplit=2[a1][a2];
    [a1]aformat=channel_layouts=mono,showwaves=s=${DS}:mode=cline:rate=30:scale=sqrt:draw=full:colors=#F2B45A,format=rgba,colorchannelmixer=aa=0.85[dalga];
    [bg][dalga]overlay=(W-w)/2:${DY}[v1];
    [v1][1:v]overlay=0:0,fade=in:st=0:d=1.5,fade=out:st=${SON}:d=3,format=yuv420p[v];
    [a2]${LN},afade=out:st=${SON}:d=3,aresample=48000[a]" \
  -map "[v]" -map "[a]" -t "$SURE" \
  -c:v libx264 -preset medium -crf 23 -pix_fmt yuv420p -r 30 \
  -c:a aac -b:a 192k -movflags +faststart "$D/$OUT"
echo "video hazır: $D/$OUT"
