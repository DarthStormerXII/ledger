"use client";

import { type ReactNode, useState } from "react";
import type { Lot, RecentJob, ProvenanceEvent } from "@/lib/data";
import {
  SettlementStrip,
  type SettlementProof,
} from "@/components/SettlementStrip";
import { CapabilityRow } from "@/components/CapabilityRow";
import { ReputationChart } from "@/components/ReputationChart";
import { InheritanceModal } from "@/components/InheritanceModal";
import { useLiveOwner, shortAddr } from "@/components/useLiveOwner";
import { DEMO_PAY_NONCE_0, DEMO_PAY_NONCE_1 } from "@/lib/contracts";

export function WorkerProfileClient({
  lot,
  liveProof,
  recentJobs,
  provenance,
  settlementProof,
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
}) {
  const [open, setOpen] = useState(false);

  const { owner: liveOwner, live } = useLiveOwner(liveProof.tokenId, undefined);
  const whoValue = liveOwner
    ? `${shortAddr(liveOwner)}${live ? "  · live" : ""}`
    : shortAddr(liveProof.owner);
  const memoryValue = shortValue(liveProof.memoryCID);
  const payValue =
    liveProof.tokenId === 1
      ? `${shortAddr(DEMO_PAY_NONCE_0)} → ${shortAddr(DEMO_PAY_NONCE_1)}`
      : "not configured";

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
          {lot.listed && (
            <>
              <div className="caps-md muted" style={{ marginBottom: 6 }}>
                LISTED FOR SALE
              </div>
              <div
                className="italic-num text-oxblood"
                style={{ fontSize: 32, marginBottom: 18 }}
              >
                {lot.askPrice} 0G
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
              sub="WorkerINFT.getMetadata().memoryCID"
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
        <ReputationChart />
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
            {recentJobs.map((r, i) => (
              <tr key={i}>
                <td className="mono" style={{ color: "rgba(245,241,232,0.7)" }}>
                  {r.date}
                </td>
                <td className="mono">{r.employer}</td>
                <td>
                  {r.title ? (
                    r.title
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
            ))}
          </tbody>
        </table>
      </div>

      {/* PROVENANCE */}
      <div style={{ padding: "32px 0 16px" }}>
        <div className="caps-md muted" style={{ marginBottom: 18 }}>
          PROVENANCE
        </div>
        {provenance.map((p, i) => (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "140px 200px 1fr 160px",
              alignItems: "center",
              padding: "14px 0",
              borderBottom: "1px solid rgba(245,241,232,0.08)",
            }}
          >
            <span className="caps-sm muted">{p.date}</span>
            <span className="mono" style={{ color: "var(--ledger-paper)" }}>
              {p.to || "—"}
            </span>
            <span
              className="italic-num"
              style={{ fontSize: 18, color: "var(--ledger-paper)" }}
            >
              {p.price ? `${p.price} 0G` : "—"}
            </span>
            <span
              className="caps-sm"
              style={{ color: "var(--ledger-oxblood)" }}
            >
              {p.label}
            </span>
          </div>
        ))}
      </div>

      {open && <InheritanceModal lot={lot} onClose={() => setOpen(false)} />}
    </div>
  );
}

function shortValue(value: string) {
  if (value.length <= 22) return value;
  return `${value.slice(0, 10)}…${value.slice(-8)}`;
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
