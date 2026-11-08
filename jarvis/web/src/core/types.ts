/**
 * J.A.R.V.I.S. olay protokolü
 * ---------------------------------------------------------------
 * Backend (2. aşamadan itibaren) her adımda frontend'e bu olaylardan
 * birini SSE/WebSocket ile gönderir. Demo modunda ise `demo/mockBrain.ts`
 * aynı olayları sahte verilerle üretir. Böylece arayüz, olayın nereden
 * geldiğini bilmeden aynı şekilde çalışır.
 */

/** Asistanın temel durumları (merkezdeki ark reaktörü bunlara göre davranır). */
export type AssistantState = 'booting' | 'idle' | 'listening' | 'thinking' | 'speaking' | 'success' | 'error'

export type JarvisEvent =
  /** Temel durumu değiştir. */
  | { type: 'state'; state: AssistantState; message?: string }
  /** Konuya özel bir sahne (animasyon) oynat. `scene` registry'deki kimliktir. */
  | { type: 'scene'; scene: string; data?: unknown; /** sahnenin en az ne kadar ekranda kalacağı (ms) */ hold?: number }
  /** Jarvis'in söylediği cümle (sesli okunur + altyazı). */
  | { type: 'say'; text: string }
  /** Kullanıcının söylediği/yazdığı metin (sohbet geçmişi için). */
  | { type: 'user'; text: string }
  /** Akış bitti; sahne kapanır, boşta durumuna dönülür. */
  | { type: 'end' }

export interface ChatMessage {
  id: number
  role: 'user' | 'jarvis'
  text: string
  at: number
}
