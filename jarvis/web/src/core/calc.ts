/** Tarayıcı tarafı güvenli hesap (eval yok) — hesap makinesi paneli için. Sunucudakiyle aynı kurallar. */
export function evaluate(expr: string): number {
  const s = expr.replace(/\s+/g, '').replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-').replace(/,/g, '.').replace(/√/g, 'r')
  let i = 0
  const peek = () => s[i]
  const fact = (n: number) => {
    if (n < 0 || n > 170 || !Number.isInteger(n)) throw new Error('faktöriyel')
    let r = 1
    for (let k = 2; k <= n; k++) r *= k
    return r
  }
  const atom = (): number => {
    if (peek() === '(') {
      i++
      const v = add()
      if (s[i] === ')') i++ // kapanmayan parantezi hoş gör
      return v
    }
    if (peek() === '-') {
      i++
      return -atom()
    }
    if (peek() === 'r') {
      i++
      return Math.sqrt(atom())
    }
    const m = s.slice(i).match(/^\d+(\.\d+)?/)
    if (!m) throw new Error('sayı')
    i += m[0].length
    let v = Number(m[0])
    if (peek() === '%') {
      // "50%" → 0.5
      i++
      v /= 100
    }
    return v
  }
  const post = (): number => {
    let v = atom()
    while (peek() === '!') {
      i++
      v = fact(v)
    }
    return v
  }
  const pow = (): number => {
    const b = post()
    if (peek() === '^') {
      i++
      return b ** pow()
    }
    return b
  }
  const mul = (): number => {
    let v = pow()
    while (peek() === '*' || peek() === '/') {
      const op = s[i++]
      const r = pow()
      v = op === '*' ? v * r : v / r
    }
    return v
  }
  const add = (): number => {
    let v = mul()
    while (peek() === '+' || peek() === '-') {
      const op = s[i++]
      const r = mul()
      v = op === '+' ? v + r : v - r
    }
    return v
  }
  const v = add()
  if (i < s.length) throw new Error('fazla')
  return v
}

export const fmtNum = (x: number) => (Number.isFinite(x) ? x.toLocaleString('tr-TR', { maximumFractionDigits: 8 }) : 'Tanımsız')
