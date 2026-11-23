import type { Metadata } from "next";
import Link from "next/link";
import RoomScene from "../RoomScene";
import TrackedLink from "../TrackedLink";

const SURVEY_URL = "https://forms.gle/YcREVdZa2MUa7WGT9";

export const metadata: Metadata = {
  alternates: { canonical: "/bemutato" },
  title: "TechALARM | Elromlott valami? Segíts! Szólj, és gyorsabban megjavul",
  description:
    "Regisztrálj, és rögtön bejelentheted telefonról az iskolában elromlott eszközöket és a rongálásokat. A bejelentéseid állapotát bármikor megnézheted.",
  openGraph: {
    title: "TechALARM | Elromlott valami? Segíts! Szólj, és gyorsabban megjavul",
    description: "Hibabejelentő a Mátészalkai Gépészeti Technikumnak: regisztrációval, fényképpel, követhető állapottal.",
    locale: "hu_HU",
    type: "website",
  },
};

const faq = [
  {
    q: "Kell hozzá regisztráció?",
    a: "Igen. Megadod a neved és egy jelszót, és rögtön bejelenthetsz. Az admin később jóváhagyja a regisztrációdat. Addig a bejelentésed hitelesítetlen bejelentőtől származóként jelenik meg a karbantartónál, jóváhagyás után hitelesítetté válik.",
  },
  {
    q: "Ki látja a nevemet?",
    a: "A nevedet az admin és a karbantartó látja a bejelentésnél. Más bejelentők nem látják, és a követőoldal sem mutatja a nevedet.",
  },
  {
    q: "Mit jelent, hogy a bejelentésem hitelesítetlen?",
    a: "A karbantartó látja, hogy a bejelentő regisztrációját az admin még nem hagyta jóvá, ezért a név ellenőrizetlen. Jóváhagyásig óránként legfeljebb 2 bejelentést küldhetsz. A jóváhagyásról nem küldünk értesítést, a bejelentésed automatikusan hitelesítetté válik.",
  },
  {
    q: "Mire használjátok az adataimat, és meddig őrzitek?",
    a: "Csak a hibák kezelésére. Fegyelmi vagy felelősségre vonási célra nem használjuk. A bejelentések a tanév végéig és még 1 évig maradnak meg, utána automatikusan törlődnek. A részleteket az adatkezelési tájékoztatóban olvashatod.",
  },
  {
    q: "Kérhetem az adataim javítását vagy törlését?",
    a: "Igen. Belépés után a Fiókom oldalon letöltheted az adataidat, és kérelmet adhatsz be a javításra, a törlésre vagy a tiltakozásra. Legfeljebb 1 hónapon belül válaszolunk.",
  },
  {
    q: "Muszáj fényképet csatolnom?",
    a: "Igen, a bejelentéshez egy kép is kell. Így a karbantartó előre látja a hibát, és tudja, milyen alkatrészt vagy szerszámot vigyen magával. JPG, PNG vagy WebP lehet, legfeljebb 5 MB, a telefonon pedig automatikusan lekicsinyítjük. Embert ne fotózz, csak a hibás eszközt.",
  },
  {
    q: "Mit jelenthetek be?",
    a: "Elromlott vagy nem működő eszközt, rongálást, hiányzó vagy eltűnt dolgot, és bármi mást, ami nincs rendben egy teremben.",
  },
  {
    q: "Honnan tudom meg, mi lett a bejelentéssel?",
    a: "Belépve a Bejelentéseim oldalon látod az összes bejelentésedet, az állapotukat és a karbantartó üzenetét. A követőkóddal egy bejelentés állapotát belépés nélkül is megnézheted.",
  },
  {
    q: "Miért van korlát a bejelentések számán?",
    a: "A spam ellen egy felhasználó óránként legfeljebb 5 bejelentést küldhet. A regisztrációt emellett Cloudflare Turnstile védi a robotoktól.",
  },
];

