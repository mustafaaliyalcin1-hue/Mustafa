import React from "react";
import { AbsoluteFill, OffthreadVideo, interpolate, staticFile, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { Altyazi, FONTLAR, RENK, giris, Kelime } from "../eldiven/Eldiven";

type Nokta = [number, number, number];  // t, x(0-1), y(0-1)
export type Plan3 = {
  sure: number; kelimeler: Kelime[];
  baslik: { a: number; b: number; yazi: string[] };
  benClaude: { a: number; b: number; turuncu: number; x: number; y: number };
  kameraman: Nokta[][];
  merhaba: { a: number; b: number };
  liste: { a: number; b: number; maddeler: string[] };
  renk: [number, string][];
  muzik: number;
};

const UNB = "Unbounded", MONT = "Mont";
const TURUNCU = "#FF8A1F";
const useT = () => { const f = useCurrentFrame(); const { fps } = useVideoConfig(); return { t: f / fps, fps }; };
const ara = (t: number, a: number, b: number, x = 0, y = 1) =>
  interpolate(t, [a, b], [x, y], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
const cikis = (t: number, b: number, d = 0.2) => ara(t, b - d, b, 1, 0);

/* ---------- renk/filtre durumları (sayısal: aralarında yumuşak geçiş) ---------- */
type Durum = { sepia: number; sat: number; con: number; bri: number; hue: number; gri: number;
  ortu: string; ortuOp: number; vin: number; isima: number; etiket: string };
const D = (o: Partial<Durum>): Durum => ({ sepia: 0, sat: 1, con: 1, bri: 1, hue: 0, gri: 0, ortu: "#000000", ortuOp: 0,
  vin: 0, isima: 0, etiket: "", ...o });
const DURUM: Record<string, Durum> = {
  normal: D({}),
  sinematik: D({ con: 1.2, sat: 1.15, bri: 0.95, hue: -6, ortu: "#0a8f9c", ortuOp: 0.22, vin: 0.35, etiket: "FİLTRE: SİNEMATİK" }),
  sicak: D({ sepia: 0.3, sat: 1.3, hue: -10, ortu: "#ff9a3c", ortuOp: 0.2, etiket: "FİLTRE: SICAK" }),
  soguk: D({ sat: 0.9, hue: 14, bri: 1.03, ortu: "#3b7bff", ortuOp: 0.22, etiket: "FİLTRE: SOĞUK" }),
  vintage: D({ sepia: 0.5, con: 0.9, bri: 1.05, sat: 0.8, vin: 0.5, etiket: "FİLTRE: VİNTAGE" }),
  sepya: D({ sepia: 0.95, con: 1.05, etiket: "FİLTRE: SEPYA" }),
  retro: D({ con: 1.3, sat: 1.6, hue: -25, ortu: "#ff3d9a", ortuOp: 0.15, etiket: "FİLTRE: RETRO" }),
  sicaklik: D({ sepia: 0.22, sat: 1.18, hue: -8, bri: 1.03, ortu: "#ff9a3c", ortuOp: 0.22, etiket: "RENK SICAKLAŞTI" }),
  filtre: D({ sepia: 0.35, sat: 1.05, hue: -8, con: 1.08, bri: 1.02, ortu: "#ff9a3c", ortuOp: 0.22, vin: 0.35, etiket: "FİLTRE" }),
  efekt: D({ sepia: 0.35, sat: 1.05, hue: -8, con: 1.1, bri: 1.04, ortu: "#ff9a3c", ortuOp: 0.22, vin: 0.6, isima: 0.55,
    etiket: "FİLTRE + EFEKT" }),
  siyahbeyaz: D({ gri: 1, con: 1.15, vin: 0.5, etiket: "SİYAH-BEYAZ" }),
  duzelt: D({ sepia: 0.18, sat: 1.15, hue: -6, bri: 1.03, ortu: "#ff9a3c", ortuOp: 0.15, etiket: "DÜZELTİLDİ ✓" }),
  canli: D({ sat: 1.6, con: 1.12, bri: 1.04, ortu: "#ff7a3c", ortuOp: 0.08, etiket: "CANLI TONLAR" }),
};
const karis = (a: Durum, b: Durum, k: number): Durum => {
  const m = (x: number, y: number) => x + (y - x) * k;
  return { sepia: m(a.sepia, b.sepia), sat: m(a.sat, b.sat), con: m(a.con, b.con), bri: m(a.bri, b.bri), hue: m(a.hue, b.hue),
    gri: m(a.gri, b.gri), ortu: k < 0.5 ? a.ortu : b.ortu, ortuOp: k < 0.5 ? a.ortuOp * (1 - 2 * k) : b.ortuOp * (2 * k - 1),
    vin: m(a.vin, b.vin), isima: m(a.isima, b.isima), etiket: b.etiket };
};
const anlik = (t: number, cizelge: [number, string][]) => {
  let onceki = DURUM.normal, simdi = DURUM.normal, bas = -9, idx = -1;
  cizelge.forEach(([a, ad], i) => { if (t >= a) { onceki = simdi; simdi = DURUM[ad]; bas = a; idx = i; } });
  const dongu = idx >= 0 && idx < 6;  // filtre döngüsü: hızlı geçiş
  const k = ara(t, bas, bas + (dongu ? 0.12 : 0.35));
  return { d: karis(onceki, simdi, k), bas, idx };
};

/* ---------- video + renk katmanı ---------- */
const RenkliVideo: React.FC<{ plan: Plan3 }> = ({ plan }) => {
  const { t } = useT();
  const { d, bas, idx } = anlik(t, plan.renk);
  const filtre = `sepia(${d.sepia}) saturate(${d.sat}) contrast(${d.con}) brightness(${d.bri}) hue-rotate(${d.hue}deg) grayscale(${d.gri})`;
  const flas = idx >= 0 && idx < 7 ? ara(t, bas, bas + 0.12, 0.35, 0) : 0;  // döngüde her filtre değişiminde kısa flaş
  const vid = <OffthreadVideo src={staticFile("komut3/kesik.mp4")} style={{ width: "100%", height: "100%", filter: filtre }} />;
  return (
    <AbsoluteFill>
      {vid}
      {d.isima > 0.01 && (
        <AbsoluteFill style={{ opacity: d.isima, mixBlendMode: "screen", filter: "blur(28px) brightness(1.25)" }}>
          <OffthreadVideo muted src={staticFile("komut3/kesik.mp4")} style={{ width: "100%", height: "100%", filter: filtre }} />
        </AbsoluteFill>)}
      {d.isima > 0.01 && (  /* ışık sızıntısı */
        <AbsoluteFill style={{ opacity: d.isima * 0.8, mixBlendMode: "screen",
          background: `radial-gradient(circle at ${20 + 60 * ((t * 0.35) % 1)}% 15%, rgba(255,170,80,0.55), rgba(255,120,60,0) 45%)` }} />)}
      <AbsoluteFill style={{ background: d.ortu, opacity: d.ortuOp, mixBlendMode: "soft-light" }} />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 50%, rgba(0,0,0,${d.vin}) 100%)` }} />
      <AbsoluteFill style={{ background: "#fff", opacity: flas }} />
    </AbsoluteFill>
  );
};

/* ---------- etiket çipi: o an hangi filtre/efekt uygulandı ---------- */
const RenkEtiketi: React.FC<{ plan: Plan3 }> = ({ plan }) => {
  const { t, fps } = useT();
  const { d, bas, idx } = anlik(t, plan.renk);
  if (idx < 0 || !d.etiket) return null;
  const sonraki = plan.renk[idx + 1] ? plan.renk[idx + 1][0] : plan.sure;
  const bit = idx < 6 ? sonraki : Math.min(sonraki, bas + 2.2);
  if (t > bit) return null;
  const g = giris(t, bas, fps, 7);
  const renk = d.gri > 0.5 ? "#e8e8e8" : d.etiket.startsWith("DÜZ") ? RENK[3] : RENK[(idx + 4) % RENK.length];
  return (
    <div style={{ position: "absolute", top: 260, left: 60, opacity: g * cikis(t, bit, 0.12),
      transform: `translateX(${(1 - g) * -60}px) scale(${0.8 + 0.2 * g})`, transformOrigin: "left center" }}>
      <div style={{ background: renk, color: "#111", borderRadius: 999, padding: "14px 30px", fontFamily: MONT, fontWeight: 900,
        fontSize: 44, boxShadow: `0 12px 30px ${renk}66`, display: "flex", alignItems: "center", gap: 12 }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.6" strokeLinecap="round">
          <circle cx="9" cy="9" r="6" /><circle cx="15" cy="15" r="6" /></svg>
        {d.etiket}
      </div>
    </div>
  );
};

/* ---------- açılış başlığı ---------- */
const Baslik: React.FC<{ p: Plan3["baslik"] }> = ({ p }) => {
  const { t, fps } = useT();
  if (t > p.b) return null;
  return (
    <div style={{ position: "absolute", top: 270, left: 40, right: 40, textAlign: "center", opacity: cikis(t, p.b, 0.15) }}>
      {p.yazi.map((s, i) => {
        const g = giris(t, p.a + 0.05 + i * 0.18, fps, 8);
        return <div key={i} style={{ fontFamily: UNB, fontWeight: 900, fontSize: i ? 92 : 70, lineHeight: 1.08,
          color: i ? RENK[0] : "#fff", transform: `translateY(${(1 - g) * 40}px) scale(${0.7 + 0.3 * g})`, opacity: g,
          textShadow: "0 6px 0 rgba(0,0,0,0.35), 0 10px 30px rgba(0,0,0,0.4)" }}>{s}</div>;
      })}
    </div>
  );
};

/* ---------- "BEN CLAUDE'UM": perdede, beyaz → turuncu ---------- */
const BenClaude: React.FC<{ p: Plan3["benClaude"] }> = ({ p }) => {
  const { t, fps } = useT();
  if (t < p.a || t > p.b) return null;
  const g = giris(t, p.a, fps, 9);
  const tk = ara(t, p.turuncu, p.turuncu + 0.35);
  const renk = interpolate(tk, [0, 1], [0, 1]);
  const c = (a: number, b: number) => Math.round(a + (b - a) * renk);
  const col = `rgb(${c(255, 255)},${c(255, 138)},${c(255, 31)})`;
  const nabiz = tk > 0 && tk < 1 ? 1 + 0.1 * Math.sin(tk * Math.PI) : 1;
  return (
    <div style={{ position: "absolute", left: p.x * 1080 - 420, width: 840, top: p.y * 1920 - 140, textAlign: "center",
      opacity: g * cikis(t, p.b), transform: `scale(${(0.6 + 0.4 * g) * nabiz}) rotate(-4deg)` }}>
      {["BEN", "CLAUDE'UM"].map((s, i) => (
        <div key={i} style={{ fontFamily: UNB, fontWeight: 900, fontSize: i ? 104 : 90, lineHeight: 1.05, color: col, letterSpacing: -2,
          WebkitTextStroke: "4px rgba(0,0,0,0.75)", paintOrder: "stroke fill",
          textShadow: `0 10px 30px rgba(0,0,0,0.35), 0 0 ${30 * tk}px ${TURUNCU}` }}>{s}</div>
      ))}
    </div>
  );
};

/* ---------- KAMERAMAN bilgi kartı: elindeki kameranın üstünde, onu takip eder ---------- */
const Kameraman: React.FC<{ seg: Nokta[] }> = ({ seg }) => {
  const { t, fps } = useT();
  const a = seg[0][0], b = seg[seg.length - 1][0];
  if (t < a || t > b) return null;
  const ts = seg.map((s) => s[0]);
  const x = interpolate(t, ts, seg.map((s) => s[1]), { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const y = interpolate(t, ts, seg.map((s) => s[2]), { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const g = giris(t, a, fps, 9);
  const px = Math.min(1080 - 300, Math.max(300, x * 1080)), py = y * 1920 - 60;
  const okX = x * 1080 - px;
  return (
    <div style={{ position: "absolute", left: px - 280, top: py - 200, width: 560, opacity: g * cikis(t, b, 0.18),
      transform: `translateY(${(1 - g) * 40}px) scale(${0.7 + 0.3 * g})`, transformOrigin: "bottom center" }}>
      <div style={{ background: "#fff", borderRadius: 30, padding: "16px 24px 18px", boxShadow: "0 18px 40px rgba(0,0,0,0.35)",
        display: "flex", alignItems: "center", gap: 18, border: `5px solid ${RENK[1]}` }}>
        <svg width="70" height="70" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinejoin="round">
          <rect x="2" y="6" width="14" height="12" rx="3" fill={RENK[1]} /><path d="M16 10l6-3v10l-6-3z" fill={RENK[1]} />
          <circle cx="9" cy="12" r="3" fill="#fff" /></svg>
        <div>
          <div style={{ fontFamily: MONT, fontWeight: 900, fontSize: 22, letterSpacing: 4, color: "#0090b0" }}>BİLGİ KARTI</div>
          <div style={{ fontFamily: UNB, fontWeight: 900, fontSize: 48, color: "#111", lineHeight: 1.05, whiteSpace: "nowrap" }}>KAMERAMAN</div>
        </div>
      </div>
      <div style={{ width: 0, height: 0, margin: "0 auto", borderLeft: "22px solid transparent", borderRight: "22px solid transparent",
        borderTop: `26px solid ${RENK[1]}`, transform: `translateX(${Math.max(-180, Math.min(180, okX))}px)` }} />
    </div>
  );
};

/* ---------- "Merhaba, ben Tepetaklak'ın geliştiricisi" (gösterilen sol üst) ---------- */
const Merhaba: React.FC<{ p: Plan3["merhaba"] }> = ({ p }) => {
  const { t, fps } = useT();
  if (t < p.a || t > p.b) return null;
  const g = giris(t, p.a, fps, 9);
  const satir2 = "Tepetaklak'ın geliştiricisi";
  const n = Math.round(ara(t, p.a + 0.25, p.a + 1.0) * satir2.length);
  const el = Math.sin(t * 14) * 18;
  return (
    <div style={{ position: "absolute", left: 50, top: 300, width: 640, opacity: g * cikis(t, p.b),
      transform: `translateX(${(1 - g) * -80}px) rotate(-3deg)` }}>
      <div style={{ background: "rgba(15,18,26,0.85)", border: `4px solid ${RENK[0]}`, borderRadius: 32, padding: "22px 28px",
        boxShadow: `0 18px 40px ${RENK[0]}44` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <svg width="60" height="60" viewBox="0 0 24 24" style={{ transform: `rotate(${el}deg)`, transformOrigin: "70% 90%" }}>
            <path d="M7 11V6.5a1.5 1.5 0 0 1 3 0V11m0-1V5a1.5 1.5 0 0 1 3 0v5m0-.5V6a1.5 1.5 0 0 1 3 0v6m0-2.5a1.5 1.5 0 0 1 3 0V14a7 7 0 0 1-7 7h-1a7 7 0 0 1-6-3.4L3.5 14a1.5 1.5 0 0 1 2.5-1.6L7 14"
              fill={RENK[0]} stroke="#111" strokeWidth="1.2" strokeLinecap="round" /></svg>
          <div style={{ fontFamily: UNB, fontWeight: 900, fontSize: 60, color: RENK[0] }}>Merhaba,</div>
        </div>
        <div style={{ fontFamily: MONT, fontWeight: 900, fontSize: 42, color: "#fff", marginTop: 8 }}>ben</div>
        <div style={{ fontFamily: MONT, fontWeight: 900, fontSize: 46, color: "#fff", minHeight: 56 }}>
          {satir2.slice(0, n)}<span style={{ opacity: Math.sin(t * 12) > 0 ? 1 : 0, color: RENK[0] }}>|</span></div>
      </div>
    </div>
  );
};

/* ---------- "Yaptıklarım" listesi (gösterilen yukarı) ---------- */
const Liste: React.FC<{ p: Plan3["liste"] }> = ({ p }) => {
  const { t, fps } = useT();
  if (t < p.a || t > p.b) return null;
  const g = giris(t, p.a, fps, 9);
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top: 280, opacity: g * cikis(t, p.b),
      transform: `translateY(${(1 - g) * -60}px)` }}>
      <div style={{ background: "rgba(255,255,255,0.93)", borderRadius: 34, padding: "24px 32px", boxShadow: "0 20px 50px rgba(0,0,0,0.3)" }}>
        <div style={{ fontFamily: UNB, fontWeight: 900, fontSize: 50, color: "#111", marginBottom: 14 }}>
          YAPTIKLARIM <span style={{ color: RENK[2] }}>✦</span></div>
        {p.maddeler.map((m, i) => {
          const mg = giris(t, p.a + 0.35 + i * 0.32, fps, 8);
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 10, opacity: mg,
              transform: `translateX(${(1 - mg) * 50}px)` }}>
              <div style={{ width: 46, height: 46, borderRadius: 23, background: RENK[(i + 1) % RENK.length], display: "flex",
                alignItems: "center", justifyContent: "center", fontFamily: MONT, fontWeight: 900, fontSize: 26, color: "#111" }}>{i + 1}</div>
              <div style={{ fontFamily: MONT, fontWeight: 900, fontSize: 40, color: "#151515" }}>{m}</div>
            </div>);
        })}
      </div>
    </div>
  );
};

/* ---------- müzik başladı göstergesi ---------- */
const Muzik: React.FC<{ a: number }> = ({ a }) => {
  const { t, fps } = useT();
  if (t < a || t > a + 2.4) return null;
  const g = giris(t, a, fps, 8);
  return (
    <div style={{ position: "absolute", top: 370, right: 60, opacity: g * cikis(t, a + 2.4),
      transform: `scale(${0.8 + 0.2 * g})`, transformOrigin: "right center" }}>
      <div style={{ background: RENK[5], borderRadius: 999, padding: "14px 30px", fontFamily: MONT, fontWeight: 900, fontSize: 42,
        color: "#111", display: "flex", alignItems: "center", gap: 12, boxShadow: `0 12px 30px ${RENK[5]}66` }}>
        <span style={{ display: "inline-block", transform: `translateY(${Math.sin(t * 10) * 5}px)` }}>♪</span> MELODİK MÜZİK
        <span style={{ display: "inline-flex", gap: 4, alignItems: "flex-end", height: 34 }}>
          {[0, 1, 2, 3].map((i) => <span key={i} style={{ width: 7, borderRadius: 3, background: "#111",
            height: 10 + 22 * Math.abs(Math.sin(t * 9 + i * 1.3)) }} />)}</span>
      </div>
    </div>
  );
};

export const Komut3: React.FC<{ plan: Plan3 }> = ({ plan }) => (
  <AbsoluteFill style={{ background: "#000" }}>
    <style>{FONTLAR}</style>
    <RenkliVideo plan={plan} />
    <Baslik p={plan.baslik} />
    <BenClaude p={plan.benClaude} />
    {plan.kameraman.map((s, i) => <Kameraman key={i} seg={s} />)}
    <Merhaba p={plan.merhaba} />
    <Liste p={plan.liste} />
    <RenkEtiketi plan={plan} />
    <Muzik a={plan.muzik} />
    <Altyazi k={plan.kelimeler} altY={1440} />
  </AbsoluteFill>
);
