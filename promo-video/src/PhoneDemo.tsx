import type { CSSProperties, ReactNode } from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, ease, FONT, SCENES } from "./theme";
import { DeviceImg, FloatingDevices } from "./Device";
import { Scene } from "./ui";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const SCREEN_W = 390;
const SCREEN_H = 844;
const SCALE = 1.04;
const BEZEL = 14;

// A demó időzítése (a jelenet saját képkockáiban)
const T = {
  room: 34,
  device: 86,
  category: 132,
  typeStart: 148,
  typeEnd: 204,
  tap: 214,
  success: 236,
};

const DESCRIPTION = "A fúrógép nem indul, a gomb beragadt.";

const Field: React.FC<{ label: string; value?: string; focused?: boolean; tall?: boolean; children?: ReactNode }> = ({
  label,
  value,
  focused,
  tall,
  children,
}) => (
  <div style={{ marginBottom: 16 }}>
    <div style={{ fontSize: 16, fontWeight: 600, color: colors.ink, marginBottom: 4 }}>{label}</div>
    <div
      style={{
        height: tall ? 96 : 46,
        padding: tall ? 12 : "0 12px",
        display: "flex",
        alignItems: tall ? "flex-start" : "center",
        justifyContent: "space-between",
        fontSize: 16,
        color: value ? colors.ink : "#94a3b8",
        background: "rgba(255,255,255,0.96)",
        border: `1px solid ${focused ? "#60a5fa" : "#cbd5e1"}`,
        borderRadius: 11,
        boxShadow: focused ? "0 0 0 4px rgba(96,165,250,0.22)" : "none",
        boxSizing: "border-box",
      }}
    >
      <span>{children ?? value}</span>
      {!tall && (
        <span
          style={{
            width: 8,
            height: 8,
            borderRight: "2px solid #64748b",
            borderBottom: "2px solid #64748b",
            rotate: "45deg",
            translate: "0 -2px",
          }}
        />
      )}
    </div>
  </div>
);

export type FormText = { room: string; device: string; description: string };
const DEFAULT_FORM: FormText = { room: "Gépműhely", device: "Fúrógép (GM-001)", description: DESCRIPTION };

