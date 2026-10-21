"""Generates the Kahramanlar add-on packs (BP + RP): suits, controller item, recipes,
attachables, armor textures and icons. Run: python3 gen.py  (then build.py packs the .mcaddon)."""
import json, os
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
BP, RP = os.path.join(HERE, 'src', 'KahramanBP'), os.path.join(HERE, 'src', 'KahramanRP')
U = dict(bp='8eee90dd-50f4-40b0-b4c3-07f3ff854227', bp_data='458b1414-d39c-4520-8472-269b6bfb4dcd',
         bp_script='35b9a742-f2b6-4bd9-b276-68f1dcf09167', rp='d95e5f64-be9b-4b8a-8fe7-4b239bf14339', rp_res='5ce27bc2-f6e7-429d-9271-36f59150c55a')
NS = 'kahraman'

def w(path, obj):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf8') as f:
        json.dump(obj, f, ensure_ascii=False, indent=1)

def hexc(h, a=255):
    h = h.lstrip('#'); return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), a)

# ---------- suits: colours drive the textures, material/core drive the recipes ----------
SUITS = [
  dict(id='demir', name='Demir Zırh', base='#9c1f1f', acc='#d9a43a', dark='#5a0f0f', glow='#9ff3ff', mat='minecraft:iron_ingot', core='minecraft:redstone_block', cape=None, prot=(4, 9, 7, 4)),
  dict(id='simsek', name='Şimşek', base='#b3121f', acc='#ffd23a', dark='#6a0a12', glow='#fff3a0', mat='minecraft:gold_ingot', core='minecraft:glowstone', cape=None, prot=(3, 7, 6, 3)),
  dict(id='ag', name='Ağ Atan', base='#16202b', acc='#1fb5a5', dark='#0a0f15', glow='#e8fffb', mat='minecraft:string', core='minecraft:spider_eye', cape=None, prot=(3, 7, 6, 3)),
  dict(id='gok', name='Gök Kahramanı', base='#1d4fbf', acc='#d81e2b', dark='#123177', glow='#ffd23a', mat='minecraft:diamond', core='minecraft:lapis_block', cape='#c4141f', prot=(5, 10, 8, 5)),
  dict(id='gece', name='Gece Bekçisi', base='#2a2d33', acc='#e0b43a', dark='#111316', glow='#f4f6f8', mat='minecraft:leather', core='minecraft:coal_block', cape='#121417', prot=(4, 8, 7, 4)),
  dict(id='buz', name='Buz Ustası', base='#d8eef7', acc='#3fb6e0', dark='#7fb3c9', glow='#e9fbff', mat='minecraft:packed_ice', core='minecraft:diamond', cape=None, prot=(4, 8, 7, 4)),
]
PIECES = [  # key, slot, enchant slot, vanilla geometry, layer, label, recipe pattern
  ('kask', 'slot.armor.head', 'armor_head', 'geometry.humanoid.armor.helmet', 1, 'Kask', ['MMM', 'MCM']),
  ('gogus', 'slot.armor.chest', 'armor_torso', 'geometry.humanoid.armor.chestplate', 1, 'Göğüslük', ['MCM', 'MMM', 'MMM']),
  ('pantolon', 'slot.armor.legs', 'armor_legs', 'geometry.humanoid.armor.leggings', 2, 'Pantolon', ['MMM', 'MCM', 'M M']),
  ('bot', 'slot.armor.feet', 'armor_feet', 'geometry.humanoid.armor.boots', 1, 'Bot', ['MCM', 'M M']),
]
VIS = {'kask': 'variable.helmet_layer_visible = 0.0;', 'gogus': 'variable.chest_layer_visible = 0.0;',
       'pantolon': 'variable.leg_layer_visible = 0.0;', 'bot': 'variable.boot_layer_visible = 0.0;'}
GROUP = {'kask': 'itemGroup.name.helmet', 'gogus': 'itemGroup.name.chestplate', 'pantolon': 'itemGroup.name.leggings', 'bot': 'itemGroup.name.boots'}

