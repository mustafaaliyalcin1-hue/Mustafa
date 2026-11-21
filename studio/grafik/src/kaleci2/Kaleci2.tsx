import React from "react";
import { AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { Altyazi, FONTLAR, giris, Kelime } from "../eldiven/Eldiven";
import { Saha, Direkler, Kaleci, Top, Poz, BEKLE, karis, ZEMIN } from "../kaleci/Kaleci";

type Sahne = { ad: string; a: number; konusma: number; b: number };
export type Plan2 = { sure: number; sahneler: Record<string, Sahne>; kelimeler: Kelime[]; siklar: { harf: string; yazi: string; ikon: string }[] };
const UNB = "Unbounded", MONT = "Mont";
const useT = () => { const f = useCurrentFrame(); const { fps } = useVideoConfig(); return { t: f / fps, fps }; };
const ara = (t: number, a: number, b: number, x = 0, y = 1, e = Easing.inOut(Easing.cubic)) =>
  interpolate(t, [a, b], [x, y], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const SIK_RENK = ["#00D4FF", "#FFD60A", "#FF4FA3"];

/* ---------- oyuncu figürü (takım arkadaşı / rakip / hakem) ---------- */
const Oyuncu: React.FC<{ x: number; y: number; s: number; renk: string; no?: number | string; yuz: "saskin" | "kizgin" | "normal" | "kos";
  kol?: number; adim?: number; hakem?: boolean }> = ({ x, y, s, renk, no, yuz, kol = 20, adim = 0, hakem }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <ellipse cx={0} cy={6} rx={60} ry={12} fill="rgba(0,0,0,0.25)" />
    {[-1, 1].map((k) => <g key={k} transform={`translate(${k * 24},-95) rotate(${k * 6 + adim * k * 22})`}>
      <rect x={-14} y={0} width={28} height={92} rx={13} fill={hakem ? "#111" : "#f4f4f4"} /><rect x={-18} y={82} width={40} height={18} rx={9} fill="#111" /></g>)}
    <rect x={-58} y={-245} width={116} height={150} rx={38} fill={renk} stroke="#111" strokeWidth={5} />
    {hakem && [0, 1, 2].map((i) => <rect key={i} x={-58} y={-225 + i * 44} width={116} height={18} fill="#ffd60a" opacity={0.9} />)}
    {no !== undefined && <text x={0} y={-150} textAnchor="middle" fontFamily={UNB} fontWeight={900} fontSize={56} fill="#fff" stroke="#111" strokeWidth={2}>{no}</text>}
    {[-1, 1].map((k) => <g key={k} transform={`translate(${k * 54},-225) rotate(${k * (kol - adim * 25)})`}>
      <rect x={-12} y={0} width={24} height={100} rx={12} fill={renk} stroke="#111" strokeWidth={4} /><circle cx={0} cy={104} r={17} fill="#e9b48f" stroke="#111" strokeWidth={4} /></g>)}
    <circle cx={0} cy={-292} r={48} fill="#e9b48f" stroke="#111" strokeWidth={5} />
    <path d="M -46 -305 Q 0 -360 46 -305 Q 0 -325 -46 -305 Z" fill={hakem ? "#222" : "#5a3a22"} />
    {yuz === "kizgin" ? (<g><path d="M -28 -312 l 20 10 M 28 -312 l -20 10" stroke="#111" strokeWidth={7} strokeLinecap="round" />
      <circle cx={-15} cy={-294} r={6} fill="#111" /><circle cx={15} cy={-294} r={6} fill="#111" /><ellipse cx={0} cy={-266} rx={14} ry={10} fill="#7a1010" stroke="#111" strokeWidth={4} /></g>)
      : yuz === "saskin" ? (<g><circle cx={-15} cy={-296} r={8} fill="#111" /><circle cx={15} cy={-296} r={8} fill="#111" /><ellipse cx={0} cy={-264} rx={10} ry={13} fill="#111" /></g>)
        : (<g><circle cx={-15} cy={-294} r={6} fill="#111" /><circle cx={15} cy={-294} r={6} fill="#111" />
          <path d="M -15 -270 q 15 10 30 0" stroke="#111" strokeWidth={5} fill="none" strokeLinecap="round" /></g>)}
    {hakem && <g transform="translate(36,-262)"><rect x={0} y={-8} width={34} height={18} rx={8} fill="#c9c9c9" stroke="#111" strokeWidth={3} /><circle cx={34} cy={1} r={9} fill="#c9c9c9" stroke="#111" strokeWidth={3} /></g>}
  </g>
);

/* ---------- sahne 0: oylama sonucu (C önde) ---------- */
const Anket: React.FC<{ a: number; b: number }> = ({ a, b }) => {
  const { t, fps } = useT();
  const oranlar = [0.32, 0.41, 1];  // görsel: C açık ara önde (gerçek oy sayısı gösterilmez)
  const etiket = ["“Daha ne yapayım?”", "“Abartmayın”", "Kavgaya girmek"];
  return (<AbsoluteFill style={{ background: "radial-gradient(circle at 50% 30%, #23305e, #0a0f24 70%)", opacity: ara(t, b - 0.3, b, 1, 0) }}>
    <div style={{ position: "absolute", top: 290, left: 60, right: 60, textAlign: "center", opacity: giris(t, a, fps, 9) }}>
      <div style={{ fontFamily: MONT, fontWeight: 900, fontSize: 40, color: "#ffd60a", letterSpacing: 6 }}>BÖLÜM 2</div>
      <div style={{ fontFamily: UNB, fontWeight: 900, fontSize: 78, color: "#fff", lineHeight: 1.05, marginTop: 10 }}>GEÇEN BÖLÜMÜN<br />SONUCU</div>
    </div>
    <div style={{ position: "absolute", top: 640, left: 70, right: 70 }}>
      {oranlar.map((o, i) => {
        const g = ara(t, a + 0.5 + i * 0.25, a + 1.6 + i * 0.25, 0, 1, Easing.out(Easing.cubic));
        const kazanan = i === 2 && t > a + 1.9;
        return (<div key={i} style={{ marginBottom: 34 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ width: 84, height: 84, borderRadius: 42, background: SIK_RENK[i], display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: UNB, fontWeight: 900, fontSize: 46, color: "#111", flex: "none", transform: `scale(${kazanan ? 1 + 0.08 * Math.sin(t * 8) : 1})` }}>{"ABC"[i]}</div>
            <div style={{ flex: 1, height: 84, borderRadius: 24, background: "rgba(255,255,255,0.1)", overflow: "hidden", position: "relative" }}>
              <div style={{ width: `${o * g * 100}%`, height: "100%", background: SIK_RENK[i], borderRadius: 24, boxShadow: kazanan ? `0 0 40px ${SIK_RENK[i]}` : "none" }} />
              <div style={{ position: "absolute", left: 22, top: 18, fontFamily: MONT, fontWeight: 900, fontSize: 36, color: "#fff",
                textShadow: "0 2px 0 #111, 0 0 8px rgba(0,0,0,0.8)" }}>{etiket[i]}</div>
            </div>
          </div>
        </div>);
      })}
      {t > a + 1.9 && (<div style={{ textAlign: "center", marginTop: 20, transform: `scale(${giris(t, a + 1.9, fps, 8)}) rotate(-3deg)` }}>
        <span style={{ background: "#ff4fa3", color: "#111", borderRadius: 999, padding: "16px 34px", fontFamily: UNB, fontWeight: 900, fontSize: 48 }}>👑 EN ÇOK C SEÇİLDİ!</span></div>)}
    </div>
  </AbsoluteFill>);
};

/* ---------- toz bulutu (çizgi film kavgası; kimse yaralanmaz) ---------- */
const TozBulutu: React.FC<{ a: number; b: number }> = ({ a, b }) => {
  const { t, fps } = useT();
  const g = giris(t, a, fps, 10), c = ara(t, b - 0.4, b, 1, 0);
  const kelimeler = [{ k: "PAT!", x: 250, y: 1080, r: "#ffd60a" }, { k: "KÜT!", x: 790, y: 1150, r: "#00D4FF" }, { k: "BAM!", x: 540, y: 960, r: "#ff4fa3" },
    { k: "TOZ!", x: 300, y: 1560, r: "#9BFF3A" }, { k: "ÇAT!", x: 820, y: 1520, r: "#ff8a1f" }];
  return (<AbsoluteFill style={{ opacity: c }}>
    <svg width={1080} height={1920} style={{ position: "absolute" }}>
      <g transform={`translate(540,1320) scale(${g * (1 + 0.04 * Math.sin(t * 9))}) rotate(${Math.sin(t * 5) * 4})`}>
        {Array.from({ length: 14 }).map((_, i) => {
          const an = i / 14 * Math.PI * 2 + t * 1.5, rr = 230 + 40 * Math.sin(t * 7 + i);
          return <circle key={i} cx={Math.cos(an) * rr} cy={Math.sin(an) * rr * 0.7} r={150 + 20 * Math.sin(t * 6 + i * 2)} fill={i % 2 ? "#e9dcc6" : "#d8c9ae"} stroke="#111" strokeWidth={6} />;
        })}
        <circle r={260} fill="#efe3cf" />
        {/* bulutun içinden çıkan kol ve bacaklar */}
        {Array.from({ length: 6 }).map((_, i) => {
          const an = i / 6 * Math.PI * 2 + t * 3.2;
          return <g key={i} transform={`rotate(${an * 57.3}) translate(300,0) rotate(${Math.sin(t * 20 + i) * 20})`}>
            <rect x={-10} y={-16} width={90} height={32} rx={16} fill={i % 3 === 0 ? "#ff8a1f" : "#2f6bff"} stroke="#111" strokeWidth={5} />
            <circle cx={90} cy={0} r={22} fill={i % 2 ? "#f4f4f4" : "#e9b48f"} stroke="#111" strokeWidth={5} /></g>;
        })}
        {/* yıldızlar */}
        {Array.from({ length: 7 }).map((_, i) => {
          const an = i / 7 * Math.PI * 2 - t * 4;
          return <polygon key={i} transform={`translate(${Math.cos(an) * 180},${Math.sin(an) * 120 - 40}) rotate(${t * 300})`}
            points="0,-26 7,-8 26,-8 11,4 17,24 0,12 -17,24 -11,4 -26,-8 -7,-8" fill="#ffd60a" stroke="#111" strokeWidth={3} />;
        })}
      </g>
    </svg>
    {kelimeler.map((k, i) => {
      const t0 = a + 0.35 + i * 0.55; if (t < t0) return null;
      const kg = giris(t, t0, fps, 7);
      return <div key={i} style={{ position: "absolute", left: k.x - 170, top: k.y - 90, width: 340, textAlign: "center",
        transform: `scale(${kg * (1 + 0.05 * Math.sin(t * 15 + i))}) rotate(${(i % 2 ? 1 : -1) * 12}deg)`, opacity: ara(t, t0 + 1.4, t0 + 1.8, 1, 0) }}>
        <svg width={340} height={180} style={{ position: "absolute", left: 0, top: 0 }}>
          <polygon points={Array.from({ length: 16 }).map((_, j) => { const an = j / 16 * Math.PI * 2, rr = j % 2 ? 70 : 100; return `${170 + Math.cos(an) * rr * 1.6},${90 + Math.sin(an) * rr * 0.85}`; }).join(" ")}
            fill={k.r} stroke="#111" strokeWidth={6} /></svg>
        <div style={{ position: "relative", top: 42, fontFamily: UNB, fontWeight: 900, fontSize: 76, color: "#111" }}>{k.k}</div>
      </div>;
    })}
  </AbsoluteFill>);
};

/* ---------- çalı topu (boş kale) ---------- */
const CaliTopu: React.FC<{ t: number; a: number }> = ({ t, a }) => {
  const k = ara(t, a, a + 3.2, 0, 1, Easing.linear);
  const x = lerp(-120, 1200, k), y = ZEMIN - 50 - Math.abs(Math.sin(k * 14)) * 60;
  return (<g transform={`translate(${x},${y}) rotate(${k * 1400})`}>
    {Array.from({ length: 9 }).map((_, i) => <ellipse key={i} rx={50} ry={20} transform={`rotate(${i * 20})`} fill="none" stroke="#a07a44" strokeWidth={5} />)}
  </g>);
};

/* ---------- ana sahne akışı ---------- */
const Saha2: React.FC<{ p: Plan2 }> = ({ p }) => {
  const { t, fps } = useT();
  const S = p.sahneler;
  // kaleci pozu
  let poz: Poz = BEKLE(t);
  let kOlcek = 0.95;
  const el = S.eldiven, yu = S.yuru, hk = S.hakem, kr = S.kart, bs = S.bos;
  if (t >= el.a) poz = karis(poz, { ...poz, kolSol: 150, kolSag: 150, yuz: "kizgin" }, ara(t, el.a + 0.2, el.a + 0.6));
  if (t >= yu.a && t < S.toz.a) {  // takım arkadaşlarına yürüyüş (kameraya doğru)
    const k = ara(t, yu.a, yu.b, 0, 1, Easing.inOut(Easing.quad));
    poz = { ...poz, x: 540, y: lerp(ZEMIN + 6, 1520, k) + Math.abs(Math.sin(t * 9)) * -14, kolSol: 40 + Math.sin(t * 9) * 25, kolSag: 40 - Math.sin(t * 9) * 25,
      bacak: 10 + Math.sin(t * 9) * 14, yuz: "kizgin" };
    kOlcek = lerp(0.95, 1.25, k);
  }
  const tozda = t >= S.toz.a && t < hk.a + 0.5;
  if (t >= hk.a) { poz = { x: 400, y: 1520, don: 0, kolSol: 30, kolSag: 30, bacak: 8, comel: 0, yuz: "saskin" }; kOlcek = 1.25; }
  if (t >= bs.a) {  // oyundan atıldı: üzgün, sola yürüyüp çıkar
    const k = ara(t, bs.a, bs.a + 2.4, 0, 1, Easing.inOut(Easing.quad));
    poz = { x: lerp(400, -260, k), y: 1520 + Math.abs(Math.sin(t * 6)) * -8, don: -4, kolSol: 8, kolSag: 8, bacak: Math.sin(t * 6) * 10, comel: 0.1, yuz: "uzgun" };
  }
  // uçan eldivenler
  const eld = t >= el.a + 0.3 && t < el.b + 0.8;
  const ek = ara(t, el.a + 0.3, el.a + 1.4, 0, 1, Easing.out(Easing.quad));
  // takım arkadaşları (yürüyüş + toz + hakem anında)
  const takimGor = t >= yu.a && t < bs.a + 0.6;
  const tg = giris(t, yu.a + 0.3, fps, 10);
  // hakem
  const hakemGor = t >= hk.a - 0.2 && t < S.hucum.a;
  const hx = lerp(1300, 760, ara(t, hk.a - 0.2, hk.a + 0.5, 0, 1, Easing.out(Easing.quad)));
  const kartKalk = ara(t, kr.a, kr.a + 0.3, 0, 1, Easing.out(Easing.back(1.6)));
  // rakip hücumu
  const huc = S.hucum, hk2 = ara(t, huc.a, huc.b + 0.6, 0, 1, Easing.linear);
  const zoomBos = t >= bs.a ? 1 + 0.12 * ara(t, bs.a + 1.0, bs.b, 0, 1) : 1;
  const sars = tozda ? Math.sin(t * 50) * 7 : t > kr.a && t < kr.a + 0.4 ? Math.sin(t * 70) * 10 : 0;
  return (<AbsoluteFill style={{ transform: `translateX(${sars}px) scale(${zoomBos})`, transformOrigin: "50% 40%" }}>
    <Saha t={t} />
    <svg width={1080} height={1920} style={{ position: "absolute" }}>
      {t >= bs.a + 0.6 && t < huc.a + 1 && <CaliTopu t={t} a={bs.a + 0.6} />}
      {t >= huc.a && [0, 1].map((i) => {  // rakipler kaleye doğru (uzaklaştıkça küçülür)
        const k = Math.min(1, hk2 * (1.05 - i * 0.12));
        const x = lerp(i ? 760 : 340, i ? 620 : 470, k), y = lerp(1900, ZEMIN + 120, k), s = lerp(1.5, 0.75, k);
        return <g key={i}><Oyuncu x={x} y={y} s={s} renk="#e0262f" no={i ? 9 : 11} yuz="kizgin" adim={Math.sin(t * 12 + i * 2)} kol={30} />
          {i === 0 && <Top x={x + 70 * s} y={y - 10} r={34 * s} don={t * 500} />}</g>;
      })}
    </svg>
    <Direkler />
    <svg width={1080} height={1920} style={{ position: "absolute" }}>
      {!tozda && t < bs.a + 2.6 && <Kaleci p={poz} olcek={kOlcek} />}
      {eld && [-1, 1].map((k) => <g key={k} transform={`translate(${540 + k * (60 + ek * 330)},${lerp(760, 380, ek) + ek * ek * 520}) rotate(${ek * 720 * k})`}>
        <circle r={30} fill="#fff" stroke="#111" strokeWidth={5} /><rect x={-8} y={-44} width={16} height={22} rx={6} fill="#fff" stroke="#111" strokeWidth={4} /></g>)}
      {takimGor && !tozda && [{ x: 170, no: 7 }, { x: 910, no: 10 }, { x: 640, no: 4 }].map((o, i) => (
        <g key={i} transform={`translate(${(1 - tg) * (o.x < 540 ? -400 : 400)},0)`}>
          <Oyuncu x={t >= hk.a ? [180, 900, 640][i] : o.x} y={1880} s={1.3} renk="#2f6bff" no={o.no} yuz={t >= hk.a ? "saskin" : "saskin"} kol={t >= hk.a ? 15 : 60} /></g>))}
      {hakemGor && <g>
        <Oyuncu x={hx} y={1720} s={1.25} renk="#222" yuz={t >= kr.a ? "kizgin" : "normal"} hakem kol={t >= kr.a ? -150 * kartKalk + 20 : 25}
          adim={t < hk.a + 0.5 ? Math.sin(t * 14) : 0} />
        {t >= hk.a && t < kr.a && <text x={hx + 80} y={1380} fontFamily={UNB} fontWeight={900} fontSize={70} fill="#fff" stroke="#111" strokeWidth={8}
          paintOrder="stroke" transform={`rotate(-10 ${hx + 80} 1380)`} opacity={0.6 + 0.4 * Math.sin(t * 30)}>DÜÜÜT!</text>}
      </g>}
    </svg>
    {tozda && <TozBulutu a={S.toz.a} b={hk.a + 0.5} />}
    {/* dev kırmızı kart */}
    {t >= kr.a && t < bs.a + 0.3 && (<AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: ara(t, bs.a, bs.a + 0.3, 1, 0) }}>
      <AbsoluteFill style={{ background: "#ff1f2d", opacity: ara(t, kr.a + 0.3, kr.a + 0.6, 0.5, 0) }} />
      <div style={{ width: 380, height: 540, borderRadius: 30, background: "linear-gradient(160deg, #ff3b47, #c40d1a)", border: "8px solid #111",
        boxShadow: "0 30px 60px rgba(0,0,0,0.5)", transform: `translateY(${(1 - kartKalk) * 900}px) rotate(${-10 + 8 * kartKalk + Math.sin(t * 3) * 2}deg)` }} />
      <div style={{ position: "absolute", top: 290, fontFamily: UNB, fontWeight: 900, fontSize: 92, color: "#fff", WebkitTextStroke: "6px #111",
        paintOrder: "stroke fill", transform: `scale(${giris(t, kr.a + 0.35, fps, 8)})` }}>KIRMIZI KART!</div>
    </AbsoluteFill>)}
    {/* boş kale yazısı */}
    {t >= bs.a + 1.2 && t < huc.a + 0.2 && (<div style={{ position: "absolute", top: 420, left: 0, right: 0, textAlign: "center" }}>
      <span style={{ display: "inline-block", fontFamily: UNB, fontWeight: 900, fontSize: 84, color: "#ffd60a", WebkitTextStroke: "6px #111", paintOrder: "stroke fill",
        transform: `scale(${giris(t, bs.a + 1.2, fps, 9)}) rotate(-4deg)` }}>KALE BOMBOŞ!</span></div>)}
    {t >= huc.a && t < S.soru.a + 0.2 && (<div style={{ position: "absolute", top: 380, left: 0, right: 0, textAlign: "center" }}>
      <span style={{ display: "inline-block", background: "#e0262f", color: "#fff", borderRadius: 24, padding: "12px 34px", fontFamily: UNB, fontWeight: 900,
        fontSize: 72, transform: `scale(${giris(t, huc.a + 0.2, fps, 8)}) skewX(-10deg)`, border: "6px solid #111" }}>⚡ HÜCUM!</span></div>)}
  </AbsoluteFill>);
};

