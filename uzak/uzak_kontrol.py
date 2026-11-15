#!/usr/bin/env python3
"""Uzak Kumanda - telefondan bilgisayarı kontrol et.

Bilgisayarda çalıştır, telefonda aynı Wi-Fi'dan ekranda yazan adresi aç,
PIN'i gir. Ekranı görürsün, dokunarak tıklarsın, klavyeden yazarsın.
"""
import io
import ipaddress
import json
import os
import platform
import secrets
import socket
import sys
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse

try:
    import pyautogui  # Windows'ta içe aktarılırken DPI farkındalığını da açar
    from PIL import Image, ImageDraw, ImageGrab
except ImportError:
    print("Gerekli paketler eksik. Kur:  python -m pip install -r gereksinimler.txt")
    sys.exit(1)
try:
    import pyperclip
except ImportError:
    pyperclip = None

pyautogui.FAILSAFE = False
pyautogui.PAUSE = 0

PORT = int(os.environ.get("UZAK_PORT", "8765"))
KLASOR = os.path.dirname(os.path.abspath(__file__))
PIN_DOSYA = os.path.join(KLASOR, "pin.txt")
SISTEM = platform.system()
WIN, MAC = SISTEM == "Windows", SISTEM == "Darwin"
MAKS_HATA, KILIT_SN = 8, 60


def pin_al():
    if os.path.exists(PIN_DOSYA):
        p = open(PIN_DOSYA, encoding="utf-8-sig").read().strip()
        if p and p.isascii() and len(p) <= 32:
            return p
        if p:
            print("UYARI: pin.txt geçersiz (Türkçe harf olmasın, en fazla 32 karakter). Yeni PIN üretildi.")
    p = "".join(secrets.choice("0123456789") for _ in range(6))
    with open(PIN_DOSYA, "w", encoding="utf-8") as f:
        f.write(p)
    return p


PIN = pin_al()
_hatalar = {}  # ip -> [sayı, son hata zamanı]
_kilit = threading.Lock()
_ekran_kilit = threading.Lock()
_komut_kilit = threading.Lock()  # pyautogui aynı anda tek komut çalıştırsın


def yerel_ipler():
    ana = None
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("10.255.255.255", 1))
        ana = s.getsockname()[0]
    except OSError:
        pass
    finally:
        s.close()
    digerleri = []
    try:
        for bilgi in socket.getaddrinfo(socket.gethostname(), None, socket.AF_INET):
            ip = bilgi[4][0]
            if not ip.startswith("127.") and ip != ana and ip not in digerleri:
                digerleri.append(ip)
    except OSError:
        pass
    return ([ana] if ana else []) + digerleri or ["127.0.0.1"]


