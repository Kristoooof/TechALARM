// Összefűzi a sablont és a hang-elemeket: node build.mjs  →  ../composition/index.html
// és bemásolja a használt SFX-eket a composition/assets/sfx/ mappába.
import { copyFileSync, mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const SKILL_SFX = here("../../.claude/skills/brag/assets/sfx/");
const OUT = here("../composition/");

// [idő (s), fájl, hangerő, sáv]  — sávok: 11 gépelés · 12 UI · 13 ütések · 14 kártyák
const K = (n) => `keyboard/keypress-${String(n).padStart(3, "0")}.wav`;
const sfx = [];
const add = (t, f, v, tr) => sfx.push([Number(t.toFixed(3)), f, v, tr]);

// ---- 1 · Hook: gépelés (0,45 + i*0,095), a jelvény-pattanás
for (let i = 0; i < 17; i += 2) add(0.45 + i * 0.095, K(3 + ((i * 5) % 28)), 0.5, 11);
add(2.19, "impact/impactSoft_medium_001.ogg", 0.8, 13);

// ---- 2 · Problémák: cím + négy eszköz/kategória (minden második ütem)
add(3.52, "ui/click2.ogg", 0.45, 12);
[["drop_001", 4.02], ["drop_002", 5.02], ["drop_003", 6.02], ["drop_001", 7.02]].forEach(([f, t]) => add(t, `interface/${f}.ogg`, 0.6, 14));

// ---- 3 · Szóltam…
for (let i = 0; i < 4; i++) add(9.95 + i * 0.2, K(5 + i * 4), 0.45, 11);
for (let i = 0; i < 5; i++) add(11.15 + i * 0.2, K(9 + i * 3), 0.45, 11);
for (let i = 0; i < 5; i++) add(12.55 + i * 0.2, K(14 + i * 3), 0.45, 11);
add(13.9, "ui/click2.ogg", 0.4, 12);
add(14.02, "impact/impactSoft_medium_002.ogg", 0.85, 13);

// ---- átmenetek (törlések)
[9.52, 24.02, 60.02, 72.02, 84.02, 96.01].forEach((t) => add(t - 0.12, "impact/impactSoft_medium_000.ogg", 0.5, 13));

// ---- 4 · Logó (16,02 erős ütem)
add(16.02, "impact/impactSoft_medium_000.ogg", 0.9, 13);
add(16.1, "interface/bong_001.ogg", 0.45, 13);
add(17.02, "interface/drop_002.ogg", 0.5, 14);
add(18.52, "interface/drop_003.ogg", 0.5, 14);

// ---- 5 · Űrlap + elküldés
add(24.22, "casino/card-slide-1.ogg", 0.4, 14);
[26.3, 28.3, 30.3, 32.3, 34.3].forEach((t) => add(t, "interface/click_003.ogg", 0.7, 12));
[27.5, 31.5, 33.5].forEach((t) => add(t, "interface/select_008.ogg", 0.5, 12));
for (let i = 0; i < 3; i++) add(28.6 + i * 0.25, K(6 + i * 7), 0.5, 11);
for (let i = 0; i < 14; i++) add(34.6 + i * 0.126, K(2 + ((i * 7) % 30)), 0.4, 11);
add(37.0, "interface/click_002.ogg", 0.8, 12);
add(37.8, "impact/impactSoft_medium_003.ogg", 0.8, 13);
add(38.7, "impact/impactBell_heavy_000.ogg", 0.5, 13);
[39.6, 41.6, 43.6].forEach((t) => add(t, "interface/drop_001.ogg", 0.5, 14));

// ---- 7 · Admin lista (48,02 erős ütem)
add(48.02, "impact/impactSoft_medium_004.ogg", 0.9, 13);
add(48.37, "interface/drop_002.ogg", 0.6, 14);
[49.52, 50.02, 50.52].forEach((t) => add(t, "casino/card-slide-1.ogg", 0.35, 14));
[53.12, 56.42].forEach((t) => add(t, "interface/click_003.ogg", 0.7, 12));

// ---- 8 · Státusz + üzenet
add(62.32, "interface/click_003.ogg", 0.7, 12);
add(63.22, "interface/select_008.ogg", 0.5, 12);
for (let i = 0; i < 11; i++) add(64.42 + i * 0.21, K(4 + ((i * 6) % 28)), 0.4, 11);
add(67.62, "interface/click_002.ogg", 0.8, 12);
add(67.72, "interface/bong_001.ogg", 0.45, 13);
add(69.22, "interface/click_003.ogg", 0.7, 12);
add(69.92, "interface/select_008.ogg", 0.5, 12);
add(71.02, "impact/impactBell_heavy_004.ogg", 0.5, 13);

// ---- 9 · A bejelentő látja (72,02 erős ütem)
add(72.07, "casino/card-slide-1.ogg", 0.4, 14);
add(74.42, "interface/click_003.ogg", 0.7, 12);
for (let i = 0; i < 6; i++) add(74.82 + i * 0.22, K(8 + i * 4), 0.45, 11);
add(76.82, "interface/click_002.ogg", 0.8, 12);
add(77.32, "interface/drop_001.ogg", 0.5, 14);
add(77.62, "interface/drop_002.ogg", 0.55, 14);
add(79.02, "interface/drop_002.ogg", 0.55, 14);
add(80.42, "impact/impactBell_heavy_003.ogg", 0.6, 13);
add(81.42, "interface/drop_003.ogg", 0.5, 14);

// ---- 10 · Termek
[[85.52, "drop_001"], [86.52, "drop_002"], [87.52, "drop_003"]].forEach(([t, f]) => add(t, `interface/${f}.ogg`, 0.55, 14));
add(89.52, "casino/card-place-1.ogg", 0.4, 14);
add(91.52, "casino/card-slide-1.ogg", 0.4, 14);

// ---- 11 · Plakát (96,01 erős ütem)
add(96.01, "impact/impactSoft_medium_002.ogg", 0.9, 13);
add(97.01, "casino/card-slide-1.ogg", 0.4, 14);
add(98.51, "interface/drop_002.ogg", 0.5, 14);
add(102.51, "interface/bong_001.ogg", 0.4, 13);

// ---- 12 · Finálé (108,02 erős ütem)
add(108.02, "impact/impactSoft_medium_001.ogg", 0.9, 13);
add(108.1, "interface/bong_001.ogg", 0.5, 13);
add(109.52, "interface/drop_003.ogg", 0.5, 14);
add(111.02, "interface/click_003.ogg", 0.6, 12);
add(111.52, "casino/card-place-1.ogg", 0.5, 14);
add(113.02, "interface/drop_001.ogg", 0.5, 14);
add(115.02, "impact/impactBell_heavy_000.ogg", 0.7, 13);

sfx.sort((a, b) => a[0] - b[0]);

// a használt fájlok bemásolása
const used = new Set(sfx.map((s) => s[1]));
for (const f of used) {
  const dest = `${OUT}assets/sfx/${f}`;
  mkdirSync(dirname(dest), { recursive: true });
  if (!existsSync(SKILL_SFX + f)) throw new Error("hiányzó SFX: " + f);
  copyFileSync(SKILL_SFX + f, dest);
}

// zene: halk belépés, 114 s-tól lecsengés (a clip kezdetétől számított másodpercek)
const automation = {
  version: 1,
  lanes: [
    {
      target: "volume",
      points: [
        { t: 0, v: 0 },
        { t: 1.5, v: 0.55 },
        { t: 114, v: 0.55 },
        { t: 120, v: 0 },
      ],
    },
  ],
};
const attr = (o) => JSON.stringify(o).replace(/"/g, "&quot;");

let audio = `      <!-- zene: Happy Beats / Business Moves vol. 1 (ende.app), 120,19 BPM -->\n`;
audio += `      <audio id="bgm" src="assets/music/bgm.mp3" data-start="0" data-duration="120" data-track-index="10" data-volume="1" data-automation="${attr(automation)}"></audio>\n`;
audio += `      <!-- SFX (Kenney, CC0): mozgáshoz illesztve -->\n`;
const durCache = {};
const dur = (f) =>
  (durCache[f] ??= Math.ceil(parseFloat(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", `${OUT}assets/sfx/${f}`]).toString()) * 1000) / 1000);
// sávkiosztás: az első olyan sáv (11-től), ahol az előző hang már véget ért
const trackEnd = [];
sfx.forEach(([t, f, v], i) => {
  const d = dur(f);
  let k = 0;
  while (trackEnd[k] !== undefined && trackEnd[k] > t - 0.02) k++;
  trackEnd[k] = t + d;
  audio += `      <audio id="sfx-${i}" src="assets/sfx/${f}" data-start="${t}" data-duration="${d}" data-track-index="${11 + k}" data-volume="${v}"></audio>\n`;
});

const tpl = readFileSync(here("./index.template.html"), "utf8");
writeFileSync(`${OUT}index.html`, tpl.replace("<!--AUDIO-->", audio));
console.log(`index.html kész · ${sfx.length} SFX · ${used.size} fájl`);
