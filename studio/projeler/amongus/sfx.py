#!/usr/bin/env python3
"""Among Us v3 — efektlere bağlı SFX (zamanlar grafik/src/amongus/AmongUs.tsx Z ile aynı) + export."""
import json
import os
import subprocess
import sys

import numpy as np
from scipy.io import wavfile

ST = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(ST, 'scripts'))
from _ortak import AENC, SFX, ffmpeg  # noqa: E402

W = os.path.join(ST, 'temp', 'amongus')
Z = dict(gorev=0.2, kill=2.95, vent=5.38, can=6.6, canSon=11.7, dusus=11.7, carpma=13.0, donma=13.2)
kat = {k['ad']: k for k in json.load(open(os.path.join(SFX, 'katalog.json'), encoding='utf-8'))}


def kalp(yol):
    """kısık 'lub-dub' kalp atışı (tek atış)"""
    sr = 48000; t = np.arange(int(sr * 0.5)) / sr
    def vur(t0, f, g):
        x = np.clip(t - t0, 0, None)
        return g * np.sin(2 * np.pi * f * x) * np.exp(-x * 28) * (t >= t0)
    y = vur(0.0, 55, 1.0) + vur(0.16, 48, 0.7)
    y = y / np.max(np.abs(y)) * 0.9
    wavfile.write(yol, sr, (np.stack([y, y], 1) * 32767).astype(np.int16))
    return yol


olay = [(Z['gorev'], 'click_ui', -18)] + [(Z['gorev'] + 0.55 * i, 'click_yumusak', -22) for i in range(1, 5)]
olay += [(Z['kill'] - 0.05, 'whoosh_kisa', -16), (Z['kill'], 'impact_orta', -12), (Z['kill'] + 0.05, 'glitch', -22),
         (Z['vent'] - 0.1, 'whoosh_sert', -15), (Z['vent'] + 0.05, 'pop_agiz', -20)]
kalp_yol = kalp(os.path.join(W, 'kalp.wav'))
t = Z['can'] + 0.2
while t < Z['canSon']:
    olay.append((t, kalp_yol, -16)); t += 0.74
olay += [(Z['dusus'], 'swoosh_tonal', -20), (Z['carpma'], 'impact_derin', -13), (Z['donma'], 'shutter', -16),
         (Z['donma'] + 0.18, 'impact_hafif', -13)]

ins, fc, lb = ['-i', os.path.join(W, 'efektli.mp4')], ['[0:a]aformat=sample_rates=48000:channel_layouts=stereo[v0]'], ['[v0]']
for i, (zaman, ad, db) in enumerate(olay, 1):
    if ad in kat:
        yol, tepe = os.path.join(SFX, kat[ad]['dosya']), kat[ad]['tepe']
    else:
        yol, tepe = ad, 0.0
    bas = max(0.0, zaman - tepe)
    ins += ['-i', yol]
    fc.append(f'[{i}:a]aformat=sample_rates=48000:channel_layouts=stereo,volume={db}dB,'
              f'adelay={int(bas * 1000)}|{int(bas * 1000)}[s{i}]')
    lb.append(f'[s{i}]')
fc.append(f"{''.join(lb)}amix=inputs={len(lb)}:duration=first:normalize=0[a]")
out = os.path.join(W, 'efektli_sfx.mp4')
ffmpeg(ins + ['-filter_complex', ';'.join(fc), '-map', '0:v', '-map', '[a]', '-c:v', 'copy'] + AENC + [out])
print(out, f'({len(olay)} ses)')
