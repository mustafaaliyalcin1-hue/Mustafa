#!/usr/bin/env python3
"""Beşiktaş – Hapoel Beer Sheva switch edit (kullanıcının verdiği özet parçaları + şarkı).
Yapı: sakin giriş (ağır çekim) → şarkının patlamasında (48.16 sn) beat'e oturan şut switch'leri → gol + sevinç → kararma.
Her switch'te topa temas anı tam vuruşa denk gelir; kesim 0.2 sn önce, vuruş öncesi ağır çekim (speed ramp).
Çıktı: 1080x1920; 4:5 aksiyon kırpımı ortada, üst/alt bulanık zemin.
"""
import glob
import json
import os
import subprocess
import sys

ST = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(ST, 'scripts'))
from _ortak import AENC, SFX, ffmpeg  # noqa: E402

W = os.path.join(ST, 'temp', 'bjk'); os.makedirs(os.path.join(W, 'seg'), exist_ok=True)
P = {os.path.basename(f)[4:6]: f for f in sorted(glob.glob(os.path.join(ST, 'input', 'bjk', 'part*.mp4')))}
SARKI = os.path.join(ST, 'input', 'bjk', 'sarki.m4a')
S0 = 39.335       # şarkıda editin başladığı güçlü vuruş
DROP = 48.158     # grubun tamamının girdiği an
SON = 75.233
B = [39.335, 40.008, 40.705, 41.355, 42.051, 42.678, 43.328, 44.095, 44.698, 45.372, 46.045, 46.742, 47.415, 48.158,
     48.739, 49.459, 50.155, 50.852, 51.479, 52.152, 52.825, 53.522, 54.149, 54.822, 55.565, 56.192, 56.912, 57.562,
     58.236, 58.979, 59.582, 60.233, 60.929, 61.603, 62.322, 63.019, 63.623, 64.366, 65.039, 65.712, 66.339, 67.036,
     67.756, 68.406, 69.056, 69.753, 70.403, 71.169, 71.773, 72.469, 73.143, 73.816, 74.49, 75.233]
bi = {round(b, 3): i for i, b in enumerate(B)}

# (tür, parça, kaynak_başlangıç, şarkı_başı, şarkı_sonu, hız, kırpma_merkezi_x, [temas])
SEG = [
    # --- sakin giriş: ağır çekim atmosfer ---
    ('yavas', '01', 25.6, 39.335, 40.705, 0.5, 0.50),   # BJK bayrağı, tribün
    ('yavas', '02', 22.2, 40.705, 42.051, 0.5, 0.55),   # sahaya çıkış
    ('yavas', '01', 21.6, 42.051, 43.328, 0.5, 0.50),   # küçük taraftar
    ('yavas', '09', 21.6, 43.328, 44.698, 0.5, 0.45),   # kaptan
    ('yavas', '07', 26.0, 44.698, 46.045, 0.5, 0.42),   # kaleci yakın plan
    ('yavas', '08', 32.6, 46.045, 47.415, 0.5, 0.50),   # oyuncu yüzü
    ('yavas', '01', 33.4, 47.415, 48.158 - 0.24, 0.6, 0.50),   # tribün; ilk switch 0.2 sn önce başlar (temas vuruşta)
]
# --- switch'ler: (parça, temas, merkez x) — temas = vuruş anı; her biri 2 vuruş ---
KARE = 0.04  # 25 fps kaynak
SUTLAR = [('04', 9.86, 0.47), ('06', 24.84, 0.50), ('07', 22.70, 0.47), ('05', 31.95, 0.53),
          ('16', 12.04, 0.40), ('08', 29.10, 0.47), ('15', 17.74, 0.47)]
ON = 0.24  # temas öncesi gösterilen süre: kaynakta 3 kare (0.12 sn), 0.5x ağır çekimle 0.24 sn
k = bi[DROP]
for p, c, x in SUTLAR:
    a, b = B[k] - ON, B[k + 2] - ON
    SEG.append(('sut', p, c, a, b, 1.0, x, c))
    k += 2
# son şut = gol: 10 numara, top fileye; patlayan vuruştan gole kadar
a = B[k] - ON
SEG.append(('sut', '15', 10.92, a, 61.603, 1.0, 0.48, 10.92))
SEG += [
    ('yavas', '12', 22.0, 61.603, 63.019, 0.6, 0.55),   # formasını çıkaran oyuncu
    ('yavas', '12', 25.0, 63.019, 65.039, 0.7, 0.55),   # tribüne sevinç
    ('yavas', '16', 20.0, 65.039, 66.339, 0.5, 0.45),   # kaptan gülümsüyor
    ('yavas', '16', 22.0, 66.339, 67.756, 0.6, 0.50),   # yedek kulübesi coşkusu
    ('yavas', '09', 31.5, 67.756, 69.753, 0.6, 0.45),   # sevinç
    ('yavas', '13', 33.5, 69.753, 71.169, 0.6, 0.50),   # yürüyerek sevinç
    ('yavas', '01', 27.5, 71.169, SON, 0.5, 0.50),      # tribün, kararma
]


