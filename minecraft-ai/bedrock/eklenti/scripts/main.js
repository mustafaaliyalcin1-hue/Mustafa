// Yapay Zeka Yardımcı — Bedrock eklentisi.
// Yardımcı bir NPC: yürür, kazar (x-ray ile cevher bulur, lavı kapatır), üretir, eritir, Nether'e seninle gelir, inşa eder.
// Komutlar: Kumanda eşyası (menü) · /scriptevent yardimci:gorev <görev> · köprü programı (Claude) üzerinden sohbet.
import * as mc from '@minecraft/server'
import { ActionFormData } from '@minecraft/server-ui'
import * as C from './cekirdek.js'
import { SEMALAR } from './semalar.js'

const { world, system, ItemStack } = mc
const TUR = 'yardimci:arkadas'
const AD = 'Yardımcı'
const bekle = (t) => new Promise((r) => system.runTimeout(r, Math.max(1, Math.round(t))))
const yuvarla = (v) => ({ x: Math.floor(v.x), y: Math.floor(v.y), z: Math.floor(v.z) })
const topla = (a, b) => ({ x: a.x + b.x, y: a.y + b.y, z: a.z + b.z })
const uzak = (a, b) => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z)
const mid = (p) => ({ x: p.x + 0.5, y: p.y, z: p.z + 0.5 })
class Iptal extends Error { constructor() { super('iptal'); this.iptal = true } }

// ---------- durum ----------
const DURUM = new Map() // entity.id -> { env, token, gorev, sahip, sonGuvenli }
function st(e) {
  let s = DURUM.get(e.id)
  if (!s) {
    let env = {}
    try { env = JSON.parse(e.getDynamicProperty('yardimci:env') || '{}') } catch {}
    s = { env, token: { iptal: false }, gorev: null, sahip: e.getDynamicProperty('yardimci:sahip') || null, sonGuvenli: null }
    DURUM.set(e.id, s)
  }
  return s
}
function kaydet(e) { try { e.setDynamicProperty('yardimci:env', JSON.stringify(st(e).env)) } catch {} durumEtiketi(e) }

function mesaj(metin) {
  try { world.sendMessage(`§b<${AD}>§r ${metin}`) } catch {}
}

function yardimcilar() {
  const l = []
  for (const d of ['overworld', 'nether', 'the_end']) {
    try { l.push(...world.getDimension(d).getEntities({ type: TUR })) } catch {}
  }
  return l
}

function sahibi(e) {
  const s = st(e)
  const oyuncular = world.getAllPlayers()
  return oyuncular.find((p) => p.name === s.sahip) || oyuncular.sort((a, b) => (a.dimension.id === e.dimension.id ? uzak(a.location, e.location) : 1e9) - (b.dimension.id === e.dimension.id ? uzak(b.location, e.location) : 1e9))[0]
}

function ozellik(e, ad, deger) { try { e.setProperty(`yardimci:${ad}`, deger) } catch {} }

// köprü (Claude) durumu okuyabilsin diye etiket: /tag @e[type=yardimci:arkadas] list
function durumEtiketi(e) {
  try {
    for (const t of e.getTags()) if (t.startsWith('yzd:')) e.removeTag(t)
    const s = st(e)
    const ozet = { hileler: 'acik', xray: xrayAcik() ? 'acik' : 'kapali', g: s.gorev || 'yok', c: Math.round(e.getComponent('minecraft:health')?.currentValue ?? 0), b: e.dimension.id.replace('minecraft:', ''), p: yuvarla(e.location), e: Object.fromEntries(Object.entries(s.env).sort((a, b) => b[1] - a[1]).slice(0, 18)) }
    e.addTag('yzd:' + encodeURIComponent(JSON.stringify(ozet)))
  } catch {}
}

// ---------- blok yardımcıları ----------
function blok(dim, p) { try { return dim.getBlock(p) } catch { return undefined } }
function tip(dim, p) { const b = blok(dim, p); return b ? b.typeId.replace('minecraft:', '') : 'unloaded' }
const BOS = /^(air|cave_air|light_block.*|short_grass|tall_grass|grass|fern|large_fern|dead_bush|.*flower.*|poppy|dandelion|.*tulip|azure_bluet|allium|oxeye_daisy|cornflower|lily_of_the_valley|torch|snow_layer|vine|seagrass|water|flowing_water|portal)$/
const SIVI_LAV = /^(lava|flowing_lava)$/
function bosMu(dim, p) { return BOS.test(tip(dim, p)) }
function lavMi(dim, p) { return SIVI_LAV.test(tip(dim, p)) }
function sagMi(dim, p) { const t = tip(dim, p); return t !== 'unloaded' && !BOS.test(t) && !SIVI_LAV.test(t) }

// '["a"=1,"b"=true,"c"="x"]' → { a: 1, b: true, c: 'x' }
function durumCoz(durum) {
  const o = {}
  for (const m of durum.matchAll(/"([^"]+)"\s*=\s*("([^"]*)"|true|false|-?\d+)/g)) o[m[1]] = m[3] !== undefined ? m[3] : m[2] === 'true' ? true : m[2] === 'false' ? false : Number(m[2])
  return o
}

/** Blok koyar. Önce oyunun betik API'sini kullanır (hileler kapalıyken de çalışır), en son çare komut. */
function koyKomut(dim, p, id, durum = '') {
  const tam = id.includes(':') ? id : `minecraft:${id}`
  if (durum && mc.BlockPermutation) {
    try { dim.getBlock(p).setPermutation(mc.BlockPermutation.resolve(tam, durumCoz(durum))); return true } catch {}
  }
  try { if (typeof dim.setBlockType === 'function') { dim.setBlockType(p, tam); return true } } catch {}
  try { const b = dim.getBlock(p); if (b && typeof b.setType === 'function') { b.setType(tam); return true } } catch {}
  try { dim.runCommand(`setblock ${p.x} ${p.y} ${p.z} ${tam}${durum ? ' ' + durum : ''}`); return tip(dim, p) !== 'air' || id === 'air' } catch { return false }
}

function ses(dim, id, p) {
  try { dim.playSound(id, p) } catch { try { dim.runCommand(`playsound ${id} @a ${p.x} ${p.y} ${p.z}`) } catch {} }
}

// ---------- görev çatısı ----------
function k(e) { if (st(e).token.iptal || !e.isValid?.()) throw new Iptal() }

function gorevBaslat(e, ad, args = {}) {
  const s = st(e)
  s.token.iptal = true
  ozellik(e, 'yuruyor', false); ozellik(e, 'kaziyor', false)
  if (ad === 'dur') { s.gorev = null; mesaj('Tamam, durdum.'); durumEtiketi(e); return }
  const f = GOREVLER[ad]
  if (!f) { mesaj(`"${ad}" diye bir görev bilmiyorum.`); return }
  const token = { iptal: false }
  s.token = token
  s.gorev = ad
  durumEtiketi(e)
  ;(async () => {
    try { await f(e, args) } catch (err) {
      if (!err.iptal && !token.iptal) { mesaj(`Takıldım: ${err.message}`); console.warn('[yardimci]', err, err.stack) }
    } finally {
      if (s.token === token) { s.gorev = null; ozellik(e, 'yuruyor', false); ozellik(e, 'kaziyor', false); try { kaydet(e) } catch {} }
    }
  })()
}

// ---------- hareket: adım adım yürür, gerekirse kazar, köprü kurar, lavı kapatır ----------
async function adimAt(e, hedef) {
  const bas = e.location
  const son = mid(hedef)
  const adim = 4
  ozellik(e, 'yuruyor', true)
  for (let i = 1; i <= adim; i++) {
    k(e)
    const t = i / adim
    try { e.teleport({ x: bas.x + (son.x - bas.x) * t, y: bas.y + (son.y - bas.y) * t, z: bas.z + (son.z - bas.z) * t }, { facingLocation: { x: son.x + (son.x - bas.x), y: son.y + 1.6, z: son.z + (son.z - bas.z) } }) } catch {}
    await bekle(2)
  }
}

async function lavKapat(e, p) {
  const s = st(e)
  const dim = e.dimension
  if (!lavMi(dim, p)) return true
  for (const m of C.KATEGORI.iskele) {
    if ((s.env[m] || 0) > 0) {
      C.harca(s.env, m, 1)
      koyKomut(dim, p, m)
      ses(dim, 'random.fizz', p)
      return true
    }
  }
  return false
}