# ---------- manifests ----------
w(f'{BP}/manifest.json', {"format_version": 2, "header": {"name": "Tepetaklak Kahramanlar", "description": "6 süper kahraman kostümü ve güçleri. Hayran yapımı, özgün tasarım.",
  "uuid": U['bp'], "version": [1, 0, 0], "min_engine_version": [1, 21, 50]},
  "modules": [{"type": "data", "uuid": U['bp_data'], "version": [1, 0, 0]},
              {"type": "script", "language": "javascript", "uuid": U['bp_script'], "entry": "scripts/main.js", "version": [1, 0, 0]}],
  "dependencies": [{"uuid": U['rp'], "version": [1, 0, 0]}, {"module_name": "@minecraft/server", "version": "1.16.0"}]})
w(f'{RP}/manifest.json', {"format_version": 2, "header": {"name": "Tepetaklak Kahramanlar", "description": "Kostüm dokuları, pelerinler ve simgeler.",
  "uuid": U['rp'], "version": [1, 0, 0], "min_engine_version": [1, 21, 50]},
  "modules": [{"type": "resources", "uuid": U['rp_res'], "version": [1, 0, 0]}],
  "dependencies": [{"uuid": U['bp'], "version": [1, 0, 0]}]})

item_tex = {}
# ---------- caped chestplate geometry (armor chest + arms + a cape on the back) ----------
w(f'{RP}/models/entity/caped_chest.geo.json', {"format_version": "1.12.0", "minecraft:geometry": [{
  "description": {"identifier": "geometry.kahraman.caped_chest", "texture_width": 64, "texture_height": 64, "visible_bounds_width": 3, "visible_bounds_height": 3, "visible_bounds_offset": [0, 1.5, 0]},
  "bones": [
    {"name": "body", "pivot": [0, 24, 0], "cubes": [{"origin": [-4, 12, -2], "size": [8, 12, 4], "inflate": 1.01, "uv": [16, 16]}]},
    {"name": "rightArm", "pivot": [-5, 22, 0], "cubes": [{"origin": [-8, 12, -2], "size": [4, 12, 4], "inflate": 1.0, "uv": [40, 16]}]},
    {"name": "leftArm", "pivot": [5, 22, 0], "mirror": True, "cubes": [{"origin": [4, 12, -2], "size": [4, 12, 4], "inflate": 1.0, "uv": [40, 16]}]},
    {"name": "cape", "parent": "body", "pivot": [0, 24, 3.2], "cubes": [{"origin": [-5, 3, 3.2], "size": [10, 21, 1], "uv": [0, 32]}]}]}]})
w(f'{RP}/animations/cape.animation.json', {"format_version": "1.8.0", "animations": {"animation.kahraman.cape": {"loop": True, "bones": {"cape": {
  "rotation": ["math.clamp(6 + query.modified_move_speed * 70 + math.sin(query.life_time * 120) * 3 + (query.is_on_ground ? 0 : 35), 0, 80)", 0, 0]}}}}})

