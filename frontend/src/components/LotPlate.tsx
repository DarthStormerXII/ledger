"use client";

import { useRouter } from "next/navigation";
import type { Lot } from "@/lib/data";

export function LotPlate({
  lot,
  showPrice = false,
  onClick,
}: {
  lot: Lot;
  showPrice?: boolean;
  onClick?: () => void;
}) {
  const router = useRouter();
  const handleClick =
    onClick ?? (() => router.push(`/agent/${encodeURIComponent(lot.ens)}`));
  return (
    <div className="lot-plate" onClick={handleClick}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
        }}
      >
        <span className="lot-num">LOT {lot.lot}</span>
        {lot.listed && (
          <span className="caps-sm" style={{ color: "var(--ledger-oxblood)" }}>
            LISTED
          </span>
        )}
      </div>
      <div className="lot-emblem">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={lot.avatar} alt="" />
      </div>
      <div className="lot-name">{lot.ens}</div>
      <div className="lot-meta muted">
        {lot.jobs} JOBS · {lot.rating} ★ · {lot.earned} USDC EARNED
      </div>
      {showPrice && lot.listed && lot.askPrice && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            paddingTop: 8,
            borderTop: "1px solid rgba(245,241,232,0.16)",
          }}
        >
          <span className="caps-sm muted">ASKING</span>
          <span className="italic-num text-oxblood" style={{ fontSize: 22 }}>
            {lot.askPrice} USDC
          </span>
        </div>
      )}
      <div className="lot-foot">
        <span className="view-link">View Lot →</span>
      </div>
    </div>
  );
}
