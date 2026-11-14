"""Stüdyo araçlarının ortak yardımcıları: ffprobe, ffmpeg çalıştırma, çıktı adı, önizleme proxy'si."""
import argparse
import datetime
import hashlib
import json
import os
import shutil
import subprocess
import sys

STUDIO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTPUT = os.path.join(STUDIO, 'output')
TEMP = os.path.join(STUDIO, 'temp')
ASSETS = os.path.join(STUDIO, 'assets')
FONTS = os.path.join(ASSETS, 'fonts')
SFX = os.path.join(ASSETS, 'sfx')
LUTS = os.path.join(ASSETS, 'luts')
MUSIC = os.path.join(ASSETS, 'music')

# Kalın Türkçe destekli fontlar (ASS/libass adlarıyla) ve dosya yolları
FONT_AD = {'montserrat': 'Montserrat Black', 'anton': 'Anton', 'bebas': 'Bebas Neue'}
FONT_DOSYA = {'montserrat': 'Montserrat-Black.ttf', 'anton': 'Anton-Regular.ttf', 'bebas': 'BebasNeue-Regular.ttf'}
YEDEK_FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'

VENC = ['-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p']
AENC = ['-c:a', 'aac', '-b:a', '192k', '-ar', '48000']

for d in (OUTPUT, TEMP):
    os.makedirs(d, exist_ok=True)


def bilgi(msg):
    print(f'[stüdyo] {msg}', file=sys.stderr)


def hata(msg, kod=1):
    print(f'[stüdyo] HATA: {msg}', file=sys.stderr)
    sys.exit(kod)


def font_yolu(ad='montserrat'):
    p = os.path.join(FONTS, FONT_DOSYA.get(ad, ad))
    return p if os.path.exists(p) else YEDEK_FONT


def font_adi(ad='montserrat'):
    return FONT_AD.get(ad, ad) if os.path.exists(font_yolu(ad)) and font_yolu(ad) != YEDEK_FONT else 'DejaVu Sans'


def ffmpeg(args, sessiz=True):
    cmd = ['ffmpeg', '-hide_banner', '-y', '-nostdin'] + (['-loglevel', 'error'] if sessiz else []) + list(args)
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print(' '.join(cmd)[:3000], file=sys.stderr)
        hata('ffmpeg başarısız:\n' + r.stderr[-3000:])
    return r


def probe(path):
    if not os.path.exists(path):
        hata(f'dosya yok: {path}')
    r = subprocess.run(['ffprobe', '-v', 'error', '-print_format', 'json', '-show_streams', '-show_format', path],
                       capture_output=True, text=True)
    if r.returncode != 0:
        hata(f'ffprobe okuyamadı: {path}\n{r.stderr}')
    j = json.loads(r.stdout)
    v = next((s for s in j['streams'] if s['codec_type'] == 'video'), None)
    a = next((s for s in j['streams'] if s['codec_type'] == 'audio'), None)
    info = {'sure': float(j['format'].get('duration', 0) or 0), 'ses': a is not None, 'video': v is not None}
    if v:
        num, den = (v.get('avg_frame_rate') or v.get('r_frame_rate') or '30/1').split('/')
        fps = float(num) / float(den) if float(den) else 30.0
        w, h = int(v['width']), int(v['height'])
        rot = 0
        for sd in v.get('side_data_list', []) or []:
            rot = int(sd.get('rotation', 0) or 0)
        if abs(rot) in (90, 270):
            w, h = h, w
        info.update(w=w, h=h, fps=round(fps, 3) if fps > 0 else 30.0, vcodec=v.get('codec_name'))
    if a:
        info.update(sr=int(a.get('sample_rate', 48000)), kanal=int(a.get('channels', 2)), acodec=a.get('codec_name'))
    return info


def cikti_yolu(girdi, etiket, uzanti='.mp4', o=None, onizleme=False):
    """output/<ad>_<etiket>_<tarih>.mp4 — orijinalin üzerine asla yazmaz."""
    if o:
        yol = os.path.abspath(o)
    else:
        ilk = girdi[0] if isinstance(girdi, (list, tuple)) else girdi
        kok = os.path.splitext(os.path.basename(ilk))[0] if ilk else 'cikti'
        zaman = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
        yol = os.path.join(OUTPUT, f'{kok}_{etiket}_{zaman}{"_onizleme" if onizleme else ""}{uzanti}')
    girdiler = girdi if isinstance(girdi, (list, tuple)) else [girdi]
    for g in girdiler:
        if g and os.path.exists(g) and os.path.abspath(g) == yol:
            hata('çıktı girdinin üzerine yazamaz; başka bir -o ver')
    os.makedirs(os.path.dirname(yol), exist_ok=True)
    return yol


