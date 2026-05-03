import { notFound } from "next/navigation";
import Link from "next/link";
import { TopNav } from "@/components/TopNav";
import { Footer } from "@/components/Footer";
import { NetworkStatusBar } from "@/components/NetworkStatusBar";
import { InheritanceCeremony } from "@/components/InheritanceCeremony";
import { Mark } from "@/components/Mark";
import { WORKERS } from "@/lib/seed";
import { DEMO_OWNER_A, DEMO_OWNER_B } from "@/lib/contracts";

export default async function TransferPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tokenId = Number.parseInt(id, 10);
  const worker = WORKERS.find((w) => w.tokenId === tokenId);
  if (!worker) notFound();

  return (
    <>
      <TopNav />
      <main className="flex-1">
        <NetworkStatusBar />
        <section className="relative mx-auto flex min-h-[calc(100dvh-104px-300px)] w-full max-w-[1440px] flex-col items-center gap-10 px-10 pt-12">
          <div className="w-full">
            <Link
              href={`/workers/${tokenId}`}
              className="ledger-caps-sm text-[color:var(--ledger-ink-muted)] hover:text-[color:var(--ledger-paper)]"
            >
              ← back to lot
            </Link>
            <span className="ledger-caps-md mt-3 flex items-center gap-3 text-[color:var(--ledger-ink-muted)]">
              <Mark
                size={14}
                className="text-[color:var(--ledger-oxblood-bright)]"
              />
              INHERITANCE CONSOLE · {worker.ensName}
            </span>
            <h1
              className="ledger-display mt-3 text-[48px] leading-tight tracking-[-0.02em] text-[color:var(--ledger-paper)]"
              style={{ fontStyle: "italic" }}
            >
              Hand off the worker.
            </h1>
            <p className="mt-2 max-w-[60ch] text-[14px] text-[color:var(--ledger-ink-muted)]">
              The iNFT carries its reputation, memory, and earnings history. The
              ENS namespace re-resolves automatically — no migration, no second
              transaction.
            </p>
          </div>

          {/* The ceremony itself */}
          <div className="flex w-full justify-center">
            <InheritanceCeremony
              tokenId={worker.tokenId}
              workerSeed={worker.tokenId}
              fromOwner={DEMO_OWNER_A}
              toOwner={DEMO_OWNER_B}
              salePriceUsdc={1000}
            />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