const SiteScreen: React.FC<{ f: number; form: FormText }> = ({ f, form }) => {
  const room = f >= T.room + 14 ? form.room : "";
  const device = f >= T.device + 14 ? form.device : "";
  const category = f >= T.category + 12 ? "Elromlott / nem működik" : "";
  const chars = Math.floor(interpolate(f, [T.typeStart, T.typeEnd], [0, form.description.length], clamp));
  const caret = f >= T.typeStart && f < T.tap && Math.floor(f / 8) % 2 === 0 ? "▏" : "";
  const typed = form.description.slice(0, chars) + caret;

  const roomFocus = f >= T.room && f < T.room + 22;
  const deviceFocus = f >= T.device && f < T.device + 22;
  const categoryFocus = f >= T.category && f < T.category + 20;
  const descFocus = f >= T.typeStart && f < T.tap;

  const pressed = interpolate(f, [T.tap, T.tap + 5, T.tap + 12], [1, 0.96, 1], clamp);
  const successP = interpolate(f, [T.success, T.success + 22], [0, 1], { ...clamp, easing: ease });

  return (
    <div
      style={{
        width: SCREEN_W,
        height: SCREEN_H,
        background: "linear-gradient(135deg,#f8fbff,#edf5ff,#f8faff)",
        fontFamily: FONT,
        color: colors.ink,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Fejléc (státuszsorral) */}
      <div style={{ height: 84, background: "rgba(23,37,84,0.97)", paddingTop: 36, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "36px 16px 0" }}>
        <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.5px", color: "#fff" }}>
          Tech<span style={{ color: "#60a5fa" }}>ALARM</span>
        </div>
        <div style={{ fontSize: 15, fontWeight: 600, color: "#dbeafe", display: "flex", gap: 14 }}>
          <span>Bejelentés</span>
          <span>Állapot</span>
        </div>
      </div>

      <div style={{ padding: "22px 16px" }}>
        <div style={{ fontSize: 30, fontWeight: 750, color: "#172554", letterSpacing: "-0.4px", lineHeight: 1.2 }}>Hibabejelentés</div>
        <div style={{ fontSize: 15, color: "#64748b", margin: "6px 0 16px", lineHeight: 1.5 }}>
          Elromlott eszköz vagy rongálás? Jelentsd be, hogy a karbantartók mielőbb intézkedhessenek.
        </div>

        <div style={{ position: "relative" }}>
          {/* Űrlap */}
          <div
            style={{
              opacity: 1 - successP,
              background: "rgba(255,255,255,0.86)",
              border: "1px solid rgba(191,219,254,0.8)",
              borderRadius: 16,
              padding: 16,
              boxShadow: "0 8px 28px rgba(30,64,175,0.07)",
            }}
          >
            <Field label="Terem / labor" value={room || undefined} focused={roomFocus}>
              {room || "– válassz –"}
            </Field>
            <Field label="Eszköz" value={device || undefined} focused={deviceFocus}>
              {device || (room ? "– válassz –" : "Előbb válassz termet")}
            </Field>
            <Field label="Mi a probléma?" value={category || undefined} focused={categoryFocus}>
              {category || "– válassz –"}
            </Field>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: colors.ink, marginBottom: 4 }}>Leírás</div>
              <div
                style={{
                  height: 96,
                  padding: 12,
                  fontSize: 16,
                  lineHeight: 1.45,
                  color: chars ? colors.ink : "#94a3b8",
                  background: "rgba(255,255,255,0.96)",
                  border: `1px solid ${descFocus ? "#60a5fa" : "#cbd5e1"}`,
                  boxShadow: descFocus ? "0 0 0 4px rgba(96,165,250,0.22)" : "none",
                  borderRadius: 11,
                  boxSizing: "border-box",
                }}
              >
                {chars || descFocus ? typed : "Mi történt? Mióta áll fenn a hiba?"}
              </div>
            </div>
            <div
              style={{
                height: 48,
                borderRadius: 11,
                background: "#2563eb",
                color: "#fff",
                fontSize: 17,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                scale: String(pressed),
              }}
            >
              Bejelentés elküldése
            </div>
          </div>

          {/* Sikeres beküldés */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: successP,
              translate: `0px ${(1 - successP) * 24}px`,
              background: "rgba(255,255,255,0.9)",
              border: "1px solid rgba(191,219,254,0.8)",
              borderRadius: 16,
              padding: 16,
              height: 410,
              boxSizing: "border-box",
            }}
          >
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#15803d", borderRadius: 12, padding: "14px 16px", fontSize: 16, fontWeight: 600 }}>
              Köszönjük, a bejelentésed megérkezett!
            </div>
            <div style={{ fontSize: 15, color: "#475569", margin: "16px 0 8px", lineHeight: 1.5 }}>
              Ezzel a kóddal később megnézheted, hogy intézkedtek-e.
            </div>
            <div
              style={{
                textAlign: "center",
                fontSize: 30,
                fontWeight: 800,
                letterSpacing: 1.5,
                color: "#1d4ed8",
                background: "linear-gradient(135deg,#eff6ff,#e0f2fe)",
                border: "1px solid #bfdbfe",
                borderRadius: 15,
                padding: "18px 0",
                margin: "14px 0",
              }}
            >
              TA-K7M2-QX9P
            </div>
            <div style={{ height: 46, borderRadius: 11, background: "#2563eb", color: "#fff", fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
              Állapot megtekintése
            </div>
          </div>
        </div>
      </div>

      {/* Érintés-jelző */}
      <Tap f={f} />
    </div>
  );
};

/** Áttetsző kör, ami a gomb megnyomásakor megjelenik. */
const Tap: React.FC<{ f: number }> = ({ f }) => {
  const p = interpolate(f, [T.tap - 6, T.tap + 14], [0, 1], clamp);
  if (f < T.tap - 6 || f > T.tap + 16) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: SCREEN_W / 2 - 40,
        top: 598,
        width: 80,
        height: 80,
        borderRadius: 40,
        background: "rgba(96,165,250,0.45)",
        border: "2px solid rgba(255,255,255,0.8)",
        opacity: interpolate(p, [0, 0.3, 1], [0, 1, 0]),
        scale: String(0.6 + p * 0.7),
      }}
    />
  );
};

export const Phone: React.FC<{ f: number; form?: FormText }> = ({ f, form = DEFAULT_FORM }) => (
  <div
    style={{
      width: SCREEN_W * SCALE + BEZEL * 2,
      height: SCREEN_H * SCALE + BEZEL * 2,
      borderRadius: 78,
      background: "linear-gradient(145deg,#1e293b,#0b1224)",
      padding: BEZEL,
      boxSizing: "border-box",
      border: "1px solid rgba(148,163,184,0.35)",
      boxShadow: "0 50px 140px rgba(37,99,235,0.35), 0 0 0 2px rgba(0,0,0,0.6)",
      position: "relative",
    }}
  >
    <div style={{ width: SCREEN_W * SCALE, height: SCREEN_H * SCALE, borderRadius: 64, overflow: "hidden", position: "relative" }}>
      <div style={{ width: SCREEN_W, height: SCREEN_H, transformOrigin: "top left", scale: String(SCALE) }}>
        <SiteScreen f={f} form={form} />
      </div>
    </div>
    {/* Dinamikus sziget */}
    <div style={{ position: "absolute", top: BEZEL + 14, left: "50%", translate: "-50% 0", width: 112, height: 32, borderRadius: 16, background: "#000" }} />
  </div>
);

