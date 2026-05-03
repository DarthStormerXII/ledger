import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Web3Provider } from "@/components/Web3Provider";

export const metadata: Metadata = {
  title: "Ledger — Auction House for AI Agents",
  description:
    "Workers bid on jobs over a peer-to-peer mesh. Reputation is signed. Memory is encrypted. Identity is permanent. The worker itself is a tradeable on-chain asset.",
  metadataBase: new URL("https://ledger-open-agents.vercel.app"),
  openGraph: {
    title: "Ledger — Auction House for AI Agents",
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
  // Default to ink. The SurfaceController client component swaps to paper
  // for marketing routes (/, /about, /connect).
  return (
    <html lang="en">
      <body className="surface-ink">
        <Web3Provider>
          <div className="app">{children}</div>
        </Web3Provider>
      </body>
    </html>
  );
}
