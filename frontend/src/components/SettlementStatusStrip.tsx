"use client";

import { baseSepoliaTx, ogStorageCid } from "@/lib/contracts";
import { truncCid, truncMid } from "@/lib/format";
import type { SettlementLegs, SettlementState } from "@/lib/types";
import { StatusPill } from "./StatusPill";
import { Spinner } from "./Spinner";

type Props = {
  legs: SettlementLegs;
  variant?: "inline" | "panel";
  /** Override computed state (handy for the demo "pending" beat). */
  forceState?: SettlementState;
};

function deriveState(legs: SettlementLegs): SettlementState {
  const filled = [legs.usdcPaidTx, legs.reputationTx, legs.storageCid].every(
    Boolean,
  );
  if (filled) return "settled";
  return "pending_reconcile";
}

export function SettlementStatusStrip({ legs, variant, forceState }: Props) {
  const state = forceState ?? deriveState(legs);
  const borderClass =
    variant === "inline"
      ? "border-b border-[var(--ledger-ink-border)]"
      : "border-y border-[var(--ledger-ink-border)]";

  return (
    <div
      className={`ledger-scrollbar-hidden w-full overflow-x-auto bg-[color:var(--ledger-ink-deep)] ${borderClass}`}
      role="region"
      aria-label="Settlement status"
      aria-live="polite"
    >
      <div className="flex h-14 min-w-max items-center justify-between gap-8 px-5 md:px-6">
        <div className="flex flex-1 items-center gap-10">
          <Leg
            label="USDC paid on Base"
            value={legs.usdcPaidTx}
            state={legs.usdcPaidTx ? "settled" : "pending"}
            href={legs.usdcPaidTx ? baseSepoliaTx(legs.usdcPaidTx) : undefined}
          />
          <Leg
            label="Reputation recorded on Base"
            value={legs.reputationTx}
            state={legs.reputationTx ? "settled" : "pending"}
            href={
              legs.reputationTx ? baseSepoliaTx(legs.reputationTx) : undefined
            }
          />
          <Leg
            label="0G Storage CID updated"
            value={legs.storageCid ? truncCid(legs.storageCid) : null}
            state={legs.storageCid ? "settled" : "pending"}
            href={legs.storageCid ? ogStorageCid(legs.storageCid) : undefined}
          />
        </div>
        <div className="flex shrink-0 items-center">
          {state === "settled" && (
            <StatusPill tone="settled">SETTLED</StatusPill>
          )}
          {state === "pending_reconcile" && (
            <StatusPill tone="pending" className="gap-2">
              <Spinner size={10} color="var(--ledger-warning)" />
              <span>PENDING_RECONCILE</span>
            </StatusPill>
          )}
          {state === "reconcile_failed" && (
            <StatusPill tone="failed">RECONCILE_FAILED</StatusPill>
          )}
        </div>
      </div>
    </div>
  );
}

function Leg({
  label,
  value,
  state,
  href,
}: {
  label: string;
  value: string | null;
  state: "settled" | "pending" | "failed";
  href?: string;
}) {
  return (
    <div className="group flex items-center gap-2">
      <Dot state={state} />
      <span className="ledger-caps-md whitespace-nowrap">{label}</span>
      <span className="ledger-mono ml-1 text-[12px] text-[color:var(--ledger-paper)]">
        {value ? truncMid(value, 8, 4) : "—"}
      </span>
      {href && (
        <a
          href={href}
          target="_blank"
          rel="noreferrer noopener"
          aria-label={`Open ${label} on explorer`}
          className="text-[color:var(--ledger-ink-muted)] transition-colors duration-150 hover:text-[color:var(--ledger-paper)]"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
          >
            <path d="M3 9 L9 3 M5 3 H9 V7" strokeLinecap="round" />
          </svg>
        </a>
      )}
    </div>
  );
}

function Dot({ state }: { state: "settled" | "pending" | "failed" }) {
  if (state === "settled") {
    return (
      <span
        aria-hidden
        className="inline-block h-2 w-2 rounded-full"
        style={{ background: "var(--ledger-success)" }}
      />
    );
  }
  if (state === "pending") {
    return (
      <span
        aria-hidden
        className="inline-block h-2 w-2 rounded-full border ledger-spin"
        style={{ borderColor: "var(--ledger-warning)" }}
      />
    );
  }
  return (
    <span
      aria-hidden
      className="relative inline-block h-2 w-2 rounded-full"
      style={{ background: "var(--ledger-danger)" }}
    >
      <span
        className="absolute left-1/2 top-1/2 h-[1px] w-3 -translate-x-1/2 -translate-y-1/2 rotate-45"
        style={{ background: "var(--ledger-paper)" }}
      />
    </span>
  );
}
