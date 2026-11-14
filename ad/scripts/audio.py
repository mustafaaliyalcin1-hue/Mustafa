# Müzik + ses efektleri, tamamen numpy sentezi. Zaman = teslim saniyesi (doğal kare f -> f/30 s).
# python3 audio.py out.wav
import sys, numpy as np
from scipy import signal
import pyloudnorm as pyln
SR = 48000
rng = np.random.default_rng(8)
sys.path.insert(0, __import__('os').path.dirname(__import__('os').path.abspath(__file__)))
import timeline as TL
from timeline import delivered_of_old
DUR = TL.NG / 30 + 1.5; N = int(SR * DUR) + SR
def T(f): return delivered_of_old(f) / 30.0     # yazım karesi -> teslim zamanı (yavaşlatma + kurgu sırası)
BPM = 154; B = 60 / BPM; DROP = T(57)          # SNAP = drop
def beat(n): return DROP + n * B               # n<0 => drop öncesi
mus = np.zeros((N, 2)); sfx = np.zeros((N, 2))

def env(n, a, d, s=0.0, r=0.0, hold=0):
    a, d, r = int(a * SR), int(d * SR), int(r * SR)
    e = np.concatenate([np.linspace(0, 1, max(a, 1)), np.linspace(1, s, max(d, 1)), np.full(max(hold, 0), s), np.linspace(s, 0, max(r, 1))])
    return e[:n] if len(e) >= n else np.pad(e, (0, n - len(e)))
def add(buf, t, x, g=1.0, pan=0.0):
    i = int(t * SR)
    if i < 0: x = x[-i:]; i = 0
    x = x[:max(0, N - i)]
    if x.ndim == 1: x = np.stack([x * np.sqrt(0.5 * (1 - pan)), x * np.sqrt(0.5 * (1 + pan))], 1) * np.sqrt(2)
    buf[i:i + len(x)] += x * g
def bp(x, lo, hi, o=2): return signal.sosfilt(signal.butter(o, [lo, hi], 'band', fs=SR, output='sos'), x)
def lp(x, fc, o=2): return signal.sosfilt(signal.butter(o, fc, 'low', fs=SR, output='sos'), x)
def hp(x, fc, o=2): return signal.sosfilt(signal.butter(o, fc, 'high', fs=SR, output='sos'), x)
def noise(d): return rng.standard_normal(int(d * SR))
def tt(d): return np.arange(int(d * SR)) / SR
def mtof(m): return 440 * 2 ** ((m - 69) / 12)
def saw(fr, d, det=0.0):
    t = tt(d); ph = (fr * (1 + det)) * t + rng.random(); return 2 * (ph % 1) - 1

# ---------------- MÜZİK: minimalist, sözsüz, 8D (başın etrafında dönen) ----------------
# D majör, 154 BPM ızgarası (kesmelere oturur) ama yarı tempo hissi: seyrek keçe piyano, sıcak ped, yumuşak ritim.
CH = [[50, 57, 62, 66, 69], [45, 57, 61, 64, 69], [47, 59, 62, 66, 71], [43, 55, 59, 62, 67]]
ROOT = [38, 33, 35, 31]
def pad(notes, d, cut=1800, g=0.05):
    x = np.zeros(int(d * SR))
    for m in notes:
        for det in (-0.004, 0.0, 0.005):
            x += saw(mtof(m), d, det)
    return lp(x, cut, 2) * env(len(x), 0.8, 0.5, 0.75, 1.2, int(max(0, d - 2.5) * SR)) * g / len(notes)
def piano(m, d=2.6, g=0.12):
    """keçe piyano: yumuşak vuruş, harmonikler hızlı söner"""
    t = tt(d); f = mtof(m)
    x = (np.sin(2 * np.pi * f * t) * np.exp(-t * 1.6) + 0.35 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t * 3.5)
         + 0.12 * np.sin(2 * np.pi * 3.01 * f * t) * np.exp(-t * 6) + 0.05 * np.sin(2 * np.pi * 4.02 * f * t) * np.exp(-t * 9))
    x *= np.minimum(1, t / 0.008)                           # yumuşak çekiç
    x += lp(noise(d), 1200) * np.exp(-t * 60) * 0.02        # keçe sesi
    return lp(x, 3800) * g
