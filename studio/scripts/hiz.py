#!/usr/bin/env python3
"""Hız: slow-motion, hızlandırma, speed ramp.

  hiz.py video.mp4 --kat 0.5                  # yarı hız slow-motion
  hiz.py video.mp4 --kat 0.25 --akici         # kare enterpolasyonlu (minterpolate) akıcı slow-mo
  hiz.py video.mp4 --kat 2                    # 2x hızlı
  hiz.py video.mp4 --ramp "0:1,2:1,2.5:0.3,4:0.3,4.5:2,6:2"   # zaman:hız noktaları (kaynak saniyesi)
  hiz.py video.mp4 --ramp hizli-yavas-hizli   # hazır ramp: hizli-yavas-hizli | yavas-hizli | hizli-yavas | nefes
  --ses-koru: ton korunur (atempo); --ses-yok: sesi at
"""
import argparse
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _ortak import (AENC, bitti, cikti_yolu, enc, ffmpeg, hata, hazirla, ortak_argumanlar, probe,  # noqa: E402
                    olay_oku, olay_yaz)

HAZIR = {
    'hizli-yavas-hizli': [(0, 1.8), (0.35, 1.8), (0.42, 0.3), (0.62, 0.3), (0.7, 1.8), (1, 1.8)],
    'yavas-hizli': [(0, 0.4), (0.5, 0.4), (0.6, 2.0), (1, 2.0)],
    'hizli-yavas': [(0, 2.0), (0.45, 2.0), (0.55, 0.35), (1, 0.35)],
    'nefes': [(0, 1), (0.3, 1), (0.4, 0.25), (0.6, 0.25), (0.7, 1), (1, 1)],
}


def atempo(k):
    """atempo 0.5–2 aralığında; zincirle."""
    parts = []
    while k > 2.0:
        parts.append('atempo=2.0'); k /= 2.0
    while k < 0.5:
        parts.append('atempo=0.5'); k /= 0.5
    parts.append(f'atempo={k:.5f}')
    return ','.join(parts)


def main():
    ap = ortak_argumanlar(argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter))
    ap.add_argument('girdi')
    ap.add_argument('--kat', type=float, help='sabit hız katsayısı (0.5 = yavaş, 2 = hızlı)')
    ap.add_argument('--ramp', help='"t:hiz,..." veya hazır ad')
    ap.add_argument('--akici', action='store_true', help='slow-mo için kare enterpolasyonu (yavaş render)')
    ap.add_argument('--ses-yok', action='store_true')
    args = ap.parse_args()
    if not args.kat and not args.ramp:
        hata('--kat veya --ramp ver')
    g = hazirla(args.girdi, args)
    inf = probe(g)
    D, fps = inf['sure'], inf['fps']
    ses = inf['ses'] and not args.ses_yok
    out = cikti_yolu(args.girdi, 'hiz', o=args.cikti, onizleme=args.onizleme)

    if args.kat:
        k = args.kat
        vf = f'[0:v]setpts=PTS/{k}'
        if args.akici and k < 1:
            vf += f",minterpolate=fps={fps:g}:mi_mode=mci:mc_mode=aobmc:vsbmc=1"
        vf += ',format=yuv420p[v]'
        fc = vf + (f';[0:a]{atempo(k)}[a]' if ses else '')
        ffmpeg(['-i', g, '-filter_complex', fc, '-map', '[v]'] + (['-map', '[a]'] + AENC if ses else ['-an'])
               + enc(args) + ['-r', f'{fps:g}', out])
        olay_yaz(out, [dict(o, t=round(o['t'] / k, 3)) for o in olay_oku(args.girdi)])
    else:
        if args.ramp in HAZIR:
            pts = [(a * D, b) for a, b in HAZIR[args.ramp]]
        else:
            pts = [tuple(map(float, p.split(':'))) for p in args.ramp.split(',')]
        pts.sort()
        if pts[0][0] > 0:
            pts.insert(0, (0.0, pts[0][1]))
        if pts[-1][0] < D:
            pts.append((D, pts[-1][1]))
        # 0.1 sn'lik dilimler, her dilime enterpolasyonlu hız
        adim = 0.1
        sinirlar = list(np.arange(0, D, adim)) + [D]
        tt, kk = zip(*pts)
        fc, zv, za = [], '', ''
        n = 0
        cikis_t, kaynak_map = 0.0, []
        for a, b in zip(sinirlar[:-1], sinirlar[1:]):
            if b - a < 1e-3:
                continue
            k = float(np.interp((a + b) / 2, tt, kk))
            fc.append(f'[0:v]trim={a:.4f}:{b:.4f},setpts=(PTS-STARTPTS)/{k:.5f}[v{n}]')
            zv += f'[v{n}]'
            if ses:
                fc.append(f'[0:a]atrim={a:.4f}:{b:.4f},asetpts=PTS-STARTPTS,{atempo(k)}[a{n}]')
                zv += f'[a{n}]'
            kaynak_map.append((a, cikis_t, k))
            cikis_t += (b - a) / k
            n += 1
        fc.append(f'{zv}concat=n={n}:v=1:a={1 if ses else 0}[vc]' + ('[a]' if ses else ''))
        fc.append(f'[vc]fps={fps:g},format=yuv420p[v]')
        ffmpeg(['-i', g, '-filter_complex', ';'.join(fc), '-map', '[v]'] + (['-map', '[a]'] + AENC if ses else ['-an'])
               + enc(args) + [out])

        def esle(t):
            for a, c, k in reversed(kaynak_map):
                if t >= a:
                    return c + (t - a) / k
            return t
        olay_yaz(out, [dict(o, t=round(esle(o['t']), 3)) for o in olay_oku(args.girdi)])
    bitti(out)


if __name__ == '__main__':
    main()
