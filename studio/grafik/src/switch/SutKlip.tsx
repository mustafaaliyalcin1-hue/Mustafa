import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { Saha, Direkler, Top } from "../kaleci/Kaleci";

/** Switch edit demosu için parametreli şut klibi: oyuncu ARKADAN görünür, koşar, vurur (VURUS sn), top köşeye gider.
 *  Bütün kliplerde vuruş anı aynı (VURUS) — switch_edit.py bu anları beat'e oturtur. */
export const VURUS = 1.2;
export type SutProps = { govde: string; serit?: string; sort: string; no: number; isim: string; tarafa: "sol" | "sag"; zoom: number; ton: string };
const ara = (t: number, a: number, b: number, x = 0, y = 1, e = Easing.inOut(Easing.cubic)) =>
  interpolate(t, [a, b], [x, y], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });

const ArkaOyuncu: React.FC<{ p: SutProps; t: number }> = ({ p, t }) => {
  const kos = ara(t, 0, VURUS - 0.15, 0, 1, Easing.out(Easing.quad));        // topa koşu
  const salla = ara(t, VURUS - 0.35, VURUS, 0, 1, Easing.in(Easing.quad));    // geri çekiş → vuruş
  const takip = ara(t, VURUS, VURUS + 0.35, 0, 1, Easing.out(Easing.quad));   // vuruş sonrası takip
  const sevin = ara(t, VURUS + 0.6, VURUS + 1.0);
  const adim = t < VURUS - 0.35 ? Math.sin(t * 16) : 0;
  const ayakAci = -45 * salla * (1 - takip) + 95 * takip * (1 - sevin * 0.7);  // sağ bacak: geri → ileri
  const govdeEgim = 8 * salla - 14 * takip * (1 - sevin);
  const x = 540 + (1 - kos) * 140, y = 1850 - kos * 260;
  const s = 1.55 - kos * 0.25;
  const bacak = (k: number, aci: number) => (
    <g transform={`translate(${k * 26},-100) rotate(${aci})`}>
      <rect x={-17} y={0} width={34} height={104} rx={15} fill={p.sort} stroke="#111" strokeWidth={4} />
      <rect x={-16} y={60} width={32} height={40} rx={12} fill={p.govde} opacity={0.85} />
      <rect x={-22} y={92} width={46} height={22} rx={10} fill="#111" />
    </g>);
  return (
    <g transform={`translate(${x},${y}) scale(${s}) rotate(${govdeEgim})`}>
      <ellipse cx={0} cy={14} rx={70} ry={14} fill="rgba(0,0,0,0.3)" />
      {bacak(-1, 8 + adim * 24)}
      {bacak(1, ayakAci - adim * 24)}
      <rect x={-64} y={-262} width={128} height={168} rx={40} fill={p.govde} stroke="#111" strokeWidth={5} />
      {p.serit && [0, 1, 2].map((i) => <rect key={i} x={-40 + i * 32} y={-262} width={14} height={168} fill={p.serit} />)}
      <text x={0} y={-214} textAnchor="middle" fontFamily="Mont" fontWeight={900} fontSize={30} fill="#fff" stroke="#111" strokeWidth={1.5}>{p.isim}</text>
      <text x={0} y={-130} textAnchor="middle" fontFamily="Unbounded" fontWeight={900} fontSize={84} fill="#fff" stroke="#111" strokeWidth={3}>{p.no}</text>
      {[-1, 1].map((k) => <g key={k} transform={`translate(${k * 60},-245) rotate(${-k * (18 + 40 * salla + 130 * sevin) + adim * 20})`}>
        <rect x={-13} y={0} width={26} height={108} rx={13} fill={p.govde} stroke="#111" strokeWidth={4} />
        <circle cx={0} cy={112} r={18} fill={p.ton} stroke="#111" strokeWidth={4} /></g>)}
      <circle cx={0} cy={-305} r={50} fill={p.ton} stroke="#111" strokeWidth={5} />
      {/* arkadan: saç başın neredeyse tamamını örter, altta ense ve kulaklar */}
      <path d="M -50 -296 Q -56 -362 0 -360 Q 56 -362 50 -296 Q 44 -266 0 -268 Q -44 -266 -50 -296 Z" fill="#3a2414" stroke="#111" strokeWidth={4} />
      <ellipse cx={-50} cy={-300} rx={8} ry={14} fill={p.ton} stroke="#111" strokeWidth={3} />
      <ellipse cx={50} cy={-300} rx={8} ry={14} fill={p.ton} stroke="#111" strokeWidth={3} />
    </g>);
};

export const SutKlip: React.FC<SutProps> = (p) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const t = f / fps;
  const k = ara(t, VURUS, VURUS + 0.55, 0, 1, Easing.out(Easing.quad));
  const hedefX = p.tarafa === "sol" ? 300 : 780, hedefY = 650;
  const bx = 540 + (hedefX - 540) * k, by = 1600 + (hedefY - 1600) * k - Math.sin(k * Math.PI) * 180;
  const iz = t > VURUS && t < VURUS + 0.6 ? [1, 2, 3, 4, 5].map((j) => {
    const kk = Math.max(0, k - j * 0.07);
    return { x: 540 + (hedefX - 540) * kk, y: 1600 + (hedefY - 1600) * kk - Math.sin(kk * Math.PI) * 180, r: 46 - 26 * kk, o: 0.3 - j * 0.05 };
  }) : [];
  const file = t > VURUS + 0.55 ? Math.max(0, 1 - (t - VURUS - 0.55) / 0.6) : 0;
  return (
    <AbsoluteFill style={{ background: "#000", transform: `scale(${p.zoom})`, transformOrigin: "50% 62%" }}>
      <Saha t={t} />
      <AbsoluteFill style={{ background: p.tarafa === "sol" ? "rgba(255,120,40,0.10)" : "rgba(40,120,255,0.10)", mixBlendMode: "overlay" }} />
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        {file > 0 && <ellipse cx={hedefX} cy={hedefY + 30} rx={90 * file + 20} ry={60 * file + 10} fill="rgba(255,255,255,0.35)" />}
      </svg>
      <Direkler />
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        {iz.map((z, i) => <circle key={i} cx={z.x} cy={z.y} r={z.r} fill="#fff" opacity={z.o} />)}
        {t < VURUS && <Top x={540} y={1600} r={46} don={0} />}
        <ArkaOyuncu p={p} t={t} />
        {t >= VURUS && <Top x={bx} y={by} r={46 - 26 * k} don={t * 1400} />}
      </svg>
    </AbsoluteFill>
  );
};
