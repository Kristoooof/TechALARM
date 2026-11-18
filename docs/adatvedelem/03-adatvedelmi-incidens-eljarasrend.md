# Adatvédelmi incidens eljárásrend (GDPR 33–34. cikk)

*TechALARM · Munkaanyag, a DPO-val egyeztetendő · Verzió: 2026-11-18*

**Adatvédelmi incidens:** minden olyan esemény, amely személyes adatok jogosulatlan hozzáféréséhez, elvesztéséhez, megváltozásához vagy nyilvánosságra kerüléséhez vezet. Példák: kiszivárgott jelszó vagy szerverkulcs, rossz jogosultság miatt látható név, elveszett mentés, jogosulatlanul megosztott export.

## Lépések

| # | Mikor | Mit | Ki |
|---|---|---|---|
| 1 | Azonnal | Jelzés az üzemeltetőnek (igazgató) és a DPO-nak. Elérhetőség: [kitöltendő] | Aki észleli |
| 2 | Azonnal | Elhárítás: érintett fiók letiltása, jelszavak és kulcsok cseréje (Supabase, Vercel), hozzáférés megszüntetése | Üzemeltető, fejlesztők |
| 3 | 24 órán belül | Értékelés: milyen adat, kik érintettek, mekkora a kockázat; bejegyzés az incidens-naplóba | Üzemeltető, DPO |
| 4 | **72 órán belül** az észleléstől | Bejelentés a NAIH-nak, ha az incidens valószínűleg kockázattal jár (GDPR 33. cikk). Elérés: naih.hu | DPO |
| 5 | Indokolatlan késedelem nélkül | Az érintettek értesítése, ha az incidens **magas kockázattal** jár (GDPR 34. cikk): mi történt, mi a valószínű következmény, mit tettünk, kihez fordulhatnak | Üzemeltető, DPO |
| 6 | Lezárás | Okok feltárása, javító intézkedés, a rendszer és a szabályok módosítása | Fejlesztők, üzemeltető |

## Incidens-napló (minden incidensről, akkor is, ha nem kell bejelenteni)

| Dátum, idő | Mi történt | Érintett adatok, érintettek száma | Hatás, kockázat | Intézkedés | Bejelentve a NAIH-nak? | Felelős |
|---|---|---|---|---|---|---|
| | | | | | | |
