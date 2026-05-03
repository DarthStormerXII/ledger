"use client";

import { useEffect, useState } from "react";
import {
  resolveAllStreaming,
  type NamespaceResolution,
  type Namespace,
} from "@/lib/ens";
import type { Worker } from "@/lib/types";
import { truncMid } from "@/lib/format";
import { Spinner } from "./Spinner";

const NS_DESCRIPTIONS: Record<Namespace, string> = {
  who: "live ownerOf() on 0G Galileo",
  pay: "rotating address per resolution (HD-derived)",
  tx: "task receipt — fetched from 0G Storage",
  rep: "ERC-8004 reputation on Base Sepolia",
  mem: "encrypted memory CID — 0G Storage",
};

const NS_ORDER: Namespace[] = ["who", "pay", "tx", "rep", "mem"];

type ResMap = Partial<Record<Namespace, NamespaceResolution>>;

/**
 * Compact mirror of the full Capability Tree, rendered in the right column of
 * the Worker Profile.
 */
export function CapabilityTreeInline({ worker }: { worker: Worker }) {
  const [resolutions, setResolutions] = useState<ResMap>({});
  const [tick, setTick] = useState(0);
  const loading = Object.keys(resolutions).length < NS_ORDER.length;

  useEffect(() => {
    let cancelled = false;
    void resolveAllStreaming(
      "worker-001",
      "ledger.eth",
      {
        tokenId: worker.tokenId,
        payRotation: worker.payRotation,
        payMasterPubkey: worker.payMasterPubkey,
        memCid: worker.memCid,
        attestationDigest: worker.attestationDigest,
      },
      (r) => {
        if (cancelled) return;
        setResolutions((prev) => ({ ...prev, [r.namespace]: r }));
      },
    );
    return () => {
      cancelled = true;
    };
  }, [worker, tick]);

  return (
    <section
      aria-label="Capability tree (inline)"
      className="flex h-full flex-col"
    >
      <header className="mb-3 flex items-center justify-between">
        <h2 className="ledger-caps-md text-[color:var(--ledger-paper)]">
          CAPABILITY TREE
        </h2>
        <button
          type="button"
          onClick={() => setTick((t) => t + 1)}
          className="ledger-caps-sm text-[color:var(--ledger-oxblood-bright)] hover:text-[color:var(--ledger-oxblood)]"
        >
          ↻ Re-resolve
        </button>
      </header>
      <ul className="flex flex-col border border-[var(--ledger-ink-border)]">
        {NS_ORDER.map((ns) => {
          const r = resolutions[ns];
          if (!r) {
            return (
              <li
                key={ns}
                className="flex h-14 items-center gap-3 border-b border-[var(--ledger-ink-border)] px-4 last:border-b-0"
              >
                <span
                  className="ledger-caps-sm w-14 shrink-0 text-[color:var(--ledger-ink-muted)]"
                  style={{ fontFamily: "var(--ledger-font-mono)" }}
                >
                  {ns}.*
                </span>
                <Spinner size={10} color="var(--ledger-ink-muted)" />
                <span className="ledger-caps-sm text-[color:var(--ledger-ink-muted)]">
                  resolving…
                </span>
              </li>
            );
          }
          return (
            <li
              key={r.namespace}
              className="group flex min-h-14 items-center gap-3 border-b border-[var(--ledger-ink-border)] px-4 py-3 last:border-b-0"
            >
              <span
                className="ledger-caps-sm w-14 shrink-0 text-[color:var(--ledger-oxblood-bright)]"
                style={{ fontFamily: "var(--ledger-font-mono)" }}
              >
                {r.namespace}.*
              </span>
              <div className="flex min-w-0 flex-1 flex-col">
                <span
                  className="ledger-mono truncate text-[13px] text-[color:var(--ledger-paper)]"
                  title={r.value}
                >
                  {r.value.startsWith("0x")
                    ? truncMid(r.value, 8, 6)
                    : r.value.length > 36
                      ? truncMid(r.value, 12, 6)
                      : r.value}
                </span>
                {r.rows && r.rows.length > 0 && (
                  <ul className="mt-1 flex flex-col gap-0.5">
                    {r.rows.slice(0, 2).map((row, i) => (
                      <li
                        key={i}
                        className="ledger-mono flex items-center gap-2 text-[11px] text-[color:var(--ledger-ink-muted)]"
                      >
                        <span className="text-[color:var(--ledger-paper)]">
                          {row.value.startsWith("0x")
                            ? truncMid(row.value, 8, 6)
                            : row.value}
                        </span>
                        <span>· {row.label}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <span className="ledger-mono mt-0.5 text-[10px] text-[color:var(--ledger-ink-muted)]">
                  {NS_DESCRIPTIONS[r.namespace]} · {r.latencyMs}ms
                </span>
              </div>
              <span className="ledger-caps-sm text-[color:var(--ledger-oxblood-bright)] opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                Verify ↗
              </span>
            </li>
          );
        })}
      </ul>
      {loading && (
        <p className="ledger-mono mt-2 text-[10px] text-[color:var(--ledger-ink-muted)]">
          resolving via ENSIP-10 CCIP-Read…
        </p>
      )}
    </section>
  );
}
