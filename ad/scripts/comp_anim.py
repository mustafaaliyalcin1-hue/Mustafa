# Kompozitör: Blender RGBA kareleri + 2D grafikler -> teslim kareleri (30 fps)
# python3 comp_anim.py <render_dir> <out_dir> [H|V]
import sys, os, json, math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from comp2d import F, studio_bg, ghost, over, to_img
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RD, OD = sys.argv[1], sys.argv[2]; ASP = sys.argv[3] if len(sys.argv) > 3 else 'H'
V = ASP == 'V'
meta = json.load(open(os.path.join(RD, 'meta.json'))); W, H = meta['W'], meta['H']; M = meta['frames']
os.makedirs(OD, exist_ok=True)
NF = 875; EC = 45
U = min(W, H)          # tipografi birimi: kısa kenar

def clamp(x, a=0., b=1.): return max(a, min(b, x))
def io(t): t = clamp(t); return 4 * t ** 3 if t < .5 else 1 - (-2 * t + 2) ** 3 / 2
def ocub(t): t = clamp(t); return 1 - (1 - t) ** 3
def oback(t, s=1.6): t = clamp(t); return 1 + (s + 1) * (t - 1) ** 3 + s * (t - 1) ** 2
def P(f, k): v = M[str(f)]['p'][k]; return v[0] * W, v[1] * H, v[2]

# ---------- altyazılar ----------
SUP = [  # metin, giriş, çıkış, y (oran), boyut (U oranı)
    ('Galaxy Z Fold8 Ultra', 37, 80, 0.86, 0.085),
    ('200MP Ultra kamera', 157, 185, 0.86, 0.080),
    ('Ve karşınızda', 189, 214, 0.86, 0.080),
    ('Galaxy Z Fold8', 235, 261, 0.86, 0.085),
    ('Yeni form açılıyor.', 268, 291, 0.86, 0.080),
    ('Dümdüz.', 300, 319, 0.30 if not V else 0.36, 0.100),
    ('Samsung’un en hafif Fold’u', 327, 351, 0.86, 0.072),
    ('Katlanınca 8,9 mm', 360, 398, 0.86, 0.080),
    ('50MP ultra geniş · 3x optik zoom', 404, 440, 0.86, 0.064),
    ('Galaxy Z Fold8 Ultra · 4 renk', 480, 590, 0.12, 0.066),
    ('Katlanınca 9,7 mm', 598, 634, 0.86, 0.080),
    ('7,6 inç ana ekran', 640, 680, 0.86, 0.080),
    ('Galaxy Z Fold8 · 4 renk', 690, 800, 0.12, 0.066),
]
if V: SUP = [(t, a, b, (0.80 if y > 0.5 else 0.06), s * (1.05 if len(t) < 22 else 0.80)) for t, a, b, y, s in SUP]
_wcache = {}; _ink = {}
def word_img(word, size, weight=700):
    k = (word, size, weight)
    if k not in _wcache:
        f = F(weight, size); bb = f.getbbox(word); w = bb[2] + 4; h = int(size * 1.35)
        im = Image.new('RGBA', (w, h), (0, 0, 0, 0)); ImageDraw.Draw(im).text((2, int(size * 0.1)), word, font=f, fill=(255, 255, 255, 255))
        _wcache[k] = im
    return _wcache[k]
