#!/bin/bash
# Bulut parçalarını birleştir + yeni son kart + ses -> out/  (bash ad/scripts/assemble_final.sh H|V)
set -e
cd "$(dirname "$0")/.."
A=$1; NG=$(python3 -c "import sys; sys.path.insert(0,'scripts'); import timeline as T; print(T.NG)")
OUTN=$([ $A = H ] && echo fold8_reklam_16x9_1080p || echo fold8_reklam_9x16_1080p)
T=build/asm_$A; rm -rf $T; mkdir -p $T out
LIST=$T/list.txt; : > $LIST
for c in $(ls out/chunks/${A}_*.mp4 | sort); do
  N0=$((10#$(basename $c .mp4 | cut -d_ -f2)))
  NF=$(ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 $c)
  KEEP=$(( NF < NG - N0 ? NF : NG - N0 ))            # son kart karelerini at (yenisi eklenecek)
  ffmpeg -v error -y -i $c -frames:v $KEEP -c:v libx264 -preset slow -crf 14 -pix_fmt yuv420p $T/p_$N0.mp4
  echo "file '$(pwd)/$T/p_$N0.mp4'" >> $LIST
done
[ -d build/ec_$A ] || { echo "son kart kareleri yok: build/ec_$A"; exit 1; }
ffmpeg -v error -y -framerate 30 -start_number $NG -i build/ec_$A/%04d.png -c:v libx264 -preset slow -crf 14 -pix_fmt yuv420p $T/ec.mp4
echo "file '$(pwd)/$T/ec.mp4'" >> $LIST
[ -f build/audio.wav ] || python3 scripts/audio.py build/audio.wav
ffmpeg -v error -y -f concat -safe 0 -i $LIST -i build/audio.wav -map 0:v -map 1:a -c:v libx264 -preset slow -crf 19 -maxrate 9M -bufsize 18M \
  -pix_fmt yuv420p -r 30 -c:a aac -b:a 192k -shortest -movflags +faststart out/$OUTN.mp4
ffprobe -v error -show_entries format=duration,size:stream=width,height -of compact out/$OUTN.mp4
