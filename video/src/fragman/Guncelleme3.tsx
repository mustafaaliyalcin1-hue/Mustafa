import React from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from "remotion";
import { useFonts, Clip, Bars, Slam, Wipe, Typewriter, BlurGlow, Bounce, Place, Out } from "./Fragman";
import { End } from "./Tanitim";

// Güncelleme videosu: taksi çağırma ve telefondaki tuş düzeltmesi.
// Kareler oyunun içinden çekildi (public/guncelleme3/<sahne>/0000.jpg ...). Müzik render sonrası ffmpeg ile eklenir.
const SC = [
  { from: 0, dur: 90, shot: "telefon", start: 0, count: 90, punch: false },
  { from: 90, dur: 200, shot: "tcagir", start: 0, count: 200 },
  { from: 290, dur: 200, shot: "tbin", start: 6, count: 210 },
  { from: 490, dur: 90, shot: "tbin", start: 205, count: 210, punch: false, blur: 7 },
];
const Left: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ justifyContent: "center", alignItems: "flex-start", padding: "0 0 0 60px", width: "70%" }}>{children}</AbsoluteFill>
);

export const Guncelleme3: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {SC.map((s, i) => (
        <Sequence key={i} from={s.from} durationInFrames={s.dur}>
          <Clip dir="guncelleme3" shot={s.shot} start={s.start} count={s.count} punch={s.punch !== false} blur={s.blur} />
        </Sequence>
      ))}
      <Bars />
      <Sequence from={0} durationInFrames={90}>
        <AbsoluteFill style={{ backgroundColor: "#000", opacity: interpolate(f, [0, 14, 70, 90], [0.8, 0.3, 0.3, 0], { extrapolateRight: "clamp" }) }} />
        <Out dur={90}><Left><Typewriter text="Telefonda tuşlar artık kolay basılıyor" font="RussoOne" size={44} color="#7fd6ff" /></Left></Out>
      </Sequence>
      <Sequence from={96} durationInFrames={80}><Out dur={80}><Place at="top"><Slam text="TAKSİ ÇAĞIR" font="BlackOpsOne" size={110} color="#ffd21f" /></Place></Out></Sequence>
      <Sequence from={200} durationInFrames={90}><Out dur={90}><Left><Wipe text="Sarı taksi sana gelir" font="Righteous" size={72} color="#ffffff" /></Left></Out></Sequence>
      <Sequence from={296} durationInFrames={90}><Out dur={90}><Place at="bottom"><BlurGlow text="NEREYE? SÖYLE, GÖTÜRSÜN" font="Audiowide" size={58} color="#ffd21f" /></Place></Out></Sequence>
      <Sequence from={400} durationInFrames={90}><Out dur={90}><Place at="bottom"><Bounce text="TAKSİMETRE ÇALIŞIYOR" font="PermanentMarker" size={64} color="#ff8a3d" /></Place></Out></Sequence>
      <Sequence from={490} durationInFrames={90}><End /></Sequence>
    </AbsoluteFill>
  );
};
