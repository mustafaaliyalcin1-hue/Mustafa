#!/usr/bin/env python3
"""Openverse'ten gerçek CC0 SFX indir (source=freesound, license=cc0, <5 sn). NC lisanslara asla dokunmaz.
Çıktı: assets/sfx/real/*.wav, assets/sfx/real/katalog.json, assets/sfx/real/KAYNAKLAR.csv
Kullanım: python3 scripts/sfx_indir.py [--adet 2]
Ağ erişimi yoksa uyarı verip çıkar (kod 4); sentez kütüphanesi etkilenmez."""
import argparse
import csv
import json
import os
import subprocess
import sys
import urllib.parse
import urllib.request

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _ortak import SFX, bilgi  # noqa: E402

REAL = os.path.join(SFX, 'real')
API = 'https://api.openverse.org/v1/audio/'
SORGU = {'whoosh': 'whoosh', 'swoosh': 'swoosh', 'pop': 'pop', 'click': 'click', 'impact': 'impact hit',
         'riser': 'riser', 'drop': 'bass drop', 'glitch': 'glitch', 'shutter': 'camera shutter'}
UA = {'User-Agent': 'video-studio-sfx/1.0'}


def get_json(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=20) as r:
        return json.load(r)


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--adet', type=int, default=2)
    a = ap.parse_args()
    os.makedirs(REAL, exist_ok=True)
    try:
        get_json(API + '?q=test&page_size=1')
    except Exception as e:  # noqa: BLE001
        bilgi(f'UYARI: api.openverse.org erişilemiyor ({type(e).__name__}) — gerçek SFX indirme atlandı')
        sys.exit(4)
    katalog, satirlar = [], []
    for kat, q in SORGU.items():
        url = API + '?' + urllib.parse.urlencode({'q': q, 'license': 'cc0', 'source': 'freesound', 'page_size': 40})
        try:
            res = get_json(url).get('results', [])
        except Exception as e:  # noqa: BLE001
            bilgi(f'{kat}: sorgu başarısız ({e})'); continue
        n = 0
        for r in res:
            lis = (r.get('license') or '').lower()
            if lis != 'cc0' or 'nc' in lis.split('-') or not r.get('url'):
                continue
            if not r.get('duration') or r['duration'] >= 5000:
                continue
            ham = os.path.join(REAL, f'_ham_{r["id"]}')
            try:
                urllib.request.urlretrieve(r['url'], ham)
            except Exception:  # noqa: BLE001
                continue
            ad = f'gercek_{kat}_{n + 1}'
            wav = os.path.join(REAL, ad + '.wav')
            p = subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', ham, '-ar', '48000', '-ac', '2', '-t', '5',
                                '-af', 'loudnorm=I=-16:TP=-1', wav], capture_output=True)
            os.remove(ham)
            if p.returncode:
                continue
            y = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', wav, '-ac', '1', '-f', 'f32le', '-'],
                                             capture_output=True).stdout, dtype=np.float32)
            env = np.convolve(np.abs(y), np.ones(2400) / 2400, 'same')
            tepe = float(np.argmax(env) / 48000) if kat in ('whoosh', 'swoosh') else (len(y) / 48000 if kat == 'riser' else 0.0)
            katalog.append({'ad': ad, 'dosya': ad + '.wav', 'kategori': kat, 'sure': round(len(y) / 48000, 3),
                            'tepe': round(tepe, 3), 'aciklama': r.get('title', ''), 'kaynak': 'openverse/freesound CC0'})
            satirlar.append([ad + '.wav', r.get('title', ''), r.get('creator', ''), r.get('license', ''),
                             r.get('license_url', ''), r.get('foreign_landing_url', '')])
            n += 1
            bilgi(f'{ad}: {r.get("title")} — {r.get("creator")} (CC0)')
            if n >= a.adet:
                break
    with open(os.path.join(REAL, 'katalog.json'), 'w', encoding='utf-8') as f:
        json.dump(katalog, f, ensure_ascii=False, indent=1)
    with open(os.path.join(REAL, 'KAYNAKLAR.csv'), 'w', newline='', encoding='utf-8') as f:
        w = csv.writer(f); w.writerow(['dosya', 'baslik', 'yapimci', 'lisans', 'lisans_url', 'kaynak_url']); w.writerows(satirlar)
    bilgi(f'{len(katalog)} gerçek ses indirildi')


if __name__ == '__main__':
    main()
