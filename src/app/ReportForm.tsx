"use client";

import Link from "next/link";
import Script from "next/script";
import { useMemo, useRef, useState, useTransition } from "react";
import { CATEGORIES } from "@/lib/constants";
import { submitReport, type SubmitResult } from "./actions";
import Turnstile from "./Turnstile";

type Room = { id: string; name: string };
type Device = { id: string; room_id: string; name: string; inventory_code: string | null };

const MAX_UPLOAD_BYTES = 4 * 1024 * 1024; // a Vercel 4,5 MB-nál nagyobb kérést nem enged át
const MAX_DIMENSION = 1600;

/** A telefonos fényképet feltöltés előtt lekicsinyíti (max. 1600 px, JPEG), hogy elférjen a méretkorlátban. */
async function shrinkPhoto(file: File): Promise<File> {
  if (file.size <= 1024 * 1024 && file.type === "image/jpeg") return file;
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/jpeg", 0.82));
    if (blob && blob.size < file.size) return new File([blob], "foto.jpg", { type: "image/jpeg" });
  } catch {
    // ha a böngésző nem tudja feldolgozni, marad az eredeti
  }
  return file;
}

export default function ReportForm({
  rooms,
  devices,
  initialRoomId,
  turnstileSiteKey,
}: {
  rooms: Room[];
  devices: Device[];
  initialRoomId?: string;
  turnstileSiteKey: string;
}) {
  const [roomId, setRoomId] = useState(rooms.some((r) => r.id === initialRoomId) ? initialRoomId! : "");
  const [deviceId, setDeviceId] = useState("");
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const [token, setToken] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);

  const roomDevices = useMemo(() => devices.filter((d) => d.room_id === roomId), [devices, roomId]);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (token) fd.set("cf-turnstile-response", token);
    startTransition(async () => {
      let res: SubmitResult;
      try {
        const photo = fd.get("photo");
        if (photo instanceof File && photo.size > 0) {
          const small = await shrinkPhoto(photo);
          if (small.size > MAX_UPLOAD_BYTES) {
            setResult({ ok: false, error: "A fénykép túl nagy. Válassz kisebb képet, vagy küldd fénykép nélkül." });
            setResetKey((k) => k + 1);
            return;
          }
          fd.set("photo", small);
        }
        res = await submitReport(fd);
      } catch {
        res = { ok: false, error: "A bejelentés elküldése nem sikerült (hálózati hiba). Próbáld újra." };
      }
      setResult(res);
      // A Turnstile token egyszer használatos
      if (!res.ok) setResetKey((k) => k + 1);
      if (res.ok) window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  if (result?.ok) {
    return (
      <div className="card">
        <div className="alert success">Köszönjük, a bejelentésed megérkezett!</div>
        <p>Ezzel a kóddal később megnézheted, hogy intézkedtek-e. <strong>Jegyezd fel vagy készíts róla képernyőképet</strong>, mert utólag nem kérhető le.</p>
        <div className="code-box">{result.code}</div>
        <div style={{ display: "grid", gap: 8 }}>
          <Link className="btn block" href={`/nyomon?kod=${encodeURIComponent(result.code)}`}>Állapot megtekintése</Link>
          <button className="btn secondary block" type="button" onClick={() => { setResult(null); setDeviceId(""); }}>
            Újabb bejelentés
          </button>
        </div>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="card">
      {result && !result.ok && <div className="alert error" role="alert">{result.error}</div>}

      <div className="field">
        <label htmlFor="room_id">Terem / labor</label>
        <select id="room_id" name="room_id" required value={roomId} onChange={(e) => { setRoomId(e.target.value); setDeviceId(""); }}>
          <option value="">– válassz –</option>
          {rooms.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
      </div>

      <div className="field">
        <label htmlFor="device_id">Eszköz</label>
        <select id="device_id" name="device_id" required disabled={!roomId} value={deviceId} onChange={(e) => setDeviceId(e.target.value)}>
          <option value="">{roomId ? "– válassz –" : "Előbb válassz termet"}</option>
          {roomDevices.map((d) => (
            <option key={d.id} value={d.id}>{d.name}{d.inventory_code ? ` (${d.inventory_code})` : ""}</option>
          ))}
          {roomId && <option value="terem">Nem konkrét eszköz (pl. a terem, berendezés)</option>}
          {roomId && <option value="egyeb">Más eszköz – nincs a listában</option>}
        </select>
      </div>

      {deviceId === "egyeb" && (
        <div className="field">
          <label htmlFor="device_text">Az eszköz neve</label>
          <input id="device_text" name="device_text" type="text" maxLength={100} required />
        </div>
      )}

      <div className="field">
        <label htmlFor="category">Mi a probléma?</label>
        <select id="category" name="category" required defaultValue="">
          <option value="">– válassz –</option>
          {Object.entries(CATEGORIES).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
        </select>
      </div>

      <div className="field">
        <label htmlFor="description">Leírás</label>
        <textarea id="description" name="description" required minLength={5} maxLength={2000} placeholder="Mi történt? Mióta áll fenn a hiba?" />
      </div>

      <div className="field">
        <label htmlFor="photo">Fénykép <span className="hint">(nem kötelező, automatikusan lekicsinyítjük)</span></label>
        <input id="photo" name="photo" type="file" accept="image/jpeg,image/png,image/webp" />
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
            <Turnstile siteKey={turnstileSiteKey} onToken={setToken} resetKey={resetKey} />
          </div>
        </>
      )}

      <button className="btn block" type="submit" disabled={pending || (!!turnstileSiteKey && !token)}>
        {pending ? "Küldés…" : turnstileSiteKey && !token ? "Spamvédelmi ellenőrzés…" : "Bejelentés elküldése"}
      </button>
    </form>
  );
}
