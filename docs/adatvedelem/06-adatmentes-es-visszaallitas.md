# Adatmentés és visszaállítás

*TechALARM · Verzió: 2026-11-18*

**Helyzet:** a Supabase projekt az ingyenes (Free) csomagban fut, ahol nincs automatikus napi mentés és időponthoz visszaállítás. Ezért az adatvesztés kockázatát kézi mentéssel kezeljük.

## Rendszeres mentés
1. Az üzemeltető belép az admin felületre, a **Munkatársak** oldal alján a **Teljes mentés letöltése** gombbal letölti a JSON fájlt (termek, eszközök, bejelentések, profilok név szerint, adatkérelmek).
2. A fájlt **titkosított, zárt helyen** tárolja (nem e-mailben, nem nyilvános felhőben), a hozzáférők körét korlátozza. A fájl személyes adatot tartalmaz, ezért a megőrzési szabályokat is követnie kell: a mentést [3 hónap] után törölni kell.
3. Gyakoriság: **havonta**, és minden nagyobb módosítás előtt. Felelős: [az üzemeltető neve].
4. A fényképek nem részei a mentésnek. Ha fontos, a Supabase felületén (Storage) külön letölthetők.

## Visszaállítás
Új Supabase projektben a migrációkat (`supabase/migrations`) kell lefuttatni, majd a mentésből az adatokat betölteni. Ezt fejlesztő végzi az üzemeltető engedélyével.

## Fejlesztési javaslat
Fizetős (Pro) csomagra váltáskor a napi automatikus mentés bekapcsol, és a kézi mentés is megmarad kiegészítésként. A váltást az iskola dönti el.
