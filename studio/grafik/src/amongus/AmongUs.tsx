import React from "react";
import { AbsoluteFill, OffthreadVideo, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing } from "remotion";

/** zaman çizelgesi (çıkış saniyesi) — projeler/amongus/taban.py ile aynı */
export const Z = {
  gorev: [0.2, 2.9], kill: 2.95, killSon: 4.6, vent: 5.38, ventSon: 7.0, can: [6.6, 11.7],
  dusus: [11.7, 13.2], donma: 13.2, sure: 14.4,
};
const MONT = "Mont", UNB = "Unbounded";
const KIRMIZI = "#FF2D3D", MAVI = "#00D4FF", SARI = "#FFD60A";
const FONTLAR = `
@font-face{font-family:${MONT};src:url(${staticFile("fonts/Montserrat-Black.ttf")}) format('truetype');font-weight:900}
@font-face{font-family:${UNB};src:url(${staticFile("fonts/unbounded-latin-ext-900-normal.woff2")}) format('woff2');font-weight:900}
@font-face{font-family:${UNB};src:url(${staticFile("fonts/unbounded-latin-900-normal.woff2")}) format('woff2');font-weight:900;unicode-range:U+0000-00FF}`;

const useT = () => { const f = useCurrentFrame(); const { fps } = useVideoConfig(); return { f, fps, t: f / fps }; };
const yay = (t: number, a: number, fps: number, d = 9, damping = 12) =>
  spring({ frame: Math.round((t - a) * fps), fps, config: { damping, stiffness: 200, mass: 0.6 }, durationInFrames: d });
const ara = (t: number, a: number, b: number, x = 0, y = 1, e = Easing.inOut(Easing.cubic)) =>
  interpolate(t, [a, b], [x, y], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });
const pr = (i: number) => { const x = Math.sin(i * 127.1) * 43758.5453; return x - Math.floor(x); };  // sabit rastgele

