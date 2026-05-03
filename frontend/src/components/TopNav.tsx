"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mark } from "./Mark";

const NAV_LINKS = [
  { href: "/", label: "Catalogue" },
  { href: "/jobs", label: "Live Lots" },
  { href: "/workers", label: "Workers" },
  { href: "/agent/worker-001.ledger.eth", label: "Provenance" },
];

const DEMO_CONNECTED_ADDR = "0x6641221B1cb66Dc9f890350058A7341eF0eD600b";
const DEMO_NATIVE_BAL = "7.0000";

export function TopNav() {
  const path = usePathname();
  const isActive = (href: string) =>
    href === "/" ? path === "/" : path === href || path.startsWith(href + "/");

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--ledger-ink-border)] bg-[rgba(10,10,14,0.85)] backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between gap-4 px-5 md:px-10">
        <Link
          href="/"
          aria-label="Ledger — home"
          className="group flex shrink-0 items-center gap-2 md:gap-3"
        >
          <span className="text-[color:var(--ledger-gold-leaf)]">
            <Mark size={20} />
          </span>
          <span
            className="ledger-display-roman text-[18px] uppercase text-[color:var(--ledger-gold-leaf)] tracking-[-0.02em] md:text-[20px]"
            style={{ fontStyle: "normal" }}
          >
            Ledger
          </span>
        </Link>

        <nav
          aria-label="Primary"
          className="hidden items-center gap-8 text-[14px] lg:flex"
        >
          {NAV_LINKS.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={[
                  "relative transition-colors duration-200",
                  active
                    ? "text-[color:var(--ledger-paper)]"
                    : "text-[color:var(--ledger-ink-muted)] hover:text-[color:var(--ledger-paper)]",
                ].join(" ")}
              >
                {link.label}
                {active && (
                  <span
                    aria-hidden
                    className="absolute -bottom-[19px] left-0 right-0 h-px bg-[color:var(--ledger-oxblood)]"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden items-center gap-2 border border-[var(--ledger-ink-border)] px-2.5 py-1.5 sm:flex">
            <span
              className="text-[10px] uppercase tracking-[0.14em] text-[color:var(--ledger-gold-dim)]"
              style={{ fontFamily: "var(--ledger-font-mono)" }}
            >
              0G
            </span>
            <span className="ledger-mono text-[12px] text-[color:var(--ledger-gold-leaf)]">
              {DEMO_NATIVE_BAL}
            </span>
          </div>
          <button
            type="button"
            className="ledger-mono flex items-center gap-2 border border-[color:var(--ledger-oxblood)] bg-transparent px-3 py-1.5 text-[11px] uppercase tracking-[0.12em] text-[color:var(--ledger-oxblood-bright)] transition-colors duration-200 hover:bg-[color:var(--ledger-oxblood)] hover:text-[color:var(--ledger-paper)] md:text-[12px]"
          >
            <span
              aria-hidden
              className="h-1.5 w-1.5 rounded-full bg-[color:var(--ledger-success)] ledger-pulse-dot"
            />
            {DEMO_CONNECTED_ADDR.slice(0, 6)}…{DEMO_CONNECTED_ADDR.slice(-4)}
          </button>
        </div>
      </div>
    </header>
  );
}
