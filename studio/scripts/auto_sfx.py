#!/usr/bin/env python3
"""Otomatik SFX: videoyu analiz eder, olaylara uygun ve birbirinden farklı sesleri tam o karede yerleştirir.

  auto_sfx.py video.mp4                        # çıktı: output/<ad>_sfx_<tarih>.mp4
  auto_sfx.py video.mp4 --yogunluk az|normal|cok --seviye -3   # yoğunluk ve genel SFX seviyesi (dB)
  auto_sfx.py video.mp4 --dramatik-yok        # riser→boom kurgusunu kapat
  auto_sfx.py video.mp4 --rapor               # sadece analiz/plan yaz, render etme
Analiz: sahne kesimleri (PySceneDetect), ani hareket (optik akış sıçraması), yazı giriş anları (metin benzeri
bölge artışı + yazi.py/gecis.py/kesim.py'nin bıraktığı .olaylar.json), parlama/flaş, durağan sahne (deklanşör).
Seçim: kesim→whoosh/swoosh, ani hareket→swoosh/whoosh_kisa/impact, yazı→pop/click, bant→swoosh_ince,
vurgu→impact, glitch→glitch, durağan sahneye geçiş→shutter, en güçlü an→riser + derin impact/bass drop.
Aynı ses arka arkaya kullanılmaz; tepe noktası (ör. whoosh'un en gür anı) olay karesine hizalanır.
Seviye: her olayın çevresindeki orijinal ses (müzik/konuşma) ölçülür, SFX onun altında kalacak şekilde ayarlanır.
"""
import argparse
import json
import os
import subprocess
import sys

import cv2
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _ortak import (AENC, SFX, bilgi, bitti, cikti_yolu, ffmpeg, hata, olay_oku, probe)  # noqa: E402

# kategori → temel seviye (dBFS, SFX dosyaları -1 dBFS tepeye normalize)
TEMEL_DB = {'whoosh': -11, 'swoosh': -12, 'pop': -11, 'click': -13, 'impact': -9, 'riser': -15, 'drop': -10,
            'glitch': -15, 'shutter': -11}
# yerel sese göre ofset (dB): kısa transientler biraz üstte, uzun dokular altta durur
YEREL_OFS = {'pop': 2, 'click': 2, 'impact': 1, 'shutter': 1, 'whoosh': -1, 'swoosh': -1, 'glitch': -3, 'riser': -4,
             'drop': -2}
GRUP = {'kesim': 'gecis', 'gecis': 'gecis', 'hareket': 'gecis', 'flas': 'gecis', 'durgun': 'gecis', 'yazi': 'yazi',
        'bant': 'bant', 'vurgu': 'vurgu', 'glitch': 'vurgu'}
ONCELIK = {'dramatik': 6, 'vurgu': 5, 'kesim': 4, 'gecis': 4, 'glitch': 4, 'bant': 3, 'yazi': 3, 'hareket': 2,
           'durgun': 2, 'flas': 3}


