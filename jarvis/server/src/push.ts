/**
 * BİLDİRİM (Web Push) — uygulama kapalıyken de hatırlatıcı/alarm bildirimi
 * ---------------------------------------------------------------
 * Telefon, kendi hatırlatıcı listesini her değişiklikte buraya gönderir (sync). Sunucu her 15 sn'de bir
 * zamanı geleni bulur ve telefona bildirim yollar. Telefon listenin asıl sahibidir: sunucu yeniden başlarsa
 * uygulama açıldığında liste tekrar gelir.
 *
 * VAPID anahtarları ayrıca kurulum gerektirmesin diye JARVIS_APP_SECRET'tan türetilir (hep aynı kalır).
 * İstenirse VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY ortam değişkenleriyle verilebilir.
 */
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import webpush from 'web-push'
import { config } from './config.ts'

export interface PushItem {
  id: string
  title: string
  body: string
  at: number // ms
}
interface Device {
  sub: webpush.PushSubscription
  items: PushItem[]
  seen: number
}

const b64u = (b: Buffer) => b.toString('base64url')

/** Sırdan sabit bir P-256 anahtar çifti türet */
export function deriveVapid(secret: string) {
  for (let i = 0; i < 16; i++) {
    const priv = crypto.createHmac('sha256', 'jarvis-vapid').update(`${secret}:${i}`).digest()
    try {
      const ecdh = crypto.createECDH('prime256v1')
      ecdh.setPrivateKey(priv)
      return { publicKey: b64u(ecdh.getPublicKey()), privateKey: b64u(priv) }
    } catch {
      /* geçersiz skaler (çok nadir) → sıradaki */
    }
  }
  throw new Error('VAPID anahtarı türetilemedi')
}

const keys =
  process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY
    ? { publicKey: process.env.VAPID_PUBLIC_KEY, privateKey: process.env.VAPID_PRIVATE_KEY }
    : deriveVapid(config.appSecret || 'jarvis-dev')
webpush.setVapidDetails('mailto:jarvis@example.com', keys.publicKey, keys.privateKey)

export const vapidPublicKey = keys.publicKey

// ---------------------------------------------------------------- cihazlar (kalıcı dosya, en iyi çaba)
const file = path.join(config.dataDir, 'push.json')
const devices = new Map<string, Device>()
try {
  for (const d of JSON.parse(fs.readFileSync(file, 'utf8')) as Device[]) devices.set(d.sub.endpoint, d)
} catch {
  /* ilk çalıştırma */
}
function persist() {
  try {
    fs.mkdirSync(config.dataDir, { recursive: true })
    fs.writeFileSync(file, JSON.stringify([...devices.values()]))
  } catch {
    /* disk yoksa bellekte kalır */
  }
}

export function syncDevice(sub: webpush.PushSubscription, items: PushItem[]) {
  if (!sub?.endpoint || !/^https:\/\//.test(sub.endpoint) || !sub.keys?.p256dh || !sub.keys?.auth) throw new Error('Geçersiz abonelik')
  const now = Date.now()
  const clean = items
    .filter((x) => x && typeof x.at === 'number' && x.at > now - 60_000 && x.at < now + 400 * 864e5)
    .slice(0, 200)
    .map((x) => ({ id: String(x.id).slice(0, 40), title: String(x.title || 'J.A.R.V.I.S.').slice(0, 80), body: String(x.body || '').slice(0, 300), at: x.at }))
  devices.set(sub.endpoint, { sub, items: clean, seen: now })
  if (devices.size > 50) {
    // en eski cihazı at
    const oldest = [...devices.values()].sort((a, b) => a.seen - b.seen)[0]
    devices.delete(oldest.sub.endpoint)
  }
  persist()
  return clean.length
}

export async function sendPush(sub: webpush.PushSubscription, payload: { title: string; body: string; tag?: string }) {
  return webpush.sendNotification(sub, JSON.stringify(payload), { TTL: 3600, urgency: 'high' })
}

/** Zamanı geleni gönder (dışarıdan da çağrılabilir: /cron/tick) */
export async function pushTick(now = Date.now()) {
  let sent = 0
  let changed = false
  for (const d of devices.values()) {
    const due = d.items.filter((x) => x.at <= now)
    if (!due.length) continue
    d.items = d.items.filter((x) => x.at > now)
    changed = true
    for (const x of due) {
      try {
        await sendPush(d.sub, { title: x.title, body: x.body, tag: x.id })
        sent++
      } catch (e) {
        const code = (e as { statusCode?: number }).statusCode
        if (code === 404 || code === 410) devices.delete(d.sub.endpoint) // abonelik iptal edilmiş
        else console.warn('Bildirim gönderilemedi:', code || (e as Error).message)
      }
    }
  }
  if (changed) persist()
  return sent
}

export function startPushLoop() {
  setInterval(() => pushTick().catch(() => {}), 15_000).unref()
}

export function pushStats() {
  return { devices: devices.size, pending: [...devices.values()].reduce((n, d) => n + d.items.length, 0) }
}
