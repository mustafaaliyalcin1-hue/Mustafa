#!/usr/bin/env python3
"""Komut videosu 3 — videoda söylenen komutların harfi harfine uygulanması.
Adımlar: kesim (uzun sessizlikler) → kelimeleri ve tüm efekt zamanlarını kesik zamana taşı → grafik/public/komut3/plan.json
Efekt zamanları HAM video saniyesiyle yazılır (söylendiği an), burada kesik zamana çevrilir.
"""
import json
import os
import shutil
import sys

ST = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(ST, 'scripts'))
from _ortak import ffmpeg  # noqa: E402

W = os.path.join(ST, 'temp', 'komut3')
PUB = os.path.join(ST, 'grafik', 'public', 'komut3')
NORM = os.path.join(W, 'norm.mp4')
SURE = 63.62
AT = [(1.45, 2.10), (9.60, 11.65), (16.90, 17.45), (32.33, 32.70), (36.40, 36.82), (40.73, 41.15), (51.70, 52.22),
      (63.55, SURE)]
TUT = []
_t = 0.0
for a, b in AT:
    if a > _t:
        TUT.append((_t, a))
    _t = b
if _t < SURE:
    TUT.append((_t, SURE))

# yazım düzeltmeleri (sesin söylediği; model yanlış yazdı) — kelime kelime
DUZELT = {'Şurayı': 'Bunu', 'cloud': 'Claude', 'cloud,': 'Claude,', 'edildi': 'editledi.', "'um": None,
          'Turun': 'Turuncu', 'cürenkte.': 'renkte.', 'ohar': 'o her', 'tepetakların': "Tepetaklak'ın",
          'geliştiricisi': 'geliştiricisi,', 'Meminden': 'Hemen', 'Sağolu.': 'Sağ ol.', 'kameramanı': 'kameraman',
          'Kulot.': 'Claude.', 'Kulot': 'Claude', 'edipler': 'editler', 'planla': 'plana', 'ziyah': 'siyah',
          'Baray.': 'Bay bay.', 'şansı': 'şansı', 'dedi.': None}

# kameramanın elindeki kameranın konumu (ham sn, x, y: orijinal dikey karede 0–1) — karelerden ölçüldü
KAMERA = [
    [(0.0, .74, .50), (0.4, .80, .48), (0.8, .65, .43), (1.2, .65, .52), (1.6, .66, .50), (2.0, .87, .53), (2.3, .95, .53)],
    [(12.9, .38, .49), (13.5, .24, .50), (14.0, .24, .50), (14.5, .23, .60), (15.0, .30, .60), (15.5, .29, .60),
     (16.0, .26, .62), (16.5, .12, .59), (16.8, .05, .59)],
    [(30.35, .38, .60), (31.0, .43, .60), (31.5, .37, .60), (32.0, .68, .62), (32.3, .80, .62)],
]


def esle(t):
    c = 0.0
    for a, b in TUT:
        if t < a:
            return c
        if t <= b:
            return c + t - a
        c += b - a
    return c


def tekil(noktalar):
    """kesik zamanda kesin artan noktalar (kesilen aralığa düşenler aynı zamana eşlenir → at)"""
    out = []
    for n in noktalar:
        if not out or n[0] > out[-1][0] + 1e-3:
            out.append(n)
    return out


def kx(x):  # orijinal 3:4 kareden 9:16 kırpılmış kareye
    return round((x * 360 - 45) / 270, 3)


