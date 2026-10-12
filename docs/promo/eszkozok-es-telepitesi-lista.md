# TechALARM – promo anyagok: eszközök és telepítési lista

Cél: plakát, roll-up, matrica, kitűző, promo videó és felhasználói útmutató videó, a lehető legprofibb kivitelben.
Készült: 2026-10-12. A szövegben jelölve van, mi ellenőrzött, és mi nem.

## 0. Állapot

| Kérés | Állapot |
|---|---|
| `addyosmani/agent-skills` telepítése | **Nincs telepítve.** A repót átnéztem (25 skill, MIT), de az `npx skills add` futtatását a biztonsági szabály blokkolta (harmadik féltől származó kód beemelése). Lásd az 1. pontot. |
| `vercel-labs/skills` telepítése | **Nincs telepítve**, ugyanezért. Ez a `skills` CLI, benne a `find-skills` skill-lel. |
| Skillek, pluginok, connectorok keresése | **Kész**, lásd lent. |

## 1. A két kért skill-repó telepítése

A repók tartalma átnézve. Telepítés két módon lehet:

**A) Te futtatod a saját gépeden**, a TechALARM mappában:

```bash
npx skills add vercel-labs/skills --skill find-skills -a claude-code --copy -y
npx skills add addyosmani/agent-skills --skill '*' -a claude-code --copy -y
```

**B) Engedélyezed nekem.** Ehhez a Claude Code beállításaiban adj Bash-szabályt az `npx skills add:*` parancsra, vagy szólj, hogy a fájlokat manuálisan másoljam be a `.claude/skills/` mappába. Utána futtatom, és commitolom a repóba, hogy a jövőbeli munkamenetekben is meglegyenek.

## 2. Skillek (npx skills add …)

Az alábbi repók léteznek (ellenőrizve `git ls-remote`-tal). A tartalmukat telepítés előtt érdemes átnézni.

| Mire | Skill-repó | Megjegyzés |
|---|---|---|
| Videó kódból (React) | `remotion-dev/skills` → `remotion-best-practices` | Hivatalos Remotion skill: animáció, hang, felirat, 3D, diagram. Legjobb választás a promo videóhoz. |
| Videó HTML-ből | `heygen-com/hyperframes` | HTML + GSAP + Three.js → MP4. Apache-2.0, Node 22+ és FFmpeg kell. |
| Design minőség | `pbakaus/impeccable` | Az „AI-sablonos" kinézet elkerülésére; 23 design parancs (harmadik fél írása szerint). |
| Design rendszer | `nextlevelbuilder/ui-ux-pro-max-skill` | Stílusok, színpaletták, betűpárosítások. |
| Plakát / kép | `anthropics/skills` → `canvas-design`, `theme-factory`, `brand-guidelines` | A `canvas-design` PNG/PDF plakátot készít. |
| Web UI ellenőrzés | `vercel-labs/agent-skills` → `web-design-guidelines` | Az oldal UI-jának átvizsgálásához. |

Tipp: a `.claude/skills` mappába telepítő paranccsal kell dolgozni (`-a claude-code`), mert a sima `skills add` az `.agents/skills` mappába tesz, amit a Claude Code nem biztos, hogy észrevesz.

## 3. Pluginok (claude.ai plugin-katalógus)

A katalógusban talált, **még nem engedélyezett** pluginok. Te tudod engedélyezni a fiókodban.

| Prioritás | Plugin | Mire jó |
|---|---|---|
| **1. (legfontosabb)** | **Codesign** (IMG.LY) | Szerkeszthető designok (InDesign/Photoshop/PDF), **nyomdakész PDF CMYK-ban, vágási ráhagyással**, és videó export. Helyben fut, fiók nélkül. Ez fedi le a plakát + roll-up + matrica + kitűző feladatot, és tud videót is. Skilljei: animate, brand, resize, launch-video, localize. |
| 2. | **video-shotcraft** | Filmszerű termékvideó Remotionnel: jelenet-receptek, mozgás-előnézet, újrahasználható komponensek, hangeffektek, kész sablon. |
| 3. | **brand-md** | `BRAND.md`: márkastratégia, hangnem, vizuális alapelemek. Egy egységes márkaleírás után minden anyag (plakát, videó) ugyanazt mondja. |
| 4. | **Make Poster** | Nyomdakész plakát PDF-ben, tetszőleges papírméretre. |
| 5. | **Superdesign** | Frontend, prezentáció és marketing grafika egy végtelen vásznon. |
| opcionális | **AI Video Editor & Timeline** (ManyMotions) | Többsávos időszalag, átmenetek, beégetett felirat, MP4 export (a saját fiókodban). |
| opcionális | Abracadabrax Poster & Flyer, AI Logo Maker | Gyors tervek. Az „Apple-szintű" célhoz kevésbé ajánlott (generált, kevésbé szerkeszthető). |

