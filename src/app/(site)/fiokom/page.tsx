import Link from "next/link";
import { redirect } from "next/navigation";
import { getReporter } from "@/lib/reporter";
import { createAdminClient } from "@/lib/supabase/admin";
import { profileStatusLabel } from "@/lib/constants";
import RequestForm from "./RequestForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Fiókom – TechALARM" };

const TYPE_LABEL: Record<string, string> = {
  hozzaferes: "Hozzáférés",
  helyesbites: "Helyesbítés",
  torles: "Törlés",
  tiltakozas: "Tiltakozás",
  egyeb: "Egyéb",
};
const STATUS_LABEL: Record<string, string> = { open: "Folyamatban", done: "Teljesítve", rejected: "Elutasítva" };

export default async function Account() {
  const reporter = await getReporter();
  if (!reporter) redirect("/belepes");
  if (reporter.status === "rejected") redirect("/");

  const db = createAdminClient();
  const [{ data: profile }, { count }, { data: requests }] = await Promise.all([
    db.from("profiles").select("created_at, notice_version, notice_accepted_at").eq("id", reporter.id).maybeSingle(),
    db.from("reports").select("id", { count: "exact", head: true }).eq("reporter_id", reporter.id),
    db
      .from("data_requests")
      .select("id, type, message, status, response, created_at, due_at")
      .eq("profile_id", reporter.id)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);
  const fmt = (iso: string) => new Date(iso).toLocaleString("hu-HU", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Budapest" });

  return (
    <>
      <h1>Fiókom</h1>
      <p className="lead">Az általunk rólad tárolt adatok, és az adatvédelmi jogaid gyakorlása.</p>

      <div className="card">
        <h2>Tárolt adataim</h2>
        <dl className="details">
          <dt>Név</dt><dd>{reporter.fullName}</dd>
          <dt>Állapot</dt><dd>{profileStatusLabel(reporter.status)}</dd>
          <dt>Regisztráció</dt><dd>{profile ? fmt(profile.created_at) : "–"}</dd>
          <dt>Tájékoztató</dt><dd>{profile?.notice_version ? `${profile.notice_version} (tudomásul véve: ${profile.notice_accepted_at ? fmt(profile.notice_accepted_at) : "–"})` : "–"}</dd>
          <dt>Bejelentéseim</dt><dd>{count ?? 0} db</dd>
        </dl>
        <p className="hint">A jelszavad nem olvasható formában tárolódik, ezért nem látszik. Részletek: <Link href="/adatkezeles">adatkezelési tájékoztató</Link>.</p>
        <a className="btn secondary block" href="/fiokom/export" download>Adataim letöltése (JSON)</a>
      </div>

      <div className="card">
        <h2>Adatkezelési kérelem</h2>
        <p className="hint">Kérheted az adataid helyesbítését, törlését, vagy tiltakozhatsz az adatkezelés ellen. Legfeljebb 1 hónapon belül válaszolunk.</p>
        <RequestForm />
      </div>

      {(requests ?? []).length > 0 && (
        <div className="card">
          <h2>Korábbi kérelmeim</h2>
          <ul className="list">
            {(requests ?? []).map((r) => (
              <li key={r.id} className="list-item" style={{ cursor: "default" }}>
                <div className="row">
                  <strong>{TYPE_LABEL[r.type] ?? r.type}</strong>
                  <span className="badge">{STATUS_LABEL[r.status] ?? r.status}</span>
                </div>
                <div className="meta">Beküldve: {fmt(r.created_at)} · válaszhatáridő: {fmt(r.due_at)}</div>
                <div>{r.message}</div>
                {r.response && <div className="alert success" style={{ marginTop: 8, marginBottom: 0 }}><strong>Válasz:</strong> {r.response}</div>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
