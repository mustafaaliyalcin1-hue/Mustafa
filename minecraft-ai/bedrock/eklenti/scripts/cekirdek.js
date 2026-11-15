// Bedrock yardımcısının oyundan bağımsız çekirdeği: sanal envanter, tarifler, düşen eşyalar, kazma süreleri.
// Node'da test edilebilsin diye @minecraft/server kullanmaz.

export const AGACLAR = ['oak', 'spruce', 'birch', 'jungle', 'acacia', 'dark_oak', 'mangrove', 'cherry', 'pale_oak', 'crimson', 'warped']
export const KUTUK = AGACLAR.map((a) => (a === 'crimson' || a === 'warped' ? `${a}_stem` : `${a}_log`))
export const KALAS = AGACLAR.map((a) => `${a}_planks`)

// Kategoriler: tarifte "kalas" yazınca herhangi bir kalas olur.
export const KATEGORI = {
  kalas: KALAS,
  kutuk: KUTUK,
  tas: ['cobblestone', 'cobbled_deepslate', 'blackstone'],
  komur: ['coal', 'charcoal'],
  iskele: ['cobblestone', 'cobbled_deepslate', 'dirt', 'netherrack', 'blackstone']
}

export const ALET_SEVIYE = { yok: 0, wooden: 1, golden: 1, stone: 2, iron: 3, diamond: 4, netherite: 5 }

export function kazmaSeviyesi(env) {
  let s = 0
  for (const [ad, n] of Object.entries(ALET_SEVIYE)) if (n > s && (env[`${ad}_pickaxe`] || 0) > 0) s = n
  return s
}

export function silahHasari(env) {
  for (const [ad, h] of [['netherite_sword', 8], ['diamond_sword', 7], ['iron_sword', 6], ['stone_sword', 5], ['wooden_sword', 4], ['diamond_axe', 6], ['iron_axe', 5], ['stone_axe', 4]]) if (env[ad]) return h
  return 2
}

// blok → { sertlik (saniye, uygun aletle taban), gerek (kazma seviyesi), alet ('kazma'|'balta'|'kurek'|null), dus (düşen) }
export function blokBilgi(id) {
  const ad = id.replace(/^minecraft:/, '')
  const r = (sertlik, gerek, alet, dus) => ({ sertlik, gerek, alet, dus: dus === undefined ? ad : dus })
  if (/_(log|stem|wood|hyphae)$/.test(ad)) return r(2, 0, 'balta')
  if (/_planks$|crafting_table|chest|barrel|bookshelf|fence|_door$|trapdoor|ladder/.test(ad)) return r(2, 0, 'balta')
  if (/leaves$/.test(ad)) return r(0.2, 0, null, ad.startsWith('oak') && Math.random() < 0.05 ? 'apple' : null)
  if (/^(short_grass|tall_grass|grass|fern|large_fern|dead_bush|seagrass)$/.test(ad)) return r(0.05, 0, null, Math.random() < 0.125 ? 'wheat_seeds' : null)
  if (/flower|tulip|poppy|dandelion|torch|sapling|mushroom|vine|snow_layer$/.test(ad)) return r(0.05, 0, null)
  if (ad === 'grass_block' || ad === 'grass_path' || ad === 'dirt_path' || ad === 'mycelium' || ad === 'podzol') return r(0.6, 0, 'kurek', 'dirt')
  if (/^(dirt|coarse_dirt|rooted_dirt|farmland|mud|clay)$/.test(ad)) return r(0.5, 0, 'kurek', ad === 'clay' ? 'clay_ball' : ad === 'farmland' ? 'dirt' : ad)
  if (/^(sand|red_sand|soul_sand|soul_soil|snow)$/.test(ad)) return r(0.5, 0, 'kurek')
  if (ad === 'gravel') return r(0.6, 0, 'kurek', Math.random() < 0.1 ? 'flint' : 'gravel')
  if (ad === 'stone') return r(1.5, 1, 'kazma', 'cobblestone')
  if (ad === 'deepslate') return r(3, 1, 'kazma', 'cobbled_deepslate')
  if (/^(cobblestone|cobbled_deepslate|andesite|diorite|granite|tuff|calcite|stone_bricks|mossy_cobblestone|blackstone|basalt|polished_basalt|smooth_basalt|sandstone|red_sandstone)$/.test(ad)) return r(1.5, 1, 'kazma')
  if (ad === 'netherrack') return r(0.4, 1, 'kazma')
  if (/^(deepslate_)?coal_ore$/.test(ad)) return r(3, 1, 'kazma', 'coal')
  if (/^(deepslate_)?(iron|copper)_ore$/.test(ad)) return r(3, 2, 'kazma', ad.includes('iron') ? 'raw_iron' : 'raw_copper')
  if (/^(deepslate_)?lapis_ore$/.test(ad)) return r(3, 2, 'kazma', 'lapis_lazuli')
  if (/^(deepslate_)?gold_ore$/.test(ad)) return r(3, 3, 'kazma', 'raw_gold')
  if (/^(deepslate_)?(lit_)?redstone_ore$/.test(ad)) return r(3, 3, 'kazma', 'redstone')
  if (/^(deepslate_)?diamond_ore$/.test(ad)) return r(3, 3, 'kazma', 'diamond')
  if (/^(deepslate_)?emerald_ore$/.test(ad)) return r(3, 3, 'kazma', 'emerald')
  if (ad === 'nether_gold_ore') return r(3, 1, 'kazma', 'gold_nugget')
  if (ad === 'quartz_ore' || ad === 'nether_quartz_ore') return r(3, 1, 'kazma', 'quartz')
  if (ad === 'obsidian' || ad === 'crying_obsidian') return r(50, 4, 'kazma')
  if (ad === 'ancient_debris') return r(30, 4, 'kazma')
  if (ad === 'furnace' || ad === 'lit_furnace' || ad === 'smithing_table') return r(3.5, 1, 'kazma', ad === 'lit_furnace' ? 'furnace' : ad)
  if (/^(bedrock|barrier|portal|end_portal|end_portal_frame|command_block|structure_block|reinforced_deepslate)$/.test(ad)) return r(Infinity, 99, null, null)
  if (/glass/.test(ad)) return r(0.3, 0, null, null)
  return r(1.5, 0, 'kazma')
}

