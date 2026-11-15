#!/usr/bin/env python3
"""Sessizlik + nefes kesme; kesim yerlerine %4-8 punch-in zoom (atlama görünmesin).

  kk_sessizlik.py video.mp4                       # -> output/<ad>_kesik_<tarih>.mp4 + .zaman.json
  kk_sessizlik.py video.mp4 --min-bosluk 0.2 --pay 0.07 --zoom 1.04-1.08 --rapor
Konuşma = 10 ms RMS > uyarlanır eşik; kısa, gürültü benzeri (spektral düzlüğü yüksek) parçalar nefes sayılıp atılır.
.zaman.json: [[kaynak_bas, kaynak_son, cikis_bas, zoom], ...] — kelime zamanlarını kesik videoya taşımak için.
"""
import argparse
import json
import os
import subprocess
import sys

import cv2
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _ortak import AENC, bilgi, bitti, cikti_yolu, enc, ffmpeg, hazirla, ortak_argumanlar, probe  # noqa: E402

SR = 16000
HOP = 160  # 10 ms


def ses_oku(path):
    r = subprocess.run(['ffmpeg', '-v', 'error', '-nostdin', '-i', path, '-map', '0:a:0', '-ac', '1', '-ar', str(SR),
                        '-f', 'f32le', '-'], capture_output=True)
    return np.frombuffer(r.stdout, dtype=np.float32)


def sesli_kareler(y, n):
    """10 ms kare başına: periyodik mi (70–400 Hz temel frekans, normalize otokorelasyon > 0.45)?"""
    W = 480  # 30 ms pencere
    out = np.zeros(n, dtype=bool)
    yp = np.pad(y, (0, W))
    for i in range(n):
        x = yp[i * HOP:i * HOP + W]
        x = x - x.mean()
        e = float(np.dot(x, x))
        if e < 1e-7:
            continue
        ac = np.correlate(x, x, 'full')[W - 1:]
        out[i] = ac[40:230].max() / e > 0.45
    return out


def konusma_bolgeleri(y, min_bosluk=0.22, min_konusma=0.12, nefes_max=0.55):
    n = len(y) // HOP
    fr = y[:n * HOP].reshape(n, HOP)
    db = 10 * np.log10(np.mean(fr ** 2, axis=1) + 1e-12)
    taban = np.percentile(db, 10)
    tepe = np.percentile(db, 97)
    esik = max(taban + 14, tepe - 32)
    aktif = db > esik
    sesli = sesli_kareler(y, n)
    # ham bölgeler
    bolge, i = [], 0
    while i < n:
        if aktif[i]:
            j = i
            while j < n and aktif[j]:
                j += 1
            bolge.append([i, j]); i = j
        else:
            i += 1
    # 80 ms'den kısa boşlukla bölünmüş parçaları önce birleştir (nefes/hece zarfı eşikte dalgalanabilir)
    b2 = []
    for a, b in bolge:
        if b2 and a - b2[-1][1] < 8:
            b2[-1][1] = b
        else:
            b2.append([a, b])
    bolge = b2
    # nefes: kısa, iki yanı sessiz ve içinde neredeyse hiç sesli (periyodik) kare yok
    temiz, nefes = [], []
    for k, (a, b) in enumerate(bolge):
        sure = (b - a) * HOP / SR
        once = (a - bolge[k - 1][1]) * HOP / SR if k else 9
        sonra = (bolge[k + 1][0] - b) * HOP / SR if k + 1 < len(bolge) else 9
        oran = float(np.mean(sesli[a:b]))
        if sure < nefes_max and oran < 0.2 and min(once, sonra) > 0.12:
            nefes.append((round(a * HOP / SR, 3), round(b * HOP / SR, 3))); continue
        if sure < 0.03 and oran < 0.5:
            continue
        temiz.append([a, b])
    # yakın konuşmaları birleştir (cümle içi doğal duraklar korunur)
    birlesik = []
    for a, b in temiz:
        if birlesik and (a - birlesik[-1][1]) * HOP / SR < min_bosluk:
            birlesik[-1][1] = b
        else:
            birlesik.append([a, b])
    out = [(a * HOP / SR, b * HOP / SR) for a, b in birlesik if (b - a) * HOP / SR >= min_konusma]
    return out, nefes, float(esik)


