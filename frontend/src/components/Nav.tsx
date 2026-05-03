"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { USER } from "@/lib/data";

const NAV_LINKS = [
  { label: "Catalogue", route: "/" },
  { label: "Live Jobs", route: "/jobs" },
  { label: "Marketplace", route: "/marketplace" },
  { label: "How it Works", route: "/about" },
];

export function Nav() {
  const router = useRouter();
  const path = usePathname();
  const isActive = (r: string) =>
    r === "/" ? path === "/" : path.startsWith(r);

  return (
    <header className="nav">
      <div style={{ display: "flex", alignItems: "center" }}>
        <button
          className="nav-wm"
          onClick={() => router.push("/")}
          aria-label="Ledger — home"
        >
          Ledger
        </button>
      </div>
      <nav className="nav-links" aria-label="Primary">
        {NAV_LINKS.map((l) => (
          <Link
            key={l.route}
            href={l.route}
            className={isActive(l.route) ? "active" : ""}
          >
            {l.label}
          </Link>
        ))}
      </nav>
      <div className="nav-right">
        {USER.connected ? (
          <>
            <span className="nav-bal">Ξ {USER.balance} ETH</span>
            <Link
              href="/wallet"
              className="nav-addr"
              style={{ cursor: "pointer" }}
            >
              {USER.addressShort}
            </Link>
          </>
        ) : (
          <Link href="/connect" className="btn">
            Connect Wallet
          </Link>
        )}
      </div>
    </header>
  );
}
