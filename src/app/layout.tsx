import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import "./theme.css";

export const metadata: Metadata = {
  title: "TechALARM – Hibabejelentő",
  description: "Elromlott eszközök és rongálások bejelentése a Mátészalkai Gépészeti Technikumban.",
  openGraph: { title: "TechALARM – Hibabejelentő", description: "Elromlott eszközök és rongálások bejelentése – névtelenül, követhetően.", locale: "hu_HU", type: "website" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#172554",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hu">
      <body>
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
            </nav>
          </div>
        </header>
        <main className="container">{children}</main>
        <footer className="container site-footer">
          MSZC Gépészeti Technikum · <Link href="/admin">Admin</Link>
        </footer>
      </body>
    </html>
  );
}
