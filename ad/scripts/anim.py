# Galaxy Z Fold8 Ultra + Fold8 reklamı — 3D animasyon (Blender 5.3 bpy, Cycles)
# Kullanım: python3 anim.py --aspect H|V --w 960 --spp 12 --out build/r540H [--start 0 --end 424] [--only-meta]
# Kareler doğal hızda 25 fps yazılır; teslimde 30 fps oynatılır (= 1.2x). Doğal kare f  <->  teslim saniyesi f/30.
import sys, os, math, json, time, argparse
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy, mathutils
from bpy_extras.object_utils import world_to_camera_view
from lib_phone import load_phone, studio

ap = argparse.ArgumentParser()
ap.add_argument('--aspect', default='H'); ap.add_argument('--w', type=int, default=960)
ap.add_argument('--spp', type=int, default=12); ap.add_argument('--out', default='build/r540H')
ap.add_argument('--start', type=int, default=0); ap.add_argument('--end', type=int, default=-1)
ap.add_argument('--only-meta', action='store_true'); ap.add_argument('--frames', default='')
A = ap.parse_args(sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:])
V = A.aspect == 'V'
W = A.w; H = round(W * 9 / 16) if not V else round(W * 16 / 9)
if V: W, H = A.w, round(A.w * 16 / 9)
import timeline as TL
NF = TL.NG         # render karesi sayısı (planlar yavaşlatılmış); kurgu sırası timeline.py'de
SHIFT = 450       # eski S7 sonu + S8, renk bölümleri eklendiği için 450 kare kaydı

# ---------- yardımcılar ----------
def clamp(x, a=0., b=1.): return max(a, min(b, x))
def lerp(a, b, t): return a + (b - a) * t
def sm(t): t = clamp(t); return t * t * (3 - 2 * t)
def io(t): t = clamp(t); return 4 * t ** 3 if t < .5 else 1 - (-2 * t + 2) ** 3 / 2
def oexp(t): t = clamp(t); return 1 if t >= 1 else 1 - 2 ** (-10 * t)
def ocub(t): t = clamp(t); return 1 - (1 - t) ** 3
def icub(t): t = clamp(t); return t ** 3
def seg(f, f0, f1, v0, v1, e=io): return lerp(v0, v1, e((f - f0) / (f1 - f0))) if f1 > f0 else v1
def path(f, keys, e=io):
    """keys: [(frame, value), ...] parçalı; isteğe bağlı 3. eleman easing"""
    if f <= keys[0][0]: return keys[0][1]
    for k0, k1 in zip(keys, keys[1:]):
        if f <= k1[0]:
            ee = k1[2] if len(k1) > 2 else e
            return lerp(k0[1], k1[1], ee((f - k0[0]) / (k1[0] - k0[0])))
    return keys[-1][1]
def vlerp(a, b, t): return tuple(lerp(x, y, t) for x, y in zip(a, b))
def vpath(f, keys, e=io):
    if f <= keys[0][0]: return keys[0][1]
    for k0, k1 in zip(keys, keys[1:]):
        if f <= k1[0]:
            ee = k1[2] if len(k1) > 2 else e
            return vlerp(k0[1], k1[1], ee((f - k0[0]) / (k1[0] - k0[0])))
    return keys[-1][1]

WU, HU = 0.0716, 0.1584   # Ultra yarım genişlik / yükseklik
WF, HF = 0.0807, 0.1239   # Fold8
FAR = (3.0, 3.0, 3.0)

SHOTS = [('S0', 0), ('S1', 35), ('S2', 82), ('S3', 140), ('S4', 187), ('S5', 234), ('S6', 263), ('S7', 321), ('S8', 374)]
def shot_of(f):
    n = SHOTS[0][0]
    for s, f0 in SHOTS:
        if f >= f0: n = s
    return n

