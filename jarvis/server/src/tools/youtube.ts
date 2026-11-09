/** Yapay zekâ aracı: YouTube kanalının durumunu oku ("son videom kaç izlendi?") */
import { z } from 'zod'
import { recentVideos, youtubeConnected } from '../social/youtube.ts'
import { defineTool } from './registry.ts'

defineTool({
  name: 'youtube_channel',
  description: 'Kullanıcının YouTube kanalındaki son videolar, izlenme, beğeni, yorum sayıları ve abone sayısı. "Son videom kaç izlendi", "kanalım nasıl gidiyor" gibi sorularda kullan. Video yükleme, arayüzdeki 🎬 Video Stüdyosu ile yapılır.',
  schema: z.object({ max: z.number().min(1).max(20).optional() }),
  pendingScene: { scene: 'generic', data: { label: 'YOUTUBE KANALI OKUNUYOR' } },
  async run({ max }) {
    if (!youtubeConnected()) throw new Error('YouTube hesabı henüz bağlı değil; kullanıcı Video Stüdyosu’ndan "YouTube’u bağla" demeli.')
    return { result: await recentVideos(max ?? 8) }
  },
})
