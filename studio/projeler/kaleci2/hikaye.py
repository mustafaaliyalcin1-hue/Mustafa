#!/usr/bin/env python3
"""Kaleci Bölüm 2 (C şıkkının devamı) — tamamen motion graphics, robot anlatıcı (MBROLA tr1, ücretsiz/çevrimdışı).
Satırları seslendirir, sürelerine göre sahne zaman çizelgesini kurar → grafik/public/kaleci2/plan.json + anlatim.wav
"""
import json
import os
import subprocess
import sys

import numpy as np
from scipy.io import wavfile

ST = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
W = os.path.join(ST, 'temp', 'kaleci2'); os.makedirs(W, exist_ok=True)
PUB = os.path.join(ST, 'grafik', 'public', 'kaleci2'); os.makedirs(PUB, exist_ok=True)
SR = 48000
SES = 'mb-tr1'   # MBROLA Türkçe erkek; testte en anlaşılır (Whisper doğruluk %77, espeak %44)
HIZ = 145
BAS_BOSLUK = 0.6

# (sahne, seslendirilecek metin [okunuşa göre], altyazı metni, sonrasında ek süre)
SATIRLAR = [
    ('anket', 'Geçen bölümde size sorduk.', 'Geçen bölümde size sorduk.', 0.25),
    ('anket2', 'Ve çoğunuz ce şıkkını seçtiniz!', 'Ve çoğunuz C şıkkını seçtiniz!', 0.7),
    ('eldiven', 'Kaleci önce eldivenlerini çıkardı.', 'Kaleci önce eldivenlerini çıkardı.', 0.35),
    ('yuru', 'Ve takım arkadaşlarının üstüne yürüdü!', 'Ve takım arkadaşlarının üstüne yürüdü!', 0.3),
    ('toz', 'Bir anda sahada koca bir toz bulutu! Pat! Küt! Ortalık karıştı!',
     'Bir anda sahada koca bir toz bulutu! Pat! Küt! Ortalık karıştı!', 0.5),
    ('hakem', 'Ama hakem hemen düdüğünü çaldı.', 'Ama hakem hemen düdüğünü çaldı.', 0.3),
    ('kart', 'Ve kaleciye kırmızı kartı gösterdi!', 'Ve kaleciye kırmızı kartı gösterdi!', 0.8),
    ('bos', 'Kaleci oyundan atıldı. Kale bomboş kaldı!', 'Kaleci oyundan atıldı. Kale bomboş kaldı!', 0.6),
    ('hucum', 'Üstelik rakip takım, tam o anda hücuma kalktı!', 'Üstelik rakip takım, tam o anda hücuma kalktı!', 0.6),
    ('soru', 'Peki şimdi ne olmalı?', 'Peki şimdi ne olmalı?', 0.7),
    ('A', 'A şıkkı. Forvet, eldivenleri giyip kaleye geçsin.', 'A şıkkı: Forvet eldivenleri giyip kaleye geçsin.', 0.5),
    ('B', 'Be şıkkı. Kaleci özür dilesin, ve hakemden bir şans daha istesin.',
     'B şıkkı: Kaleci özür dilesin ve hakemden bir şans daha istesin.', 0.5),
    ('C', 'Ce şıkkı. Herkes kaleye koşsun, ve topu birlikte durdursun!',
     'C şıkkı: Herkes kaleye koşsun ve topu birlikte durdursun!', 0.7),
    ('son', 'Cevabınızı yorumlara yazın. Bir sonraki bölümde görüşürüz!',
     'Cevabınızı yorumlara yazın. Bir sonraki bölümde görüşürüz!', 1.2),
]
UNLU = set('aeıioöuüAEIİOÖUÜ')


def seslendir(metin, yol):
    subprocess.run(['espeak-ng', '-v', SES, '-s', str(HIZ), '-p', '48', '-w', yol + '.ham.wav', metin], check=True,
                   capture_output=True)
    # anlatıcı tınısı: 48 kHz, hafif parlaklık + sıkıştırma, baş/son sessizliği kırp
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', yol + '.ham.wav', '-af',
                    'aresample=48000,highpass=f=90,equalizer=f=3000:t=q:w=1.2:g=3,acompressor=threshold=-18dB:ratio=3:'
                    'attack=5:release=80,silenceremove=start_periods=1:start_threshold=-45dB,areverse,'
                    'silenceremove=start_periods=1:start_threshold=-45dB,areverse', '-ac', '1', yol], check=True)
    os.remove(yol + '.ham.wav')
    sr, y = wavfile.read(yol)
    return y.astype(np.float32) / 32768


def main():
    parcalar, t = [np.zeros(int(SR * BAS_BOSLUK))], BAS_BOSLUK
    sahneler, kelimeler = [], []
    for i, (ad, tts, alt, ek) in enumerate(SATIRLAR):
        y = seslendir(tts, os.path.join(W, f'satir_{i:02d}.wav'))
        d = len(y) / SR
        sahneler.append({'ad': ad, 'a': round(t, 3), 'konusma': round(d, 3), 'b': round(t + d + ek, 3)})
        # altyazı kelimeleri: satır süresine hece ağırlıklı dağıt
        kel = alt.split()
        agir = [max(1, sum(c in UNLU for c in k)) + 0.5 for k in kel]
        top = sum(agir); tt = t
        for k, a in zip(kel, agir):
            dd = d * a / top
            kelimeler.append({'k': k, 'a': round(tt, 3), 'b': round(tt + dd * 0.95, 3)}); tt += dd
        parcalar += [y, np.zeros(int(SR * ek))]
        t += d + ek
    ses = np.concatenate(parcalar)
    ses = ses / (np.max(np.abs(ses)) + 1e-9) * 0.9
    wavfile.write(os.path.join(W, 'anlatim.wav'), SR, (ses * 32767).astype(np.int16))
    plan = {'sure': round(t, 3), 'sahneler': {s['ad']: s for s in sahneler}, 'kelimeler': kelimeler,
            'siklar': [{'harf': 'A', 'yazi': 'Forvet eldivenleri giyip kaleye geçsin', 'ikon': '🧤'},
                       {'harf': 'B', 'yazi': 'Kaleci özür dilesin, bir şans daha istesin', 'ikon': '🙏'},
                       {'harf': 'C', 'yazi': 'Herkes kaleye koşsun, topu birlikte durdursun', 'ikon': '🏃'}]}
    json.dump(plan, open(os.path.join(PUB, 'plan.json'), 'w'), ensure_ascii=False, indent=1)
    for s in sahneler:
        print(f"  {s['a']:6.2f}–{s['b']:6.2f}  {s['ad']}")
    print(f'toplam {t:.2f} sn')


if __name__ == '__main__':
    main()
