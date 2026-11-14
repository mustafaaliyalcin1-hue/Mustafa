#!/usr/bin/env python3
"""Ses: müzik ekleme, seviye, fade, orijinal sesi kısma/silme, ducking (konuşmada müziği kıs), loudness.

  ses.py video.mp4 --muzik assets/music/parca.mp3                       # müzik ekle (orijinal ses korunur)
  ses.py video.mp4 --muzik parca.mp3 --muzik-db -14 --orijinal 0.3 --fade-in 1 --fade-out 2
  ses.py video.mp4 --muzik parca.mp3 --sil                              # orijinal sesi tamamen at
  ses.py video.mp4 --muzik parca.mp3 --ducking                          # konuşma varken müzik otomatik kısılır
  ses.py video.mp4 --orijinal 1.5 --normalize                           # sadece seviye + -14 LUFS normalize
  --muzik-bas 12.5 : müziğin 12.5. saniyesinden başla (drop'u yakalamak için)
"""
import argparse
import glob
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _ortak import AENC, MUSIC, bitti, cikti_yolu, ffmpeg, hata, ortak_argumanlar, probe, olay_aktar, ses_normalize  # noqa: E402


def main():
    ap = ortak_argumanlar(argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter))
    ap.add_argument('girdi')
    ap.add_argument('--muzik', help='müzik dosyası; "otomatik" = assets/music içindeki ilk parça')
    ap.add_argument('--muzik-db', type=float, default=-10.0, help='müzik kazancı (dB)')
    ap.add_argument('--muzik-bas', type=float, default=0.0)
    ap.add_argument('--orijinal', type=float, default=1.0, help='orijinal ses çarpanı (0 = sessiz)')
    ap.add_argument('--sil', action='store_true', help='orijinal sesi tamamen kaldır')
    ap.add_argument('--fade-in', type=float, default=0.5); ap.add_argument('--fade-out', type=float, default=1.5)
    ap.add_argument('--ducking', action='store_true')
    ap.add_argument('--normalize', action='store_true', help='-14 LUFS (Reels/YouTube)')
    args = ap.parse_args()
    inf = probe(args.girdi)
    D = inf['sure']
    muzik = args.muzik
    if muzik == 'otomatik':
        lst = sorted(glob.glob(os.path.join(MUSIC, '*.mp3')) + glob.glob(os.path.join(MUSIC, '*.wav')))
        if not lst:
            hata('assets/music boş')
        muzik = lst[0]
    ins = ['-i', args.girdi]
    fc = []
    orj = inf['ses'] and not args.sil and args.orijinal > 0
    if orj:
        fc.append(f'[0:a]aformat=sample_rates=48000:channel_layouts=stereo,volume={args.orijinal}[o]')
    if muzik:
        ins += ['-stream_loop', '-1', '-ss', str(args.muzik_bas), '-i', muzik]
        fo = max(0.0, D - args.fade_out)
        fc.append(f'[1:a]aformat=sample_rates=48000:channel_layouts=stereo,atrim=0:{D:.3f},asetpts=PTS-STARTPTS,'
                  f'volume={args.muzik_db}dB,afade=t=in:d={args.fade_in},afade=t=out:st={fo:.3f}:d={args.fade_out}[m]')
        if orj and args.ducking:
            fc.append('[o]asplit[o1][o2]')
            fc.append('[m][o2]sidechaincompress=threshold=0.03:ratio=8:attack=20:release=350:makeup=1[md]')
            fc.append('[o1][md]amix=inputs=2:duration=first:normalize=0[mx]')
        elif orj:
            fc.append('[o][m]amix=inputs=2:duration=first:normalize=0[mx]')
        else:
            fc.append('[m]anull[mx]')
    elif orj:
        fc.append('[o]anull[mx]')
    else:
        fc.append(f'anullsrc=r=48000:cl=stereo,atrim=0:{D:.3f}[mx]')
    son = '[mx]alimiter=limit=0.8318:level=disabled:asc=1,aresample=48000[a]'  # tepe ≤ -1.6 dBFS
    fc.append(son)
    out = cikti_yolu(args.girdi, 'ses', o=args.cikti, onizleme=args.onizleme)
    ffmpeg(ins + ['-filter_complex', ';'.join(fc), '-map', '0:v', '-map', '[a]', '-c:v', 'copy'] + AENC
           + ['-t', f'{D:.3f}', '-movflags', '+faststart', out])
    if args.normalize:
        ses_normalize(out, -14.0, -1.0)
    olay_aktar(args.girdi, out)
    bitti(out)


if __name__ == '__main__':
    main()
