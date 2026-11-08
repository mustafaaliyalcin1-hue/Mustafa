/**
 * Olay oynatıcı: Gelen JarvisEvent'leri SIRAYLA işler.
 * - Birden fazla adım varsa animasyonlar sırayla akar (önce araştırma, sonra sonuç).
 * - 'say' olayı seslendirme bitene kadar bekletir → animasyon ve ses senkron.
 * - 'scene' olayı en az `hold` (ya da registry'deki minDuration) kadar ekranda kalır.
 * - interrupt(): kuyruğu ve konuşmayı anında keser (barge-in).
 */
import { getScene } from '../animations/registry'
import { sfx } from './sfx'
import { getStore, pushMessage, setStore } from './store'
import type { AssistantState, JarvisEvent } from './types'
import { speak, stopSpeaking } from './voice'

let queue: JarvisEvent[] = []
let running = false
let generation = 0
let sceneKey = 1

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

export function setState(state: AssistantState, message?: string) {
  setStore({ state, stateMessage: message })
  if (state === 'success') sfx('success')
  if (state === 'error') sfx('error')
}

export function play(events: JarvisEvent | JarvisEvent[]) {
  queue.push(...(Array.isArray(events) ? events : [events]))
  if (!running) run()
}

/** Her şeyi durdur: kuyruk, konuşma, sahne. */
export function interrupt() {
  generation++
  queue = []
  running = false
  stopSpeaking()
}

export function closeScene() {
  setStore({ scene: null })
}

async function run() {
  running = true
  const gen = generation
  while (queue.length && gen === generation) {
    const ev = queue.shift()!
    await handle(ev)
  }
  if (gen === generation) running = false
}

async function handle(ev: JarvisEvent) {
  switch (ev.type) {
    case 'user':
      pushMessage('user', ev.text)
      break
    case 'state':
      setState(ev.state, ev.message)
      if (ev.state === 'success' || ev.state === 'error') await wait(1400)
      break
    case 'scene': {
      const def = getScene(ev.scene)
      sfx('whoosh')
      setStore({ scene: { id: def.id, data: ev.data ?? def.demo?.[0]?.data, key: sceneKey++ } })
      await wait(ev.hold ?? def.minDuration ?? 2500)
      break
    }
    case 'say':
      pushMessage('jarvis', ev.text)
      setState('speaking')
      await speak(ev.text)
      break
    case 'end':
      // Sahne açıksa bir süre daha görünür kalsın (sonucu okuyabilmek için), sonra kapansın
      setState('idle')
      {
        const k = getStore().scene?.key
        if (k) setTimeout(() => getStore().scene?.key === k && closeScene(), 9000)
      }
      break
  }
}
