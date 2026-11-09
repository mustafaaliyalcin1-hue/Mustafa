import assert from 'node:assert/strict'
import { test } from 'node:test'
import { parseClock, parseDay, parseDuration } from './nlp.ts'

test('süre çözümleme', () => {
  assert.equal(parseDuration('5 dakika zamanlayıcı kur'), 300)
  assert.equal(parseDuration('beş dakika'), 300)
  assert.equal(parseDuration('on beş saniye geri say'), 15)
  assert.equal(parseDuration('1 saat 20 dakika'), 4800)
  assert.equal(parseDuration('yarım saat sayaç'), 1800)
  assert.equal(parseDuration('2 buçuk dakika'), 150)
  assert.equal(parseDuration('kırk saniye'), 40)
  assert.equal(parseDuration('çay demle'), undefined)
})

test('saat ve gün çözümleme', () => {
  assert.deepEqual(parseClock('alarm 6:45'), { h: 6, m: 45 })
  assert.deepEqual(parseClock("yarın sabah 7'de uyandır"), { h: 7, m: 0 })
  assert.deepEqual(parseClock('akşam 8de ilacımı hatırlat'), { h: 20, m: 0 })
  assert.deepEqual(parseClock('saat yedi buçukta'), { h: 7, m: 30 })
  assert.deepEqual(parseClock('21.15 toplantı'), { h: 21, m: 15 })
  const sat = new Date('2026-11-07T12:00:00')
  assert.equal(parseDay('yarın', sat), 1)
  assert.equal(parseDay('pazartesi', sat), 2)
  assert.equal(parseDay('cumartesi', sat), 7) // bugün cumartesi → gelecek hafta
  assert.equal(parseDay('saat kaç', sat), undefined)
})
