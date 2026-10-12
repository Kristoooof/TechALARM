import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, ease, easeInOut, FONT, SCENES } from "./theme";
import { AlarmBadge, DeviceImg, FloatingDevices, GroundShadow, type DeviceName } from "./Device";
import { Scene, Words, Wordmark } from "./ui";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const center = { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" } as const;

export const HookScene: React.FC = () => (
  <Scene duration={SCENES.hook} push={0.04} style={center}>
    <FloatingDevices
      items={[
        { name: "projector", x: 110, y: 120, h: 170, rot: -9, blur: 7, opacity: 0.38 },
        { name: "pc", x: 1540, y: 90, h: 210, rot: 7, blur: 9, opacity: 0.32, delay: 6 },
        { name: "desk", x: 70, y: 720, h: 200, rot: 5, blur: 8, opacity: 0.3, delay: 12 },
        { name: "chair", x: 1620, y: 690, h: 250, rot: -6, blur: 7, opacity: 0.34, delay: 18 },
        { name: "drill", x: 1000, y: 880, h: 190, rot: 4, blur: 12, opacity: 0.2, delay: 24 },
      ]}
    />
    <Words text={"Elromlott valami\naz iskolában?"} size={168} weight={750} accent={["iskolában?"]} stagger={5} />
  </Scene>
);

const BROKEN: { name: DeviceName; h: number; label: string }[] = [
  { name: "projector", h: 190, label: "projektor" },
  { name: "pc", h: 250, label: "számítógép" },
  { name: "desk", h: 230, label: "pad" },
  { name: "chair", h: 290, label: "szék" },
];

const BrokenDevice: React.FC<{ name: DeviceName; h: number; drop: number; alarm: number }> = ({ name, h, drop, alarm }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fall = spring({ frame: frame - drop, fps, config: { damping: 12, stiffness: 120, mass: 0.9 } });
  const visible = interpolate(frame - drop, [0, 8], [0, 1], clamp);
  // Riasztáskor megrázkódik, aztán vörösen izzik
  const since = frame - alarm;
  const shake = since >= 0 ? Math.sin(since * 1.7) * 3.2 * Math.exp(-since / 10) : 0;
  const glow = since >= 0 ? interpolate(since, [0, 16], [0, 1], clamp) * (0.65 + 0.35 * Math.sin(frame / 7)) : 0;
  return (
    <div style={{ position: "relative", opacity: visible, translate: `0px ${(1 - fall) * -520}px`, rotate: `${(1 - fall) * -14 + shake}deg` }}>
      <GroundShadow width={h * 1.1} />
      <DeviceImg name={name} height={h} style={{ filter: `drop-shadow(0 0 ${34 * glow}px rgba(239,68,68,${0.85 * glow}))` }} />
      <AlarmBadge start={alarm} size={62} style={{ right: -14, top: -22 }} />
    </div>
  );
};

export const ProblemScene: React.FC = () => {
  const lines = [
    { text: "Szóltál valakinek.", from: 0, color: colors.text },
    { text: "Senki nem tudott segíteni.", from: 40, color: colors.text },
    { text: "Aztán elfelejtették.", from: 84, color: colors.muted },
  ];
  return (
    <Scene duration={SCENES.problem} style={{ alignItems: "center" }}>
      <div style={{ position: "absolute", top: 100, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        {lines.map((l) => (
          <Words key={l.text} text={l.text} from={l.from} size={92} weight={700} color={l.color} stagger={3} />
        ))}
      </div>
      <div style={{ position: "absolute", bottom: 96, left: 0, right: 0, display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 120 }}>
        {BROKEN.map((d, i) => (
          <BrokenDevice key={d.name} name={d.name} h={d.h} drop={14 + i * 11} alarm={56 + i * 14} />
        ))}
      </div>
    </Scene>
  );
};

export const LogoScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: frame - 6, fps, config: { damping: 18, stiffness: 110 } });
  const tag = interpolate(frame, [30, 56], [0, 1], { ...clamp, easing: ease });
  return (
    <Scene duration={SCENES.logo} style={center}>
      {[0, 1, 2].map((i) => {
        const p = interpolate(frame - i * 12, [0, 60], [0, 1], { ...clamp, easing: ease });
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              width: 260 + p * 1100,
              height: 260 + p * 1100,
              borderRadius: "50%",
              border: `4px solid ${colors.sky}`,
              opacity: (1 - p) * 0.9,
            }}
          />
        );
      })}
      <div style={{ scale: String(0.82 + pop * 0.18), opacity: Math.min(1, pop * 1.6) }}>
        <Wordmark size={220} />
      </div>
      <div style={{ fontSize: 58, fontWeight: 500, color: "#b6c4e8", marginTop: 34, opacity: tag, translate: `0px ${(1 - tag) * 24}px`, letterSpacing: "-0.02em" }}>
        Hibabejelentés. Egyszerűen.
      </div>
    </Scene>
  );
};

