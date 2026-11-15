// X-ray kuralı: tek oyunculu dünyada gizli cevheri görür, başka oyuncu varken sadece açıktakini.
import { test } from 'node:test'
import assert from 'node:assert'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { eklentiYap } from '../bedrock/eklenti-yap.js'

const KOK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

async function dunya() {
  const dizin = fs.mkdtempSync(path.join(os.tmpdir(), 'yz-xray-'))
  fs.cpSync(path.join(KOK, 'bedrock', 'paket', 'YardimciBP', 'scripts'), path.join(dizin, 'scripts'), { recursive: true })
  fs.mkdirSync(path.join(dizin, 'node_modules'))
  fs.cpSync(path.join(KOK, 'test', 'sahte', '@minecraft'), path.join(dizin, 'node_modules', '@minecraft'), { recursive: true })
  fs.writeFileSync(path.join(dizin, 'package.json'), '{"type":"module"}')
  const mc = await import(pathToFileURL(path.join(dizin, 'node_modules', '@minecraft', 'server', 'index.js')).href)
  await import(pathToFileURL(path.join(dizin, 'scripts', 'main.js')).href)
  return mc
}

async function kosu(oyuncuSayisi) {
  const mc = await dunya()
  const gizli = { x: 2, y: 62, z: 1 }, acik = { x: 6, y: 65, z: 1 }
  mc.tipKoy(gizli, 'coal_ore'); mc.tipKoy(acik, 'coal_ore')
  const p = mc.oyuncuYap({ x: 0, y: 65, z: 0 })
  for (let i = 1; i < oyuncuSayisi; i++) mc.oyuncuYap({ x: 30, y: 65, z: 30 })
  mc.olay('scriptEventReceive', { id: 'yardimci:cagir', message: '', sourceEntity: p })
  mc.esyaAt('overworld', { x: 1, y: 65, z: 1 }, 'minecraft:wooden_pickaxe', 1)
  await new Promise((r) => setTimeout(r, 100))
  mc.olay('scriptEventReceive', { id: 'yardimci:gorev', message: '{"gorev":"maden_bul","cevher":"coal","adet":1}', sourceEntity: p })
  const son = Date.now() + 30000
  while (!mc.SAHTE.mesajlar.some((m) => /1 coal tamam|Takıldım/.test(m)) && Date.now() < son) await new Promise((r) => setTimeout(r, 20))
  return { mc, gizliKazildi: mc.tipAl(gizli) !== 'minecraft:coal_ore', acikKazildi: mc.tipAl(acik) !== 'minecraft:coal_ore', mesajlar: mc.SAHTE.mesajlar.join(' | ') }
}

test('x-ray: tek başınayken gizli cevheri bulur, çok oyunculuda bulmaz', { timeout: 120000 }, async () => {
  await eklentiYap()
  const tek = await kosu(1)
  assert.ok(tek.gizliKazildi, 'tek oyunculuda yakındaki gizli kömürü kazmalıydı: ' + tek.mesajlar)
  assert.ok(!tek.acikKazildi)
  assert.match(tek.mesajlar, /X-ray ile/)
  const cok = await kosu(2)
  assert.ok(!cok.gizliKazildi, 'çok oyunculuda gizli kömürü görmemeliydi: ' + cok.mesajlar)
  assert.ok(cok.acikKazildi, 'açıktaki kömürü kazmalıydı: ' + cok.mesajlar)
  assert.match(cok.mesajlar, /Gözümle/)
  process.exit(0)
})
