import Link from "next/link";
import type { OwnershipEntry, Worker } from "@/lib/types";
import { fmtUSDC, truncAddr } from "@/lib/format";
import { Copyable } from "./Copyable";

export function OwnershipCard({
  worker,
  ownedBy,
}: {
  worker: Worker;
  ownedBy: boolean;
}) {
  return (
    <div className="border border-[var(--ledger-ink-border)] bg-[color:var(--ledger-ink-elevated)] p-5">
      <h3 className="ledger-caps-md mb-4 text-[color:var(--ledger-paper)]">
        OWNERSHIP
      </h3>
      {ownedBy ? (
        <Link
          href={`/transfer/${worker.tokenId}`}
          className="ledger-mono flex h-11 w-full items-center justify-center gap-2 border border-[color:var(--ledger-oxblood)] bg-[color:var(--ledger-oxblood)] text-[12px] uppercase tracking-[0.14em] text-[color:var(--ledger-paper)] transition-colors duration-200 hover:bg-[color:var(--ledger-oxblood-dim)]"
        >
          List for sale →
        </Link>
      ) : (
        <button
          type="button"
          className="ledger-mono flex h-11 w-full items-center justify-center gap-2 border border-[var(--ledger-ink-border-strong)] bg-transparent text-[12px] uppercase tracking-[0.14em] text-[color:var(--ledger-paper)] transition-colors duration-200 hover:border-[color:var(--ledger-oxblood)]"
        >
          Make offer
        </button>
      )}
      <div className="ledger-mono mt-4 flex items-center justify-between text-[12px] text-[color:var(--ledger-ink-muted)]">
        <span>Last sold</span>
        <span className="text-[color:var(--ledger-gold-dim)]">
          {worker.lastSoldUsdc != null
            ? `${fmtUSDC(worker.lastSoldUsdc)} USDC`
            : "—"}
        </span>
      </div>
      <div className="ledger-mono mt-2 flex items-center justify-between text-[12px] text-[color:var(--ledger-ink-muted)]">
        <span>Owner</span>
        <Copyable
          value={worker.owner}
          display={truncAddr(worker.owner)}
          className="text-[color:var(--ledger-paper)]"
        />
      </div>
    </div>
  );
}

export function OwnershipHistoryCard({ rows }: { rows: OwnershipEntry[] }) {
  return (
    <div className="border border-[var(--ledger-ink-border)] bg-[color:var(--ledger-ink-elevated)] p-5">
      <h3 className="ledger-caps-md mb-4 text-[color:var(--ledger-paper)]">
        PROVENANCE
      </h3>
      <ol className="flex flex-col gap-2">
        {rows.map((r, i) => (
          <li
            key={`${r.owner}-${i}`}
            className="flex items-center justify-between gap-2 text-[12px]"
          >
            <span
              className={[
                "ledger-mono flex items-center gap-2",
                r.current
                  ? "text-[color:var(--ledger-paper)]"
                  : "text-[color:var(--ledger-ink-muted)]",
              ].join(" ")}
            >
              <span
                aria-hidden
                className="inline-block h-1.5 w-1.5"
                style={{
                  background: r.current
                    ? "var(--ledger-oxblood-bright)"
                    : "var(--ledger-ink-soft)",
                }}
              />
              {truncAddr(r.owner)}
            </span>
            <span className="ledger-mono text-[11px] text-[color:var(--ledger-ink-muted)]">
              {r.daysHeld}d held
            </span>
            <span className="ledger-mono text-[11px] text-[color:var(--ledger-gold-dim)] tabular-nums">
              {r.salePriceUsdc > 0 ? `${fmtUSDC(r.salePriceUsdc)} USDC` : "—"}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
