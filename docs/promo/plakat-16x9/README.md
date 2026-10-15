# TechALARM fekvő plakát (16:9)

| Fájl | Mire jó |
|---|---|
| `pdf/plakat-16x9-160x90cm.pdf` | Vektoros PDF, 160 × 90 cm (16:9) – bármilyen 16:9 méretre arányosan nagyítható/kicsinyíthető |
| `preview/plakat-16x9-4k.png` | 3840 × 2160 px – nagy kijelzőre / vetítésre |
| `preview/plakat-16x9-fullhd.png` | 1920 × 1080 px – iskolai TV-re, kivetítőre, közösségi felületre |

A QR-kód a `https://tech-alarm.vercel.app/` címre mutat. Ugyanaz a stílus és logó, mint a roll-upon.
A PDF vágás nélküli (ráhagyás nélküli); ha a nyomda ráhagyást kér, a `build.mjs` tetején a `W`/`H` módosítható.

**Újragenerálás:** `node build.mjs && node render.mjs` (Playwright + Chromium kell).
