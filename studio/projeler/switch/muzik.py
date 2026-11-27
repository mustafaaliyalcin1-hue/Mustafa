#!/usr/bin/env python3
"""Switch edit demo müziği: 125 BPM phonk tarzı (telifsiz, projeye ait sentez).
2 ölçü filtreli giriş → drop: kayan 808, çan (cowbell) melodisi, 16'lık hi-hat (yer yer üçleme), clap.
Çıktı: assets/music/phonk_125bpm.wav"""
import os
import sys

import numpy as np
from scipy import signal
from scipy.io import wavfile

ST = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SR = 48000
BPM = 125
V = 60 / BPM
rng = np.random.default_rng(9)


def ekle(d, y, t):
    i = int(t * SR)
    if i < len(d):
        d[i:i + len(y)] += y[:len(d) - i]


def kick():
    t = np.arange(int(SR * 0.35)) / SR
    return np.tanh(2.2 * np.sin(2 * np.pi * np.cumsum(48 + 110 * np.exp(-t * 35)) / SR) * np.exp(-t * 7))


def clap():
    t = np.arange(int(SR * 0.25)) / SR
    n = rng.standard_normal(len(t))
    zarf = sum(np.exp(-np.clip(t - o, 0, None) * 60) * (t >= o) for o in (0, 0.011, 0.022)) + 0.5 * np.exp(-t * 18)
    return signal.lfilter(*signal.butter(2, [900 / (SR / 2), 6000 / (SR / 2)], 'band'), n) * zarf * 0.8


def hat(acik=False):
    L = int(SR * (0.12 if acik else 0.04)); t = np.arange(L) / SR
    return signal.lfilter(*signal.butter(2, 7000 / (SR / 2), 'high'), rng.standard_normal(L)) * np.exp(-t * (25 if acik else 90)) * 0.35


def can(f, d=0.22):
    """phonk çanı: iki uyumsuz kare dalga + bant filtre, hızlı sönüm"""
    t = np.arange(int(SR * d)) / SR
    y = signal.square(2 * np.pi * f * t) + signal.square(2 * np.pi * f * 1.48 * t)
    y = signal.lfilter(*signal.butter(2, [f * 0.8 / (SR / 2), min(0.99, f * 4 / (SR / 2))], 'band'), y)
    return y * np.exp(-t * 14) * 0.5


def bas808(f0, f1, d):
    t = np.arange(int(SR * d)) / SR
    f = f0 * (f1 / f0) ** np.clip(t / 0.12, 0, 1)
    y = np.sin(2 * np.pi * np.cumsum(f) / SR)
    return np.tanh(3 * y) * np.minimum(1, t / 0.005) * np.exp(-t * 1.6) * 0.8


def main(sure=14.0):
    n = int(SR * sure)
    m = np.zeros(n); dr = np.zeros(n)
    drop = 8 * V  # 2 ölçü giriş
    nota = {'F#': 92.5, 'A': 110.0, 'C#': 138.6, 'E': 82.4, 'D': 73.4}
    bas_desen = [('F#', 0), ('F#', 1.5), ('A', 2.5), ('E', 3.0), ('D', 3.5)]
    can_desen = [(740, 0), (740, 0.5), (880, 1), (740, 1.5), (988, 2), (880, 2.75), (740, 3.25), (659, 3.5)]
    olcu = 4 * V
    i = 0
    while i * olcu < sure:
        t0 = i * olcu
        for f, b in can_desen:
            ekle(m, can(f), t0 + b * V)
        if t0 >= drop:
            for ad, b in bas_desen:
                ekle(m, bas808(nota[ad] * 2, nota[ad], V * 1.4), t0 + b * V)
            for b in (0, 1.5, 2.5):
                ekle(dr, kick(), t0 + b * V)
            for b in (1, 3):
                ekle(dr, clap(), t0 + b * V)
            for k in range(16):
                if i % 2 == 1 and k >= 12:  # ölçü sonunda üçleme hat
                    for u in range(3):
                        ekle(dr, hat(), t0 + (12 + (k - 12)) * V / 4 + u * V / 12)
                else:
                    ekle(dr, hat(acik=(k % 8 == 6)), t0 + k * V / 4)
        else:  # giriş: sadece çan, alçak geçiren filtre açılıyor (ekleme sonrası)
            pass
        i += 1
    # giriş filtresi: drop'a kadar kapalı → açılır
    gir = int(drop * SR)
    m[:gir] = signal.lfilter(*signal.butter(2, 900 / (SR / 2)), m[:gir]) * np.linspace(0.4, 1, gir)
    # riser + drop vuruşu
    t = np.arange(int(SR * 2 * V)) / SR
    riser = signal.lfilter(*signal.butter(2, 3000 / (SR / 2), 'high'), rng.standard_normal(len(t))) * (t / t[-1]) ** 2 * 0.25
    ekle(m, riser, drop - 2 * V)
    ekle(dr, kick() * 1.3, drop)
    y = m * 0.8 + dr * 0.9
    st = np.stack([y, np.roll(y, 200) * 0.98], 1)
    st[-int(SR * 1.0):] *= np.linspace(1, 0, int(SR * 1.0))[:, None]
    st = st / np.max(np.abs(st)) * 0.9
    out = os.path.join(ST, 'assets', 'music', 'phonk_125bpm.wav')
    wavfile.write(out, SR, (st * 32767).astype(np.int16))
    print(out, f'drop @ {drop:.2f} sn')


if __name__ == '__main__':
    main(float(sys.argv[1]) if len(sys.argv) > 1 else 14.0)
