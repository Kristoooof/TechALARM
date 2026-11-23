# Adatvédelmi hatásvizsgálat: küszöbelemzés (GDPR 35. cikk)

*TechALARM · Munkaanyag, a DPO-val egyeztetendő · Verzió: 2026-11-18*

**Kérdés:** kell-e teljes hatásvizsgálatot (DPIA) készíteni?

| Szempont | Jellemző a rendszerre? | Megjegyzés |
|---|---|---|
| Rendszeres és szisztematikus megfigyelés nagy léptékben | Nem | Nincs követés, nincs profilozás |
| Különleges adatok vagy bűnügyi adatok nagy léptékben | Nem | Nem kérünk ilyet |
| Értékelés vagy pontozás, automatizált döntés | Nem | Nincs automatizált döntés |
| Sérülékeny érintettek (kiskorúak) | **Igen** | 14–17 éves tanulók is regisztrálhatnak |
| Új technológia vagy újszerű felhasználás | Részben | Egyszerű webes űrlap és fiókkezelés |
| Adatkészletek összekapcsolása | Nem | |
| Nagy léptékű kezelés | Nem | Egyetlen iskola, néhány száz felhasználó |

**Értékelés:** a rendszer nem tartozik a hatásvizsgálatot kötelezően előíró esetek közé (a nemzeti hatóság listája és a GDPR 35. cikk (3) szerint), mert nincs nagy léptékű, kockázatos kezelés. A kiskorúak jelenléte miatt a kockázatokat mégis dokumentáljuk.

## Fő kockázatok és kezelésük

| Kockázat | Intézkedés |
|---|---|
| A bejelentő neve kiderül más diákok előtt, megtorlás | A nevet bejelentéseknél csak a karbantartó, az igazgató és az admin látja, a tanár a regisztrációknál; a követőoldal nem mutatja; fegyelmi felhasználás tiltott (tájékoztató) |
| Bejelentés fegyelmi célú felhasználása | Kimondott tilalom a tájékoztatóban és az admin felületen; az üzemeltető felel érte |
| Fénykép embert ábrázol | A tájékoztató és az űrlap kéri, hogy csak a hibás eszközt fotózzák; a karbantartó törölheti a bejelentést |
| Jogosulatlan hozzáférés | Szerepkörök, titoktartási nyilatkozat, hozzáférések listája a Munkatársak oldalon |
| Adatvesztés | Rendszeres mentés (üzemeltető) |
| Túl hosszú megőrzés | Automatikus törlés a tanév végéig + 1 év után |
| Adat az USA-ba kerül | Vercel EU-régió (Dublin), Supabase EU (Írország); a fennmaradó átadások (Vercel, Cloudflare) DPF/SCC alapon |

**Döntés:** [DPO tölti ki: teljes DPIA nem szükséges / szükséges] · Dátum: [ ] · Aláírás: [ ]
