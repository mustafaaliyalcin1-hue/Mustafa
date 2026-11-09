/**
 * FUTBOL KOMUTLARI
 *  Sonuç : "Fener yendi mi", "maç kaç kaç bitti", "Galatasaray kazandı mı", "berabere mi kaldık"
 *  Canlı : "maç devam ediyor mu", "şu an skor kaç", "canlı skor"
 *  Fikstür: "sıradaki maç ne zaman", "kiminle oynuyoruz", "maç saat kaçta", "bu hafta maç var mı"
 *  Puan  : "puan durumu", "kaçıncıyız", "lider kim", "Fenerbahçe kaçıncı sırada"
 * Takım söylenmezse Fenerbahçe. Ekranda stadyum + skor animasyonu, Fener kazandıysa kutlama.
 */
import { fetchFootball, fetchLeague, LEAGUE_NAMES, type LeagueKey, type Match } from '../tools/sports.ts'
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
  [['kasimpasa'], 'Kasimpasa', 'Kasımpaşa'],
  [['karagumruk'], 'Karagumruk', 'Karagümrük'],
  [['genclerbirligi', 'genclerbirlik'], 'Genclerbirligi', 'Gençlerbirliği'],
  [['kecioren', 'keciorengucu'], 'Keciorengucu', 'Keçiörengücü'],
  [['sariyer'], 'Sariyer', 'Sarıyer'],
  [['gaziantep'], 'Gaziantep', 'Gaziantep FK'],
  [['manisa'], 'Manisa', 'Manisa FK'],
  [['igdir'], 'Igdir', 'Iğdır FK'],
  [['corum'], 'Corum', 'Çorum FK'],
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

function findTeam(n: Norm): { search: string; display: string; generic?: boolean } | undefined {
  for (const [aliases, search, display] of TEAMS) {
    for (const a of aliases) {
      if (a.includes(' ') ? n.f.includes(a) : n.words.some((w) => w === a || (a.length >= 4 && w.startsWith(a) && TEAM_SUFFIX.test(w.slice(a.length))))) return { search, display }
    }
  }
  return genericTeam(n)
}

/**
 * Listede olmayan takımlar: "-spor", "-gücü" ile biten her kelime (Elazığspor, Amedspor, Bandırmaspor…)
 * ve "X FK / X SK". Ekranda/konuşmada kullanıcının yazdığı Türkçe ad kullanılır.
 */
