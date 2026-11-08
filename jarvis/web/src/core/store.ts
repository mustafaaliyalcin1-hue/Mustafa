/**
 * Hafif global durum deposu (harici kütüphane yok).
 * React bileşenleri `useJarvis(selector)` ile abone olur.
 */
import { useSyncExternalStore } from 'react'
import type { AssistantState, ChatMessage } from './types'

export type PerfMode = 'auto' | 'high' | 'low'

export interface JarvisStore {
  state: AssistantState
  /** Durumla ilgili kısa mesaj (ör. hata açıklaması) */
  stateMessage?: string
  /** Şu an oynayan konu sahnesi */
  scene: { id: string; data?: unknown; key: number } | null
  /** Konuşma altyazısı: tüm cümle + şu ana kadar okunan kelime sayısı */
  subtitle: { text: string; shown: number } | null
  messages: ChatMessage[]
  settings: { sound: boolean; voice: boolean; perf: PerfMode; apiUrl: string; apiKey: string }
  /** auto modda tespit edilen gerçek seviye */
  lowPerf: boolean
  demo: boolean
}

const saved = (() => {
  try {
    return JSON.parse(localStorage.getItem('jarvis.settings') || 'null')
  } catch {
    return null
  }
})()

let store: JarvisStore = {
  state: 'booting',
  scene: null,
  subtitle: null,
  messages: [],
  settings: { sound: true, voice: true, perf: 'auto', apiUrl: import.meta.env.VITE_JARVIS_API_URL || '', apiKey: '', ...(saved || {}) },
  lowPerf: false,
  demo: true,
}

const listeners = new Set<() => void>()

export function getStore() {
  return store
}

export function setStore(patch: Partial<JarvisStore> | ((s: JarvisStore) => Partial<JarvisStore>)) {
  const p = typeof patch === 'function' ? patch(store) : patch
  store = { ...store, ...p }
  if (p.settings) {
    try {
      localStorage.setItem('jarvis.settings', JSON.stringify(store.settings))
    } catch {
      /* gizli sekme vb. */
    }
  }
  listeners.forEach((l) => l())
}

function subscribe(l: () => void) {
  listeners.add(l)
  return () => listeners.delete(l)
}

export function useJarvis<T>(selector: (s: JarvisStore) => T): T {
  return useSyncExternalStore(subscribe, () => selector(store))
}

let msgId = 1
export function pushMessage(role: ChatMessage['role'], text: string) {
  setStore((s) => ({ messages: [...s.messages.slice(-60), { id: msgId++, role, text, at: Date.now() }] }))
}

/** Efektlerin azaltılması gerekiyor mu? (ayar + otomatik tespit) */
export function isLowPerf(s: JarvisStore = store) {
  return s.settings.perf === 'low' || (s.settings.perf === 'auto' && s.lowPerf)
}

/**
 * Ses seviyesi (0..1). Her karede değiştiği için React state'e değil,
 * doğrudan değiştirilebilir bir nesneye yazılır; 3D sahne her karede okur.
 */
export const audioLevel = { mic: 0, voice: 0 }
