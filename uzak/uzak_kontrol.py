#!/usr/bin/env python3
"""Uzak Kumanda - telefondan bilgisayarı kontrol et.

Bilgisayarda çalıştır, telefonda aynı Wi-Fi'dan ekranda yazan adresi aç,
PIN'i gir. Ekranı görürsün, dokunarak tıklarsın, klavyeden yazarsın.
"""
import io
import json
import os
import platform
import secrets
import socket
import sys
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs

try:
    import pyautogui
except ImportError:
    print("pyautogui yok. Kur:  python -m pip install -r gereksinimler.txt")
    sys.exit(1)
from PIL import ImageGrab
try:
    import pyperclip
except ImportError:
    pyperclip = None

pyautogui.FAILSAFE = False
pyautogui.PAUSE = 0

PORT = int(os.environ.get("UZAK_PORT", "8765"))
KLASOR = os.path.dirname(os.path.abspath(__file__))
PIN_DOSYA = os.path.join(KLASOR, "pin.txt")
MAC = platform.system() == "Darwin"


def pin_al():
    if os.path.exists(PIN_DOSYA):
        p = open(PIN_DOSYA, encoding="utf-8").read().strip()
        if p:
            return p
    p = "".join(secrets.choice("0123456789") for _ in range(6))
    with open(PIN_DOSYA, "w", encoding="utf-8") as f:
        f.write(p)
    return p


PIN = pin_al()
_hatalar = {}  # ip -> (sayı, zaman)
_kilit = threading.Lock()
_ekran_kilit = threading.Lock()


def yerel_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("10.255.255.255", 1))
        return s.getsockname()[0]
    except OSError:
        return "127.0.0.1"
    finally:
        s.close()


def ekran_jpeg(genislik, kalite):
    with _ekran_kilit:
        try:
            img = ImageGrab.grab()
        except Exception:
            img = pyautogui.screenshot()
    img = img.convert("RGB")
    if genislik and img.width > genislik:
        yuk = int(img.height * genislik / img.width)
        img = img.resize((genislik, yuk))
    buf = io.BytesIO()
    img.save(buf, "JPEG", quality=kalite)
    return buf.getvalue()


OZEL_TUSLAR = {
    "enter", "backspace", "esc", "tab", "space", "delete", "up", "down", "left", "right",
    "home", "end", "pageup", "pagedown", "win", "volumeup", "volumedown", "volumemute",
    "playpause", "nexttrack", "prevtrack", "f5", "f11", "ctrl", "alt", "shift", "command",
    "c", "v", "x", "z", "a", "s", "w", "l", "d", "t", "f4",
}


def yaz(metin):
    if metin.isascii():
        pyautogui.write(metin)
    elif pyperclip:
        eski = None
        try:
            eski = pyperclip.paste()
        except Exception:
            pass
        pyperclip.copy(metin)
        pyautogui.hotkey("command" if MAC else "ctrl", "v")
        time.sleep(0.15)
        if eski is not None:
            try:
                pyperclip.copy(eski)
            except Exception:
                pass
    else:
        pyautogui.write(metin.encode("ascii", "ignore").decode())


def komut(v):
    a = v.get("a")
    if a == "move":
        pyautogui.moveRel(float(v.get("dx", 0)), float(v.get("dy", 0)), _pause=False)
    elif a == "at":  # ekranda bir noktaya (0..1 oranı)
        w, h = pyautogui.size()
        x = min(max(float(v["x"]), 0), 1) * (w - 1)
        y = min(max(float(v["y"]), 0), 1) * (h - 1)
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
    elif a == "scroll":
        pyautogui.scroll(int(v.get("n", 0)))
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

    def log_message(self, *a):
        pass

    def gonder(self, kod, govde=b"", tip="text/plain; charset=utf-8"):
        self.send_response(kod)
        self.send_header("Content-Type", tip)
        self.send_header("Content-Length", str(len(govde)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(govde)

    def yetkili(self, q):
        ip = self.client_address[0]
        with _kilit:
            n, t = _hatalar.get(ip, (0, 0))
            if n >= 8 and time.time() - t < 60:
                return False
        verilen = self.headers.get("X-Pin") or q.get("k", [""])[0]
        if secrets.compare_digest(verilen.encode(), PIN.encode()):
            with _kilit:
                _hatalar.pop(ip, None)
            return True
        with _kilit:
            _hatalar[ip] = (n + 1, time.time())
        return False

    def do_GET(self):
        u = urlparse(self.path)
        q = parse_qs(u.query)
        if u.path in ("/", "/index.html"):
            return self.gonder(200, sayfa(), "text/html; charset=utf-8")
        if u.path == "/check":
            return self.gonder(200 if self.yetkili(q) else 403, b"ok")
        if u.path == "/screen":
            if not self.yetkili(q):
                return self.gonder(403, b"PIN yanlis")
            try:
                w = int(q.get("w", ["1280"])[0])
                kal = int(q.get("q", ["55"])[0])
                veri = ekran_jpeg(max(320, min(w, 3840)), max(20, min(kal, 90)))
            except Exception as e:
                return self.gonder(500, str(e).encode())
            return self.gonder(200, veri, "image/jpeg")
        self.gonder(404, b"yok")

    def do_POST(self):
        u = urlparse(self.path)
        q = parse_qs(u.query)
        if u.path != "/api":
            return self.gonder(404, b"yok")
        if not self.yetkili(q):
            return self.gonder(403, b"PIN yanlis")
        try:
            n = int(self.headers.get("Content-Length", "0"))
            v = json.loads(self.rfile.read(min(n, 100000)) or b"{}")
            ok = komut(v)
        except Exception as e:
            return self.gonder(400, str(e).encode())
        self.gonder(200 if ok else 400, b"ok" if ok else b"bilinmeyen")


def main():
    ip = yerel_ip()
    sunucu = ThreadingHTTPServer(("0.0.0.0", PORT), Isleyici)
    print("=" * 46)
    print("  UZAK KUMANDA calisiyor")
    print(f"  Telefonda ac :  http://{ip}:{PORT}")
    print(f"  PIN          :  {PIN}")
    print("  (Telefon ve bilgisayar ayni Wi-Fi'da olmali)")
    print("  Kapatmak icin bu pencereyi kapat / Ctrl+C")
    print("=" * 46)
    try:
        sunucu.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
