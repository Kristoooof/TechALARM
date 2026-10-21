import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { STATUSES, categoryLabel, roomLabel, statusLabel, type Status } from "@/lib/constants";
import { deleteReport, updateReport } from "../actions";
import ConfirmButton from "../ConfirmButton";

export const dynamic = "force-dynamic";

export default async function ReportDetail({ params }: { params: Promise<{ id: string }> }) {
  const { supabase } = await requireAdmin();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const { data: r } = await supabase.from("reports").select("*").eq("id", id).maybeSingle();
  if (!r) notFound();

  let photoUrl: string | null = null;
  if (r.photo_path) {
    const { data } = await supabase.storage.from("report-photos").createSignedUrl(r.photo_path, 3600);
    photoUrl = data?.signedUrl ?? null;
  }

  const fmt = (iso: string) => new Date(iso).toLocaleString("hu-HU", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Budapest" });

  return (
    <>
      <p><Link href="/admin">← Vissza a listához</Link></p>
      <div className="card">
        <div className="topbar">
          <h1 style={{ margin: 0 }}>{r.tracking_code}</h1>
          <span className={`badge ${r.status}`}>{statusLabel(r.status)}</span>
        </div>
        <dl className="details">
          <dt>Terem</dt><dd>{roomLabel(r.room_name, r.room_number)}</dd>
          <dt>Eszköz</dt><dd>{r.device_name ?? "–"}</dd>
          <dt>Típus</dt><dd>{categoryLabel(r.category)}</dd>
          <dt>Leírás</dt><dd style={{ whiteSpace: "pre-wrap" }}>{r.description}</dd>
          <dt>Beküldve</dt><dd>{fmt(r.created_at)}</dd>
          <dt>Frissítve</dt><dd>{fmt(r.updated_at)}</dd>
        </dl>
        {photoUrl && (
          <p>
            <a href={photoUrl} target="_blank" rel="noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="photo" src={photoUrl} alt="A bejelentéshez csatolt fénykép" />
            </a>
          </p>
        )}
      </div>

      <form action={updateReport} className="card">
        <h2>Kezelés</h2>
        <input type="hidden" name="id" value={r.id} />
        <div className="field">
          <label htmlFor="status">Státusz</label>
          <select id="status" name="status" defaultValue={r.status}>
            {(Object.keys(STATUSES) as Status[]).map((s) => <option key={s} value={s}>{STATUSES[s]}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="admin_note">Megjegyzés <span className="hint">(a bejelentő is látja a követőoldalon)</span></label>
          <textarea id="admin_note" name="admin_note" maxLength={1000} defaultValue={r.admin_note ?? ""} />
        </div>
        <button className="btn block" type="submit">Mentés</button>
      </form>

      <form action={deleteReport}>
        <input type="hidden" name="id" value={r.id} />
        <ConfirmButton className="btn danger small" message="Biztosan törlöd ezt a bejelentést? Ez nem vonható vissza.">Bejelentés törlése</ConfirmButton>
      </form>
    </>
  );
}