# ---------------- ekran ----------------
def ekran_jpeg(genislik, kalite):
    with _ekran_kilit:
        img = ImageGrab.grab()
    img = img.convert("RGB")
    sw, _ = pyautogui.size()
    olcek = img.width / sw  # Mac Retina'da görüntü mantıksal boyuttan büyük olabilir
    if genislik and img.width > genislik:
        yuk = int(img.height * genislik / img.width)
        olcek *= genislik / img.width
        img = img.resize((genislik, yuk), Image.BILINEAR, reducing_gap=2.0)
    # Windows ekran görüntüsünde fare imleci olmaz: işaretçiyi kendimiz çiziyoruz
    try:
        mx, my = pyautogui.position()
        x, y, r = mx * olcek, my * olcek, max(9, img.width // 80)
        d = ImageDraw.Draw(img)
        d.ellipse((x - r - 2, y - r - 2, x + r + 2, y + r + 2), outline=(0, 0, 0), width=2)
        d.ellipse((x - r, y - r, x + r, y + r), outline=(255, 255, 255), width=2)
        d.ellipse((x - 2, y - 2, x + 2, y + 2), fill=(255, 60, 60))
    except Exception:
        pass
    buf = io.BytesIO()
    img.save(buf, "JPEG", quality=kalite)
    return buf.getvalue()


# ---------------- klavye ----------------
OZEL_TUSLAR = {
    "enter", "backspace", "esc", "tab", "space", "delete", "up", "down", "left", "right",
    "home", "end", "pageup", "pagedown", "win", "volumeup", "volumedown", "volumemute",
    "playpause", "nexttrack", "prevtrack", "f5", "f11", "ctrl", "alt", "shift", "command",
    "c", "v", "x", "z", "a", "s", "w", "d", "t", "f4",
}

if WIN:
    import ctypes
    from ctypes import wintypes

    class _KEYBDINPUT(ctypes.Structure):
        _fields_ = [("wVk", wintypes.WORD), ("wScan", wintypes.WORD), ("dwFlags", wintypes.DWORD),
                    ("time", wintypes.DWORD), ("dwExtraInfo", ctypes.c_size_t)]

    class _MOUSEINPUT(ctypes.Structure):
        _fields_ = [("dx", wintypes.LONG), ("dy", wintypes.LONG), ("mouseData", wintypes.DWORD),
                    ("dwFlags", wintypes.DWORD), ("time", wintypes.DWORD), ("dwExtraInfo", ctypes.c_size_t)]

    class _U(ctypes.Union):
        _fields_ = [("ki", _KEYBDINPUT), ("mi", _MOUSEINPUT)]

    class _INPUT(ctypes.Structure):
        _fields_ = [("type", wintypes.DWORD), ("u", _U)]

    def _unicode_gonder(satir):
        """Klavye düzeninden bağımsız yazar (ş, ğ, İ, @, { ... hepsi doğru çıkar)."""
        veri = satir.encode("utf-16-le")
        kodlar = [int.from_bytes(veri[i:i + 2], "little") for i in range(0, len(veri), 2)]
        dizi = []
        for k in kodlar:
            for bayrak in (0x0004, 0x0004 | 0x0002):  # KEYEVENTF_UNICODE, + KEYUP
                inp = _INPUT(type=1)
                inp.u.ki = _KEYBDINPUT(0, k, bayrak, 0, 0)
                dizi.append(inp)
        if dizi:
            arr = (_INPUT * len(dizi))(*dizi)
            ctypes.windll.user32.SendInput(len(dizi), arr, ctypes.sizeof(_INPUT))


def _pano_ile_yaz(metin):
    eski = None
    try:
        eski = pyperclip.paste()
    except Exception:
        pass
    pyperclip.copy(metin)
    pyautogui.hotkey("command" if MAC else "ctrl", "v")
    time.sleep(0.5)  # yavaş uygulamalar yapıştırmayı bitirsin
    if eski:
        try:
            pyperclip.copy(eski)
        except Exception:
            pass


def yaz(metin):
    satirlar = metin.replace("\r\n", "\n").split("\n")
    for i, satir in enumerate(satirlar):
        if i:
            pyautogui.press("enter")
        if not satir:
            continue
        if WIN:
            _unicode_gonder(satir)
        elif all(c.isascii() and (c.isalnum() or c == " ") for c in satir) or not pyperclip:
            pyautogui.write(satir)  # sadece harf/rakam: her klavye düzeninde aynı
        else:
            try:
                _pano_ile_yaz(satir)  # sembol ve Türkçe harfler panodan
            except Exception:  # pano kullanılamıyorsa elden geldiğince yaz
                pyautogui.write(satir.encode("ascii", "ignore").decode())


# ---------------- komutlar ----------------
def komut(v):
    a = v.get("a")
    if a == "move":
        pyautogui.moveRel(int(v.get("dx", 0)), int(v.get("dy", 0)), _pause=False)
    elif a == "at":  # ekranda bir noktaya (0..1 oranı)
        xo, yo = float(v["x"]), float(v["y"])
        if not (0 <= xo <= 1 and 0 <= yo <= 1):
            return False  # görüntünün dışındaki siyah alana dokunuldu
        w, h = pyautogui.size()
        x, y = xo * (w - 1), yo * (h - 1)
        b = v.get("b")
        if b == "double":
            pyautogui.doubleClick(x, y)
        elif b in ("left", "right"):
            pyautogui.click(x, y, button=b)
        else:
            pyautogui.moveTo(x, y)
    elif a == "click":
        b = v.get("b", "left")
        if b == "double":
            pyautogui.doubleClick()
        else:
            pyautogui.click(button="right" if b == "right" else "left")
    elif a == "down":
        pyautogui.mouseDown()
    elif a == "up":
        pyautogui.mouseUp()
    elif a == "scroll":  # n = tık sayısı (+ yukarı, - aşağı)
        n = max(-20, min(20, int(v.get("n", 0))))
        pyautogui.scroll(n * (120 if WIN else 3 if MAC else 1))
    elif a == "type":
        yaz(str(v.get("t", ""))[:2000])
    elif a == "key":
        k = str(v.get("k", ""))
        if k not in OZEL_TUSLAR:
            return False
        pyautogui.press(k)
    elif a == "hotkey":
        keys = [str(k) for k in v.get("k", [])][:4]
        if MAC:
            keys = ["command" if k == "ctrl" else k for k in keys]
        if not keys or not all(k in OZEL_TUSLAR for k in keys):
            return False
        pyautogui.hotkey(*keys)
    else:
        return False
    return True


def sayfa():
    return open(os.path.join(KLASOR, "kumanda.html"), "rb").read()


class Isleyici(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"
    timeout = 30

    def log_message(self, *a):
        pass

    def gonder(self, kod, govde=b"", tip="text/plain; charset=utf-8"):
        self.send_response(kod)
        self.send_header("Content-Type", tip)
        self.send_header("Content-Length", str(len(govde)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(govde)

    def host_uygun(self):
        """DNS rebinding'e karşı: sadece IP adresiyle veya localhost ile gelinsin."""
        h = (self.headers.get("Host") or "").strip()
        if h.startswith("["):
            h = h[1:h.find("]")]
        else:
            h = h.rsplit(":", 1)[0]
        if h == "localhost":
            return True
        try:
            ipaddress.ip_address(h)
            return True
        except ValueError:
            return False

    def yetki(self):
        """200 = tamam, 403 = yanlış PIN, 429 = çok deneme."""
        ip = self.client_address[0]
        simdi = time.time()
        with _kilit:
            kayit = _hatalar.get(ip)
            if kayit and simdi - kayit[1] > KILIT_SN:
                _hatalar.pop(ip, None)
                kayit = None
            if kayit and kayit[0] >= MAKS_HATA:
                return 429
            verilen = self.headers.get("X-Pin") or ""
            if secrets.compare_digest(verilen.encode("utf-8", "replace"), PIN.encode()):
                _hatalar.pop(ip, None)
                return 200
            _hatalar[ip] = [(kayit[0] if kayit else 0) + 1, simdi]
            return 403

    def red(self, kod):
        self.gonder(kod, "Çok fazla yanlış deneme, 1 dakika bekle".encode() if kod == 429 else b"PIN yanlis")

    def do_GET(self):
        u = urlparse(self.path)
        if not self.host_uygun():
            return self.gonder(403, b"Host")
        if u.path in ("/", "/index.html"):
            return self.gonder(200, sayfa(), "text/html; charset=utf-8")
        if u.path == "/check":
            kod = self.yetki()
            return self.gonder(200, b"ok") if kod == 200 else self.red(kod)
        if u.path == "/screen":
            kod = self.yetki()
            if kod != 200:
                return self.red(kod)
            q = dict(p.split("=", 1) for p in u.query.split("&") if "=" in p)
            try:
                w = int(q.get("w", "1280"))
                kal = int(q.get("q", "55"))
                veri = ekran_jpeg(max(320, min(w, 3840)), max(20, min(kal, 90)))
            except Exception as e:  # kilit ekranı / yönetici izni penceresi vb.
                return self.gonder(503, str(e).encode())
            return self.gonder(200, veri, "image/jpeg")
        self.gonder(404, b"yok")

    def do_POST(self):
        try:
            n = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            n = -1
        if n < 0 or n > 100000:
            self.close_connection = True
            return self.gonder(413, b"buyuk")
        govde = self.rfile.read(n) if n else b""  # her durumda gövdeyi oku
        if not self.host_uygun():
            return self.gonder(403, b"Host")
        if urlparse(self.path).path != "/api":
            return self.gonder(404, b"yok")
        kod = self.yetki()
        if kod != 200:
            return self.red(kod)
        try:
            v = json.loads(govde or b"{}")
            with _komut_kilit:
                ok = komut(v)
        except Exception as e:
            return self.gonder(400, str(e).encode())
        self.gonder(200 if ok else 400, b"ok" if ok else b"bilinmeyen")


def main():
    try:
        sunucu = ThreadingHTTPServer(("0.0.0.0", PORT), Isleyici)
    except OSError:
        print(f"Port {PORT} kullanımda: Uzak Kumanda büyük ihtimalle zaten açık.")
        print("Açık olan diğer siyah pencereyi kullan ya da onu kapatıp tekrar başlat.")
        sys.exit(1)
    ipler = yerel_ipler()
    print("=" * 50)
    print("  UZAK KUMANDA çalışıyor")
    print(f"  Telefonda aç :  http://{ipler[0]}:{PORT}")
    for ip in ipler[1:]:
        print(f"  (olmazsa dene:  http://{ip}:{PORT} )")
    print(f"  PIN          :  {PIN}")
    print("  (Telefon ve bilgisayar aynı Wi-Fi'da olmalı)")
    print("  Kapatmak için bu pencereyi kapat / Ctrl+C")
    print("=" * 50)
    try:
        sunucu.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