/** Kaç tick sürer (20 tick = 1 sn). Gerçek oyuna yakın: uygun alet hızlandırır. */
export function kazmaSuresi(id, env) {
  const b = blokBilgi(id)
  if (!isFinite(b.sertlik)) return Infinity
  const seviye = kazmaSeviyesi(env)
  if (b.gerek > seviye) return Infinity
  let carpan = 1
  if (b.alet === 'kazma') carpan = [1, 2, 4, 6, 8, 9][seviye] || 1
  else if (b.alet === 'balta') carpan = env.diamond_axe || env.netherite_axe ? 8 : env.iron_axe ? 6 : env.stone_axe ? 4 : env.wooden_axe ? 2 : 1
  else if (b.alet === 'kurek') carpan = 3
  // Bedrock'ta obsidyen elmas kazmayla ~9.4 sn
  const sn = (b.sertlik * 1.5) / carpan
  return Math.max(2, Math.round(sn * 20))
}

// ---------- sanal envanter ----------
export function ekle(env, ad, n = 1) {
  ad = ad.replace(/^minecraft:/, '')
  env[ad] = (env[ad] || 0) + n
  return env
}

export function say(env, adOrKategori) {
  const liste = KATEGORI[adOrKategori] || [adOrKategori]
  return liste.reduce((s, a) => s + (env[a] || 0), 0)
}

/** Kategori ya da tekil ad için n tane harcar. Başarısızsa hiçbir şeye dokunmaz. */
export function harca(env, adOrKategori, n = 1) {
  if (say(env, adOrKategori) < n) return false
  const liste = KATEGORI[adOrKategori] || [adOrKategori]
  let kalan = n
  for (const a of liste) {
    const al = Math.min(env[a] || 0, kalan)
    if (!al) continue
    env[a] -= al
    if (!env[a]) delete env[a]
    kalan -= al
    if (!kalan) break
  }
  return true
}

