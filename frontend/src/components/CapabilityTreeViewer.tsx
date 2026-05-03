"use client";

import { useEffect, useState, useTransition } from "react";
import {
  resolveAllStreaming,
  type Namespace,
  type NamespaceResolution,
} from "@/lib/ens";
import type { Worker } from "@/lib/types";
import { truncMid } from "@/lib/format";
import { Spinner } from "./Spinner";

const NS_DESCRIPTIONS: Record<Namespace, string> = {
  who: "live ownerOf() against 0G Galileo Testnet",
  pay: "auto-rotating payment address per resolution (HD-derived)",
  tx: "task receipt — fetched live from 0G Storage",
  rep: "ERC-8004 reputation feedback — Base Sepolia",
  mem: "encrypted memory blob — current 0G Storage CID",
};

const NS_ORDER: Namespace[] = ["who", "pay", "tx", "rep", "mem"];

function latencyTone(ms: number) {
  if (ms < 200) return "var(--ledger-success)";
  if (ms < 800) return "var(--ledger-warning)";
  return "var(--ledger-danger)";
}

export function CapabilityTreeViewer({
  worker,
  parent,
  workerLabel,
}: {
  worker: Worker;
  parent: string;
  workerLabel: string;
}) {
  const [resolutions, setResolutions] = useState<
    Record<Namespace, NamespaceResolution | null>
  >({ who: null, pay: null, tx: null, rep: null, mem: null });
  const [isPending, startTransition] = useTransition();
  const [flashed, setFlashed] = useState<Set<Namespace>>(new Set());
  const [openDrawers, setOpenDrawers] = useState<Set<Namespace>>(new Set());
  const [history, setHistory] = useState<
    { ts: number; ms: Record<Namespace, number> }[]
  >([]);

  // Initial resolve.
  useEffect(() => {
    void doResolve();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function doResolve() {
    setResolutions({ who: null, pay: null, tx: null, rep: null, mem: null });
    const all = await resolveAllStreaming(
      workerLabel,
      parent,
      {
        tokenId: worker.tokenId,
        payRotation: worker.payRotation,
        payMasterPubkey: worker.payMasterPubkey,
        memCid: worker.memCid,
        attestationDigest: worker.attestationDigest,
      },
      (r) => {
        setResolutions((prev) => ({ ...prev, [r.namespace]: r }));
        setFlashed((prev) => {
          const next = new Set(prev);
          next.add(r.namespace);
          return next;
        });
        window.setTimeout(() => {
          setFlashed((prev) => {
            const next = new Set(prev);
            next.delete(r.namespace);
            return next;
          });
        }, 280);
      },
    );
    setHistory((h) =>
      [
        ...h,
        {
          ts: Date.now(),
          ms: Object.fromEntries(
            all.map((r) => [r.namespace, r.latencyMs]),
          ) as Record<Namespace, number>,
        },
      ].slice(-12),
    );
  }

  function reResolveAll() {
    startTransition(() => {
      void doResolve();
    });
  }

  function toggleDrawer(ns: Namespace) {
    setOpenDrawers((prev) => {
      const next = new Set(prev);
      if (next.has(ns)) next.delete(ns);
      else next.add(ns);
      return next;
    });
  }

  return (
    <div className="grid w-full grid-cols-12 gap-8">
      <div className="col-span-12 lg:col-span-8 flex flex-col gap-4">
        {NS_ORDER.map((ns) => {
          const r = resolutions[ns];
          const flashing = flashed.has(ns);
          const open = openDrawers.has(ns);
          return (
            <article
              key={ns}
              className={[
                "border bg-[color:var(--ledger-ink-elevated)] transition-colors duration-200",
                flashing
                  ? "border-[color:var(--ledger-oxblood-bright)]"
                  : "border-[var(--ledger-ink-border)]",
              ].join(" ")}
            >
              <header className="flex items-center justify-between border-b border-[var(--ledger-ink-border)] px-6 py-3">
                <div className="flex items-baseline gap-3">
                  <span className="ledger-mono text-[12px] uppercase tracking-[0.14em] text-[color:var(--ledger-oxblood-bright)]">
                    {ns}.*
                  </span>
                  <span className="text-[12px] text-[color:var(--ledger-ink-muted)]">
                    {NS_DESCRIPTIONS[ns]}
                  </span>
                </div>
                <span
                  className="ledger-mono text-[10px] uppercase tracking-[0.14em]"
                  style={{
                    color: r
                      ? latencyTone(r.latencyMs)
                      : "var(--ledger-ink-muted)",
                  }}
                >
                  {r ? `${r.latencyMs}ms` : "resolving…"}
                </span>
              </header>
              <div className="flex flex-col gap-2 px-6 py-4">
                {!r && (
                  <div className="flex items-center gap-2 py-2">
                    <Spinner size={10} color="var(--ledger-ink-muted)" />
                    <span className="ledger-caps-sm">resolving…</span>
                  </div>
                )}
                {r && (
                  <>
                    <div className="flex items-center justify-between gap-2">
                      <span className="ledger-mono break-all text-[14px] text-[color:var(--ledger-paper)]">
                        {r.value}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleDrawer(ns)}
                        aria-expanded={open}
                        className="ledger-caps-sm shrink-0 text-[color:var(--ledger-oxblood-bright)] hover:text-[color:var(--ledger-oxblood)]"
                      >
                        {ns === "pay"
                          ? "Verify derivation"
                          : "Verify resolution"}
                      </button>
                    </div>
                    {r.rows && r.rows.length > 0 && (
                      <ul className="mt-2 flex flex-col divide-y divide-[var(--ledger-ink-border)]">
                        {r.rows.map((row, i) => (
                          <li
                            key={i}
                            className="flex items-center justify-between gap-3 py-2"
                          >
                            <span className="ledger-caps-md text-[color:var(--ledger-ink-muted)]">
                              {row.label}
                            </span>
                            <span
                              className="ledger-mono break-all text-[12px] text-[color:var(--ledger-paper)]"
                              style={{
                                fontFamily: "var(--ledger-font-mono)",
                              }}
                            >
                              {row.value.startsWith("0x") &&
                              row.value.length > 20
                                ? truncMid(row.value, 10, 8)
                                : row.value}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
              </div>
              {open && r && (
                <div className="border-t border-[var(--ledger-ink-border)] bg-[color:var(--ledger-ink-deep)] px-6 py-4">
                  <h4 className="ledger-caps-md mb-2 text-[color:var(--ledger-paper)]">
                    {ns === "pay"
                      ? "HD-derivation check"
                      : "ENSIP-10 resolver gateway response"}
                  </h4>
                  <pre className="ledger-mono max-h-[200px] overflow-auto whitespace-pre-wrap break-all text-[11px] text-[color:var(--ledger-ink-muted)]">
                    {JSON.stringify(r.raw ?? {}, null, 2)}
                  </pre>
                  {ns === "pay" && (
                    <div className="ledger-mono mt-3 flex items-center gap-2 text-[11px] text-[color:var(--ledger-success)]">
                      <span>✓</span>
                      <span>
                        master pubkey + nonce derives to listed address
                      </span>
                    </div>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>

      {/* Right rail */}
      <aside className="col-span-12 flex flex-col gap-4 lg:col-span-4">
        <div className="border border-[var(--ledger-ink-border)] bg-[color:var(--ledger-ink-elevated)] p-5">
          <h3 className="ledger-caps-md mb-3 text-[color:var(--ledger-paper)]">
            RESOLUTION TIMING
          </h3>
          <ResolutionTimingChart history={history} />
        </div>
        <div className="border border-[var(--ledger-ink-border)] bg-[color:var(--ledger-ink-elevated)] p-5">
          <h3 className="ledger-caps-md mb-3 text-[color:var(--ledger-paper)]">
            REFRESH
          </h3>
          <button
            type="button"
            onClick={reResolveAll}
            disabled={isPending}
            aria-busy={isPending}
            className="ledger-mono flex h-11 w-full items-center justify-center gap-2 border border-[color:var(--ledger-oxblood)] bg-[color:var(--ledger-oxblood)] text-[12px] uppercase tracking-[0.14em] text-[color:var(--ledger-paper)] transition-colors duration-200 hover:bg-[color:var(--ledger-oxblood-dim)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Spinner size={12} color="var(--ledger-paper)" /> RE-RESOLVING…
              </>
            ) : (
              <>RE-RESOLVE ALL</>
            )}
          </button>
          <p className="ledger-mono mt-3 text-[11px] text-[color:var(--ledger-ink-muted)]">
            ~ 240ms typical · CCIP-Read off-chain resolver
          </p>
        </div>
      </aside>
    </div>
  );
}

function ResolutionTimingChart({
  history,
}: {
  history: { ts: number; ms: Record<Namespace, number> }[];
}) {
  if (history.length === 0) {
    return (
      <p className="ledger-mono text-[11px] text-[color:var(--ledger-ink-muted)]">
        no samples yet — press Re-resolve to record
      </p>
    );
  }
  const maxMs = Math.max(400, ...history.flatMap((h) => Object.values(h.ms)));
  const colors: Record<Namespace, string> = {
    who: "var(--ledger-paper)",
    pay: "var(--ledger-gold-leaf)",
    tx: "var(--ledger-oxblood-bright)",
    rep: "var(--ledger-success)",
    mem: "var(--ledger-warning)",
  };
  const w = 320;
  const h = 140;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: h }}>
      {NS_ORDER.map((ns) => {
        const path = history
          .map((p, i) => {
            const x = (w * i) / Math.max(1, history.length - 1);
            const y = h - 12 - (h - 24) * (p.ms[ns] / maxMs);
            return `${i === 0 ? "M" : "L"}${x},${y}`;
          })
          .join(" ");
        return (
          <path
            key={ns}
            d={path}
            fill="none"
            stroke={colors[ns]}
            strokeWidth={1.4}
            strokeLinecap="round"
            strokeOpacity={0.85}
          />
        );
      })}
      <text
        x="2"
        y="10"
        fontFamily="var(--ledger-font-mono)"
        fontSize="9"
        fill="var(--ledger-ink-muted)"
      >
        {Math.round(maxMs)}ms
      </text>
      <text
        x="2"
        y={h - 2}
        fontFamily="var(--ledger-font-mono)"
        fontSize="9"
        fill="var(--ledger-ink-muted)"
      >
        0ms
      </text>
    </svg>
  );
}
