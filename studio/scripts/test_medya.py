#!/usr/bin/env python3
"""Test medyası üretir: input/ içine hareketli klipler, assets/music içine 120 BPM test müziği.
Kullanım: python3 scripts/test_medya.py"""
import os
import sys

import numpy as np
from scipy.io import wavfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _ortak import STUDIO, MUSIC, ffmpeg, bilgi  # noqa: E402

INP = os.path.join(STUDIO, 'input')
os.makedirs(INP, exist_ok=True)
os.makedirs(MUSIC, exist_ok=True)
SR = 48000


def klip(ad, kaynak, sure, ozne_renk, frek, ekstra=''):
    """Kaynak + hareket eden 'özne' kutusu + konuşma benzeri ton."""
    vf = (f"drawbox=x='iw*0.15+iw*0.55*(0.5+0.5*sin(t*1.3))':y='ih*0.35+ih*0.1*sin(t*2.1)':w=ih*0.28:h=ih*0.28:"
          f"color={ozne_renk}@1:t=fill,"
          f"drawbox=x='iw*0.15+iw*0.55*(0.5+0.5*sin(t*1.3))+ih*0.05':y='ih*0.35+ih*0.1*sin(t*2.1)+ih*0.07':"
          f"w=ih*0.05:h=ih*0.05:color=black@1:t=fill{ekstra},format=yuv420p")
    af = f"sine=f={frek}:r=48000,volume='0.25*(0.5+0.5*sin(2*PI*3*t))':eval=frame,aformat=channel_layouts=stereo"
    ffmpeg(['-f', 'lavfi', '-t', str(sure), '-i', kaynak, '-f', 'lavfi', '-t', str(sure), '-i', af,
            '-vf', vf, '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-c:a', 'aac', '-b:a', '160k',
            '-shortest', os.path.join(INP, ad)])
    bilgi(f'klip: {ad}')


def muzik(ad, sure=32.0, bpm=120):
    t = np.arange(int(SR * sure)) / SR
    beat = 60 / bpm
    y = np.zeros_like(t)
    rng = np.random.default_rng(7)
    n_beats = int(sure / beat)
    for i in range(n_beats):
        s = int(i * beat * SR)
        # kick her vuruşta
        L = int(0.25 * SR); tt = np.arange(L) / SR
        kick = np.sin(2 * np.pi * (50 + 120 * np.exp(-tt * 30)) * tt) * np.exp(-tt * 9)
        y[s:s + L] += 0.9 * kick[:len(y[s:s + L])]
        # snare 2 ve 4
        if i % 2 == 1:
            L2 = int(0.18 * SR); tt2 = np.arange(L2) / SR
            sn = rng.standard_normal(L2) * np.exp(-tt2 * 22) * 0.45 + np.sin(2 * np.pi * 190 * tt2) * np.exp(-tt2 * 30) * 0.3
            y[s:s + L2] += sn[:len(y[s:s + L2])]
        # hi-hat sekizlik
        for k in (0, 0.5):
            h0 = int((i + k) * beat * SR); L3 = int(0.05 * SR)
            hh = np.diff(rng.standard_normal(L3 + 1)) * np.exp(-np.arange(L3) / SR * 80) * 0.12
            y[h0:h0 + L3] += hh[:len(y[h0:h0 + L3])]
    # bas + akor (Am - F - C - G), her akor 2 ölçü
    akorlar = [(110.0, [220, 261.6, 329.6]), (87.3, [174.6, 220, 261.6]), (130.8, [261.6, 329.6, 392]),
               (98.0, [196, 246.9, 293.7])]
    olcu = 4 * beat
    for i in range(int(sure / (2 * olcu)) + 1):
        bas, ak = akorlar[i % 4]
        s, e = int(i * 2 * olcu * SR), int(min(sure, (i + 1) * 2 * olcu) * SR)
        if s >= len(t):
            break
        tt = t[s:e] - t[s]
        env = np.minimum(1, tt * 20) * np.minimum(1, (tt[-1] - tt + 1e-3) * 10)
        y[s:e] += 0.22 * np.sign(np.sin(2 * np.pi * bas * tt)) * 0.5 * env
        for f in ak:
            y[s:e] += 0.06 * (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(4 * np.pi * f * tt)) * env
    y = y / np.max(np.abs(y)) * 0.85
    st = np.stack([y, np.roll(y, 240)], 1)
    wav = os.path.join(MUSIC, ad + '.wav')
    wavfile.write(wav, SR, (st * 32767).astype(np.int16))
    ffmpeg(['-i', wav, '-c:a', 'libmp3lame', '-b:a', '256k', os.path.join(MUSIC, ad + '.mp3')])
    os.remove(wav)
    bilgi(f'müzik: {ad}.mp3 ({bpm} BPM, {sure} sn)')


if __name__ == '__main__':
    S = 's=1920x1080:r=30'
    klip('klip1_mandelbrot.mp4', f'mandelbrot={S}', 6, '#FFD400', 220)
    klip('klip2_gradyan.mp4', f'gradients={S}:speed=0.03:c0=#1a2a6c:c1=#b21f1f:c2=#fdbb2d', 6, '#00E5FF', 260)
    klip('klip3_testsrc.mp4', f'testsrc2={S}', 6, '#FF2D95', 300)
    # İçinde 3 sert sahne kesimi olan ham çekim (sahne tespiti / auto_sfx testi)
    ffmpeg(['-i', os.path.join(INP, 'klip1_mandelbrot.mp4'), '-i', os.path.join(INP, 'klip2_gradyan.mp4'),
            '-i', os.path.join(INP, 'klip3_testsrc.mp4'), '-filter_complex',
            '[0:v]trim=0:4,setpts=PTS-STARTPTS[a];[1:v]trim=0:4,setpts=PTS-STARTPTS[b];'
            '[2:v]trim=0:4,setpts=PTS-STARTPTS[c];[0:a]atrim=0:4,asetpts=PTS-STARTPTS[x];'
            '[1:a]atrim=0:4,asetpts=PTS-STARTPTS[y];[2:a]atrim=0:4,asetpts=PTS-STARTPTS[z];'
            '[a][x][b][y][c][z]concat=n=3:v=1:a=1[v][au]', '-map', '[v]', '-map', '[au]',
            '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-c:a', 'aac',
            os.path.join(INP, 'ham_cekim.mp4')])
    bilgi('klip: ham_cekim.mp4 (3 sahne)')
    muzik('test_muzik_120bpm')