export function genericTeam(n: Norm): { search: string; display: string; generic: true } | undefined {
  for (const w of n.f.split(' ')) {
    const m = w.match(/^([a-z]{2,}(?:spor|gucu|idmanyurdu))('?(?:un|in|u|i|a|e|ya|ye|da|de|dan|den|nin|nun|la|le|lu|li)?)$/)
    if (m && m[1] !== 'spor') return { search: m[1], display: displayOf(n.raw, m[1]), generic: true }
  }
  const fk = n.f.match(/(?:^|\s)([a-z]{3,}) (fk|sk|as|bld|belediyespor)(?:\s|'|$)/)
  if (fk && !['bir', 'mac'].includes(fk[1])) return { search: fk[1], display: displayOf(n.raw, fk[1]) + ' ' + fk[2].toUpperCase(), generic: true }
  return undefined
}

/** Sadeleştirilmiş kökün kullanıcının yazdığı Türkçe halini bul: "elazigspor" → "Elazığspor" */
function displayOf(raw: string, stem: string) {
  for (const w of raw.split(/\s+/)) {
    const f = fold(w)
    if (f.startsWith(stem)) {
      const t = w.replace(/['’].*$/, '').slice(0, stem.length + (w.length - f.length))
      const clean = t.replace(/[^A-Za-zÇĞİÖŞÜçğıöşü]/g, '').slice(0, Math.max(stem.length, 1))
      return clean.charAt(0).toLocaleUpperCase('tr-TR') + clean.slice(1)
    }
  }
  return stem.charAt(0).toUpperCase() + stem.slice(1)
}

/**
 * TFF 2. Lig (2026-27) takımları — ücretsiz veri kaynağında (ESPN) yok; bu takımlar ve
 * "2. Lig / 3. Lig" soruları doğrudan yapay zekânın internet aramasına gider (present_match ile gösterilir).
 * (Basında doğrulanabilen adlar; "-spor" ile biten diğer takımlar zaten otomatik tanınır.)
 */
const LOWER_LEAGUE_TEAMS = [
  'elazigspor', 'aksaray belediyespor', '68 aksaray', 'adana demirspor', 'aliaga', 'ankaraspor', 'arnavutkoy', 'corluspor', 'kastamonuspor', 'guzide gebze', 'gebze',
  'hatayspor', 'isparta 32', 'ispartaspor', 'inegol kafkas', 'inegolspor', 'kizilkaya', 'sebat genclik', 'somaspor', 'bingolspor', '12 bingol', '1461 trabzon', 'orduspor', '52 orduspor',
  'adana 01', 'altinordu', 'erzincanspor', '24erzincan', 'ankara demirspor', 'beyoglu yeni carsi', 'yeni carsi', 'fethiyespor',
]
export function isLowerLeague(n: Norm) {
  return /(2\.? lig|ikinci lig|tff 2|3\.? lig|ucuncu lig|tff 3|bal ligi|amator lig)/.test(n.f) || LOWER_LEAGUE_TEAMS.some((t) => n.f.includes(t))
}

/** Lig adı: "1. Lig", "Premier Lig", "İspanya"… */
export function findLeague(n: Norm): LeagueKey | undefined {
  const f = n.f
  if (/((^|[^0-9])1\.? lig|birinci lig|tff 1(\s|$))/.test(f)) return 'birinci_lig'
  if (/super lig/.test(f)) return 'super_lig'
  if (/(sampiyonlar ligi|devler ligi)/.test(f)) return 'sampiyonlar_ligi'
  if (/avrupa ligi/.test(f)) return 'avrupa_ligi'
  if (/konferans ligi/.test(f)) return 'konferans_ligi'
  if (/(premier lig|ingiltere|ingiliz)/.test(f)) return 'premier_lig'
  if (/(la liga|ispanya)/.test(f)) return 'la_liga'
  if (/(serie a|italya)/.test(f)) return 'serie_a'
  if (/(bundesliga|almanya)/.test(f)) return 'bundesliga'
  if (/(ligue 1|fransa)/.test(f)) return 'fransa'
  if (/(eredivisie|hollanda)/.test(f)) return 'hollanda'
  if (/portekiz/.test(f)) return 'portekiz'
  return undefined
}

/** "maç", "maçı", "maçta", "maçlar" — ama "macera", "macun" değil */
const isMatchWord = (n: Norm) => n.words.some((w) => /^mac(i|in|ini|a|ta|tan|tayiz|lar\w*|imiz\w*)?$/.test(w))

type Ask = 'sonuc' | 'canli' | 'siradaki' | 'puan' | 'liste'
interface P extends Record<string, unknown> {
  team?: string
  display?: string
  generic?: boolean
  league?: LeagueKey
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
    // Alt ligler: veri kaynağı yok → yapay zekâ internetten bulsun (yerelde Fenerbahçe'ye düşmesin)
    if (isLowerLeague(n)) return null
    const team = findTeam(n)
    const league = findLeague(n)
    // Takımsız lig soruları: "1. Lig puan durumu", "Süper Lig'de bugün hangi maçlar var", "Premier Lig sonuçları"
    if (!team && league) {
      const a = askOf(n)
      return { league, ask: a === 'puan' ? 'puan' : 'liste' }
    }
    if (!team && hasPhrase(n, 'hangi maclar', 'bugunku maclar', 'bugun hangi mac', 'mac sonuclari', 'maclar ne oldu', 'haftanin maclari')) return { league: 'super_lig', ask: 'liste' }
    const isFootball = team || isMatchWord(n) || hasStem(n, 'futbol', 'derbi', 'fikstur') || n.words.some((w) => /^lig(i|de|in|e)?$/.test(w))
    if (!isFootball) return null
    const ask = askOf(n)
    if (!ask) return team || isMatchWord(n) ? { team: team?.search, display: team?.display, generic: team?.generic, league, ask: 'sonuc' } : null
    return { team: team?.search, display: team?.display, generic: team?.generic, league, ask }
  },
  followUp(n, prev) {
    // "ya Galatasaray?", "peki sıradaki maç?"
    const team = findTeam(n)
    const ask = askOf(n)
    if (!team && !ask) return null
    return team ? { team: team.search, display: team.display, generic: team.generic, ask: ask ?? prev.ask } : { ...prev, ask: ask ?? prev.ask }
  },
  async run({ team, display, generic, league, ask }, emit) {
    // Takımsız lig soruları
    if (!team && league && (ask === 'liste' || ask === 'puan')) return leagueAnswer(league, ask, emit)
    const name = display || 'Fenerbahçe'
    // Bilinmeyen takım: tüm liglerde aranır; bulunamazsa hata → yapay zekâ internetten bulur (present_match)
    const data = await fetchFootball({ team: team || 'Fenerbahce', league: generic ? undefined : league, standings: ask === 'puan', searchAll: !!generic })
    const ms = data.matches
    const live = ms.find((m) => m.status === 'in')
    const last = [...ms].reverse().find((m) => m.status === 'post')
    const next = ms.find((m) => m.status === 'pre')
    const scene = (matches: Match[]) => emit({ type: 'scene', scene: 'sports', data: { ...data, focusTeam: name, matches }, hold: 3600 })

    if (ask === 'puan') {
      scene(live ? [live] : last ? [last] : next ? [next] : [])
      let st = data.standings || []
      let mine = st.find((t) => fold(t.team).includes(fold(name).slice(0, 6)))
      // Süper Lig'de yoksa 1. Lig tablosuna bak
      if (!mine && generic) {
        const alt = await fetchLeague('birinci_lig', true).catch(() => null)
        const found = alt?.standings?.find((t) => fold(t.team).includes(fold(name).slice(0, 6)))
        if (alt?.standings && found) {
          st = alt.standings
          mine = found
        }
      }
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
export const opponent = (m: Match, name: string) => (isHome(m, name) ? m.away.name : m.home.name)

export function resultText(m: Match, name: string) {
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

export function liveText(m: Match, name: string) {
  const us = sideOf(m, name)
  const ours = m[us].score ?? 0
  const theirs = m[us === 'home' ? 'away' : 'home'].score ?? 0
  const opp = opponent(m, name)
  const min = m.detail ? `${m.detail.replace(/'/g, '')}. dakikada ` : ''
  if (ours > theirs) return `${min}${name}, ${opp} karşısında ${ours}-${theirs} önde.`
  if (ours < theirs) return `${min}${name}, ${opp} karşısında ${ours}-${theirs} geride.`
  return `${min}${name} ile ${opp} ${ours}-${theirs} berabere.`
}

export function daysAgo(iso: string) {
  const d = Math.round((startOfDay(new Date()) - startOfDay(new Date(iso))) / 864e5)
  if (d <= 0) return 'bugün'
  if (d === 1) return 'dün'
  if (d < 7) return `${DAY_NAMES[new Date(iso).getDay()]} günü`
  return `${d} gün önce`
}
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()

export function when(iso: string) {
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

/** Lig geneli: maç listesi ya da puan durumu */
async function leagueAnswer(league: LeagueKey, ask: 'liste' | 'puan', emit: Parameters<Intent['run']>[1]) {
  const lname = LEAGUE_NAMES[league]
  const { matches, standings } = await fetchLeague(league, ask === 'puan')
  const live = matches.filter((m) => m.status === 'in')
  const done = matches.filter((m) => m.status === 'post').slice(-6)
  const upcoming = matches.filter((m) => m.status === 'pre').slice(0, 6)
  if (ask === 'puan') {
    const st = standings || []
    if (!st.length) throw new Error('puan durumu yok')
    emit({ type: 'scene', scene: 'sports', data: { focusTeam: st[0].team, matches: [...live, ...done.slice(-2), ...upcoming.slice(0, 2)], standings: st }, hold: 3600 })
    const top = st.slice(0, 3).map((t) => `${t.rank}. ${t.team} ${t.points} puan`).join(', ')
    const fb = st.find((t) => t.team.startsWith('Fenerbah'))
    return `${lname} puan durumu efendim: ${top}.${fb && fb.rank > 3 ? ` Fenerbahçe ${fb.points} puanla ${fb.rank}. sırada.` : ''}`
  }
  const list = live.length ? live : done.length ? done : upcoming
  if (!list.length) throw new Error('maç yok')
  emit({ type: 'scene', scene: 'sports', data: { focusTeam: list[0].home.name, matches: list }, hold: 3600 })
  const read = list.slice(0, 5).map((m) => (m.status === 'pre' ? `${m.home.name} - ${m.away.name} ${when(m.date)}` : `${m.home.name} ${m.home.score ?? 0}, ${m.away.name} ${m.away.score ?? 0}`)).join('; ')
  const where = ekle(lname, 'loc')
  const head = live.length ? `${where} şu an oynanan maçlar efendim:` : done.length ? `${where} son oynanan maçlar efendim:` : `${where} sıradaki maçlar efendim:`
  return `${head} ${read}.`
}
