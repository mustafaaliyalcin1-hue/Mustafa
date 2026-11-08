/** Komut çözücü sözleşmesi */
import type { Emit } from '../events.ts'
import type { Norm } from './text.ts'

/** Takip soruları için sohbetin son komut bağlamı ("peki yarın?", "ya Galatasaray?") */
export interface IntentContext {
  last?: { intent: string; params: Record<string, unknown>; at: number }
}

export interface Intent<P extends Record<string, unknown> = Record<string, unknown>> {
  name: string
  /** Metin bu komuta uyuyorsa parametreleri döndür, uymuyorsa null */
  detect: (n: Norm, ctx: IntentContext) => P | null
  /** Takip sorusu: önceki parametrelerle birleştir (yeni varlık bulunduysa) */
  followUp?: (n: Norm, prev: P) => P | null
  /** Çalıştır: sahneleri yayınla, söylenecek cevabı döndür */
  run: (params: P, emit: Emit) => Promise<string>
}
