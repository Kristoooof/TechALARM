import type React from "react";
import type { FC } from "react";
import { Easing, interpolate } from "remotion";
import { clamp, easeOut, rnd } from "./theme";

const PROJ = { x: -6.2, z: -19.5 };
const SPEED = 0.09; // méter / képkocka (kb. 2,7 m/s: csengetés után sietnek)

const Box: FC<{ p: [number, number, number]; s: [number, number, number]; c: string }> = ({ p, s, c }) => (
  <mesh position={p}>
    <boxGeometry args={s} />
    <meshLambertMaterial color={c} />
  </mesh>
);

// ---------- Szék ----------
export const Chair: FC<{ x: number; y?: number; z: number }> = ({ x, y = 0, z }) => (
  <group position={[x, y, z]}>
    <Box p={[0, 0.45, 0]} s={[0.42, 0.05, 0.42]} c="#2145d6" />
    <Box p={[0.2, 0.72, 0]} s={[0.04, 0.42, 0.42]} c="#2145d6" />
    {[
      [-0.17, -0.17],
      [0.17, -0.17],
      [-0.17, 0.17],
      [0.17, 0.17],
    ].map(([dx, dz], i) => (
      <Box key={i} p={[dx, 0.22, dz]} s={[0.04, 0.44, 0.04]} c="#6f8bff" />
    ))}
  </group>
);

// ---------- Figura ----------
export type Look = { skin: string; hair: string; top: string; pants: string };

export type Pose = {
  x: number;
  y: number;
  z: number;
  ry: number;
  hipY: number;
  lean: number;
  thL: number;
  thR: number;
  shL: number;
  shR: number;
  armL: [number, number];
  armR: [number, number];
  elL: number;
  elR: number;
  headX: number;
  headY: number;
};

const Ball: FC<{ p: [number, number, number]; r: number; c: string }> = ({ p, r, c }) => (
  <mesh position={p}>
    <sphereGeometry args={[r, 12, 10]} />
    <meshLambertMaterial color={c} />
  </mesh>
);

// A méretek szándékosan eltérnek (egysíkú lapok nincsenek), az ízületeket gömbök fedik,
// így nincs Z-fighting és nem „villognak” az összeillesztések.
const Arm: FC<{ side: 1 | -1; sh: [number, number]; el: number; look: Look }> = ({ side, sh, el, look }) => (
  <group position={[side * 0.225, 0.5, 0]} rotation={[sh[0], 0, sh[1]]}>
    <Ball p={[0, 0, 0]} r={0.072} c={look.top} />
    <Box p={[0, -0.15, 0]} s={[0.1, 0.3, 0.104]} c={look.top} />
    <group position={[0, -0.3, 0]} rotation={[el, 0, 0]}>
      <Ball p={[0, 0, 0]} r={0.056} c={look.top} />
      <Box p={[0, -0.14, 0]} s={[0.082, 0.28, 0.086]} c={look.skin} />
      <Ball p={[0, -0.3, 0]} r={0.056} c={look.skin} />
    </group>
  </group>
);

const Leg: FC<{ side: 1 | -1; hipY: number; th: number; sh: number; look: Look }> = ({ side, hipY, th, sh, look }) => (
  <group position={[side * 0.1, hipY, 0]}>
    <Ball p={[0, 0, 0]} r={0.085} c={look.pants} />
    <group rotation={[th, 0, 0]}>
      <Box p={[0, -0.22, 0]} s={[0.14, 0.44, 0.146]} c={look.pants} />
      <group position={[0, -0.44, 0]} rotation={[sh, 0, 0]}>
        <Ball p={[0, 0, 0]} r={0.076} c={look.pants} />
        <Box p={[0, -0.21, 0]} s={[0.114, 0.42, 0.118]} c={look.pants} />
        <Box p={[0, -0.4, 0.045]} s={[0.126, 0.07, 0.232]} c="#e8f4ff" />
      </group>
    </group>
  </group>
);

