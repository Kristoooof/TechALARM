import Link from "next/link";
import { logout } from "./actions";

export default function AdminNav({ current }: { current: "bejelentesek" | "helyek" }) {
  return (
    <div className="topbar">
      <div className="tabs" style={{ margin: 0 }}>
        <Link href="/admin" className={`tab ${current === "bejelentesek" ? "active" : ""}`}>Bejelentések</Link>
        <Link href="/admin/helyek" className={`tab ${current === "helyek" ? "active" : ""}`}>Termek és eszközök</Link>
      </div>
      <form action={logout}>
        <button className="btn secondary small" type="submit">Kilépés</button>
      </form>
    </div>
  );
}