def draw_super(img, text, f, f0, f1, y, size):
    """Bölünmüş kanat (split-flap) girişi: her kelime üst kenarından katlanarak açılır, sırayla."""
    if f < f0 or f > f1 + 6: return
    sz = int(U * size * (1.0 if not V else 0.95)); words = text.split(' ')
    sp = F(700, sz).getlength(' ') * 0.55; ims = [word_img(w, sz) for w in words]
    tw = sum(i.width for i in ims) + sp * (len(ims) - 1)
    x = (W - tw) / 2; yy = H * y - ims[0].height / 2
    out_t = clamp((f - f1) / 6); alpha_all = 1 - out_t
    reg = np.asarray(img.convert('L').crop((int(max(0, x)), int(max(0, yy)), int(min(W, x + tw)), int(min(H, yy + ims[0].height))))).astype(float)
    if text not in _ink: _ink[text] = bool(reg.size > 0 and np.percentile(reg, 50) > 185)
    dark = _ink[text]
    ink = (42, 27, 54) if dark else (255, 255, 255)
    sh = Image.new('RGBA', img.size, (0, 0, 0, 0)); lay = Image.new('RGBA', img.size, (0, 0, 0, 0))
    for i, im in enumerate(ims):
        t = (f - f0 - i * 2) / 7
        if t <= 0: x += im.width + sp; continue
        k = ocub(t)                                   # 0..1, harfler asla ölçeklenmez
        hh = im.height; cut = int(hh * (1 - k) / 2)
        a = np.asarray(im).astype(float).copy()
        if cut > 0: a[:cut, :, 3] = 0; a[hh - cut:, :, 3] = 0
        shade = clamp(t * 1.6)
        a[..., :3] = np.array(ink, float) * ((0.80 + 0.20 * shade) if not dark else 1.0); a[..., 3] *= alpha_all
        piece = Image.fromarray(a.astype(np.uint8))
        py = yy + (1 - ocub(t)) * U * 0.012 - out_t * U * 0.03
        lay.alpha_composite(piece, (int(x), int(py)))
        sa = np.asarray(piece).astype(float); sa[..., :3] = (70, 40, 100) if not dark else (255, 255, 255); sa[..., 3] *= 0.35 if not dark else 0.5
        sh.alpha_composite(Image.fromarray(sa.astype(np.uint8)), (int(x), int(py + U * 0.004)))
        x += im.width + sp
    img.alpha_composite(sh.filter(ImageFilter.GaussianBlur(U * 0.006))); img.alpha_composite(lay)

# ---------- HUD ve çizgi grafikler ----------
LW = max(1, round(U / 540 * 1.4))
def hud_pill(img, text, cx=None, cy=None, a=1.0):
    cx = cx if cx is not None else (0.13 if not V else 0.5); cy = cy if cy is not None else (0.085 if not V else 0.06)
    O = Image.new('RGBA', img.size, (0, 0, 0, 0)); d = ImageDraw.Draw(O); f = F(600, U * 0.040)
    tw = d.textlength('Menteşe  180°', font=f); pw, ph = tw + U * 0.07, U * 0.072; x0, y0 = W * cx - pw / 2, H * cy - ph / 2
    d.rounded_rectangle((x0, y0, x0 + pw, y0 + ph), radius=ph / 2, outline=(255, 255, 255, int(235 * a)), width=LW, fill=(255, 255, 255, int(30 * a)))
    d.text((W * cx, H * cy), text, font=f, fill=(255, 255, 255, int(255 * a)), anchor='mm'); img.alpha_composite(O)
def protractor(img, f, cx, cy, ang, a):
    O = Image.new('RGBA', img.size, (0, 0, 0, 0)); d = ImageDraw.Draw(O); r = U * 0.11
    col = (255, 255, 255, int(230 * a))
    d.arc((cx - r, cy - r, cx + r, cy + r), 180, 360, fill=col, width=LW)
    for k in range(0, 181, 15):
        th = math.radians(180 + k); r0 = r * (0.86 if k % 45 else 0.78)
        d.line((cx + r0 * math.cos(th), cy + r0 * math.sin(th), cx + r * math.cos(th), cy + r * math.sin(th)), fill=col, width=LW)
    th = math.radians(180 + ang)
    d.line((cx, cy, cx + r * 1.08 * math.cos(th), cy + r * 1.08 * math.sin(th)), fill=(255, 255, 255, int(255 * a)), width=LW + 1)
    d.ellipse((cx - LW * 2, cy - LW * 2, cx + LW * 2, cy + LW * 2), fill=col)
    img.alpha_composite(O)
