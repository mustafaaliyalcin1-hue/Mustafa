"""Konuşma Bozucu (bilgisayar programı sürümü)
Mikrofonu kulaklığa gecikmeli verir; konuşmayı çok zorlaştırır.

Kurulum:   pip install sounddevice numpy
Çalıştır:  python konusma_bozucu.py            (varsayılan 200 ms)
           python konusma_bozucu.py 500        (yarım saniye)
Çalışırken: sayı yaz + Enter → yeni gecikme (ms),  q + Enter → çıkış
"""
import sys
import threading

import numpy as np
import sounddevice as sd

ORAN = 48000
BLOK = 128           # küçük blok = düşük sistem gecikmesi
KAZANC = 1.5
MAKS_SN = 5

gecikme_ms = float(sys.argv[1]) if len(sys.argv) > 1 else 200.0
tampon = np.zeros(ORAN * MAKS_SN, dtype=np.float32)
yaz = 0
kilit = threading.Lock()


def geri_cagri(giris, cikis, kare, zaman, durum):
    global yaz
    mono = giris[:, 0]
    with kilit:
        n = len(tampon)
        idx = (yaz + np.arange(kare)) % n
        tampon[idx] = mono
        # Ses kartının kendi gecikmesini düş ki toplam gecikme ayarla tutsun
        sistem = (zaman.outputBufferDacTime - zaman.inputBufferAdcTime) if zaman.outputBufferDacTime else 0
        d = max(0, int((gecikme_ms / 1000 - max(0, sistem)) * ORAN))
        oku = (idx - d) % n
        yaz = (yaz + kare) % n
    cikis[:] = np.clip(tampon[oku] * KAZANC, -1, 1)[:, None]


def main():
    global gecikme_ms
    print(__doc__)
    print("Ses aygıtları:\n", sd.query_devices())
    with sd.Stream(samplerate=ORAN, blocksize=BLOK, channels=(1, 1), dtype="float32",
                   latency="low", callback=geri_cagri) as s:
        print(f"\nÇalışıyor. Gecikme: {gecikme_ms:.0f} ms  (ses kartı gecikmesi ~{(s.latency[0] + s.latency[1]) * 1000:.0f} ms)")
        print("KULAKLIK TAK! Yeni gecikme için sayı yaz, çıkmak için q.")
        for satir in sys.stdin:
            satir = satir.strip().lower()
            if satir in ("q", "çık", "cik"):
                break
            try:
                with kilit:
                    gecikme_ms = min(MAKS_SN * 1000 - 100, max(0.0, float(satir)))
                print(f"Gecikme: {gecikme_ms:.0f} ms")
            except ValueError:
                print("Sayı yaz (ör. 200) ya da q")


if __name__ == "__main__":
    main()
