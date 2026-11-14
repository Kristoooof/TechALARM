import type { Metadata, Viewport } from "next";

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
      <body>{children}</body>
    </html>
  );
}