def calipers(img, f, xa, xb, yc, t, label_a):
    O = Image.new('RGBA', img.size, (0, 0, 0, 0)); d = ImageDraw.Draw(O); col = (255, 255, 255, 240)
    spread = (1 - ocub(t)) * U * 0.25; L = U * 0.20
    x1, x2 = min(xa, xb) - spread - LW, max(xa, xb) + spread + LW
    for x in (x1, x2): d.line((x, yc - L, x, yc + L), fill=col, width=LW)
    d.line((x1 - U * 0.05, yc - L, x1, yc - L), fill=col, width=LW); d.line((x2, yc - L, x2 + U * 0.05, yc - L), fill=col, width=LW)
    for x, s in ((x1, -1), (x2, 1)):
        d.polygon([(x, yc - L * 0.55), (x + s * U * 0.018, yc - L * 0.55 - U * 0.008), (x + s * U * 0.018, yc - L * 0.55 + U * 0.008)], fill=col)
    if label_a > 0:
        fnt = F(700, U * 0.085); txt = '4,1 mm'
        d.text((x2 + U * 0.06, yc - L * 0.55), txt, font=fnt, fill=(255, 255, 255, int(255 * label_a)), anchor='lm')
    img.alpha_composite(O)
def brackets(img, cx, cy, rx, ry, t, locked):
    O = Image.new('RGBA', img.size, (0, 0, 0, 0)); d = ImageDraw.Draw(O)
    k = 1 + 0.6 * (1 - ocub(t)); w = LW + (1 if locked else 0); col = (255, 255, 255, 245)
    x0, x1, y0, y1 = cx - rx * k, cx + rx * k, cy - ry * k, cy + ry * k; c = min(rx, ry) * 0.35
    for (x, y, sx, sy) in ((x0, y0, 1, 1), (x1, y0, -1, 1), (x0, y1, 1, -1), (x1, y1, -1, -1)):
        d.line((x, y, x + sx * c, y), fill=col, width=w); d.line((x, y, x, y + sy * c), fill=col, width=w)
    if locked: d.ellipse((cx - LW * 2.5, cy - LW * 2.5, cx + LW * 2.5, cy + LW * 2.5), outline=col, width=LW)
    img.alpha_composite(O)
def gram(img, f, ax, ay, t, a):
    O = Image.new('RGBA', img.size, (0, 0, 0, 0)); d = ImageDraw.Draw(O); col = (255, 255, 255, int(240 * a))
    bx, by = (ax + U * 0.08, ay - U * 0.10) if not V else (ax - U * 0.30, ay - U * 0.22)
    bx = min(bx, W - U * 0.42)
    d.line((ax, ay, bx, by), fill=col, width=LW); d.line((bx, by, bx + U * 0.30, by), fill=col, width=LW)
    d.ellipse((ax - LW * 2.5, ay - LW * 2.5, ax + LW * 2.5, ay + LW * 2.5), fill=col)
    val = int(round(201 * ocub(t)))
    d.text((bx + U * 0.005, by - U * 0.012), f'{val} g', font=F(700, U * 0.10), fill=(255, 255, 255, int(255 * a)), anchor='ls')
    img.alpha_composite(O)
def straightedge(img, y, t, a):
    O = Image.new('RGBA', img.size, (0, 0, 0, 0)); d = ImageDraw.Draw(O)
    x = W * ocub(t); d.line((0, y, x, y), fill=(255, 255, 255, int(220 * a)), width=LW)
    for k in range(0, int(x), int(U * 0.04)): d.line((k, y - U * 0.008, k, y + U * 0.008), fill=(255, 255, 255, int(160 * a)), width=LW)
    img.alpha_composite(O)

# ---------- hayalet kelimeler ----------
GHOST = {'S1': 'ULTRA', 'S2': 'ULTRA', 'S3': 'ULTRA', 'S5': 'FOLD', 'S6': 'FOLD', 'S7': 'FOLD', 'U360': 'ULTRA', 'UCOL': 'ULTRA', 'F360': 'FOLD', 'FCOL': 'FOLD'}
_bg = studio_bg(W, H); _gc = {}
def bg_for(f, shot):
    word = GHOST.get(shot)
    if not word: return _bg.copy()
    key = (word,)
    if key not in _gc: _gc[key] = ghost(_bg.copy(), word, alpha=0.30, blur=0.012, y=0.5)
    return _gc[key]

