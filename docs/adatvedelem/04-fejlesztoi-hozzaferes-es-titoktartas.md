# Éles adathoz való hozzáférés és titoktartás

*TechALARM · Munkaanyag, a DPO-val egyeztetendő · Verzió: 2026-11-18*

Az iskola döntése szerint a fejlesztő diákok **titoktartási nyilatkozattal és az üzemeltető engedélyével** hozzáférhetnek az éles adatokhoz. Mivel a fejlesztők kiskorúak is lehetnek, és más diákok adatait látnák, az alábbi szabályok szükségesek.

## Szabályok

1. **Minimális jogosultság.** Mindenki csak annyit kap, amennyi a feladatához kell. Alapértelmezett: csak kód és tesztadat.
2. **Írásbeli engedély.** Éles adathoz az üzemeltető (igazgató) adhat hozzáférést, névre szólóan, indoklással, időkorláttal. A hozzáférést a Munkatársak oldalon és az alábbi nyilvántartásban rögzítjük.
3. **Titoktartási nyilatkozat.** Az engedély feltétele az aláírt nyilatkozat. Kiskorú esetén a törvényes képviselő is aláírja.
4. **Fejlesztés és tesztelés tesztadattal.** A helyi fejlesztés a `supabase/seed.sql` tesztadataival megy. Éles adatot nem másolunk fejlesztői gépre, nem küldünk el, nem töltünk fel külső szolgáltatásba.
5. **Szerverkulcsok.** A `SUPABASE_SERVICE_ROLE_KEY` és a `CRON_SECRET` csak az üzemeltető és a kijelölt fejlesztő birtokában van, kódba, chatbe vagy képernyőképre nem kerülhet.
6. **Vége a megbízásnak.** A hozzáférést és a kulcsokat azonnal visszavonjuk (jelszócsere, szerepkör elvétele).
7. **Incidens.** Ha valaki gyanút észlel, azonnal jelzi az üzemeltetőnek (lásd az incidens eljárásrendet).

## Hozzáférések nyilvántartása

| Név | Szerepkör | Mihez fér hozzá | Engedélyezte | Dátum | Visszavonva |
|---|---|---|---|---|---|
| | | | | | |

## Titoktartási nyilatkozat (minta)

Alulírott, **[név]**, a TechALARM iskolai hibabejelentő rendszer fejlesztője / üzemeltetésében közreműködője, kijelentem, hogy

1. a feladataim során megismert személyes adatokat (különösen a felhasználók nevét, a bejelentéseket és a fényképeket) **bizalmasan kezelem**, azokat jogosulatlan személynek nem adom ki, és a feladataimon kívüli célra nem használom;
2. az adatokat kizárólag az **adatkezelő (iskola) utasítása szerint** és a feladatom ellátásához szükséges mértékben kezelem (GDPR 29. cikk);
3. éles adatot nem másolok saját eszközre, nem töltök fel külső szolgáltatásba, és nem készítek róla képernyőképet, kivéve az üzemeltető kifejezett engedélyével;
4. a hozzáférési adataimat (jelszavak, kulcsok) nem adom tovább;
5. a titoktartás a megbízásom megszűnése után is fennmarad;
6. tudomásul veszem, hogy a titoktartás megsértése jogi és iskolai következményekkel járhat;
7. adatvédelmi incidens gyanúja esetén azonnal értesítem az üzemeltetőt.

Kelt: [hely, dátum]

Nyilatkozó: [aláírás]  Kiskorú esetén a törvényes képviselő: [név, aláírás]  Az iskola (üzemeltető): [név, aláírás]
