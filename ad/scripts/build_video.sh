#!/bin/bash
# Kompozisyon + ses + MP4 + kontakt sayfası.  build_video.sh <render_dir> <H|V> <out.mp4> [crf]
set -e
RD=$1; ASP=$2; OUT=$3; CRF=${4:-23}
CD=build/comp_$(basename $RD)
rm -rf $CD; python3 scripts/comp_anim.py $RD $CD $ASP
[ -f build/audio.wav ] || python3 scripts/audio.py build/audio.wav
ffmpeg -v error -y -framerate 30 -i $CD/%04d.png -i build/audio.wav -map 0:v -map 1:a -c:v libx264 -preset slow -crf $CRF -pix_fmt yuv420p \
  -c:a aac -b:a 160k -shortest -movflags +faststart $OUT
python3 - "$CD" "${OUT%.mp4}_kontakt.png" <<'PY'
import sys,os
from PIL import Image, ImageDraw, ImageFont
cd,out=sys.argv[1:3]
SH=[('Geç kalmışlık',18),('Kanca',60),('4,1 mm',124),('Kamera',170),('Ultra şov',215),('Ultra şov açılış',300),('Ultra 4 renk',395),('Ve karşınızda',445),('Fold8',485),('Açılış',520),('Dümdüz',552),('201 g',580),('Fold8 şov',615),('Fold8 açılış',675),('Fold8 4 renk',770),('Arkalar',818),('Künye',868),('Son kart',910)]
f=ImageFont.truetype('fonts/Inter-700.ttf',22); ims=[]
for name,fr in SH:
    im=Image.open(f'{cd}/{fr:04d}.png').convert('RGB'); s=480/max(im.size); im=im.resize((int(im.width*s),int(im.height*s)))
    d=ImageDraw.Draw(im); lab=f'{fr/30:05.2f}s  {name}'; d.rectangle((0,im.height-32,im.width,im.height),fill=(0,0,0)); d.text((8,im.height-29),lab,font=f,fill='white'); ims.append(im)
cols=4 if ims[0].width>ims[0].height else 6; w,h=ims[0].size
S=Image.new('RGB',(cols*w+(cols+1)*8,((len(ims)+cols-1)//cols)*(h+8)+8),(28,24,36))
for i,im in enumerate(ims): S.paste(im,(8+(i%cols)*(w+8),8+(i//cols)*(h+8)))
S.save(out)
PY
ls -la $OUT
