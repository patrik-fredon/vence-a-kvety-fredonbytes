import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pohřební věnce | Ketingmar s.r.o.",
  description: "Prémiové pohřební věnce a květinové aranžmá. Ruční výroba, rychlé dodání, důstojné rozloučení.",
  keywords: ["pohřební věnce", "květinové aranžmá", "pohřeb", "rozloučení", "věnce"],
  authors: [{ name: "Ketingmar s.r.o." }],
  creator: "Ketingmar s.r.o.",
  publisher: "Ketingmar s.r.o.",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "cs_CZ",
    alternateLocale: "en_US",
    title: "Pohřební věnce | Ketingmar s.r.o.",
    description: "Prémiové pohřební věnce a květinové aranžmá. Ruční výroba, rychlé dodání, důstojné rozloučení.",
    siteName: "Pohřební věnce",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pohřební věnce | Ketingmar s.r.o.",
    description: "Prémiové pohřební věnce a květinové aranžmá. Ruční výroba, rychlé dodání, důstojné rozloučení.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs" className="scroll-smooth">
      <body
        className={`${inter.variable} ${playfairDisplay.variable} font-sans antialiased bg-neutral-50 text-neutral-900`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