def pluck(m, d=0.22, g=0.10):
    t = tt(d); x = (np.sin(2 * np.pi * mtof(m) * t) + 0.3 * saw(mtof(m), d)) * np.exp(-t * 18)
    return lp(x, 5000) * g
def kick(g=0.9):
    t = tt(0.35); f = 45 + 90 * np.exp(-t * 30); x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 10)
    return lp(x, 900) * g
def hat(g=0.05, d=0.05): return hp(noise(d), 8000) * env(int(d * SR), 0.001, d * 0.9) * g
def clap(g=0.22):
    x = np.zeros(int(0.25 * SR))
    for k in range(3): x[int(k * 0.011 * SR):] += bp(noise(0.25), 900, 2500)[:len(x) - int(k * 0.011 * SR)] * np.exp(-tt(0.25 - k * 0.011) * 30)[:len(x) - int(k * 0.011 * SR)]
    return x * g
def rim(g=0.06): t = tt(0.06); return (bp(noise(0.06), 1800, 4200) * np.exp(-t * 90) + np.sin(2 * np.pi * 1700 * t) * np.exp(-t * 120) * 0.4) * g
def sub(m, d, g=0.22):
    t = tt(d); return np.sin(2 * np.pi * mtof(m) * t) * env(len(t), 0.02, 0.1, 0.85, 0.2, int(max(0, d - 0.35) * SR)) * g

END_MUS = T(850)                                    # son akor (künye)
FILTER_DOWN = (T(830), T(836))
BAR = 4 * B
# giriş: hava, ince ped + piyano motifi + yumuşak kabarma (drop = SNAP)
add(mus, 0.0, pad([62, 66, 69, 74], DROP + 0.5, cut=1300, g=0.045))
for k, m in enumerate([74, 69, 66, 69, 74, 76]):
    tk = k * (DROP / 6)
    add(mus, tk, piano(m, 2.4, 0.07 + 0.01 * k))
sw = noise(DROP); swt = np.linspace(0, 1, len(sw)); add(mus, 0.0, lp(sw, 2500) * swt ** 3 * 0.035)
# drop sonrası
t0 = DROP; nbar = 0
# piyano motifi: her ölçüde akor tonlarından seyrek 4 nota (yarı tempo: vuruş 1, 2&, 3, 4&)
MOTIF = [(0, 4), (1.5, 3), (2, 2), (3.5, 3)]
while t0 < END_MUS - 0.01:
    c = nbar % 4
    fd = FILTER_DOWN[0] - 0.2 <= t0 < FILTER_DOWN[1] + 0.3
    lift = (T(234) <= t0 < T(300)) or (T(472) <= t0 < T(591) + 1 / 30) or (T(682) <= t0 < T(801) + 1 / 30)
    add(mus, t0, pad(CH[c], BAR + 0.6, cut=2600 if lift else 1900, g=0.06))
    for off, idx in MOTIF:
        tb = t0 + off * B
        if tb >= END_MUS: break
        add(mus, tb, piano(CH[c][idx] + 12, 2.0, 0.10 if not fd else 0.05))
    if lift:                                         # yükselişte üst oktav ışıltı
        for j in range(8):
            tb = t0 + j * B / 2
            if tb < END_MUS: add(mus, tb, pluck(CH[c][1 + j % 4] + 24, 0.18, 0.025), pan=0.0)
    for k in range(4):
        tb = t0 + k * B
        if tb >= END_MUS: break
        if not fd:
            if k in (0, 2): add(mus, tb, kick(0.55))             # yarı tempo hissi
            if k in (1, 3): add(mus, tb, rim(0.05))
            add(mus, tb + B / 2, hat(0.025))
        add(mus, tb, sub(ROOT[c], B * 0.95, 0.16 if not fd else 0.06))
    t0 += BAR; nbar += 1
