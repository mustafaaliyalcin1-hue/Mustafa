/**
 * FUTBOL KOMUTLARI
 *  Sonuç : "Fener yendi mi", "maç kaç kaç bitti", "Galatasaray kazandı mı", "berabere mi kaldık"
 *  Canlı : "maç devam ediyor mu", "şu an skor kaç", "canlı skor"
 *  Fikstür: "sıradaki maç ne zaman", "kiminle oynuyoruz", "maç saat kaçta", "bu hafta maç var mı"
 *  Puan  : "puan durumu", "kaçıncıyız", "lider kim", "Fenerbahçe kaçıncı sırada"
 * Takım söylenmezse Fenerbahçe. Ekranda stadyum + skor animasyonu, Fener kazandıysa kutlama.
 */
import { fetchFootball, type Match } from '../tools/sports.ts'
import { DAY_NAMES, ekle, fold, hasPhrase, hasStem, pick, type Norm } from './text.ts'
import type { Intent } from './types.ts'

/** Takım takma adları → [arama adı, görünen ad] */
const TEAMS: [string[], string, string][] = [
  [['fenerbahce', 'fener', 'fb', 'kanarya', 'sari lacivert', 'sarilacivert'], 'Fenerbahce', 'Fenerbahçe'],
  [['galatasaray', 'gs', 'cimbom', 'aslan'], 'Galatasaray', 'Galatasaray'],
  [['besiktas', 'bjk', 'kartal', 'kara kartal'], 'Besiktas', 'Beşiktaş'],
  [['trabzonspor', 'trabzon', 'ts', 'bordo mavi'], 'Trabzonspor', 'Trabzonspor'],
  [['basaksehir'], 'Basaksehir', 'Başakşehir'],
  [['samsunspor'], 'Samsunspor', 'Samsunspor'],
  [['goztepe'], 'Goztepe', 'Göztepe'],
  [['real madrid', 'real'], 'Real Madrid', 'Real Madrid'],
  [['barcelona', 'barselona', 'barca'], 'Barcelona', 'Barcelona'],
  [['manchester city', 'man city', 'city'], 'Manchester City', 'Manchester City'],
  [['manchester united', 'man united', 'united'], 'Manchester United', 'Manchester United'],
  [['liverpool'], 'Liverpool', 'Liverpool'],
  [['arsenal'], 'Arsenal', 'Arsenal'],
  [['chelsea'], 'Chelsea', 'Chelsea'],
  [['bayern'], 'Bayern Munich', 'Bayern Münih'],
  [['juventus', 'juve'], 'Juventus', 'Juventus'],
  [['inter'], 'Internazionale', 'Inter'],
  [['milan'], 'AC Milan', 'Milan'],
  [['psg', 'paris saint'], 'Paris Saint-Germain', 'PSG'],
]

/** Takım adına gelebilecek Türkçe ekler (Fener'in, Fenerbahçe'yi, Galatasaray'dan...) — "Milano" gibi başka kelimeler eşleşmesin */
const TEAM_SUFFIX = /^(y?[iu]n?|n[iu]n|y?[ae]|[dt][ae]n?|l[ae]r\w*|li|lu|nin|in|e|ye)?$/

function findTeam(n: Norm): { search: string; display: string } | undefined {
  for (const [aliases, search, display] of TEAMS) {
    for (const a of aliases) {
      if (a.includes(' ') ? n.f.includes(a) : n.words.some((w) => w === a || (a.length >= 4 && w.startsWith(a) && TEAM_SUFFIX.test(w.slice(a.length))))) return { search, display }
    }
  }
  return undefined
}

/** "maç", "maçı", "maçta", "maçlar" — ama "macera", "macun" değil */
const isMatchWord = (n: Norm) => n.words.some((w) => /^mac(i|in|ini|a|ta|tan|tayiz|lar\w*|imiz\w*)?$/.test(w))

type Ask = 'sonuc' | 'canli' | 'siradaki' | 'puan'
interface P extends Record<string, unknown> {
  team?: string
  display?: string
  ask: Ask
}

