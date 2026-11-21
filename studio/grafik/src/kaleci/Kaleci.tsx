import React from "react";
import { AbsoluteFill, OffthreadVideo, interpolate, staticFile, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { Altyazi, FONTLAR, RENK, giris, Kelime } from "../eldiven/Eldiven";

export type PlanK = {
  sure: number; kelimeler: Kelime[]; editRozet: [number, number];
  mgBas: number; mgSon: number; kaleciGir: number; kurtaris: number[]; kolayGol: number; takim: number; soru: number;
  siklar: { t: number; harf: string; yazi: string }[]; son: number;
};
const UNB = "Unbounded", MONT = "Mont";
const useT = () => { const f = useCurrentFrame(); const { fps } = useVideoConfig(); return { t: f / fps, fps }; };
const ara = (t: number, a: number, b: number, x = 0, y = 1, e = Easing.inOut(Easing.cubic)) =>
  interpolate(t, [a, b], [x, y], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

/* saha ölçüleri */
export const KX0 = 240, KX1 = 840, UST = 600, ZEMIN = 1000;   // kale: direkler, üst direk, zemin çizgisi
const HEDEF = [  // zor şutlar: kale köşeleri (ÇATAL / 90 / üst köşe)
  { x: 285, y: 640, etiket: "ÇATAL!", poz: "solUc" as const },
  { x: 795, y: 640, etiket: "90'A!", poz: "sagUc" as const },
  { x: 660, y: 625, etiket: "ÜST KÖŞE!", poz: "sicra" as const },
];
const SUT = 0.5;  // şutun kaleye varış süresi

/* ---------------- sahne arka planı: gece halı sahası ---------------- */
export const Saha: React.FC<{ t: number }> = ({ t }) => (
  <svg width={1080} height={1920} style={{ position: "absolute" }}>
    <defs>
      <linearGradient id="gok" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#070d22" /><stop offset="1" stopColor="#17305c" /></linearGradient>
      <linearGradient id="isik" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff8d6" stopOpacity="0.55" /><stop offset="1" stopColor="#fff8d6" stopOpacity="0" /></linearGradient>
      <pattern id="tel" width="34" height="34" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <path d="M0 0H34M0 0V34" stroke="rgba(190,210,235,0.22)" strokeWidth="2" /></pattern>
      <pattern id="file" width="26" height="26" patternUnits="userSpaceOnUse">
        <path d="M0 0H26M0 0V26" stroke="rgba(255,255,255,0.55)" strokeWidth="2" /></pattern>
      <radialGradient id="spot" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#fffbe6" /><stop offset="1" stopColor="#fffbe6" stopOpacity="0" /></radialGradient>
    </defs>
    <rect width={1080} height={1920} fill="url(#gok)" />
    {/* projektörler */}
    {[120, 960].map((x, i) => (
      <g key={i}>
        <polygon points={`${x - 40},170 ${x + 40},170 ${x + (i ? -420 : 420)},1100 ${x + (i ? -80 : 80)},1100`} fill="url(#isik)"
          opacity={0.55 + 0.08 * Math.sin(t * 3 + i)} />
        <rect x={x - 6} y={170} width={12} height={560} fill="#2b3550" />
        <rect x={x - 60} y={120} width={120} height={56} rx={10} fill="#d9e2f2" />
        <circle cx={x} cy={148} r={90} fill="url(#spot)" opacity={0.7} />
      </g>
    ))}
    {/* tel çit */}
    <rect x={0} y={380} width={1080} height={640} fill="url(#tel)" />
    <rect x={0} y={376} width={1080} height={8} fill="#3a4766" />
    {/* çim: perspektif şeritler */}
    {Array.from({ length: 12 }).map((_, i) => {
      const y0 = ZEMIN + Math.pow(i / 12, 1.6) * 920, y1 = ZEMIN + Math.pow((i + 1) / 12, 1.6) * 920;
      return <rect key={i} x={0} y={y0} width={1080} height={y1 - y0 + 1} fill={i % 2 ? "#2f9a3e" : "#37ab47"} />;
    })}
    <rect x={0} y={ZEMIN - 30} width={1080} height={32} fill="#2a8a37" />
    {/* çizgiler: kale çizgisi + ceza yayı */}
    <rect x={0} y={ZEMIN - 4} width={1080} height={8} fill="rgba(255,255,255,0.9)" />
    <path d={`M 90 ${ZEMIN} Q 540 ${ZEMIN + 560} 990 ${ZEMIN}`} fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth={9} />
    <ellipse cx={540} cy={ZEMIN + 470} rx={14} ry={6} fill="#fff" />
    {/* kale: arka file + direkler */}
    <polygon points={`${KX0},${UST} ${KX1},${UST} ${KX1 - 50},${UST + 60} ${KX0 + 50},${UST + 60}`} fill="url(#file)" />
    <rect x={KX0 + 50} y={UST + 60} width={KX1 - KX0 - 100} height={ZEMIN - UST - 60} fill="url(#file)" />
    <polygon points={`${KX0},${UST} ${KX0 + 50},${UST + 60} ${KX0 + 50},${ZEMIN} ${KX0},${ZEMIN}`} fill="url(#file)" />
    <polygon points={`${KX1},${UST} ${KX1 - 50},${UST + 60} ${KX1 - 50},${ZEMIN} ${KX1},${ZEMIN}`} fill="url(#file)" />
  </svg>
);
export const Direkler = () => (
  <svg width={1080} height={1920} style={{ position: "absolute" }}>
    <rect x={KX0 - 16} y={UST - 16} width={16} height={ZEMIN - UST + 16} fill="#f4f4f4" />
    <rect x={KX1} y={UST - 16} width={16} height={ZEMIN - UST + 16} fill="#f4f4f4" />
    <rect x={KX0 - 16} y={UST - 16} width={KX1 - KX0 + 32} height={16} fill="#f4f4f4" />
    {Array.from({ length: 8 }).map((_, i) => <rect key={i} x={KX0 - 16 + i * 81} y={UST - 16} width={40} height={16} fill="#e23b3b" />)}
  </svg>
);

/* ---------------- kaleci karakteri (poz parametreli) ---------------- */
export type Poz = { x: number; y: number; don: number; kolSol: number; kolSag: number; bacak: number; comel: number; yuz: "normal" | "uzgun" | "saskin" | "kizgin" };
export const Kaleci: React.FC<{ p: Poz; olcek?: number }> = ({ p, olcek = 1 }) => {
  const kol = (aci: number, isaret: number) => (
    <g transform={`translate(${isaret * 52},-190) rotate(${aci * isaret})`}>
      <rect x={-13} y={0} width={26} height={110} rx={13} fill="#ff8a1f" />
      <circle cx={0} cy={118} r={26} fill="#fff" stroke="#111" strokeWidth={5} />
    </g>
  );
  const bac = (isaret: number) => (
    <g transform={`translate(${isaret * 26},-${92 - p.comel * 30}) rotate(${isaret * (8 + p.bacak)})`}>
      <rect x={-15} y={0} width={30} height={96 - p.comel * 30} rx={14} fill="#1b1b22" />
      <rect x={-20} y={84 - p.comel * 30} width={44} height={20} rx={10} fill="#ffd60a" transform={isaret < 0 ? "scale(-1,1)" : ""} />
    </g>
  );
  return (
    <g transform={`translate(${p.x},${p.y}) scale(${olcek}) rotate(${p.don},0,-140)`}>
      <ellipse cx={0} cy={8} rx={70} ry={14} fill="rgba(0,0,0,0.25)" transform={`translate(${-p.x + p.x},${(ZEMIN - p.y) / olcek}) `} opacity={p.y < ZEMIN - 30 ? 0.3 : 1} />
      {bac(-1)}{bac(1)}
      <g transform={`translate(0,${p.comel * 30})`}>
        <rect x={-58} y={-225} width={116} height={140} rx={36} fill="#ff8a1f" stroke="#111" strokeWidth={5} />
        <text x={0} y={-130} textAnchor="middle" fontFamily={UNB} fontWeight={900} fontSize={62} fill="#111">1</text>
        <rect x={-60} y={-100} width={120} height={36} rx={14} fill="#1b1b22" />
        {kol(p.kolSol, -1)}{kol(p.kolSag, 1)}
        <circle cx={0} cy={-268} r={48} fill="#f2c7a5" stroke="#111" strokeWidth={5} />
        <path d="M -48 -282 Q 0 -340 48 -282 Q 30 -300 0 -300 Q -30 -300 -48 -282 Z" fill="#4a2e1c" />
        {p.yuz === "uzgun" ? (<g stroke="#111" strokeWidth={5} strokeLinecap="round" fill="none">
          <path d="M -24 -272 l 12 6 M 24 -272 l -12 6" /><path d="M -16 -240 q 16 -12 32 0" /></g>)
          : p.yuz === "kizgin" ? (<g><path d="M -30 -290 l 22 12 M 30 -290 l -22 12" stroke="#111" strokeWidth={7} strokeLinecap="round" />
            <circle cx={-16} cy={-270} r={6} fill="#111" /><circle cx={16} cy={-270} r={6} fill="#111" />
            <path d="M -18 -240 q 18 -10 36 0" stroke="#111" strokeWidth={5} fill="none" strokeLinecap="round" /></g>)
          : p.yuz === "saskin" ? (<g><circle cx={-16} cy={-272} r={7} fill="#111" /><circle cx={16} cy={-272} r={7} fill="#111" />
            <ellipse cx={0} cy={-244} rx={9} ry={12} fill="#111" /></g>)
            : (<g><circle cx={-16} cy={-272} r={6} fill="#111" /><circle cx={16} cy={-272} r={6} fill="#111" />
              <path d="M -16 -248 q 16 12 32 0" stroke="#111" strokeWidth={5} fill="none" strokeLinecap="round" /></g>)}
      </g>
    </g>
  );
};
export const BEKLE = (t: number): Poz => ({ x: 540, y: ZEMIN + 6 + Math.abs(Math.sin(t * 6)) * -8, don: 0, kolSol: 35, kolSag: 35, bacak: 10, comel: 0.25, yuz: "normal" });
export const karis = (a: Poz, b: Poz, k: number): Poz => ({ x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), don: lerp(a.don, b.don, k),
  kolSol: lerp(a.kolSol, b.kolSol, k), kolSag: lerp(a.kolSag, b.kolSag, k), bacak: lerp(a.bacak, b.bacak, k), comel: lerp(a.comel, b.comel, k),
  yuz: k > 0.5 ? b.yuz : a.yuz });
const UC: Record<string, Poz> = {
  solUc: { x: 360, y: 780, don: -62, kolSol: 165, kolSag: 150, bacak: 18, comel: 0, yuz: "saskin" },
  sagUc: { x: 720, y: 780, don: 62, kolSol: 150, kolSag: 165, bacak: 18, comel: 0, yuz: "saskin" },
  sicra: { x: 600, y: 900, don: 12, kolSol: 120, kolSag: 175, bacak: 6, comel: 0, yuz: "saskin" },
};

/* ---------------- top ---------------- */
export const Top: React.FC<{ x: number; y: number; r: number; don: number }> = ({ x, y, r, don }) => (
  <g transform={`translate(${x},${y}) rotate(${don})`}>
    <circle r={r} fill="#fff" stroke="#111" strokeWidth={Math.max(2, r * 0.08)} />
    <polygon points={[0, 1, 2, 3, 4].map((i) => `${Math.cos(i * 1.2566 - 1.57) * r * 0.42},${Math.sin(i * 1.2566 - 1.57) * r * 0.42}`).join(" ")} fill="#111" />
    {[0, 1, 2, 3, 4].map((i) => <line key={i} x1={Math.cos(i * 1.2566 - 1.57) * r * 0.42} y1={Math.sin(i * 1.2566 - 1.57) * r * 0.42}
      x2={Math.cos(i * 1.2566 - 1.57) * r * 0.95} y2={Math.sin(i * 1.2566 - 1.57) * r * 0.95} stroke="#111" strokeWidth={Math.max(2, r * 0.07)} />)}
  </g>
);

/* ---------------- halı saha sahnesi: kurtarışlar, kolay gol, takım, soru ---------------- */
const Sahne: React.FC<{ p: PlanK }> = ({ p }) => {
  const { t, fps } = useT();
  // kaleci pozu
  let poz = BEKLE(t);
  const gir = giris(t, p.kaleciGir, fps, 12);
  poz = { ...poz, y: lerp(ZEMIN - 900, poz.y, gir) };
  let topEl: React.ReactNode = null, iz: React.ReactNode[] = [], efekt: React.ReactNode = null;
  let kurtarisSay = 0;
  p.kurtaris.forEach((t0, i) => {
    const h = HEDEF[i];
    if (t >= t0 + SUT) kurtarisSay++;
    const dal = ara(t, t0 + SUT - 0.28, t0 + SUT - 0.02, 0, 1, Easing.out(Easing.quad));
    const don = ara(t, t0 + SUT + 0.35, t0 + SUT + 0.75, 0, 1);
    if (t >= t0 - 0.1 && t < t0 + SUT + 0.75) poz = karis(poz, UC[h.poz], dal * (1 - don));
    // hedef işareti ve top uçuşu
    if (t >= t0 - 0.35 && t < t0 + SUT + 0.9) {
      const k = ara(t, t0, t0 + SUT, 0, 1, Easing.in(Easing.quad));
      const bx = 540 + (i - 1) * 60, by = 1820;
      const cx = (bx + h.x) / 2 + (i === 1 ? -160 : 160), cy = 980;
      const tx = (1 - k) * (1 - k) * bx + 2 * (1 - k) * k * cx + k * k * h.x;
      const ty = (1 - k) * (1 - k) * by + 2 * (1 - k) * k * cy + k * k * h.y;
      const sek = ara(t, t0 + SUT, t0 + SUT + 0.5, 0, 1, Easing.out(Easing.quad));  // kurtarış sonrası sekme
      const sx = tx + sek * (h.x < 540 ? -420 : 420), sy = ty - sek * 380 + sek * sek * 300;
      const r = lerp(64, 24, k);
      const hedefOp = ara(t, t0 - 0.35, t0 - 0.15) * (1 - ara(t, t0 + SUT, t0 + SUT + 0.2));
      efekt = (<g>
        <g opacity={hedefOp} transform={`translate(${h.x},${h.y}) scale(${1 + 0.15 * Math.sin(t * 20)})`}>
          <circle r={46} fill="none" stroke="#ff4fa3" strokeWidth={7} /><circle r={18} fill="#ff4fa3" />
          <line x1={-62} x2={62} stroke="#ff4fa3" strokeWidth={5} /><line y1={-62} y2={62} stroke="#ff4fa3" strokeWidth={5} />
        </g>
        <text x={h.x} y={h.y - 70} textAnchor="middle" fontFamily={UNB} fontWeight={900} fontSize={46} fill="#ff4fa3"
          stroke="#111" strokeWidth={6} paintOrder="stroke" opacity={hedefOp}>{h.etiket}</text>
      </g>);
      if (t < t0 + SUT) for (let j = 1; j <= 5; j++) {
        const kk = Math.max(0, k - j * 0.06);
        const ix = (1 - kk) * (1 - kk) * bx + 2 * (1 - kk) * kk * cx + kk * kk * h.x, iy = (1 - kk) * (1 - kk) * by + 2 * (1 - kk) * kk * cy + kk * kk * h.y;
        iz.push(<circle key={`${i}-${j}`} cx={ix} cy={iy} r={lerp(64, 24, kk) * (1 - j * 0.12)} fill="#fff" opacity={0.28 - j * 0.05} />);
      }
      const gor = t >= t0 ? 1 : 0;
      topEl = gor ? <Top x={t < t0 + SUT ? tx : sx} y={t < t0 + SUT ? ty : sy} r={t < t0 + SUT ? r : 24 * (1 - sek * 0.3)} don={t * 900} /> : null;
    }
  });
  // kolay gol: yavaş yuvarlanan top bacak arasından
  const g0 = p.kolayGol, gV = g0 + 2.0;
  let golOldu = false, file = 0;
  if (t >= g0 - 0.2 && t < p.takim + 0.4) {
    const k = ara(t, g0, gV, 0, 1, Easing.linear);
    const ty = lerp(1840, ZEMIN - 30, Math.pow(k, 0.85)), r = lerp(62, 22, Math.pow(k, 0.85));
    const icerde = ara(t, gV, gV + 0.35, 0, 1, Easing.out(Easing.quad));
    topEl = <Top x={540} y={ty - icerde * 40} r={r * (1 - icerde * 0.25)} don={t * 160} />;
    const gec = ara(t, g0 + 1.0, gV - 0.15, 0, 1);  // geç kalmış çömelme, bacaklar açık
    poz = karis(poz, { x: 540, y: ZEMIN + 6, don: 0, kolSol: 60, kolSag: 60, bacak: 26, comel: 0.9, yuz: "saskin" }, gec);
    golOldu = t >= gV;
    file = golOldu ? Math.max(0, 1 - (t - gV) / 0.8) * Math.sin((t - gV) * 30) : 0;
  }
  if (t >= gV) {  // üzgün kaleci
    const u = ara(t, gV + 0.3, gV + 0.8);
    poz = karis(poz, { x: 540, y: ZEMIN + 6, don: 0, kolSol: 10, kolSag: 150, bacak: 6, comel: 0.15, yuz: "uzgun" }, u);
  }
  const golYazi = t >= gV && t < p.takim + 0.3;
  const sarsinti = t > p.takim && t < p.takim + 1.4 ? Math.sin(t * 60) * 6 : 0;
  return (
    <AbsoluteFill style={{ transform: `translateX(${sarsinti}px)` }}>
      <Saha t={t} />
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <g transform={`translate(540,800) scale(${1 + file * 0.03},${1 - file * 0.02}) translate(-540,-800)`}>{/* file dalgası */}</g>
        {iz}
        {golOldu && topEl}
      </svg>
      <svg width={1080} height={1920} style={{ position: "absolute", opacity: t >= p.kaleciGir ? 1 : 0 }}>
        <Kaleci p={poz} olcek={0.95} />
      </svg>
      <Direkler />
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        {!golOldu && topEl}
        {efekt}
      </svg>
      {/* KURTARIŞ! yazıları */}
      {p.kurtaris.map((t0, i) => {
        const a = t0 + SUT; if (t < a || t > a + 0.9) return null;
        const g = giris(t, a, fps, 7); const h = HEDEF[i];
        return <div key={i} style={{ position: "absolute", left: 0, right: 0, top: 380, textAlign: "center", opacity: ara(t, a + 0.7, a + 0.9, 1, 0) }}>
          <span style={{ display: "inline-block", fontFamily: UNB, fontWeight: 900, fontSize: 84, color: "#9BFF3A",
            WebkitTextStroke: "6px #111", paintOrder: "stroke fill", transform: `scale(${1.4 - 0.4 * g}) rotate(${h.x < 540 ? -6 : 6}deg)`,
            textShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>KURTARIŞ!</span></div>;
      })}
      {/* kurtarış sayacı */}
      {t >= p.kurtaris[0] - 0.3 && (
        <div style={{ position: "absolute", top: 250, left: 60, display: "flex", gap: 12, alignItems: "center", opacity: giris(t, p.kurtaris[0] - 0.3, fps, 8) }}>
          <div style={{ background: "rgba(10,14,30,0.85)", border: "3px solid #9BFF3A", borderRadius: 999, padding: "10px 24px",
            fontFamily: MONT, fontWeight: 900, fontSize: 38, color: "#fff" }}>🧤 KURTARIŞ <span style={{ color: "#9BFF3A" }}>{kurtarisSay}</span></div>
          {t >= gV && <div style={{ background: "rgba(10,14,30,0.85)", border: "3px solid #ff3d3d", borderRadius: 999, padding: "10px 24px",
            fontFamily: MONT, fontWeight: 900, fontSize: 38, color: "#fff", transform: `scale(${giris(t, gV, fps, 7)})` }}>GOL <span style={{ color: "#ff3d3d" }}>1</span></div>}
        </div>)}
      {/* kolay gol yazısı */}
      {golYazi && (<div style={{ position: "absolute", top: 1080, left: 0, right: 0, textAlign: "center" }}>
        <div style={{ fontFamily: UNB, fontWeight: 900, fontSize: 150, color: "#cfd6e2", WebkitTextStroke: "7px #111", paintOrder: "stroke fill",
          transform: `scale(${giris(t, gV, fps, 9)}) rotate(${Math.sin((t - gV) * 3) * 4}deg)`, opacity: ara(t, gV, gV + 0.15) }}>GOL…</div>
        <div style={{ fontFamily: MONT, fontWeight: 900, fontSize: 52, color: "#ffd60a", marginTop: -6, opacity: ara(t, gV + 0.3, gV + 0.5) }}>
          EN KOLAY ŞUTTAN</div>
      </div>)}
      {/* takım söyleniyor */}
      {t >= p.takim && <Takim t0={p.takim} />}
      {/* sahne girişi başlığı */}
      {t < p.kaleciGir + 0.4 && (<div style={{ position: "absolute", top: 250, left: 0, right: 0, textAlign: "center",
        opacity: ara(t, p.kaleciGir + 0.1, p.kaleciGir + 0.4, 1, 0) }}>
        <div style={{ fontFamily: UNB, fontWeight: 900, fontSize: 112, color: "#fff", WebkitTextStroke: "6px #111", paintOrder: "stroke fill",
          transform: `scale(${giris(t, p.mgBas + 0.3, fps, 10)})` }}>HALI SAHA</div>
        <div style={{ fontFamily: MONT, fontWeight: 900, fontSize: 44, color: "#ffd60a", letterSpacing: 6 }}>BİR SENARYO</div>
      </div>)}
      {/* "SEN" etiketi */}
      {t >= p.kaleciGir + 0.3 && t < p.kurtaris[0] - 0.2 && (<div style={{ position: "absolute", left: 640, top: 600,
        opacity: giris(t, p.kaleciGir + 0.3, fps, 8) * ara(t, p.kurtaris[0] - 0.4, p.kurtaris[0] - 0.2, 1, 0) }}>
        <div style={{ background: "#ffd60a", color: "#111", borderRadius: 18, padding: "10px 22px", fontFamily: UNB, fontWeight: 900, fontSize: 44,
          transform: `rotate(6deg) translateY(${Math.sin(t * 6) * 6}px)` }}>SEN 🧤</div>
        <svg width={120} height={110} style={{ marginLeft: -20 }}><path d="M 70 6 Q 40 40 10 100" stroke="#ffd60a" strokeWidth={8} fill="none" strokeLinecap="round" />
          <path d="M 4 74 L 10 104 L 36 90" stroke="#ffd60a" strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>)}
      {/* soru kartı */}
      {t >= p.soru && <Soru t0={p.soru} />}
    </AbsoluteFill>
  );
};

/* takım arkadaşları: kızgın + baloncuklar */
const Takim: React.FC<{ t0: number }> = ({ t0 }) => {
  const { t, fps } = useT();
  const kisiler = [{ x: 170, renk: "#2f6bff", no: 7, laf: "NASIL YEDİN?!" }, { x: 910, renk: "#2f6bff", no: 10, laf: "UYUYOR MUSUN?!" },
    { x: 540, renk: "#2f6bff", no: 4, laf: "HADİ YAA!" }];
  return (<>
    {kisiler.map((k, i) => {
      const g = giris(t, t0 + i * 0.3, fps, 10);
      const zip = Math.sin((t - t0) * 14 + i) * 8;
      const dx = (1 - g) * (k.x < 540 ? -400 : k.x > 540 ? 400 : 0), dy = (1 - g) * (k.x === 540 ? 500 : 0);
      return (<div key={i}>
        <svg width={1080} height={1920} style={{ position: "absolute", transform: `translate(${dx}px,${dy + zip}px)` }}>
          <g transform={`translate(${k.x},${1990}) scale(1.35)`}>
            <rect x={-62} y={-300} width={124} height={170} rx={40} fill={k.renk} stroke="#111" strokeWidth={5} />
            <text x={0} y={-200} textAnchor="middle" fontFamily={UNB} fontWeight={900} fontSize={60} fill="#fff">{k.no}</text>
            {[-1, 1].map((s) => <g key={s} transform={`translate(${s * 56},-280) rotate(${s * (150 + Math.sin(t * 16 + i) * 15)})`}>
              <rect x={-13} y={0} width={26} height={100} rx={13} fill={k.renk} stroke="#111" strokeWidth={4} /><circle cx={0} cy={104} r={18} fill="#e9b48f" stroke="#111" strokeWidth={4} /></g>)}
            <circle cx={0} cy={-350} r={52} fill="#e9b48f" stroke="#111" strokeWidth={5} />
            <path d="M -30 -372 l 22 10 M 30 -372 l -22 10" stroke="#111" strokeWidth={7} strokeLinecap="round" />
            <circle cx={-16} cy={-352} r={6} fill="#111" /><circle cx={16} cy={-352} r={6} fill="#111" />
            <ellipse cx={0} cy={-322} rx={16} ry={12} fill="#7a1010" stroke="#111" strokeWidth={4} />
          </g>
        </svg>
        {(() => { const bg = giris(t, t0 + 0.2 + i * 0.3, fps, 8);
          const bx = Math.min(1080 - 330, Math.max(30, k.x - 150)), by = 1080 + (i === 2 ? 70 : 0);
          return <div style={{ position: "absolute", left: bx, top: by, transform: `scale(${bg}) rotate(${(i - 1) * 4}deg)`, transformOrigin: "bottom center" }}>
            <div style={{ background: "#fff", borderRadius: 28, padding: "14px 22px", border: "5px solid #111", fontFamily: UNB, fontWeight: 900,
              fontSize: 38, color: "#e01e2b", whiteSpace: "nowrap", boxShadow: "0 10px 0 rgba(0,0,0,0.25)" }}>{k.laf}</div></div>; })()}
      </div>);
    })}
  </>);
};

const Soru: React.FC<{ t0: number }> = ({ t0 }) => {
  const { t, fps } = useT();
  const g = giris(t, t0, fps, 10);
  return (<AbsoluteFill style={{ background: `rgba(6,10,26,${0.7 * ara(t, t0, t0 + 0.25)})`, alignItems: "center", justifyContent: "center" }}>
    <div style={{ transform: `scale(${0.5 + 0.5 * g}) rotate(${(1 - g) * -8}deg)`, opacity: g, textAlign: "center" }}>
      <div style={{ fontFamily: UNB, fontWeight: 900, fontSize: 260, color: "#ffd60a", lineHeight: 1,
        transform: `translateY(${Math.sin(t * 7) * 12}px) rotate(${Math.sin(t * 4) * 8}deg)`, textShadow: "0 14px 0 #b38f00" }}>?</div>
      <div style={{ fontFamily: UNB, fontWeight: 900, fontSize: 104, color: "#fff", lineHeight: 1.05, marginTop: 10 }}>NE<br />YAPARSINIZ?</div>
    </div>
  </AbsoluteFill>);
};

/* ---------------- şık kartları (videonun üstünde) ---------------- */
const Siklar: React.FC<{ p: PlanK }> = ({ p }) => {
  const { t, fps } = useT();
  if (t < p.siklar[0].t - 0.05) return null;
  const aktif = p.siklar.reduce((a, s, i) => (t >= s.t ? i : a), 0);
  const renk = ["#00D4FF", "#FFD60A", "#FF4FA3"];
  return (
    <div style={{ position: "absolute", top: 240, left: 50, right: 50 }}>
      <div style={{ fontFamily: UNB, fontWeight: 900, fontSize: 40, color: "#fff", marginBottom: 12, textShadow: "0 4px 14px rgba(0,0,0,0.6)",
        opacity: giris(t, p.siklar[0].t, fps, 8) }}>NE YAPARSINIZ?</div>
      {p.siklar.map((s, i) => {
        if (t < s.t) return null;
        const g = giris(t, s.t, fps, 9);
        const a = i === aktif;
        return (<div key={i} style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12, padding: "12px 18px",
          background: a ? "rgba(255,255,255,0.96)" : "rgba(20,24,36,0.78)", borderRadius: 24, border: `4px solid ${renk[i]}`,
          transform: `translateX(${(1 - g) * -500}px) scale(${a ? 1 : 0.94})`, transformOrigin: "left center", boxShadow: a ? `0 12px 30px ${renk[i]}66` : "none" }}>
          <div style={{ flex: "none", width: 64, height: 64, borderRadius: 32, background: renk[i], display: "flex", alignItems: "center",
            justifyContent: "center", fontFamily: UNB, fontWeight: 900, fontSize: 38, color: "#111" }}>{s.harf}</div>
          <div style={{ fontFamily: MONT, fontWeight: 900, fontSize: 36, color: a ? "#111" : "#fff", lineHeight: 1.15 }}>{s.yazi}</div>
        </div>);
      })}
      {t >= p.son && (<div style={{ display: "inline-block", marginTop: 6, background: "#9BFF3A", color: "#111", borderRadius: 999,
        padding: "12px 28px", fontFamily: MONT, fontWeight: 900, fontSize: 40, transform: `scale(${giris(t, p.son, fps, 8)})`, transformOrigin: "left center" }}>
        Sen hangisini seçerdin? Yorumlara yaz!</div>)}
    </div>
  );
};

/* ---------------- ana kompozisyon ---------------- */
export const KaleciVideo: React.FC<{ plan: PlanK }> = ({ plan }) => {
  const { t, fps } = useT();
  const gir = ara(t, plan.mgBas, plan.mgBas + 0.45, 0, 1, Easing.inOut(Easing.cubic));   // daire açılarak geçiş
  const cik = ara(t, plan.mgSon - 0.45, plan.mgSon, 0, 1, Easing.inOut(Easing.cubic));
  const mgGorunur = t >= plan.mgBas && t < plan.mgSon;
  const r = mgGorunur ? 1200 * gir * (1 - cik) : 0;
  const rozet = t >= plan.editRozet[0] && t <= plan.editRozet[1];
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <style>{FONTLAR}</style>
      <OffthreadVideo src={staticFile("kaleci/kesik.mp4")} style={{ width: "100%", height: "100%" }} />
      {mgGorunur && (<AbsoluteFill style={{ clipPath: `circle(${r}px at 540px 900px)` }}><Sahne p={plan} /></AbsoluteFill>)}
      {rozet && (<div style={{ position: "absolute", top: 250, left: 60, opacity: giris(t, plan.editRozet[0], fps, 8) * ara(t, plan.editRozet[1] - 0.2, plan.editRozet[1], 1, 0) }}>
        <div style={{ background: "#ffd60a", color: "#111", borderRadius: 999, padding: "12px 28px", fontFamily: MONT, fontWeight: 900, fontSize: 42,
          boxShadow: "0 12px 30px #ffd60a66", transform: `scale(${giris(t, plan.editRozet[0], fps, 8)})`, transformOrigin: "left center" }}>✂ EDİT: CLAUDE</div></div>)}
      <Siklar p={plan} />
      <Altyazi k={plan.kelimeler} altY={1440} />
    </AbsoluteFill>
  );
};