/** Bir bloğu kazar (gerçekçi süre). Çevresinde lav varsa önce kapatır. */
async function kaz(e, p, { lavKontrol = true } = {}) {
  const s = st(e)
  const dim = e.dimension
  const b = blok(dim, p)
  if (!b || b.isAir || b.isLiquid) return true
  const id = b.typeId.replace('minecraft:', '')
  if (BOS.test(id) && !/grass|fern|flower|bush/.test(id)) return true
  const sure = C.kazmaSuresi(id, s.env)
  if (!isFinite(sure)) throw new Error(`${id} kazmak için daha iyi kazma lazım`)
  if (lavKontrol) {
    for (const d of [[1, 0, 0], [-1, 0, 0], [0, 0, 1], [0, 0, -1], [0, 1, 0]]) {
      const q = topla(p, { x: d[0], y: d[1], z: d[2] })
      if (lavMi(dim, q)) {
        if (!(await lavKapat(e, q))) throw new Error('lav var ve kapatacak taşım yok')
        if (Date.now() - (st(e).lavMesaj || 0) > 15000) { st(e).lavMesaj = Date.now(); mesaj('Lav gördüm, taşla kapattım.') }
      }
    }
  }
  try { e.teleport(e.location, { facingLocation: mid({ x: p.x, y: p.y + 0.5, z: p.z }) }) } catch {}
  ozellik(e, 'kaziyor', true)
  const sesTur = /log|planks|wood|stem/.test(id) ? 'dig.wood' : /dirt|grass|sand|gravel|farmland/.test(id) ? 'dig.gravel' : 'dig.stone'
  for (let t = 0; t < sure; t += 5) { k(e); if (t % 10 === 0) ses(dim, sesTur, p); await bekle(Math.min(5, sure - t)) }
  ozellik(e, 'kaziyor', false)
  const dus = C.blokBilgi(id).dus
  koyKomut(dim, p, 'air')
  ses(dim, sesTur, p)
  if (dus) C.ekle(s.env, dus, /lapis/.test(dus) ? 5 : /redstone/.test(dus) ? 4 : dus === 'gold_nugget' ? 3 : 1)
  return true
}

function zeminVar(dim, p) { return sagMi(dim, { x: p.x, y: p.y - 1, z: p.z }) }

async function koprule(e, p) {
  const s = st(e)
  if (sagMi(e.dimension, p)) return true
  for (const m of C.KATEGORI.iskele) if ((s.env[m] || 0) > 0) { C.harca(s.env, m, 1); await lavKapat(e, p); koyKomut(e.dimension, p, m); ses(e.dimension, 'dig.stone', p); return true }
  return false
}

/** Hedefe yürür; engel kazar, uçurumda köprü kurar, lava girmez. */
async function yuru(e, hedef, menzil = 1.5, { maxAdim = 600 } = {}) {
  const dim = e.dimension
  let takilma = 0
  for (let i = 0; i < maxAdim; i++) {
    k(e)
    const c = yuvarla(e.location)
    const hedefY = yuvarla(hedef)
    if (uzak(e.location, mid(hedefY)) <= menzil + 0.6) { ozellik(e, 'yuruyor', false); return true }
    const dx = hedefY.x - c.x, dz = hedefY.z - c.z, dy = hedefY.y - c.y
    // yön seç: büyük eksen önce, takıldıysa diğer eksen
    let yon
    const yatay = Math.abs(dx) + Math.abs(dz)
    if (yatay === 0) yon = { x: 0, z: 0 }
    else if ((Math.abs(dx) >= Math.abs(dz)) !== (takilma % 2 === 1) && dx !== 0) yon = { x: Math.sign(dx), z: 0 }
    else if (dz !== 0) yon = { x: 0, z: Math.sign(dz) }
    else yon = { x: Math.sign(dx), z: 0 }

    if (yon.x === 0 && yon.z === 0) {
      // tam üstünde/altında
      if (dy < 0) { await kaz(e, { x: c.x, y: c.y - 1, z: c.z }); if (lavMi(dim, { x: c.x, y: c.y - 2, z: c.z })) await lavKapat(e, { x: c.x, y: c.y - 2, z: c.z }); await adimAt(e, { x: c.x, y: c.y - 1, z: c.z }); continue }
      if (dy > 0) { await kaz(e, { x: c.x, y: c.y + 2, z: c.z }); await adimAt(e, { x: c.x, y: c.y + 1, z: c.z }); await koprule(e, c); continue }
    }

    // merdiven: aşağı / yukarı / düz
    const dikey = yatay <= Math.abs(dy) + 1 ? Math.sign(dy) : (Math.abs(dy) > 2 ? Math.sign(dy) : 0)
    let n = { x: c.x + yon.x, y: c.y + dikey, z: c.z + yon.z }
    if (dikey === 0 && sagMi(dim, n) && bosMu(dim, topla(n, { x: 0, y: 1, z: 0 })) && bosMu(dim, topla(n, { x: 0, y: 2, z: 0 })) && bosMu(dim, topla(c, { x: 0, y: 2, z: 0 }))) n = topla(n, { x: 0, y: 1, z: 0 }) // basamak çık
    if (lavMi(dim, n) || lavMi(dim, topla(n, { x: 0, y: 1, z: 0 })) || lavMi(dim, topla(n, { x: 0, y: -1, z: 0 }))) {
      const ok1 = await lavKapat(e, n), ok2 = await lavKapat(e, topla(n, { x: 0, y: 1, z: 0 })), ok3 = await lavKapat(e, topla(n, { x: 0, y: -1, z: 0 }))
      if (!ok1 || !ok2 || !ok3) { takilma++; if (takilma > 6) throw new Error('önüm lav, geçemiyorum'); continue }
    }
    try {
      if (n.y > c.y) await kaz(e, topla(c, { x: 0, y: 2, z: 0 }))
      await kaz(e, n)
      await kaz(e, topla(n, { x: 0, y: 1, z: 0 }))
    } catch (err) {
      if (err.iptal) throw err
      takilma++
      if (takilma > 8) throw err
      continue
    }
    // zemin yoksa: 3 bloğa kadar düş, değilse köprü kur
    if (!zeminVar(dim, n)) {
      let dusme = 0
      while (dusme < 4 && !sagMi(dim, { x: n.x, y: n.y - 1 - dusme, z: n.z }) && !lavMi(dim, { x: n.x, y: n.y - 1 - dusme, z: n.z })) dusme++
      if (dusme <= 3 && sagMi(dim, { x: n.x, y: n.y - 1 - dusme, z: n.z })) n = { x: n.x, y: n.y - dusme, z: n.z }
      else if (!(await koprule(e, { x: n.x, y: n.y - 1, z: n.z }))) { takilma++; if (takilma > 8) throw new Error('köprü kuracak bloğum yok'); continue }
    }
    takilma = 0
    await adimAt(e, n)
    if (zeminVar(dim, n)) st(e).sonGuvenli = { ...n, d: dim.id }
  }
  ozellik(e, 'yuruyor', false)
  throw new Error('yol çok uzun sürdü')
}

// ---------- X-RAY ----------
// Kural: tek başına oynadığın dünyada AÇIK. Dünyada başka oyuncu varsa (çok oyunculu / sunucu) KAPALI, hile olmasın.
// Kumandadan elle de seçilebilir: otomatik / açık / kapalı.
const GIZLI = /_ore$|ancient_debris|obsidian|^chest$|^trapped_chest$|^barrel$|mob_spawner|gilded_blackstone|amethyst|budding/
function xrayAyar() { try { return world.getDynamicProperty('yardimci:xray') || 'otomatik' } catch { return 'otomatik' } }
function xrayAcik() {
  const a = xrayAyar()
  if (a === 'acik') return true
  if (a === 'kapali') return false
  return world.getAllPlayers().length <= 1
}
const goz = () => (xrayAcik() ? 'X-ray ile' : 'Gözümle')
const SEFFAF = /leaves|glass|fence|torch|ladder|vine|water|portal/
/** Açıkta (bir yüzü havaya/suya bakıyor) ve yardımcının gözünden görünüyor mu */
function gorunur(e, p) {
  const dim = e.dimension
  const acik = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]].some(([x, y, z]) => { const t = tip(dim, { x: p.x + x, y: p.y + y, z: p.z + z }); return BOS.test(t) || SEFFAF.test(t) })
  if (!acik) return false
  const goz0 = { x: e.location.x, y: e.location.y + 1.6, z: e.location.z }
  const hedef = { x: p.x + 0.5, y: p.y + 0.5, z: p.z + 0.5 }
  const L = uzak(goz0, hedef)
  if (L > 24) return false
  for (let t = 0.3; t < L - 0.8; t += 0.3) {
    const q = yuvarla({ x: goz0.x + ((hedef.x - goz0.x) * t) / L, y: goz0.y + ((hedef.y - goz0.y) * t) / L, z: goz0.z + ((hedef.z - goz0.z) * t) / L })
    if (q.x === p.x && q.y === p.y && q.z === p.z) return true
    const ty = tip(dim, q)
    if (!BOS.test(ty) && !SEFFAF.test(ty)) return false
  }
  return true
}

