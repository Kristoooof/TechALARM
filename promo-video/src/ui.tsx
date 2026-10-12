import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { colors, ease, FONT } from "./theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Lassan mozgó fényfoltok a sötétkék háttéren (a teljes videó alatt). */
export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const a = Math.sin(frame / 160) * 6;
  const b = Math.cos(frame / 200) * 6;
  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${22 + a}% ${28 + b}%, rgba(37,99,235,0.34), transparent 42%),
                       radial-gradient(circle at ${80 - a}% ${72 - b}%, rgba(96,165,250,0.18), transparent 40%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.45) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

/** Jelenet-keret: finom be- és kiúsztatás, lassú kamera-nagyítás. */
export const Scene: React.FC<{
  duration: number;
  push?: number;
  children: ReactNode;
  style?: CSSProperties;
}> = ({ duration, push = 0.03, children, style }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 10, duration - 10, duration], [0, 1, 1, 0], clamp);
  const scale = interpolate(frame, [0, duration], [1, 1 + push], clamp);
  return (
    <AbsoluteFill
      style={{
        opacity,
        scale: String(scale),
        fontFamily: FONT,
        color: colors.text,
        ...style,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/** Szavankénti, elmosódásból élesedő szövegmegjelenés. */
export const Words: React.FC<{
  text: string;
  from?: number;
  stagger?: number;
  size: number;
  weight?: number;
  color?: string;
  accent?: string[];
  accentColor?: string;
  align?: "center" | "left";
  style?: CSSProperties;
}> = ({
  text,
  from = 0,
  stagger = 4,
  size,
  weight = 700,
  color = colors.text,
  accent = [],
  accentColor = colors.sky,
  align = "center",
  style,
}) => {
  const frame = useCurrentFrame();
  const lines = text.split("\n");
  let idx = 0;
  return (
    <div
      style={{
        fontSize: size,
        fontWeight: weight,
        letterSpacing: "-0.035em",
        lineHeight: 1.08,
        textAlign: align,
        color,
        ...style,
      }}
    >
      {lines.map((line, li) => (
        <div
          key={li}
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: align === "center" ? "center" : "flex-start",
            gap: `0 ${size * 0.26}px`,
          }}
        >
          {line.split(" ").map((word) => {
            const i = idx++;
            const p = interpolate(frame - from - i * stagger, [0, 24], [0, 1], {
              ...clamp,
              easing: ease,
            });
            return (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  opacity: p,
                  translate: `0px ${(1 - p) * size * 0.35}px`,
                  filter: `blur(${(1 - p) * 14}px)`,
                  color: accent.includes(word) ? accentColor : undefined,
                }}
              >
                {word}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

/** TechALARM szójel. */
export const Wordmark: React.FC<{ size: number }> = ({ size }) => (
  <div style={{ fontSize: size, fontWeight: 800, letterSpacing: "-0.045em", lineHeight: 1 }}>
    Tech<span style={{ color: colors.sky }}>ALARM</span>
  </div>
);