export default function Landing() {
  return (
    <>
        {/* ---------- Hero ---------- */}
        <section className="hero">
          <div className="wrap hero-grid">
            <div>
              <span className="eyebrow">Mátészalkai Gépészeti Technikum · hibabejelentő</span>
              <h1>
                Elromlott valami?
                <em>Segíts! Szólj, és gyorsabban megjavul.</em>
              </h1>
              <p className="lead">
                Regisztrálj, és rögtön jelezheted telefonról az iskolában elromlott eszközöket és a rongálásokat. A bejelentéseid állapotát bármikor megnézheted.
              </p>
              <div className="cta-row">
                <TrackedLink href="/regisztracio" place="hero" className="btn">Regisztrálok</TrackedLink>
                <Link href="/belepes" className="textlink">Már van fiókod? Belépés</Link>
              </div>
              <ul className="chips" aria-label="Röviden">
                <li className="chip">Regisztráció után rögtön</li>
                <li className="chip">Fényképpel</li>
                <li className="chip">Követhető állapot</li>
                <li className="chip">Bejelentéseid egy helyen</li>
              </ul>
            </div>

            <div className="stage">
              <div className="devs" aria-hidden="true">
                {[
                  ["d1", "projector"],
                  ["d2", "pc"],
                  ["d3", "desk"],
                  ["d4", "chair"],
                ].map(([cls, name]) => (
                  <div key={name} className={`dev ${cls}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`/landing/${name}.svg`} alt="" />
                    <span className="bang">!</span>
                  </div>
                ))}
              </div>
              <div className="phone" role="img" aria-label="A bejelentő űrlap kitöltve: bejelentő, Informatika terem, 104, projektor, elromlott, fényképpel">
                <div className="bar">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/brand/logo-mark.svg" alt="" width={18} height={20} />
                  <b>Tech<span>ALARM</span></b>
                </div>
                <div className="field"><small>Bejelentő</small><div>Minta Diák</div></div>
                <div className="field"><small>Terem típusa</small><div>Informatika terem</div></div>
                <div className="field"><small>Terem száma / jele</small><div>104</div></div>
                <div className="field"><small>Eszköz</small><div>Projektor</div></div>
                <div className="field"><small>Mi a probléma?</small><div>Elromlott / nem működik</div></div>
                <div className="field"><small>Leírás</small><div className="area">Nem ad képet, a jelzőlámpa pirosan villog.</div></div>
                <div className="field"><small>Fénykép</small><div className="file">✓ projektor.jpg</div></div>
                <div className="send">Elküldés</div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- Probléma ---------- */}
        <section className="sec" id="problema">
          <div className="wrap prob">
            <div>
              <p className="kicker">Ismerős helyzet?</p>
              <h2>
                Látod, hogy valami nem működik. Azt viszont nem tudod, <span className="hl">kinek szólj</span>.
              </h2>
              <ul className="notes">
                <li className="note-card">
                  <span className="bang" aria-hidden="true">!</span>
                  <div>
                    <h3>Nem tudom, kinek kellene szólni</h3>
                    <p>A tanár nincs ott, a karbantartó éppen máshol dolgozik. A hiba marad, mert senki nem tud róla.</p>
                  </div>
                </li>
                <li className="note-card">
                  <span className="bang" aria-hidden="true">!</span>
                  <div>
                    <h3>Szóltam, de nem történt semmi</h3>
                    <p>A szóbeli jelzés könnyen elsikkad. Nincs nyoma, és nem tudod, foglalkoznak-e vele.</p>
                  </div>
                </li>
                <li className="note-card">
                  <span className="bang" aria-hidden="true">!</span>
                  <div>
                    <h3>Nem akarok besúgó lenni</h3>
                    <p>Rongálásnál különösen kényes szólni. A nevedet csak az admin és a karbantartó látja, más bejelentők és a követőoldal nem.</p>
                  </div>
                </li>
              </ul>
              <p className="conseq">Közben a hiba ott marad, és más is belefut ugyanabba.</p>
            </div>
            <RoomScene />
          </div>
        </section>

        {/* ---------- Vágyott eredmény ---------- */}
        <section className="sec" id="eredmeny">
          <div className="wrap">
            <p className="kicker">A különbség</p>
            <h2>Ne kelljen azon gondolkodnod, <span className="hl">hogy elintézték-e</span>.</h2>
            <div className="cards ba">
              <article className="card before">
                <span className="ba-tag">Eddig</span>
                <h3>Szólsz valakinek, és marad a bizonytalanság</h3>
                <p>Elmondod a tanárnak vagy a portásnak, aztán nem tudod, eljutott-e az üzenet oda, ahol javítani tudják. A hiba ott marad, és nem tudod, érdemes-e újra szólnod.</p>
              </article>
              <article className="card after">
                <span className="ba-tag">TechALARM-mal</span>
                <h3>Egy bejelentés, és látod az állapotot</h3>
                <p>A karbantartó megkapja a helyet, az eszközt, a képet és a nevedet. Te a Bejelentéseim oldalon látod, hogy új, folyamatban van vagy megjavították, és ha üzenetet hagyott, azt is.</p>
              </article>
            </div>
          </div>
        </section>

        {/* ---------- Hogyan működik ---------- */}
        <section className="sec dark" id="hogyan">
          <div className="wrap">
            <p className="kicker">Hogyan működik</p>
            <h2>Négy lépés, és <span className="hl">a karbantartó már látja</span>.</h2>
            <ol className="steps four">
              <li className="step">
                <h3>Regisztrálj</h3>
                <p>Add meg a neved és egy jelszót, és már be is léptél. Az admin később hagyja jóvá a regisztrációdat.</p>
              </li>
              <li className="step">
                <h3>Válaszd ki a helyet</h3>
                <p>Add meg a terem típusát és számát, majd válaszd ki az eszközt, amelyik elromlott.</p>
              </li>
              <li className="step">
                <h3>Írd le, mi a baj</h3>
                <p>Jelöld meg a probléma típusát, írj pár mondatot, és csatolj egy fényképet. Jóváhagyásig a bejelentésed hitelesítetlenként jelenik meg.</p>
              </li>
              <li className="step">
                <h3>Kövesd az állapotot</h3>
                <p>A Bejelentéseim oldalon látod, mi történt a bejelentéseddel. Kapsz követőkódot is.</p>
              </li>
            </ol>
            <div className="tags">
              <b>Ezekben segít:</b>
              <span className="tag">Elromlott / nem működik</span>
              <span className="tag">Rongálás</span>
              <span className="tag">Hiányzik / eltűnt</span>
              <span className="tag">Egyéb</span>
            </div>
            <p className="note">Az űrlap telefonon is gyors, mert csak azt kérdezi, amit a javításhoz tudni kell.</p>
          </div>
        </section>

        {/* ---------- Követés ---------- */}
        <section className="sec" id="allapot">
          <div className="wrap">
            <p className="kicker">Állapotkövetés</p>
            <h2>Nem kell találgatnod, <span className="hl">hol tart a javítás</span>.</h2>
            <div className="split">
              <div>
                <p className="sub" style={{ marginTop: 0 }}>
                  A karbantartó minden bejelentéshez állapotot állít be, és üzenetet is írhat, például hogy mikor cserélik az alkatrészt. Ezt belépve a Bejelentéseim oldalon, vagy a követőkóddal látod.
                </p>
                <div className="flow" aria-label="Lehetséges állapotok">
                  <span className="badge uj">Új</span>
                  <span className="badge fo">Folyamatban</span>
                  <span className="badge ok">Megjavítva / elintézve</span>
                  <span className="badge no">Elutasítva</span>
                </div>
                <p style={{ marginTop: 28 }}>
                  <Link href="/nyomon" className="btn">Állapot megtekintése</Link>
                </p>
              </div>
              <div className="example" role="img" aria-label="Példa egy bejelentés állapotoldalára: folyamatban, üzenet a karbantartótól">
                <span className="ex-tag">Példa</span>
                <div className="head">
                  <span className="code">TA-XXXX-XXXX</span>
                  <span className="badge fo">Folyamatban</span>
                </div>
                <dl>
                  <dt>Hely</dt><dd>Informatika terem 104</dd>
                  <dt>Eszköz</dt><dd>Projektor</dd>
                  <dt>Típus</dt><dd>Elromlott / nem működik</dd>
                </dl>
                <div className="msg"><strong>Üzenet a karbantartótól:</strong><br />Csütörtökön cseréljük a lámpát.</div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- Adatkezelés ---------- */}
        <section className="sec" id="adatok">
          <div className="wrap">
            <p className="kicker">Adatkezelés</p>
            <h2>Mit kérünk, és ki látja.</h2>
            <div className="two">
              <div className="card info">
                <h3>Mit kérünk</h3>
                <ul>
                  <li>a teljes nevedet, ezzel fogsz belépni</li>
                  <li>egy jelszót a belépéshez</li>
                </ul>
              </div>
              <div className="card yes">
                <h3>Hogyan kezeljük</h3>
                <ul>
                  <li>a nevedet a bejelentéseidhez kapcsoljuk</li>
                  <li>a nevedet az admin és a karbantartó látja, más bejelentő nem</li>
                  <li>a jelszavadat nem olvasható formában tároljuk</li>
                  <li>a bejelentéseket a tanév végéig és még 1 évig őrizzük, utána törlődnek</li>
                  <li>az adataidat nem használjuk fegyelmi célra</li>
                  <li>névtelen látogatottsági statisztikát gyűjtünk, sütik nélkül</li>
                </ul>
              </div>
            </div>
            <p className="note">Részletek, jogok és kapcsolat: <Link href="/adatkezeles" style={{ fontWeight: 700 }}>adatkezelési tájékoztató</Link>.</p>
          </div>
        </section>

        {/* ---------- GYIK ---------- */}
        <section className="sec tint" id="gyik">
          <div className="wrap">
            <p className="kicker">Gyakori kérdések</p>
            <h2>Ami még eszedbe juthat.</h2>
            <div className="faq">
              {faq.map((f) => (
                <details key={f.q}>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- Záró CTA ---------- */}
        <section className="final" id="jelentes">
          <div className="wrap">
            <h2>Látsz valamit, ami nem működik? Regisztrálj, és szólj.</h2>
            <p>Regisztráció, és már jelenthetsz. Pár mező, egy fénykép, és a karbantartó látja.</p>
            <TrackedLink href="/regisztracio" place="zaro" className="btn light">Regisztrálok</TrackedLink>
            <p className="survey">
              Segítenél a fejlesztésben?{" "}
              <a href={SURVEY_URL} target="_blank" rel="noopener noreferrer">Töltsd ki a rövid kérdőívet</a>.
            </p>
          </div>
        </section>

    </>
  );
}