/** Blok arar. X-ray açıkken yeraltını görür; kapalıyken cevher/sandık gibi şeyleri sadece gerçekten görüyorsa bulur. */
async function xray(e, tipler, secenek = {}) {
  const acik = xrayAcik()
  const sonuc = await tara(e, tipler, acik ? secenek : { ...secenek, adet: 64, yaricap: Math.min(secenek.yaricap ?? 16, 16), yMin: Math.max(secenek.yMin ?? -64, Math.floor(e.location.y) - 16), yMax: Math.min(secenek.yMax ?? 320, Math.floor(e.location.y) + 16) })
  if (acik) return sonuc
  return sonuc.filter((p) => !GIZLI.test(tip(e.dimension, p)) || gorunur(e, p)).slice(0, secenek.adet ?? 8)
}

async function tara(e, tipler, { yaricap = 16, yMin = -64, yMax = 320, adet = 8 } = {}) {
  const dim = e.dimension
  const c = yuvarla(e.location)
  const set = new Set(tipler.map((t) => (t.includes(':') ? t : `minecraft:${t}`)))
  const bulunan = []
  const alt = Math.max(yMin, dim.heightRange?.min ?? -64), ust = Math.min(yMax, (dim.heightRange?.max ?? 320) - 1)
  // hızlı yol: getBlocks (yeni sürümler)
  if (typeof dim.getBlocks === 'function' && mc.BlockVolume) {
    try {
      for (let y0 = alt; y0 <= ust; y0 += 32) {
        const hacim = new mc.BlockVolume({ x: c.x - yaricap, y: y0, z: c.z - yaricap }, { x: c.x + yaricap, y: Math.min(ust, y0 + 31), z: c.z + yaricap })
        const sonuc = dim.getBlocks(hacim, { includeTypes: [...set] }, true)
        for (const p of sonuc.getBlockLocationIterator()) bulunan.push({ ...p })
        await bekle(1)
      }
      bulunan.sort((a, b) => uzak(a, c) - uzak(b, c))
      return bulunan.slice(0, adet)
    } catch { bulunan.length = 0 }
  }
  // yavaş yol: blok blok, kare kare dışa doğru
  let sayac = 0
  for (let r = 0; r <= yaricap; r += 4) {
    for (let x = c.x - r; x <= c.x + r; x++) for (let z = c.z - r; z <= c.z + r; z++) {
      if (Math.max(Math.abs(x - c.x), Math.abs(z - c.z)) < r - 3) continue
      for (let y = alt; y <= ust; y++) {
        const b = blok(dim, { x, y, z })
        if (b && set.has(b.typeId)) bulunan.push({ x, y, z })
        if (++sayac % 3000 === 0) { await bekle(1); k(e) }
      }
    }
    if (bulunan.length >= adet) break
  }
  bulunan.sort((a, b) => uzak(a, c) - uzak(b, c))
  return bulunan.slice(0, adet)
}

/** cevherleri bulup kazar. hedef: envanterde toplam kaç tane olsun */
async function cevherTopla(e, tipler, esya, hedef, { yaricap = 16, yMin, yMax, hedefY, gezinti = true } = {}) {
  const s = st(e)
  let bos = 0, indimMesaji = false
  while ((s.env[esya] || 0) < hedef) {
    k(e)
    const bul = await xray(e, tipler, { yaricap, yMin, yMax, adet: 6 })
    if (!bul.length) {
      const acik = xrayAcik()
      if (!gezinti || ++bos > (acik ? 4 : 30)) throw new Error(`yakında ${esya} bulamadım`)
      const c = yuvarla(e.location)
      const hy = hedefY ?? (yMin !== undefined && yMax !== undefined ? Math.round((Math.max(yMin, -60) + Math.min(yMax, 120)) / 2) : c.y)
      if (!acik && Math.abs(c.y - hy) > 4) {
        if (!indimMesaji) { mesaj(`${esya} için y=${hy} seviyesine merdiven kazarak iniyorum (x-ray kapalı).`); indimMesaji = true }
        const fark = Math.abs(c.y - hy)
        await yuru(e, { x: c.x + Math.min(fark, 24), y: c.y + Math.sign(hy - c.y) * Math.min(fark, 24), z: c.z }, 1.5, { maxAdim: 200 })
        continue
      }
      if (!acik) {
        // dal madenciliği: düz tünel kaz, açılan duvarlarda cevher gör
        const yon = [[1, 0], [0, 1], [-1, 0], [0, -1]][bos % 4]
        await yuru(e, { x: c.x + yon[0] * 16, y: c.y, z: c.z + yon[1] * 16 }, 1, { maxAdim: 80 })
        continue
      }
      mesaj(`Burada ${esya} yok, biraz ileride bakıyorum.`)
      const aci = Math.random() * Math.PI * 2
      await yuru(e, { x: c.x + Math.round(Math.cos(aci) * 20), y: c.y, z: c.z + Math.round(Math.sin(aci) * 20) }, 2)
      continue
    }
    bos = 0
    const p = bul[0]
    await yuru(e, p, 1.8)
    await kaz(e, p)
    kaydet(e)
  }
}

// ---------- üretim ----------
async function masaYanina(e, blokAd) {
  const yakin = await xray(e, [blokAd], { yaricap: 6, yMin: Math.floor(e.location.y) - 4, yMax: Math.floor(e.location.y) + 4, adet: 1 })
  if (yakin.length) { await yuru(e, yakin[0], 2.5); return yakin[0] }
  return null
}

async function yereKoy(e, ad) {
  const s = st(e)
  if (!C.harca(s.env, ad, 1)) throw new Error(`${ad} yok`)
  const dim = e.dimension
  const c = yuvarla(e.location)
  const benim = (p) => p.x === c.x && p.z === c.z && (p.y === c.y || p.y === c.y + 1)
  const adaylar = []
  for (const dy of [0, -1, 1]) for (const d of [[1, 0], [0, 1], [-1, 0], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1], [2, 0], [0, 2], [-2, 0], [0, -2]]) adaylar.push({ x: c.x + d[0], y: c.y + dy, z: c.z + d[1] })
  let yer = adaylar.find((p) => !benim(p) && bosMu(dim, p) && !/water/.test(tip(dim, p)) && zeminVar(dim, p))
  if (!yer) {
    // tünelde/çukurdaysa: yandaki duvarı oyup oraya koy
    for (const d of [[1, 0], [0, 1], [-1, 0], [0, -1]]) {
      const p = { x: c.x + d[0], y: c.y, z: c.z + d[1] }
      if (!zeminVar(dim, p) || lavMi(dim, p)) continue
      try { await kaz(e, p); yer = p; break } catch (err) { if (err.iptal) throw err }
    }
  }
  if (!yer) { C.ekle(s.env, ad, 1); throw new Error(`${ad} koyacak yer yok`) }
  koyKomut(dim, yer, ad)
  ses(dim, 'dig.wood', yer)
  return yer
}

/** Koyduğu masayı/fırını işi bitince geri alır (oyuncular gibi yanında taşır). */
async function geriAl(e, p, ad) {
  if (!p || tip(e.dimension, p).replace('lit_', '') !== ad) return
  const s = st(e)
  try { await kaz(e, p, { lavKontrol: false }) } catch (err) { if (err.iptal) throw err; return }
  if (ad === 'furnace' && s.env.lit_furnace) { C.harca(s.env, 'lit_furnace', s.env.lit_furnace); C.ekle(s.env, 'furnace', 1) }
}

async function kalasYap(e, enAz) {
  const s = st(e)
  while (C.say(s.env, 'kalas') < enAz) {
    const kutuk = C.KUTUK.find((kk) => (s.env[kk] || 0) > 0)
    if (!kutuk) { await odunTopla(e, { adet: Math.ceil((enAz - C.say(s.env, 'kalas')) / 4) }); continue }
    C.harca(s.env, kutuk, 1)
    C.ekle(s.env, C.kalasAdi(kutuk), 4)
  }
}

async function uret(e, ad, adet = 1) {
  const s = st(e)
  const t = C.TARIFLER[ad]
  if (!t) throw new Error(`${ad} tarifini bilmiyorum`)
  while ((s.env[ad] || 0) < adet) {
    k(e)
    const eksik = C.eksikler(s.env, ad)
    for (const [g, n] of Object.entries(eksik)) {
      if (g === 'kalas') await kalasYap(e, C.say(s.env, 'kalas') + n)
      else if (g === 'stick') await uret(e, 'stick', (s.env.stick || 0) + n)
      else if (C.TARIFLER[g]) await uret(e, g, (s.env[g] || 0) + n)
      else throw new Error(`${ad} için ${n} ${g} eksik`)
    }
    let koydugum = null
    if (t.masa && !(await masaYanina(e, 'crafting_table'))) {
      if (!(s.env.crafting_table)) await uret(e, 'crafting_table', 1)
      koydugum = await yereKoy(e, 'crafting_table')
    }
    ozellik(e, 'kaziyor', true)
    await bekle(20)
    ozellik(e, 'kaziyor', false)
    if (!C.uret(s.env, ad, 1)) throw new Error(`${ad} üretemedim`)
    if (koydugum) await geriAl(e, koydugum, 'crafting_table')
  }
  kaydet(e)
}

