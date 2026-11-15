// Köprüyü sahte bir Minecraft websocket istemcisiyle dener (Claude anahtarı olmadan basit modda).
import { test } from 'node:test'
import assert from 'node:assert'
import { spawn } from 'node:child_process'
import WebSocket from 'ws'

test('köprü: sohbet → scriptevent komutu', { timeout: 20000 }, async () => {
  const kopru = spawn('node', ['bedrock/kopru.js'], { env: { ...process.env, ANTHROPIC_API_KEY: '', ANTHROPIC_AUTH_TOKEN: '', KOPRU_PORT: '3911' } })
  await new Promise((r) => kopru.stdout.on('data', (d) => /hazır/.test(d) && r()))
  const ws = new WebSocket('ws://localhost:3911')
  const komutlar = []
  let abone = false
  ws.on('message', (ham) => {
    const m = JSON.parse(ham)
    if (m.header.messagePurpose === 'subscribe') abone = m.body.eventName === 'PlayerMessage'
    if (m.header.messagePurpose === 'commandRequest') {
      komutlar.push(m.body.commandLine)
      ws.send(JSON.stringify({ header: { requestId: m.header.requestId, messagePurpose: 'commandResponse' }, body: { statusCode: 0, statusMessage: 'ok' } }))
    }
  })
  await new Promise((r) => ws.on('open', r))
  await new Promise((r) => setTimeout(r, 300))
  ws.send(JSON.stringify({ header: { eventName: 'PlayerMessage', messagePurpose: 'event' }, body: { message: 'bana elmas bul reis', sender: 'Mustafa', type: 'chat' } }))
  ws.send(JSON.stringify({ header: { eventName: 'PlayerMessage', messagePurpose: 'event' }, body: { message: 'kendi mesajım', sender: 'Yardımcı', type: 'chat' } }))
  await new Promise((r) => setTimeout(r, 800))
  ws.close(); kopru.kill()
  assert.ok(abone, 'PlayerMessage aboneliği yapılmalı')
  const gorev = komutlar.find((k) => k.startsWith('scriptevent yardimci:gorev'))
  assert.ok(gorev, 'görev komutu gitmeli: ' + komutlar.join(' | '))
  assert.deepStrictEqual(JSON.parse(gorev.replace('scriptevent yardimci:gorev ', '')), { gorev: 'maden_bul', cevher: 'diamond', adet: 3 })
  assert.strictEqual(komutlar.filter((k) => k.startsWith('scriptevent yardimci:gorev')).length, 1, 'kendi mesajına cevap vermemeli')
})
