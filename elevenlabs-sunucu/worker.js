// Konuşan Baykuş — ElevenLabs ses sunucusu (Cloudflare Worker).
//
// API anahtarı BURAYA YAZILMAZ. Cloudflare panelinde bu Worker'ın
// Settings → Variables and Secrets bölümüne "Secret" olarak eklenir:
//   ELEVENLABS_API_KEY = (ElevenLabs API anahtarınız)
// İsteğe bağlı değişkenler:
//   VOICE_ID        = varsayılan ses kimliği (yoksa ilk ses kullanılır)
//   ALLOWED_ORIGINS = virgülle ayrılmış izinli siteler (varsayılan aşağıda)
//
// Uygulama tüm cihazlardan bu sunucuya istek atar; anahtar hiçbir cihaza gitmez.

const DEFAULT_ORIGINS = "https://mustafaaliyalcin1-hue.github.io";
const API = "https://api.elevenlabs.io/v1";
const MODEL = "eleven_multilingual_v2";
const MAX_CHARS = 400;

function cors(origin) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}
const json = (data, status, origin) =>
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json", ...cors(origin) } });

async function sha(text) {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function firstVoice(env) {
  const r = await fetch(`${API}/voices`, { headers: { "xi-api-key": env.ELEVENLABS_API_KEY } });
  const j = await r.json();
  return j.voices?.[0]?.voice_id;
}

export default {
  async fetch(request, env, ctx) {
    const allowed = (env.ALLOWED_ORIGINS || DEFAULT_ORIGINS).split(",").map((s) => s.trim());
    const origin = request.headers.get("Origin") || "";
    const ok = allowed.includes(origin) || /^http:\/\/localhost(:\d+)?$/.test(origin);
    const url = new URL(request.url);

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: ok ? cors(origin) : {} });
    if (!ok) return new Response("Bu siteye izin verilmiyor.", { status: 403 });
    if (!env.ELEVENLABS_API_KEY) return json({ error: "Sunucuda ELEVENLABS_API_KEY tanımlı değil." }, 500, origin);

    // Durum: sunucu çalışıyor mu, varsayılan ses ne?
    if (url.pathname === "/status") return json({ ok: true, voice: env.VOICE_ID || null }, 200, origin);

    // Hesaptaki sesler
    if (url.pathname === "/voices") {
      const r = await fetch(`${API}/voices`, { headers: { "xi-api-key": env.ELEVENLABS_API_KEY } });
      if (!r.ok) return json({ error: `ElevenLabs hatası (${r.status})` }, r.status, origin);
      const j = await r.json();
      return json({ voices: (j.voices || []).map((v) => ({ id: v.voice_id, name: v.name, category: v.category })) }, 200, origin);
    }

    // Metni sese çevir
    if (url.pathname === "/tts" && request.method === "POST") {
      let body;
      try { body = await request.json(); } catch { return json({ error: "Geçersiz istek" }, 400, origin); }
      const text = String(body.text || "").slice(0, MAX_CHARS);
      if (!text.trim()) return json({ error: "Metin boş" }, 400, origin);
      const speed = Math.min(1.2, Math.max(0.7, Number(body.speed) || 1));
      const voice = String(body.voice || env.VOICE_ID || (await firstVoice(env)) || "");
      if (!voice) return json({ error: "Ses bulunamadı" }, 500, origin);

      // Aynı metin bir kez üretilir, sonra Cloudflare önbelleğinden gelir (kota korunur).
      const cacheKey = new Request(`https://cache.baykus/${await sha(`${voice}|${speed}|${MODEL}|${text}`)}`);
      const cache = caches.default;
      const hit = await cache.match(cacheKey);
      if (hit) return new Response(hit.body, { headers: { "Content-Type": "application/json", ...cors(origin) } });

      const r = await fetch(`${API}/text-to-speech/${encodeURIComponent(voice)}/with-timestamps?output_format=mp3_44100_128`, {
        method: "POST",
        headers: { "xi-api-key": env.ELEVENLABS_API_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ text, model_id: MODEL, voice_settings: { stability: 0.5, similarity_boost: 0.75, speed } }),
      });
      if (!r.ok) {
        const t = await r.text();
        return json({ error: `ElevenLabs hatası (${r.status})`, detail: t.slice(0, 300) }, r.status, origin);
      }
      const j = await r.json();
      const a = j.alignment || j.normalized_alignment || {};
      const out = JSON.stringify({ audio: j.audio_base64, starts: a.character_start_times_seconds || [] });
      ctx.waitUntil(cache.put(cacheKey, new Response(out, { headers: { "Cache-Control": "public, max-age=31536000" } })));
      return new Response(out, { headers: { "Content-Type": "application/json", ...cors(origin) } });
    }

    return json({ error: "Bulunamadı" }, 404, origin);
  },
};
