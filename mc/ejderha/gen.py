"""Generates the Ejderha Binicileri add-on (BP + RP): dragon, egg and boss entities, model,
animations, textures, items, recipes and loot. Run: python3 gen.py, then python3 build.py."""
import json, os, math, random
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
BP, RP = os.path.join(HERE, 'src', 'EjderhaBP'), os.path.join(HERE, 'src', 'EjderhaRP')
U = dict(bp='ed9ac4f6-0d90-43a1-8661-2f00e9fb5f87', bp_data='959303b3-4303-4b28-ba68-3e1add93638d', bp_script='575cb4e2-b908-46a2-af3f-d6bf5d4c086e',
         rp='9cc7b2d7-8420-48e2-9d7e-74f56b403b33', rp_res='81cd8066-e591-4daa-bb7a-a2d5e40a49e9')
NS = 'ejderha'

def w(path, obj):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf8') as f: json.dump(obj, f, ensure_ascii=False, indent=1)
def hexc(h, a=255): h = h.lstrip('#'); return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), a)

BREEDS = [  # id, name, body, belly, wing, horn, eye, core (egg recipe)
  dict(id='kizil', name='Kızıl Ejderha', body='#a3201f', belly='#e0a040', wing='#6e1414', horn='#efe4cf', eye='#ffd23a', core='minecraft:blaze_powder'),
  dict(id='yesil', name='Yeşil Ejderha', body='#2f7a3a', belly='#c9d77a', wing='#1d4e26', horn='#e8e2c8', eye='#ff5a3a', core='minecraft:emerald'),
  dict(id='kara', name='Kara Ejderha', body='#24222b', belly='#5a4f73', wing='#141218', horn='#c9c2d6', eye='#b26bff', core='minecraft:crying_obsidian'),
  dict(id='buz', name='Buz Ejderhası', body='#bfe4f2', belly='#ffffff', wing='#7cc3df', horn='#e9fbff', eye='#2a74ff', core='minecraft:packed_ice'),
]
BOSS = dict(id='kadim', body='#16121c', belly='#3b2a52', wing='#0c0a10', horn='#d9cfe8', eye='#ff3df0')

w(f'{BP}/manifest.json', {"format_version": 2, "header": {"name": "Ejderha Binicileri", "description": "Yumurtadan çıkar, büyüt, bin ve uç. 4 ejderha türü ve Kadim Ejderha boss. Hayran yapımı.",
  "uuid": U['bp'], "version": [1, 0, 0], "min_engine_version": [1, 21, 50]},
  "modules": [{"type": "data", "uuid": U['bp_data'], "version": [1, 0, 0]}, {"type": "script", "language": "javascript", "uuid": U['bp_script'], "entry": "scripts/main.js", "version": [1, 0, 0]}],
  "dependencies": [{"uuid": U['rp'], "version": [1, 0, 0]}, {"module_name": "@minecraft/server", "version": "1.16.0"}]})
w(f'{RP}/manifest.json', {"format_version": 2, "header": {"name": "Ejderha Binicileri", "description": "Ejderha modeli, animasyonları ve dokuları.",
  "uuid": U['rp'], "version": [1, 0, 0], "min_engine_version": [1, 21, 50]},
  "modules": [{"type": "resources", "uuid": U['rp_res'], "version": [1, 0, 0]}], "dependencies": [{"uuid": U['bp'], "version": [1, 0, 0]}]})

# ======================= dragon model (front = -Z, 1 unit = 1/16 block, adult size) =======================
TW, TH = 128, 160
def cb(o, s, uv, mirror=False, inflate=None):
    c = {"origin": o, "size": s, "uv": uv}
    if mirror: c["mirror"] = True
    if inflate: c["inflate"] = inflate
    return c
CUBES = {}  # bone -> list of (uv, size, part) used to paint the texture
def bone(name, parent, pivot, cubes, parts):
    b = {"name": name, "pivot": pivot}
    if parent: b["parent"] = parent
    if cubes: b["cubes"] = cubes
    for c, part in zip(cubes, parts): CUBES.setdefault(name, []).append((c["uv"], c["size"], part))
    return b
