import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";

// kinetic captions: kelimeler sırayla zıplayarak gelir.
export const KineticCaptions: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(" ");

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: 80 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 24, justifyContent: "center" }}>
        {words.map((word, i) => {
          const s = spring({ frame: frame - i * 6, fps, config: { damping: 12 } });
          return (
            <span
              key={i}
              style={{
                fontFamily: "sans-serif",
                fontWeight: 900,
                fontSize: 120,
                color: i % 2 ? "#facc15" : "white",
                transform: `translateY(${(1 - s) * 80}px) scale(${s})`,
                opacity: s,
              }}
            >
              {word}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
