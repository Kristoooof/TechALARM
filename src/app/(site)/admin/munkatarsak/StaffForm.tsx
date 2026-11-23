"use client";

import { useActionState } from "react";
import { assignRole, type StaffState } from "../privacy-actions";

export default function StaffForm() {
  const [state, action, pending] = useActionState<StaffState, FormData>(assignRole, null);
  return (
    <form action={action} className="card">
      <h2>Szerepkör megadása</h2>
      <p className="hint">A személynek előbb regisztrálnia kell. A felhasználónevét a regisztráció utáni oldalon és a Fiókom oldalon látja, a Regisztrációk listában te is megtalálod.</p>
      {state && <div className={`alert ${state.ok ? "success" : "error"}`} role={state.ok ? "status" : "alert"}>{state.message}</div>}
      <div className="field">
        <label htmlFor="username">Felhasználónév</label>
        <input id="username" name="username" type="text" required autoComplete="off" placeholder="pl. kovacs.sandor2" />
      </div>
      <div className="field">
        <label htmlFor="role">Szerepkör</label>
        <select id="role" name="role" required defaultValue="">
          <option value="">– válassz –</option>
          <option value="approver">Tanár: bejelent, regisztrációt hagy jóvá</option>
          <option value="maintainer">Karbantartó: regisztrációt hagy jóvá, bejelentéseket kezel, termek és eszközök</option>
          <option value="operator">Igazgató / admin: minden</option>
        </select>
      </div>
      <button className="btn block" type="submit" disabled={pending}>{pending ? "Mentés…" : "Szerepkör megadása"}</button>
    </form>
  );
}
