import { test } from 'node:test'
import assert from 'node:assert'
import { basitCoz, GOREVLER } from '../ortak/gorevler.js'
import { tasarimGetir, TASARIMLAR, insaSirasi } from '../ortak/tasarimlar.js'
import { uyarla, agacTuru } from '../ortak/uyarla.js'
import { semalariListele, semaYukle } from '../ortak/semalar.js'
import * as C from '../bedrock/eklenti/scripts/cekirdek.js'

test('basit komut çözücü', () => {
  assert.deepStrictEqual(basitCoz('dur'), { gorev: 'dur' })
  assert.strictEqual(basitCoz('beni takip et').gorev, 'takip_et')
  assert.strictEqual(basitCoz('buraya gel').gorev, 'gel')
  assert.deepStrictEqual(basitCoz('bana elmas bul'), { gorev: 'maden_bul', cevher: 'diamond', adet: 3 })
  assert.strictEqual(basitCoz('elmas kazma yap').gorev, 'elmas')
  assert.strictEqual(basitCoz('netherite yapalım').gorev, 'netherite')
  assert.deepStrictEqual(basitCoz('bir ev yap'), { gorev: 'insa_et', sema: 'kulube' })
  assert.deepStrictEqual(basitCoz('kule dik'), { gorev: 'insa_et', sema: 'kule' })
  assert.strictEqual(basitCoz('çiftlik kur').gorev, 'tarla_yap')
  assert.strictEqual(basitCoz('durum ne'), null)
  for (const g of Object.values(basitCoz('ev yap'))) assert.ok(g)
  assert.ok(GOREVLER.insa_et)
})

test('tasarımlar tekil ve inşa sırası alttan üste', () => {
  for (const ad of Object.keys(TASARIMLAR)) {
    const t = tasarimGetir(ad)
    const anahtar = new Set(t.bloklar.map((b) => `${b.x},${b.y},${b.z}`))
    assert.strictEqual(anahtar.size, t.bloklar.length, `${ad} aynı yere iki blok`)
    const sira = insaSirasi(t.bloklar).filter((b) => b.ad !== 'torch')
    for (let i = 1; i < sira.length; i++) assert.ok(sira[i].y >= sira[i - 1].y)
    assert.ok(t.bloklar.length > 100)
  }
})

test('şematik okuma ve gerçekçi uyarlama', async () => {
  const liste = semalariListele()
  assert.ok(liste.some((s) => s.ad === 'kucuk-ev') && liste.some((s) => s.ad === 'viking-evi'))
  const s = await semaYukle('viking-evi')
  assert.ok(s.bloklar.length > 2000)
  assert.strictEqual(Math.min(...s.bloklar.map((b) => b.y)), 0)
  const { bloklar } = uyarla(s.bloklar, { agac: 'birch' })
  assert.ok(!bloklar.some((b) => /spruce|stripped/.test(b.ad)), 'ağaç türü çevrilmeli')
  assert.ok(bloklar.some((b) => b.ad === 'birch_planks'))
  assert.ok(!bloklar.some((b) => b.ad === 'grass_block' && b.y === 0), 'zemin çimeni atlanmalı')
  const ev = uyarla((await semaYukle('kucuk-ev')).bloklar, { agac: 'oak' })
  assert.ok(ev.bloklar.find((b) => b.ad === 'anvil')?.opsiyonel, 'örs süs eşyası sayılmalı')
  assert.ok(!ev.bloklar.some((b) => b.ad === 'polished_diorite'))
  assert.strictEqual(agacTuru('dark_oak_stairs'), 'dark_oak')
})

test('Bedrock çekirdeği: tarif, eritme, kazma seviyesi', () => {
  const env = {}
  C.ekle(env, 'minecraft:oak_log', 2)
  assert.strictEqual(C.say(env, 'kutuk'), 2)
  assert.ok(C.harca(env, 'kutuk', 1)); C.ekle(env, 'oak_planks', 4)
  assert.ok(C.uret(env, 'stick'))
  assert.strictEqual(env.stick, 4)
  assert.ok(!C.uret(env, 'wooden_pickaxe') || env.wooden_pickaxe) // 2 kalas kaldı → yetmez
  C.ekle(env, 'birch_planks', 3)
  assert.ok(C.uret(env, 'wooden_pickaxe'))
  assert.strictEqual(C.kazmaSeviyesi(env), 1)
  assert.strictEqual(C.kazmaSuresi('minecraft:iron_ore', env), Infinity, 'tahta kazma demiri kazamaz')
  C.ekle(env, 'iron_pickaxe')
  assert.ok(isFinite(C.kazmaSuresi('deepslate_diamond_ore', env)))
  assert.strictEqual(C.kazmaSuresi('obsidian', env), Infinity)
  C.ekle(env, 'diamond_pickaxe')
  const obs = C.kazmaSuresi('obsidian', env) / 20
  assert.ok(obs > 7 && obs < 12, `obsidyen ~9 sn sürmeli (${obs})`)
  assert.strictEqual(C.blokBilgi('deepslate_diamond_ore').dus, 'diamond')
  assert.strictEqual(C.ERIT.raw_iron, 'iron_ingot')
  assert.deepStrictEqual(C.eksikler({ diamond: 1 }, 'diamond_pickaxe'), { diamond: 2, stick: 2 })
})
