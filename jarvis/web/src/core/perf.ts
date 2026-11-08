/**
 * Performans modu: zayıf cihazlarda efektleri otomatik azaltır.
 * 1) Donanım ipuçları (çekirdek sayısı, bellek, reduced-motion)
 * 2) Çalışırken FPS ölçümü: ortalama 40'ın altına düşerse düşük moda geç.
 */
import { setStore } from './store'

export function startPerfMonitor() {
  const nav = navigator as Navigator & { deviceMemory?: number }
  const weak =
    (nav.hardwareConcurrency && nav.hardwareConcurrency <= 4) ||
    (nav.deviceMemory && nav.deviceMemory <= 3) ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (weak) setStore({ lowPerf: true })

  let frames = 0
  let last = performance.now()
  let slowWindows = 0
  const loop = (now: number) => {
    frames++
    if (now - last >= 2000) {
      const fps = (frames * 1000) / (now - last)
      frames = 0
      last = now
      // Sekme arka plandayken ölçüm anlamsız
      if (document.visibilityState === 'visible') {
        slowWindows = fps < 40 ? slowWindows + 1 : 0
        if (slowWindows >= 2) setStore({ lowPerf: true })
      }
    }
    requestAnimationFrame(loop)
  }
  requestAnimationFrame(loop)
}
