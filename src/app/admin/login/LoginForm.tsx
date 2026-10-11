"use client";

import { useActionState } from "react";
import { login, type FormState } from "../actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(login, null);
  return (
    <form action={action} className="card">
      {state && !state.ok && <div className="alert error" role="alert">{state.message}</div>}
      <div className="field">
        <label htmlFor="email">E-mail cím</label>
        <input id="email" name="email" type="email" required autoComplete="username" defaultValue={state?.email ?? ""} />
      </div>
      <div className="field">
        <label htmlFor="password">Jelszó</label>
        <input id="password" name="password" type="password" required autoComplete="current-password" />
      </div>
      <button className="btn block" type="submit" disabled={pending}>{pending ? "Belépés…" : "Belépés"}</button>
    </form>
  );
}
