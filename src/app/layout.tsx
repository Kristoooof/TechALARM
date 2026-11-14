import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "TechALARM – Hibabejelentő",
  description: "Elromlott eszközök és rongálások bejelentése a Mátészalkai Gépészeti Technikumban.",
  openGraph: { title: "TechALARM – Hibabejelentő", description: "Elromlott eszközök és rongálások bejelentése: regisztrációval, fényképpel, követhető állapottal.", locale: "hu_HU", type: "website" },
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
        {children}
        <Analytics />
      </body>
    </html>
  );
}
