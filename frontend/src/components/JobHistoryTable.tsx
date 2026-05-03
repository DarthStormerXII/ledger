import { fmtRating, fmtUSDC, truncAddr } from "@/lib/format";
import type { JobHistoryEntry } from "@/lib/types";

function fmtDate(unix: number) {
  return new Date(unix * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function StarRow({ rating }: { rating: number }) {
  const filled = Math.round(rating);
  return (
    <span className="inline-flex gap-0.5" aria-label={`${rating}/5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          aria-hidden
          className="text-[10px]"
          style={{
            color:
              i < filled
                ? "var(--ledger-oxblood-bright)"
                : "var(--ledger-ink-muted)",
          }}
        >
          ★
        </span>
      ))}
      <span className="ledger-mono ml-1.5 text-[11px] text-[color:var(--ledger-ink-muted)]">
        {fmtRating(rating)}
      </span>
    </span>
  );
}

export function JobHistoryTable({ rows }: { rows: JobHistoryEntry[] }) {
  return (
    <div className="border border-[var(--ledger-ink-border)]">
      <header className="grid grid-cols-12 gap-3 border-b border-[var(--ledger-ink-border)] bg-[color:var(--ledger-ink-warm)] px-4 py-2 text-[11px] uppercase tracking-[0.14em] text-[color:var(--ledger-ink-muted)]">
        <span className="col-span-2">Date</span>
        <span className="col-span-2">Employer</span>
        <span className="col-span-5">Task</span>
        <span className="col-span-1 text-right">Payment</span>
        <span className="col-span-2 text-right">Rating</span>
      </header>
      <ol className="flex flex-col">
        {rows.map((r, i) => (
          <li
            key={`${r.date}-${i}`}
            className={[
              "grid grid-cols-12 items-center gap-3 border-b border-[var(--ledger-ink-border)] px-4 py-3 text-[13px]",
              i % 2 === 0
                ? "bg-transparent"
                : "bg-[color:var(--ledger-ink-warm)]",
            ].join(" ")}
          >
            <span className="ledger-mono col-span-2 text-[12px] text-[color:var(--ledger-ink-muted)]">
              {fmtDate(r.date)}
            </span>
            <span className="ledger-mono col-span-2 text-[12px] text-[color:var(--ledger-paper)]">
              {truncAddr(r.employer)}
            </span>
            <span className="col-span-5 truncate text-[color:var(--ledger-paper)]">
              {r.task}
            </span>
            <span className="ledger-mono col-span-1 text-right text-[color:var(--ledger-gold-leaf)] tabular-nums">
              {fmtUSDC(r.paymentUsdc)}
            </span>
            <span className="col-span-2 text-right">
              <StarRow rating={r.rating} />
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