# Fold8 bölümüne geçişte yumuşak kabarma
rr = noise(0.9); add(mus, T(234) - 0.9, lp(rr, 3000) * np.linspace(0, 1, len(rr)) ** 2 * 0.03)
crash = hp(noise(2.5), 5000) * np.exp(-tt(2.5) * 2.0) * 0.035; add(mus, T(234), crash)
# son akor: piyano + ped, son karta kadar çınlar
for m in [50, 57, 62, 66, 69, 74]: add(mus, END_MUS, piano(m, 3.4, 0.09))
add(mus, END_MUS, pad([50, 57, 62, 66, 69, 74, 78], 3.4, cut=2200, g=0.06)); add(mus, END_MUS, kick(0.6))

# ---- 8D: müziği başın etrafında döndür (seviye farkı + zaman farkı + arkada boğukluk) + yankı ----
def eight_d(x, period=10.0):
    n = len(x); t = np.arange(n) / SR
    th = 2 * np.pi * t / period                        # 0: önde, π/2: sağ, π: arkada, 3π/2: sol
    th = th + 0.6 * np.sin(2 * np.pi * t / (period * 2.7))   # dönüş hızı hafifçe değişir
    m = x.mean(1)
    s = np.sin(th); c = np.cos(th)
    gl = np.sqrt(0.5 * (1 - 0.92 * s)); gr = np.sqrt(0.5 * (1 + 0.92 * s))
    # arkadayken (c<0) tiz kıs: önden/arkadan karışım
    back = np.clip(-c, 0, 1) ** 1.2
    mlp = lp(m, 2200, 2)
    src = m * (1 - 0.55 * back) + mlp * 0.55 * back
    # zaman farkı (ITD): uzak kulak 0..0.6 ms gecikir (zamanla değişen gecikme)
    itd = 0.00062 * s
    idx = np.arange(n)
    dl = np.clip(itd, 0, None) * SR; dr = np.clip(-itd, 0, None) * SR
    L = np.interp(idx - dl, idx, src) * gl; R = np.interp(idx - dr, idx, src) * gr
    out = np.stack([L, R], 1)
    # stereo genişlik: orijinal stereo içeriğin bir kısmını koru
    return out * 0.85 + x * 0.15
def reverb(x, d=2.2, mix=0.22):
    n = int(d * SR); ir = noise(d) * np.exp(-np.arange(n) / SR * 3.2); ir = lp(ir, 6000)
    irs = [ir, np.roll(ir, 317)]
    out = np.stack([signal.fftconvolve(x[:, i], irs[i])[:len(x)] for i in range(2)], 1)
    out *= np.max(np.abs(x)) / (np.max(np.abs(out)) + 1e-9)
    return x * (1 - mix) + out * mix
mus = reverb(eight_d(mus), 2.2, 0.20)

# ---- İsteğe bağlı: Samsung filminin müziğiyle kurgu (MUSIC=samsung). Ses logosu (29,7 sn) kullanılmaz. ----
import os as _os
if _os.environ.get('MUSIC') == 'samsung':
    import soundfile as _sf
    src, _sr = _sf.read(_os.path.join(_os.path.dirname(_os.path.abspath(__file__)), '..', 'build', 'samsung_audio.wav'))
    assert _sr == SR
    BP = 0.4805; DB = lambda k: 0.5855 + 4 * BP * k            # kaynakta ölçü başları (124,9 BPM)
    def piece(a, b): return src[int(a * SR):int(b * SR)].copy()
    XF = int(0.04 * SR)
    def join(parts):
        out = parts[0]
        for p in parts[1:]:
            w = np.linspace(0, 1, XF)[:, None]
            head = out[-XF:] * np.sqrt(1 - w) + p[:XF] * np.sqrt(w)
            out = np.concatenate([out[:-XF], head, p[XF:]])
        return out
    drop_src = DB(5)                                           # 10,196 sn: kaynaktaki asıl yükseliş
    A = piece(drop_src - DROP, drop_src + 0.04)
    A[:int(0.4 * SR)] *= np.linspace(0, 1, int(0.4 * SR))[:, None]
    body1 = piece(DB(5), DB(11) + 0.04); loop = piece(DB(6), DB(11) + 0.04)
    C = piece(DB(11), 29.30)
    C[-int(0.5 * SR):] *= np.linspace(1, 0, int(0.5 * SR))[:, None]
    bed = join([A, body1, loop, loop, C])
    mus = np.zeros((N, 2)); mus[:min(N, len(bed))] = bed[:N]
    mus = reverb(eight_d(mus, 10.0), 1.6, 0.08)
    print('müzik: Samsung filmi kurgusu, süre', round(len(bed) / SR, 2))

