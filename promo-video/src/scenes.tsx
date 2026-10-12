import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, ease, easeInOut, FONT, SCENES } from "./theme";
import { Scene, Words, Wordmark } from "./ui";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const center = { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" } as const;

export const HookScene: React.FC = () => (
  <Scene duration={SCENES.hook} push={0.04} style={center}>
    <Words text={"Elromlott valami\naz iskolában?"} size={168} weight={750} accent={["iskolában?"]} stagger={5} />
  </Scene>
);

export const ProblemScene: React.FC = () => {
  const lines = [
    { text: "Szóltál valakinek.", from: 0, color: colors.text },
    { text: "Senki nem tudta, kinek.", from: 34, color: colors.text },
    { text: "Aztán elfelejtették.", from: 70, color: colors.muted },
  ];
  return (
    <Scene duration={SCENES.problem} style={{ ...center, gap: 26 }}>
      {lines.map((l) => (
        <Words key={l.text} text={l.text} from={l.from} size={104} weight={700} color={l.color} stagger={3} />
      ))}
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
  return (
    <Scene duration={SCENES.tracking} style={{ ...center, gap: 64 }}>
      <Words text="Kövesd az állapotát." size={112} weight={750} accent={["állapotát."]} stagger={5} />
      <div
        style={{
          width: 1240,
          padding: "64px 80px 60px",
          borderRadius: 36,
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.14)",
          boxShadow: "0 40px 120px rgba(0,0,0,0.35)",
          opacity: card,
          translate: `0px ${(1 - card) * 50}px`,
        }}
      >
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
    </Scene>
  );
};
