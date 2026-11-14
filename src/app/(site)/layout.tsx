import Link from "next/link";
import "../globals.css";
import "../theme.css";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
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
            <Link href="/nyomon">Állapot</Link>
            <Link href="/bemutato">Bemutató</Link>
          </nav>
        </div>
      </header>
      <main className="container">{children}</main>
      <footer className="container site-footer">
        MSZC Gépészeti Technikum · <Link href="/admin">Admin</Link>
      </footer>
    </>
  );
}