const STATUS = [
  { label: "Új", color: colors.red },
  { label: "Folyamatban", color: colors.amber },
  { label: "Megjavítva", color: colors.green },
];

export const TrackingScene: React.FC = () => {
  const f = useCurrentFrame();
  const reachAt = [8, 42, 76];
  const progress = interpolate(f, [reachAt[0], reachAt[1], reachAt[2]], [0, 0.5, 1], { ...clamp, easing: easeInOut });
  const INSET = 130;
  const card = interpolate(f, [0, 26], [0, 1], { ...clamp, easing: ease });
  const note = interpolate(f, [reachAt[2] + 6, reachAt[2] + 30], [0, 1], { ...clamp, easing: ease });
  const stage = f >= reachAt[2] ? colors.green : f >= reachAt[1] ? colors.amber : colors.red;
  const fixedPop = interpolate(f, [reachAt[2], reachAt[2] + 18], [0, 1], { ...clamp, easing: ease });
  return (
    <Scene duration={SCENES.tracking} style={{ ...center, gap: 44 }}>
      <Words text="Kövesd az állapotát." size={104} weight={750} accent={["állapotát."]} stagger={5} />
      <div
        style={{
          width: 1240,
          padding: "44px 80px 50px",
          borderRadius: 36,
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.14)",
          boxShadow: "0 40px 120px rgba(0,0,0,0.35)",
          opacity: card,
          translate: `0px ${(1 - card) * 50}px`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 36, marginBottom: 40, paddingBottom: 34, borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
          <div style={{ position: "relative" }}>
            <DeviceImg name="drill" height={132} style={{ filter: `drop-shadow(0 0 ${22 + fixedPop * 10}px ${stage})` }} />
            <div style={{ position: "absolute", right: -14, top: -10, width: 46, height: 46, borderRadius: 23, background: colors.green, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, fontWeight: 800, color: "#fff", scale: String(fixedPop), boxShadow: "0 0 24px rgba(34,197,94,0.7)" }}>✓</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 50, fontWeight: 700, letterSpacing: "-0.03em" }}>Fúrógép</div>
            <div style={{ fontSize: 31, color: colors.muted, marginTop: 4 }}>Gépműhely · GM-001</div>
          </div>
          <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: 1.5, color: colors.sky, padding: "14px 26px", borderRadius: 16, background: "rgba(96,165,250,0.12)", border: "1px solid rgba(96,165,250,0.35)" }}>TA-K7M2-QX9P</div>
        </div>
        <div style={{ position: "relative", height: 150 }}>
          <div style={{ position: "absolute", left: INSET, right: INSET, top: 28, height: 6, borderRadius: 3, background: "rgba(255,255,255,0.14)" }} />
          <div style={{ position: "absolute", left: INSET, top: 28, height: 6, borderRadius: 3, width: `calc((100% - ${INSET * 2}px) * ${progress})`, background: `linear-gradient(90deg, ${colors.red}, ${colors.amber}, ${colors.green})` }} />
          {STATUS.map((s, i) => {
            const on = interpolate(f, [reachAt[i], reachAt[i] + 14], [0, 1], { ...clamp, easing: ease });
            return (
              <div key={s.label} style={{ position: "absolute", top: 0, left: `calc(${INSET}px + (100% - ${INSET * 2}px) * ${i / 2})`, translate: "-50% 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
                <div
                  style={{
                    width: 62,
                    height: 62,
                    borderRadius: 31,
                    background: on > 0.5 ? s.color : "rgba(255,255,255,0.16)",
                    boxShadow: on > 0.5 ? `0 0 ${40 * on}px ${s.color}` : "none",
                    scale: String(0.9 + on * 0.1),
                  }}
                />
                <div style={{ fontFamily: FONT, fontSize: 44, fontWeight: 650, color: on > 0.5 ? colors.text : "rgba(248,251,255,0.4)", letterSpacing: "-0.02em" }}>{s.label}</div>
              </div>
            );
          })}
        </div>
        <div
          style={{
            marginTop: 40,
            padding: "26px 34px",
            whiteSpace: "nowrap",
            borderRadius: 22,
            background: "rgba(34,197,94,0.12)",
            border: "1px solid rgba(34,197,94,0.35)",
            fontSize: 35,
            lineHeight: 1.35,
            color: "#bbf7d0",
            opacity: note,
            translate: `0px ${(1 - note) * 20}px`,
          }}
        >
          <strong style={{ color: "#dcfce7" }}>Üzenet a karbantartótól:</strong> csütörtökön cseréljük az alkatrészt.
        </div>
      </div>
    </Scene>
  );
};