def paint_suit(s, layer):
    """Armor textures follow the vanilla humanoid armor UV layout (64x32, capes on 64x64)."""
    H = 64 if (s['cape'] and layer == 1) else 32
    im = Image.new('RGBA', (64, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    B, A, D, Gl = hexc(s['base']), hexc(s['acc']), hexc(s['dark']), hexc(s['glow'])
    R = lambda x0, y0, x1, y1, c: d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=c)
    if layer == 1:
        R(0, 0, 32, 16, B); R(32, 0, 64, 16, (0, 0, 0, 0))          # helmet (outer hat layer empty)
        R(16, 16, 40, 32, B); R(40, 16, 56, 32, B); R(0, 16, 16, 32, B)  # chest, arms, boots
        sid = s['id']
        # helmet faces: front 8..16 x 8..16
        if sid == 'demir':
            R(8, 8, 16, 16, A); R(9, 11, 12, 12, Gl); R(12, 11, 15, 12, Gl); R(10, 13, 14, 16, D)
            R(8, 0, 16, 8, B); R(0, 8, 8, 16, B); R(16, 8, 24, 16, B)
            R(22, 21, 26, 25, Gl); d.point((24, 23), fill=(255, 255, 255, 255))      # chest reactor
            R(20, 26, 28, 27, A); R(40, 26, 56, 29, A); R(0, 26, 16, 32, A)         # belt, gauntlets, boots
        elif sid == 'simsek':
            R(9, 11, 12, 12, (30, 10, 10, 255)); R(12, 11, 15, 12, (30, 10, 10, 255)); R(10, 13, 14, 16, hexc('#f0c8a8'))
            R(0, 9, 2, 12, A); R(22, 9, 24, 12, A)                                    # ear wings
            R(21, 21, 27, 27, (255, 255, 255, 255)); d.line([(25, 21), (23, 24), (25, 24), (23, 27)], fill=A, width=1)
            R(20, 27, 28, 28, A); R(0, 28, 16, 32, A); R(40, 29, 56, 32, D)
        elif sid == 'ag':
            for x in range(0, 64, 3):
                d.line([(x, 0), (x, H)], fill=D)
            for y in range(0, 32, 3):
                d.line([(0, y), (56, y)], fill=D)
            R(32, 0, 64, 16, (0, 0, 0, 0))
            R(9, 10, 12, 13, Gl); R(12, 10, 15, 13, Gl)                                # big eyes
            R(20, 20, 28, 32, B); d.line([(24, 21), (24, 26)], fill=A); d.line([(21, 22), (27, 25)], fill=A); d.line([(27, 22), (21, 25)], fill=A)
            R(16, 16, 40, 18, A); R(40, 16, 56, 18, A); R(0, 29, 16, 32, A)
        elif sid == 'gok':
            R(8, 8, 16, 16, hexc('#f0c8a8')); R(9, 11, 12, 12, hexc('#1d4fbf')); R(12, 11, 15, 12, hexc('#1d4fbf'))
            R(8, 0, 16, 8, (30, 22, 16, 255)); R(0, 8, 8, 10, (30, 22, 16, 255)); R(16, 8, 24, 10, (30, 22, 16, 255)); R(24, 8, 32, 12, (30, 22, 16, 255))
            d.polygon([(21, 21), (27, 21), (28, 23), (24, 27), (20, 23)], fill=A); d.polygon([(24, 22), (25, 24), (24, 26), (23, 24)], fill=Gl)
            R(20, 27, 28, 28, Gl); R(0, 24, 16, 32, A)
        elif sid == 'gece':
            R(8, 8, 16, 16, B); R(10, 13, 14, 16, hexc('#e6c3a3')); R(9, 11, 12, 12, Gl); R(12, 11, 15, 12, Gl)
            R(9, 0, 10, 2, D); R(14, 0, 15, 2, D)
            d.ellipse([21, 21, 27, 25], fill=A); d.ellipse([22, 20, 27, 24], fill=B)                  # crescent emblem
            R(20, 27, 28, 29, A); R(40, 26, 56, 32, D); R(0, 26, 16, 32, D)
        elif sid == 'buz':
            for (x, y) in [(2, 18), (6, 22), (10, 26), (44, 20), (50, 25), (18, 22), (34, 24), (26, 29)]:
                d.polygon([(x, y - 2), (x + 1, y), (x, y + 2), (x - 1, y)], fill=A)
            R(8, 10, 16, 13, A); R(9, 11, 15, 12, Gl)
            d.polygon([(24, 20), (27, 24), (24, 28), (21, 24)], fill=A); R(23, 23, 25, 25, Gl)
            R(0, 28, 16, 32, A)
        if s['cape']:
            C = hexc(s['cape']); R(0, 32, 22, 54, C)
            d.line([(1, 33), (1, 53)], fill=tuple(max(0, v - 30) for v in C[:3]) + (255,))
    else:
        R(0, 16, 16, 32, B); R(16, 16, 40, 32, B)
        sid = s['id']
        if sid == 'demir':
            R(0, 22, 16, 24, A); R(16, 16, 40, 18, A)
        elif sid == 'simsek':
            d.line([(3, 20), (1, 24), (3, 24), (1, 28)], fill=A); d.line([(11, 20), (9, 24), (11, 24), (9, 28)], fill=A)
        elif sid == 'ag':
            for x in range(0, 40, 3):
                d.line([(x, 16), (x, 32)], fill=D)
            for y in range(16, 32, 3):
                d.line([(0, y), (40, y)], fill=D)
        elif sid == 'gok':
            R(16, 16, 40, 19, hexc('#d81e2b')); R(23, 16, 25, 19, hexc('#ffd23a'))
        elif sid == 'gece':
            R(16, 16, 40, 19, A); R(0, 26, 16, 32, D)
        elif sid == 'buz':
            for (x, y) in [(3, 20), (9, 26), (13, 21), (20, 24), (32, 22)]:
                d.polygon([(x, y - 2), (x + 1, y), (x, y + 2), (x - 1, y)], fill=A)
    return im

def icon(s, piece):
    im = Image.new('RGBA', (16, 16), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    B, A, D, Gl = hexc(s['base']), hexc(s['acc']), hexc(s['dark']), hexc(s['glow'])
    if piece == 'kask':
        d.rounded_rectangle([3, 3, 12, 12], 3, fill=B); d.rectangle([5, 7, 10, 8], fill=Gl); d.rectangle([3, 11, 12, 12], fill=A)
    elif piece == 'gogus':
        d.polygon([(2, 3), (6, 2), (10, 2), (14, 3), (13, 7), (12, 7), (12, 14), (4, 14), (4, 7), (3, 7)], fill=B)
        d.ellipse([6, 6, 10, 10], fill=A); d.point((8, 8), fill=Gl)
    elif piece == 'pantolon':
        d.rectangle([4, 2, 12, 5], fill=A); d.polygon([(4, 5), (12, 5), (12, 14), (9, 14), (8, 8), (7, 14), (4, 14)], fill=B)
    else:
        d.polygon([(3, 6), (6, 6), (6, 11), (8, 11), (8, 14), (3, 14)], fill=B); d.polygon([(9, 6), (12, 6), (12, 14), (9, 14), (9, 11)], fill=B)
        d.rectangle([3, 13, 13, 14], fill=A)
    return im

lang = ['pack.name=Tepetaklak Kahramanlar', 'pack.description=Süper kahraman kostümleri']
for s in SUITS:
    for li in (1, 2):
        p = f'{RP}/textures/models/armor/{NS}_{s["id"]}_{li}.png'; os.makedirs(os.path.dirname(p), exist_ok=True)
        paint_suit(s, li).save(p)
    for i, (key, slot, ench, geo, layer, label, pattern) in enumerate(PIECES):
        ident = f'{NS}:{s["id"]}_{key}'
        tex_key = f'{NS}_{s["id"]}_{key}'
        w(f'{BP}/items/{s["id"]}_{key}.json', {"format_version": "1.21.50", "minecraft:item": {
            "description": {"identifier": ident, "menu_category": {"category": "equipment", "group": GROUP[key]}},
            "components": {
                "minecraft:icon": {"textures": {"default": tex_key}},
                "minecraft:display_name": {"value": f'{s["name"]} {label}'},
                "minecraft:max_stack_size": 1,
                "minecraft:wearable": {"slot": slot, "protection": s['prot'][i]},
                "minecraft:durability": {"max_durability": 700},
                "minecraft:enchantable": {"slot": ench, "value": 12},
                "minecraft:repairable": {"repair_items": [{"items": [s['mat']], "repair_amount": "context.other->query.remaining_durability + 0.12 * context.other->query.max_durability"}]}}}})
        caped = s['cape'] and key == 'gogus'
        att = {"format_version": "1.10.0", "minecraft:attachable": {"description": {
            "identifier": ident, "materials": {"default": "armor", "enchanted": "armor_enchanted"},
            "textures": {"default": f'textures/models/armor/{NS}_{s["id"]}_{layer}', "enchanted": "textures/misc/enchanted_item_glint"},
            "geometry": {"default": "geometry.kahraman.caped_chest" if caped else geo},
            "scripts": {"parent_setup": VIS[key]}, "render_controllers": ["controller.render.armor"]}}}
        if caped:
            att["minecraft:attachable"]["description"]["animations"] = {"cape": "animation.kahraman.cape"}
            att["minecraft:attachable"]["description"]["scripts"]["animate"] = ["cape"]
        w(f'{RP}/attachables/{s["id"]}_{key}.json', att)
        ip = f'{RP}/textures/items/{tex_key}.png'; os.makedirs(os.path.dirname(ip), exist_ok=True); icon(s, key).save(ip)
        item_tex[tex_key] = {"textures": f'textures/items/{tex_key}'}
        keymap = {"M": {"item": s['mat']}, "C": {"item": s['core']}}
        w(f'{BP}/recipes/{s["id"]}_{key}.json', {"format_version": "1.20.10", "minecraft:recipe_shaped": {
            "description": {"identifier": ident}, "tags": ["crafting_table"], "pattern": pattern, "key": keymap,
            "unlock": [{"item": s['core']}], "result": {"item": ident, "count": 1}}})

# ---------- the hero controller (activates powers) ----------
w(f'{BP}/items/kumanda.json', {"format_version": "1.21.50", "minecraft:item": {
  "description": {"identifier": f'{NS}:kumanda', "menu_category": {"category": "equipment"}},
  "components": {"minecraft:icon": {"textures": {"default": f'{NS}_kumanda'}}, "minecraft:display_name": {"value": "Kahraman Kumandası (kullan = güç, eğil + kullan = 2. güç)"},
                 "minecraft:max_stack_size": 1, "minecraft:hand_equipped": True}}})
w(f'{BP}/recipes/kumanda.json', {"format_version": "1.20.10", "minecraft:recipe_shaped": {"description": {"identifier": f'{NS}:kumanda'}, "tags": ["crafting_table"],
  "pattern": [" G ", "RIR", " I "], "key": {"G": {"item": "minecraft:glowstone_dust"}, "R": {"item": "minecraft:redstone"}, "I": {"item": "minecraft:iron_ingot"}},
  "unlock": [{"item": "minecraft:redstone"}], "result": {"item": f'{NS}:kumanda', "count": 1}}})
k = Image.new('RGBA', (16, 16), (0, 0, 0, 0)); kd = ImageDraw.Draw(k)
kd.rounded_rectangle([4, 2, 11, 14], 2, fill=hexc('#2a2d33')); kd.ellipse([6, 4, 9, 7], fill=hexc('#e3263b')); kd.rectangle([6, 9, 9, 10], fill=hexc('#ffd23a')); kd.rectangle([6, 12, 9, 12], fill=hexc('#9ff3ff'))
k.save(f'{RP}/textures/items/{NS}_kumanda.png'); item_tex[f'{NS}_kumanda'] = {"textures": f'textures/items/{NS}_kumanda'}
w(f'{RP}/textures/item_texture.json', {"resource_pack_name": "kahraman", "texture_name": "atlas.items", "texture_data": item_tex})

for pack in (BP, RP):
    os.makedirs(f'{pack}/texts', exist_ok=True)
    open(f'{pack}/texts/en_US.lang', 'w', encoding='utf8').write('\n'.join(lang) + '\n')
    open(f'{pack}/texts/tr_TR.lang', 'w', encoding='utf8').write('\n'.join(lang) + '\n')
    w(f'{pack}/texts/languages.json', ["en_US", "tr_TR"])
# pack icon: the six suit colours as stripes behind a lightning bolt
pi = Image.new('RGBA', (128, 128), (5, 6, 8, 255)); pd = ImageDraw.Draw(pi)
for i, s in enumerate(SUITS):
    pd.rectangle([i * 21, 0, i * 21 + 20, 127], fill=hexc(s['base']))
pd.polygon([(70, 10), (40, 70), (62, 70), (50, 118), (92, 52), (68, 52), (84, 10)], fill=hexc('#ffd23a'))
pi.save(f'{BP}/pack_icon.png'); pi.save(f'{RP}/pack_icon.png')
print('generated', len(SUITS) * 4, 'suit pieces')
