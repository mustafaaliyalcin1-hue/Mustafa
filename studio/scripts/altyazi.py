#!/usr/bin/env python3
"""Otomatik Türkçe altyazı: faster-whisper transkript + kelime kelime vurgulu (karaoke) Reels altyazısı, videoya gömülü.

  altyazi.py video.mp4                          # whisper ile otomatik (model gerekli)
  altyazi.py video.mp4 --model small            # tiny|base|small|medium|large-v3 ya da yerel klasör yolu
  altyazi.py video.mp4 --metin "Merhaba arkadaşlar bugün çok güzel bir şey yapacağız" --bas 0.5 --son 5
  altyazi.py video.mp4 --srt konusma.srt        # hazır SRT'den kelime kelime vurgulu altyazı
  Seçenekler: --kelime 3 (ekranda en fazla kelime) --buyuk (BÜYÜK HARF) --vurgu "#FFD400" --konum 0.70
Model indirilemezse "model yok" uyarısı verir ve çıkış kodu 3 ile biter (diğer araçlar etkilenmez).
Modeli elle koymak için: assets/models/faster-whisper-<boyut>/ (model.bin, config.json, tokenizer.json, vocabulary.*)
"""
import argparse
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _ortak import (AENC, ASSETS, FONTS, TEMP, ass_kac, ass_renk, ass_zaman, bilgi, bitti, cikti_yolu,  # noqa: E402
                    enc, ffmpeg, filtre_yolu, font_adi, hazirla, ortak_argumanlar, probe, olay_aktar)

MODELLER = os.path.join(ASSETS, 'models')


def tr_buyuk(s):
    return s.replace('i', 'İ').replace('ı', 'I').upper()


def whisper_kelimeler(path, model_ad):
    try:
        from faster_whisper import WhisperModel
    except Exception as e:  # noqa: BLE001
        return None, f'faster-whisper yüklü değil ({e})'
    yerel = model_ad if os.path.isdir(model_ad) else os.path.join(MODELLER, f'faster-whisper-{model_ad}')
    try:
        if os.path.isdir(yerel):
            m = WhisperModel(yerel, device='cpu', compute_type='int8')
        else:
            os.environ.setdefault('HF_HUB_ETAG_TIMEOUT', '10')
            os.environ.setdefault('HF_HUB_DOWNLOAD_TIMEOUT', '20')
            m = WhisperModel(model_ad, device='cpu', compute_type='int8', download_root=MODELLER)
    except Exception as e:  # noqa: BLE001
        return None, f'model yok: "{model_ad}" indirilemedi/bulunamadı ({type(e).__name__})'
    segs, _ = m.transcribe(path, language='tr', word_timestamps=True, vad_filter=True)
    out = []
    for s in segs:
        for w in s.words or []:
            if w.word.strip():
                out.append((w.start, w.end, w.word.strip()))
    return out, None


def dagit(metin, a, b):
    """Metni kelime uzunluğuna göre [a, b] aralığına yay."""
    kel = metin.split()
    if not kel:
        return []
    agirlik = [len(k) + 2 for k in kel]
    top = sum(agirlik); t = a; out = []
    for k, w in zip(kel, agirlik):
        d = (b - a) * w / top
        out.append((t, t + d, k)); t += d
    return out


def srt_oku(p):
    txt = open(p, encoding='utf-8-sig').read()
    out = []
    for blok in re.split(r'\n\s*\n', txt.strip()):
        m = re.search(r'(\d+):(\d+):(\d+)[,.](\d+)\s*-->\s*(\d+):(\d+):(\d+)[,.](\d+)', blok)
        if not m:
            continue
        g = list(map(int, m.groups()))
        a = g[0] * 3600 + g[1] * 60 + g[2] + g[3] / 1000
        b = g[4] * 3600 + g[5] * 60 + g[6] + g[7] / 1000
        metin = ' '.join(blok.split('\n')[2:]) if blok.split('\n')[0].strip().isdigit() else ' '.join(blok.split('\n')[1:])
        out += dagit(re.sub(r'<[^>]+>', '', metin), a, b)
    return out


def grupla(kel, n, max_bosluk=0.6):
    gruplar, cur = [], []
    for w in kel:
        if cur and (len(cur) >= n or w[0] - cur[-1][1] > max_bosluk or re.search(r'[.!?]$', cur[-1][2])):
            gruplar.append(cur); cur = []
        cur.append(w)
    if cur:
        gruplar.append(cur)
    return gruplar


