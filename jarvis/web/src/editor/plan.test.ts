import assert from 'node:assert/strict'
import { test } from 'node:test'
import { detectBeats } from './beats.ts'
import { activeAt, makePlan } from './plan.ts'

test('ritim algılama: sentetik 140 BPM tıkırtıdan tempo ve vuruşlar', () => {
  const sr = 22050
  const dur = 12
  const s = new Float32Array(sr * dur)
  const beat = 60 / 140
  for (let t = 0.1; t < dur; t += beat) {
    const i0 = Math.round(t * sr)
    for (let k = 0; k < 800; k++) s[i0 + k] = Math.sin(k / 6) * Math.exp(-k / 150) * 0.9 // kick
  }
  const r = detectBeats(s, sr)
  assert.ok(Math.abs(r.bpm - 140) <= 1.5, `bpm=${r.bpm}`)
  assert.ok(Math.abs(r.beats[0] - 0.1) < 0.03, `ilk vuruş ${r.beats[0]}`)
  assert.ok(r.beats.length >= 25)
})

test('vlog planı: kronolojik, çapraz geçişli, hedef süreye yakın, kaynak sınırları içinde', () => {
  const clips = [{ duration: 40 }, { duration: 25 }, { duration: 90 }]
  const p = makePlan(clips, { style: 'vlog', target: 60, title: 'Günlük Vlog', date: '9 Kasım', hasMusic: true })
  assert.ok(Math.abs(p.duration - 60) < 8, `süre ${p.duration}`)
  assert.equal(p.texts[0].text, 'Günlük Vlog')
  assert.equal(p.grade, 'warm')
  // klipler sırayla gelir, segmentler kaynakta taşmaz
  let lastClip = 0
  for (const s of p.segments) {
    assert.ok(s.clip >= lastClip)
    lastClip = s.clip
    assert.ok(s.srcStart >= 0 && s.srcStart + s.outDur * s.speed <= clips[s.clip].duration + 1e-6)
  }
  // geçişte iki segment aynı anda görünür
  const sec = p.segments[1]
  const both = activeAt(p, sec.outStart + sec.fadeIn / 2)
  assert.equal(both.length, 2)
  assert.ok(both[1].alpha > 0 && both[1].alpha < 1)
  // uzun video: otomatik süre (~%35, 30–180 sn)
  const auto = makePlan([{ duration: 600 }], { style: 'vlog', hasMusic: false })
  assert.ok(auto.duration >= 150 && auto.duration <= 185, `oto ${auto.duration}`)
  assert.equal(auto.musicVolume, 0)
})

test('phonk planı: kesmeler vuruşlara oturur, efektler ve ağır çekim var', () => {
  const bpm = 140
  const beat = 60 / bpm
  const beats = Array.from({ length: 80 }, (_, i) => i * beat)
  const p = makePlan([{ duration: 30 }, { duration: 45 }], { style: 'phonk', target: 20, beats, bpm, title: 'Kapadokya', hasMusic: true })
  assert.ok(Math.abs(p.duration - 20) < 0.01)
  assert.equal(p.originalVolume, 0)
  assert.equal(p.musicVolume, 1)
  // her kesme bir vuruşa ya da yarım vuruşa denk gelir
  for (const s of p.segments) {
    const k = s.outStart / (beat / 2)
    assert.ok(Math.abs(k - Math.round(k)) < 1e-6, `kesme vuruşta değil: ${s.outStart}`)
  }
  // çıktı boşluksuz kaplanır
  for (let t = 0; t < p.duration; t += 0.05) assert.ok(activeAt(p, t).length >= 1, `boşluk ${t}`)
  assert.ok(p.segments.some((s) => s.fx.flash))
  assert.ok(p.segments.some((s) => s.speed === 0.5))
  assert.ok(p.segments.every((s) => s.fx.punch > 0))
  assert.equal(p.texts[0].text, 'KAPADOKYA')
  // kaynak sınırları
  for (const s of p.segments) assert.ok(s.srcStart + s.outDur * s.speed <= [30, 45][s.clip] + 1e-6)
})
