#!/usr/bin/env python3
"""Beat sync (librosa): beat bul, kesimleri beat'e oturt.

  beat.py analiz muzik.mp3                                  # BPM + beat zamanları (JSON)
  beat.py montaj muzik.mp3 a.mp4 b.mp4 c.mp4 --vurus 2 --sure 15   # her 2 beat'te kesen müzikli montaj
  beat.py montaj muzik.mp3 klipler/*.mp4 --vurus 1,1,2,4    # değişken ritim (desen tekrar eder)
  beat.py hizala video.mp4 muzik.mp3                        # mevcut sahne kesimlerini en yakın beat'e kaydır
Seçenekler: --muzik-bas 4 (müzikte başlangıç), --vurgu (güçlü vuruşlarda flaş), --ilk-beat (ilk beat'ten başla)
"""
import argparse
import json
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _ortak import (AENC, bilgi, bitti, cikti_yolu, enc, ffmpeg, hata, hazirla, ortak_argumanlar, probe,  # noqa: E402
                    olay_yaz)


def beatler(muzik, bas=0.0, sure=None):
    import subprocess
    import librosa
    sr = 22050  # ffmpeg ile çöz: MP3 kodlayıcı gecikmesi ffmpeg render'ıyla aynı şekilde atılır
    cmd = ['ffmpeg', '-v', 'error', '-nostdin', '-ss', str(bas), '-i', muzik] + (['-t', str(sure)] if sure else []) + \
        ['-f', 'f32le', '-ac', '1', '-ar', str(sr), '-']
    y = np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, dtype=np.float32)
    onset = librosa.onset.onset_strength(y=y, sr=sr)
    tempo, fr = librosa.beat.beat_track(onset_envelope=onset, sr=sr, units='frames', tightness=100, trim=False)
    tempo = float(np.atleast_1d(tempo)[0])
    t = list(librosa.frames_to_time(fr, sr=sr))
    if len(t) < 2:
        return tempo, [], []
    if tempo < 75:  # yarı tempo hatası: Reels müziği çoğunlukla 80–160 BPM
        t = sorted(t + [(a + b) / 2 for a, b in zip(t[:-1], t[1:])])
        tempo *= 2
    per = float(np.median(np.diff(t)))
    while t[0] - per > -0.02:  # baştaki kaçırılan vuruşları geriye doğru ekle
        t.insert(0, max(0.0, t[0] - per))
    # her beat'i ±70 ms içindeki en yakın onset tepesine hizala (gecikmeyi giderir)
    on = librosa.onset.onset_detect(onset_envelope=onset, sr=sr, units='time', backtrack=True, energy=onset)
    if len(on):
        t = [float(on[np.argmin(abs(on - x))]) if np.min(abs(on - x)) < 0.07 else x for x in t]
    fr = librosa.time_to_frames(t, sr=sr)
    guc = onset[np.clip(fr, 0, len(onset) - 1)]
    return tempo, [round(float(x), 3) for x in t], [round(float(g), 3) for g in guc]


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest='komut', required=True)
    a = sub.add_parser('analiz'); a.add_argument('muzik'); a.add_argument('--muzik-bas', type=float, default=0)
    m = ortak_argumanlar(sub.add_parser('montaj'))
    m.add_argument('muzik'); m.add_argument('klipler', nargs='+')
    m.add_argument('--vurus', default='2', help='kaç beat\'te bir kesim; "1,1,2" desen')
    m.add_argument('--sure', type=float, help='toplam süre (sn)'); m.add_argument('--muzik-bas', type=float, default=0)
    m.add_argument('--boyut', default=None, help='WxH (varsayılan ilk klip)'); m.add_argument('--vurgu', action='store_true')
    m.add_argument('--muzik-db', type=float, default=-3)
    h = ortak_argumanlar(sub.add_parser('hizala'))
    h.add_argument('video'); h.add_argument('muzik'); h.add_argument('--muzik-bas', type=float, default=0)
    h.add_argument('--muzik-db', type=float, default=-3)
    args = ap.parse_args()

    if args.komut == 'analiz':
        tempo, t, g = beatler(args.muzik, args.muzik_bas)
        print(json.dumps({'bpm': round(tempo, 2), 'beat_sayisi': len(t), 'beatler': t, 'guc': g}, ensure_ascii=False))
        bilgi(f'BPM ≈ {tempo:.1f}, {len(t)} beat')
        return

    if args.komut == 'montaj':
        klipler = [hazirla(k, args) for k in args.klipler]
        infos = [probe(k) for k in klipler]
        tempo, bt, guc = beatler(args.muzik, args.muzik_bas)
        if len(bt) < 2:
            hata('beat bulunamadı')
        bilgi(f'BPM ≈ {tempo:.1f}')
        desen = [int(x) for x in args.vurus.split(',')]
        hedef = args.sure or min(bt[-1], sum(i['sure'] for i in infos))
        # kesim noktaları: 0, sonra desene göre beat indeksleri
        kes = [0.0]; bi = 0; k = 0
        bi = 0 if bt[0] < 0.05 else -1
        while True:
            bi += desen[k % len(desen)]; k += 1
            if bi >= len(bt) or bt[bi] >= hedef:
                break
            kes.append(bt[bi])
        kes.append(hedef)
        if args.boyut:
            W, H = map(int, args.boyut.split('x'))
        else:
            W, H = infos[0]['w'], infos[0]['h']
        FPS = infos[0]['fps']
        imlec = [0.0] * len(klipler)
        fc, zincir, olaylar = [], '', []
        for i, (x, y) in enumerate(zip(kes[:-1], kes[1:])):
            d = y - x
            j = i % len(klipler)
            if imlec[j] + d > infos[j]['sure']:
                imlec[j] = 0.0
            s = imlec[j]
            fc.append(f'[{j}:v]trim={s:.3f}:{s + d:.3f},setpts=PTS-STARTPTS,scale={W}:{H}:force_original_aspect_ratio='
                      f'increase,crop={W}:{H},setsar=1,fps={FPS:g},format=yuv420p[v{i}]')
            zincir += f'[v{i}]'
            imlec[j] = s + d
            if i:
                olaylar.append({'t': round(x, 3), 'tur': 'kesim', 'beat': True})
        n = len(kes) - 1
        post = ''
        if args.vurgu and guc:
            esik = np.percentile(guc, 80)
            fl = [t for t, g in zip(bt, guc) if g >= esik and t < hedef]
            post = ',' + ','.join(f"eq=brightness=0.25:enable='between(t,{t:.3f},{t + 0.07:.3f})'" for t in fl[:60])
        fc.append(f'{zincir}concat=n={n}:v=1:a=0{post},format=yuv420p[v]')
        mi = len(klipler)
        fc.append(f'[{mi}:a]atrim=0:{hedef:.3f},asetpts=PTS-STARTPTS,volume={args.muzik_db}dB,'
                  f'afade=t=out:st={max(0, hedef - 1):.3f}:d=1,aformat=sample_rates=48000:channel_layouts=stereo[a]')
        ins = sum((['-i', k] for k in klipler), []) + ['-ss', str(args.muzik_bas), '-i', args.muzik]
        out = cikti_yolu(['beat_montaj'], 'beat', o=args.cikti, onizleme=args.onizleme)
        ffmpeg(ins + ['-filter_complex', ';'.join(fc), '-map', '[v]', '-map', '[a]'] + enc(args) + AENC
               + ['-t', f'{hedef:.3f}', '-movflags', '+faststart', out])
        olay_yaz(out, olaylar)
        bilgi(f'{n} kesim, hepsi beat üzerinde')
        bitti(out)
        return

    # hizala: sahne sınırlarını en yakın beat'e kaydır (her sahne hafifçe hızlanır/yavaşlar)
    from sahne import sahneler
    g = hazirla(args.video, args)
    inf = probe(g)
    sc = sahneler(g)
    tempo, bt, _ = beatler(args.muzik, args.muzik_bas, inf['sure'] + 5)
    sinir = [b for _, b in sc[:-1]]
    yeni, onceki = [], 0.0
    for s in sinir:
        aday = [b for b in bt if b > onceki + 0.3]
        if not aday:
            break
        nb = min(aday, key=lambda b: abs(b - s))
        if abs(nb - s) / max(s - (sc[len(yeni)][0]), 0.3) > 0.5:  # hız değişimi %50'yi aşarsa dokunma
            nb = s
        yeni.append(nb); onceki = nb
    kaynak = [0.0] + sinir[:len(yeni)] + [inf['sure']]
    hedefz = [0.0] + yeni + [inf['sure'] + (yeni[-1] - sinir[len(yeni) - 1] if yeni else 0)]
    fc, zincir = [], ''
    for i in range(len(kaynak) - 1):
        a, b = kaynak[i], kaynak[i + 1]
        k = (b - a) / max(hedefz[i + 1] - hedefz[i], 0.05)
        fc.append(f'[0:v]trim={a:.3f}:{b:.3f},setpts=(PTS-STARTPTS)/{k:.5f}[v{i}]')
        zincir += f'[v{i}]'
    fc.append(f'{zincir}concat=n={len(kaynak) - 1}:v=1:a=0,fps={inf["fps"]:g},format=yuv420p[v]')
    T = hedefz[-1]
    fc.append(f'[1:a]atrim=0:{T:.3f},volume={args.muzik_db}dB,afade=t=out:st={max(0, T - 1):.3f}:d=1,'
              'aformat=sample_rates=48000:channel_layouts=stereo[a]')
    out = cikti_yolu(args.video, 'beatsync', o=args.cikti, onizleme=args.onizleme)
    ffmpeg(['-i', g, '-ss', str(args.muzik_bas), '-i', args.muzik, '-filter_complex', ';'.join(fc), '-map', '[v]',
            '-map', '[a]'] + enc(args) + AENC + ['-movflags', '+faststart', out])
    olay_yaz(out, [{'t': round(t, 3), 'tur': 'kesim', 'beat': True} for t in yeni])
    bilgi('kesimler: ' + ', '.join(f'{s:.2f}→{n:.2f}' for s, n in zip(sinir, yeni)))
    bitti(out)


if __name__ == '__main__':
    main()
