#!/usr/bin/env python3
"""Among Us skeci: boşluk kesimi + 9:16 (bulanık zeminli, kadraj kırpılmaz) + hikâye anlarına SFX.
Konu: oyuncu görev yapıyor → imposter gelip kesiyor → oyuncu yaralanıp düşüyor → imposter vent'e atlayıp kaçıyor.
Anlar (ham saniye): görev 0–2.8 (dolap), kill 2.8–4.6, vent = imposter kadrajdan çıkış 5.0–5.55, düşüş ~12.4.
Kesilen: 12.65–son (oyuncu düştükten sonraki boş kare + kamerayı kapatmaya gelme).
"""
import json
import os
import sys

ST = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(ST, 'scripts'))
from _ortak import AENC, SFX, ffmpeg  # noqa: E402

HAM = os.path.join(ST, 'input', 'amongus_ham.MOV')
W = os.path.join(ST, 'temp', 'amongus'); os.makedirs(W, exist_ok=True)
TUT = [(0.0, 12.65)]
# hikâye anları (ham saniye) → ses, dB  (konuşma yok; kısık ama duyulur)
OLAY = [(0.30, 'click_ui', -17), (3.00, 'impact_orta', -14), (5.40, 'whoosh_sert', -15), (12.35, 'impact_derin', -15)]


def esle(t):
    c = 0.0
    for a, b in TUT:
        if a <= t <= b:
            return c + t - a
        c += b - a
    return None


def main():
    fc, z = [], ''
    for i, (a, b) in enumerate(TUT):
        fc.append(f'[0:v]trim={a}:{b},setpts=PTS-STARTPTS[v{i}]')
        fc.append(f'[0:a]atrim={a}:{b},asetpts=PTS-STARTPTS,afade=t=in:d=0.02,afade=t=out:st={b - a - 0.03:.3f}:d=0.03[a{i}]')
        z += f'[v{i}][a{i}]'
    fc.append(f'{z}concat=n={len(TUT)}:v=1:a=1[vc][ac]')
    # 9:16: arka planda aynı görüntü büyütülüp bulanık, önde tüm kadraj (hiçbir şey kırpılmaz); hafif sıcak/kontrast
    fc.append('[vc]fps=30,eq=contrast=1.06:saturation=1.1,colortemperature=temperature=5900:mix=0.4,split[b][f]')
    fc.append('[b]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,gblur=sigma=45,eq=brightness=-0.12[bg]')
    fc.append('[f]scale=1080:-2:flags=lanczos,unsharp=5:5:0.5[fg]')
    fc.append('[bg][fg]overlay=(W-w)/2:(H-h)/2,format=yuv420p[v]')
    lb = ['[ac]']
    kat = {k['ad']: k for k in json.load(open(os.path.join(SFX, 'katalog.json'), encoding='utf-8'))}
    ins = ['-i', HAM]
    for j, (t, ad, db) in enumerate(OLAY, 1):
        tt = esle(t)
        if tt is None:
            continue
        bas = max(0.0, tt - kat[ad]['tepe'])
        ins += ['-i', os.path.join(SFX, kat[ad]['dosya'])]
        fc.append(f'[{j}:a]aformat=sample_rates=48000:channel_layouts=stereo,volume={db}dB,'
                  f'adelay={int(bas * 1000)}|{int(bas * 1000)}[s{j}]')
        lb.append(f'[s{j}]')
    fc.append(f"{''.join(lb)}amix=inputs={len(lb)}:duration=first:normalize=0[a]")
    out = os.path.join(W, 'kurgu.mp4')
    ffmpeg(ins + ['-filter_complex', ';'.join(fc), '-map', '[v]', '-map', '[a]', '-c:v', 'libx264', '-preset', 'medium',
                  '-crf', '16'] + AENC + [out])
    print(out, f'{sum(b - a for a, b in TUT):.2f} sn')


if __name__ == '__main__':
    main()
