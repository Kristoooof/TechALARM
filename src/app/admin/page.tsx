import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { STATUSES, categoryLabel, isStatus, roomLabel, statusLabel, type Status } from "@/lib/constants";
import AdminNav from "./AdminNav";

export const dynamic = "force-dynamic";
export const metadata = { title: "Bejelentések – TechALARM Admin" };

export default async function AdminHome({ searchParams }: { searchParams: Promise<{ statusz?: string }> }) {
  const { supabase } = await requireAdmin();
  const { statusz } = await searchParams;
  const filter = isStatus(statusz) ? statusz : null;

  let query = supabase
    .from("reports")
    .select("id, tracking_code, room_name, room_number, device_name, category, status, description, created_at")
    .order("created_at", { ascending: false })
    .limit(300);
  if (filter) query = query.eq("status", filter);

  const [{ data: reports }, { data: all }] = await Promise.all([query, supabase.from("reports").select("status")]);
  const counts: Record<string, number> = {};
  (all ?? []).forEach((r) => { counts[r.status] = (counts[r.status] ?? 0) + 1; });

  const fmt = (iso: string) => new Date(iso).toLocaleString("hu-HU", { dateStyle: "short", timeStyle: "short", timeZone: "Europe/Budapest" });

  return (
    <>
      <AdminNav current="bejelentesek" />
      <h1>Bejelentések</h1>

      <div className="tabs">
        <Link href="/admin" className={`tab ${!filter ? "active" : ""}`}>Mind ({all?.length ?? 0})</Link>
        {(Object.keys(STATUSES) as Status[]).map((s) => (
          <Link key={s} href={`/admin?statusz=${s}`} className={`tab ${filter === s ? "active" : ""}`}>
            {STATUSES[s]} ({counts[s] ?? 0})
          </Link>
        ))}
      </div>

      {reports?.length === 0 && <p className="lead">Nincs megjeleníthető bejelentés.</p>}
      <ul className="list">
        {reports?.map((r) => (
          <li key={r.id}>
            <Link href={`/admin/${r.id}`} className="list-item">
              <div className="row">
                <strong>{roomLabel(r.room_name, r.room_number)}{r.device_name ? ` – ${r.device_name}` : ""}</strong>
                <span className={`badge ${r.status}`}>{statusLabel(r.status)}</span>
              </div>
              <div className="meta">
                {categoryLabel(r.category)} · {fmt(r.created_at)} · {r.tracking_code}
              </div>
              <div>{r.description.length > 120 ? `${r.description.slice(0, 120)}…` : r.description}</div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