# ---------------- SES EFEKTLERİ ----------------
def click(g=0.5, fc=3500, d=0.02):
    x = bp(noise(d), fc * 0.6, fc * 1.6) * np.exp(-tt(d) * 260); return x * g
def thump(g=0.6, f0=90, d=0.25):
    t = tt(d); fr = f0 * (1 + 1.5 * np.exp(-t * 40)); return np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t * 14) * g
def whoosh(d=0.45, lo=300, hi=3500, g=0.25, rev=False):
    x = noise(d); n = len(x); out = np.zeros(n); steps = 24
    for i in range(steps):
        fc = lo * (hi / lo) ** (i / (steps - 1)); s0, s1 = int(i / steps * n), int((i + 1) / steps * n)
        out[s0:s1] = bp(x, fc * 0.7, min(fc * 1.4, 20000))[s0:s1]
    e = np.sin(np.pi * np.linspace(0, 1, n)) ** 1.5
    if rev: out = out[::-1]
    return out * e * g
def tick(g=0.25, f=2400): t = tt(0.03); return np.sin(2 * np.pi * f * t) * np.exp(-t * 180) * g + click(g * 0.4, 5000, 0.01)[:len(t)] if len(click(g*0.4,5000,0.01))>=len(t) else np.sin(2 * np.pi * f * t) * np.exp(-t * 180) * g
def flap(nw=3, g=0.16):   # split-flap çırpıntısı
    x = np.zeros(int(0.35 * SR))
    for k in range(6 + 2 * nw):
        c = click(g * rng.uniform(0.6, 1.0), rng.uniform(2500, 4500), 0.012); i = int(k * 0.018 * SR)
        x[i:i + len(c)] += c[:len(x) - i]
    return x * np.linspace(1, 0.4, len(x))
def magnet(g=0.35):
    t = tt(0.12); return (bp(noise(0.12), 200, 900) * np.exp(-t * 35) + np.sin(2 * np.pi * 160 * t) * np.exp(-t * 30) * 0.5) * g
def shutter(g=0.5):
    x = np.zeros(int(0.2 * SR)); a = click(1.0, 3000, 0.03); b = click(0.8, 2000, 0.04)
    x[:len(a)] += a; x[int(0.07 * SR):int(0.07 * SR) + len(b)] += b
    x += bp(noise(0.2), 1500, 6000) * env(len(x), 0.001, 0.09) * 0.4
    return x * g
def fsnap(g=0.6):
    t = tt(0.12); return (bp(noise(0.12), 1500, 5000) * np.exp(-t * 60) * 1.2 + click(0.8, 6000, 0.01)[:len(t)].tolist() * 0 if False else bp(noise(0.12), 1500, 5000) * np.exp(-t * 60) * 1.2) * g
def chime(m=86, g=0.12, d=1.6):
    t = tt(d); return (np.sin(2 * np.pi * mtof(m) * t) + 0.4 * np.sin(2 * np.pi * mtof(m) * 2.01 * t)) * np.exp(-t * 2.5) * g
def slide(d=0.35, g=0.12): x = bp(noise(d), 1200, 4000) * env(int(d * SR), 0.05, d * 0.9); return x * g

