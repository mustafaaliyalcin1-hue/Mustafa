#!/usr/bin/env python3
"""Kesme, birleştirme, sıralama.

  kesim.py kes video.mp4 --bas 2 --son 7.5            # 2.0–7.5 sn arasını al
  kesim.py kes video.mp4 --bas 1 --sure 3
  kesim.py parcala video.mp4 "0-2,4.5-6,8-10"        # birden fazla aralığı al, sırayla birleştir
  kesim.py birlestir a.mp4 b.mp4 c.mp4                # farklı boyut/fps olsa da birleştirir (ilkine uydurur)
  kesim.py sirala liste.txt                           # her satır: dosya [bas son]  -> o sırayla birleştir
  kesim.py birlestir a.mp4 b.mp4 --sira 2,1           # verilen sırayla
"""
import argparse
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _ortak import (bitti, cikti_yolu, enc, AENC, ffmpeg, hata, hazirla, ortak_argumanlar, probe,  # noqa: E402
                    ses_akisi_ekle, olay_oku, olay_yaz)


def segmentler_birlestir(parcalar, cikti, args, hedef=None):
    """parcalar: [(dosya, bas|None, son|None)] -> tek video. Hepsi hedef boyut/fps'e normalize edilir."""
    infos = [probe(p[0]) for p in parcalar]
    W, H, FPS = hedef or (infos[0]['w'], infos[0]['h'], infos[0]['fps'])
    W, H = W // 2 * 2, H // 2 * 2
    ins, fc, zincir = [], [], ''
    olaylar, ofs = [], 0.0
    for i, ((f, b, s), inf) in enumerate(zip(parcalar, infos)):
        ins += ['-i', f]
        b = b or 0.0
        s = s if s is not None else inf['sure']
        if s <= b:
            hata(f'geçersiz aralık {b}-{s} ({f})')
        d = s - b
        fc.append(f'[{i}:v]trim={b}:{s},setpts=PTS-STARTPTS,scale={W}:{H}:force_original_aspect_ratio=decrease,'
                  f'pad={W}:{H}:(ow-iw)/2:(oh-ih)/2:black,setsar=1,fps={FPS},format=yuv420p[v{i}]')
        if inf['ses']:
            fc.append(f'[{i}:a]atrim={b}:{s},asetpts=PTS-STARTPTS,aformat=sample_rates=48000:channel_layouts=stereo[a{i}]')
        else:
            fc.append(f'anullsrc=r=48000:cl=stereo,atrim=0:{d:.3f}[a{i}]')
        zincir += f'[v{i}][a{i}]'
        for o in olay_oku(f):
            if b <= o['t'] < s:
                olaylar.append(dict(o, t=round(o['t'] - b + ofs, 3)))
        ofs += d
    fc.append(f'{zincir}concat=n={len(parcalar)}:v=1:a=1[v][a]')
    ffmpeg(ins + ['-filter_complex', ';'.join(fc), '-map', '[v]', '-map', '[a]'] + enc(args) + AENC
           + ['-movflags', '+faststart', cikti])
    # kesim noktalarını auto_sfx için işaretle
    t = 0.0
    for (f, b, s), inf in list(zip(parcalar, infos))[:-1]:
        t += (s if s is not None else inf['sure']) - (b or 0.0)
        olaylar.append({'t': round(t, 3), 'tur': 'kesim'})
    olay_yaz(cikti, sorted(olaylar, key=lambda o: o['t']))


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest='komut', required=True)
    k = ortak_argumanlar(sub.add_parser('kes', help='tek aralık kes'))
    k.add_argument('girdi'); k.add_argument('--bas', type=float, default=0.0)
    k.add_argument('--son', type=float); k.add_argument('--sure', type=float)
    p = ortak_argumanlar(sub.add_parser('parcala', help='birden çok aralığı al ve birleştir'))
    p.add_argument('girdi'); p.add_argument('araliklar', help='"0-2,4.5-6"')
    b = ortak_argumanlar(sub.add_parser('birlestir', help='dosyaları birleştir'))
    b.add_argument('girdiler', nargs='+'); b.add_argument('--sira', help='ör. 3,1,2')
    s = ortak_argumanlar(sub.add_parser('sirala', help='liste dosyasına göre sırala+birleştir'))
    s.add_argument('liste')
    args = ap.parse_args()

    if args.komut == 'kes':
        g = hazirla(args.girdi, args)
        inf = probe(g)
        son = args.son if args.son is not None else (args.bas + args.sure if args.sure else inf['sure'])
        out = cikti_yolu(args.girdi, 'kesim', o=args.cikti, onizleme=args.onizleme)
        segmentler_birlestir([(g, args.bas, min(son, inf['sure']))], out, args)
    elif args.komut == 'parcala':
        g = hazirla(args.girdi, args)
        par = []
        for a in args.araliklar.split(','):
            x, y = a.split('-')
            par.append((g, float(x), float(y)))
        out = cikti_yolu(args.girdi, 'parca', o=args.cikti, onizleme=args.onizleme)
        segmentler_birlestir(par, out, args)
    elif args.komut == 'birlestir':
        gl = args.girdiler
        if args.sira:
            gl = [gl[int(i) - 1] for i in args.sira.split(',')]
        out = cikti_yolu(['montaj'] + gl, 'birlesik', o=args.cikti, onizleme=args.onizleme)
        segmentler_birlestir([(hazirla(f, args), None, None) for f in gl], out, args)
    else:
        par = []
        base = os.path.dirname(os.path.abspath(args.liste))
        for line in open(args.liste, encoding='utf-8'):
            line = line.strip()
            if not line or line.startswith('#'):
                continue
            x = line.split()
            f = x[0] if os.path.isabs(x[0]) else os.path.join(base, x[0])
            par.append((hazirla(f, args), float(x[1]) if len(x) > 1 else None, float(x[2]) if len(x) > 2 else None))
        out = cikti_yolu(args.liste, 'sirali', o=args.cikti, onizleme=args.onizleme)
        segmentler_birlestir(par, out, args)
    bitti(out)


if __name__ == '__main__':
    main()
