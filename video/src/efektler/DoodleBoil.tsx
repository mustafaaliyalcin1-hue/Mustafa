import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";

// doodle boil: elle çizilmiş gibi titreyen çizgi; her 3 karede bir şekil hafifçe değişir.
export const DoodleBoil: React.FC = () => {
  const frame = useCurrentFrame();
  const step = Math.floor(frame / 3);
  const j = (seed: string) => (random(`${seed}-${step}`) - 0.5) * 14;
  const draw = interpolate(frame, [0, 40], [0, 1], { extrapolateRight: "clamp" });

  const path = `M ${200 + j("a")} ${960 + j("b")}
    C ${350 + j("c")} ${700 + j("d")}, ${730 + j("e")} ${700 + j("f")}, ${880 + j("g")} ${960 + j("h")}
    S ${540 + j("i")} ${1300 + j("k")}, ${200 + j("l")} ${960 + j("m")}`;

  return (
    <AbsoluteFill>
      <svg width="1080" height="1920">
        <path
          d={path}
          fill="none"
          stroke="#f472b6"
          strokeWidth={18}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - draw}
        />
      </svg>
    </AbsoluteFill>
  );
};
