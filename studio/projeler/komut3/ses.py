#!/usr/bin/env python3
"""Komut videosu 3 — son ses: konuşma + melodik müzik ("şu andan sonra", konuşmada kısılır) + grafik SFX → export."""
import json
import os
import subprocess
import sys

ST = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(ST, 'scripts'))
from _ortak import AENC, SFX, ffmpeg  # noqa: E402

W = os.path.join(ST, 'temp', 'komut3')
plan = json.load(open(os.path.join(ST, 'grafik', 'public', 'komut3', 'plan.json'), encoding='utf-8'))
kat = {k['ad']: k for k in json.load(open(os.path.join(SFX, 'katalog.json'), encoding='utf-8'))}
D = plan['sure']
M0 = plan['muzik']

olay = [(0.05, 'pop_balon', -20), (plan['benClaude']['a'], 'whoosh_kisa', -19), (plan['benClaude']['turuncu'], 'pop_tiz', -18),
        (plan['merhaba']['a'], 'swoosh_ince', -19), (plan['liste']['a'], 'whoosh_yumusak', -20)]
olay += [(seg[0][0], 'click_ui', -18) for seg in plan['kameraman']]
olay += [(plan['liste']['a'] + 0.35 + i * 0.32, ['click_yumusak', 'pop_agiz'][i % 2], -21) for i in range(len(plan['liste']['maddeler']))]
ses_haritasi = {'sicaklik': ('swoosh_tonal', -21), 'filtre': ('click_mekanik', -19), 'efekt': ('riser_tonal', -24),
                'siyahbeyaz': ('impact_hafif', -19), 'duzelt': ('pop_balon', -18), 'canli': ('swoosh_ince', -19)}
for i, (t, ad) in enumerate(plan['renk']):
    if i < 6:
        olay.append((t, 'shutter', -20))          # filtreler teker teker
    elif ad in ses_haritasi:
        s, db = ses_haritasi[ad]
        olay.append((t, s, db))

ins = ['-i', os.path.join(W, 'grafikli.mp4'), '-i', os.path.join(ST, 'assets', 'music', 'melodik_92bpm.wav')]
fc = ['[0:a]aformat=sample_rates=48000:channel_layouts=stereo,asplit[ses][yan]',
      f'[1:a]aformat=sample_rates=48000:channel_layouts=stereo,atrim=0:{D - M0:.3f},volume=-9dB,afade=t=in:d=0.8,'
      f'afade=t=out:st={max(0, D - M0 - 1.2):.3f}:d=1.2,adelay={int(M0 * 1000)}|{int(M0 * 1000)}[m]',
      '[m][yan]sidechaincompress=threshold=0.04:ratio=6:attack=25:release=400:makeup=1[md]']
lb = ['[ses]', '[md]']
for i, (t, ad, db) in enumerate(olay, 2):
    k = kat[ad]
    bas = max(0.0, t - k['tepe'])
    ins += ['-i', os.path.join(SFX, k['dosya'])]
    fc.append(f'[{i}:a]aformat=sample_rates=48000:channel_layouts=stereo,volume={db}dB,'
              f'adelay={int(bas * 1000)}|{int(bas * 1000)}[s{i}]')
    lb.append(f'[s{i}]')
fc.append(f"{''.join(lb)}amix=inputs={len(lb)}:duration=first:normalize=0[a]")
out = os.path.join(W, 'grafikli_ses.mp4')
ffmpeg(ins + ['-filter_complex', ';'.join(fc), '-map', '0:v', '-map', '[a]', '-c:v', 'copy'] + AENC + [out])
print(out, f'(müzik {M0:.2f} sn\'den itibaren, {len(olay)} SFX)')
