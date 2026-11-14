import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "./actions";

export default async function AdminNav({ current }: { current: "bejelentesek" | "helyek" | "regisztraciok" }) {
  const supabase = await createClient();
  const { count } = await supabase.from("profiles").select("id", { count: "exact", head: true }).eq("status", "pending");
  return (
    <div className="topbar">
      <div className="tabs" style={{ margin: 0 }}>
        <Link href="/admin" className={`tab ${current === "bejelentesek" ? "active" : ""}`}>Bejelentések</Link>
        <Link href="/admin/regisztraciok" className={`tab ${current === "regisztraciok" ? "active" : ""}`}>
          Regisztrációk{count ? ` (${count})` : ""}
        </Link>
        <Link href="/admin/helyek" className={`tab ${current === "helyek" ? "active" : ""}`}>Termek és eszközök</Link>
      </div>
      <form action={logout}>
        <button className="btn secondary small" type="submit">Kilépés</button>
      </form>
    </div>
  );
}
