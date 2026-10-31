import React from "react";
import { AbsoluteFill, Sequence, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { useFonts, Clip, FlipLetters, Place, Out } from "./Fragman";
import { End } from "./Tanitim";

// Kaleler + silahlar videosu: Harput ve Ankara kalesi, kaçakçı, tüfek, sniper, RPG, Voltra R tareti.
// Kareler oyunun içinden çekildi (public/guncelleme9/<sahne>/0000.jpg ...). Müzik render sonrası ffmpeg ile eklenir.
type Seg = { shot: string; dur: number; titles: [number, string][] };
const SEG: Seg[] = [
  { shot: "harput", dur: 150, titles: [[0, "Elazığ: Harput Kalesi"], [80, "Eğik minareli Ulu Camii de yanında"]] },
  { shot: "ankara", dur: 150, titles: [[0, "Ankara Kalesi"], [80, "“Beni Harput Kalesi'ne götür” de, götürsün"]] },
  { shot: "kacakci", dur: 90, titles: [[0, "Yeni: Kaçakçı"], [44, "Silahını seç"]] },
  { shot: "tufek", dur: 80, titles: [[0, "Taramalı tüfek"]] },
  { shot: "sniper", dur: 70, titles: [[0, "Sniper: dürbünle tek atış"]] },
  { shot: "rpg", dur: 80, titles: [[0, "RPG: alan hasarı"]] },
  { shot: "taret", dur: 200, titles: [[0, "Voltra R'nin tareti açılır"], [20, "Minigun"], [70, "Lazer: yavaş ama çok isabetli"], [135, "RPG: sahibine vurmamaya çalışır"]] },
];
export const G9_LEN = SEG.reduce((a, s) => a + s.dur, 0) + 90;

const Title: React.FC<{ text: string }> = ({ text }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const s = spring({ frame: f - 2, fps, config: { damping: 13 } });
  return <div style={{ position: "absolute", left: 40, bottom: 60, fontFamily: "BebasNeue", fontSize: 70, color: "#fff", background: "rgba(10,12,16,.72)", padding: "4px 22px", transform: `translateY(${(1 - s) * 200}px)` }}>{text}</div>;
};

export const Guncelleme9: React.FC = () => {
  useFonts();
  let at = 0;
  const parts = SEG.map((s) => { const from = at; at += s.dur; return { ...s, from }; });
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {parts.map((p) => (<Sequence key={p.shot} from={p.from} durationInFrames={p.dur}><Clip dir="guncelleme9" shot={p.shot} count={p.dur} punch={p.from > 0} /></Sequence>))}
      <Sequence from={0} durationInFrames={60}><Out dur={60}><Place at="center"><FlipLetters text="KALELER VE SİLAHLAR" font="Monoton" size={76} color="#ff5a1f" /></Place></Out></Sequence>
      {parts.flatMap((p) => p.titles.map(([t, text], k) => {
        const next = p.titles[k + 1] ? p.titles[k + 1][0] : p.dur;
        const from = p.from + t + (p.from === 0 && t === 0 ? 60 : 0), dur = p.from + next - from;
        return dur > 0 ? <Sequence key={p.shot + k} from={from} durationInFrames={dur}><Out dur={dur}><Title text={text} /></Out></Sequence> : null;
      }))}
      <Sequence from={at} durationInFrames={90}><Clip dir="guncelleme9" shot="harput" start={60} count={150} punch={false} blur={7} /><End /></Sequence>
    </AbsoluteFill>
  );
};
