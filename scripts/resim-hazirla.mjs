// İçerikteki resim emojilerini Fluent Emoji Flat (MIT, Microsoft) çizimleriyle eşleştirip resim/ klasörüne kopyalar.
// Kullanım: node scripts/resim-hazirla.mjs <fluent-emoji-flat paketinin assets klasörü>
import fs from "fs";
import path from "path";
import { LETTERS, PICTURE_WORDS, THEMES, STORIES, BADGES } from "../js/content.js";
import { EN_LETTERS, EN_THEMES, EN_STORIES } from "../js/content-en.js";

const src = process.argv[2];
const out = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../resim");
fs.mkdirSync(out, { recursive: true });
const set = new Set();
[...LETTERS, ...PICTURE_WORDS, ...EN_LETTERS].forEach((x) => x.e && set.add(x.e));
[...THEMES, ...EN_THEMES].forEach((t) => t.items.forEach((x) => x.e && set.add(x.e)));
[...STORIES, ...EN_STORIES, ...BADGES].forEach((x) => x.icon && set.add(x.icon));

const code = (e) => [...e].map((c) => c.codePointAt(0).toString(16).padStart(4, "0")).join("-");
// Sette olmayanlar için en yakın çizim
const ALT = { "🧑‍🤝‍🧑": "🤝", "👩‍👧": "👩", "👨‍👩‍👧": "🏠" };
const found = [], missing = [];
let bytes = 0;
for (const e of set) {
  const full = code(e);
  const look = code(ALT[e] || e);
  const cands = [look, look.replace(/-fe0f/g, ""), look + "-fe0f"];
  const hit = cands.find((c) => fs.existsSync(path.join(src, c + ".svg")));
  if (!hit) { missing.push(e); continue; }
  const name = full.replace(/-fe0f/g, "") + ".svg"; // uygulamadaki ad: fe0f'siz
  const svg = fs.readFileSync(path.join(src, hit + ".svg"), "utf8");
  if (/<script|on\w+=/i.test(svg)) { missing.push(e); continue; } // güvenlik: betik içeren dosya alınmaz
  fs.writeFileSync(path.join(out, name), svg);
  bytes += svg.length;
  found.push(name.replace(".svg", ""));
}
fs.writeFileSync(path.join(out, "../js/resim-liste.js"),
  `// Otomatik üretildi (scripts/resim-hazirla.mjs): resim/ klasöründeki çizimler\nexport const PICS = new Set(${JSON.stringify(found.sort())});\n`);
console.log(`${found.length} çizim (${(bytes / 1024).toFixed(0)} KB), bulunamayan: ${missing.join(" ") || "yok"}`);