// ---------- tarifler ----------
// masa: çalışma masası gerekir mi. Değerler kategori ya da eşya adı.
export const TARIFLER = {
  stick: { girdi: { kalas: 2 }, cikti: 4, masa: false },
  crafting_table: { girdi: { kalas: 4 }, cikti: 1, masa: false },
  wooden_pickaxe: { girdi: { kalas: 3, stick: 2 }, cikti: 1, masa: true },
  wooden_axe: { girdi: { kalas: 3, stick: 2 }, cikti: 1, masa: true },
  wooden_hoe: { girdi: { kalas: 2, stick: 2 }, cikti: 1, masa: true },
  wooden_sword: { girdi: { kalas: 2, stick: 1 }, cikti: 1, masa: true },
  stone_pickaxe: { girdi: { tas: 3, stick: 2 }, cikti: 1, masa: true },
  stone_axe: { girdi: { tas: 3, stick: 2 }, cikti: 1, masa: true },
  stone_sword: { girdi: { tas: 2, stick: 1 }, cikti: 1, masa: true },
  stone_hoe: { girdi: { tas: 2, stick: 2 }, cikti: 1, masa: true },
  furnace: { girdi: { tas: 8 }, cikti: 1, masa: true },
  torch: { girdi: { komur: 1, stick: 1 }, cikti: 4, masa: false },
  chest: { girdi: { kalas: 8 }, cikti: 1, masa: true },
  iron_pickaxe: { girdi: { iron_ingot: 3, stick: 2 }, cikti: 1, masa: true },
  iron_sword: { girdi: { iron_ingot: 2, stick: 1 }, cikti: 1, masa: true },
  iron_axe: { girdi: { iron_ingot: 3, stick: 2 }, cikti: 1, masa: true },
  bucket: { girdi: { iron_ingot: 3 }, cikti: 1, masa: true },
  shield: { girdi: { kalas: 6, iron_ingot: 1 }, cikti: 1, masa: true },
  flint_and_steel: { girdi: { iron_ingot: 1, flint: 1 }, cikti: 1, masa: false },
  diamond_pickaxe: { girdi: { diamond: 3, stick: 2 }, cikti: 1, masa: true },
  diamond_sword: { girdi: { diamond: 2, stick: 1 }, cikti: 1, masa: true },
  smithing_table: { girdi: { iron_ingot: 2, kalas: 4 }, cikti: 1, masa: true },
  gold_ingot: { girdi: { gold_nugget: 9 }, cikti: 1, masa: true },
  netherite_ingot: { girdi: { netherite_scrap: 4, gold_ingot: 4 }, cikti: 1, masa: true },
  glass_pane: { girdi: { glass: 6 }, cikti: 16, masa: true },
  ladder: { girdi: { stick: 7 }, cikti: 3, masa: true },
  oak_fence: { girdi: { kalas: 4, stick: 2 }, cikti: 3, masa: true },
  oak_slab: { girdi: { kalas: 3 }, cikti: 6, masa: true },
  oak_stairs: { girdi: { kalas: 6 }, cikti: 4, masa: true },
  stone_bricks: { girdi: { stone: 4 }, cikti: 4, masa: false },
  cobblestone_stairs: { girdi: { tas: 6 }, cikti: 4, masa: true },
  cobblestone_slab: { girdi: { tas: 3 }, cikti: 6, masa: true },
  cobblestone_wall: { girdi: { tas: 6 }, cikti: 6, masa: true }
}

// Kalasın türü: oak_log → oak_planks
export function kalasAdi(kutuk) { return kutuk.replace(/_(log|stem)$/, '_planks') }

// fırın: girdi → çıktı
export const ERIT = {
  raw_iron: 'iron_ingot', raw_gold: 'gold_ingot', raw_copper: 'copper_ingot', sand: 'glass', red_sand: 'glass',
  cobblestone: 'stone', ancient_debris: 'netherite_scrap', clay_ball: 'brick', cobbled_deepslate: 'deepslate',
  ...Object.fromEntries(KUTUK.map((k) => [k, 'charcoal']))
}
export const ERIT_TERS = Object.fromEntries(Object.entries(ERIT).filter(([g]) => !KUTUK.includes(g)).map(([g, c]) => [c, g]))

export const YAKIT = { coal_block: 80, coal: 8, charcoal: 8, ...Object.fromEntries(KALAS.map((k) => [k, 1.5])), ...Object.fromEntries(KUTUK.map((k) => [k, 1.5])), stick: 0.5 }