function askOf(n: Norm): Ask | null {
  if (hasPhrase(n, 'puan durumu', 'puan tablosu', 'lig tablosu', 'siralama', 'lider kim', 'kacinci', 'kac puan', 'zirve')) return 'puan'
  if (hasPhrase(n, 'canli', 'su an', 'devam ediyor', 'kacinci dakika', 'dakika kac', 'oynaniyor mu')) return 'canli'
  if (hasPhrase(n, 'siradaki', 'sonraki mac', 'bir sonraki', 'ne zaman', 'saat kacta', 'kiminle', 'kimle', 'fikstur', 'bu hafta mac', 'mac var mi', 'maci var mi', 'yarin mac', 'bugun mac', 'hafta sonu mac')) return 'siradaki'
  if (hasStem(n, 'yendi', 'yenil', 'kazan', 'kaybet', 'berabere', 'skor', 'sonuc', 'kac kac', 'bitti', 'galip', 'maglup', 'gol') || hasPhrase(n, 'kac kac', 'mac nasil', 'mac ne oldu', 'maci ne oldu', 'mac kac')) return 'sonuc'
  return null
}

export const footballIntent: Intent<P> = {
  name: 'football',
  detect(n) {
    const team = findTeam(n)
    const isFootball = team || isMatchWord(n) || hasStem(n, 'futbol', 'derbi', 'fikstur') || n.words.some((w) => /^lig(i|de|in|e)?$/.test(w))
    if (!isFootball) return null
    const ask = askOf(n)
    if (!ask) return team || isMatchWord(n) ? { team: team?.search, display: team?.display, ask: 'sonuc' } : null
    return { team: team?.search, display: team?.display, ask }
  },
  followUp(n, prev) {
    // "ya Galatasaray?", "peki sıradaki maç?"
    const team = findTeam(n)
    const ask = askOf(n)
    if (!team && !ask) return null
    return { team: team?.search ?? prev.team, display: team?.display ?? prev.display, ask: ask ?? prev.ask }
  },
  async run({ team, display, ask }, emit) {
    const name = display || 'Fenerbahçe'
    const data = await fetchFootball({ team: team || 'Fenerbahce', standings: ask === 'puan' })
    const ms = data.matches
    const live = ms.find((m) => m.status === 'in')
    const last = [...ms].reverse().find((m) => m.status === 'post')
    const next = ms.find((m) => m.status === 'pre')
    const scene = (matches: Match[]) => emit({ type: 'scene', scene: 'sports', data: { ...data, focusTeam: name, matches }, hold: 3600 })

    if (ask === 'puan') {
      scene(live ? [live] : last ? [last] : next ? [next] : [])
      const st = data.standings || []
      const mine = st.find((t) => fold(t.team).includes(fold(name).slice(0, 6)))
      const leader = st[0]
      if (!st.length) return 'Puan durumunu şu an alamadım efendim.'
      if (!mine) return `Lider ${leader.team}, ${leader.points} puanla efendim.`
      if (mine.rank === 1) {
        const second = st[1]
        return `${name} ${mine.points} puanla lider efendim${second ? `; ${ekle(second.team, 'gen')} ${mine.points - second.points} puan önünde` : ''}.`
      }
      return `${name} ${mine.points} puanla ${mine.rank}. sırada efendim. Lider ${leader.team}, ${leader.points} puanla; aradaki fark ${leader.points - mine.points} puan.`
    }

    if (ask === 'siradaki' || (ask === 'canli' && !live && !last)) {
      if (live) {
        scene([live])
        return `${name} şu an sahada efendim: ${liveText(live, name)}`
      }
      if (!next) {
        scene(last ? [last] : [])
        return `Önümüzdeki üç hafta içinde ${ekle(name, 'gen')} planlanmış bir maçını bulamadım efendim.`
      }
      scene([next])
      const opp = opponent(next, name)
      const home = isHome(next, name)
      return `${ekle(name, 'gen')} sıradaki maçı ${when(next.date)}, ${home ? 'kendi sahasında' : 'deplasmanda'} ${opp} ile efendim.`
    }

    if (ask === 'canli') {
      if (live) {
        scene([live])
        return liveText(live, name)
      }
      // Canlı maç yok → son sonucu ve sıradakini söyle
      scene(last ? [last] : [])
      return `Şu an oynanan bir ${name} maçı yok efendim.${last ? ' ' + resultText(last, name) : ''}`
    }

    // Sonuç
    if (live) {
      scene([live])
      return `Maç devam ediyor efendim: ${liveText(live, name)}`
    }
    if (!last) {
      scene(next ? [next] : [])
      return next ? `Son üç haftada oynanmış bir ${ekle(name, 'gen')} maçı bulamadım efendim. Sıradaki maç ${when(next.date)}, ${opponent(next, name)} ile.` : `${ekle(name, 'gen')} son maçlarına ulaşamadım efendim.`
    }
    scene([last])
    const extra = next ? ` Sıradaki maç ${when(next.date)}, ${opponent(next, name)} ile.` : ''
    return resultText(last, name) + extra
  },
}

