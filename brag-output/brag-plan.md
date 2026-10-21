# Brag Plan: TechALARM

## What is this app?
Hibabejelentő weboldal a Mátészalkai Gépészeti Technikumnak: bárki — diák, tanár — névtelenül jelentheti, ha elromlott egy eszköz, megrongálták vagy eltűnt valami, és a kapott követőkóddal végig nyomon követheti, mi történt vele.

## The angle
A „megint nem működik a projektor, és senki nem tud segíteni” érzés kerek története: a hiba → a bejelentés (telefonról, 1 perc, név nélkül) → az admin látja és megjavíttatja → a bejelentő a kódjával látja, hogy megjavították. A videó végigmegy ezen a teljes körön, nem csak a bejelentő űrlapot mutatja. A hang: nyugodt, megbízható, kicsit melegen humoros — egy iskolai „hibajegy-történet”, ami jó véget ér.

## Hook (first 2-3 seconds)
Fekete háttér, egyetlen sor gépelődik be: „Megint elromlott?” — majd ugyanabban a másodpercben megjelenik a piros „!” jelvény. A zene intrója csendesen indul, az első ütem a 3,02 s-nál érkezik.

## Key moments (the middle)
- A problémák, ahogy az oldal kategorizálja őket: *Elromlott / nem működik · Rongálás · Hiányzik / eltűnt · Egyéb* — egyesével, ütemre érkező kártyák az eszközök mellett (projektor, számítógép, pad, szék).
- „Szóltam a tanárnak. / Szóltam az osztálytársnak. / Senki nem tudott segíteni.” — a saját promó-anyagunk sorai, gépelve; végül „Ismerős helyzet?”.
- A telefonos űrlap élőben kitöltve: *Terem típusa: Informatika terem → Terem száma: 104 → Eszköz: Projektor → Mi a probléma?: Elromlott / nem működik → leírás gépelve → Bejelentés elküldése*.
- A siker-képernyő: „Köszönjük, a bejelentésed megérkezett!” + `TA-K7M2-QX9P` követőkód (példa-kód).
- Az admin oldal: bejelentések listája, szűrés, státuszváltás (Új → Folyamatban → Megjavítva), megjegyzés, amit a bejelentő is lát.
- A követőoldal: a kód beírása → állapot + „Üzenet a karbantartótól: Csütörtökön új projektor érkezik.”
- Termek: a három teremtípus + a bejelentő által beírt teremszám; CSV-import az adminnak.
- Plakát/roll-up QR-kóddal: egy beolvasás, és már jelentesz.

## Outro / punchline
„Szólj. Névtelenül.” — logó, `tech-alarm.vercel.app`, QR-kód. Utolsó beat: a projektor jelvénye zöldre vált („Megjavítva”).

## User flow worth showing
Entry (QR/oldal) → key action (űrlap kitöltése, küldés) → result (követőkód → admin státusz → „Megjavítva” a követőoldalon). Ez a videó gerince, nem a landing page.

## Tone
- Preset: **default** (tisztán, melegen, postolható), a `polished` visszafogottságával a felhasználói folyamat jeleneteiben
- Creative direction: „iskolai hibajegy-történet, ami jó véget ér” — nyugodt magabiztosság, a termék magától beszél
- Interpretation: hosszú (~2 perces) forma, ezért a ritmus *szakaszos*: rövid, ütemre vágott felvezetés (probléma), majd a folyamat jelenetei hosszabb tartással, hogy a képernyők szövege olvasható legyen; a nagy pillanatok a zene erős ütemeire esnek.

## Format: landscape — 1920x1080
## Duration: 120 s (a felhasználó kifejezett kérése; az alapértelmezett 15–25 s-os keretet ez felülírja), 30 fps, H.265 (HEVC) kimenet

