#!/usr/bin/env python3
"""Sahne tespiti (PySceneDetect): videoyu sahnelere böl.

  sahne.py video.mp4                    # sahne listesini yaz (JSON)
  sahne.py video.mp4 --bol              # her sahneyi ayrı dosyaya kaydet: output/<ad>_sahneler_<tarih>/
  sahne.py video.mp4 --esik 20 --min 0.5  # daha hassas tespit, en kısa sahne 0.5 sn
  sahne.py video.mp4 --kontakt          # her sahneden bir kare: kontakt baskı PNG
"""
import argparse
import datetime
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _ortak import AENC, OUTPUT, VENC, bilgi, ffmpeg, probe  # noqa: E402


def sahneler(path, esik=27.0, min_sure=0.4):
    from scenedetect import ContentDetector, detect
    inf = probe(path)
    lst = detect(path, ContentDetector(threshold=esik, min_scene_len=max(1, int(min_sure * inf['fps']))))
    if not lst:
        return [(0.0, inf['sure'])]
    return [(round(a.get_seconds(), 3), round(b.get_seconds(), 3)) for a, b in lst]


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('girdi'); ap.add_argument('--esik', type=float, default=27.0)
    ap.add_argument('--min', type=float, default=0.4); ap.add_argument('--bol', action='store_true')
    ap.add_argument('--kontakt', action='store_true')
    args = ap.parse_args()
    sc = sahneler(args.girdi, args.esik, args.min)
    print(json.dumps([{'sahne': i + 1, 'bas': a, 'son': b, 'sure': round(b - a, 3)} for i, (a, b) in enumerate(sc)],
                     ensure_ascii=False, indent=1))
    bilgi(f'{len(sc)} sahne bulundu')
    kok = os.path.splitext(os.path.basename(args.girdi))[0]
    zaman = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
    if args.bol or args.kontakt:
        d = os.path.join(OUTPUT, f'{kok}_sahneler_{zaman}')
        os.makedirs(d, exist_ok=True)
        ses = probe(args.girdi)['ses']
        kareler = []
        for i, (a, b) in enumerate(sc, 1):
            if args.bol:
                ffmpeg(['-ss', f'{a:.3f}', '-to', f'{b:.3f}', '-i', args.girdi] + VENC + (AENC if ses else ['-an'])
                       + [os.path.join(d, f'sahne_{i:02d}.mp4')])
            if args.kontakt:
                k = os.path.join(d, f'kare_{i:02d}.png')
                ffmpeg(['-ss', f'{(a + b) / 2:.3f}', '-i', args.girdi, '-frames:v', '1', '-vf',
                        f"scale=320:-2,drawtext=text='{i}  {a:.1f}s':x=8:y=8:fontsize=22:fontcolor=white:borderw=2", k])
                kareler.append(k)
        if kareler:
            ins = sum((['-i', k] for k in kareler), [])
            ffmpeg(ins + ['-filter_complex', f'{"".join(f"[{i}]" for i in range(len(kareler)))}hstack={len(kareler)}'
                          if len(kareler) > 1 else 'null', os.path.join(d, 'kontakt.png')])
        bilgi(f'kaydedildi → {d}')
        print(d)


if __name__ == '__main__':
    main()
