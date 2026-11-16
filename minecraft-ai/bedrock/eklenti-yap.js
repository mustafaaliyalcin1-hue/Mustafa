// Bedrock eklentisini üretir: bedrock/eklenti/ (betikler) + şemalar + paket dosyaları → yapay-zeka-yardimci.mcaddon
// Çalıştırma: npm run eklenti
import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'
import { fileURLToPath } from 'node:url'
import AdmZip from 'adm-zip'
import { semalariListele, semaYukle } from '../ortak/semalar.js'
import { uyarla } from '../ortak/uyarla.js'
import { insaSirasi } from '../ortak/tasarimlar.js'

const BURA = path.dirname(fileURLToPath(import.meta.url))
const CIKTI = path.join(BURA, 'paket')
const BP = path.join(CIKTI, 'YardimciBP'), RP = path.join(CIKTI, 'YardimciRP')
const U = {
  bp: '2d4801a5-cba8-4461-889b-c0495c448827', bpData: '2446d6a5-002e-4956-bef3-b561c3bd9f9d', bpScript: 'd8dbaa88-c5f8-4742-866e-a85963dc0bef',
  rp: '34890dff-8850-4b07-a95c-019c00c4bd72', rpRes: '14d0bf38-5d06-4301-ba4c-161a12db89d6'
}
const SURUM = [1, 0, 2]
const MOTOR = [1, 21, 50]

function yaz(dosya, icerik) {
  fs.mkdirSync(path.dirname(dosya), { recursive: true })
  fs.writeFileSync(dosya, typeof icerik === 'string' || Buffer.isBuffer(icerik) ? icerik : JSON.stringify(icerik, null, 1))
}

// ---------- küçük PNG yazıcı ----------
const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0 } return t })()
function crc32(buf) { let c = 0xffffffff; for (const b of buf) c = CRC[(c ^ b) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0 }
function parca(tur, veri) {
  const uz = Buffer.alloc(4); uz.writeUInt32BE(veri.length)
  const tv = Buffer.concat([Buffer.from(tur), veri])
  const c = Buffer.alloc(4); c.writeUInt32BE(crc32(tv))
  return Buffer.concat([uz, tv, c])
}
function png(g, y, piksel) { // piksel(x,y) -> [r,g,b,a]
  const ham = Buffer.alloc((g * 4 + 1) * y)
  for (let j = 0; j < y; j++) { ham[j * (g * 4 + 1)] = 0; for (let i = 0; i < g; i++) { const [r, gg, b, a] = piksel(i, j); ham.set([r, gg, b, a], j * (g * 4 + 1) + 1 + i * 4) } }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(g, 0); ihdr.writeUInt32BE(y, 4); ihdr[8] = 8; ihdr[9] = 6
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), parca('IHDR', ihdr), parca('IDAT', zlib.deflateSync(ham)), parca('IEND', Buffer.alloc(0))])
}
const hex = (h, a = 255) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16), a]

// Yardımcının görünüşü: 64x64 insansı deri (özgün tasarım): turkuaz kapüşonlu, parlayan camgöbeği gözler
function deri() {
  const ten = hex('#c99a6e'), tenK = hex('#b4865c'), sac = hex('#2b1d14'), goz = hex('#5ff6ff'), gozK = hex('#1b8fa0')
  const ust = hex('#1f8a8a'), ustK = hex('#16696a'), serit = hex('#f2c14e'), pant = hex('#2d3b6b'), pantK = hex('#222d52'), ayak = hex('#3a3a3a')
  const bolge = (x, y, x0, y0, w, h) => x >= x0 && x < x0 + w && y >= y0 && y < y0 + h
  return png(64, 64, (x, y) => {
    const kenar = (x + y) % 7 === 0
    // kafa (0..32, 0..16): üst 8..16,0..8 saç; yüz 8..16,8..16
    if (bolge(x, y, 0, 0, 32, 16)) {
      if (bolge(x, y, 8, 0, 8, 8)) return sac // tepe
      if (bolge(x, y, 16, 0, 8, 8)) return tenK // çene altı
      if (bolge(x, y, 8, 8, 8, 8)) { // yüz
        const fx = x - 8, fy = y - 8
        if (fy <= 1) return sac
        if (fy === 3 && (fx === 1 || fx === 2 || fx === 5 || fx === 6)) return fx === 1 || fx === 6 ? gozK : goz
        if (fy === 6 && fx >= 3 && fx <= 4) return tenK
        return ten
      }
      if (y < 11) return sac // yanlar/arka saç
      return bolge(x, y, 24, 8, 8, 8) ? sac : ten
    }
    if (bolge(x, y, 32, 0, 32, 16)) return [0, 0, 0, 0] // şapka katmanı boş
    // gövde (16..40, 16..32)
    if (bolge(x, y, 16, 16, 24, 16)) {
      if (bolge(x, y, 20, 20, 8, 12) && (x === 23 || x === 24)) return serit // fermuar
      if (bolge(x, y, 20, 20, 8, 12) && y >= 29) return ustK
      return kenar ? ustK : ust
    }
    // kollar (40..56,16..32) ve sol kol (32..48,48..64)
    if (bolge(x, y, 40, 16, 16, 16) || bolge(x, y, 32, 48, 16, 16)) {
      const yy = (y - 16) % 16
      if (yy >= 13) return ten // el
      if (yy >= 11) return serit // bileklik
      return kenar ? ustK : ust
    }
    // bacaklar (0..16,16..32) ve sol bacak (16..32,48..64)
    if (bolge(x, y, 0, 16, 16, 16) || bolge(x, y, 16, 48, 16, 16)) {
      const yy = (y - 16) % 16
      if (yy >= 13) return ayak
      return kenar ? pantK : pant
    }
    return [0, 0, 0, 0]
  })
}

