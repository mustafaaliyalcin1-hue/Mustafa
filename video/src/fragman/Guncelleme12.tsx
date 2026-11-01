import React from "react";
import { AbsoluteFill, Sequence, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { useFonts, Clip, FlipLetters, Place, Out } from "./Fragman";
import { End } from "./Tanitim";

// Hastane ve karakol içi videosu: olay yeri ifadesi, mobese, araba çarpması, hastane yatağı, geçmiş olsun, hücre + sorgu, taret botlara.
// Kareler oyunun içinden çekildi (public/guncelleme12/<sahne>/0000.jpg ...). Müzik render sonrası ffmpeg ile eklenir.
type Seg = { shot: string; dur: number; titles: [number, string][] };
const SEG: Seg[] = [
  { shot: "ifade", dur: 70, titles: [[0, "Polis olay yerinde ifadeni alıyor"]] },
  { shot: "mobese", dur: 120, titles: [[0, "Mobese artık çarpma anını gösteriyor"]] },
  { shot: "carpma", dur: 160, titles: [[0, "Sana araba çarparsa"], [60, "Kusurlu sürücü gözaltına alınır"], [115, "Ambulans seni hastaneye götürür"]] },
  { shot: "yatak", dur: 150, titles: [[0, "Hastanede yatağın"], [60, "Can 3 dakikada dolar"], [110, "Kusursuz sürücü geçmiş olsun der"]] },
  { shot: "gecmis", dur: 90, titles: [[0, "Kurtardığın yayaya geçmiş olsun de"]] },
  { shot: "hucre", dur: 120, titles: [[0, "Karakolun içi: hücreler"]] },
  { shot: "sorgu", dur: 50, titles: [[0, "Sorgu odasında ifade"]] },
  { shot: "bot", dur: 150, titles: [[0, "Silahlar ve taret botlara da vurur"]] },
];
export const G12_LEN = SEG.reduce((a, s) => a + s.dur, 0) + 90;

const Title: React.FC<{ text: string }> = ({ text }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const s = spring({ frame: f - 2, fps, config: { damping: 13 } });
  return <div style={{ position: "absolute", left: 40, bottom: 60, fontFamily: "BebasNeue", fontSize: 70, color: "#fff", background: "rgba(10,12,16,.72)", padding: "4px 22px", transform: `translateY(${(1 - s) * 200}px)` }}>{text}</div>;
};

export const Guncelleme12: React.FC = () => {
  useFonts();
  let at = 0;
  const parts = SEG.map((s) => { const from = at; at += s.dur; return { ...s, from }; });
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {parts.map((p) => (<Sequence key={p.shot} from={p.from} durationInFrames={p.dur}><Clip dir="guncelleme12" shot={p.shot} count={p.dur} punch={p.from > 0} /></Sequence>))}
      <Sequence from={0} durationInFrames={50}><Out dur={50}><Place at="center"><FlipLetters text="HASTANE VE KARAKOL" font="Monoton" size={80} color="#7fb0ff" /></Place></Out></Sequence>
      {parts.flatMap((p) => p.titles.map(([t, text], k) => {
        const next = p.titles[k + 1] ? p.titles[k + 1][0] : p.dur;
        const from = p.from + t + (p.from === 0 && t === 0 ? 50 : 0), dur = p.from + next - from;
        return dur > 0 ? <Sequence key={p.shot + k} from={from} durationInFrames={dur}><Out dur={dur}><Title text={text} /></Out></Sequence> : null;
      }))}
      <Sequence from={at} durationInFrames={90}><Clip dir="guncelleme12" shot="yatak" start={40} count={150} punch={false} blur={7} /><End /></Sequence>
    </AbsoluteFill>
  );
};
