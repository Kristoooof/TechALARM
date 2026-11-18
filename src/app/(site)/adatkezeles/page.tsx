import Link from "next/link";
import { NOTICE_VERSION, ORG, RETENTION } from "@/lib/org";

export const metadata = { title: "Adatkezelési tájékoztató – TechALARM" };

export default function Notice() {
  return (
    <>
      <h1>Adatkezelési tájékoztató</h1>
      <p className="lead">Verzió: {NOTICE_VERSION}. Itt olvashatod, milyen adataidat kezeljük a TechALARM-ban, mire használjuk őket, és mit tehetsz velük kapcsolatban. (GDPR 13. cikk)</p>
      {!ORG.filled && (
        <div className="alert error" role="status">A [szögletes zárójeles] mezők még kitöltésre várnak. Az üzemeltető a Vercel környezeti változóiban tudja megadni őket.</div>
      )}

      <div className="card">
        <h2>1. Ki kezeli az adataidat?</h2>
        <p><strong>Adatkezelő:</strong> {ORG.name}, {ORG.address}. Minden iskola a saját adatbázisát kezeli, az iskolák adatai nem keverednek.</p>
        <p><strong>Adatvédelmi tisztviselő:</strong> {ORG.dpoName}, {ORG.dpoContact}.</p>
        <p>A rendszert diákok fejlesztik. Éles adathoz csak az üzemeltető (igazgató) engedélyével, írásbeli titoktartási nyilatkozat birtokában férhetnek hozzá.</p>
      </div>

      <div className="card">
        <h2>2. Milyen adatot, mire és milyen jogalappal kezelünk?</h2>
        <table className="data-table">
          <thead><tr><th>Adat</th><th>Cél</th><th>Jogalap</th></tr></thead>
          <tbody>
            <tr><td>Teljes név, jelszó (nem olvasható formában), regisztráció és jóváhagyás időpontja, a tájékoztató verziója</td><td>Azonosítás, a jogosultak körének ellenőrzése, a visszaélések megelőzése</td><td>Közfeladat (GDPR 6. cikk (1) e): az iskola létesítményeinek működtetése, vagyonvédelem)</td></tr>
            <tr><td>Bejelentés: terem, eszköz, leírás, fénykép, állapot, megjegyzés, a nevedet tartalmazó pillanatkép, követőkód</td><td>A hibák kezelése és a visszajelzés</td><td>Közfeladat (GDPR 6. cikk (1) e))</td></tr>
            <tr><td>Adatkezelési kérelmeid</td><td>A jogaid gyakorlásának kezelése</td><td>Jogi kötelezettség (GDPR 6. cikk (1) c))</td></tr>
            <tr><td>Technikai adatok (IP-cím, böngésző) a szerver- és spamvédelmi naplókban</td><td>A rendszer biztonsága és működése</td><td>Közfeladat, biztonság (GDPR 32. cikk)</td></tr>
          </tbody>
        </table>
        <p className="hint">Hozzájárulást nem kérünk, mert a tanuló–iskola és munkavállaló–munkáltató viszonyban az nem lenne valóban önkéntes. A regisztráció a jogosultság ellenőrzése miatt jóváhagyáshoz kötött.</p>
        <p><strong>Nem használjuk</strong> az adataidat marketingre, profilozásra, harmadik félnek átadásra, és <strong>fegyelmi vagy felelősségre vonási célra sem</strong>. A bejelentések kizárólag a hibák kezelését szolgálják.</p>
      </div>

      <div className="card">
        <h2>3. Ki látja az adataidat?</h2>
        <ul>
          <li><strong>Karbantartó:</strong> a bejelentéseket (a bejelentő nevével és a fényképpel együtt).</li>
          <li><strong>Jóváhagyó tanár:</strong> a regisztrációkat (a nevedet).</li>
          <li><strong>Rendszerüzemeltető (igazgató):</strong> minden adatot.</li>
          <li><strong>Más bejelentők nem látják</strong> a nevedet, és a követőoldal sem mutatja.</li>
        </ul>
        <p>Adatfeldolgozók: <strong>Supabase</strong> (adatbázis és fájltároló, EU: Írország), <strong>Vercel</strong> (üzemeltetés, EU-régió), <strong>Cloudflare</strong> (spamvédelem a regisztrációnál, az IP-cím és a böngészőadatok kerülnek hozzá). A Vercel és a Cloudflare amerikai cég: az adattovábbítás az EU–USA adatvédelmi keretrendszer és/vagy a szokásos szerződési feltételek (SCC) alapján történik (GDPR 44–46. cikk).</p>
        <p>Sütit csak a bejelentkezéshez szükséges munkamenet-sütit használunk. A látogatottságot sütik nélkül, személy nélkül mérjük.</p>
      </div>

      <div className="card">
        <h2>4. Meddig őrizzük?</h2>
        <ul>
          <li><strong>Bejelentések és fényképek:</strong> {RETENTION.reportsText}, utána automatikusan törlődnek.</li>
          <li><strong>Regisztráció:</strong> {RETENTION.accountText}. A jóváhagyásra váró vagy elutasított regisztrációkat {RETENTION.pendingRejectedDays} nap után automatikusan töröljük.</li>
          <li><strong>Adatkezelési kérelmek:</strong> a kezelésük lezárásáig, utána a törlésükig a jogi igények igazolásához szükséges ideig.</li>
        </ul>
      </div>

      <div className="card">
        <h2>5. Milyen jogaid vannak?</h2>
        <ul>
          <li><strong>Hozzáférés</strong> (15. cikk): a Fiókom oldalon letöltheted az adataidat.</li>
          <li><strong>Helyesbítés</strong> (16. cikk), <strong>törlés</strong> (17. cikk), <strong>korlátozás</strong> (18. cikk), <strong>tiltakozás</strong> (21. cikk): a Fiókom oldalon adhatsz be kérelmet.</li>
          <li><strong>Adathordozhatóság</strong> (20. cikk) közfeladati jogalapnál nem alkalmazandó. A letöltés ettől még elérhető.</li>
          <li>Kérelmedre legfeljebb <strong>1 hónapon belül</strong> válaszolunk (indokolt esetben további 2 hónappal hosszabbítható, erről értesítünk).</li>
          <li>Törlésnél a bejelentéseidet névtelenné alakítjuk át, hogy a hibák előzményei megmaradjanak.</li>
          <li>Automatizált döntéshozatalt és profilozást nem alkalmazunk.</li>
        </ul>
        <p>Ha szerinted megsértettük a jogaidat, panasszal fordulhatsz a <strong>Nemzeti Adatvédelmi és Információszabadság Hatósághoz</strong> (NAIH, 1055 Budapest, Falk Miksa utca 9–11., <a href="https://www.naih.hu" target="_blank" rel="noopener noreferrer">naih.hu</a>), vagy bírósághoz. (GDPR 77–79. cikk, Infotv.)</p>
      </div>

      <p><Link href="/">Vissza a bejelentéshez</Link></p>
    </>
  );
}
