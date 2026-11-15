// Bedrock eklentisi: elmastan netherite kazmaya (obsidyen, portal, Nether'e oyuncuyla geçiş, debris, şablon)
import { test } from 'node:test'
import assert from 'node:assert'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { eklentiYap } from '../bedrock/eklenti-yap.js'

const KOK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

test('Bedrock yardımcı: netherite kazmaya kadar', { timeout: 600000 }, async () => {
  await eklentiYap()
  const dizin = fs.mkdtempSync(path.join(os.tmpdir(), 'yz-sim-'))
  fs.cpSync(path.join(KOK, 'bedrock', 'paket', 'YardimciBP', 'scripts'), path.join(dizin, 'scripts'), { recursive: true })
  fs.mkdirSync(path.join(dizin, 'node_modules'))
  fs.cpSync(path.join(KOK, 'test', 'sahte', '@minecraft'), path.join(dizin, 'node_modules', '@minecraft'), { recursive: true })
  fs.writeFileSync(path.join(dizin, 'package.json'), '{"type":"module"}')
  const mc = await import(pathToFileURL(path.join(dizin, 'node_modules', '@minecraft', 'server', 'index.js')).href)
  await import(pathToFileURL(path.join(dizin, 'scripts', 'main.js')).href)
  const { tipKoy, SAHTE } = mc
  const bekleMesaj = async (desen, sn = 120) => {
    const son = Date.now() + sn * 1000
    while (Date.now() < son) {
      if (SAHTE.mesajlar.some((x) => desen.test(x))) return
      const h = SAHTE.mesajlar.find((x) => /Takıldım/.test(x)); if (h) throw new Error(h)
      await new Promise((r) => setTimeout(r, 20))
    }
    throw new Error('gelmedi: ' + desen + ' | ' + SAHTE.mesajlar.slice(-6).join(' | '))
  }
  // dünya: su, lav gölü, çakıl; Nether'de debris ve altın
  for (let x = -3; x <= -1; x++) tipKoy({ x, y: 64, z: 6 }, 'water')
  for (let x = 6; x <= 10; x++) for (let z = 6; z <= 9; z++) tipKoy({ x, y: 20, z }, 'lava')
  for (let i = 0; i < 6; i++) tipKoy({ x: -6, y: 64 - i, z: -6 }, 'gravel')
  for (const [x, z] of [[3, 3], [-3, 3], [3, -3]]) for (let y = 65; y <= 67; y++) tipKoy({ x, y, z }, 'oak_log')
  for (let i = 0; i < 4; i++) mc.tipKoy({ x: 4 + i * 3, y: 15, z: 2 }, 'ancient_debris', 'minecraft:nether')
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) mc.tipKoy({ x: -4 - i, y: 40 + j, z: 3 }, 'nether_gold_ore', 'minecraft:nether')
  const p = mc.oyuncuYap({ x: 0, y: 65, z: 0 })
  mc.olay('scriptEventReceive', { id: 'yardimci:cagir', message: '', sourceEntity: p })
  await bekleMesaj(/Selam/)
  // elmas aşamasını geçmiş gibi: eşyaları yanına at, o toplar
  for (const [t, n] of [['diamond_pickaxe', 1], ['iron_ingot', 6], ['oak_planks', 32], ['cobblestone', 40], ['coal', 16]]) mc.esyaAt('overworld', { x: 1, y: 65, z: 1 }, 'minecraft:' + t, n)
  await new Promise((r) => setTimeout(r, 200))
  // oyuncu portal açılır açılmaz içine giriyor
  SAHTE.dinle = (m) => {
    if (/portalı açıldı/.test(m)) p.teleport({ x: 0, y: 50, z: 0 }, { dimension: mc.world.getDimension('nether') })
    if (/şablonu lazım/.test(m)) { const y = mc.SAHTE_ENT.find((e) => e.typeId === 'yardimci:arkadas'); mc.esyaAt('nether', { ...y.location }, 'minecraft:netherite_upgrade_smithing_template', 1) } // oyuncu şablonu yanına atıyor
  }
  const t0 = SAHTE.tick
  mc.olay('scriptEventReceive', { id: 'yardimci:gorev', message: 'netherite', sourceEntity: p })
  await bekleMesaj(/Nether portalı açıldı/, 240)
  await bekleMesaj(/Ancient debris arıyorum/, 60)
  const yz = mc.SAHTE_ENT.find((e) => e.typeId === 'yardimci:arkadas')
  assert.strictEqual(yz.dimension.id, 'minecraft:nether')
  await bekleMesaj(/Netherite külçesi hazır/, 240)
  await bekleMesaj(/NETHERITE KAZMA TAMAM/, 120)
  console.log(`  oyun içi süre (elmas kazmadan sonra): ${((SAHTE.tick - t0) / 20 / 60).toFixed(1)} dakika`)
  const portal = [...SAHTE.bloklar.values()].filter((v) => v === 'minecraft:portal').length
  assert.ok(portal >= 6, 'portal blokları olmalı')
  process.exit(0)
})
