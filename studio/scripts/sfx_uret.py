#!/usr/bin/env python3
"""SFX kütüphanesini sentezler (numpy/scipy) → assets/sfx/*.wav + assets/sfx/katalog.json
Her ses için: kategori, süre, 'tepe' (sesin vurgu anı: kesime hizalanacak nokta), açıklama.
Kullanım: python3 scripts/sfx_uret.py [--onizleme]   (--onizleme: tüm sesleri art arda dizen tek dosya)"""
import argparse
import json
import os
import sys

import numpy as np
from scipy import signal
from scipy.io import wavfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _ortak import SFX, bilgi, ffmpeg  # noqa: E402

SR = 48000
RNG = np.random.default_rng(2026)


def t_(d):
    return np.arange(int(SR * d)) / SR


def gurultu(d, renk='beyaz'):
    n = RNG.standard_normal(int(SR * d))
    if renk == 'pembe':
        b, a = [0.049922035, -0.095993537, 0.050612699, -0.004408786], [1, -2.494956002, 2.017265875, -0.522189400]
        n = signal.lfilter(b, a, n) * 4
    elif renk == 'kahve':
        n = np.cumsum(n); n = signal.lfilter([1, -1], [1, -0.995], n); n /= np.max(np.abs(n)) + 1e-9
    return n


def kayan_bant(x, merkez, genislik):
    """Zamanla değişen bant geçiren (STFT maskesi). merkez/genislik: her STFT karesi için Hz dizisi üreten fonksiyon."""
    f, tt, Z = signal.stft(x, SR, nperseg=1024, noverlap=768)
    for i, ti in enumerate(tt):
        c = merkez(ti); g = genislik(ti)
        Z[:, i] *= np.exp(-0.5 * ((np.log2(f + 1) - np.log2(c)) / max(g, 0.05)) ** 2)
    _, y = signal.istft(Z, SR, nperseg=1024, noverlap=768)
    return y[:len(x)]


def zarf(d, tepe, atak_us=2.0, bitis_us=2.0):
    """Asimetrik çan eğrisi zarfı; tepe = 0..1 oran."""
    t = np.linspace(0, 1, int(SR * d))
    a = np.where(t < tepe, (t / tepe) ** atak_us, ((1 - t) / (1 - tepe)) ** bitis_us)
    return np.nan_to_num(a)


def yanki(x, sure=0.8, miktar=0.25, parlak=4000):
    ir = gurultu(sure) * np.exp(-t_(sure) * 6 / sure)
    b, a = signal.butter(2, parlak / (SR / 2))
    ir = signal.lfilter(b, a, ir)
    ir /= np.sqrt(np.sum(ir ** 2)) + 1e-9
    y = signal.fftconvolve(x, ir)[:len(x) + int(SR * sure)]
    out = np.zeros(len(y)); out[:len(x)] = x
    return out + miktar * y


def lp(x, fc, o=4):
    b, a = signal.butter(o, min(fc, SR / 2 - 100) / (SR / 2)); return signal.lfilter(b, a, x)


def hp(x, fc, o=4):
    b, a = signal.butter(o, fc / (SR / 2), 'high'); return signal.lfilter(b, a, x)


def sweep(f0, f1, d, egri='log'):
    t = t_(d)
    if egri == 'log':
        f = f0 * (f1 / f0) ** (t / d)
    else:
        f = f0 + (f1 - f0) * (t / d)
    return np.sin(2 * np.pi * np.cumsum(f) / SR), f


def stereo(x, pan=None, genislik=0.0):
    """pan: -1..1 sabit ya da dizi (sol→sağ hareket)."""
    if pan is None:
        pan = np.zeros(len(x))
    pan = np.broadcast_to(pan, x.shape)
    L = x * np.cos((pan + 1) * np.pi / 4); R = x * np.sin((pan + 1) * np.pi / 4)
    if genislik:
        dly = int(SR * 0.012 * genislik)
        R = np.concatenate([np.zeros(dly), R[:-dly]]) if dly else R
    return np.stack([L, R], 1) * np.sqrt(2)