async function erit(e, girdi, adet) {
  const s = st(e)
  adet = Math.min(adet, s.env[girdi] || 0)
  if (adet <= 0) return
  const cikti = C.ERIT[girdi]
  if (C.yakitGucu(s.env) < adet) {
    try { await cevherTopla(e, ['coal_ore', 'deepslate_coal_ore'], 'coal', (s.env.coal || 0) + Math.ceil(adet / 8), { gezinti: false }) } catch (err) { if (err.iptal) throw err; await kalasYap(e, Math.ceil(adet / 1.5)) }
  }
  let firinim = null
  if (!(await masaYanina(e, 'furnace')) && !(await masaYanina(e, 'lit_furnace'))) {
    if (!s.env.furnace) await uret(e, 'furnace', 1)
    firinim = await yereKoy(e, 'furnace')
  }
  mesaj(`${adet} ${girdi} fırına koydum, ${cikti} oluyor...`)
  let yanan = 0 // fırında kalan yakıt (kaç eşyalık)
  for (let i = 0; i < adet; i++) {
    k(e)
    if (yanan < 1) { yanan += C.yakitAl(s.env); if (yanan < 1) { await geriAl(e, firinim, 'furnace'); throw new Error('yakıtım bitti') } }
    yanan -= 1
    await bekle(200) // gerçek oyundaki gibi 10 saniye
    C.harca(s.env, girdi, 1)
    C.ekle(s.env, cikti, 1)
  }
  await geriAl(e, firinim, 'furnace')
  kaydet(e)
}

// ---------- görevler ----------
/** Yeraltındaysa oyuncunun yanına (yüzeye) döner; merdiven kazarak çıkar. */
async function yuzeyeCik(e) {
  const o = sahibi(e)
  if (o && o.dimension.id === e.dimension.id) {
    if (uzak(o.location, e.location) > 6) { mesaj('Yukarı, yanına çıkıyorum.'); await yuru(e, o.location, 3, { maxAdim: 1500 }) }
    return
  }
  const c = yuvarla(e.location)
  if (c.y < 60) await yuru(e, { x: c.x + 40, y: 70, z: c.z }, 3, { maxAdim: 1500 })
}

async function odunTopla(e, { adet = 16 } = {}) {
  const s = st(e)
  if (e.location.y < 55) await yuzeyeCik(e)
  const hedef = C.say(s.env, 'kutuk') + adet
  let bos = 0
  while (C.say(s.env, 'kutuk') < hedef) {
    k(e)
    const c = yuvarla(e.location)
    const bul = await xray(e, C.KUTUK, { yaricap: 24, yMin: c.y - 8, yMax: c.y + 24, adet: 4 })
    if (!bul.length) {
      if (++bos > 4) throw new Error('etrafta ağaç yok')
      mesaj('Ağaç arıyorum...')
      const aci = Math.random() * Math.PI * 2
      await yuru(e, { x: c.x + Math.round(Math.cos(aci) * 24), y: c.y, z: c.z + Math.round(Math.sin(aci) * 24) }, 2)
      continue
    }
    bos = 0
    // ağacın dibine git, gövdeyi aşağıdan yukarı kes
    let p = bul[0]
    while (sagMi(e.dimension, { x: p.x, y: p.y - 1, z: p.z }) && C.KUTUK.includes(tip(e.dimension, { x: p.x, y: p.y - 1, z: p.z }))) p = { x: p.x, y: p.y - 1, z: p.z }
    await yuru(e, { x: p.x, y: p.y, z: p.z }, 1.8)
    for (let y = p.y; y < p.y + 12; y++) {
      const q = { x: p.x, y, z: p.z }
      if (!C.KUTUK.includes(tip(e.dimension, q))) break
      if (y > p.y + 3) break // yüksek dallar kalsın, gerçek oyuncu gibi
      await kaz(e, q)
    }
    kaydet(e)
  }
}

async function ahsapAletler(e) {
  const s = st(e)
  if (C.kazmaSeviyesi(s.env) >= 1) return
  await kalasYap(e, 12)
  await uret(e, 'crafting_table', 1)
  await uret(e, 'wooden_pickaxe', 1)
  mesaj('Tahta kazmam hazır.')
}

async function tasAletler(e) {
  const s = st(e)
  if (C.kazmaSeviyesi(s.env) >= 2 && s.env.furnace) return
  await ahsapAletler(e)
  if (C.say(s.env, 'tas') < 24) {
    mesaj('Taş kazıyorum.')
    const c = yuvarla(e.location)
    await cevherTopla(e, ['stone', 'cobblestone', 'deepslate'], 'cobblestone', (s.env.cobblestone || 0) + 24 - C.say(s.env, 'tas'), { yaricap: 10, yMin: c.y - 12, yMax: c.y + 4 })
  }
  for (const a of ['stone_pickaxe', 'stone_sword', 'stone_axe']) await uret(e, a, 1)
  if (!s.env.furnace) await uret(e, 'furnace', 1)
  mesaj('Taş aletler ve fırın tamam.')
}

async function demirAletler(e) {
  const s = st(e)
  if (C.kazmaSeviyesi(s.env) >= 3 && s.env.bucket) return
  await tasAletler(e)
  if (C.say(s.env, 'komur') < 8) {
    mesaj(`${goz()} kömür arıyorum.`)
    await cevherTopla(e, ['coal_ore', 'deepslate_coal_ore'], 'coal', 8, { yaricap: 16, yMin: -20, yMax: 140, hedefY: 40 })
  }
  if ((s.env.iron_ingot || 0) + (s.env.raw_iron || 0) < 14) {
    mesaj('Demir avına çıkıyorum, lav görürsem kapatacağım.')
    await cevherTopla(e, ['iron_ore', 'deepslate_iron_ore'], 'raw_iron', 14 - (s.env.iron_ingot || 0), { yaricap: 16, yMin: -40, yMax: 72, hedefY: 16 })
  }
  try { await cevherTopla(e, ['gold_ore', 'deepslate_gold_ore'], 'raw_gold', 4, { yaricap: 10, yMin: -64, yMax: 32, gezinti: false }) } catch (err) { if (err.iptal) throw err }
  if (s.env.raw_iron) await erit(e, 'raw_iron', s.env.raw_iron)
  if (s.env.raw_gold) await erit(e, 'raw_gold', s.env.raw_gold)
  for (const a of ['iron_pickaxe', 'iron_sword', 'bucket']) await uret(e, a, 1)
  mesaj('Demir kazma, kılıç ve kova hazır!')
}

async function elmas(e) {
  const s = st(e)
  if (C.kazmaSeviyesi(s.env) >= 4) { mesaj('Zaten elmas kazmam var.'); return }
  await demirAletler(e)
  mesaj(xrayAcik() ? 'Elmasa iniyorum: x-ray açık, lav görürsem taşla kapatıyorum.' : 'Elmas için derine iniyorum, dal madenciliği yapacağım. Lav görürsem taşla kapatırım.')
  await cevherTopla(e, ['diamond_ore', 'deepslate_diamond_ore'], 'diamond', 5, { yaricap: 16, yMin: -64, yMax: 16, hedefY: -58 })
  await uret(e, 'diamond_pickaxe', 1)
  if ((s.env.diamond || 0) >= 2) await uret(e, 'diamond_sword', 1)
  mesaj(`Elmas kazma yaptım! ${s.env.diamond || 0} elmas daha var.`)
}

async function obsidyen(e, adet = 10) {
  const s = st(e)
  if (C.kazmaSeviyesi(s.env) < 4) await elmas(e)
  if (!s.env.bucket && !s.env.water_bucket) await uret(e, 'bucket', 1)
  let tur = 0
  while ((s.env.obsidian || 0) < adet) {
    k(e)
    if (tur++ > 10) throw new Error('yeterince obsidyen yapamadım')
    const hazir = await xray(e, ['obsidian'], { yaricap: 16, adet: 1 })
    if (hazir.length) { await yuru(e, hazir[0], 1.8); await kaz(e, hazir[0]); continue }
    if (!s.env.water_bucket) {
      const su = await xray(e, ['water'], { yaricap: 24, adet: 1, yMin: Math.floor(e.location.y) - 30, yMax: Math.floor(e.location.y) + 20 })
      if (!su.length) throw new Error('kovayı dolduracak su bulamadım')
      await yuru(e, su[0], 2)
      C.harca(s.env, 'bucket', 1); C.ekle(s.env, 'water_bucket', 1)
      ses(e.dimension, 'bucket.fill_water', su[0])
    }
    const lavlar = await xray(e, ['lava'], { yaricap: 16, adet: 12, yMin: -64, yMax: 40 })
    const kaynak = lavlar.find((p) => { try { return blok(e.dimension, p).permutation.getState('liquid_depth') === 0 } catch { return true } })
    if (!kaynak) throw new Error('yakında lav gölü yok')
    mesaj('Lav gölüne su döküp obsidyen yapıyorum.')
    await yuru(e, { x: kaynak.x, y: kaynak.y + 1, z: kaynak.z }, 2.5)
    ses(e.dimension, 'bucket.empty_water', kaynak)
    // su akar: yakındaki lav kaynakları obsidyene döner
    let donen = 0
    for (const p of lavlar) {
      if (uzak(p, kaynak) > 3) continue
      let derin = 0
      try { derin = blok(e.dimension, p).permutation.getState('liquid_depth') } catch {}
      koyKomut(e.dimension, p, derin === 0 ? 'obsidian' : 'cobblestone')
      ses(e.dimension, 'random.fizz', p)
      donen++
      await bekle(6)
    }
    C.harca(s.env, 'water_bucket', 1); C.ekle(s.env, 'bucket', 1)
    if (!donen) continue
    const obs = await xray(e, ['obsidian'], { yaricap: 6, adet: 12 })
    for (const p of obs) {
      if ((s.env.obsidian || 0) >= adet) break
      await yuru(e, p, 1.8)
      await kaz(e, p)
    }
    kaydet(e)
  }
}

