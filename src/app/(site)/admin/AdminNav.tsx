import Link from "next/link";
import { getRoles } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { logout } from "./actions";

type Tab = "bejelentesek" | "regisztraciok" | "adatkerelmek" | "munkatarsak" | "helyek";

export default async function AdminNav({ current }: { current: Tab }) {
  const roles = await getRoles();
  const supabase = await createClient();
  const [pending, open] = await Promise.all([
    roles.includes("approver")
      ? supabase.from("profiles").select("id", { count: "exact", head: true }).eq("status", "pending")
      : Promise.resolve({ count: 0 }),
    roles.includes("operator")
      ? supabase.from("data_requests").select("id", { count: "exact", head: true }).eq("status", "open")
      : Promise.resolve({ count: 0 }),
  ]);
  const tab = (key: Tab, href: string, label: string) => (
    <Link href={href} className={`tab ${current === key ? "active" : ""}`}>{label}</Link>
  );
  return (
    <div className="topbar">
      <div className="tabs" style={{ margin: 0 }}>
        {roles.includes("maintainer") && tab("bejelentesek", "/admin", "Bejelentések")}
        {roles.includes("approver") && tab("regisztraciok", "/admin/regisztraciok", `Regisztrációk${pending.count ? ` (${pending.count})` : ""}`)}
        {roles.includes("operator") && tab("adatkerelmek", "/admin/adatkerelmek", `Adatkérelmek${open.count ? ` (${open.count})` : ""}`)}
        {roles.includes("maintainer") && tab("helyek", "/admin/helyek", "Termek és eszközök")}
        {roles.includes("operator") && tab("munkatarsak", "/admin/munkatarsak", "Munkatársak")}
      </div>
      <form action={logout}>
        <button className="btn secondary small" type="submit">Kilépés</button>
      </form>
    </div>
  );
}