# ---------- sahne durumu: tamamen f'nin fonksiyonu ----------
def state_core(f):
    s = shot_of(f)
    U = dict(pos=FAR, rot=(0, 0, 0), a=0); F = dict(pos=FAR, rot=(0, 0, 0), a=0)
    C = dict(t=(0, 0, 0), d=0.8, az=0, el=0, roll=0, lens=70, fs=0)
    mixU = [1.0, 0.0]; mixF = [0.0]
    if f < 37: mixU[0] = 0.0                        # "Geç kalmışlık." yazısı, kapanınca duvar kâğıdı
    if s == 'S0':
        U.update(pos=(0, 0, 0), rot=(0, 0, seg(f, 0, 35, 0, -12, sm)), a=180)
        d0, d1 = (0.20, 0.80) if not V else (0.16, 0.62)
        C.update(t=(0, 0, 0), d=lerp(d0, d1, path(f, [(0, 0), (8, 0.04, sm), (33, 1, ocub)])), az=seg(f, 0, 35, 0, -6), el=seg(f, 0, 35, 0, 4))
    elif s == 'S1':
        a = path(f, [(35, 180), (40, 0, io), (42, 0), (48, 90, io), (51, 90), (57, 180, lambda t: t * t)])
        kick = 0.035 * math.exp(-(f - 57) / 3) * (1 if f >= 57 else 0)
        U.update(pos=(0, 0, 0), rot=(seg(f, 35, 82, 0, -4), 0, seg(f, 35, 82, -12, 16, sm)), a=a)
        d = seg(f, 35, 82, 0.80, 0.68, sm) if not V else seg(f, 35, 82, 0.62, 0.55, sm)
        C.update(t=(0, 0, 0), d=d - kick, az=seg(f, 35, 82, -6, 8, sm), el=seg(f, 35, 82, 4, 2))
    elif s == 'S2':
        U.update(pos=(0, 0, 0), rot=(0, 0, 0), a=180)
        t = io((f - 82) / 40)
        C.update(t=(lerp(0, -WU, t), 0.002 * t, 0), d=lerp(0.70 if not V else 0.60, 0.40, t), az=lerp(-30, -88, t),
                 el=lerp(12, 0, t), lens=lerp(70, 110, t), fs=2.8 if t > 0.5 else 0)
    elif s == 'S3':
        a = seg(f, 140, 154, 180, 0, io)
        U.update(pos=(0, 0, 0), rot=(0, 0, seg(f, 140, 162, 0, 198, io)), a=a)
        t = io((f - 140) / 22)
        C.update(t=('ISLMIX', t), d=lerp(0.62 if not V else 0.55, 0.15, t), az=lerp(0, 0, t) + seg(f, 162, 187, 0, 6, sm),
                 el=lerp(5, 10, t), lens=lerp(70, 100, t), fs=4.0 if t > 0.6 else 0)
    elif s == 'S4':
        if not V:
            U.update(pos=(-0.055, 0, 0), rot=(0, 0, seg(f, 187, 234, 4, 10)), a=0)
            F.update(pos=(seg(f, 200, 222, 0.42, 0.06, oexp), -0.01, -0.012), rot=(0, 0, seg(f, 200, 226, -40, -10, ocub)), a=0)
            C.update(t=(0.0, 0, 0), d=seg(f, 187, 234, 0.74, 0.70, sm), az=0, el=3)
        else:
            U.update(pos=(-0.018, 0, 0.035), rot=(0, 0, seg(f, 187, 234, 4, 10)), a=0)
            F.update(pos=(seg(f, 200, 222, 0.30, 0.022, oexp), -0.025, -0.055), rot=(0, 0, seg(f, 200, 226, -40, -10, ocub)), a=0)
            C.update(t=(0.0, 0, -0.01), d=seg(f, 187, 234, 0.70, 0.66, sm), az=0, el=3)
    elif s == 'S5':
        F.update(pos=(0, 0, 0), rot=(0, 0, seg(f, 234, 263, -14, 6, sm)), a=0)
        C.update(t=(0, 0, 0), d=seg(f, 234, 263, 0.58, 0.50, sm) if not V else seg(f, 234, 263, 0.50, 0.44, sm), az=seg(f, 234, 263, -5, 5), el=2)
    elif s == 'S6':
        a = seg(f, 263, 286, 0, 180, io)
        lay = io((f - 292) / 24)
        F.update(pos=(0, 0, 0), rot=(lerp(0, -90, lay), 0, seg(f, 263, 292, -10, 0, sm)), a=a)
        dO = 0.56 if not V else 0.62
        C.update(t=(0, 0, 0), d=lerp(seg(f, 263, 290, 0.50, dO, sm), 0.62 if not V else 0.40, lay), az=0, el=lerp(seg(f, 263, 290, 4, 2), 1.5, lay),
                 lens=lerp(70, 90, lay))
    elif s == 'S7':
        bob = 0.004 * math.sin((f - 321) / 25 * 2 * math.pi * 0.6)
        if f < 352:
            F.update(pos=(0, 0, bob), rot=(-8, 0, seg(f, 321, 352, -30, 22, sm)), a=180)
            C.update(t=(0, 0, 0), d=0.52 if not V else 0.60, az=0, el=8)
        else:
            t = io((f - 352) / 21)
            F.update(pos=(lerp(0, 0.06 if not V else 0.02, t), 0, lerp(bob, 0 if not V else -0.05, t)),
                     rot=(lerp(-8, 0, t), 0, lerp(22, 195, t)), a=seg(f, 352, 367, 180, 0, io))
            U.update(pos=(lerp(-0.5, -0.06, oexp((f - 352) / 20)) if not V else lerp(-0.5, -0.02, oexp((f - 352) / 20)), 0.01, 0 if not V else 0.045),
                     rot=(0, 0, seg(f, 352, 372, 140, 168, ocub)), a=0)
            C.update(t=(0, 0, 0 if not V else -0.005), d=lerp(0.52 if not V else 0.60, 0.72 if not V else 0.70, t), az=0, el=lerp(8, 3, t))
    elif s == 'S8':
        turn = io((f - 374) / 12); op = io((f - 386) / 24); push = io((f - 386) / 26)
        aU = lerp(0, 180, op); aF = lerp(0, 180, op)
        if not V:
            gap = 0.010
            xu = lerp(-0.06, -(WU + gap / 2), op); xf = lerp(0.06, (WF + gap / 2), op)
            U.update(pos=(xu, 0, 0), rot=(0, 0, lerp(168, 360, turn) - 360 + lerp(10, 0, op)), a=aU)
            F.update(pos=(xf, 0, 0), rot=(0, 0, lerp(195, 360, turn) - 360 - lerp(10, 0, op)), a=aF)
            C.update(t=(lerp(0, (WF - WU) / 2, op), 0, 0), d=lerp(0.80, 0.70, push), az=0, el=lerp(3, 0, push))
        else:
            zu = lerp(0.045, HU / 2 + 0.006, op); zf = lerp(-0.05, -(HF / 2 + 0.006), op)
            U.update(pos=(lerp(-0.02, 0, op), 0, zu), rot=(0, 0, lerp(168, 360, turn) - 360 + lerp(10, 0, op)), a=aU)
            F.update(pos=(lerp(0.02, 0, op), 0, zf), rot=(0, 0, lerp(195, 360, turn) - 360 - lerp(10, 0, op)), a=aF)
            C.update(t=(0, 0, lerp(-0.005, (HU / 2 - HF / 2) / 2 * 0.6, op)), d=lerp(0.72, 0.62, push), az=0, el=lerp(3, 0, push))
        mixU[1] = io((f - 400) / 10); mixF[0] = io((f - 403) / 10)
    return dict(shot=s, U=U, F=F, C=C, mixU=mixU, mixF=mixF)

