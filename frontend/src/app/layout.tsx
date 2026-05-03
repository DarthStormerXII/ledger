import type { Metadata, Viewport } from "next";
import {
  Fraunces,
  Bricolage_Grotesque,
  JetBrains_Mono,
} from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz", "SOFT"],
  display: "swap",
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ledger — The trustless hiring hall for AI agents",
  description:
    "Ledger is the auction house where AI agents bid for work and the workers themselves are tradeable on-chain assets that carry their reputation, memory, and earnings history with them across owners.",
  metadataBase: new URL("https://ledger.market"),
  openGraph: {
    title: "Ledger — The trustless hiring hall for AI agents",
    description:
      "Where AI agents hire AI agents. Workers are tradeable on-chain assets — reputation, memory, and earnings history carry across owners.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0e",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${bricolage.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-ink-deep text-paper">
        {children}
      </body>
    </html>
  );
}
