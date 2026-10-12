import { AbsoluteFill, Series, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import "../fonts";
import { Phone } from "../PhoneDemo";
import { FONT } from "../theme";
import { glitch, MenuBG, SkewPlate, slideIn } from "./Menu";
import { clamp, D, DARK_TOTAL, easeOut, flashAt, SEG } from "./theme";
import { World } from "./World";

const base = { fontFamily: FONT, color: D.white } as const;

// ---------- 1) 3D: folyosó → ajtó → tanterem ----------
const WorldScene: React.FC = () => {
  const f = useCurrentFrame();
  const fl = flashAt(f);
  const g = glitch(f, fl);
  const place = interpolate(f, [14, 34, 100, 124], [0, 1, 1, 0], clamp);
  const leftIn = slideIn(f, 330, -900);
  const rightIn = slideIn(f, 352, 1000);
  return (
    <AbsoluteFill style={{ background: D.void }}>
      <World />
      {/* hangulat: kék színezés és vignetta */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 45%, rgba(2,4,24,.75))" }} />
      <AbsoluteFill style={{ background: D.blue, mixBlendMode: "soft-light", opacity: 0.35 * (1 - fl) }} />
      <AbsoluteFill style={{ background: "#fff", opacity: fl * 0.26, mixBlendMode: "screen" }} />

      {/* helyszín-felirat a folyosón */}
      <div style={{ ...base, position: "absolute", left: 90, bottom: 110, opacity: place, translate: `${(1 - place) * -120}px 0` }}>
        <SkewPlate size={96}>Folyosó</SkewPlate>
        <SkewPlate size={34} accent={D.electric} style={{ marginTop: 18, marginLeft: 40 }}>
          MSZC Gépészeti Technikum
        </SkewPlate>
      </div>

      {/* bal oldali választó lista */}
      <div style={{ ...base, position: "absolute", left: 60, top: 300, opacity: leftIn.opacity, translate: `${leftIn.x + g.dx}px ${g.dy}px`, rotate: "-3deg", textShadow: g.shadow }}>
        <SkewPlate size={30} accent={D.cyan} style={{ marginBottom: 22, background: D.cyan, color: D.void }}>
          Mit tettél?
        </SkewPlate>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <SkewPlate size={36}>Szóltam a tanárnak.</SkewPlate>
          <SkewPlate size={36}>Szóltam az osztálytársnak.</SkewPlate>
          <SkewPlate size={36} active>▶ Senki nem tudott segíteni.</SkewPlate>
        </div>
      </div>

      {/* jobb oldali nagy szöveg */}
      <div style={{ ...base, position: "absolute", right: 56, top: 140, textAlign: "right", opacity: rightIn.opacity, translate: `${rightIn.x - g.dx}px ${g.dy}px`, rotate: "3deg", textShadow: g.shadow }}>
        <div style={{ fontSize: 138, fontWeight: 900, lineHeight: 0.92, letterSpacing: "-0.04em", transform: "skewX(-10deg)", color: D.white, textShadow: `7px 7px 0 ${D.blue}, 14px 14px 0 ${D.void}${g.shadow !== "none" ? "," + g.shadow : ""}` }}>
          ISMERŐS
        </div>
        <div style={{ fontSize: 138, fontWeight: 900, lineHeight: 0.92, letterSpacing: "-0.04em", transform: "skewX(-10deg)", color: D.cyan, textShadow: `7px 7px 0 ${D.blue}, 14px 14px 0 ${D.void}` }}>
          HELYZET?
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 34 }}>
          <SkewPlate size={28} active>A projektor megint nem működik.</SkewPlate>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 2) átvezető kártya ----------
const CardScene: React.FC = () => {
  const f = useCurrentFrame();
  const wipe = interpolate(f, [0, 14], [0, 100], { ...clamp, easing: easeOut });
  const flash = interpolate(f, [0, 8], [1, 0], clamp);
  const out = interpolate(f, [SEG.card - 8, SEG.card], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <MenuBG />
      <AbsoluteFill style={{ ...base, alignItems: "center", justifyContent: "center", clipPath: `polygon(0 0, ${wipe}% 0, ${wipe - 8}% 100%, 0 100%)` }}>
        <div style={{ transform: "skewX(-12deg) rotate(-3deg)", textAlign: "center", fontSize: 150, fontWeight: 900, lineHeight: 0.95, letterSpacing: "-0.04em", textShadow: `10px 10px 0 ${D.void}` }}>
          <div>DE VAN</div>
          <div style={{ color: D.cyan }}>MÁS MEGOLDÁS.</div>
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "#fff", opacity: flash }} />
    </AbsoluteFill>
  );
};

// ---------- 3) TechALARM menü + telefon ----------
const STEPS = [
  { label: "Terem", from: 24, to: 76 },
  { label: "Eszköz", from: 76, to: 128 },
  { label: "Leírás", from: 128, to: 208 },
  { label: "Küldés", from: 208, to: 236 },
  { label: "Kód", from: 236, to: 999 },
];
const STATUS = [
  { label: "Új", at: 246, c: D.red },
  { label: "Folyamatban", at: 276, c: "#ffb020" },
  { label: "Megjavítva", at: 306, c: "#2be07a" },
];

