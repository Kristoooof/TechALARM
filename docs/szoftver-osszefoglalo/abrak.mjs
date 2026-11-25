// A folyamatleíró ábrák (SVG és PNG).   node abrak.mjs   (Playwright + Chromium kell)
import { readFileSync, writeFileSync } from "node:fs";
import { chromium } from "/opt/node-tools/node_modules/playwright/index.mjs";
import { fileURLToPath } from "node:url";

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const C = { navy: "#172554", blue: "#2563eb", sky: "#dbeafe", ice: "#eff6ff", red: "#ef4444", green: "#16a34a", greenBg: "#dcfce7", orange: "#f97316", orangeBg: "#ffedd5", gray: "#64748b", line: "#94a3b8", ink: "#0f172a" };
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");

const svg = (w, h, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" font-family="Inter, Arial, sans-serif">
<defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="${C.navy}"/></marker></defs>
<rect width="${w}" height="${h}" fill="#fff"/>${body}</svg>`;

const rect = (x, y, w, h, o = {}) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.r ?? 12}" fill="${o.fill ?? "#fff"}" stroke="${o.stroke ?? C.navy}" stroke-width="${o.sw ?? 2}"${o.dash ? ' stroke-dasharray="8 6"' : ""}/>`;
const text = (x, y, lines, o = {}) => {
  const ls = Array.isArray(lines) ? lines : [lines];
  const lh = o.lh ?? (o.size ?? 18) * 1.3;
  return `<text x="${x}" y="${y}" font-size="${o.size ?? 18}" font-weight="${o.weight ?? 500}" fill="${o.fill ?? C.ink}" text-anchor="${o.anchor ?? "middle"}">${ls.map((l, i) => `<tspan x="${x}" dy="${i === 0 ? 0 : lh}">${esc(l)}</tspan>`).join("")}</text>`;
};
const arrow = (pts, label, o = {}) => {
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0]} ${p[1]}`).join(" ");
  let s = `<path d="${d}" fill="none" stroke="${o.color ?? C.navy}" stroke-width="${o.sw ?? 2.5}" marker-end="url(#ar)"${o.dash ? ' stroke-dasharray="7 5"' : ""}/>`;
  if (label) {
    const mid = o.labelAt ?? [(pts[0][0] + pts[1][0]) / 2, (pts[0][1] + pts[1][1]) / 2];
    s += `<rect x="${mid[0] - label.length * 4.6 - 6}" y="${mid[1] - 13}" width="${label.length * 9.2 + 12}" height="24" rx="6" fill="#fff"/>` + text(mid[0], mid[1] + 5, label, { size: 15, weight: 700, fill: o.color ?? C.blue });
  }
  return s;
};
const step = (x, y, w, h, n, title, lines, o = {}) =>
  rect(x, y, w, h, { fill: o.fill ?? "#fff", stroke: o.stroke ?? C.blue }) +
  `<circle cx="${x + 26}" cy="${y + 26}" r="17" fill="${o.stroke ?? C.blue}"/>` + text(x + 26, y + 32, String(n), { size: 17, weight: 800, fill: "#fff" }) +
  text(x + 56, y + 31, title, { size: 17, weight: 800, anchor: "start", fill: C.navy }) +
  text(x + 18, y + 60, lines, { size: 14.5, anchor: "start", fill: C.ink, lh: 19 });

const out = {};

// ---------- 1. Fő folyamat ----------
{
  const W = 1200, H = 1370;
  let b = "";
  const lanes = [["Felhasználó (diák, tanár)", 0, C.ice], ["Rendszer (Next.js, Supabase)", 400, "#f8fafc"], ["Munkatárs (jóváhagyó, karbantartó)", 800, C.ice]];
  for (const [name, x, fill] of lanes) {
    b += `<rect x="${x}" y="0" width="400" height="${H}" fill="${fill}"/>` + `<rect x="${x}" y="0" width="400" height="56" fill="${C.navy}"/>` + text(x + 200, 35, name, { size: 17, weight: 800, fill: "#fff" });
  }
  b += `<line x1="400" y1="56" x2="400" y2="${H}" stroke="#cbd5e1" stroke-width="2"/><line x1="800" y1="56" x2="800" y2="${H}" stroke="#cbd5e1" stroke-width="2"/>`;
  b += step(30, 90, 340, 110, 1, "Regisztráció", ["Név, jelszó, a tájékoztató", "tudomásulvétele"]);
  b += step(430, 90, 340, 130, 2, "Feldolgozás", ["Turnstile, név- és jelszó-", "ellenőrzés, egyedi felhasználónév,", "profil (váró), automatikus belépés"]);
  b += arrow([[370, 145], [430, 145]]);
  b += step(30, 270, 340, 110, 3, "Bejelentés kitöltése", ["Terem típusa és száma, eszköz,", "probléma, leírás, fénykép"]);
  b += arrow([[600, 220], [600, 245], [200, 245], [200, 270]]);
  // döntés
  const dx = 600, dy = 470;
  b += `<polygon points="${dx},${dy - 78} ${dx + 175},${dy} ${dx},${dy + 78} ${dx - 175},${dy}" fill="#fff" stroke="${C.orange}" stroke-width="2.5"/>`;
  b += text(dx, dy - 22, ["4. Ellenőrzés a szerveren:", "belépve? nem elutasított?", "korlát? fotó rendben?"], { size: 14.5, weight: 700, fill: C.navy, lh: 19 });
  b += arrow([[370, 325], [400, 325], [400, 360], [600, 360], [600, 392]]);
  b += rect(30, 440, 340, 100, { fill: C.orangeBg, stroke: C.orange });
  b += text(200, 472, ["Hibaüzenet:", "a felhasználó javít, és újra küld"], { size: 15, weight: 700, fill: "#9a3412", lh: 20 });
  b += arrow([[425, 470], [370, 490]].map((p) => p), "nem", { color: C.orange, labelAt: [398, 468] });
  b += arrow([[200, 440], [200, 380]], null, { color: C.orange });
  b += step(430, 590, 340, 140, 5, "Mentés", ["Bejelentés és fénykép (privát", "tároló), követőkód. Váró felhasználó", "bejelentése: hitelesítetlen"], { stroke: C.green, fill: "#f0fdf4" });
  b += arrow([[600, 548], [600, 590]], "igen", { color: C.green, labelAt: [630, 569] });
  b += step(830, 590, 340, 140, 6, "Jóváhagyás", ["A munkatárs a Regisztrációk", "oldalon jóváhagyja vagy", "elutasítja a regisztrációt"]);
  b += arrow([[770, 660], [830, 660]], "látja");
  b += step(430, 790, 340, 120, 7, "Hitelesítés", ["Adatbázis trigger: a felhasználó", "bejelentései hitelesítetté (jóváhagyás)", "vagy hitelesítetlenné (elutasítás) válnak"], { stroke: C.green, fill: "#f0fdf4" });
  b += arrow([[1000, 730], [1000, 850], [770, 850]]);
  b += step(830, 960, 340, 130, 8, "Kezelés", ["Karbantartó: státusz (új, folyamatban,", "megjavítva, elutasítva) és megjegyzés", "a bejelentéshez"]);
  b += arrow([[600, 910], [600, 1025], [830, 1025]]);
  b += step(30, 1160, 340, 130, 9, "Követés", ["Az Állapot oldalon a követőkóddal", "látja a státuszt és a karbantartó", "üzenetét"]);
  b += arrow([[1000, 1090], [1000, 1125], [200, 1125], [200, 1160]], "követőkód");
  b += step(430, 1160, 340, 140, 10, "Törlés", ["Megőrzési idő (tanév vége + 1 év)", "után napi feladat törli. Fióktörlésnél", "a bejelentések névtelenné válnak"], { stroke: C.gray, fill: "#f1f5f9" });
  b += arrow([[370, 1225], [430, 1225]]);
  out["1-fo-folyamat"] = svg(W, H, b);
}

// ---------- 2. Rétegzett felépítés ----------
{
  const W = 1200, H = 1130;
  let b = "";
  const users = [["Diák", "bejelent, kóddal követ"], ["Tanár", "bejelent, jóváhagy"], ["Karbantartó", "jóváhagy, bejelentéseket kezel"], ["Igazgató és admin", "mindent lát és kezel"]];
  users.forEach(([t, s], i) => {
    const x = 30 + i * 290;
    b += rect(x, 20, 260, 90, { fill: C.ice, stroke: C.blue }) + text(x + 130, 56, t, { size: 20, weight: 800, fill: C.navy }) + text(x + 130, 84, s, { size: 14.5, fill: C.gray });
  });
  b += arrow([[600, 112], [600, 170]], "HTTPS, telefon vagy gép");
  // böngésző réteg
  b += rect(20, 172, 1160, 270, { fill: "#f8fafc", stroke: C.blue, dash: true }) + text(40, 202, "Böngésző: Next.js oldalak (React)", { size: 19, weight: 800, anchor: "start", fill: C.blue });
  const pub = ["Landing (/bemutato, /karbantartoknak)", "Bejelentő űrlap (/)", "Regisztráció, Belépés", "Állapot a követőkóddal (/nyomon)", "Fiókom, Adatkezelési tájékoztató"];
  const adm = ["Bejelentések (lista, részlet, státusz)", "Regisztrációk (jóváhagyás, név javítása)", "Adatkérelmek, Munkatársak (szerepkör)", "Termek és eszközök (CSV import)"];
  b += text(40, 238, "Nyilvános és felhasználói oldalak", { size: 15.5, weight: 700, anchor: "start", fill: C.navy });
  pub.forEach((t, i) => { b += rect(40, 250 + i * 36, 520, 30, { r: 8, fill: "#fff", stroke: C.line, sw: 1.5 }) + text(56, 271 + i * 36, t, { size: 14.5, anchor: "start" }); });
  b += text(620, 238, "Admin felület (szerepkörhöz kötött)", { size: 15.5, weight: 700, anchor: "start", fill: C.navy });
  adm.forEach((t, i) => { b += rect(620, 250 + i * 36, 540, 30, { r: 8, fill: "#fff", stroke: C.line, sw: 1.5 }) + text(636, 271 + i * 36, t, { size: 14.5, anchor: "start" }); });
  b += arrow([[600, 444], [600, 500]], "kérések (szerveroldali műveletek)");
  // szerver réteg
  b += rect(20, 502, 1160, 290, { fill: "#f8fafc", stroke: C.navy, dash: true }) + text(40, 532, "Szerver: Next.js a Vercelen (Dublin)", { size: 19, weight: 800, anchor: "start", fill: C.navy });
  const srv = [["Middleware", "munkamenet frissítése, az admin oldalak védelme"], ["Szerveroldali műveletek", "regisztráció, belépés, bejelentés, adatkérelem"], ["Admin műveletek", "jóváhagyás, státusz, törlés, szerepkör"], ["Útvonalak", "adatexport, mentés, napi törlés (cron)"], ["Jogosultság és ellenőrzés", "szerepkör, bemenet, fotó, óránkénti korlát"]];
  srv.forEach(([t, s], i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = 40 + col * 380, y = 552 + row * 112;
    b += rect(x, y, 350, 96, { fill: "#fff", stroke: C.navy, sw: 1.8 }) + text(x + 175, y + 34, t, { size: 17, weight: 800, fill: C.navy }) + text(x + 175, y + 62, s.length > 42 ? [s.slice(0, s.lastIndexOf(" ", 40)), s.slice(s.lastIndexOf(" ", 40) + 1)] : s, { size: 14, fill: C.gray, lh: 18 });
  });
  b += arrow([[300, 794], [300, 850]], "adatbázis, tároló");
  b += arrow([[900, 794], [900, 850]], "külső szolgáltatások");
  // szolgáltatások
  b += rect(20, 852, 760, 260, { fill: C.ice, stroke: C.green, dash: true }) + text(40, 882, "Supabase (EU, Írország)", { size: 19, weight: 800, anchor: "start", fill: "#166534" });
  [["Auth", ["felhasználók, jelszó-hash", "belépés, munkamenet"]], ["Postgres", ["táblák, sorszintű védelem (RLS)", "függvények, trigger"]], ["Storage", ["privát fényképtároló", "1 órás aláírt hivatkozás"]]].forEach(([t, l], i) => {
    const x = 40 + i * 245;
    b += rect(x, 904, 225, 190, { fill: "#fff", stroke: C.green, sw: 1.8 }) + text(x + 112, 940, t, { size: 18, weight: 800, fill: "#166534" }) + text(x + 112, 972, l, { size: 13.5, fill: C.gray, lh: 18 });
  });
  b += rect(800, 852, 380, 120, { fill: C.orangeBg, stroke: C.orange, dash: true }) + text(820, 882, "Cloudflare Turnstile", { size: 18, weight: 800, anchor: "start", fill: "#9a3412" }) + text(820, 910, ["spamvédelem a", "regisztrációnál"], { size: 14, anchor: "start", fill: C.gray, lh: 18 });
  b += rect(800, 992, 380, 120, { fill: "#f1f5f9", stroke: C.gray, dash: true }) + text(820, 1022, "Vercel szolgáltatások", { size: 18, weight: 800, anchor: "start", fill: C.navy }) + text(820, 1050, ["napi időzített törlés (cron),", "névtelen látogatottsági mérés"], { size: 14, anchor: "start", fill: C.gray, lh: 18 });
  out["2-retegek"] = svg(W, H, b);
}

// ---------- 3. Szerepkörök ----------
{
  const W = 1200, H = 440;
  const wrap = (t, n) => {
    const words = t.split(" "), lines = [];
    let cur = "";
    for (const w of words) { if ((cur + " " + w).trim().length > n) { lines.push(cur); cur = w; } else cur = (cur + " " + w).trim(); }
    if (cur) lines.push(cur);
    return lines;
  };
  let b = text(600, 34, "A jogosultság szintről szintre bővül: mindenki megkapja az alatta lévők jogait", { size: 19, weight: 800, fill: C.navy });
  const roles = [
    ["Diák", "az adatbázisban nincs szerepkör", ["Bejelentést küld", "Követőkóddal nézi az állapotot", "Saját adatait letölti, adatkezelési kérelmet ad be"], C.gray, "#f1f5f9"],
    ["Tanár", "szerepkör: approver", ["Regisztrációt hagy jóvá vagy utasít el", "Nevet javít"], C.blue, C.ice],
    ["Karbantartó", "szerepkör: maintainer", ["Bejelentéseket lát és kezel (név, fénykép)", "Státuszt és megjegyzést ad", "Termeket és eszközöket kezel"], C.green, "#f0fdf4"],
    ["Igazgató és admin", "szerepkör: operator", ["Szerepköröket oszt", "Adatkezelési kérelmeket kezel", "Fiókot töröl és anonimizál", "Adatmentést tölt le"], C.orange, C.orangeBg],
  ];
  roles.forEach(([t, sub, items, stroke, fill], i) => {
    const x = 20 + i * 295, y = 80, h = 340;
    b += rect(x, y, 270, h, { fill, stroke, sw: 3 }) + `<rect x="${x}" y="${y}" width="270" height="64" rx="12" fill="${stroke}"/><rect x="${x}" y="${y + 40}" width="270" height="24" fill="${stroke}"/>`;
    b += text(x + 135, y + 30, t, { size: 21, weight: 800, fill: "#fff" }) + text(x + 135, y + 54, sub, { size: 13.5, fill: "#fff" });
    if (i > 0) b += text(x + 18, y + 96, "+ " + roles[i - 1][0] + " jogai", { size: 15, weight: 800, anchor: "start", fill: C.navy });
    let yy = y + (i > 0 ? 136 : 100);
    items.forEach((it) => {
      const lines = wrap(it, 29);
      b += text(x + 18, yy, lines.map((l, k) => (k === 0 ? "• " : "   ") + l), { size: 15, anchor: "start", lh: 20 });
      yy += lines.length * 20 + 14;
    });
    if (i < 3) b += `<circle cx="${x + 282}" cy="${y + 32}" r="14" fill="#fff" stroke="${C.navy}" stroke-width="2.5"/>` + text(x + 282, y + 39, "+", { size: 22, weight: 800, fill: C.navy });
  });
  out["3-szerepkorok"] = svg(W, H, b);
}

// ---------- 4. Adatmodell ----------
{
  const W = 1200, H = 780;
  let b = "";
  const tbl = (x, y, w, name, cols, o = {}) => {
    const h = 44 + cols.length * 24;
    let s = rect(x, y, w, h, { fill: "#fff", stroke: o.stroke ?? C.navy, sw: 2.2 }) + `<rect x="${x}" y="${y}" width="${w}" height="36" rx="12" fill="${o.stroke ?? C.navy}"/><rect x="${x}" y="${y + 20}" width="${w}" height="16" fill="${o.stroke ?? C.navy}"/>` + text(x + w / 2, y + 26, name, { size: 17, weight: 800, fill: "#fff" });
    cols.forEach((c, i) => { s += text(x + 14, y + 62 + i * 24, c, { size: 13.5, anchor: "start", fill: c.startsWith("PK") || c.startsWith("FK") ? C.blue : C.ink, weight: c.startsWith("PK") || c.startsWith("FK") ? 700 : 500 }); });
    return s;
  };
  b += tbl(20, 30, 270, "staff_roles (privát)", ["PK/FK user_id → auth.users", "role: operator, maintainer,", "  approver"], { stroke: C.orange });
  b += tbl(340, 30, 260, "auth.users (Supabase)", ["PK id", "belső belépési azonosító", "jelszó-hash"], { stroke: C.gray });
  b += tbl(640, 30, 540, "profiles", ["PK/FK id → auth.users", "full_name, name_key, username (egyedi)", "status: pending, approved, rejected", "login_email (belső), notice_version", "notice_accepted_at, created_at, decided_at"], { stroke: C.blue });
  b += tbl(20, 330, 270, "rooms", ["PK id", "name, sort_order, active"], { stroke: C.green });
  b += tbl(20, 480, 270, "devices", ["PK id", "FK room_id → rooms", "name, inventory_code, active"], { stroke: C.green });
  b += tbl(340, 300, 560, "reports", ["PK id, tracking_code (követőkód)", "FK room_id, FK device_id (+ név pillanatkép)", "room_number, category, description", "status: uj, folyamatban, megjavitva, elutasitva", "admin_note, photo_path", "FK reporter_id → profiles", "reporter_name, reporter_username (pillanatkép)", "reporter_verified (hitelesített bejelentő)", "created_at, updated_at"], { stroke: C.navy });
  b += tbl(930, 330, 250, "data_requests", ["PK id", "FK profile_id → profiles", "type, message, status", "response, due_at (30 nap)"], { stroke: C.blue });
  b += rect(340, 640, 560, 90, { fill: C.ice, stroke: C.green, dash: true }) + text(620, 678, "Supabase Storage: report-photos (privát)", { size: 17, weight: 800, fill: "#166534" }) + text(620, 706, "a fotó a reports.photo_path szerinti fájl, csak jogosultaknak", { size: 14, fill: C.gray });
  b += arrow([[290, 90], [340, 90]], "N:1", { labelAt: [315, 66] });
  b += arrow([[600, 90], [640, 90]], "1:1", { labelAt: [620, 66] });
  b += arrow([[800, 194], [800, 300]], "1:N", { labelAt: [830, 250] });
  b += arrow([[1055, 194], [1055, 330]], "1:N", { labelAt: [1085, 270] });
  b += arrow([[290, 376], [340, 376]], "1:N", { labelAt: [315, 352] });
  b += arrow([[290, 520], [340, 520]], "1:N", { labelAt: [315, 496] });
  b += arrow([[155, 422], [155, 480]], "1:N", { labelAt: [190, 452] });
  b += arrow([[620, 560], [620, 640]], "fotó", { labelAt: [660, 600] });
  out["4-adatmodell"] = svg(W, H, b);
}

const fontCss = (f) => `@font-face{font-family:"Inter";font-weight:100 900;src:url(data:font/woff2;base64,${readFileSync(here(`../../promo-video/public/fonts/${f}`)).toString("base64")}) format("woff2");}`;
const browser = await chromium.launch();
for (const [name, s] of Object.entries(out)) {
  writeFileSync(here(`./abrak/${name}.svg`), s);
  const page = await browser.newPage({ deviceScaleFactor: 2 });
  await page.setContent(`<style>${fontCss("inter-latin-wght-normal.woff2")}${fontCss("inter-latin-ext-wght-normal.woff2")}body{margin:0}</style>${s}`);
  await page.evaluate(() => document.fonts.ready);
  const el = await page.$("svg");
  await el.screenshot({ path: here(`./abrak/${name}.png`) });
  await page.close();
}
await browser.close();
console.log("kész", Object.keys(out));
