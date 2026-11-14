"use client";

import { useActionState } from "react";
import { importCsv, type FormState } from "../actions";

export default function ImportForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(importCsv, null);
  return (
    <form action={action}>
      {state && <div className={`alert ${state.ok ? "success" : "error"}`} role="status">{state.message}</div>}
      <div className="field">
        <label htmlFor="file">CSV fájl <span className="hint">(oszlopok: terem; eszköz; leltári szám – fejléc lehet)</span></label>
        <input id="file" name="file" type="file" accept=".csv,text/csv,text/plain" required />
      </div>
      <button className="btn" type="submit" disabled={pending}>{pending ? "Importálás…" : "Importálás"}</button>
    </form>
  );
}
