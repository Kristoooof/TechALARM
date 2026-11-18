"use client";

import { useActionState } from "react";
import { createStaff, type StaffState } from "../privacy-actions";

export default function StaffForm() {
  const [state, action, pending] = useActionState<StaffState, FormData>(createStaff, null);
  return (
    <form action={action} className="card">
      <h2>Új munkatárs</h2>
      {state && <div className={`alert ${state.ok ? "success" : "error"}`} role={state.ok ? "status" : "alert"}>{state.message}</div>}
      <div className="field">
        <label htmlFor="email">E-mail cím</label>
        <input id="email" name="email" type="email" required autoComplete="off" />
      </div>
      <div className="field">
        <label htmlFor="password">Kezdő jelszó <span className="hint">(legalább 8 karakter)</span></label>
        <input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" />
      </div>
      <div className="field">
        <label htmlFor="role">Szerepkör</label>
        <select id="role" name="role" required defaultValue="">
          <option value="">– válassz –</option>
          <option value="maintainer">Karbantartó: bejelentések, termek és eszközök</option>
          <option value="approver">Jóváhagyó tanár: regisztrációk</option>
          <option value="operator">Üzemeltető: minden, a munkatársak és az adatkérelmek is</option>
        </select>
      </div>
      <button className="btn block" type="submit" disabled={pending}>{pending ? "Létrehozás…" : "Fiók létrehozása"}</button>
    </form>
  );
}
