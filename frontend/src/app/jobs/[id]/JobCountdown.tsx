"use client";

import { useCountdown } from "@/lib/useCountdown";
import { fmtCountdown } from "@/lib/format";

export function JobCountdown({ closesAtSec }: { closesAtSec: number }) {
  const remaining = useCountdown(closesAtSec);
  const closing = remaining < 30;
  return (
    <div className="flex flex-col items-end">
      <span className="ledger-caps-md text-[color:var(--ledger-ink-muted)]">
        CLOSES IN
      </span>
      <span
        className={[
          "ledger-mono text-[40px] font-bold leading-none tabular-nums",
          closing
            ? "text-[color:var(--ledger-warning)]"
            : "text-[color:var(--ledger-paper)]",
        ].join(" ")}
      >
        {fmtCountdown(remaining)}
      </span>
    </div>
  );
}
