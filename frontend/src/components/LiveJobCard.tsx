"use client";

import Link from "next/link";
import { useCountdown } from "@/lib/useCountdown";
import { fmtCountdown } from "@/lib/format";
import { Copyable } from "./Copyable";
import { fmtLot } from "@/lib/format";
import type { JobSpec } from "@/lib/types";
import { truncAddr } from "@/lib/format";

export function LiveJobCard({
  job,
  pulse = false,
}: {
  job: JobSpec;
  pulse?: boolean;
}) {
  const remaining = useCountdown(job.closesAtSec);
  const closing = remaining < 30 && remaining > 0;

  return (
    <Link
      href={`/jobs/${job.lot}`}
      className={[
        "group relative flex h-20 items-center gap-6 border bg-[color:var(--ledger-ink-elevated)] px-5 transition-colors duration-200",
        pulse
          ? "border-[color:var(--ledger-oxblood)] ledger-pulse-border"
          : "border-[var(--ledger-ink-border)] hover:border-[var(--ledger-ink-border-strong)]",
      ].join(" ")}
    >
      <div className="flex flex-col">
        <span className="ledger-caps-md text-[color:var(--ledger-ink-muted)]">
          {fmtLot(job.lot)}
        </span>
        <span
          className="ledger-display text-[20px] text-[color:var(--ledger-paper)]"
          style={{ fontStyle: "italic" }}
        >
          {job.title}
        </span>
      </div>
      <div className="hidden flex-col text-[12px] text-[color:var(--ledger-ink-muted)] sm:flex">
        <Copyable
          value={job.employer}
          display={truncAddr(job.employer)}
          className="ledger-mono"
        />
        <span className="ledger-mono">{job.outputSchema ?? "—"}</span>
      </div>
      <div className="ml-auto flex flex-col items-end">
        <span
          className={[
            "ledger-mono text-[24px] tabular-nums",
            closing
              ? "text-[color:var(--ledger-warning)]"
              : "text-[color:var(--ledger-paper)]",
          ].join(" ")}
        >
          {fmtCountdown(remaining)}
        </span>
        <span className="text-[12px] text-[color:var(--ledger-ink-muted)]">
          {job.bids.length} bid{job.bids.length === 1 ? "" : "s"}
        </span>
      </div>
      <span
        aria-hidden
        className="absolute right-0 top-0 h-full w-1 bg-transparent transition-colors duration-200 group-hover:bg-[color:var(--ledger-oxblood)]"
      />
    </Link>
  );
}
