import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { PROFILE_STATUSES, isProfileStatus, profileStatusLabel, type ProfileStatus } from "@/lib/constants";
import { setProfileStatus } from "../actions";
import AdminNav from "../AdminNav";

export const dynamic = "force-dynamic";
export const metadata = { title: "Regisztrációk – TechALARM Admin" };

export default async function Registrations({ searchParams }: { searchParams: Promise<{ statusz?: string }> }) {
  const { supabase } = await requireAdmin();
  const { statusz } = await searchParams;
  const filter: ProfileStatus = isProfileStatus(statusz) ? statusz : "pending";

  const [{ data: profiles }, { data: all }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, status, created_at, decided_at")
      .eq("status", filter)
      .order("created_at", { ascending: false })
      .limit(300),
    supabase.from("profiles").select("status"),
  ]);
  const counts: Record<string, number> = {};
  (all ?? []).forEach((p) => { counts[p.status] = (counts[p.status] ?? 0) + 1; });

  const fmt = (iso: string) => new Date(iso).toLocaleString("hu-HU", { dateStyle: "short", timeStyle: "short", timeZone: "Europe/Budapest" });

  return (
    <>
      <AdminNav current="regisztraciok" />
      <h1>Regisztrációk</h1>
      <p className="lead">Csak a jóváhagyott felhasználók tudnak bejelentést tenni. Jóváhagyás előtt ellenőrizd, hogy a név valódinak tűnik-e, és tényleg az iskolához tartozó személyé.</p>

      <div className="tabs">
        {(Object.keys(PROFILE_STATUSES) as ProfileStatus[]).map((s) => (
          <Link key={s} href={`/admin/regisztraciok?statusz=${s}`} className={`tab ${filter === s ? "active" : ""}`}>
            {PROFILE_STATUSES[s]} ({counts[s] ?? 0})
          </Link>
        ))}
      </div>

      {(profiles ?? []).length === 0 && <p className="lead">Nincs megjeleníthető regisztráció.</p>}
      <ul className="list">
        {(profiles ?? []).map((p) => (
          <li key={p.id} className="list-item" style={{ cursor: "default" }}>
            <div className="row">
              <strong>{p.full_name}</strong>
              <span className="badge">{profileStatusLabel(p.status)}</span>
            </div>
            <div className="meta">
              regisztrált: {fmt(p.created_at)}{p.decided_at ? ` · döntés: ${fmt(p.decided_at)}` : ""}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
              {p.status !== "approved" && (
                <form action={setProfileStatus}>
                  <input type="hidden" name="id" value={p.id} />
                  <input type="hidden" name="status" value="approved" />
                  <button className="btn small" type="submit">Jóváhagyás</button>
                </form>
              )}
              {p.status !== "rejected" && (
                <form action={setProfileStatus}>
                  <input type="hidden" name="id" value={p.id} />
                  <input type="hidden" name="status" value="rejected" />
                  <button className="btn danger small" type="submit">{p.status === "approved" ? "Hozzáférés visszavonása" : "Elutasítás"}</button>
                </form>
              )}
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
