// Şematikleri "gerçekçi hayatta kalma" moduna uyarlar: bot her şeyi kendi toplayıp üretebilsin diye
// ağaç türünü bölgedeki ağaca çevirir, zor bulunan taşları kırık taşa çevirir, süs eşyalarını isteğe bağlı yapar.

export const AGACLAR = ['dark_oak', 'pale_oak', 'oak', 'spruce', 'birch', 'jungle', 'acacia', 'mangrove', 'cherry']
const AGAC_RE = new RegExp(`^(stripped_)?(${AGACLAR.join('|')})_`)

export function agacTuru(ad) {
  const m = AGAC_RE.exec(ad)
  return m ? m[2] : null
}

// Sadece eldeyse (ya da yakındaki sandıkta varsa) konur; yoksa atlanır.
const SUS = /^(anvil|chipped_anvil|damaged_anvil|enchanting_table|brewing_stand|cauldron|bookshelf|loom|grindstone|blast_furnace|smoker|hopper|barrel|chain|lantern|soul_lantern|glowstone|sea_lantern|bell|jukebox|note_block|flower_pot|.*_bed|.*_banner|.*_wall_banner|.*_carpet|.*_head|.*_skull|lilac|rose_bush|peony|sunflower|dandelion|poppy|.*_tulip|allium|azure_bluet|blue_orchid|oxeye_daisy|cornflower|lily_of_the_valley|short_grass|tall_grass|grass|fern|large_fern|dead_bush|vine|.*_coral.*|.*_stained_glass.*|cobweb|spawner|.*_ore|bedrock|barrier|.*command_block.*|structure_.*|end_.*|purpur_.*|prismarine.*|quartz.*|.*terracotta|.*_concrete.*|.*_wool|sponge|slime_block|honey_block|beacon|conduit|lodestone|respawn_anchor|crying_obsidian|amethyst.*|.*copper.*|.*sculk.*)$/

const DOGAL_ZEMIN = /^(grass_block|dirt|coarse_dirt|podzol|rooted_dirt|mycelium|moss_block|sand|red_sand|gravel|snow|snow_block|water|lava)$/

const TAS_CEVIR = {
  polished_diorite: 'cobblestone', polished_andesite: 'cobblestone', polished_granite: 'cobblestone',
  diorite: 'cobblestone', andesite: 'cobblestone', granite: 'cobblestone', stone: 'cobblestone',
  mossy_cobblestone: 'cobblestone', mossy_stone_bricks: 'stone_bricks', cracked_stone_bricks: 'stone_bricks',
  chiseled_stone_bricks: 'stone_bricks', deepslate: 'cobbled_deepslate', smooth_stone: 'stone_bricks',
  polished_diorite_stairs: 'cobblestone_stairs', polished_andesite_stairs: 'cobblestone_stairs', polished_granite_stairs: 'cobblestone_stairs',
  polished_diorite_slab: 'cobblestone_slab', polished_andesite_slab: 'cobblestone_slab', polished_granite_slab: 'cobblestone_slab',
  mossy_cobblestone_wall: 'cobblestone_wall', mossy_stone_brick_wall: 'stone_brick_wall',
  white_stained_glass: 'glass', white_stained_glass_pane: 'glass_pane',
  glowstone: 'torch', sea_lantern: 'torch', lantern: 'torch', soul_lantern: 'torch'
}

// Bloğun yerine konabilecek "eşya" adı (Java). Duvar meşalesi -> meşale vb.
export function esyaAdi(blokAdi) {
  if (blokAdi === 'wall_torch') return 'torch'
  if (blokAdi === 'redstone_wire') return 'redstone'
  if (blokAdi === 'farmland') return 'dirt'
  if (blokAdi === 'wheat') return 'wheat_seeds'
  if (blokAdi.endsWith('_wall_sign')) return blokAdi.replace('_wall_sign', '_sign')
  if (blokAdi.endsWith('_wall_banner')) return blokAdi.replace('_wall_banner', '_banner')
  if (blokAdi.endsWith('_wall_head')) return blokAdi.replace('_wall_head', '_head')
  return blokAdi
}

/**
 * @param {{x,y,z,ad,durum?}[]} bloklar
 * @param {{agac?: string, gercekci?: boolean, zeminiAtla?: boolean}} secenek
 * @returns {{bloklar: {x,y,z,ad,opsiyonel?:boolean}[], notlar: string[]}}
 */
export function uyarla(bloklar, secenek = {}) {
  const { agac = 'oak', gercekci = true, zeminiAtla = true } = secenek
  const notlar = new Set()
  const cikti = []
  for (const b0 of bloklar) {
    let ad = b0.ad
    if (ad === 'air' || ad === 'cave_air' || ad === 'void_air') continue
    // kapı/yatak üst yarısı: botu alt yarıyı koyunca oyun kendi ekler
    if (b0.durum && (b0.durum.half === 'upper' || b0.durum.part === 'head')) continue
    if (zeminiAtla && b0.y === 0 && DOGAL_ZEMIN.test(ad)) continue
    if (/leaves$/.test(ad)) { notlar.add('yapraklar atlandı (makas gerekir)'); continue }
    if (gercekci) {
      if (TAS_CEVIR[ad]) { notlar.add(`${ad} → ${TAS_CEVIR[ad]}`); ad = TAS_CEVIR[ad] }
      const tur = agacTuru(ad)
      if (tur) {
        // soyulmuş odun/kütük → aynı türün kalası/kütüğü
        if (/^stripped_.*_wood$/.test(ad)) ad = `${tur}_planks`
        else if (/^stripped_/.test(ad)) ad = ad.replace(/^stripped_/, '')
        if (/_wood$/.test(ad)) ad = ad.replace(/_wood$/, '_log')
        if (tur !== agac) ad = ad.replace(new RegExp(`^${tur}_`), `${agac}_`)
      }
      if (/^(grass_block|coarse_dirt|podzol|rooted_dirt|mycelium)$/.test(ad)) ad = 'dirt'
    }
    cikti.push({ x: b0.x, y: b0.y, z: b0.z, ad, ...(b0.durum ? { durum: b0.durum } : {}), ...(SUS.test(ad) ? { opsiyonel: true } : {}) })
  }
  if (cikti.some((b) => b.opsiyonel)) notlar.add('süs eşyaları (örs, büyü masası, çiçek, halı...) sadece elde varsa konacak')
  return { bloklar: cikti, notlar: [...notlar] }
}
