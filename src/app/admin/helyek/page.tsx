import { requireAdmin } from "@/lib/auth";
import { addDevice, addRoom, deleteDevice, deleteRoom, toggleDevice, toggleRoom } from "../actions";
import AdminNav from "../AdminNav";
import ConfirmButton from "../ConfirmButton";
import ImportForm from "./ImportForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Termek és eszközök – TechALARM Admin" };

export default async function Places() {
  const { supabase } = await requireAdmin();
  const [{ data: rooms }, { data: devices }] = await Promise.all([
    supabase.from("rooms").select("id, name, active").order("sort_order").order("name"),
    supabase.from("devices").select("id, room_id, name, inventory_code, active").order("name"),
  ]);

  return (
    <>
      <AdminNav current="helyek" />
      <h1>Termek és eszközök</h1>
      <p className="lead">A rejtett (inaktív) termek és eszközök nem jelennek meg a bejelentő űrlapon, de a régi bejelentések megmaradnak. Törlés helyett inkább rejtsd el őket.</p>

      <details className="card">
        <summary><strong>Tömeges feltöltés CSV-ből</strong></summary>
        <div style={{ marginTop: 12 }}><ImportForm /></div>
      </details>

      <form action={addRoom} className="card">
        <h2>Új terem</h2>
        <div className="inline-form">
          <div className="grow"><label htmlFor="room-name">Terem neve</label><input id="room-name" name="name" type="text" required maxLength={100} /></div>
          <button className="btn" type="submit">Hozzáadás</button>
        </div>
      </form>

      {rooms?.map((room) => (
        <section key={room.id} className="card" style={room.active ? undefined : { opacity: 0.6 }}>
          <div className="topbar">
            <h2 style={{ margin: 0 }}>{room.name}{room.active ? "" : " (rejtett)"}</h2>
            <div style={{ display: "flex", gap: 8 }}>
              <form action={toggleRoom}>
                <input type="hidden" name="id" value={room.id} />
                <input type="hidden" name="active" value={String(!room.active)} />
                <button className="btn secondary small" type="submit">{room.active ? "Elrejtés" : "Megjelenítés"}</button>
              </form>
              <form action={deleteRoom}>
                <input type="hidden" name="id" value={room.id} />
                <ConfirmButton className="btn danger small" message={`Biztosan törlöd a(z) „${room.name}” termet és minden eszközét?`}>Törlés</ConfirmButton>
              </form>
            </div>
          </div>

          <ul className="list">
            {devices?.filter((d) => d.room_id === room.id).map((d) => (
              <li key={d.id} className="row" style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center", padding: "6px 0", borderTop: "1px solid var(--border)", opacity: d.active ? 1 : 0.5 }}>
                <span>{d.name}{d.inventory_code ? ` (${d.inventory_code})` : ""}{d.active ? "" : " – rejtett"}</span>
                <span style={{ display: "flex", gap: 6 }}>
                  <form action={toggleDevice}>
                    <input type="hidden" name="id" value={d.id} />
                    <input type="hidden" name="active" value={String(!d.active)} />
                    <button className="btn secondary small" type="submit">{d.active ? "Elrejtés" : "Megjelenítés"}</button>
                  </form>
                  <form action={deleteDevice}>
                    <input type="hidden" name="id" value={d.id} />
                    <ConfirmButton className="btn danger small" message={`Biztosan törlöd: ${d.name}?`}>Törlés</ConfirmButton>
                  </form>
                </span>
              </li>
            ))}
          </ul>

          <form action={addDevice} className="inline-form" style={{ marginTop: 12 }}>
            <input type="hidden" name="room_id" value={room.id} />
            <div className="grow"><label htmlFor={`dn-${room.id}`}>Új eszköz</label><input id={`dn-${room.id}`} name="name" type="text" required maxLength={100} /></div>
            <div className="grow"><label htmlFor={`dc-${room.id}`}>Leltári szám</label><input id={`dc-${room.id}`} name="inventory_code" type="text" maxLength={50} /></div>
            <button className="btn small" type="submit">Hozzáadás</button>
          </form>
        </section>
      ))}
    </>
  );
}