def yuz_merkezi(path, t, W, H):
    cap = cv2.VideoCapture(path)
    cap.set(cv2.CAP_PROP_POS_MSEC, t * 1000)
    ok, fr = cap.read(); cap.release()
    if ok and hasattr(cv2, 'CascadeClassifier'):
        g = cv2.cvtColor(fr, cv2.COLOR_BGR2GRAY)
        k = 480 / max(W, H); gs = cv2.resize(g, None, fx=k, fy=k)
        fc = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        f = fc.detectMultiScale(gs, 1.1, 5, minSize=(20, 20))
        if len(f):
            x, y, w, h = max(f, key=lambda r: r[2] * r[3])
            return (x + w / 2) / k, (y + h / 2) / k
    return W / 2, H * 0.38


def main():
    ap = ortak_argumanlar(argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter))
    ap.add_argument('girdi')
    ap.add_argument('--min-bosluk', type=float, default=0.22, help='bundan kısa boşluklar kesilmez (sn)')
    ap.add_argument('--pay', type=float, default=0.07, help='konuşmanın önüne/arkasına bırakılan pay (sn)')
    ap.add_argument('--zoom', default='1.04-1.08', help='punch-in aralığı')
    ap.add_argument('--rapor', action='store_true')
    a = ap.parse_args()
    g = hazirla(a.girdi, a)
    inf = probe(g)
    W, H, fps, D = inf['w'], inf['h'], inf['fps'], inf['sure']
    y = ses_oku(g)
    bol, nefes, esik = konusma_bolgeleri(y, a.min_bosluk)
    # pay ekle, çakışanları birleştir
    seg = []
    for s, e in bol:
        s, e = max(0, s - a.pay), min(D, e + a.pay * 1.3)
        if seg and s <= seg[-1][1] + 0.02:
            seg[-1][1] = e
        else:
            seg.append([s, e])
    atilan = D - sum(e - s for s, e in seg)
    bilgi(f'eşik {esik:.1f} dB · {len(seg)} konuşma parçası · {len(nefes)} nefes · {atilan:.2f} sn atıldı '
          f'({D:.2f} → {D - atilan:.2f} sn)')
    z0, z1 = map(float, a.zoom.split('-'))
    rng = np.random.default_rng(11)
    zaman, fc, zincir, cikis = [], [], '', 0.0
    for i, (s, e) in enumerate(seg):
        z = 1.0 if i % 2 == 0 else float(rng.uniform(z0, z1))  # dönüşümlü: geniş / yakın
        cx, cy = yuz_merkezi(g, (s + e) / 2, W, H)
        cw, ch = int(W / z) // 2 * 2, int(H / z) // 2 * 2
        x = int(np.clip(cx - cw / 2, 0, W - cw)); yy = int(np.clip(cy - ch * 0.42, 0, H - ch))
        fc.append(f'[0:v]trim={s:.3f}:{e:.3f},setpts=PTS-STARTPTS,crop={cw}:{ch}:{x}:{yy},scale={W}:{H}:flags=lanczos,'
                  f'setsar=1[v{i}]')
        fc.append(f'[0:a]atrim={s:.3f}:{e:.3f},asetpts=PTS-STARTPTS,afade=t=in:d=0.012,'
                  f'afade=t=out:st={max(0, e - s - 0.015):.3f}:d=0.015[a{i}]')
        zincir += f'[v{i}][a{i}]'
        zaman.append([round(s, 3), round(e, 3), round(cikis, 3), round(z, 3)])
        cikis += e - s
    if a.rapor:
        print(json.dumps({'parcalar': zaman, 'nefes': nefes}, ensure_ascii=False, indent=1)); return
    fc.append(f'{zincir}concat=n={len(seg)}:v=1:a=1[vc][a]')
    fc.append(f'[vc]fps={fps:g},format=yuv420p[v]')
    out = cikti_yolu(a.girdi, 'kesik', o=a.cikti, onizleme=a.onizleme)
    ffmpeg(['-i', g, '-filter_complex', ';'.join(fc), '-map', '[v]', '-map', '[a]'] + enc(a) + AENC
           + ['-movflags', '+faststart', out])
    with open(out + '.zaman.json', 'w') as f:
        json.dump({'parcalar': zaman, 'nefes': nefes, 'kaynak': os.path.abspath(a.girdi)}, f, indent=1)
    bitti(out)


if __name__ == '__main__':
    main()