export function yakitGucu(env) {
  return Object.entries(YAKIT).reduce((s, [a, g]) => s + (env[a] || 0) * g, 0)
}

/** Bir yakıt eşyası harcar (önce kömür), kaç eşya eritebildiğini döner; yakıt yoksa 0. */
export function yakitAl(env) {
  for (const [a, g] of Object.entries(YAKIT)) if ((env[a] || 0) > 0) { harca(env, a, 1); return g }
  return 0
}

/** n eşya eritecek kadar yakıt harcar (önce kömür). */
export function yakitHarca(env, n) {
  let kalan = n
  for (const [a, g] of Object.entries(YAKIT)) {
    while (kalan > 0 && (env[a] || 0) > 0) { harca(env, a, 1); kalan -= g }
  }
  return kalan <= 0
}

/** Tarifi uygular. Döner: true/false. (Masa kontrolü dışarıda.) */
export function uret(env, ad, kez = 1) {
  const t = TARIFLER[ad]
  if (!t) return false
  for (let i = 0; i < kez; i++) {
    for (const [g, n] of Object.entries(t.girdi)) if (say(env, g) < n) return i > 0
    for (const [g, n] of Object.entries(t.girdi)) harca(env, g, n)
    ekle(env, ad, t.cikti)
  }
  return true
}

/** Bir eşyayı yapmak için eksikleri listeler (bir seviye). */
export function eksikler(env, ad, kez = 1) {
  const t = TARIFLER[ad]
  if (!t) return null
  const e = {}
  for (const [g, n] of Object.entries(t.girdi)) { const fark = n * kez - say(env, g); if (fark > 0) e[g] = fark }
  return e
}

// ---------- yapı malzemesini sanal envanterden karşılama ----------
// Bir blok için harcanacak eşya: kendisi varsa o; yoksa sınıfının temel malzemesi.
export function blokMaliyeti(ad) {
  if (/_planks$/.test(ad)) return { kalas: 1 }
  if (/_(log|stem)$/.test(ad)) return { kutuk: 1 }
  if (/_stairs$/.test(ad)) return /cobble|stone|brick|deepslate|blackstone/.test(ad) ? { tas: 1 } : { kalas: 1 }
  if (/_slab$/.test(ad)) return /cobble|stone|brick|deepslate|blackstone/.test(ad) ? { tas: 1 } : { kalas: 1 }
  if (/_fence$|_fence_gate$|_trapdoor$|_door$/.test(ad)) return { kalas: 1 }
  if (/^(cobblestone|stone_bricks|stone|cobblestone_wall|stone_brick_wall|cobbled_deepslate|smooth_stone)$/.test(ad)) return { tas: 1 }
  if (/^glass(_pane)?$/.test(ad)) return { glass: ad === 'glass' ? 1 : 0.375 }
  if (ad === 'torch') return { torch: 1 }
  if (ad === 'dirt') return { dirt: 1 }
  if (ad === 'crafting_table') return { kalas: 4 }
  if (ad === 'chest') return { kalas: 8 }
  if (ad === 'furnace') return { tas: 8 }
  if (/_wool$|_carpet$/.test(ad)) return null
  return { [ad]: 1 }
}

export function yapiMalzemesi(bloklar) {
  const m = {}
  for (const b of bloklar) {
    if (b.opsiyonel) continue
    const mal = blokMaliyeti(b.ad)
    if (!mal) continue
    for (const [k, v] of Object.entries(mal)) m[k] = (m[k] || 0) + v
  }
  for (const k of Object.keys(m)) m[k] = Math.ceil(m[k])
  return m
}

export function durumOzeti(env) {
  return Object.entries(env).sort((a, b) => b[1] - a[1]).map(([a, n]) => `${n} ${a}`).join(', ') || 'boş'
}

// Yaygın düşmanlar
export const DUSMANLAR = ['zombie', 'husk', 'drowned', 'skeleton', 'stray', 'spider', 'cave_spider', 'creeper', 'witch', 'slime', 'magma_cube', 'zombie_pigman', 'piglin_brute', 'hoglin', 'zoglin', 'blaze', 'wither_skeleton', 'ghast', 'silverfish', 'phantom', 'pillager', 'vindicator', 'bogged', 'breeze']
