"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="card">
      <div className="alert error" role="alert">Hiba történt az oldal betöltésekor.</div>
      <button className="btn" type="button" onClick={reset}>Újrapróbálás</button>
    </div>
  );
}
