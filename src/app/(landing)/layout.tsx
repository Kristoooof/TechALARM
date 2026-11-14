import Link from "next/link";
import Reveal from "./Reveal";
import TrackedLink from "./TrackedLink";
import "./landing.css";

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="lp">
      <header className="top">
        <div className="wrap">
          <Link href="/bemutato" className="logo" aria-label="TechALARM">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo-mark.svg" alt="" width={26} height={29} />
            <span style={{ color: "#fff" }}>
              Tech<span>ALARM</span>
            </span>
          </Link>
          <TrackedLink href="/" place="fejlec" className="btn sm">Hibát jelentek</TrackedLink>
        </div>
      </header>

      <main>{children}</main>
      <Reveal />

      <footer className="foot">
        <div className="wrap">
          <span>TechALARM · Mátészalkai Gépészeti Technikum</span>
          <nav aria-label="Lábléc">
            <Link href="/">Bejelentés</Link>
            <Link href="/nyomon">Állapot</Link>
            <Link href="/karbantartoknak">Karbantartóknak</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