// ------------------------------------------------------------------ yardımcılar

const sideOf = (m: Match, name: string) => (fold(m.home.name).includes(fold(name).slice(0, 6)) ? 'home' : 'away')
const isHome = (m: Match, name: string) => sideOf(m, name) === 'home'
const opponent = (m: Match, name: string) => (isHome(m, name) ? m.away.name : m.home.name)

function resultText(m: Match, name: string) {
  const us = sideOf(m, name)
  const ours = m[us].score ?? 0
  const theirs = m[us === 'home' ? 'away' : 'home'].score ?? 0
  const opp = opponent(m, name)
  const score = `${Math.max(ours, theirs)}-${Math.min(ours, theirs)}`
  const ago = daysAgo(m.date)
  const isFB = name === 'Fenerbahçe'
  if (ours > theirs)
    return pick(
      isFB
        ? [`Evet efendim, Fenerbahçe ${ago} ${ekle(opp, 'acc')} ${score} yendi! Tebrikler.`, `Kazandık efendim! Fenerbahçe ${ago} ${opp} karşısında ${score} galip geldi.`]
        : [`Evet efendim, ${name} ${ago} ${ekle(opp, 'acc')} ${score} yendi.`],
    )
  if (ours < theirs)
    return isFB ? `Maalesef efendim, Fenerbahçe ${ago} ${ekle(opp, 'dat')} ${score} yenildi.` : `Hayır efendim, ${name} ${ago} ${ekle(opp, 'dat')} ${score} yenildi.`
  return `${name} ${ago} ${opp} ile ${ours}-${theirs} berabere kaldı efendim.`
}

function liveText(m: Match, name: string) {
  const us = sideOf(m, name)
  const ours = m[us].score ?? 0
  const theirs = m[us === 'home' ? 'away' : 'home'].score ?? 0
  const opp = opponent(m, name)
  const min = m.detail ? `${m.detail.replace(/'/g, '')}. dakikada ` : ''
  if (ours > theirs) return `${min}${name}, ${opp} karşısında ${ours}-${theirs} önde.`
  if (ours < theirs) return `${min}${name}, ${opp} karşısında ${ours}-${theirs} geride.`
  return `${min}${name} ile ${opp} ${ours}-${theirs} berabere.`
}

function daysAgo(iso: string) {
  const d = Math.round((startOfDay(new Date()) - startOfDay(new Date(iso))) / 864e5)
  if (d <= 0) return 'bugün'
  if (d === 1) return 'dün'
  if (d < 7) return `${DAY_NAMES[new Date(iso).getDay()]} günü`
  return `${d} gün önce`
}
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()

function when(iso: string) {
  const d = new Date(iso)
  const days = Math.round((startOfDay(d) - startOfDay(new Date())) / 864e5)
  const saat = d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Istanbul' })
  const gun = days === 0 ? 'bugün' : days === 1 ? 'yarın' : days < 7 ? DAY_NAMES[d.getDay()] : d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', timeZone: 'Europe/Istanbul' })
  return `${gun} saat ${saat}'${saatEki(d)}`
}

/** "19.00'da", "20.00'de", "21.30'da" — saatin okunuşuna göre ek */
export function saatEki(d: Date) {
  const [h, m] = d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Istanbul' }).split(':').map(Number)
  const last = m ? m % 10 || m : h % 10 || h
  // son okunan kelimeye göre: 1 bir,2 iki,7 yedi,8 sekiz → de · 3 üç,4 dört,5 beş → te · 6 altı,9 dokuz,10 on,30 otuz,40 kırk(ta),50 elli(de),20 yirmi(de)
  const map: Record<number, string> = { 1: 'de', 2: 'de', 3: 'te', 4: 'te', 5: 'te', 6: 'da', 7: 'de', 8: 'de', 9: 'da', 10: 'da', 20: 'de', 30: 'da', 40: 'ta', 50: 'de', 0: 'da' }
  return map[last] ?? 'de'
}
