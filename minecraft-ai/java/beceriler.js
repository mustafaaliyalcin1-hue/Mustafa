// Java botunun becerileri: x-ray tarama, toplama, üretim, eritme, ilerleme aşamaları, Nether, inşa, tarla.
import pf from 'mineflayer-pathfinder'
import { Vec3 } from 'vec3'
import { semaYukle, semalariListele } from '../ortak/semalar.js'
import { uyarla, esyaAdi, AGACLAR } from '../ortak/uyarla.js'
import { insaSirasi, malzemeListesi } from '../ortak/tasarimlar.js'

const { goals } = pf
const bekle = (ms) => new Promise((r) => setTimeout(r, ms))

export class IptalHatasi extends Error { constructor() { super('iptal'); this.iptal = true } }

const KUTUKLER = AGACLAR.map((a) => `${a}_log`).concat(['crimson_stem', 'warped_stem'])
const DUSMAN = new Set(['zombie', 'husk', 'drowned', 'skeleton', 'stray', 'spider', 'cave_spider', 'creeper', 'witch', 'slime', 'magma_cube', 'zombified_piglin', 'piglin_brute', 'hoglin', 'zoglin', 'blaze', 'wither_skeleton', 'ghast', 'silverfish', 'phantom', 'pillager', 'vindicator', 'bogged', 'breeze'])
// X-ray kapalıyken görmeden bulunamayacak şeyler (bulması hile sayılanlar)
const GIZLI = /_ore$|ancient_debris|obsidian|^chest$|^trapped_chest$|^barrel$|spawner|gilded_blackstone|amethyst|budding/

export const dusmanMi = (e) => e && e !== null && (e.type === 'hostile' || DUSMAN.has(e.name))

// cevher → { bloklar, esya (düşen), y (en bol olduğu seviye), boyut }
export const CEVHERLER = {
  coal: { bloklar: ['coal_ore', 'deepslate_coal_ore'], esya: 'coal', y: 40 },
  iron: { bloklar: ['iron_ore', 'deepslate_iron_ore'], esya: 'raw_iron', y: 16 },
  gold: { bloklar: ['gold_ore', 'deepslate_gold_ore'], esya: 'raw_gold', y: -16 },
  copper: { bloklar: ['copper_ore', 'deepslate_copper_ore'], esya: 'raw_copper', y: 48 },
  redstone: { bloklar: ['redstone_ore', 'deepslate_redstone_ore'], esya: 'redstone', y: -58 },
  lapis: { bloklar: ['lapis_ore', 'deepslate_lapis_ore'], esya: 'lapis_lazuli', y: 0 },
  emerald: { bloklar: ['emerald_ore', 'deepslate_emerald_ore'], esya: 'emerald', y: 100 },
  diamond: { bloklar: ['diamond_ore', 'deepslate_diamond_ore'], esya: 'diamond', y: -58 },
  ancient_debris: { bloklar: ['ancient_debris'], esya: 'ancient_debris', y: 15, nether: true },
  quartz: { bloklar: ['nether_quartz_ore'], esya: 'quartz', y: 60, nether: true },
  nether_gold: { bloklar: ['nether_gold_ore'], esya: 'gold_nugget', y: 60, nether: true }
}

// Doğrudan kazılarak toplanan eşyalar
const TOPLANIR = {
  cobblestone: ['stone', 'cobblestone'],
  cobbled_deepslate: ['deepslate', 'cobbled_deepslate'],
  dirt: ['dirt', 'grass_block', 'coarse_dirt', 'rooted_dirt'],
  sand: ['sand'], red_sand: ['red_sand'], gravel: ['gravel'], clay_ball: ['clay'],
  netherrack: ['netherrack'], blackstone: ['blackstone'], obsidian: ['obsidian'], snowball: ['snow_block', 'snow'],
  ...Object.fromEntries(KUTUKLER.map((k) => [k, [k]])),
  ...Object.fromEntries(Object.values(CEVHERLER).map((c) => [c.esya, c.bloklar]))
}

// Fırında eritilerek elde edilenler
const ERIT = {
  iron_ingot: 'raw_iron', gold_ingot: 'raw_gold', copper_ingot: 'raw_copper', glass: 'sand', stone: 'cobblestone',
  smooth_stone: 'stone', netherite_scrap: 'ancient_debris', charcoal: 'oak_log', brick: 'clay_ball', deepslate: 'cobbled_deepslate'
}

const YAKITLAR = [['coal_block', 80], ['coal', 8], ['charcoal', 8], ...AGACLAR.map((a) => [`${a}_planks`, 1.5]), ...KUTUKLER.map((k) => [k, 1.5]), ['stick', 0.5]]

export class Beceriler {
  constructor(bot, { konus, xrayIzinli = () => true, komutIzni = async () => false }) {
    this.bot = bot
    this.konus = konus
    this.komutIzni = komutIzni // hileler açıksa (komut kullanabiliyorsa) true
    this.xrayIzinli = xrayIzinli // sunucuda / çok oyunculu dünyada false döner
    this.token = { iptal: false }
    this.portalNoktasi = null // overworld portalı
    this.netherPortali = null
  }

  get reg() { return this.bot.registry }

  // ---------- temel yardımcılar ----------
  k() { if (this.token.iptal) throw new IptalHatasi() }

  say(ad) {
    const adlar = Array.isArray(ad) ? ad : [ad]
    return this.bot.inventory.items().filter((i) => adlar.includes(i.name)).reduce((t, i) => t + i.count, 0)
  }

  esya(ad) {
    const adlar = Array.isArray(ad) ? ad : [ad]
    return this.bot.inventory.items().find((i) => adlar.includes(i.name))
  }

  bosYuva() { return this.bot.inventory.emptySlotCount() }

  idler(adlar) { return adlar.map((a) => this.reg.blocksByName[a]?.id).filter((x) => x !== undefined) }

  get xrayAcik() { try { return !!this.xrayIzinli() } catch { return false } }
  goz() { return this.xrayAcik ? 'X-ray ile' : 'Gözümle' }