VAR = ['U2', 'U3', 'U4', 'F2', 'F3', 'F4']           # renk varyantları
VKIND = dict(U2='U_GR', U3='U_CR', U4='U_GS', F2='F_GR', F3='F_CR', F4='F_PI')
SHOTS_NEW = [('U360', 352), ('UCOL', 472), ('F360', 592), ('FCOL', 682), ('S7B', 802), ('S8', 824)]
def lineup(f, f0, keys, Wh, Hh):
    """4 telefon: aşağıdan sırayla giriş, domino gibi arkayı gösterme, hafif salınım. keys: 4 anahtar (soldan sağa)"""
    out = {}
    if not V:
        pitch = Wh + 0.032; xs = [(i - 1.5) * pitch for i in range(4)]; zs = [0] * 4
    else:
        pitch = Wh + 0.022; xs = [-pitch / 2, pitch / 2, -pitch / 2, pitch / 2]; zs = [Hh / 2 + 0.012] * 2 + [-(Hh / 2 + 0.012)] * 2
    for i, k in enumerate(keys):
        e = oexp((f - f0 - i * 4) / 22)
        turn = io((f - f0 - 30 - i * 5) / 16)
        sway = 6 * math.sin((f - f0) / 25 * 2 * math.pi * 0.35 + i * 0.7) * io((f - f0 - 60) / 20)
        out[k] = dict(pos=(xs[i], 0, zs[i] + lerp(-0.16, 0, e)), rot=(0, 0, lerp(-25, 0, e) + 180 * turn + sway), a=0)
    return out
