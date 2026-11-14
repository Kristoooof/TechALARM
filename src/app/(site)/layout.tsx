import Link from "next/link";
import { getReporter } from "@/lib/reporter";
import { logoutReporter } from "./auth-actions";
import "../globals.css";
import "../theme.css";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const reporter = await getReporter();
  return (
    <>
      <header className="site-header">
        <div className="container header-inner">
          <Link href="/" className="brand" aria-label="TechALARM – főoldal">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo-mark.svg" alt="" width={28} height={31} className="brand-mark" />
            <strong className="brand-text">
              Tech<span>ALARM</span>
            </strong>
          </Link>
          <nav>
            <Link href="/">Bejelentés</Link>
            {reporter?.status === "approved" && <Link href="/bejelentesim">Bejelentéseim</Link>}
            <Link href="/nyomon">Állapot</Link>
            {reporter ? (
              <form action={logoutReporter} style={{ display: "contents" }}>
                <button type="submit" className="linklike" title={reporter.fullName}>Kilépés</button>
              </form>
            ) : (
              <Link href="/belepes">Belépés</Link>
            )}
          </nav>
        </div>
      </header>
      <main className="container">{children}</main>
      <footer className="container site-footer">
        MSZC Gépészeti Technikum · <Link href="/bemutato">Bemutató</Link> · <Link href="/admin">Admin</Link>
      </footer>
    </>
  );
}
