/**
 * SPOR / FUTBOL — ESPN'in herkese açık veri uçları (ücretsiz, anahtarsız).
 * Süper Lig ve büyük Avrupa ligleri: maç sonuçları, canlı skor, fikstür, puan durumu.
 * Takım adı verilirse ±10 günlük pencerede o takımın maçları süzülür (varsayılan: Fenerbahçe).
 */
import { z } from 'zod'
import { getJson } from './http.ts'
import { defineTool } from './registry.ts'

export const LEAGUES = {
  super_lig: 'tur.1',
  premier_lig: 'eng.1',
  la_liga: 'esp.1',
  serie_a: 'ita.1',
  bundesliga: 'ger.1',
  sampiyonlar_ligi: 'uefa.champions',
  avrupa_ligi: 'uefa.europa',
  konferans_ligi: 'uefa.europa.conf',
} as const

export interface Match {
  id: string
  date: string
  league: string
  status: 'pre' | 'in' | 'post'
  detail: string
  home: { name: string; short: string; logo?: string; score?: number }
  away: { name: string; short: string; logo?: string; score?: number }
}

const norm = (s: string) =>
  s
    .toLocaleLowerCase('tr-TR')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ı/g, 'i')

/* eslint-disable @typescript-eslint/no-explicit-any */
export function parseScoreboard(j: any, league: string): Match[] {
  return (j.events || []).map((e: any) => {
    const c = e.competitions?.[0] || {}
    const side = (h: string) => {
      const t = (c.competitors || []).find((x: any) => x.homeAway === h) || {}
      return { name: t.team?.displayName || '?', short: t.team?.abbreviation || '', logo: t.team?.logo, score: t.score !== undefined && t.score !== '' ? Number(t.score) : undefined }
    }
    return { id: e.id, date: e.date, league, status: e.status?.type?.state || 'pre', detail: e.status?.type?.shortDetail || e.status?.type?.detail || '', home: side('home'), away: side('away') }
  })
}

export function parseStandings(j: any) {
  const entries = j.children?.[0]?.standings?.entries || j.standings?.entries || []
  return entries
    .map((en: any) => {
      const st = (n: string) => en.stats?.find((s: any) => s.name === n)?.value ?? 0
      return { rank: st('rank'), team: en.team?.displayName, short: en.team?.abbreviation, logo: en.team?.logos?.[0]?.href, played: st('gamesPlayed'), points: st('points'), goalDiff: st('pointDifferential') }
    })
    .sort((a: any, b: any) => a.rank - b.rank)
}
/* eslint-enable @typescript-eslint/no-explicit-any */

const ymd = (d: Date) => d.toISOString().slice(0, 10).replace(/-/g, '')

/** ESPN İngilizce yazımlarını Türkçeleştir (ekranda ve konuşmada) */
const TR_NAMES: Record<string, string> = {
  fenerbahce: 'Fenerbahçe', besiktas: 'Beşiktaş', basaksehir: 'Başakşehir', 'istanbul basaksehir': 'Başakşehir', goztepe: 'Göztepe', kasimpasa: 'Kasımpaşa', eyupspor: 'Eyüpspor',
  genclerbirligi: 'Gençlerbirliği', 'fatih karagumruk': 'Karagümrük', karagumruk: 'Karagümrük', 'caykur rizespor': 'Rizespor', rizespor: 'Rizespor', 'gaziantep fk': 'Gaziantep FK', 'kocaelispor': 'Kocaelispor',
  'bayern munich': 'Bayern Münih', 'internazionale': 'Inter', 'atletico madrid': 'Atletico Madrid', 'paris saint-germain': 'PSG', 'olympiacos': 'Olympiakos', 'fc copenhagen': 'Kopenhag',
}
export function turkishTeam(name: string) {
  return TR_NAMES[norm(name)] || name
}

/** Sık sorulan yabancı takımların ligleri (lig maçlarını da bulabilmek için) */
const TEAM_LEAGUE: Record<string, string> = {
  'real madrid': 'esp.1', barcelona: 'esp.1', 'atletico madrid': 'esp.1', 'manchester city': 'eng.1', 'manchester united': 'eng.1', liverpool: 'eng.1', arsenal: 'eng.1', chelsea: 'eng.1', tottenham: 'eng.1',
  'bayern munich': 'ger.1', 'borussia dortmund': 'ger.1', juventus: 'ita.1', 'ac milan': 'ita.1', internazionale: 'ita.1', napoli: 'ita.1', 'paris saint-germain': 'fra.1',
}

