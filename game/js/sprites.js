// Procedurális pixel-art: szereplő-spritelapok (3 irány × 4 képkocka), portrék, nagy Persona/árny képek.
import * as THREE from './three.js';

export const FW = 24, FH = 44; // képkocka mérete pixelben
export const PX = 0.05;        // egy pixel világegységben

function hexToRgb(h) { if (typeof h === 'number') return [(h >> 16) & 255, (h >> 8) & 255, h & 255]; const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function rgbStr(r, g, b) { return `rgb(${r | 0},${g | 0},${b | 0})`; }
export function dk(c, f = .7) { const [r, g, b] = hexToRgb(c); return rgbStr(r * f, g * f, b * f); }
export function lt(c, f = .25) { const [r, g, b] = hexToRgb(c); return rgbStr(r + (255 - r) * f, g + (255 - g) * f, b + (255 - b) * f); }
function css(c) { return typeof c === 'number' ? '#' + c.toString(16).padStart(6, '0') : c; }

// körvonal: minden átlátszó pixel, aminek van nem átlátszó szomszédja, sötét lesz
export function outline(ctx, x0, y0, w, h, col = [10, 9, 18]) {
  const img = ctx.getImageData(x0, y0, w, h), d = img.data, src = new Uint8ClampedArray(d);
  const a = (x, y) => (x < 0 || y < 0 || x >= w || y >= h) ? 0 : src[(y * w + x) * 4 + 3];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4;
    if (src[i + 3] > 0) continue;
    let n = -1;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (a(x + dx, y + dy) > 0) { n = ((y + dy) * w + (x + dx)) * 4; break; }
    if (n >= 0) { d[i] = Math.min(col[0], src[n] * .25); d[i + 1] = Math.min(col[1] + 6, src[n + 1] * .22); d[i + 2] = Math.min(col[2] + 14, src[n + 2] * .3 + 8); d[i + 3] = 255; }
  }
  ctx.putImageData(img, x0, y0);
}

class P {
  constructor(ctx, ox, oy, flip = false, w = FW) { this.c = ctx; this.ox = ox; this.oy = oy; this.flip = flip; this.w = w; }
  r(x, y, w, h, col) {
    if (!col || w <= 0 || h <= 0) return;
    this.c.fillStyle = css(col);
    const X = this.flip ? this.w - x - w : x;
    this.c.fillRect(this.ox + X, this.oy + y, w, h);
  }
  p(x, y, col) { this.r(x, y, 1, 1, col); }
  // árnyékolt téglalap: jobb oldali harmad sötétebb
  sh(x, y, w, h, col, side = 1) {
    this.r(x, y, w, h, col);
    const sw = Math.max(1, Math.round(w * .3));
    if (side > 0) this.r(x + w - sw, y, sw, h, dk(col, .72)); else this.r(x, y, sw, h, dk(col, .72));
  }
  // kitöltött ellipszis
  el(cx, cy, rx, ry, col) {
    for (let y = -ry; y <= ry; y++) for (let x = -rx; x <= rx; x++) if ((x * x) / (rx * rx + .5) + (y * y) / (ry * ry + .5) <= 1) this.p(cx + x, cy + y, col);
  }
}

