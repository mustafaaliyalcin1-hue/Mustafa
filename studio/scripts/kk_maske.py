#!/usr/bin/env python3
"""Kişi maskesi: her kare için kişi (ön plan) maskesi, yumuşak kenar + zamansal titreme önleme.

  kk_maske.py video.mp4                      # -> <video>.maske.mkv (gri, kayıpsız FFV1)
  kk_maske.py video.mp4 -o maske.mkv --yumusak 6 --model multiclass|selfie
Motor sırası: mediapipe ImageSegmenter (selfie_multiclass_256x256 → selfie_segmenter) → rembg (u2net_human_seg).
Model dosyaları: assets/models/*.tflite (setup.sh indirir).
"""
import argparse
import os
import subprocess
import sys

import cv2
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _ortak import ASSETS, bilgi, hata, probe  # noqa: E402

MODELLER = os.path.join(ASSETS, 'models')


def mediapipe_segmenter(model):
    import mediapipe as mp
    from mediapipe.tasks.python import BaseOptions, vision
    yol = os.path.join(MODELLER, {'multiclass': 'selfie_multiclass_256x256.tflite',
                                  'selfie': 'selfie_segmenter.tflite'}[model])
    if not os.path.exists(yol):
        raise FileNotFoundError(yol)
    seg = vision.ImageSegmenter.create_from_options(vision.ImageSegmenterOptions(
        base_options=BaseOptions(model_asset_path=yol), running_mode=vision.RunningMode.VIDEO,
        output_confidence_masks=True))

    def f(rgb, ms):
        r = seg.segment_for_video(mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb), ms)
        cm = r.confidence_masks
        if len(cm) > 1:   # multiclass: 0 = arka plan
            return 1.0 - cm[0].numpy_view().astype(np.float32)
        return cm[0].numpy_view().astype(np.float32)
    f.kapat = seg.close
    return f


def rembg_segmenter():
    from rembg import new_session, remove
    s = new_session('u2net_human_seg')

    def f(rgb, ms):
        a = remove(rgb, session=s, only_mask=True)
        return np.asarray(a, dtype=np.float32) / 255.0
    return f


def maske_cikar(girdi, cikti, yumusak=5.0, model='multiclass', zamansal=0.55):
    inf = probe(girdi)
    W, H, fps = inf['w'], inf['h'], inf['fps']
    seg, motor = None, None
    for ad in ([model] if model != 'otomatik' else []) + ['multiclass', 'selfie']:
        try:
            seg, motor = mediapipe_segmenter(ad), f'mediapipe/{ad}'
            break
        except Exception as e:  # noqa: BLE001
            bilgi(f'mediapipe {ad} olmadı: {type(e).__name__}: {e}')
    if seg is None:
        try:
            seg, motor = rembg_segmenter(), 'rembg/u2net_human_seg'
        except Exception as e:  # noqa: BLE001
            hata(f'kişi maskesi motoru yok (mediapipe ve rembg başarısız): {e}')
    bilgi(f'maske motoru: {motor}')
    cap = cv2.VideoCapture(girdi)
    enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'gray', '-s', f'{W}x{H}',
                            '-r', f'{fps:g}', '-i', '-', '-c:v', 'ffv1', '-pix_fmt', 'gray', cikti], stdin=subprocess.PIPE)
    onceki, i = None, 0
    sig = max(1.0, yumusak * H / 1920)
    while True:
        ok, fr = cap.read()
        if not ok:
            break
        rgb = cv2.cvtColor(fr, cv2.COLOR_BGR2RGB)
        m = seg(np.ascontiguousarray(rgb), int(i * 1000 / fps))
        m = cv2.resize(m, (W, H), interpolation=cv2.INTER_LINEAR)
        # kenar: güven eşiğini yumuşak basamağa çevir (saç/omuz kenarı temiz), sonra hafif bulanıklaştır
        m = np.clip((m - 0.3) / 0.4, 0, 1)
        m = m * m * (3 - 2 * m)
        if onceki is not None:  # zamansal titreme önleme (hareketli bölgede daha az karıştır)
            fark = np.abs(m - onceki)
            a = np.where(fark > 0.5, 0.15, zamansal)
            m = a * onceki + (1 - a) * m
        onceki = m
        out = cv2.GaussianBlur(m, (0, 0), sig)
        enc.stdin.write((np.clip(out, 0, 1) * 255).astype(np.uint8).tobytes())
        i += 1
    cap.release()
    if hasattr(seg, 'kapat'):
        seg.kapat()
    enc.stdin.close(); enc.wait()
    if enc.returncode:
        hata('maske kodlanamadı')
    return cikti, motor


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('girdi'); ap.add_argument('-o', '--cikti')
    ap.add_argument('--yumusak', type=float, default=5.0, help='kenar yumuşatma (1920 yükseklikte px)')
    ap.add_argument('--model', default='multiclass', choices=['multiclass', 'selfie', 'otomatik'])
    a = ap.parse_args()
    out = a.cikti or os.path.splitext(a.girdi)[0] + '.maske.mkv'
    p, motor = maske_cikar(a.girdi, out, a.yumusak, a.model)
    print(p)
    bilgi(f'maske hazır → {p} ({motor})')


if __name__ == '__main__':
    main()