function kumandaSimge() {
  return png(16, 16, (x, y) => {
    const dx = x - 7.5, dy = y - 7.5, r = Math.hypot(dx, dy)
    if (r < 2.2) return hex('#5ff6ff')
    if (r < 3.2) return hex('#1b8fa0')
    if (r < 6.6 && r > 5.4) return hex('#f2c14e')
    if (r <= 5.4) return hex('#1f2a33')
    return [0, 0, 0, 0]
  })
}
function paketSimge() {
  return png(64, 64, (x, y) => {
    const dx = x - 31.5, dy = y - 31.5, r = Math.hypot(dx, dy)
    if (r < 9) return hex('#5ff6ff')
    if (r < 13) return hex('#1b8fa0')
    if (r < 26 && r > 21) return hex('#f2c14e')
    if (r <= 21) return hex('#1f2a33')
    return hex('#16696a')
  })
}

// ---------- Java → Bedrock blok adları ----------
const BEDROCK_AD = {
  oak_door: 'wooden_door', oak_trapdoor: 'trapdoor', oak_pressure_plate: 'wooden_pressure_plate', oak_button: 'wooden_button',
  cobblestone_stairs: 'stone_stairs', stone_stairs: 'normal_stone_stairs', dirt_path: 'grass_path', snow: 'snow_layer', snow_block: 'snow',
  oak_sign: 'standing_sign', wall_torch: 'torch', short_grass: 'short_grass', terracotta: 'hardened_clay', magma_block: 'magma',
  nether_bricks: 'nether_brick', red_nether_bricks: 'red_nether_brick', end_stone_bricks: 'end_bricks', note_block: 'noteblock',
  slime_block: 'slime', powered_rail: 'golden_rail', spawner: 'mob_spawner', sugar_cane: 'reeds', lily_pad: 'waterlily', cobweb: 'web'
}
const YEDEK = { stone_bricks: 'stonebrick', stone_brick_wall: 'cobblestone_wall', oak_slab: 'oak_planks', spruce_slab: 'spruce_planks', dark_oak_slab: 'dark_oak_planks', birch_slab: 'birch_planks', cobblestone_slab: 'cobblestone', oak_fence: 'fence', spruce_fence: 'fence', cobblestone_wall: 'cobblestone' }
const YON = { east: 0, west: 1, south: 2, north: 3 }

function bedrockBlok(b) {
  let id = BEDROCK_AD[b.ad] || b.ad
  let durum = ''
  const d = b.durum || {}
  if (/_stairs$/.test(b.ad) && d.facing) durum = `["weirdo_direction"=${YON[d.facing] ?? 0},"upside_down_bit"=${d.half === 'top'}]`
  else if (/_slab$/.test(b.ad) && d.type) {
    if (d.type === 'double') { id = YEDEK[b.ad] || id; durum = '' } else durum = `["minecraft:vertical_half"="${d.type === 'top' ? 'top' : 'bottom'}"]`
  } else if (/_log$|_wood$|_stem$/.test(b.ad) && d.axis) durum = `["pillar_axis"="${d.axis}"]`
  return { id, durum, yedek: YEDEK[b.ad] }
}

