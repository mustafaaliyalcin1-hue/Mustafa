// Özelleştirilebilir karakter: gövde + gözlük + şapka + boyun aksesuarı + kıyafet + ayakkabı.
// Tüm karakterler aynı iskeleti paylaşır (gövde: merkez 60,70 · gözler 44,54 ve 76,54 · ayaklar y=110),
// böylece her aksesuar her karaktere oturur. stars: açmak için gereken toplam yıldız.

/* ---------- Gövdeler ---------- */
export const BODIES = [
  {
    id: "owl", name: "Baykuş", color: "#8f75ff", belly: "#efe9ff", feet: "#ffb020", stars: 0,
    back: (c) => `<path d="M22 30 L38 44 L26 50 Z M98 30 L82 44 L94 50 Z" fill="${c}"/>`,
    bellyMarks: `<path d="M44 84 q4 4 8 0 M56 92 q4 4 8 0 M68 84 q4 4 8 0" stroke="#c9bbff" stroke-width="2.5" fill="none" stroke-linecap="round"/>`,
    face: `<path d="M54 66 L66 66 L60 75 Z" fill="#ffb020"/>`,
  },
  {
    id: "cat", name: "Kedi", color: "#ffa94d", belly: "#fff1e0", feet: "#ffa94d", stars: 0,
    back: (c) => `<path d="M24 40 L30 12 L50 30 Z M96 40 L90 12 L70 30 Z" fill="${c}"/><path d="M30 34 L32 20 L43 30 Z M90 34 L88 20 L77 30 Z" fill="#ff8fab"/>`,
    bellyMarks: "",
    face: `<path d="M56 66 L64 66 L60 70 Z" fill="#ff6b8b"/><path d="M60 70 q-4 6 -9 3 M60 70 q4 6 9 3" stroke="#7a3e10" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M38 68 L22 65 M38 72 L22 74 M82 68 L98 65 M82 72 L98 74" stroke="#7a3e10" stroke-width="1.8" stroke-linecap="round"/>`,
  },
  {
    id: "bear", name: "Ayıcık", color: "#b07a4f", belly: "#f3dcc4", feet: "#8a5a35", stars: 0,
    back: (c) => `<circle cx="30" cy="32" r="13" fill="${c}"/><circle cx="90" cy="32" r="13" fill="${c}"/><circle cx="30" cy="32" r="6" fill="#f3dcc4"/><circle cx="90" cy="32" r="6" fill="#f3dcc4"/>`,
    bellyMarks: "",
    face: `<ellipse cx="60" cy="72" rx="13" ry="10" fill="#f3dcc4"/><ellipse cx="60" cy="68" rx="5" ry="3.5" fill="#4a2c17"/><path d="M60 71 v4 M60 75 q-4 3 -7 1 M60 75 q4 3 7 1" stroke="#4a2c17" stroke-width="2" fill="none" stroke-linecap="round"/>`,
  },
  {
    id: "robot", name: "Robot", color: "#7fa7c9", belly: "#dbe9f5", feet: "#55718a", stars: 0,
    back: () => `<path d="M60 26 V10" stroke="#55718a" stroke-width="4" stroke-linecap="round"/><circle cx="60" cy="9" r="6" fill="#ff5d5d"/>
      <rect x="14" y="56" width="8" height="18" rx="3" fill="#55718a"/><rect x="98" y="56" width="8" height="18" rx="3" fill="#55718a"/>`,
    bellyMarks: `<circle cx="50" cy="92" r="4" fill="#ffcc4d"/><circle cx="60" cy="92" r="4" fill="#7ee081"/><circle cx="70" cy="92" r="4" fill="#ff5d5d"/>`,
    face: `<rect x="48" y="67" width="24" height="9" rx="3" fill="#2b2550"/><path d="M51 71.5 h18" stroke="#7ee081" stroke-width="2" stroke-dasharray="3 2"/>`,
  },
  {
    id: "fox", name: "Tilki", color: "#ff7a3d", belly: "#ffffff", feet: "#3b2a22", stars: 0,
    back: (c) => `<path d="M22 44 L26 8 L52 30 Z M98 44 L94 8 L68 30 Z" fill="${c}"/><path d="M28 34 L29 18 L42 30 Z M92 34 L91 18 L78 30 Z" fill="#3b2a22"/>`,
    bellyMarks: "",
    face: `<path d="M40 64 Q60 90 80 64 Q60 72 40 64 Z" fill="#ffffff"/><ellipse cx="60" cy="69" rx="5" ry="3.5" fill="#2b2550"/><path d="M60 72 q-3 4 -6 2 M60 72 q3 4 6 2" stroke="#2b2550" stroke-width="1.8" fill="none" stroke-linecap="round"/>`,
  },
  {
    id: "penguin", name: "Penguen", color: "#34405e", belly: "#ffffff", feet: "#ffb020", stars: 15,
    back: (c) => `<path d="M22 64 Q8 84 20 100 Q24 84 28 76 Z M98 64 Q112 84 100 100 Q96 84 92 76 Z" fill="${c}"/>`,
    bellyMarks: "",
    face: `<path d="M53 65 L67 65 L60 74 Z" fill="#ffb020"/>`,
  },
  {
    id: "dino", name: "Dinozor", color: "#5cc96b", belly: "#e2f8d8", feet: "#3e9b4b", stars: 25,
    back: () => `<path d="M40 30 L46 16 L52 28 L58 12 L64 28 L70 16 L76 28 L82 20 L84 34 Z" fill="#ffb020"/>`,
    bellyMarks: `<path d="M46 86 h28 M48 96 h24" stroke="#bfe8b3" stroke-width="3" stroke-linecap="round"/>`,
    face: `<path d="M46 68 Q60 82 74 68" stroke="#2b2550" stroke-width="3" fill="#fff" stroke-linejoin="round"/><circle cx="55" cy="64" r="1.6" fill="#2b2550"/><circle cx="65" cy="64" r="1.6" fill="#2b2550"/>`,
  },
];

