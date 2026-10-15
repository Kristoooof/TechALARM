// PDF (160 × 90 cm, vektoros) + 4K és Full HD PNG (kijelzőre) a 16:9 plakátból.   node render.mjs
import { chromium } from "/opt/node-tools/node_modules/playwright/index.mjs";
import { fileURLToPath } from "node:url";

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const MM = 96 / 25.4;
const vw = Math.round(1600 * MM);
const vh = Math.round(900 * MM);
const browser = await chromium.launch();
for (const [name, w] of [["plakat-16x9-4k", 3840], ["plakat-16x9-fullhd", 1920]]) {
  const page = await browser.newPage({ viewport: { width: vw, height: vh }, deviceScaleFactor: w / vw });
  await page.goto("file://" + here("./src/plakat-16x9.html"));
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: here(`./preview/${name}.png`) });
  if (name.endsWith("4k")) await page.pdf({ path: here("./pdf/plakat-16x9-160x90cm.pdf"), width: "1600mm", height: "900mm", printBackground: true, pageRanges: "1" });
  await page.close();
}
await browser.close();
console.log("kész");