def compose(f):
    m = M[str(f)]; shot = m['shot']
    r = Image.open(os.path.join(RD, f'{f:04d}.png')).convert('RGBA')
    if r.size != (W, H): r = r.resize((W, H))
    base = bg_for(f, shot)
    img = to_img(over(base, r, shadow=0.28)).convert('RGBA')
    # grafikler
    if 37 <= f <= 81:
        pass
    if 43 <= f <= 80:
        pass                                            # derece sembolü kaldırıldı
    if 264 <= f <= 292:
        pass
    if 112 <= f <= 139:
        xa, ya, _ = P(f, 'U_edge_f'); xb, yb, _ = P(f, 'U_edge_b'); calipers(img, f, xa, xb, (ya + yb) / 2, (f - 112) / 14, clamp((f - 122) / 5))
    if 150 <= f <= 186:
        cx, cy, _ = P(f, 'U_isl'); _, yt, _ = P(f, 'U_isl_r'); _, yb, _ = P(f, 'U_isl_l'); ry = abs(yb - yt) / 2 * (0.0105 / 0.028)
        brackets(img, cx, cy, ry, ry, (f - 150) / 10, f >= 160)
    if 302 <= f <= 320:
        x, y, _ = P(f, 'F_hinge_mid'); straightedge(img, y, (f - 302) / 10, clamp((320 - f) / 4))
    if 325 <= f <= 351:
        x, y, _ = P(f, 'F_right'); gram(img, f, x, y, (f - 325) / 20, clamp((f - 325) / 3) * clamp((351 - f) / 4))
    for keys, names, f0 in ((('U', 'U2', 'U3', 'U4'), ('Violet Shadow', 'Graphite', 'Cream', 'Green Shadow'), 502),
                            (('F', 'F2', 'F3', 'F4'), ('Lavender', 'Graphite', 'Cream', 'Pistachio'), 712)):
        if f0 <= f <= f0 + 90:
            O = Image.new('RGBA', img.size, (0, 0, 0, 0)); d = ImageDraw.Draw(O); fn = F(600, U * (0.042 if not V else 0.036))
            for i, (k, nm) in enumerate(zip(keys, names)):
                t = ocub((f - f0 - i * 4) / 8); out = clamp((f0 + 90 - f) / 5)
                if t <= 0: continue
                x, y, _ = P(f, k + '_bot'); y += (1 - t) * U * 0.02
                d.line((x - U * 0.03, y - U * 0.012, x + U * 0.03, y - U * 0.012), fill=(255, 255, 255, int(200 * t * out)), width=LW)
                d.text((x, y + U * 0.012), nm, font=fn, fill=(255, 255, 255, int(255 * t * out)), anchor='mt')
            img.alpha_composite(O)
    for t, a0, a1, y, s in SUP: draw_super(img, t, f, a0, a1, y, s)
    if 164 <= f <= 167:                                     # deklanşör flaşı
        k = [0.75, 0.45, 0.2, 0.06][f - 164]; img.alpha_composite(Image.new('RGBA', img.size, (255, 255, 255, int(255 * k))))
    return img.convert('RGB')

# ---------- sayfa çevirme geçişi (merkezdeki kat çizgisinden) ----------
def page_turn(A, B, t):
    a = np.asarray(A); b = np.asarray(B); h, w = a.shape[:2]; cx = w // 2
    out = np.concatenate([a[:, :cx], b[:, cx:]], 1).copy(); img = Image.fromarray(out)
    bulge = 0.06 * math.sin(math.pi * t)
    if t < 0.5:
        k = 1 - 2 * t; pw = max(1, int(cx * k)); src = Image.fromarray(a[:, cx:]); shade = 0.55 + 0.45 * k
        quad = (0, 0, 0, h, pw, h * (1 + bulge), pw, -h * bulge)
        page = src.transform((pw, h), Image.QUAD, (0, 0, 0, h, cx, h * (1 + bulge) if False else h, cx, 0), Image.BILINEAR)
        page = Image.fromarray((np.asarray(page).astype(float) * shade).astype(np.uint8)); img.paste(page, (cx, 0))
    else:
        k = 2 * t - 1; pw = max(1, int(cx * k)); src = Image.fromarray(b[:, :cx]); shade = 0.55 + 0.45 * k
        page = src.resize((pw, h), Image.BILINEAR); page = Image.fromarray((np.asarray(page).astype(float) * shade).astype(np.uint8))
        img.paste(page, (cx - pw, 0))
    d = ImageDraw.Draw(img); d.line((cx, 0, cx, h), fill=(255, 255, 255), width=1)
    return img
