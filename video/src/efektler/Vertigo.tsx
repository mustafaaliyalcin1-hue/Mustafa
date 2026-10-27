import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

// vertigo (dolly zoom): ön plan sabit kalırken arka plan büyür.
export const Vertigo: React.FC = () => {
  const frame = useCurrentFrame();
  const bgScale = interpolate(frame, [0, 90], [1, 2.4]);

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <AbsoluteFill
        style={{
          transform: `scale(${bgScale})`,
          background: "repeating-radial-gradient(circle, #1e293b 0 40px, #334155 40px 80px)",
        }}
      />
      <div style={{ position: "relative", width: 360, height: 360, borderRadius: "50%", background: "#facc15" }} />
    </AbsoluteFill>
  );
};
