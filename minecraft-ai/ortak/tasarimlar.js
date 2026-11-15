// Kendi yapı tasarımlarımız. Her tasarım: { ad, aciklama, bloklar: [{x,y,z,ad}] }
// Koordinatlar göreli: y=0 zemin katı (yere oturan ilk sıra). Blok adları Java adıdır
// (Bedrock tarafı eklenti-yap.js içinde gerekirse çevirir).

function kutu(liste, x1, y1, z1, x2, y2, z2, ad) {
  for (let x = x1; x <= x2; x++) for (let y = y1; y <= y2; y++) for (let z = z1; z <= z2; z++) liste.push({ x, y, z, ad })
}

function cerceveDuvar(liste, g, d, y1, y2, duvar, kose) {
  // g: genişlik (x), d: derinlik (z). Dış çerçeve duvarı, köşeler ayrı blok.
  for (let y = y1; y <= y2; y++) {
    for (let x = 0; x < g; x++) for (const z of [0, d - 1]) liste.push({ x, y, z, ad: (x === 0 || x === g - 1) ? kose : duvar })
    for (let z = 1; z < d - 1; z++) for (const x of [0, g - 1]) liste.push({ x, y, z, ad: duvar })
  }
}

function cikar(liste, kosul) {
  return liste.filter((b) => !kosul(b))
}

function kulube() {
  const g = 7, d = 7
  let b = []
  kutu(b, 0, 0, 0, g - 1, 0, d - 1, 'cobblestone') // taban
  cerceveDuvar(b, g, d, 1, 3, 'oak_planks', 'oak_log')
  // kapı (ön yüz ortası, 2 blok boşluk) ve pencereler
  b = cikar(b, (k) => k.z === 0 && k.x === 3 && (k.y === 1 || k.y === 2))
  for (const k of b) {
    if (k.y === 2 && ((k.z === 0 && (k.x === 1 || k.x === 5)) || ((k.x === 0 || k.x === g - 1) && k.z === 3) || (k.z === d - 1 && k.x === 3))) k.ad = 'glass_pane'
  }
  // çatı: kademeli piramit
  for (let s = 0; s < 4; s++) {
    const a = s - 1, c = g - s
    for (let x = a; x <= c; x++) for (let z = a; z <= c; z++) {
      const kenar = x === a || x === c || z === a || z === c
      if (kenar || s === 3) b.push({ x, y: 4 + s, z, ad: s === 3 ? 'oak_slab' : 'spruce_planks' })
    }
  }
  b.push({ x: 1, y: 1, z: 5, ad: 'crafting_table' }, { x: 5, y: 1, z: 5, ad: 'furnace' }, { x: 3, y: 1, z: 5, ad: 'chest' })
  b.push({ x: 3, y: 3, z: 1, ad: 'torch' }, { x: 3, y: 3, z: 5, ad: 'torch' })
  return { ad: 'kulube', aciklama: '7x7 ahşap kulübe: taş taban, kütük köşeler, camlı pencereler, piramit çatı, içinde masa/fırın/sandık (~230 blok)', bloklar: b }
}