## 4. Connectorok (MCP) – ezeket kell összekötnöd

A csatlakoztatást a claude.ai-n (Settings → Connectors) te végzed. Jelenleg **csak ezek vannak bekötve**: Context7, MDN, Supabase, Vercel.

| Prioritás | Connector | Mire kell | Megjegyzés |
|---|---|---|---|
| **1.** | **Canva** | Plakát, roll-up, matrica sablonok; exportálás PDF/PNG-be | Széles körben ismert, sablonok, nyomdai export. |
| **1.** | **Adobe** | Professzionális szerkesztés, animálás (`animate_design`), márka-színtémák | Akkor éri meg, ha van Adobe-fiókod. |
| **1.** | **HyperFrames by HeyGen** | Mozgóképes grafika és animált diák HTML-ből, `compose` + `render_video` | A promo videó fő motorja lehet, a Remotion alternatívája. |
| 2. | **Figma** | Design-rendszer, komponensek, képernyőképek; a weboldal és az anyagok egységesítése | A `plugin:design:figma` már konfigurálva van, de most nem csatlakozott (proxy hiba). Újrapróbálásra szorul. |
| 2. | **ElevenLabs** | Hangalámondás (magyar nyelv támogatott) | A connector jelenleg ElevenAgents-fókuszú (hangügynökök); a sima TTS-hez az API-kulcsos használat is kell lehet. |
| 2. | **Tella** | Képernyőfelvétel szerkesztése, felirat, hangeffekt – a **felhasználói útmutató videóhoz** | Nincs ingyenes csomag (7 napos próba). |
| 3. | **Unsplash** | Ingyenes HD fotók | Ha kell háttérkép. |
| 3. | **Frontify** | Márka-irányelvek és eszközök központi kezelése | Csak ha lesz nagyobb márkahasználat. |
| 3. | **Orshot** | Videók/PDF-ek/képek tömeges gyártása sablonból | Ha sok variánst kell gyártani. |
| 3. | **Moda** | PowerPoint, hirdetések, mozgóképes grafika | Alternatíva. |

## 5. Betűtípus, hang, zene

### Betűtípus

- **A „San Francisco" (SF Pro) betűt nem használhatod.** Az Apple licence szerint csak Apple platformos felhasználói felület mock-upjához szabad használni, marketing videóhoz és más platformra nem. Ezt blogok és fejlesztői fórumok írják, nem az Apple hivatalos szövege, ezért a letöltött licencfájlt is olvasd el.
- **Alternatívák Apple-hez hasonló hatással:** Inter (a legközelebb), Geist. Mindkettő nyílt licencű, de a pontos licencet ellenőrizd a hivatalos repóban. **Kötelező próba:** a magyar **ő és ű** betűk megjelenése minden kiválasztott betűtípusnál, mert egyes betűtípusokban hiányzik.
- Apple-szintű hatás szabályai: nagy, szellős tipográfia, kevés szó egy képernyőn, vékony és vastag vágás kontrasztja, sok üres tér, egyetlen akcentszín.

### Hang (magyar)

| Szolgáltatás | Állapot |
|---|---|
| ElevenLabs | A magyar nyelvet támogatja (2024-ben, Turbo v2.5 modellel jött). A v3 modell magyar támogatását **nem tudtam megerősíteni**. |
| Azure Neural (hu-HU Noémi, Tamás) | Van magyar hang. Egy 2024-es felhasználói hibajelentés szerint önálló szavaknál rosszul ejtett; ez egyetlen, régebbi jelentés. |
| Google Cloud Chirp 3: HD | A hu-HU nyelv szerepel a támogatottak között, magyar hangnév nem derült ki. |

Javaslat: ugyanazt a 3–4 mondatos mintaszöveget próbáld ki mindháromnál, és válaszd ki, melyik hangzik természetesnek. A nevek (TechALARM, MSZC) kiejtését külön teszteld.

