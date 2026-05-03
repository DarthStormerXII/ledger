"use client";

import { SettlementLeg } from "./SettlementLeg";
import { baseSepoliaAddr, galileoTx, ogStorageCid } from "@/lib/contracts";

export type SettlementProof = {
  releaseTx?: string;
  reputationRegistry: string;
  memoryCID: string;
};

export function SettlementStrip({ proof }: { proof?: SettlementProof }) {
  const settled = Boolean(proof?.releaseTx);
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
          pending={!settled}
          label="0G ESCROW RELEASE"
          hash={proof?.releaseTx ? shortValue(proof.releaseTx) : "no release tx"}
          href={proof?.releaseTx ? galileoTx(proof.releaseTx) : undefined}
        />
        <SettlementLeg
          pending={!settled}
          label="REPUTATION REGISTRY"
          hash={shortValue(proof?.reputationRegistry ?? "not recorded")}
          href={proof?.reputationRegistry ? baseSepoliaAddr(proof.reputationRegistry) : undefined}
        />
        <SettlementLeg
          pending={!settled}
          label="0G STORAGE CID"
          hash={shortValue(proof?.memoryCID ?? "not resolved")}
          href={proof?.memoryCID ? ogStorageCid(proof.memoryCID) : undefined}
        />
      </div>
      <span
        className="pill"
        style={{ color: settled ? "var(--ledger-success)" : "var(--ledger-warning)" }}
      >
        <span className="dot"></span>
        {settled ? "SETTLED" : "NO RELEASE"}
      </span>
    </div>
  );
}

function shortValue(value: string) {
  if (value.length <= 18) return value;
  return `${value.slice(0, 8)}…${value.slice(-6)}`;
}