def segment(i, s):
    tur, p, kb, a, b, hiz, x = s[:7]
    L = b - a
    out = os.path.join(W, 'seg', f'{i:02d}.mp4')
    imza = json.dumps(s)
    if os.path.exists(out) and os.path.exists(out + '.json') and open(out + '.json').read() == imza:
        return out, L  # değişmeyen segment: önbellekten
    cw = 864  # 4:5 kırpım (kaynak 1920x1080)
    cx = int(min(1920 - cw, max(0, x * 1920 - cw / 2)))
    kirp = f'crop={cw}:1080:{cx}:0'
    if tur == 'sut':
        c = round(s[7] / KARE) * KARE  # temas kare sınırında
        # ön kısım: temas öncesi ON sn, 0.5x (kaynakta ON/2); sonrası normal hız
        on_k, ark_k = ON * 0.5, L - ON
        fc = (f'[0:v]trim={c - on_k:.3f}:{c + ark_k:.3f},setpts=PTS-STARTPTS,{kirp},split[p1][p2];'
              f'[p1]trim=0:{on_k:.3f},setpts=PTS*2,minterpolate=fps=50:mi_mode=mci:mc_mode=aobmc[s1];'
              f'[p2]trim={on_k:.3f},setpts=PTS-STARTPTS,fps=50[s2];[s1][s2]concat=n=2:v=1:a=0,fps=30,'
              f'tpad=stop_mode=clone:stop_duration=0.3[v]')
    else:
        kaynak = L * hiz
        fc = (f'[0:v]trim={kb:.3f}:{kb + kaynak:.3f},setpts=PTS-STARTPTS,{kirp},setpts=PTS/{hiz},'
              f'minterpolate=fps=50:mi_mode=mci:mc_mode=aobmc,fps=30,tpad=stop_mode=clone:stop_duration=0.3[v]')
    ffmpeg(['-i', P[p], '-filter_complex', fc, '-map', '[v]', '-an', '-t', f'{L:.3f}', '-c:v', 'libx264', '-preset', 'veryfast',
            '-crf', '14', out])
    open(out + '.json', 'w').write(imza)
    return out, L


def main():
    parcalar = []
    for i, s in enumerate(SEG):
        o, L = segment(i, s)
        parcalar.append((o, L, s))
        print(f'{i:02d} {s[0]:5s} part{s[1]} {s[3] - S0:6.2f}–{s[4] - S0:6.2f} ({L:.2f} sn)', flush=True)
    liste = os.path.join(W, 'liste.txt')
    with open(liste, 'w') as f:
        for o, _, _ in parcalar:
            f.write(f"file '{o}'\n")
    ham = os.path.join(W, 'ham.mp4')
    ffmpeg(['-f', 'concat', '-safe', '0', '-i', liste, '-c', 'copy', ham])
    toplam = SON - S0
    # efekt zamanları (edit saniyesi)
    kesimler = [s[3] - S0 for s in SEG[1:]]
    temaslar = [s[3] - S0 + ON for s in SEG if s[0] == 'sut']
    drop = DROP - S0
    blur = '+'.join(f'between(t,{t - 0.05:.3f},{t + 0.07:.3f})' for t in kesimler)
    flas = '+'.join(f'between(t,{t:.3f},{t + 0.07:.3f})' for t in temaslar)
    sars = '+'.join(f'between(t,{t:.3f},{t + 0.28:.3f})' for t in temaslar)
    vf = (f"[0:v]eq=contrast=1.12:saturation=1.22:brightness=0.01,colortemperature=temperature=5600:mix=0.35,"
          f"unsharp=5:5:0.7,avgblur=sizeX=26:sizeY=1:enable='{blur}',"
          f"eq=brightness=0.28:enable='{flas}',"
          f"scale=1080:1350:flags=lanczos,split[a][b];"
          f"[b]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,gblur=sigma=40,eq=brightness=-0.18[bg];"
          f"[a]scale=iw*1.04:ih*1.04,crop=1080:1350:'(in_w-1080)/2+({sars})*14*sin(t*61)':'(in_h-1350)/2+({sars})*10*cos(t*53)'[fg];"
          f"[bg][fg]overlay=0:(H-h)/2,vignette=PI/6,"
          f"fade=t=out:st={toplam - 1.0:.3f}:d=1.0,format=yuv420p[v]")
    # ses: yalnız şarkı (spiker sesi yok) + switch'lerde hafif whoosh, patlamada vuruş
    kat = {kk['ad']: kk for kk in json.load(open(os.path.join(SFX, 'katalog.json'), encoding='utf-8'))}
    ins = ['-i', ham, '-ss', f'{S0:.3f}', '-t', f'{toplam:.3f}', '-i', SARKI]
    fc = [vf, f'[1:a]aformat=sample_rates=48000:channel_layouts=stereo,afade=t=in:d=0.3,afade=t=out:st={toplam - 1.2:.3f}:d=1.2[m]']
    lb = ['[m]']
    olay = [(t, 'whoosh_kisa', -24) for t in kesimler if t > drop - 0.3 and t < 22] + [(drop, 'impact_orta', -17)]
    for j, (t, ad, db) in enumerate(olay, 2):
        bas = max(0.0, t - kat[ad]['tepe'])
        ins += ['-i', os.path.join(SFX, kat[ad]['dosya'])]
        fc.append(f'[{j}:a]aformat=sample_rates=48000:channel_layouts=stereo,volume={db}dB,adelay={int(bas * 1000)}|{int(bas * 1000)}[s{j}]')
        lb.append(f'[s{j}]')
    fc.append(f"{''.join(lb)}amix=inputs={len(lb)}:duration=first:normalize=0[a]")
    out = os.path.join(W, 'edit.mp4')
    ffmpeg(ins + ['-filter_complex', ';'.join(fc), '-map', '[v]', '-map', '[a]', '-c:v', 'libx264', '-preset', 'medium',
                  '-crf', '16', '-r', '30'] + AENC + ['-t', f'{toplam:.3f}', '-movflags', '+faststart', out])
    print(out, f'{toplam:.2f} sn')


if __name__ == '__main__':
    main()