export const Person: FC<{ pose: Pose; look: Look }> = ({ pose: p, look }) => (
  <group position={[p.x, p.y, p.z]} rotation={[0, p.ry, 0]}>
    <Leg side={-1} hipY={p.hipY} th={p.thL} sh={p.shL} look={look} />
    <Leg side={1} hipY={p.hipY} th={p.thR} sh={p.shR} look={look} />
    <group position={[0, p.hipY, 0]} rotation={[p.lean, 0, 0]}>
      <Box p={[0, 0.02, 0]} s={[0.34, 0.16, 0.2]} c={look.pants} />
      <Box p={[0, 0.3, 0]} s={[0.372, 0.56, 0.216]} c={look.top} />
      <Arm side={-1} sh={p.armL} el={p.elL} look={look} />
      <Arm side={1} sh={p.armR} el={p.elR} look={look} />
      <Box p={[0, 0.63, 0]} s={[0.085, 0.1, 0.09]} c={look.skin} />
      <group position={[0, 0.64, 0]} rotation={[p.headX, p.headY, 0]}>
        <mesh position={[0, 0.13, 0]}>
          <sphereGeometry args={[0.125, 16, 12]} />
          <meshLambertMaterial color={look.skin} />
        </mesh>
        {[-1, 1].map((e) => (
          <mesh key={e} position={[e * 0.045, 0.14, 0.113]}>
            <sphereGeometry args={[0.017, 8, 6]} />
            <meshBasicMaterial color="#10143a" />
          </mesh>
        ))}
        <mesh position={[0, 0.165, -0.04]} scale={[1, 0.92, 1]}>
          <sphereGeometry args={[0.135, 16, 12]} />
          <meshLambertMaterial color={look.hair} />
        </mesh>
      </group>
    </group>
  </group>
);

// ---------- Mozgás-segédek ----------
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], { ...clamp, easing: Easing.bezier(0.4, 0, 0.2, 1) });
const angTo = (dx: number, dz: number) => Math.atan2(dx, dz);
/** Legrövidebb szögkülönbség szerinti interpoláció. */
const lerpAng = (a: number, b: number, t: number) => {
  let d = (b - a) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return a + d * t;
};

type Pt = [number, number];
const makePath = (pts: Pt[]) => {
  const cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const at = (s: number): Pt => {
    const d = Math.min(Math.max(s, 0), cum[cum.length - 1]);
    let i = 1;
    while (i < pts.length - 1 && cum[i] < d) i++;
    const t = (d - cum[i - 1]) / Math.max(1e-6, cum[i] - cum[i - 1]);
    return [lerp(pts[i - 1][0], pts[i][0], t), lerp(pts[i - 1][1], pts[i][1], t)];
  };
  return { at, len: cum[cum.length - 1] };
};

type Walker = {
  id: string;
  look: Look;
  seat: Pt; // hol ül a földön
  stand: number; // mikor áll fel
  start: number; // mikor indul el
  path: Pt[]; // útvonal az ajtóig és ki a folyosóra (a seat az első pont)
  phase: number;
};

const SEAT_LOOK = (seat: Pt) => angTo(PROJ.x - seat[0], PROJ.z - seat[1]);

const Hall = (z: number): Pt[] => [
  [0.1, z],
  [0.1, z + 7],
  [0.1, z + 16],
];

export const WALKERS: Walker[] = [
  {
    id: "A",
    look: { skin: "#c68e6a", hair: "#2b1b12", top: "#6ee7ff", pants: "#16205c" },
    seat: [-5.3, -18.65],
    stand: 408,
    start: 418,
    path: [[-5.3, -18.65], [-3.6, -18.75], [-2.4, -18.8], [-1.85, -19.0], ...Hall(-19.0)],
    phase: 0,
  },
  {
    id: "B",
    look: { skin: "#f3d2b3", hair: "#d9a441", top: "#f4fbff", pants: "#26358a" },
    seat: [-7.35, -18.55],
    stand: 414,
    start: 424,
    path: [[-7.35, -18.55], [-6.2, -18.62], [-3.6, -18.75], [-2.4, -18.8], [-1.85, -19.0], ...Hall(-19.0)],
    phase: 1.3,
  },
  {
    id: "C",
    look: { skin: "#8d5a3b", hair: "#0e0e1a", top: "#ffd166", pants: "#16205c" },
    seat: [-5.45, -20.55],
    stand: 410,
    start: 420,
    path: [[-5.45, -20.55], [-4.6, -20.25], [-3.0, -20.25], [-2.4, -20.1], [-1.9, -19.55], [-1.5, -19.4], ...Hall(-19.4)],
    phase: 2.1,
  },
  {
    id: "D",
    look: { skin: "#e0ac88", hair: "#5a2a1a", top: "#7a5cff", pants: "#1c2a6e" },
    seat: [-6.95, -20.7],
    stand: 422,
    start: 434,
    path: [[-6.95, -20.7], [-6.0, -20.3], [-3.0, -20.25], [-2.4, -20.1], [-1.9, -19.55], [-1.5, -19.4], ...Hall(-19.4)],
    phase: 3.4,
  },
  {
    id: "F",
    look: { skin: "#d9a07a", hair: "#111111", top: "#ff9f45", pants: "#1c2a6e" },
    seat: [-7.9, -19.7],
    stand: 426,
    start: 438,
    path: [[-7.9, -19.7], [-7.3, -20.2], [-3.0, -20.25], [-2.4, -20.1], [-1.9, -19.55], [-1.5, -19.4], ...Hall(-19.4)],
    phase: 4.7,
  },
];

