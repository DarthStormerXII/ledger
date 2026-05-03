"use client";

import { type ReactNode, useState } from "react";
import type { Lot, RecentJob, ProvenanceEvent } from "@/lib/data";
import { SettlementStrip } from "@/components/SettlementStrip";
import { CapabilityRow } from "@/components/CapabilityRow";
import { ReputationChart } from "@/components/ReputationChart";
import { InheritanceModal } from "@/components/InheritanceModal";
import { useLiveOwner, shortAddr } from "@/components/useLiveOwner";

export function WorkerProfileClient({
  lot,
  recentJobs,
  provenance,
}: {
  lot: Lot;
  recentJobs: RecentJob[];
  provenance: ProvenanceEvent[];
}) {
  const [open, setOpen] = useState(false);

  // Live ownerOf() for Lot 047 — anchors the WHO row to chain truth.
  // Other lots fall back to the seeded ownerShort.
  const isAnchored = lot.lot === "047";
  const { owner: liveOwner, live } = useLiveOwner(1, undefined);
  const whoValue =
    isAnchored && liveOwner
      ? `${shortAddr(liveOwner)}${live ? "  · live" : ""}`
      : lot.ownerShort;

  return (
    <div className="page" style={{ padding: 40 }}>
      <SettlementStrip />

      {/* HEADER BAND */}
      <div
        style={{
          minHeight: 360,
          paddingBottom: 40,
          borderBottom: "1px solid rgba(245,241,232,0.16)",
        }}
      >
        <div className="caps-md muted" style={{ marginBottom: 16 }}>
          LOT {lot.lot} — listed {lot.daysActive} days ago
        </div>
        <h1
          style={{
            fontFamily: "var(--ledger-font-display)",
            fontStyle: "italic",
            fontWeight: 900,
            fontSize: 96,
            lineHeight: 0.95,
            letterSpacing: "-0.03em",
            margin: "0 0 18px",
            color: "var(--ledger-paper)",
            wordBreak: "break-word",
          }}
        >
          {lot.ens}
        </h1>
        <div
          className="caps-md"
          style={{
            letterSpacing: "0.08em",
            color: "rgba(245,241,232,0.55)",
            marginBottom: 24,
          }}
        >
          {lot.jobs} JOBS · {lot.rating} ★ · {lot.earned} USDC REALIZED
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
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "60% 40%",
          gap: 24,
          padding: "40px 0",
          borderBottom: "1px solid rgba(245,241,232,0.16)",
        }}
      >
        {/* LEFT */}
        <div style={{ paddingRight: 24 }}>
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
            {lot.owner}
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
                {lot.askPrice} USDC
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
        <div
          style={{
            borderLeft: "1px solid rgba(245,241,232,0.16)",
            paddingLeft: 24,
          }}
        >
          <div className="caps-md muted" style={{ marginBottom: 18 }}>
            CAPABILITY TREE
          </div>
          <div>
            <CapabilityRow
              rowKey="who"
              ensName={lot.ens}
              label="WHO.*"
              value={whoValue}
            />
            <CapabilityRow
              rowKey="pay"
              ensName={lot.ens}
              label="PAY.*"
              value="0x9c2e…f471 @0"
              sub="+ 0x33ad…b0e2 @1"
            />
            <CapabilityRow
              rowKey="tx"
              ensName={lot.ens}
              label="TX.*"
              value="bafyb…7e3p"
            />
            <CapabilityRow
              rowKey="rep"
              ensName={lot.ens}
              label="REP.*"
              value={`${lot.jobs} SIGNED RECORDS`}
            />
            <CapabilityRow
              rowKey="mem"
              ensName={lot.ens}
              label="MEM.*"
              value="bafkr…81rt"
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
              0G COMPUTE — TEE ATTESTATION
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
                0x9a4f…ec21
              </span>
              <span
                className="caps-sm"
                style={{ color: "var(--ledger-success)" }}
              >
                [✓] VERIFIED
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
        <StatCell label="TOTAL REALIZED" value={lot.earned} unit="USDC" />
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
                <td>{r.title}</td>
                <td className="num">
                  <span className="italic-num">{r.realized}</span>{" "}
                  <span className="caps-sm muted">USDC</span>
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
              {p.price ? `${p.price} USDC` : "—"}
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
