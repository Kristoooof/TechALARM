// Helyszínek: elrendezés (voxel), környezet napszak szerint, szereplők, tárgyak, kijáratok.
import * as P from './prefabs.js';
import { PAL } from './prefabs.js';
import { desat, shade, mix } from './voxel.js';

const isDay = (s) => s.slot === 'delutan' || s.slot === 'reggel';

const NIGHT_POST = { bloom: 0.65, thr: 1.15, vignette: 0.48, tint: [0.95, 0.97, 1.08], lift: [0.012, 0.014, 0.03], contrast: 1.06, focus: 0.47, range: 0.46, tilt: 0.8, exposure: 1.1 };
const DAY_POST = { bloom: 0.35, thr: 1.3, vignette: 0.36, sat: 0.84, contrast: 1.02, tint: [0.95, 0.99, 1.06], lift: [0.02, 0.025, 0.035], focus: 0.47, range: 0.46, tilt: 0.8 };

function streetEnv(s) {
  if (isDay(s)) return {
    dayMode: true, bg: 0x7a8496, fog: 0x8590a2, fogDensity: 0.022, hemi: [0xc8d2e6, 0x3a3a44, 1.25], sun: [0xe6ecf8, 1.7], sunDir: [-6, 16, 9],
    lampMul: 0, streakK: 0.25, rain: { count: 900, opacity: 0.28, color: 0xc0cce0, speed: 13 }, rainVol: .7, post: DAY_POST,
  };
  return {
    bg: 0x070a16, fog: 0x0b1024, fogDensity: 0.022, hemi: [0x5a6aa0, 0x14121a, 1.0], sun: [0x9fb0ff, 0.9], sunDir: [-8, 14, 12],
    rain: { count: 1500, opacity: 0.3 }, post: NIGHT_POST,
  };
}

function interiorEnv(s, { warm = true, day = isDay(s) } = {}) {
  return {
    dayMode: day, bg: 0x050608, fog: 0x0a0b12, fogDensity: 0.012, hemi: day ? [0xb8c4d8, 0x4a4038, 1.5] : [0x8a86a8, 0x3a2a20, 1.25],
    sun: day ? [0xd0dcf0, 1.0] : [0xffd2a0, 0.6], sunDir: [-3, 10, 8], noStreaks: true, spriteGlow: 0.32,
    post: { ...(day ? DAY_POST : NIGHT_POST), bloom: day ? 0.4 : 0.7, thr: day ? 1.2 : 1.0, sat: day ? 0.92 : 1.0, focus: 0.45, range: 0.36, tilt: 0.7, tint: warm ? [1.04, 0.99, 0.94] : [0.96, 1.0, 1.04] },
    rainVol: .35,
  };
}