async function semalariHazirla() {
  const cikti = {}
  for (const s of semalariListele()) {
    const sema = await semaYukle(s.ad)
    const { bloklar } = uyarla(sema.bloklar, { agac: 'oak' })
    const sira = insaSirasi(bloklar)
    const palet = [], indeks = new Map(), dizi = []
    for (const b of sira) {
      const br = bedrockBlok(b)
      const anahtar = JSON.stringify([b.ad, br.id, br.durum, br.yedek || '', b.opsiyonel ? 1 : 0])
      if (!indeks.has(anahtar)) { indeks.set(anahtar, palet.length); palet.push([b.ad, br.id, br.durum, br.yedek || '', b.opsiyonel ? 1 : 0]) }
      dizi.push(b.x, b.y, b.z, indeks.get(anahtar))
    }
    cikti[s.ad] = { ad: s.ad, aciklama: s.aciklama, palet, b: dizi }
    console.log(`  şema ${s.ad}: ${sira.length} blok, ${palet.length} çeşit`)
  }
  return `// Otomatik üretildi (eklenti-yap.js). Elle düzenleme.\nconst HAM = ${JSON.stringify(cikti)}\n` +
    `export const SEMALAR = {}\nfor (const [ad, s] of Object.entries(HAM)) {\n  const bloklar = []\n  for (let i = 0; i < s.b.length; i += 4) {\n    const p = s.palet[s.b[i + 3]]\n    bloklar.push({ x: s.b[i], y: s.b[i + 1], z: s.b[i + 2], ad: p[0], bedrock: p[1], durum: p[2], yedek: p[3] || undefined, opsiyonel: !!p[4] })\n  }\n  SEMALAR[ad] = { ad, aciklama: s.aciklama, bloklar }\n}\n`
}

// ---------- paket dosyaları ----------
function bpDosyalari() {
  yaz(`${BP}/manifest.json`, {
    format_version: 2,
    header: { name: 'Yapay Zeka Yardımcı', description: 'Dünyana katılan yapay zeka arkadaş: x-ray madencilik, elmas, Nether, netherite, inşaat. Kumandayı kullan.', uuid: U.bp, version: SURUM, min_engine_version: MOTOR },
    modules: [{ type: 'data', uuid: U.bpData, version: SURUM }, { type: 'script', language: 'javascript', uuid: U.bpScript, entry: 'scripts/main.js', version: SURUM }],
    dependencies: [{ uuid: U.rp, version: SURUM }, { module_name: '@minecraft/server', version: '1.16.0' }, { module_name: '@minecraft/server-ui', version: '1.3.0' }]
  })
  yaz(`${BP}/entities/arkadas.json`, {
    format_version: '1.21.50',
    'minecraft:entity': {
      description: {
        identifier: 'yardimci:arkadas', is_spawnable: true, is_summonable: true, is_experimental: false,
        properties: { 'yardimci:yuruyor': { type: 'bool', default: false, client_sync: true }, 'yardimci:kaziyor': { type: 'bool', default: false, client_sync: true } }
      },
      components: {
        'minecraft:type_family': { family: ['yardimci', 'npc', 'mob'] },
        'minecraft:health': { value: 40, max: 40 },
        'minecraft:physics': {},
        'minecraft:pushable': { is_pushable: false, is_pushable_by_piston: true },
        'minecraft:collision_box': { width: 0.6, height: 1.8 },
        'minecraft:movement': { value: 0.0 },
        'minecraft:nameable': { always_show: true, allow_name_tag_renaming: true },
        'minecraft:persistent': {},
        'minecraft:tick_world': { radius: 2, never_despawn: true },
        'minecraft:breathable': { total_supply: 15, suffocate_time: 0, breathes_water: true },
        'minecraft:fire_immune': {},
        'minecraft:knockback_resistance': { value: 0.6 },
        'minecraft:damage_sensor': { triggers: [
          { cause: 'fall', deals_damage: false }, { cause: 'suffocation', deals_damage: false }, { cause: 'lava', deals_damage: false },
          { cause: 'fire', deals_damage: false }, { cause: 'fire_tick', deals_damage: false }, { cause: 'drowning', deals_damage: false },
          { on_damage: { filters: { test: 'is_family', subject: 'other', value: 'player' } }, deals_damage: false }
        ] },
        'minecraft:behavior.look_at_player': { priority: 8, look_distance: 8, probability: 0.02 }
      }
    }
  })
  yaz(`${BP}/items/kumanda.json`, {
    format_version: '1.21.50',
    'minecraft:item': {
      description: { identifier: 'yardimci:kumanda', menu_category: { category: 'equipment' } },
      components: { 'minecraft:icon': { textures: { default: 'yardimci_kumanda' } }, 'minecraft:display_name': { value: 'Yardımcı Kumandası (kullan: menü)' }, 'minecraft:max_stack_size': 1, 'minecraft:hand_equipped': true }
    }
  })
  yaz(`${BP}/recipes/kumanda.json`, {
    format_version: '1.20.10',
    'minecraft:recipe_shapeless': { description: { identifier: 'yardimci:kumanda' }, tags: ['crafting_table'], ingredients: [{ item: 'minecraft:stick' }, { item: 'minecraft:redstone' }], result: { item: 'yardimci:kumanda' } }
  })
  yaz(`${BP}/pack_icon.png`, paketSimge())
  fs.mkdirSync(`${BP}/scripts`, { recursive: true })
  for (const f of fs.readdirSync(path.join(BURA, 'eklenti', 'scripts'))) fs.copyFileSync(path.join(BURA, 'eklenti', 'scripts', f), `${BP}/scripts/${f}`)
}

