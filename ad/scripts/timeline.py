# Zaman çizelgesi.
#  - "eski" kare: animasyonun yazıldığı ölçek (state(f), altyazı ve ses ipuçları bu ölçekte tanımlı).
#  - "g" kare: render edilen kare. Her plan kendi katsayısıyla yavaşlatılır (katlamalar/kamera görünür hızda).
#  - teslim karesi: g kareleri kurgu sırasına (önce Ultra, sonra Fold8, sonra kapanış) dizilmiş hali. 30 fps.
SHOTS = [  # ad, eski başlangıç, eski bitiş (hariç), yavaşlatma katsayısı
    ('S0', 0, 35, 1.6), ('S1', 35, 82, 2.0), ('S2', 82, 140, 1.4), ('S3', 140, 187, 1.8),
    ('S4', 187, 234, 1.3), ('S5', 234, 263, 1.2), ('S6', 263, 321, 1.7), ('S7', 321, 352, 1.2),
    ('U360', 352, 472, 1.25), ('UCOL', 472, 592, 1.15), ('F360', 592, 682, 1.35), ('FCOL', 682, 802, 1.15),
    ('S7B', 802, 824, 1.8), ('S8', 824, 875, 1.6)]
_G = []; g = 0
for name, a, b, k in SHOTS:
    n = round((b - a) * k); _G.append((name, a, b, k, g, n)); g += n
NG = g                                   # toplam render karesi
OLD_END = 875
def shot_g(name): return next(x for x in _G if x[0] == name)
def old_of(gf):
    """render karesi -> eski (yazım) zamanı (kesirli)"""
    for name, a, b, k, g0, n in _G:
        if gf < g0 + n: return a + (gf - g0) * (b - a) / n
    return OLD_END + (gf - NG)
def g_of_old(f):
    for name, a, b, k, g0, n in _G:
        if f < b: return g0 + (f - a) * n / (b - a)
    return NG + (f - OLD_END)
# kurgu sırası (planlar)
EDIT = ['S0', 'S1', 'S2', 'S3', 'U360', 'UCOL', 'S4', 'S5', 'S6', 'S7', 'F360', 'FCOL', 'S7B', 'S8']
ORDER = [gi for nm in EDIT for gi in range(shot_g(nm)[4], shot_g(nm)[4] + shot_g(nm)[5])]
_POS = {gi: i for i, gi in enumerate(ORDER)}
SHOT_STARTS_G = [x[4] for x in _G]
def delivered_of_old(f):
    """eski kare -> teslim karesi (kesirli). Son kart (eski >= 875) sona eklenir."""
    if f >= OLD_END: return NG + (f - OLD_END)
    gf = g_of_old(f); i = int(gf); return _POS[i] + (gf - i)
def new_of_old(f): return delivered_of_old(f)     # geriye uyumluluk
if __name__ == '__main__':
    print('render karesi', NG, 'teslim', round(NG / 30, 2), 's + 1.5 s son kart')
    for x in _G: print(x)