def srt_yaz(gruplar, p):
    def z(t):
        return f'{int(t // 3600):02d}:{int(t % 3600 // 60):02d}:{int(t % 60):02d},{int(t * 1000 % 1000):03d}'
    with open(p, 'w', encoding='utf-8') as f:
        for i, g in enumerate(gruplar, 1):
            f.write(f'{i}\n{z(g[0][0])} --> {z(g[-1][1])}\n{" ".join(w[2] for w in g)}\n\n')


def main():
    ap = ortak_argumanlar(argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter))
    ap.add_argument('girdi')
    ap.add_argument('--model', default='small'); ap.add_argument('--metin'); ap.add_argument('--srt')
    ap.add_argument('--bas', type=float, default=0.0); ap.add_argument('--son', type=float)
    ap.add_argument('--kelime', type=int, default=3); ap.add_argument('--buyuk', action='store_true')
    ap.add_argument('--vurgu', default='#FFD400'); ap.add_argument('--renk', default='#FFFFFF')
    ap.add_argument('--font', default='montserrat'); ap.add_argument('--konum', type=float, default=0.70)
    ap.add_argument('--boyut', type=float, default=0.055)
    args = ap.parse_args()
    g = hazirla(args.girdi, args)
    inf = probe(g)
    W, H = inf['w'], inf['h']
    if args.metin:
        kel = dagit(args.metin, args.bas, args.son or inf['sure'])
    elif args.srt:
        kel = srt_oku(args.srt)
    else:
        if not inf['ses']:
            bilgi('UYARI: videoda ses yok, altyazı üretilemez'); sys.exit(3)
        kel, err = whisper_kelimeler(g, args.model)
        if err:
            bilgi(f'UYARI: {err}')
            bilgi('Altyazı atlandı. Seçenekler: --metin "..." / --srt dosya.srt ya da modeli assets/models/ içine koy.')
            sys.exit(3)
    if not kel:
        bilgi('UYARI: konuşma bulunamadı'); sys.exit(3)
    if args.buyuk:
        kel = [(a, b, tr_buyuk(w)) for a, b, w in kel]
    gruplar = grupla(kel, args.kelime)
    fs = int((H if H > W else min(W, H) * 1.3) * args.boyut)
    fa = font_adi(args.font)
    vc, rc = ass_renk(args.vurgu), ass_renk(args.renk)
    x, y = W // 2, int(H * args.konum)
    satir = []
    for gr in gruplar:
        for i, (a, b, w) in enumerate(gr):
            son = gr[i + 1][0] if i + 1 < len(gr) else b + 0.15
            parca = []
            for j, (_, _, w2) in enumerate(gr):
                if j == i:
                    parca.append('{\\1c' + vc + '\\fscx112\\fscy112\\t(0,90,\\fscx106\\fscy106)}' + ass_kac(w2) +
                                 '{\\1c' + rc + '\\fscx100\\fscy100}')
                else:
                    parca.append(ass_kac(w2))
            ilk = '\\fad(80,0)' if i == 0 else ''
            satir.append(f'Dialogue: 0,{ass_zaman(a)},{ass_zaman(son)},Alt,,0,0,0,,{{\\an5\\pos({x},{y}){ilk}}}'
                         + ' '.join(parca))
    ass = os.path.join(TEMP, f'altyazi_{os.getpid()}.ass')
    with open(ass, 'w', encoding='utf-8') as f:
        f.write(f'[Script Info]\nScriptType: v4.00+\nPlayResX: {W}\nPlayResY: {H}\nWrapStyle: 0\nScaledBorderAndShadow: yes\n\n'
                '[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, '
                'Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, '
                'MarginL, MarginR, MarginV, Encoding\n'
                f'Style: Alt,{fa},{fs},{rc},{rc},&H00000000,&H80000000,0,0,0,0,100,100,1,0,1,{max(3, fs // 12)},'
                f'{max(2, fs // 18)},5,{int(W * 0.06)},{int(W * 0.06)},20,1\n\n'
                '[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n'
                + '\n'.join(satir) + '\n')
    out = cikti_yolu(args.girdi, 'altyazi', o=args.cikti, onizleme=args.onizleme)
    srt_yaz(gruplar, out.rsplit('.', 1)[0] + '.srt')
    ffmpeg(['-i', g, '-vf', f"ass='{filtre_yolu(ass)}':fontsdir='{filtre_yolu(FONTS)}',format=yuv420p"]
           + (['-map', '0:v', '-map', '0:a'] + AENC if inf['ses'] else []) + enc(args) + ['-movflags', '+faststart', out])
    olay_aktar(args.girdi, out)
    bitti(out)


if __name__ == '__main__':
    main()