/* ---------- Aksesuarlar ---------- */
const NONE = { id: "none", name: "Yok", stars: 0, svg: "" };
const star = (cx, cy, r, fill, extra = "") => {
  const p = [];
  for (let i = 0; i < 10; i++) {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const rr = i % 2 ? r * 0.45 : r;
    p.push(`${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`);
  }
  return `<polygon points="${p.join(" ")}" fill="${fill}" ${extra}/>`;
};
const heart = (cx, cy, s, fill, extra = "") =>
  `<path d="M${cx} ${cy + s * 0.9} C${cx - s * 1.6} ${cy - s * 0.2} ${cx - s * 0.8} ${cy - s * 1.3} ${cx} ${cy - s * 0.45} C${cx + s * 0.8} ${cy - s * 1.3} ${cx + s * 1.6} ${cy - s * 0.2} ${cx} ${cy + s * 0.9} Z" fill="${fill}" ${extra}/>`;

export const SLOTS = [
  {
    id: "glasses", name: "Gözlük", icon: "👓",
    items: [
      NONE,
      { id: "round", name: "Yuvarlak", stars: 0, svg: `<g fill="none" stroke="#2b2550" stroke-width="3.5"><circle cx="44" cy="54" r="16"/><circle cx="76" cy="54" r="16"/><path d="M60 52 q0 -4 0 0"/><path d="M58 51 Q60 48 62 51"/><path d="M28 50 L20 46 M92 50 L100 46"/></g>` },
      { id: "sun", name: "Güneş gözlüğü", stars: 0, svg: `<g><path d="M26 46 h36 v6 q-2 14 -18 14 q-16 0 -18 -14 Z M58 46 h36 v6 q-2 14 -18 14 q-16 0 -18 -14 Z" fill="#1d1b2e"/><path d="M32 50 l8 0 M64 50 l8 0" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".6"/></g>` },
      { id: "star", name: "Yıldız gözlük", stars: 0, svg: star(44, 54, 20, "rgba(255,93,177,.35)", 'stroke="#ff3d9a" stroke-width="3" stroke-linejoin="round"') + star(76, 54, 20, "rgba(255,93,177,.35)", 'stroke="#ff3d9a" stroke-width="3" stroke-linejoin="round"') },
      { id: "heart", name: "Kalp gözlük", stars: 10, svg: heart(44, 56, 12, "rgba(255,59,92,.55)", 'stroke="#e0213f" stroke-width="3"') + heart(76, 56, 12, "rgba(255,59,92,.55)", 'stroke="#e0213f" stroke-width="3"') },
      { id: "ski", name: "Kayak gözlüğü", stars: 20, svg: `<path d="M18 50 Q18 40 30 40 H90 Q102 40 102 50 V58 Q102 68 90 68 H72 L60 60 L48 68 H30 Q18 68 18 58 Z" fill="rgba(80,200,255,.55)" stroke="#ff7a3d" stroke-width="4"/><path d="M26 48 q10 -4 20 0" stroke="#fff" stroke-width="3" fill="none" opacity=".8"/>` },
    ],
  },
  {
    id: "hat", name: "Şapka", icon: "🧢",
    items: [
      NONE,
      { id: "cap", name: "Kep", stars: 0, svg: `<path d="M28 34 Q30 12 60 12 Q90 12 92 34 Z" fill="#e63946"/><path d="M60 30 Q96 26 108 36 Q90 38 60 36 Z" fill="#b8202c"/><circle cx="60" cy="13" r="3" fill="#b8202c"/>` },
      { id: "headphones", name: "Kulaklık", stars: 0, svg: `<path d="M22 54 Q22 14 60 14 Q98 14 98 54" stroke="#2b2550" stroke-width="6" fill="none"/><rect x="12" y="46" width="16" height="26" rx="7" fill="#5b4bdb"/><rect x="92" y="46" width="16" height="26" rx="7" fill="#5b4bdb"/>` },
      { id: "bow", name: "Fiyonk", stars: 0, svg: `<path d="M84 26 L70 14 Q66 26 70 36 Z M84 26 L98 14 Q102 26 98 36 Z" fill="#ff5db1"/><circle cx="84" cy="26" r="5" fill="#e0218a"/>` },
      { id: "crown", name: "Taç", stars: 30, svg: `<path d="M34 34 L36 10 L48 22 L60 6 L72 22 L84 10 L86 34 Z" fill="#ffc83d" stroke="#e09b00" stroke-width="2.5" stroke-linejoin="round"/><circle cx="60" cy="26" r="4" fill="#e63946"/><circle cx="45" cy="28" r="3" fill="#3da5ff"/><circle cx="75" cy="28" r="3" fill="#3da5ff"/>` },
      { id: "wizard", name: "Sihirbaz şapkası", stars: 50, svg: `<path d="M30 34 L66 0 L90 34 Z" fill="#4b3bc4"/><path d="M22 34 Q60 44 98 34 Q60 28 22 34 Z" fill="#3a2d9e"/>${star(62, 18, 6, "#ffd23d")}${star(76, 28, 4, "#ffd23d")}` },
    ],
  },
  {
    id: "neck", name: "Boyun", icon: "🧣",
    items: [
      NONE,
      { id: "scarf", name: "Atkı", stars: 0, svg: `<path d="M22 76 Q60 90 98 76 L98 86 Q60 100 22 86 Z" fill="#e63946"/><path d="M34 82 v8 M46 85 v9 M58 87 v9 M70 86 v9 M82 83 v8" stroke="#fff" stroke-width="3"/><path d="M76 88 L84 112 L94 108 L88 84 Z" fill="#e63946"/><path d="M80 98 l9 -3 M82 104 l9 -3" stroke="#fff" stroke-width="3"/>` },
      { id: "bowtie", name: "Papyon", stars: 0, svg: `<path d="M60 82 L44 72 L44 92 Z M60 82 L76 72 L76 92 Z" fill="#2b2550"/><circle cx="60" cy="82" r="4.5" fill="#e63946"/>` },
      { id: "whistle", name: "Hakem düdüğü", stars: 0, svg: `<path d="M34 76 Q60 98 86 76" stroke="#e63946" stroke-width="3" fill="none"/><rect x="54" y="88" width="16" height="10" rx="5" fill="#c0c7d1" stroke="#7d8794" stroke-width="2"/><circle cx="58" cy="93" r="2.5" fill="#7d8794"/>` },
      { id: "medal", name: "Madalya", stars: 20, svg: `<path d="M46 72 L58 94 M74 72 L62 94" stroke="#3da5ff" stroke-width="6" stroke-linecap="round"/><circle cx="60" cy="98" r="9" fill="#ffc83d" stroke="#e09b00" stroke-width="2.5"/>${star(60, 98, 5, "#e09b00")}` },
    ],
  },
  {
    id: "outfit", name: "Kıyafet", icon: "👕",
    items: [
      NONE,
      { id: "tshirt", name: "Mavi tişört", stars: 0, fill: `<rect x="0" y="76" width="120" height="48" fill="#3da5ff"/><path d="M48 76 Q60 86 72 76" fill="#1f7fd6"/>` },
      { id: "redyellow", name: "Kırmızı-Sarı forma", stars: 0, fill: `<rect x="0" y="76" width="60" height="48" fill="#e63946"/><rect x="60" y="76" width="60" height="48" fill="#ffc83d"/>`, number: "#fff" },
      { id: "yellownavy", name: "Sarı-Lacivert forma", stars: 0, fill: `<rect x="0" y="76" width="120" height="48" fill="#1d2b6b"/><g fill="#ffd23d"><rect x="20" y="76" width="10" height="48"/><rect x="40" y="76" width="10" height="48"/><rect x="60" y="76" width="10" height="48"/><rect x="80" y="76" width="10" height="48"/></g>`, number: "#fff" },
      { id: "blackwhite", name: "Siyah-Beyaz forma", stars: 0, fill: `<rect x="0" y="76" width="120" height="48" fill="#fff"/><g fill="#1d1b2e"><rect x="16" y="76" width="11" height="48"/><rect x="38" y="76" width="11" height="48"/><rect x="60" y="76" width="11" height="48"/><rect x="82" y="76" width="11" height="48"/></g>`, number: "#e63946" },
      { id: "claretblue", name: "Bordo-Mavi forma", stars: 0, fill: `<rect x="0" y="76" width="120" height="48" fill="#7a1f3d"/><rect x="0" y="88" width="120" height="8" fill="#5bc0f8"/>`, number: "#fff" },
      { id: "national", name: "Milli forma", stars: 10, fill: `<rect x="0" y="76" width="120" height="48" fill="#e30a17"/><circle cx="56" cy="91" r="7" fill="#fff"/><circle cx="58" cy="91" r="5.6" fill="#e30a17"/>${star(66, 91, 3.6, "#fff")}` },
      { id: "hero", name: "Süper kahraman", stars: 40, fill: `<rect x="0" y="76" width="120" height="48" fill="#5b4bdb"/><rect x="0" y="100" width="120" height="5" fill="#ffc83d"/>${star(60, 88, 8, "#ffc83d")}`, back: `<path d="M26 74 Q8 110 16 118 L104 118 Q112 110 94 74 Z" fill="#e63946"/>` },
    ],
  },
  {
    id: "shoes", name: "Ayakkabı", icon: "👟",
    items: [
      NONE,
      { id: "sneaker", name: "Spor ayakkabı", stars: 0, svg: `<g><path d="M32 106 Q34 101 44 101 Q54 102 56 108 V112 H32 Z M64 106 Q66 101 76 101 Q86 102 88 108 V112 H64 Z" fill="#e63946"/><path d="M31 110 H57 V114 H31 Z M63 110 H89 V114 H63 Z" fill="#fff"/><path d="M40 104 l4 0 M72 104 l4 0" stroke="#fff" stroke-width="2"/></g>` },
      { id: "cleats", name: "Krampon", stars: 0, svg: `<g><path d="M32 106 Q34 101 44 101 Q54 102 56 108 V112 H32 Z M64 106 Q66 101 76 101 Q86 102 88 108 V112 H64 Z" fill="#1d1b2e"/><path d="M38 104 l10 6 M70 104 l10 6" stroke="#7ee081" stroke-width="2.5"/><g fill="#c0c7d1"><rect x="34" y="112" width="3" height="3"/><rect x="42" y="112" width="3" height="3"/><rect x="50" y="112" width="3" height="3"/><rect x="66" y="112" width="3" height="3"/><rect x="74" y="112" width="3" height="3"/><rect x="82" y="112" width="3" height="3"/></g></g>` },
      { id: "boots", name: "Bot", stars: 0, svg: `<path d="M36 96 H50 V104 Q56 105 57 110 V114 H34 V100 Z M68 96 H82 V104 Q88 105 89 110 V114 H66 V100 Z" fill="#8a5a35"/><path d="M34 111 H57 M66 111 H89" stroke="#4a2c17" stroke-width="3"/>` },
      { id: "rain", name: "Yağmur çizmesi", stars: 0, svg: `<path d="M36 94 H50 V104 Q56 105 57 110 V114 H34 V98 Z M68 94 H82 V104 Q88 105 89 110 V114 H66 V98 Z" fill="#ffd23d"/><path d="M36 97 H50 M68 97 H82" stroke="#e09b00" stroke-width="2.5"/>` },
      { id: "gold", name: "Altın ayakkabı", stars: 80, svg: `<g><path d="M32 106 Q34 101 44 101 Q54 102 56 108 V112 H32 Z M64 106 Q66 101 76 101 Q86 102 88 108 V112 H64 Z" fill="#ffc83d" stroke="#e09b00" stroke-width="2"/><path d="M38 104 l3 -2 M70 104 l3 -2" stroke="#fff" stroke-width="2" stroke-linecap="round"/></g>` },
    ],
  },
];