export const PillarsScene: React.FC = () => (
  <Scene duration={SCENES.pillars} style={{ ...center, gap: 4 }}>
    <Words text="Gyors." size={196} weight={800} from={0} stagger={1} />
    <Words text="Névtelen." size={196} weight={800} from={22} stagger={1} />
    <Words text="Követhető." size={196} weight={800} from={44} stagger={1} color={colors.sky} />
  </Scene>
);

export const EndScene: React.FC = () => {
  const f = useCurrentFrame();
  const a = interpolate(f, [0, 28], [0, 1], { ...clamp, easing: ease });
  const b = interpolate(f, [24, 52], [0, 1], { ...clamp, easing: ease });
  const c = interpolate(f, [42, 70], [0, 1], { ...clamp, easing: ease });
  return (
    <Scene duration={SCENES.end} push={0.025} style={{ ...center, gap: 40 }}>
      <div style={{ opacity: a, scale: String(0.94 + a * 0.06) }}>
        <Wordmark size={190} />
      </div>
      <div
        style={{
          opacity: b,
          translate: `0px ${(1 - b) * 24}px`,
          fontSize: 54,
          fontWeight: 600,
          padding: "20px 46px",
          borderRadius: 999,
          background: colors.blue,
          letterSpacing: "-0.01em",
        }}
      >
        tech-alarm.vercel.app
      </div>
      <div style={{ opacity: c, fontSize: 38, color: colors.muted, fontWeight: 500, letterSpacing: "0.01em" }}>
        MSZC Gépészeti Technikum
      </div>
      <div style={{ position: "absolute", bottom: 54, left: 0, right: 0, display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 90 }}>
        {(["projector", "pc", "drill", "desk", "chair"] as DeviceName[]).map((n, i) => {
          const r = interpolate(f, [30 + i * 7, 62 + i * 7], [0, 1], { ...clamp, easing: ease });
          const bob = Math.sin((f + i * 30) / 34) * 7;
          return (
            <div key={n} style={{ position: "relative", opacity: r * 0.92, translate: `0px ${(1 - r) * 140 + bob}px` }}>
              <GroundShadow width={150} />
              <DeviceImg name={n} height={n === "chair" ? 190 : n === "pc" ? 165 : 150} />
            </div>
          );
        })}
      </div>
    </Scene>
  );
};
