import React from "react";
import { AbsoluteFill, Sequence, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { useFonts, Clip, FlipLetters, Place, Out } from "./Fragman";
import { End } from "./Tanitim";

// Haberler uygulaması videosu: oyunda olan kaza, ifade ve çatışmalar haber olur; araba ekranında ve telefonda okunur.
// Kareler oyunun içinden çekildi (public/guncelleme14/<sahne>/0000.jpg ...). Müzik render sonrası ffmpeg ile eklenir.
type Seg = { shot: string; dur: number; titles: [number, string][] };
const SEG: Seg[] = [
  { shot: "kaza", dur: 60, titles: [[0, "Şehirde bir kaza oldu"]] },
  { shot: "arabaekrani", dur: 80, titles: [[0, "Araba ekranında: Haberler"]] },
  { shot: "telefon", dur: 70, titles: [[0, "Telefonda da: kaza, ifade, tutuklama, çatışma"]] },
];
export const G14_LEN = SEG.reduce((a, s) => a + s.dur, 0) + 90;

const Title: React.FC<{ text: string }> = ({ text }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const s = spring({ frame: f - 2, fps, config: { damping: 13 } });
  return <div style={{ position: "absolute", left: 40, bottom: 60, fontFamily: "BebasNeue", fontSize: 70, color: "#fff", background: "rgba(10,12,16,.72)", padding: "4px 22px", transform: `translateY(${(1 - s) * 200}px)` }}>{text}</div>;
};

export const Guncelleme14: React.FC = () => {
  useFonts();
  let at = 0;
  const parts = SEG.map((s) => { const from = at; at += s.dur; return { ...s, from }; });
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {parts.map((p) => (<Sequence key={p.shot} from={p.from} durationInFrames={p.dur}><Clip dir="guncelleme14" shot={p.shot} count={p.dur} punch={p.from > 0} /></Sequence>))}
      <Sequence from={0} durationInFrames={40}><Out dur={40}><Place at="center"><FlipLetters text="SON DAKİKA" font="Monoton" size={96} color="#e3263b" /></Place></Out></Sequence>
      {parts.flatMap((p) => p.titles.map(([t, text], k) => {
        const next = p.titles[k + 1] ? p.titles[k + 1][0] : p.dur;
        const from = p.from + t + (p.from === 0 && t === 0 ? 40 : 0), dur = p.from + next - from;
        return dur > 0 ? <Sequence key={p.shot + k} from={from} durationInFrames={dur}><Out dur={dur}><Title text={text} /></Out></Sequence> : null;
      }))}
      <Sequence from={at} durationInFrames={90}><Clip dir="guncelleme14" shot="arabaekrani" start={50} count={80} punch={false} blur={7} /><End /></Sequence>
    </AbsoluteFill>
  );
};
