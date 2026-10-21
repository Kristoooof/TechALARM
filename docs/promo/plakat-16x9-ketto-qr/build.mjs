// Fekvő, 16:9 TechALARM plakát két QR-kóddal (weboldal + kérdőív). 1600 × 900 mm, vektoros.
//   python3 gen-qr.py && node build.mjs && node render.mjs
import { readFileSync, writeFileSync } from "node:fs";

const read = (p) => readFileSync(new URL(p, import.meta.url));
const b64 = (p) => read(p).toString("base64");
const svgUri = (p) => `data:image/svg+xml;base64,${b64(p)}`;

const WEB_TEXT = "tech-alarm.vercel.app";
const FORM_TEXT = "forms.gle/YcREVdZa2MUa7WGT9";
const logo = svgUri("../../brand/logo-dark.svg");
const mark = svgUri("../../brand/logo-mark.svg");
const qrWeb = svgUri("./src/qr-weboldal.svg");
const qrForm = svgUri("./src/qr-kerdoiv.svg");
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
.devs{left:930mm;top:60mm;width:620mm;display:flex;justify-content:space-between;align-items:flex-end;height:130mm}
.dev{position:relative;height:130mm;display:flex;align-items:flex-end}
.dev img{height:100%;max-width:140mm;filter:drop-shadow(0 4mm 9mm rgba(0,0,0,.45))}
.badge{position:absolute;top:-8mm;right:-6mm;width:34mm;height:34mm;border-radius:50%;background:#ef4444;border:4mm solid #0b1437;color:#fff;font-weight:900;font-size:22mm;display:flex;align-items:center;justify-content:center;line-height:1;padding-bottom:1mm}
.cards{left:900mm;top:245mm;width:650mm;display:flex;gap:20mm}
.card{flex:1 1 0;min-width:0;height:590mm;border-radius:16mm;padding:16mm 16mm 14mm;display:flex;flex-direction:column;align-items:center;text-align:center}
.card.web{background:#2563eb;box-shadow:0 0 0 1.2mm rgba(191,219,254,.5) inset}
.card.form{background:rgba(255,255,255,.09);border:1.2mm solid rgba(147,197,253,.45)}
.card .num{font-size:20mm;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#bfdbfe}
.card.web .num{color:#dbeafe}
.card h2{margin-top:6mm;font-size:38mm;font-weight:900;letter-spacing:-.035em;line-height:1}
.card p{margin-top:8mm;font-size:21mm;font-weight:500;line-height:1.2;color:#dbeafe;height:76mm}
.card .qr{margin-top:6mm;width:100%;aspect-ratio:1;background:#fff;border-radius:10mm;padding:11mm;box-shadow:7mm 7mm 0 rgba(11,20,55,.55)}
.card.form .qr{box-shadow:7mm 7mm 0 rgba(37,99,235,.9)}
.card .qr img{display:block;width:100%;height:100%}
.card .url{margin-top:auto;font-size:18mm;font-weight:800;letter-spacing:-.025em;white-space:nowrap}
.card.web .url{font-size:23mm}
.card.web .url span{color:#bfdbfe}
.card.form .url span{color:#60a5fa}
`;

const html = `<!doctype html><html lang="hu"><head><meta charset="utf-8"><title>TechALARM plakát 16:9 – két QR-kóddal</title><style>${css}</style></head><body>
<div class="p">
  <img class="abs wm" src="${mark}" alt="">
  <img class="abs logo" src="${logo}" alt="TechALARM – Mátészalkai Gépészeti Technikum">
  <h1 class="abs">Elromlott<em>valami?</em></h1>
  <div class="abs tag"><span>Szólj. Névtelenül.</span></div>
  <div class="abs chips"><div class="chip">Névtelen</div><div class="chip">Fényképpel</div><div class="chip">Követhető állapot</div></div>
  <div class="abs devs">
    <div class="dev"><img src="${dev("projector")}" alt=""><div class="badge">!</div></div>
    <div class="dev"><img src="${dev("pc")}" alt=""><div class="badge">!</div></div>
    <div class="dev"><img src="${dev("desk")}" alt=""><div class="badge">!</div></div>
    <div class="dev"><img src="${dev("chair")}" alt=""><div class="badge">!</div></div>
  </div>
  <div class="abs cards">
    <div class="card web">
      <div class="num">Weboldal</div>
      <h2>Jelentsd be<br>a hibát</h2>
      <p>Válaszd ki a termet, csatolj fényképet, és kapsz egy követőkódot.</p>
      <div class="qr"><img src="${qrWeb}" alt="QR-kód: ${WEB_TEXT}"></div>
      <div class="url">${WEB_TEXT.replace("tech-alarm", "tech<span>-alarm</span>")}</div>
    </div>
    <div class="card form">
      <div class="num">Kérdőív</div>
      <h2>Mondd el<br>a véleményed</h2>
      <p>Töltsd ki a rövid kérdőívet, és segíts, hogy a TechALARM jó legyen.</p>
      <div class="qr"><img src="${qrForm}" alt="QR-kód: ${FORM_TEXT}"></div>
      <div class="url">forms.gle/<span>YcREVdZa2MUa7WGT9</span></div>
    </div>
  </div>
</div></body></html>`;

writeFileSync(new URL("./src/plakat-16x9-ketto-qr.html", import.meta.url), html);
console.log("src/plakat-16x9-ketto-qr.html kész");
