import React from "react";
import {
  AbsoluteFill, OffthreadVideo, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing,
} from "remotion";

export type Kelime = { k: string; a: number; b: number };
export type Plan = {
  sure: number;
  kelimeler: Kelime[];
  arkaBaslik: { a: number; b: number; satirlar: string[]; boyut: number[] };
  bolLR: { a: number; b: number; baslik: string; maddeler: { t: number; yazi: string }[] };
  tekrarCip: { a: number; b: number; ciz: number };
  bosluk: { a: number; b: number; kirp: number };
  bolTB: { a: number; b: number; dusus: number; cikis: number; cizBas: number; cizSon: number };
};

export const RENK = ["#FFD60A", "#00D4FF", "#FF4FA3", "#9BFF3A", "#FF8A1F", "#B98CFF"];
const MONT = "Mont";
const UNB = "Unbounded";
export const FONTLAR = `
@font-face{font-family:${MONT};src:url(${staticFile("fonts/Montserrat-Black.ttf")}) format('truetype');font-weight:900}
@font-face{font-family:${MONT};src:url(${staticFile("fonts/Montserrat-ExtraBold.ttf")}) format('truetype');font-weight:800}
@font-face{font-family:${UNB};src:url(${staticFile("fonts/unbounded-latin-ext-900-normal.woff2")}) format('woff2');font-weight:900}
@font-face{font-family:${UNB};src:url(${staticFile("fonts/unbounded-latin-900-normal.woff2")}) format('woff2');font-weight:900;unicode-range:U+0000-00FF}
@font-face{font-family:Inter;src:url(${staticFile("fonts/inter-latin-ext-700-normal.woff2")}) format('woff2');font-weight:700}
@font-face{font-family:Inter;src:url(${staticFile("fonts/inter-latin-700-normal.woff2")}) format('woff2');font-weight:700;unicode-range:U+0000-00FF}
@font-face{font-family:Inter;src:url(${staticFile("fonts/inter-latin-ext-600-normal.woff2")}) format('woff2');font-weight:600}
@font-face{font-family:Inter;src:url(${staticFile("fonts/inter-latin-600-normal.woff2")}) format('woff2');font-weight:600;unicode-range:U+0000-00FF}`;

const tr = (s: string) => s.toLocaleUpperCase("tr-TR");
const useT = () => { const f = useCurrentFrame(); const { fps } = useVideoConfig(); return { f, fps, t: f / fps }; };
/** yaylı giriş (6-10 kare) ve hızlı çıkış */
export const giris = (t: number, a: number, fps: number, d = 9) =>
  spring({ frame: Math.round((t - a) * fps), fps, config: { damping: 14, stiffness: 190, mass: 0.6 }, durationInFrames: d });
const cikis = (t: number, b: number) => interpolate(t, [b - 0.18, b], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

const Video: React.FC<{ stil?: React.CSSProperties; sessiz?: boolean; konum?: string }> = ({ stil, sessiz, konum }) => (
  <OffthreadVideo src={staticFile("eldiven/kesik.mp4")} muted={sessiz}
    style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: konum ?? "50% 50%", ...stil }} />
);