cues = []
def C(t, x, g=1.0, pan=0.0, name=''): cues.append(name); add(sfx, t, x, g, pan)
# S0: saat tıkları + geri çekilme
for k in range(4): C(beat(-5 + k) if beat(-5 + k) > 0 else 0.02, tick(0.22, 2000 if k % 2 else 1600), name='tik')
C(0.05, whoosh(1.0, 200, 2500, 0.18, rev=True), name='geri çekilme')
# KANCA: KLİK kapanır (kilit + çatırtı + sub)
tS = T(40); C(tS, click(0.9, 2500, 0.025), name='kilit'); C(tS + 0.004, click(0.6, 6000, 0.012), name='çatırtı'); C(tS, thump(0.55, 70, 0.3), name='sub')
C(T(35), whoosh(0.12, 800, 5000, 0.15), name='kapanma hışırtı')
# flick 90
C(T(48), click(0.7, 3800, 0.02), name='flick'); C(T(43), whoosh(0.13, 600, 4000, 0.12), name='flick hışırtı')
# SNAP 180 (mıknatıs + menteşe klik + derin vuruş)
C(T(57) - 0.03, magnet(0.4), name='mıknatıs'); C(T(57), click(1.0, 3000, 0.03), name='menteşe'); C(T(57), thump(0.9, 55, 0.5), name='derin vuruş')
C(T(53), whoosh(0.13, 500, 6000, 0.16), name='snap hışırtı')
# açı sayacı tıkları
for f in list(range(43, 49)) + list(range(52, 58)) + list(range(266, 287, 2)): C(T(f), tick(0.07, 3200), name='açı tık')
# iletki
C(T(43), slide(0.3, 0.06), name='iletki')
# altyazı çırpıntıları
SUPS = [(37, 4), (157, 3), (189, 2), (235, 3), (268, 3), (300, 1), (327, 4)]
for f, nw in SUPS: C(T(f), flap(nw, 0.14), pan=0.1, name='flap')
# sayfa çevirmeler
for f in (82, 234, 321): C(T(f) - 0.05, whoosh(0.32, 400, 5000, 0.28), name='sayfa'); C(T(f) + 0.12, click(0.15, 1800, 0.02), name='kağıt')
# S2: yörünge hışırtısı, kumpas
C(T(84), whoosh(1.2, 250, 1800, 0.10), name='yörünge'); C(T(112), slide(0.4, 0.10), name='kumpas kayar'); C(T(126), click(0.6, 4200, 0.02), name='kumpas kilit'); C(T(122), chime(93, 0.05, 0.8), name='ölçü')
# S3: dönüş, odak, deklanşör
C(T(140), whoosh(0.7, 300, 3000, 0.18), name='dönüş'); C(T(140), click(0.4, 2600, 0.02), name='kapanma')
for f in (152, 155, 158): C(T(f), tick(0.10, 4200), name='odak')
C(T(160), tick(0.16, 5200), name='odak kilit'); C(T(164), shutter(0.6), name='deklanşör')
# S4: parmak şıklatma, Fold8 girişi
C(T(187), fsnap(0.8), name='şıklatma'); C(T(200), whoosh(0.7, 300, 4000, 0.22), name='fold8 giriş'); C(T(222), click(0.25, 2000, 0.02), name='oturma')
# S5: vuruşta wipe
C(T(234), thump(0.5, 80, 0.3), name='vuruş')
# S6: açılış, yatma, cetvel
C(T(263), whoosh(0.6, 300, 3500, 0.18), name='açılış'); C(T(286), click(0.8, 3000, 0.025), name='menteşe'); C(T(286), thump(0.45, 70, 0.3), name='vuruş')
C(T(292), whoosh(0.8, 300, 2500, 0.15), name='yatma'); C(T(302), slide(0.35, 0.12), name='cetvel'); C(T(312), click(0.3, 5000, 0.015), name='cetvel uç')
# S7: gram sayacı (hızlanıp yavaşlayan tıklar)
for k in range(24):
    tk = (k / 23) ** 1.7; C(T(325 + tk * 20), tick(0.06, 2800 + k * 30), name='gram tık')
