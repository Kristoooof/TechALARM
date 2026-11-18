import { requireRole } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { removeStaffRole } from "../privacy-actions";
import AdminNav from "../AdminNav";
import ConfirmButton from "../ConfirmButton";
import StaffForm from "./StaffForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Munkatársak – TechALARM Admin" };

const ROLE_LABEL: Record<string, string> = { operator: "Üzemeltető", maintainer: "Karbantartó", approver: "Jóváhagyó tanár" };

export default async function Staff() {
  const { supabase } = await requireRole("operator");
  const { data: rows } = await supabase.rpc("staff_list");
  const db = createAdminClient();
  const ids: string[] = [...new Set<string>((rows ?? []).map((r: { user_id: string }) => r.user_id))];
  const emails = new Map<string, string>();
  await Promise.all(
    ids.map(async (id) => {
      const { data } = await db.auth.admin.getUserById(id);
      emails.set(id, data.user?.email ?? id);
    }),
  );

  return (
    <>
      <AdminNav current="munkatarsak" />
      <h1>Munkatársak</h1>
      <p className="lead">Ki mihez fér hozzá. Az üzemeltető minden szerepkört magában foglal. Éles adathoz csak az üzemeltető engedélyével szabad hozzáférést adni, titoktartási nyilatkozat birtokában.</p>

      <ul className="list">
        {(rows ?? []).map((r: { user_id: string; role: string }) => (
          <li key={`${r.user_id}-${r.role}`} className="list-item" style={{ cursor: "default" }}>
            <div className="row">
              <strong>{emails.get(r.user_id)}</strong>
              <span className="badge">{ROLE_LABEL[r.role] ?? r.role}</span>
            </div>
            <form action={removeStaffRole} style={{ marginTop: 8 }}>
              <input type="hidden" name="user" value={r.user_id} />
              <input type="hidden" name="role" value={r.role} />
              <ConfirmButton className="btn danger small" message="Biztosan elveszed ettől a munkatárstól ezt a szerepkört?">Szerepkör elvétele</ConfirmButton>
            </form>
          </li>
        ))}
      </ul>

      <StaffForm />

      <div className="card">
        <h2>Adatmentés</h2>
        <p className="hint">Az ingyenes Supabase-csomagban nincs automatikus mentés. Tölts le rendszeresen (pl. havonta) egy teljes mentést, és tárold biztonságos helyen. A fényképek nem részei a mentésnek.</p>
        <a className="btn secondary block" href="/admin/mentes" download>Teljes mentés letöltése (JSON)</a>
      </div>
    </>
  );
}