async function cakmak(e) {
  const s = st(e)
  if (s.env.flint_and_steel) return
  let deneme = 0
  while (!s.env.flint && deneme++ < 40) {
    k(e)
    if (s.env.gravel) {
      // çakılı yere koy, tekrar kaz
      const p = await yereKoy(e, 'gravel')
      await kaz(e, p)
      continue
    }
    if (deneme === 1) await yuzeyeCik(e)
    const c = yuvarla(e.location)
    await cevherTopla(e, ['gravel'], 'gravel', 1, { yaricap: 20, yMin: c.y - 30, yMax: c.y + 30 })
  }
  if (!s.env.flint) throw new Error('çakmaktaşı çıkmadı')
  if (!s.env.iron_ingot) throw new Error('çakmak için demir lazım')
  await uret(e, 'flint_and_steel', 1)
}

async function portalKur(e) {
  const s = st(e)
  await obsidyen(e, 10)
  await cakmak(e)
  // Nether'de lazım olacaklar: masa, fırın, iskele taşı
  if (!s.env.crafting_table) await uret(e, 'crafting_table', 1)
  if (!s.env.furnace) await uret(e, 'furnace', 1)
  // yüzeye çık, oyuncunun yanına
  const o = sahibi(e)
  if (o && o.dimension.id === e.dimension.id) { mesaj('Portalı senin yanına kuracağım.'); await yuru(e, o.location, 3) }
  mesaj('Portalı kuruyorum.')
  const c = yuvarla(e.location)
  const b = { x: c.x + 2, y: c.y, z: c.z }
  const dim = e.dimension
  for (let x = 0; x < 4; x++) for (let y = 0; y < 5; y++) { const p = { x: b.x + x, y: b.y + y, z: b.z }; if (!bosMu(dim, p)) await kaz(e, p) }
  for (let x = 0; x < 4; x++) await koprule(e, { x: b.x + x, y: b.y - 1, z: b.z })
  const cerceve = [[1, 0], [2, 0], [0, 1], [0, 2], [0, 3], [3, 1], [3, 2], [3, 3], [1, 4], [2, 4], [0, 0], [3, 0], [0, 4], [3, 4]]
  for (const [x, y] of cerceve) {
    k(e)
    const kose = (x === 0 || x === 3) && (y === 0 || y === 4)
    if (kose) continue
    if (!C.harca(s.env, 'obsidian', 1)) throw new Error('obsidyen yetmedi')
    koyKomut(dim, { x: b.x + x, y: b.y + y, z: b.z }, 'obsidian')
    ses(dim, 'dig.stone', { x: b.x + x, y: b.y + y, z: b.z })
    await bekle(8)
  }
  ses(dim, 'fire.ignite', { x: b.x + 1, y: b.y + 1, z: b.z })
  for (let x = 1; x <= 2; x++) for (let y = 1; y <= 3; y++) koyKomut(dim, { x: b.x + x, y: b.y + y, z: b.z }, 'portal', '["portal_axis"="x"]')
  if (tip(dim, { x: b.x + 1, y: b.y + 1, z: b.z }) !== 'portal') koyKomut(dim, { x: b.x + 1, y: b.y + 1, z: b.z }, 'fire')
  s.env.flint_and_steel = Math.max(1, s.env.flint_and_steel || 1)
  kaydet(e)
  mesaj('Nether portalı açıldı! Sen girince ben de peşinden geleceğim.')
}

async function netherGit(e) {
  if (e.dimension.id === 'minecraft:nether') { mesaj('Zaten Nether\'deyiz.'); return }
  const portal = await xray(e, ['portal'], { yaricap: 16, yMin: Math.floor(e.location.y) - 16, yMax: Math.floor(e.location.y) + 16, adet: 1 })
  if (!portal.length) await portalKur(e)
  mesaj('Portala gir, seninle beraber geçiyorum.')
  // sahibi Nether'e geçince takip döngüsü bizi de taşır
  await takipEt(e, { sure: 20 * 60 * 10, bitir: () => e.dimension.id === 'minecraft:nether' })
  if (e.dimension.id !== 'minecraft:nether') throw new Error('portal hazır ama sen girmedin; girince bana tekrar "netherite" de')
}

async function netherite(e) {
  const s = st(e)
  if (s.env.netherite_pickaxe) { mesaj('Netherite kazmam zaten var!'); return }
  if (C.kazmaSeviyesi(s.env) < 4) await elmas(e)
  if (e.dimension.id !== 'minecraft:nether') await netherGit(e)
  mesaj(`Ancient debris arıyorum (${xrayAcik() ? 'x-ray açık' : 'x-ray kapalı, tünel kazacağım'}). Nether'de lav çok, dikkatli kazıyorum.`)
  const lazim = Math.max(0, 4 - (s.env.netherite_scrap || 0) - (s.env.netherite_ingot || 0) * 4)
  if (lazim > 0) await cevherTopla(e, ['ancient_debris'], 'ancient_debris', lazim, { yaricap: 16, yMin: 8, yMax: 24, hedefY: 15 })
  if (s.env.ancient_debris) await erit(e, 'ancient_debris', s.env.ancient_debris)
  if (!s.env.netherite_ingot) {
    if ((s.env.gold_ingot || 0) < 4 && s.env.raw_gold) await erit(e, 'raw_gold', s.env.raw_gold)
    while ((s.env.gold_ingot || 0) < 4) {
      k(e)
      await cevherTopla(e, ['nether_gold_ore'], 'gold_nugget', 9, { yaricap: 16, yMin: 10, yMax: 117 })
      await uret(e, 'gold_ingot', (s.env.gold_ingot || 0) + 1)
    }
    await uret(e, 'netherite_ingot', 1)
  }
  mesaj('Netherite külçesi hazır!')
  if (!s.env.netherite_upgrade_smithing_template) {
    mesaj('Netherite yükseltme şablonu lazım (bastion sandıklarında çıkar). Bulursan yanıma at, kazmayı yükseltirim. Bekliyorum...')
    for (let t = 0; t < 20 * 60 * 5 && !s.env.netherite_upgrade_smithing_template; t += 40) { k(e); esyaTopla(e); await bekle(40); esyaTopla(e) }
    if (!s.env.netherite_upgrade_smithing_template) { mesaj('Şablon gelmedi; külçe bende duruyor.'); return }
  }
  if (!(await masaYanina(e, 'smithing_table'))) {
    if (!s.env.smithing_table) await uret(e, 'smithing_table', 1)
    await yereKoy(e, 'smithing_table')
  }
  await bekle(40)
  C.harca(s.env, 'netherite_upgrade_smithing_template', 1); C.harca(s.env, 'netherite_ingot', 1); C.harca(s.env, 'diamond_pickaxe', 1)
  C.ekle(s.env, 'netherite_pickaxe', 1)
  ses(e.dimension, 'smithing_table.use', yuvarla(e.location))
  kaydet(e)
  mesaj('NETHERITE KAZMA TAMAM!')
}

async function hepsiniYap(e) {
  for (const [f, ad] of [[ahsapAletler, 'Tahta aletler'], [tasAletler, 'Taş aletler'], [demirAletler, 'Demir'], [elmas, 'Elmas'], [netherGit, 'Nether'], [netherite, 'Netherite']]) {
    mesaj(`Aşama: ${ad}`)
    await f(e)
  }
}

async function gel(e) {
  const o = sahibi(e)
  if (!o) throw new Error('kimseyi göremiyorum')
  if (o.dimension.id !== e.dimension.id || uzak(o.location, e.location) > 64) { e.teleport(o.location, { dimension: o.dimension }); mesaj('Işınlandım, buradayım!'); return }
  await yuru(e, o.location, 2.5)
  mesaj('Geldim!')
}

