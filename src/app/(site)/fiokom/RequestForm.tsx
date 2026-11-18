"use client";

import { useActionState } from "react";
import { submitDataRequest, type RequestState } from "../privacy-actions";

export default function RequestForm() {
  const [state, action, pending] = useActionState<RequestState, FormData>(submitDataRequest, null);
  return (
    <form action={action}>
      {state && <div className={`alert ${state.ok ? "success" : "error"}`} role={state.ok ? "status" : "alert"}>{state.message}</div>}
      <div className="field">
        <label htmlFor="type">Mit szeretnél?</label>
        <select id="type" name="type" required defaultValue="">
          <option value="">– válassz –</option>
          <option value="hozzaferes">Hozzáférés: másolatot kérek az adataimról</option>
          <option value="helyesbites">Helyesbítés: javítsák az adataimat (pl. a nevem)</option>
          <option value="torles">Törlés: töröljék a fiókomat és az adataimat</option>
          <option value="tiltakozas">Tiltakozás az adatkezelés ellen</option>
          <option value="egyeb">Egyéb adatvédelmi kérdés</option>
        </select>
      </div>
      <div className="field">
        <label htmlFor="message">Leírás</label>
        <textarea id="message" name="message" required minLength={3} maxLength={2000} placeholder="Mit szeretnél kérni? Helyesbítésnél írd le, mire javítsuk." />
      </div>
      <button className="btn block" type="submit" disabled={pending}>{pending ? "Küldés…" : "Kérelem elküldése"}</button>
    </form>
  );
}
