/** Basit bellek önbelleği: aynı veriyi kısa sürede tekrar istemeyelim (paylaşılan IP kotalarını korur) */
const store = new Map<string, { at: number; v: Promise<unknown> }>()

export function cached<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
  const hit = store.get(key)
  if (hit && Date.now() - hit.at < ttlMs) return hit.v as Promise<T>
  const v = fn()
  store.set(key, { at: Date.now(), v })
  // Hata önbelleğe kalmasın
  v.catch(() => store.get(key)?.v === v && store.delete(key))
  if (store.size > 500) store.delete(store.keys().next().value!)
  return v
}

export function clearCache() {
  store.clear()
}
