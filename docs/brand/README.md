# TechALARM logó

| Fájl | Leírás |
|---|---|
| `logo-eredeti.png` | A megkapott eredeti, 1254 × 1254 px-es raszteres logó |
| `logo.svg` / `logo.png` | Vektoros változat (átlátszó háttér, fehér belső pajzs) – világos háttérre |
| `logo-dark.svg` / `logo-dark.png` | Világos szöveggel – sötét háttérre (roll-up, plakát) |
| `logo-mark.svg` / `logo-mark.png` | Csak a címer – favicon, fejléc |

A vektoros fájlokat a `vectorize.py` készíti az eredeti PNG-ből (`pip install potracer`, majd `python3 vectorize.py`).
Ez egy **nyomkövetett másolat**: a betűk és a címer alakja az eredetit követi, de ha van az eredeti vektoros
(AI/SVG/PDF) fájl, azt érdemes használni nyomdai munkához.
A weboldal fájljai: `public/brand/*`, `src/app/icon.svg`, `src/app/apple-icon.png`, `src/app/opengraph-image.png`.