C(T(345), chime(90, 0.06, 0.9), name='gram son')
C(T(802), whoosh(0.7, 300, 3000, 0.18), name='dönüş'); C(T(817), click(0.5, 2600, 0.02), name='kapanma'); C(T(805), whoosh(0.6, 250, 2500, 0.16), pan=-0.5, name='ultra giriş')
# S9'a yumuşak alkış
C(T(824), clap(0.35), name='alkış')
C(T(824), whoosh(0.4, 400, 3000, 0.14), name='dönüş')
C(T(836), whoosh(0.8, 250, 3000, 0.18), name='açılış'); C(T(860), click(0.8, 3000, 0.025), pan=-0.3, name='menteşe U'); C(T(860) + 0.03, click(0.7, 3300, 0.025), pan=0.3, name='menteşe F')
C(T(860), thump(0.55, 60, 0.4), name='vuruş')
C(T(851), chime(86, 0.07, 2.0), name='künye ışıltı'); C(T(854), chime(93, 0.05, 2.0), name='künye ışıltı 2')
# son kart
C(T(875), chime(81, 0.08, 1.4), name='son kart'); C(T(875), whoosh(0.5, 3000, 300, 0.08), name='son kart hışırtı')
# ŞOV + RENK bölümleri
for f in (352, 592, 802): C(T(f) - 0.05, whoosh(0.32, 400, 5000, 0.28), name='sayfa')
C(T(356), whoosh(1.6, 200, 1500, 0.12), name='dönüş tabla'); C(T(400), whoosh(1.4, 250, 1800, 0.10), name='dönüş tabla 2')
C(T(440), whoosh(0.8, 300, 3000, 0.16), name='açılış'); C(T(466), click(0.6, 3000, 0.025), name='menteşe')
C(T(596), whoosh(1.6, 200, 1500, 0.12), name='dönüş tabla'); C(T(655), whoosh(0.7, 300, 3200, 0.16), name='açılış'); C(T(677), click(0.7, 3000, 0.025), name='menteşe'); C(T(677), thump(0.4, 70, 0.3), name='vuruş')
for f, nw in ((360, 3), (404, 6), (480, 6), (598, 3), (640, 4), (690, 5)): C(T(f), flap(nw, 0.14), pan=0.1, name='flap')
for f0 in (472, 682):
    C(T(f0), thump(0.35, 80, 0.3), name='renk vuruş'); C(T(f0), hp(noise(1.6), 4000) * np.exp(-tt(1.6) * 2.4) * 0.05, name='crash')
    for i in range(4):
        C(T(f0 + i * 4), whoosh(0.35, 300 + i * 150, 3500 + i * 400, 0.12), pan=-0.6 + 0.4 * i, name='giriş')
        C(T(f0 + 30 + i * 5) + 0.15, click(0.35, 2600 + i * 300, 0.02), pan=-0.6 + 0.4 * i, name='domino')
        C(T(f0 + 30 + i * 5), whoosh(0.25, 600, 4000, 0.08), pan=-0.6 + 0.4 * i, name='domino hışırtı')
        C(T(f0 + 30 + i * 4), tick(0.10, 3000 + i * 250), pan=-0.6 + 0.4 * i, name='etiket')

print('ses ipucu sayısı:', len(cues))

# ---------------- MİKS ----------------
L = int(DUR * SR); mus = mus[:L]; sfx = sfx[:L]
meter = pyln.Meter(SR)
mus *= 10 ** ((-19 - meter.integrated_loudness(mus)) / 20)      # müzik efektlerin altında
sfx *= 10 ** ((-16.5 - meter.integrated_loudness(sfx)) / 20)
mix = mus + sfx
# son 0.3 sn sönüm
mix[-int(0.3 * SR):] *= np.linspace(1, 0, int(0.3 * SR))[:, None]
mix *= 10 ** ((-14 - meter.integrated_loudness(mix)) / 20)
# gerçek tepe sınırlayıcı (4x aşırı örnekleme ile ölç, yumuşak sınırla)
for it in range(6):
    up4 = signal.resample_poly(mix, 4, 1, axis=0); tp = np.max(np.abs(up4))
    if tp <= 10 ** (-1.05 / 20): break
    lim = 10 ** (-1.2 / 20); mix = np.tanh(mix / lim * 0.9) * lim / np.tanh(0.9)
    mix *= 10 ** ((-14 - meter.integrated_loudness(mix)) / 20)
up4 = signal.resample_poly(mix, 4, 1, axis=0)
print('LUFS', round(meter.integrated_loudness(mix), 2), 'dBTP', round(20 * np.log10(np.max(np.abs(up4))), 2))
import soundfile as sf
sf.write(sys.argv[1], mix.astype(np.float32), SR, subtype='PCM_24')
