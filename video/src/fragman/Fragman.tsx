import React, { useEffect, useState } from "react";
import {
  AbsoluteFill, Img, Sequence, continueRender, delayRender, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig, Easing,
} from "remotion";

// Tepetaklak oyun fragmanı. Görüntüler oyunun içinden kare kare çekildi (public/fragman/<sahne>/0000.jpg ...).
// Her yazı ayrı bir yazı tipiyle ve ayrı bir animasyonla gelir. Müzik render sonrası ffmpeg ile eklenir.

const FONTS = ["Monoton", "BlackOpsOne", "Bungee", "Righteous", "RussoOne", "Kanit", "Audiowide", "Pacifico", "PermanentMarker", "BebasNeue", "Lobster", "RubikMonoOne", "JetBrainsMono"];

const useFonts = () => {
  const [handle] = useState(() => delayRender("fontlar"));
  useEffect(() => {
    Promise.all(FONTS.map((f) => new FontFace(f, `url(${staticFile(`fragman/fonts/${f}.woff2`)})`).load().then((ff) => document.fonts.add(ff))))
      .then(() => continueRender(handle))
      .catch(() => continueRender(handle));
  }, [handle]);
};

// bir sahnenin kare dizisi; girişte hafif zoom-punch ve beyaz flaş
const Clip: React.FC<{ shot: string; start?: number; count: number; punch?: boolean; blur?: number }> = ({ shot, start = 0, count, punch = true, blur = 0 }) => {
  const f = useCurrentFrame();
  const n = Math.min(count - 1, start + f);
  const sc = punch ? interpolate(f, [0, 10], [1.12, 1.0], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }) : 1;
  const flash = punch ? interpolate(f, [0, 4], [0.4, 0], { extrapolateRight: "clamp" }) : 0;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden" }}>
      <Img src={staticFile(`fragman/${shot}/${String(n).padStart(4, "0")}.jpg`)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${sc})`, filter: blur ? `blur(${blur}px) brightness(.6)` : undefined }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,.55) 100%)" }} />
      <AbsoluteFill style={{ backgroundColor: "#fff", opacity: flash }} />
    </AbsoluteFill>
  );
};

const Bars: React.FC = () => (
  <>
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 56, background: "#000" }} />
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 56, background: "#000" }} />
  </>
);

const shadow = "0 6px 28px rgba(0,0,0,.65)";

// 1) harfler tek tek takla atarak gelir
const FlipLetters: React.FC<{ text: string; font: string; size: number; color: string }> = ({ text, font, size, color }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      {text.split("").map((ch, i) => {
        const s = spring({ frame: f - 6 - i * 3, fps, config: { damping: 11, stiffness: 120 } });
        return <span key={i} style={{ fontFamily: font, fontSize: size, color, display: "inline-block", transform: `rotateX(${(1 - s) * 180}deg) translateY(${(1 - s) * -40}px)`, opacity: Math.min(1, s * 2), textShadow: `0 0 24px ${color}, ${shadow}` }}>{ch === " " ? " " : ch}</span>;
      })}
    </div>
  );
};
// 2) yere çakılır + ekran sarsıntısı
const Slam: React.FC<{ text: string; font: string; size: number; color: string }> = ({ text, font, size, color }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const s = spring({ frame: f, fps, config: { damping: 9, stiffness: 220, mass: 0.7 } });
  const shake = f < 14 ? (random(`sx${f}`) - 0.5) * 18 * (1 - f / 14) : 0;
  return <div style={{ fontFamily: font, fontSize: size, color, transform: `translate(${shake}px, ${shake * 0.6}px) scale(${interpolate(s, [0, 1], [3, 1])})`, opacity: Math.min(1, s * 3), textShadow: shadow, letterSpacing: 2 }}>{text}</div>;
};
// 3) dönerek büyür
const Spin: React.FC<{ text: string; font: string; size: number; color: string }> = ({ text, font, size, color }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const s = spring({ frame: f, fps, config: { damping: 12 } });
  return <div style={{ fontFamily: font, fontSize: size, color, transform: `rotate(${(1 - s) * -200}deg) scale(${s})`, textShadow: shadow }}>{text}</div>;
};
// 4) soldan sağa silme ile açılır
const Wipe: React.FC<{ text: string; font: string; size: number; color: string }> = ({ text, font, size, color }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [2, 18], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  const bar = interpolate(f, [2, 18, 26], [0, 100, 100], { extrapolateRight: "clamp" });
  return (
    <div style={{ position: "relative" }}>
      <div style={{ fontFamily: font, fontSize: size, color, clipPath: `inset(0 ${100 - p}% 0 0)`, textShadow: shadow }}>{text}</div>
      <div style={{ position: "absolute", left: 0, bottom: -10, height: 8, width: `${bar}%`, background: color, borderRadius: 4 }} />
    </div>
  );
};
// 5) daktilo
const Typewriter: React.FC<{ text: string; font: string; size: number; color: string }> = ({ text, font, size, color }) => {
  const f = useCurrentFrame();
  const n = Math.floor(interpolate(f, [0, text.length * 1.6], [0, text.length], { extrapolateRight: "clamp" }));
  return <div style={{ fontFamily: font, fontSize: size, color, textShadow: shadow, background: "rgba(10,12,16,.55)", padding: "10px 22px", borderLeft: `8px solid ${color}` }}>{text.slice(0, n)}<span style={{ opacity: f % 10 < 5 ? 1 : 0 }}>▌</span></div>;
};
// 6) yandan kayarak, eğik
const SlideSkew: React.FC<{ text: string; font: string; size: number; color: string }> = ({ text, font, size, color }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const s = spring({ frame: f, fps, config: { damping: 14 } });
  return <div style={{ fontFamily: font, fontSize: size, color, fontWeight: 800, transform: `translateX(${(1 - s) * -900}px) skewX(${(1 - s) * -25 - 8}deg)`, textShadow: shadow, fontStyle: "italic" }}>{text}</div>;
};
// 7) bulanıktan netleşir, parlar
const BlurGlow: React.FC<{ text: string; font: string; size: number; color: string }> = ({ text, font, size, color }) => {
  const f = useCurrentFrame();
  const b = interpolate(f, [0, 22], [24, 0], { extrapolateRight: "clamp" });
  const ls = interpolate(f, [0, 30], [40, 6], { extrapolateRight: "clamp" });
  return <div style={{ fontFamily: font, fontSize: size, color, filter: `blur(${b}px)`, letterSpacing: ls, opacity: interpolate(f, [0, 10], [0, 1], { extrapolateRight: "clamp" }), textShadow: `0 0 30px ${color}, 0 4px 18px rgba(0,0,0,.85)` }}>{text}</div>;
};
// 8) el yazısı gibi çizilerek yazılır
const Handwrite: React.FC<{ text: string; font: string; size: number; color: string }> = ({ text, font, size, color }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [0, 34], [0, 100], { extrapolateRight: "clamp", easing: Easing.out(Easing.quad) });
  return <div style={{ fontFamily: font, fontSize: size, color, clipPath: `polygon(0 0, ${p}% 0, ${p - 6}% 100%, 0 100%)`, textShadow: shadow, transform: "rotate(-4deg)" }}>{text}</div>;
};
// 9) harfler zıplar
const Bounce: React.FC<{ text: string; font: string; size: number; color: string }> = ({ text, font, size, color }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  return (
    <div style={{ display: "flex" }}>
      {text.split("").map((ch, i) => {
        const s = spring({ frame: f - i * 2, fps, config: { damping: 7, stiffness: 160 } });
        return <span key={i} style={{ fontFamily: font, fontSize: size, color: i % 2 ? color : "#fff", display: "inline-block", transform: `translateY(${(1 - s) * -160}px) rotate(${(1 - s) * (i % 2 ? 30 : -30)}deg)`, opacity: s > 0.05 ? 1 : 0, textShadow: shadow }}>{ch === " " ? " " : ch}</span>;
      })}
    </div>
  );
};
// 10) dijital parazit (glitch)
const Glitch: React.FC<{ text: string; font: string; size: number; color: string }> = ({ text, font, size, color }) => {
  const f = useCurrentFrame();
  const g = f < 16 || f % 23 < 2 ? 1 : 0;
  const dx = g ? (random(`g${f}`) - 0.5) * 30 : 0;
  const base: React.CSSProperties = { fontFamily: font, fontSize: size, position: "absolute", left: 0, top: 0, whiteSpace: "nowrap", letterSpacing: 4 };
  return (
    <div style={{ position: "relative", opacity: interpolate(f, [0, 3], [0, 1], { extrapolateRight: "clamp" }) }}>
      <div style={{ fontFamily: font, fontSize: size, letterSpacing: 4, whiteSpace: "nowrap", visibility: "hidden" }}>{text}</div>
      <div style={{ ...base, color: "#ff2a6d", transform: `translate(${dx + (g ? 6 : 0)}px,0)`, mixBlendMode: "screen" }}>{text}</div>
      <div style={{ ...base, color: "#05d9e8", transform: `translate(${-dx - (g ? 6 : 0)}px,0)`, mixBlendMode: "screen" }}>{text}</div>
      <div style={{ ...base, color, textShadow: "0 6px 26px rgba(0,0,0,.7)", clipPath: g ? `inset(${random(`c${f}`) * 60}% 0 ${random(`d${f}`) * 30}% 0)` : undefined }}>{text}</div>
    </div>
  );
};

type TitleProps = { at: "center" | "bottom" | "top" | "left"; children: React.ReactNode };
const Place: React.FC<TitleProps> = ({ at, children }) => (
  <AbsoluteFill style={{ justifyContent: at === "bottom" ? "flex-end" : at === "top" ? "flex-start" : "center", alignItems: at === "left" ? "flex-start" : "center", padding: at === "left" ? "0 90px" : "100px 60px", perspective: 900 }}>{children}</AbsoluteFill>
);
const Out: React.FC<{ dur: number; children: React.ReactNode }> = ({ dur, children }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [dur - 8, dur], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};

// sahne listesi (30 fps, müzikteki drop ve kırılmalara göre)
const SC = [
  { from: 0, dur: 113, shot: "ramp", start: 0, count: 282, punch: false },
  { from: 113, dur: 169, shot: "ramp", start: 113, count: 282 },
  { from: 282, dur: 108, shot: "chase", start: 0, count: 148 },
  { from: 390, dur: 90, shot: "police", start: 20, count: 150 },
  { from: 480, dur: 83, shot: "hwy", start: 40, count: 240 },
  { from: 563, dur: 112, shot: "cab", start: 0, count: 112 },
  { from: 675, dur: 105, shot: "cargo", start: 40, count: 145 },
  { from: 780, dur: 120, shot: "moto", start: 40, count: 160 },
  { from: 900, dur: 112, shot: "fly", start: 0, count: 200 },
  { from: 1012, dur: 188, shot: "fly", start: 90, count: 100, punch: false, blur: 7 },
];

export const Fragman: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const endHit = 1125;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {SC.map((s, i) => (
        <Sequence key={i} from={s.from} durationInFrames={s.dur}>
          <Clip shot={s.shot} start={s.start} count={s.count} punch={s.punch !== false} blur={s.blur} />
        </Sequence>
      ))}
      <Bars />
      {/* intro */}
      <Sequence from={0} durationInFrames={113}>
        <AbsoluteFill style={{ backgroundColor: "#000", opacity: interpolate(f, [0, 40, 100, 113], [1, 0.55, 0.45, 0], { extrapolateRight: "clamp" }) }} />
        <Out dur={113}><Place at="center"><FlipLetters text="TEPETAKLAK" font="Monoton" size={150} color="#ff3b4e" /></Place></Out>
      </Sequence>
      <Sequence from={116} durationInFrames={84}><Out dur={84}><Place at="bottom"><Slam text="TAVANA YAPIŞ." font="BlackOpsOne" size={110} color="#ffffff" /></Place></Out></Sequence>
      <Sequence from={200} durationInFrames={82}><Out dur={82}><Place at="top"><Spin text="TAKLA AT!" font="Bungee" size={120} color="#ffd34d" /></Place></Out></Sequence>
      <Sequence from={286} durationInFrames={104}><Out dur={104}><Place at="left"><Wipe text="Sonsuz şehir" font="Righteous" size={112} color="#5fd0ff" /></Place></Out></Sequence>
      <Sequence from={394} durationInFrames={86}><Out dur={86}><Place at="bottom"><Typewriter text="Polis peşinde... helikopter de!" font="RussoOne" size={64} color="#ff4d5e" /></Place></Out></Sequence>
      <Sequence from={483} durationInFrames={80}><Out dur={80}><Place at="center"><SlideSkew text="TERS OTOYOLDA BAŞ AŞAĞI" font="Kanit" size={88} color="#ffffff" /></Place></Out></Sequence>
      <Sequence from={570} durationInFrames={105}><Out dur={105}><Place at="top"><BlurGlow text="OTOPİLOT · İÇ KAMERA" font="Audiowide" size={70} color="#7fb6ff" /></Place></Out></Sequence>
      <Sequence from={678} durationInFrames={102}><Out dur={102}><Place at="bottom"><Handwrite text="Kurye ol, para kazan" font="Pacifico" size={104} color="#ffe27a" /></Place></Out></Sequence>
      <Sequence from={784} durationInFrames={116}><Out dur={116}><Place at="top"><Bounce text="FAN MOTOR · VOLTRA R" font="PermanentMarker" size={92} color="#ff8a3d" /></Place></Out></Sequence>
      <Sequence from={904} durationInFrames={108}><Out dur={108}><Place at="center"><Glitch text="ARKADAŞLARINLA ONLINE" font="BebasNeue" size={132} color="#ffffff" /></Place></Out></Sequence>
      {/* bitiş kartı */}
      <Sequence from={1012} durationInFrames={188}>
        <EndCard hit={endHit - 1012} />
      </Sequence>
    </AbsoluteFill>
  );
};

const EndCard: React.FC<{ hit: number }> = ({ hit }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const a = spring({ frame: f - 4, fps, config: { damping: 13 } });
  const h = spring({ frame: f - hit, fps, config: { damping: 8, stiffness: 200 } });
  const url = spring({ frame: f - hit - 10, fps, config: { damping: 15 } });
  const fade = interpolate(f, [170, 188], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 26, opacity: fade, flexDirection: "column" }}>
      <div style={{ fontFamily: "RubikMonoOne", fontSize: 128, color: "#fff", transform: `scale(${a * (1 + (1 - h) * 0.15)}) rotate(${(1 - a) * 12}deg)`, textShadow: "0 0 40px rgba(255,59,78,.8), 0 8px 30px #000", letterSpacing: 4 }}>
        TEPE<span style={{ display: "inline-block", transform: "scaleY(-1)", color: "#ff3b4e" }}>TAKLAK</span>
      </div>
      <div style={{ fontFamily: "Lobster", fontSize: 92, color: "#ffd34d", transform: `translateY(${(1 - h) * 60}px) scale(${0.6 + h * 0.4})`, opacity: h, textShadow: "0 6px 24px #000" }}>Şimdi oyna!</div>
      <div style={{ fontFamily: "JetBrainsMono", fontSize: 30, color: "#cfe6ff", opacity: url, transform: `translateY(${(1 - url) * 30}px)`, background: "rgba(0,0,0,.45)", padding: "10px 18px", borderRadius: 8 }}>mustafaaliyalcin1-hue.github.io/Mustafa/rampa</div>
    </AbsoluteFill>
  );
};
