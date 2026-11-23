import Link from "next/link";
import { redirect } from "next/navigation";
import { getRoles } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { STATUSES, categoryLabel, isStatus, roomLabel, statusLabel, type Status } from "@/lib/constants";
import AdminNav from "./AdminNav";

export const dynamic = "force-dynamic";
export const metadata = { title: "Bejelentések – TechALARM Admin" };

export default async function AdminHome({ searchParams }: { searchParams: Promise<{ statusz?: string; hitelesites?: string }> }) {
  const roles = await getRoles();
  if (!roles.includes("maintainer")) redirect(roles.length ? "/admin/regisztraciok" : "/admin/login");
  const supabase = await createClient();
  const { statusz, hitelesites } = await searchParams;
  const onlyUnverified = hitelesites === "nincs";
  const filter = isStatus(statusz) ? statusz : null;

  let query = supabase
    .from("reports")
    .select("id, tracking_code, room_name, room_number, device_name, category, status, description, created_at, reporter_name, reporter_id, reporter_verified")
    .order("created_at", { ascending: false })
    .limit(300);
  if (filter) query = query.eq("status", filter);
  if (onlyUnverified) query = query.not("reporter_id", "is", null).eq("reporter_verified", false);

  const [{ data: reports }, { data: all }] = await Promise.all([query, supabase.from("reports").select("status, reporter_id, reporter_verified")]);
  const counts: Record<string, number> = {};
  (all ?? []).forEach((r) => { counts[r.status] = (counts[r.status] ?? 0) + 1; });
  const unverifiedCount = (all ?? []).filter((r) => r.reporter_id && !r.reporter_verified).length;

  const fmt = (iso: string) => new Date(iso).toLocaleString("hu-HU", { dateStyle: "short", timeStyle: "short", timeZone: "Europe/Budapest" });

  return (
    <>
      <AdminNav current="bejelentesek" />
      <h1>Bejelentések</h1>

      <div className="tabs">
        <Link href="/admin" className={`tab ${!filter && !onlyUnverified ? "active" : ""}`}>Mind ({all?.length ?? 0})</Link>
        <Link href="/admin?hitelesites=nincs" className={`tab ${onlyUnverified ? "active" : ""}`}>Hitelesítetlen ({unverifiedCount})</Link>
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
              {r.reporter_id && !r.reporter_verified && <div><span className="badge unverified">Hitelesítetlen bejelentő</span></div>}
              <div className="meta">
                {categoryLabel(r.category)} · {fmt(r.created_at)} · {r.tracking_code}{r.reporter_name ? ` · ${r.reporter_name}` : ""}
              </div>
              <div>{r.description.length > 120 ? `${r.description.slice(0, 120)}…` : r.description}</div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