async function takipEt(e, { sure = Infinity, bitir = null } = {}) {
  for (let t = 0; t < sure; t += 10) {
    k(e)
    if (bitir && bitir()) return
    const o = sahibi(e)
    if (o) {
      if (o.dimension.id !== e.dimension.id || uzak(o.location, e.location) > 48) {
        try { e.teleport(topla(o.location, { x: 1, y: 0, z: 1 }), { dimension: o.dimension }) } catch {}
        await bekle(20)
      } else if (uzak(o.location, e.location) > 4) {
        try { await yuru(e, o.location, 2.5, { maxAdim: 12 }) } catch (err) { if (err.iptal) throw err }
      }
    }
    await bekle(10)
  }
}

function insaModu() { try { return world.getDynamicProperty('yardimci:insa') || 'gercekci' } catch { return 'gercekci' } }

/** Komut (hızlı) modu: malzeme toplamadan, ama bir anda değil — kat kat, blok blok kurar. */
async function komutlaInsa(e, t) {
  const bloklar = t.bloklar
  await yuzeyeCik(e)
  const o = sahibi(e)
  const merkez = yuvarla(o && o.dimension.id === e.dimension.id ? o.location : e.location)
  const b0 = { x: merkez.x + 3, y: merkez.y, z: merkez.z + 3 }
  const xs = bloklar.map((b) => b.x), zs = bloklar.map((b) => b.z)
  const minX = Math.min(...xs), maxX = Math.max(...xs), minZ = Math.min(...zs), maxZ = Math.max(...zs), maxY = Math.max(...bloklar.map((b) => b.y))
  mesaj(`Komut modu: ${t.ad} yapısını kat kat kuruyorum (${bloklar.length} blok).`)
  for (let y = maxY + 2; y >= 0; y--) {
    k(e)
    for (let x = minX; x <= maxX; x++) for (let z = minZ; z <= maxZ; z++) { const q = { x: b0.x + x, y: b0.y + y, z: b0.z + z }; if (tip(e.dimension, q) !== 'air') koyKomut(e.dimension, q, 'air') }
    await bekle(3)
  }
  let konan = 0, rapor = 0, sonKat = -1
  for (const b of bloklar) {
    k(e)
    const p = { x: b0.x + b.x, y: b0.y + b.y, z: b0.z + b.z }
    if (b.y !== sonKat) { sonKat = b.y; try { e.teleport({ x: b0.x + minX - 1.5, y: b0.y + Math.max(0, b.y - 1), z: b0.z + (minZ + maxZ) / 2 }, { facingLocation: mid(p) }) } catch {} }
    try { e.teleport(e.location, { facingLocation: mid(p) }) } catch {}
    ozellik(e, 'kaziyor', true)
    if (!koyKomut(e.dimension, p, b.bedrock || b.ad, b.durum || '') && b.yedek) koyKomut(e.dimension, p, b.yedek)
    await bekle(2)
    konan++
    const yuzde = Math.floor((konan / bloklar.length) * 100)
    if (yuzde >= rapor + 25) { rapor = yuzde; mesaj(`İnşaat %${yuzde}`) }
  }
  ozellik(e, 'kaziyor', false)
  mesaj(`Bitti! ${t.ad} hazır (${konan} blok).`)
}

async function insaEt(e, { sema = 'kulube' } = {}) {
  const s = st(e)
  const t = SEMALAR[sema] || SEMALAR.kulube
  if (!t) throw new Error('şema yok')
  if (insaModu() === 'komut') return komutlaInsa(e, t)
  const bloklar = t.bloklar
  const malz = C.yapiMalzemesi(bloklar)
  await yuzeyeCik(e)
  mesaj(`${t.ad} kuruyorum: ${bloklar.length} blok. Önce malzeme topluyorum (kalas: ${malz.kalas || 0}, taş: ${malz.tas || 0}).`)
  // malzeme: yakın sandıklardan, sonra toplayarak. Yetmezse elindekiyle kurar.
  await sandiktanAl(e)
  const dene = async (ad, f) => { try { await f() } catch (err) { if (err.iptal) throw err; mesaj(`${ad} yetmedi (${err.message}), elimdekiyle kuruyorum.`) } }
  if ((malz.kutuk || 0) > C.say(s.env, 'kutuk')) await dene('kütük', () => odunTopla(e, { adet: malz.kutuk - C.say(s.env, 'kutuk') }))
  if ((malz.kalas || 0) > C.say(s.env, 'kalas')) await dene('kalas', () => kalasYap(e, malz.kalas || 0))
  if ((malz.tas || 0) > C.say(s.env, 'tas')) {
    await dene('taş', async () => {
      if (C.kazmaSeviyesi(s.env) < 1) await ahsapAletler(e)
      const c = yuvarla(e.location)
      await cevherTopla(e, ['stone', 'cobblestone', 'deepslate'], 'cobblestone', (s.env.cobblestone || 0) + malz.tas - C.say(s.env, 'tas'), { yaricap: 12, yMin: c.y - 16, yMax: c.y + 4 })
    })
  }
  if ((malz.glass || 0) > (s.env.glass || 0)) {
    await dene('cam', async () => {
      const c = yuvarla(e.location)
      await cevherTopla(e, ['sand'], 'sand', malz.glass - (s.env.glass || 0), { yaricap: 24, yMin: c.y - 10, yMax: c.y + 10, gezinti: false })
      await erit(e, 'sand', s.env.sand || 0)
    })
  }
  if ((malz.torch || 0) > (s.env.torch || 0) && C.say(s.env, 'komur')) await dene('meşale', () => uret(e, 'torch', malz.torch))

  const o = sahibi(e)
  const merkez = yuvarla(o && o.dimension.id === e.dimension.id ? o.location : e.location)
  const b0 = { x: merkez.x + 3, y: merkez.y, z: merkez.z + 3 }
  const maxX = Math.max(...bloklar.map((b) => b.x)), maxZ = Math.max(...bloklar.map((b) => b.z)), maxY = Math.max(...bloklar.map((b) => b.y))
  const plan = new Set(bloklar.map((b) => `${b.x},${b.y},${b.z}`))
  mesaj('Alanı temizliyorum.')
  for (let y = maxY; y >= 0; y--) for (let x = 0; x <= maxX; x++) for (let z = 0; z <= maxZ; z++) {
    if (plan.has(`${x},${y},${z}`)) continue
    const p = { x: b0.x + x, y: b0.y + y, z: b0.z + z }
    if (sagMi(e.dimension, p) || /grass|fern|flower|bush/.test(tip(e.dimension, p))) { await yuru(e, p, 4, { maxAdim: 40 }).catch((err) => { if (err.iptal) throw err }); await kaz(e, p).catch((err) => { if (err.iptal) throw err }) }
  }
  let konan = 0, atlanan = 0, rapor = 0
  for (const b of bloklar) {
    k(e)
    const p = { x: b0.x + b.x, y: b0.y + b.y, z: b0.z + b.z }
    const mal = C.blokMaliyeti(b.ad)
    const kalem = mal && Object.keys(mal)[0]
    let ok = true
    if (b.opsiyonel) ok = (s.env[b.ad] || 0) > 0 && C.harca(s.env, b.ad, 1)
    else if (kalem) ok = C.say(s.env, kalem) >= Math.ceil(mal[kalem]) && C.harca(s.env, kalem, Math.max(1, Math.floor(mal[kalem])))
    if (!ok) { atlanan++; continue }
    if (uzak(e.location, p) > 4.5) { try { await yuru(e, p, 3.5, { maxAdim: 60 }) } catch (err) { if (err.iptal) throw err } }
    if (!bosMu(e.dimension, p) && tip(e.dimension, p) !== b.bedrock) { try { await kaz(e, p) } catch (err) { if (err.iptal) throw err } }
    try { e.teleport(e.location, { facingLocation: mid(p) }) } catch {}
    ozellik(e, 'kaziyor', true)
    if (!koyKomut(e.dimension, p, b.bedrock || b.ad, b.durum || '') && b.yedek) koyKomut(e.dimension, p, b.yedek)
    ses(e.dimension, /planks|log|wood|fence|stairs|slab|door/.test(b.ad) && !/stone|cobble|brick/.test(b.ad) ? 'dig.wood' : 'dig.stone', p)
    await bekle(6)
    ozellik(e, 'kaziyor', false)
    konan++
    const yuzde = Math.floor((konan / bloklar.length) * 100)
    if (yuzde >= rapor + 25) { rapor = yuzde; mesaj(`İnşaat %${yuzde}`); kaydet(e) }
  }
  kaydet(e)
  mesaj(`Bitti! ${konan} blok koydum${atlanan ? `, ${atlanan} blok malzeme yetmediği için boş kaldı` : ''}.`)
}

