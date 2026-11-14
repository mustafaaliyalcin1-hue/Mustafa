#!/usr/bin/env python3
"""Platform export: Reels / TikTok / Shorts (1080x1920), YouTube (1920x1080), kare (1080x1080), 4:5 (1080x1350).
H.264 High, yüksek bitrate, AAC 320k 48 kHz, -14 LUFS, +faststart, BT.709 etiketleri.

  export.py video.mp4                         # varsayılan: reels, 30 fps
  export.py video.mp4 --platform tiktok --fps 60
  export.py video.mp4 --platform youtube --fps 60 --akici     # 30→60 kare enterpolasyonu
  export.py video.mp4 --platform reels --sigdir bulanik       # en-boy farklıysa: akilli | bulanik | merkez
  export.py video.mp4 --hepsi                                 # reels + youtube + kare tek seferde
"""
import argparse
import os
import subprocess
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _ortak import TEMP, bilgi, bitti, cikti_yolu, ffmpeg, probe, olay_aktar  # noqa: E402

PLATFORM = {
    'reels': (1080, 1920, '9:16', '25M'), 'tiktok': (1080, 1920, '9:16', '25M'), 'shorts': (1080, 1920, '9:16', '25M'),
    'youtube': (1920, 1080, '16:9', '40M'), 'kare': (1080, 1080, '1:1', '20M'), '4x5': (1080, 1350, '4:5', '20M'),
}


def export(girdi, platform, fps, sigdir, akici, cikti=None, normalize=True):
    W, H, oran, maxrate = PLATFORM[platform]
    inf = probe(girdi)
    kaynak = girdi
    if abs(inf['w'] / inf['h'] - W / H) > 0.01:
        tmp = os.path.join(TEMP, f'export_kirp_{os.getpid()}_{platform}.mp4')
        bilgi(f'en-boy farklı → {sigdir} kırpma ({oran})')
        r = subprocess.run([sys.executable, os.path.join(os.path.dirname(__file__), 'kirp.py'), girdi, '--oran', oran,
                            '--mod', sigdir, '--boyut', f'{W}x{H}', '-o', tmp], capture_output=True, text=True)
        if r.returncode:
            print(r.stderr, file=sys.stderr); sys.exit(1)
        kaynak = tmp
    vf = f'scale={W}:{H}:force_original_aspect_ratio=decrease:flags=lanczos,pad={W}:{H}:(ow-iw)/2:(oh-ih)/2,setsar=1'
    if fps > inf['fps'] + 1 and akici:
        vf += f',minterpolate=fps={fps}:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1'
    else:
        vf += f',fps={fps}'
    vf += ',format=yuv420p'
    af = ('loudnorm=I=-14:TP=-1.0:LRA=11,' if normalize else '') + 'aresample=48000'
    out = cikti_yolu(girdi, f'{platform}_{fps}fps', o=cikti)
    ses = probe(kaynak)['ses']
    ffmpeg(['-i', kaynak, '-vf', vf] + (['-af', af] if ses else []) +
           ['-c:v', 'libx264', '-profile:v', 'high', '-level:v', '4.2', '-preset', 'slow', '-crf', '16',
            '-maxrate', maxrate, '-bufsize', str(int(maxrate[:-1]) * 2) + 'M', '-g', str(fps * 2), '-bf', '2',
            '-pix_fmt', 'yuv420p', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709',
            '-color_range', 'tv'] +
           (['-c:a', 'aac', '-b:a', '320k', '-ar', '48000', '-ac', '2'] if ses else ['-an']) +
           ['-t', f'{inf["sure"]:.3f}', '-movflags', '+faststart', out])
    olay_aktar(girdi, out)
    return out


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('girdi')
    ap.add_argument('--platform', default='reels', choices=list(PLATFORM))
    ap.add_argument('--fps', type=int, default=30, choices=[24, 25, 30, 50, 60])
    ap.add_argument('--sigdir', default='akilli', choices=['akilli', 'bulanik', 'merkez'])
    ap.add_argument('--akici', action='store_true'); ap.add_argument('--normalize-yok', action='store_true')
    ap.add_argument('--hepsi', action='store_true'); ap.add_argument('-o', '--cikti')
    args = ap.parse_args()
    hedefler = ['reels', 'youtube', 'kare'] if args.hepsi else [args.platform]
    for p in hedefler:
        out = export(args.girdi, p, args.fps, args.sigdir, args.akici, None if args.hepsi else args.cikti,
                     not args.normalize_yok)
        bitti(out)


if __name__ == '__main__':
    main()
