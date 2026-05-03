"use client";

import { useEffect, useState } from "react";
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
} from "@/lib/contracts";

export function JobsListClient({ jobs }: { jobs: Job[] }) {
  const router = useRouter();
  const [tick, setTick] = useState(0);
  const [inspectJobId, setInspectJobId] = useState<string | null>(null);
  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 1000);
    return () => window.clearInterval(id);
  }, []);
  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const inspectJob = jobs.find((j) => j.id === inspectJobId);

  return (
    <div className="page jobs-page-wrap">
      <div className="jobs-page-header">
        <h1>Live jobs.</h1>
        <span className="caps-md muted">{jobs.length} ACTIVE</span>
      </div>
      <div>
        {jobs.map((j) => {
          const t = Math.max(0, j.timeLeft - tick);
          return (
            <div
              key={j.id}
              onClick={() => router.push(`/jobs/${j.id}`)}
              className="jobs-row"
            >
              <div style={{ minWidth: 0 }}>
                <div className="job-title-display">{j.title}</div>
                <div
                  className="mono muted"
                  style={{ fontSize: 12, marginTop: 4 }}
                >
                  {j.id} · {j.employer}
                </div>
              </div>
              <div
                className="jobs-row-time"
                style={{
                  textAlign: "right",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                }}
              >
                <span
                  className="mono"
                  style={{
                    fontSize: 22,
                    fontWeight: 500,
                    color:
                      t < 30
                        ? "var(--ledger-gold-leaf)"
                        : "var(--ledger-oxblood)",
                  }}
                >
                  {fmt(t)}
                </span>
                <span
                  className="italic-num"
                  style={{ fontSize: 16, color: "var(--ledger-paper)" }}
                >
                  {j.payout}
                </span>
              </div>
              <div
                className="jobs-row-bids"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: 8,
                }}
              >
                <span className="caps-sm muted">[{j.bids} BIDS]</span>
                <InspectPill onClick={() => setInspectJobId(j.id)} />
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
  const galileoTx = (h: string) => `https://chainscan-galileo.0g.ai/tx/${h}`;
  const galileoAddr = (a: string) =>
    `https://chainscan-galileo.0g.ai/address/${a}`;
  return [
    {
      title: "AUCTION (AXL MESH)",
      rows: [
        { label: "Job ID", value: job.id, mono: true },
        { label: "Buyer", value: job.employer },
        {
          label: "AXL node source",
          value: "github.com/gensyn-ai/axl",
          href: "https://github.com/gensyn-ai/axl",
        },
        {
          label: "Live mesh /topology",
          value: "axl.fierypools.fun/topology",
          href: "https://axl.fierypools.fun/topology",
        },
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
          label: "Bootstrap (Fly · sjc)",
          value: "tls://66.51.123.38:9001 — kill-resilient",
          href: "https://fly.io/apps/ledger-axl-usw-180526",
          mono: true,
        },
      ],
    },
    {
      title: "ESCROW (BASE SEPOLIA / 0G GALILEO)",
      rows: [
        {
          label: "LedgerEscrow contract",
          value: LEDGER_ESCROW_ADDRESS,
          href: galileoAddr(LEDGER_ESCROW_ADDRESS),
          mono: true,
        },
        { label: "Payment", value: job.payout },
        { label: "Worker bond", value: job.bond },
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
