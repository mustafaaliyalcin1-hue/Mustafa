#!/usr/bin/env python3
"""Yazı: başlık, animasyonlu metin, alt yazı bandı (lower third). Türkçe karakter destekli kalın fontlar.

  yazi.py video.mp4 --baslik "BÜYÜK AÇILIŞ" --animasyon pop --bas 0.3 --sure 2.5
  yazi.py video.mp4 -y "İLK SAHNE|0.5|2.5|kay|ust" -y "ŞİMDİ İZLE|4|6|zoom|orta"
  yazi.py video.mp4 --bant "Mustafa Yılmaz" --bant-alt "Yönetmen" --bas 1 --sure 4
  yazi.py video.mp4 --baslik "MERHABA" --font anton --renk "#FFFFFF" --vurgu "#FFD400" --boyut 0.09
-y biçimi: "METİN|bas|son|animasyon|konum"   konum: ust | orta | alt | x,y (piksel)
Animasyonlar: pop, kay, zoom, fade, daktilo, kelime (kelime kelime), parlama, sallan
Fontlar: montserrat (varsayılan, Black), anton, bebas
Metinde *yıldızlı* kelime vurgu rengiyle yazılır.
"""
import argparse
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _ortak import (AENC, FONTS, TEMP, ass_kac, ass_renk, ass_zaman, bitti, cikti_yolu, enc, ffmpeg,  # noqa: E402
                    filtre_yolu, font_adi, font_yolu, hazirla, ortak_argumanlar, probe, olay_oku, olay_yaz)


def ass_baslik(W, H, stiller):
    s = (f'[Script Info]\nScriptType: v4.00+\nPlayResX: {W}\nPlayResY: {H}\nWrapStyle: 2\n'
         f'ScaledBorderAndShadow: yes\nYCbCr Matrix: TV.709\n\n[V4+ Styles]\n'
         'Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, '
         'Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, '
         'MarginR, MarginV, Encoding\n')
    for st in stiller:
        s += st + '\n'
    return s + '\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n'


def stil(ad, font, boyut, renk='#FFFFFF', kenar='#000000', kenar_k=6, golge=3, hiza=5, aralik=1, golge_alfa=0x60):
    return (f'Style: {ad},{font},{int(boyut)},{ass_renk(renk)},{ass_renk(renk)},{ass_renk(kenar)},'
            f'{ass_renk("#000000", golge_alfa)},0,0,0,0,100,100,{aralik},0,1,{kenar_k},{golge},{hiza},20,20,20,1')


def vurgula(metin, vurgu, temel='#FFFFFF'):
    """*kelime* -> vurgu rengi (\\r kullanılmaz; animasyon etiketleri korunur)"""
    c, t = ass_renk(vurgu), ass_renk(temel)
    return re.sub(r'\*([^*]+)\*', lambda m: '{\\1c' + c + '}' + m.group(1) + '{\\1c' + t + '}', metin)


def sigdir(metin, font_dosya, boyut, max_w):
    """Metni ölç: sığmazsa dengeli iki satıra böl, hâlâ sığmazsa fontu küçült. (metin, boyut) döndürür."""
    from PIL import ImageFont
    duz = re.sub(r'\*', '', metin)

    def gen(t, b):
        f = ImageFont.truetype(font_dosya, int(b))
        return max(f.getlength(x) for x in t.split('\n'))
    if gen(duz, boyut) <= max_w:
        return metin, boyut
    kel = metin.split(' ')
    if len(kel) > 1:
        en_iyi = min(range(1, len(kel)), key=lambda i: abs(len(' '.join(kel[:i])) - len(' '.join(kel[i:]))))
        metin = ' '.join(kel[:en_iyi]) + '\n' + ' '.join(kel[en_iyi:])
        duz = re.sub(r'\*', '', metin)
    while gen(duz, boyut) > max_w and boyut > 12:
        boyut *= 0.93
    return metin, boyut


def konum(k, W, H):
    if k and ',' in k:
        x, y = k.split(','); return int(float(x)), int(float(y))
    return W // 2, {'ust': int(H * 0.2), 'orta': H // 2, 'alt': int(H * 0.78)}.get(k or 'orta', H // 2)


