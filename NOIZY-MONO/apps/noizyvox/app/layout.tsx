import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "NOIZYVOX — Sovereign Voice Platform",
    template: "%s | NOIZYVOX",
  },
  description:
    "Consent-native voice infrastructure. Where creators control their voice identity, permissions, and legacy.",
  keywords: [
    "voice platform",
    "voice consent",
    "synthetic voice",
    "voice rights",
    "voice casting",
    "NOIZY",
  ],
  authors: [{ name: "Robert Stephen Plowman", url: "https://noizy.ai" }],
  creator: "NOIZY Labs",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://noizyvox.com",
    siteName: "NOIZYVOX",
    title: "NOIZYVOX — Sovereign Voice Platform",
    description:
      "Consent-native voice infrastructure for creators.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen flex flex-col font-body noise-texture">
        <Navigation />
        <main className="flex-1 relative z-10">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
