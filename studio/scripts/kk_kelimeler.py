#!/usr/bin/env python3
"""Kelime bazlı zaman damgaları (Türkçe).

  kk_kelimeler.py video.mp4                         # faster-whisper (model gerekir) -> <video>.kelimeler.json
  kk_kelimeler.py video.mp4 --metin "..."           # model yoksa: verilen metni konuşma bölgelerine hizala
  kk_kelimeler.py video.mp4 --metin-dosya metin.txt --whisper-json words.json   # ghost-editor/whisper biçimi de yaz
Hizalama: konuşma bölgeleri (kk_sessizlik) cümle sınırlarına eşlenir, her bölgedeki kelimeler hece (ünlü) sayısına
göre dağıtılır. Whisper kadar kesin değildir (±0.15 sn) ama altyazı ve grafik zamanlaması için yeterlidir.
Model yoksa ve metin verilmediyse çıkış kodu 3 + "kelime listesi gerekli" uyarısı.
"""
import argparse
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _ortak import bilgi, probe  # noqa: E402

UNLU = set('aeıioöuüAEIİOÖUÜâîû')


def hece(k):
    return max(1, sum(1 for c in k if c in UNLU))


def whisper_dene(path, model='small'):
    try:
        from altyazi import whisper_kelimeler
    except Exception as e:  # noqa: BLE001
        return None, str(e)
    kel, err = whisper_kelimeler(path, model)
    return ([{'k': w, 'a': round(a, 3), 'b': round(b, 3)} for a, b, w in kel] if kel else None), err


def hizala(path, metin):
    from kk_sessizlik import konusma_bolgeleri, ses_oku
    y = ses_oku(path)
    cumleler = [c.strip() for c in re.split(r'(?<=[.!?…])\s+', metin.strip()) if c.strip()]
    # cümle sayısına en yakın bölge sayısını veren boşluk eşiğini ara
    en_iyi = None
    for mb in (0.22, 0.3, 0.4, 0.5, 0.65, 0.8):
        b, _, _ = konusma_bolgeleri(y, mb)
        skor = abs(len(b) - len(cumleler))
        if en_iyi is None or skor < en_iyi[0]:
            en_iyi = (skor, b)
    bolgeler = en_iyi[1]
    if not bolgeler:
        return []
    # bölge sayısı ≠ cümle sayısı ise: tüm konuşmayı tek akış sayıp hece oranıyla dağıt
    if len(bolgeler) != len(cumleler):
        parcalar = [(bolgeler, ' '.join(cumleler))]
    else:
        parcalar = [([b], c) for b, c in zip(bolgeler, cumleler)]
    out = []
    for blist, cumle in parcalar:
        kel = cumle.split()
        toplam_sure = sum(e - s for s, e in blist)
        agirlik = [hece(k) + 0.6 for k in kel]
        tw = sum(agirlik)
        # zaman ekseni: bölgeleri art arda dizilmiş tek eksen gibi gez
        t_ic = 0.0
        for k, w in zip(kel, agirlik):
            d = toplam_sure * w / tw

            def gercek(tt):
                acc = 0.0
                for s, e in blist:
                    if tt <= acc + (e - s):
                        return s + (tt - acc)
                    acc += e - s
                return blist[-1][1]
            a, b = gercek(t_ic), gercek(t_ic + d * 0.92)
            out.append({'k': k, 'a': round(a, 3), 'b': round(b, 3)})
            t_ic += d
    return out


def whisper_bicimi(kelimeler):
    """openai-whisper JSON biçimi (ghost-editor transcribe.py --raw ile okunur)."""
    seg, cur = [], []
    for w in kelimeler:
        cur.append(w)
        if re.search(r'[.!?…]$', w['k']):
            seg.append(cur); cur = []
    if cur:
        seg.append(cur)
    return {'language': 'tr', 'text': ' '.join(w['k'] for w in kelimeler),
            'segments': [{'id': i, 'start': s[0]['a'], 'end': s[-1]['b'], 'text': ' ' + ' '.join(w['k'] for w in s),
                          'words': [{'word': ' ' + w['k'], 'start': w['a'], 'end': w['b'], 'probability': 0.9} for w in s]}
                         for i, s in enumerate(seg)]}


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('girdi'); ap.add_argument('-o', '--cikti')
    ap.add_argument('--metin'); ap.add_argument('--metin-dosya'); ap.add_argument('--model', default='small')
    ap.add_argument('--whisper-json', help='ayrıca openai-whisper biçiminde yaz')
    a = ap.parse_args()
    probe(a.girdi)
    metin = a.metin or (open(a.metin_dosya, encoding='utf-8').read() if a.metin_dosya else None)
    kel, kaynak = None, None
    if not metin:
        kel, err = whisper_dene(a.girdi, a.model)
        if kel:
            kaynak = f'faster-whisper/{a.model}'
        else:
            bilgi(f'UYARI: {err}')
            bilgi('Kelime listesi gerekli: konuşmanın metnini --metin "..." ya da --metin-dosya ile ver.')
            sys.exit(3)
    else:
        kel, kaynak = hizala(a.girdi, metin), 'metin hizalama'
    out = a.cikti or os.path.splitext(a.girdi)[0] + '.kelimeler.json'
    with open(out, 'w', encoding='utf-8') as f:
        json.dump({'kaynak': kaynak, 'kelimeler': kel}, f, ensure_ascii=False, indent=1)
    if a.whisper_json:
        with open(a.whisper_json, 'w', encoding='utf-8') as f:
            json.dump(whisper_bicimi(kel), f, ensure_ascii=False, indent=1)
    bilgi(f'{len(kel)} kelime ({kaynak}) → {out}')
    print(out)


if __name__ == '__main__':
    main()
