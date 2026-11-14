import Link from "next/link";
import { redirect } from "next/navigation";
import { categoryLabel, roomLabel, statusLabel } from "@/lib/constants";
import { getReporter } from "@/lib/reporter";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Bejelentéseim – TechALARM" };

export default async function MyReports() {
  const reporter = await getReporter();
  if (!reporter) redirect("/belepes");
  if (reporter.status !== "approved") redirect("/");

  const { data: reports } = await createAdminClient()
    .from("reports")
    .select("tracking_code, room_name, room_number, device_name, category, description, status, admin_note, created_at")
    .eq("reporter_id", reporter.id)
    .order("created_at", { ascending: false })
    .limit(200);

  const fmt = (iso: string) => new Date(iso).toLocaleString("hu-HU", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Budapest" });

  return (
    <>
      <h1>Bejelentéseim</h1>
      <p className="lead">Az általad beküldött hibák és az állapotuk.</p>
      {(reports ?? []).length === 0 && (
        <div className="card">
          <p>Még nem küldtél be bejelentést.</p>
          <Link className="btn" href="/">Hibát jelentek</Link>
        </div>
      )}
      <ul className="list">
        {(reports ?? []).map((r) => (
          <li key={r.tracking_code}>
            <Link href={`/nyomon?kod=${encodeURIComponent(r.tracking_code)}`} className="list-item">
              <div className="row">
                <strong>{roomLabel(r.room_name, r.room_number)}{r.device_name ? ` – ${r.device_name}` : ""}</strong>
                <span className={`badge ${r.status}`}>{statusLabel(r.status)}</span>
              </div>
              <div className="meta">{categoryLabel(r.category)} · {fmt(r.created_at)} · {r.tracking_code}</div>
              <div>{r.description.length > 120 ? `${r.description.slice(0, 120)}…` : r.description}</div>
              {r.admin_note && <div className="meta" style={{ marginTop: 6 }}><strong>Üzenet a karbantartótól:</strong> {r.admin_note}</div>}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