/* ---------- GÖREV kartı: anahtar ikonu + dolan çubuk; kill anında kırmızıya döner, "yarıda kaldı" ---------- */
const Gorev: React.FC = () => {
  const { t, fps } = useT();
  const [a, b] = Z.gorev;
  if (t < a || t > Z.kill + 0.9) return null;
  const g = yay(t, a, fps, 10);
  const dolu = ara(t, a + 0.3, Z.kill, 0, 0.72, Easing.out(Easing.quad));
  const kirik = t >= Z.kill;
  const cik = ara(t, Z.kill + 0.55, Z.kill + 0.9, 1, 0);
  const sars = kirik ? Math.sin(t * 90) * 10 * ara(t, Z.kill, Z.kill + 0.4, 1, 0) : 0;
  const donme = Math.sin(t * 9) * 18;  // çalışan anahtar
  return (
    <div style={{ position: "absolute", top: 300, left: 70, right: 70, opacity: g * cik,
      transform: `translateY(${(1 - g) * -80}px) translateX(${sars}px) scale(${0.85 + 0.15 * g})` }}>
      <div style={{ background: "rgba(12,16,24,0.84)", border: `4px solid ${kirik ? KIRMIZI : MAVI}`, borderRadius: 34,
        padding: "22px 30px 26px", boxShadow: `0 20px 50px ${kirik ? KIRMIZI : MAVI}55` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <svg width="64" height="64" viewBox="0 0 24 24" style={{ transform: `rotate(${kirik ? 0 : donme}deg)` }}>
            <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z"
              fill="none" stroke={kirik ? KIRMIZI : MAVI} strokeWidth={2.2} strokeLinejoin="round" />
          </svg>
          <div>
            <div style={{ fontFamily: UNB, fontWeight: 900, fontSize: 66, color: kirik ? KIRMIZI : MAVI, lineHeight: 1 }}>
              {kirik ? "YARIDA KALDI" : "GÖREV"}</div>
            <div style={{ fontFamily: MONT, fontWeight: 900, fontSize: 32, color: "#fff", marginTop: 6 }}>DOLAPTAKİ GÖREVİ YAP</div>
          </div>
        </div>
        <div style={{ marginTop: 20, height: 30, borderRadius: 15, background: "rgba(255,255,255,0.15)", overflow: "hidden" }}>
          <div style={{ width: `${dolu * 100}%`, height: "100%", borderRadius: 15,
            background: kirik ? KIRMIZI : `repeating-linear-gradient(45deg, ${MAVI} 0 22px, #5BE7FF 22px 44px)`,
            backgroundPosition: `${t * 120}px 0` }} />
        </div>
      </div>
      {/* parıltılar */}
      {!kirik && [0, 1, 2, 3, 4].map((i) => {
        const faz = (t * 1.6 + pr(i)) % 1;
        return <div key={i} style={{ position: "absolute", left: `${12 + pr(i + 9) * 76}%`, top: -20 - faz * 60,
          width: 14, height: 14, borderRadius: 7, background: "#fff", opacity: (1 - faz) * g, boxShadow: `0 0 16px ${MAVI}` }} />;
      })}
    </div>
  );
};

/* ---------- KILL: flaş, bıçak izleri, glitch yazı, kırmızı vinyet ---------- */
const Kill: React.FC = () => {
  const { t, fps } = useT();
  const k = Z.kill;
  if (t < k - 0.05 || t > Z.killSon) return null;
  const flas = ara(t, k, k + 0.22, 1, 0, Easing.out(Easing.quad));
  const g = yay(t, k + 0.05, fps, 8, 9);
  const cik = ara(t, Z.killSon - 0.25, Z.killSon, 1, 0);
  const jit = t < k + 0.6 ? 1 : 0.25;
  const dx = Math.sin(t * 70) * 10 * jit, dy = Math.cos(t * 53) * 6 * jit;
  const yazi = (renk: string, x: number, y: number, op: number) => (
    <div style={{ position: "absolute", inset: 0, display: "flex", justifyContent: "center", transform: `translate(${x}px,${y}px)`,
      fontFamily: UNB, fontWeight: 900, fontSize: 210, color: renk, opacity: op, letterSpacing: -6 }}>KILL!</div>);
  return (
    <AbsoluteFill style={{ opacity: cik }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 45%, ${KIRMIZI}${Math.round(
        (0.35 + 0.25 * Math.sin(t * 12)) * 255).toString(16).padStart(2, "0")} 100%)` }} />
      <AbsoluteFill style={{ background: "#fff", opacity: flas * 0.55, mixBlendMode: "screen" }} />
      <AbsoluteFill style={{ background: KIRMIZI, opacity: flas * 0.35 }} />
      {/* bıçak izleri: çapraz kesikler sırayla açılır */}
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        {[0, 1, 2].map((i) => {
          const p = ara(t, k + i * 0.07, k + 0.18 + i * 0.07, 0, 1, Easing.out(Easing.cubic));
          const sol = ara(t, k + 0.7 + i * 0.05, k + 1.1, 1, 0);
          const y0 = 700 + i * 120, L = 1500;
          return <line key={i} x1={-200} y1={y0 + 420} x2={-200 + L * p} y2={y0 + 420 - L * p * 0.42}
            stroke={i === 1 ? "#fff" : KIRMIZI} strokeWidth={i === 1 ? 10 : 22} strokeLinecap="round" opacity={sol}
            style={{ filter: `drop-shadow(0 0 18px ${KIRMIZI})` }} />;
        })}
      </svg>
      <div style={{ position: "absolute", top: 560, left: 0, right: 0, height: 260,
        transform: `scale(${2.6 - 1.6 * g}) rotate(${-6 + 4 * g}deg)`, opacity: Math.min(1, g * 1.4) }}>
        {yazi(MAVI, dx - 8, dy, 0.7)}
        {yazi("#ff00aa", -dx + 8, -dy, 0.6)}
        {yazi(KIRMIZI, 0, 0, 1)}
        <div style={{ position: "absolute", inset: 0, display: "flex", justifyContent: "center", fontFamily: UNB, fontWeight: 900,
          fontSize: 210, letterSpacing: -6, color: "transparent", WebkitTextStroke: "5px #fff" }}>KILL!</div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- VENT: hız çizgileri, çıkış noktasında duman, kapağı açılan ızgara, kayan yazı ---------- */
const Vent: React.FC = () => {
  const { t, fps } = useT();
  const v = Z.vent;
  if (t < v - 0.35 || t > Z.ventSon) return null;
  const cik = ara(t, Z.ventSon - 0.3, Z.ventSon, 1, 0);
  const g = yay(t, v, fps, 9);
  const kapak = ara(t, v - 0.1, v + 0.25, 0, 1, Easing.out(Easing.back(2)));
  const kapan = ara(t, v + 0.9, v + 1.15, 0, 1);
  const cizgi = ara(t, v - 0.35, v + 0.35, 0, 1);
  return (
    <AbsoluteFill style={{ opacity: cik }}>
      {/* hız çizgileri (sağdan sola, imposter'ın kaçış yönü) */}
      {Array.from({ length: 14 }).map((_, i) => {
        const y = 520 + pr(i) * 820, uz = 220 + pr(i + 3) * 380;
        const x = 1180 - (cizgi * 1.6 - pr(i + 7) * 0.6) * 1400;
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: uz, height: 6 + pr(i + 1) * 6, borderRadius: 6,
          background: "rgba(255,255,255,0.75)", opacity: Math.sin(Math.PI * cizgi) }} />;
      })}
      {/* duman bulutu: imposter'ın kadrajdan çıktığı sol kenar */}
      {Array.from({ length: 9 }).map((_, i) => {
        const p = ara(t, v - 0.1 + i * 0.03, v + 1.0 + i * 0.03, 0, 1, Easing.out(Easing.quad));
        const r = 60 + pr(i) * 70;
        return <div key={i} style={{ position: "absolute", left: 40 + p * (80 + pr(i + 2) * 160) - r, top: 900 + (pr(i + 5) - 0.5) * 300 - p * 120 - r,
          width: r * 2 * (0.5 + p), height: r * 2 * (0.5 + p), borderRadius: "50%",
          background: "radial-gradient(circle, rgba(220,220,230,0.85), rgba(200,200,210,0))", opacity: (1 - p) * 0.9 }} />;
      })}
      {/* vent ızgarası */}
      <div style={{ position: "absolute", left: 50, top: 1240, width: 380, height: 190, perspective: 600,
        transform: `scale(${0.6 + 0.4 * g})`, opacity: g }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: 18, background: "#1a1d24", boxShadow: "inset 0 10px 30px #000" }} />
        <div style={{ position: "absolute", inset: 0, borderRadius: 18, background: "#aeb7c2", border: "8px solid #6f7884", boxShadow: "0 12px 30px rgba(0,0,0,0.45)",
          transformOrigin: "top", transform: `rotateX(${(kapak - kapan) * 75}deg)`,
          display: "flex", flexDirection: "column", justifyContent: "space-evenly", padding: "0 22px" }}>
          {[0, 1, 2, 3].map((i) => <div key={i} style={{ height: 12, borderRadius: 6, background: "#3a4049" }} />)}
        </div>
      </div>
      {/* yazı */}
      <div style={{ position: "absolute", top: 330, left: 0, right: 0, display: "flex", justifyContent: "center",
        transform: `translateX(${(1 - g) * 700}px) skewX(${(1 - g) * -25}deg)` }}>
        <div style={{ fontFamily: UNB, fontWeight: 900, fontSize: 180, color: SARI, letterSpacing: -4,
          textShadow: `0 10px 0 #b38f00, 0 24px 40px rgba(0,0,0,0.5)` }}>VENT</div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- CAN çubuğu: yaralı oyuncu, can azalır, kalp atışıyla kırmızı kenar ---------- */
const Can: React.FC = () => {
  const { t, fps } = useT();
  const [a, b] = Z.can;
  if (t < a || t > Z.donma) return null;
  const g = yay(t, a, fps, 9);
  const can = ara(t, a + 0.2, Z.dusus[1] - 0.2, 0.62, 0.0, Easing.in(Easing.quad));
  const atis = Math.pow(Math.max(0, Math.sin((t - a) * Math.PI * 1.35)), 8);  // ~0.74 sn'de bir atış
  const yuzde = Math.round(can * 100);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ boxShadow: `inset 0 0 ${160 + atis * 120}px ${KIRMIZI}`, opacity: 0.35 + atis * 0.45 }} />
      <div style={{ position: "absolute", top: 300, left: 90, right: 90, opacity: g, transform: `translateY(${(1 - g) * -60}px)` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
          <svg width="58" height="58" viewBox="0 0 24 24" style={{ transform: `scale(${1 + atis * 0.25})` }}>
            <path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.3 3.1 4.5 6.8 4.5c2.1 0 3.6 1.2 5.2 3 1.6-1.8 3.1-3 5.2-3 3.7 0 5.9 3.8 4.4 7.3C19.5 16.4 12 21 12 21z"
              fill={KIRMIZI} /><path d="M12 7.5 10.5 11l3 1.5-2 4" fill="none" stroke="#111" strokeWidth={1.6} />
          </svg>
          <div style={{ fontFamily: UNB, fontWeight: 900, fontSize: 58, color: "#fff" }}>YARALI</div>
          <div style={{ marginLeft: "auto", fontFamily: MONT, fontWeight: 900, fontSize: 50, color: KIRMIZI }}>%{yuzde}</div>
        </div>
        <div style={{ height: 34, borderRadius: 17, background: "rgba(0,0,0,0.55)", border: "3px solid rgba(255,255,255,0.5)",
          overflow: "hidden" }}>
          <div style={{ width: `${can * 100}%`, height: "100%", background: `linear-gradient(90deg, #b3001b, ${KIRMIZI})`,
            boxShadow: `0 0 24px ${KIRMIZI}` }} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- ELENDİ damgası (donan karede) ---------- */
const Elendi: React.FC = () => {
  const { t, fps } = useT();
  if (t < Z.donma) return null;
  const g = yay(t, Z.donma + 0.12, fps, 8, 8);
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div style={{ transform: `scale(${2.4 - 1.4 * g}) rotate(-12deg)`, opacity: Math.min(1, g * 1.5),
        border: `14px solid ${KIRMIZI}`, borderRadius: 30, padding: "18px 46px",
        fontFamily: UNB, fontWeight: 900, fontSize: 150, color: KIRMIZI, letterSpacing: 2,
        background: "rgba(255,255,255,0.08)", boxShadow: `0 0 60px ${KIRMIZI}88` }}>ELENDİ</div>
    </AbsoluteFill>
  );
};

export const AmongUs: React.FC = () => {
  const { t } = useT();
  const k = Z.kill;
  // kill: punch-in zoom + sarsıntı; düşüş: yavaş yakınlaşma; donma: siyah-beyaz
  const punch = 1 + 0.14 * ara(t, k, k + 0.08, 0, 1) * ara(t, k + 0.35, k + 1.0, 1, 0);
  const sars = t > k && t < k + 0.5 ? (1 - (t - k) / 0.5) : 0;
  const sx = Math.sin(t * 95) * 26 * sars, sy = Math.cos(t * 71) * 20 * sars;
  const yakin = 1 + 0.12 * ara(t, Z.dusus[0], Z.donma + 0.4);
  const gri = ara(t, Z.donma - 0.1, Z.donma + 0.15);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <style>{FONTLAR}</style>
      <AbsoluteFill style={{ transform: `translate(${sx}px,${sy}px) scale(${punch * yakin})`, transformOrigin: "50% 45%",
        filter: `grayscale(${gri}) contrast(${1 + gri * 0.2}) brightness(${1 - gri * 0.15})` }}>
        <OffthreadVideo src={staticFile("amongus/taban.mp4")} style={{ width: "100%", height: "100%" }} />
      </AbsoluteFill>
      <Gorev />
      <Kill />
      <Vent />
      <Can />
      <Elendi />
    </AbsoluteFill>
  );
};
