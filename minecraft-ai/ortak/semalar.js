// Şema kütüphanesi: semalar/ klasöründeki .schem / .schematic dosyaları + kendi tasarımlarımız.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Schematic } from 'prismarine-schematic'
import { TASARIMLAR, tasarimGetir } from './tasarimlar.js'

const KOK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
export const SEMA_KLASORU = path.join(KOK, 'semalar')

const ACIKLAMALAR_DOSYASI = path.join(SEMA_KLASORU, 'aciklamalar.json')
function aciklamalar() {
  try { return JSON.parse(fs.readFileSync(ACIKLAMALAR_DOSYASI, 'utf8')) } catch { return {} }
}

export function semalariListele() {
  const acik = aciklamalar()
  const liste = Object.keys(TASARIMLAR).map((ad) => ({ ad, tur: 'tasarim', aciklama: tasarimGetir(ad).aciklama }))
  let dosyalar = []
  try { dosyalar = fs.readdirSync(SEMA_KLASORU) } catch {}
  for (const f of dosyalar) {
    if (!/\.(schem|schematic)$/i.test(f)) continue
    const ad = f.replace(/\.(schem|schematic)$/i, '')
    liste.push({ ad, tur: 'sematik', dosya: f, aciklama: acik[ad] || 'indirilmiş şematik' })
  }
  return liste
}

/** Şemayı ortak biçimde yükler: { ad, aciklama, boyut, bloklar:[{x,y,z,ad,durum}] } (y=0 en alt sıra) */
export async function semaYukle(ad, surum = '1.20.4') {
  const t = tasarimGetir(ad)
  if (t) return t
  const kayit = semalariListele().find((s) => s.ad === ad)
  if (!kayit) throw new Error(`"${ad}" adında şema yok`)
  const s = await Schematic.read(fs.readFileSync(path.join(SEMA_KLASORU, kayit.dosya)), surum)
  const bas = s.start()
  const bloklar = []
  await s.forEach((b, p) => {
    if (b.name === 'air' || b.name === 'cave_air' || b.name === 'structure_void') return
    const durum = b.getProperties ? b.getProperties() : {}
    bloklar.push({ x: p.x - bas.x, y: p.y - bas.y, z: p.z - bas.z, ad: b.name, ...(Object.keys(durum).length ? { durum } : {}) })
  })
  // Şematiklerin altında çoğu zaman toprak/çimen katmanı olur; en alt dolu katı zemin say.
  const minY = Math.min(...bloklar.map((b) => b.y))
  for (const b of bloklar) b.y -= minY
  return { ad, aciklama: kayit.aciklama, boyut: { x: s.size.x, y: s.size.y, z: s.size.z }, bloklar }
}