async function sandiktanAl(e) {
  const s = st(e)
  const c = yuvarla(e.location)
  const sandiklar = await xray(e, ['chest', 'barrel'], { yaricap: 8, yMin: c.y - 3, yMax: c.y + 3, adet: 4 })
  for (const p of sandiklar) {
    try {
      const kap = blok(e.dimension, p)?.getComponent('minecraft:inventory')?.container
      if (!kap) continue
      await yuru(e, p, 2.5)
      for (let i = 0; i < kap.size; i++) {
        const it = kap.getItem(i)
        if (!it) continue
        if (/planks|log|cobblestone|glass|torch|stone_bricks|sand|coal|stairs|slab|fence|door/.test(it.typeId)) {
          C.ekle(s.env, it.typeId, it.amount)
          kap.setItem(i, undefined)
        }
      }
      mesaj('Sandıktan malzeme aldım.')
    } catch {}
  }
}

async function tarlaYap(e) {
  const s = st(e)
  if (!s.env.wooden_hoe && !s.env.stone_hoe) { if (C.say(s.env, 'tas') >= 2) await uret(e, 'stone_hoe', 1); else await uret(e, 'wooden_hoe', 1) }
  if ((s.env.wheat_seeds || 0) < 12) {
    mesaj('Çimenlerden tohum topluyorum.')
    let deneme = 0
    while ((s.env.wheat_seeds || 0) < 12 && deneme++ < 60) {
      k(e)
      const c = yuvarla(e.location)
      const cimen = await xray(e, ['short_grass', 'tall_grass', 'fern'], { yaricap: 12, yMin: c.y - 4, yMax: c.y + 4, adet: 1 })
      if (!cimen.length) { if ((s.env.wheat_seeds || 0) >= 4) break; throw new Error('çimen yok, tohum bulamadım') }
      await yuru(e, cimen[0], 1.8)
      await kaz(e, cimen[0])
    }
  }
  const c = yuvarla(e.location)
  const sular = await xray(e, ['water'], { yaricap: 16, yMin: c.y - 4, yMax: c.y + 2, adet: 10 })
  const su = sular.find((p) => bosMu(e.dimension, { x: p.x, y: p.y + 1, z: p.z }) && !/water/.test(tip(e.dimension, { x: p.x, y: p.y + 1, z: p.z })))
  if (!su) throw new Error('tarla için yakında su yok')
  mesaj('Suyun çevresini çapalayıp tohum ekiyorum.')
  let ekilen = 0
  for (let dx = -4; dx <= 4; dx++) for (let dz = -4; dz <= 4; dz++) {
    k(e)
    const p = { x: su.x + dx, y: su.y, z: su.z + dz }
    const ust = { x: p.x, y: p.y + 1, z: p.z }
    const t = tip(e.dimension, p)
    if (!/^(grass_block|dirt|farmland)$/.test(t)) continue
    if (!bosMu(e.dimension, ust) || /water/.test(tip(e.dimension, ust))) continue
    if (uzak(e.location, p) > 4) { try { await yuru(e, ust, 3, { maxAdim: 30 }) } catch (err) { if (err.iptal) throw err; continue } }
    if (tip(e.dimension, ust) !== 'air') await kaz(e, ust)
    koyKomut(e.dimension, p, 'farmland')
    ses(e.dimension, 'use.gravel', p)
    await bekle(5)
    if (C.harca(s.env, 'wheat_seeds', 1)) { koyKomut(e.dimension, ust, 'wheat'); ekilen++; await bekle(3) }
  }
  kaydet(e)
  mesaj(`Tarla hazır, ${ekilen} tohum ektim!`)
}

const CEVHER = {
  diamond: [['diamond_ore', 'deepslate_diamond_ore'], 'diamond', -64, 16],
  iron: [['iron_ore', 'deepslate_iron_ore'], 'raw_iron', -40, 72],
  gold: [['gold_ore', 'deepslate_gold_ore'], 'raw_gold', -64, 32],
  coal: [['coal_ore', 'deepslate_coal_ore'], 'coal', -20, 140],
  copper: [['copper_ore', 'deepslate_copper_ore'], 'raw_copper', -16, 112],
  redstone: [['redstone_ore', 'deepslate_redstone_ore', 'lit_redstone_ore', 'lit_deepslate_redstone_ore'], 'redstone', -64, 16],
  lapis: [['lapis_ore', 'deepslate_lapis_ore'], 'lapis_lazuli', -64, 64],
  emerald: [['emerald_ore', 'deepslate_emerald_ore'], 'emerald', -16, 320],
  ancient_debris: [['ancient_debris'], 'ancient_debris', 8, 24],
  quartz: [['quartz_ore'], 'quartz', 10, 117]
}
async function madenBul(e, { cevher = 'diamond', adet = 4 } = {}) {
  const s = st(e)
  const anahtar = Object.keys(CEVHER).find((k2) => k2 === cevher || CEVHER[k2][1] === cevher) || 'diamond'
  const [tipler, esya, yMin, yMax] = CEVHER[anahtar]
  mesaj(`${goz()} ${adet} ${esya} arıyorum.`)
  await cevherTopla(e, tipler, esya, (s.env[esya] || 0) + adet, { yaricap: 16, yMin, yMax, hedefY: { diamond: -58, raw_iron: 16, raw_gold: -16, ancient_debris: 15, redstone: -58, lapis_lazuli: 0 }[esya] })
  mesaj(`${adet} ${esya} tamam!`)
}

async function esyalariVer(e, { esya = 'hepsi' } = {}) {
  const s = st(e)
  const o = sahibi(e)
  if (!o) throw new Error('kime vereyim?')
  if (o.dimension.id === e.dimension.id && uzak(o.location, e.location) < 64) await yuru(e, o.location, 2)
  let verilen = 0
  for (const [ad, n] of Object.entries({ ...s.env })) {
    if (esya !== 'hepsi' && !ad.includes(esya)) continue
    let kalan = n
    while (kalan > 0) {
      const parca = Math.min(64, kalan)
      try { o.dimension.spawnItem(new ItemStack(`minecraft:${ad}`, parca), o.location); verilen++ } catch { break }
      kalan -= parca
    }
    C.harca(s.env, ad, n - kalan)
  }
  kaydet(e)
  mesaj(verilen ? 'Al bakalım!' : 'Vereceğim bir şey yok.')
}

async function uyu() { mesaj('Ben uyumam, nöbet tutarım. Sen uyu!') }

const GOREVLER = {
  gel, takip_et: (e) => takipEt(e), odun_topla: odunTopla, ahsap_aletler: ahsapAletler, tas_aletler: tasAletler,
  demir_aletler: demirAletler, elmas, nether_portali: portalKur, nether_git: netherGit, netherite, hepsini_yap: hepsiniYap,
  insa_et: insaEt, tarla_yap: tarlaYap, maden_bul: madenBul, esyalari_ver: esyalariVer, uyu
}

/** Yanındaki (2.5 blok) yerdeki eşyaları alır. */
function esyaTopla(e) {
  const s = st(e)
  try {
    for (const it of e.dimension.getEntities({ type: 'minecraft:item', location: e.location, maxDistance: 2.5 })) {
      const st2 = it.getComponent('minecraft:item')?.itemStack
      if (!st2) continue
      C.ekle(s.env, st2.typeId, st2.amount)
      it.remove()
      ses(e.dimension, 'random.pop', yuvarla(e.location))
      kaydet(e)
    }
  } catch {}
}

// ---------- refleksler (her 5 tick): lav kaçışı, eşya toplama, savaş, iyileşme ----------
let tick = 0
system.runInterval(() => {
  tick++
  for (const e of yardimcilar()) {
    const s = st(e)
    const dim = e.dimension
    const ayak = yuvarla(e.location)
    // LAV / ATEŞ: acil kaçış
    if (lavMi(dim, ayak) || lavMi(dim, topla(ayak, { x: 0, y: 1, z: 0 }))) {
      const g = s.sonGuvenli
      try { if (g && g.d === dim.id) e.teleport(mid(g)); else e.teleport(topla(e.location, { x: 0, y: 3, z: 0 })) } catch {}
      try { e.extinguishFire?.() } catch {}
      lavKapat(e, ayak)
      mesaj('Lava düştüm, kaçtım! Taşla kapattım.')
    } else if (sagMi(dim, topla(ayak, { x: 0, y: -1, z: 0 }))) s.sonGuvenli = { ...ayak, d: dim.id }
    // yerdeki eşyaları topla (oyuncu "Q" ile atarsa yardımcı alır)
    if (tick % 2 === 0) esyaTopla(e)
    // savaş
    if (tick % 3 === 0) {
      try {
        const dusman = dim.getEntities({ location: e.location, maxDistance: 3.2, families: ['monster'] })[0]
        if (dusman) {
          try { e.teleport(e.location, { facingLocation: dusman.location }) } catch {}
          ozellik(e, 'kaziyor', true)
          dusman.applyDamage(C.silahHasari(s.env), { cause: 'entityAttack', damagingEntity: e })
          system.runTimeout(() => ozellik(e, 'kaziyor', false), 5)
        }
      } catch {}
    }
    // açlık yerine: yiyecekle iyileşme
    if (tick % 40 === 0) {
      const xr = xrayAcik()
      if (s.sonXray !== undefined && s.sonXray !== xr) mesaj(xr ? 'Yalnız kaldık, x-ray tekrar açık.' : 'Dünyaya başka oyuncu girdi: x-ray kapattım, hilesiz oynuyorum.')
      s.sonXray = xr
      try {
        const can = e.getComponent('minecraft:health')
        if (can && can.currentValue < can.effectiveMax - 4) {
          for (const y of ['cooked_beef', 'cooked_porkchop', 'bread', 'cooked_chicken', 'cooked_mutton', 'baked_potato', 'apple', 'carrot', 'beef', 'porkchop']) {
            if (C.harca(s.env, y, 1)) { can.setCurrentValue(Math.min(can.effectiveMax, can.currentValue + 6)); ses(dim, 'random.burp', ayak); break }
          }
        }
      } catch {}
      durumEtiketi(e)
    }
  }
}, 5)