bones = [
  bone("root", None, [0, 0, 0], [], []),
  bone("body", "root", [0, 20, 0], [cb([-8, 14, -14], [16, 12, 28], [0, 0])], ['body']),
  bone("neck1", "body", [0, 24, -14], [cb([-4, 20, -24], [8, 8, 10], [0, 40])], ['body']),
  bone("neck2", "neck1", [0, 25, -23], [cb([-3.5, 21, -32], [7, 7, 9], [36, 40])], ['body']),
  bone("head", "neck2", [0, 26, -31], [cb([-5, 22, -41], [10, 8, 10], [0, 58]), cb([-3.5, 22, -48], [7, 5, 7], [40, 58]),
                                         cb([-4.5, 29, -36], [2, 2, 8], [96, 0]), cb([2.5, 29, -36], [2, 2, 8], [96, 0], True)], ['head', 'snout', 'horn', 'horn']),
  bone("jaw", "head", [0, 22, -40], [cb([-3, 20, -47], [6, 2, 7], [68, 58])], ['belly']),
  bone("tail1", "body", [0, 21, 14], [cb([-4, 17, 14], [8, 8, 12], [0, 80])], ['body']),
  bone("tail2", "tail1", [0, 21, 26], [cb([-3, 18, 26], [6, 6, 12], [40, 80])], ['body']),
  bone("tail3", "tail2", [0, 21, 38], [cb([-2, 19, 38], [4, 4, 12], [76, 80]), cb([-0.5, 22.5, 42], [1, 3, 7], [108, 80])], ['body', 'horn']),
  bone("leg_fl", "root", [6, 16, -9], [cb([4, 0, -12], [5, 16, 5], [88, 20])], ['leg']),
  bone("leg_fr", "root", [-6, 16, -9], [cb([-9, 0, -12], [5, 16, 5], [88, 20], True)], ['leg']),
  bone("leg_bl", "root", [6, 16, 9], [cb([4, 0, 7], [5, 16, 5], [88, 20])], ['leg']),
  bone("leg_br", "root", [-6, 16, 9], [cb([-9, 0, 7], [5, 16, 5], [88, 20], True)], ['leg']),
  bone("wing_l", "body", [8, 25, -8], [cb([8, 24, -9], [24, 2, 3], [0, 100]), cb([8, 24.5, -6], [24, 1, 18], [0, 106])], ['horn', 'wing']),
  bone("wing_l2", "wing_l", [32, 25, -8], [cb([32, 24, -9], [20, 2, 3], [60, 100]), cb([32, 24.5, -6], [20, 1, 14], [0, 128])], ['horn', 'wing']),
  bone("wing_r", "body", [-8, 25, -8], [cb([-32, 24, -9], [24, 2, 3], [0, 100], True), cb([-32, 24.5, -6], [24, 1, 18], [0, 106], True)], ['horn', 'wing']),
  bone("wing_r2", "wing_r", [-32, 25, -8], [cb([-52, 24, -9], [20, 2, 3], [60, 100], True), cb([-52, 24.5, -6], [20, 1, 14], [0, 128], True)], ['horn', 'wing']),
]
w(f'{RP}/models/entity/dragon.geo.json', {"format_version": "1.12.0", "minecraft:geometry": [{"description": {"identifier": "geometry.ejderha.dragon",
  "texture_width": TW, "texture_height": TH, "visible_bounds_width": 8, "visible_bounds_height": 5, "visible_bounds_offset": [0, 1.5, 0]}, "bones": bones}]})
w(f'{RP}/models/entity/egg.geo.json', {"format_version": "1.12.0", "minecraft:geometry": [{"description": {"identifier": "geometry.ejderha.egg",
  "texture_width": 32, "texture_height": 32, "visible_bounds_width": 1, "visible_bounds_height": 1.2, "visible_bounds_offset": [0, 0.5, 0]},
  "bones": [{"name": "egg", "pivot": [0, 0, 0], "cubes": [cb([-3, 0, -3], [6, 9, 6], [0, 0]), cb([-2, 9, -2], [4, 2, 4], [0, 15]), cb([-2.5, 0.5, -2.5], [5, 1, 5], [0, 21], inflate=0.6)]}]}]})

