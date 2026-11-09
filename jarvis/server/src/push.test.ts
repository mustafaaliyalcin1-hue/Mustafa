import assert from 'node:assert/strict'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'

process.env.DATA_DIR = path.join(os.tmpdir(), 'jarvis-push-' + process.pid)
const { deriveVapid, syncDevice, pushStats } = await import('./push.ts')

test('VAPID anahtarı sırdan sabit ve geçerli türetilir', () => {
  const a = deriveVapid('gizli'), b = deriveVapid('gizli'), c = deriveVapid('baska')
  assert.deepEqual(a, b)
  assert.notEqual(a.publicKey, c.publicKey)
  assert.equal(Buffer.from(a.publicKey, 'base64url').length, 65)
  assert.equal(Buffer.from(a.privateKey, 'base64url').length, 32)
})

test('senkronda geçmiş/bozuk kayıtlar atılır, geçersiz abonelik reddedilir', () => {
  const sub = { endpoint: 'https://push.example/abc', keys: { p256dh: 'x', auth: 'y' } }
  const now = Date.now()
  const n = syncDevice(sub, [{ id: '1', title: 'T', body: 'diş', at: now + 60_000 }, { id: '2', title: 'T', body: 'eski', at: now - 3600e3 }, { id: '3' } as never])
  assert.equal(n, 1)
  assert.deepEqual(pushStats(), { devices: 1, pending: 1 })
  assert.throws(() => syncDevice({ endpoint: 'http://kotu', keys: { p256dh: 'x', auth: 'y' } }, []))
})
