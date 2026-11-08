/**
 * Backend bağlantısı (2. aşama)
 * Ayarlarda sunucu adresi + uygulama anahtarı girilmişse sorular gerçek beyne
 * (Claude) gider; olaylar SSE ile akar ve sırayla oynatılır. Girilmemişse demo modu.
 */
import { getStore, pushMessage } from './store'
import type { JarvisEvent } from './types'
import { play } from './player'

export function backendConfigured() {
  const s = getStore().settings
  return !!(s.apiUrl && s.apiKey)
}

function base() {
  return getStore().settings.apiUrl.replace(/\/+$/, '')
}
function headers() {
  return { 'content-type': 'application/json', 'x-jarvis-key': getStore().settings.apiKey }
}

/** Sohbet kimliği: sayfa yenilenince yeni sohbet başlar */
const conversationId = Math.random().toString(36).slice(2)
let current: AbortController | null = null

export function cancelBackend() {
  current?.abort()
  current = null
}

export async function askBackend(text: string) {
  cancelBackend()
  const ac = new AbortController()
  current = ac
  pushMessage('user', text)
  play({ type: 'state', state: 'thinking' })
  try {
    const r = await fetch(`${base()}/api/chat`, { method: 'POST', headers: headers(), body: JSON.stringify({ text, conversationId }), signal: ac.signal })
    if (!r.ok || !r.body) throw new Error(r.status === 401 ? 'Uygulama anahtarı hatalı.' : `Sunucu hatası (${r.status}).`)
    const reader = r.body.pipeThrough(new TextDecoderStream()).getReader()
    let buf = ''
    for (;;) {
      const { value, done } = await reader.read()
      if (done) break
      buf += value
      let i: number
      while ((i = buf.indexOf('\n\n')) >= 0) {
        const chunk = buf.slice(0, i)
        buf = buf.slice(i + 2)
        const line = chunk.split('\n').find((l) => l.startsWith('data: '))
        if (line) play(JSON.parse(line.slice(6)) as JarvisEvent)
      }
    }
  } catch (e) {
    if (ac.signal.aborted) return
    play([
      { type: 'state', state: 'error', message: (e as Error).message || 'Sunucuya ulaşılamadı.' },
      { type: 'say', text: 'Sunucuya ulaşamıyorum efendim. Bağlantıyı kontrol eder misiniz?' },
      { type: 'end' },
    ])
  }
}

/** Sunucunun sağlık durumu (açılış ekranındaki kontroller için) */
export async function fetchHealth(): Promise<{ ai: boolean; tts: boolean } | null> {
  if (!backendConfigured()) return null
  try {
    const r = await fetch(`${base()}/health`, { signal: AbortSignal.timeout(2500) })
    const j = await r.json()
    return j.services
  } catch {
    return null
  }
}

/** ElevenLabs sesi (varsa) — yoksa null döner ve tarayıcı sesi kullanılır */
export async function fetchTTS(text: string): Promise<Blob | null> {
  if (!backendConfigured()) return null
  try {
    const r = await fetch(`${base()}/api/tts`, { method: 'POST', headers: headers(), body: JSON.stringify({ text }), signal: AbortSignal.timeout(15000) })
    if (r.status !== 200) return null
    return await r.blob()
  } catch {
    return null
  }
}
