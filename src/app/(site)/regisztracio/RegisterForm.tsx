"use client";

import Link from "next/link";
import Script from "next/script";
import { useActionState, useEffect, useState } from "react";
import { register, type AuthState } from "../auth-actions";
import Turnstile from "../Turnstile";
import { NAME_MAX, PASSWORD_MIN } from "@/lib/constants";

export default function RegisterForm({ turnstileSiteKey }: { turnstileSiteKey: string }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(register, null);
  const [token, setToken] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);

  // A Turnstile token egyszer használatos: sikertelen próbálkozás után újat kérünk
  useEffect(() => {
    if (state && !state.ok) setResetKey((k) => k + 1);
  }, [state]);

  if (state?.ok) {
    return (
      <div className="card">
        <div className="alert success">{state.message}</div>
        <p>
          Az admin jóváhagyása után be tudsz lépni a neveddel ({state.name}) és a jelszavaddal, és bejelentést tudsz tenni.
          A jóváhagyásról most nem küldünk értesítést, ezért később próbálj meg belépni.
        </p>
        <Link className="btn block" href="/belepes">Tovább a belépéshez</Link>
      </div>
    );
  }

  return (
    <form action={action} className="card">
      {state && !state.ok && <div className="alert error" role="alert">{state.message}</div>}

      <div className="field">
        <label htmlFor="name">Teljes név <span className="hint">(ezzel fogsz belépni)</span></label>
        <input id="name" name="name" type="text" required maxLength={NAME_MAX} autoComplete="username" defaultValue={state?.name ?? ""} />
      </div>
      <div className="field">
        <label htmlFor="password">Jelszó <span className="hint">(legalább {PASSWORD_MIN} karakter)</span></label>
        <input id="password" name="password" type="password" required minLength={PASSWORD_MIN} autoComplete="new-password" />
      </div>
      <div className="field">
        <label htmlFor="password2">Jelszó újra</label>
        <input id="password2" name="password2" type="password" required minLength={PASSWORD_MIN} autoComplete="new-password" />
      </div>

      <div className="field">
        <label style={{ display: "flex", gap: 10, alignItems: "flex-start", fontWeight: 400 }}>
          <input type="checkbox" name="consent" required style={{ marginTop: 4 }} />
          <span>
            Elfogadom, hogy a nevemet a TechALARM tárolja, a bejelentéseimet pedig hozzám kapcsolja.
            A nevemet az admin és a karbantartó látja.
          </span>
        </label>
      </div>

      {/* Csalogató mező botoknak */}
      <div className="hp" aria-hidden="true">
        <label htmlFor="website">Ne töltsd ki</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {turnstileSiteKey && (
        <>
          <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" />
          <div className="field">
            <input type="hidden" name="cf-turnstile-response" value={token ?? ""} />
            <Turnstile siteKey={turnstileSiteKey} onToken={setToken} resetKey={resetKey} />
          </div>
        </>
      )}

      <button className="btn block" type="submit" disabled={pending || (!!turnstileSiteKey && !token)}>
        {pending ? "Küldés…" : turnstileSiteKey && !token ? "Spamvédelmi ellenőrzés…" : "Regisztráció elküldése"}
      </button>
      <p className="hint" style={{ marginTop: 12 }}>
        A regisztrációt az admin hagyja jóvá. Van már fiókod? <Link href="/belepes">Belépés</Link>
      </p>
    </form>
  );
}
