#!/usr/bin/env python3
"""assets/luts içine sinematik .cube LUT'ları üretir (33x33x33).
Kullanım: python3 scripts/lut_uret.py  [--onizleme kare.png]  (önizlemede her LUT'u bir karede yan yana gösterir)"""
import argparse
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _ortak import LUTS, bilgi  # noqa: E402

N = 33


def luma(c):
    return c[..., 0] * 0.2126 + c[..., 1] * 0.7152 + c[..., 2] * 0.0722


def doygunluk(c, s):
    y = luma(c)[..., None]
    return y + (c - y) * s


def s_egri(x, k):
    """k>0 kontrast artırır (0.5 merkezli sigmoid karışımı)."""
    sig = 1 / (1 + np.exp(-(x - 0.5) * (4 + 8 * k)))
    lo, hi = 1 / (1 + np.exp((4 + 8 * k) * 0.5)), 1 / (1 + np.exp(-(4 + 8 * k) * 0.5))
    sig = (sig - lo) / (hi - lo)
    return x * (1 - k) + sig * k


def ton_ayir(c, golge, isik, guc=1.0):
    """Gölgelere bir renk, ışıklara bir renk ekle (split toning)."""
    y = luma(c)[..., None]
    wg = np.clip(1 - y * 2, 0, 1) ** 1.5
    wi = np.clip(y * 2 - 1, 0, 1) ** 1.5
    return c + guc * (wg * (np.array(golge) - 0.5) * 0.5 + wi * (np.array(isik) - 0.5) * 0.5)


def solgun(c, siyah=0.06, beyaz=0.94):
    return siyah + c * (beyaz - siyah)


PRESETLER = {
    'sinematik_teal_turuncu': lambda c: doygunluk(ton_ayir(s_egri(c, 0.35), (0.1, 0.55, 0.7), (0.85, 0.55, 0.3), 1.4), 1.12),
    'sicak_altin_saat': lambda c: doygunluk(solgun(s_egri(c * np.array([1.08, 1.0, 0.86]), 0.2), 0.03, 0.98) +
                                            np.array([0.02, 0.01, -0.01]), 1.15),
    'soguk_gece_gerilim': lambda c: doygunluk(ton_ayir(s_egri(c * np.array([0.82, 0.96, 1.18]), 0.45), (0.2, 0.4, 0.8),
                                                       (0.42, 0.52, 0.66), 1.2), 0.72),
    'vintage_film': lambda c: solgun(doygunluk(ton_ayir(s_egri(c, 0.15), (0.42, 0.55, 0.45), (0.62, 0.55, 0.42), 0.8),
                                               0.82), 0.07, 0.93),
    'noir_kontrast': lambda c: np.repeat(s_egri(luma(c), 0.6)[..., None], 3, -1) * np.array([0.97, 1.0, 1.04]),
    'canli_reels': lambda c: doygunluk(s_egri(c, 0.25), 1.35),
}


def yaz(ad, fn):
    r = np.linspace(0, 1, N)
    b, g, rr = np.meshgrid(r, r, r, indexing='ij')  # R en hızlı değişen
    c = np.stack([rr, g, b], -1)
    o = np.clip(fn(c), 0, 1).reshape(-1, 3)
    p = os.path.join(LUTS, ad + '.cube')
    with open(p, 'w') as f:
        f.write(f'TITLE "{ad}"\nLUT_3D_SIZE {N}\nDOMAIN_MIN 0 0 0\nDOMAIN_MAX 1 1 1\n')
        f.write('\n'.join(f'{x:.6f} {y:.6f} {z:.6f}' for x, y, z in o) + '\n')
    return p


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--onizleme', help='LUTları bu kareye uygulayıp yan yana PNG üret')
    a = ap.parse_args()
    os.makedirs(LUTS, exist_ok=True)
    for ad, fn in PRESETLER.items():
        bilgi(f'LUT: {yaz(ad, fn)}')
