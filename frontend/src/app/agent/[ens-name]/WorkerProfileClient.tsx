"use client";

import { type ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Lot, RecentJob, ProvenanceEvent } from "@/lib/data";
import {
  SettlementStrip,
  type SettlementProof,
} from "@/components/SettlementStrip";
import { CapabilityRow } from "@/components/CapabilityRow";
import { ReputationChart, type RepPoint } from "@/components/ReputationChart";
import { InheritanceModal } from "@/components/InheritanceModal";
import { useLiveOwner, shortAddr } from "@/components/useLiveOwner";
import { DEMO_PAY_NONCE_0, DEMO_PAY_NONCE_1, galileoTx } from "@/lib/contracts";

type BriefMap = Map<string, { title: string; category: string }>;

export function WorkerProfileClient({
  lot,
  liveProof,
  recentJobs,
  provenance,
  settlementProof,
  repHistory,
}: {
  lot: Lot;
  liveProof: {
    tokenId: number;
    memoryCID: string;
    agentId: string;
    owner: string;
  };
  recentJobs: RecentJob[];
  provenance: ProvenanceEvent[];
  settlementProof?: SettlementProof;
  repHistory: RepPoint[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // Live marketplace listing for this worker — drives the "Buy now" CTA so
  // it disappears the moment the iNFT is bought (instead of trusting the
  // stale manifest flag).
  const [liveListing, setLiveListing] = useState<{
    seller: string;
    askPriceFormatted: string;
    active: boolean;
  } | null>(null);
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const { LEDGER_MARKETPLACE_ADDRESS, LEDGER_MARKETPLACE_ABI } =
          await import("@/lib/contracts");
        const { galileoClient } = await import("@/lib/clients");
        const { formatEther } = await import("viem");
        const r = (await galileoClient.readContract({
          address: LEDGER_MARKETPLACE_ADDRESS,
          abi: LEDGER_MARKETPLACE_ABI,
          functionName: "getListing",
          args: [BigInt(liveProof.tokenId)],
        })) as readonly [`0x${string}`, bigint, bigint, boolean];
        if (cancelled) return;
        setLiveListing({
          seller: r[0],
          askPriceFormatted: formatEther(r[1]),
          active: r[3],
        });
      } catch {
        /* best-effort */
      }
    };
    load();
    const id = window.setInterval(load, 6000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [liveProof.tokenId]);

  // Fetch briefs once on mount + every 8s. Used to enrich recent-jobs rows
  // with the actual pinned title in place of "(no title pinned)".
  const [briefs, setBriefs] = useState<BriefMap>(new Map());
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const r = await fetch("/api/jobs/brief", { cache: "no-store" });
        if (!r.ok) return;
        const body = (await r.json()) as {
          briefs?: Array<{
            taskId: string;
            brief: { title?: string; category?: string };
          }>;
        };
        if (cancelled || !body.briefs) return;
        const next: BriefMap = new Map();
        for (const b of body.briefs) {
          next.set(b.taskId.toLowerCase(), {
            title: b.brief?.title ?? "",
            category: b.brief?.category ?? "other",
          });
        }
        setBriefs(next);
      } catch {
        /* best-effort */
      }
    };
    load();
    const id = window.setInterval(load, 8000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  const { owner: liveOwner, live } = useLiveOwner(liveProof.tokenId, undefined);
  const whoValue = liveOwner
    ? `${shortAddr(liveOwner)}${live ? "  · live" : ""}`
    : shortAddr(liveProof.owner);
  // Detect sentinel CIDs (all-f / all-0 / mass-mint placeholders like
  // 0xff…ff1) so we don't pretend an unpinned mint has real memory.
  const memoryHasContent = !isSentinelCid(liveProof.memoryCID);
  const memoryValue = memoryHasContent
    ? shortValue(liveProof.memoryCID)
    : "(no memory pinned yet)";
  // Pay namespace works for EVERY worker now — the resolver derives at
  // path `<tokenId>/<nonce>` so each worker has its own rotating sequence.
  // Demo-pinned snapshots live for tokenId 1; others get the resolver
  // description.
  const payValue =
    liveProof.tokenId === 1
      ? `${shortAddr(DEMO_PAY_NONCE_0)} → ${shortAddr(DEMO_PAY_NONCE_1)}`
      : "live HD-derived (rotating)";

  return (
    <div className="page worker-profile-page">
      <SettlementStrip proof={settlementProof} />

      {/* HEADER BAND */}
      <div className="worker-profile-hero">
        <div className="caps-md muted" style={{ marginBottom: 16 }}>
          LOT {lot.lot} — listed {lot.daysActive} days ago
        </div>
        <h1 className="worker-profile-title">{lot.ens}</h1>
        <div
          className="caps-md"
          style={{
            letterSpacing: "0.08em",
            color: "rgba(245,241,232,0.55)",
            marginBottom: 24,
          }}
        >
          {lot.jobs} JOBS · {lot.rating} ★ · {lot.earned} 0G REALIZED
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <span className="pill pill-paper">ERC-7857 · 0G iNFT DRAFT</span>
          <span className="pill pill-gold">0G GALILEO · 16602</span>
          <span className="pill pill-success">
            <span className="dot live-dot success"></span>ACTIVE
          </span>
        </div>
      </div>

      {/* TWO-COL BODY */}
      <div className="worker-profile-body">
        {/* LEFT */}
        <div className="worker-profile-media">
          <div
            style={{
              width: 240,
              height: 240,
              border: "1px solid rgba(245,241,232,0.16)",
              background: "var(--ledger-paper)",
              padding: 18,
              marginBottom: 24,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lot.avatar}
              alt=""
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
          </div>
          <div className="caps-md muted" style={{ marginBottom: 6 }}>
            OWNER
          </div>
          <div
            className="mono"
            style={{
              fontSize: 14,
              color: "var(--ledger-paper)",
              marginBottom: 24,
              wordBreak: "break-all",
              cursor: "pointer",
            }}
            onClick={() => navigator.clipboard?.writeText(lot.owner)}
            title="Click to copy"
          >
            {liveOwner ?? liveProof.owner}
          </div>
          {liveListing?.active && (
            <>
              <div className="caps-md muted" style={{ marginBottom: 6 }}>
                LISTED FOR SALE · ON-CHAIN
              </div>
              <div
                className="italic-num text-oxblood"
                style={{ fontSize: 32, marginBottom: 18 }}
              >
                {liveListing.askPriceFormatted} 0G
              </div>
              <button
                className="btn btn-tall btn-italic"
                onClick={() => setOpen(true)}
              >
                Buy now
              </button>
            </>
          )}
        </div>

        {/* RIGHT — Capability Tree */}
        <div className="worker-profile-capabilities">
          <div className="caps-md muted" style={{ marginBottom: 18 }}>
            CAPABILITY TREE
          </div>
          <div>
            <CapabilityRow
              rowKey="who"
              ensName={lot.ens}
              label="WHO.*"
              value={whoValue}
              valueRaw={liveOwner ?? liveProof.owner}
              sub="CCIP-Read resolves live ownerOf(tokenId)"
            />
            <CapabilityRow
              rowKey="pay"
              ensName={lot.ens}
              label="PAY.*"
              value={payValue}
              sub={
                liveProof.tokenId === 1
                  ? "HD-derived receive address rotates by nonce"
                  : "no live pay resolver record"
              }
            />
            <CapabilityRow
              rowKey="tx"
              ensName={lot.ens}
              label="TX.*"
              value={
                recentJobs.length
                  ? "escrow task history"
                  : "no task receipt selected"
              }
              sub={
                recentJobs.length
                  ? "from live LedgerEscrow task reads"
                  : undefined
              }
            />
            <CapabilityRow
              rowKey="rep"
              ensName={lot.ens}
              label="REP.*"
              value={`${lot.jobs} ERC-8004 RECORDS`}
              sub={`agent ${liveProof.agentId}`}
            />
            <CapabilityRow
              rowKey="mem"
              ensName={lot.ens}
              label="MEM.*"
              value={memoryValue}
              valueRaw={memoryHasContent ? liveProof.memoryCID : undefined}
              sub={
                memoryHasContent
                  ? "WorkerINFT.getMetadata().memoryCID"
                  : "WorkerINFT.getMetadata() returns the empty sentinel for this token"
              }
            />
          </div>

          <div
            style={{
              marginTop: 24,
              padding: "14px 16px",
              border: "1px solid rgba(245,241,232,0.16)",
              width: 320,
            }}
          >
            <div className="caps-sm muted" style={{ marginBottom: 6 }}>
              0G COMPUTE — TEE SHIM DISCLOSED
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                className="mono"
                style={{ fontSize: 11, color: "var(--ledger-paper)" }}
              >
                MockTEEOracle
              </span>
              <span className="caps-sm" style={{ color: "var(--ledger-gold)" }}>
                DISCLOSED
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* STATS GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          padding: "40px 0",
          borderBottom: "1px solid rgba(245,241,232,0.16)",
        }}
      >
        <StatCell label="JOBS COMPLETED" value={lot.jobs} />
        <StatCell
          label="AVG RATING"
          value={
            <span>
              {lot.rating} <span className="text-oxblood">★</span>
            </span>
          }
        />
        <StatCell label="TOTAL REALIZED" value={lot.earned} unit="0G" />
        <StatCell label="DAYS ACTIVE" value={lot.daysActive} />
      </div>

      {/* REPUTATION CHART */}
      <div
        style={{
          padding: "32px 0",
          borderBottom: "1px solid rgba(245,241,232,0.16)",
        }}
      >
        <div className="caps-md muted" style={{ marginBottom: 18 }}>
          REPUTATION HISTORY
        </div>
        <ReputationChart points={repHistory} />
      </div>

      {/* RECENT JOBS */}
      <div
        style={{
          padding: "32px 0",
          borderBottom: "1px solid rgba(245,241,232,0.16)",
        }}
      >
        <div className="caps-md muted" style={{ marginBottom: 18 }}>
          RECENT JOBS — LAST 10
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th>Date</th>
              <th>Employer</th>
              <th>Title</th>
              <th className="num">Realized</th>
              <th className="num">Rating</th>
            </tr>
          </thead>
          <tbody>
            {recentJobs.map((r, i) => {
              const briefTitle = r.taskId
                ? briefs.get(r.taskId.toLowerCase())?.title
                : undefined;
              const displayTitle =
                briefTitle && briefTitle.length > 0 ? briefTitle : r.title;
              const clickable = !!r.taskId;
              return (
                <tr
                  key={i}
                  className={clickable ? "tbl-row-link" : undefined}
                  onClick={
                    clickable
                      ? () => router.push(`/jobs/${r.taskId!}`)
                      : undefined
                  }
                  tabIndex={clickable ? 0 : -1}
                  onKeyDown={
                    clickable
                      ? (e) => {
                          if (e.key === "Enter")
                            router.push(`/jobs/${r.taskId!}`);
                        }
                      : undefined
                  }
                  style={clickable ? { cursor: "pointer" } : undefined}
                >
                  <td
                    className="mono"
                    style={{ color: "rgba(245,241,232,0.7)" }}
                  >
                    {r.date}
                  </td>
                  <td className="mono">{r.employer}</td>
                  <td>
                    {displayTitle ? (
                      displayTitle
                    ) : (
                      <span
                        className="italic"
                        style={{ color: "rgba(245,241,232,0.5)" }}
                      >
                        (no title pinned)
                      </span>
                    )}
                  </td>
                  <td className="num">
                    <span className="italic-num">{r.realized}</span>{" "}
                    <span className="caps-sm muted">0G</span>
                  </td>
                  <td className="num">
                    <span className="italic-num">{r.rating}</span>{" "}
                    <span className="text-oxblood">★</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* PROVENANCE */}
      <div style={{ padding: "32px 0 16px" }}>
        <div
          className="caps-md muted"
          style={{
            marginBottom: 18,
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
          }}
        >
          <span>PROVENANCE</span>
          <span
            className="mono"
            style={{
              fontSize: 11,
              color: "rgba(245,241,232,0.45)",
              letterSpacing: "0.04em",
            }}
          >
            {provenance.length} {provenance.length === 1 ? "EVENT" : "EVENTS"}{" "}
            ON GALILEO
          </span>
        </div>
        {provenance.length === 0 ? (
          <div
            className="italic"
            style={{
              padding: "20px 0",
              color: "rgba(245,241,232,0.5)",
            }}
          >
            (no on-chain events found for this lot)
          </div>
        ) : (
          provenance.map((p, i) => (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "180px 140px 200px 1fr 130px 90px",
                alignItems: "center",
                gap: 12,
                padding: "14px 0",
                borderBottom: "1px solid rgba(245,241,232,0.08)",
              }}
            >
              <span
                className="caps-sm muted"
                style={{ letterSpacing: "0.06em" }}
              >
                {p.date}
              </span>
              <span
                className="caps-sm"
                style={{ color: "var(--ledger-gold-leaf)" }}
              >
                {p.action.toUpperCase()}
              </span>
              <span className="mono" style={{ color: "var(--ledger-paper)" }}>
                {p.to || "—"}
              </span>
              <span
                className="italic"
                style={{
                  color: "rgba(245,241,232,0.6)",
                  fontSize: 13,
                }}
              >
                {p.label}
              </span>
              <span
                className="italic-num"
                style={{ fontSize: 16, color: "var(--ledger-paper)" }}
              >
                {p.price ? `${p.price} 0G` : "—"}
              </span>
              {p.txHash ? (
                <a
                  href={galileoTx(p.txHash)}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="mono"
                  style={{
                    fontSize: 11,
                    color: "var(--ledger-oxblood)",
                    borderBottom: "1px dotted rgba(156,42,42,0.5)",
                    justifySelf: "end",
                  }}
                >
                  {p.txHash.slice(0, 6)}…{p.txHash.slice(-4)} ↗
                </a>
              ) : (
                <span style={{ color: "rgba(245,241,232,0.3)" }}>—</span>
              )}
            </div>
          ))
        )}
      </div>

      {open && <InheritanceModal lot={lot} onClose={() => setOpen(false)} />}
    </div>
  );
}