export const DEFAULT_LOOK = { body: "owl", glasses: "none", hat: "none", neck: "none", outfit: "none", shoes: "none" };

export const bodyOf = (id) => BODIES.find((b) => b.id === id) || BODIES[0];
export const itemOf = (slot, id) => SLOTS.find((s) => s.id === slot).items.find((i) => i.id === id) || NONE;

let uid = 0;
/** Karakteri SVG olarak çizer. cls: ek sınıflar ("happy", "thinking", "big"...). */
export function characterSVG(look = DEFAULT_LOOK, cls = "") {
  const l = { ...DEFAULT_LOOK, ...look };
  const b = bodyOf(l.body);
  const outfit = itemOf("outfit", l.outfit);
  const shoes = itemOf("shoes", l.shoes);
  const clip = `cbody${++uid}`;
  const body = `M60 26 a40 44 0 1 0 0.01 0 Z`;
  return `<svg class="owl ${cls}" viewBox="0 0 120 120" aria-hidden="true">
    <defs><clipPath id="${clip}"><ellipse cx="60" cy="70" rx="40" ry="44"/></clipPath></defs>
    ${outfit.back || ""}
    ${b.back(b.color)}
    <path d="${body}" fill="${b.color}"/>
    <ellipse cx="60" cy="82" rx="25" ry="28" fill="${b.belly}"/>
    ${b.bellyMarks}
    ${outfit.fill ? `<g clip-path="url(#${clip})">${outfit.fill}</g>` : ""}
    ${outfit.number ? `<text x="60" y="${outfit.id === "claretblue" ? 107 : 100}" text-anchor="middle" font-size="13" font-weight="800" font-family="Baloo 2, sans-serif" fill="${outfit.number}">10</text>` : ""}
    <g class="eyes">
      <circle cx="44" cy="54" r="15" fill="#fff"/><circle cx="76" cy="54" r="15" fill="#fff"/>
      <circle class="pupil" cx="45" cy="55" r="7.5" fill="#2b2550"/><circle class="pupil" cx="75" cy="55" r="7.5" fill="#2b2550"/>
      <circle cx="47" cy="52" r="2.2" fill="#fff"/><circle cx="77" cy="52" r="2.2" fill="#fff"/>
    </g>
    ${b.face}
    ${itemOf("glasses", l.glasses).svg}
    ${itemOf("neck", l.neck).svg}
    ${itemOf("hat", l.hat).svg}
    ${shoes.svg || `<ellipse cx="44" cy="110" rx="8" ry="4" fill="${b.feet}"/><ellipse cx="76" cy="110" rx="8" ry="4" fill="${b.feet}"/>`}
  </svg>`;
}
