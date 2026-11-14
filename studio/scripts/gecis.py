#!/usr/bin/env python3
"""Klipler arası geçiş: fade, crossfade, zoom, whip, flash (+ ffmpeg xfade'in tüm türleri).

  gecis.py a.mp4 b.mp4 c.mp4 --tur crossfade --sure 0.6
  gecis.py a.mp4 b.mp4 c.mp4 --tur whip,flash         # her geçişe ayrı tür
  gecis.py a.mp4 b.mp4 --tur zoom
Türler: fade (siyaha), crossfade, zoom, whip (hızlı kaydırma+hareket bulanıklığı), flash (beyaz patlama),
        glitch, kaydir-sol, kaydir-yukari, daire, ... ve ffmpeg xfade adları (wipeleft, circleopen, pixelize, ...)
"""
import argparse
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _ortak import (AENC, bitti, cikti_yolu, enc, ffmpeg, hata, hazirla, ortak_argumanlar, probe,  # noqa: E402
                    olay_oku, olay_yaz)

TUR = {'fade': 'fadeblack', 'crossfade': 'fade', 'zoom': 'zoomin', 'whip': 'slideleft', 'flash': 'fadewhite',
       'kaydir-sol': 'slideleft', 'kaydir-yukari': 'slideup', 'daire': 'circleopen', 'glitch': 'pixelize'}
VARSAYILAN_SURE = {'whip': 0.35, 'flash': 0.3, 'zoom': 0.45, 'glitch': 0.3}


def main():
    ap = ortak_argumanlar(argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter))
    ap.add_argument('girdiler', nargs='+')
    ap.add_argument('--tur', default='crossfade', help='tek tür ya da virgülle her geçiş için')
    ap.add_argument('--sure', type=float, help='geçiş süresi (sn)')
    args = ap.parse_args()
    if len(args.girdiler) < 2:
        hata('en az 2 klip gerekli')
    gl = [hazirla(f, args) for f in args.girdiler]
    infos = [probe(f) for f in gl]
    W, H, FPS = infos[0]['w'] // 2 * 2, infos[0]['h'] // 2 * 2, infos[0]['fps']
    turler = args.tur.split(',')
    turler = (turler * len(gl))[:len(gl) - 1]
    ins, fc = [], []
    for i, (f, inf) in enumerate(zip(gl, infos)):
        ins += ['-i', f]
        pre = f'[{i}:v]scale={W}:{H}:force_original_aspect_ratio=decrease,pad={W}:{H}:(ow-iw)/2:(oh-ih)/2,setsar=1,' \
              f'fps={FPS},format=yuv420p,settb=AVTB'
        fc.append(pre + f'[v{i}]')
        if inf['ses']:
            fc.append(f'[{i}:a]aformat=sample_rates=48000:channel_layouts=stereo[a{i}]')
        else:
            fc.append(f'anullsrc=r=48000:cl=stereo,atrim=0:{inf["sure"]:.3f}[a{i}]')
    son_v, son_a = 'v0', 'a0'
    toplam = infos[0]['sure']
    olaylar = list(olay_oku(args.girdiler[0]))
    whip_pencere = []
    for i in range(1, len(gl)):
        tur = turler[i - 1]
        T = args.sure or VARSAYILAN_SURE.get(tur, 0.6)
        T = min(T, infos[i]['sure'] / 2, infos[i - 1]['sure'] / 2)
        xf = TUR.get(tur, tur)
        off = toplam - T
        fc.append(f'[{son_v}][v{i}]xfade=transition={xf}:duration={T:.3f}:offset={off:.3f}[x{i}]')
        fc.append(f'[{son_a}][a{i}]acrossfade=d={T:.3f}:c1=tri:c2=tri[ax{i}]')
        son_v, son_a = f'x{i}', f'ax{i}'
        olaylar.append({'t': round(off, 3), 'tur': 'gecis', 'gecis': tur, 'sure': T})
        for o in olay_oku(args.girdiler[i]):
            olaylar.append(dict(o, t=round(o['t'] + off, 3)))
        if tur in ('whip', 'zoom'):
            whip_pencere.append((off, T, tur))
        toplam = off + infos[i]['sure']
    post = []
    for off, T, tur in whip_pencere:
        if tur == 'whip':  # yatay hareket bulanıklığı
            post.append(f"avgblur=sizeX={max(8, W // 30)}:sizeY=1:enable='between(t,{off:.3f},{off + T:.3f})'")
        else:
            post.append(f"gblur=sigma={max(4, W // 160)}:enable='between(t,{off + T * 0.2:.3f},{off + T * 0.8:.3f})'")
    for o in olaylar:
        if o.get('gecis') == 'flash':  # flash: tepe noktada ekstra parlama
            m = o['t'] + o['sure'] / 2
            post.append(f"eq=brightness=0.35:enable='between(t,{m - 0.04:.3f},{m + 0.04:.3f})'")
    fc.append(f'[{son_v}]' + (','.join(post) + ',' if post else '') + 'format=yuv420p[v]')
    out = cikti_yolu(['gecis'] + args.girdiler, 'gecis', o=args.cikti, onizleme=args.onizleme)
    ffmpeg(ins + ['-filter_complex', ';'.join(fc), '-map', '[v]', '-map', f'[{son_a}]'] + enc(args) + AENC
           + ['-movflags', '+faststart', out])
    olay_yaz(out, sorted(olaylar, key=lambda o: o['t']))
    bitti(out)


if __name__ == '__main__':
    main()
