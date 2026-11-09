/**
 * RİTİM ALGILAMA (saf fonksiyon): ses örneklerinden vuruş zamanları ve BPM.
 * Yöntem: kısa pencerelerde enerji → artış (onset) eğrisi → 70–180 BPM aralığında
 * özilinti ile tempo → en güçlü başlangıç fazı → düzenli vuruş ızgarası.
 */
export function detectBeats(samples: Float32Array, sampleRate: number, maxDur = Infinity): { bpm: number; beats: number[] } {
  const hop = Math.round(sampleRate / 100) // 10 ms
  const n = Math.floor(Math.min(samples.length, maxDur * sampleRate) / hop)
  if (n < 50) return { bpm: 120, beats: [] }
  // Enerji ve pozitif artış (onset kuvveti)
  const energy = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    let s = 0
    for (let j = i * hop, e = j + hop; j < e; j++) s += samples[j] * samples[j]
    energy[i] = Math.sqrt(s / hop)
  }
  const onset = new Float32Array(n)
  for (let i = 1; i < n; i++) onset[i] = Math.max(0, energy[i] - energy[i - 1])
  // Tempo: özilinti (lag = kare/vuruş)
  let bestLag = 50
  let best = -Infinity
  for (let bpm = 70; bpm <= 180; bpm += 0.5) {
    const lag = 6000 / bpm // 10 ms karelerde
    let sum = 0
    for (let i = 0; i + lag * 4 < n; i += 1) {
      const a = onset[i]
      if (!a) continue
      sum += a * (onset[Math.round(i + lag)] + 0.5 * onset[Math.round(i + 2 * lag)] + 0.25 * onset[Math.round(i + 4 * lag)])
    }
    // Phonk/trap için 120–160 arasını hafifçe tercih et
    const w = bpm >= 120 && bpm <= 160 ? 1.05 : 1
    if (sum * w > best) {
      best = sum * w
      bestLag = lag
    }
  }
  const bpm = Math.round((6000 / bestLag) * 2) / 2
  // Faz: hangi başlangıçla vuruş ızgarası onset'lere en çok oturuyor
  let bestPhase = 0
  let bestScore = -Infinity
  for (let p = 0; p < bestLag; p++) {
    let sc = 0
    for (let i = p; i < n; i += bestLag) sc += onset[Math.round(i)] || 0
    if (sc > bestScore) {
      bestScore = sc
      bestPhase = p
    }
  }
  const beats: number[] = []
  for (let i = bestPhase; i < n; i += bestLag) beats.push(Math.round(i * 10) / 1000)
  return { bpm, beats }
}
