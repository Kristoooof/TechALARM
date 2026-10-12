import { Easing } from "remotion";

// „Sötét óra” hangulat: telített kékek, cián kiemelés, fehér
export const D = {
  void: "#040826",
  navy: "#071263",
  blue: "#1337e0",
  electric: "#2a5cff",
  cyan: "#6ee7ff",
  white: "#f4fbff",
  red: "#ff3b4e",
};

export const SEG = {
  world: 880, // 3D: folyosó, tanterem, diákok, időugrás
  card: 50, // átvezető kártya
  demo: 330, // TechALARM menü + telefon
  end: 150, // zárás
} as const;
export const DARK_TOTAL = SEG.world + SEG.card + SEG.demo + SEG.end;

export const easeIO = Easing.bezier(0.65, 0, 0.35, 1);
export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// A projektor villanásai a 3D jelenetben: [kezdő képkocka, hossz, erősség]
export const FLASHES: [number, number, number][] = [
  [262, 3, 1],
  [285, 2, 0.8],
  [302, 8, 1],
  [345, 3, 1],
  [357, 2, 0.7],
  [376, 2, 1],
  [386, 8, 1],
  [566, 5, 0.6], // üres teremben is megpróbálja
  [842, 6, 0.9],
];

export const flashAt = (f: number): number => {
  let v = 0;
  for (const [s, d, k] of FLASHES) {
    if (f >= s && f < s + d) {
      // gyors felfutás, apró villódzás
      const t = (f - s) / d;
      const fl = d > 4 ? 0.75 + 0.25 * Math.sin(f * 2.3) : 1;
      v = Math.max(v, k * fl * (1 - t * 0.35));
    }
  }
  return v;
};

/** Determinisztikus „zaj” 0..1 között. */
export const rnd = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
