#!/usr/bin/env python3
"""Among Us v3 — taban video: kesim + 9:16 bulanık zemin + düşüşte ağır çekim + son karede donma (efektler Remotion'da).
Zaman çizelgesi (çıkış saniyesi): 0–11.70 normal · 11.70–13.20 düşüş %50 ağır çekim · 13.20–14.40 donan kare.
"""
import os
import shutil
import sys

ST = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(ST, 'scripts'))
from _ortak import AENC, ffmpeg  # noqa: E402

HAM = os.path.join(ST, 'input', 'amongus_ham.MOV')
W = os.path.join(ST, 'temp', 'amongus'); os.makedirs(W, exist_ok=True)
PUB = os.path.join(ST, 'grafik', 'public', 'amongus'); os.makedirs(PUB, exist_ok=True)
DONMA = 1.2

fc = [
    '[0:v]trim=0:11.7,setpts=PTS-STARTPTS[v0]',
    '[0:v]trim=11.7:12.45,setpts=(PTS-STARTPTS)*2,minterpolate=fps=48:mi_mode=blend,fps=24,'
    f'tpad=stop_mode=clone:stop_duration={DONMA}[v1]',
    '[0:a]atrim=0:11.7,asetpts=PTS-STARTPTS[a0]',
    f'[0:a]atrim=11.7:12.45,asetpts=PTS-STARTPTS,atempo=0.5,apad=pad_dur={DONMA},afade=t=out:st=1.2:d=0.4[a1]',
    '[v0][a0][v1][a1]concat=n=2:v=1:a=1[vc][a]',
    '[vc]fps=30,eq=contrast=1.06:saturation=1.1,colortemperature=temperature=5900:mix=0.4,split[b][f]',
    '[b]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,gblur=sigma=45,eq=brightness=-0.12[bg]',
    '[f]scale=1080:-2:flags=lanczos,unsharp=5:5:0.5[fg]',
    '[bg][fg]overlay=(W-w)/2:(H-h)/2,format=yuv420p[v]',
]
out = os.path.join(W, 'taban.mp4')
ffmpeg(['-i', HAM, '-filter_complex', ';'.join(fc), '-map', '[v]', '-map', '[a]', '-c:v', 'libx264', '-preset', 'medium',
        '-crf', '15'] + AENC + ['-t', f'{11.7 + 1.5 + DONMA:.2f}', out])
shutil.copy(out, os.path.join(PUB, 'taban.mp4'))
print(out)
