#!/usr/bin/env python3
"""Kaleci sorusu videosu — kesim + kelime/olay zamanları → grafik/public/kaleci/plan.json
Konuşmadaki komutlar: "ekranda ben değil motion graphics gelsin" → tam ekran halı saha animasyonu (sesi anlatıcı);
"en zorları tuttunuz, örnek animasyon koy" → çatal/90 kurtarışları; "çok kolay bir şut yediniz" → yavaş şut gol;
"takım söylenmeye başladı" → takım arkadaşları; "ne yaparsınız" → soru; A/B/C şıkları → kartlar.
"""
import json
import os
import shutil
import sys

ST = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(ST, 'scripts'))
import kk_sessizlik as k  # noqa: E402
from _ortak import ffmpeg  # noqa: E402

HAM = os.path.join(ST, 'input', 'kaleci_ham.MOV')
W = os.path.join(ST, 'temp', 'kaleci'); os.makedirs(W, exist_ok=True)
PUB = os.path.join(ST, 'grafik', 'public', 'kaleci'); os.makedirs(PUB, exist_ok=True)
NORM = os.path.join(W, 'norm.mp4')
# animasyonun nefes alması için konuşma sonrasına ek süre (ham sn → ek)
EK = {27.24: 0.9, 33.22: 0.6, 56.14: 1.2, 24.28: 0.4}

ZAMANLI = {('da', 3.64): None, ('mu', 7.68): None}  # yalnız bu anlardaki kelime (aynı kelime başka yerde doğru)
DUZELT = {'iletiklemiyorum.': 'editlemiyorum.', 'kulağı': 'Claude', 'iletikliyorum.': 'editliyor.',
          'soru': 'sorum', 'var?': 'var.', 'ikramda': 'ekranda', 'karıcısınız.': 'kalecisiniz.',
          'zorlukları': 'zorları', 'örnekleme': 'örnek', 'tatımı': 'takım', 'söylemeye': 'söylenmeye',
          'dövüşürmüşsünüz.': 'dövüşür müsünüz?', 'hoşçakalın.': 'Hoşça kalın.'}
GIZLE = (14.30, 16.10)  # "ve işte bu zamanın altı" — anlaşılmıyor, altyazıda gösterme


def main():
    if not os.path.exists(NORM):
        ffmpeg(['-i', HAM, '-vf', 'crop=ih*9/16:ih:(iw-ih*9/16)/2:0,scale=1080:1920:flags=lanczos,unsharp=5:5:0.5,'
                'eq=contrast=1.05:saturation=1.08,colortemperature=temperature=5900:mix=0.4,fps=30,format=yuv420p',
                '-af', 'highpass=f=80,afftdn=nf=-30,aresample=48000', '-c:v', 'libx264', '-preset', 'fast', '-crf', '16',
                '-c:a', 'aac', '-b:a', '192k', NORM])
    y = k.ses_oku(NORM)
    bol, _, _ = k.konusma_bolgeleri(y, min_bosluk=0.3, min_konusma=0.08)
    seg = []
    for a, b in bol:
        a, b = max(0, a - 0.08), b + 0.12
        for t, e in EK.items():
            if a - 0.3 <= t <= b + 0.3:
                b = max(b, t + e)
        if seg and a <= seg[-1][1] + 0.05:
            seg[-1][1] = max(seg[-1][1], b)
        else:
            seg.append([a, b])
    D = float(os.popen(f'ffprobe -v error -show_entries format=duration -of csv=p=0 "{NORM}"').read())
    seg = [[a, min(b, D)] for a, b in seg if a < D]
    fc, zin, zaman, c = [], '', [], 0.0
    for i, (a, b) in enumerate(seg):
        fc.append(f'[0:v]trim={a:.3f}:{b:.3f},setpts=PTS-STARTPTS[v{i}]')
        fc.append(f'[0:a]atrim={a:.3f}:{b:.3f},asetpts=PTS-STARTPTS,afade=t=in:d=0.01,'
                  f'afade=t=out:st={max(0, b - a - 0.012):.3f}:d=0.012[a{i}]')
        zin += f'[v{i}][a{i}]'
        zaman.append((a, b, c)); c += b - a
    fc.append(f'{zin}concat=n={len(seg)}:v=1:a=1[vc][a]')
    fc.append('[vc]fps=30,format=yuv420p[v]')
    kes = os.path.join(W, 'kesik.mp4')
    ffmpeg(['-i', NORM, '-filter_complex', ';'.join(fc), '-map', '[v]', '-map', '[a]', '-c:v', 'libx264', '-preset', 'fast',
            '-crf', '15', '-c:a', 'aac', '-b:a', '192k', kes])

    def E(t):
        a, b, cc = min(zaman, key=lambda z: 0 if z[0] <= t <= z[1] else min(abs(t - z[0]), abs(t - z[1])))
        return round(cc + min(max(t - a, 0), b - a), 3)

    kel = []
    for s in json.load(open(os.path.join(W, 'transkript.json'), encoding='utf-8')):
        for w in s['w']:
            if GIZLE[0] <= w['a'] <= GIZLE[1]:
                continue
            kk = DUZELT.get(w['k'], w['k'])
            if any(w['k'] == z[0] and abs(w['a'] - z[1]) < 0.05 for z in ZAMANLI):
                kk = None
            if kk is None:
                continue
            a, b = E(w['a']), E(w['b'])
            parca = kk.split(' ')
            for j, p in enumerate(parca):
                kel.append({'k': p, 'a': round(a + (b - a) * j / len(parca), 3), 'b': round(a + (b - a) * (j + 1) / len(parca), 3)})
    sure = round(c, 3)
    plan = {
        'sure': sure, 'kelimeler': kel,
        'editRozet': [E(1.78), E(4.22)],
        'mgBas': E(13.68), 'mgSon': E(33.22) + 0.35,          # "motion graphics gelsin" … "ne yaparsınız?"
        'kaleciGir': E(18.52),                                 # "diyelim bir kalecisiniz"
        'kurtaris': [E(20.86), E(22.10), E(23.30)],            # "en zorları tuttunuz" — 3 zor şut
        'kolayGol': E(25.20),                                  # "ama çok kolay bir şut yediniz"
        'takim': E(28.82),                                     # "tüm takım size söylenmeye başladı"
        'soru': E(31.80),                                      # "ne yaparsınız?"
        'siklar': [{'t': E(35.10), 'harf': 'A', 'yazi': '“Daha ne yapayım? Defans yok mu?”'},
                   {'t': E(45.36), 'harf': 'B', 'yazi': '“Tamam da, abartmayın.”'},
                   {'t': E(51.02), 'harf': 'C', 'yazi': 'Kavgaya girip dövüşürsünüz'}],
        'son': E(55.32),
    }
    json.dump(plan, open(os.path.join(PUB, 'plan.json'), 'w'), ensure_ascii=False, indent=1)
    shutil.copy(kes, os.path.join(PUB, 'kesik.mp4'))
    print(f'{len(seg)} parça, {D - sure:.2f} sn atıldı → {sure:.2f} sn')
    print({kk: v for kk, v in plan.items() if kk not in ('kelimeler',)})
    print(' '.join(w['k'] for w in kel))


if __name__ == '__main__':
    main()
