/**
 * Arayüze giden olaylar (web/src/core/types.ts ile birebir aynı sözleşme).
 * Her araç çağrısı bir 'scene' olayı üretir; arayüz animasyonu buna göre seçer.
 */
export type AssistantState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'success' | 'error'

export type JarvisEvent =
  | { type: 'state'; state: AssistantState; message?: string }
  | { type: 'scene'; scene: string; data?: unknown; hold?: number }
  | { type: 'say'; text: string }
  | { type: 'end' }

export type Emit = (e: JarvisEvent) => void
