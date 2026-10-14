// A TechALARM roll-up (85 × 200 cm, 5 mm ráhagyással = 860 × 2010 mm) HTML-jét állítja elő.
//   node build.mjs   →   src/rollup.html     (majd: node render.mjs → pdf/rollup-85x200.pdf + preview/rollup.png)
import { readFileSync, writeFileSync } from "node:fs";

const read = (p) => readFileSync(new URL(p, import.meta.url));
const b64 = (p) => read(p).toString("base64");
const svgUri = (p) => `data:image/svg+xml;base64,${b64(p)}`;

const URL_TEXT = "tech-alarm.vercel.app";
const logo = svgUri("../../brand/logo-dark.svg");
const mark = svgUri("../../brand/logo-mark.svg");
const qr = svgUri("../plakat/qr.svg");
const dev = (n) => svgUri(`../../../promo-video/public/devices/${n}.svg`);

const fonts = `
@font-face{font-family:"Inter";font-weight:100 900;src:url(data:font/woff2;base64,${b64("../../../promo-video/public/fonts/inter-latin-wght-normal.woff2")}) format("woff2");unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215;}
@font-face{font-family:"Inter";font-weight:100 900;src:url(data:font/woff2;base64,${b64("../../../promo-video/public/fonts/inter-latin-ext-wght-normal.woff2")}) format("woff2");unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+1E00-1E9F,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113;}
`;

// Méretek mm-ben. A „biztonságos” tartalom: 30 mm-re a széltől, és a legalsó 250 mm-en (a roll-up talpa takarja) nincs fontos elem.
const W = 860;
const H = 2010;

const css = `
${fonts}
@page{size:${W}mm ${H}mm;margin:0}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:${W}mm;height:${H}mm;background:#0b1437}
body{font-family:"Inter",system-ui,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact;line-height:1.1;color:#fff}
.r{position:relative;width:${W}mm;height:${H}mm;overflow:hidden;
  background:
   radial-gradient(ellipse 700mm 520mm at 12% 6%,rgba(37,99,235,.6),transparent 62%),
   radial-gradient(ellipse 640mm 600mm at 96% 52%,rgba(96,165,250,.22),transparent 60%),
   radial-gradient(ellipse 800mm 500mm at 50% 100%,rgba(37,99,235,.38),transparent 65%),
   linear-gradient(172deg,#0b1437,#172554 62%,#0a1230)}
.abs{position:absolute}
.wm{left:300mm;top:700mm;width:760mm;opacity:.07;transform:rotate(-8deg)}
.logo{left:${(W - 460) / 2}mm;top:78mm;width:460mm}
h1{left:0;width:${W}mm;top:470mm;text-align:center;font-weight:900;font-size:126mm;letter-spacing:-.045em;line-height:.95;text-transform:uppercase}
h1 em{font-style:normal;color:#60a5fa;display:block}
.tag{left:0;width:${W}mm;top:745mm;text-align:center}
.tag span{display:inline-block;background:#fff;color:#172554;font-weight:900;font-size:56mm;letter-spacing:-.03em;padding:8mm 22mm;border-radius:10mm;transform:rotate(-2deg);box-shadow:12mm 12mm 0 rgba(37,99,235,.9)}
.devs{left:40mm;width:${W - 80}mm;top:900mm;height:200mm;display:flex;justify-content:space-between;align-items:flex-end}
.dev{position:relative;display:flex;align-items:flex-end;justify-content:center;height:200mm}
.dev img{height:100%;max-width:200mm;filter:drop-shadow(0 6mm 14mm rgba(0,0,0,.45))}
.badge{position:absolute;top:-6mm;right:-10mm;width:46mm;height:46mm;border-radius:50%;background:#ef4444;border:5mm solid #0b1437;color:#fff;font-weight:900;font-size:30mm;display:flex;align-items:center;justify-content:center;line-height:1;padding-bottom:1mm}
.steps{left:60mm;width:${W - 120}mm;top:1150mm;display:flex;flex-direction:column;gap:22mm}
.step{display:flex;align-items:center;gap:26mm;background:rgba(255,255,255,.08);border:1.2mm solid rgba(147,197,253,.35);border-radius:16mm;padding:14mm 22mm}
.num{flex:none;width:62mm;height:62mm;border-radius:50%;background:#2563eb;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:36mm}
.step b{display:block;font-size:40mm;font-weight:800;letter-spacing:-.025em}
.step small{display:block;font-size:24mm;color:#bfdbfe;font-weight:500;margin-top:3mm}
.qrblock{left:60mm;width:${W - 120}mm;top:1525mm;height:220mm;display:flex;align-items:center;gap:24mm}
.qr{flex:none;width:220mm;height:220mm;background:#fff;border-radius:12mm;padding:5mm;box-shadow:10mm 10mm 0 rgba(37,99,235,.9)}
.qr img{display:block;width:100%;height:100%}
.cta{flex:1}
.cta .scan{font-size:30mm;font-weight:700;color:#bfdbfe;letter-spacing:-.01em}
.cta .url{margin-top:8mm;font-size:34mm;font-weight:900;letter-spacing:-.03em;line-height:1.05}
.cta .url span{color:#60a5fa}
.cta .free{margin-top:10mm;font-size:22mm;font-weight:600;color:#93c5fd}
.foot{left:0;width:${W}mm;top:1880mm;text-align:center;font-size:22mm;font-weight:600;color:#93c5fd;letter-spacing:.04em}
.guide{left:0;width:${W}mm;height:250mm;top:${H - 250}mm;background:linear-gradient(180deg,transparent,rgba(5,10,30,.55))}
`;

const html = `<!doctype html><html lang="hu"><head><meta charset="utf-8"><title>TechALARM roll-up 85×200 cm</title><style>${css}</style></head><body>
<div class="r">
  <img class="abs wm" src="${mark}" alt="">
  <img class="abs logo" src="${logo}" alt="TechALARM – Mátészalkai Gépészeti Technikum">
  <h1 class="abs">Elromlott<em>valami?</em></h1>
  <div class="abs tag"><span>Szólj. Névtelenül.</span></div>
  <div class="abs devs">
    <div class="dev"><img src="${dev("projector")}" alt=""><div class="badge">!</div></div>
    <div class="dev"><img src="${dev("pc")}" alt=""></div>
    <div class="dev"><img src="${dev("desk")}" alt=""><div class="badge">!</div></div>
    <div class="dev"><img src="${dev("chair")}" alt=""></div>
  </div>
  <div class="abs steps">
    <div class="step"><div class="num">1</div><div><b>Válaszd ki a termet</b><small>és az eszközt, ami elromlott</small></div></div>
    <div class="step"><div class="num">2</div><div><b>Írd le, mi a baj</b><small>fotót is csatolhatsz</small></div></div>
    <div class="step"><div class="num">3</div><div><b>Kapsz egy követőkódot</b><small>és bármikor megnézheted az állapotát</small></div></div>
  </div>
  <div class="abs qrblock">
    <div class="qr"><img src="${qr}" alt="QR-kód: ${URL_TEXT}"></div>
    <div class="cta">
      <div class="scan">Olvasd be a kódot,<br>vagy írd be:</div>
      <div class="url">${URL_TEXT.replace("tech-alarm", "tech<span>-alarm</span>")}</div>
      <div class="free">Nem kell bejelentkezni.</div>
    </div>
  </div>
  <div class="abs guide"></div>
</div></body></html>`;

writeFileSync(new URL("./src/rollup.html", import.meta.url), html);
console.log("src/rollup.html kész");
