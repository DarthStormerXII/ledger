"use client";

import { useEffect, useState } from "react";
import type { Lot } from "@/lib/data";
import { shortAddr } from "./useLiveOwner";
import { resolveWho } from "@/lib/ens";

type Phase = "checking" | "blocked";

export function InheritanceModal({
  lot,
  onClose,
}: {
  lot: Lot;
  onClose: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("checking");
  const [resolved, setResolved] = useState<string>(lot.ownerShort);

  // Re-resolve who.* live from chain. This modal never simulates a transfer.
  useEffect(() => {
    let cancelled = false;
    const tokenId = Number.parseInt(lot.lot, 10);
    resolveWho(Number.isFinite(tokenId) ? tokenId : 1)
      .then((live) => {
        if (cancelled) return;
        setResolved(shortAddr(live));
        setPhase("blocked");
      })
      .catch(() => {
        if (cancelled) return;
        setPhase("blocked");
      });
    return () => {
      cancelled = true;
    };
  }, [lot.lot]);

  // ESC to cancel
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="modal-back"
      onClick={onClose}
      role="dialog"
      aria-modal
      aria-labelledby="transfer-title"
    >
      <div
        className="modal-card"
        style={{ width: 720, maxWidth: "92vw" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="transfer-title"
          style={{
            fontFamily: "var(--ledger-font-display)",
            fontStyle: "italic",
            fontWeight: 900,
            fontSize: 32,
            letterSpacing: "-0.02em",
            margin: "0 0 32px",
            color: "var(--ledger-paper)",
          }}
        >
          Live ownership for Lot {lot.lot}.
        </h2>

        {/* Center stage */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 240px 1fr",
            gap: 24,
            alignItems: "center",
            marginBottom: 32,
            position: "relative",
          }}
        >
          <div
            style={{
              textAlign: "right",
            }}
          >
            <div className="caps-sm muted" style={{ marginBottom: 6 }}>
              CURRENT OWNER
            </div>
            <div
              className="mono"
              style={{ fontSize: 16, color: "var(--ledger-paper)" }}
            >
              {resolved}
            </div>
          </div>

          <div
            style={{
              width: 240,
              height: 240,
              border: "1px solid rgba(245,241,232,0.16)",
              padding: 16,
              background: "var(--ledger-paper)",
              animation: "breathe-soft 2.5s ease-in-out infinite",
              position: "relative",
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

          <div
            style={{
              textAlign: "left",
            }}
          >
            <div className="caps-sm muted" style={{ marginBottom: 6 }}>
              SALE STATUS
            </div>
            <div
              className="mono"
              style={{ fontSize: 16, color: "var(--ledger-paper)" }}
            >
              No live sale contract
            </div>
          </div>
        </div>

        {/* Live ENS resolution */}
        <div
          style={{
            padding: "16px 20px",
            border: "1px solid rgba(245,241,232,0.16)",
            marginBottom: 16,
          }}
        >
          <div className="caps-md muted" style={{ marginBottom: 8 }}>
            LIVE ENS RESOLUTION
          </div>
          <div
            className="mono"
            style={{ fontSize: 14, color: "var(--ledger-paper)" }}
          >
            who.{lot.ens} → {resolved}
          </div>
          <div className="mono muted" style={{ fontSize: 11, marginTop: 8 }}>
            who.{lot.ens} reads current WorkerINFT.ownerOf on 0G Galileo.
          </div>
        </div>

        {/* Summary */}
        <div
          style={{
            padding: "16px 20px",
            border: "1px solid rgba(245,241,232,0.16)",
            marginBottom: 24,
          }}
        >
          <Row label="Sale price" value={lot.askPrice ? `${lot.askPrice} 0G` : "—"} italic />
          <Row label="Transfer tx" value="not submitted" mono />
          <Row
            label="Settles on"
            value={
              <>
                0G Galileo Testnet · ChainID 16602{" "}
                <span className="text-success">[✓]</span>
              </>
            }
            mono
            last
          />
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            className="btn-text"
            style={{ padding: "12px 22px", color: "rgba(245,241,232,0.6)" }}
          >
            Close
          </button>
          <button disabled className="btn" style={{ opacity: 0.6 }}>
            {phase === "checking" ? "Checking live owner..." : "No live sale to execute"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  italic,
  mono,
  last,
}: {
  label: string;
  value: React.ReactNode;
  italic?: boolean;
  mono?: boolean;
  last?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        padding: "10px 0",
        borderBottom: last ? "none" : "1px solid rgba(245,241,232,0.08)",
      }}
    >
      <span className="caps-sm muted">{label}</span>
      <span
        className={italic ? "italic-num text-oxblood" : mono ? "mono" : ""}
        style={{
          fontSize: italic ? 22 : 14,
          color: italic ? undefined : "var(--ledger-paper)",
        }}
      >
        {value}
      </span>
    </div>
  );
}
