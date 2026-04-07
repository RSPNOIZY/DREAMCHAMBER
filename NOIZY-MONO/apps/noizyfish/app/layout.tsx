import type { Metadata } from "next";
import { Inter, Playfair_Display, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "NOIZYFISH — A Living Archive of the Ocean",
    template: "%s | NOIZYFISH",
  },
  description:
    "Museum-grade recordings from the depths. Preserved with cryptographic provenance. Built for generations.",
  keywords: [
    "ocean sounds",
    "marine archive",
    "bioacoustics",
    "sound preservation",
    "ocean conservation",
    "NOIZY",
  ],
  authors: [{ name: "Robert Stephen Plowman", url: "https://noizy.ai" }],
  creator: "NOIZY Labs",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://noizyfish.com",
    siteName: "NOIZYFISH",
    title: "NOIZYFISH — A Living Archive of the Ocean",
    description:
      "Museum-grade recordings from the depths. Preserved with cryptographic provenance.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen flex flex-col font-body noise-texture">
        <div className="caustics-overlay" />
        <Navigation />
        <main className="flex-1 relative z-10">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
