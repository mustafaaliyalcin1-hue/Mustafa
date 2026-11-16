// Testler için sahte Bedrock dünyası (gerçek oyun değil).
export const SAHTE = { tick: 0, mesajlar: [], komutlar: [], bloklar: new Map(), olaylar: {} }
const k = (p, d = 'minecraft:overworld') => `${d}|${Math.floor(p.x)},${Math.floor(p.y)},${Math.floor(p.z)}`
function uret(x, y, z) {
  if (y > 64) return 'minecraft:air'
  if (y === 64) return 'minecraft:grass_block'
  if (y > 60) return 'minecraft:dirt'
  if (y <= -64) return 'minecraft:bedrock'
  return y < 0 ? 'minecraft:deepslate' : 'minecraft:stone'
}
export function tipAl(p, d) { const a = k(p, d); if (SAHTE.bloklar.has(a)) return SAHTE.bloklar.get(a); return uret(Math.floor(p.x), Math.floor(p.y), Math.floor(p.z)) }
export function tipKoy(p, id, d) { SAHTE.bloklar.set(k(p, d), id.includes(':') ? id : 'minecraft:' + id) }
class Block {
  constructor(p, d) { this.d = d; this.location = { x: Math.floor(p.x), y: Math.floor(p.y), z: Math.floor(p.z) } }
  get typeId() { return tipAl(this.location, this.d) }
  get isAir() { return this.typeId === 'minecraft:air' }
  get isLiquid() { return /water|lava/.test(this.typeId) }
  get permutation() { return { getState: (s) => (s === 'liquid_depth' ? 0 : undefined) } }
  getComponent() { return undefined }
  setPermutation(perm) { SAHTE.izinler = (SAHTE.izinler || 0) + 1; tipKoy(this.location, perm.id, this.d) }
}
class Dimension {
  constructor(id) { this.id = id; this.heightRange = { min: -64, max: 320 } }
  getBlock(p) { return new Block(p, this.id) }
  setBlockType(p, id) { tipKoy(p, id, this.id) }
  runCommand(c) {
    SAHTE.komutlar.push(c); SAHTE.komutSayisi = (SAHTE.komutSayisi || 0) + 1
    const m = /^setblock (-?\d+) (-?\d+) (-?\d+) (\S+)/.exec(c)
    if (m) tipKoy({ x: +m[1], y: +m[2], z: +m[3] }, m[4], this.id)
    return { successCount: 1 }
  }
  playSound() {}
  spawnItem(st, p) { SAHTE.verilen = (SAHTE.verilen || []); SAHTE.verilen.push([st.typeId, st.amount]) }
  spawnEntity(t, p) { const e = new Entity(t, p, this); ENT.push(e); return e }
  getEntities(o = {}) {
    return ENT.filter((e) => e.dimension === this && (!o.type || e.typeId === o.type) && (!o.location || Math.hypot(e.location.x - o.location.x, e.location.y - o.location.y, e.location.z - o.location.z) <= (o.maxDistance ?? 1e9)) && (!o.families || o.families.some((f) => e.aile?.includes(f))))
  }
}
const DIM = { 'minecraft:overworld': new Dimension('minecraft:overworld'), 'minecraft:nether': new Dimension('minecraft:nether') }
const ENT = []
let sayac = 1
class Entity {
  constructor(t, p, d) { this.typeId = t; this.location = { ...p }; this.dimension = d; this.id = String(sayac++); this.dp = {}; this.tags = new Set(); this.can = 40 }
  teleport(p, o = {}) { this.location = { ...p }; if (o.dimension) this.dimension = o.dimension }
  setProperty() {} isValid() { return true }
  getDynamicProperty(a) { return this.dp[a] } setDynamicProperty(a, v) { this.dp[a] = v }
  getTags() { return [...this.tags] } addTag(t) { this.tags.add(t); return true } removeTag(t) { this.tags.delete(t) } hasTag(t) { return this.tags.has(t) }
  getComponent(c) { if (c === 'minecraft:item') return this.esya ? { itemStack: this.esya } : undefined; if (c === 'minecraft:health') return { currentValue: this.can, effectiveMax: 40, setCurrentValue: (v) => { this.can = v } } }
  applyDamage() { return true }
  remove() { const i = ENT.indexOf(this); if (i >= 0) ENT.splice(i, 1) }
  sendMessage(m) { SAHTE.mesajlar.push(m) }
}
export class ItemStack { constructor(t, n = 1) { this.typeId = t; this.amount = n } }
const abone = (ad) => ({ subscribe: (f) => { (SAHTE.olaylar[ad] ||= []).push(f); return f } })
const DUNYA_OZ = {}
export const world = {
  getDynamicProperty: (a) => DUNYA_OZ[a], setDynamicProperty: (a, v) => { DUNYA_OZ[a] = v },
  getDimension: (d) => DIM[d.includes(':') ? d : 'minecraft:' + d] || DIM['minecraft:overworld'],
  getAllPlayers: () => ENT.filter((e) => e.typeId === 'minecraft:player'),
  sendMessage: (m) => { SAHTE.mesajlar.push(m); SAHTE.dinle?.(m); if (process.env.SESLI) console.log(`[t=${Math.round(SAHTE.tick / 20)}sn]`, m.replace(/§./g, '')) },
  afterEvents: { itemUse: abone('itemUse'), playerSpawn: abone('playerSpawn'), entityDie: abone('entityDie') }
}
export const system = {
  runTimeout: (f, t = 1) => { SAHTE.tick += t; setImmediate(f) },
  runInterval: (f) => setInterval(f, 2),
  run: (f) => setImmediate(f),
  afterEvents: { scriptEventReceive: abone('scriptEventReceive') }
}
export function oyuncuYap(p) { const e = new Entity('minecraft:player', p, DIM['minecraft:overworld']); e.name = 'Mustafa'; ENT.push(e); return e }
export function olay(ad, veri) { for (const f of SAHTE.olaylar[ad] || []) f(veri) }
export const SAHTE_ENT = ENT
export function esyaAt(dim, p, t, n = 1) { const e = new Entity('minecraft:item', p, world.getDimension(dim)); e.esya = new ItemStack(t, n); ENT.push(e); return e }
export const BlockPermutation = { resolve: (id, durum) => ({ id, durum }) }
