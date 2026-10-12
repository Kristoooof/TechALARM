// A három A4-es TechALARM plakát HTML-jét állítja elő (közös logó, QR, betűtípus).
//   node build.mjs   →   src/a-elromlott-valami.html, src/b-nevtelenul.html, src/c-nyomon-kovetheto.html
import { readFileSync, writeFileSync } from "node:fs";

const read = (p) => readFileSync(new URL(p, import.meta.url));
const b64 = (p) => read(p).toString("base64");
const svgUri = (p) => `data:image/svg+xml;base64,${b64(p)}`;

const URL_TEXT = "tech-alarm.vercel.app";
const qr = read("./qr.svg").toString().replace(/<\?xml[^>]*>/, "");
const dev = (n) => svgUri(`../../../promo-video/public/devices/${n}.svg`);

const fonts = `
@font-face{font-family:"Inter";font-weight:100 900;src:url(data:font/woff2;base64,${b64("../../../promo-video/public/fonts/inter-latin-wght-normal.woff2")}) format("woff2");unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215;}
@font-face{font-family:"Inter";font-weight:100 900;src:url(data:font/woff2;base64,${b64("../../../promo-video/public/fonts/inter-latin-ext-wght-normal.woff2")}) format("woff2");unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+1E00-1E9F,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113;}
`;

const base = `
${fonts}
@page{size:210mm 297mm;margin:0}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:210mm;height:297mm}
body{font-family:"Inter",system-ui,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact;line-height:1.3}
.poster{width:210mm;height:297mm;padding:12mm;display:flex;flex-direction:column;position:relative;overflow:hidden}
.content{margin:auto 0;position:relative}
.logo{font-weight:800;font-size:22pt;letter-spacing:-.045em;line-height:1.2}
.logo span{color:#60a5fa}
.school{font-size:10pt;font-weight:600;letter-spacing:.02em}
header{display:flex;justify-content:space-between;align-items:center}
.qr svg{display:block;width:100%;height:auto}
.plate{background:#fff;border-radius:6mm;padding:3mm}
.check{display:inline-flex;width:6.4mm;height:6.4mm;border-radius:50%;align-items:center;justify-content:center;flex:none;font-size:11pt;font-weight:800}
.fine{font-size:10pt}
.ul{text-decoration:underline;text-decoration-thickness:.09em;text-underline-offset:.12em;text-decoration-skip-ink:none}
`;

const page = (title, css, body) =>
  `<!doctype html><html lang="hu"><head><meta charset="utf-8"><title>${title}</title><style>${base}${css}</style></head><body>${body}</body></html>`;

const logo = (cls = "") => `<div class="logo ${cls}">Tech<span>ALARM</span></div>`;

// ---------- A: Elromlott valami? (sötét, riasztós) ----------
const badge = `<i class="bdg">!</i>`;
const designA = page("TechALARM plakát A – Elromlott valami?", `
.poster{background:radial-gradient(circle at 15% 8%,rgba(37,99,235,.55),transparent 42%),radial-gradient(circle at 92% 62%,rgba(96,165,250,.22),transparent 40%),linear-gradient(160deg,#0b1437,#172554 70%,#0a1230);color:#f8fbff}
.logo{color:#fff}.school{color:#b6c4e8}
.devs{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:9mm;padding:4mm 4mm 0 0}
.d{position:relative;display:block}
.d img{display:block;height:100%;filter:drop-shadow(0 0 5mm rgba(239,68,68,.55))}
.bdg{position:absolute;right:-3mm;top:-4mm;width:9mm;height:9mm;border-radius:50%;background:#ef4444;color:#fff;font-style:normal;font-weight:800;font-size:15pt;line-height:9mm;text-align:center;box-shadow:0 0 4mm rgba(239,68,68,.8)}
h1{font-size:92pt;font-weight:800;line-height:.98;letter-spacing:-.045em}
h1 em{font-style:normal;color:#60a5fa}
.sub{font-size:26pt;font-weight:500;line-height:1.25;color:#dbeafe;margin-top:7mm;letter-spacing:-.015em}
.pts{list-style:none;margin-top:7mm;display:grid;gap:3mm}
.pts li{display:flex;align-items:center;gap:3.5mm;font-size:17pt;font-weight:600}
.pts .check{background:#2563eb;color:#fff}
.cta{display:flex;align-items:center;gap:8mm;background:#fff;color:#172554;border-radius:8mm;padding:6mm 8mm}
.cta .qr{width:50mm;flex:none}
.cta b{display:block;font-size:26pt;line-height:1.1;letter-spacing:-.03em;font-weight:800}
.cta .u{display:block;margin-top:3mm;font-size:19pt;font-weight:700;color:#2563eb}
.cta .fine{display:block;margin-top:3mm;color:#475569}
`, `<div class="poster">
<header>${logo()}<div class="school">MSZC Gépészeti Technikum</div></header>
<div class="content">
 <div class="devs">
  <span class="d" style="height:23mm"><img src="${dev("projector")}">${badge}</span>
  <span class="d" style="height:34mm"><img src="${dev("pc")}">${badge}</span>
  <span class="d" style="height:30mm"><img src="${dev("drill")}">${badge}</span>
  <span class="d" style="height:30mm"><img src="${dev("chair")}">${badge}</span>
 </div>
 <h1>Elromlott<br><em>valami?</em></h1>
 <p class="sub">Jelentsd be a telefonodról. Nem kell bejelentkezni, névtelen is lehetsz.</p>
 <ul class="pts">
  <li><span class="check">✓</span>Fényképet is csatolhatsz</li>
  <li><span class="check">✓</span>Követőkódot kapsz, nyomon követheted</li>
  <li><span class="check">✓</span>Pár koppintás az egész</li>
 </ul>
</div>
<div class="cta">
 <div class="qr plate" style="padding:0;border-radius:0">${qr}</div>
 <div><b>Olvasd be, és jelentsd be!</b><span class="u">${URL_TEXT}</span><span class="fine">Telefonról, bejelentkezés nélkül.</span></div>
</div>
</div>`);

