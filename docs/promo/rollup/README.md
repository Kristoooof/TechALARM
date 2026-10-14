# TechALARM roll-up (85 × 200 cm)

| Fájl | Mire jó |
|---|---|
| `pdf/rollup-85x200.pdf` | Nyomdai fájl, **860 × 2010 mm** (85 × 200 cm + 5 mm ráhagyás mindenhol), vektoros (logó, QR, eszközök, betűk) |
| `preview/rollup.png` | Kis előnézet (a szerkesztéshez, nem nyomtatásra) |

**Tervezési szabályok:** a fontos tartalom legalább 30 mm-re van a széltől, és a legalsó 25 cm-en nincs semmi lényeges
(a roll-up talpa eltakarja). A QR-kód ~22 cm széles, 2–3 méterről is olvasható. A kód a
`https://tech-alarm.vercel.app/` címre mutat.

**Nyomda:** kérd 85 × 200 cm-es roll-up nyomtatásra (a legtöbb szolgáltatónál ez a szabvány), a fájlt 5 mm
ráhagyással adjuk át. Ha a nyomda más méretet vagy ráhagyást kér (pl. 80 × 200, 3 mm), a `build.mjs` tetején
a `W`/`H` értékek átírhatók.

**Újragenerálás:** `node build.mjs && node render.mjs` (Playwright + Chromium kell).

A logó vektoros változata a `docs/brand/` mappában van (`vectorize.py` állítja elő az eredeti PNG-ből).
