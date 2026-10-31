import React, { useEffect, useState } from "react";
import { AbsoluteFill, Img, Sequence, continueRender, delayRender, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig, Easing } from "remotion";

// Instagram Reels için dikey (1080x1920) tam tanıtım: bütün özellikler.
// Sahne dili Claude Stüdyo skill reçetelerinden: açılış "reklam-filmi", özellik kartları ve sayılar "motion-grafik", kapanış "cizgi-film" maskotu.
// Oyun görüntüleri önceki çekimlerden (public/<klasör>/<sahne>/0000.jpg ...). Müzik render sonrası ffmpeg ile eklenir.

const W = 1080, H = 1920;
const c01 = (x: number) => Math.max(0, Math.min(1, x));
const cik = (x: number) => 1 - Math.pow(1 - c01(x), 3);
const geri = (x: number) => { const q = c01(x) - 1; return 1 + 2.7 * q * q * q + 1.7 * q * q; };

const FONT_FILES: [string, string, string][] = [
  ["Unbounded", "600", "unbounded-latin-600"], ["Unbounded", "900", "unbounded-latin-900"],
  ["Unbounded", "600", "unbounded-latin-ext-600"], ["Unbounded", "900", "unbounded-latin-ext-900"],
  ["Fraunces", "600", "fraunces-latin-600"], ["Fraunces", "900", "fraunces-latin-900"],
  ["Fraunces", "600", "fraunces-latin-ext-600"], ["Fraunces", "900", "fraunces-latin-ext-900"],
  ["Fredoka", "700", "fredoka-latin-700"], ["Fredoka", "700", "fredoka-latin-ext-700"],
];
const useReelFonts = () => {
  const [h] = useState(() => delayRender("reels fontları"));
  useEffect(() => {
    Promise.all(FONT_FILES.map(([fam, w, file]) => new FontFace(fam, `url(${staticFile(`reels/fonts/${file}-normal.woff2`)})`, { weight: w, unicodeRange: file.includes("-ext-") ? "U+0100-024F, U+1E00-1EFF" : "U+0000-00FF, U+2000-206F, U+20BA" }).load().then((ff) => document.fonts.add(ff))))
      .then(() => continueRender(h)).catch(() => continueRender(h));
  }, [h]);
};

const frameSrc = (dir: string, i: number) => staticFile(`${dir}/${String(i).padStart(4, "0")}.jpg`);

// ---------------- açılış: sinematik reklam (karanlık stüdyo, ışık süzmesi, toz, letterbox) ----------------
const CarSvg: React.FC<{ sweep: number }> = ({ sweep }) => (
  <svg width={900} height={330} viewBox="0 0 820 300">
    <defs>
      <linearGradient id="govde" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f3d9a4" /><stop offset=".45" stopColor="#c9963f" /><stop offset="1" stopColor="#2a2118" /></linearGradient>
      <linearGradient id="cam" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#3a3a40" /><stop offset="1" stopColor="#0d0d10" /></linearGradient>
      <clipPath id="kirp"><path d="M40 210 C40 170 90 150 170 140 L300 92 C340 72 470 66 540 92 L650 140 C730 148 790 165 790 205 L790 228 L40 228 Z" /></clipPath>
      <radialGradient id="fan" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#ffcf7a" stopOpacity=".85" /><stop offset="1" stopColor="#ffcf7a" stopOpacity="0" /></radialGradient>
    </defs>
    <ellipse cx="415" cy="262" rx="330" ry="26" fill="url(#fan)" />
    <path d="M40 210 C40 170 90 150 170 140 L300 92 C340 72 470 66 540 92 L650 140 C730 148 790 165 790 205 L790 228 L40 228 Z" fill="url(#govde)" />
    <path d="M318 104 C350 86 460 82 522 104 L592 140 L292 140 Z" fill="url(#cam)" />
    <path d="M60 190 L780 190" stroke="#fff3d6" strokeOpacity=".35" strokeWidth="3" />
    <rect x="752" y="176" width="34" height="10" rx="5" fill="#fff3d6" />
    <rect x="44" y="180" width="26" height="9" rx="4" fill="#ff4d3d" />
    <g clipPath="url(#kirp)"><rect x={-200 + sweep * 1300} y="-40" width="90" height="400" fill="#fff6e0" opacity=".55" transform="skewX(-18)" /></g>
    {[190, 640].map((x) => (<g key={x}><circle cx={x} cy="228" r="54" fill="#141210" /><circle cx={x} cy="228" r="30" fill="#4a3f33" /><circle cx={x} cy="228" r="9" fill="#c9963f" /></g>))}
  </svg>
);