// ---------- B: Szólj. Névtelenül. (világos, tipográfiai) ----------
const bubble = `<svg viewBox="0 0 200 180" style="width:46mm;display:block"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#60a5fa"/><stop offset="1" stop-color="#1d4ed8"/></linearGradient></defs><path d="M30 10h140a24 24 0 0 1 24 24v76a24 24 0 0 1-24 24H98l-46 36v-36H30a24 24 0 0 1-24-24V34A24 24 0 0 1 30 10Z" fill="url(#g)"/><rect x="92" y="38" width="16" height="50" rx="8" fill="#fff"/><circle cx="100" cy="108" r="9" fill="#fff"/></svg>`;
const designB = page("TechALARM plakát B – Szólj. Névtelenül.", `
.poster{background:linear-gradient(180deg,#f8fbff,#e8f1ff);color:#172554}
.logo{color:#172554}.logo span{color:#2563eb}.school{color:#475569}
.top{display:flex;justify-content:space-between;align-items:flex-start}
h1{font-weight:800;letter-spacing:-.05em;line-height:.9}
h1 .a{display:block;font-size:150pt;color:#172554}
h1 .b{display:block;font-size:77pt;color:#2563eb;margin-top:5mm}
.sub{font-size:25pt;font-weight:500;line-height:1.25;color:#334155;margin-top:9mm;letter-spacing:-.015em;max-width:165mm}
.chips{display:flex;flex-wrap:wrap;gap:3mm;margin-top:8mm}
.chips span{font-size:16pt;font-weight:700;color:#1e40af;background:#fff;border:.4mm solid #bfdbfe;border-radius:99mm;padding:2.5mm 6mm}
.cta{display:flex;align-items:center;justify-content:space-between;gap:8mm;background:#172554;color:#fff;border-radius:8mm;padding:7mm 8mm}
.cta .qr{width:56mm;flex:none}
.cta b{display:block;font-size:31pt;line-height:1.08;letter-spacing:-.035em;font-weight:800}
.cta .u{display:block;margin-top:4mm;font-size:19pt;font-weight:700;color:#93c5fd}
.cta .fine{display:block;margin-top:3mm;color:#bfdbfe}
`, `<div class="poster">
<header class="top">${logo()}<div class="school">MSZC Gépészeti Technikum</div></header>
<div class="content">
 <div style="display:flex;justify-content:flex-end;margin-bottom:-6mm">${bubble}</div>
 <h1><span class="a">Szólj.</span><span class="b ul">Névtelenül.</span></h1>
 <p class="sub">Nem kell regisztrálni, és nem kérünk nevet. Csak írd le, mi romlott el.</p>
 <div class="chips"><span>Nincs regisztráció</span><span>Nem kérünk nevet</span><span>Fényképet is küldhetsz</span></div>
</div>
<div class="cta">
 <div><b>Olvasd be<br>a kódot!</b><span class="u">${URL_TEXT}</span><span class="fine">Telefonról, bejelentkezés nélkül.</span></div>
 <div class="qr plate">${qr}</div>
</div>
</div>`);

