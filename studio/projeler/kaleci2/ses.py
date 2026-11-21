#!/usr/bin/env python3
"""Kaleci Bölüm 2 — ses karışımı: robot anlatım + melodik müzik (anlatımda kısılır) + SFX → grafik/public/kaleci2/anlatim_mix.wav"""
import json
import os
import subprocess
import sys

import numpy as np
from scipy.io import wavfile

ST = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(ST, 'scripts'))
from _ortak import SFX, ffmpeg  # noqa: E402

W = os.path.join(ST, 'temp', 'kaleci2')
PUB = os.path.join(ST, 'grafik', 'public', 'kaleci2')
p = json.load(open(os.path.join(PUB, 'plan.json'), encoding='utf-8'))
S = p['sahneler']
kat = {k['ad']: k for k in json.load(open(os.path.join(SFX, 'katalog.json'), encoding='utf-8'))}
SR = 48000


def duduk(yol):
    """hakem düdüğü: ~2.9 kHz, hızlı titreşimli (bilye), iki kısa + bir uzun"""
    parca = []
    for d in (0.18, 0.18, 0.55):
        t = np.arange(int(SR * d)) / SR
        f = 2900 + 120 * np.sin(2 * np.pi * 32 * t)
        y = np.sin(2 * np.pi * np.cumsum(f) / SR) * (0.75 + 0.25 * np.sin(2 * np.pi * 32 * t))
        y += 0.15 * np.random.default_rng(1).standard_normal(len(t))
        y *= np.minimum(1, t / 0.01) * np.minimum(1, (d - t) / 0.03)
        parca += [y, np.zeros(int(SR * 0.07))]
    y = np.concatenate(parca); y = y / np.max(np.abs(y)) * 0.8
    wavfile.write(yol, SR, (np.stack([y, y], 1) * 32767).astype(np.int16))
    return yol


DUD = duduk(os.path.join(W, 'duduk.wav'))
olay = [(S['anket'].get('a') + 1.6, 'pop_balon', -16), (S['anket2']['a'] + 0.9, 'impact_hafif', -14),
        (S['eldiven']['a'] - 0.35, 'whoosh_uzun', -16), (S['eldiven']['a'] + 0.35, 'swoosh_tonal', -17),
        (S['yuru']['a'] + 0.3, 'pop_agiz', -18), (S['toz']['a'], 'whoosh_sert', -14)]
olay += [(S['toz']['a'] + 0.35 + i * 0.55, s, -14) for i, s in enumerate(['impact_hafif', 'pop_tiz', 'impact_orta', 'glitch', 'click_mekanik'])]
olay += [(S['hakem']['a'], DUD, -12), (S['kart']['a'] - 0.6, 'riser_gurultu', -20), (S['kart']['a'] + 0.3, 'impact_derin', -12),
         (S['bos']['a'] + 0.6, 'whoosh_yumusak', -20), (S['hucum']['a'], 'whoosh_uzun', -15), (S['hucum']['a'] + 0.25, 'impact_hafif', -15),
         (S['soru']['a'] - 0.4, 'riser_tonal', -22), (S['soru']['a'], 'impact_orta', -15)]
olay += [(S[h]['a'], s, -15) for h, s in (('A', 'click_ui'), ('B', 'pop_balon'), ('C', 'click_mekanik'))]
olay += [(S['son']['a'], 'swoosh_ince', -17)]

D = p['sure']
ins = ['-i', os.path.join(W, 'anlatim.wav'), '-stream_loop', '-1', '-i', os.path.join(ST, 'assets', 'music', 'melodik_92bpm.wav')]
fc = ['[0:a]aformat=sample_rates=48000:channel_layouts=stereo,volume=2dB,asplit[ses][yan]',
      f'[1:a]aformat=sample_rates=48000:channel_layouts=stereo,atrim=0:{D:.3f},volume=-11dB,afade=t=in:d=1,afade=t=out:st={D - 1.5:.3f}:d=1.5[m]',
      '[m][yan]sidechaincompress=threshold=0.05:ratio=5:attack=30:release=350:makeup=1[md]']
lb = ['[ses]', '[md]']
for i, (t, ad, db) in enumerate(olay, 2):
    yol, tepe = (os.path.join(SFX, kat[ad]['dosya']), kat[ad]['tepe']) if ad in kat else (ad, 0.0)
    bas = max(0.0, t - tepe)
    ins += ['-i', yol]
    fc.append(f'[{i}:a]aformat=sample_rates=48000:channel_layouts=stereo,volume={db}dB,adelay={int(bas * 1000)}|{int(bas * 1000)}[s{i}]')
    lb.append(f'[s{i}]')
fc.append(f"{''.join(lb)}amix=inputs={len(lb)}:duration=first:normalize=0,alimiter=limit=0.85:level=disabled[a]")
out = os.path.join(PUB, 'anlatim_mix.wav')
ffmpeg(ins + ['-filter_complex', ';'.join(fc), '-map', '[a]', '-t', f'{D:.3f}', '-ar', '48000', out])
print(out, f'({len(olay)} SFX)')
