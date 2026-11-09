/**
 * BİLDİRİMLER — uygulama kapalıyken de hatırlatıcı / alarm
 * Servis çalışanı (public/sw.js) + Web Push. Telefon hatırlatıcı listesini her değişiklikte sunucuya
 * gönderir; sunucu zamanı gelince bildirim yollar.
 * iPhone'da yalnızca "Ana Ekrana Ekle" ile kurulmuş uygulamada çalışır (iOS 16.4+).
 */
import { backendConfigured } from './backend'
import { getStore } from './store'

const FLAG = 'jarvis.push'

export const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
export const isStandalone = () => matchMedia('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone === true
export const pushSupported = () => 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window

export function pushEnabled() {
  try {
    return pushSupported() && Notification.permission === 'granted' && localStorage.getItem(FLAG) === '1'
  } catch {
    return false
  }
}

let reg: Promise<ServiceWorkerRegistration | null> | null = null
export function registerSW() {
  if (!('serviceWorker' in navigator)) return Promise.resolve(null)
  reg ??= navigator.serviceWorker.register('/sw.js').catch(() => null)
  return reg
}

function api(path: string, body?: unknown) {
  const s = getStore().settings
  return fetch(s.apiUrl.replace(/\/+$/, '') + path, {
    method: body ? 'POST' : 'GET',
    headers: { 'content-type': 'application/json', 'x-jarvis-key': s.apiKey },
    body: body ? JSON.stringify(body) : undefined,
  })
}

const b64ToBytes = (b64: string) => {
  const s = atob(b64.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (b64.length % 4)) % 4))
  return Uint8Array.from(s, (c) => c.charCodeAt(0))
}

async function subscription(create: boolean) {
  const r = await registerSW()
  if (!r) return null
  const existing = await r.pushManager.getSubscription()
  if (existing || !create) return existing
  const { publicKey } = await (await api('/api/push/key')).json()
  return r.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToBytes(publicKey) })
}

/** Bildirimleri aç (bir düğmeye basınca çağrılmalı — tarayıcılar izni ancak dokunuşla sorar) */
export async function enablePush(): Promise<{ ok: boolean; message: string }> {
  if (!backendConfigured()) return { ok: false, message: 'Önce ayarlardan sunucu bağlantısını kurmanız gerekiyor efendim.' }
  if (isIOS() && !isStandalone())
    return { ok: false, message: 'iPhone’da bildirim için önce uygulamayı ana ekrana eklemelisiniz efendim: Safari’de Paylaş düğmesine, sonra Ana Ekrana Ekle’ye basın ve JARVIS’i oradan açın.' }
  if (!pushSupported()) return { ok: false, message: 'Bu tarayıcı bildirimleri desteklemiyor efendim. Chrome ya da Safari deneyin.' }
  const perm = await Notification.requestPermission()
  if (perm !== 'granted') return { ok: false, message: 'Bildirim izni verilmedi efendim. Telefon ayarlarından izin verebilirsiniz.' }
  try {
    const sub = await subscription(true)
    if (!sub) throw new Error('abonelik yok')
    localStorage.setItem(FLAG, '1')
    await syncPush()
    await api('/api/push/test', { subscription: sub.toJSON() })
    return { ok: true, message: 'Bildirimler açık efendim. Uygulama kapalıyken de hatırlatmalarınızı göndereceğim.' }
  } catch (e) {
    return { ok: false, message: `Bildirim kurulamadı efendim (${(e as Error).message}).` }
  }
}

let timer: ReturnType<typeof setTimeout> | undefined
/** Hatırlatıcı/alarm listesini sunucuya gönder (değişiklikleri biriktirip 0,5 sn sonra) */
export function syncPush() {
  clearTimeout(timer)
  return new Promise<void>((resolve) => {
    timer = setTimeout(async () => {
      try {
        if (!pushEnabled() || !backendConfigured()) return
        const sub = await subscription(false)
        if (!sub) return
        const { reminders, timers } = getStore()
        const items = [
          ...reminders.filter((r) => !r.done).map((r) => ({ id: r.id, title: 'J.A.R.V.I.S. hatırlatma', body: r.text, at: r.at })),
          // Kısa zamanlayıcılar uygulama açıkken zaten çalar; 1 dakikadan uzunlar ve alarmlar bildirim olarak da gider
          ...timers.filter((t) => t.kind === 'alarm' || t.total >= 60).map((t) => ({ id: t.id, title: 'J.A.R.V.I.S.', body: t.kind === 'alarm' ? `⏰ Alarm: ${t.label}` : `⏱ Süre doldu: ${t.label}`, at: t.end })),
        ]
        await api('/api/push/sync', { subscription: sub.toJSON(), items })
      } catch {
        /* çevrimdışı: bir sonraki değişiklikte tekrar denenir */
      } finally {
        resolve()
      }
    }, 500)
  })
}
