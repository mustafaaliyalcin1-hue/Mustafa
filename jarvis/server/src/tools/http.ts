/** Ortak HTTP yardımcıları (zaman aşımı + anlaşılır hata) */
/** Bazı açık veri uçları tanımadığı istemcileri reddediyor → standart tarayıcı kimliği */
export const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36'

export async function getJson<T = any>(url: string, timeout = 8000): Promise<T> { // eslint-disable-line @typescript-eslint/no-explicit-any
  const r = await fetch(url, { signal: AbortSignal.timeout(timeout), headers: { 'user-agent': UA, accept: 'application/json, text/plain, */*', 'accept-language': 'tr-TR,tr;q=0.9,en;q=0.8' } })
  if (!r.ok) throw new Error(`Veri kaynağı yanıt vermedi (HTTP ${r.status}). Gerekirse web_search ile ara.`)
  return r.json() as Promise<T>
}

export async function getText(url: string, timeout = 8000) {
  const r = await fetch(url, { signal: AbortSignal.timeout(timeout), headers: { 'user-agent': UA, 'accept-language': 'tr-TR,tr;q=0.9,en;q=0.8' } })
  if (!r.ok) throw new Error(`Veri kaynağı yanıt vermedi (HTTP ${r.status}). Gerekirse web_search ile ara.`)
  return r.text()
}
