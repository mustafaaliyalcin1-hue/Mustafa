// Konuşan Arkadaşım: metinleri ElevenLabs ile bir kez seslendirir → ses/<anahtar>.mp3 + ses/manifest.json
// Kaldığı yerden devam eder; kota azalınca durur. Önemli içerik önce üretilir.
// Kullanım: ELEVENLABS_API_KEY=... node scripts/ses-uret.mjs   (anahtar ağ vekilinden de gelebilir)
import fs from "fs";
import path from "path";
import { collect } from "./ses-listesi.mjs";
import { syllabify } from "../js/text.js";

const VOICE = "cgSgspJ2msm6clMCkdW9"; // Jessica
const MODEL = "eleven_flash_v2_5"; // karakter başına 0,5 kredi
const COST = 0.5;
const MARGIN = 40; // kotada bırakılacak pay (kredi)
const OUT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../ses");
const API = "https://api.elevenlabs.io/v1";
const KEY = process.env.ELEVENLABS_API_KEY || "proxy-injected";
const H = { "xi-api-key": KEY };

fs.mkdirSync(OUT, { recursive: true });
const manPath = path.join(OUT, "manifest.json");
const manifest = fs.existsSync(manPath) ? JSON.parse(fs.readFileSync(manPath, "utf8")) : {};

// Öncelik: 0 cümle/kelime içeriği, 1 sabit cümleler, 2 İngilizce, 3 tek heceler, 4 uzun ipuçları
const rank = (x) => {
  if (x.text.length > 60) return 4;
  if (x.lang === "en") return 2;
  if (!x.text.includes(" ") && syllabify(x.text).length === 1 && x.text.length <= 4) return 3;
  return /[!?.:]$/.test(x.text) && !/^[A-ZÇĞİÖŞÜ]/.test(x.text) ? 1 : 0;
};
const todo = collect().filter((x) => !manifest[x.key]).sort((a, b) => rank(a) - rank(b));

async function remaining() {
  const r = await fetch(`${API}/user/subscription`, { headers: H });
  const j = await r.json();
  return j.character_limit - j.character_count;
}

async function synth(x) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const r = await fetch(`${API}/text-to-speech/${VOICE}/with-timestamps?output_format=mp3_22050_32`, {
      method: "POST",
      headers: { ...H, "Content-Type": "application/json" },
      body: JSON.stringify({ text: x.text, model_id: MODEL, language_code: x.lang, voice_settings: { stability: 0.5, similarity_boost: 0.75 } }),
    });
    if (r.status === 429 || r.status >= 500) { await new Promise((s) => setTimeout(s, 1500 * (attempt + 1))); continue; }
    if (!r.ok) throw new Error(`${r.status} ${(await r.text()).slice(0, 200)}`);
    const j = await r.json();
    const starts = j.alignment?.character_start_times_seconds || [];
    const words = [];
    x.text.replace(/\S+/g, (_, i) => words.push(Math.round((starts[i] ?? 0) * 1000) / 1000));
    fs.writeFileSync(path.join(OUT, `${x.key}.mp3`), Buffer.from(j.audio_base64, "base64"));
    manifest[x.key] = words;
    return;
  }
  throw new Error("tekrar denemeler başarısız");
}

let budget = (await remaining()) - MARGIN; // sayaç gecikmeli; kendi hesabımızı da tutarız
console.log(`Yapılacak: ${todo.length} metin · kullanılabilir kredi ≈ ${budget}`);
let done = 0, spent = 0, skipped = 0;
const save = () => fs.writeFileSync(manPath, JSON.stringify(manifest));
const queue = [...todo];
async function worker() {
  while (queue.length) {
    const x = queue.shift();
    const cost = Math.ceil(x.text.length * COST);
    if (spent + cost > budget) { skipped++; continue; }
    spent += cost;
    try { await synth(x); done++; } catch (e) {
      console.error("HATA:", x.text, e.message);
      if (/quota|401|402/.test(e.message)) { queue.length = 0; }
    }
    if (done % 50 === 0) { save(); console.log(`${done} hazır · ≈${spent} kredi`); }
  }
}
await Promise.all([worker(), worker(), worker()]);
save();
console.log(`Bitti: ${done} yeni ses · ≈${spent} kredi · kota yüzünden atlanan: ${skipped} · toplam: ${Object.keys(manifest).length}`);
