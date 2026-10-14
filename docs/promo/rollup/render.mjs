// PDF (valódi méretben) + előnézeti PNG a roll-upról. Playwright + Chromium kell hozzá.
//   node render.mjs
import { chromium } from "/opt/node-tools/node_modules/playwright/index.mjs";
import { fileURLToPath } from "node:url";

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 3251, height: 7597 }, deviceScaleFactor: 0.25 });
await page.goto("file://" + here("./src/rollup.html"));
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: here("./preview/rollup.png") });
await page.pdf({ path: here("./pdf/rollup-85x200.pdf"), width: "860mm", height: "2010mm", printBackground: true, pageRanges: "1" });
await browser.close();
console.log("pdf/rollup-85x200.pdf + preview/rollup.png kész");