def yazi_olay(metin, a, b, anim, x, y, W, H, vurgu, stil_ad='Baslik', temel='#FFFFFF', fdosya=None, fboyut=None):
    """Bir metin için ASS diyalog satırları."""
    ms = int((b - a) * 1000)
    fs_tag = ''
    if fdosya and fboyut:
        metin, yeni = sigdir(metin, fdosya, fboyut, W * 0.86)
        if int(yeni) != int(fboyut):
            fs_tag = f'\\fs{int(yeni)}'
    cikis = min(250, ms // 4)
    satirlar = []
    tx = ass_kac(metin)
    tx = vurgula(tx, vurgu, temel)
    P = f'\\an5\\pos({x},{y}){fs_tag}'
    if anim == 'pop':
        tag = f'{P}\\fscx0\\fscy0\\t(0,140,\\fscx118\\fscy118)\\t(140,240,\\fscx100\\fscy100)\\fad(0,{cikis})'
    elif anim == 'kay':
        d = int(H * 0.06)
        tag = f'\\an5\\move({x},{y + d},{x},{y},0,280)\\fad(180,{cikis}){fs_tag}'
    elif anim == 'zoom':
        tag = f'{P}\\fscx170\\fscy170\\alpha&HFF&\\t(0,320,0.6,\\fscx100\\fscy100\\alpha&H00&)\\fad(0,{cikis})'
    elif anim == 'parlama':
        tag = f'{P}\\blur14\\3c&HFFFFFF&\\t(0,380,\\blur0\\3c&H000000&)\\fad(120,{cikis})'
    elif anim == 'sallan':
        tag = f'{P}\\frz-6\\t(0,150,\\frz5)\\t(150,300,\\frz-3)\\t(300,420,\\frz0)\\fad(100,{cikis})'
    elif anim == 'daktilo':
        harf = [c for c in metin]
        dt = min(70, int(ms * 0.5 / max(1, len(harf))))
        parca = ''
        for i, c in enumerate(harf):
            parca += '{\\alpha&HFF&\\t(%d,%d,\\alpha&H00&)}' % (i * dt, i * dt + 1) + ass_kac(c)
        satirlar.append(f'Dialogue: 0,{ass_zaman(a)},{ass_zaman(b)},{stil_ad},,0,0,0,,{{{P}\\fad(0,{cikis})}}{parca}')
        return satirlar, [{'t': round(a, 3), 'tur': 'yazi', 'anim': anim}]
    elif anim == 'kelime':
        kel = [k for k in metin.replace('\n', ' \n ').split(' ') if k]
        n_kel = sum(1 for k in kel if k != '\n')
        dt = min(350, int(ms * 0.6 / max(1, n_kel)))
        parca = ''
        i = -1
        for k in kel:
            if k == '\n':
                parca = parca.rstrip() + '\\N'
                continue
            i += 1
            t0 = i * dt
            parca += ('{\\alpha&HFF&\\fscx40\\fscy40\\t(%d,%d,\\alpha&H00&\\fscx112\\fscy112)\\t(%d,%d,\\fscx100\\fscy100)}'
                      % (t0, t0 + 120, t0 + 120, t0 + 200)) + vurgula(ass_kac(k), vurgu, temel) + ' '
        satirlar.append(f'Dialogue: 0,{ass_zaman(a)},{ass_zaman(b)},{stil_ad},,0,0,0,,{{{P}\\fad(0,{cikis})}}{parca.strip()}')
        return satirlar, [{'t': round(a + i * dt / 1000, 3), 'tur': 'yazi', 'anim': 'kelime'} for i in range(n_kel)]
    else:  # fade
        tag = f'{P}\\fad(300,{max(cikis, 300)})'
    satirlar.append(f'Dialogue: 0,{ass_zaman(a)},{ass_zaman(b)},{stil_ad},,0,0,0,,{{{tag}}}{tx}')
    return satirlar, [{'t': round(a, 3), 'tur': 'yazi', 'anim': anim}]


def bant_olay(ust, alt, a, b, W, H, renk, vurgu, font):
    """Lower third: soldan kayan renkli bant + iki satır yazı."""
    bw, bh = int(W * 0.62), int(H * 0.075)
    x0, y0 = int(W * 0.06), int(H * 0.74)
    ms = int((b - a) * 1000)
    c = ass_renk(vurgu)
    cikis = f'\\t({ms - 250},{ms},\\alpha&HFF&)'
    s = []
    # vurgu şeridi
    s.append(f'Dialogue: 0,{ass_zaman(a)},{ass_zaman(b)},Bant,,0,0,0,,{{\\an7\\move({-bw},{y0},{x0},{y0},0,300)'
             f'\\p1\\bord0\\shad0\\1c{c}{cikis}}}m 0 0 l {int(bw * 0.025)} 0 l {int(bw * 0.025)} {bh} l 0 {bh}{{\\p0}}')
    # ana bant
    s.append(f'Dialogue: 0,{ass_zaman(a + 0.08)},{ass_zaman(b)},Bant,,0,0,0,,{{\\an7\\move({-bw},{y0},{x0 + int(bw * 0.03)},'
             f'{y0},0,320)\\p1\\bord0\\shad2\\1c{ass_renk(renk)}\\1a&H18&{cikis}}}m 0 0 l {bw} 0 l {int(bw * 0.96)} {bh} l 0 {bh}{{\\p0}}')
    tx = x0 + int(bw * 0.06)
    s.append(f'Dialogue: 1,{ass_zaman(a + 0.2)},{ass_zaman(b)},BantYazi,,0,0,0,,{{\\an4\\move({tx - 60},{y0 + bh // 2},'
             f'{tx},{y0 + bh // 2},0,300)\\fad(150,0){cikis}}}{ass_kac(ust)}')
    if alt:
        ah = int(bh * 0.62)
        s.append(f'Dialogue: 0,{ass_zaman(a + 0.25)},{ass_zaman(b)},Bant,,0,0,0,,{{\\an7\\move({-bw},{y0 + bh},'
                 f'{x0 + int(bw * 0.03)},{y0 + bh},0,340)\\p1\\bord0\\shad0\\1c&H101010&\\1a&H30&{cikis}}}'
                 f'm 0 0 l {int(bw * 0.7)} 0 l {int(bw * 0.68)} {ah} l 0 {ah}{{\\p0}}')
        s.append(f'Dialogue: 1,{ass_zaman(a + 0.35)},{ass_zaman(b)},BantAlt,,0,0,0,,{{\\an4\\pos({tx},{y0 + bh + ah // 2})'
                 f'\\fad(200,0){cikis}}}{ass_kac(alt)}')
    return s, [{'t': round(a, 3), 'tur': 'bant'}]


def main():
    ap = ortak_argumanlar(argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter))
    ap.add_argument('girdi')
    ap.add_argument('--baslik'); ap.add_argument('--animasyon', default='pop')
    ap.add_argument('--konum', default='orta'); ap.add_argument('--bas', type=float, default=0.3)
    ap.add_argument('--sure', type=float, default=2.5)
    ap.add_argument('-y', '--yazi', action='append', default=[])
    ap.add_argument('--bant'); ap.add_argument('--bant-alt')
    ap.add_argument('--font', default='montserrat'); ap.add_argument('--renk', default='#FFFFFF')
    ap.add_argument('--vurgu', default='#FFD400'); ap.add_argument('--bant-renk', default='#E63946')
    ap.add_argument('--boyut', type=float, default=0.075, help='yazı yüksekliği / video yüksekliği')
    args = ap.parse_args()
    g = hazirla(args.girdi, args)
    inf = probe(g)
    W, H = inf['w'], inf['h']
    kisa = min(W, H)
    fb = H * args.boyut if H > W else kisa * args.boyut * 1.25
    fa = font_adi(args.font)
    stiller = [stil('Baslik', fa, fb, args.renk, kenar_k=max(3, fb * 0.06), golge=max(2, fb * 0.04)),
               stil('Bant', fa, 20, kenar_k=0, golge=0, hiza=7),
               stil('BantYazi', fa, H * 0.075 * 0.55 if H > W else kisa * 0.06, '#FFFFFF', kenar_k=0, golge=0, hiza=4),
               stil('BantAlt', font_adi('montserrat'), H * 0.075 * 0.3 if H > W else kisa * 0.034, '#FFFFFF',
                    kenar_k=0, golge=0, hiza=4, aralik=2)]
    satir, olaylar = [], []
    if args.baslik:
        x, y = konum(args.konum, W, H)
        s, o = yazi_olay(args.baslik, args.bas, args.bas + args.sure, args.animasyon, x, y, W, H, args.vurgu, temel=args.renk,
                           fdosya=font_yolu(args.font), fboyut=fb)
        satir += s; olaylar += o
    for item in args.yazi:
        p = item.split('|') + [None] * 5
        x, y = konum(p[4], W, H)
        s, o = yazi_olay(p[0], float(p[1] or 0), float(p[2] or (float(p[1] or 0) + 2.5)), p[3] or 'pop', x, y, W, H,
                         args.vurgu, temel=args.renk, fdosya=font_yolu(args.font), fboyut=fb)
        satir += s; olaylar += o
    if args.bant:
        s, o = bant_olay(args.bant, args.bant_alt, args.bas, args.bas + args.sure, W, H, args.bant_renk, args.vurgu, fa)
        satir += s; olaylar += o
    ass = os.path.join(TEMP, f'yazi_{os.getpid()}.ass')
    with open(ass, 'w', encoding='utf-8') as f:
        f.write(ass_baslik(W, H, stiller) + '\n'.join(satir) + '\n')
    out = cikti_yolu(args.girdi, 'yazi', o=args.cikti, onizleme=args.onizleme)
    ffmpeg(['-i', g, '-vf', f"ass='{filtre_yolu(ass)}':fontsdir='{filtre_yolu(FONTS)}',format=yuv420p"]
           + (['-map', '0:v', '-map', '0:a'] + AENC if inf['ses'] else []) + enc(args) + ['-movflags', '+faststart', out])
    olay_yaz(out, sorted(olay_oku(args.girdi) + olaylar, key=lambda o: o['t']))
    bitti(out)


if __name__ == '__main__':
    main()