function tasEv() {
  const g = 11, d = 8
  let b = []
  kutu(b, 0, 0, 0, g - 1, 0, d - 1, 'cobblestone')
  cerceveDuvar(b, g, d, 1, 3, 'cobblestone', 'stone_bricks')
  kutu(b, 0, 4, 0, g - 1, 4, d - 1, 'spruce_planks') // ara kat
  cerceveDuvar(b, g, d, 5, 7, 'spruce_planks', 'spruce_log')
  b = cikar(b, (k) => k.z === 0 && k.x === 5 && (k.y === 1 || k.y === 2))
  b = cikar(b, (k) => k.y === 4 && k.x >= 1 && k.x <= 2 && k.z >= 1 && k.z <= 2) // merdiven boşluğu
  for (const k of b) {
    const pencereY = k.y === 2 || k.y === 6
    if (pencereY && k.z === 0 && (k.x === 2 || k.x === 8)) k.ad = 'glass_pane'
    if (pencereY && k.z === d - 1 && (k.x === 3 || k.x === 7)) k.ad = 'glass_pane'
    if (pencereY && (k.x === 0 || k.x === g - 1) && (k.z === 3 || k.z === 4)) k.ad = 'glass_pane'
  }
  // iç merdiven (blok basamak), çatı (iki yana eğimli)
  b.push({ x: 1, y: 1, z: 3, ad: 'oak_planks' }, { x: 1, y: 2, z: 2, ad: 'oak_planks' }, { x: 1, y: 3, z: 1, ad: 'oak_planks' })
  for (let s = 0; s <= 4; s++) {
    for (let x = -1; x <= g; x++) {
      b.push({ x, y: 8 + s, z: s - 1, ad: 'dark_oak_planks' })
      b.push({ x, y: 8 + s, z: d - s, ad: 'dark_oak_planks' })
    }
  }
  for (let s = 0; s <= 3; s++) for (let z = s; z <= d - 1 - s; z++) for (const x of [0, g - 1]) b.push({ x, y: 8 + s, z, ad: 'spruce_planks' })
  b.push({ x: 9, y: 1, z: 6, ad: 'crafting_table' }, { x: 8, y: 1, z: 6, ad: 'furnace' }, { x: 7, y: 1, z: 6, ad: 'chest' })
  b.push({ x: 5, y: 3, z: 1, ad: 'torch' }, { x: 5, y: 7, z: 6, ad: 'torch' })
  return { ad: 'tas_ev', aciklama: '11x8 iki katlı ev: altı taş, üstü ahşap, iç merdiven, beşik çatı (~600 blok)', bloklar: b }
}

function kule() {
  const b = []
  for (let y = 0; y <= 12; y++) {
    for (let x = 0; x < 5; x++) for (let z = 0; z < 5; z++) {
      const kenar = x === 0 || x === 4 || z === 0 || z === 4
      if (y === 0 || (kenar && !(z === 0 && x === 2 && (y === 1 || y === 2)))) b.push({ x, y, z, ad: (x === 0 || x === 4) && (z === 0 || z === 4) ? 'stone_bricks' : 'cobblestone' })
    }
    // iç spiral basamaklar
    const yol = [[1, 1], [2, 1], [3, 1], [3, 2], [3, 3], [2, 3], [1, 3], [1, 2]]
    if (y >= 1 && y <= 11) { const [x, z] = yol[(y - 1) % yol.length]; b.push({ x, y, z, ad: 'oak_planks' }) }
  }
  for (let x = -1; x <= 5; x++) for (let z = -1; z <= 5; z++) b.push({ x, y: 13, z, ad: 'spruce_planks' })
  for (let x = -1; x <= 5; x++) for (let z = -1; z <= 5; z++) if (x === -1 || x === 5 || z === -1 || z === 5) b.push({ x, y: 14, z, ad: 'oak_fence' })
  b.push({ x: -1, y: 15, z: -1, ad: 'torch' }, { x: 5, y: 15, z: 5, ad: 'torch' })
  return { ad: 'kule', aciklama: '5x5 taş gözetleme kulesi, içinde spiral basamak, tepede çitli seyir terası (~330 blok)', bloklar: b }
}

export const TASARIMLAR = { kulube, tas_ev: tasEv, kule }

export function tasarimGetir(ad) {
  const f = TASARIMLAR[ad]
  if (!f) return null
  const t = f()
  const harita = new Map() // aynı konuma iki blok düştüyse sonuncusu kalır
  for (const b of t.bloklar) harita.set(`${b.x},${b.y},${b.z}`, b)
  t.bloklar = [...harita.values()]
  return t
}

// Blokları inşa sırasına diz: alttan üste, her katta kenardan içe değil, satır satır.
// Meşale gibi bir şeye yaslanması gerekenler en sona.
const SONA = /torch|lantern|door|ladder|carpet|bed|banner|button|lever|pressure_plate|sign|flower|sapling/
export function insaSirasi(bloklar) {
  return [...bloklar].sort((a, b) => {
    const sa = SONA.test(a.ad) ? 1 : 0, sb = SONA.test(b.ad) ? 1 : 0
    if (sa !== sb) return sa - sb
    return a.y - b.y || a.x - b.x || a.z - b.z
  })
}

export function malzemeListesi(bloklar) {
  const m = {}
  for (const b of bloklar) m[b.ad] = (m[b.ad] || 0) + 1
  return m
}