def paint_dragon(c, path):
    im = Image.new('RGBA', (TW, TH), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    col = {'body': hexc(c['body']), 'belly': hexc(c['belly']), 'wing': hexc(c['wing']), 'horn': hexc(c['horn']), 'leg': hexc(c['body']), 'head': hexc(c['body']), 'snout': hexc(c['body'])}
    dark = tuple(max(0, v - 38) for v in hexc(c['body'])[:3]) + (255,)
    rnd = random.Random(c['id'])
    for bname, lst in CUBES.items():
        for (u, v), (sx, sy, sz), part in lst:
            sx, sy, sz = math.ceil(sx), math.ceil(sy), math.ceil(sz)
            W, H = 2 * (sz + sx), sz + sy
            d.rectangle([u, v, u + W - 1, v + H - 1], fill=col[part])
            if part in ('body', 'leg', 'head', 'snout'):
                for _ in range(W * H // 9):  # scales
                    x, y = u + rnd.randrange(W), v + rnd.randrange(H); d.point((x, y), fill=dark)
                # belly: the bottom face of a box sits at (u+sz+sx, v), size sx x sz
                if part == 'body' and bname in ('body', 'neck1', 'neck2', 'tail1', 'tail2', 'tail3'):
                    d.rectangle([u + sz + sx, v, u + sz + 2 * sx - 1, v + sz - 1], fill=col['belly'])
                    for yy in range(v + 1, v + sz, 3): d.line([(u + sz + sx, yy), (u + sz + 2 * sx - 1, yy)], fill=tuple(max(0, q - 30) for q in col['belly'][:3]) + (255,))
            if part == 'wing':
                for k in range(0, W, 6): d.line([(u + k, v), (u + k + 3, v + H - 1)], fill=tuple(max(0, q - 25) for q in col['wing'][:3]) + (255,))
            if part == 'leg':
                d.rectangle([u, v + H - 3, u + W - 1, v + H - 1], fill=col['horn'])  # claws
    # eyes on the head's side faces (head box uv [0,58], size 10x8x10: sides at (0,68) and (20,68))
    E = hexc(c['eye'])
    for ex in (2, 22): d.rectangle([ex, 69, ex + 2, 70], fill=E); d.point((ex + 1, 69), fill=(255, 255, 255, 255))
    # nostrils on the snout front (uv [40,58] size 7x5x7: front face at (47,65) 7x5)
    d.point((48, 66), fill=(20, 10, 10, 255)); d.point((52, 66), fill=(20, 10, 10, 255))
    # back ridge spikes along the body top (top face at (28,0) 16x28)
    for yy in range(2, 28, 4): d.rectangle([35, yy, 36, yy + 1], fill=col['horn'])
    os.makedirs(os.path.dirname(path), exist_ok=True); im.save(path)

def paint_egg(c, path):
    im = Image.new('RGBA', (32, 32), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    B, Bl, E = hexc(c['body']), hexc(c['belly']), hexc(c['eye'])
    d.rectangle([0, 0, 23, 14], fill=B); d.rectangle([0, 15, 15, 20], fill=B); d.rectangle([0, 21, 19, 26], fill=Bl)
    rnd = random.Random('egg' + c['id'])
    for _ in range(40): d.point((rnd.randrange(24), rnd.randrange(15)), fill=Bl)
    for _ in range(10): d.point((rnd.randrange(24), rnd.randrange(15)), fill=E)
    im.save(path)

for b in BREEDS:
    paint_dragon(b, f'{RP}/textures/entity/dragon_{b["id"]}.png'); paint_egg(b, f'{RP}/textures/entity/egg_{b["id"]}.png')
paint_dragon(BOSS, f'{RP}/textures/entity/dragon_kadim.png')

# ======================= animations =======================
FLAP = "math.sin(query.anim_time * 400)"
anims = {
  "animation.ejderha.flap": {"loop": True, "bones": {
     "wing_l": {"rotation": [0, 0, f"-{FLAP} * 38 - 5"]}, "wing_l2": {"rotation": [0, 0, f"-math.sin(query.anim_time * 400 - 60) * 26"]},
     "wing_r": {"rotation": [0, 0, f"{FLAP} * 38 + 5"]}, "wing_r2": {"rotation": [0, 0, f"math.sin(query.anim_time * 400 - 60) * 26"]},
     "body": {"position": [0, f"{FLAP} * 0.6", 0]},
     "leg_fl": {"rotation": [-50, 0, 0]}, "leg_fr": {"rotation": [-50, 0, 0]}, "leg_bl": {"rotation": [45, 0, 0]}, "leg_br": {"rotation": [45, 0, 0]},
     "tail1": {"rotation": [f"-6 + math.sin(query.anim_time * 200) * 4", 0, 0]}, "tail2": {"rotation": [f"math.sin(query.anim_time * 200 - 40) * 6", 0, 0]}}},
  "animation.ejderha.fold": {"loop": True, "bones": {
     "wing_l": {"rotation": [0, 62, -18]}, "wing_l2": {"rotation": [0, 150, 0]},
     "wing_r": {"rotation": [0, -62, 18]}, "wing_r2": {"rotation": [0, -150, 0]}}},
  "animation.ejderha.walk": {"loop": True, "bones": {
     "leg_fl": {"rotation": ["math.cos(query.modified_distance_moved * 22) * 32 * query.modified_move_speed", 0, 0]},
     "leg_br": {"rotation": ["math.cos(query.modified_distance_moved * 22) * 32 * query.modified_move_speed", 0, 0]},
     "leg_fr": {"rotation": ["-math.cos(query.modified_distance_moved * 22) * 32 * query.modified_move_speed", 0, 0]},
     "leg_bl": {"rotation": ["-math.cos(query.modified_distance_moved * 22) * 32 * query.modified_move_speed", 0, 0]}}},
  "animation.ejderha.idle": {"loop": True, "bones": {
     "body": {"scale": [1, "1 + math.sin(query.life_time * 90) * 0.015", 1]},
     "tail1": {"rotation": [0, "math.sin(query.life_time * 50) * 9", 0]}, "tail2": {"rotation": [0, "math.sin(query.life_time * 50 - 50) * 12", 0]},
     "tail3": {"rotation": [0, "math.sin(query.life_time * 50 - 100) * 16", 0]}, "neck2": {"rotation": ["math.sin(query.life_time * 40) * 3", 0, 0]}}},
  "animation.ejderha.look": {"loop": True, "bones": {"head": {"rotation": ["query.target_x_rotation * 0.6", "query.target_y_rotation * 0.6", 0]},
     "neck1": {"rotation": ["query.target_x_rotation * 0.2", "query.target_y_rotation * 0.2", 0]}}},
  "animation.ejderha.breath": {"loop": True, "bones": {"jaw": {"rotation": ["q.property('ejderha:breath') ? 28 : 0", 0, 0]},
     "head": {"rotation": ["q.property('ejderha:breath') ? -12 : 0", 0, 0]}}},
  "animation.ejderha.egg_wobble": {"loop": True, "bones": {"egg": {"rotation": [0, 0, "math.sin(query.life_time * 900) * (query.life_time > 4 ? 9 : 3)"]}}},
}
w(f'{RP}/animations/dragon.animation.json', {"format_version": "1.8.0", "animations": anims})
w(f'{RP}/animation_controllers/dragon.ac.json', {"format_version": "1.10.0", "animation_controllers": {"controller.animation.ejderha.move": {"initial_state": "ground", "states": {
  "ground": {"animations": ["fold", "walk"], "transitions": [{"flying": "q.property('ejderha:flying')"}], "blend_transition": 0.3},
  "flying": {"animations": ["flap"], "transitions": [{"ground": "!q.property('ejderha:flying')"}], "blend_transition": 0.3}}}}})

dragon_anims = {"flap": "animation.ejderha.flap", "fold": "animation.ejderha.fold", "walk": "animation.ejderha.walk", "idle": "animation.ejderha.idle",
                "look": "animation.ejderha.look", "breath": "animation.ejderha.breath", "move": "controller.animation.ejderha.move"}
tex = {b['id']: f'textures/entity/dragon_{b["id"]}' for b in BREEDS}
w(f'{RP}/entity/dragon.entity.json', {"format_version": "1.10.0", "minecraft:client_entity": {"description": {
  "identifier": f'{NS}:dragon', "materials": {"default": "entity_alphatest"}, "textures": tex, "geometry": {"default": "geometry.ejderha.dragon"},
  "animations": dragon_anims, "scripts": {"scale": "q.property('ejderha:stage') == 0 ? 0.35 : (q.property('ejderha:stage') == 1 ? 0.65 : 1.0)",
     "animate": ["move", "idle", "look", "breath"]},
  "render_controllers": ["controller.render.ejderha.dragon"], "spawn_egg": {"base_color": "#a3201f", "overlay_color": "#e0a040"}}}})
w(f'{RP}/entity/kadim.entity.json', {"format_version": "1.10.0", "minecraft:client_entity": {"description": {
  "identifier": f'{NS}:kadim', "materials": {"default": "entity_alphatest"}, "textures": {"default": "textures/entity/dragon_kadim"},
  "geometry": {"default": "geometry.ejderha.dragon"}, "animations": dragon_anims, "scripts": {"scale": "2.6", "animate": ["move", "idle", "breath"]},
  "render_controllers": ["controller.render.default"], "spawn_egg": {"base_color": "#16121c", "overlay_color": "#ff3df0"}}}})
w(f'{RP}/entity/egg.entity.json', {"format_version": "1.10.0", "minecraft:client_entity": {"description": {
  "identifier": f'{NS}:egg', "materials": {"default": "entity_alphatest"}, "textures": {b['id']: f'textures/entity/egg_{b["id"]}' for b in BREEDS},
  "geometry": {"default": "geometry.ejderha.egg"}, "animations": {"wobble": "animation.ejderha.egg_wobble"}, "scripts": {"animate": ["wobble"]},
  "render_controllers": ["controller.render.ejderha.egg"]}}})
arr = lambda: [f"Texture.{b['id']}" for b in BREEDS]
w(f'{RP}/render_controllers/ejderha.render_controllers.json', {"format_version": "1.8.0", "render_controllers": {
  "controller.render.ejderha.dragon": {"arrays": {"textures": {"Array.skins": arr()}}, "geometry": "Geometry.default", "materials": [{"*": "Material.default"}], "textures": ["Array.skins[query.variant]"]},
  "controller.render.ejderha.egg": {"arrays": {"textures": {"Array.skins": arr()}}, "geometry": "Geometry.default", "materials": [{"*": "Material.default"}], "textures": ["Array.skins[query.variant]"]}}})
w(f'{RP}/sounds.json', {"entity_sounds": {"entities": {
  f'{NS}:dragon': {"volume": 0.7, "pitch": [1.1, 1.5], "events": {"ambient": "mob.enderdragon.growl", "hurt": "mob.enderdragon.hit", "death": "mob.enderdragon.death", "step": {"sound": "step.stone", "volume": 0.3}}},
  f'{NS}:kadim': {"volume": 1.4, "pitch": [0.7, 0.9], "events": {"ambient": "mob.enderdragon.growl", "hurt": "mob.enderdragon.hit", "death": "mob.enderdragon.death"}}}}})

# ======================= behavior: entities =======================
variants_groups = {f'{NS}:v_{b["id"]}': {"minecraft:variant": {"value": i}} for i, b in enumerate(BREEDS)}
variant_events = {f'{NS}:set_{b["id"]}': {"add": {"component_groups": [f'{NS}:v_{b["id"]}']}} for b in BREEDS}
MEAT = ["minecraft:cod", "minecraft:salmon", "minecraft:beef", "minecraft:porkchop", "minecraft:chicken", "minecraft:mutton", "minecraft:rabbit",
        "minecraft:cooked_cod", "minecraft:cooked_salmon", "minecraft:cooked_beef", "minecraft:cooked_porkchop", "minecraft:cooked_chicken", "minecraft:cooked_mutton"]
stage = lambda w_, h_, hp, extra=None: dict({"minecraft:collision_box": {"width": w_, "height": h_}, "minecraft:health": {"value": hp, "max": hp}}, **(extra or {}))
dragon = {"format_version": "1.21.50", "minecraft:entity": {
  "description": {"identifier": f'{NS}:dragon', "is_spawnable": True, "is_summonable": True, "is_experimental": False,
    "properties": {f'{NS}:stage': {"type": "int", "range": [0, 2], "default": 0, "client_sync": True},
                   f'{NS}:flying': {"type": "bool", "default": False, "client_sync": True},
                   f'{NS}:breath': {"type": "bool", "default": False, "client_sync": True}}},
  "component_groups": dict(**variants_groups, **{
    f'{NS}:baby': stage(0.8, 0.7, 20, {"minecraft:movement": {"value": 0.3}}),
    f'{NS}:young': stage(1.4, 1.2, 50, {"minecraft:movement": {"value": 0.28}}),
    f'{NS}:adult': stage(2.4, 1.9, 120, {"minecraft:movement": {"value": 0.3}}),
    f'{NS}:wild': {"minecraft:tameable": {"probability": 0.25, "tame_items": MEAT, "tame_event": {"event": f'{NS}:on_tame', "target": "self"}},
                   "minecraft:behavior.random_stroll": {"priority": 6, "speed_multiplier": 0.8}},
    f'{NS}:hatchling': {"minecraft:tameable": {"probability": 1.0, "tame_items": MEAT, "tame_event": {"event": f'{NS}:on_tame', "target": "self"}}},
    f'{NS}:tamed': {"minecraft:is_tamed": {}, "minecraft:persistent": {}, "minecraft:sittable": {},
                    "minecraft:behavior.follow_owner": {"priority": 4, "speed_multiplier": 1.2, "start_distance": 10, "stop_distance": 3},
                    "minecraft:healable": {"items": [{"item": m, "heal_amount": 6} for m in MEAT]},
                    "minecraft:behavior.owner_hurt_by_target": {"priority": 1}, "minecraft:behavior.owner_hurt_target": {"priority": 2},
                    "minecraft:behavior.melee_attack": {"priority": 3, "speed_multiplier": 1.3, "track_target": True},
                    "minecraft:attack": {"damage": 6}},
    f'{NS}:rideable': {"minecraft:rideable": {"seat_count": 1, "crouching_skip_interact": True, "family_types": ["player"], "interact_text": "action.interact.ride.horse",
                         "seats": {"position": [0, 1.62, -0.35]}}, "minecraft:input_ground_controlled": {}},
    f'{NS}:fly': {"minecraft:physics": {"has_gravity": False, "has_collision": True}}}),
  "components": {
    "minecraft:type_family": {"family": ["ejderha", "mob"]}, "minecraft:physics": {}, "minecraft:pushable": {"is_pushable": True, "is_pushable_by_piston": True},
    "minecraft:collision_box": {"width": 0.8, "height": 0.7}, "minecraft:health": {"value": 20, "max": 20}, "minecraft:nameable": {},
    "minecraft:movement": {"value": 0.3}, "minecraft:movement.basic": {}, "minecraft:jump.static": {}, "minecraft:navigation.walk": {"avoid_water": True, "can_path_over_water": True},
    "minecraft:breathable": {"total_supply": 15, "suffocate_time": 0}, "minecraft:fire_immune": {}, "minecraft:knockback_resistance": {"value": 0.6},
    "minecraft:damage_sensor": {"triggers": [{"cause": "fall", "deals_damage": False}, {"cause": "fire", "deals_damage": False}, {"cause": "fire_tick", "deals_damage": False}]},
    "minecraft:behavior.float": {"priority": 0}, "minecraft:behavior.look_at_player": {"priority": 7, "look_distance": 8},
    "minecraft:behavior.random_look_around": {"priority": 8}, "minecraft:behavior.hurt_by_target": {"priority": 1},
    "minecraft:variable_max_auto_step": {"base_value": 1.0625, "jump_prevented_value": 0.5625},
    "minecraft:loot": {"table": "loot_tables/entities/ejderha_dragon.json"}},
  "events": dict(**variant_events, **{
    "minecraft:entity_spawned": {"sequence": [{"add": {"component_groups": [f'{NS}:baby', f'{NS}:wild']}},
       {"randomize": [{"weight": 1, "add": {"component_groups": [f'{NS}:v_{b["id"]}']}} for b in BREEDS]}]},
    f'{NS}:hatched': {"remove": {"component_groups": [f'{NS}:wild']}, "add": {"component_groups": [f'{NS}:hatchling']}},
    f'{NS}:on_tame': {"remove": {"component_groups": [f'{NS}:wild', f'{NS}:hatchling']}, "add": {"component_groups": [f'{NS}:tamed']}},
    f'{NS}:grow_young': {"remove": {"component_groups": [f'{NS}:baby']}, "add": {"component_groups": [f'{NS}:young']}},
    f'{NS}:grow_adult': {"remove": {"component_groups": [f'{NS}:young', f'{NS}:baby']}, "add": {"component_groups": [f'{NS}:adult', f'{NS}:rideable']}},
    f'{NS}:fly_on': {"add": {"component_groups": [f'{NS}:fly']}}, f'{NS}:fly_off': {"remove": {"component_groups": [f'{NS}:fly']}}})}}
w(f'{BP}/entities/dragon.json', dragon)

boss = {"format_version": "1.21.50", "minecraft:entity": {
  "description": {"identifier": f'{NS}:kadim', "is_spawnable": True, "is_summonable": True, "is_experimental": False,
    "properties": {f'{NS}:stage': {"type": "int", "range": [0, 2], "default": 2, "client_sync": True}, f'{NS}:flying': {"type": "bool", "default": True, "client_sync": True},
                   f'{NS}:breath': {"type": "bool", "default": False, "client_sync": True}}},
  "components": {"minecraft:type_family": {"family": ["ejderha", "monster", "mob", "boss"]}, "minecraft:physics": {"has_gravity": False, "has_collision": True},
    "minecraft:collision_box": {"width": 5.0, "height": 4.0}, "minecraft:health": {"value": 400, "max": 400},
    "minecraft:boss": {"name": "Kadim Ejderha", "hud_range": 80, "should_darken_sky": True},
    "minecraft:movement": {"value": 0.0}, "minecraft:fire_immune": {}, "minecraft:knockback_resistance": {"value": 1.0}, "minecraft:persistent": {},
    "minecraft:damage_sensor": {"triggers": [{"cause": "fall", "deals_damage": False}, {"cause": "suffocation", "deals_damage": False}, {"cause": "fly_into_wall", "deals_damage": False}]},
    "minecraft:nameable": {}, "minecraft:experience_reward": {"on_death": "500"}, "minecraft:loot": {"table": "loot_tables/entities/ejderha_kadim.json"}}}}
w(f'{BP}/entities/kadim.json', boss)
egg_ent = {"format_version": "1.21.50", "minecraft:entity": {
  "description": {"identifier": f'{NS}:egg', "is_spawnable": False, "is_summonable": True, "is_experimental": False},
  "component_groups": dict(**variants_groups), "events": dict(**variant_events),
  "components": {"minecraft:type_family": {"family": ["ejderha_egg", "inanimate"]}, "minecraft:collision_box": {"width": 0.5, "height": 0.7},
    "minecraft:health": {"value": 6, "max": 6}, "minecraft:physics": {}, "minecraft:pushable": {"is_pushable": False, "is_pushable_by_piston": True},
    "minecraft:persistent": {}, "minecraft:knockback_resistance": {"value": 1.0}, "minecraft:fire_immune": {},
    "minecraft:damage_sensor": {"triggers": [{"cause": "all", "deals_damage": False}]}}}}
w(f'{BP}/entities/egg.json', egg_ent)

w(f'{BP}/loot_tables/entities/ejderha_dragon.json', {"pools": [{"rolls": 1, "entries": [{"type": "item", "name": "minecraft:leather", "weight": 1, "functions": [{"function": "set_count", "count": {"min": 1, "max": 3}}]}]}]})
w(f'{BP}/loot_tables/entities/ejderha_kadim.json', {"pools": [
  {"rolls": 1, "entries": [{"type": "item", "name": "minecraft:diamond", "weight": 1, "functions": [{"function": "set_count", "count": {"min": 6, "max": 10}}]}]},
  {"rolls": 1, "entries": [{"type": "item", "name": "minecraft:netherite_scrap", "weight": 1, "functions": [{"function": "set_count", "count": {"min": 1, "max": 3}}]}]},
  {"rolls": 1, "entries": [{"type": "item", "name": "minecraft:golden_apple", "weight": 1, "functions": [{"function": "set_count", "count": {"min": 2, "max": 3}}]}]},
  {"rolls": 1, "entries": [{"type": "item", "name": f'{NS}:yumurta_kara', "weight": 1}]}]})

# ======================= items, icons, recipes =======================
item_tex = {}
def item(ident, name, tex_key, stack=16, extra=None):
    comp = {"minecraft:icon": {"textures": {"default": tex_key}}, "minecraft:display_name": {"value": name}, "minecraft:max_stack_size": stack}
    if extra: comp.update(extra)
    w(f'{BP}/items/{ident.split(":")[1]}.json', {"format_version": "1.21.50", "minecraft:item": {"description": {"identifier": ident, "menu_category": {"category": "items"}}, "components": comp}})
    item_tex[tex_key] = {"textures": f'textures/items/{tex_key}'}
def save_icon(im, key): p = f'{RP}/textures/items/{key}.png'; os.makedirs(os.path.dirname(p), exist_ok=True); im.save(p)
for b in BREEDS:
    key = f'{NS}_egg_{b["id"]}'
    item(f'{NS}:yumurta_{b["id"]}', f'{b["name"]} Yumurtası (yere koy)', key)
    im = Image.new('RGBA', (16, 16), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.ellipse([4, 2, 11, 14], fill=hexc(b['body'])); d.point((6, 6), fill=hexc(b['belly'])); d.point((9, 9), fill=hexc(b['eye'])); d.point((7, 11), fill=hexc(b['belly'])); d.arc([4, 2, 11, 14], 200, 250, fill=(255, 255, 255, 160))
    save_icon(im, key)
    w(f'{BP}/recipes/yumurta_{b["id"]}.json', {"format_version": "1.20.10", "minecraft:recipe_shaped": {"description": {"identifier": f'{NS}:yumurta_{b["id"]}'}, "tags": ["crafting_table"],
      "pattern": ["GGG", "GCG", "GGG"], "key": {"G": {"item": "minecraft:gold_ingot"}, "C": {"item": b['core']}}, "unlock": [{"item": b['core']}], "result": {"item": f'{NS}:yumurta_{b["id"]}', "count": 1}}})
item(f'{NS}:asa', 'Ejderha Asası (binerken: kullan = nefes, eğil + kullan = ateş topu)', f'{NS}_asa', 1, {"minecraft:hand_equipped": True})
im = Image.new('RGBA', (16, 16), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
d.line([(3, 14), (11, 6)], fill=hexc('#6b4a2b'), width=2); d.ellipse([10, 2, 14, 6], fill=hexc('#ff6a2a')); d.point((12, 4), fill=hexc('#ffe9a0')); save_icon(im, f'{NS}_asa')
w(f'{BP}/recipes/asa.json', {"format_version": "1.20.10", "minecraft:recipe_shaped": {"description": {"identifier": f'{NS}:asa'}, "tags": ["crafting_table"],
  "pattern": ["  D", " B ", "B  "], "key": {"D": {"item": "minecraft:diamond"}, "B": {"item": "minecraft:blaze_rod"}}, "unlock": [{"item": "minecraft:blaze_rod"}], "result": {"item": f'{NS}:asa', "count": 1}}})
item(f'{NS}:cagri', 'Kadim Çağrı Taşı (kullan: Kadim Ejderha gelir)', f'{NS}_cagri', 16)
im = Image.new('RGBA', (16, 16), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
d.polygon([(8, 1), (14, 8), (8, 15), (2, 8)], fill=hexc('#24182f')); d.polygon([(8, 4), (11, 8), (8, 12), (5, 8)], fill=hexc('#ff3df0')); save_icon(im, f'{NS}_cagri')
w(f'{BP}/recipes/cagri.json', {"format_version": "1.20.10", "minecraft:recipe_shaped": {"description": {"identifier": f'{NS}:cagri'}, "tags": ["crafting_table"],
  "pattern": ["GOG", "ODO", "GOG"], "key": {"G": {"item": "minecraft:gold_block"}, "O": {"item": "minecraft:obsidian"}, "D": {"item": "minecraft:diamond"}},
  "unlock": [{"item": "minecraft:obsidian"}], "result": {"item": f'{NS}:cagri', "count": 1}}})
w(f'{RP}/textures/item_texture.json', {"resource_pack_name": "ejderha", "texture_name": "atlas.items", "texture_data": item_tex})

lang = ['pack.name=Ejderha Binicileri', 'pack.description=Ejderha yumurtala, büyüt, bin ve uç',
        f'entity.{NS}:dragon.name=Ejderha', f'entity.{NS}:kadim.name=Kadim Ejderha', f'entity.{NS}:egg.name=Ejderha Yumurtası',
        f'item.spawn_egg.entity.{NS}:dragon.name=Ejderha Çağır', f'item.spawn_egg.entity.{NS}:kadim.name=Kadim Ejderha Çağır']
for pack in (BP, RP):
    os.makedirs(f'{pack}/texts', exist_ok=True)
    for lg in ('en_US', 'tr_TR'): open(f'{pack}/texts/{lg}.lang', 'w', encoding='utf8').write('\n'.join(lang) + '\n')
    w(f'{pack}/texts/languages.json', ["en_US", "tr_TR"])
pi = Image.new('RGBA', (128, 128), (10, 8, 14, 255)); pd = ImageDraw.Draw(pi)
pd.polygon([(64, 30), (20, 50), (10, 40), (30, 70), (64, 60), (98, 70), (118, 40), (108, 50)], fill=hexc('#a3201f'))
pd.ellipse([52, 40, 76, 96], fill=hexc('#a3201f')); pd.polygon([(64, 18), (56, 40), (72, 40)], fill=hexc('#a3201f')); pd.point((61, 30), fill=hexc('#ffd23a')); pd.point((67, 30), fill=hexc('#ffd23a'))
pd.polygon([(60, 96), (64, 120), (68, 96)], fill=hexc('#a3201f'))
pi.save(f'{BP}/pack_icon.png'); pi.save(f'{RP}/pack_icon.png')
print('ok')
