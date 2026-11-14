#!/usr/bin/env python3
"""Renk düzenleme: kontrast/doygunluk/parlaklık/sıcaklık, LUT uygulama, sinematik presetler.

  renk.py video.mp4 --preset sinematik_teal_turuncu
  renk.py video.mp4 --preset vintage_film --yogunluk 0.6       # LUT'u %60 karıştır
  renk.py video.mp4 --lut benim.cube
  renk.py video.mp4 --kontrast 1.15 --doygunluk 1.3 --parlaklik 0.03 --sicaklik 5200
  renk.py --liste                                               # presetleri listele
Presetler: sinematik_teal_turuncu, sicak_altin_saat, soguk_gece_gerilim, vintage_film, noir_kontrast, canli_reels
"""
import argparse
import glob
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _ortak import (AENC, LUTS, bitti, cikti_yolu, enc, ffmpeg, filtre_yolu, hata, hazirla, ortak_argumanlar,  # noqa: E402
                    probe, olay_aktar)


def main():
    ap = ortak_argumanlar(argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter))
    ap.add_argument('girdi', nargs='?')
    ap.add_argument('--preset'); ap.add_argument('--lut')
    ap.add_argument('--yogunluk', type=float, default=1.0, help='LUT karışım oranı 0–1')
    ap.add_argument('--kontrast', type=float, default=1.0); ap.add_argument('--doygunluk', type=float, default=1.0)
    ap.add_argument('--parlaklik', type=float, default=0.0); ap.add_argument('--gamma', type=float, default=1.0)
    ap.add_argument('--sicaklik', type=int, help='Kelvin (ör. 4500 soğuk, 7500 sıcak; 6500 nötr)')
    ap.add_argument('--liste', action='store_true')
    args = ap.parse_args()
    if args.liste or not args.girdi:
        for p in sorted(glob.glob(os.path.join(LUTS, '*.cube'))):
            print(os.path.basename(p)[:-5])
        return
    lut = None
    if args.preset:
        lut = os.path.join(LUTS, args.preset + '.cube')
        if not os.path.exists(lut):
            hata(f'preset yok: {args.preset} (önce scripts/lut_uret.py; liste: renk.py --liste)')
    elif args.lut:
        lut = args.lut
    g = hazirla(args.girdi, args)
    inf = probe(g)
    z = []
    if args.sicaklik:
        z.append(f'colortemperature=temperature={args.sicaklik}')
    if (args.kontrast, args.doygunluk, args.parlaklik, args.gamma) != (1.0, 1.0, 0.0, 1.0):
        z.append(f'eq=contrast={args.kontrast}:saturation={args.doygunluk}:brightness={args.parlaklik}:gamma={args.gamma}')
    on = ('[0:v]' + ','.join(z) + '[pre];[pre]') if z else '[0:v]'
    if lut and args.yogunluk < 1:
        fc = (f"{on}format=rgb24,split[o][l];[l]lut3d='{filtre_yolu(lut)}':interp=tetrahedral[ll];"
              f"[o][ll]blend=all_mode=normal:all_opacity={args.yogunluk:.3f},format=yuv420p[v]")
    elif lut:
        fc = f"{on}lut3d='{filtre_yolu(lut)}':interp=tetrahedral,format=yuv420p[v]"
    else:
        fc = f'{on}format=yuv420p[v]' if z else '[0:v]format=yuv420p[v]'
    etiket = args.preset or ('lut' if lut else 'renk')
    out = cikti_yolu(args.girdi, etiket, o=args.cikti, onizleme=args.onizleme)
    ffmpeg(['-i', g, '-filter_complex', fc, '-map', '[v]'] + (['-map', '0:a'] + AENC if inf['ses'] else [])
           + enc(args) + ['-movflags', '+faststart', out])
    olay_aktar(args.girdi, out)
    bitti(out)


if __name__ == '__main__':
    main()