function rpDosyalari() {
  yaz(`${RP}/manifest.json`, {
    format_version: 2,
    header: { name: 'Yapay Zeka Yardımcı', description: 'Yardımcının görünüşü ve kumanda simgesi.', uuid: U.rp, version: SURUM, min_engine_version: MOTOR },
    modules: [{ type: 'resources', uuid: U.rpRes, version: SURUM }],
    dependencies: [{ uuid: U.bp, version: SURUM }]
  })
  yaz(`${RP}/entity/arkadas.entity.json`, {
    format_version: '1.10.0',
    'minecraft:client_entity': {
      description: {
        identifier: 'yardimci:arkadas',
        materials: { default: 'entity_alphatest' },
        textures: { default: 'textures/entity/yardimci' },
        geometry: { default: 'geometry.humanoid.custom' },
        animations: {
          bak: 'animation.humanoid.look_at_target.default',
          yuru: 'animation.yardimci.yuru',
          kaz: 'animation.yardimci.kaz',
          kontrol: 'controller.animation.yardimci.hareket'
        },
        scripts: { animate: ['bak', 'kontrol'] },
        render_controllers: ['controller.render.default'],
        spawn_egg: { base_color: '#1f8a8a', overlay_color: '#5ff6ff' }
      }
    }
  })
  yaz(`${RP}/animations/yardimci.animation.json`, {
    format_version: '1.8.0',
    animations: {
      'animation.yardimci.yuru': {
        loop: true,
        bones: {
          rightArm: { rotation: ['math.cos(q.life_time * 400) * 35', 0, 0] },
          leftArm: { rotation: ['-math.cos(q.life_time * 400) * 35', 0, 0] },
          rightLeg: { rotation: ['-math.cos(q.life_time * 400) * 40', 0, 0] },
          leftLeg: { rotation: ['math.cos(q.life_time * 400) * 40', 0, 0] }
        }
      },
      'animation.yardimci.kaz': {
        loop: true,
        bones: { rightArm: { rotation: ['-80 + math.sin(q.life_time * 900) * 45', 0, 0] } }
      }
    }
  })
  yaz(`${RP}/animation_controllers/yardimci.animation_controllers.json`, {
    format_version: '1.10.0',
    animation_controllers: {
      'controller.animation.yardimci.hareket': {
        initial_state: 'dur',
        states: {
          dur: { transitions: [{ kaz: "q.property('yardimci:kaziyor')" }, { yuru: "q.property('yardimci:yuruyor')" }] },
          yuru: { animations: ['yuru'], transitions: [{ kaz: "q.property('yardimci:kaziyor')" }, { dur: "!q.property('yardimci:yuruyor')" }] },
          kaz: { animations: ['kaz'], transitions: [{ dur: "!q.property('yardimci:kaziyor')" }] }
        }
      }
    }
  })
  yaz(`${RP}/textures/entity/yardimci.png`, deri())
  yaz(`${RP}/textures/items/yardimci_kumanda.png`, kumandaSimge())
  yaz(`${RP}/textures/item_texture.json`, { resource_pack_name: 'yardimci', texture_name: 'atlas.items', texture_data: { yardimci_kumanda: { textures: 'textures/items/yardimci_kumanda' } } })
  const dil = 'entity.yardimci:arkadas.name=Yardımcı\nitem.spawn_egg.entity.yardimci:arkadas.name=Yardımcı Çağırma Yumurtası\nitem.yardimci:kumanda=Yardımcı Kumandası\n'
  yaz(`${RP}/texts/tr_TR.lang`, dil)
  yaz(`${RP}/texts/en_US.lang`, dil)
  yaz(`${RP}/texts/languages.json`, ['tr_TR', 'en_US'])
  yaz(`${RP}/pack_icon.png`, paketSimge())
}

export async function eklentiYap() {
  fs.rmSync(CIKTI, { recursive: true, force: true })
  bpDosyalari()
  rpDosyalari()
  console.log('Şemalar Bedrock\'a çevriliyor...')
  yaz(`${BP}/scripts/semalar.js`, await semalariHazirla())
  const zip = new AdmZip()
  zip.addLocalFolder(BP, 'YardimciBP')
  zip.addLocalFolder(RP, 'YardimciRP')
  const dosya = path.join(BURA, '..', 'yapay-zeka-yardimci.mcaddon')
  zip.writeZip(dosya)
  console.log('Hazır:', dosya, Math.round(fs.statSync(dosya).size / 1024), 'KB')
  return dosya
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) eklentiYap()