def bitir(x, tepe_db=-1.0):
    if x.ndim == 1:
        x = stereo(x)
    fade = min(len(x) // 4, int(SR * 0.01))
    x[-fade:] *= np.linspace(1, 0, fade)[:, None]
    x[:16] *= np.linspace(0, 1, 16)[:, None]
    return x / (np.max(np.abs(x)) + 1e-9) * 10 ** (tepe_db / 20)


# ---------------- sesler ----------------
def whoosh(d, f0, f1, bw, tepe, pan_hareket, sert=False, egri=2.0):
    n = gurultu(d, 'pembe')
    y = kayan_bant(n, lambda t: f0 * (f1 / f0) ** min(1, t / (d * tepe * 1.6)), lambda t: bw)
    env = zarf(d, tepe, egri, 1.6 if not sert else 3.5)
    y = y * env
    if sert:  # sert: gövde + doygunluk
        body, _ = sweep(180, 60, d)
        y = np.tanh(3 * (y / (np.max(np.abs(y)) + 1e-9)) + 0.5 * body * zarf(d, tepe, 4, 6))
    return stereo(y, np.linspace(-pan_hareket, pan_hareket, len(y)), 0.5), tepe * d


def swoosh(d, f0, f1, ton):
    n = gurultu(d)
    y = kayan_bant(n, lambda t: f0 * (f1 / f0) ** (t / d), lambda t: 0.35)
    env = zarf(d, 0.3, 1.5, 2.5)
    s, _ = sweep(f0 * 0.5, f1 * 0.5, d)
    y = y / (np.max(np.abs(y)) + 1e-9) + ton * s
    return stereo(y * env, np.linspace(0.6, -0.6, len(y)), 0.3), 0.3 * d


def pop(f0, f1, d, gur=0.0):
    s, _ = sweep(f0, f1, d, 'log')
    env = np.exp(-t_(d) * 6 / d) * np.minimum(1, t_(d) * SR / 30)
    y = s * env + gur * hp(gurultu(d), 2000) * np.exp(-t_(d) * 200)
    return y, 0.0


def click(tur):
    if tur == 'ui':
        d = 0.03; t = t_(d)
        y = np.sin(2 * np.pi * 3200 * t) * np.exp(-t * 400) + 0.4 * np.sin(2 * np.pi * 6400 * t) * np.exp(-t * 700)
    elif tur == 'mekanik':
        d = 0.08; t = t_(d)
        tr = hp(gurultu(d), 1500) * np.exp(-t * 250)
        y = tr + 0.6 * np.sin(2 * np.pi * 2200 * t) * np.exp(-t * 120) + 0.4 * np.sin(2 * np.pi * 4700 * t) * np.exp(-t * 180)
        k2 = int(SR * 0.035)
        y[k2:] += 0.5 * tr[:len(y) - k2]
    else:  # yumuşak klavye
        d = 0.06; t = t_(d)
        y = lp(gurultu(d), 3000) * np.exp(-t * 180) + 0.7 * np.sin(2 * np.pi * 820 * t) * np.exp(-t * 90)
    return y, 0.0


def impact(tur):
    if tur == 'hafif':
        d = 0.45; t = t_(d)
        y = np.sin(2 * np.pi * (180 + 200 * np.exp(-t * 40)) * t) * np.exp(-t * 14) + \
            0.5 * lp(gurultu(d), 5000) * np.exp(-t * 60)
        y = yanki(y, 0.4, 0.15)
    elif tur == 'orta':
        d = 0.9; t = t_(d)
        y = np.sin(2 * np.pi * np.cumsum(85 + 160 * np.exp(-t * 30)) / SR) * np.exp(-t * 7) + \
            1.1 * hp(lp(gurultu(d, 'pembe'), 4500), 250) * np.exp(-t * 22) + \
            0.4 * np.sin(2 * np.pi * 210 * t) * np.exp(-t * 20)  # trampet benzeri çıtırtı
        y = yanki(np.tanh(1.8 * y), 0.8, 0.3, 2500)
    else:  # derin sinematik
        d = 2.6; t = t_(d)
        sub = np.sin(2 * np.pi * np.cumsum(32 + 70 * np.exp(-t * 6)) / SR) * np.exp(-t * 1.4)
        rumble = lp(gurultu(d, 'kahve'), 180) * np.exp(-t * 1.8) * 1.5
        tr = lp(gurultu(d), 6000) * np.exp(-t * 35)
        metal = sum(np.sin(2 * np.pi * f * t) * np.exp(-t * dk) for f, dk in ((317, 4), (533, 5), (871, 7))) * 0.15
        y = np.tanh(2.2 * (sub + rumble)) + 0.7 * tr + metal
        y = yanki(y, 1.6, 0.35, 1800)
    return y, 0.0


def riser(tur):
    if tur == 'gurultu':
        d = 2.5; n = gurultu(d)
        y = kayan_bant(n, lambda t: 300 * (9000 / 300) ** (t / d), lambda t: 0.8)
        y *= (t_(d) / d) ** 2.2
        y = stereo(y, None, 0.8)
    else:  # tonal: yükselen akor + hızlanan tremolo
        d = 3.0; t = t_(d)
        y = 0
        for k, oran in enumerate((1, 1.5, 2, 3)):
            s, _ = sweep(110 * oran, 880 * oran, d)
            y = y + s / (k + 1)
        trem = 0.5 + 0.5 * np.sin(2 * np.pi * np.cumsum(2 + 22 * (t / d) ** 2) / SR)
        y = y * trem * (t / d) ** 1.8 + 0.06 * hp(gurultu(d), 4000) * (t / d) ** 3
        y = stereo(y, np.sin(t * 3) * 0.4, 0.4)
    return y, d  # tepe = sonu (vuruş anı)


def bass_drop():
    d = 2.0; t = t_(d)
    s, _ = sweep(140, 30, d, 'log')
    y = np.tanh(2.5 * s) * np.exp(-t * 0.9) + 0.6 * np.sin(2 * np.pi * np.cumsum(70 * (30 / 70) ** (t / d)) / SR) * np.exp(-t)
    y[:int(SR * 0.02)] += lp(gurultu(0.02), 2500) * 0.8
    return lp(y, 900), 0.0


def glitch():
    d = 0.7; y = np.zeros(int(SR * d)); i = 0
    while i < len(y):
        L = int(SR * RNG.uniform(0.012, 0.07))
        tur = RNG.integers(0, 4)
        tt = np.arange(L) / SR
        if tur == 0:
            seg = np.sign(np.sin(2 * np.pi * RNG.uniform(200, 3000) * tt))
        elif tur == 1:
            seg = np.round(RNG.standard_normal(L) * 3) / 3
        elif tur == 2:
            seg = np.zeros(L)
        else:
            c = np.sin(2 * np.pi * RNG.uniform(80, 400) * tt[:max(1, L // 6)])
            seg = np.resize(c, L)
        y[i:i + L] = seg[:len(y) - i] * RNG.uniform(0.4, 1); i += L
    y = np.round(y * 8) / 8  # bitcrush
    y = y[::2].repeat(2)[:len(y)]  # örnekleme düşür
    pan = np.repeat(RNG.uniform(-0.8, 0.8, len(y) // 2400 + 1), 2400)[:len(y)]
    return stereo(y, pan), 0.0


def shutter():
    d = 0.22; y = np.zeros(int(SR * d))
    for ofs, g in ((0.0, 1.0), (0.075, 0.75)):
        k = int(SR * ofs); L = int(SR * 0.05); t = np.arange(L) / SR
        c = hp(gurultu(0.05), 1200) * np.exp(-t * 160) + 0.5 * np.sin(2 * np.pi * 1700 * t) * np.exp(-t * 90) + \
            0.3 * np.sin(2 * np.pi * 3900 * t) * np.exp(-t * 200)
        y[k:k + L] += g * c
    y += 0.15 * lp(gurultu(d), 2500) * np.exp(-t_(d) * 25)
    return y, 0.0


KUTUPHANE = {
    # ad: (kategori, üretici, açıklama)
    'whoosh_yumusak': ('whoosh', lambda: whoosh(0.9, 250, 1400, 0.9, 0.55, 0.5), 'yumuşak, alçak, geniş hava'),
    'whoosh_sert': ('whoosh', lambda: whoosh(0.6, 500, 5000, 0.6, 0.65, 0.9, sert=True, egri=3.0), 'sert, dolgun, gövdeli'),
    'whoosh_kisa': ('whoosh', lambda: whoosh(0.25, 2000, 7000, 0.5, 0.6, 0.7, egri=1.5), 'kısa, tiz, hızlı'),
    'whoosh_uzun': ('whoosh', lambda: whoosh(1.8, 180, 3200, 1.0, 0.6, 1.0, egri=2.5), 'uzun, soldan sağa geçen'),
    'swoosh_ince': ('swoosh', lambda: swoosh(0.45, 6000, 900, 0.0), 'ince, havadan inen'),
    'swoosh_tonal': ('swoosh', lambda: swoosh(0.55, 1200, 4000, 0.35), 'tonal, yükselen ıslık'),
    'pop_balon': ('pop', lambda: pop(900, 280, 0.09), 'balon/baloncuk pop'),
    'pop_tiz': ('pop', lambda: pop(1800, 700, 0.06, 0.3), 'tiz, parlak pop'),
    'pop_agiz': ('pop', lambda: pop(420, 110, 0.14, 0.5), 'alçak ağız pop'),
    'click_ui': ('click', lambda: click('ui'), 'arayüz tık (tonal)'),
    'click_mekanik': ('click', lambda: click('mekanik'), 'mekanik çift tık'),
    'click_yumusak': ('click', lambda: click('yumusak'), 'yumuşak tuş'),
    'impact_hafif': ('impact', lambda: impact('hafif'), 'hafif vuruş'),
    'impact_orta': ('impact', lambda: impact('orta'), 'orta vuruş, yankılı'),
    'impact_derin': ('impact', lambda: impact('derin'), 'derin sinematik boom'),
    'riser_gurultu': ('riser', lambda: riser('gurultu'), 'beyaz gürültü riser 2.5 sn'),
    'riser_tonal': ('riser', lambda: riser('tonal'), 'tonal riser 3 sn'),
    'bass_drop': ('drop', bass_drop, 'bass drop'),
    'glitch': ('glitch', glitch, 'dijital glitch'),
    'shutter': ('shutter', shutter, 'fotoğraf makinesi deklanşör'),
}


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--onizleme', action='store_true')
    a = ap.parse_args()
    os.makedirs(SFX, exist_ok=True)
    katalog = []
    for ad, (kat, fn, acik) in KUTUPHANE.items():
        y, tepe = fn()
        y = bitir(np.asarray(y, dtype=np.float64))
        p = os.path.join(SFX, ad + '.wav')
        wavfile.write(p, SR, (y * 32767).astype(np.int16))
        katalog.append({'ad': ad, 'dosya': ad + '.wav', 'kategori': kat, 'sure': round(len(y) / SR, 3),
                        'tepe': round(float(tepe), 3), 'aciklama': acik, 'kaynak': 'sentez'})
        bilgi(f'SFX: {ad:16s} {kat:8s} {len(y) / SR:.2f} sn')
    with open(os.path.join(SFX, 'katalog.json'), 'w', encoding='utf-8') as f:
        json.dump(katalog, f, ensure_ascii=False, indent=1)
    if a.onizleme:
        lst = os.path.join(SFX, '..', '..', 'temp', 'sfx_liste.txt')
        ins = []
        for k in katalog:
            ins += ['-i', os.path.join(SFX, k['dosya'])]
        n = len(katalog)
        fc = ''.join(f'[{i}]apad=pad_dur=0.6[p{i}];' for i in range(n)) + ''.join(f'[p{i}]' for i in range(n)) + \
            f'concat=n={n}:v=0:a=1[a]'
        ffmpeg(ins + ['-filter_complex', fc, '-map', '[a]', os.path.join(SFX, '..', '..', 'temp', 'sfx_onizleme.wav')])


if __name__ == '__main__':
    main()