const STEPS: { label: string; from: number; to: number }[] = [
  { label: "Válaszd ki a termet.", from: 24, to: 76 },
  { label: "Add meg az eszközt.", from: 76, to: 128 },
  { label: "Írd le, mi a baj.", from: 128, to: 208 },
  { label: "Küldd el.", from: 208, to: 234 },
  { label: "Kapsz egy kódot.", from: 234, to: 999 },
];

export const DemoScene: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = interpolate(f, [0, 38], [0, 1], { ...clamp, easing: ease });
  // A telefon 3D-ben fordul be, majd finoman lebeg
  const tilt = (1 - enter) * 26 + Math.sin(f / 45) * 1.2;
  const phoneStyle: CSSProperties = {
    opacity: enter,
    translate: `0px ${(1 - enter) * 120 + Math.sin(f / 38) * 6}px`,
    transform: `rotateY(${-tilt}deg) rotateX(${(1 - enter) * 8}deg)`,
  };
  // A kiválasztott eszköz (fúrógép) kiugrik az „Eszköz” lépésnél
  const chipIn = spring({ frame: f - 96, fps, config: { damping: 13, stiffness: 120 } });
  const chipOut = interpolate(f, [214, 236], [1, 0], clamp);
  const chip = f >= 96 ? chipIn * chipOut : 0;
  return (
    <Scene duration={SCENES.demo} push={0.02}>
      <FloatingDevices
        items={[
          { name: "projector", x: 1010, y: 70, h: 130, rot: -8, blur: 9, opacity: 0.22 },
          { name: "pc", x: 960, y: 800, h: 190, rot: 6, blur: 10, opacity: 0.2, delay: 10 },
          { name: "chair", x: 1750, y: 780, h: 230, rot: -6, blur: 9, opacity: 0.2, delay: 16 },
        ]}
      />
      <div style={{ position: "absolute", left: 150, top: 0, bottom: 0, display: "flex", flexDirection: "column", justifyContent: "center", gap: 34 }}>
        <div style={{ fontSize: 36, fontWeight: 600, letterSpacing: "0.02em", color: colors.sky, marginBottom: 6, opacity: enter }}>
          Kevesebb, mint egy perc
        </div>
        {STEPS.map((s, i) => {
          const active = f >= s.from && f < s.to;
          const seen = f >= s.from;
          const p = interpolate(f, [s.from - 8, s.from + 14], [0, 1], { ...clamp, easing: ease });
          const base = interpolate(f, [4 + i * 5, 30 + i * 5], [0, 1], { ...clamp, easing: ease });
          return (
            <div
              key={s.label}
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 26,
                fontSize: 72,
                fontWeight: 700,
                letterSpacing: "-0.035em",
                color: active ? colors.text : seen ? "rgba(248,251,255,0.42)" : "rgba(248,251,255,0.2)",
                opacity: base,
                translate: `${active ? p * 14 : 0}px 0px`,
              }}
            >
              <span style={{ fontSize: 34, fontWeight: 600, width: 46, color: active ? colors.sky : "rgba(141,162,214,0.5)" }}>{i + 1}</span>
              <span>{s.label}</span>
            </div>
          );
        })}
      </div>

      {/* Kiugró eszközkártya */}
      <div
        style={{
          position: "absolute",
          left: 1000,
          top: 470,
          width: 250,
          opacity: Math.min(1, chip * 1.4),
          scale: String(0.6 + chip * 0.4),
          translate: `${(1 - chip) * 120}px 0px`,
          padding: "20px 20px 22px",
          borderRadius: 28,
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.18)",
          boxShadow: "0 30px 80px rgba(0,0,0,0.4)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
        }}
      >
        <DeviceImg name="drill" height={170} />
        <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em" }}>Fúrógép</div>
        <div style={{ fontSize: 22, color: colors.muted }}>GM-001</div>
      </div>

      <div style={{ position: "absolute", right: 190, top: 0, bottom: 0, display: "flex", alignItems: "center", perspective: 1800 }}>
        <div style={phoneStyle}>
          <Phone f={f} />
        </div>
      </div>
    </Scene>
  );
};
