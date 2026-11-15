// Bedrock eklentisini sahte bir dünyada çalıştırır: sıfırdan elmas kazmaya, inşaata kadar.
import { test } from 'node:test'
import assert from 'node:assert'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { eklentiYap } from '../bedrock/eklenti-yap.js'

const KOK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

async function kur() {
  await eklentiYap()
  const dizin = fs.mkdtempSync(path.join(os.tmpdir(), 'yz-sim-'))
  fs.cpSync(path.join(KOK, 'bedrock', 'paket', 'YardimciBP', 'scripts'), path.join(dizin, 'scripts'), { recursive: true })
  fs.mkdirSync(path.join(dizin, 'node_modules'))
  fs.cpSync(path.join(KOK, 'test', 'sahte', '@minecraft'), path.join(dizin, 'node_modules', '@minecraft'), { recursive: true })
  fs.writeFileSync(path.join(dizin, 'package.json'), '{"type":"module"}')
  const mc = await import(pathToFileURL(path.join(dizin, 'node_modules', '@minecraft', 'server', 'index.js')).href)
  // main.js kendi kopyasındaki @minecraft/server'ı bulsun diye aynı dizinden yüklüyoruz
  await import(pathToFileURL(path.join(dizin, 'scripts', 'main.js')).href)
  return mc
}

async function bekleMesaj(mc, desen, sn = 60) {
  const son = Date.now() + sn * 1000
  while (Date.now() < son) {
    const m = mc.SAHTE.mesajlar.find((x) => desen.test(x))
    if (m) return m
    const hata = mc.SAHTE.mesajlar.find((x) => /Takıldım/.test(x))
    if (hata) throw new Error(hata)
    await new Promise((r) => setTimeout(r, 20))
  }
  throw new Error('beklenen mesaj gelmedi: ' + desen + '\nson mesajlar: ' + mc.SAHTE.mesajlar.slice(-8).join(' | '))
}

test('Bedrock yardımcı: sıfırdan elmas kazmaya ve inşaata', { timeout: 240000 }, async () => {
  const mc = await kur()
  const { tipKoy, SAHTE } = mc
  // dünya: birkaç ağaç, kömür, demir, altın, elmas (yanında lav!), su
  for (const [x, z] of [[6, 4], [-5, 7], [8, -6], [-7, -5], [10, 9], [3, -9]]) for (let y = 65; y <= 68; y++) tipKoy({ x, y, z }, 'oak_log')
  for (let x = -30; x <= 30; x += 6) for (let z = 18; z <= 30; z += 6) for (let y = 65; y <= 68; y++) tipKoy({ x, y, z }, 'oak_log') // orman
  for (let i = 0; i < 10; i++) tipKoy({ x: 4 + (i % 3), y: 40 - Math.floor(i / 3), z: 3 }, 'coal_ore')
  for (let i = 0; i < 16; i++) tipKoy({ x: -4 - (i % 4), y: 16 - Math.floor(i / 4), z: -3 }, 'iron_ore')
  for (let i = 0; i < 4; i++) tipKoy({ x: 2 + i, y: -20, z: -6 }, 'deepslate_gold_ore')
  for (let i = 0; i < 6; i++) tipKoy({ x: 5 + i, y: -58, z: -2 }, 'deepslate_diamond_ore')
  tipKoy({ x: 5, y: -58, z: -1 }, 'lava') // elmasın yanında lav
  const p = mc.oyuncuYap({ x: 0, y: 65, z: 0 })
  mc.olay('scriptEventReceive', { id: 'yardimci:cagir', message: '', sourceEntity: p })
  await bekleMesaj(mc, /Selam Mustafa/)
  const t0 = SAHTE.tick
  mc.olay('scriptEventReceive', { id: 'yardimci:gorev', message: 'elmas', sourceEntity: p })
  await bekleMesaj(mc, /Tahta kazmam hazır/)
  await bekleMesaj(mc, /Taş aletler ve fırın tamam/)
  await bekleMesaj(mc, /Demir kazma, kılıç ve kova hazır/, 120)
  await bekleMesaj(mc, /Elmas kazma yaptım/, 120)
  const dk = (SAHTE.tick - t0) / 20 / 60
  console.log(`  oyun içi süre (yaklaşık): ${dk.toFixed(1)} dakika`)
  assert.ok(SAHTE.mesajlar.some((m) => /Lav gördüm/.test(m)), 'elmasın yanındaki lavı kapatmalıydı')
  assert.notStrictEqual(mc.tipAl({ x: 5, y: -58, z: -1 }), 'minecraft:lava', 'lav kapatılmış olmalı')
  // durum etiketi (köprü bunu okur)
  const yz = mc.SAHTE_ENT.find((e) => e.typeId === 'yardimci:arkadas')
  const etiket = yz.getTags().find((t) => t.startsWith('yzd:'))
  assert.ok(etiket, 'durum etiketi olmalı')
  const ozet = JSON.parse(decodeURIComponent(etiket.slice(4)))
  assert.ok(ozet.e.diamond_pickaxe, 'envanterde elmas kazma olmalı')

  // inşaat: kulübe
  mc.olay('scriptEventReceive', { id: 'yardimci:gorev', message: '{"gorev":"insa_et","sema":"kulube"}', sourceEntity: p })
  const bitti = await bekleMesaj(mc, /Bitti! \d+ blok/, 120)
  console.log('  ' + bitti.replace(/§./g, ''))
  const konan = Number(/(\d+) blok koydum/.exec(bitti)[1])
  assert.ok(konan > 180, 'kulübenin çoğu konmalı')

  // eşyaları ver
  mc.olay('scriptEventReceive', { id: 'yardimci:gorev', message: 'esyalari_ver', sourceEntity: p })
  await bekleMesaj(mc, /Al bakalım/)
  assert.ok(SAHTE.verilen.some(([t]) => t === 'minecraft:diamond_pickaxe'))
  process.exit(0) // eklentinin runInterval döngüsü açık kalmasın
})
