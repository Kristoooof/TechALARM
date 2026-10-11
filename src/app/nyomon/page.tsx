import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeTrackingCode } from "@/lib/tracking";
import { categoryLabel, statusLabel } from "@/lib/constants";

export const dynamic = "force-dynamic";
export const metadata = { title: "Állapot – TechALARM" };

export default async function Track({ searchParams }: { searchParams: Promise<{ kod?: string }> }) {
  const { kod } = await searchParams;
  const code = kod ? normalizeTrackingCode(kod) : null;

  let report: {
    tracking_code: string; room_name: string; device_name: string | null; category: string;
    description: string; status: string; admin_note: string | null; created_at: string; updated_at: string;
  } | null = null;

  if (code) {
    const { data } = await createAdminClient()
      .from("reports")
      .select("tracking_code, room_name, device_name, category, description, status, admin_note, created_at, updated_at")
      .eq("tracking_code", code)
      .maybeSingle();
    report = data;
  }

  const fmt = (iso: string) => new Date(iso).toLocaleString("hu-HU", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Budapest" });

  return (
    <>
      <h1>Bejelentés állapota</h1>
      <p className="lead">Add meg a bejelentéskor kapott követőkódot.</p>

      <form className="card" method="get">
        <div className="field">
          <label htmlFor="kod">Követőkód</label>
          <input id="kod" name="kod" type="text" placeholder="TA-XXXX-XXXX" defaultValue={kod ?? ""} autoComplete="off" autoCapitalize="characters" required />
        </div>
        <button className="btn block" type="submit">Keresés</button>
      </form>

      {kod && !code && <div className="alert error">Ez nem érvényes követőkód. A kód alakja: TA-XXXX-XXXX.</div>}
      {code && !report && <div className="alert error">Nem találunk bejelentést ezzel a kóddal.</div>}

      {report && (
        <div className="card">
          <div className="topbar">
            <h2 style={{ margin: 0 }}>{report.tracking_code}</h2>
            <span className={`badge ${report.status}`}>{statusLabel(report.status)}</span>
          </div>
          <dl className="details">
            <dt>Hely</dt><dd>{report.room_name}</dd>
            <dt>Eszköz</dt><dd>{report.device_name ?? "–"}</dd>
            <dt>Típus</dt><dd>{categoryLabel(report.category)}</dd>
            <dt>Leírás</dt><dd>{report.description}</dd>
            <dt>Beküldve</dt><dd>{fmt(report.created_at)}</dd>
            <dt>Frissítve</dt><dd>{fmt(report.updated_at)}</dd>
          </dl>
          {report.admin_note && (
            <div className="alert success" style={{ marginTop: 16, marginBottom: 0 }}>
              <strong>Üzenet a karbantartótól:</strong><br />{report.admin_note}
            </div>
          )}
        </div>
      )}
    </>
  );
}
