#!/usr/bin/env python3
"""Konuşan kafa modu için SENTETİK test girdisi (gerçek video yoksa).
Görüntü: anonim stok kişi fotoğrafı (mediapipe test varlığı) 9:16 kırpılıp hafif hareketlendirilir;
inemezse çizilmiş bir siluet kullanılır. Ses: espeak-ng Türkçe TTS; cümleler arası sessizlik + nefes + oda gürültüsü.
Çıktı: input/kk_test.mp4 ve input/kk_test_metin.txt
"""
import os
import subprocess
import sys
import urllib.request

import numpy as np
from scipy.io import wavfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _ortak import STUDIO, TEMP, bilgi, ffmpeg  # noqa: E402

INP = os.path.join(STUDIO, 'input')
SR = 48000
CUMLELER = [
    'Videolarını daha çok kişiye ulaştırmak ister misin?',
    'Bugün sana üç basit kural anlatacağım.',
    'Birinci kural: ilk üç saniyede merak uyandır.',
    'İkinci kural: her cümlede tek bir fikir olsun.',
    'Üçüncü kural: sonunda net bir çağrı yap.',
    'Asıl sır şu: izleyici sıkılmadan önce sen değiş.',
    'Hemen dene ve sonucu yorumlara yaz.',
]


def gorsel():
    p = os.path.join(TEMP, 'kk_kisi.jpg')
    if os.path.exists(p):
        return p
    try:
        urllib.request.urlretrieve('https://storage.googleapis.com/mediapipe-assets/pose.jpg', p)
        return p
    except Exception as e:  # noqa: BLE001
        bilgi(f'stok görsel inmedi ({e}); çizilmiş siluet kullanılıyor')
    from PIL import Image, ImageDraw
    im = Image.new('RGB', (1080, 1920), (70, 110, 150)); d = ImageDraw.Draw(im)
    d.ellipse((390, 520, 690, 860), fill=(205, 160, 130)); d.rounded_rectangle((250, 880, 830, 1920), 160, fill=(40, 40, 50))
    im.save(p); return p


def ses():
    rng = np.random.default_rng(3)
    parcalar = [np.zeros(int(SR * 0.5))]
    for i, c in enumerate(CUMLELER):
        w = os.path.join(TEMP, f'kk_tts_{i}.wav')
        subprocess.run(['espeak-ng', '-v', 'tr', '-s', '165', '-p', '45', '-w', w, c], check=True)
        sr, y = wavfile.read(w)
        y = y.astype(np.float32) / 32768
        if y.ndim > 1:
            y = y.mean(1)
        y = np.interp(np.arange(int(len(y) * SR / sr)) * sr / SR, np.arange(len(y)), y)
        parcalar.append(y * 0.8)
        bos = rng.uniform(0.55, 1.1)
        b = np.zeros(int(SR * bos))
        if i % 2 == 0:  # nefes: filtrelenmiş gürültü, ~0.3 sn
            L = int(SR * 0.32); t = np.arange(L) / SR
            n = rng.standard_normal(L)
            n = np.convolve(n, np.ones(30) / 30, 'same') - np.convolve(n, np.ones(300) / 300, 'same')
            nef = n * np.sin(np.pi * t / t[-1]) ** 2 * 0.05
            k = int(len(b) * 0.3); b[k:k + L] += nef[:len(b) - k]
        parcalar.append(b)
    y = np.concatenate(parcalar)
    y += rng.standard_normal(len(y)) * 0.0015  # oda gürültüsü (~ -56 dBFS)
    wav = os.path.join(TEMP, 'kk_tts.wav')
    wavfile.write(wav, SR, (np.clip(y, -1, 1) * 32767).astype(np.int16))
    return wav, len(y) / SR


if __name__ == '__main__':
    os.makedirs(INP, exist_ok=True)
    img = gorsel()
    wav, D = ses()
    # 9:16 kırp (kişi ortada), 1080x1920, yavaş itme + hafif salınım (el kamerası hissi)
    vf = ("crop='min(iw,ih*9/16)':ih,scale=1080:1920:flags=lanczos,"
          "zoompan=z='1.04+0.03*on/({n})':x='iw/2-iw/zoom/2+6*sin(on/23)':y='ih/2-ih/zoom/2+4*sin(on/31)':"
          "d=1:s=1080x1920:fps=30").format(n=int(D * 30))
    out = os.path.join(INP, 'kk_test.mp4')
    ffmpeg(['-loop', '1', '-framerate', '30', '-t', f'{D:.3f}', '-i', img, '-i', wav, '-vf', vf + ',format=yuv420p',
            '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-c:a', 'aac', '-b:a', '192k', '-shortest', out])
    with open(os.path.join(INP, 'kk_test_metin.txt'), 'w', encoding='utf-8') as f:
        f.write(' '.join(CUMLELER) + '\n')
    bilgi(f'test girdisi: {out} ({D:.1f} sn) + kk_test_metin.txt')
    print(out)
