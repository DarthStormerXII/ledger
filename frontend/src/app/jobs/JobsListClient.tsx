"use client";

import { useEffect, useState, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import type { Job } from "@/lib/data";
import {
  InspectDrawer,
  InspectPill,
  type InspectGroup,
} from "@/components/InspectDrawer";
import {
  LEDGER_ESCROW_ADDRESS,
  DEMO_TASK_ID,
  DEMO_RELEASE_TX,
  galileoTx,
  galileoAddr,
} from "@/lib/contracts";

type DerivedStatus = "open" | "accepted" | "settled" | "cancelled" | "slashed";

function deriveStatus(title: string): DerivedStatus {
  if (title === "Bid accepted") return "accepted";
  if (title === "Task settled") return "settled";
  if (title === "Cancelled") return "cancelled";
  if (title === "Bond slashed") return "slashed";
  return "open";
}

const STATUS_LABEL: Record<DerivedStatus, string> = {
  open: "OPEN",
  accepted: "ACCEPTED",
  settled: "SETTLED",
  cancelled: "CANCELLED",
  slashed: "SLASHED",
};

export function JobsListClient({ jobs }: { jobs: Job[] }) {
  const router = useRouter();
  const [tick, setTick] = useState(0);
  const [inspectJobId, setInspectJobId] = useState<string | null>(null);
  const hasLive = jobs.some((j) => {
    const s = deriveStatus(j.title);
    return s === "open" || s === "accepted";
  });
  useEffect(() => {
    if (!hasLive) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 1000);
    return () => window.clearInterval(id);
  }, [hasLive]);

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const inspectJob = jobs.find((j) => j.id === inspectJobId);

  // Stable counts per status — drives the header band so judges see the live mix.
  const counts = jobs.reduce(
    (acc, j) => {
      const s = deriveStatus(j.title);
      acc[s] = (acc[s] ?? 0) + 1;
      return acc;
    },
    {} as Record<DerivedStatus, number>,
  );

  const stop = (e: MouseEvent) => e.stopPropagation();

  return (
    <div className="page jobs-page-wrap">
      <div className="jobs-page-header">
        <div>
          <h1>Live jobs.</h1>
          <p className="jobs-page-sub">
            Every row is an on-chain LedgerEscrow task on 0G Galileo. Click a
            card to enter the auction room, or inspect for the full receipt
            chain.
          </p>
        </div>
        <div className="jobs-page-counts">
          <span>
            <strong>{counts.open ?? 0}</strong> open
          </span>
          <span className="dot-sep">·</span>
          <span>
            <strong>{counts.accepted ?? 0}</strong> accepted
          </span>
          <span className="dot-sep">·</span>
          <span>
            <strong>{counts.settled ?? 0}</strong> settled
          </span>
          <a
            href={galileoAddr(LEDGER_ESCROW_ADDRESS)}
            target="_blank"
            rel="noreferrer noopener"
            className="caps-sm jobs-escrow-link"
            onClick={stop}
            title="Open LedgerEscrow on Galileo explorer"
          >
            ESCROW ↗
          </a>
        </div>
      </div>

      {jobs.length === 0 && (
        <div className="job-empty">
          <div className="caps-md muted" style={{ marginBottom: 8 }}>
            NO TASKS YET
          </div>
          <div style={{ color: "var(--ledger-ink-muted)", marginBottom: 16 }}>
            Live testnet — no escrow events yet. Be the first to post.
          </div>
          <button
            className="btn btn-italic"
            onClick={() => router.push("/post")}
          >
            Post a task →
          </button>
        </div>
      )}

      <div className="jobs-grid">
        {jobs.map((j) => {
          const status = deriveStatus(j.title);
          const isLive = status === "open" || status === "accepted";
          const t = isLive ? Math.max(0, j.timeLeft - tick) : 0;
          const expired = isLive && t === 0;
          const timerColor =
            t < 30 && t > 0
              ? "var(--ledger-gold-leaf)"
              : "var(--ledger-oxblood)";
          return (
            <div
              key={j.id}
              className={`job-card status-${status}`}
              onClick={() => router.push(`/jobs/${j.id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter") router.push(`/jobs/${j.id}`);
              }}
            >
              <div className="job-card-head">
                <span className={`job-status-pill status-${status}`}>
                  ● {STATUS_LABEL[status]}
                </span>
                {isLive ? (
                  <div className="job-card-timer">
                    <span
                      className="mono"
                      style={{
                        fontSize: 22,
                        fontWeight: 500,
                        color: expired ? "var(--ledger-ink-muted)" : timerColor,
                      }}
                    >
                      {expired ? "EXPIRED" : fmt(t)}
                    </span>
                    {!expired && (
                      <span
                        className="caps-sm muted"
                        style={{ fontSize: 10, marginLeft: 6 }}
                      >
                        LEFT
                      </span>
                    )}
                  </div>
                ) : (
                  <a
                    className="caps-sm job-card-receipt"
                    href={galileoAddr(LEDGER_ESCROW_ADDRESS)}
                    target="_blank"
                    rel="noreferrer noopener"
                    onClick={stop}
                  >
                    RECEIPT ↗
                  </a>
                )}
              </div>

              <div>
                <div className="job-card-title">{j.title}.</div>
                <div className="job-card-desc">{j.desc}</div>
              </div>

              <div className="job-card-band">
                <div className="job-card-stat">
                  <div className="caps-sm muted">PAYOUT</div>
                  <div className="italic-num job-card-stat-val">{j.payout}</div>
                </div>
                {j.bond !== "—" && (
                  <div className="job-card-stat">
                    <div className="caps-sm muted">
                      {status === "settled" ? "WINNING BID" : "BID"}
                    </div>
                    <div className="italic-num job-card-stat-val-sm">
                      {j.bond}
                    </div>
                  </div>
                )}
                <div className="job-card-stat">
                  <div className="caps-sm muted">BIDS</div>
                  <div className="italic-num job-card-stat-val-sm">
                    {j.bids}
                  </div>
                </div>
              </div>

              <div className="job-card-foot">
                <div className="job-card-buyer">
                  <span className="caps-sm muted">BUYER</span>
                  <a
                    href={galileoAddr(j.employer)}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="mono job-card-buyer-link"
                    onClick={stop}
                    title="Open buyer on Galileo explorer"
                  >
                    {j.employer}
                  </a>
                </div>
                <div className="job-card-actions">
                  <span onClick={stop}>
                    <InspectPill onClick={() => setInspectJobId(j.id)} />
                  </span>
                  <button
                    className="job-card-cta"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/jobs/${j.id}`);
                    }}
                  >
                    Open auction →
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <InspectDrawer
        open={inspectJob !== undefined}
        onClose={() => setInspectJobId(null)}
        title={inspectJob?.title ?? ""}
        subtitle={
          inspectJob
            ? `${inspectJob.id} · auction over Gensyn AXL · escrow on 0G Galileo`
            : undefined
        }
        groups={inspectJob ? buildJobInspectGroups(inspectJob) : []}
      />
    </div>
  );
}

function buildJobInspectGroups(job: Job): InspectGroup[] {
  return [
    {
      title: "AUCTION (AXL MESH)",
      rows: [
        { label: "Job ID", value: job.id, mono: true },
        { label: "Buyer", value: job.employer },
        {
          label: "Channel",
          value: "#ledger-jobs (gossipsub fork)",
          mono: true,
        },
        {
          label: "Message types",
          value: "TASK_POSTED → BID → BID_ACCEPTED → AUCTION_CLOSED → RESULT",
          mono: true,
        },
        {
          label: "Encryption",
          value: "Hop-by-hop TLS + end-to-end payload (two layers)",
        },
        {
          label: "Bootstrap",
          value: "tls://66.51.123.38:9001 (sjc) — kill-resilient",
          mono: true,
        },
      ],
    },
    {
      title: "ESCROW (0G GALILEO)",
      rows: [
        {
          label: "LedgerEscrow contract",
          value: LEDGER_ESCROW_ADDRESS,
          href: galileoAddr(LEDGER_ESCROW_ADDRESS),
          mono: true,
        },
        { label: "Payment", value: job.payout },
        { label: "Worker bid", value: job.bond },
        { label: "Time left", value: `${job.timeLeft}s · deadline-anchored` },
        {
          label: "taskId derivation",
          value: "keccak256(buyer ‖ nonce ‖ block.timestamp)",
          mono: true,
        },
        {
          label: "Settlement model",
          value:
            "Native 0G escrow settlement plus ERC-8004 feedback on Base Sepolia.",
        },
      ],
    },
    {
      title: "REPRESENTATIVE LIVE TASK",
      rows: [
        {
          label: "Demo taskId",
          value: DEMO_TASK_ID,
          mono: true,
        },
        {
          label: "Demo releasePayment tx",
          value: DEMO_RELEASE_TX,
          href: galileoTx(DEMO_RELEASE_TX),
          mono: true,
        },
        {
          label: "Note",
          value:
            "Auction posting, token-owned bid acceptance, and releasePayment are live on Galileo. The representative task attaches tokenId 1 and payoutRecipient resolves to the current iNFT owner.",
        },
      ],
    },
  ];
}
