import React from "react";
import { AbsoluteFill, Sequence, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { useFonts, Clip, FlipLetters, Place, Out } from "./Fragman";
import { End } from "./Tanitim";

// Havalimanı terminali (bilet, güvenlik, kafe, kapı), ekonomi kabini, kalıcı sabıka, polis çevirmesi ve kılık.
// Kareler oyunun içinden çekildi (public/guncelleme19/<sahne>/0000.jpg ...). Müzik render sonrası ffmpeg ile eklenir.
type Seg = { shot: string; dur: number; titles: [number, string][] };
const SEG: Seg[] = [
  { shot: "terminal", dur: 110, titles: [[0, "Havalimanına yürüyerek gir"], [60, "Kalkış panosu, bilet gişesi, yolcular"]] },
  { shot: "bilet", dur: 75, titles: [[0, "Biletini al: ekonomi ya da birinci sınıf"]] },
  { shot: "guvenlik", dur: 100, titles: [[0, "Güvenlik kontrolü"], [40, "Silahlar emanete, kimlik kontrolü"]] },
  { shot: "kafe", dur: 75, titles: [[0, "Kapıda bir kahve iç"]] },
  { shot: "kabin", dur: 90, titles: [[0, "Ekonomi sınıfı: 3+3 koltuk, dolu kabin"]] },
  { shot: "cevirme", dur: 150, titles: [[0, "Polis çevirmeleri"], [75, "Kılık değiştirdin: seni tanımadılar 😎"]] },
  { shot: "yakalandi", dur: 170, titles: [[0, "Polis seni unutmaz"], [70, "Hangi ile gidersen git, tanırsa tutuklar"]] },
];
export const G19_LEN = SEG.reduce((a, s) => a + s.dur, 0) + 90;

const Title: React.FC<{ text: string }> = ({ text }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const s = spring({ frame: f - 2, fps, config: { damping: 13 } });
  return <div style={{ position: "absolute", left: 40, top: 70, fontFamily: "BebasNeue", fontSize: 64, color: "#fff", background: "rgba(10,12,16,.8)", padding: "4px 22px", transform: `translateX(${(1 - s) * -800}px)` }}>{text}</div>;
};

export const Guncelleme19: React.FC = () => {
  useFonts();
  let at = 0;
  const parts = SEG.map((s) => { const from = at; at += s.dur; return { ...s, from }; });
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {parts.map((p) => (<Sequence key={p.shot} from={p.from} durationInFrames={p.dur}><Clip dir="guncelleme19" shot={p.shot} count={p.dur} punch={p.from > 0} /></Sequence>))}
      <Sequence from={0} durationInFrames={34}><Out dur={34}><Place at="center"><FlipLetters text="HAVALİMANI" font="Monoton" size={84} color="#5fb4ff" /></Place></Out></Sequence>
      {parts.flatMap((p) => p.titles.map(([t, text], k) => {
        const next = p.titles[k + 1] ? p.titles[k + 1][0] : p.dur;
        const from = p.from + t + (p.from === 0 && t === 0 ? 34 : 0), dur = p.from + next - from;
        return dur > 0 ? <Sequence key={p.shot + k} from={from} durationInFrames={dur}><Out dur={dur}><Title text={text} /></Out></Sequence> : null;
      }))}
      <Sequence from={at} durationInFrames={90}><Clip dir="guncelleme19" shot="terminal" start={20} count={110} punch={false} blur={7} /><End /></Sequence>
    </AbsoluteFill>
  );
};
