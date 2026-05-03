"use client";

import { useAxlFeed } from "@/lib/useAxlFeed";
import { fmtTimeOfDay } from "@/lib/format";

export function AxlLogFeed({ max = 8 }: { max?: number }) {
  const log = useAxlFeed(max);
  return (
    <ol
      className="flex flex-col gap-1.5 text-[11px] leading-tight"
      aria-label="AXL message log"
      aria-live="polite"
    >
      {log.map((entry) => (
        <li
          key={entry.ts}
          className="ledger-mono flex items-center gap-2 text-[color:var(--ledger-paper)] ledger-arrive"
          style={{ animationDuration: "200ms" }}
        >
          <span className="text-[color:var(--ledger-ink-muted)]">
            {fmtTimeOfDay(new Date(entry.ts))}
          </span>
          <span>
            {entry.from}{" "}
            <span className="text-[color:var(--ledger-ink-muted)]">→</span>{" "}
            {entry.to}
          </span>
          <span className="text-[color:var(--ledger-ink-muted)]">:</span>
          <span
            className={
              entry.type === "RESULT_SUBMITTED"
                ? "text-[color:var(--ledger-gold-leaf)]"
                : entry.type === "BID"
                  ? "text-[color:var(--ledger-oxblood-bright)]"
                  : "text-[color:var(--ledger-paper)]"
            }
          >
            {entry.type}
          </span>
        </li>
      ))}
    </ol>
  );
}