const Intro: React.FC = () => {
  const f = useCurrentFrame();
  const push = 1 + 0.12 * (f / 180);
  const sweep = ((f - 20) % 75) / 75;
  const title = cik((f - 55) / 35);
  const flip = interpolate(f, [118, 134], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  const tc = `00:00:${String(Math.floor(f / 30)).padStart(2, "0")}:${String(f % 30).padStart(2, "0")}`;
  const out = interpolate(f, [168, 180], [1, 0], { extrapolateLeft: "clamp" });
  return (
    <AbsoluteFill style={{ background: "#0b0a09", opacity: out }}>
      <AbsoluteFill style={{ transform: `scale(${push})` }}>
        <div style={{ position: "absolute", left: W / 2 - 700, top: 820 - 700, width: 1400, height: 1400, background: "radial-gradient(circle, rgba(201,150,63,.42) 0%, rgba(201,150,63,.12) 35%, rgba(11,10,9,0) 65%)" }} />
        {Array.from({ length: 28 }).map((_, i) => {
          const sp = 1.2 + random(`h${i}`) * 2.4, x = random(`x${i}`) * W, y = (random(`y${i}`) * H - f * sp + H * 4) % H;
          return <div key={i} style={{ position: "absolute", left: x + Math.sin((f + i * 20) / 30) * 14, top: y, width: 4 + random(`s${i}`) * 5, height: 4 + random(`s${i}`) * 5, borderRadius: "50%", background: "#f3e2bf", opacity: 0.18 + random(`o${i}`) * 0.35 }} />;
        })}
        <div style={{ position: "absolute", left: 90, top: 700 }}><CarSvg sweep={c01(sweep)} /></div>
        <div style={{ position: "absolute", left: 140, width: 800, top: 1035, height: 3, background: "linear-gradient(90deg, transparent, #fff1cf, transparent)", opacity: sweep > 0.4 && sweep < 0.7 ? 0.8 : 0.1 }} />
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1160, textAlign: "center", opacity: title }}>
        <div style={{ fontFamily: "Fraunces", fontWeight: 900, fontSize: 132, color: "#f6ead2", letterSpacing: `${interpolate(title, [0, 1], [0.4, 0.01])}em`, lineHeight: 1 }}>
          TEPE<span style={{ display: "inline-block", color: "#d9a54a", transform: `scaleY(${1 - 2 * flip})`, transformOrigin: "50% 58%" }}>TAKLAK</span>
        </div>
        <div style={{ fontFamily: "Fraunces", fontWeight: 600, fontSize: 46, color: "#cdbb98", marginTop: 26, opacity: cik((f - 85) / 25) }}>Uçan, takla atan, konuşan araba</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 220, background: "#000" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 380, background: "#000" }} />
      <div style={{ position: "absolute", left: 90, top: 236, display: "flex", alignItems: "center", gap: 14, fontFamily: "Unbounded", fontWeight: 600, fontSize: 34, color: "#e9dcc0" }}>
        <span style={{ width: 22, height: 22, borderRadius: "50%", background: "#e3263b", opacity: Math.floor(f / 15) % 2 ? 0.25 : 1 }} />REC
      </div>
      <div style={{ position: "absolute", right: 90, top: 236, fontFamily: "Unbounded", fontWeight: 600, fontSize: 34, color: "#e9dcc0", fontVariantNumeric: "tabular-nums" }}>{tc}</div>
      <div style={{ position: "absolute", right: 90, bottom: 400, fontFamily: "Unbounded", fontWeight: 600, fontSize: 34, color: "#a8987a" }}>50mm · f/1.4</div>
    </AbsoluteFill>
  );
};