const STAND = 0.88; // csípőmagasság állva (a talp pont a padlón)
const swing = (phi: number, on: boolean) => {
  const sw = on ? Math.sin(phi) : 0;
  return {
    thL: 0.55 * sw,
    thR: -0.55 * sw,
    shL: on ? 0.15 + 0.7 * Math.max(0, Math.sin(phi + 1.2)) : 0,
    shR: on ? 0.15 + 0.7 * Math.max(0, Math.sin(phi + 1.2 + Math.PI)) : 0,
    sw,
  };
};

/** Állva néző diák: a kar, a törzs mozdulatlan, csak a fej követi a projektort. */
export const walkerPose = (w: Walker, f: number): Pose => {
  const path = makePath(w.path);
  const lookRy = SEAT_LOOK(w.seat);
  const turn = ease(f, w.stand, w.stand + 10);
  const walked = Math.max(0, (f - w.start) * SPEED);
  const [px, pz] = path.at(walked);
  const [qx, qz] = path.at(walked + 0.4);
  const heading = angTo(qx - px, qz - pz);
  const toDoor = angTo(path.at(0.6)[0] - w.seat[0], path.at(0.6)[1] - w.seat[1]);
  const ry = f < w.start ? lerpAng(lookRy, toDoor, turn) : heading;
  const walkingNow = f >= w.start && walked < path.len;
  const phi = walked * 4.5;
  const sg = swing(phi, walkingNow);
  const dist = Math.hypot(PROJ.x - w.seat[0], PROJ.z - w.seat[1]);
  const lookUp = -Math.atan2(2.5 - 1.6, dist) * 0.95; // a projektorra néz
  const headX = f < w.start ? lerp(lookUp, 0, turn) : 0;
  const relaxL: [number, number] = [0.04, 0.07];
  const relaxR: [number, number] = [0.04, -0.07];
  return {
    x: f < w.start ? w.seat[0] : px,
    y: walkingNow ? 0.02 * Math.abs(Math.sin(phi)) : 0,
    z: f < w.start ? w.seat[1] : pz,
    ry,
    hipY: STAND,
    lean: 0.02,
    thL: sg.thL,
    thR: sg.thR,
    shL: sg.shL,
    shR: sg.shR,
    armL: walkingNow ? [-0.7 * sg.sw, 0.05] : relaxL,
    armR: walkingNow ? [0.7 * sg.sw, -0.05] : relaxR,
    elL: -0.18,
    elR: -0.18,
    headX,
    headY: 0,
  };
};

// ---------- A széken álló diák (G) és a székmozgatás ----------
export const CHAIR_WORK: Pt = [-6.3, -18.95];
export const CHAIR_HOME: Pt = [-6.34, -17.9];
export const G_LOOK: Look = { skin: "#e8b896", hair: "#1a1a2e", top: "#ff3b4e", pants: "#1c2a6e" };
const G_HOP = 392;
const G_PUSH0 = 400;
const G_PUSH1 = 420;
const G_WALK = 424;

export const chairPos = (f: number): Pt => {
  const t = ease(f, G_PUSH0, G_PUSH1);
  return [lerp(CHAIR_WORK[0], CHAIR_HOME[0], t), lerp(CHAIR_WORK[1], CHAIR_HOME[1], t)];
};

const G_PATH: Pt[] = [[-6.3, -18.45], [-4.4, -18.75], [-2.4, -18.8], [-1.85, -19.0], ...Hall(-19.0)];

