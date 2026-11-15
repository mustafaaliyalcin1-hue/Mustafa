/** Ortam değişkenleri — anahtarlar YALNIZCA burada (backend) okunur. */
import 'dotenv/config'

const env = (k: string, d = '') => process.env[k]?.trim() || d

export const config = {
  port: Number(env('PORT', '8787')),
  appSecret: env('JARVIS_APP_SECRET'),
  /** Arayüzün çalıştığı adresler (CORS). Virgülle ayrılır; boşsa hepsine izin verilir. */
  allowedOrigins: env('ALLOWED_ORIGINS').split(',').map((s) => s.trim()).filter(Boolean),
  anthropicKey: env('ANTHROPIC_API_KEY'),
  geminiKey: env('GEMINI_API_KEY'),
  /** Ücretsiz katmanı olan Flash modeli; "-latest" takma adı Google güncelledikçe yeni sürüme geçer */
  geminiModel: env('GEMINI_MODEL', 'gemini-flash-latest'),
  // Diğer ücretsiz beyinler (biri kotayı doldurunca sıradakine geçilir)
  groqKey: env('GROQ_API_KEY'),
  groqModel: env('GROQ_MODEL', 'openai/gpt-oss-120b'),
  openrouterKey: env('OPENROUTER_API_KEY'),
  openrouterModel: env('OPENROUTER_MODEL', 'openai/gpt-oss-20b:free'),
  /** Yerel model: Ollama adresi (ör. http://localhost:11434/v1 ya da tünel adresi + /v1) */
  ollamaUrl: env('OLLAMA_URL'),
  ollamaModel: env('OLLAMA_MODEL', 'qwen3:8b'),
  ollamaKey: env('OLLAMA_KEY'),
  /** Komut çözücü (yapay zekâsız hızlı komutlar); LOCAL_INTENTS=off ile kapatılır */
  localIntents: env('LOCAL_INTENTS', 'on') !== 'off',
  brainOrder: env('BRAIN_ORDER').split(',').map((s) => s.trim()).filter(Boolean),
  model: env('CLAUDE_MODEL', 'claude-sonnet-5-5'),
  /** low | medium | high — sesli asistan için hız/kalite dengesi */
  effort: env('CLAUDE_EFFORT', 'medium') as 'low' | 'medium' | 'high',
  /** Karma beyin: bilgisayar köprüsünün şifresi (yalnızca ortam değişkeninde) */
  kopruSifresi: env('KOPRU_SIFRESI'),
  /** Karma beyinde API'ye düşünce kullanılan efor (kısa sesli cevaplar için düşük = hızlı ve ucuz) */
  karmaEffort: env('KARMA_EFFORT', 'low') as 'low' | 'medium' | 'high',
  elevenKey: env('ELEVENLABS_API_KEY'),
  elevenVoice: env('ELEVENLABS_VOICE_ID'),
  defaultCity: env('DEFAULT_CITY', 'Elazığ'),
  tz: env('TZ', 'Europe/Istanbul'),
  dataDir: env('DATA_DIR', './data'),
  /** Sunucunun herkese açık adresi (Render bunu otomatik verir) */
  publicUrl: env('PUBLIC_URL', env('RENDER_EXTERNAL_URL', 'http://localhost:8787')),
  // YouTube (Google OAuth) — Google Cloud Console'da oluşturulan OAuth istemcisi
  googleClientId: env('GOOGLE_CLIENT_ID'),
  googleClientSecret: env('GOOGLE_CLIENT_SECRET'),
  youtubeRefreshToken: env('YOUTUBE_REFRESH_TOKEN'),
  /** Yüklenen videoların geçici klasörü */
  uploadDir: env('UPLOAD_DIR', '/tmp/jarvis-uploads'),
}

/** Hangi beyin? Varsayılan: Gemini anahtarı varsa Gemini (ücretsiz), yoksa Claude. AI_PROVIDER ile zorlanabilir. */
const hasFree = !!(config.geminiKey || config.groqKey || config.openrouterKey || config.ollamaUrl)
/**
 * Beyin seçimi (AI_PROVIDER ile zorlanabilir):
 *  - 'karma' : bilgisayar açıkken Claude Code (köprü), kapalıyken Claude API — KOPRU_SIFRESI varsa varsayılan
 *  - 'free'  : ücretsiz zincir (Gemini → Groq → OpenRouter → Ollama)
 *  - 'claude': Claude API ajanı (araçlı)
 */
const secim = env('AI_PROVIDER')
export const provider: 'free' | 'claude' | 'karma' =
  secim === 'karma' || secim === 'claude' || secim === 'free' ? secim : config.kopruSifresi ? 'karma' : hasFree ? 'free' : 'claude'
export const hasFreeBrain = hasFree

export const services = {
  ai: provider === 'free' ? hasFree : provider === 'karma' ? !!(config.kopruSifresi || config.anthropicKey || hasFree) : !!config.anthropicKey,
  provider,
  tts: !!(config.elevenKey && config.elevenVoice),
}
