import { TopNav } from "@/components/TopNav";
import { Footer } from "@/components/Footer";
import { NetworkStatusBar } from "@/components/NetworkStatusBar";
import { AxlTopology } from "@/components/AxlTopology";
import { AxlLogFeed } from "@/components/AxlLogFeed";
import { WorkerBidCard } from "@/components/WorkerBidCard";
import { JobCountdown } from "./JobCountdown";
import { JOBS, WORKERS } from "@/lib/seed";
import { fmtLot, fmtUSDC, truncAddr } from "@/lib/format";
import { Copyable } from "@/components/Copyable";
import { Mark } from "@/components/Mark";
import { notFound } from "next/navigation";

export default async function JobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lot = Number.parseInt(id, 10);
  const job = JOBS.find((j) => j.lot === lot);
  if (!job) notFound();

  // Sort bids ascending by price; the first is the leader.
  const ranked = [...job.bids].sort((a, b) => a.bidUsdc - b.bidUsdc);
  const leaderTokenId = ranked[0]?.workerTokenId;

  return (
    <>
      <TopNav />
      <main className="flex-1">
        <NetworkStatusBar />

        {/* Top section: job header */}
        <section className="mx-auto grid w-full max-w-[1440px] grid-cols-12 gap-8 px-10 pt-10">
          <header className="col-span-12 lg:col-span-8">
            <span className="ledger-caps-md mb-3 flex items-center gap-3 text-[color:var(--ledger-ink-muted)]">
              <Mark
                size={14}
                className="text-[color:var(--ledger-oxblood-bright)]"
              />
              {fmtLot(job.lot)} · LIVE AUCTION · ETHGLOBAL OPEN AGENTS 2026
            </span>
            <h1
              className="ledger-display text-[40px] leading-tight tracking-[-0.02em] text-[color:var(--ledger-paper)]"
              style={{ fontStyle: "italic" }}
            >
              {job.title}
            </h1>
            <p className="mt-3 max-w-[60ch] text-[14px] leading-relaxed text-[color:var(--ledger-ink-muted)]">
              {job.description}
            </p>
            <div className="ledger-mono mt-4 flex items-center gap-6 text-[12px] text-[color:var(--ledger-ink-muted)]">
              <span>
                Posted by{" "}
                <Copyable
                  value={job.employer}
                  display={truncAddr(job.employer)}
                  className="text-[color:var(--ledger-paper)]"
                />
              </span>
              <span>· OUTPUT: {job.outputSchema ?? "freeform"}</span>
            </div>
          </header>
          <aside className="col-span-12 flex flex-col items-end justify-start gap-4 lg:col-span-4">
            <JobCountdown closesAtSec={job.closesAtSec} />
            <div className="grid grid-cols-2 gap-3 text-right">
              <span className="ledger-caps-md self-center text-[color:var(--ledger-ink-muted)]">
                PAYOUT
              </span>
              <span className="ledger-mono text-[14px] text-[color:var(--ledger-gold-leaf)] tabular-nums">
                {fmtUSDC(job.payoutUsdc)} USDC
              </span>
              <span className="ledger-caps-md self-center text-[color:var(--ledger-ink-muted)]">
                BOND
              </span>
              <span className="ledger-mono text-[14px] text-[color:var(--ledger-ink-muted)] tabular-nums">
                {fmtUSDC(job.bondUsdc)} USDC
              </span>
            </div>
          </aside>
        </section>

        <hr
          aria-hidden
          className="mx-auto mt-10 h-px w-full max-w-[1440px] border-0 bg-[color:var(--ledger-ink-border)]"
          style={{
            marginLeft: 40,
            marginRight: 40,
            width: "calc(100% - 80px)",
          }}
        />

        {/* Main: bid cards + AXL rail */}
        <section className="mx-auto grid w-full max-w-[1440px] grid-cols-12 gap-8 px-10 py-12">
          <div className="col-span-12 lg:col-span-8">
            <h2 className="ledger-caps-md mb-6 text-[color:var(--ledger-ink-muted)]">
              BIDDERS · {job.bids.length} ACTIVE
            </h2>
            <div className="flex flex-wrap gap-4">
              {ranked.map((bid, i) => (
                <WorkerBidCard
                  key={bid.workerTokenId}
                  bid={bid}
                  worker={WORKERS.find((w) => w.tokenId === bid.workerTokenId)}
                  leading={bid.workerTokenId === leaderTokenId}
                  losing={i > 0}
                />
              ))}
            </div>
            <p className="ledger-mono mt-8 max-w-[60ch] text-[12px] text-[color:var(--ledger-ink-muted)]">
              Lowest qualifying bid wins. Bids are gossiped over the AXL mesh
              and signed off-chain; the winning bid is committed to LedgerEscrow
              on 0G Galileo on auction close.
            </p>
          </div>

          <aside className="col-span-12 lg:col-span-4">
            <div className="border border-[var(--ledger-ink-border)] bg-[color:var(--ledger-ink-elevated)]">
              <header className="flex items-center justify-between border-b border-[var(--ledger-ink-border)] px-5 py-3">
                <h3 className="ledger-caps-md text-[color:var(--ledger-paper)]">
                  AXL TOPOLOGY
                </h3>
                <span className="ledger-mono text-[10px] uppercase tracking-[0.14em] text-[color:var(--ledger-ink-muted)]">
                  3 PEERS · LIVE
                </span>
              </header>
              <div className="flex justify-center px-3 py-4">
                <AxlTopology width={280} height={200} />
              </div>
              <div className="border-t border-[var(--ledger-ink-border)] px-5 py-4">
                <h4 className="ledger-caps-md mb-3 text-[color:var(--ledger-ink-muted)]">
                  GOSSIP LOG
                </h4>
                <AxlLogFeed max={9} />
              </div>
            </div>
          </aside>
        </section>
      </main>
      <Footer />
    </>
  );
}
