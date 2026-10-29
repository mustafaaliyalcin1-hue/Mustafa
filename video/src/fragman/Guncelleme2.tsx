import React from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from "remotion";
import { useFonts, Clip, Bars, FlipLetters, Slam, Wipe, Typewriter, SlideSkew, BlurGlow, Bounce, Place, Out } from "./Fragman";
import { End } from "./Tanitim";

// Güncelleme videosu: Tesla uygulaması, uzaktan çağırma, "beni eve götür", "eve git".
// Kareler oyunun içinden çekildi (public/guncelleme2/<sahne>/0000.jpg ...). Müzik render sonrası ffmpeg ile eklenir.
const SC = [
  { from: 0, dur: 120, shot: "app", start: 0, count: 120, punch: false },
  { from: 120, dur: 210, shot: "cagir", start: 20, count: 240 },
  { from: 330, dur: 140, shot: "eve", start: 10, count: 160 },
  { from: 470, dur: 160, shot: "yalniz", start: 8, count: 170 },
  { from: 630, dur: 90, shot: "yalniz", start: 160, count: 170, punch: false, blur: 7 },
];
const Left: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ justifyContent: "center", alignItems: "flex-start", padding: "0 0 0 60px", perspective: 900, width: "68%" }}>{children}</AbsoluteFill>
);

export const Guncelleme2: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {SC.map((s, i) => (
        <Sequence key={i} from={s.from} durationInFrames={s.dur}>
          <Clip dir="guncelleme2" shot={s.shot} start={s.start} count={s.count} punch={s.punch !== false} blur={s.blur} />
        </Sequence>
      ))}
      <Bars />
      <Sequence from={0} durationInFrames={66}>
        <AbsoluteFill style={{ backgroundColor: "#000", opacity: interpolate(f, [0, 20, 50, 66], [0.9, 0.45, 0.35, 0], { extrapolateRight: "clamp" }) }} />
        <Out dur={66}><Left><FlipLetters text="TESLA UYGULAMASI" font="Monoton" size={70} color="#ff3b4e" /></Left></Out>
      </Sequence>
      <Sequence from={66} durationInFrames={54}><Out dur={54}><Place at="bottom"><Typewriter text="Uzaklaşınca araba kendini kilitler 🔒" font="RussoOne" size={46} color="#7fd6ff" /></Place></Out></Sequence>
      <Sequence from={126} durationInFrames={90}><Out dur={90}><Left><BlurGlow text="HEY TESLA, GEL BENİ AL" font="Audiowide" size={60} color="#7fb6ff" /></Left></Out></Sequence>
      <Sequence from={250} durationInFrames={80}><Out dur={80}><Left><Wipe text="Boş araba kendi gelir" font="Righteous" size={72} color="#ffd34d" /></Left></Out></Sequence>
      <Sequence from={336} durationInFrames={90}><Out dur={90}><Place at="top"><Slam text="BENİ EVE GÖTÜR" font="BlackOpsOne" size={96} color="#ffffff" /></Place></Out></Sequence>
      <Sequence from={478} durationInFrames={84}><Out dur={84}><Place at="top"><SlideSkew text="EVE GİT: ARABA TEK BAŞINA" font="Kanit" size={72} color="#ffffff" /></Place></Out></Sequence>
      <Sequence from={564} durationInFrames={66}><Out dur={66}><Place at="top"><Bounce text="KİLİT · KORNA · FARLAR" font="PermanentMarker" size={64} color="#ff8a3d" /></Place></Out></Sequence>
      <Sequence from={630} durationInFrames={90}><End /></Sequence>
    </AbsoluteFill>
  );
};