// ======================================================================
export const SCENES = {
  // ---------------------------------------------------------------- SOHO
  soho: {
    name: 'SOHO', sub: 'Dean Street', seed: 21, weather: 'eső',
    env: streetEnv,
    bounds: { x0: -23.5, x1: 23.5, z0: -6.6, z1: 4.3 },
    cam: { off: [0, 4.3, 11], offNarrow: [0, 6.4, 14.5], look: [0, 1.25, -1.6], x0: -16, x1: 16, z0: -5.2, z1: 1.6 },
    spawns: { default: [-12.5, -5.2, 0], office: [-12.5, -5.6, 0], theatre: [-5.2, -5.6, 0], taxi: [-3.5, -0.4, 1] },
    build(b, s, env) {
      const day = !!env.dayMode;
      P.ground(b, -30, 30, -8, -3.6, 'pave');
      P.ground(b, -30, 30, -3.6, 2.6, 'cobble');
      P.ground(b, -30, 30, 2.6, 6, 'pave');
      b.slab(b.m(-30), 0, b.m(-3.7), b.m(60), 0.3, 1, 0x5c5e66, 'wet');
      b.slab(b.m(-30), 0, b.m(2.5), b.m(60), 0.3, 1, 0x5c5e66, 'wet');
      for (const [x, z, w] of [[-9, -1.2, 2.2], [4, 0.6, 1.6], [12, -2.2, 1.2], [-16, 1.4, 1.8], [19, 3.6, 1.2], [-3, 3.9, 1]]) P.puddle(b, x, z, w, w * .5);
      // épületek
      P.building(b, { x0: -24, x1: -15.5, zf: -7, h: 8.5, wall: 0x1f3a2e, trim: 0xc9b98a, shop: { color: 0x1f3a2e, glow: 0xffb45a, k: 1.5, doorX: -21 }, winCols: 2, lit: .8, dayMode: day });
      P.sign(b, -19.75, 2.95, -6.45, 6.6, 0.62, 'THE DROWNED CROW', { color: '#ffd27a', bg: '#0f2219', glow: day ? 1 : 2.4, border: '#c9a24a' });
      P.building(b, { x0: -15.5, x1: -9.5, zf: -7, h: 11, wall: PAL.brickA, door: { x: -12.5, color: 0x1f3a2e }, winCols: 2, lit: .5, litFn: (w) => w.f === 0 || Math.random() < .3, dayMode: day });
      P.sign(b, -14.3, 1.5, -6.7, 1.4, 0.42, 'A. VALE · PRIVATE INQUIRIES', { color: '#e8e0c8', bg: '#2a2016', glow: day ? 1 : 1.5, border: '#a08050', size: 40 });
      P.building(b, { x0: -9.5, x1: -1, zf: -7, h: 12.5, wall: 0x8a7a64, trim: 0xd9cfb4, shop: { color: 0x5a0f1a, glow: 0xffd9a0, k: 1.3, doorX: -5.2 }, winCols: 3, lit: .2, groundH: 16, dayMode: day });
      // színházi előtető izzókkal
      const X0 = b.m(-9.3), X1 = b.m(-1.2);
      for (let x = X0; x < X1; x++) { b.v(x, 13, b.m(-6.5), 0x2a0a10); b.v(x, 13, b.m(-6.25), 0x2a0a10); if (x % 2 === 0) b.glow(x, 12, b.m(-6.0), 1, 1, 1, 0xfff0c8, day ? 1.1 : 2.0); }
      P.sign(b, -5.25, 3.75, -6.42, 7.6, 0.75, 'THE NIGHTINGALE THEATRE', { color: '#fff1c4', bg: '#3a0812', glow: day ? 1 : 2.8, border: '#d9a540' });
      P.poster(b, -3.1, 1.6, -6.48, 0.9, 1.2, 'show', { glow: 1.6 });
      // plakátfal
      P.building(b, { x0: -1, x1: 1.5, zf: -7, h: 6, wall: PAL.brickB, winCols: 0, chimney: false, dayMode: day });
      P.poster(b, -0.6, 1.5, -6.74, 0.85, 1.15, 'lyra_scratched', { glow: 1.3 });
      P.poster(b, 0.35, 1.55, -6.74, 0.85, 1.15, 'lyra_scratched', { glow: 1.3 });
      P.poster(b, 1.15, 1.45, -6.74, 0.55, 0.8, 'missing', { glow: 1.1 });
      P.building(b, { x0: 1.5, x1: 8, zf: -7, h: 9.5, wall: 0x5a3a2e, shop: { color: 0x2f4a3a, glow: 0xfff0d0, k: 1.1 }, winCols: 2, lit: .5, dayMode: day });
      P.awning(b, 1.6, 7.9, -6.95, 3.3, 0x2f4a3a, 0xe8e4da);
      P.flowerStand(b, 5.6, -5.7);
      // sikátor (a Lámpagyújtó helye)
      b.slab(b.m(8), 0, b.m(-12), b.m(1.5), b.m(9), 1, 0x14141a);
      P.building(b, { x0: 9.5, x1: 16, zf: -7, h: 10, wall: PAL.brickB, shop: { color: 0x3a2a1a, glow: 0xffc070, k: 1.4 }, winCols: 2, lit: .6, dayMode: day });
      P.sign(b, 12.75, 2.95, -6.45, 4.8, 0.55, 'FOG & COFFEE', { color: '#ffe0b0', bg: '#1d140c', glow: day ? 1 : 2, border: '#7a5a3a' });
      P.building(b, { x0: 16, x1: 25, zf: -7, h: 12, wall: PAL.brickC, door: { x: 21, color: 0x1a2340 }, winCols: 3, lit: .45, dayMode: day });
      P.building(b, { x0: -32, x1: -24, zf: -7, h: 10, wall: PAL.brickA, winCols: 2, lit: .3, dayMode: day });
      P.building(b, { x0: 25, x1: 32, zf: -7, h: 9, wall: 0x1f3a2e, winCols: 2, lit: .3, dayMode: day });
      // háttér
      P.skyline(b, -60, 60, -16, { lit: day ? 0.03 : 0.12, dayMode: day, col: day ? 0x4a5060 : 0x141828 });
      P.bigBen(b, 34, -80, { k: day ? 1.2 : 3.4, dark: day ? 0x4a4e5c : 0x232636 });
      // utcabútor
      for (const x of [-18, -6, 6, 18]) P.lamp(b, x, -4.15, { lit: !day, light: !day, intensity: 34, dist: 13 });
      if (!day) { b.light(-12, 2.2, 1.5, 0xffb070, 10, 10); b.light(12, 2.2, 1.5, 0xffb070, 10, 10); }
      P.phoneBox(b, 11.6, -4.6, { dayMode: day });
      P.postbox(b, -2.6, -4.3);
      P.bench(b, 21.5, -5.6);
      P.bin(b, -7.6, -4.4); P.bin(b, 8.9, 3.2);
      P.cab(b, -3.5, -2.55, { dayMode: day });
      P.bus(b, 18.5, 0.6, { dayMode: day });
      P.railing(b, -30, -13, 4.75); P.railing(b, -11, 11, 4.75); P.railing(b, 13, 30, 4.75);
      for (const x of [-23, -9.6, 1.8, 15.6]) P.bollard(b, x, 2.85);
      P.crate(b, 8.7, -6.4, 2);
    },
    npcs(s) {
      const day = isDay(s), list = [];
      list.push({ id: 'maggie', x: 3.6, z: -5.3, dir: 0, wander: .4 });
      if (!day) list.push({ id: 'tom', x: 13.6, z: -5.3, dir: 0 });
      list.push({ id: 'priya', x: -8.5, z: 3.4, dir: 0, wander: 1.6 });
      list.push({ id: 'dex', x: 6.8, z: 3.3, dir: 0, wander: .8 });
      if (!day && s.day >= 1) list.push({ id: 'harriet', x: -20.6, z: -5.5, dir: 2 });
      if (day && s.day >= 2 && s.day <= 4 && !s.facts.crane_left) list.push({ id: 'ozzie', x: -7.6, z: -5.6, dir: 0 });
      if (s.day === 1 && !day && !s.facts.saw_lamplighter) list.push({ id: 'lamplighter', x: 8.75, z: -7.4, dir: 0, solid: false, label: '???' });
      return list;
    },
    objects(s) {
      const day = isDay(s);
      return [
        { id: 'office', x: -12.5, z: -6.2, r: 1.2, label: 'Belépsz: Vale Nyomozóiroda', act: g => g.goto('office', 'street') },
        { id: 'theatre', x: -5.2, z: -6.2, r: 1.2, label: day ? 'Belépsz: Fülemüle Színház (hátsó ajtó)' : 'Fülemüle Színház (zárva)', act: g => day ? g.goto('theatre', 'street') : g.ui.mono('Az ajtón lánc. Mögötte csak a sötét előcsarnok és egy kartonból kivágott Fülemüle, aki senkire sem mosolyog.') },
        { id: 'plakat', x: 0.2, z: -6.1, r: 1.3, label: 'Megnézed a plakátokat', act: g => g.story.posters() },
        { id: 'taxi', x: -3.5, z: -1.55, r: 1.6, label: 'Fekete taxi: elmész innen (térkép)', act: g => g.leaveDistrict() },
        { id: 'phone', x: 11.6, z: -3.85, r: 1.0, label: 'Telefonfülke', act: g => g.story.phoneBox() },
        { id: 'pub', x: -21, z: -6.3, r: 1.0, label: 'A Vízbefúlt Varjú', act: g => g.ui.mono(day ? 'Délután a Varjú zárva. A pult mögött Harriet a poharakat törölgeti, és a sörcsap is alszik.' : 'Bentről nevetés, sörszag és egy rossz zongora hangja szűrődik ki. Kiskorúként nincs keresnivalód odabent.') },
      ];
    },
    async onEnter(g) { await g.story.enterSoho(); },
  },

  // ---------------------------------------------------------------- IRODA
  office: {
    name: 'VALE NYOMOZÓIRODA', sub: 'Dean Street 14., első emelet', seed: 5, weather: 'eső az ablakon',
    env: (s) => ({ ...interiorEnv(s, { warm: true, day: false }), dayMode: false }),
    bounds: { x0: -4.7, x1: 4.7, z0: -3.2, z1: 2.3 },
    cam: { off: [0, 4.4, 9.2], offNarrow: [0, 6.5, 12.5], look: [0, 1.15, -1.2], x0: -1.2, x1: 1.2, z0: -1, z1: 0.6 },
    spawns: { default: [3.6, 1.2, 1], street: [3.8, 1.4, 3], bed: [-2.6, 0.9, 2] },
    build(b) {
      P.room(b, -5, 5, -3.5, 2.6, 4.2, { wall: 0x2e3348, wainscot: 0x3a2516, floor: 'wood', sideH: 3.0 });
      P.backWindow(b, -1.6, 1.1, -3.5, 3.2, 2.3, { night: true, sky: 0x0e1730, k: 0.7 });
      P.rug(b, -2, 2.4, -1, 1.6, 0x3a1a1c);
      P.desk(b, 0.4, -1.6, { w: 2.6 });
      P.deskLamp(b, 1.3, 1.0, -1.9);
      b.box(b.m(-0.4), 4, b.m(-1.9), 3, 1, 2, PAL.paper);
      b.box(b.m(0.1), 4, b.m(-1.5), 1, 2, 1, 0xb07a30); // whiskysüveg
      P.chair(b, 0.4, -2.75);
      P.corkBoard(b, -3.3, 1.3, -3.5, 2.2, 1.5);
      P.bookshelf(b, 3.6, -3.5, { w: 1.8, h: 3.0 });
      P.coatRack(b, 4.3, -2.3);
      P.bed(b, -3.8, 1.1, { col: 0x2a3a5a, w: 1.0, l: 2.0 });
      P.plant(b, -4.4, -2.9);
      b.light(0, 3.8, 0.5, 0xffc88a, 14, 11);
      b.light(-1.5, 2.6, 2.4, 0xffb070, 8, 9);
      b.glow(b.m(-0.3), b.m(4.15), b.m(0.3), 3, 1, 3, 0xffe0b0, 2.2);
    },
    npcs(s) { return s.slot === 'ejjel' ? [] : [{ id: 'arthur', x: 0.4, z: -2.55, dir: 0 }]; },
    objects(s) {
      return [
        { id: 'board', x: -3.3, z: -2.9, r: 1.3, y: 2.9, label: 'Parafatábla: nyomok összekötése', act: g => g.story.board() },
        { id: 'door', x: 4.3, z: 1.6, r: 1.1, label: 'Lemész az utcára (Soho)', act: g => g.goto('soho', 'office') },
        { id: 'bed', x: -3.2, z: 0.9, r: 1.3, label: s.slot === 'este' || s.slot === 'ejjel' ? 'Lefekszel (éjszaka)' : 'Kanapé', act: g => g.story.bed() },
        { id: 'window', x: -0.1, z: -2.9, r: 1.0, y: 2.5, label: 'Kinézel az ablakon', act: g => g.story.windowLook() },
      ];
    },
    async onEnter(g) { await g.story.enterOffice(); },
  },

  // ---------------------------------------------------------------- KÓRHÁZ
  hospital: {
    name: 'SZENT TAMÁS KÓRHÁZ', sub: 'Florence-szárny, 3. kórterem', seed: 8, weather: 'eső',
    env: (s) => ({ ...interiorEnv(s, { warm: false }), bg: 0x05080a }),
    bounds: { x0: -4.7, x1: 4.7, z0: -3.2, z1: 2.3 },
    cam: { off: [0, 4.4, 9.2], offNarrow: [0, 6.5, 12.5], look: [0, 1.1, -1.2], x0: -1.2, x1: 1.2, z0: -1, z1: 0.6 },
    spawns: { default: [3.6, 1.3, 3] },
    build(b, s, env) {
      const day = !!env.dayMode;
      P.room(b, -5, 5, -3.5, 2.6, 4, { wall: 0xa9bdbb, wainscot: 0x6f8c8a, floor: 'hospital', sideH: 2.8 });
      P.backWindow(b, 1.6, 1.2, -3.5, 2.6, 2.0, { night: !day, sky: day ? 0x8a9ab0 : 0x0e1730, frame: 0xdfe6ea });
      P.hospitalBed(b, -0.8, -1.9);
      // Lyra a párnán: szőke haj
      b.box(b.m(-1.3), 5, b.m(-3.0), 3, 1, 2, 0xeadba8);
      b.box(b.m(-1.1), 5, b.m(-2.7), 2, 1, 1, 0xf5d6c6);
      P.monitor(b, 0.6, -2.9);
      P.chair(b, -2.6, -1.4, { col: 0x6a7a8a });
      b.box(b.m(-2.85), 3, b.m(-1.6), 2, 3, 1, 0x2a1838); // kabát a széken
      // rajongók virágai
      const fl = [0xd8233a, 0xf0c419, 0xe96fa5, 0xf5f0e6, 0x9a4fd1];
      for (let i = 0; i < 9; i++) { const x = b.m(-4.6 + i * 0.35); b.box(x, 0, b.m(-3.4), 1, 2, 1, 0x5d6b78); b.box(x, 2, b.m(-3.4), 1, 2, 1, fl[i % fl.length]); }
      P.plant(b, 4.3, -2.9);
      b.light(0, 3.6, 0, day ? 0xe0f0ff : 0x9fb8d8, day ? 12 : 9, 10);
      b.glow(b.m(-0.5), b.m(3.95), b.m(-0.2), 4, 1, 2, 0xe8f6ff, day ? 1.5 : 2.4);
    },
    npcs(s) {
      const l = [{ id: 'agnes', x: 2.5, z: -0.6, dir: 3, wander: .5 }];
      if (s.slot === 'este' && s.day === 3 && !s.facts.crane_left) l.push({ id: 'crane', x: -3.6, z: 0.2, dir: 2 });
      return l;
    },
    objects(s) {
      return [
        { id: 'lyra', x: -0.8, z: -0.7, r: 1.4, y: 1.5, label: 'Lyra Vance (alszik)', act: g => g.story.lyraBed() },
        { id: 'coat', x: -2.75, z: -0.9, r: 1.0, label: 'Lyra kabátja a széken', act: g => g.story.lyraCoat() },
        { id: 'door', x: 4.3, z: 1.6, r: 1.1, label: 'Elhagyod a kórházat (térkép)', act: g => g.leaveDistrict() },
      ];
    },
    async onEnter(g) { await g.story.enterHospital(); },
  },

  // ---------------------------------------------------------------- SZÍNHÁZ
  theatre: {
    name: 'FÜLEMÜLE SZÍNHÁZ', sub: 'Színfalak mögött', seed: 13, weather: 'eső a tetőn',
    env: (s) => ({ ...interiorEnv(s, { warm: true, day: false }), dayMode: false }),
    bounds: { x0: -6.7, x1: 6.7, z0: -3.2, z1: 2.3 },
    cam: { off: [0, 4.6, 10], offNarrow: [0, 6.8, 13.5], look: [0, 1.15, -1.2], x0: -3.2, x1: 3.2, z0: -1, z1: 0.6 },
    spawns: { default: [-6.0, 1.3, 2], street: [-6.0, 1.3, 2] },
    build(b, s) {
      P.room(b, -7, 7, -3.5, 2.6, 4.4, { wall: 0x3a1620, wainscot: 0x2a160e, floor: 'wood', sideH: 3.2 });
      // öltöző
      P.mirrorBulbs(b, -4.5, 1.3, -3.5, 1.6, 1.3);
      P.desk(b, -4.5, -2.6, { w: 1.8, col: 0xe8e4da });
      b.box(b.m(-4.9), 4, b.m(-2.8), 1, 2, 1, 0xe96fa5); b.box(b.m(-4.2), 4, b.m(-2.6), 2, 1, 1, PAL.paper);
      P.chair(b, -4.5, -1.6, { col: 0x5a0f1a, back: 1 });
      P.clothesRack(b, -6.0, -1.0, 1.6);
      // középen díszletek
      P.crate(b, -1.6, -2.9, 2); P.crate(b, -0.8, -2.9, 1);
      P.poster(b, 0.7, 1.9, -3.45, 0.9, 1.2, 'lyra', { glow: 1.1 });
      P.clothesRack(b, 1.2, 0.8, 1.8);
      // Crane irodája: válaszfal
      for (let z = b.m(-3.5); z < b.m(-1.2); z++) for (let y = 0; y < b.m(3.2); y++) b.v(b.m(3.0), y, z, y < 4 ? 0x2a160e : 0x2a1a24);
      b.collide(2.95, -3.5, 3.25, -1.2);
      P.desk(b, 5.0, -2.5, { w: 2.0, col: 0x1a1210 });
      P.deskLamp(b, 5.6, 1.0, -2.8, { color: 0x7d0c16 });
      b.box(b.m(4.4), 4, b.m(-2.6), 3, 1, 2, PAL.paper);
      P.chair(b, 5.0, -3.0);
      P.bookshelf(b, 6.2, -3.5, { w: 1.0, h: 2.6 });
      b.light(-2, 3.9, 0.5, 0xffd0a0, 12, 11);
      b.light(3, 3.2, 1.5, 0xffc090, 7, 9);
      b.glow(b.m(-2.4), b.m(4.3), b.m(0.2), 4, 1, 2, 0xffe0b0, 2);
      for (let i = 0; i < 12; i++) b.glow(b.m(-6.5 + i * 1.1), b.m(4.0), b.m(-3.3), 1, 1, 1, 0xfff0c8, 2.5);
    },
    npcs(s) {
      const l = [{ id: 'ozzie', x: -0.4, z: -0.3, dir: 0, wander: .8 }];
      if (!s.facts.crane_left && !s.facts.ivy_distracting) l.push({ id: 'crane', x: 5.0, z: -1.6, dir: 0 });
      if (s.facts.ivy_distracting) { l.push({ id: 'crane', x: -2.6, z: 1.2, dir: 3 }); l.push({ id: 'ivy', x: -3.4, z: 1.3, dir: 2 }); }
      return l;
    },
    objects(s) {
      return [
        { id: 'letter', x: -4.5, z: -2.0, r: 1.1, label: 'Lyra sminkasztala', act: g => g.story.dressingTable() },
        { id: 'cdesk', x: 5.0, z: -1.6, r: 1.2, label: 'Crane íróasztala', act: g => g.story.craneDesk() },
        { id: 'door', x: -6.3, z: 1.5, r: 1.1, label: 'Ki az utcára (Soho)', act: g => g.goto('soho', 'theatre') },
      ];
    },
    async onEnter(g) { await g.story.enterTheatre(); },
  },

  // ---------------------------------------------------------------- ISKOLA (udvar)
  school: {
    name: "ST. ALDRIC'S AKADÉMIA", sub: 'Belső udvar', seed: 31, weather: 'szitáló eső',
    env: (s) => ({ ...streetEnv({ slot: 'delutan' }), fogDensity: 0.02, rain: { count: 700, opacity: 0.25, color: 0xc0cce0, speed: 11 } }),
    bounds: { x0: -12, x1: 12, z0: -5.4, z1: 3.4 },
    cam: { off: [0, 4.3, 11], offNarrow: [0, 6.4, 14.5], look: [0, 1.25, -1.6], x0: -6, x1: 6, z0: -3.5, z1: 1.2 },
    spawns: { default: [10.5, 1.4, 3] },
    build(b) {
      P.ground(b, -20, 20, -9, -5.5, 'pave');
      P.ground(b, -20, 20, -5.5, 6, 'grass');
      P.ground(b, -1.5, 1.5, -5.5, 6, 'pave');
      P.ground(b, -20, 20, 0.6, 2.4, 'pave');
      const stone = 0x7d7666;
      P.building(b, { x0: -20, x1: -4, zf: -7.5, h: 11, wall: stone, trim: 0xc9c0aa, winCols: 4, winW: 4, winH: 9, lit: .3, groundH: 13, dayMode: true, chimney: false });
      P.building(b, { x0: 4, x1: 20, zf: -7.5, h: 11, wall: stone, trim: 0xc9c0aa, winCols: 4, winW: 4, winH: 9, lit: .3, groundH: 13, dayMode: true, chimney: false });
      // torony a bejárattal
      P.building(b, { x0: -4, x1: 4, zf: -7.0, h: 15, wall: shade(stone, 1.05), trim: 0xd9d0b8, door: { x: 0, color: 0x3a2516 }, winCols: 1, winW: 6, winH: 10, lit: .1, groundH: 13, dayMode: true });
      P.clockFace(b, 0, 12.2, -6.75, 1.0, { k: 1.1, col: 0xf0ead8, hands: 4 });
      P.sign(b, 0, 3.1, -6.62, 4.6, 0.5, "ST. ALDRIC'S ACADEMY · MDCCCLXII", { color: '#e8e0c8', bg: '#3a3428', glow: 1, border: '#a09070', size: 40 });
      P.tree(b, -8, -3.4, { leaves: 0x6a5a2a }); P.tree(b, 8, -3.6, { leaves: 0x8a4a1a }); P.tree(b, -14, 0, { bare: true }); P.tree(b, 15, -1, { leaves: 0x7a3a1a });
      P.bench(b, -4.2, -3.0); P.bench(b, 5.5, -3.2); P.bench(b, 4.2, 3.0);
      P.fence(b, -20, -1.6, 4.3, 0x22252e); P.fence(b, 1.6, 20, 4.3, 0x22252e);
      for (const x of [-11, 11]) P.lamp(b, x, -4.8, { lit: false, light: false });
      P.skyline(b, -50, 50, -18, { lit: 0.02, dayMode: true, col: 0x4a5060 });
    },
    npcs(s) {
      return [
        { id: 'ivy', x: -4.2, z: -2.4, dir: 0 },
        { id: 'theo', x: 6.4, z: -2.4, dir: 3, wander: .6 },
        { id: 'nadia', x: 4.2, z: 2.5, dir: 0 },
      ];
    },
    objects() {
      return [{ id: 'gate', x: 10.8, z: 1.5, r: 1.4, label: 'Elhagyod az iskolát (térkép)', act: g => g.leaveDistrict() }];
    },
    async onEnter(g) { await g.story.enterSchool(); },
  },

  // ---------------------------------------------------------------- OSZTÁLYTEREM (reggeli jelenet)
  classroom: {
    name: "ST. ALDRIC'S AKADÉMIA", sub: '3. B osztályterem', seed: 33, weather: 'eső az ablakon',
    env: (s) => ({ ...interiorEnv(s, { warm: false, day: true }) }),
    bounds: { x0: -5.6, x1: 5.6, z0: -3.2, z1: 2.3 },
    cam: { off: [0, 4.8, 10.5], offNarrow: [0, 7, 14], look: [0, 1.1, -1.0], x0: 0, x1: 0, z0: -1, z1: -1 },
    spawns: { default: [-2.4, 1.3, 1] },
    build(b) {
      P.room(b, -6, 6, -3.5, 2.6, 4.2, { wall: 0x8a8070, wainscot: 0x4a3420, floor: 'wood', sideH: 3.2 });
      P.blackboard(b, -1.2, 1.1, -3.5, 4.2, 1.7);
      P.backWindow(b, 3.7, 1.1, -3.5, 2.2, 2.2, { night: false, sky: 0x8a9ab0, frame: 0xd9d0b8 });
      P.backWindow(b, -5.2, 1.1, -3.5, 1.6, 2.2, { night: false, sky: 0x8a9ab0, frame: 0xd9d0b8 });
      P.desk(b, -1.0, -2.3, { w: 1.6 });
      for (const x of [-2.4, 0, 2.4]) for (const z of [-0.3, 1.5]) P.schoolDesk(b, x, z);
      b.light(0, 3.8, 0, 0xe0ecff, 12, 11);
    },
    npcs() {
      return [
        { id: 'pembroke', x: -1.0, z: -2.95, dir: 0 },
        { id: 'theo', x: 0, z: -0.95, dir: 1 }, { id: 'nadia', x: 2.4, z: -0.95, dir: 1 }, { id: 'ivy', x: 2.4, z: 0.85, dir: 1 },
      ];
    },
    objects() { return []; },
  },

  // ---------------------------------------------------------------- ÁLOM: 13-AS PERON
  peron: {
    name: '13-AS PERON', sub: 'Az álmok pályaudvara', seed: 3, weather: 'köd', dream: true,
    env: () => ({
      bg: 0x06191a, fog: 0x0e3234, fogDensity: 0.028, hemi: [0x5aa8a8, 0x0a1012, 1.0], sun: [0x9ff5e6, 0.7], sunDir: [-6, 12, 10],
      motes: { count: 260, color: 0x9ff5e6, size: 0.05, rise: .2 }, streakK: 1.4,
      post: { bloom: 0.8, thr: 1.1, sat: 0.95, tint: [0.9, 1.04, 1.04], lift: [0, 0.02, 0.025], vignette: 0.58, wobble: 0.25, focus: 0.47, range: 0.44, tilt: 0.9 },
    }),
    bounds: { x0: -13, x1: 13, z0: -2.6, z1: 2.8 },
    cam: { off: [0, 4.4, 11.5], offNarrow: [0, 6.8, 15], look: [0, 1.3, -1.6], x0: -7, x1: 7, z0: 0, z1: 0 },
    spawns: { default: [-10, 1.2, 2] },
    build(b) {
      P.ground(b, -20, 20, -3, 3, 'platform');
      b.slab(b.m(-20), 0, b.m(2.7), b.m(40), 0.2, 1, 0xd9b84a, 'wet');
      b.slab(b.m(-20), -6, b.m(3), b.m(40), 5, b.m(4), 0x07090c);
      for (let x = -20; x < 20; x += 1.2) b.slab(b.m(x), -2, b.m(4.0), 2, 1, b.m(1.8), 0x2a2018);
      b.slab(b.m(-20), -1, b.m(4.4), b.m(40), 1, 1, 0x6a6a72, 'wet'); b.slab(b.m(-20), -1, b.m(5.4), b.m(40), 1, 1, 0x6a6a72, 'wet');
      P.train(b, -22, 22, -3.1, { lit: 0x9ff5e6, body: 0x1f4a46 });
      for (const x of [-9, -3, 3, 9]) { P.lamp(b, x, 1.9, { color: 0x9ff5e6, intensity: 18, dist: 9 }); }
      P.clockFace(b, -6, 4.6, -3.2, 0.9, { col: 0xd8fff6, k: 2.6 });
      P.clockFace(b, 6, 4.6, -3.2, 0.9, { col: 0xd8fff6, k: 2.6 });
      P.sign(b, 0, 4.4, -3.15, 3.2, 0.7, 'PLATFORM 13', { color: '#e8fff8', bg: '#0b2a28', glow: 2.6, border: '#d9a540' });
      P.bench(b, -6, 1.2); P.bench(b, 6, 1.2);
    },
    npcs() { return [{ id: 'kalauz', x: 0, z: -1.6, dir: 0 }]; },
    objects(s) {
      const both = s.truths.includes('t_senki') && s.truths.includes('t_otthon');
      const last = s.day >= 5;
      return [
        { id: 'grey', x: -6, z: -2.2, r: 1.4, y: 2.6, label: s.facts.grey_done ? 'Szürke Város (már jártál ott)' : 'Ajtó: Szürke Város', act: g => g.story.enterDream('grey') },
        { id: 'warm', x: 6, z: -2.2, r: 1.4, y: 2.6, label: s.facts.warm_done ? 'Napfény-ház (már jártál ott)' : 'Ajtó: Napfény-ház', act: g => g.story.enterDream('warm') },
        { id: 'stage', x: 0, z: -2.2, r: 1.0, y: 2.6, when: () => both || last, label: 'Arany ajtó: A Fülemüle Színpada', act: g => g.story.enterDream('stage') },
        { id: 'wake', x: -12.2, z: 0.5, r: 1.3, label: 'Felébredsz', act: g => g.story.wakeUp() },
      ];
    },
    async onEnter(g) { await g.story.enterPeron(); },
  },

  // ---------------------------------------------------------------- ÁLOM: SZÜRKE VÁROS
  grey: {
    name: 'SZÜRKE VÁROS', sub: 'Lyra álma · ahogy érzi magát', seed: 41, weather: 'szürke eső', dream: true,
    env: () => ({
      bg: 0x44444a, fog: 0x55555c, fogDensity: 0.022, hemi: [0xc0c0c8, 0x303034, 1.5], sun: [0xe0e0e8, 1.3], sunDir: [-6, 14, 9],
      rain: { count: 1800, opacity: 0.32, color: 0xc8c8d0, speed: 17 }, streakK: .5, spriteGlow: 0.2,
      colorMap: (h) => mix(desat(h, 0.94), 0x8a8a8e, 0.22),
      post: { bloom: 0.6, thr: 1.2, sat: 1.0, contrast: 1.1, tint: [0.98, 0.98, 1.0], vignette: 0.55, wobble: 0.15, focus: 0.47, range: 0.46, tilt: 0.85 },
    }),
    bounds: { x0: -29, x1: 29, z0: -6.4, z1: 4.0 },
    cam: { off: [0, 4.3, 11], offNarrow: [0, 6.4, 14.5], look: [0, 1.25, -1.6], x0: -21, x1: 21, z0: -5, z1: 1.5 },
    spawns: { default: [-27, 0, 2] },
    build(b) {
      P.ground(b, -40, 40, -8, -3.6, 'pave'); P.ground(b, -40, 40, -3.6, 2.6, 'cobble'); P.ground(b, -40, 40, 2.6, 6, 'pave');
      let x = -40, i = 0;
      while (x < 40) { const w = 6 + (i * 7 % 4); P.building(b, { x0: x, x1: x + w, zf: -7, h: 9 + (i * 5 % 6), wall: [PAL.brickA, PAL.brickB, PAL.stone][i % 3], winCols: 2, lit: 0.08 }); x += w; i++; }
      for (const bx of [-18, -4, 10]) P.billboard(b, bx, 1.4, -5.9, 2.6, 2.2, 'lyra', { glow: 1.35 });
      for (const lx of [-24, -12, 0, 12, 24]) P.lamp(b, lx, -4.15, { color: 0xe0e0e8, intensity: 14 });
      // buszmegálló a végén
      const X = b.m(24.5), Z = b.m(-5.6);
      b.box(X, 0, Z, 1, 10, 1, PAL.iron); b.box(X + 12, 0, Z, 1, 10, 1, PAL.iron); b.box(X, 10, Z - 2, 13, 1, 4, 0x3a3a3e);
      P.bench(b, 26, -5.6);
      P.sign(b, 26.0, 2.7, -5.35, 1.8, 0.4, 'NO. 13 · NOWHERE', { color: '#e0e0e0', bg: '#202024', glow: 1.4, border: '#888' });
      P.skyline(b, -60, 60, -16, { lit: 0.05, col: 0x18181c });
    },
    npcs(s) { return s.facts.grey_done ? [] : [{ id: 'lyraGrey', x: 26, z: -5.0, dir: 0 }]; },
    crowd() {
      return { count: 16, x0: -30, x1: 30, lanes: [-4.9, -2.4, 0.2, 2.2, 3.4], sprites: [S_grey('greyA'), S_grey('greyB'), S_grey('greyC')] };
    },
    enemies(s) {
      return [
        { key: 'grey_e1', type: 'faceless', x: -14, z: -1.5, battle: ['faceless', 'faceless'] },
        { key: 'grey_e2', type: 'umbrella', x: 3, z: 1.5, battle: ['umbrella'] },
        { key: 'grey_e3', type: 'faceless', x: 16, z: -2, battle: ['faceless', 'umbrella'] },
      ];
    },
    objects(s) {
      return [
        { id: 'bb1', x: -18, z: -4.6, r: 1.6, y: 3.2, label: 'Óriásplakát', act: g => g.ui.mono('„A FÜLEMÜLE — MINDENKI SZERETI.” A plakát színes, az egyetlen színes dolog az egész városban. Mintha minden színt ő szívna magába.') },
        { id: 'bb2', x: -4, z: -4.6, r: 1.6, y: 3.2, label: 'Óriásplakát', act: g => g.ui.mono('A plakáton a Fülemüle mosolya ugyanakkora, mint egy busz. Alatta apró betűkkel: „Lily Vance-t senki sem kereste.”') },
        { id: 'bb3', x: 10, z: -4.6, r: 1.6, y: 3.2, label: 'Óriásplakát', act: g => g.ui.mono('„Jegyek elfogytak. Mindörökre.” A plakát fénye vakít. A járókelők nem néznek fel rá. Rád sem.') },
        { id: 'back', x: -28.4, z: 0, r: 1.4, label: 'Vissza a 13-as peronra', act: g => g.story.backToPeron() },
      ];
    },
    async onEnter(g) { await g.story.enterGrey(); },
  },

  // ---------------------------------------------------------------- ÁLOM: NAPFÉNY-HÁZ
  warm: {
    name: 'NAPFÉNY-HÁZ', sub: 'Lyra álma · amire vágyik', seed: 51, weather: 'örök naplemente', dream: true,
    env: () => ({
      bg: 0xe8a070, fog: 0xf0b080, fogDensity: 0.03, hemi: [0xffd8a8, 0x6a3a2a, 0.9], sun: [0xffb070, 2.4], sunDir: [-14, 6, 6],
      motes: { count: 240, color: 0xffc8a0, size: 0.07, rise: .15 }, noStreaks: true,
      post: { bloom: 0.7, thr: 1.15, sat: 1.1, contrast: 1.02, tint: [1.08, 1.0, 0.9], lift: [0.03, 0.015, 0], vignette: 0.42, wobble: 0.18, focus: 0.47, range: 0.46, tilt: 0.85 },
    }),
    bounds: { x0: -15, x1: 15, z0: -4.6, z1: 3.6 },
    cam: { off: [0, 4.3, 11], offNarrow: [0, 6.4, 14.5], look: [0, 1.25, -1.6], x0: -8, x1: 8, z0: -3, z1: 1.2 },
    spawns: { default: [-13.5, 1.5, 2] },
    build(b) {
      P.ground(b, -30, 30, -10, 6, 'grass');
      P.ground(b, -30, 30, 0.8, 2.2, 0xc9a878);
      P.building(b, { x0: -7, x1: 7, zf: -6, h: 8, wall: 0xe8d8b8, trim: 0xffffff, door: { x: 0, color: 0x8a4a3a }, winCols: 3, winW: 5, lit: 1, curtain: 0xd98a8a, groundH: 12 });
      b.slab(b.m(-7.5), b.m(8), b.m(-9), b.m(15), 6, b.m(3.6), 0xa04a3a);
      P.fence(b, -30, -1.2, 3.8); P.fence(b, 1.2, 30, 3.8);
      P.swing(b, -10, -3.5);
      P.tree(b, -12, -5.5, { leaves: 0xe8806a }); P.tree(b, 11, -5, { leaves: 0xf0a070 }); P.tree(b, 14, 1, { leaves: 0xe86a6a });
      P.longTable(b, 3, -2.2, 4.4);
      for (const [cx, k] of [[-4.5, 1.6], [9, 2.4]]) P.clockFace(b, cx, 3.2, -5.8, 0.6, { col: 0xfff4e0, k: 1.2, hands: 7 });
      P.poster(b, -3.3, 2.0, -5.85, 0.8, 1.0, 'family', { glow: 1.4 });
      P.poster(b, 3.3, 2.0, -5.85, 0.8, 1.0, 'family', { glow: 1.4 });
    },
    npcs(s) {
      if (s.facts.warm_done) return [];
      return [
        { id: 'lyraMom', x: 5.6, z: -2.2, dir: 3 },
        { id: 'husband', x: 0.4, z: -2.2, dir: 2 },
        { id: 'kidA', x: 2.0, z: -1.2, dir: 1, wander: 1.2 },
        { id: 'kidB', x: 4.0, z: -1.0, dir: 1, wander: 1.5 },
      ];
    },
    enemies() {
      return [
        { key: 'warm_e1', type: 'porcelain', x: -6, z: 0.5, battle: ['porcelain', 'porcelain'] },
        { key: 'warm_e2', type: 'porcelain', x: 9, z: 1.6, battle: ['porcelain', 'umbrella'] },
      ];
    },
    objects() {
      return [
        { id: 'photo', x: -3.3, z: -5.1, r: 1.3, y: 2.6, label: 'Családi kép a falon', act: g => g.ui.mono('Egy családi fénykép. Mindenki mosolyog, de az arcok helyén csak fehér, üres ovális van. Mintha Lily nem tudná, milyen egy család arca.') },
        { id: 'clock', x: 9, z: -5.1, r: 1.3, y: 2.6, label: 'Megállt óra', act: g => g.ui.mono('Az óra hét órán áll. Vacsoraidő. Örökké vacsoraidő, és soha nem jön el a holnap.') },
        { id: 'back', x: -14.4, z: 1.5, r: 1.4, label: 'Vissza a 13-as peronra', act: g => g.story.backToPeron() },
      ];
    },
    async onEnter(g) { await g.story.enterWarm(); },
  },

  // ---------------------------------------------------------------- ÁLOM: SZÍNPAD
  stage: {
    name: 'A FÜLEMÜLE SZÍNPADA', sub: 'Az utolsó előadás', seed: 61, weather: 'reflektorfény', dream: true,
    env: () => ({
      bg: 0x0a0408, fog: 0x1a0a12, fogDensity: 0.02, hemi: [0x8a4a6a, 0x0a050a, 0.9], sun: [0xffe0c0, 0.5], sunDir: [0, 16, 6], noStreaks: true,
      motes: { count: 180, color: 0xffd27a, size: 0.05, rise: .1 },
      post: { bloom: 0.85, thr: 1.05, sat: 1.05, contrast: 1.1, tint: [1.06, 0.96, 1.0], vignette: 0.62, wobble: 0.2, focus: 0.48, range: 0.44, tilt: 0.9 },
    }),
    bounds: { x0: -8, x1: 8, z0: -2.0, z1: 2.4 },
    cam: { off: [0, 4.4, 13.5], offNarrow: [0, 6.8, 17], look: [0, 1.8, -2], x0: 0, x1: 0, z0: 0, z1: 0 },
    spawns: { default: [0, 2.0, 1] },
    build(b) {
      P.ground(b, -12, 12, -5, 2.8, 'stage');
      b.slab(b.m(-12), -4, b.m(2.8), b.m(24), 3, b.m(1), 0x2a0a12);
      for (let r = 0; r < 3; r++) for (let x = -11; x < 11; x += 0.75) { const X = b.m(x), Z = b.m(3.6 + r * 1.0), Y = -2 + r; b.box(X, Y, Z, 2, 3, 2, 0x5a0f1a, 'soft'); b.box(X, Y + 3, Z + 1, 2, 2, 1, 0x4a0c16, 'soft'); }
      P.curtain(b, -12, -4.2, -5, 7.5); P.curtain(b, 4.2, 12, -5, 7.5);
      b.slab(b.m(-12), b.m(7), b.m(-5), b.m(24), b.m(1.2), 2, 0x6a0a18, 'soft');
      P.cage(b, 0, -2.6, 2.0, 4.6);
      for (const x of [-6, 6]) P.spotlightRig(b, x, 7, -1);
      b.light(0, 6.5, -1.5, 0xfff0d8, 90, 16);
      b.light(-6, 5, 0.5, 0xff8aa0, 45, 14); b.light(6, 5, 0.5, 0x8ab0ff, 45, 14);
      b.light(0, 2.5, 3, 0xffd8b0, 20, 10);
    },
    npcs() { return []; },
    objects() { return []; },
    async onEnter(g) { await g.story.enterStage(); },
  },
};

// a tömeg szürke sprite-jai: az álomban a világ színtelen, csak a játékos és a plakátok színesek
import { SPRITES } from './content/world.js';
function S_grey(id) { return SPRITES[id]; }
export { isDay };
void mix;
