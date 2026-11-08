/** Ortam değişkenleri — anahtarlar YALNIZCA burada (backend) okunur. */
import 'dotenv/config'

const env = (k: string, d = '') => process.env[k]?.trim() || d

export const config = {
  port: Number(env('PORT', '8787')),
  appSecret: env('JARVIS_APP_SECRET'),
  /** Arayüzün çalıştığı adresler (CORS). Virgülle ayrılır; boşsa hepsine izin verilir. */
  allowedOrigins: env('ALLOWED_ORIGINS').split(',').map((s) => s.trim()).filter(Boolean),
  anthropicKey: env('ANTHROPIC_API_KEY'),
  model: env('CLAUDE_MODEL', 'claude-sonnet-5-5'),
  /** low | medium | high — sesli asistan için hız/kalite dengesi */
  effort: env('CLAUDE_EFFORT', 'medium') as 'low' | 'medium' | 'high',
  elevenKey: env('ELEVENLABS_API_KEY'),
  elevenVoice: env('ELEVENLABS_VOICE_ID'),
  defaultCity: env('DEFAULT_CITY', 'İstanbul'),
  tz: env('TZ', 'Europe/Istanbul'),
  dataDir: env('DATA_DIR', './data'),
}

export const services = {
  ai: !!config.anthropicKey,
  tts: !!(config.elevenKey && config.elevenVoice),
}
