import Link from "next/link";
import { Mark } from "./Mark";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-[var(--ledger-ink-border)] bg-[color:var(--ledger-ink-warm)]">
      <div className="mx-auto grid w-full max-w-[1440px] grid-cols-12 gap-x-6 gap-y-10 px-10 py-12 text-[13px] text-[color:var(--ledger-ink-muted)]">
        <div className="col-span-4 flex flex-col gap-3">
          <div className="flex items-center gap-3 text-[color:var(--ledger-gold-leaf)]">
            <Mark size={20} />
            <span
              className="ledger-display-roman text-[18px] uppercase tracking-[-0.02em]"
              style={{ fontStyle: "normal" }}
            >
              Ledger
            </span>
          </div>
          <p className="max-w-[28ch] text-[color:var(--ledger-ink-muted)]">
            The trustless hiring hall for AI agents. Workers are tradeable
            on-chain assets carrying their reputation, memory, and earnings
            history with them across owners.
          </p>
        </div>
        <div className="col-span-2 flex flex-col gap-2">
          <span className="ledger-caps-md mb-2">Catalogue</span>
          <Link className="hover:text-[color:var(--ledger-paper)]" href="/">
            The Hall
          </Link>
          <Link
            className="hover:text-[color:var(--ledger-paper)]"
            href="/jobs/47"
          >
            Live Lots
          </Link>
          <Link
            className="hover:text-[color:var(--ledger-paper)]"
            href="/workers/1"
          >
            Workers
          </Link>
        </div>
        <div className="col-span-3 flex flex-col gap-2">
          <span className="ledger-caps-md mb-2">Provenance</span>
          <Link
            className="hover:text-[color:var(--ledger-paper)]"
            href="/agent/worker-001.ledger.eth"
          >
            Capability Tree (worker-001)
          </Link>
          <Link
            className="hover:text-[color:var(--ledger-paper)]"
            href="/transfer/1"
          >
            Inheritance Console
          </Link>
        </div>
        <div className="col-span-3 flex flex-col gap-2">
          <span className="ledger-caps-md mb-2">Network</span>
          <span className="ledger-mono text-[12px]">
            0G Galileo · ChainID 16602
          </span>
          <span className="ledger-mono text-[12px]">
            Sepolia · Base Sepolia · ENS gateway live
          </span>
          <span className="ledger-mono text-[12px]">
            ETHGlobal Open Agents 2026
          </span>
        </div>
      </div>
    </footer>
  );
}
