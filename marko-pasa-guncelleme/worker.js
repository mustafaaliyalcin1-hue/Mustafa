// Marko Paşa aracı sunucusu (Cloudflare Worker)
// Anahtarlar burada değil, Cloudflare'de "Variables and Secrets" bölümünde saklanır:
//   GROQ_KEY   -> Groq anahtarı (gsk_...)
//   ELEVEN_KEY -> ElevenLabs anahtarı (sk_...)
//   APP_PIN    -> (isteğe bağlı) şifre; boş bırakılırsa şifre sorulmaz
const ALLOWED = ["https://mustafaaliyalcin1-hue.github.io"];

export default {
  async fetch(req, env) {
    const origin = req.headers.get("Origin") || "";
    const cors = {
      "Access-Control-Allow-Origin": ALLOWED.includes(origin) ? origin : ALLOWED[0],
      "Access-Control-Allow-Headers": "Content-Type, X-Pin",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Vary": "Origin",
    };
    const out = (body, status) => new Response(body, { status, headers: cors });
    if (req.method === "OPTIONS") return new Response(null, { headers: cors });
    if (!ALLOWED.includes(origin)) return out("yasak", 403);
    if (env.APP_PIN && req.headers.get("X-Pin") !== env.APP_PIN) return out("pin", 401);

    const url = new URL(req.url);
    let up;
    if (url.pathname === "/groq/chat" && req.method === "POST") {
      up = fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: "Bearer " + env.GROQ_KEY, "Content-Type": "application/json" },
        body: req.body,
      });
    } else if (url.pathname === "/groq/models") {
      up = fetch("https://api.groq.com/openai/v1/models", { headers: { Authorization: "Bearer " + env.GROQ_KEY } });
    } else if (url.pathname.startsWith("/tts/") && req.method === "POST") {
      const vid = encodeURIComponent(decodeURIComponent(url.pathname.slice(5).replace(/\/stream$/, "")));
      up = fetch(`https://api.elevenlabs.io/v1/text-to-speech/${vid}/stream${url.search}`, {
        method: "POST",
        headers: { "xi-api-key": env.ELEVEN_KEY, "Content-Type": "application/json", Accept: "audio/mpeg" },
        body: req.body,
      });
    } else if (url.pathname === "/") {
      return out("Marko Paşa sunucusu çalışıyor.", 200);
    } else {
      return out("yok", 404);
    }
    const r = await up;
    const h = new Headers(r.headers);
    for (const [k, v] of Object.entries(cors)) h.set(k, v);
    return new Response(r.body, { status: r.status, headers: h });
  },
};
