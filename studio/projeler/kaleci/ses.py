#!/usr/bin/env python3
"""Kaleci videosu — SFX (şut, kurtarış, hüzünlü trombon, takım, soru, şıklar) + export."""
import json
import os
import sys

import numpy as np
from scipy.io import wavfile

ST = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(ST, 'scripts'))
from _ortak import AENC, SFX, ffmpeg  # noqa: E402

W = os.path.join(ST, 'temp', 'kaleci')
p = json.load(open(os.path.join(ST, 'grafik', 'public', 'kaleci', 'plan.json'), encoding='utf-8'))
kat = {k['ad']: k for k in json.load(open(os.path.join(SFX, 'katalog.json'), encoding='utf-8'))}
SR = 48000


def trombon(yol):
    """'vah vah vah vaaah' — inen dört nota, son nota titreşimli (telifsiz sentez)"""
    notalar = [(311.1, 0.32), (293.7, 0.32), (277.2, 0.32), (261.6, 1.1)]
    y = []
    for i, (f, d) in enumerate(notalar):
        t = np.arange(int(SR * d)) / SR
        vib = 1 + (0.012 * np.sin(2 * np.pi * 6 * t) if i == 3 else 0)
        kay = f * vib * (1 - 0.03 * t / d if i == 3 else 1)
        faz = 2 * np.pi * np.cumsum(kay) / SR
        ton = sum(np.sin(faz * h) / h ** 0.8 for h in range(1, 9))
        zarf = np.minimum(1, t / 0.03) * np.minimum(1, (d - t) / 0.08)
        wah = 0.55 + 0.45 * np.minimum(1, t / 0.12)  # "va" açılışı
        y.append(np.tanh(ton * zarf * wah * 0.6))
    y = np.concatenate(y)
    y = y / np.max(np.abs(y)) * 0.9
    wavfile.write(yol, SR, (np.stack([y, y], 1) * 32767).astype(np.int16))
    return yol


TR = trombon(os.path.join(W, 'trombon.wav'))
olay = [(p['editRozet'][0], 'click_ui', -18), (p['mgBas'], 'whoosh_uzun', -15), (p['kaleciGir'], 'pop_balon', -16)]
for i, t0 in enumerate(p['kurtaris']):
    olay += [(t0, 'impact_hafif', -15), (t0 + 0.02, 'whoosh_kisa', -17), (t0 + 0.5, 'impact_orta', -13)]
olay += [(p['kolayGol'], 'click_yumusak', -16), (p['kolayGol'] + 2.0, 'swoosh_ince', -20), (p['kolayGol'] + 2.05, TR, -15)]
olay += [(p['takim'] + 0.2 + i * 0.3, s, -16) for i, s in enumerate(['pop_tiz', 'pop_agiz', 'pop_balon'])]
olay += [(p['soru'] - 0.6, 'riser_gurultu', -22), (p['soru'], 'impact_hafif', -15), (p['mgSon'] - 0.45, 'whoosh_yumusak', -16)]
olay += [(s['t'], ['click_mekanik', 'click_ui', 'pop_tiz'][i], -15) for i, s in enumerate(p['siklar'])]
olay += [(p['son'], 'swoosh_tonal', -19)]

ins, fc, lb = ['-i', os.path.join(W, 'grafikli.mp4')], ['[0:a]aformat=sample_rates=48000:channel_layouts=stereo[v0]'], ['[v0]']
for i, (t, ad, db) in enumerate(olay, 1):
    yol, tepe = (os.path.join(SFX, kat[ad]['dosya']), kat[ad]['tepe']) if ad in kat else (ad, 0.0)
    bas = max(0.0, t - tepe)
    ins += ['-i', yol]
    fc.append(f'[{i}:a]aformat=sample_rates=48000:channel_layouts=stereo,volume={db}dB,adelay={int(bas * 1000)}|{int(bas * 1000)}[s{i}]')
    lb.append(f'[s{i}]')
fc.append(f"{''.join(lb)}amix=inputs={len(lb)}:duration=first:normalize=0[a]")
out = os.path.join(W, 'grafikli_ses.mp4')
ffmpeg(ins + ['-filter_complex', ';'.join(fc), '-map', '0:v', '-map', '[a]', '-c:v', 'copy'] + AENC + [out])
print(out, f'({len(olay)} SFX)')