// ---------------- özellik kartı: kinetik başlık + oyundan görüntü ----------------
type Feat = { words: string[]; sub: string; dir: string; start: number; count: number; accent: string };
const FEATS: Feat[] = [
  { words: ["RAMPADA", "TAKLA"], sub: "19 metrelik J rampa, tavanda baş aşağı", dir: "fragman/ramp", start: 190, count: 282, accent: "#ff3b4e" },
  { words: ["UÇAN", "ARABALAR"], sub: "Kartal GT · Bulut SUV · Kapsül", dir: "guncelleme6/modeller", start: 0, count: 240, accent: "#ff8a3d" },
  { words: ["OTOPİLOTLA", "UÇ"], sub: "Haritadan seç, gerisini araba yapar", dir: "fragman/fly", start: 40, count: 200, accent: "#5fc4ff" },
  { words: ["HEY", "TEPETAKLAK"], sub: "“Beni köfteciye götür” de, götürsün", dir: "guncelleme4/hey", start: 0, count: 90, accent: "#ffd34d" },
  { words: ["BOĞAZ", "KÖPRÜLER"], sub: "İstanbul Boğazı, köprüler ve vapurlar", dir: "tanitim/bogaz", start: 20, count: 150, accent: "#5fc4ff" },
  { words: ["BALIKÇI", "ABİLER"], sub: "Sahilde olta atanlar, oturacak banklar", dir: "guncelleme5/b_balikci", start: 10, count: 110, accent: "#5fd38a" },
  { words: ["TÜNELDEN", "81 İL"], sub: "Yeraltı tüneliyle her ile git", dir: "tanitim/tunel", start: 40, count: 190, accent: "#ffd34d" },
  { words: ["ARABA", "ASANSÖRÜ"], sub: "Park et, 3 saniye bekle, aşağı in", dir: "tanitim/asansor", start: 40, count: 165, accent: "#5fc4ff" },
];
const FEATS2: Feat[] = [
  { words: ["TELEFONDAN", "YÖNET"], sub: "Kilitle, korna çal, arabayı çağır", dir: "guncelleme2/app", start: 10, count: 120, accent: "#ff5fa2" },
  { words: ["TAKSİ", "ÇAĞIR"], sub: "Yolun kenarından el kaldır, bin", dir: "guncelleme3/tcagir", start: 70, count: 200, accent: "#ffd34d" },
  { words: ["POLİS", "PEŞİNDE"], sub: "Kovalamaca: kıl payı kaç", dir: "fragman/police", start: 30, count: 150, accent: "#3e8bff" },
  { words: ["MODİFİYE", "GARAJ"], sub: "Tampon, jant, rüzgârlık, neon", dir: "tanitim/modif", start: 50, count: 200, accent: "#ff3b4e" },
  { words: ["KAZA", "ÖNLEME"], sub: "Yana kaçar, fren yapar, zıplar", dir: "tanitim/kaza", start: 0, count: 100, accent: "#ff8a3d" },
  { words: ["ARABA", "EKRANI"], sub: "Dokun, büyüsün: YouTube ve Spotify", dir: "guncelleme6/ekran", start: 70, count: 130, accent: "#5fd38a" },
  { words: ["ONLİNE", "8 KİŞİ"], sub: "Arkadaşlarınla aynı şehirde", dir: "guncelleme6/online", start: 20, count: 120, accent: "#ffd34d" },
  { words: ["İN, YÜRÜ", "KÖFTE YE"], sub: "Arabadan in, dükkânlara gir", dir: "tanitim/yuru", start: 20, count: 130, accent: "#ff5fa2" },
];
const FD = 84;