// ---------------- emberalakok ----------------
// d: { skin, hair, hairStyle, top, topStyle, accent, legs, shoes, hat, hatColor, extra, eyes, kid, faceless, lips, beard, glasses }
function drawFigure(ctx, ox, oy, d, dir, frame) {
  const flip = dir === 3; // balra néző oldalnézet = tükrözött jobbra néző
  const side = dir === 2 || dir === 3;
  const back = dir === 1;
  const p = new P(ctx, ox, oy, flip);
  const kid = d.kid ? 4 : 0;
  const walk = frame === 1 ? 1 : frame === 3 ? -1 : 0;
  const bob = walk !== 0 ? 1 : 0;
  const Y = kid + bob; // függőleges eltolás (gyerek alacsonyabb)
  const skin = d.skin ?? '#e9b994', hair = d.hair ?? '#2a1b14', top = d.top ?? '#2b3350', legs = d.legs ?? '#1d1f29', shoes = d.shoes ?? '#121217';
  const ts = d.topStyle ?? 'coat';
  const longCoat = ts === 'trench' || ts === 'coat' || ts === 'dress' || ts === 'gown' || ts === 'robe' || ts === 'nurse';

  // --- lábak ---
  const legTop = 28 + (kid ? 0 : 0), legBot = 37;
  if (!(ts === 'gown' || ts === 'robe')) {
    if (side) {
      const a = walk * 2;
      p.sh(10 + a, legTop + Y - bob, 3, legBot - legTop - (walk ? 0 : 0), legs);
      p.sh(11 - a, legTop + Y - bob, 3, legBot - legTop, dk(legs, .85));
      p.r(10 + a, legBot + Y - bob, 4, 2, shoes); p.r(11 - a, legBot + Y - bob, 4, 2, dk(shoes, .8));
    } else {
      const lOff = walk > 0 ? -1 : 0, rOff = walk < 0 ? -1 : 0;
      p.sh(8, legTop + Y + lOff, 3, legBot - legTop, legs);
      p.sh(13, legTop + Y + rOff, 3, legBot - legTop, legs);
      p.r(7, legBot + Y + lOff, 4, 2, shoes); p.r(13, legBot + Y + rOff, 4, 2, shoes);
    }
  } else {
    p.r(9, legBot + Y, 3, 2, shoes); p.r(13, legBot + Y, 3, 2, shoes);
  }

  // --- törzs ---
  const tY = 17 + Y;
  const tw = side ? 8 : 10, tx = side ? 8 : 7;
  let coatEnd = longCoat ? (ts === 'gown' || ts === 'robe' ? 38 : ts === 'dress' || ts === 'nurse' ? 33 : 33) : 29;
  coatEnd += Y;
  // szoknya/kabát alsó rész kiszélesedik
  for (let y = tY; y < coatEnd; y++) {
    const t = (y - tY) / (coatEnd - tY);
    const flare = longCoat && y > 27 + Y ? Math.round((y - 27 - Y) * (ts === 'gown' || ts === 'dress' ? .6 : .35)) : 0;
    const x0 = tx - flare, w = tw + flare * 2;
    p.r(x0, y, w, 1, top);
    p.r(x0 + w - Math.max(2, Math.round(w * .3)), y, Math.max(2, Math.round(w * .3)), 1, dk(top, .72));
    if (ts === 'trench' && y > 27 + Y && !side) p.p(12, y, dk(top, .55)); // kabát nyílás
    void t;
  }
  // vállak
  p.r(tx - 1, tY + 1, tw + 2, 2, top);
  // részletek
  if (!back) {
    if (ts === 'trench' || ts === 'coat') {
      if (!side) { p.r(11, tY, 2, 6, d.accent ?? dk(top, .5)); p.r(10, tY, 1, 3, lt(top, .2)); p.r(13, tY, 1, 3, lt(top, .2)); p.r(tx, 24 + Y, tw, 1, dk(top, .55)); p.p(12, 24 + Y, '#c9a24a'); }
      else { p.r(14, tY, 2, 5, lt(top, .15)); p.r(tx, 24 + Y, tw, 1, dk(top, .55)); }
    } else if (ts === 'blazer') {
      if (!side) { p.r(11, tY, 2, 5, '#e8e4da'); p.p(11, tY + 1, d.accent ?? '#8f1426'); p.r(11, tY + 2, 2, 4, d.accent ?? '#8f1426'); p.p(9, tY + 4, '#d9a540'); p.r(tx, 27 + Y, tw, 2, legs); }
      else p.r(tx, 27 + Y, tw, 2, legs);
    } else if (ts === 'police') {
      if (!side) { for (let i = 0; i < 4; i++) p.p(12, tY + 2 + i * 2, '#c9c9c9'); p.r(tx, 25 + Y, tw, 1, '#111'); p.r(9, tY + 3, 2, 1, '#9fb3d0'); }
    } else if (ts === 'nurse') {
      if (!side) { p.r(11, tY + 1, 2, 4, '#e8e4da'); p.r(11, tY + 2, 2, 1, '#c81e2e'); p.r(tx, 24 + Y, tw, 1, '#e8e4da'); }
    } else if (ts === 'apron') {
      if (!side) { p.r(8, tY + 3, 8, 12, d.accent ?? '#e7dfc8'); p.r(8, tY + 3, 8, 1, dk(d.accent ?? '#e7dfc8', .8)); } else p.r(13, tY + 3, 3, 12, d.accent ?? '#e7dfc8');
    } else if (ts === 'hoodie') {
      if (!side) { p.r(10, tY + 6, 4, 3, dk(top, .7)); p.p(11, tY + 1, '#ddd'); p.p(12, tY + 1, '#ddd'); }
    } else if (ts === 'vest') {
      if (!side) { p.r(11, tY, 2, 11, '#e8e4da'); p.r(9, tY, 2, 11, dk(top, .8)); p.r(13, tY, 2, 11, dk(top, .8)); p.p(12, tY + 2, d.accent ?? '#111'); }
    } else if (ts === 'dress' || ts === 'gown') {
      if (!side) { p.r(9, tY, 6, 1, lt(top, .25)); p.r(tx, 23 + Y, tw, 1, d.accent ?? dk(top, .6)); }
    } else if (ts === 'suit') {
      if (!side) { p.r(11, tY, 2, 6, '#e8e4da'); p.r(11, tY + 1, 2, 5, d.accent ?? '#7d0c16'); p.r(tx, 27 + Y, tw, 2, top); }
    }
    if (d.scarf) { p.r(tx, tY, tw, 2, d.scarf); if (!side) p.r(13, tY + 2, 2, 4, d.scarf); }
  } else {
    if (d.scarf) p.r(tx, tY, tw, 2, d.scarf);
    if (ts === 'trench' || ts === 'coat') p.r(tx, 24 + Y, tw, 1, dk(top, .55));
  }

  // --- karok ---
  const armC = ts === 'nurse' || ts === 'police' ? top : top;
  const handC = d.gloves ?? skin;
  if (side) {
    const a = walk * 2;
    p.sh(11 + a, tY + 2, 3, 8, dk(armC, .9));
    p.r(11 + a, tY + 10, 3, 2, handC);
  } else {
    const swingL = walk, swingR = -walk;
    p.sh(tx - 3, tY + 2 + Math.max(0, swingL), 3, 9, armC);
    p.sh(tx + tw, tY + 2 + Math.max(0, swingR), 3, 9, armC);
    if (!back) { p.r(tx - 3, tY + 11 + Math.max(0, swingL), 3, 2, handC); p.r(tx + tw, tY + 11 + Math.max(0, swingR), 3, 2, handC); }
  }

  // --- fej ---
  const hY = 5 + Y;
  const hx = side ? 7 : 7, hw = side ? 10 : 10, hh = 11;
  p.r(11, hY + hh - 1, 3, 2, dk(skin, .85)); // nyak
  // arc
  p.r(hx + 1, hY, hw - 2, hh, skin); p.r(hx, hY + 1, hw, hh - 3, skin);
  p.r(hx + hw - 3, hY + 1, 2, hh - 3, dk(skin, .88));
  if (d.faceless) {
    p.r(hx + 1, hY, hw - 2, hh, '#cfd2d8'); p.r(hx, hY + 1, hw, hh - 3, '#cfd2d8'); p.r(hx + hw - 3, hY + 1, 2, hh - 3, '#a6a9b2');
  }
  // haj
  const hs = d.hairStyle ?? 'short';
  if (hs !== 'bald') {
    p.r(hx, hY - 1, hw, 4, hair);
    p.r(hx + 1, hY - 2, hw - 2, 1, hair);
    p.r(hx + hw - 3, hY - 1, 3, 3, dk(hair, .75));
    if (back) {
      p.r(hx, hY, hw, hh - 2, hair); p.r(hx + hw - 3, hY, 3, hh - 2, dk(hair, .75));
      if (hs === 'long' || hs === 'ponytail') p.r(hx + 1, hY + hh - 2, hw - 2, 7, hair);
      if (hs === 'bob') p.r(hx, hY + hh - 2, hw, 2, hair);
      if (hs === 'bun') p.el(12, hY - 2, 2, 2, hair);
    } else if (side) {
      p.r(hx, hY, 4, hh - 3, hair); p.r(hx + 4, hY + 2, 1, 1, hair);
      if (hs === 'long') p.r(hx, hY + 2, 4, 13, hair);
      if (hs === 'ponytail') { p.r(hx - 2, hY + 2, 3, 7, hair); }
      if (hs === 'bob') p.r(hx, hY + 2, 5, 8, hair);
      if (hs === 'bun') p.el(hx, hY, 2, 2, hair);
      if (hs === 'messy') { p.p(hx + 6, hY - 3, hair); p.p(hx + 2, hY - 3, hair); }
    } else {
      // frufru
      p.r(hx, hY + 2, 2, 4, hair); p.r(hx + hw - 2, hY + 2, 2, 4, dk(hair, .8));
      if (hs === 'short' || hs === 'messy') { p.r(hx + 2, hY + 2, 3, 1, hair); p.p(hx + 6, hY + 2, hair); }
      if (hs === 'messy') { p.p(hx + 1, hY - 3, hair); p.p(hx + 5, hY - 3, hair); p.p(hx + 8, hY - 2, hair); p.r(hx + 3, hY + 2, 4, 2, hair); }
      if (hs === 'long') { p.r(hx - 1, hY + 2, 3, 15, hair); p.r(hx + hw - 2, hY + 2, 3, 15, dk(hair, .8)); p.r(hx + 2, hY + 2, 6, 1, hair); }
      if (hs === 'bob') { p.r(hx - 1, hY + 2, 3, 9, hair); p.r(hx + hw - 2, hY + 2, 3, 9, dk(hair, .8)); p.r(hx + 2, hY + 2, 6, 2, hair); }
      if (hs === 'ponytail') { p.r(hx + 2, hY + 2, 6, 1, hair); }
      if (hs === 'bun') { p.el(12, hY - 3, 2, 2, hair); p.r(hx + 2, hY + 2, 6, 1, hair); }
      if (hs === 'slick') { p.r(hx + 2, hY + 2, 2, 1, hair); }
    }
  }
  // szemek / arc
  if (!back && !d.faceless) {
    const eye = d.eyes ?? '#1a1420';
    if (side) {
      p.r(hx + 7, hY + 5, 1, 2, eye); p.p(hx + 9, hY + 7, dk(skin, .8));
      if (d.glasses) { p.r(hx + 6, hY + 4, 3, 1, '#222'); }
    } else {
      p.r(hx + 2, hY + 5, 2, 2, '#f4f1ea'); p.r(hx + 6, hY + 5, 2, 2, '#f4f1ea');
      p.r(hx + 3, hY + 5, 1, 2, eye); p.r(hx + 6, hY + 5, 1, 2, eye);
      p.r(hx + 2, hY + 4, 2, 1, dk(hair, .9)); p.r(hx + 6, hY + 4, 2, 1, dk(hair, .9));
      if (d.lips) p.r(hx + 4, hY + 8, 2, 1, d.lips); else p.r(hx + 4, hY + 8, 2, 1, dk(skin, .7));
      if (d.blush) { p.p(hx + 1, hY + 7, d.blush); p.p(hx + 8, hY + 7, d.blush); }
      if (d.glasses) { p.r(hx + 1, hY + 4, 4, 1, '#222'); p.r(hx + 5, hY + 4, 4, 1, '#222'); p.r(hx + 1, hY + 4, 1, 3, '#222'); p.r(hx + 8, hY + 4, 1, 3, '#222'); }
      if (d.beard) { p.r(hx + 1, hY + 7, hw - 2, 4, d.beard); p.r(hx + 4, hY + 8, 2, 1, dk(d.beard, .6)); }
      if (d.mask) { p.r(hx + 1, hY + 3, hw - 2, 4, d.mask); p.r(hx + 2, hY + 4, 2, 2, '#ffd27a'); p.r(hx + 6, hY + 4, 2, 2, '#ffd27a'); }
    }
  }
  if (d.faceless && !back && !side) { p.r(hx + 2, hY + 5, 6, 1, '#b8bbc4'); }

  // --- kalapok ---
  const hat = d.hat, hc = d.hatColor ?? '#1b1c22';
  if (hat === 'fedora') { p.r(hx - 2, hY + 1, hw + 4, 2, hc); p.r(hx + 1, hY - 4, hw - 2, 5, hc); p.r(hx + 1, hY - 1, hw - 2, 1, d.hatBand ?? '#5a1420'); p.r(hx + hw - 4, hY - 4, 3, 5, dk(hc, .7)); }
  if (hat === 'cap') { p.r(hx, hY - 3, hw, 4, hc); if (!back) p.r(side ? hx + 6 : hx + 1, hY + 1, side ? 6 : 8, 1, dk(hc, .7)); }
  if (hat === 'beanie') { p.r(hx, hY - 3, hw, 5, hc); p.r(hx, hY + 1, hw, 1, dk(hc, .7)); p.p(12, hY - 4, lt(hc, .3)); }
  if (hat === 'helmet') { p.r(hx + 1, hY - 6, hw - 2, 8, hc); p.r(hx + 2, hY - 8, hw - 4, 2, hc); p.p(12, hY - 9, '#c9c9c9'); if (!back) p.r(11, hY - 4, 2, 2, '#d9d9d9'); p.r(hx + hw - 4, hY - 6, 3, 8, dk(hc, .7)); }
  if (hat === 'nurse') { p.r(hx + 1, hY - 3, hw - 2, 3, '#f4f1ea'); if (!back) p.r(11, hY - 3, 2, 2, '#c81e2e'); }
  if (hat === 'tophat') { p.r(hx - 1, hY, hw + 2, 2, hc); p.r(hx + 1, hY - 8, hw - 2, 9, hc); p.r(hx + 1, hY - 2, hw - 2, 1, '#7d0c16'); p.r(hx + hw - 4, hY - 8, 3, 9, dk(hc, .7)); }
  if (hat === 'conductor') { p.r(hx, hY - 3, hw, 4, hc); p.r(hx - 1, hY + 1, hw + 2, 1, dk(hc, .6)); if (!back) p.r(11, hY - 2, 2, 2, '#d9a540'); }

  // --- kellékek ---
  const ex = d.extra;
  if (ex === 'umbrella' && !back) {
    const ux = side ? 13 : 17;
    p.r(ux, tY - 12, 1, 22, '#222');
    for (let i = 0; i < 6; i++) p.r(ux - 9 + i, tY - 13 - i + (i > 2 ? (i - 2) * 2 : 0), 19 - i * 2, 1, i % 2 ? (d.umbrella ?? '#111318') : dk(d.umbrella ?? '#111318', .8));
  }
  if (ex === 'accordion' && !back) { p.r(7, tY + 5, 10, 6, '#7a1b1b'); for (let i = 0; i < 5; i++) p.r(8 + i * 2, tY + 5, 1, 6, '#2a0a0a'); p.r(7, tY + 5, 2, 6, '#d9cfb4'); }
  if (ex === 'flowers' && !back) { p.r(14, tY + 6, 4, 6, '#2c5a2c'); p.el(15, tY + 5, 2, 2, '#d8233a'); p.p(17, tY + 4, '#f0c419'); }
  if (ex === 'newspaper' && !back) { p.r(side ? 12 : 15, tY + 4, 5, 7, '#e7dfc8'); p.r(side ? 13 : 16, tY + 5, 3, 1, '#333'); p.r(side ? 13 : 16, tY + 7, 3, 1, '#666'); }
  if (ex === 'cane' && !back) { p.r(18, tY + 8, 1, 14, '#3a2516'); }
  if (ex === 'clipboard' && !back) { p.r(15, tY + 4, 5, 7, '#7a5a3a'); p.r(16, tY + 5, 3, 5, '#f4f1ea'); }
  if (ex === 'cigarette' && !back && !side) { p.r(hx + 7, hY + 8, 3, 1, '#e8e4da'); p.p(hx + 10, hY + 8, '#ff6a2a'); }
  if (ex === 'lantern' && !back) { p.r(17, tY + 9, 1, 3, '#222'); p.r(16, tY + 12, 3, 4, '#ffd27a'); p.r(16, tY + 12, 3, 1, '#222'); }
  if (ex === 'book' && !back) { p.r(14, tY + 6, 5, 6, '#3a1d5a'); p.r(14, tY + 6, 1, 6, '#d9a540'); }
}