  /** Açıkta mı (bir yüzü havaya/suya bakıyor) ve botun gözünden görünüyor mu */
  gorunur(b) {
    const komsu = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]]
    const acik = komsu.some(([x, y, z]) => { const n = this.bot.blockAt(b.position.offset(x, y, z)); return n && n.boundingBox === 'empty' })
    return acik && this.bot.canSeeBlock(b)
  }

  /**
   * Blok arar. X-RAY AÇIKKEN (kendi tek kişilik dünyan): duvarın arkasını, yeraltını görür.
   * X-RAY KAPALIYKEN (sunucu / çok oyunculu): cevher, sandık, obsidyen gibi şeyleri sadece gerçekten görebiliyorsa bulur.
   */
  xray(adlar, { mesafe = 64, adet = 1, filtre = null } = {}) {
    const ids = this.idler(adlar)
    if (!ids.length) return []
    const acik = this.xrayAcik
    const konumlar = this.bot.findBlocks({ matching: ids, maxDistance: acik ? mesafe : Math.min(mesafe, 32), count: acik ? Math.max(adet, 1) * (filtre ? 8 : 1) : 128 })
    let bloklar = konumlar.map((p) => this.bot.blockAt(p)).filter(Boolean)
    if (!acik) bloklar = bloklar.filter((b) => !GIZLI.test(b.name) || this.gorunur(b))
    if (filtre) bloklar = bloklar.filter(filtre)
    return bloklar.slice(0, adet)
  }

  /** Lav yakınında mı (kazarken içine akmasın diye) */
  lavYakin(pos, r = 1) {
    for (let dx = -r; dx <= r; dx++) for (let dy = -r; dy <= r + 1; dy++) for (let dz = -r; dz <= r; dz++) {
      const b = this.bot.blockAt(pos.offset(dx, dy, dz))
      if (b && (b.name === 'lava' || b.name === 'flowing_lava')) return true
    }
    return false
  }

  async git(pos, menzil = 2) {
    this.k()
    const hedef = new goals.GoalNear(pos.x, pos.y, pos.z, menzil)
    try { await this.bot.pathfinder.goto(hedef) } catch (e) {
      this.k()
      throw e
    }
    this.k()
  }

  /** Uzak hedeflere ara duraklarla gider; yol bulucu zaman aşımına uğramasın. */
  async uzaGit(pos, menzil = 2) {
    for (let deneme = 0; deneme < 40; deneme++) {
      this.k()
      const ben = this.bot.entity.position
      const uzaklik = ben.distanceTo(pos)
      if (uzaklik <= menzil + 1) return
      if (uzaklik < 28) {
        try { await this.git(pos, menzil); return } catch (e) { if (e.iptal) throw e }
      }
      const adim = Math.min(24, uzaklik - menzil)
      const yon = pos.minus(ben).scaled(1 / uzaklik)
      const ara = ben.plus(yon.scaled(adim)).floored()
      try { await this.git(ara, 3) } catch (e) {
        if (e.iptal) throw e
        // yol yoksa biraz yana kay
        const yan = new Vec3(-yon.z, 0, yon.x).scaled((Math.random() < 0.5 ? -1 : 1) * 6)
        try { await this.git(ben.plus(yan).floored(), 3) } catch (e2) { if (e2.iptal) throw e2 }
      }
    }
    throw new Error('oraya bir türlü varamadım')
  }

  async gez(mesafe = 40) {
    const aci = Math.random() * Math.PI * 2
    const ben = this.bot.entity.position
    await this.uzaGit(ben.offset(Math.cos(aci) * mesafe, 0, Math.sin(aci) * mesafe).floored(), 4)
  }

  enIyiAlet(blok) {
    const esyalar = this.bot.inventory.items()
    let enIyi = null, enHizli = Infinity
    for (const it of [null, ...esyalar]) {
      if (!blok.canHarvest(it ? it.type : null)) continue
      const s = blok.digTime(it ? it.type : null, false, false, false, [], this.bot.entity.effects)
      if (s < enHizli) { enHizli = s; enIyi = it }
    }
    return { esya: enIyi, uygun: enHizli !== Infinity }
  }

  async kaz(blok) {
    this.k()
    if (!blok || blok.name === 'air' || /^(water|lava|flowing_water|flowing_lava)$/.test(blok.name)) return
    const { esya, uygun } = this.enIyiAlet(blok)
    if (esya) await this.bot.equip(esya, 'hand')
    if (!uygun) throw new Error(`${blok.name} kazmak için uygun aletim yok`)
    if (this.bot.entity.position.distanceTo(blok.position.offset(0.5, 0.5, 0.5)) > 4.3) await this.git(blok.position, 3)
    await this.bot.dig(blok, true)
    this.k()
  }

  /**
   * Bloklardan eşya toplar (x-ray ile en yakın olanı bulur, gider, kazar, düşeni alır).
   * @param {string[]} blokAdlari @param {number} adet hedef eşya sayısı (envanterde toplam) @param {string} esyaAd
   */
  async topla(blokAdlari, adet, esyaAd, { mesafe = 64, hedefY = null } = {}) {
    let bulunamadi = 0
    while (this.say(esyaAd) < adet) {
      this.k()
      if (this.bosYuva() === 0) throw new Error('envanterim doldu, biraz eşya alır mısın?')
      const adaylar = this.xray(blokAdlari, { mesafe, adet: 12, filtre: (b) => !this.lavYakin(b.position) })
      if (!adaylar.length) {
        bulunamadi++
        if (bulunamadi > (this.xrayAcik ? 6 : 24)) throw new Error(`yakında ${esyaAd} bulamadım`)
        if (hedefY !== null && Math.abs(this.bot.entity.position.y - hedefY) > 6) {
          this.konus(`${esyaAd} için y=${hedefY} seviyesine iniyorum.`)
          await this.seviyeyeIn(hedefY)
        } else if (hedefY !== null) {
          await this.tunelKaz(32) // dal madenciliği
        } else await this.gez(48)
        continue
      }
      bulunamadi = 0
      const blok = adaylar[0]
      if (!this.enIyiAlet(blok).uygun) throw new Error(`${blok.name} kazmak için daha iyi bir kazma lazım`)
      try {
        const damar = this.bot.collectBlock.findFromVein(blok, 16, 32)
        await this.bot.collectBlock.collect(damar.length ? damar : blok, { ignoreNoPath: true })
      } catch (e) {
        if (this.token.iptal) throw new IptalHatasi()
        if (/full/i.test(e.message)) throw new Error('envanterim doldu, biraz eşya alır mısın?')
        // ulaşamadıysa yol kaz
        try { await this.uzaGit(blok.position, 2); await this.kaz(this.bot.blockAt(blok.position)) } catch (e2) { if (e2.iptal) throw e2 }
      }
    }
  }

  /** Merdiven şeklinde aşağı (ya da yukarı) iner. Yol bulucu lavın yanını kazmaz. */
  async seviyeyeIn(y) {
    for (let deneme = 0; deneme < 30; deneme++) {
      this.k()
      const p = this.bot.entity.position
      if (Math.abs(p.y - y) <= 2) return
      const asagi = p.y > y
      const aci = (deneme * 0.7) % (Math.PI * 2)
      const adim = Math.min(12, Math.abs(p.y - y))
      const hedef = p.offset(Math.cos(aci) * adim, asagi ? -adim : adim, Math.sin(aci) * adim).floored()
      try { await this.bot.pathfinder.goto(new goals.GoalNear(hedef.x, hedef.y, hedef.z, 2)) } catch (e) {
        this.k()
        try { await this.bot.pathfinder.goto(new goals.GoalY(Math.round(asagi ? p.y - 4 : p.y + 4))) } catch { this.k() }
      }
    }
  }

  /** Aynı seviyede düz tünel kazar (dal madenciliği). X-ray tünel boyunca yeni yerleri tarar. */
  async tunelKaz(uzunluk = 32) {
    const p = this.bot.entity.position.floored()
    const yonler = [[1, 0], [0, 1], [-1, 0], [0, -1]]
    const [dx, dz] = yonler[Math.floor(Math.random() * 4)]
    const hedef = p.offset(dx * uzunluk, 0, dz * uzunluk)
    try { await this.bot.pathfinder.goto(new goals.GoalNear(hedef.x, hedef.y, hedef.z, 2)) } catch (e) { this.k() }
  }

  // ---------- üretim ----------
  masaYakin() {
    return this.xray(['crafting_table'], { mesafe: 24 })[0] || null
  }

  async yereKoy(esyaAd) {
    const it = this.esya(esyaAd)
    if (!it) throw new Error(`${esyaAd} yok`)
    const ben = this.bot.entity.position.floored()
    const adaylar = []
    for (let dx = -2; dx <= 2; dx++) for (let dz = -2; dz <= 2; dz++) for (let dy = -1; dy <= 1; dy++) {
      if (Math.abs(dx) + Math.abs(dz) < 1) continue
      adaylar.push(ben.offset(dx, dy, dz))
    }
    adaylar.sort((a, b) => a.distanceTo(ben) - b.distanceTo(ben))
    for (const pos of adaylar) {
      const yer = this.bot.blockAt(pos), alt = this.bot.blockAt(pos.offset(0, -1, 0))
      if (!yer || !alt || yer.name !== 'air' || alt.boundingBox !== 'block') continue
      if (pos.equals(ben) || pos.equals(ben.offset(0, 1, 0))) continue
      try {
        await this.bot.equip(it, 'hand')
        await this.bot.placeBlock(alt, new Vec3(0, 1, 0))
        const b = this.bot.blockAt(pos)
        if (b && b.name !== 'air') return b
      } catch { /* sonraki yeri dene */ }
    }
    throw new Error(`${esyaAd} koyacak yer bulamadım`)
  }

  async tahtaYap(enAz = 4) {
    while (this.say(this.kalaslar()) < enAz) {
      const kutuk = this.esya(KUTUKLER)
      if (!kutuk) {
        await this.odunTopla(Math.ceil((enAz - this.say(this.kalaslar())) / 4) + 1)
        continue
      }
      const kalas = kutuk.name.replace(/_log$|_stem$/, '_planks')
      const tarif = this.bot.recipesFor(this.reg.itemsByName[kalas].id, null, 1, null)[0]
      if (!tarif) throw new Error('kalas yapamadım')
      await this.bot.craft(tarif, Math.min(kutuk.count, Math.ceil((enAz - this.say(this.kalaslar())) / 4)), null)
    }
  }

  kalaslar() { return [...AGACLAR, 'crimson', 'warped', 'bamboo'].map((a) => `${a}_planks`) }

  async masaHazirla() {
    let masa = this.masaYakin()
    if (masa) {
      if (this.bot.entity.position.distanceTo(masa.position) > 3.5) await this.git(masa.position, 2)
      return this.bot.blockAt(masa.position)
    }
    if (!this.esya('crafting_table')) {
      await this.tahtaYap(4)
      const tarif = this.bot.recipesFor(this.reg.itemsByName.crafting_table.id, null, 1, null)[0]
      if (!tarif) throw new Error('çalışma masası yapamadım')
      await this.bot.craft(tarif, 1, null)
    }
    return this.yereKoy('crafting_table')
  }

  /** Envanterdeki malzemeyle üretir (gerekirse masa kurar). */
  async uret(ad, adet = 1) {
    const it = this.reg.itemsByName[ad]
    if (!it) throw new Error(`${ad} diye bir eşya yok`)
    let guvenlik = 0
    while (this.say(ad) < adet && guvenlik++ < 64) {
      this.k()
      let masa = null
      let tarif = this.bot.recipesFor(it.id, null, 1, null)[0]
      if (!tarif) {
        masa = await this.masaHazirla()
        tarif = this.bot.recipesFor(it.id, null, 1, masa)[0]
      }
      if (!tarif) throw new Error(`${ad} yapmak için malzemem yetmiyor`)
      const kez = Math.max(1, Math.ceil((adet - this.say(ad)) / tarif.result.count))
      let yapildi = false
      for (const n of [kez, 1]) {
        try { await this.bot.craft(tarif, n, masa); yapildi = true; break } catch { /* daha azını dene */ }
      }
      if (!yapildi) throw new Error(`${ad} üretemedim`)
    }
  }

  /**
   * Bir eşyayı her yoldan edinir: envanter → kazma → eritme → tarif (malzemeleri de edinerek).
   * @returns {Promise<boolean>}
   */
  async edin(ad, adet, derinlik = 0) {
    this.k()
    if (this.say(ad) >= adet) return true
    if (derinlik > 5) return false
    const it = this.reg.itemsByName[ad]
    if (!it) return false
    try {
      if (TOPLANIR[ad]) {
        const cevher = Object.values(CEVHERLER).find((c) => c.esya === ad)
        await this.topla(TOPLANIR[ad], adet, ad, cevher ? { mesafe: 96, hedefY: cevher.y } : {})
        return this.say(ad) >= adet
      }
      if (ERIT[ad]) {
        const girdi = ad === 'charcoal' ? (this.esya(KUTUKLER)?.name || 'oak_log') : ERIT[ad]
        const lazim = adet - this.say(ad)
        if (!(await this.edin(girdi, lazim, derinlik + 1))) return false
        await this.erit(girdi, lazim)
        return this.say(ad) >= adet
      }
      if (/_planks$/.test(ad) && !ad.startsWith('bamboo')) {
        const kutuk = ad.replace(/_planks$/, ad.startsWith('crimson') || ad.startsWith('warped') ? '_stem' : '_log')
        const lazim = Math.ceil((adet - this.say(ad)) / 4)
        if (!(await this.edin(kutuk, lazim, derinlik + 1))) return false
        await this.uret(ad, adet)
        return true
      }
      const tarifler = this.bot.recipesAll(it.id, null, true)
      if (!tarifler.length) return false
      // elimizdekiyle en çok örtüşen tarifi önce dene
      const puan = (t) => t.delta.filter((d) => d.count < 0).reduce((s, d) => s + Math.min(this.say(this.reg.items[d.id].name), -d.count), 0)
      const sirali = [...tarifler].sort((a, b) => puan(b) - puan(a)).slice(0, 4)
      for (const t of sirali) {
        const kez = Math.ceil((adet - this.say(ad)) / t.result.count)
        const ihtiyac = {}
        for (const d of t.delta) if (d.count < 0) { const n = this.reg.items[d.id].name; ihtiyac[n] = (ihtiyac[n] || 0) - d.count * kez }
        let tamam = true
        for (const [n, c] of Object.entries(ihtiyac)) if (!(await this.edin(n, c, derinlik + 1))) { tamam = false; break }
        if (!tamam) continue
        await this.uret(ad, adet)
        return this.say(ad) >= adet
      }
      return false
    } catch (e) {
      if (e.iptal) throw e
      console.log(`[edin] ${ad}:`, e.message)
      return false
    }
  }

  async firinHazirla() {
    let f = this.xray(['furnace', 'lit_furnace'], { mesafe: 24 })[0]
    if (f) {
      if (this.bot.entity.position.distanceTo(f.position) > 3.5) await this.git(f.position, 2)
      return this.bot.blockAt(f.position)
    }
    if (!this.esya('furnace')) {
      if (!(await this.edin('cobblestone', 8)) && !(await this.edin('cobbled_deepslate', 8))) throw new Error('fırın için taş bulamadım')
      await this.uret('furnace', 1)
    }
    return this.yereKoy('furnace')
  }

  async yakitKoy(firin, kacEsya) {
    let kalan = kacEsya
    for (const [ad, guc] of YAKITLAR) {
      if (kalan <= 0) break
      const it = this.esya(ad)
      if (!it) continue
      const n = Math.min(it.count, Math.ceil(kalan / guc))
      await firin.putFuel(it.type, null, n)
      kalan -= n * guc
    }
    return kalan <= 0
  }

  async erit(girdiAd, adet) {
    let kalan = Math.min(adet, this.say(girdiAd))
    if (kalan <= 0) throw new Error(`eritecek ${girdiAd} yok`)
    // yakıt yoksa önce kömür / odun bul
    const toplamYakit = YAKITLAR.reduce((s, [ad, g]) => s + this.say(ad) * g, 0)
    if (toplamYakit < kalan) {
      if (!(await this.edin('coal', Math.ceil(kalan / 8)))) await this.tahtaYap(Math.ceil(kalan / 1.5))
    }
    const blok = await this.firinHazirla()
    this.konus(`${kalan} ${girdiAd} eritiyorum, biraz sürer.`)
    while (kalan > 0) {
      this.k()
      const parti = Math.min(kalan, 64)
      const firin = await this.bot.openFurnace(blok)
      try {
        if (!firin.fuelItem()) await this.yakitKoy(firin, parti)
        const it = this.esya(girdiAd)
        if (!it) break
        await firin.putInput(it.type, null, Math.min(parti, this.say(girdiAd)))
        let alinan = 0
        const son = Date.now() + parti * 11000 + 15000
        while (alinan < parti && Date.now() < son) {
          await bekle(1500)
          if (this.token.iptal) break
          if (firin.outputItem()) alinan += (await firin.takeOutput())?.count || 0
          if (!firin.fuelItem() && firin.fuel === 0 && firin.inputItem()) await this.yakitKoy(firin, parti - alinan)
        }
        kalan -= Math.max(alinan, 1)
      } finally { firin.close() }
    }
    this.k()
  }

  // ---------- ilerleme aşamaları ----------
  async odunTopla(adet = 16) {
    const hedef = this.say(KUTUKLER) + adet
    let bulunamadi = 0
    while (this.say(KUTUKLER) < hedef) {
      this.k()
      const agac = this.xray(KUTUKLER, { mesafe: 64, adet: 1 })[0]
      if (!agac) {
        if (++bulunamadi > 5) throw new Error('etrafta hiç ağaç yok')
        this.konus('Ağaç arıyorum...')
        await this.gez(48)
        continue
      }
      const govde = this.bot.collectBlock.findFromVein(agac, 24, 16)
      try { await this.bot.collectBlock.collect(govde.length ? govde : agac, { ignoreNoPath: true }) } catch (e) {
        if (this.token.iptal) throw new IptalHatasi()
      }
    }
  }

  async ahsapAletler() {
    if (this.esya(['wooden_pickaxe', 'stone_pickaxe', 'iron_pickaxe', 'diamond_pickaxe', 'netherite_pickaxe'])) return
    if (this.say(KUTUKLER) * 4 + this.say(this.kalaslar()) < 16) await this.odunTopla(5)
    await this.tahtaYap(12)
    await this.masaHazirla()
    await this.uret('stick', 4)
    await this.uret('wooden_pickaxe', 1)
    this.konus('Tahta kazmam hazır.')
  }

  async tasAletler() {
    if (this.esya(['stone_pickaxe', 'iron_pickaxe', 'diamond_pickaxe', 'netherite_pickaxe']) && this.esya('furnace')) return
    await this.ahsapAletler()
    const taslar = ['cobblestone', 'cobbled_deepslate', 'blackstone']
    if (this.say(taslar) < 24) await this.topla(['stone', 'cobblestone', 'deepslate'], 24, 'cobblestone')
    await this.tahtaYap(4)
    await this.uret('stick', 4)
    for (const a of ['stone_pickaxe', 'stone_sword', 'stone_axe']) await this.uret(a, 1)
    if (!this.esya('furnace')) await this.uret('furnace', 1)
    this.konus('Taş aletler ve fırın tamam.')
  }

  async demirAletler() {
    if (this.esya(['iron_pickaxe', 'diamond_pickaxe', 'netherite_pickaxe']) && this.esya('bucket')) return
    await this.tasAletler()
    if (this.say(['coal', 'charcoal']) < 8) {
      this.konus(`${this.goz()} kömür arıyorum.`)
      await this.topla(CEVHERLER.coal.bloklar, 8, 'coal', { mesafe: 96, hedefY: CEVHERLER.coal.y })
    }
    const lazim = 14
    if (this.say('iron_ingot') + this.say('raw_iron') < lazim) {
      this.konus('Demir avına çıkıyorum, lav görürsem uzak duracağım.')
      await this.topla(CEVHERLER.iron.bloklar, lazim - this.say('iron_ingot'), 'raw_iron', { mesafe: 96, hedefY: CEVHERLER.iron.y })
    }
    // yakında altın varsa netherite için alalım
    if (this.say(['raw_gold', 'gold_ingot']) < 4 && this.xray(CEVHERLER.gold.bloklar, { mesafe: 32 }).length) {
      try { await this.topla(CEVHERLER.gold.bloklar, 4, 'raw_gold', { mesafe: 32 }) } catch (e) { if (e.iptal) throw e }
    }
    if (this.say('raw_iron')) await this.erit('raw_iron', this.say('raw_iron'))
    if (this.say('raw_gold')) await this.erit('raw_gold', this.say('raw_gold'))
    await this.tahtaYap(4)
    await this.uret('stick', 4)
    for (const a of ['iron_pickaxe', 'iron_sword', 'bucket']) await this.uret(a, 1)
    this.konus('Demir kazma, demir kılıç ve kova hazır!')
  }

  async elmas() {
    if (this.esya(['diamond_pickaxe', 'netherite_pickaxe'])) { this.konus('Zaten elmas kazmam var.'); return }
    await this.demirAletler()
    this.konus(this.xrayAcik ? 'Elmasa gidiyorum: x-ray açık, lavdan uzak duruyorum.' : 'Elmas için y=-58 seviyesine inip dal madenciliği yapacağım (x-ray kapalı).')
    await this.topla(CEVHERLER.diamond.bloklar, 5, 'diamond', { mesafe: 128, hedefY: CEVHERLER.diamond.y })
    await this.tahtaYap(4)
    await this.uret('stick', 4)
    await this.uret('diamond_pickaxe', 1)
    if (this.say('diamond') >= 2) await this.uret('diamond_sword', 1)
    this.konus(`Elmas kazma yaptım! Elimde ${this.say('diamond')} elmas daha var.`)
  }

  async kovaDoldur() {
    if (this.esya('water_bucket')) return
    if (!this.esya('bucket')) await this.edin('bucket', 1)
    const su = this.xray(['water'], { mesafe: 64, adet: 1, filtre: (b) => b.getProperties().level === 0 })[0]
    if (!su) throw new Error('kovayı dolduracak su bulamadım')
    await this.uzaGit(su.position, 2)
    await this.bot.equip(this.esya('bucket'), 'hand')
    await this.bot.lookAt(su.position.offset(0.5, 0.9, 0.5), true)
    this.bot.activateItem()
    await bekle(600)
    if (!this.esya('water_bucket')) throw new Error('suyu kovaya alamadım')
  }

  async obsidyenYap(adet = 10) {
    if (!this.esya(['diamond_pickaxe', 'netherite_pickaxe'])) await this.elmas()
    let tur = 0
    while (this.say('obsidian') < adet) {
      this.k()
      if (tur++ > 12) throw new Error('yeterince obsidyen yapamadım')
      // önce hazır obsidyen var mı (yıkık portallar, doğal)
      const hazir = this.xray(['obsidian'], { mesafe: 48, adet: 1, filtre: (b) => !this.lavYakin(b.position) })[0]
      if (hazir) { await this.topla(['obsidian'], adet, 'obsidian', { mesafe: 48 }); continue }
      await this.kovaDoldur()
      const lav = this.xray(['lava'], { mesafe: 64, adet: 1, filtre: (b) => b.getProperties().level === 0 && this.bot.blockAt(b.position.offset(0, 1, 0))?.name === 'air' })[0]
      if (!lav) { await this.gez(40); continue }
      this.konus('Lav gölü buldum, üstüne su döküp obsidyen yapıyorum.')
      // lavın kenarındaki sağlam bloğun yanına git
      let kenar = null
      for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1], [2, 0], [-2, 0], [0, 2], [0, -2]]) {
        const b = this.bot.blockAt(lav.position.offset(dx, 0, dz))
        const ust = this.bot.blockAt(lav.position.offset(dx, 1, dz))
        if (b && b.boundingBox === 'block' && ust && ust.name === 'air') { kenar = b; break }
      }
      if (!kenar) { await this.gez(20); continue }
      await this.uzaGit(kenar.position.offset(0, 1, 0), 3)
      await this.bot.equip(this.esya('water_bucket'), 'hand')
      await this.bot.lookAt(kenar.position.offset(0.5, 1, 0.5), true)
      this.bot.activateItem()
      await bekle(3500) // su aksın, lav obsidyene dönsün
      // suyu geri al
      const dokulen = this.xray(['water'], { mesafe: 6, adet: 1, filtre: (b) => b.getProperties().level === 0 })[0]
      if (dokulen && this.esya('bucket')) {
        await this.bot.equip(this.esya('bucket'), 'hand')
        await this.bot.lookAt(dokulen.position.offset(0.5, 0.5, 0.5), true)
        this.bot.activateItem()
        await bekle(500)
      }
      const yeni = this.xray(['obsidian'], { mesafe: 10, adet: 16 })
      if (yeni.length) await this.topla(['obsidian'], Math.min(adet, this.say('obsidian') + yeni.length), 'obsidian', { mesafe: 12 })
    }
  }

  async cakmakYap() {
    if (this.esya('flint_and_steel')) return
    if (!this.esya('flint')) {
      this.konus('Çakmak için çakıl taşından çakmaktaşı çıkarıyorum.')
      let deneme = 0
      while (!this.esya('flint') && deneme++ < 40) {
        this.k()
        if (this.esya('gravel')) {
          // çakılı yere koyup tekrar kaz (oyuncuların bildiği numara)
          try {
            const b = await this.yereKoy('gravel')
            await this.kaz(b)
            await bekle(400)
          } catch (e) { if (e.iptal) throw e }
          continue
        }
        await this.topla(['gravel'], this.say('gravel') + 1, 'gravel', { mesafe: 64 })
        if (!this.esya('flint')) continue
      }
      if (!this.esya('flint')) throw new Error('çakmaktaşı çıkmadı')
    }
    await this.edin('iron_ingot', 1)
    await this.uret('flint_and_steel', 1)
  }

  async koy(pos, esyaAd) {
    this.k()
    const it = this.esya(esyaAd)
    if (!it) return false
    const mevcut = this.bot.blockAt(pos)
    if (!mevcut) return false
    if (mevcut.name === esyaAd) return true
    if (mevcut.boundingBox === 'block' || (mevcut.name !== 'air' && !/water|lava|grass|fern|snow|flower|bush/.test(mevcut.name))) {
      try { await this.kaz(mevcut) } catch (e) { if (e.iptal) throw e; return false }
    }
    const yonler = [new Vec3(0, -1, 0), new Vec3(1, 0, 0), new Vec3(-1, 0, 0), new Vec3(0, 0, 1), new Vec3(0, 0, -1), new Vec3(0, 1, 0)]
    for (const y of yonler) {
      const ref = this.bot.blockAt(pos.plus(y))
      if (!ref || ref.boundingBox !== 'block') continue
      try {
        if (this.bot.entity.position.distanceTo(pos.offset(0.5, 0.5, 0.5)) > 4 || this.bot.entity.position.floored().equals(pos) || this.bot.entity.position.floored().offset(0, 1, 0).equals(pos)) {
          await this.bot.pathfinder.goto(new goals.GoalPlaceBlock(pos, this.bot.world, { range: 4 }))
        }
        await this.bot.equip(this.esya(esyaAd), 'hand')
        await this.bot.placeBlock(ref, y.scaled(-1))
      } catch (e) {
        if (this.token.iptal) throw new IptalHatasi()
      }
      const sonra = this.bot.blockAt(pos)
      if (sonra && sonra.name !== 'air' && !/water|lava/.test(sonra.name)) return true
    }
    return false
  }

  async portalKur() {
    await this.cakmakYap()
    await this.obsidyenYap(10)
    if (!this.esya('crafting_table')) { await this.tahtaYap(4); await this.uret('crafting_table', 1) }
    if (!this.esya('furnace')) await this.edin('furnace', 1)
    if (this.say(['cobblestone', 'cobbled_deepslate']) < 4) await this.edin('cobblestone', 8)
    this.konus('Obsidyen tamam, portalı kuruyorum.')
    const ben = this.bot.entity.position.floored()
    const o = ben.offset(2, 0, 0) // portal çerçevesinin sol alt köşesi, x ekseni boyunca
    // çerçeve alanını boşalt
    for (let x = 0; x < 4; x++) for (let y = 0; y < 5; y++) {
      const b = this.bot.blockAt(o.offset(x, y, 0))
      if (b && b.name !== 'air') await this.kaz(b)
    }
    for (let x = 0; x < 4; x++) {
      const alt = this.bot.blockAt(o.offset(x, -1, 0))
      if (!alt || alt.boundingBox !== 'block') await this.koy(o.offset(x, -1, 0), this.esya(['cobblestone', 'cobbled_deepslate'])?.name || 'cobblestone')
    }
    const tas = () => this.esya(['cobblestone', 'cobbled_deepslate'])?.name || 'cobblestone'
    const sira = [
      [1, 0, 'obsidian'], [2, 0, 'obsidian'], [0, 0, tas()], [3, 0, tas()],
      [0, 1, 'obsidian'], [0, 2, 'obsidian'], [0, 3, 'obsidian'],
      [3, 1, 'obsidian'], [3, 2, 'obsidian'], [3, 3, 'obsidian'],
      [0, 4, tas()], [1, 4, 'obsidian'], [2, 4, 'obsidian']
    ]
    for (const [x, y, ad] of sira) {
      if (!(await this.koy(o.offset(x, y, 0), ad))) throw new Error(`portal bloğunu koyamadım (${x},${y})`)
    }
    await this.bot.equip(this.esya('flint_and_steel'), 'hand')
    const taban = this.bot.blockAt(o.offset(1, 0, 0))
    await this.bot.lookAt(taban.position.offset(0.5, 1, 0.5), true)
    await this.bot.activateBlock(taban, new Vec3(0, 1, 0))
    await bekle(1000)
    const portal = this.xray(['nether_portal'], { mesafe: 8 })[0]
    if (!portal) throw new Error('portal yanmadı')
    this.portalNoktasi = portal.position
    this.konus('Nether portalı açıldı!')
  }

  boyutNether() { return String(this.bot.game.dimension).includes('nether') }

  async portaldanGec() {
    const portal = this.xray(['nether_portal'], { mesafe: 48 })[0]
    if (!portal) throw new Error('yakında portal yok')
    const onceki = this.bot.game.dimension
    await this.uzaGit(portal.position, 0)
    const p = portal.position
    try { await this.bot.pathfinder.goto(new goals.GoalBlock(p.x, p.y, p.z)) } catch { this.k() }
    const son = Date.now() + 20000
    while (this.bot.game.dimension === onceki && Date.now() < son) { this.k(); await bekle(500) }
    if (this.bot.game.dimension === onceki) throw new Error('portaldan geçemedim')
    await bekle(2000)
    // çıkışta portaldan bir adım uzaklaş
    const yeni = this.xray(['nether_portal'], { mesafe: 6 })[0]
    if (this.boyutNether() && yeni) this.netherPortali = yeni.position
    const ben = this.bot.entity.position
    try { await this.bot.pathfinder.goto(new goals.GoalInvert(new goals.GoalNear(ben.x, ben.y, ben.z, 3))) } catch { this.k() }
  }

  async netherGit() {
    if (this.boyutNether()) { this.konus('Zaten Nether\'deyim.'); return }
    if (!this.xray(['nether_portal'], { mesafe: 48 }).length) await this.portalKur()
    this.konus('Portaldan geçiyorum, Nether\'de görüşürüz!')
    await this.portaldanGec()
    this.konus('Nether\'deyim. Lav denizlerinden uzak duruyorum.')
  }

  async sablonBul() {
    if (this.esya('netherite_upgrade_smithing_template')) return true
    if (!this.reg.itemsByName.netherite_upgrade_smithing_template) return true // eski sürüm: şablon yok
    this.konus(`Netherite şablonu için bastion kalesi arıyorum (${this.xrayAcik ? 'x-ray' : 'gözümle'}).`)
    const isaret = this.xray(['gilded_blackstone', 'polished_blackstone_bricks'], { mesafe: 96 })[0]
    if (!isaret) return false
    await this.uzaGit(isaret.position, 4)
    const sandiklar = this.xray(['chest'], { mesafe: 40, adet: 6 })
    for (const s of sandiklar) {
      this.k()
      try {
        await this.uzaGit(s.position, 2)
        const kap = await this.bot.openContainer(this.bot.blockAt(s.position))
        for (const it of kap.containerItems()) {
          if (/netherite_upgrade|gold_ingot|gold_block|netherite_scrap|ancient_debris|diamond/.test(it.name)) await kap.withdraw(it.type, null, it.count)
        }
        kap.close()
        if (this.esya('netherite_upgrade_smithing_template')) return true
      } catch (e) { if (e.iptal) throw e }
    }
    return !!this.esya('netherite_upgrade_smithing_template')
  }

  async netherite() {
    if (this.esya('netherite_pickaxe')) { this.konus('Netherite kazmam zaten var!'); return }
    if (!this.esya(['diamond_pickaxe'])) await this.elmas()
    if (!this.boyutNether()) await this.netherGit()
    this.konus(this.xrayAcik ? 'Ancient debris arıyorum, x-ray açık.' : 'Ancient debris için y=15 seviyesinde tünel kazıyorum (x-ray kapalı).')
    const lazim = 4 - this.say('netherite_scrap') - this.say('netherite_ingot') * 4
    if (lazim > 0 && this.say('ancient_debris') < lazim) await this.topla(['ancient_debris'], lazim, 'ancient_debris', { mesafe: 96, hedefY: 15 })
    if (this.say('ancient_debris')) await this.erit('ancient_debris', this.say('ancient_debris'))
    if (this.say('gold_ingot') < 4 && !this.esya('netherite_ingot')) {
      if (this.say('raw_gold')) await this.erit('raw_gold', this.say('raw_gold'))
      if (this.say('gold_ingot') < 4) {
        const nugget = (4 - this.say('gold_ingot')) * 9
        await this.topla(CEVHERLER.nether_gold.bloklar, nugget, 'gold_nugget', { mesafe: 64 })
        await this.uret('gold_ingot', 4)
      }
    }
    if (!this.esya('netherite_ingot')) await this.uret('netherite_ingot', 1)
    this.konus('Netherite külçesi hazır!')
    if (!(await this.sablonBul())) {
      this.konus('Netherite şablonu bulamadım. Bana bir "Netherite Upgrade" şablonu atarsan kazmayı yükseltirim; külçe bende.')
      const son = Date.now() + 5 * 60 * 1000
      while (!this.esya('netherite_upgrade_smithing_template') && Date.now() < son) { this.k(); await bekle(2000) }
      if (!this.esya('netherite_upgrade_smithing_template')) return
    }
    await this.yukselt('diamond_pickaxe')
    this.konus('NETHERITE KAZMA TAMAM!')
  }

  async yukselt(esyaAd) {
    let masa = this.xray(['smithing_table'], { mesafe: 24 })[0]
    if (!masa) {
      if (!this.esya('smithing_table')) {
        await this.edin('iron_ingot', 2)
        await this.tahtaYap(4)
        await this.uret('smithing_table', 1)
      }
      masa = await this.yereKoy('smithing_table')
    } else await this.git(masa.position, 2)
    const pencere = await this.bot.openBlock(this.bot.blockAt(masa.position))
    try {
      const koy = async (ad, slot) => {
        const it = this.esya(ad)
        if (!it) throw new Error(`${ad} yok`)
        await this.bot.transfer({ window: pencere, itemType: it.type, metadata: null, sourceStart: pencere.inventoryStart, sourceEnd: pencere.inventoryEnd, destStart: slot, destEnd: slot + 1, count: 1 })
      }
      const sablonlu = pencere.inventoryStart >= 4
      if (sablonlu) { await koy('netherite_upgrade_smithing_template', 0); await koy(esyaAd, 1); await koy('netherite_ingot', 2) } else { await koy(esyaAd, 0); await koy('netherite_ingot', 1) }
      await bekle(600)
      await this.bot.putAway(sablonlu ? 3 : 2)
    } finally { pencere.close() }
  }

  async hepsiniYap() {
    const adimlar = [['ahsapAletler', 'Tahta aletler'], ['tasAletler', 'Taş aletler'], ['demirAletler', 'Demir'], ['elmas', 'Elmas'], ['netherGit', 'Nether'], ['netherite', 'Netherite']]
    for (const [f, ad] of adimlar) {
      this.konus(`Aşama: ${ad}`)
      await this[f]()
    }
  }

  // ---------- inşa ----------
  async insaEt(semaAd, merkezOyuncu) {
    if (!semaAd) throw new Error('hangi yapıyı kuracağımı söylemedin')
    const sema = await semaYukle(semaAd, this.bot.version)
    if (await this.komutIzni()) return this.komutlaInsa(sema, merkezOyuncu)
    const agacSay = {}
    for (const b of this.xray(KUTUKLER, { mesafe: 64, adet: 40 })) { const t = b.name.replace(/_log$/, ''); agacSay[t] = (agacSay[t] || 0) + 1 }
    const agac = Object.entries(agacSay).sort((a, b) => b[1] - a[1])[0]?.[0] || 'oak'
    const { bloklar, notlar } = uyarla(sema.bloklar, { agac })
    const sira = insaSirasi(bloklar)
    const kaynak = merkezOyuncu?.position || this.bot.entity.position
    const yon = this.bot.entity.yaw
    const o = kaynak.offset(-Math.sin(yon) * 4, 0, -Math.cos(yon) * 4).floored() // önüne
    const maxX = Math.max(...bloklar.map((b) => b.x)), maxZ = Math.max(...bloklar.map((b) => b.z)), maxY = Math.max(...bloklar.map((b) => b.y))
    const malz = malzemeListesi(bloklar.filter((b) => !b.opsiyonel).map((b) => ({ ...b, ad: esyaAdi(b.ad) })))
    this.konus(`${sema.ad} kuruyorum: ${bloklar.length} blok, ${agac} ağacıyla. ${notlar.slice(0, 2).join('; ')}`)
    console.log('[insa] malzeme:', malz)

    // yakındaki sandıklardan eksikleri al
    await this.sandiktanAl(malz)

    // alanı temizle (ağaç, çimen vs.)
    const plan = new Map(bloklar.map((b) => [`${b.x},${b.y},${b.z}`, b]))
    this.konus('Önce alanı temizliyorum.')
    for (let y = maxY; y >= 0; y--) for (let x = Math.min(0, ...bloklar.map((b) => b.x)); x <= maxX; x++) for (let z = Math.min(0, ...bloklar.map((b) => b.z)); z <= maxZ; z++) {
      if (plan.has(`${x},${y},${z}`)) continue
      const b = this.bot.blockAt(o.offset(x, y, z))
      if (b && b.name !== 'air' && b.boundingBox === 'block') { try { await this.kaz(b) } catch (e) { if (e.iptal) throw e } }
    }

    let konan = 0, atlanan = 0, sonRapor = 0
    const katlar = [...new Set(sira.map((b) => b.y))]
    const ertelenen = []
    for (const kat of katlar) {
      const kattakiler = sira.filter((b) => b.y === kat)
      // bu kat için malzeme
      const katMalz = malzemeListesi(kattakiler.filter((b) => !b.opsiyonel).map((b) => ({ ...b, ad: esyaAdi(b.ad) })))
      for (const [ad, n] of Object.entries(katMalz)) {
        if (this.say(ad) >= n) continue
        this.konus(`${n} ${ad} lazım, topluyorum.`)
        await this.edin(ad, n)
      }
      for (const b of kattakiler) {
        this.k()
        const pos = o.offset(b.x, b.y, b.z)
        const ad = esyaAdi(b.ad)
        const mevcut = this.bot.blockAt(pos)
        if (mevcut && mevcut.name === b.ad) { konan++; continue }
        if (!this.esya(ad)) {
          if (b.opsiyonel || !(await this.edin(ad, 1))) { atlanan++; continue }
        }
        if (await this.koy(pos, ad)) konan++
        else ertelenen.push(b)
        const yuzde = Math.floor((konan / bloklar.length) * 100)
        if (yuzde >= sonRapor + 20) { sonRapor = yuzde; this.konus(`İnşaat %${yuzde}`) }
      }
    }
    for (const b of ertelenen) { if (await this.koy(o.offset(b.x, b.y, b.z), esyaAdi(b.ad))) konan++; else atlanan++ }
    this.konus(`Bitti! ${konan} blok koydum${atlanan ? `, ${atlanan} bloğu malzeme olmadığı için atladım` : ''}.`)
  }

  /**
   * Hileler açıkken: malzeme toplamadan /setblock ile kurar, ama bir anda değil —
   * alttan üste kat kat, blok blok, yanında durup kolunu sallayarak. Merdiven/kapı yönleri korunur.
   */
  async komutlaInsa(sema, merkezOyuncu) {
    const bloklar = sema.bloklar.filter((b) => !/^(air|cave_air|void_air|structure_void)$/.test(b.ad))
    const sira = insaSirasi(bloklar)
    const kaynak = merkezOyuncu?.position || this.bot.entity.position
    const yon = this.bot.entity.yaw
    let o = kaynak.offset(-Math.sin(yon) * 4, 0, -Math.cos(yon) * 4).floored()
    const maxX = Math.max(...bloklar.map((b) => b.x)), maxZ = Math.max(...bloklar.map((b) => b.z)), maxY = Math.max(...bloklar.map((b) => b.y))
    const minX = Math.min(0, ...bloklar.map((b) => b.x)), minZ = Math.min(0, ...bloklar.map((b) => b.z))
    // en alt kat çoğunlukla toprak/çimense (şematiğin zemini), yere gömülsün
    const taban = bloklar.filter((b) => b.y === 0)
    if (taban.length && taban.filter((b) => /^(grass_block|dirt|coarse_dirt|podzol|sand|gravel|stone)$/.test(b.ad)).length / taban.length > 0.6) o = o.offset(0, -1, 0)
    const bekleMs = Number(process.env.KOMUT_HIZ_MS || 120)
    this.konus(`Hileler açık: ${sema.ad} yapısını komutla kat kat kuruyorum (${sira.length} blok).`)
    // dışarıda, köşede dur
    try { await this.git(o.offset(minX - 2, 1, minZ - 2), 1) } catch (e) { if (e.iptal) throw e }
    // alanı üstten alta kat kat boşalt
    for (let y = maxY + 2; y >= 0; y--) {
      this.k()
      this.bot.chat(`/fill ${o.x + minX} ${o.y + y} ${o.z + minZ} ${o.x + maxX} ${o.y + y} ${o.z + maxZ} minecraft:air`)
      await bekle(bekleMs)
    }
    let konan = 0, rapor = 0, sonKat = -1
    for (const b of sira) {
      this.k()
      const p = o.offset(b.x, b.y, b.z)
      if (b.y !== sonKat) {
        sonKat = b.y
        // her yeni katta yapının yanına yaklaş (blok koyacak kadar yakın görünsün)
        const merkez = o.offset(Math.floor(maxX / 2), b.y, Math.floor(maxZ / 2))
        if (this.bot.entity.position.distanceTo(merkez) > 12) { try { await this.git(o.offset(minX - 2, Math.max(1, b.y - 2), Math.floor(maxZ / 2)), 3) } catch (e) { if (e.iptal) throw e } }
      }
      const durum = b.durum && Object.keys(b.durum).length ? `[${Object.entries(b.durum).map(([k, v]) => `${k}=${v}`).join(',')}]` : ''
      this.bot.lookAt(p.offset(0.5, 0.5, 0.5), true).catch(() => {})
      this.bot.swingArm('right')
      this.bot.chat(`/setblock ${p.x} ${p.y} ${p.z} minecraft:${b.ad}${durum}`)
      konan++
      const yuzde = Math.floor((konan / sira.length) * 100)
      if (yuzde >= rapor + 25) { rapor = yuzde; this.konus(`İnşaat %${yuzde}`) }
      await bekle(bekleMs)
    }
    this.konus(`Bitti! ${sema.ad} hazır (${konan} blok).`)
  }

  async sandiktanAl(malz) {
    const sandiklar = this.xray(['chest', 'barrel'], { mesafe: 12, adet: 4 })
    for (const s of sandiklar) {
      try {
        await this.git(s.position, 2)
        const kap = await this.bot.openContainer(this.bot.blockAt(s.position))
        for (const it of kap.containerItems()) {
          const lazim = (malz[it.name] || 0) - this.say(it.name)
          if (lazim > 0) await kap.withdraw(it.type, null, Math.min(lazim, it.count))
        }
        kap.close()
      } catch (e) { if (e.iptal) throw e }
    }
  }

  async tarlaYap() {
    // çapa
    if (!this.esya(['wooden_hoe', 'stone_hoe', 'iron_hoe', 'diamond_hoe', 'netherite_hoe'])) {
      await this.tahtaYap(4)
      await this.uret('stick', 2)
      if (this.say(['cobblestone', 'cobbled_deepslate']) >= 2) await this.uret('stone_hoe', 1)
      else await this.uret('wooden_hoe', 1)
    }
    // tohum: çimenleri kırarak
    if (this.say('wheat_seeds') < 16) {
      this.konus('Çimenlerden tohum topluyorum.')
      let deneme = 0
      while (this.say('wheat_seeds') < 16 && deneme++ < 80) {
        this.k()
        const cimen = this.xray(['short_grass', 'grass', 'tall_grass', 'fern'], { mesafe: 32 })[0]
        if (!cimen) { if (this.say('wheat_seeds') >= 4) break; await this.gez(30); continue }
        try { await this.kaz(cimen); await bekle(300) } catch (e) { if (e.iptal) throw e }
        const tohum = this.bot.nearestEntity((e) => e.name === 'item' && e.position.distanceTo(this.bot.entity.position) < 6)
        if (tohum) { try { await this.git(tohum.position, 0) } catch (e) { if (e.iptal) throw e } }
      }
    }
    // su kaynağının çevresini sür
    let su = this.xray(['water'], { mesafe: 48, adet: 1, filtre: (b) => b.getProperties().level === 0 && this.bot.blockAt(b.position.offset(0, 1, 0))?.name === 'air' })[0]
    if (!su && this.esya('water_bucket')) {
      const merkez = this.bot.entity.position.floored().offset(2, -1, 0)
      await this.kaz(this.bot.blockAt(merkez))
      await this.bot.equip(this.esya('water_bucket'), 'hand')
      await this.bot.lookAt(merkez.offset(0.5, 0, 0.5), true)
      this.bot.activateItem()
      await bekle(800)
      su = this.bot.blockAt(merkez)
    }
    if (!su) throw new Error('tarla için yakında su yok (kovaya su doldurursan yaparım)')
    this.konus('Suyun etrafını çapalıyorum.')
    const capa = () => this.esya(['netherite_hoe', 'diamond_hoe', 'iron_hoe', 'stone_hoe', 'wooden_hoe'])
    let ekilen = 0
    for (let dx = -4; dx <= 4; dx++) for (let dz = -4; dz <= 4; dz++) {
      this.k()
      if (!dx && !dz) continue
      const pos = su.position.offset(dx, 0, dz)
      let b = this.bot.blockAt(pos)
      const ust = this.bot.blockAt(pos.offset(0, 1, 0))
      if (!b || !ust) continue
      if (ust.name !== 'air') { if (/grass|fern|flower|bush/.test(ust.name)) { try { await this.kaz(ust) } catch (e) { if (e.iptal) throw e } } else continue }
      if (!/^(grass_block|dirt|farmland)$/.test(b.name)) continue
      try {
        if (this.bot.entity.position.distanceTo(pos) > 4) await this.git(pos.offset(0, 1, 0), 3)
        if (b.name !== 'farmland') {
          await this.bot.equip(capa(), 'hand')
          await this.bot.activateBlock(b, new Vec3(0, 1, 0))
          await bekle(250)
        }
        if (this.esya('wheat_seeds')) {
          await this.bot.equip(this.esya('wheat_seeds'), 'hand')
          await this.bot.activateBlock(this.bot.blockAt(pos), new Vec3(0, 1, 0))
          ekilen++
          await bekle(150)
        }
      } catch (e) { if (this.token.iptal) throw new IptalHatasi() }
    }
    this.konus(`Tarla hazır, ${ekilen} tohum ektim. Büyüyünce hasat ederiz!`)
  }

  async madenBul(cevherAd = 'diamond', adet = 4) {
    const anahtar = Object.keys(CEVHERLER).find((k) => k === cevherAd || CEVHERLER[k].esya === cevherAd || CEVHERLER[k].bloklar.includes(cevherAd))
    const c = CEVHERLER[anahtar]
    if (!c) throw new Error(`${cevherAd} diye bir cevher bilmiyorum`)
    if (c.nether && !this.boyutNether()) throw new Error('o cevher Nether\'de, önce Nether\'e gitmeliyiz')
    this.konus(`${this.goz()} ${adet} ${c.esya} arıyorum.`)
    await this.topla(c.bloklar, this.say(c.esya) + adet, c.esya, { mesafe: 128, hedefY: c.y })
    this.konus(`${adet} ${c.esya} tamam!`)
  }

  async esyalariVer(oyuncuVarlik, esya = 'hepsi') {
    if (oyuncuVarlik) await this.uzaGit(oyuncuVarlik.position.floored(), 2)
    if (oyuncuVarlik) await this.bot.lookAt(oyuncuVarlik.position.offset(0, 1.6, 0), true)
    const esyalar = this.bot.inventory.items().filter((i) => esya === 'hepsi' || i.name === esya || i.name.includes(esya))
    if (!esyalar.length) { this.konus('Vereceğim bir şey yok.'); return }
    for (const it of esyalar) { this.k(); await this.bot.tossStack(it); await bekle(150) }
    this.konus('Al bakalım!')
  }

  async uyu() {
    if (this.bot.time.isDay) { this.konus('Daha gündüz, uyuyamam.'); return }
    const yatak = this.xray(this.reg.blocksArray.filter((b) => b.name.endsWith('_bed')).map((b) => b.name), { mesafe: 32 })[0]
    if (!yatak) { this.konus('Yakında yatak yok, yanında nöbet tutuyorum.'); return }
    await this.git(yatak.position, 2)
    await this.bot.sleep(this.bot.blockAt(yatak.position))
    this.konus('İyi geceler.')
  }

  semaListesiMetni() {
    return semalariListele().map((s) => `${s.ad}: ${s.aciklama}`).join('\n')
  }
}