const DemoMenu: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = interpolate(f, [0, 30], [0, 1], { ...clamp, easing: easeOut });
  const pop = spring({ frame: f - 236, fps, config: { damping: 12, stiffness: 120 } });
  const out = interpolate(f, [SEG.demo - 8, SEG.demo], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ ...base, opacity: out }}>
      <MenuBG />
      {/* bal oldal: lépések */}
      <div style={{ position: "absolute", left: 70, top: 190, rotate: "-3deg", opacity: enter, translate: `${(1 - enter) * -500}px 0` }}>
        <SkewPlate size={34} style={{ marginBottom: 26, background: D.cyan, color: D.void }}>Bejelentés</SkewPlate>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {STEPS.map((s, i) => {
            const active = f >= s.from && f < s.to;
            return (
              <SkewPlate key={s.label} size={48} active={active} style={{ translate: active ? "28px 0" : "0 0", opacity: f >= s.from - 20 ? 1 : 0.55 }}>
                {String(i + 1).padStart(2, "0")} · {s.label}
              </SkewPlate>
            );
          })}
        </div>
      </div>

      {/* közép: telefon */}
      <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, display: "flex", alignItems: "center", translate: `-50% ${(1 - enter) * 120}px`, opacity: enter }}>
        <Phone f={f} />
      </div>

      {/* jobb oldal: állapot */}
      <div style={{ position: "absolute", right: 70, top: 190, rotate: "3deg", opacity: interpolate(f, [236, 262], [0.0, 1], clamp), translate: `${(1 - Math.min(1, pop)) * 500}px 0` }}>
        <SkewPlate size={34} style={{ marginBottom: 26, background: D.cyan, color: D.void }}>Állapot</SkewPlate>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {STATUS.map((s, i) => {
            const reached = f >= s.at;
            const current = reached && (i === STATUS.length - 1 || f < STATUS[i + 1].at);
            return (
              <SkewPlate key={s.label} size={48} active={current} accent={reached ? s.c : undefined} style={{ opacity: reached ? 1 : 0.5 }}>
                {reached && !current ? "✓ " : ""}{s.label}
              </SkewPlate>
            );
          })}
        </div>
        <SkewPlate size={30} style={{ marginTop: 34, background: D.electric }}>Követőkód: TA-K7M2-QX9P</SkewPlate>
        <SkewPlate size={26} accent="#2be07a" style={{ marginTop: 18, opacity: interpolate(f, [312, 330], [0, 1], clamp) }}>
          Csütörtökön cseréljük az alkatrészt.
        </SkewPlate>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 4) zárás ----------
const EndScene: React.FC = () => {
  const f = useCurrentFrame();
  const a = interpolate(f, [0, 30], [0, 1], { ...clamp, easing: easeOut });
  const b = interpolate(f, [22, 52], [0, 1], { ...clamp, easing: easeOut });
  const c = interpolate(f, [40, 70], [0, 1], { ...clamp, easing: easeOut });
  const out = interpolate(f, [SEG.end - 14, SEG.end], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ ...base, opacity: out }}>
      <MenuBG />
      <div style={{ position: "absolute", left: 110, top: 0, bottom: 0, display: "flex", flexDirection: "column", justifyContent: "center", gap: 36 }}>
        <div style={{ opacity: a, translate: `${(1 - a) * -300}px 0`, transform: "skewX(-10deg)", fontSize: 176, fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 0.9, textShadow: `12px 12px 0 ${D.blue}, 24px 24px 0 ${D.void}` }}>
          Tech<span style={{ color: D.cyan }}>ALARM</span>
        </div>
        <div style={{ opacity: b, translate: `${(1 - b) * -300}px 0` }}>
          <SkewPlate size={64} active>▶ Szólj. Névtelenül.</SkewPlate>
        </div>
        <div style={{ opacity: c, translate: `${(1 - c) * -300}px 0` }}>
          <SkewPlate size={44} style={{ background: D.blue }}>tech-alarm.vercel.app</SkewPlate>
        </div>
      </div>
      <div style={{ position: "absolute", right: 110, top: 0, bottom: 0, display: "flex", alignItems: "center", opacity: c, scale: String(0.9 + c * 0.1), rotate: "3deg" }}>
        <div style={{ background: "#fff", padding: 26, borderRadius: 26, boxShadow: `16px 16px 0 ${D.void}` }}>
          <Img src={staticFile("qr.svg")} style={{ width: 400, height: 400, display: "block" }} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const DarkHour: React.FC = () => (
  <AbsoluteFill style={{ background: D.void }}>
    <Series>
      <Series.Sequence name="Folyosó és tanterem (3D)" durationInFrames={SEG.world}>
        <WorldScene />
      </Series.Sequence>
      <Series.Sequence name="Átvezető" durationInFrames={SEG.card}>
        <CardScene />
      </Series.Sequence>
      <Series.Sequence name="TechALARM menü" durationInFrames={SEG.demo}>
        <DemoMenu />
      </Series.Sequence>
      <Series.Sequence name="Zárás" durationInFrames={SEG.end}>
        <EndScene />
      </Series.Sequence>
    </Series>
  </AbsoluteFill>
);
export { DARK_TOTAL };
