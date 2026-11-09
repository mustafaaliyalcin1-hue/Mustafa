/** YouTube yükleme zinciri (sahte Google uçlarıyla): video kaydet → erişim anahtarı → resumable başlat → PUT */
import assert from 'node:assert/strict'
import os from 'node:os'
import path from 'node:path'
import { Readable } from 'node:stream'
import { test } from 'node:test'

process.env.GOOGLE_CLIENT_ID = 'cid'
process.env.GOOGLE_CLIENT_SECRET = 'csec'
process.env.YOUTUBE_REFRESH_TOKEN = 'rt-1'
process.env.UPLOAD_DIR = path.join(os.tmpdir(), 'jarvis-up-' + process.pid)

test('YouTube: video yükleme akışı', async () => {
  const { saveUpload } = await import('./media.ts')
  const { uploadVideo, youtubeConnected, authUrl } = await import('./youtube.ts')
  assert.equal(youtubeConnected(), true)
  assert.match(authUrl('s1'), /accounts\.google\.com.*youtube\.upload.*state=s1/)

  const f = await saveUpload(Readable.from([Buffer.alloc(1000, 1), Buffer.alloc(500, 2)]), 'tatil.mp4', 'video/mp4')
  assert.equal(f.size, 1500)

  const calls: { url: string; method: string; body?: string; headers: Record<string, string> }[] = []
  const real = globalThis.fetch
  globalThis.fetch = (async (url: string, init: RequestInit = {}) => {
    const u = String(url)
    let body = ''
    if (typeof init.body === 'string') body = init.body
    else if (init.body instanceof URLSearchParams) body = init.body.toString()
    else if (init.body) {
      // akış gövdesini oku
      const chunks: Uint8Array[] = []
      for await (const c of init.body as unknown as AsyncIterable<Uint8Array>) chunks.push(c)
      body = `bytes:${chunks.reduce((n, c) => n + c.length, 0)}`
    }
    calls.push({ url: u, method: init.method || 'GET', body, headers: Object.fromEntries(Object.entries((init.headers as Record<string, string>) || {})) })
    if (u.includes('oauth2.googleapis.com/token')) return new Response(JSON.stringify({ access_token: 'at-1', expires_in: 3600 }))
    if (u.includes('uploadType=resumable')) return new Response('', { status: 200, headers: { location: 'https://upload.example/session-1' } })
    if (u === 'https://upload.example/session-1') return new Response(JSON.stringify({ id: 'vid123', status: { privacyStatus: 'private', uploadStatus: 'uploaded' } }))
    return new Response('yok', { status: 404 })
  }) as typeof fetch
  try {
    const r = await uploadVideo({ mediaId: f.id, title: 'Tatil videosu', description: 'Güzel bir gün', privacy: 'unlisted', tags: ['tatil'] })
    assert.deepEqual(r, { id: 'vid123', url: 'https://youtu.be/vid123', privacy: 'private' })
    // 1) yenileme anahtarıyla erişim anahtarı
    assert.match(calls[0].body!, /grant_type=refresh_token/)
    assert.match(calls[0].body!, /refresh_token=rt-1/)
    // 2) resumable başlatma: başlık + gizlilik
    const meta = JSON.parse(calls[1].body!)
    assert.equal(meta.snippet.title, 'Tatil videosu')
    assert.equal(meta.status.privacyStatus, 'unlisted')
    assert.equal(calls[1].headers.authorization, 'Bearer at-1')
    assert.equal(calls[1].headers['x-upload-content-length'], '1500')
    // 3) dosyanın tamamı gönderildi
    assert.equal(calls[2].method, 'PUT')
    assert.equal(calls[2].body, 'bytes:1500')
  } finally {
    globalThis.fetch = real
  }
})
