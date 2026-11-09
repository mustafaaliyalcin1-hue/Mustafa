/**
 * ZAMANLAYICI · ALARM · HATIRLATICI (telefonda çalışır, sunucu gerekmez)
 * Uygulama açıkken süreyi sayar, zamanı gelince alarm çalar + sesli uyarı + sahne.
 * Hatırlatıcılar telefonda saklanır (localStorage); izin verilmişse bildirim de gösterilir.
 * Not: Tarayıcılar uygulama kapalıyken çalıştırmaz; o yüzden uzun vadeli hatırlatma için uygulama açık olmalı.
 */
import { play } from './player'
import { sfx } from './sfx'
import { getStore, setStore } from './store'

export interface Timer {
  id: string
  kind: 'timer' | 'alarm'
  label: string
  end: number // ms
  total: number // sn
}
export interface Reminder {
  id: string
  text: string
  at: number // ms
  done?: boolean
}

const load = <T,>(k: string): T[] => {
  try {
    return JSON.parse(localStorage.getItem(k) || '[]')
  } catch {
    return []
  }
}
const save = (k: string, v: unknown) => {
  try {
    localStorage.setItem(k, JSON.stringify(v))
  } catch {
    /* gizli sekme */
  }
}

export function initTimekeeper() {
  setStore({ timers: load<Timer>('jarvis.timers').filter((t) => t.end > Date.now() - 60_000), reminders: load<Reminder>('jarvis.reminders') })
  setInterval(tick, 500)
}

const uid = () => Math.random().toString(36).slice(2, 9)

export function addTimer(kind: Timer['kind'], seconds: number, label: string) {
  const t: Timer = { id: uid(), kind, label, end: Date.now() + seconds * 1000, total: seconds }
  const timers = [...getStore().timers, t]
  setStore({ timers })
  save('jarvis.timers', timers)
  return t
}
export function cancelTimers() {
  const n = getStore().timers.length
  setStore({ timers: [] })
  save('jarvis.timers', [])
  return n
}
export function addReminder(text: string, at: number) {
  const r: Reminder = { id: uid(), text, at }
  const reminders = [...getStore().reminders, r].sort((a, b) => a.at - b.at)
  setStore({ reminders })
  save('jarvis.reminders', reminders)
  // Bildirim izni (bir kez sorulur)
  if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission().catch(() => {})
  return r
}
export function removeReminder(id: string) {
  const reminders = getStore().reminders.filter((r) => r.id !== id)
  setStore({ reminders })
  save('jarvis.reminders', reminders)
}
export function upcoming() {
  return getStore().reminders.filter((r) => !r.done && r.at > Date.now() - 3600e3)
}

let ringing = 0
function ring(times = 6) {
  ringing = times
  const beep = () => {
    if (ringing-- <= 0) return
    sfx('alarm')
    setTimeout(beep, 700)
  }
  beep()
}

function notify(title: string, body: string) {
  try {
    if ('Notification' in window && Notification.permission === 'granted') new Notification(title, { body, icon: '/favicon.svg' })
  } catch {
    /* iOS'ta yalnızca ana ekrana eklenmiş uygulamada */
  }
}

function tick() {
  const now = Date.now()
  const { timers, reminders } = getStore()
  const due = timers.filter((t) => t.end <= now)
  if (due.length) {
    const rest = timers.filter((t) => t.end > now)
    setStore({ timers: rest })
    save('jarvis.timers', rest)
    for (const t of due) {
      ring()
      notify('J.A.R.V.I.S.', t.kind === 'alarm' ? `Alarm: ${t.label}` : `Süre doldu: ${t.label}`)
      play([{ type: 'scene', scene: 'timer', data: { done: true, label: t.label, kind: t.kind }, hold: 2000 }, { type: 'say', text: t.kind === 'alarm' ? `Alarm efendim. ${t.label === 'Alarm' ? 'Kalkma vakti.' : t.label}` : `Süre doldu efendim${t.label && t.label !== 'Zamanlayıcı' ? `: ${t.label}` : ''}.` }, { type: 'end' }])
    }
  }
  const dueR = reminders.filter((r) => !r.done && r.at <= now)
  if (dueR.length) {
    const upd = reminders.map((r) => (dueR.includes(r) ? { ...r, done: true } : r))
    setStore({ reminders: upd })
    save('jarvis.reminders', upd)
    for (const r of dueR) {
      ring(3)
      notify('J.A.R.V.I.S. hatırlatma', r.text)
      play([{ type: 'scene', scene: 'calendar', data: { action: 'due', focus: r, items: upcoming() }, hold: 2500 }, { type: 'say', text: `Hatırlatma efendim: ${r.text}.` }, { type: 'end' }])
    }
  }
}
