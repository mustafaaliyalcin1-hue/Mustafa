import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";

// chart grow: çubuklar sırayla aşağıdan yukarı büyür.
export const ChartGrow: React.FC<{ values: number[] }> = ({ values }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const max = Math.max(...values);

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 40, height: 900 }}>
        {values.map((v, i) => {
          const s = spring({ frame: frame - i * 8, fps, config: { damping: 200 } });
          return (
            <div
              key={i}
              style={{
                width: 130,
                height: (v / max) * 900 * s,
                background: "linear-gradient(#38bdf8, #6366f1)",
                borderRadius: 20,
              }}
            />
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
