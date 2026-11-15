#!/usr/bin/env python3
"""Eldiven videosu — 3. adım: her grafik girişine farklı, kısık bir SFX (tepe noktası giriş karesine hizalı)."""
import json
import os
import sys

ST = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(ST, 'scripts'))
from _ortak import AENC, SFX, ffmpeg  # noqa: E402

W = os.path.join(ST, 'temp', 'eldiven')
plan = json.load(open(os.path.join(ST, 'grafik', 'public', 'eldiven', 'plan.json'), encoding='utf-8'))
kat = {k['ad']: k for k in json.load(open(os.path.join(SFX, 'katalog.json'), encoding='utf-8'))}

olay = [  # (zaman, ses, dB) — kısık seviyeler; konuşmanın altında kalır
    (plan['arkaBaslik']['a'], 'whoosh_uzun', -21),
    (plan['arkaBaslik']['a'] + 0.35, 'pop_balon', -22),
    (plan['bolLR']['a'], 'whoosh_sert', -21),
]
for m, s in zip(plan['bolLR']['maddeler'], ['click_ui', 'pop_tiz', 'click_mekanik', 'pop_agiz']):
    olay.append((m['t'], s, -20))
olay += [
    (plan['tekrarCip']['a'], 'swoosh_ince', -20),
    (plan['tekrarCip']['ciz'], 'shutter', -19),           # makas/kesme hissi
    (plan['bosluk']['a'], 'pop_balon', -20),
    (plan['bosluk']['kirp'], 'swoosh_tonal', -22),         # boşluklar kapanıyor
    (plan['bolTB']['a'], 'whoosh_yumusak', -20),
    (plan['bolTB']['dusus'], 'impact_hafif', -21),
    (plan['bolTB']['cikis'], 'pop_tiz', -21),
]
ins, fc, lb = ['-i', os.path.join(W, 'grafikli.mp4')], ['[0:a]aformat=sample_rates=48000:channel_layouts=stereo[v0]'], ['[v0]']
for i, (t, ad, db) in enumerate(olay, 1):
    k = kat[ad]
    bas = t - k['tepe']
    ins += ['-i', os.path.join(SFX, k['dosya'])]
    fc.append(f"[{i}:a]aformat=sample_rates=48000:channel_layouts=stereo,atrim=start={max(0, -bas):.3f},asetpts=PTS-STARTPTS,"
              f"volume={db}dB,adelay={int(max(0, bas) * 1000)}|{int(max(0, bas) * 1000)}[s{i}]")
    lb.append(f'[s{i}]')
fc.append(f"{''.join(lb)}amix=inputs={len(lb)}:duration=first:normalize=0,alimiter=limit=0.9:level=disabled[a]")
out = os.path.join(W, 'grafikli_sfx.mp4')
ffmpeg(ins + ['-filter_complex', ';'.join(fc), '-map', '0:v', '-map', '[a]', '-c:v', 'copy'] + AENC + [out])
print(out, f'({len(olay)} SFX)')