def main():
    fc, z = [], ''
    for i, (a, b) in enumerate(TUT):
        fc.append(f'[0:v]trim={a:.3f}:{b:.3f},setpts=PTS-STARTPTS[v{i}]')
        fc.append(f'[0:a]atrim={a:.3f}:{b:.3f},asetpts=PTS-STARTPTS,afade=t=in:d=0.012,'
                  f'afade=t=out:st={max(0, b - a - 0.015):.3f}:d=0.015[a{i}]')
        z += f'[v{i}][a{i}]'
    fc.append(f'{z}concat=n={len(TUT)}:v=1:a=1[vc][a]')
    fc.append('[vc]fps=30,format=yuv420p[v]')
    kes = os.path.join(W, 'kesik.mp4')
    ffmpeg(['-i', NORM, '-filter_complex', ';'.join(fc), '-map', '[v]', '-map', '[a]', '-c:v', 'libx264', '-preset',
            'fast', '-crf', '15', '-c:a', 'aac', '-b:a', '192k', kes])
    sure = sum(b - a for a, b in TUT)

    kel = []
    for s in json.load(open(os.path.join(W, 'transkript.json'), encoding='utf-8')):
        for w in s['w']:
            k = DUZELT.get(w['k'], w['k'])
            if w['k'] == "'um" and kel:  # "ben cloud 'um" → "Claude'um"
                kel[-1]['k'] = "Claude'um"; kel[-1]['b'] = round(esle(w['b']), 3); continue
            if k is None:
                continue
            a, b = esle(w['a']), esle(w['b'])
            if b - a < 0.05:
                continue
            for j, parca in enumerate(k.split(' ')):  # "o her" gibi ikiye bölünenler
                n = len(k.split(' '))
                kel.append({'k': parca, 'a': round(a + (b - a) * j / n, 3), 'b': round(a + (b - a) * (j + 1) / n, 3)})

    for i in range(len(kel) - 1):  # "şu anda sonra" → "şu andan sonra"
        if kel[i]['k'] == 'anda' and kel[i + 1]['k'] == 'sonra.':
            kel[i]['k'] = 'andan'
    E = esle
    plan = {
        'sure': round(sure, 3), 'kelimeler': kel,
        'baslik': {'a': 0.0, 'b': E(1.42), 'yazi': ['BUNU BEN DEĞİL,', "CLAUDE EDİTLEDİ"]},
        # "şuraya, evet oraya, ben Claude'um yazar mısın?" → perdede, parmağın gösterdiği yer; "turuncu renkte" → turuncu
        'benClaude': {'a': E(7.20), 'b': E(9.58), 'turuncu': E(8.04), 'x': kx(0.40), 'y': 0.50},
        'kameraman': [tekil([[round(E(t), 3), kx(x), y] for t, x, y in seg]) for seg in KAMERA],
        # "Merhaba, ben Tepetaklak'ın geliştiricisi, şuraya yaz" → gösterilen sol üst
        'merhaba': {'a': E(23.90), 'b': E(27.40)},
        # "şuraya yaptığım her şeyi yazar mısın?" → yukarıya liste
        'liste': {'a': E(27.76), 'b': E(32.30), 'maddeler': ['Tepetaklak Rampa', 'Konuşan Baykuş', 'VAR Odası',
                                                             'Tepetaklak Minecraft Eklentisi', 'TÜBİTAK Projesi']},
        # renk zaman çizelgesi (kesik zaman): her biri [başlangıç, ad]
        'renk': [
            [E(46.84), 'sinematik'], [E(47.40), 'sicak'], [E(47.95), 'soguk'], [E(48.50), 'vintage'],
            [E(49.05), 'sepya'], [E(49.60), 'retro'], [E(50.16), 'normal'],
            [E(50.90), 'sicaklik'],                       # "rengi biraz sıcaklaştır"
            [E(53.26), 'filtre'], [E(53.72), 'efekt'],     # "biraz filtre koy, efekt koy"
            [E(54.40), 'siyahbeyaz'],                      # "çok siyah beyaz oldu"
            [E(56.30), 'duzelt'],                          # "olmaz" → düzelt ("şimdi güzel oldu")
            [E(61.40), 'canli'],                           # "biraz daha canlı tonlar güzel oldu"
        ],
        'muzik': E(44.70),                                 # "müzik koy şu andan sonra"
    }
    os.makedirs(PUB, exist_ok=True)
    json.dump(plan, open(os.path.join(PUB, 'plan.json'), 'w'), ensure_ascii=False, indent=1)
    shutil.copy(kes, os.path.join(PUB, 'kesik.mp4'))
    print(f'{len(TUT)} parça, {SURE - sure:.2f} sn atıldı → {sure:.2f} sn; {len(kel)} kelime')
    print(' '.join(w['k'] for w in kel))


if __name__ == '__main__':
    main()
