import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { eraseAccount, handleRequest } from "../privacy-actions";
import AdminNav from "../AdminNav";
import ConfirmButton from "../ConfirmButton";

export const dynamic = "force-dynamic";
export const metadata = { title: "Adatkérelmek – TechALARM Admin" };

const TYPE_LABEL: Record<string, string> = {
  hozzaferes: "Hozzáférés",
  helyesbites: "Helyesbítés",
  torles: "Törlés",
  tiltakozas: "Tiltakozás",
  egyeb: "Egyéb",
};

export default async function Requests() {
  await requireRole("operator");
  const { data: requests } = await createAdminClient()
    .from("data_requests")
    .select("id, profile_id, requester_name, type, message, status, response, created_at, due_at, handled_at")
    .order("status", { ascending: true })
    .order("due_at", { ascending: true })
    .limit(200);

  const fmt = (iso: string) => new Date(iso).toLocaleString("hu-HU", { dateStyle: "short", timeStyle: "short", timeZone: "Europe/Budapest" });
  const now = Date.now();

  return (
    <>
      <AdminNav current="adatkerelmek" />
      <h1>Adatkezelési kérelmek</h1>
      <p className="lead">A felhasználók GDPR szerinti kérelmei. A válaszhatáridő a beérkezéstől számított 30 nap (GDPR 12. cikk (3)). A válasz a felhasználó Fiókom oldalán jelenik meg.</p>
      {(requests ?? []).length === 0 && <p className="lead">Nincs kérelem.</p>}
      <ul className="list">
        {(requests ?? []).map((r) => {
          const overdue = r.status === "open" && new Date(r.due_at).getTime() < now;
          return (
            <li key={r.id} className="list-item" style={{ cursor: "default" }}>
              <div className="row">
                <strong>{TYPE_LABEL[r.type] ?? r.type} · {r.requester_name}</strong>
                <span className="badge">{r.status === "open" ? "Folyamatban" : r.status === "done" ? "Teljesítve" : "Elutasítva"}</span>
              </div>
              <div className="meta" style={overdue ? { color: "#b91c1c", fontWeight: 700 } : undefined}>
                Beküldve: {fmt(r.created_at)} · határidő: {fmt(r.due_at)}{overdue ? " (LEJÁRT)" : ""}
              </div>
              <div style={{ whiteSpace: "pre-wrap" }}>{r.message}</div>
              {r.response && <div className="alert success" style={{ marginTop: 8, marginBottom: 0 }}><strong>Válasz:</strong> {r.response}</div>}

              {r.status === "open" && (
                <>
                  <form action={handleRequest} style={{ marginTop: 10 }}>
                    <input type="hidden" name="id" value={r.id} />
                    <div className="field">
                      <label htmlFor={`resp-${r.id}`}>Válasz a felhasználónak</label>
                      <textarea id={`resp-${r.id}`} name="response" required maxLength={2000} placeholder="Mit tettél, vagy miért utasítod el?" />
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <button className="btn small" type="submit" name="status" value="done">Teljesítve</button>
                      <button className="btn secondary small" type="submit" name="status" value="rejected">Elutasítva</button>
                    </div>
                  </form>
                  {r.profile_id && (
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                      <a className="btn secondary small" href={`/admin/export/${r.profile_id}`} download>Adatok letöltése (JSON)</a>
                      <Link className="btn secondary small" href="/admin/regisztraciok?statusz=approved">Név javítása a regisztrációknál</Link>
                      {r.type === "torles" && (
                        <form action={eraseAccount}>
                          <input type="hidden" name="id" value={r.profile_id} />
                          <ConfirmButton className="btn danger small" message="Biztosan törlöd a fiókot, és a bejelentéseit névtelenné teszed? Ez nem vonható vissza.">Fiók törlése és anonimizálás</ConfirmButton>
                        </form>
                      )}
                    </div>
                  )}
                </>
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
}
