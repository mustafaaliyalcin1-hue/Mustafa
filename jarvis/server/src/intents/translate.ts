/**
 * ÇEVİRİ KOMUTLARI: "elmayı İngilizceye çevir", "teşekkürler Almanca ne demek",
 * "İngilizcede kitap ne demek", "kitabın İngilizcesi ne", "serendipity ne demek"
 */
import { LANGS, translateText } from '../tools/translate.ts'
import { fold, type Norm } from './text.ts'
import type { Intent } from './types.ts'

const LANG_WORDS: [string, string][] = [
  ['ingilizce', 'en'], ['almanca', 'de'], ['fransizca', 'fr'], ['ispanyolca', 'es'], ['italyanca', 'it'], ['rusca', 'ru'], ['arapca', 'ar'], ['japonca', 'ja'],
  ['cince', 'zh'], ['korece', 'ko'], ['hollandaca', 'nl'], ['felemenkce', 'nl'], ['portekizce', 'pt'], ['yunanca', 'el'], ['farsca', 'fa'], ['azerice', 'az'], ['kurtce', 'ku'], ['turkce', 'tr'],
]
const langOf = (w: string) => LANG_WORDS.find(([k]) => fold(w).startsWith(k))?.[1]

interface P extends Record<string, unknown> {
  text: string
  from: string
  to: string
}

const strip = (s: string) => s.replace(/^(jarvis[,\s]+|şunu\s+|bunu\s+|lütfen\s+)+/i, '').replace(/^["“'‘](.*)["”'’]$/, '$1').trim()
/** Nesne eki: "elmayı" → "elma", "kitabı" → "kitab"→ olduğu gibi bırak (çeviri servisi toleranslı) */
const dropAcc = (s: string) => s.replace(/['’](y?[ıiuü]|n[ıiuü]n)$/i, '').replace(/(?<=[aeıioöuü])y[ıiuü]$/i, '')

function guessSource(text: string, target: string) {
  if (/[؀-ۿ]/.test(text)) return 'ar'
  if (/[Ѐ-ӿ]/.test(text)) return 'ru'
  if (target !== 'tr') return 'tr'
  return /[çğıöşüİ]/i.test(text) ? 'tr' : 'en'
}

export const translateIntent: Intent<P> = {
  name: 'translate',
  detect(n: Norm) {
    if (!/(cevir|tercume|ne demek|nasil denir|ne anlama gelir|ingilizcesi|almancasi|fransizcasi|turkcesi|ispanyolcasi|arapcasi|rusc?asi)/.test(n.f)) return null
    const raw = n.raw.trim()
    let m: RegExpMatchArray | null
    // "X'i İngilizceye çevir"
    if ((m = raw.match(/^(.+?)\s+([A-Za-zÇĞİÖŞÜçğıöşü]+?)(?:ye|ya|'ye|'ya|e|a)\s+(?:çevir|tercüme)/i)) && langOf(m[2])) {
      const to = langOf(m[2])!
      const text = dropAcc(strip(m[1]))
      return { text, to, from: guessSource(text, to) }
    }
    // "İngilizcede X ne demek / nasıl denir"
    if ((m = raw.match(/^(?:jarvis[,\s]+)?([A-Za-zÇĞİÖŞÜçğıöşü]+?)(?:de|da)\s+(.+?)\s+(?:ne demek|nasıl denir|ne anlama gelir)/i)) && langOf(m[1])) {
      const to = langOf(m[1])!
      const text = strip(m[2])
      return { text, to, from: guessSource(text, to) }
    }
    // "X İngilizce ne demek / nasıl denir"
    if ((m = raw.match(/^(.+?)\s+([A-Za-zÇĞİÖŞÜçğıöşü]+)\s+(?:ne demek|nasıl denir|ne anlama gelir)/i)) && langOf(m[2])) {
      const to = langOf(m[2])!
      const text = strip(m[1])
      return { text, to, from: guessSource(text, to) }
    }
    // "kitabın İngilizcesi ne"
    if ((m = raw.match(/^(.+?)['’]?n?[ıiuü]n\s+([A-Za-zÇĞİÖŞÜçğıöşü]+?)(?:si|sı|su|sü)\s+ne/i)) && langOf(m[2])) {
      const to = langOf(m[2])!
      const text = strip(m[1])
      return { text, to, from: guessSource(text, to) }
    }
    // "serendipity ne demek" → Türkçeye
    if ((m = raw.match(/^(?:jarvis[,\s]+)?(.{1,60}?)\s+ne demek\??$/i)) && !/[çğıöşü]/i.test(m[1])) {
      const text = strip(m[1])
      return { text, to: 'tr', from: guessSource(text, 'tr') }
    }
    return null
  },
  async run({ text, from, to }, emit) {
    const out = await translateText(text, from, to)
    const L = (c: string) => LANGS[c] ?? { code: c, name: c, flag: '🏳' }
    emit({ type: 'scene', scene: 'translate', data: { text, out, from: L(from), to: L(to) }, hold: 3000 })
    const short = text.split(/\s+/).length <= 3
    // "İngilizcede", "Almancada", "Türkçede" — dil adları ünlüyle biter, ünlü uyumuna göre -de/-da
    const loc = (name: string) => name + (/[eiöü][^aeıioöuü]*$/.test(name.toLocaleLowerCase('tr-TR')) ? 'de' : 'da')
    return short ? `"${text}" ${loc(L(to).name)} "${out}" efendim.` : `${L(to).name} çevirisi şöyle efendim: ${out}`
  },
}
