# Kurgu sırası: render/kompozisyon eski (yazım) kare numaralarıyla yapılır, teslimde bu sıraya dizilir.
# Önce Ultra bölümü, sonra Fold8 bölümü, sonra kapanış.
SEGS = [(0, 186),     # A  Ultra: açılış, kanca, 4,1 mm, kamera
        (352, 591),   # D  Ultra: 360° şov + 4 renk
        (187, 233),   # B  "Ve karşınızda": Fold8 girişi
        (234, 351),   # C  Fold8: kapak, açılış, Dümdüz, 201 g
        (592, 801),   # E  Fold8: 360° şov + 4 renk
        (802, 874)]   # F  kapanış
ORDER = [f for a, b in SEGS for f in range(a, b + 1)]
_NEW = {o: n for n, o in enumerate(ORDER)}
def new_of_old(f):
    """yazım karesi -> teslim karesi (kesirli kareler de olur; 875+ son kart olduğu gibi)"""
    if f >= len(ORDER): return f
    i = int(f); fr = f - i
    return _NEW[i] + fr
