import { notFound } from "next/navigation";
import { TopNav } from "@/components/TopNav";
import { Footer } from "@/components/Footer";
import { NetworkStatusBar } from "@/components/NetworkStatusBar";
import { CapabilityTreeViewer } from "@/components/CapabilityTreeViewer";
import { Mark } from "@/components/Mark";
import { Copyable } from "@/components/Copyable";
import { PulseDot } from "@/components/Pulse";
import { LEDGER_ENS_GATEWAY_URL, LEDGER_ENS_PARENT } from "@/lib/contracts";
import { TEAM_ENS, WORKERS } from "@/lib/seed";

function findWorkerByEns(ens: string) {
  // Match either the full ENS name or just the worker label.
  return WORKERS.find((w) => w.ensName.toLowerCase() === ens.toLowerCase());
}

export default async function AgentPage({
  params,
}: {
  params: Promise<{ "ens-name": string }>;
}) {
  const { "ens-name": rawName } = await params;
  const ens = decodeURIComponent(rawName).toLowerCase();
  const worker = findWorkerByEns(ens);
  if (!worker) notFound();

  // Pull the worker label out of the ENS (everything before .<team>.eth).
  const label = worker.ensName.replace(`.${TEAM_ENS}`, "");

  const gatewayHost = (() => {
    try {
      return new URL(LEDGER_ENS_GATEWAY_URL.replace("/{sender}/{data}", ""))
        .host;
    } catch {
      return "ledger.eth gateway";
    }
  })();

  return (
    <>
      <TopNav />
      <main className="flex-1">
        <NetworkStatusBar />

        {/* Header */}
        <section className="mx-auto w-full max-w-[1440px] px-10 pt-12">
          <span className="ledger-caps-md flex items-center gap-3 text-[color:var(--ledger-ink-muted)]">
            <Mark size={14} className="text-[color:var(--ledger-gold-leaf)]" />
            CAPABILITY TREE · ENSIP-10 CCIP-READ · LIVE PROOF SURFACE
          </span>
          <h1 className="ledger-display tracking-[-0.03em] text-[64px] leading-[0.95] text-[color:var(--ledger-paper)] md:text-[80px]">
            <Copyable
              value={worker.ensName}
              display={worker.ensName}
              ariaLabel="Copy ENS name"
            />
          </h1>
          <div className="ledger-mono mt-3 flex items-center gap-3 text-[12px] text-[color:var(--ledger-ink-muted)]">
            <span>parent: {LEDGER_ENS_PARENT}</span>
            <span>·</span>
            <span>gateway: {gatewayHost}</span>
            <span className="ml-2 inline-flex items-center gap-1.5 border border-[color:var(--ledger-success)] px-2 py-0.5 text-[color:var(--ledger-success)]">
              <PulseDot color="var(--ledger-success)" size={6} />
              <span className="text-[10px] uppercase tracking-[0.14em]">
                live
              </span>
            </span>
          </div>
          <hr
            aria-hidden
            className="mt-8 mb-10 h-px w-full border-0 bg-[color:var(--ledger-ink-border)]"
          />
        </section>

        {/* Tree */}
        <section className="mx-auto w-full max-w-[1440px] px-10 pb-16">
          <CapabilityTreeViewer
            worker={worker}
            workerLabel={label}
            parent={LEDGER_ENS_PARENT}
          />
        </section>
      </main>
      <Footer />
    </>
  );
}
