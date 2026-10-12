import type { CSSProperties, FC, ReactNode } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { clamp, D, easeOut, rnd } from "./theme";

/** Ferde, menüszerű sáv (a „választó lista” egy eleme). */
export const SkewPlate: FC<{
  children: ReactNode;
  size: number;
  active?: boolean;
  accent?: string;
  style?: CSSProperties;
}> = ({ children, size, active, accent, style }) => (
  <div
    style={{
      transform: "skewX(-14deg)",
      background: active ? D.white : "rgba(7,18,99,0.86)",
      color: active ? D.navy : D.white,
      boxShadow: active ? `${size * 0.22}px ${size * 0.22}px 0 ${D.cyan}` : `${size * 0.14}px ${size * 0.14}px 0 ${D.void}`,
      borderLeft: `${size * 0.32}px solid ${accent ?? (active ? D.electric : D.cyan)}`,
      padding: `${size * 0.28}px ${size * 0.7}px ${size * 0.28}px ${size * 0.5}px`,
      fontSize: size,
      fontWeight: 900,
      letterSpacing: "-0.01em",
      lineHeight: 1,
      textTransform: "uppercase",
      whiteSpace: "nowrap",
      width: "fit-content",
      ...style,
    }}
  >
    {children}
  </div>
);

/** Villanáskor remegő, RGB-szétcsúszó „glitch” hatás. */
export const glitch = (f: number, amount: number) => {
  if (amount <= 0) return { dx: 0, dy: 0, shadow: "none" as const };
  const dx = (rnd(f * 1.3) - 0.5) * 18 * amount;
  const dy = (rnd(f * 2.7) - 0.5) * 8 * amount;
  const s = 6 * amount;
  return { dx, dy, shadow: `${s}px 0 0 rgba(255,59,78,.85), ${-s}px 0 0 rgba(110,231,255,.85)` };
};

const SHARDS = [
  { x: -80, y: 120, w: 760, h: 150, r: -24, c: D.electric, o: 0.55, sp: 0.6 },
  { x: 1200, y: 640, w: 980, h: 180, r: -24, c: D.cyan, o: 0.22, sp: -0.8 },
  { x: 260, y: 760, w: 640, h: 90, r: -24, c: D.blue, o: 0.7, sp: 0.9 },
  { x: 1000, y: -40, w: 560, h: 110, r: -24, c: D.cyan, o: 0.16, sp: -0.5 },
  { x: 1500, y: 300, w: 520, h: 70, r: -24, c: D.white, o: 0.1, sp: 0.7 },
];

/** Átlós sávok és szilánkok mozgó, kék háttéren. */
export const MenuBG: FC<{ tone?: "blue" | "dark" }> = ({ tone = "blue" }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: tone === "blue" ? `linear-gradient(135deg, ${D.navy}, #0a22a8 55%, ${D.blue})` : `linear-gradient(135deg, ${D.void}, ${D.navy})` }}>
      {SHARDS.map((s, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: s.x + Math.sin(f / 70 + i) * 30 + f * s.sp,
            top: s.y,
            width: s.w,
            height: s.h,
            background: s.c,
            opacity: s.o,
            rotate: `${s.r}deg`,
          }}
        />
      ))}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 50%, rgba(2,4,20,.55))" }} />
    </AbsoluteFill>
  );
};

/** Beúszás oldalról, kis túllendüléssel. */
export const slideIn = (f: number, start: number, from: number) => {
  const p = interpolate(f, [start, start + 22], [0, 1], { ...clamp, easing: easeOut });
  return { opacity: Math.min(1, p * 2), x: (1 - p) * from };
};
