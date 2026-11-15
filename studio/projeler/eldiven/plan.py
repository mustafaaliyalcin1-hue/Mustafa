#!/usr/bin/env python3
"""Eldiven videosu — 2. adım: kurgu planı (hangi saniyede hangi grafik) → grafik/public/eldiven/plan.json
Zamanlar kesik videonun zamanıdır (kesim.py'nin kelimeler.json'u). Konuşmadaki komutlara göre:
  "arkama 'bunu Claude editledi' yazan"  → arka_baslik (kişinin arkasında)
  "ekranı ikiye bölüp soluna beni, sağına steril eldivenin ne için kullanıldığını" → sol/sağ bölünmüş ekran + kart
  "tekrar ettiğim kelimeleri kesen"       → tekrar çipi + üstü çizilen tekrar örneği
  "bir saniye boşluk bile olsa silen"     → boşluk çipi + kapanan boşluk animasyonu
  "beni ikiye bölüp üstüne altının 1 yıllık düşüş ve çıkış grafiği" → üst/alt bölünmüş ekran + çizilen grafik (temsili)
"""
import json
import os
import shutil

ST = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
W = os.path.join(ST, 'temp', 'eldiven')
PUB = os.path.join(ST, 'grafik', 'public', 'eldiven')


def main():
    d = json.load(open(os.path.join(W, 'kelimeler.json'), encoding='utf-8'))
    kel = d['kelimeler']

    def bul(k, sonra=0.0):
        return next(w for w in kel if w['k'].strip('".,') == k and w['a'] >= sonra)
    # ikinci dinlemede netleşen yerler: "...söylemediklerimi kesen", "boşluk bile olsa onu silen"
    yeni = []
    for w in kel:
        if w['k'] == 'yazan' and 12 < w['a'] < 13.2:
            w = dict(w, k='kesen')
        if w['k'] == 'bile' and 14 < w['a'] < 15:
            continue
        if w['k'] == 'olmasın':
            a0, b0 = bul('bile')['a'], w['b']
            parca = ['bile', 'olsa', 'onu', 'silen']
            adim = (b0 - a0) / len(parca)
            yeni += [{'k': p, 'a': round(a0 + i * adim, 3), 'b': round(a0 + (i + 1) * adim, 3)} for i, p in enumerate(parca)]
            continue
        yeni.append({'k': w['k'], 'a': w['a'], 'b': w['b']})
    kel = yeni
    sure = d['sure']
    ekrani = bul('ekranı')['a']
    claude1 = bul('Claude', ekrani)
    plan = {
        'sure': sure,
        'kelimeler': kel,
        'arkaBaslik': {'a': bul('bunu')['a'], 'b': bul('veya')['a'] - 0.05,
                       'satirlar': ['BUNU', 'CLAUDE', 'EDİTLEDİ'], 'boyut': [118, 150, 104]},
        'bolLR': {'a': ekrani, 'b': bul('Tekrar')['a'] - 0.02, 'baslik': 'Steril eldiven ne için kullanılır?',
                  'maddeler': [{'t': round(ekrani + 1.0 + 0.85 * i, 2), 'yazi': y} for i, y in enumerate([
                      'Ameliyat ve cerrahi müdahalelerde', 'Yara bakımı ve pansumanda',
                      'Kateter, enjeksiyon gibi steril işlemlerde', 'Hastayı mikroplardan korumak için'])]},
        'tekrarCip': {'a': bul('Tekrar')['a'], 'b': bul('Bir')['a'] - 0.1, 'ciz': bul('kelimeleri')['a']},
        'bosluk': {'a': bul('Bir')['a'], 'b': bul('Şu', 17)['a'] - 0.05, 'kirp': bul('boşluk')['a'] + 0.2},
        'bolTB': {'a': bul('ikiye', 18)['a'], 'b': sure, 'cizBas': bul('altının')['a'] - 0.15,
                  'cizSon': bul('grafiğini')['a'] + 0.4, 'dusus': bul('düşüş')['a'], 'cikis': bul('çıkış')['a'] + 0.25},
    }
    os.makedirs(PUB, exist_ok=True)
    json.dump(plan, open(os.path.join(PUB, 'plan.json'), 'w'), ensure_ascii=False, indent=1)
    for f in ('kesik.mp4', 'kisi.webm'):
        if os.path.exists(os.path.join(W, f)):
            shutil.copy(os.path.join(W, f), os.path.join(PUB, f))
    ozet = [('arka başlık', plan['arkaBaslik']), ('sol/sağ + kart', plan['bolLR']), ('tekrar çipi', plan['tekrarCip']),
            ('boşluk çipi', plan['bosluk']), ('üst/alt + grafik', plan['bolTB'])]
    for ad, p in ozet:
        print(f"  {p['a']:5.2f}–{p['b']:5.2f} sn  {ad}")
    print(f'  süre {sure:.2f} sn, {len(kel)} altyazı kelimesi')


if __name__ == '__main__':
    main()