// ---------- C: Nem tűnik el a bejelentésed (követhető) ----------
const designC = page("TechALARM plakát C – Nem tűnik el a bejelentésed", `
.poster{background:#fff;color:#172554}
.top{background:linear-gradient(150deg,#0b1437,#172554);color:#fff;border-radius:8mm;padding:8mm 9mm 10mm}
.logo{color:#fff}
h1{font-size:62pt;font-weight:800;letter-spacing:-.045em;line-height:.98;margin-top:11mm}
h1 em{font-style:normal;color:#60a5fa}
.sub{font-size:24pt;font-weight:500;line-height:1.25;color:#dbeafe;margin-top:6mm;letter-spacing:-.015em}
.card{border:.5mm solid #bfdbfe;border-radius:7mm;padding:7mm 8mm 8mm;background:#f8fbff;position:relative}
.tag{position:absolute;right:6mm;top:-3.2mm;background:#e0f2fe;color:#075985;font-size:10pt;font-weight:700;border-radius:99mm;padding:1mm 3.5mm;letter-spacing:.04em}
.row{display:flex;align-items:center;gap:6mm;padding-bottom:5mm;border-bottom:.3mm solid #dbeafe}
.row img{height:24mm;display:block}
.row b{display:block;font-size:22pt;letter-spacing:-.03em;line-height:1.1}
.row small{display:block;font-size:13pt;color:#475569;margin-top:1mm}
.code{margin-left:auto;font-size:15pt;font-weight:800;letter-spacing:.06em;color:#1d4ed8;background:#eff6ff;border:.3mm solid #bfdbfe;border-radius:3mm;padding:2.5mm 4mm}
.tl{position:relative;display:flex;justify-content:space-between;margin:8mm 9mm 0}
.tl:before{content:"";position:absolute;left:4mm;right:4mm;top:4.6mm;height:1.4mm;border-radius:1mm;background:linear-gradient(90deg,#ef4444,#f59e0b,#22c55e)}
.st{position:relative;text-align:center;display:flex;flex-direction:column;align-items:center;gap:2.5mm;width:30mm}
.st i{width:10mm;height:10mm;border-radius:50%;display:block;border:1.2mm solid #fff}
.st span{font-size:15pt;font-weight:700}
.note{margin-top:6mm;border-radius:4mm;background:#f0fdf4;border:.3mm solid #bbf7d0;color:#166534;font-size:14pt;padding:3.5mm 5mm}
.cta{display:flex;align-items:center;gap:8mm}
.cta .qr{width:50mm;flex:none;border:.5mm solid #172554;border-radius:5mm;padding:2mm}
.cta b{display:block;font-size:27pt;line-height:1.1;letter-spacing:-.035em;font-weight:800}
.cta .u{display:block;margin-top:3mm;font-size:19pt;font-weight:700;color:#2563eb}
.cta .fine{display:block;margin-top:3mm;color:#475569}
`, `<div class="poster">
<div class="top"><header>${logo()}<div class="school" style="color:#b6c4e8">MSZC Gépészeti Technikum</div></header>
 <h1>Nem tűnik el<br><em>a bejelentésed.</em></h1>
 <p class="sub">Minden bejelentés kap egy követőkódot. Megnézheted, mi lett vele.</p>
</div>
<div class="content">
 <div class="card"><span class="tag">PÉLDA</span>
  <div class="row"><img src="${dev("drill")}"><div><b>Fúrógép</b><small>Gépműhely · GM-001</small></div><div class="code">TA-K7M2-QX9P</div></div>
  <div class="tl">
   <div class="st"><i style="background:#ef4444"></i><span>Új</span></div>
   <div class="st"><i style="background:#f59e0b"></i><span>Folyamatban</span></div>
   <div class="st"><i style="background:#22c55e"></i><span>Megjavítva</span></div>
  </div>
  <div class="note"><b>Üzenet a karbantartótól:</b> csütörtökön cseréljük az alkatrészt.</div>
 </div>
</div>
<div class="cta">
 <div class="qr">${qr}</div>
 <div><b>Szólj, és kövesd!</b><span class="u">${URL_TEXT}</span><span class="fine">Telefonról, bejelentkezés nélkül. Az állapotot az „Állapot” oldalon láthatod.</span></div>
</div>
</div>`);

writeFileSync(new URL("./src/a-elromlott-valami.html", import.meta.url), designA);
writeFileSync(new URL("./src/b-nevtelenul.html", import.meta.url), designB);
writeFileSync(new URL("./src/c-nyomon-kovetheto.html", import.meta.url), designC);
console.log("HTML kész: 3 terv");
