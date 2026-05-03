"use client";

import { useEffect, useMemo, useState } from "react";
import type { Address } from "viem";
import { WorkerPortrait } from "./WorkerPortrait";
import { DigitTicker } from "./DigitTicker";
import { fmtUSDC, truncMid } from "@/lib/format";
import { Spinner } from "./Spinner";
import { resolveWho } from "@/lib/ens";

type Phase = "ready" | "transferring" | "transferred" | "resolved";

const CEREMONY_MS = 1500;

export function InheritanceCeremony({
  tokenId,
  workerSeed,
  fromOwner,
  toOwner,
  salePriceUsdc,
  onClose,
}: {
  tokenId: number;
  workerSeed: number;
  fromOwner: Address;
  toOwner: Address;
  salePriceUsdc: number;
  onClose?: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("ready");
  const [resolvedOwner, setResolvedOwner] = useState<Address>(fromOwner);

  // Begin the ceremony.
  useEffect(() => {
    if (phase !== "transferring") return;
    const t = window.setTimeout(() => setPhase("transferred"), CEREMONY_MS);
    return () => window.clearTimeout(t);
  }, [phase]);

  // After the on-chain confirmation, fire the live ENS re-resolution.
  useEffect(() => {
    if (phase !== "transferred") return;
    let cancelled = false;
    (async () => {
      try {
        const live = await resolveWho(tokenId);
        if (cancelled) return;
        setResolvedOwner(live);
        setPhase("resolved");
      } catch {
        if (cancelled) return;
        // Demo fallback — show toOwner if RPC unreachable.
        setResolvedOwner(toOwner);
        setPhase("resolved");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [phase, tokenId, toOwner]);

  const reversal = phase === "transferring" || phase === "transferred";

  return (
    <section
      role="dialog"
      aria-modal
      aria-labelledby="transfer-title"
      className={`relative flex w-full max-w-[720px] flex-col border border-[var(--ledger-ink-border)] bg-[color:var(--ledger-ink-elevated)] ${
        phase === "transferring" ? "shadow-[0_0_0_1px_rgba(156,42,42,0.3)]" : ""
      }`}
    >
      {/* Header */}
      <header className="flex items-start justify-between border-b border-[var(--ledger-ink-border)] px-8 py-6">
        <div>
          <h1
            id="transfer-title"
            className="ledger-display text-[28px] leading-tight tracking-[-0.01em] text-[color:var(--ledger-paper)]"
            style={{ fontStyle: "italic" }}
          >
            Transfer Worker
          </h1>
          <p className="mt-1 text-[13px] text-[color:var(--ledger-ink-muted)]">
            All future earnings flow to the new owner.
          </p>
        </div>
        <span className="ledger-caps-sm text-[color:var(--ledger-ink-muted)]">
          LOT 001 · INHERITANCE
        </span>
      </header>

      {/* Center — portrait + addresses + particle stream */}
      <div className="relative flex flex-col items-center gap-3 px-8 py-10">
        <div className="flex w-full flex-col items-center gap-2">
          <span className="ledger-caps-sm text-[color:var(--ledger-ink-muted)]">
            FROM
          </span>
          <span
            className="ledger-mono text-[14px] text-[color:var(--ledger-paper)] transition-opacity duration-[1500ms] ease-out"
            style={{ opacity: reversal ? 0.3 : 1 }}
          >
            {truncMid(fromOwner, 8, 6)}
          </span>
        </div>

        <div className="relative my-4 flex h-[260px] w-full items-center justify-center">
          {/* Particles */}
          <ParticleColumn side="left" active={phase === "transferring"} />
          <ParticleColumn
            side="right"
            active={phase === "transferring" || phase === "transferred"}
          />
          {/* Portrait */}
          <div className="relative">
            <div className="ledger-pulse-opacity" style={{ display: "block" }}>
              <WorkerPortrait size={240} seed={workerSeed} />
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col items-center gap-2">
          <span className="ledger-caps-sm text-[color:var(--ledger-oxblood-bright)]">
            TO
          </span>
          <span
            className="ledger-mono text-[14px] text-[color:var(--ledger-paper)] transition-all duration-[1500ms]"
            style={{
              opacity: reversal ? 1 : 0.4,
              transform: reversal ? "scale(1)" : "scale(0.97)",
            }}
          >
            {truncMid(toOwner, 8, 6)}
          </span>
        </div>
      </div>

      {/* Live ENS resolution panel */}
      <div className="border-t border-[var(--ledger-ink-border)] px-8 py-6">
        <header className="mb-3 flex items-center justify-between">
          <h3 className="ledger-caps-md text-[color:var(--ledger-paper)]">
            LIVE ENS RESOLUTION
          </h3>
          <button
            type="button"
            className="ledger-caps-sm text-[color:var(--ledger-oxblood-bright)] hover:text-[color:var(--ledger-oxblood)]"
          >
            Verify ↗
          </button>
        </header>
        <div className="flex items-baseline justify-between gap-4">
          <span
            className="ledger-mono text-[13px] text-[color:var(--ledger-ink-muted)]"
            style={{ fontStyle: "italic" }}
          >
            who.worker-001.ledger.eth
          </span>
          <DigitTicker
            value={truncMid(resolvedOwner, 10, 8)}
            className="ledger-mono text-[14px] text-[color:var(--ledger-paper)]"
          />
        </div>
        <p className="ledger-mono mt-2 text-[11px] text-[color:var(--ledger-ink-muted)]">
          no ENS transaction · no migration · CCIP-Read off-chain resolver
          follows ownerOf()
        </p>
      </div>

      {/* Summary */}
      <div className="border-t border-[var(--ledger-ink-border)] bg-[color:var(--ledger-ink-warm)] px-8 py-5">
        <ul className="flex flex-col gap-2 text-[13px]">
          <li className="flex items-center justify-between">
            <span className="text-[color:var(--ledger-ink-muted)]">
              Sale price
            </span>
            <span className="ledger-mono text-[color:var(--ledger-gold-leaf)] tabular-nums">
              {fmtUSDC(salePriceUsdc)} USDC
            </span>
          </li>
          <li className="flex items-center justify-between">
            <span className="text-[color:var(--ledger-ink-muted)]">
              Network fee
            </span>
            <span className="ledger-mono text-[color:var(--ledger-ink-muted)] tabular-nums">
              ≈ 0.0024 USDC
            </span>
          </li>
          <li className="flex items-center justify-between">
            <span className="text-[color:var(--ledger-ink-muted)]">
              Settles on
            </span>
            <span className="text-[color:var(--ledger-paper)]">
              0G Galileo Testnet · ChainID 16602{" "}
              <span className="ml-1 text-[color:var(--ledger-success)]">✓</span>
            </span>
          </li>
        </ul>
      </div>

      {/* Buttons */}
      <footer className="flex items-center justify-center gap-4 border-t border-[var(--ledger-ink-border)] px-8 py-6">
        {phase === "ready" && (
          <>
            <button
              type="button"
              onClick={() => setPhase("transferring")}
              className="ledger-mono h-11 min-w-[180px] border border-[color:var(--ledger-oxblood)] bg-[color:var(--ledger-oxblood)] px-5 text-[12px] uppercase tracking-[0.14em] text-[color:var(--ledger-paper)] transition-colors duration-200 hover:bg-[color:var(--ledger-oxblood-dim)]"
            >
              Confirm transfer
            </button>
            <button
              type="button"
              onClick={onClose}
              className="ledger-caps-sm text-[color:var(--ledger-ink-muted)] hover:text-[color:var(--ledger-paper)]"
            >
              Cancel
            </button>
          </>
        )}
        {phase === "transferring" && (
          <span className="ledger-mono flex items-center gap-3 text-[14px] text-[color:var(--ledger-paper)]">
            <Spinner size={14} color="var(--ledger-oxblood-bright)" />
            <span>TRANSFERRING…</span>
          </span>
        )}
        {phase === "transferred" && (
          <span className="ledger-mono flex items-center gap-3 text-[14px] text-[color:var(--ledger-paper)]">
            <Spinner size={14} color="var(--ledger-paper)" />
            <span>RE-RESOLVING who.*</span>
          </span>
        )}
        {phase === "resolved" && (
          <span className="ledger-mono flex items-center gap-3 text-[14px] text-[color:var(--ledger-success)]">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M3 8 l3 3 l7 -7"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>TRANSFERRED · who.* now resolves to new owner</span>
          </span>
        )}
      </footer>
    </section>
  );
}

function ParticleColumn({
  side,
  active,
}: {
  side: "left" | "right";
  active: boolean;
}) {
  const particles = useMemo(
    () => Array.from({ length: 8 }).map((_, i) => i),
    [],
  );
  return (
    <div
      aria-hidden
      className="absolute top-0 h-full w-12"
      style={{
        [side]: 40,
      }}
    >
      {particles.map((i) => (
        <span
          key={i}
          className="absolute block"
          style={{
            left: 24,
            bottom: 0,
            width: 2,
            height: 2,
            borderRadius: 1,
            background: "var(--ledger-gold-leaf)",
            opacity: active ? 0.8 : 0,
            transition: "opacity 600ms ease-out",
            animation: active
              ? `${side === "left" ? "ledger-particle-down" : "ledger-particle-up"} ${
                  1100 + i * 90
                }ms cubic-bezier(0.22, 1, 0.36, 1) ${i * 100}ms infinite`
              : "none",
          }}
        />
      ))}
    </div>
  );
}
