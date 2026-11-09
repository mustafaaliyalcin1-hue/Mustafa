/**
 * YOUTUBE (YouTube Data API v3, ücretsiz kota)
 * Bağlanma: /oauth/google/start → Google onay ekranı → /oauth/google/callback
 *   → yenileme anahtarı (refresh token) alınır. Render'da kalıcı olması için
 *     YOUTUBE_REFRESH_TOKEN ortam değişkenine kaydedilir (sayfa bunu gösterir).
 * Yükleme: devam ettirilebilir (resumable) yükleme ile.
 * Not: Google denetiminden geçmemiş projelerden yüklenen videolar "gizli" kalır;
 *      YouTube Studio'dan herkese açılabilir.
 */
import fs from 'node:fs'
import path from 'node:path'
import { Readable } from 'node:stream'
import { config } from '../config.ts'
import { getMedia } from './media.ts'

const SCOPES = ['https://www.googleapis.com/auth/youtube.upload', 'https://www.googleapis.com/auth/youtube.readonly']
const tokenFile = () => path.join(config.dataDir, 'youtube.json')

let refreshToken = config.youtubeRefreshToken
try {
  if (!refreshToken) refreshToken = JSON.parse(fs.readFileSync(tokenFile(), 'utf8')).refresh_token || ''
} catch {
  /* henüz bağlanmadı */
}
let access: { token: string; until: number } | null = null

export const youtubeConfigured = () => !!(config.googleClientId && config.googleClientSecret)
export const youtubeConnected = () => youtubeConfigured() && !!refreshToken
const redirectUri = () => `${config.publicUrl.replace(/\/+$/, '')}/oauth/google/callback`

export function authUrl(state: string) {
  const q = new URLSearchParams({
    client_id: config.googleClientId,
    redirect_uri: redirectUri(),
    response_type: 'code',
    scope: SCOPES.join(' '),
    access_type: 'offline',
    prompt: 'consent',
    include_granted_scopes: 'true',
    state,
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${q}`
}

async function tokenRequest(body: Record<string, string>) {
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: config.googleClientId, client_secret: config.googleClientSecret, ...body }),
    signal: AbortSignal.timeout(15000),
  })
  const j = (await r.json()) as { access_token?: string; refresh_token?: string; expires_in?: number; error?: string; error_description?: string }
  if (!r.ok || !j.access_token) throw new Error(`Google: ${j.error_description || j.error || r.status}`)
  return j
}

/** Onay kodunu yenileme anahtarına çevir ve sakla */
export async function exchangeCode(code: string) {
  const j = await tokenRequest({ code, grant_type: 'authorization_code', redirect_uri: redirectUri() })
  if (j.refresh_token) {
    refreshToken = j.refresh_token
    try {
      fs.mkdirSync(config.dataDir, { recursive: true })
      fs.writeFileSync(tokenFile(), JSON.stringify({ refresh_token: refreshToken }))
    } catch {
      /* disk yazılamazsa ortam değişkeniyle kalıcı yapılır */
    }
  }
  access = { token: j.access_token!, until: Date.now() + (j.expires_in ?? 3600) * 1000 - 60_000 }
  return refreshToken
}

async function accessToken() {
  if (access && Date.now() < access.until) return access.token
  if (!refreshToken) throw new Error('YouTube hesabı bağlı değil')
  const j = await tokenRequest({ refresh_token: refreshToken, grant_type: 'refresh_token' })
  access = { token: j.access_token!, until: Date.now() + (j.expires_in ?? 3600) * 1000 - 60_000 }
  return access.token
}

async function api<T>(url: string): Promise<T> {
  const r = await fetch(url, { headers: { authorization: `Bearer ${await accessToken()}` }, signal: AbortSignal.timeout(15000) })
  if (!r.ok) throw new Error(`YouTube API hatası ${r.status}: ${(await r.text()).slice(0, 200)}`)
  return r.json() as Promise<T>
}

export interface UploadOpts {
  mediaId: string
  title: string
  description?: string
  tags?: string[]
  privacy: 'private' | 'unlisted' | 'public'
  publishAt?: string // ISO; planlı yayın (privacy=private olmalı)
}

/** Videoyu YouTube'a yükle; video kimliği ve bağlantısını döndür */
export async function uploadVideo(o: UploadOpts) {
  const f = getMedia(o.mediaId)
  if (!f) throw new Error('Video bulunamadı (süresi dolmuş olabilir); lütfen tekrar seçin.')
  const token = await accessToken()
  const status: Record<string, unknown> = { privacyStatus: o.publishAt ? 'private' : o.privacy, selfDeclaredMadeForKids: false }
  if (o.publishAt) status.publishAt = o.publishAt
  const init = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status', {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json; charset=UTF-8', 'x-upload-content-length': String(f.size), 'x-upload-content-type': f.mime },
    body: JSON.stringify({ snippet: { title: o.title.slice(0, 100), description: (o.description || '').slice(0, 5000), tags: o.tags?.slice(0, 30), categoryId: '22', defaultLanguage: 'tr', defaultAudioLanguage: 'tr' }, status }),
    signal: AbortSignal.timeout(30000),
  })
  const loc = init.headers.get('location')
  if (!init.ok || !loc) throw new Error(`YouTube yüklemeyi başlatmadı (${init.status}): ${(await init.text()).slice(0, 200)}`)
  const put = await fetch(loc, {
    method: 'PUT',
    headers: { 'content-type': f.mime, 'content-length': String(f.size) },
    body: Readable.toWeb(fs.createReadStream(f.path)) as unknown as BodyInit,
    // @ts-expect-error Node fetch akış gövdesi için gerekli
    duplex: 'half',
  })
  const j = (await put.json().catch(() => ({}))) as { id?: string; status?: { privacyStatus?: string; uploadStatus?: string }; error?: { message?: string } }
  if (!put.ok || !j.id) throw new Error(`YouTube yükleme hatası (${put.status}): ${j.error?.message || ''}`)
  return { id: j.id, url: `https://youtu.be/${j.id}`, privacy: j.status?.privacyStatus || status.privacyStatus }
}

/** Kanalın son videoları + istatistikleri */
export async function recentVideos(max = 8) {
  const ch = await api<{ items?: { contentDetails: { relatedPlaylists: { uploads: string } }; snippet: { title: string }; statistics: { subscriberCount?: string } }[] }>('https://www.googleapis.com/youtube/v3/channels?part=contentDetails,snippet,statistics&mine=true')
  const c = ch.items?.[0]
  if (!c) throw new Error('Bu Google hesabında YouTube kanalı bulunamadı')
  const pl = await api<{ items?: { contentDetails: { videoId: string } }[] }>(`https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&maxResults=${max}&playlistId=${c.contentDetails.relatedPlaylists.uploads}`)
  const ids = (pl.items || []).map((i) => i.contentDetails.videoId).join(',')
  if (!ids) return { channel: c.snippet.title, subscribers: Number(c.statistics.subscriberCount || 0), videos: [] }
  const v = await api<{ items: { id: string; snippet: { title: string; publishedAt: string }; statistics: { viewCount?: string; likeCount?: string; commentCount?: string }; status: { privacyStatus: string } }[] }>(`https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,status&id=${ids}`)
  return {
    channel: c.snippet.title,
    subscribers: Number(c.statistics.subscriberCount || 0),
    videos: v.items.map((x) => ({ id: x.id, title: x.snippet.title, publishedAt: x.snippet.publishedAt, views: Number(x.statistics.viewCount || 0), likes: Number(x.statistics.likeCount || 0), comments: Number(x.statistics.commentCount || 0), privacy: x.status.privacyStatus })),
  }
}