### Zene és hangeffekt

- **Pixabay Music** és **YouTube Audio Library**: ingyenes, legtöbbször jóváírás nélkül, **de számról számra ellenőrizd a feltételeket** kereskedelmi felhasználáshoz.
- **Epidemic Sound**, **Artlist**: fizetős, egyértelműbb licenccel (kb. havi 10 USD; a pontos árat nézd meg).
- Egyszerű, visszafogott zongora vagy elektronikus alap illik az Apple stílushoz. A felhasználói útmutató videó alá csak nagyon halk zene vagy semmi.

### Felhasználói útmutató videó felvétele

- **Screen Studio** (csak Mac, fizetős): a legjobb automatikus nagyítás és kurzor-simítás. A **Tella** a bemutatókhoz és megosztáshoz jobb, de a kurzor-effektjei gyengébbek. Ez a forrásokban vitatott, a döntés előtt nézd meg a próbaverziót.

## 6. Nyomdai előírások (egyeztetendő a választott nyomdával)

Az alábbi értékek a talált nyomdák adatai. **Mindig a megrendelendő nyomda saját sablonját használd.**

| Termék | Mit találtam |
|---|---|
| **Roll-up 85 × 200 cm** | A fájlméret nyomdánként eltér: 87 × 217 cm (10 mm ráhagyással, Onlineprinters), 856 × 2066 mm (3 mm ráhagyással, PrintSimple), 852 × 2101 mm (1 mm ráhagyással, svájci nyomda). CMYK, jellemzően 150 dpi, a betűk görbékké alakítva. **A tartalmat az alsó ~10 cm-től és a tetejétől távol tartsd** (a kazetába csúszik). |
| **Matrica (kiszabott)** | 3 mm ráhagyás a vágóvonalon túl, a fontos tartalom legalább 2 mm-re belül. Egyszerű, lekerekített vágóvonal (a bonyolult alak hibákat okoz). 300 dpi, CMYK. |
| **Kitűző (gombkitűző)** | Nem találtam megbízható méret-specifikációt. **A gyártótól kérj sablont**, a gyakori átmérők (pl. 25, 32, 38 mm) nyomdánként eltérnek. |
| **Plakát (A2/A3)** | Általános gyakorlat: CMYK, 300 dpi, 3 mm ráhagyás, a betűk görbékké alakítva. Nem ellenőriztem nyomdánként. |

**Magyar nyomdát nem találtam** a kereséssel, a találatok külföldiek voltak. Magyar nyomdát (matrica, kitűző, roll-up) helyben kell kiválasztanod és árajánlatot kérned.

## 7. Javasolt munkamenet („profi, 10 ezer dolláros" minőséghez)

Őszintén: a minőséget nem az eszközök adják, hanem a következetes márka, az erős forgatókönyv és a valódi képernyőfelvétel. A javasolt sorrend:

1. **Márka:** `brand-md` + Figma → színek, betű, hangnem, logó egy helyen.
2. **Forgatókönyv:** a videókhoz 30–45 másodperces promo és 2–3 perces útmutató, jelenetenként 1 mondat.
3. **Nyomtatott anyagok:** Codesign vagy Canva → plakát, roll-up, matrica, kitűző; nyomdai sablonokra méretezve.
4. **Promo videó:** Remotion vagy HyperFrames, valódi oldal-képernyőképekből és animált tipográfiából; magyar hang + halk zene.
5. **Útmutató videó:** Screen Studio/Tella felvétel a valódi oldalról, felirattal és hanggal.
6. **Ellenőrzés:** a magyar ő/ű, a kiejtés, a hangerő, a nyomdai próbanyomat.

## 8. Mit kérek tőled

1. Engedélyezd az `npx skills add` futtatását (vagy futtasd te az 1. pont parancsait).
2. Köss be legalább: **Canva**, **HyperFrames**, és a **Codesign** plugint. Ha van Adobe- vagy Figma-fiókod, azokat is.
3. Mondd meg a márka irányát: színek (az oldal most narancs `#c2410c`), a logó, a hangnem (komoly vagy játékos).
4. Magyar hangból melyik tetszik a próba alapján?
5. Kiválasztottad a nyomdát? (Sablonokat onnan kell kérni.)
