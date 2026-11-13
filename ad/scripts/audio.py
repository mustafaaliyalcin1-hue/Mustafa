# Müzik + ses efektleri, tamamen numpy sentezi. Zaman = teslim saniyesi (doğal kare f -> f/30 s).
# python3 audio.py out.wav
import sys, numpy as np
from scipy import signal
import pyloudnorm as pyln
SR = 48000; DUR = 15.67; N = int(SR * DUR) + SR
rng = np.random.default_rng(8)
def T(f): return f / 30.0
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

# ---------------- MÜZİK ----------------
# D majör: D A Bm G (I V vi IV), her akor 2 ölçü değil 1 ölçü (4 vuruş)
CH = [[50, 57, 62, 66, 69], [45, 57, 61, 64, 69], [47, 59, 62, 66, 71], [43, 55, 59, 62, 67]]
ROOT = [38, 33, 35, 31]
def pad(notes, d, cut=2500, g=0.06):
    x = np.zeros(int(d * SR))
    for m in notes:
        for det in (-0.006, 0, 0.007):
            x += saw(mtof(m), d, det)
    x = lp(x, cut, 2) * env(len(x), 0.25, 0.3, 0.8, 0.6, int((d - 1.2) * SR)) * g / len(notes)
    return x
def pluck(m, d=0.22, g=0.10):
    t = tt(d); x = (np.sin(2 * np.pi * mtof(m) * t) + 0.3 * saw(mtof(m), d)) * np.exp(-t * 18)
    return lp(x, 5000) * g
def kick(g=0.9):
    t = tt(0.35); f = 45 + 110 * np.exp(-t * 28); x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)
    return x * g
def hat(g=0.05, d=0.05): return hp(noise(d), 7000) * env(int(d * SR), 0.001, d * 0.9) * g
def clap(g=0.22):
    x = np.zeros(int(0.25 * SR))
    for k in range(3): x[int(k * 0.011 * SR):] += bp(noise(0.25), 900, 2500)[:len(x) - int(k * 0.011 * SR)] * np.exp(-tt(0.25 - k * 0.011) * 30)[:len(x) - int(k * 0.011 * SR)]
    return x * g
def sub(m, d, g=0.22):
    t = tt(d); return np.sin(2 * np.pi * mtof(m) * t) * env(len(t), 0.01, 0.05, 0.9, 0.08, int((d - 0.15) * SR)) * g

# giriş (0 – drop): hava, ince ped + riser
add(mus, 0.0, pad([62, 66, 69, 74], DROP + 0.2, cut=1600, g=0.05))
r = noise(DROP); rt = np.linspace(0, 1, len(r))
riser = np.zeros_like(r)
for i, (a, b) in enumerate(zip(np.linspace(300, 6000, 40)[:-1], np.linspace(300, 6000, 40)[1:])):
    s0, s1 = int(i / 39 * len(r)), int((i + 1) / 39 * len(r)); riser[s0:s1] = bp(r, a, a * 1.8)[s0:s1]
add(mus, 0.0, riser * rt ** 2 * 0.10)
up = np.sin(2 * np.pi * np.cumsum(np.linspace(200, 900, int(DROP * SR))) / SR) * np.linspace(0, 1, int(DROP * SR)) ** 3 * 0.04
add(mus, 0.0, up)
# drop sonrası: ölçü ölçü
END_MUS = T(400)                  # son akor kilitlenmesi
nbar = 0; t0 = DROP
FILTER_DOWN = (T(380), T(386))
while t0 < END_MUS - 0.01:
    c = nbar % 4; bar = 4 * B
    cut = 3200
    lift = 1.0 + (0.35 if T(234) <= t0 < T(300) else 0)
    add(mus, t0, pad(CH[c], bar + 0.1, cut=cut * lift, g=0.07))
    for k in range(4):
        tb = t0 + k * B
        if tb >= END_MUS: break
        fd = FILTER_DOWN[0] <= tb < FILTER_DOWN[1] + 0.3
        if not fd: add(mus, tb, kick(0.85))
        add(mus, tb, sub(ROOT[c], B * 0.9, 0.20 if not fd else 0.08))
        add(mus, tb + B / 2, hat(0.05 if not fd else 0.02))
        if k in (1, 3) and not fd: add(mus, tb, clap(0.16))
        for j in range(4):          # 16'lık arpej
            m = CH[c][1 + (j + k) % 4] + 12
            add(mus, tb + j * B / 4, pluck(m, g=0.06 if not fd else 0.03), pan=0.35 * (1 if j % 2 else -1))
    t0 += bar; nbar += 1
# Fold8 girişinde (7.80) yükselme: kısa riser + crash
rr = noise(0.7); add(mus, T(234) - 0.7, hp(rr, 2000) * np.linspace(0, 1, len(rr)) ** 2 * 0.06)
crash = hp(noise(2.0), 4000) * np.exp(-tt(2.0) * 2.2) * 0.07; add(mus, T(234), crash)
# lavanta/geri çekilme yükselişi (S6 açılış)
add(mus, T(263), hp(noise(1.2), 3000) * np.exp(-tt(1.2) * 3) * 0.05)
# son akor: kilitlenmede, son karta çınlar
fin = np.zeros(int(3.0 * SR))
for m in [50, 57, 62, 66, 69, 74, 78]:
    fin += (np.sin(2 * np.pi * mtof(m) * tt(3.0)) + 0.25 * saw(mtof(m), 3.0, 0.003))
fin = lp(fin, 4000) * env(len(fin), 0.01, 0.4, 0.5, 2.4, int(0.2 * SR)) * 0.05
add(mus, END_MUS, fin); add(mus, END_MUS, kick(0.9)); add(mus, END_MUS, crash * 0.8)

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
    tk = (k / 23) ** 1.7; C(T(325) + tk * T(20), tick(0.06, 2800 + k * 30), name='gram tık')
C(T(345), chime(90, 0.06, 0.9), name='gram son')
C(T(352), whoosh(0.7, 300, 3000, 0.18), name='dönüş'); C(T(367), click(0.5, 2600, 0.02), name='kapanma'); C(T(355), whoosh(0.6, 250, 2500, 0.16), pan=-0.5, name='ultra giriş')
# S9'a yumuşak alkış
C(T(374), clap(0.35), name='alkış')
C(T(374), whoosh(0.4, 400, 3000, 0.14), name='dönüş')
C(T(386), whoosh(0.8, 250, 3000, 0.18), name='açılış'); C(T(410), click(0.8, 3000, 0.025), pan=-0.3, name='menteşe U'); C(T(410) + 0.03, click(0.7, 3300, 0.025), pan=0.3, name='menteşe F')
C(T(410), thump(0.55, 60, 0.4), name='vuruş')
C(T(401), chime(86, 0.07, 2.0), name='künye ışıltı'); C(T(404), chime(93, 0.05, 2.0), name='künye ışıltı 2')
# son kart
C(T(425), chime(81, 0.08, 1.4), name='son kart'); C(T(425), whoosh(0.5, 3000, 300, 0.08), name='son kart hışırtı')
print('ses ipucu sayısı:', len(cues))

# ---------------- MİKS ----------------
L = int(DUR * SR); mus = mus[:L]; sfx = sfx[:L]
meter = pyln.Meter(SR)
mus *= 10 ** ((-20 - meter.integrated_loudness(mus)) / 20)      # müzik efektlerin altında
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