function shortValue(value: string) {
  if (value.length <= 22) return value;
  return `${value.slice(0, 10)}…${value.slice(-8)}`;
}

// Mirrors the resolver-side detector. Treats all-f / all-0 / mass-mint
// placeholder CIDs (long run of one char then a tokenId terminator) as
// "no real CID" so the UI doesn't link to garbage on the storage explorer.
function isSentinelCid(cid: string | undefined | null): boolean {
  if (!cid) return true;
  const hex = cid
    .replace(/^0g:\/\//, "")
    .split("?")[0]
    .toLowerCase();
  if (!/^0x/.test(hex)) return false;
  const body = hex.slice(2);
  if (/^f+$/u.test(body) || /^0+$/u.test(body)) return true;
  if (body.length >= 32) {
    const first = body[0];
    let runLen = 0;
    while (runLen < body.length && body[runLen] === first) runLen++;
    if (runLen >= body.length - 4) return true;
  }
  return false;
}

function StatCell({
  label,
  value,
  unit,
}: {
  label: string;
  value: ReactNode;
  unit?: string;
}) {
  return (
    <div className="divcol" style={{ padding: "0 24px" }}>
      <div className="caps-md muted" style={{ marginBottom: 14 }}>
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span
          className="italic-num italic-num-black"
          style={{ fontSize: 64, color: "var(--ledger-paper)" }}
        >
          {value}
        </span>
        {unit && <span className="caps-sm muted">{unit}</span>}
      </div>
    </div>
  );
}
