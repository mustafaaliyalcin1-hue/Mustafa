import React from "react";
import { AbsoluteFill, Sequence, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { useFonts, Clip, FlipLetters, Place, Out } from "./Fragman";
import { End } from "./Tanitim";

// Restoran içi ve yemek, açlık/can barı, giyim mağazası + baskılı tişört, berber, hastalık + serum.
// Kareler oyunun içinden çekildi (public/guncelleme17/<sahne>/0000.jpg ...). Müzik render sonrası ffmpeg ile eklenir.
type Seg = { shot: string; dur: number; titles: [number, string][] };
const SEG: Seg[] = [
  { shot: "hud", dur: 45, titles: [[0, "Sol üstte can ve açlık"]] },
  { shot: "restoran", dur: 60, titles: [[0, "Restoranların içine gir"]] },
  { shot: "menu", dur: 35, titles: [[0, "Kasadan sipariş ver"]] },
  { shot: "yemek", dur: 80, titles: [[0, "Ye, açlığın dolsun"]] },
  { shot: "giyim", dur: 110, titles: [[0, "Kıyafet mağazası"], [40, "Desenli tişörtler"], [80, "Fotoğrafını tişörte bas"]] },
  { shot: "berber", dur: 90, titles: [[0, "Berberde saç ve sakal"]] },
  { shot: "hasta", dur: 45, titles: [[0, "Arada hastalanırsın"]] },
  { shot: "serum", dur: 80, titles: [[0, "Hastanede serum ya da ilaç"], [45, "1 dakikada iyileş"]] },
];
export const G17_LEN = SEG.reduce((a, s) => a + s.dur, 0) + 90;

const Title: React.FC<{ text: string }> = ({ text }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const s = spring({ frame: f - 2, fps, config: { damping: 13 } });
  return <div style={{ position: "absolute", left: 40, top: 70, fontFamily: "BebasNeue", fontSize: 64, color: "#fff", background: "rgba(10,12,16,.8)", padding: "4px 22px", transform: `translateX(${(1 - s) * -700}px)` }}>{text}</div>;
};

export const Guncelleme17: React.FC = () => {
  useFonts();
  let at = 0;
  const parts = SEG.map((s) => { const from = at; at += s.dur; return { ...s, from }; });
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {parts.map((p) => (<Sequence key={p.shot} from={p.from} durationInFrames={p.dur}><Clip dir="guncelleme17" shot={p.shot} count={p.dur} punch={p.from > 0} /></Sequence>))}
      <Sequence from={0} durationInFrames={30}><Out dur={30}><Place at="center"><FlipLetters text="YENİ HAYAT" font="Monoton" size={84} color="#e3263b" /></Place></Out></Sequence>
      {parts.flatMap((p) => p.titles.map(([t, text], k) => {
        const next = p.titles[k + 1] ? p.titles[k + 1][0] : p.dur;
        const from = p.from + t + (p.from === 0 && t === 0 ? 30 : 0), dur = p.from + next - from;
        return dur > 0 ? <Sequence key={p.shot + k} from={from} durationInFrames={dur}><Out dur={dur}><Title text={text} /></Out></Sequence> : null;
      }))}
      <Sequence from={at} durationInFrames={90}><Clip dir="guncelleme17" shot="giyim" start={60} count={110} punch={false} blur={7} /><End /></Sequence>
    </AbsoluteFill>
  );
};
