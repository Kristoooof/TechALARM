# Hyperframes Composition Brief: TechALARM

## Objective
Hosszabb (~2 perces) launch-stílusú brag videó a TechALARM-hoz (felhasználó kifejezett kérése; felülírja a 15–25 s alapértelmezést).

## Output
- Composition directory: `brag-output/composition/`
- Rendered video: `brag-output/brag.mp4` (H.265/HEVC, `hvc1` tag)
- Format: landscape — 1920x1080, 30 fps
- Duration: 120 s

## Source Material
- Project root: `/home/user/TechALARM`
- Primary files read: README.md, src/app/{ReportForm.tsx,nyomon/page.tsx,admin/**}, supabase/migrations/*, docs/brand/*, docs/promo/{rollup,plakat-16x9}/
- Product name: TechALARM (Mátészalkai Gépészeti Technikum)
- Tagline / strongest claim: „Szólj. Névtelenül.”
- Key UI moments to recreate: a telefonos bejelentő űrlap, a siker-képernyő a követőkóddal, az admin lista + részletlap, a követőoldal
- Copy that must appear verbatim:
  - Megint elromlott?
  - Elromlott / nem működik · Rongálás · Hiányzik / eltűnt · Egyéb
  - Szóltam a tanárnak. / Szóltam az osztálytársnak. / Senki nem tudott segíteni. / Ismerős helyzet?
  - Terem típusa · Terem száma / jele · Eszköz · Mi a probléma? · Leírás · Bejelentés elküldése
  - Köszönjük, a bejelentésed megérkezett!
  - Bejelentés állapota · Követőkód · Üzenet a karbantartótól:
  - Szólj. Névtelenül. · tech-alarm.vercel.app

## Creative Direction
- Tone preset: default (polished visszafogottsággal a folyamat-jeleneteknél)
- Creative direction: iskolai hibajegy-történet, ami jó véget ér
- Angle: lásd brag-plan.md
- Hook: „Megint elromlott?” gépelődik fekete alapon, piros „!” jelvénnyel
- Outro / punchline: logó + „Szólj. Névtelenül.” + URL + QR; a jelvény pirosról zöldre vált
- Avoid: generikus SaaS-szöveg; elvont kitöltő vizuálok; a márka újratervezése; kitalált funkciók

## Visual Identity
- Background: `#0b1437` (mély éjkék) – a UI-képernyők a weboldal világos felületét használják: `#f8fbff`, kártyák `#ffffff`
- Text: `#eaf1ff` sötéten, `#172554` világos felületen
- Accent: `#2563eb` és `#60a5fa`; státusz-színek: piros `#ef4444`, borostyán `#f59e0b`, zöld `#22c55e`
- Display font: Inter 800/900 · Body font: Inter 400–600 (helyi fájlok: `assets/fonts/`)
- Visual references: pajzs-logó (`assets/logo*.svg`), a promo-eszközök (`assets/devices/*.svg`), a weboldal kártyái és gombjai

## Storyboard
A `brag-plan.md` storyboardja a kreatív szerződés. Jelenet-összefoglaló:
1. Hook — 3,02 s
2. A problémák — 6,50 s
3. „Senki nem tudott segíteni” — 6,50 s
4. Logó-reveal (16,02 s erős ütem) — 8,00 s
5. Az űrlap (telefon) — 12,00 s
6. Elküldve + kód — 12,00 s
7. Admin lista (48,02 s erős ütem) — 12,00 s
8. Státusz + üzenet — 12,00 s
9. A bejelentő látja (72,02/73,02) — 12,00 s
10. Termek és eszközök — 11,99 s
11. Plakát és QR (96,01) — 12,01 s
12. Finálé (108,02) — 11,98 s

## Audio
- Audio role: warm bed + sparse professional accents
- Audio arc: csendes intró → ütemre épülő feszültség → a 16 s-nál kinyílik → ritmikus folyamat → 108 s finálé → 6 s lecsengés
- Music: `happy-beats-business-moves-vol-1-by-ende-dot-app.mp3`
- Music treatment: 0–1,5 s fade-in, alapszint 0,55, 114–120 s fade-out (`data-automation` volume-sáv)
- Music cue guidance: bundled preset `vol-1.music-cues.json` (120,19 BPM, első ütem 3,02 s); erős cue-k 16,02 · 48,02 · 72,02 · 96,01 · 108,02
- Audio-reactive treatment: subtle — logó- és telefon-ragyogás a zene sávjaival (`hyperframes-creative` audio-reactive útmutató szerint); nincs equalizer
- Audio-coupled moments: gépelés (hook, szóltam…, űrlap), koppintások, státuszváltások, kártya-érkezések, kód-landolás, finálé
- SFX selection guidance: a `sfx-analysis.md` alacsony HF-kockázatú fájljai; mozgáshoz illesztve, ritkítva
- SFX analysis guidance: `.claude/skills/brag/assets/sfx/sfx-analysis.md`
- Exact SFX choice: a megvalósított animáció alapján (ld. composition)
- Audio files: `brag-output/composition/assets/` alatt

## Hyperframes Instructions
Domain skillek: `hyperframes-core`, `hyperframes-animation`, `hyperframes-creative`, `hyperframes-keyframes`, `hyperframes-cli`, `hyperframes-audio`. A /brag saját munkafolyamat — nem a `hyperframes` generikus promo-ági.

Követelmények:
- Legyen legalább egy valós UI/szöveg a projektből — itt több (űrlap, admin, követőoldal).
- Minden szöveg olvasható marad; az olvasási idő-padló betartva (rövid címke ~0,8 s, mondat ~0,3 s/szó).
- 120 s ±0,05 s; 30 fps.
- Zene + SFX réteg megvan.
- 1–3 nagy pillanat beat-lockolva (16,02 · 48,02 · 108,02), szekvenciális események a 0,5 s-os rácshoz (±0,10 s); jelölés: `// beat-locked`, `// beat-grid`.
- Helyi asszetek; `hyperframes check` render előtt; a render helyben fut.
