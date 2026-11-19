#!/usr/bin/env python3
"""'Güzel melodik' arka plan müziği sentezi (telifsiz, projeye ait): 92 BPM, Fmaj7–G–Em7–Am7,
piyano benzeri melodi + arpej + yumuşak pad + hafif kick/shaker. Çıktı: assets/music/melodik_92bpm.wav"""
import os
import sys

import numpy as np
from scipy import signal
from scipy.io import wavfile

ST = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SR = 48000
BPM = 92
VURUS = 60 / BPM
rng = np.random.default_rng(5)


def nota(ad):
    isim = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}
    return 440 * 2 ** ((isim[ad[0]] + 12 * (int(ad[-1]) - 4) - 9) / 12)


def piyano(f, d, g=1.0):
    t = np.arange(int(SR * d)) / SR
    y = sum(np.sin(2 * np.pi * f * h * t) * (0.6 ** (h - 1)) * np.exp(-t * (2.2 + h * 0.9)) for h in range(1, 6))
    atak = np.minimum(1, t * SR / 120)
    return g * y * atak


def pad(f, d, g=1.0):
    t = np.arange(int(SR * d)) / SR
    y = sum(np.sin(2 * np.pi * f * k * t + np.sin(2 * np.pi * 0.3 * t) * 0.3) for k in (1, 1.003, 0.997))
    zarf = np.minimum(1, t / 0.6) * np.minimum(1, (d - t) / 0.6)
    return g * y * zarf / 3


def ekle(dst, y, bas):
    i = int(bas * SR)
    if i >= len(dst):
        return
    dst[i:i + len(y)] += y[:len(dst) - i]


def main(sure=32.0):
    n = int(SR * sure)
    L, R = np.zeros(n), np.zeros(n)
    akorlar = [('F3', ['A3', 'C4', 'E4', 'F4']), ('G3', ['B3', 'D4', 'G4', 'A4']), ('E3', ['G3', 'B3', 'D4', 'E4']),
               ('A3', ['C4', 'E4', 'G4', 'A4'])]
    melodi = [['A5', 'G5', 'F5', 'E5', 'F5', 'C5', None, 'A4'], ['B5', 'A5', 'G5', 'D5', 'G5', None, 'A5', 'B5'],
              ['G5', 'E5', 'D5', 'E5', 'B4', None, 'D5', 'E5'], ['C6', 'B5', 'A5', 'E5', 'G5', 'A5', None, None]]
    olcu = 4 * VURUS
    i = 0
    while i * olcu < sure:
        bas_t = i * olcu
        kok, ak = akorlar[i % 4]
        for f in [kok] + ak[:3]:  # pad
            y = pad(nota(f), olcu + 0.4, 0.06)
            ekle(L, y, bas_t); ekle(R, y, bas_t)
        ekle(L, piyano(nota(kok) / 2, olcu, 0.25), bas_t); ekle(R, piyano(nota(kok) / 2, olcu, 0.25), bas_t)
        for k in range(8):  # arpej (sekizlik), stereo dalgalı
            f = nota(ak[[0, 1, 2, 3, 2, 1, 2, 3][k]])
            y = piyano(f, VURUS * 1.5, 0.12)
            p = 0.5 + 0.35 * np.sin(k)
            ekle(L, y * (1 - p), bas_t + k * VURUS / 2); ekle(R, y * p, bas_t + k * VURUS / 2)
        if i >= 1:  # melodi ikinci ölçüden itibaren
            for k, nm in enumerate(melodi[i % 4]):
                if nm:
                    y = piyano(nota(nm), VURUS * 1.2, 0.2)
                    ekle(L, y * 0.55, bas_t + k * VURUS / 2); ekle(R, y * 0.45, bas_t + k * VURUS / 2)
        if i >= 2:  # hafif ritim
            for k in range(4):
                tk = np.arange(int(SR * 0.3)) / SR
                kick = np.sin(2 * np.pi * (45 + 70 * np.exp(-tk * 30)) * tk) * np.exp(-tk * 10) * 0.35
                ekle(L, kick, bas_t + k * VURUS); ekle(R, kick, bas_t + k * VURUS)
                for e in (0.5,):
                    sh = rng.standard_normal(int(SR * 0.06)) * np.exp(-np.arange(int(SR * 0.06)) / SR * 60) * 0.04
                    sh = signal.lfilter(*signal.butter(2, 6000 / (SR / 2), 'high'), sh)
                    ekle(L, sh, bas_t + (k + e) * VURUS); ekle(R, sh * 0.8, bas_t + (k + e) * VURUS)
        i += 1
    y = np.stack([L, R], 1)
    # hafif yankı
    ir = rng.standard_normal(int(SR * 1.2)) * np.exp(-np.arange(int(SR * 1.2)) / SR * 4)
    ir = signal.lfilter(*signal.butter(2, 3500 / (SR / 2)), ir); ir /= np.sqrt((ir ** 2).sum())
    for c in range(2):
        y[:, c] += 0.18 * signal.fftconvolve(y[:, c], ir)[:n]
    y[-int(SR * 2):] *= np.linspace(1, 0, int(SR * 2))[:, None]
    y = y / np.max(np.abs(y)) * 0.89
    out = os.path.join(ST, 'assets', 'music', 'melodik_92bpm.wav')
    wavfile.write(out, SR, (y * 32767).astype(np.int16))
    print(out)


if __name__ == '__main__':
    main(float(sys.argv[1]) if len(sys.argv) > 1 else 32.0)
