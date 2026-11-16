// A4-es adatvédelmi áttekintő HTML + PDF.   node build.mjs   (Playwright + Chromium kell)
import { readFileSync, writeFileSync } from "node:fs";
import { chromium } from "/opt/node-tools/node_modules/playwright/index.mjs";
import { fileURLToPath } from "node:url";

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const b64 = (p) => readFileSync(here(p)).toString("base64");
const fonts = `
@font-face{font-family:"Inter";font-weight:100 900;src:url(data:font/woff2;base64,${b64("../../promo-video/public/fonts/inter-latin-wght-normal.woff2")}) format("woff2");unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215;}
@font-face{font-family:"Inter";font-weight:100 900;src:url(data:font/woff2;base64,${b64("../../promo-video/public/fonts/inter-latin-ext-wght-normal.woff2")}) format("woff2");unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+1E00-1E9F,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113;}`;

const css = `${fonts}
@page{size:A4;margin:11mm 12mm 12mm}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:"Inter",system-ui,sans-serif;font-size:8.4pt;line-height:1.38;color:#0f172a;-webkit-print-color-adjust:exact;print-color-adjust:exact}
h1{font-size:17pt;font-weight:900;letter-spacing:-.03em;color:#172554;line-height:1.1}
h1 span{color:#2563eb}
.meta{margin-top:3px;color:#475569;font-size:8pt}
.warn{margin:7px 0 4px;background:#fff7ed;border:1px solid #fdba74;border-left:4px solid #f97316;border-radius:4px;padding:4px 8px;font-size:7.8pt;color:#7c2d12}
h2{margin:9px 0 3px;font-size:10.2pt;font-weight:800;color:#fff;background:#172554;border-radius:4px;padding:2px 8px;letter-spacing:-.01em;break-after:avoid}
h2 small{font-weight:500;font-size:7.6pt;color:#bfdbfe;margin-left:6px}
h3{margin:5px 0 1px;font-size:8.8pt;font-weight:800;color:#1d4ed8;break-after:avoid}
ul{margin-left:12px}
li{margin:1px 0}
b.k{color:#1d4ed8;font-weight:800}
.ref{display:inline-block;font-size:7pt;font-weight:700;color:#0f766e;background:#ccfbf1;border-radius:3px;padding:0 3px;white-space:nowrap}
.todo{display:inline-block;font-size:7pt;font-weight:800;color:#b91c1c;background:#fee2e2;border-radius:3px;padding:0 3px;white-space:nowrap}
.ok{display:inline-block;font-size:7pt;font-weight:800;color:#166534;background:#dcfce7;border-radius:3px;padding:0 3px;white-space:nowrap}
.cols{display:grid;grid-template-columns:1fr 1fr;gap:0 14px}
table{width:100%;border-collapse:collapse;margin:3px 0 2px;font-size:7.7pt}
th{background:#dbeafe;color:#172554;text-align:left;font-weight:800;padding:2px 4px;border:1px solid #bfdbfe}
td{padding:2px 4px;border:1px solid #dbe4f3;vertical-align:top}
tr{break-inside:avoid}
.src{margin-top:8px;padding-top:4px;border-top:1px solid #cbd5e1;font-size:6.9pt;color:#475569}
.src a{color:#1d4ed8}
.box{border:1px solid #bfdbfe;background:#f5f9ff;border-radius:4px;padding:3px 7px;margin:3px 0}
`;