/* ---------------- kelime altyazısı: sayfa başına ≤3 kelime, etkin kelime renkli hap içinde ---------------- */
const sayfalar = (k: Kelime[]) => {
  const out: Kelime[][] = []; let cur: Kelime[] = [];
  k.forEach((w, i) => {
    cur.push(w);
    const son = /[.,!?…]$/.test(w.k) || cur.length >= 3 || (k[i + 1] && k[i + 1].a - w.b > 0.35);
    if (son) { out.push(cur); cur = []; }
  });
  if (cur.length) out.push(cur);
  return out;
};
export const Altyazi: React.FC<{ k: Kelime[]; altY: number }> = ({ k, altY }) => {
  const { t, fps } = useT();
  const sp = React.useMemo(() => sayfalar(k), [k]);
  const si = sp.findIndex((p, i) => t >= p[0].a - 0.05 && t < (sp[i + 1] ? sp[i + 1][0].a - 0.05 : p[p.length - 1].b + 0.4));
  if (si < 0) return null;
  const p = sp[si];
  const giriş = giris(t, p[0].a - 0.05, fps, 7);
  let renkSira = k.indexOf(p[0]);
  return (
    <div style={{ position: "absolute", left: 60, right: 60, bottom: 1920 - altY, display: "flex", flexWrap: "wrap",
      justifyContent: "center", alignItems: "center", gap: "10px 18px",
      transform: `translateY(${(1 - giriş) * 40}px) scale(${0.85 + 0.15 * giriş})`, opacity: giriş }}>
      {p.map((w, i) => {
        const aktif = t >= w.a - 0.03 && t < (p[i + 1] ? p[i + 1].a - 0.03 : w.b + 0.4);
        const renk = RENK[(renkSira + i) % RENK.length];
        const pop = aktif ? giris(t, w.a - 0.03, fps, 6) : 0;
        const metin = tr(w.k.replace(/"/g, ""));
        return (
          <span key={i} style={{
            fontFamily: MONT, fontWeight: 900, fontSize: 82, lineHeight: 1.08, letterSpacing: 0.5,
            color: aktif ? "#111" : "#fff", padding: "2px 18px 6px", borderRadius: 22,
            background: aktif ? renk : "transparent",
            WebkitTextStroke: aktif ? "0px" : "3px rgba(0,0,0,0.85)", paintOrder: "stroke fill",
            textShadow: aktif ? "none" : `0 6px 18px rgba(0,0,0,0.45), 0 0 1px ${renk}`,
            boxShadow: aktif ? `0 10px 28px ${renk}66` : "none",
            transform: `scale(${1 + 0.12 * pop}) rotate(${aktif ? (i % 2 ? 2 : -2) : 0}deg)`,
            display: "inline-block",
          }}>{metin}</span>
        );
      })}
    </div>
  );
};

/* ---------------- arka başlık: dev geniş yazı, harf harf, kişinin arkasında ---------------- */
const ArkaBaslik: React.FC<{ p: Plan["arkaBaslik"] }> = ({ p }) => {
  const { t, fps } = useT();
  if (t < p.a - 0.05 || t > p.b) return null;
  const tum = p.satirlar.join("").length;
  let sayac = 0;
  const harfSure = 0.85 / tum;
  const c = cikis(t, p.b);
  // pankart: kafa hizasında, kişinin ARKASINDA asılı; soldan açılır, hafif eğik, kumaş gibi hafif dalgalanır
  const ac = giris(t, p.a - 0.12, fps, 10);
  const dalga = Math.sin(t * 2.6) * 0.8;
  return (
    <AbsoluteFill style={{ opacity: c }}>
      {[150, 930].map((x, i) => (
        <div key={i} style={{ position: "absolute", left: x, top: 0, width: 5, height: 450 + (i ? 22 : -22),
          background: "rgba(40,40,40,0.55)", transform: `scaleY(${ac})`, transformOrigin: "top" }} />))}
      <div style={{ position: "absolute", left: 40, top: 430, width: 1000, padding: "34px 0 40px",
        background: RENK[0], borderRadius: 26, boxShadow: "0 24px 50px rgba(0,0,0,0.30), inset 0 -10px 0 rgba(0,0,0,0.08)",
        transform: `rotate(${-2.5 + dalga * 0.3}deg) skewX(${dalga * 0.6}deg) scaleX(${ac})`, transformOrigin: "left center",
        display: "flex", flexDirection: "column", alignItems: "center", overflow: "hidden" }}>
        {[0.33, 0.66].map((x, i) => (
          <div key={i} style={{ position: "absolute", top: 0, bottom: 0, left: `${x * 100 + dalga * 2}%`, width: 60,
            background: "linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.07) 50%, rgba(0,0,0,0) 100%)" }} />))}
        {p.satirlar.map((s, si) => (
          <div key={si} style={{ display: "flex", fontFamily: UNB, fontWeight: 900, fontSize: p.boyut[si] ?? 120,
            lineHeight: 1.02, letterSpacing: -3, color: si === 1 ? RENK[2] : "#141414" }}>
            {[...s].map((h, hi) => {
              const ta = p.a + 0.15 + (sayac++) * harfSure;
              const g = giris(t, ta, fps, 7);
              return <span key={hi} style={{ display: "inline-block", opacity: g, transform: `translateY(${(1 - g) * 50}px)` }}>
                {h === " " ? "\u00A0" : h}</span>;
            })}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

/* ---------------- tik ikonu ---------------- */
const Tik: React.FC<{ g: number; renk: string }> = ({ g, renk }) => (
  <svg width="54" height="54" viewBox="0 0 54 54" style={{ flex: "none" }}>
    <circle cx="27" cy="27" r="25" fill={g > 0 ? renk : "rgba(255,255,255,0.15)"} opacity={0.35 + 0.65 * g} />
    <path d="M15 28 L24 36 L40 18" fill="none" stroke="#111" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"
      strokeDasharray="40" strokeDashoffset={40 * (1 - g)} />
  </svg>
);

/* ---------------- sol-sağ bölünmüş ekran: solda kişi, sağda buzlu cam kart ---------------- */
const BolLR: React.FC<{ p: Plan["bolLR"] }> = ({ p }) => {
  const { t, fps } = useT();
  if (t < p.a || t > p.b) return null;
  const g = giris(t, p.a, fps, 10);
  const c = cikis(t, p.b);
  const solW = interpolate(g * c + (1 - c) * 0, [0, 1], [1080, 540]);
  return (
    <AbsoluteFill>
      <Video sessiz stil={{ filter: "blur(34px) brightness(0.45) saturate(1.2)", transform: "scale(1.15)" }} />
      <div style={{ position: "absolute", left: 0, top: 0, width: solW, height: 1920, overflow: "hidden",
        borderRight: `6px solid ${RENK[1]}`, boxShadow: "12px 0 40px rgba(0,0,0,0.35)" }}>
        <Video sessiz konum="50% 30%" />
      </div>
      <div style={{ position: "absolute", left: 540 + 26, width: 1080 - 540 - 52, top: 330, opacity: g * c,
        transform: `translateX(${(1 - g) * 120}px) rotate(${(1 - g) * 4}deg)`,
        background: "rgba(255,255,255,0.12)", border: "2px solid rgba(255,255,255,0.35)", borderRadius: 38,
        padding: "34px 30px 30px", backdropFilter: "blur(8px)", boxShadow: "0 30px 60px rgba(0,0,0,0.35)" }}>
        <div style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 24, letterSpacing: 4, color: RENK[1], marginBottom: 12 }}>
          {tr("Bilgi kartı")}</div>
        <div style={{ fontFamily: UNB, fontWeight: 900, fontSize: 46, lineHeight: 1.12, color: "#fff", marginBottom: 26 }}>
          {p.baslik}</div>
        {p.maddeler.map((m, i) => {
          const mg = giris(t, m.t, fps, 8);
          const renk = RENK[(i + 2) % RENK.length];
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20,
              opacity: 0.25 + 0.75 * mg, transform: `translateX(${(1 - mg) * 40}px)` }}>
              <Tik g={mg} renk={renk} />
              <div style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 34, lineHeight: 1.18, color: "#fff" }}>{m.yazi}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/* ---------------- etiket çipi ---------------- */
const Cip: React.FC<{ a: number; b: number; renk: string; ikon: React.ReactNode; yazi: string; y: number }> =
  ({ a, b, renk, ikon, yazi, y }) => {
    const { t, fps } = useT();
    if (t < a || t > b) return null;
    const g = giris(t, a, fps, 8); const c = cikis(t, b);
    return (
      <div style={{ position: "absolute", top: y, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: g * c }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, background: renk, color: "#111", borderRadius: 999,
          padding: "16px 34px 16px 22px", fontFamily: MONT, fontWeight: 900, fontSize: 46,
          transform: `scale(${0.6 + 0.4 * g}) rotate(${-3 + 3 * g}deg)`, boxShadow: `0 14px 34px ${renk}77` }}>
          {ikon}<span>{yazi}</span>
        </div>
      </div>
    );
  };
const Makas = () => (
  <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.6" strokeLinecap="round">
    <circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><path d="M20 4 8.12 15.88M14.47 14.48 20 20M8.12 8.12 12 12" />
  </svg>);
const Kronometre = () => (
  <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.6" strokeLinecap="round">
    <circle cx="12" cy="14" r="8" /><path d="M12 10v4l2 2M9 2h6" /></svg>);

/** tekrar örneği: "steril eldivenin," üstü çizilip düşer */
const TekrarKart: React.FC<{ p: Plan["tekrarCip"] }> = ({ p }) => {
  const { t, fps } = useT();
  if (t < p.a || t > p.b) return null;
  const g = giris(t, p.a + 0.15, fps, 9); const c = cikis(t, p.b);
  const ciz = interpolate(t, [p.ciz, p.ciz + 0.35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic) });
  const dus = interpolate(t, [p.ciz + 0.45, p.ciz + 0.9], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", top: 420, left: 70, right: 70, display: "flex", flexDirection: "column",
      alignItems: "center", gap: 8, opacity: g * c, transform: `translateY(${(1 - g) * 30}px)` }}>
      <div style={{ background: "rgba(255,255,255,0.94)", borderRadius: 30, padding: "18px 30px", transform: "rotate(-2deg)",
        boxShadow: "0 16px 40px rgba(0,0,0,0.25)", fontFamily: "Inter", fontWeight: 700, fontSize: 44, color: "#222",
        display: "flex", gap: 14 }}>
        <span style={{ position: "relative", color: "#999", opacity: 1 - dus,
          transform: `translateY(${dus * 50}px) rotate(${dus * -8}deg)`, display: "inline-block" }}>
          steril eldivenin,
          <span style={{ position: "absolute", left: -4, top: "52%", height: 7, borderRadius: 4, background: RENK[2],
            width: `${ciz * 104}%` }} />
        </span>
        <span>steril eldivenin</span>
      </div>
    </div>
  );
};

/** boşluk sayacı: ses dalgası bloklarının arasındaki boşluklar kapanır */
const BoslukKart: React.FC<{ p: Plan["bosluk"] }> = ({ p }) => {
  const { t, fps } = useT();
  if (t < p.a || t > p.b) return null;
  const g = giris(t, p.a + 0.1, fps, 9); const c = cikis(t, p.b);
  const kapa = interpolate(t, [p.kirp, p.kirp + 0.5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic) });
  const bloklar = [3, 5, 2, 4, 3];
  return (
    <div style={{ position: "absolute", top: 440, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: g * c }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18 - 14 * kapa, background: "rgba(20,20,28,0.82)",
        borderRadius: 32, padding: "22px 30px", transform: `scale(${0.8 + 0.2 * g})` }}>
        {bloklar.map((n, i) => (
          <div key={i} style={{ display: "flex", gap: 6, marginRight: (1 - kapa) * 46 }}>
            {Array.from({ length: n }).map((_, j) => (
              <div key={j} style={{ width: 14, height: 30 + ((i * 7 + j * 13) % 5) * 14, borderRadius: 7,
                background: RENK[(i + 1) % RENK.length] }} />))}
          </div>
        ))}
      </div>
    </div>
  );
};

