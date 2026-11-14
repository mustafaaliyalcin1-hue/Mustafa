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


def ass_zaman(t):
    t = max(0.0, t)
    h = int(t // 3600); m = int(t % 3600 // 60); s = t % 60
    return f'{h}:{m:02d}:{s:05.2f}'


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
