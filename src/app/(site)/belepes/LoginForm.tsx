"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginReporter, type AuthState } from "../auth-actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(loginReporter, null);
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
      <p className="hint" style={{ marginTop: 12 }}>Még nincs fiókod? <Link href="/regisztracio">Regisztráció</Link></p>
    </form>
  );
}
