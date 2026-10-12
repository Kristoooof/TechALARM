import * as THREE from "three";
import { clamp } from "./theme";

// ---------- Időzítés a 3D jelenetben (képkockák) ----------
export const T = {
  enter: 230, // a kamera belép a terembe
  menuIn: 296,
  menuOut: 392,
  jump: 524, // idő-ugrás: este, lekapcsolt villany
  lapse: 582, // gyors időtelés kezdete
  msg: 760, // „nem történt semmi változás”
};
export const CYCLES = [60, 46, 36, 28, 22, 18, 16];
export const LAPSE_END = T.lapse + CYCLES.reduce((a, b) => a + b, 0);

const SUNSET = 17.9;

export const smooth = (x: number, a: number, b: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Az időtelés aktuális ciklusa és a cikluson belüli arány (0..1). */
export const lapseInfo = (f: number) => {
  if (f < T.lapse || f >= LAPSE_END) return { active: false, cycle: f < T.lapse ? 0 : CYCLES.length - 1, p: f < T.lapse ? 0 : 1 };
  let t = f - T.lapse;
  for (let i = 0; i < CYCLES.length; i++) {
    if (t < CYCLES[i]) return { active: true, cycle: i, p: t / CYCLES[i] };
    t -= CYCLES[i];
  }
  return { active: false, cycle: CYCLES.length - 1, p: 1 };
};

/** Napszak órában (0..24). */
export const hourAt = (f: number): number => {
  if (f < T.jump) return 15.2 + 1.2 * (f / T.jump);
  if (f < T.lapse) return 17.55 + (SUNSET - 17.55) * ((f - T.jump) / (T.lapse - T.jump));
  const li = lapseInfo(f);
  if (li.active) return (SUNSET + 24 * (li.cycle + li.p)) % 24;
  return SUNSET + 0.16 * clamp01((f - LAPSE_END) / 90);
};
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

/** Mennyezeti lámpák: 0..1. */
export const lightsAt = (f: number): number => {
  if (f < T.jump) return 1;
  const li = lapseInfo(f);
  if (!li.active) return 0;
  const wins = li.cycle < 3 ? [[0.1, 0.28], [0.34, 0.42]] : [[0.14, 0.34]];
  let v = 0;
  for (const [a, b] of wins) v = Math.max(v, smooth(li.p, a - 0.015, a) * (1 - smooth(li.p, b - 0.015, b)));
  return v;
};

/** Nap magassága: >0 nappal, <0 éjszaka (−1..1). */
export const elevation = (hour: number) => Math.sin((Math.PI * (hour - 6)) / 12);

const SKY: [number, string, string, string][] = [
  // óra, felső, közép, látóhatár
  [0, "#03061f", "#060c3a", "#0b1450"],
  [5, "#03061f", "#060c3a", "#0b1450"],
  [5.9, "#1a2260", "#6a5aa8", "#ff9a6a"],
  [7.2, "#4f86ff", "#8fb8ff", "#cfe6ff"],
  [10, "#3f7bff", "#7fb3ff", "#bfe0ff"],
  [16, "#3f7bff", "#7fb3ff", "#bfe0ff"],
  [17.4, "#3f6fe0", "#ffb36b", "#ffd29a"],
  [18, "#2a3fa0", "#ff7a45", "#ff9a50"],
  [18.7, "#101a68", "#5a3a8a", "#ff6a4a"],
  [19.7, "#03061f", "#060c3a", "#0b1450"],
  [24, "#03061f", "#060c3a", "#0b1450"],
];
export const skyColors = (hour: number) => {
  let i = 0;
  while (i < SKY.length - 2 && hour > SKY[i + 1][0]) i++;
  const [h0, ...c0] = SKY[i];
  const [h1, ...c1] = SKY[i + 1];
  const t = clamp01((hour - h0) / (h1 - h0));
  return [0, 1, 2].map((k) => new THREE.Color(c0[k]).lerp(new THREE.Color(c1[k]), t));
};

export type Env = ReturnType<typeof envAt>;

/** Minden fény- és égbeállítás egyetlen képkockához. */
export const envAt = (f: number) => {
  const hour = hourAt(f);
  const el = elevation(hour);
  const night = smooth(-el, -0.1, 0.35);
  const inRoom = smooth(f, 215, 250);
  const warm = smooth(0.45 - el, 0, 0.42); // alacsony nap → narancs
  const sunC = new THREE.Color("#fff3d6").lerp(new THREE.Color("#ff8a3a"), warm);
  const sunUp = smooth(el, -0.01, 0.03);
  const sunI = 3.6 * (0.62 + 0.38 * clamp01(el / 0.4)) * sunUp * inRoom;
  const moonI = 0.85 * night * inRoom;
  const ambC = new THREE.Color("#7d97ff").lerp(new THREE.Color("#3a4fb8"), night).lerp(new THREE.Color("#ffb890"), warm * 0.25 * (1 - night));
  const ambI = 0.8 - 0.4 * night;
  const head = f < 250 ? 9 : 9 - 6.2 * smooth(f, 250, 340);
  const shiftX = -(hour - 12) * 0.35;
  return {
    f,
    hour,
    el,
    night,
    warm,
    sunC,
    sunI,
    moonI,
    ambC,
    ambI,
    head: head * (1 - 0.35 * night),
    lights: lightsAt(f),
    shiftX,
    sunPos: [-6.75 - (hour - 12) * 2.2, 14 * Math.max(el, 0.04) + 1, -45] as [number, number, number],
    moonPos: [-8 + (hour > 12 ? hour - 24 : hour) * 0.5, 14, -45] as [number, number, number],
    sky: skyColors(hour),
  };
};