def state(f):
    if f >= 802:
        st = state_core(f - SHIFT); st['shot'] = 'S7B' if f < 824 else 'S8'
    elif f < 352:
        st = state_core(f)
    else:
        st = dict(U=dict(pos=FAR, rot=(0, 0, 0), a=0), F=dict(pos=FAR, rot=(0, 0, 0), a=0), C=dict(t=(0, 0, 0), d=0.8, az=0, el=0, roll=0, lens=70, fs=0),
                  mixU=[1.0, 0.0], mixF=[0.0])
        U, F, C = st['U'], st['F'], st['C']
        if f < 472:                                     # Ultra şov: 360° dönüş, sonra kitap gibi açılır
            st['shot'] = 'U360'
            spin = path(f, [(352, -35), (440, 325, lambda t: t)])
            op = io((f - 440) / 26)
            U.update(pos=(0, 0, 0), rot=(lerp(-5, 0, op), 0, lerp(spin, 340, op) if f >= 440 else spin), a=lerp(0, 105, op))
            C.update(t=(0, 0, -0.005), d=lerp(0.72 if not V else 0.56, 0.80 if not V else 0.62, op), az=seg(f, 352, 472, -8, 8, sm),
                     el=seg(f, 352, 440, -6, 6, sm), lens=75)
        elif f < 592:                                   # Ultra renkleri
            st['shot'] = 'UCOL'
            L = lineup(f, 472, ['U', 'U2', 'U3', 'U4'], WU, HU)
            st['U'].update(L['U']); [st.setdefault(k, {}).update(L[k]) for k in ('U2', 'U3', 'U4')]
            C.update(t=(0, 0, -0.008), d=0.86 if not V else 0.80, az=seg(f, 472, 592, -4, 4, sm), el=3, lens=70)
        elif f < 682:                                   # Fold8 şov
            st['shot'] = 'F360'
            spin = path(f, [(592, -35), (655, 325, lambda t: t)])
            op = io((f - 655) / 22)
            F.update(pos=(0, 0, 0), rot=(0, 0, lerp(spin, 360, op) if f >= 655 else spin), a=lerp(0, 180, op))
            C.update(t=(0, 0, 0), d=lerp(0.60 if not V else 0.50, 0.64 if not V else 0.66, op), az=seg(f, 592, 682, -6, 6, sm), el=seg(f, 592, 655, -5, 4, sm), lens=75)
        else:                                           # Fold8 renkleri
            st['shot'] = 'FCOL'
            L = lineup(f, 682, ['F', 'F2', 'F3', 'F4'], WF, HF)
            st['F'].update(L['F']); [st.setdefault(k, {}).update(L[k]) for k in ('F2', 'F3', 'F4')]
            C.update(t=(0, 0, -0.006), d=0.92 if not V else 0.70, az=seg(f, 682, 802, -4, 4, sm), el=3, lens=70)
    for k in VAR: st.setdefault(k, dict(pos=FAR, rot=(0, 0, 0), a=0))
    return st

# ---------- sahne ----------
bpy.ops.wm.read_factory_settings(use_empty=True)
cam = studio(engine='CYCLES', w=W, h=H, samples=A.spp)
sc = bpy.context.scene
sc.render.use_motion_blur = True; sc.render.motion_blur_shutter = 0.15
sc.render.fps = 25; sc.frame_start = 0; sc.frame_end = NF - 1
cam.rotation_mode = 'QUATERNION'; cam.data.dof.use_dof = False
PU = load_phone('U'); PF = load_phone('F8')
PV = {k: load_phone(VKIND[k]) for k in VAR}

