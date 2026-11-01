import React from "react";
import { AbsoluteFill, Sequence, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { useFonts, Clip, FlipLetters, Place, Out } from "./Fragman";
import { End } from "./Tanitim";

// Meslekler ve NPC kazaları: 112 ekibi ol, ihbara git, yaralıyı kurtar; canlı yayın; sesli komutla ekranda şarkı.
// Kareler oyunun içinden çekildi (public/guncelleme16/<sahne>/0000.jpg ...). Müzik render sonrası ffmpeg ile eklenir.
type Seg = { shot: string; dur: number; titles: [number, string][] };
const SEG: Seg[] = [
  { shot: "meslek", dur: 70, titles: [[0, "Yeni: Meslek seç"], [40, "Polis ya da 112 sağlık ekibi"]] },
  { shot: "ihbar", dur: 60, titles: [[0, "Şehirde NPC'ler kaza yapar"]] },
  { shot: "git", dur: 90, titles: [[0, "İhbar gelir, Git'e bas"]] },
  { shot: "mudahale", dur: 110, titles: [[0, "Yaralıya müdahale et"], [60, "Hayat kurtar, ödülü al"]] },
  { shot: "canli", dur: 100, titles: [[0, "Haberlerde canlı yayın"], [50, "Mobese tam kazaya bakar"]] },
  { shot: "sesli", dur: 100, titles: [[0, "“Ekrandan şarkı aç” de"], [55, "Asistan arabanın ekranında açar"]] },
];export const G16_LEN = SEG.reduce((a, s) => a + s.dur, 0) + 90;

const Title: React.FC<{ text: string }> = ({ text }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const s = spring({ frame: f - 2, fps, config: { damping: 13 } });
  return <div style={{ position: "absolute", left: 40, top: 70, fontFamily: "BebasNeue", fontSize: 64, color: "#fff", background: "rgba(10,12,16,.8)", padding: "4px 22px", transform: `translateX(${(1 - s) * -700}px)` }}>{text}</div>;
};

export const Guncelleme16: React.FC = () => {
  useFonts();
  let at = 0;
  const parts = SEG.map((s) => { const from = at; at += s.dur; return { ...s, from }; });
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {parts.map((p) => (<Sequence key={p.shot} from={p.from} durationInFrames={p.dur}><Clip dir="guncelleme16" shot={p.shot} count={p.dur} punch={p.from > 0} /></Sequence>))}
      <Sequence from={0} durationInFrames={30}><Out dur={30}><Place at="center"><FlipLetters text="MESLEKLER" font="Monoton" size={84} color="#e3263b" /></Place></Out></Sequence>
      {parts.flatMap((p) => p.titles.map(([t, text], k) => {
        const next = p.titles[k + 1] ? p.titles[k + 1][0] : p.dur;
        const from = p.from + t + (p.from === 0 && t === 0 ? 30 : 0), dur = p.from + next - from;
        return dur > 0 ? <Sequence key={p.shot + k} from={from} durationInFrames={dur}><Out dur={dur}><Title text={text} /></Out></Sequence> : null;
      }))}
      <Sequence from={at} durationInFrames={90}><Clip dir="guncelleme16" shot="mudahale" start={20} count={110} punch={false} blur={7} /><End /></Sequence>
    </AbsoluteFill>
  );
};
