import assert from 'node:assert/strict'
import http from 'node:http'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import WebSocket from 'ws'

process.env.DATA_DIR = path.join(os.tmpdir(), 'jarvis-karma-' + process.pid)
process.env.KOPRU_SIFRESI = 'dogru-sifre'
process.env.KOPRU_BEKLEME_MS = '1500'
const k = await import('./karma.ts')

const server = http.createServer()
k.kopruyuBagla(server, { info() {}, warn() {} })
await new Promise<void>((r) => server.listen(0, r))
const port = (server.address() as { port: number }).port
const url = `ws://127.0.0.1:${port}/kopru`

/** Sahte köprü: gelen istemi kaydeder, verilen işlevle cevaplar */
function sahteKopru(sifre: string, cevapla?: (istem: string) => string | null) {
  const ws = new WebSocket(url, { headers: { authorization: `Bearer ${sifre}` } })
  const gelen: string[] = []
  ws.on('message', (d) => {
    const m = JSON.parse(d.toString())
    gelen.push(m.istem)
    const c = cevapla?.(m.istem)
    if (c !== null && c !== undefined) ws.send(JSON.stringify({ tip: 'cevap', id: m.id, cevap: c }))
  })
  return { ws, gelen, acik: new Promise<void>((ok, no) => (ws.once('open', () => ok()), ws.once('error', no))) }
}
const bekle = (ms: number) => new Promise((r) => setTimeout(r, ms))
const apiCagrilari: string[] = []
k._sorucular({ api: async (istem) => (apiCagrilari.push(istem), `API cevabı: ${istem}`) })

test('yanlış şifreli köprü reddedilir', async () => {
  const { acik } = sahteKopru('yanlis')
  await assert.rejects(acik, /401/)
  assert.equal(k.kopruBagli(), false)
})

test('köprü açık → bilgisayar, kapalı → api, tekrar açık → bilgisayar; hafıza korunur', async () => {
  k.hafizayiSil()
  const b1 = sahteKopru('dogru-sifre', () => 'Merhaba efendim, bilgisayardan.')
  await b1.acik
  await bekle(50)
  const c1 = await k.sor('Merhaba Jarvis')
  assert.deepEqual(c1, { cevap: 'Merhaba efendim, bilgisayardan.', yol: 'bilgisayar' })

  b1.ws.close()
  await bekle(100)
  assert.equal(k.kopruBagli(), false)
  const c2 = await k.sor('Benim adım Mustafa')
  assert.equal(c2.yol, 'api')

  const b2 = sahteKopru('dogru-sifre', () => 'Adınız Mustafa efendim.')
  await b2.acik
  await bekle(50)
  const c3 = await k.sor('Adım neydi?')
  assert.equal(c3.yol, 'bilgisayar')
  // Köprüye giden istemde önceki iki yolun konuşması da var
  const son = b2.gelen.at(-1)!
  assert.match(son, /Kullanıcı: Merhaba Jarvis\nJarvis: Merhaba efendim, bilgisayardan\./)
  assert.match(son, /Kullanıcı: Benim adım Mustafa\nJarvis: API cevabı: Benim adım Mustafa/)
  assert.match(son, /Kullanıcının yeni mesajı: Adım neydi\?/)
  assert.deepEqual(k.hafizayiGetir().map((m) => m.yol ?? '-'), ['-', 'bilgisayar', '-', 'api', '-', 'bilgisayar'])
  b2.ws.close()
  await bekle(50)
})

test('köprü cevap vermezse zaman aşımında API’ye düşer; hata dönerse de düşer', async () => {
  const b = sahteKopru('dogru-sifre', () => null) // sessiz köprü
  await b.acik
  await bekle(50)
  const t0 = Date.now()
  const c = await k.sor('saat kaç')
  assert.equal(c.yol, 'api')
  assert.ok(Date.now() - t0 >= 1400)
  b.ws.removeAllListeners('message')
  b.ws.on('message', (d) => {
    const m = JSON.parse(d.toString())
    b.ws.send(JSON.stringify({ tip: 'hata', id: m.id, hata: 'Claude Code oturumu açık değil (login)' }))
  })
  assert.equal((await k.sor('selam')).yol, 'api')
  b.ws.close()
  await bekle(50)
})

test('kartlı JSON cevap: sahne doğrulanır; geçersiz kart atılır; düz metin de kabul', async () => {
  const tarif = { name: 'Menemen', ingredients: [{ item: 'Yumurta', amount: '3' }], steps: ['Pişir'] }
  const b = sahteKopru('dogru-sifre', (istem) =>
    /tarif/.test(istem.split('Kullanıcının yeni mesajı:')[1])
      ? '```json\n' + JSON.stringify({ konusma: 'Tarif ekranda efendim.', sahne: { arac: 'present_recipe', veri: tarif } }) + '\n```'
      : JSON.stringify({ konusma: 'Kart bozuk efendim.', sahne: { arac: 'present_recipe', veri: { name: 'eksik' } } }),
  )
  await b.acik
  await bekle(50)
  const c = await k.sor('menemen tarifi')
  assert.equal(c.cevap, 'Tarif ekranda efendim.')
  assert.equal(c.sahne?.scene, 'recipe')
  assert.deepEqual((c.sahne?.data as { name: string }).name, 'Menemen')
  // Köprüye giden istemde kart talimatı ve şemalar var
  assert.match(b.gelen[0], /CEVAP BİÇİMİ/)
  assert.match(b.gelen[0], /present_fact_check: [\s\S]*?veri şeması: \{/)
  const bozuk = await k.sor('başka bir şey')
  assert.equal(bozuk.cevap, 'Kart bozuk efendim.')
  assert.equal(bozuk.sahne, undefined)
  // Hafızaya yalnızca konuşma metni girer
  assert.equal(k.hafizayiGetir().at(-3)!.metin, 'Tarif ekranda efendim.')
  b.ws.close()
  await bekle(50)
})

test('cevabiCoz: JSON öncesi/sonrası metin ve düz metin', () => {
  assert.deepEqual(k.cevabiCoz('Tamam: {"konusma":"Merhaba","sahne":null} bitti'), { konusma: 'Merhaba', sahne: undefined })
  assert.deepEqual(k.cevabiCoz('Sadece düz metin {değil}'), { konusma: 'Sadece düz metin {değil}' })
})

test('hafıza en fazla 20 mesaj tutar', async () => {
  for (let i = 0; i < 15; i++) await k.sor(`soru ${i}`)
  assert.equal(k.hafizayiGetir().length, 20)
  assert.equal(k.hafizayiGetir().at(-2)!.metin, 'soru 14')
  server.close()
})
