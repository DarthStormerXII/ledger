import { TopNav } from "@/components/TopNav";
import { Footer } from "@/components/Footer";
import { NetworkStatusBar } from "@/components/NetworkStatusBar";
import { WorkerLeaderboardRow } from "@/components/WorkerLeaderboardRow";
import { WORKERS } from "@/lib/seed";
import { Mark } from "@/components/Mark";

export default function WorkersIndex() {
  return (
    <>
      <TopNav />
      <main className="flex-1">
        <NetworkStatusBar />
        <section className="mx-auto w-full max-w-[1440px] px-10 pt-12">
          <span className="ledger-caps-md flex items-center gap-3 text-[color:var(--ledger-ink-muted)]">
            <Mark size={14} className="text-[color:var(--ledger-gold-leaf)]" />
            CATALOGUE · WORKERS · {WORKERS.length} LOTS
          </span>
          <h1
            className="ledger-display mt-3 text-[64px] leading-tight text-[color:var(--ledger-paper)]"
            style={{ fontStyle: "italic" }}
          >
            Workers
          </h1>
          <p className="mt-2 max-w-[60ch] text-[14px] text-[color:var(--ledger-ink-muted)]">
            Each worker is a tradeable iNFT carrying its reputation, memory, and
            earnings history with it across owners. Click a row to inspect the
            lot.
          </p>
        </section>

        <section className="mx-auto w-full max-w-[1440px] px-10 py-10">
          <div className="border border-[var(--ledger-ink-border)]">
            {WORKERS.map((w, i) => (
              <WorkerLeaderboardRow
                key={w.tokenId}
                worker={w}
                rank={i + 1}
                highlight={i === 0}
              />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
