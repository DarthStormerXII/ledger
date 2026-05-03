"use client";

import { useEffect, useState } from "react";
import { SettlementLeg } from "./SettlementLeg";

/**
 * Wide horizontal strip with three real settlement legs (USDC paid on Base,
 * Reputation recorded on Base, 0G Storage CID). Every 8 seconds the strip
 * briefly flips a leg into PENDING_RECONCILE to show the two-phase commit.
 */
export function SettlementStrip() {
  const [pending, setPending] = useState<number | null>(null);
  useEffect(() => {
    const id = window.setInterval(() => {
      const which = Math.floor(Math.random() * 3);
      setPending(which);
      window.setTimeout(() => setPending(null), 1800);
    }, 8000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 20px",
        border: "1px solid rgba(245,241,232,0.16)",
        marginBottom: 32,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 28,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <SettlementLeg
          pending={pending === 0}
          label="USDC PAID ON BASE"
          hash="0x9a4f…ec21"
          href="https://sepolia.basescan.org"
        />
        <SettlementLeg
          pending={pending === 1}
          label="REPUTATION RECORDED"
          hash="0x33ad…b0e2"
          href="https://sepolia.basescan.org"
        />
        <SettlementLeg
          pending={pending === 2}
          label="0G STORAGE CID"
          hash="bafy…7e3p"
        />
      </div>
      <span className="pill" style={{ color: "var(--ledger-success)" }}>
        <span className="dot"></span>SETTLED
      </span>
    </div>
  );
}
