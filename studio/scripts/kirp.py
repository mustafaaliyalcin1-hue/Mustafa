#!/usr/bin/env python3
"""En-boy oranı dönüştürme: 9:16 dikey (akıllı özne takibi), 16:9, 1:1, 4:5.

  kirp.py video.mp4                       # varsayılan 9:16, akıllı crop, 1080x1920
  kirp.py video.mp4 --oran 1:1
  kirp.py video.mp4 --oran 16:9 --mod bulanik   # kırpmadan, bulanık arka planla doldur
  kirp.py video.mp4 --mod merkez           # sabit orta kırpma
Akıllı mod: yüz (Haar) > hareket (kare farkı) > görsel belirginlik ağırlıklı merkez; yol yumuşatılır,
ani zıplama olmaz; sahne kesiminde kamera yeni özneye hemen geçer.
"""
import argparse
import os
import sys

import cv2
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _ortak import (AENC, TEMP, bitti, cikti_yolu, enc, ffmpeg, hazirla, ortak_argumanlar, probe,  # noqa: E402
                    olay_aktar, filtre_yolu)

HEDEF = {'9:16': (1080, 1920), '16:9': (1920, 1080), '1:1': (1080, 1080), '4:5': (1080, 1350)}


def ozne_yolu(path, crop_w, crop_h, W, H, adim=2):
    """Her kare için kırpma kutusunun sol-üst (x, y) koordinatı."""
    cap = cv2.VideoCapture(path)
    n = int(cap.get(cv2.CAP_PROP_FRAME_COUNT)) or 1
    yuz = (cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
           if hasattr(cv2, 'CascadeClassifier') else None)
    kucuk = 320 / max(W, H)
    merkezler, onceki, kesim = [], None, []
    i = 0
    while True:
        ok = cap.grab()
        if not ok:
            break
        if i % adim:
            merkezler.append(None); i += 1; continue
        ok, fr = cap.retrieve()
        if not ok:
            break
        g = cv2.cvtColor(cv2.resize(fr, None, fx=kucuk, fy=kucuk), cv2.COLOR_BGR2GRAY)
        c = None
        faces = yuz.detectMultiScale(g, 1.15, 5, minSize=(16, 16)) if yuz is not None else ()
        if len(faces):
            x, y, w, h = max(faces, key=lambda f: f[2] * f[3])
            c = ((x + w / 2) / kucuk, (y + h / 2) / kucuk, 3.0)
        if onceki is not None:
            d = cv2.absdiff(g, onceki).astype(np.float32)
            if d.mean() > 40:          # sahne kesimi
                kesim.append(i)
            elif c is None and d.sum() > 0:
                d = cv2.GaussianBlur(d, (0, 0), 3)
                d[d < max(12, d.max() * 0.35)] = 0
                if d.sum() > 50:
                    ys, xs = np.indices(d.shape)
                    c = ((xs * d).sum() / d.sum() / kucuk, (ys * d).sum() / d.sum() / kucuk, 1.0)
        if c is None:  # belirginlik: kenar yoğunluğu ağırlık merkezi
            e = cv2.GaussianBlur(cv2.Canny(g, 60, 160).astype(np.float32), (0, 0), 8)
            if e.sum() > 0:
                ys, xs = np.indices(e.shape)
                c = ((xs * e).sum() / e.sum() / kucuk, (ys * e).sum() / e.sum() / kucuk, 0.3)
        merkezler.append(c)
        onceki = g
        i += 1
    cap.release()
    n = len(merkezler)
    cx = np.full(n, W / 2.0); cy = np.full(n, H / 2.0)
    son = (W / 2, H / 2)
    for k, c in enumerate(merkezler):
        if c is not None:
            son = (c[0], c[1])
        cx[k], cy[k] = son
    # sahne parçaları ayrı ayrı yumuşatılır (kesimde kamera ani geçer)
    sinir = [0] + sorted(set(kesim)) + [n]
    fps = 30
    for a, b in zip(sinir[:-1], sinir[1:]):
        for arr in (cx, cy):
            seg = arr[a:b].copy()
            if len(seg) < 3:
                continue
            k = max(3, int(fps * 0.6)) | 1
            pad = np.pad(seg, (k, k), mode='edge')
            ker = np.hanning(k); ker /= ker.sum()
            sm = np.convolve(pad, ker, 'same')[k:-k]
            # ölü bölge: küçük titremeleri yok say
            out, cur = np.empty_like(sm), sm[0]
            for j, v in enumerate(sm):
                if abs(v - cur) > crop_w * 0.04:
                    cur += (v - cur) * 0.25
                out[j] = cur
            arr[a:b] = np.convolve(np.pad(out, (k, k), mode='edge'), ker, 'same')[k:-k]
    xs = np.clip(cx - crop_w / 2, 0, W - crop_w)
    ys = np.clip(cy - crop_h / 2, 0, H - crop_h)
    return xs, ys