export const gPose = (f: number): Pose => {
  const base: Pose = {
    x: CHAIR_WORK[0],
    y: 0.475,
    z: CHAIR_WORK[1],
    ry: Math.PI,
    hipY: STAND,
    lean: 0.24,
    thL: 0,
    thR: 0,
    shL: 0,
    shR: 0,
    armL: [-2.7, 0.08],
    armR: [-2.7, -0.08],
    elL: -0.15,
    elR: -0.15,
    headX: -0.45,
    headY: 0,
  };
  if (f < G_HOP) {
    // babrál a projektoron: a mozdulat a saját ritmusa szerint megy, nem a fényre reagál
    const w = Math.sin(f * 0.45);
    const w2 = Math.sin(f * 0.31 + 1);
    return {
      ...base,
      lean: base.lean + 0.02 * Math.sin(f * 0.21),
      armL: [-2.7 + 0.1 * w, 0.08 + 0.04 * w2],
      armR: [-2.7 + 0.1 * w2, -0.08 - 0.04 * w],
      elL: -0.15 - 0.15 * w,
      elR: -0.15 - 0.15 * w2,
      headX: -0.45 + 0.04 * w2,
    };
  }
  if (f < G_PUSH0) {
    // lelép a székről, megfordul
    const t = ease(f, G_HOP, G_PUSH0);
    return {
      ...base,
      y: 0.475 * (1 - Easing.in(Easing.quad)(t)) + Math.sin(Math.PI * t) * 0.08,
      z: lerp(CHAIR_WORK[1], -19.55, t),
      ry: lerpAng(Math.PI, 0, ease(f, G_HOP + 2, G_PUSH0)),
      lean: lerp(0.24, 0.1, t),
      armL: [lerp(-2.7, -1.0, t), 0.08],
      armR: [lerp(-2.7, -1.0, t), -0.08],
      elL: -0.3,
      elR: -0.3,
      headX: lerp(-0.45, 0, t),
    };
  }
  if (f < G_WALK) {
    // tolja a széket a helyére: a diák a szék mögött halad
    const [, cz] = chairPos(f);
    const phi = (f - G_PUSH0) * 0.5;
    const sg = swing(phi, true);
    return {
      ...base,
      y: 0,
      x: CHAIR_WORK[0],
      z: cz - 0.6,
      ry: 0,
      lean: 0.18,
      thL: sg.thL * 0.7,
      thR: sg.thR * 0.7,
      shL: sg.shL * 0.4,
      shR: sg.shR * 0.4,
      armL: [-1.25, 0.12],
      armR: [-1.25, -0.12],
      elL: -0.25,
      elR: -0.25,
      headX: 0.02,
    };
  }
  const path = makePath(G_PATH);
  const walked = Math.max(0, (f - G_WALK) * SPEED);
  const [px, pz] = path.at(walked);
  const [qx, qz] = path.at(walked + 0.4);
  const turn = ease(f, G_WALK, G_WALK + 8);
  const phi = walked * 4.5;
  const moving = walked < path.len;
  const sg = swing(phi, moving);
  return {
    ...base,
    y: moving ? 0.02 * Math.abs(Math.sin(phi)) : 0,
    x: px,
    z: pz,
    ry: lerpAng(0, angTo(qx - px, qz - pz), turn),
    lean: 0.05,
    thL: sg.thL,
    thR: sg.thR,
    shL: sg.shL,
    shR: sg.shR,
    armL: [lerp(-1.25, -0.7 * sg.sw, turn), 0.05],
    armR: [lerp(-1.25, 0.7 * sg.sw, turn), -0.05],
    elL: -0.18,
    elR: -0.18,
    headX: 0,
  };
};

/** A teremben lévő összes diák (a világ használja). */
export const Students: FC<{ f: number }> = ({ f }) => {
  const els: React.ReactElement[] = [];
  for (const w of WALKERS) {
    const pose = walkerPose(w, f);
    // az ajtón kívül már nem kell rajzolni
    if (pose.z > -10 && pose.x > -0.3 && f > 440) continue;
    els.push(<Person key={w.id} pose={pose} look={w.look} />);
  }
  const g = gPose(f);
  if (!(g.z > -10 && g.x > -0.3)) els.push(<Person key="G" pose={g} look={G_LOOK} />);
  return <group>{els}</group>;
};
export { rnd, easeOut };