# ------------------------------------------------------------------ analiz
def video_analiz(path, fps):
    """Kare başına: optik akış büyüklüğü, metin benzeri alan, parlaklık, kare farkı."""
    cap = cv2.VideoCapture(path)
    hareket, metin, parlak, fark = [], [], [], []
    onceki = None
    k_yatay = cv2.getStructuringElement(cv2.MORPH_RECT, (9, 2))
    while True:
        ok, fr = cap.read()
        if not ok:
            break
        h, w = fr.shape[:2]
        s = 240 / max(h, w)
        g = cv2.cvtColor(cv2.resize(fr, (int(w * s) // 2 * 2, int(h * s) // 2 * 2)), cv2.COLOR_BGR2GRAY)
        parlak.append(float(g.mean()))
        if onceki is not None:
            fl = cv2.calcOpticalFlowFarneback(onceki, g, None, 0.5, 2, 9, 2, 5, 1.1, 0)
            hareket.append(float(np.linalg.norm(fl, axis=2).mean()))
            fark.append(float(cv2.absdiff(g, onceki).mean()))
        else:
            hareket.append(0.0); fark.append(0.0)
        # metin benzeri bölgeler: yüksek kontrastlı ince yatay kümeler
        grad = cv2.morphologyEx(g, cv2.MORPH_GRADIENT, np.ones((3, 3), np.uint8))
        _, bw = cv2.threshold(grad, 0, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)
        bw = cv2.morphologyEx(bw, cv2.MORPH_CLOSE, k_yatay)
        n, _, st, _ = cv2.connectedComponentsWithStats(bw)
        alan = 0
        H, W = g.shape
        for x, y, ww, hh, a in st[1:]:
            if ww > 1.8 * hh and H * 0.015 < hh < H * 0.14 and ww > W * 0.08 and a > 0.35 * ww * hh:
                alan += ww * hh
        metin.append(alan / (H * W))
        onceki = g
    cap.release()
    return np.array(hareket), np.array(metin), np.array(parlak), np.array(fark)


def ses_seviyesi(path, sure):
    """10 ms çözünürlükte RMS (dBFS) zarfı."""
    r = subprocess.run(['ffmpeg', '-v', 'error', '-nostdin', '-i', path, '-map', '0:a:0', '-ac', '1', '-ar', '16000',
                        '-f', 'f32le', '-'], capture_output=True)
    y = np.frombuffer(r.stdout, dtype=np.float32)
    if not len(y):
        return None
    hop = 160
    n = len(y) // hop
    rms = np.sqrt(np.mean(y[:n * hop].reshape(n, hop) ** 2, axis=1) + 1e-12)
    return 20 * np.log10(rms + 1e-9)


def zirveler(x, esik, min_aralik):
    idx = []
    for i in range(1, len(x) - 1):
        if x[i] >= esik and x[i] >= x[i - 1] and x[i] >= x[i + 1]:
            if idx and i - idx[-1] < min_aralik:
                if x[i] > x[idx[-1]]:
                    idx[-1] = i
                continue
            idx.append(i)
    return idx


def olaylari_bul(path, inf, yogunluk):
    from sahne import sahneler
    fps = inf['fps']
    D = inf['sure']
    olaylar = []
    # 1) sahne kesimleri
    kesimler = [a for a, _ in sahneler(path, 27.0, 0.3)[1:]]
    hareket, metin, parlak, fark = video_analiz(path, fps)
    n = len(hareket)
    for t in kesimler:
        olaylar.append({'t': t, 'tur': 'kesim', 'kaynak': 'analiz', 'guc': 1.0})
    kes_kare = set()
    for t in kesimler:
        for d in range(-3, 4):
            kes_kare.add(int(round(t * fps)) + d)
    # 2) ani hareket: kayan medyana göre sıçrama
    if n > 5:
        med = np.array([np.median(hareket[max(0, i - int(fps)):i + int(fps)]) for i in range(n)])
        oran = hareket / (med + 0.15)
        carpan = {'az': 3.5, 'normal': 2.8, 'cok': 2.0}[yogunluk]
        for i in zirveler(oran, carpan, int(fps * {'az': 2.0, 'normal': 1.0, 'cok': 0.5}[yogunluk])):
            if i in kes_kare or hareket[i] < 0.8:
                continue
            olaylar.append({'t': round(i / fps, 3), 'tur': 'hareket', 'kaynak': 'analiz',
                            'guc': float(min(3, oran[i] / carpan))})
    # 3) yazı girişleri: metin benzeri alanın ani artışı (kesim değilken), en az 0.3 sn kalıcı
    if n > 10:
        m = np.convolve(metin, np.ones(3) / 3, 'same')
        L = int(fps * 0.3)
        for i in range(3, n - L):
            art = m[i + 2] - m[i - 2]
            if art > 0.012 and i not in kes_kare and m[i + 2:i + L].min() > m[i - 2] + 0.008:
                if not any(o['tur'] == 'yazi' and abs(o['t'] - i / fps) < 0.6 for o in olaylar):
                    olaylar.append({'t': round(i / fps, 3), 'tur': 'yazi', 'kaynak': 'analiz', 'guc': 1.0})
    # 4) flaş: parlaklık sıçraması
    if n > 3:
        dp = np.diff(parlak, prepend=parlak[0])
        for i in zirveler(dp, 30, int(fps * 0.4)):
            if i not in kes_kare:
                olaylar.append({'t': round(i / fps, 3), 'tur': 'flas', 'kaynak': 'analiz', 'guc': 1.0})
    # 5) durağan sahneye geçiş (kesimden sonra 0.6 sn neredeyse hareketsiz) → deklanşör
    for t in kesimler:
        i = int(t * fps)
        if i + int(fps * 0.6) < n and np.mean(fark[i + 2:i + int(fps * 0.6)]) < 0.6:
            olaylar.append({'t': t, 'tur': 'durgun', 'kaynak': 'analiz', 'guc': 1.0})
    # 6) yan dosyadaki kesin olaylar (yazi.py, gecis.py, kesim.py, efekt.py, beat.py)
    for o in olay_oku(path):
        t = o['t']
        tur = {'yazi': 'yazi', 'bant': 'bant', 'kesim': 'kesim', 'gecis': 'gecis', 'vurgu': 'vurgu',
               'glitch': 'glitch'}.get(o['tur'], o['tur'])
        # analizle bulunan yakın olayı kesin olanla değiştir
        olaylar = [x for x in olaylar if not (x['kaynak'] == 'analiz' and abs(x['t'] - t) < 0.35 and
                                              (x['tur'] == tur or {x['tur'], tur} <= {'kesim', 'gecis', 'hareket'}))]
        if tur in ('yazi', 'bant'):  # bandın/başlığın kendi yazısı ayrıca sayılmaz
            olaylar = [x for x in olaylar if not (x['kaynak'] == 'analiz' and x['tur'] == 'yazi' and -0.2 < x['t'] - t < 0.6)]
        olaylar.append(dict(o, tur=tur, kaynak='isaret', guc=1.2))
    # geçiş/kesim anındaki görüntü bozulması yazı sanılmasın
    gecisler = [(o['t'], o.get('sure', 0.3)) for o in olaylar if o['tur'] in ('gecis', 'kesim')]
    olaylar = [o for o in olaylar if not (o['tur'] == 'yazi' and o['kaynak'] == 'analiz' and
                                          any(t - 0.4 < o['t'] < t + d + 0.4 for t, d in gecisler))]
    # yazı/bant/geçiş animasyonlarının yarattığı hareket ayrı olay sayılmaz
    isaretli = [o['t'] for o in olaylar if o['kaynak'] == 'isaret' and o['tur'] in ('yazi', 'bant', 'gecis', 'vurgu')]
    olaylar = [o for o in olaylar if not (o['tur'] == 'hareket' and any(-0.3 <= o['t'] - t < 0.8 for t in isaretli))]
    olaylar = [o for o in olaylar if 0 <= o['t'] < D - 0.05]
    return sorted(olaylar, key=lambda o: o['t']), (hareket, metin)


# ------------------------------------------------------------------ seçim
def katalog_yukle():
    p = os.path.join(SFX, 'katalog.json')
    if not os.path.exists(p):
        hata('assets/sfx/katalog.json yok — önce: python3 scripts/sfx_uret.py')
    kat = json.load(open(p, encoding='utf-8'))
    for k in kat:
        k['yol'] = os.path.join(SFX, k['dosya'])
    rp = os.path.join(SFX, 'real', 'katalog.json')  # isteğe bağlı gerçek CC0 sesler
    if os.path.exists(rp):
        for k in json.load(open(rp, encoding='utf-8')):
            k['yol'] = os.path.join(SFX, 'real', k['dosya'])
            if os.path.exists(k['yol']):
                kat.append(k)
    return [k for k in kat if os.path.exists(k['yol'])]


def aday_listesi(o, kat):
    """Olay türüne göre (sesler, kategori tercihi sırası)."""
    tur = o['tur']
    ad = {k['ad']: k for k in kat}

    def ad_ile(*adlar):
        return [ad[a] for a in adlar if a in ad]

    def kat_ile(*kats):
        return [k for k in kat if k['kategori'] in kats]
    if tur == 'gecis':
        g = o.get('gecis', '')
        if g == 'whip':
            return ad_ile('whoosh_sert', 'whoosh_kisa') or kat_ile('whoosh')
        if g == 'flash':
            return ad_ile('impact_hafif', 'shutter') + kat_ile('impact')
        if g in ('zoom',):
            return ad_ile('whoosh_uzun', 'swoosh_tonal') or kat_ile('whoosh')
        if g == 'glitch':
            return kat_ile('glitch')
        return ad_ile('whoosh_yumusak', 'swoosh_ince', 'whoosh_uzun') or kat_ile('whoosh', 'swoosh')
    if tur == 'kesim':
        return kat_ile('whoosh', 'swoosh')
    if tur == 'hareket':
        if o.get('guc', 1) > 1.8:
            return ad_ile('impact_hafif', 'impact_orta') + kat_ile('impact')
        return ad_ile('swoosh_ince', 'whoosh_kisa', 'swoosh_tonal') or kat_ile('swoosh', 'whoosh')
    if tur == 'yazi':
        if o.get('anim') == 'daktilo':
            return kat_ile('click')
        return kat_ile('pop') + ad_ile('click_ui')
    if tur == 'bant':
        return ad_ile('swoosh_ince', 'click_mekanik') or kat_ile('swoosh', 'click')
    if tur == 'vurgu':
        return ad_ile('impact_orta', 'impact_hafif') + kat_ile('impact')
    if tur == 'glitch':
        return kat_ile('glitch') or ad_ile('click_mekanik')
    if tur == 'flas':
        return ad_ile('impact_hafif', 'shutter')
    if tur == 'durgun':
        return kat_ile('shutter')
    return kat_ile('whoosh')


def plan_yap(olaylar, kat, D, dramatik, yogunluk):
    min_ara = {'az': 0.5, 'normal': 0.2, 'cok': 0.1}[yogunluk]
    # çakışanları ele: yakın olaylarda önceliği yüksek olan kalır
    secili = []
    for o in sorted(olaylar, key=lambda o: (-ONCELIK.get(o['tur'], 1), o['t'])):
        g = GRUP.get(o['tur'], o['tur'])
        ayni_grup = [s for s in secili if GRUP.get(s['tur'], s['tur']) == g and abs(o['t'] - s['t']) < min_ara]
        cok_yakin = [s for s in secili if abs(o['t'] - s['t']) < 0.08]
        if not ayni_grup and len(cok_yakin) < 2:  # farklı gruplar üst üste binebilir (en fazla 2 ses)
            secili.append(o)
    secili.sort(key=lambda o: o['t'])
    if yogunluk == 'az':
        secili = [o for o in secili if ONCELIK.get(o['tur'], 1) >= 3]
    # dramatik an: en güçlü kesim/vurgu (≥2.6 sn sonra) → önüne riser, üstüne derin impact / bass drop
    plan = []
    ad = {k['ad']: k for k in kat}
    if dramatik and D >= 5:
        adaylar = [o for o in secili if o['tur'] in ('vurgu', 'kesim', 'gecis') and 2.6 <= o['t'] <= D - 0.8]
        if adaylar:
            hedef = max(adaylar, key=lambda o: (o['tur'] == 'vurgu', o.get('guc', 1), -abs(o['t'] - D * 0.4)))
            riser = next((ad[a] for a in ('riser_gurultu', 'riser_tonal') if a in ad and ad[a]['sure'] <= hedef['t']),
                         None)
            if riser:
                plan.append({'t': hedef['t'], 'olay': 'dramatik', 'ses': riser})
            vur = ad.get('impact_derin') if hedef['t'] < D * 0.5 or 'bass_drop' not in ad else ad['bass_drop']
            if vur:
                plan.append({'t': hedef['t'], 'olay': 'dramatik', 'ses': vur})
            hedef['_dramatik'] = True
    son_kullanim, onceki = {}, None
    for i, o in enumerate(secili):
        adaylar = aday_listesi(o, kat)
        if not adaylar:
            continue
        # tekrar etme: önceki sesten farklı, en uzun süredir kullanılmayan
        tekil = {}
        for a in adaylar:
            tekil.setdefault(a['ad'], a)
        adaylar = [a for a in tekil.values() if a['ad'] != onceki] or list(tekil.values())
        sira = {a['ad']: j for j, a in enumerate(adaylar)}
        adaylar.sort(key=lambda a: (son_kullanim.get(a['ad'], -1e9), sira[a['ad']]))
        s = adaylar[0]
        if o.get('_dramatik') and any(p['olay'] == 'dramatik' and p['ses']['kategori'] in ('impact', 'drop')
                                      for p in plan):
            # dramatik anda zaten boom var; kesim sesi de eklenir ama boom'la aynı kategoriden olmasın
            alt = [a for a in adaylar if a['kategori'] not in ('impact', 'drop')]
            if not alt:
                continue
            s = alt[0]
        son_kullanim[s['ad']] = i
        onceki = s['ad']
        plan.append({'t': o['t'], 'olay': o['tur'] + (f"/{o['gecis']}" if o.get('gecis') else ''), 'ses': s})
    return sorted(plan, key=lambda p: p['t'])


# ------------------------------------------------------------------ karıştırma
def sfx_rms_db(yol, cache={}):
    if yol not in cache:
        r = subprocess.run(['ffmpeg', '-v', 'error', '-i', yol, '-ac', '1', '-f', 'f32le', '-'], capture_output=True)
        y = np.frombuffer(r.stdout, dtype=np.float32)
        # en gür 100 ms'nin RMS'i
        w = 4800
        if len(y) > w:
            c = np.convolve(y ** 2, np.ones(w) / w, 'valid')
            cache[yol] = 10 * np.log10(c.max() + 1e-12)
        else:
            cache[yol] = 10 * np.log10(np.mean(y ** 2) + 1e-12)
    return cache[yol]


def seviye_hesapla(p, env, seviye):
    s = p['ses']
    base = TEMEL_DB.get(s['kategori'], -12) + seviye
    if env is None:
        return base
    # olayın çevresindeki (±0.4 sn) orijinal sesin gür kısmı
    i0 = max(0, int((p['t'] - 0.4) * 100)); i1 = min(len(env), int((p['t'] + 0.4) * 100) + 1)
    if i1 <= i0:
        return base
    yerel = float(np.percentile(env[i0:i1], 90))
    if yerel < -45:          # sessiz bölüm: temel seviye
        return base
    # SFX'in tepe RMS'i yerel sesin (müzik/konuşma) civarında: duyulur ama bastırmaz; temel seviyeyi aşmaz
    hedef = yerel + YEREL_OFS.get(s['kategori'], 0) - sfx_rms_db(s['yol'])
    return float(np.clip(hedef, base - 10, base))


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('girdi'); ap.add_argument('-o', '--cikti')
    ap.add_argument('--yogunluk', default='normal', choices=['az', 'normal', 'cok'])
    ap.add_argument('--seviye', type=float, default=0.0, help='genel SFX kazancı (dB)')
    ap.add_argument('--dramatik-yok', action='store_true'); ap.add_argument('--rapor', action='store_true')
    args = ap.parse_args()
    inf = probe(args.girdi)
    D = inf['sure']
    kat = katalog_yukle()
    bilgi('video analiz ediliyor (kesim, hareket, yazı, flaş)...')
    olaylar, _ = olaylari_bul(args.girdi, inf, args.yogunluk)
    plan = plan_yap(olaylar, kat, D, not args.dramatik_yok, args.yogunluk)
    env = ses_seviyesi(args.girdi, D) if inf['ses'] else None
    for p in plan:
        p['db'] = round(seviye_hesapla(p, env, args.seviye), 1)
        p['bas'] = round(p['t'] - p['ses']['tepe'], 3)  # tepe noktası olay karesine
    rapor = [{'t': p['t'], 'olay': p['olay'], 'ses': p['ses']['ad'], 'baslangic': p['bas'], 'db': p['db']} for p in plan]
    print(json.dumps(rapor, ensure_ascii=False, indent=1))
    bilgi(f'{len(olaylar)} olay bulundu, {len(plan)} SFX yerleştirildi')
    if args.rapor:
        return
    if not plan:
        bilgi('UYARI: yerleştirilecek olay yok; video kopyalanıyor')
    ins = ['-i', args.girdi]
    fc = []
    if inf['ses']:
        fc.append('[0:a]aformat=sample_rates=48000:channel_layouts=stereo[base]')
    else:
        fc.append(f'anullsrc=r=48000:cl=stereo,atrim=0:{D:.3f}[base]')
    etiketler = ['[base]']
    for i, p in enumerate(plan, 1):
        ins += ['-i', p['ses']['yol']]
        kirp = max(0.0, -p['bas'])
        gecik = int(max(0.0, p['bas']) * 1000)
        fc.append(f'[{i}:a]aformat=sample_rates=48000:channel_layouts=stereo,atrim=start={kirp:.3f},asetpts=PTS-STARTPTS,'
                  f'volume={p["db"]}dB,adelay={gecik}|{gecik}[s{i}]')
        etiketler.append(f'[s{i}]')
    fc.append(f'{"".join(etiketler)}amix=inputs={len(etiketler)}:duration=first:normalize=0,'
              'alimiter=limit=0.95:attack=3:release=60:level=disabled[a]')
    out = cikti_yolu(args.girdi, 'sfx', o=args.cikti)
    ffmpeg(ins + ['-filter_complex', ';'.join(fc), '-map', '0:v', '-map', '[a]', '-c:v', 'copy'] + AENC +
           ['-t', f'{D:.3f}', '-movflags', '+faststart', out])
    with open(out + '.sfx.json', 'w', encoding='utf-8') as f:
        json.dump(rapor, f, ensure_ascii=False, indent=1)
    bitti(out)


if __name__ == '__main__':
    main()