## Visual identity (from the project)
- Background: `#0b1437` (mély éjkék; a plakátokon és a roll-upon is ez) – a UI-jelenetekben a weboldal világos felülete `#f8fbff` kártyákkal
- Accent: `#2563eb` (gomb/kiemelés), `#60a5fa` (szöveg-kiemelés sötét alapon)
- Text: `#eaf1ff` (sötéten), `#172554` (világos felületen)
- Display font: Inter 800/900 · Body font: Inter 400–600 (a weboldal is Inter)
- Strongest visual element: a TechALARM pajzs-logó (`docs/brand/logo-*.svg`), a piros „!” jelvényes eszközök és a telefon-űrlap

## Share copy (draft)
Megint nem működik a projektor? Bejelentjük — névtelenül, 1 perc alatt, a kapott kóddal pedig nyomon követhető, mikor javítják meg. TechALARM, a Mátészalkai Gépészeti Technikum hibabejelentője: tech-alarm.vercel.app

## Audio direction
- Role: warm bed + sparse professional accents; a zene energiája az erős ütemeknél lép előre
- Music: `happy-beats-business-moves-vol-1` (163,96 s, 120,19 BPM), az első 120 s, a végén 6 s-os fade-out
- Music treatment: halk belépés (0–1,5 s fade-in), alapszint ~0,55; a 16,02 s-os és 48,02 s-os erős ütemnél a hangzás kinyílik (ez a track saját dinamikája); 114–120 s lassú lecsengés a logó alatt
- Music cue guidance: bundled preset (`vol-1.music-cues.json`), 120,19 BPM, első ütem 3,02 s. Erős cue-k: 16,02 (logó-reveal), 48,02 (admin-reveal), 72,02–73,02 (állapot „Megjavítva”), 96,01 (plakát), 108,02 (finálé). Szekvenciális eseményekre a 0,5 s-os ütemrács.
- Audio-reactive treatment: subtle; a logó és az aktív telefon-keret körüli ragyogás a zene RMS/basszusával enyhén „lélegzik”. Nincs hullámforma/equalizer.
- SFX posture: moderate, mozgáshoz illesztett, visszafogott (az `sfx-analysis.md` alacsony HF-kockázatú fájljaiból: `click_*`, `drop_*`, `impactSoft_medium_*`, `bong_001`, `impactBell_heavy_000` a végére, billentyű-hangok a gépeléshez)
- Audio-coupled moments: a hook gépelése, az űrlap mezői és gépelése, a „Küldés” kattintás, a státuszváltások, a kártyák egyesével
- Restraint rule: hang soha nem takarja az olvasást; a gépelés-SFX csak a rövid szövegeknél, ritkítva a hosszabbaknál

## Storyboard

### Scene 1 — Hook — 3,02 s (0,00–3,02)
Fekete → „Megint elromlott?” gépelődik, a végén piros „!” jelvény pattan mellé.
Sequential/interaction: igen — karakterenként gépelés.
Audio intent: csendes várakozás, a zene intrója felett billentyűkopogás.
Audio-coupled idea: gépelés billentyű-hangokkal.
Transition mood: hard cut a 3,02 s-os első ütemre → Scene 2

### Scene 2 — A problémák — 6,50 s (3,02–9,52)
Bal oldalt négy eszköz (projektor, számítógép, pad, szék) egyesével érkezik, mindegyik piros „!” jelvénnyel; jobb oldalt négy kategória-kártya: Elromlott / nem működik · Rongálás · Hiányzik / eltűnt · Egyéb. Ütemre, kétütemenként.
Sequential/interaction: igen — 4 kártya + 4 eszköz egyesével (0,5 s-os rácson, a szöveg minden második ütemnél, hogy olvasható maradjon).
Audio intent: gyorsuló, de nyugodt felépítés.
Audio-coupled idea: kártya-érkezések `drop_*`/`click_*` hanggal.
Transition mood: clean → Scene 3