TURNS = {82: 7, 234: 7, 321: 7, 352: 7, 592: 7, 802: 7}

# ---------- son kart ----------
def endcard():
    from subprocess import run, PIPE
    src = os.path.join(ROOT, 'storyboard/frames/logo_full.png')
    lg = np.asarray(Image.open(src).convert('L')).astype(float)[318:402, 436:844]
    up = Image.fromarray(lg.astype(np.uint8)).resize((lg.shape[1] * 4, lg.shape[0] * 4), Image.LANCZOS).filter(ImageFilter.GaussianBlur(1.2))
    a = np.asarray(up).astype(float); a = np.clip((a - 70) / (190 - 70), 0, 1)   # luma matte, temiz kenar
    lw = int(U * (0.62 if not V else 0.62) * (1 if not V else 1)); lh = int(lw * a.shape[0] / a.shape[1])
    matte = Image.fromarray((a * 255).astype(np.uint8)).resize((lw, lh), Image.LANCZOS)
    bgc = studio_bg(W, H, (0xF3, 0xEC, 0xFA), (0xE2, 0xD6, 0xF0)); base = to_img(bgc).convert('RGBA')
    ink = (42, 28, 52)
    layers = []
    L1 = Image.new('RGBA', (W, H), (0, 0, 0, 0)); L1.paste(Image.new('RGBA', matte.size, ink + (255,)), ((W - lw) // 2, int(H * 0.5 - lh * 2.1)), matte)
    L2 = Image.new('RGBA', (W, H), (0, 0, 0, 0)); ImageDraw.Draw(L2).text((W / 2, H * 0.5), '×', font=F(400, U * 0.075), fill=ink + (255,), anchor='mm')
    fm = F(600, U * 0.112); L3 = Image.new('RGBA', (W, H), (0, 0, 0, 0)); ImageDraw.Draw(L3).text((W / 2, H * 0.5 + lh * 1.9), 'maybeta', font=fm, fill=ink + (255,), anchor='mm')  # logo ile eş görsel ağırlık
    return base, [L1, L2, L3]
def ec_frame(i, base, layers):
    img = base.copy()
    for j, L in enumerate(layers):
        t = ocub((i - j * 3) / 9)
        if t <= 0: continue
        a = np.asarray(L).astype(float); a[..., 3] *= t
        img.alpha_composite(Image.fromarray(a.astype(np.uint8)), (0, int((1 - t) * U * 0.02)))
    return img.convert('RGB')

if __name__ == '__main__':
    only = set(int(x) for x in sys.argv[4].split(',')) if len(sys.argv) > 4 else None
    last = None
    for f in range(NF):
        if only and f not in only and (f + 1) not in only: continue
        if not os.path.exists(os.path.join(RD, f'{f:04d}.png')): continue
        img = compose(f)
        for f0, n in TURNS.items():
            if f0 <= f < f0 + n and last is not None:
                img = page_turn(last_frozen[f0], img, (f - f0 + 1) / (n + 1))
        if (f + 1) in TURNS: last_frozen = globals().setdefault('last_frozen', {}); last_frozen[f + 1] = img
        if only and f not in only: last = img; continue
        img.save(os.path.join(OD, f'{f:04d}.png')); last = img
    if not only or any(x >= NF for x in only):
        base, layers = endcard()
        for i in range(EC): ec_frame(i, base, layers).save(os.path.join(OD, f'{NF + i:04d}.png'))
