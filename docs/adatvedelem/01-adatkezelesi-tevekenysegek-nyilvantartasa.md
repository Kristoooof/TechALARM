# Adatkezelési tevékenységek nyilvántartása (GDPR 30. cikk)

*TechALARM, iskolai hibabejelentő rendszer · Munkaanyag, a DPO-val egyeztetendő · Verzió: 2026-11-18*

## 1. Az adatkezelő

| | |
|---|---|
| Adatkezelő | [az iskola neve – kitöltendő] |
| Cím | [kitöltendő] |
| Képviselő | [igazgató neve – kitöltendő] |
| Adatvédelmi tisztviselő (DPO) | [név és elérhetőség – kitöltendő] |
| Adatfeldolgozók | Supabase (adatbázis, fájltároló, EU: Írország), Vercel (üzemeltetés, EU-régió), Cloudflare (spamvédelem a regisztrációnál) |

## 2. Adatkezelési tevékenység: hibabejelentés kezelése

| Szempont | Leírás |
|---|---|
| Cél | Az iskolai eszközök és termek hibáinak, rongálásainak bejelentése és javítása, visszajelzés a bejelentőnek |
| Jogalap | GDPR 6. cikk (1) e) közfeladat (létesítmények működtetése, vagyonvédelem). **A DPO megerősítendő.** |
| Érintettek | Az iskola diákjai (14–19 év) és tanárai, dolgozói |
| Személyes adatok | Teljes név; jelszó (nem olvasható hash); regisztráció és jóváhagyás időpontja; a tájékoztató verziója és tudomásulvételének ideje; a bejelentés tartalma (terem, eszköz, leírás, fénykép, állapot, megjegyzés) a bejelentő nevével |
| Különleges adat | Nincs. A fényképen embert nem szabad ábrázolni (a tájékoztató kéri) |
| Címzettek | Üzemeltető (igazgató): minden adat. Karbantartó: bejelentések. Jóváhagyó tanár: regisztrációk. Fejlesztők: csak üzemeltetői engedéllyel és titoktartási nyilatkozattal |
| Adattovábbítás harmadik országba | Vercel Inc. és Cloudflare Inc. (USA): EU–USA adatvédelmi keretrendszer és/vagy SCC. Az adatbázis és a fájltároló az EU-ban (Írország) van |
| Megőrzés | Bejelentések és fényképek: a tanév végéig + 1 év (automatikus törlés). Regisztráció: a jogviszony végéig, a tanév végi takarításig. Jóváhagyásra váró vagy elutasított: 90 nap |
| Biztonsági intézkedések | Lásd a 4. pontot |

## 3. Adatkezelési tevékenység: adatkezelési kérelmek

| Szempont | Leírás |
|---|---|
| Cél | Az érintetti jogok (GDPR 15–21. cikk) gyakorlásának kezelése |
| Jogalap | GDPR 6. cikk (1) c) jogi kötelezettség |
| Adatok | Név, kérelem típusa és szövege, válasz, határidő |
| Megőrzés | A kérelem lezárásáig, utána a jogi igények igazolásához szükséges ideig [az iskola dönti el] |

## 4. Műszaki és szervezési intézkedések (GDPR 32. cikk)

- Titkosított kapcsolat (HTTPS), jelszavak nem visszafejthető hash-ként (Supabase Auth).
- Sorszintű jogosultság az adatbázisban (RLS), szerepkörök: üzemeltető, karbantartó, jóváhagyó tanár.
- Privát fájltároló, a fényképek csak 1 órás aláírt hivatkozással nézhetők meg.
- A titkos szerverkulcsok nem kerülnek a böngészőbe, környezeti változóban vannak.
- Adatmentés az üzemeltető felületéről (az ingyenes Supabase-csomagban nincs automatikus mentés).
- Az éles adathoz való hozzáférés dokumentált és írásbeli titoktartáshoz kötött.
- Automatikus törlés a megőrzési szabályok szerint (napi feladat).