### Scene 3 — „Senki nem tudott segíteni” — 6,50 s (9,52–16,02)
Három sor gépelődik be egymás alá („Szóltam a tanárnak.” / „Szóltam az osztálytársnak.” / „Senki nem tudott segíteni.”), az utolsó kiemelve; a végén nagy „Ismerős helyzet?”.
Sequential/interaction: igen — soronkénti gépelés, minden sor ≥1,2 s-ot áll.
Audio intent: a feszültség épül a 16,02 s-os erős ütemig.
Audio-coupled idea: gépelés-SFX csak az első karakterekre soronként (ritkítva).
Transition mood: dramatic — fehér-kék villanás a 16,02 s-os erős ütemre → Scene 4

### Scene 4 — Logó-reveal — 8,00 s (16,02–24,02)
A TechALARM pajzs-logó beúszik és ráül a 16,02 s-os erős ütemre (beat-locked), alatta „Mátészalkai Gépészeti Technikum” és „Szólj. Névtelenül.”. Háttérben lassan lélegző ragyogás.
Sequential/interaction: nem; egy hero-pillanat.
Audio intent: nagy megkönnyebbülés, a zene kinyílik.
Audio-coupled idea: logó-landolás `impactSoft_medium` + halk `bong_001`; audio-reaktív ragyogás.
Transition mood: soft → Scene 5

### Scene 5 — A bejelentés: az űrlap — 12,00 s (24,02–36,02)
Telefon-keret a képernyő közepén, jobb oldalt kis lépéslista (1 Terem típusa · 2 Terem száma · 3 Eszköz · 4 Probléma · 5 Leírás), bal oldalt a kiemelt mező magyarázata. Valós űrlap: *Terem típusa* = Informatika terem; *Terem száma / jele* = 104 (gépelve); *Eszköz* = Projektor; *Mi a probléma?* = Elromlott / nem működik; *Leírás* gépelve: „A projektor füstöl, a kép csak néha jön be.”.
Sequential/interaction: igen — szimulált koppintások és gépelés.
Audio intent: tiszta, ritmikus, megnyugtató.
Audio-coupled idea: koppintás = `click_*`, gépelés = ritkított billentyű-hangok; mezőváltás ütemre.
Transition mood: clean → Scene 6

### Scene 6 — Elküldve, jön a kód — 12,00 s (36,02–48,02)
A „Bejelentés elküldése” gomb lenyomódik, a form átvált a siker-képernyőre: „Köszönjük, a bejelentésed megérkezett!”, a követőkód `TA-K7M2-QX9P` (példa-kód) nagy, kiemelt dobozban, alatta „Jegyezd fel vagy készíts róla képernyőképet”. Mellette felirat: „Nem kell bejelentkezni. Nincs név, nincs fiók.” (az oldal: „Bejelentkezés nélkül”; az IP-t csak sózott hash-ként tároljuk).
Sequential/interaction: igen — gomb-koppintás, siker-átváltás, kód-felugrás.
Audio intent: apró győzelem.
Audio-coupled idea: `impactBell_heavy_000` a kód-landolásra (halkan).
Transition mood: dramatic — a 48,02 s-os erős ütemre vágás → Scene 7

### Scene 7 — Az admin látja — 12,00 s (48,02–60,02)
Asztali ablak-keret: Admin → Bejelentések lista; az új sor „Informatika terem – 104 – Projektor” (Új állapot, piros címke) becsúszik a lista tetejére a 48,02-es ütemre; mellette a szűrés (Új/Folyamatban/Megjavítva/Elutasítva) és 3 példasor.
Sequential/interaction: igen — sorok egyesével, a szűrő kattintása.
Audio intent: nagy, tiszta hang-nyílás.
Audio-coupled idea: sor-érkezések `card-slide`/`drop`.
Transition mood: clean → Scene 8

### Scene 8 — Státusz és üzenet — 12,00 s (60,02–72,02)
Admin részletlap: a státusz-választó Új → Folyamatban → Megjavítva; megjegyzés: „Csütörtökön új projektor érkezik.” (a mező felirata: „a bejelentő is látja a követőoldalon”).
Sequential/interaction: igen — legördülő kiválasztás, gépelés, „Mentés”.
Audio intent: dolgozik a rendszer.
Audio-coupled idea: `switch_*`/`click_*`.
Transition mood: clean → Scene 9

