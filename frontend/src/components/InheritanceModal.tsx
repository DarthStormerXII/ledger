"use client";

import { useEffect, useState } from "react";
import type { Lot } from "@/lib/data";
import { DEMO_OWNER_A, DEMO_OWNER_B } from "@/lib/contracts";
import { shortAddr } from "./useLiveOwner";
import { resolveWho } from "@/lib/ens";

type Phase = "ready" | "transferring" | "complete";

export function InheritanceModal({
  lot,
  onClose,
}: {
  lot: Lot;
  onClose: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("ready");
  const [pStarted, setPStarted] = useState(false);
  const [resolved, setResolved] = useState<string>(shortAddr(DEMO_OWNER_A));

  const confirm = () => {
    setPhase("transferring");
    setPStarted(true);
    window.setTimeout(() => setPhase("complete"), 1600);
  };

  // After "complete", re-resolve who.* live from chain.
  useEffect(() => {
    if (phase !== "complete") return;
    let cancelled = false;
    resolveWho(1)
      .then((live) => {
        if (cancelled) return;
        setResolved(shortAddr(live));
      })
      .catch(() => {
        if (cancelled) return;
        setResolved(shortAddr(DEMO_OWNER_B));
      });
    return () => {
      cancelled = true;
    };
  }, [phase]);

  // ESC to cancel
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && phase === "ready") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, onClose]);

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
          Transfer Lot {lot.lot}.
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
              opacity:
                phase === "complete" ? 0.3 : phase === "transferring" ? 0.5 : 1,
              transition: "opacity 1.5s ease-out",
            }}
          >
            <div className="caps-sm muted" style={{ marginBottom: 6 }}>
              FROM
            </div>
            <div
              className="mono"
              style={{ fontSize: 16, color: "var(--ledger-paper)" }}
            >
              {shortAddr(DEMO_OWNER_A)}
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
              opacity: phase === "ready" ? 0.4 : 1,
              transform: phase === "ready" ? "scale(0.97)" : "scale(1)",
              transition: "opacity 1.2s ease-out, transform 1.2s ease-out",
            }}
          >
            <div className="caps-sm muted" style={{ marginBottom: 6 }}>
              TO
            </div>
            <div
              className="mono"
              style={{ fontSize: 16, color: "var(--ledger-paper)" }}
            >
              {shortAddr(DEMO_OWNER_B)}
            </div>
          </div>

          {pStarted && (
            <div
              aria-hidden
              style={{
                position: "absolute",
                left: 0,
                top: "50%",
                right: 0,
                height: 0,
                pointerEvents: "none",
              }}
            >
              {Array.from({ length: 12 }).map((_, i) => (
                <span
                  key={i}
                  style={{
                    position: "absolute",
                    width: 4,
                    height: 4,
                    background: "var(--ledger-oxblood)",
                    borderRadius: 0,
                    top: -2,
                    left: "20%",
                    animation: `particle-${i % 2} 1.5s ease-in-out ${i * 0.07}s 1`,
                  }}
                />
              ))}
            </div>
          )}
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
            no ENS transaction · no migration · CCIP-Read off-chain resolver
            follows ownerOf()
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
          <Row label="Sale price" value={`${lot.askPrice} USDC`} italic />
          <Row label="Network fee" value="≈ 0.0024 USDC" mono />
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
            Cancel
          </button>
          {phase === "ready" && (
            <button
              onClick={confirm}
              className="btn btn-italic"
              style={{ padding: "14px 28px" }}
            >
              Confirm Transfer
            </button>
          )}
          {phase === "transferring" && (
            <button disabled className="btn" style={{ opacity: 0.6 }}>
              Transferring…
            </button>
          )}
          {phase === "complete" && (
            <button onClick={onClose} className="btn">
              Lot {lot.lot} — sold for {lot.askPrice} USDC. Provenance updated.
              Close.
            </button>
          )}
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