const html = `<!doctype html><html lang="hu"><head><meta charset="utf-8"><title>TechALARM adatvédelmi áttekintő</title><style>${css}</style></head><body>

<h1>Tech<span>ALARM</span> · adatvédelmi és adatkezelési áttekintő</h1>
<div class="meta">Iskolai hibabejelentő rendszer · vázlat, A4 · ${new Date().toISOString().slice(0, 10)} · a leírás a jelenlegi szoftver működését mutatja</div>
<div class="warn"><b>Nem jogi tanácsadás.</b> Munkaanyag, amelyet az iskola <b>adatvédelmi tisztviselőjével (DPO)</b> vagy jogásszal kell egyeztetni, mielőtt éles használatba kerül. A <span class="todo">TEENDŐ</span> jelölés a hiányzót, a <span class="ok">KÉSZ</span> a már megvalósítottat jelzi.</div>

<h2>0 · Szerepek <small>ki dönt, ki fér hozzá</small></h2>
<ul>
<li><b class="k">Adatkezelő:</b> az adott <b>iskola</b>. Minden iskola <b>saját aloldalt és saját adatbázist</b> kap, ezért külön adatkezelő, az adatok iskolák között nem keverednek. <span class="ref">GDPR 4. cikk 7.</span></li>
<li><b class="k">Rendszerüzemeltető (igazgató):</b> az adatbázis és az összes bejelentés. <b class="k">Karbantartó:</b> a bejelentések. <b class="k">Tanárok:</b> a regisztrációk jóváhagyása. <b class="k">Felhasználók:</b> diákok (14–19 év) és tanárok / dolgozók, csak a saját adataik.</li>
<li><b class="k">Fejlesztő diákok:</b> ha éles adathoz hozzáférnek, az iskola <b>adatfeldolgozói</b> / megbízottai, <b>kiskorúként</b> is. Javaslat: éles adatbázishoz <b>ne</b> férjenek hozzá, csak kódot és tesztadatot kezeljenek. <span class="ref">GDPR 28–29. cikk</span> <span class="todo">DÖNTÉS</span></li>
</ul>

<h2>1 · Mire használható az adat? <small>célhoz kötöttség</small></h2>
<div class="cols">
<div><h3>Megengedett célok</h3>
<ul>
<li><b class="k">Azonosítás:</b> kinek a nevében érkezik a bejelentés, visszaélés megelőzése.</li>
<li><b class="k">Hibakezelés:</b> hely, eszköz, leírás, fénykép, állapot, megjegyzés.</li>
<li><b class="k">Visszajelzés:</b> saját bejelentések, követőkód.</li>
<li><b class="k">Biztonság:</b> spamvédelem, óránkénti korlát, naplózás.</li>
<li><b class="k">Statisztika:</b> csak összesítve, személy nélkül.</li>
</ul></div>
<div><h3>Nem megengedett</h3>
<ul>
<li>Marketing, profilozás, harmadik félnek átadás.</li>
<li>Fejlesztés vagy tesztelés <b>éles adatokkal</b>.</li>
<li><b>Fegyelmi vagy értékelési felhasználás</b> külön jogalap és tájékoztatás nélkül (rongálás bejelentésénél kényes). <span class="todo">SZABÁLY</span></li>
<li>Több adat gyűjtése a szükségesnél (ezért nincs e-mail, telefon, osztály). <span class="ok">KÉSZ</span></li>
</ul></div>
</div>
<span class="ref">GDPR 5. cikk (1) b), c)</span> <span class="ref">25. cikk (beépített és alapértelmezett adatvédelem)</span>

<h2>2 · Hogyan jön létre a „megállapodás”? <small>jogalap és tájékoztatás</small></h2>
<ul>
<li><b class="k">Javasolt jogalap: közfeladat</b> (az iskola létesítményeinek működtetése, vagyonvédelem). A tanuló–iskola és munkavállaló–munkáltató viszonyban a <b>hozzájárulás általában nem tekinthető önkéntesnek</b>. <span class="ref">GDPR 6. cikk (1) e)</span> <span class="ref">(43) preambulumbekezdés</span> <span class="ref">Nkt. 2011. évi CXC.</span> <span class="ref">Szkt. 2019. évi LXXX.</span> <span class="todo">DPO MEGERŐSÍTÉS</span></li>
<li><b class="k">Hozzájárulás</b> csak kiegészítő lehet (pl. fénykép). Ha mégis az az alap: visszavonható, bizonyítható, külön megadott. <span class="ref">GDPR 7. cikk</span> <b>16 év alattiaknál</b> szülői hozzájárulás kell, Magyarországon a GDPR 16 éves alapértelmezése él (hivatalos forrással ellenőrizendő). <span class="ref">GDPR 8. cikk</span></li>
<li><b class="k">Technikai megoldás:</b> regisztrációkor <b>tájékoztató linkje + tudomásulvétel</b> (nem „elfogadom, hogy tárolják”), a <b>tájékoztató verziója és időpontja</b> mentve. Az admin jóváhagyás <b>jogosultságkezelés</b>, nem jogalap. <span class="todo">A mostani szöveg hozzájárulás jellegű, át kell írni; a verzió és időpont nincs mentve</span></li>
<li><b class="k">Tájékoztató (adatkezelési tájékoztató) kötelező tartalma:</b> adatkezelő és DPO elérhetősége, cél, jogalap, címzettek, külföldre továbbítás, <b>megőrzési idő</b>, jogok, panasz joga. <span class="ref">GDPR 12–13. cikk</span> <span class="todo">Nincs önálló oldal</span></li>
<li><b class="k">Kiskorúak:</b> a 14. életévét betöltött kiskorú korlátozottan cselekvőképes. <span class="ref">Ptk. 2:12. §</span> Az iskola a szülőket az iskolai csatornákon tájékoztatja.</li>
</ul>

<h2>3 · Felhasználói jogok <small>határidő: 1 hónap, indokolt esetben +2 hónap · GDPR 12. cikk (3)</small></h2>
<table>
<tr><th style="width:21%">Jog</th><th style="width:10%">Hivatkozás</th><th>Nálunk konkrétan</th><th style="width:9%">Állapot</th></tr>
<tr><td><b class="k">Tájékoztatás</b></td><td>13–14. cikk</td><td>Adatkezelési tájékoztató oldal a regisztrációnál és a láblécben.</td><td><span class="todo">TEENDŐ</span></td></tr>
<tr><td><b class="k">Hozzáférés</b></td><td>15. cikk</td><td>A profil és a saját bejelentések másolata. A „Bejelentéseim” oldal részben megmutatja, teljes export nincs.</td><td><span class="todo">TEENDŐ</span></td></tr>
<tr><td><b class="k">Helyesbítés</b></td><td>16. cikk</td><td>Név javítása admin által. Felületen nincs.</td><td><span class="todo">TEENDŐ</span></td></tr>
<tr><td><b class="k">Törlés</b></td><td>17. cikk</td><td>Fiók törlése és a bejelentések <b>név nélküli (anonim) átalakítása</b>, mert a név pillanatképként a bejelentéshez is tárolódik. Közfeladati alapnál a jog nem korlátlan (17. cikk (3) b).</td><td><span class="todo">TEENDŐ</span></td></tr>
<tr><td><b class="k">Korlátozás</b></td><td>18. cikk</td><td>A profil „elutasított” állapota megakadályozza a használatot.</td><td><span class="ok">KÉSZ</span></td></tr>
<tr><td><b class="k">Tiltakozás</b></td><td>21. cikk</td><td>Közfeladati alapnál kérhető, az iskola elbírálja.</td><td><span class="todo">ELJÁRÁS</span></td></tr>
<tr><td><b class="k">Adathordozhatóság</b></td><td>20. cikk</td><td>Közfeladati alapnál <b>nem alkalmazandó</b>, a tájékoztató ezt jelzi.</td><td>—</td></tr>
<tr><td><b class="k">Panasz, jogorvoslat</b></td><td>77–79., 82. cikk</td><td>NAIH-hoz fordulás, bírósági jogérvényesítés, kártérítés. <span class="ref">Infotv. 2011. évi CXII.</span></td><td>tájékoztatóba</td></tr>
</table>

<h2>4 · Fejlesztői és adatkezelői kötelezettségek</h2>
<div class="cols">
<ul>
<li><b class="k">Elszámoltathatóság:</b> a megfelelést bizonyítani kell (dokumentáció, naplók). <span class="ref">5. cikk (2), 24. cikk</span></li>
<li><b class="k">Nyilvántartás</b> az adatkezelési tevékenységekről (iskola). <span class="ref">30. cikk</span> <span class="todo">TEENDŐ</span></li>
<li><b class="k">DPO:</b> a közfeladatot ellátó szerv köteles kijelölni. <span class="ref">37. cikk</span></li>
<li><b class="k">Adatfeldolgozói szerződés:</b> iskola–fejlesztők, valamint a szolgáltatók (Supabase, Vercel, Cloudflare) DPA-ja. <span class="ref">28. cikk</span></li>
<li><b class="k">Hatásvizsgálat (DPIA):</b> kiskorúak miatt küszöbelemzés, dokumentálva. <span class="ref">35. cikk</span> <span class="todo">TEENDŐ</span></li>
</ul>
<ul>
<li><b class="k">Biztonság:</b> titkosított kapcsolat, jelszó-hash, jogosultság-szétválasztás, privát fájltároló, mentés. <span class="ref">32. cikk</span></li>
<li><b class="k">Adatvédelmi incidens:</b> bejelentés a NAIH-nak <b>72 órán belül</b>, súlyos kockázatnál az érintetteknek is. <span class="ref">33–34. cikk</span> <span class="todo">Eljárásrend kell</span></li>
<li><b class="k">Külföldre továbbítás:</b> Vercel, Cloudflare (USA): EU–USA adatvédelmi keretrendszer és/vagy SCC. <span class="ref">44–46. cikk</span></li>
<li><b class="k">Titoktartás:</b> az adathoz hozzáférők írásban kötelezettek. <span class="ref">28. cikk (3) b), 32. cikk (4)</span></li>
<li><b class="k">Sütik:</b> a bejelentkezéshez szükséges munkamenet-süti hozzájárulás nélkül használható. <span class="ref">Eht. 2003. évi C., 155. §</span> (pontos bekezdés ellenőrizendő)</li>
</ul>
</div>

<h2>5 · Adattárolás és hozzáférés a TechALARM-ban <small>konkrétan</small></h2>
<table>
<tr><th style="width:19%">Adat</th><th style="width:26%">Hol tároljuk</th><th style="width:20%">Meddig (javaslat)</th><th>Ki fér hozzá</th></tr>
<tr><td><b class="k">Név</b>, belépési azonosító, állapot, időpontok</td><td>Supabase PostgreSQL, <b>EU (Írország, eu-west-1)</b>; táblák sorszintű védelemmel (RLS)</td><td>az iskolai jogviszony végéig, utána törlés (30 napon belül)</td><td>üzemeltető, jóváhagyó tanár; a felhasználó a sajátját</td></tr>
<tr><td><b class="k">Jelszó</b></td><td>Supabase Auth, nem visszafejthető <b>hash</b> (bcrypt)</td><td>a fiók megszűnéséig</td><td>senki (nem olvasható)</td></tr>
<tr><td><b class="k">Bejelentés</b>: hely, eszköz, leírás, állapot, megjegyzés, <b>név pillanatkép</b>, követőkód</td><td>Supabase PostgreSQL (EU)</td><td>tanév végéig + 1 év, utána törlés vagy anonimizálás</td><td>karbantartó, üzemeltető; a bejelentő a sajátját</td></tr>
<tr><td><b class="k">Fénykép</b> (kötelező)</td><td>Supabase Storage, <b>privát tároló</b>, megtekintés 1 órás aláírt hivatkozással</td><td>a bejelentéssel együtt</td><td>karbantartó, üzemeltető</td></tr>
<tr><td><b class="k">Munkamenet-süti</b></td><td>böngésző, Supabase Auth</td><td>a munkamenet / kijelentkezés</td><td>csak a felhasználó eszköze</td></tr>
<tr><td><b class="k">Régi IP-hash</b> (a névtelen időszak bejelentéseinél)</td><td>reports tábla, <code>ip_hash</code> oszlop</td><td><b>törlendő</b>, már nem használjuk</td><td>üzemeltető</td></tr>
<tr><td><b class="k">Kérésnaplók</b> (IP, böngésző)</td><td>Vercel és Supabase naplók, <b>Vercel függvények alapértelmezett régiója: USA (iad1)</b></td><td>szolgáltatói szabály szerint</td><td>üzemeltető, szolgáltató</td></tr>
<tr><td><b class="k">Spamvédelem</b> (regisztrációnál)</td><td>Cloudflare Turnstile: az IP és a böngészőadatok a Cloudflarehez kerülnek</td><td>a szolgáltató szerint</td><td>Cloudflare (szolgáltató)</td></tr>
<tr><td><b class="k">Látogatottság</b></td><td>Vercel Web Analytics: sütik nélkül, személy nélküli összesítés</td><td>szolgáltatói szabály</td><td>üzemeltető</td></tr>
</table>
<div class="box"><b class="k">Már megvalósított védelem:</b> e-mail és egyéb felesleges adat nem kell · jelszó csak hash · bejelentés csak jóváhagyott, belépett felhasználótól · admin felület külön jogosultsághoz kötve · fotó privát tárolóban · a titkos szerverkulcs nem kerül a böngészőbe · az EU-s adatbázisrégió. <span class="ok">KÉSZ</span></div>

<h2>6 · Nyitott kérdések és teendők <small>sorrend: fontosság szerint</small></h2>
<div class="cols">
<ul>
<li><b>Iskola:</b> adatkezelő pontos neve, DPO elérhetősége, a jogalap jóváhagyása. <span class="todo">DÖNTÉS</span></li>
<li><b>Tájékoztató oldal</b> megírása, a regisztrációs szöveg átírása „tudomásulvételre”, verzió + időpont mentése. <span class="todo">FEJLESZTÉS</span></li>
<li><b>Szerepkörök szétválasztása:</b> most egyetlen admin szint van, kell: karbantartó (bejelentések), jóváhagyó tanár (regisztrációk), üzemeltető (minden). <span class="todo">FEJLESZTÉS</span></li>
<li><b>Jogkérelmek:</b> adatexport, névjavítás, fiók törlése + anonimizálás. <span class="todo">FEJLESZTÉS</span></li>
<li><b>Fegyelmi felhasználás</b> szabályozása (rongálás). <span class="todo">DÖNTÉS</span></li>
</ul>
<ul>
<li><b>Vercel régió EU-ra</b> állítása (pl. Frankfurt vagy Dublin), hogy a név és a fotó ne USA-n keresztül menjen. <span class="todo">KONFIGURÁCIÓ</span></li>
<li><b>Régi <code>ip_hash</code> értékek</b> kiürítése. <span class="todo">ADATBÁZIS</span></li>
<li><b>Megőrzési idő</b> automatikus végrehajtása (ütemezett törlés). <span class="todo">FEJLESZTÉS</span></li>
<li><b>Fejlesztők hozzáférése:</b> külön tesztadatbázis, éles csak az üzemeltetőnek. <span class="todo">DÖNTÉS</span></li>
<li><b>Mentés és helyreállítás</b> a Supabase-csomagtól függ, ellenőrizendő. <span class="todo">ELLENŐRZÉS</span></li>
</ul>
</div>

<div class="src"><b>Források:</b> GDPR: <a href="https://eur-lex.europa.eu/eli/reg/2016/679/oj/hun">eur-lex.europa.eu/eli/reg/2016/679</a> · Infotv.: <a href="https://njt.hu">njt.hu (2011. évi CXII. törvény)</a> · NAIH: <a href="https://www.naih.hu">naih.hu</a> · Vercel DPF: <a href="https://vercel.com/changelog/vercel-is-now-certified-under-the-eu-us-data-privacy-framework-dpf">vercel.com/changelog</a> · Vercel régiók: <a href="https://vercel.com/docs/functions/regions">vercel.com/docs/functions/regions</a> · Supabase DPA: <a href="https://supabase.com/legal/dpa">supabase.com/legal/dpa</a> (az SCC-t használja). A szakasz-hivatkozásokat (különösen Nkt., Szkt., Eht., Infotv.) a DPO-val ellenőriztesd.</div>
</body></html>`;

writeFileSync(here("./adatvedelmi-attekinto.html"), html);
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto("file://" + here("./adatvedelmi-attekinto.html"));
await page.evaluate(() => document.fonts.ready);
await page.pdf({ path: here("./adatvedelmi-attekinto-A4.pdf"), format: "A4", printBackground: true, margin: { top: "11mm", right: "12mm", bottom: "12mm", left: "12mm" } });
await browser.close();
console.log("kész");