### Scene 9 — A bejelentő látja — 12,00 s (72,02–84,02)
A követőoldal telefonon: „Bejelentés állapota” → a kód beírása → állapot-lánc Új ✓ → Folyamatban ✓ → Megjavítva (a 72,02/73,02 erős ütemeken) + „Üzenet a karbantartótól: Csütörtökön új projektor érkezik.”
Sequential/interaction: igen — gépelés, majd három állapot egymás után.
Audio intent: a kör bezárul.
Audio-coupled idea: státuszonként egy `drop`, a „Megjavítva”-ra `impactBell`.
Transition mood: soft → Scene 10

### Scene 10 — Termek és eszközök — 11,99 s (84,02–96,01)
Admin „Termek és eszközök”: a három teremtípus (Informatika terem · Gépész terem · Osztályterem) eszközökkel, és a „Tömeges feltöltés CSV-ből” (három oszlop: terem; eszköz; leltári szám). Felirat: a terem számát a bejelentő írja be.
Sequential/interaction: igen — három típus-kártya egyesével, CSV-sorok gépelve.
Audio intent: nyugodt, rendezett.
Audio-coupled idea: kártya-érkezések `drop`.
Transition mood: clean → Scene 11

### Scene 11 — Plakát és QR — 12,01 s (96,01–108,02)
A roll-up és a fekvő plakát valós képe lassú nagyítással; a QR-kód körül jelzőgyűrű; felirat: „Egy beolvasás — és már jelentesz.” (a README: a `/?terem=` hivatkozás előre kiválasztja a termet — későbbi QR-kódokhoz).
Sequential/interaction: nem.
Audio intent: a felépítés a finálé felé.
Audio-coupled idea: a 96,01 s erős ütemre a roll-up beúszik.
Transition mood: dramatic → Scene 12

### Scene 12 — Finálé — 11,98 s (108,02–120,00)
A 108,02 s-os erős ütemre: logó + „Szólj. Névtelenül.” + `tech-alarm.vercel.app` + QR-kód; a projektor-jelvény pirosról zöldre vált. A zene a 114. másodperctől lassan lecseng, az utolsó pillanat: csend + hold.
Sequential/interaction: igen — elemek egymás után.
Audio intent: lezárás, hála.
Audio-coupled idea: `impactBell_heavy_000` halkan a zöld jelvényre.
Transition mood: fade to dark.

**Music mood for this video:** upbeat, de visszafogott (warm corporate bed)
**Audio summary:** csendes intró és gépelés → ütemre épülő probléma-szakasz → a 16 s-nál kinyíló zene a megoldáshoz → tiszta, ritmikus folyamat-jelenetek → a 108 s-os finálé és hosszú, lágy lecsengés.

## Music cue guidance
- Track: `happy-beats-business-moves-vol-1-by-ende-dot-app.mp3`, 120,19 BPM, első ütem 3,02 s, ütemrács 0,50 s.
- Erős cue-k: 16,02 · 48,02 · 72,02 · 96,01 · 108,02 (a nagy jelenet-váltásokra).
- Szekvenciális olvasható szövegnél minden második ütem (1,0 s).
- A cue-k csak segítség; olvashatóság és történet az első.

## Grounding (minden állítás forrása)
- Funkciók, szövegek: `README.md`, `src/app/*` (űrlap, követőoldal, admin), `supabase/migrations/20261021000001_room_types.sql`
- „Szólj. Névtelenül.”, „Elromlott valami?”, a lépések: a saját plakátjaink és roll-upunk (`docs/promo/`)
- Példa-adatok (kód, projektor-INF jelölés, „Csütörtökön új projektor érkezik.”) **kitalált minta**; a videóban „PÉLDA” jelölés kerül rájuk
