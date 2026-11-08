/** Ortak HTTP yardımcıları (zaman aşımı + anlaşılır hata) */
export async function getJson<T = any>(url: string, timeout = 8000): Promise<T> { // eslint-disable-line @typescript-eslint/no-explicit-any
  const r = await fetch(url, { signal: AbortSignal.timeout(timeout), headers: { 'user-agent': 'JarvisAssistant/1.0', accept: 'application/json' } })
  if (!r.ok) throw new Error(`Veri kaynağı yanıt vermedi (HTTP ${r.status}). Gerekirse web_search ile ara.`)
  return r.json() as Promise<T>
}

export async function getText(url: string, timeout = 8000) {
  const r = await fetch(url, { signal: AbortSignal.timeout(timeout), headers: { 'user-agent': 'JarvisAssistant/1.0' } })
  if (!r.ok) throw new Error(`Veri kaynağı yanıt vermedi (HTTP ${r.status}). Gerekirse web_search ile ara.`)
  return r.text()
}