def proxy(path, yukseklik=540):
    """Önizleme için düşük çözünürlüklü, hızlı kodlanmış kopya (temp/ içinde önbellekli)."""
    st = os.stat(path)
    key = hashlib.md5(f'{os.path.abspath(path)}{st.st_size}{st.st_mtime}{yukseklik}'.encode()).hexdigest()[:10]
    p = os.path.join(TEMP, f'proxy_{key}.mp4')
    if not os.path.exists(p):
        inf = probe(path)
        sc = f'scale=-2:{yukseklik}' if inf['w'] >= inf['h'] else f'scale={yukseklik}:-2'  # kısa kenar = 540
        ffmpeg(['-i', path, '-vf', sc + ',format=yuv420p', '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '26']
               + (AENC if inf['ses'] else ['-an']) + [p])
    return p


def ortak_argumanlar(p: argparse.ArgumentParser):
    p.add_argument('-o', '--cikti', help='çıktı dosyası (varsayılan: output/<ad>_<islem>_<tarih>.mp4)')
    p.add_argument('--onizleme', action='store_true', help='540p hızlı önizleme render et')
    return p


def hazirla(girdi, args):
    """Önizleme istenirse proxy'ye geç."""
    return proxy(girdi) if getattr(args, 'onizleme', False) else girdi


def enc(args):
    if getattr(args, 'onizleme', False):
        return ['-c:v', 'libx264', '-preset', 'veryfast', '-crf', '28', '-pix_fmt', 'yuv420p']
    return VENC


def ses_akisi_ekle(inp_index, info, sure=None):
    """Sesi olmayan girdiye sessiz ses üretmek için filtre parçası döndürür."""
    if info['ses']:
        return f'[{inp_index}:a]aformat=sample_rates=48000:channel_layouts=stereo'
    d = sure if sure else info['sure']
    return f'anullsrc=r=48000:cl=stereo,atrim=0:{d:.3f}'


def ass_cs(t):
    """Saniye -> ASS'in çözünürlüğü olan santisaniye (tamsayı, tutarlı yuvarlama)."""
    return max(0, int(round(t * 100)))


def ass_zaman(t):
    cs = ass_cs(t)
    h, cs = divmod(cs, 360000); m, cs = divmod(cs, 6000); s, cs = divmod(cs, 100)
    return f'{h}:{m:02d}:{s:02d}.{cs:02d}'


# ---------------- Güvenli alan (Reels/TikTok/Shorts arayüzü yazıların üstünü kapatmasın)
GUVENLI_DIKEY = (0.12, 0.25)   # üstten %12, alttan %25 boş
GUVENLI_YATAY = (0.06, 0.10)


def guvenli_alan(W, H):
    """İçeriğin kalması gereken dikey aralık: (ust_y, alt_y) piksel."""
    u, a = GUVENLI_DIKEY if H > W else GUVENLI_YATAY
    return int(H * u), int(H * (1 - a))


def guvenli_y(y_merkez, yukseklik, W, H):
    """Ortası y_merkez olan, yüksekliği verilen bloğu güvenli alana it."""
    u, a = guvenli_alan(W, H)
    y = max(y_merkez, u + yukseklik / 2)
    return int(min(y, a - yukseklik / 2))


# ---------------- Ses seviyesi (export varsayılanı: -14 LUFS, true peak ≤ -1 dBTP)
def ses_olc(path):
    """(integrated LUFS, true peak dBTP) — ebur128 ile, kodlanmış dosyanın kendisinden."""
    import re
    r = subprocess.run(['ffmpeg', '-hide_banner', '-nostdin', '-i', path, '-map', '0:a:0', '-af', 'ebur128=peak=true',
                       '-f', 'null', '-'], capture_output=True, text=True)
    ozet = r.stderr[r.stderr.rfind('Summary:'):]
    i = re.search(r'I:\s+(-?[\d.]+|-inf) LUFS', ozet)
    p = re.search(r'True peak:\s+Peak:\s+(-?[\d.]+|-inf) dBFS', ozet)
    f = lambda m: float(m.group(1)) if m and m.group(1) != '-inf' else -99.0  # noqa: E731
    return f(i), f(p)


def loudnorm_filtre(path, I=-14.0, TP=-1.0):
    """İki geçişli loudnorm (ölç → doğrusal uygula) + tepe limiter. AAC taşmasına karşı 0.5 dB pay bırakır."""
    import re
    r = subprocess.run(['ffmpeg', '-hide_banner', '-nostdin', '-i', path, '-map', '0:a:0', '-af',
                        f'loudnorm=I={I}:TP={TP - 0.5}:LRA=11:print_format=json', '-f', 'null', '-'],
                       capture_output=True, text=True)
    m = re.search(r'\{[^{}]*"input_i"[^{}]*\}', r.stderr)
    lim = f'alimiter=limit={10 ** ((TP - 1.5) / 20):.4f}:attack=2:release=60:level=disabled:asc=1'
    if not m:
        return f'loudnorm=I={I}:TP={TP - 0.5}:LRA=11,aresample=48000,{lim}'
    j = json.loads(m.group(0))
    if j['input_i'] in ('-inf', 'inf'):  # sessiz kaynak
        return f'aresample=48000,{lim}'
    return (f"loudnorm=I={I}:TP={TP - 0.5}:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:"
            f"measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}:"
            f"linear=true,aresample=48000,{lim}")


def ses_normalize(path, I=-14.0, TP=-1.0):
    """Kodlanmış dosyanın sesini iki geçişli loudnorm + limiter ile hedefe getir, sonra doğrula (video kopyalanır)."""
    tmp = path + '.norm_tmp.mp4'
    ffmpeg(['-i', path, '-map', '0:v?', '-map', '0:a', '-c:v', 'copy', '-af', loudnorm_filtre(path, I, TP),
            '-c:a', 'aac', '-b:a', '320k', '-ar', '48000', '-movflags', '+faststart', tmp])
    os.replace(tmp, path)
    return ses_sinirla(path, I, TP)


def ses_sinirla(path, I=-14.0, TP=-1.0, deneme=3):
    """Kodlanmış çıktıyı ölç ve garanti et: ortalama ≤ I LUFS, true peak ≤ TP dBTP (video kopyalanır).
    Aşım varsa kısar; limiter ortalamayı hedefin >0.5 dB altına çektiyse güvenli tavanla yükseltmeyi dener."""
    def kazanc(db, hedef, tavan=TP - 0.8):
        ffmpeg(['-i', path, '-map', '0:v?', '-map', '0:a', '-c:v', 'copy', '-af',
                f'volume={db:.2f}dB,alimiter=limit={10 ** (tavan / 20):.4f}:level=disabled:asc=1',
                '-c:a', 'aac', '-b:a', '320k', '-ar', '48000', '-movflags', '+faststart', hedef])
    i, tp = ses_olc(path)
    for _ in range(deneme):  # sınır aşımı: yalnız kıs
        fazla = max(i - I, tp - TP)
        if fazla <= 0:
            break
        tmp = path + '.ses_tmp.mp4'
        kazanc(-(fazla + 0.1), tmp)
        os.replace(tmp, path)
        i, tp = ses_olc(path)
    # limiter yoğun yerleri bastırıp ortalamayı hedefin çok altına çektiyse: limiter arkasından biraz yükselt
    if I < 0 and i < I - 0.5:
        eksik, en_iyi = I - 0.1 - i, None
        for k, carpan in enumerate((1.0, 1.4, 1.8)):  # limiter kazancın bir kısmını yer: birkaç aday dene
            tmp = f'{path}.ses_tmp{k}.mp4'
            kazanc(eksik * carpan, tmp, TP - 1.4)
            i2, tp2 = ses_olc(tmp)
            if i2 <= I and tp2 <= TP and (en_iyi is None or i2 > en_iyi[1]):
                en_iyi = (tmp, i2, tp2)
        if en_iyi:
            os.replace(en_iyi[0], path); i, tp = en_iyi[1], en_iyi[2]
        for k in range(3):
            if os.path.exists(f'{path}.ses_tmp{k}.mp4'):
                os.remove(f'{path}.ses_tmp{k}.mp4')
    return i, tp


def ass_renk(hexrenk, alfa=0):
    """'#RRGGBB' -> ASS &HAABBGGRR"""
    h = hexrenk.lstrip('#')
    r, g, b = h[0:2], h[2:4], h[4:6]
    return f'&H{alfa:02X}{b}{g}{r}'.upper()


def ass_kac(metin):
    return metin.replace('\\', '\\\\').replace('{', '(').replace('}', ')').replace('\n', '\\N')


def filtre_yolu(p):
    """ffmpeg filtre argümanında güvenli yol."""
    return p.replace('\\', '/').replace(':', '\\:').replace("'", "\\'")


def olay_yaz(cikti, olaylar):
    """auto_sfx için yan dosya: <cikti>.olaylar.json (yazı giriş anları vb.)"""
    with open(cikti + '.olaylar.json', 'w', encoding='utf-8') as f:
        json.dump(olaylar, f, ensure_ascii=False, indent=1)


def olay_oku(girdi):
    p = girdi + '.olaylar.json'
    if os.path.exists(p):
        with open(p, encoding='utf-8') as f:
            return json.load(f)
    return []


def olay_aktar(girdi, cikti, kaydir=0.0, olcek=1.0):
    ol = olay_oku(girdi)
    if ol:
        olay_yaz(cikti, [dict(o, t=round(o['t'] * olcek + kaydir, 3)) for o in ol])


def bitti(yol):
    inf = probe(yol)
    print(yol)
    bilgi(f'tamam → {yol}  ({inf.get("w")}x{inf.get("h")}, {inf["sure"]:.2f} sn)')


def which(x):
    return shutil.which(x) is not None