/* ---------------- üst-alt bölünmüş ekran: üstte altın grafiği (temsili), altta kişi ---------------- */
const VERI = [62, 60, 63, 58, 54, 49, 45, 43, 47, 52, 57, 61, 66, 72, 76, 81, 86];  // temsili, gerçek fiyat değil
const BolTB: React.FC<{ p: Plan["bolTB"] }> = ({ p }) => {
  const { t, fps } = useT();
  if (t < p.a || t > p.b + 0.01) return null;
  const g = giris(t, p.a, fps, 10);
  const ust = interpolate(g, [0, 1], [0, 900]);
  const W = 940, H = 400, X0 = 70, Y0 = 430;
  const pts = VERI.map((v, i) => [X0 + (i / (VERI.length - 1)) * W, Y0 + H - ((v - 35) / 60) * H]);
  const ilerle = interpolate(t, [p.cizBas, p.cizSon], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad) });
  const d = pts.map((q, i) => `${i ? "L" : "M"}${q[0].toFixed(1)},${q[1].toFixed(1)}`).join(" ");
  const alan = `${d} L${X0 + W},${Y0 + H} L${X0},${Y0 + H} Z`;
  const dip = pts[7]; const tepe = pts[pts.length - 1];
  const dg = giris(t, p.dusus, fps, 8); const cg = giris(t, p.cikis, fps, 8);
  const uzunluk = 2200;
  return (
    <AbsoluteFill style={{ background: "#0d0f14" }}>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, top: ust,
        overflow: "hidden", borderTop: `6px solid ${RENK[0]}` }}>
        <Video sessiz konum="50% 26%" />
      </div>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: ust, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 60, top: 245, fontFamily: UNB, fontWeight: 900, fontSize: 68, color: "#fff" }}>
          {tr("Altın")} <span style={{ color: RENK[0] }}>· 1 {tr("yıl")}</span></div>
        <div style={{ position: "absolute", left: 62, top: 340, fontFamily: "Inter", fontWeight: 600, fontSize: 28,
          color: "rgba(255,255,255,0.55)", letterSpacing: 3 }}>{tr("temsili grafik · düşüş ve çıkış")}</div>
        <svg width={1080} height={900} style={{ position: "absolute", left: 0, top: 0 }}>
          <defs>
            <linearGradient id="alan" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={RENK[0]} stopOpacity="0.45" /><stop offset="1" stopColor={RENK[0]} stopOpacity="0" />
            </linearGradient>
            <clipPath id="kirp"><rect x={X0 - 10} y={0} width={(W + 20) * ilerle} height={900} /></clipPath>
          </defs>
          {[0, 1, 2, 3].map((i) => <line key={i} x1={X0} x2={X0 + W} y1={Y0 + (H / 3) * i} y2={Y0 + (H / 3) * i}
            stroke="rgba(255,255,255,0.08)" strokeWidth={2} />)}
          <path d={alan} fill="url(#alan)" clipPath="url(#kirp)" />
          <path d={d} fill="none" stroke={RENK[0]} strokeWidth={9} strokeLinejoin="round" strokeLinecap="round"
            strokeDasharray={uzunluk} strokeDashoffset={uzunluk * (1 - ilerle)} />
          <g opacity={dg} transform={`translate(${dip[0]},${dip[1] + 40}) scale(${0.6 + 0.4 * dg})`}>
            <rect x={-105} y={0} width={210} height={64} rx={32} fill={RENK[2]} />
            <text x={0} y={44} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={34} fill="#111">▼ {tr("düşüş")}</text>
          </g>
          <g opacity={cg} transform={`translate(${tepe[0] - 175},${tepe[1] - 95}) scale(${0.6 + 0.4 * cg})`}>
            <rect x={-105} y={0} width={210} height={64} rx={32} fill={RENK[3]} />
            <text x={0} y={44} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={34} fill="#111">▲ {tr("çıkış")}</text>
          </g>
          {ilerle > 0 && ilerle < 1 && (() => {
            const i = Math.min(VERI.length - 1, Math.floor(ilerle * (VERI.length - 1)));
            const f = ilerle * (VERI.length - 1) - i; const a = pts[i], b = pts[Math.min(i + 1, pts.length - 1)];
            return <circle cx={a[0] + (b[0] - a[0]) * f} cy={a[1] + (b[1] - a[1]) * f} r={16} fill="#fff" stroke={RENK[0]} strokeWidth={6} />;
          })()}
        </svg>
      </div>
    </AbsoluteFill>
  );
};

