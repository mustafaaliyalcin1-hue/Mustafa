#!/usr/bin/env python3
"""Eldiven videosu — 1. adım: boşluk + tekrar kesimi, kesimlerde punch-in, kelimeleri yeni zamana taşı.
Girdi: temp/eldiven/norm.mp4 (döndürülmüş, 9:16, 1080x1920), temp/eldiven_transkript.json (faster-whisper small)
Çıktı: temp/eldiven/kesik.mp4, temp/eldiven/kelimeler.json (kesik zamanında, düzeltilmiş yazım)
"""
import json
import os
import sys

ST = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(ST, 'scripts'))
import kk_sessizlik as k  # noqa: E402
from _ortak import ffmpeg  # noqa: E402

W = os.path.join(ST, 'temp', 'eldiven')
NORM = os.path.join(W, 'norm.mp4')
AT = [(7.40, 8.74)]          # "steril eldivenin," ilk tekrarı + duraklama
PAY = (0.05, 0.07)           # konuşma öncesi / sonrası pay

# whisper yazım düzeltmeleri (sesin söylediği, modelin yanlış yazdığı)
DUZELT = {'dediği': 'editledi"', 'bırıp': 'bölüp', 'sonuna': 'soluna', 'sahneler': 'sağına', 'strel': 'steril',
          'bloz': 'bile', 'olmasıyla': 'olmasın', 'altınlının': 'altının', 'grafini': 'grafiğini',
          'kloat.': 'Claude.', 'ekranın': 'ekranı', 'bunu': '"bunu'}


def main():
    y = k.ses_oku(NORM)
    bol, _, _ = k.konusma_bolgeleri(y, min_bosluk=0.12, min_konusma=0.06)
    seg = []
    for a, b in bol:
        a, b = max(0, a - PAY[0]), b + PAY[1]
        for x, z in AT:  # atılacak aralıkları çıkar
            if a < x < b:
                seg.append([a, x]); a = max(z, a)
            if a < z <= b and a >= x:
                a = z
        if b - a > 0.05:
            if seg and a - seg[-1][1] < 0.03:
                seg[-1][1] = b
            else:
                seg.append([a, b])
    seg = [s for s in seg if s[1] - s[0] > 0.05]
    # punch-in: kesimlerde dönüşümlü geniş / %4-8 yakın (yüz bölgesine)
    zooms = [1.0 if i % 2 == 0 else (1.06, 1.08, 1.05, 1.07)[i // 2 % 4] for i in range(len(seg))]
    fc, zin, zaman, t = [], '', [], 0.0
    for i, ((a, b), z) in enumerate(zip(seg, zooms)):
        cw, ch = int(1080 / z) // 2 * 2, int(1920 / z) // 2 * 2
        x, yy = (1080 - cw) // 2, int((1920 - ch) * 0.35)
        fc.append(f'[0:v]trim={a:.3f}:{b:.3f},setpts=PTS-STARTPTS,crop={cw}:{ch}:{x}:{yy},scale=1080:1920:flags=lanczos[v{i}]')
        fc.append(f'[0:a]atrim={a:.3f}:{b:.3f},asetpts=PTS-STARTPTS,afade=t=in:d=0.01,'
                  f'afade=t=out:st={max(0, b - a - 0.012):.3f}:d=0.012[a{i}]')
        zin += f'[v{i}][a{i}]'
        zaman.append((a, b, t, z)); t += b - a
    fc.append(f'{zin}concat=n={len(seg)}:v=1:a=1[vc][a]')
    fc.append('[vc]fps=30,format=yuv420p[v]')
    out = os.path.join(W, 'kesik.mp4')
    ffmpeg(['-i', NORM, '-filter_complex', ';'.join(fc), '-map', '[v]', '-map', '[a]', '-c:v', 'libx264', '-preset',
            'fast', '-crf', '15', '-c:a', 'aac', '-b:a', '192k', out])

    def esle(tt):
        # en yakın tutulan parçaya oturt (whisper sınırları konuşmanın biraz dışına taşabilir)
        a, b, c, _ = min(zaman, key=lambda z: 0 if z[0] <= tt <= z[1] else min(abs(tt - z[0]), abs(tt - z[1])))
        if min(abs(tt - a), abs(tt - b)) > 0.6 and not (a <= tt <= b):
            return None
        return c + min(max(tt - a, 0), b - a)
    kel = []
    for s in json.load(open(os.path.join(ST, 'temp', 'eldiven_transkript.json'), encoding='utf-8')):
        for w in s['w']:
            if any(x <= (w['a'] + w['b']) / 2 <= z for x, z in AT):
                continue  # atılan tekrar
            a, b = esle(w['a'] + 0.02), esle(w['b'] - 0.02)
            if a is None or b is None:
                continue
            kel.append({'k': DUZELT.get(w['k'], w['k']), 'a': round(a, 3), 'b': round(max(b, a + 0.08), 3),
                        'kaynak': round(w['a'], 2)})
    json.dump({'kelimeler': kel, 'kesimler': [[round(c, 3), z] for _, _, c, z in zaman], 'sure': round(t, 3)},
              open(os.path.join(W, 'kelimeler.json'), 'w'), ensure_ascii=False, indent=1)
    print(f'{len(seg)} parça, {30.3 - t:.2f} sn atıldı → {t:.2f} sn; {len(kel)} kelime')


if __name__ == '__main__':
    main()