def main():
    ap = ortak_argumanlar(argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter))
    ap.add_argument('girdi')
    ap.add_argument('--oran', default='9:16', choices=list(HEDEF))
    ap.add_argument('--mod', default='akilli', choices=['akilli', 'merkez', 'bulanik'])
    ap.add_argument('--boyut', help='çıktı boyutu WxH (varsayılan orana göre 1080 tabanlı)')
    args = ap.parse_args()
    g = hazirla(args.girdi, args)
    inf = probe(g)
    W, H = inf['w'], inf['h']
    OW, OH = (map(int, args.boyut.split('x')) if args.boyut else HEDEF[args.oran])
    if args.onizleme:
        OW, OH = OW // 2 // 2 * 2, OH // 2 // 2 * 2
    hedef_oran = OW / OH
    if W / H > hedef_oran:
        cw, ch = int(H * hedef_oran) // 2 * 2, H // 2 * 2
    else:
        cw, ch = W // 2 * 2, int(W / hedef_oran) // 2 * 2
    out = cikti_yolu(args.girdi, args.oran.replace(':', 'x'), o=args.cikti, onizleme=args.onizleme)

    if args.mod == 'bulanik':
        vf = (f'[0:v]split[a][b];[a]scale={OW}:{OH}:force_original_aspect_ratio=increase,crop={OW}:{OH},'
              f'gblur=sigma=40,eq=brightness=-0.08[bg];[b]scale={OW}:{OH}:force_original_aspect_ratio=decrease[fg];'
              f'[bg][fg]overlay=(W-w)/2:(H-h)/2,setsar=1,format=yuv420p[v]')
    elif args.mod == 'merkez' or (cw == W and ch == H):
        vf = f'[0:v]crop={cw}:{ch},scale={OW}:{OH},setsar=1,format=yuv420p[v]'
    else:
        xs, ys = ozne_yolu(g, cw, ch, W, H)
        fps = inf['fps']
        cmd = os.path.join(TEMP, f'crop_{os.getpid()}.cmd')
        with open(cmd, 'w') as f:
            for i, (x, y) in enumerate(zip(xs, ys)):
                f.write(f'{i / fps:.4f} crop x {int(x)}, crop y {int(y)};\n')
        vf = (f"[0:v]sendcmd=f='{filtre_yolu(cmd)}',crop={cw}:{ch}:{int(xs[0])}:{int(ys[0])},"
              f'scale={OW}:{OH}:flags=lanczos,setsar=1,format=yuv420p[v]')
    ffmpeg(['-i', g, '-filter_complex', vf, '-map', '[v]'] + (['-map', '0:a'] + AENC if inf['ses'] else [])
           + enc(args) + ['-movflags', '+faststart', out])
    olay_aktar(g if g == args.girdi else args.girdi, out)
    bitti(out)


if __name__ == '__main__':
    main()
