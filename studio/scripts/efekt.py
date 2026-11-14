#!/usr/bin/env python3
"""Görsel efektler — birden çok efekt, her biri isteğe bağlı zaman aralığı ve güçle.

  efekt.py video.mp4 -e zoomin                     # tüm video boyunca yavaş zoom-in (Ken Burns)
  efekt.py video.mp4 -e zoomin@0-2=0.4 -e shake@3-3.6=1.5 -e vignette
  efekt.py video.mp4 -e bw@2-4 -e glow=0.6 -e blur@0-0.5=20
Biçim: ad[@bas-son][=guc]
Efektler: zoomin, zoomout, punch (ani yakınlaşma), shake, glow, blur, bw (siyah-beyaz), vignette, glitch,
          flash, sepya, keskin
"""
import argparse
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _ortak import (AENC, bitti, cikti_yolu, enc, ffmpeg, hata, hazirla, ortak_argumanlar, probe,  # noqa: E402
                    olay_aktar, olay_oku, olay_yaz)

VARS = {'zoomin': 0.25, 'zoomout': 0.25, 'punch': 0.18, 'shake': 1.0, 'glow': 0.5, 'blur': 12, 'bw': 1,
        'vignette': 1.0, 'glitch': 1.0, 'flash': 0.6, 'sepya': 1, 'keskin': 1.0}


def coz(s, D):
    m = re.fullmatch(r'([a-z]+)(?:@([\d.]+)-([\d.]+))?(?:=([\d.]+))?', s)
    if not m or m.group(1) not in VARS:
        hata(f'efekt anlaşılamadı: {s}  (geçerli: {", ".join(VARS)})')
    ad = m.group(1)
    a = float(m.group(2)) if m.group(2) else 0.0
    b = float(m.group(3)) if m.group(3) else D
    g = float(m.group(4)) if m.group(4) else VARS[ad]
    return ad, a, min(b, D), g


def main():
    ap = ortak_argumanlar(argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter))
    ap.add_argument('girdi')
    ap.add_argument('-e', '--efekt', action='append', required=True)
    args = ap.parse_args()
    g = hazirla(args.girdi, args)
    inf = probe(g)
    W, H, FPS, D = inf['w'], inf['h'], inf['fps'], inf['sure']
    zincir, olaylar = [], []
    for s in args.efekt:
        ad, a, b, k = coz(s, D)
        en = f"enable='between(t,{a:.3f},{b:.3f})'"
        p = f'clip((it-{a:.3f})/{max(b - a, 0.01):.3f},0,1)'
        ease = f'(0.5-0.5*cos(PI*{p}))'
        ic = f'between(it,{a:.3f},{b:.3f})'
        if ad in ('zoomin', 'zoomout', 'punch'):
            if ad == 'zoomin':
                z = f'if({ic},1+{k}*{ease},1)'
            elif ad == 'zoomout':
                z = f'if({ic},1+{k}*(1-{ease}),1)'
            else:  # punch: 0.12 sn'de hızla yakınlaş, aralık boyunca kal
                z = f'if({ic},1+{k}*clip((it-{a:.3f})/0.12,0,1),1)'
            # 2x ölçekte zoompan: yuvarlama titremesini azaltır
            zincir.append(f'scale={W * 2}:{H * 2}:flags=bicubic,zoompan=z=\'{z}\':x=\'iw/2-(iw/zoom/2)\':'
                          f'y=\'ih/2-(ih/zoom/2)\':d=1:s={W}x{H}:fps={FPS:g}')
            if ad == 'punch':
                olaylar.append({'t': a, 'tur': 'vurgu', 'efekt': ad})
        elif ad == 'shake':
            A = 0.02 * k
            e = f'between(t,{a:.3f},{b:.3f})'
            zincir.append(f'scale=trunc(iw*{1 + 2 * A}/2)*2:trunc(ih*{1 + 2 * A}/2)*2,'
                          f"crop={W}:{H}:x='(in_w-out_w)/2+{e}*(in_w-out_w)/2*sin(t*53)*sin(t*7.7+1)':"
                          f"y='(in_h-out_h)/2+{e}*(in_h-out_h)/2*sin(t*47+2)*cos(t*5.3)'")
            olaylar.append({'t': a, 'tur': 'vurgu', 'efekt': ad})
        elif ad == 'glow':
            zincir.append(f'split[gA][gB];[gB]curves=all=\'0/0 0.55/0.1 1/1\',gblur=sigma={max(6, H // 40)}[gC];'
                          f'[gA][gC]blend=all_mode=screen:all_opacity={min(k, 1):.2f}:{en}')
        elif ad == 'blur':
            zincir.append(f'gblur=sigma={k}:{en}')
        elif ad == 'bw':
            zincir.append(f'hue=s=0:{en}')
        elif ad == 'sepya':
            zincir.append(f'colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131:{en}')
        elif ad == 'vignette':
            zincir.append(f'vignette=angle={0.35 + 0.3 * min(k, 2):.3f}:{en}')
        elif ad == 'keskin':
            zincir.append(f'unsharp=5:5:{k:.2f}:5:5:0:{en}')
        elif ad == 'glitch':
            px = max(4, int(W * 0.012 * k))
            zincir.append(f"rgbashift=rh={px}:bh=-{px}:gv={px // 2}:edge=wrap:{en},"
                          f"noise=alls={int(20 * k)}:allf=t:{en}")
            olaylar.append({'t': a, 'tur': 'glitch'})
        elif ad == 'flash':
            zincir.append(f"eq=brightness='{k}*max(0,1-(t-{a:.3f})/{max(b - a, 0.05):.3f})':eval=frame:{en}")
            olaylar.append({'t': a, 'tur': 'vurgu', 'efekt': ad})
    fc = '[0:v]' + ','.join(zincir) + ',format=yuv420p[v]'
    out = cikti_yolu(args.girdi, 'efekt', o=args.cikti, onizleme=args.onizleme)
    ffmpeg(['-i', g, '-filter_complex', fc, '-map', '[v]'] + (['-map', '0:a'] + AENC if inf['ses'] else [])
           + enc(args) + ['-movflags', '+faststart', out])
    olay_yaz(out, sorted(olay_oku(args.girdi) + olaylar, key=lambda o: o['t']))
    bitti(out)


if __name__ == '__main__':
    main()