const Feature: React.FC<{ ft: Feat }> = ({ ft }) => {
  const f = useCurrentFrame();
  const n = Math.min(ft.count - 1, ft.start + f);
  const src = frameSrc(ft.dir, n);
  const card = geri((f - 2) / 16);
  const out = interpolate(f, [FD - 8, FD], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) });
  const ring = f * 2.4;
  return (
    <AbsoluteFill style={{ background: "#0b0d12", overflow: "hidden" }}>
      <Img src={src} style={{ position: "absolute", inset: -80, width: W + 160, height: H + 160, objectFit: "cover", filter: "blur(38px) brightness(.42) saturate(1.2)" }} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <circle cx={930} cy={690} r={120 + Math.sin(f / 6) * 14} fill={ft.accent} opacity={0.22} />
        <circle cx={150} cy={1500} r={110} fill="none" stroke={ft.accent} strokeWidth={10} strokeDasharray="26 22" transform={`rotate(${ring} 150 1500)`} opacity={0.7} />
        <rect x={860} y={1420} width={120} height={120} rx={30} fill="none" stroke="#fff" strokeWidth={8} opacity={0.35} transform={`rotate(${-ring * 0.8} 920 1480)`} />
      </svg>
      <div style={{ position: "absolute", left: 90, right: 90, top: 250, transform: `translateX(${-out * 1100}px)` }}>
        {ft.words.map((w, i) => {
          const p = geri((f - 4 - i * 6) / 14), from = i % 2 ? 1 : -1;
          return <div key={i} style={{ fontFamily: "Unbounded", fontWeight: 900, fontSize: w.length > 9 ? 104 : 132, lineHeight: 0.95, letterSpacing: "-0.03em", color: i ? ft.accent : "#fff", transform: `translateX(${(1 - p) * from * 1100}px)`, whiteSpace: "nowrap" }}>{w}</div>;
        })}
      </div>
      <div style={{ position: "absolute", left: 40, top: 640, width: 1000, height: 562, borderRadius: 30, overflow: "hidden", boxShadow: "0 30px 60px rgba(0,0,0,.55)", border: "3px solid rgba(255,255,255,.14)", transform: `translateX(${(1 - card) * 1100 - out * 1100}px) rotate(${(1 - card) * 4}deg)` }}>
        <Img src={src} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${1.04 + f * 0.0007})` }} />
      </div>
      <div style={{ position: "absolute", left: 90, right: 90, top: 1250, fontFamily: "Unbounded", fontWeight: 600, fontSize: 40, lineHeight: 1.3, color: "#e8ecf1", opacity: cik((f - 16) / 12) * (1 - out), transform: `translateY(${(1 - cik((f - 16) / 12)) * 30}px)` }}>{ft.sub}</div>
    </AbsoluteFill>
  );
};

// ---------------- ara: motion grafik sayılar ----------------
const STATS: [string, number, string, string][] = [["İL", 81, "#ffd34d", "Türkiye'nin bütün illeri"], ["ARAÇ", 6, "#ff5fa2", "Fan araba'dan Kapsül'e"], ["KİŞİ", 8, "#fff", "Aynı odada online"]];
const Stats: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#5b2be0", overflow: "hidden" }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <circle cx={880} cy={360} r={150 + Math.sin(f / 7) * 22} fill="#ffd34d" />
        <circle cx={200} cy={1560} r={130} fill="none" stroke="#ff5fa2" strokeWidth={14} strokeDasharray="30 24" transform={`rotate(${f * 3} 200 1560)`} />
        <path d="M90 1500 C 300 1380, 600 1620, 990 1480" fill="none" stroke="#fff" strokeWidth={10} strokeLinecap="round" strokeDasharray="1100" strokeDashoffset={1100 * (1 - cik((f - 20) / 40))} />
      </svg>
      {STATS.map(([lbl, num, col, sub], i) => {
        const p = geri((f - 6 - i * 10) / 14), from = i % 2 ? 1 : -1, cnt = Math.round(num * cik((f - 6 - i * 10) / 30));
        const bar = cik((f - 14 - i * 5) / 24);
        return (
          <div key={lbl} style={{ position: "absolute", left: 90, right: 90, top: 300 + i * 340, transform: `translateX(${(1 - p) * from * 1200}px)` }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 26 }}>
              <span style={{ fontFamily: "Unbounded", fontWeight: 900, fontSize: 190, lineHeight: 0.95, letterSpacing: "-0.04em", color: col, fontVariantNumeric: "tabular-nums" }}>{cnt}</span>
              <span style={{ fontFamily: "Unbounded", fontWeight: 900, fontSize: 96, color: "#fff", letterSpacing: "-0.02em" }}>{lbl}</span>
            </div>
            <div style={{ height: 18, width: `${bar * (40 + num * 0.7)}%`, background: col, marginTop: 10 }} />
            <div style={{ fontFamily: "Unbounded", fontWeight: 600, fontSize: 36, color: "#efe9ff", marginTop: 14 }}>{sub}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ---------------- kapanış: çizgi film maskot ----------------
const K = "#141418";
const Outro: React.FC = () => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const hop = Math.abs(Math.sin(f / 6)), s = 1 - hop * 0.08 + (hop < 0.15 ? 0.06 : 0);
  const blink = f % 70 < 3;
  const bub = spring({ frame: f - 24, fps, config: { damping: 9 } });
  const card = spring({ frame: f - 4, fps, config: { damping: 11 } });
  const cta = spring({ frame: f - 60, fps, config: { damping: 12 } });
  const hill = (y: number, amp: number, sp: number, col: string) => {
    const off = (f * sp) % 540; let d = `M ${-off} ${H}`;
    for (let x = -off; x <= W + 540; x += 270) d += ` Q ${x + 135} ${y - amp} ${x + 270} ${y}`;
    return <path d={d + ` L ${W + 540} ${H} Z`} fill={col} stroke={K} strokeWidth={6} />;
  };
  return (
    <AbsoluteFill style={{ background: "#7fd0ff", overflow: "hidden" }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <g transform={`translate(860 680) rotate(${f * 1.2})`}>
          {Array.from({ length: 10 }).map((_, i) => <rect key={i} x={-10} y={-185} width={20} height={50} rx={10} fill="#ffd34d" stroke={K} strokeWidth={5} transform={`rotate(${i * 36})`} />)}
        </g>
        <circle cx={860} cy={680} r={110} fill="#ffd34d" stroke={K} strokeWidth={7} />
        <circle cx={825} cy={665} r={10} fill={K} /><circle cx={895} cy={665} r={10} fill={K} />
        <path d="M815 710 Q860 745 905 710" fill="none" stroke={K} strokeWidth={7} strokeLinecap="round" />
        {[0, 1].map((i) => { const x = ((i * 600 - f * 2.2) % 1500 + 1500) % 1500 - 300; return <g key={i} transform={`translate(${x} ${540 + i * 300})`}><ellipse cx={0} cy={0} rx={110} ry={46} fill="#fff" stroke={K} strokeWidth={6} /><ellipse cx={70} cy={-20} rx={70} ry={40} fill="#fff" stroke={K} strokeWidth={6} /></g>; })}
        {hill(1300, 160, 1.5, "#5fc96b")}
        {hill(1480, 120, 4, "#3fae55")}
        <ellipse cx={540} cy={1500} rx={230 * (1 - hop * 0.3)} ry={26} fill={K} opacity={0.25} />
        <g transform={`translate(540 ${1440 - hop * 120}) scale(${1 / Math.sqrt(s)} ${s})`}>
          <path d="M-250 -10 C-250 -60 -200 -80 -140 -90 L-60 -170 C-20 -195 90 -195 130 -170 L200 -95 C250 -88 260 -60 260 -10 L260 20 L-250 20 Z" fill="#ff3b4e" stroke={K} strokeWidth={8} strokeLinejoin="round" />
          <path d="M-40 -160 C-10 -178 80 -178 110 -160 L160 -100 L-90 -100 Z" fill="#bfe9ff" stroke={K} strokeWidth={6} />
          {blink ? <><path d="M-10 -130 h36" stroke={K} strokeWidth={7} /><path d="M60 -130 h36" stroke={K} strokeWidth={7} /></> : <>
            <ellipse cx={8} cy={-132} rx={18} ry={22} fill="#fff" stroke={K} strokeWidth={5} /><circle cx={12} cy={-128} r={9} fill={K} /><circle cx={15} cy={-133} r={3} fill="#fff" />
            <ellipse cx={78} cy={-132} rx={18} ry={22} fill="#fff" stroke={K} strokeWidth={5} /><circle cx={82} cy={-128} r={9} fill={K} /><circle cx={85} cy={-133} r={3} fill="#fff" /></>}
          <path d="M150 -40 Q190 -10 230 -40" fill="none" stroke={K} strokeWidth={7} strokeLinecap="round" />
          <circle cx={235} cy={-62} r={12} fill="#ffd34d" stroke={K} strokeWidth={5} />
          {[-150, 150].map((x) => <g key={x} transform={`translate(${x} 22) rotate(${f * 14})`}><circle r={52} fill="#2b2b33" stroke={K} strokeWidth={7} /><circle r={18} fill="#ffd34d" stroke={K} strokeWidth={5} /><path d="M0 -40 V-22" stroke="#ffd34d" strokeWidth={6} /></g>)}
        </g>
      </svg>
      <div style={{ position: "absolute", left: "50%", top: 250, transform: `translateX(-50%) rotate(${Math.sin(f / 12) * 2.5}deg) scale(${card})`, background: "#ff7eb6", border: `6px solid ${K}`, borderRadius: 999, padding: "18px 44px", fontFamily: "Fredoka", fontWeight: 700, fontSize: 52, color: K, whiteSpace: "nowrap" }}>Tepetaklak Rampa</div>
      <div style={{ position: "absolute", left: 120, top: 980, transformOrigin: "30% 100%", transform: `scale(${bub})`, background: "#fff", border: `6px solid ${K}`, borderRadius: 40, padding: "26px 36px", fontFamily: "Fredoka", fontWeight: 700, fontSize: 58, color: K, lineHeight: 1.1 }}>
        Hey Tepetaklak!<br />Hadi binin!
        <div style={{ position: "absolute", left: 120, bottom: -40, width: 0, height: 0, borderLeft: "26px solid transparent", borderRight: "26px solid transparent", borderTop: `40px solid ${K}` }} />
      </div>
      <div style={{ position: "absolute", left: 90, right: 90, top: 420, textAlign: "center", fontFamily: "Fredoka", fontWeight: 700, fontSize: 64, color: "#fff", WebkitTextStroke: `3px ${K}`, paintOrder: "stroke", opacity: cta, transform: `translateY(${(1 - cta) * 40}px)` }}>
        Ücretsiz · tarayıcıda oyna
      </div>
    </AbsoluteFill>
  );
};

const INTRO = 180, STAT = 120, OUTRO = 165;
export const REELS_LEN = INTRO + FEATS.length * FD + STAT + FEATS2.length * FD + OUTRO;

export const TanitimReels: React.FC = () => {
  useReelFonts();
  const a = INTRO, b = a + FEATS.length * FD, c = b + STAT, d = c + FEATS2.length * FD;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Sequence durationInFrames={INTRO}><Intro /></Sequence>
      {FEATS.map((ft, i) => <Sequence key={ft.dir} from={a + i * FD} durationInFrames={FD}><Feature ft={ft} /></Sequence>)}
      <Sequence from={b} durationInFrames={STAT}><Stats /></Sequence>
      {FEATS2.map((ft, i) => <Sequence key={ft.dir} from={c + i * FD} durationInFrames={FD}><Feature ft={ft} /></Sequence>)}
      <Sequence from={d} durationInFrames={OUTRO}><Outro /></Sequence>
    </AbsoluteFill>
  );
};