const sheetCache = new Map();
// spritelap: 4 oszlop (képkockák) × 4 sor (le, fel, jobbra, balra)
export function makeSheet(d) {
  const key = JSON.stringify(d);
  if (sheetCache.has(key)) return sheetCache.get(key);
  const c = document.createElement('canvas');
  c.width = FW * 4; c.height = FH * 4;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  for (let dir = 0; dir < 4; dir++) for (let f = 0; f < 4; f++) {
    drawFigure(ctx, f * FW, dir * FH + 4, d, dir, f);
    outline(ctx, f * FW, dir * FH, FW, FH);
  }
  sheetCache.set(key, c);
  return c;
}

export function sheetTexture(d) {
  const tex = new THREE.CanvasTexture(makeSheet(d));
  tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.NearestFilter; tex.generateMipmaps = false;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.repeat.set(1 / 4, 1 / 4);
  return tex;
}
export function setFrame(tex, dir, frame) {
  tex.offset.set(frame / 4, 1 - (dir + 1) / 4);
}

// portré (fej + váll) a párbeszédablakba
export function drawPortrait(canvas, d) {
  const sheet = makeSheet(d);
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const kid = d.kid ? 4 : 0;
  // forrás: 1. képkocka, lefelé néz; a fej környéke
  const sx = 2, sy = 3 + kid, sw = 20, sh = 20;
  const s = canvas.width / sw;
  ctx.drawImage(sheet, sx, sy, sw, sh, 0, 0, sw * s, sh * s);
}

