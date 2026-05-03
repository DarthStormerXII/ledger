"use client";

import { fmtRating, fmtUSDC } from "@/lib/format";
import type { BidEnvelope, Worker } from "@/lib/types";
import { WorkerPortrait } from "./WorkerPortrait";
import { DigitTicker } from "./DigitTicker";

export function WorkerBidCard({
  bid,
  worker,
  leading,
  losing,
}: {
  bid: BidEnvelope;
  worker?: Worker;
  leading: boolean;
  losing: boolean;
}) {
  return (
    <article
      className={[
        "relative flex w-[280px] flex-col items-center border bg-[color:var(--ledger-ink-elevated)] p-6 transition-opacity duration-200",
        leading
          ? "border-[color:var(--ledger-oxblood)]"
          : "border-[var(--ledger-ink-border)]",
        losing ? "opacity-70" : "opacity-100",
      ].join(" ")}
      aria-label={`Bid from ${bid.workerEns}`}
    >
      <WorkerPortrait
        size={96}
        seed={bid.workerTokenId}
        ringColor={leading ? "var(--ledger-oxblood-bright)" : undefined}
        ringPulse={leading}
      />
      <h3
        className="ledger-display mt-4 text-center text-[20px] text-[color:var(--ledger-paper)]"
        style={{ fontStyle: "italic" }}
      >
        {bid.workerEns}
      </h3>
      <p className="mt-1 text-[12px] text-[color:var(--ledger-ink-muted)]">
        {fmtRating(bid.reputation.avgRating)}★ · {bid.reputation.jobCount} jobs
      </p>
      <div className="mt-6 flex items-baseline gap-2">
        <DigitTicker
          value={fmtUSDC(bid.bidUsdc)}
          className="ledger-money text-[44px] leading-none text-[color:var(--ledger-gold-leaf)] tabular-nums"
        />
        <span className="ledger-mono text-[12px] uppercase tracking-[0.14em] text-[color:var(--ledger-ink-muted)]">
          USDC
        </span>
      </div>
      <p className="mt-3 text-[11px] uppercase tracking-[0.14em] text-[color:var(--ledger-ink-muted)]">
        ETA · {bid.estimatedSeconds}s
      </p>
      {/* heartbeat AXL line */}
      <div
        aria-hidden
        className="ledger-heartbeat absolute bottom-2 left-6 right-6 h-[2px]"
        style={{ background: "var(--ledger-oxblood-bright)" }}
      />
      {worker && (
        <span
          className="ledger-caps-sm absolute right-3 top-3 text-[color:var(--ledger-ink-muted)]"
          aria-hidden
        >
          LOT {worker.lot.toString().padStart(3, "0")}
        </span>
      )}
    </article>
  );
}
