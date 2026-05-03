import Link from "next/link";
import { fmtRank, fmtRating, fmtUSDC } from "@/lib/format";
import type { Worker } from "@/lib/types";
import { WorkerPortrait } from "./WorkerPortrait";

export function WorkerLeaderboardRow({
  worker,
  rank,
  highlight = false,
}: {
  worker: Worker;
  rank: number;
  highlight?: boolean;
}) {
  return (
    <Link
      href={`/workers/${worker.tokenId}`}
      className={[
        "group relative flex h-14 items-center gap-3 border-b border-[var(--ledger-ink-border)] px-3 transition-colors duration-200",
        highlight
          ? "bg-[color:var(--ledger-ink-elevated)]"
          : rank % 2 === 0
            ? "bg-[color:var(--ledger-ink-warm)]"
            : "bg-transparent",
        "hover:bg-[color:var(--ledger-ink-elevated)]",
      ].join(" ")}
    >
      <span className="ledger-mono w-6 text-[12px] text-[color:var(--ledger-ink-muted)]">
        {fmtRank(rank)}
      </span>
      <WorkerPortrait size={36} seed={worker.tokenId} />
      <div className="flex min-w-0 flex-col">
        <span
          className="ledger-display truncate text-[16px] text-[color:var(--ledger-paper)]"
          style={{ fontStyle: "italic" }}
        >
          {worker.ensName}
        </span>
        <span className="text-[12px] text-[color:var(--ledger-ink-muted)]">
          {fmtRating(worker.avgRating)}★ · {worker.jobsCompleted} jobs
        </span>
      </div>
      <div className="ml-auto flex flex-col items-end">
        <span className="ledger-mono text-[14px] text-[color:var(--ledger-gold-leaf)]">
          {fmtUSDC(worker.totalEarningsUsdc)} USDC
        </span>
        <span className="text-[10px] uppercase tracking-[0.14em] text-[color:var(--ledger-ink-muted)]">
          earned
        </span>
      </div>
    </Link>
  );
}