def local_center(P, names):
    pts = []
    for o in P['meshes']:
        if o.name.split(':', 1)[1] in names:
            pts += [P['root'].matrix_world.inverted() @ (o.matrix_world @ mathutils.Vector(c)) for c in o.bound_box]
    return sum(pts, mathutils.Vector()) / len(pts)
bpy.context.view_layer.update()
ISL = local_center(PU, {'Camera.007', 'Camera.mid'})

def place(P, st, Wh):
    a = st['a']; P['set_angle'](a)
    R = mathutils.Euler([math.radians(v) for v in st['rot']], 'XYZ')
    cx = Wh / 2 * (1 - a / 180)
    off = R.to_matrix() @ mathutils.Vector((cx, -0.002, 0))
    P['root'].location = mathutils.Vector(st['pos']) - off
    P['root'].rotation_euler = R

def cam_set(C, prevq):
    t = C['t']
    if t[0] in ('ISL', 'ISLMIX'):
        bpy.context.view_layer.update(); wi = PU['root'].matrix_world @ ISL
        if t[0] == 'ISLMIX':
            wc = PU['root'].matrix_world @ mathutils.Vector((WU / 2 * (1 - PU['hinge'].rotation_euler.z / math.pi * 0 ), 0, 0))
            wc = mathutils.Vector((0, 0, 0)); k = t[1]; t = wc.lerp(wi, k)
        else: t = wi
    t = mathutils.Vector(t)
    az, el = math.radians(C['az']), math.radians(C['el'])
    d = mathutils.Vector((math.sin(az) * math.cos(el), -math.cos(az) * math.cos(el), math.sin(el)))
    cam.location = t + d * C['d']
    q = (t - cam.location).to_track_quat('-Z', 'Y')
    if C['roll']: q = q @ mathutils.Quaternion((0, 0, 1), math.radians(C['roll']))
    if prevq is not None and q.dot(prevq) < 0: q.negate()
    cam.rotation_quaternion = q; cam.data.lens = C['lens']
    cam.data.dof.use_dof = C['fs'] > 0
    cam.data.dof.focus_distance = C['d']; cam.data.dof.aperture_fstop = C['fs'] if C['fs'] > 0 else 16
    return q

mixU_nodes = [PU['mats']['Screen'].node_tree.nodes[n] for n in PU['mats']['Screen']['mix']]
mixF_nodes = [PF['mats']['Screen'].node_tree.nodes[n] for n in PF['mats']['Screen']['mix']]

# bake: her kare için anahtar kare
prevq = None
for f in range(NF):
    st = state(TL.old_of(f))
    place(PU, st['U'], WU); place(PF, st['F'], WF)
    for k in VAR: place(PV[k], st[k], WU if k[0] == 'U' else WF)
    prevq = cam_set(st['C'], prevq)
    for P in [PU, PF] + list(PV.values()):
        P['root'].keyframe_insert('location', frame=f); P['root'].keyframe_insert('rotation_euler', frame=f)
        P['hinge'].keyframe_insert('rotation_euler', frame=f); P['spine'].keyframe_insert('rotation_euler', frame=f)
    cam.keyframe_insert('location', frame=f); cam.keyframe_insert('rotation_quaternion', frame=f)
    cam.data.keyframe_insert('lens', frame=f); cam.data.dof.keyframe_insert('focus_distance', frame=f)
    cam.data.dof.keyframe_insert('aperture_fstop', frame=f); cam.data.dof.keyframe_insert('use_dof', frame=f) if False else None
    for n, v in zip(mixU_nodes, st['mixU']): n.inputs['Factor'].default_value = v; n.inputs['Factor'].keyframe_insert('default_value', frame=f)
    for n, v in zip(mixF_nodes, st['mixF']): n.inputs['Factor'].default_value = v; n.inputs['Factor'].keyframe_insert('default_value', frame=f)
# kesmelerde ve sıçramalarda bulanıklık olmasın: sabit (CONSTANT) geçişler, diğerleri doğrusal
CUTS = set(TL.SHOT_STARTS_G)
def fix_curves(idb):
    ad = idb.animation_data
    if not ad or not ad.action: return
    for layer in getattr(ad.action, 'layers', []):
        for strip in layer.strips:
            for cb in strip.channelbags:
                for fc in cb.fcurves:
                    for k in fc.keyframe_points: k.interpolation = 'CONSTANT' if int(k.co[0]) + 1 in CUTS else 'LINEAR'
    for fc in getattr(ad.action, 'fcurves', []) or []:
        for k in fc.keyframe_points: k.interpolation = 'CONSTANT' if int(k.co[0]) + 1 in CUTS else 'LINEAR'
