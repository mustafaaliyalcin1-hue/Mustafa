/**
 * Paylaşılan 2D Canvas partikül motoru.
 * Türler: yağmur, kar, yaprak (rüzgâr), yıldız, konfeti, toz, soru işareti.
 * Sahneler bunu arka plan efekti olarak kullanır; düşük performans modunda
 * partikül sayısı otomatik azalır.
 */
import { useEffect, useRef } from 'react'

export type ParticleKind = 'rain' | 'snow' | 'leaves' | 'stars' | 'confetti' | 'dust' | 'question' | 'embers'

interface P {
  x: number
  y: number
  vx: number
  vy: number
  s: number
  a: number
  r: number
  vr: number
  c: string
  life: number
}

const COUNT: Record<ParticleKind, number> = { rain: 420, snow: 220, leaves: 60, stars: 260, confetti: 220, dust: 120, question: 40, embers: 90 }

export default function ParticleCanvas({ kind, low = false, density = 1, colors, className = '' }: { kind: ParticleKind; low?: boolean; density?: number; colors?: string[]; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const cv = ref.current!
    const ctx = cv.getContext('2d')!
    let w = 0
    let h = 0
    const dpr = low ? 1 : Math.min(2, window.devicePixelRatio || 1)
    const resize = () => {
      w = cv.clientWidth
      h = cv.clientHeight
      cv.width = w * dpr
      cv.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const pal = colors || ['#ffd23e', '#1b4fff', '#3ee8ff', '#ff3b8d', '#39ff9a', '#ffffff']
    const n = Math.round(COUNT[kind] * density * (low ? 0.35 : 1))
    const spawn = (init: boolean): P => {
      const p: P = { x: Math.random() * w, y: init ? Math.random() * h : -20, vx: 0, vy: 0, s: 1, a: 1, r: Math.random() * 6, vr: 0, c: pal[(Math.random() * pal.length) | 0], life: 1 }
      switch (kind) {
        case 'rain':
          p.vy = 900 + Math.random() * 500
          p.vx = -120
          p.s = 10 + Math.random() * 18
          p.a = 0.25 + Math.random() * 0.45
          break
        case 'snow':
          p.vy = 30 + Math.random() * 60
          p.vx = (Math.random() - 0.5) * 30
          p.s = 1.5 + Math.random() * 3.5
          p.a = 0.5 + Math.random() * 0.5
          break
        case 'leaves':
          p.x = init ? Math.random() * w : -30
          p.y = Math.random() * h
          p.vx = 260 + Math.random() * 260
          p.vy = (Math.random() - 0.5) * 80
          p.s = 6 + Math.random() * 8
          p.vr = (Math.random() - 0.5) * 8
          p.c = ['#9be36b', '#e3b33f', '#d2702c', '#c7e38f'][(Math.random() * 4) | 0]
          break
        case 'stars':
          p.y = Math.random() * h * 0.8
          p.s = Math.random() * 1.6 + 0.3
          p.r = Math.random() * Math.PI * 2
          p.vr = 1 + Math.random() * 3
          break
        case 'confetti':
          p.y = init ? -Math.random() * h : -20
          p.vy = 120 + Math.random() * 220
          p.vx = (Math.random() - 0.5) * 160
          p.s = 5 + Math.random() * 6
          p.vr = (Math.random() - 0.5) * 12
          break
        case 'dust':
        case 'embers':
          p.y = init ? Math.random() * h : h + 10
          p.vy = -(15 + Math.random() * 40)
          p.vx = (Math.random() - 0.5) * 20
          p.s = 0.6 + Math.random() * 2
          p.a = 0.2 + Math.random() * 0.6
          if (kind === 'embers') p.c = ['#ffb43e', '#ff7a2e', '#ffd86b'][(Math.random() * 3) | 0]
          break
        case 'question':
          p.y = init ? Math.random() * h : h + 20
          p.vy = -(20 + Math.random() * 40)
          p.vx = (Math.random() - 0.5) * 15
          p.s = 14 + Math.random() * 26
          p.a = 0.15 + Math.random() * 0.35
          p.vr = (Math.random() - 0.5)
          break
      }
      return p
    }
    const ps: P[] = Array.from({ length: n }, () => spawn(true))
    let last = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      ctx.clearRect(0, 0, w, h)
      for (let i = 0; i < ps.length; i++) {
        const p = ps[i]
        p.x += p.vx * dt
        p.y += p.vy * dt
        p.r += p.vr * dt
        ctx.globalAlpha = p.a
        switch (kind) {
          case 'rain':
            ctx.strokeStyle = '#9fdcff'
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(p.x + p.vx * 0.012, p.y + p.s)
            ctx.stroke()
            if (p.y > h) {
              // Yere çarpınca küçük sıçrama
              ctx.globalAlpha = 0.4
              ctx.beginPath()
              ctx.ellipse(p.x, h - 4, 6, 1.5, 0, 0, Math.PI * 2)
              ctx.stroke()
              ps[i] = spawn(false)
            }
            break
          case 'snow':
            p.vx += Math.sin(now / 900 + i) * 0.4
            ctx.fillStyle = '#fff'
            ctx.beginPath()
            ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2)
            ctx.fill()
            if (p.y > h + 5) ps[i] = spawn(false)
            break
          case 'leaves':
            p.vy += Math.sin(now / 300 + i) * 4
            ctx.save()
            ctx.translate(p.x, p.y)
            ctx.rotate(p.r)
            ctx.fillStyle = p.c
            ctx.beginPath()
            ctx.ellipse(0, 0, p.s, p.s * 0.45, 0, 0, Math.PI * 2)
            ctx.fill()
            ctx.restore()
            if (p.x > w + 30) ps[i] = spawn(false)
            break
          case 'stars':
            ctx.globalAlpha = 0.3 + 0.7 * Math.abs(Math.sin(p.r + (now / 1000) * p.vr))
            ctx.fillStyle = '#e8f6ff'
            ctx.fillRect(p.x, p.y, p.s, p.s)
            p.r -= p.vr * dt // yerinde kalsın
            break
          case 'confetti':
            ctx.save()
            ctx.translate(p.x, p.y)
            ctx.rotate(p.r)
            ctx.fillStyle = p.c
            ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2 * Math.abs(Math.cos(p.r * 2)) + 1)
            ctx.restore()
            if (p.y > h + 20) ps[i] = spawn(false)
            break
          case 'dust':
          case 'embers':
            ctx.fillStyle = kind === 'dust' ? '#7fe9ff' : p.c
            ctx.beginPath()
            ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2)
            ctx.fill()
            if (p.y < -10) ps[i] = spawn(false)
            break
          case 'question':
            ctx.save()
            ctx.translate(p.x, p.y)
            ctx.rotate(p.r * 0.3)
            ctx.fillStyle = '#c9d3dd'
            ctx.font = `bold ${p.s}px Rajdhani, sans-serif`
            ctx.fillText('?', 0, 0)
            ctx.restore()
            if (p.y < -30) ps[i] = spawn(false)
            break
        }
      }
      ctx.globalAlpha = 1
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [kind, low, density, colors])

  return <canvas ref={ref} className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} />
}
