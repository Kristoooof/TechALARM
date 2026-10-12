import type { CSSProperties, FC } from "react";
import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, ease } from "./theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export type DeviceName = "projector" | "pc" | "desk" | "chair" | "drill";

// Szélesség / magasság arány (a public/devices/*.svg fájlok viewBox-a alapján)
const ASPECT: Record<DeviceName, number> = {
  projector: 520 / 320,
  pc: 560 / 470,
  desk: 520 / 380,
  chair: 320 / 430,
  drill: 380 / 480,
};

/** Háttér nélküli eszközkép. A fájl cserélhető saját PNG/SVG-re ugyanazzal a névvel. */
export const DeviceImg: FC<{ name: DeviceName; height: number; style?: CSSProperties }> = ({ name, height, style }) => (
  <Img
    src={staticFile(`devices/${name}.svg`)}
    style={{ height, width: height * ASPECT[name], display: "block", ...style }}
  />
);

/** Lassan lebegő, elmosott eszközök a háttérben (mélység-érzet). */
export const FloatingDevices: FC<{
  items: { name: DeviceName; x: number; y: number; h: number; rot?: number; blur?: number; opacity?: number; delay?: number }[];
}> = ({ items }) => {
  const frame = useCurrentFrame();
  return (
    <>
      {items.map((d, i) => {
        const p = interpolate(frame - (d.delay ?? 0) - i * 6, [0, 40], [0, 1], { ...clamp, easing: ease });
        const bob = Math.sin((frame + i * 37) / 38) * 14;
        const tilt = (d.rot ?? 0) + Math.sin((frame + i * 23) / 70) * 2.2;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: d.x,
              top: d.y,
              opacity: p * (d.opacity ?? 0.3),
              translate: `0px ${bob + (1 - p) * 70}px`,
              rotate: `${tilt}deg`,
              filter: `blur(${d.blur ?? 6}px)`,
            }}
          >
            <DeviceImg name={d.name} height={d.h} />
          </div>
        );
      })}
    </>
  );
};

/** Piros riasztás-jelvény kiterjedő gyűrűkkel. */
export const AlarmBadge: FC<{ start: number; size?: number; style?: CSSProperties }> = ({ start, size = 64, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: frame - start, fps, config: { damping: 11, stiffness: 160 } });
  if (frame < start) return null;
  const t = (frame - start) % 46;
  return (
    <div style={{ position: "absolute", width: size, height: size, scale: String(pop), ...style }}>
      {[0, 1].map((k) => {
        const q = ((t + k * 23) % 46) / 46;
        return (
          <div
            key={k}
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: `${Math.max(2, size * 0.07)}px solid ${colors.red}`,
              scale: String(1 + q * 1.4),
              opacity: (1 - q) * 0.8,
            }}
          />
        );
      })}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: colors.red,
          boxShadow: `0 0 ${size * 0.6}px rgba(239,68,68,0.7)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: size * 0.62,
          fontWeight: 800,
          color: "#fff",
          lineHeight: 1,
        }}
      >
        !
      </div>
    </div>
  );
};

/** Padlóra vetett lágy árnyék az eszköz alatt. */
export const GroundShadow: FC<{ width: number }> = ({ width }) => (
  <div
    style={{
      position: "absolute",
      bottom: -14,
      left: "50%",
      translate: "-50% 0",
      width,
      height: 30,
      background: "radial-gradient(ellipse at center, rgba(0,0,0,0.55), transparent 70%)",
      filter: "blur(6px)",
    }}
  />
);
