// A fekvő, 16:9 arányú TechALARM plakát HTML-jét állítja elő (1600 × 900 mm = 160 × 90 cm, vektoros).
//   node build.mjs   →   src/plakat-16x9.html     (majd: node render.mjs)
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

const W = 1600; // mm
const H = 900;

const css = `
${fonts}
@page{size:${W}mm ${H}mm;margin:0}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:${W}mm;height:${H}mm;background:#0b1437}
body{font-family:"Inter",system-ui,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact;line-height:1.1;color:#fff}
.p{position:relative;width:${W}mm;height:${H}mm;overflow:hidden;
  background:
   radial-gradient(ellipse 900mm 600mm at 8% 0%,rgba(37,99,235,.62),transparent 62%),
   radial-gradient(ellipse 800mm 700mm at 100% 70%,rgba(96,165,250,.22),transparent 60%),
   radial-gradient(ellipse 900mm 500mm at 40% 110%,rgba(37,99,235,.35),transparent 65%),
   linear-gradient(165deg,#0b1437,#172554 62%,#0a1230)}
.abs{position:absolute}
.wm{right:-150mm;top:-90mm;width:900mm;opacity:.06;transform:rotate(8deg)}
.logo{left:70mm;top:50mm;width:300mm}
h1{left:66mm;top:335mm;font-weight:900;font-size:136mm;letter-spacing:-.045em;line-height:.93;text-transform:uppercase;white-space:nowrap}
h1 em{font-style:normal;color:#60a5fa;display:block}
.tag{left:70mm;top:625mm}
.tag span{display:inline-block;background:#fff;color:#172554;font-weight:900;font-size:56mm;letter-spacing:-.03em;padding:8mm 22mm;border-radius:10mm;transform:rotate(-2deg);box-shadow:10mm 10mm 0 rgba(37,99,235,.9)}
.chips{left:70mm;top:790mm;display:flex;gap:14mm}
.chip{font-size:27mm;font-weight:700;color:#bfdbfe;border:1.2mm solid rgba(147,197,253,.45);border-radius:40mm;padding:5mm 16mm;background:rgba(255,255,255,.06)}
.devs{left:930mm;top:60mm;width:610mm;display:flex;justify-content:space-between;align-items:flex-end;height:150mm}
.dev{position:relative;height:150mm;display:flex;align-items:flex-end}
.dev img{height:100%;max-width:150mm;filter:drop-shadow(0 4mm 9mm rgba(0,0,0,.45))}
.badge{position:absolute;top:-8mm;right:-6mm;width:34mm;height:34mm;border-radius:50%;background:#ef4444;border:4mm solid #0b1437;color:#fff;font-weight:900;font-size:22mm;display:flex;align-items:center;justify-content:center;line-height:1;padding-bottom:1mm}
.steps{left:930mm;width:610mm;top:262mm;display:flex;flex-direction:column;gap:16mm}
.step{display:flex;align-items:center;gap:20mm;background:rgba(255,255,255,.08);border:1mm solid rgba(147,197,253,.35);border-radius:14mm;padding:9mm 18mm}
.num{flex:none;width:44mm;height:44mm;border-radius:50%;background:#2563eb;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:26mm}
.step b{display:block;font-size:30mm;font-weight:800;letter-spacing:-.025em;white-space:nowrap}
.step small{display:block;font-size:19mm;color:#bfdbfe;font-weight:500;margin-top:2mm;white-space:nowrap}
.qrblock{left:930mm;width:610mm;top:600mm;display:flex;align-items:center;gap:22mm}
.qr{flex:none;width:250mm;height:250mm;background:#fff;border-radius:11mm;padding:5mm;box-shadow:9mm 9mm 0 rgba(37,99,235,.9)}
.qr img{display:block;width:100%;height:100%}
.cta .scan{font-size:25mm;font-weight:700;color:#bfdbfe}
.cta .url{margin-top:7mm;font-size:30mm;font-weight:900;letter-spacing:-.035em;line-height:1.05;white-space:nowrap}
.cta .url span{color:#60a5fa}
`;

const html = `<!doctype html><html lang="hu"><head><meta charset="utf-8"><title>TechALARM plakát 16:9</title><style>${css}</style></head><body>
<div class="p">
  <img class="abs wm" src="${mark}" alt="">
  <img class="abs logo" src="${logo}" alt="TechALARM – Mátészalkai Gépészeti Technikum">
  <h1 class="abs">Elromlott<em>valami?</em></h1>
  <div class="abs tag"><span>Szólj. Névtelenül.</span></div>
  <div class="abs chips"><div class="chip">Névtelen</div><div class="chip">Fényképpel is</div><div class="chip">Követhető állapot</div></div>
  <div class="abs devs">
    <div class="dev"><img src="${dev("projector")}" alt=""><div class="badge">!</div></div>
    <div class="dev"><img src="${dev("pc")}" alt=""><div class="badge">!</div></div>
    <div class="dev"><img src="${dev("desk")}" alt=""><div class="badge">!</div></div>
    <div class="dev"><img src="${dev("chair")}" alt=""><div class="badge">!</div></div>
  </div>
  <div class="abs steps">
    <div class="step"><div class="num">1</div><div><b>Válaszd ki a termet</b><small>és az eszközt, ami elromlott</small></div></div>
    <div class="step"><div class="num">2</div><div><b>Írd le, mi a baj</b><small>fotót is csatolhatsz</small></div></div>
    <div class="step"><div class="num">3</div><div><b>Kapsz egy követőkódot</b><small>és bármikor megnézheted az állapotát</small></div></div>
  </div>
  <div class="abs qrblock">
    <div class="qr"><img src="${qr}" alt="QR-kód: ${URL_TEXT}"></div>
    <div class="cta">
      <div class="scan">Olvasd be,<br>vagy írd be:</div>
      <div class="url">${URL_TEXT.replace("tech-alarm", "tech<span>-alarm</span>")}</div>
    </div>
  </div>
</div></body></html>`;

writeFileSync(new URL("./src/plakat-16x9.html", import.meta.url), html);
console.log("src/plakat-16x9.html kész");