for idb in [x for P in PV.values() for x in (P['root'], P['hinge'], P['spine'])] + [PU['root'], PF['root'], PU['hinge'], PF['hinge'], PU['spine'], PF['spine'], cam, cam.data, PU['mats']['Screen'].node_tree, PF['mats']['Screen'].node_tree]:
    try: fix_curves(idb)
    except Exception as e: print('curve fix', idb.name, e)
# DOF kesmede açılıp kapanmasın: use_dof'u fs ile sabitledik (aperture 16 ~ keskin)
cam.data.dof.use_dof = True

# ---------- izleme noktaları (2D çizgi grafikler için) ----------
def proj(P_or_obj, local):
    co = P_or_obj.matrix_world @ mathutils.Vector(local)
    v = world_to_camera_view(sc, cam, co)
    return [round(v.x, 5), round(1 - v.y, 5), round(v.z, 5)]
def track(f):
    sc.frame_set(f); st = state(TL.old_of(f))
    d = dict(shot=st['shot'], aU=round(st['U']['a'], 2), aF=round(st['F']['a'], 2))
    p = {}
    p['U_hinge_top'] = proj(PU['root'], (0, 0, HU / 2)); p['U_hinge_bot'] = proj(PU['root'], (0, 0, -HU / 2))
    p['U_hinge_mid'] = proj(PU['root'], (0, 0, 0))
    p['U_edge_f'] = proj(PU['hinge'], (-WU, -0.0001, 0.02)); p['U_edge_b'] = proj(PU['hinge'], (-WU, 0.0041, 0.02))
    p['U_isl'] = proj(PU['root'], tuple(ISL)); p['U_isl_r'] = proj(PU['root'], tuple(ISL + mathutils.Vector((0.0, 0, 0.028))))
    p['U_isl_l'] = proj(PU['root'], tuple(ISL - mathutils.Vector((0.0, 0, 0.028))))
    p['F_hinge_top'] = proj(PF['root'], (0, 0, HF / 2)); p['F_hinge_mid'] = proj(PF['root'], (0, 0, 0))
    p['F_corner'] = proj(PF['root'], (WF, 0, HF / 2)); p['F_left'] = proj(PF['hinge'], (-WF, 0, 0)); p['F_right'] = proj(PF['root'], (WF, 0, 0))
    p['F_left_top'] = proj(PF['hinge'], (-WF, 0, HF / 2))
    p['U_bot'] = proj(PU['root'], (WU / 2, 0, -HU / 2 - 0.01)); p['F_bot'] = proj(PF['root'], (WF / 2, 0, -HF / 2 - 0.01))
    for k in VAR:
        Wh, Hh = (WU, HU) if k[0] == 'U' else (WF, HF)
        p[k + '_bot'] = proj(PV[k]['root'], (Wh / 2, 0, -Hh / 2 - 0.01))
    d['p'] = p; return d

os.makedirs(A.out, exist_ok=True)
meta_path = os.path.join(A.out, 'meta.json')
meta = {str(f): track(f) for f in range(NF)}
json.dump(dict(W=W, H=H, frames=meta), open(meta_path, 'w'))
print('META yazıldı', meta_path, flush=True)
if A.only_meta: sys.exit(0)

frames = [int(x) for x in A.frames.split(',')] if A.frames else range(A.start, (A.end if A.end >= 0 else NF - 1) + 1)
for f in frames:
    fp = os.path.join(A.out, f'{f:04d}.png')
    if os.path.exists(fp): continue
    sc.frame_set(f); sc.render.filepath = fp
    sc.render.use_motion_blur = not (f in CUTS or (f + 1) in CUTS)   # kesme karelerinde önceki planın hayaleti olmasın
    t = time.time(); bpy.ops.render.render(write_still=True)
    print(f'kare {f} {time.time() - t:.1f}s', flush=True)