export const Eldiven: React.FC<{ plan: Plan }> = ({ plan }) => {
  const { t } = useT();
  const tb = t >= plan.bolTB.a;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <style>{FONTLAR}</style>
      <Video />
      <ArkaBaslik p={plan.arkaBaslik} />
      {t >= plan.arkaBaslik.a - 0.05 && t <= plan.arkaBaslik.b && (
        <AbsoluteFill><OffthreadVideo transparent muted src={staticFile("eldiven/kisi.webm")}
          style={{ width: "100%", height: "100%" }} /></AbsoluteFill>)}
      <BolLR p={plan.bolLR} />
      <Cip a={plan.tekrarCip.a} b={plan.tekrarCip.b} renk={RENK[2]} ikon={<Makas />} yazi={tr("Tekrarlar kırpıldı")} y={300} />
      <TekrarKart p={plan.tekrarCip} />
      <Cip a={plan.bosluk.a} b={plan.bosluk.b} renk={RENK[3]} ikon={<Kronometre />} yazi={tr("Boşluk: 0 sn")} y={300} />
      <BoslukKart p={plan.bosluk} />
      <BolTB p={plan.bolTB} />
      <Altyazi k={plan.kelimeler} altY={tb ? 1440 : 1440} />
    </AbsoluteFill>
  );
};