/* ---------- soru + şıklar + kapanış ---------- */
const SoruSiklar: React.FC<{ p: Plan2 }> = ({ p }) => {
  const { t, fps } = useT();
  const S = p.sahneler;
  if (t < S.soru.a) return null;
  const arka = ara(t, S.soru.a, S.soru.a + 0.3);
  const harfler = ["A", "B", "C"];
  return (<AbsoluteFill style={{ background: `rgba(6,10,26,${0.78 * arka})` }}>
    <div style={{ position: "absolute", top: 270, left: 60, right: 60, textAlign: "center", transform: `scale(${giris(t, S.soru.a, fps, 10)})` }}>
      <div style={{ fontFamily: UNB, fontWeight: 900, fontSize: 150, color: "#ffd60a", lineHeight: 1, textShadow: "0 10px 0 #b38f00",
        transform: `translateY(${Math.sin(t * 6) * 8}px) rotate(${Math.sin(t * 3) * 6}deg)` }}>?</div>
      <div style={{ fontFamily: UNB, fontWeight: 900, fontSize: 70, color: "#fff", lineHeight: 1.08 }}>PEKİ ŞİMDİ<br />NE OLMALI?</div>
    </div>
    <div style={{ position: "absolute", top: 760, left: 50, right: 50 }}>
      {p.siklar.map((s, i) => {
        const ts = S[harfler[i]].a; if (t < ts) return null;
        const g = giris(t, ts, fps, 9);
        const aktif = t < S[harfler[i]].b && t >= ts;
        return (<div key={i} style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 20, padding: "18px 22px", borderRadius: 28,
          background: aktif ? "#fff" : "rgba(255,255,255,0.12)", border: `5px solid ${SIK_RENK[i]}`, transform: `translateX(${(1 - g) * (i % 2 ? 600 : -600)}px) scale(${aktif ? 1.03 : 1})`,
          boxShadow: aktif ? `0 14px 40px ${SIK_RENK[i]}66` : "none" }}>
          <div style={{ flex: "none", width: 82, height: 82, borderRadius: 41, background: SIK_RENK[i], display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: UNB, fontWeight: 900, fontSize: 46, color: "#111" }}>{s.harf}</div>
          <div style={{ flex: 1, fontFamily: MONT, fontWeight: 900, fontSize: 40, lineHeight: 1.15, color: aktif ? "#111" : "#fff" }}>{s.yazi}</div>
          <div style={{ fontSize: 60, transform: `rotate(${aktif ? Math.sin(t * 8) * 12 : 0}deg)` }}>{s.ikon}</div>
        </div>);
      })}
      {t >= S.son.a && (<div style={{ textAlign: "center", marginTop: 14, transform: `scale(${giris(t, S.son.a, fps, 9)})` }}>
        <span style={{ display: "inline-block", background: "#9BFF3A", color: "#111", borderRadius: 999, padding: "18px 36px", fontFamily: UNB, fontWeight: 900, fontSize: 44 }}>
          Cevabını yorumlara yaz! 👇</span>
        <div style={{ fontFamily: MONT, fontWeight: 900, fontSize: 34, color: "#ffd60a", marginTop: 16, letterSpacing: 3 }}>BÖLÜM 3 YAKINDA</div></div>)}
    </div>
  </AbsoluteFill>);
};

export const Kaleci2: React.FC<{ plan: Plan2 }> = ({ plan }) => {
  const { t } = useT();
  const S = plan.sahneler;
  const acil = ara(t, S.eldiven.a - 0.35, S.eldiven.a + 0.1, 0, 1, Easing.inOut(Easing.cubic));  // anketten sahaya daire geçişi
  return (<AbsoluteFill style={{ background: "#0a0f24" }}>
    <style>{FONTLAR}</style>
    <Audio src={staticFile("kaleci2/anlatim_mix.wav")} />
    {t < S.eldiven.a + 0.1 && <Anket a={S.anket.a} b={S.eldiven.a + 0.1} />}
    {t >= S.eldiven.a - 0.35 && (<AbsoluteFill style={{ clipPath: `circle(${1300 * acil}px at 540px 900px)` }}><Saha2 p={plan} /></AbsoluteFill>)}
    <SoruSiklar p={plan} />
    <Altyazi k={plan.kelimeler.filter((w) => w.a < S.soru.a)} altY={1440} />
  </AbsoluteFill>);
};