export interface FootballData {
  focusTeam: string
  matches: Match[]
  standings?: { rank: number; team: string; short?: string; logo?: string; played: number; points: number; goalDiff: number }[]
}

/** Bir takımın (varsayılan Fenerbahçe) son/canlı/sıradaki maçları + istenirse puan durumu */
export async function fetchFootball(opts: { team?: string; league?: keyof typeof LEAGUES; standings?: boolean }): Promise<FootballData> {
  const { team, league, standings } = opts
  const lg = league || 'super_lig'
  const code = LEAGUES[lg]
  const from = new Date(Date.now() - 21 * 864e5)
  const to = new Date(Date.now() + 21 * 864e5)
  const focus = team || 'Fenerbahçe'
  const key = norm(focus).replace(/\s*(sk|fk|as|cf|fc)$/, '')
  // Takım için: kendi ligi + Avrupa kupaları
  const own = Object.entries(TEAM_LEAGUE).find(([k]) => k.includes(key) || key.includes(k))?.[1]
  const codes = league ? [code] : [...new Set([own || code, 'uefa.champions', 'uefa.europa', 'uefa.europa.conf'])]
  const boards = await Promise.all(
    codes.map((c) => getJson(`https://site.api.espn.com/apis/site/v2/sports/soccer/${c}/scoreboard?dates=${ymd(from)}-${ymd(to)}&limit=300`).then((j) => parseScoreboard(j, c)).catch(() => [] as Match[])),
  )
  let matches = [...new Map(boards.flat().map((m) => [m.id, m])).values()].sort((a, b) => a.date.localeCompare(b.date))
  if (team || !league) matches = matches.filter((m) => norm(m.home.name).includes(key) || norm(m.away.name).includes(key))
  for (const m of matches) {
    m.home.name = turkishTeam(m.home.name)
    m.away.name = turkishTeam(m.away.name)
  }
  // Son 2 + canlı + sıradaki 2
  const past = matches.filter((m) => m.status === 'post').slice(-2)
  const live = matches.filter((m) => m.status === 'in')
  const next = matches.filter((m) => m.status === 'pre').slice(0, 2)
  let table
  if (standings) {
    const stCode = own || code
    table = parseStandings(await getJson(`https://site.api.espn.com/apis/v2/sports/soccer/${stCode}/standings`)).slice(0, 20)
    for (const t of table) t.team = turkishTeam(t.team)
  }
  return { focusTeam: focus, matches: [...past, ...live, ...next], standings: table }
}

defineTool({
  name: 'get_football',
  description:
    'Futbol: bir takımın son ve sıradaki maçları, canlı skorlar, ligdeki günün maçları ve puan durumu. Kullanıcının takımı Fenerbahçe’dir; takım belirtilmezse onu varsay. Sonucu söylerken skoru ve kimin kazandığını net belirt.',
  schema: z.object({
    team: z.string().optional().describe('Takım adı, ör. "Fenerbahçe", "Galatasaray", "Real Madrid"'),
    league: z.enum(['super_lig', 'premier_lig', 'la_liga', 'serie_a', 'bundesliga', 'sampiyonlar_ligi', 'avrupa_ligi', 'konferans_ligi']).optional(),
    standings: z.boolean().optional().describe('Puan durumu da isteniyorsa true'),
  }),
  pendingScene: { scene: 'sports', data: { matches: [] } },
  async run({ team, league, standings }) {
    const data = await fetchFootball({ team, league, standings })
    return {
      result: {
        matches: data.matches.map(({ home, away, ...m }) => ({ ...m, home: `${home.name} ${home.score ?? ''}`, away: `${away.name} ${away.score ?? ''}` })),
        standings: data.standings?.map((t) => `${t.rank}. ${t.team} ${t.points}p (${t.played} maç)`),
      },
      scene: { scene: 'sports', data, hold: 3000 },
    }
  },
})