// ---------------- nagy képek (Persona, árnyak) ----------------
function bigCanvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; c.getContext('2d', { willReadFrequently: true }); return c; }

// szimmetrikus rajz: a bal felet rajzoljuk, tükrözzük
function sym(ctx, w, h, fn) {
  fn(new P(ctx, 0, 0, false, w));
  const img = ctx.getImageData(0, 0, w / 2, h);
  const t = bigCanvas(w / 2, h); t.getContext('2d').putImageData(img, 0, 0);
  ctx.save(); ctx.translate(w, 0); ctx.scale(-1, 1); ctx.drawImage(t, 0, 0); ctx.restore();
}

export const BIG = {
  // Dupin — a főhős Personája: hollómaszkos, köpenyes nyomozó, tollpenge
  dupin() {
    const w = 64, h = 80, c = bigCanvas(w, h), x = c.getContext('2d');
    sym(x, w, h, p => {
      p.el(32, 66, 18, 14, '#0f1426'); // köpeny alja
      p.r(16, 26, 16, 44, '#141b33'); p.r(12, 30, 6, 30, '#0f1426');
      p.r(4, 28, 10, 34, '#1b2448'); p.r(2, 40, 4, 20, '#26326a'); // szárny-köpeny
      for (let i = 0; i < 6; i++) p.r(2 + i, 60 + i, 6, 2, '#0c1020');
      p.r(22, 26, 10, 26, '#232c52'); p.r(28, 28, 4, 22, '#e8e4da'); p.r(29, 30, 3, 14, '#7d0c16');
      p.r(20, 22, 12, 6, '#1b2448');
      p.el(32, 15, 9, 10, '#141826'); // fej (sisak)
      p.r(18, 6, 14, 3, '#0d0f18'); p.r(16, 8, 16, 2, '#0d0f18');
      p.r(24, 12, 8, 5, '#d9d2c0'); // maszk
      p.r(26, 13, 3, 2, '#6ef0d8'); // szem
      p.r(30, 17, 2, 8, '#d9d2c0'); p.r(31, 25, 1, 4, '#b9b2a0'); // csőr
      p.r(10, 0, 22, 4, '#0d0f18'); p.r(14, 4, 18, 3, '#0d0f18'); // cilinder
      p.r(14, 4, 18, 1, '#7d0c16');
      p.r(6, 44, 3, 3, '#d9a540');
    });
    // tollpenge (aszimmetrikus)
    const p = new P(x, 0, 0, false, w);
    for (let i = 0; i < 26; i++) { p.r(50 + Math.round(i * .3), 70 - i * 2, 3, 2, i > 20 ? '#e8f8ff' : '#9ff5e6'); }
    p.r(48, 66, 6, 3, '#d9a540');
    outline(x, 0, 0, w, h, [0, 20, 30]);
    return c;
  },
  cassandra() {
    const w = 64, h = 80, c = bigCanvas(w, h), x = c.getContext('2d');
    sym(x, w, h, p => {
      p.el(32, 64, 16, 16, '#3a0e2a');
      p.r(20, 26, 12, 40, '#5a1640'); p.r(26, 28, 6, 36, '#e8c46a');
      p.r(8, 30, 14, 6, '#5a1640'); p.r(4, 34, 6, 18, '#5a1640');
      p.el(32, 16, 8, 9, '#f1d4b8');
      p.r(22, 4, 10, 8, '#e8c46a'); p.r(20, 10, 4, 22, '#e8c46a'); p.r(18, 20, 4, 14, '#cfa94a');
      p.r(26, 14, 6, 3, '#1a0a14'); p.r(27, 15, 2, 1, '#ff4fa0');
      for (let i = 0; i < 5; i++) p.r(14 + i * 4, 2 - (i % 2) * 2, 2, 5, '#ffd27a');
    });
    const p = new P(x, 0, 0, false, w);
    p.el(52, 40, 6, 6, '#ff4fa0'); p.el(52, 40, 3, 3, '#ffe0f0');
    outline(x, 0, 0, w, h, [30, 0, 20]);
    return c;
  },
  philomela() {
    const w = 64, h = 80, c = bigCanvas(w, h), x = c.getContext('2d');
    sym(x, w, h, p => {
      p.el(32, 64, 18, 16, '#2a1a40');
      for (let i = 0; i < 8; i++) p.r(2 + i * 2, 24 + i * 3, 12, 3, i % 2 ? '#6e4aa8' : '#8a64c8');
      p.r(22, 26, 10, 36, '#3a2a60'); p.r(28, 30, 4, 20, '#ffd27a');
      p.el(32, 15, 8, 9, '#f6e6d6');
      p.r(22, 8, 10, 5, '#1a1020'); p.r(24, 12, 8, 4, '#d9a540');
      p.r(26, 13, 3, 2, '#fff1c4');
      p.r(30, 17, 2, 3, '#e8a040');
    });
    outline(x, 0, 0, w, h, [20, 10, 40]);
    return c;
  },
  faceless() {
    const w = 48, h = 64, c = bigCanvas(w, h), x = c.getContext('2d');
    sym(x, w, h, p => {
      p.r(12, 22, 12, 34, '#3a3d48'); p.r(8, 26, 6, 22, '#30333d'); p.r(14, 56, 4, 8, '#202228');
      p.el(24, 14, 8, 10, '#c9ccd4'); p.r(16, 4, 8, 6, '#2a2c34');
      p.r(4, 2, 20, 2, '#15161c'); for (let i = 0; i < 4; i++) p.r(2 + i * 2, 4 + i, 22 - i * 2, 1, '#1b1c22');
      p.r(18, 18, 6, 1, '#a0a3ab');
    });
    const p = new P(x, 0, 0, false, w);
    p.r(40, 6, 1, 40, '#111');
    outline(x, 0, 0, w, h);
    return c;
  },
  umbrella() {
    const w = 48, h = 64, c = bigCanvas(w, h), x = c.getContext('2d');
    sym(x, w, h, p => {
      for (let i = 0; i < 10; i++) p.r(2 + i, 10 - Math.floor(i * .6), 22 - i, 1 + (i % 2), i % 2 ? '#1a1030' : '#2a1848');
      p.r(4, 10, 20, 2, '#2a1848');
      p.r(23, 12, 1, 30, '#111');
      p.el(24, 36, 8, 14, '#120c1e'); p.r(18, 30, 3, 3, '#ff3050'); p.r(14, 46, 10, 16, '#120c1e');
      for (let i = 0; i < 4; i++) p.r(10 + i * 3, 58, 2, 6, '#120c1e');
    });
    outline(x, 0, 0, w, h);
    return c;
  },
  porcelain() {
    const w = 48, h = 64, c = bigCanvas(w, h), x = c.getContext('2d');
    sym(x, w, h, p => {
      p.el(24, 46, 12, 14, '#f0d8e0'); p.r(14, 34, 10, 14, '#f4e8ec');
      p.el(24, 20, 12, 13, '#f8f4f0'); p.r(12, 8, 12, 6, '#d9a540'); p.r(10, 12, 4, 16, '#d9a540');
      p.r(16, 18, 4, 4, '#1a1420'); p.r(17, 19, 1, 1, '#ff5070');
      p.r(14, 25, 3, 2, '#ffb0c0');
      p.r(20, 28, 4, 1, '#c05060');
      p.r(12, 44, 12, 2, '#ff8fb0');
    });
    const p = new P(x, 0, 0, false, w);
    for (let i = 0; i < 9; i++) p.p(28 + (i % 3), 12 + i * 2, '#6a5a60');
    outline(x, 0, 0, w, h);
    return c;
  },
  nightingale() {
    const w = 96, h = 104, c = bigCanvas(w, h), x = c.getContext('2d');
    sym(x, w, h, p => {
      // aranykalitka-ruha
      for (let i = 0; i < 9; i++) p.r(14 + i * 4, 44, 1, 56, '#d9a540');
      p.el(48, 84, 30, 20, '#120a18');
      p.r(30, 40, 18, 46, '#1a0f24');
      for (let i = 0; i < 12; i++) p.r(4 + i * 2, 30 + i * 3, 24 - i, 3, i % 2 ? '#2a1838' : '#3a2050'); // tollszárny
      for (let i = 0; i < 6; i++) p.r(0 + i, 66 + i * 4, 14, 3, '#1a0f24');
      p.r(38, 40, 10, 8, '#f2dccb'); p.r(42, 44, 6, 30, '#2a1838');
      p.el(48, 26, 11, 13, '#f2dccb');
      p.r(36, 10, 12, 10, '#0c0710'); p.r(34, 16, 6, 30, '#0c0710');
      // madármaszk
      p.r(36, 20, 12, 8, '#d9a540'); p.r(38, 22, 4, 3, '#fff1a0'); p.r(39, 23, 2, 1, '#ff3050');
      p.r(46, 28, 2, 10, '#d9a540'); p.r(47, 38, 1, 4, '#a07a20');
      p.r(42, 34, 6, 2, '#9a1030');
      for (let i = 0; i < 6; i++) p.r(28 + i * 3, 4 - (i % 2) * 3, 2, 8, '#3a2050');
      p.r(30, 100, 18, 4, '#d9a540');
    });
    outline(x, 0, 0, w, h, [10, 0, 10]);
    return c;
  },
};

// party-portrék a csatához: a figura lefelé néző képkockájából
export function battlePortrait(canvas, d) { drawPortrait(canvas, d); }
