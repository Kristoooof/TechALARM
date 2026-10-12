# TechALARM plakátok (A4 álló, színes)

Három különböző terv, mindhárom QR-kóddal a `https://tech-alarm.vercel.app/` címre.

| Terv | Fájl | Ötlet |
|---|---|---|
| A | `pdf/a-elromlott-valami.pdf` | „Elromlott valami?" – sötét, riasztó jelvényes eszközökkel |
| B | `pdf/b-nevtelenul.pdf` | „Szólj. Névtelenül." – világos, tipográfiai, a névtelenségre épít |
| C | `pdf/c-nyomon-kovetheto.pdf` | „Nem tűnik el a bejelentésed." – követőkód és állapotkövetés |

Az `pdf/osszes-plakat.pdf` mind a hármat tartalmazza egy fájlban.

**Nyomtatás:** 100%-os (tényleges) méretben, A4, matt papír. Az otthoni és irodai nyomtatók nem nyomtatnak az
oldal széléig, ezért a színes háttér körül vékony fehér szegély maradhat. Nyomdánál szükség esetén készíthető
3 mm-es ráhagyással is.

**Újragenerálás:** `node build.mjs` (a HTML-eket készíti a `src/` mappába), majd a `make-poster` skill
`render.mjs` szkriptje alakítja PDF-fé.

A C tervben a fúrógép, a kód (`TA-K7M2-QX9P`) és az üzenet **példa**, ezt a plakáton is jelöli a „PÉLDA" felirat.