// ---------- arayüz ----------
const MENU = [
  ['gel', 'Yanıma gel'], ['takip_et', 'Beni takip et'], ['dur', 'Dur'],
  ['odun_topla', 'Odun topla'], ['ahsap_aletler', 'Tahta aletler'], ['tas_aletler', 'Taş aletler'],
  ['demir_aletler', 'Demir (x-ray)'], ['elmas', 'Elmas (x-ray)'], ['nether_portali', 'Nether portalı'],
  ['netherite', 'Netherite'], ['hepsini_yap', 'Hepsini sırayla yap'], ['insa_et', 'Yapı inşa et...'],
  ['tarla_yap', 'Buğday tarlası'], ['esyalari_ver', 'Eşyaları bana ver'], ['_envanter', 'Envanterine bak'], ['_xray', 'X-ray ayarı'], ['_insa', 'İnşa modu'], ['_cagir', 'Yardımcıyı çağır']
]

function enYakinYardimci(p) {
  return yardimcilar().filter((e) => e.dimension.id === p.dimension.id).sort((a, b) => uzak(a.location, p.location) - uzak(b.location, p.location))[0] || yardimcilar()[0]
}

function cagir(p) {
  let e = enYakinYardimci(p)
  if (e) { try { e.teleport(topla(p.location, { x: 1, y: 0, z: 1 }), { dimension: p.dimension }) } catch {}; mesaj('Buradayım!'); return e }
  e = p.dimension.spawnEntity(TUR, topla(p.location, { x: 1, y: 0, z: 1 }))
  try { e.nameTag = AD } catch {}
  try { e.setDynamicProperty('yardimci:sahip', p.name) } catch {}
  st(e).sahip = p.name
  mesaj(`Selam ${p.name}! Ben geldim. Kumandayla ya da sohbetle (köprü açıksa) bana iş verebilirsin.`)
  return e
}

async function menuAc(p) {
  const f = new ActionFormData().title('Yapay Zeka Yardımcı').body('Ne yapayım?')
  for (const [, ad] of MENU) f.button(ad)
  const r = await f.show(p)
  if (r.canceled || r.selection === undefined) return
  const [kod] = MENU[r.selection]
  if (kod === '_cagir') { cagir(p); return }
  if (kod === '_insa') {
    const secenek = [['gercekci', 'Gerçekçi (malzeme toplar, blok blok)'], ['komut', 'Komutla (malzemesiz, kat kat hızlı)']]
    const f4 = new ActionFormData().title('İnşa modu').body(`Şu an: ${insaModu()}`)
    for (const [, ad] of secenek) f4.button(ad)
    const r4 = await f4.show(p)
    if (r4.canceled || r4.selection === undefined) return
    try { world.setDynamicProperty('yardimci:insa', secenek[r4.selection][0]) } catch {}
    mesaj(`İnşa modu: ${secenek[r4.selection][0]}`)
    return
  }
  if (kod === '_xray') {
    const secenek = [['otomatik', 'Otomatik (tek başımayken açık, başka oyuncu varsa kapalı)'], ['kapali', 'Hep kapalı (hilesiz)'], ['acik', 'Hep açık']]
    const f3 = new ActionFormData().title('X-ray').body(`Şu an: ${xrayAyar()} → ${xrayAcik() ? 'AÇIK' : 'KAPALI'}`)
    for (const [, ad] of secenek) f3.button(ad)
    const r3 = await f3.show(p)
    if (r3.canceled || r3.selection === undefined) return
    try { world.setDynamicProperty('yardimci:xray', secenek[r3.selection][0]) } catch {}
    mesaj(`X-ray ayarı: ${secenek[r3.selection][0]} (şu an ${xrayAcik() ? 'açık' : 'kapalı'})`)
    return
  }
  const e = enYakinYardimci(p) || cagir(p)
  st(e).sahip = p.name
  if (kod === '_envanter') {
    const s = st(e)
    await new ActionFormData().title('Envanter').body(`Görev: ${s.gorev || 'yok'}\nKazma seviyesi: ${C.kazmaSeviyesi(s.env)}\n\n${C.durumOzeti(s.env)}`).button('Tamam').show(p)
    return
  }
  if (kod === 'insa_et') {
    const adlar = Object.keys(SEMALAR)
    const f2 = new ActionFormData().title('Ne inşa edeyim?')
    for (const a of adlar) f2.button(`${a}\n§8${SEMALAR[a].bloklar.length} blok`)
    const r2 = await f2.show(p)
    if (r2.canceled || r2.selection === undefined) return
    gorevBaslat(e, 'insa_et', { sema: adlar[r2.selection] })
    return
  }
  gorevBaslat(e, kod)
}

world.afterEvents.itemUse.subscribe((ev) => {
  if (ev.itemStack?.typeId === 'yardimci:kumanda') system.run(() => menuAc(ev.source))
})

// köprü ya da oyuncu: /scriptevent yardimci:gorev elmas   veya   /scriptevent yardimci:gorev {"gorev":"insa_et","sema":"kule"}
system.afterEvents.scriptEventReceive.subscribe((ev) => {
  if (!ev.id.startsWith('yardimci:')) return
  const oyuncu = ev.sourceEntity?.typeId === 'minecraft:player' ? ev.sourceEntity : world.getAllPlayers()[0]
  if (ev.id === 'yardimci:cagir') { if (oyuncu) cagir(oyuncu); return }
  if (ev.id === 'yardimci:durum') { for (const e of yardimcilar()) durumEtiketi(e); return }
  if (ev.id === 'yardimci:soyle') { mesaj(ev.message); return }
  if (ev.id === 'yardimci:insa') { try { world.setDynamicProperty('yardimci:insa', ev.message.trim() === 'komut' ? 'komut' : 'gercekci') } catch {} mesaj(`İnşa modu: ${insaModu()}`); return }
  if (ev.id === 'yardimci:xray') { try { world.setDynamicProperty('yardimci:xray', ev.message.trim() || 'otomatik') } catch {} mesaj(`X-ray ayarı: ${xrayAyar()} (şu an ${xrayAcik() ? 'açık' : 'kapalı'})`); return }
  if (ev.id !== 'yardimci:gorev') return
  let g
  try { g = JSON.parse(ev.message) } catch { g = { gorev: ev.message.trim() } }
  const e = (oyuncu && enYakinYardimci(oyuncu)) || (oyuncu && cagir(oyuncu))
  if (!e) return
  if (oyuncu) st(e).sahip = oyuncu.name
  gorevBaslat(e, g.gorev, g)
})

// ilk girişte kumanda ver
world.afterEvents.playerSpawn.subscribe((ev) => {
  if (!ev.initialSpawn) return
  const p = ev.player
  if (p.hasTag('yardimci_kumanda_verildi')) return
  system.runTimeout(() => {
    try {
      p.getComponent('minecraft:inventory').container.addItem(new ItemStack('yardimci:kumanda', 1))
      p.addTag('yardimci_kumanda_verildi')
      p.sendMessage('§b[Yapay Zeka Yardımcı]§r Kumandayı kullan → "Yardımcıyı çağır". Hile açık olmalı.')
    } catch {}
  }, 60)
})

world.afterEvents.entityDie.subscribe((ev) => {
  const e = ev.deadEntity
  if (e?.typeId !== TUR) return
  const s = DURUM.get(e.id)
  if (!s) return
  for (const [ad, n] of Object.entries(s.env)) { try { e.dimension.spawnItem(new ItemStack(`minecraft:${ad}`, Math.min(64, n)), e.location) } catch {} }
  DURUM.delete(e.id)
  mesaj('Öldüm! Eşyalarım öldüğüm yerde. Kumandayla beni tekrar çağırabilirsin.')
})
