"use client";

import type { PaymentTickerEntry } from "@/lib/types";
import { fmtUSDC, relativeTime } from "@/lib/format";
import { useNow } from "@/lib/useNow";

export function Ticker({ entries }: { entries: PaymentTickerEntry[] }) {
  const now = useNow(15000);
  // Duplicate the entries so the marquee loop is seamless.
  const doubled = [...entries, ...entries];
  return (
    <div
      className="relative h-8 overflow-hidden border-y border-[var(--ledger-ink-border)] bg-[color:var(--ledger-ink-warm)]"
      role="region"
      aria-label="Recent payments ticker"
    >
      <div className="ledger-ticker-track absolute left-0 top-0 flex h-full items-center">
        {doubled.map((entry, i) => (
          <div
            key={`${i}-${entry.toEns}`}
            className="flex items-center gap-2 pr-12 pl-1"
          >
            <span
              className="ledger-mono text-[12px] text-[color:var(--ledger-gold-leaf)]"
              style={{ fontFeatureSettings: "'tnum'" }}
            >
              {fmtUSDC(entry.amountUsdc)} USDC
            </span>
            <span className="text-[color:var(--ledger-ink-muted)]">→</span>
            <span
              className="ledger-display text-[12px] text-[color:var(--ledger-paper)]"
              style={{ fontStyle: "italic" }}
            >
              {entry.toEns}
            </span>
            <span className="ledger-mono text-[11px] text-[color:var(--ledger-ink-muted)]">
              · {relativeTime(entry.atUnix, now)}
            </span>
            <span className="text-[color:var(--ledger-ink-soft)]">·</span>
          </div>
        ))}
      </div>
    </div>
  );
}
