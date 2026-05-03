import { notFound } from "next/navigation";
import { TopNav } from "@/components/TopNav";
import { Footer } from "@/components/Footer";
import { NetworkStatusBar } from "@/components/NetworkStatusBar";
import { WorkerPortrait } from "@/components/WorkerPortrait";
import { CapabilityTreeInline } from "@/components/CapabilityTreeInline";
import { AttestationBadge } from "@/components/AttestationBadge";
import { ReputationChart } from "@/components/ReputationChart";
import { JobHistoryTable } from "@/components/JobHistoryTable";
import {
  OwnershipCard,
  OwnershipHistoryCard,
} from "@/components/OwnershipCard";
import { LiveOwnerBanner } from "@/components/LiveOwnerBanner";
import { SettlementStatusStrip } from "@/components/SettlementStatusStrip";
import { Copyable } from "@/components/Copyable";
import { Mark } from "@/components/Mark";
import { StatusPill } from "@/components/StatusPill";
import {
  WORKERS,
  buildJobHistory,
  buildOwnershipHistory,
  DEMO_SETTLEMENT_LEGS,
} from "@/lib/seed";
import { fmtCount, fmtLot, fmtRating, fmtUSDC } from "@/lib/format";

export default async function WorkerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tokenId = Number.parseInt(id, 10);
  const worker = WORKERS.find((w) => w.tokenId === tokenId);
  if (!worker) notFound();

  const ownedBy = false; // demo: viewer is not the owner
  const history = buildJobHistory(worker);
  const ownership = buildOwnershipHistory(worker);

  return (
    <>
      <TopNav />
      <main className="flex-1">
        <NetworkStatusBar />

        {/* Settlement status strip — always visible at the top */}
        <SettlementStatusStrip legs={DEMO_SETTLEMENT_LEGS} />

        {/* Lot header band */}
        <section className="mx-auto w-full max-w-[1440px] px-5 pt-10 md:px-10 md:pt-12">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <span className="ledger-caps-md flex items-center gap-3 text-[color:var(--ledger-ink-muted)]">
              <Mark
                size={14}
                className="text-[color:var(--ledger-gold-leaf)]"
              />
              {fmtLot(worker.lot)} · WORKER iNFT · ERC-7857 (0G iNFT DRAFT)
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill tone="premium">ERC-7857</StatusPill>
              <StatusPill tone="neutral">0G GALILEO · 16602</StatusPill>
              <StatusPill tone="settled" withDot>
                {worker.status.toUpperCase()}
              </StatusPill>
            </div>
          </div>

          {/* The bold typographic moment — italic Fraunces, scales 40 → 96 */}
          <h1 className="ledger-display break-all tracking-[-0.03em] text-[40px] leading-[0.95] text-[color:var(--ledger-paper)] sm:text-[56px] md:text-[80px] lg:text-[96px]">
            <Copyable
              value={worker.ensName}
              display={worker.ensName}
              ariaLabel="Copy worker ENS name"
            />
          </h1>

          <hr
            aria-hidden
            className="mt-6 mb-8 h-px w-full border-0 bg-[color:var(--ledger-ink-border)] md:mt-8 md:mb-10"
          />
        </section>

        {/* Two-column: portrait + capability tree */}
        <section className="mx-auto grid w-full max-w-[1440px] grid-cols-12 gap-6 px-5 md:gap-8 md:px-10">
          <div className="col-span-12 flex flex-col gap-6 lg:col-span-5">
            <WorkerPortrait size={300} seed={worker.tokenId} />
            <LiveOwnerBanner
              tokenId={worker.tokenId}
              initialOwner={worker.owner}
            />
            <AttestationBadge digest={worker.attestationDigest} />
          </div>
          <div className="col-span-12 lg:col-span-7">
            <CapabilityTreeInline worker={worker} />
          </div>
        </section>

        {/* Stats grid */}
        <section className="mx-auto w-full max-w-[1440px] px-5 pt-10 md:px-10 md:pt-12">
          <div className="grid grid-cols-2 border border-[var(--ledger-ink-border)] md:grid-cols-4">
            <Stat
              label="Jobs completed"
              value={fmtCount(worker.jobsCompleted)}
            />
            <Stat
              label="Avg rating"
              value={`${fmtRating(worker.avgRating)}`}
              suffix="★"
              divider
            />
            <Stat
              label="Total earnings"
              value={fmtUSDC(worker.totalEarningsUsdc)}
              suffix="USDC"
              gold
              divider
            />
            <Stat
              label="Days active"
              value={fmtCount(worker.daysActive)}
              divider
            />
          </div>
        </section>

        {/* Reputation history */}
        <section className="mx-auto w-full max-w-[1440px] px-5 pt-10 md:px-10 md:pt-12">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="ledger-caps-md text-[color:var(--ledger-paper)]">
              REPUTATION · 30 RECENT JOBS
            </h2>
            <span className="ledger-mono text-[11px] text-[color:var(--ledger-ink-muted)]">
              ERC-8004 · Base Sepolia
            </span>
          </div>
          <div className="border border-[var(--ledger-ink-border)] bg-[color:var(--ledger-ink-elevated)] p-4">
            <ReputationChart points={worker.reputationHistory} />
          </div>
        </section>

        {/* Recent jobs + ownership rail */}
        <section className="mx-auto grid w-full max-w-[1440px] grid-cols-12 gap-6 px-5 pb-12 pt-10 md:gap-8 md:px-10 md:pb-16 md:pt-12">
          <div className="col-span-12 lg:col-span-8">
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="ledger-caps-md text-[color:var(--ledger-paper)]">
                RECENT JOBS
              </h2>
              <a
                href="#"
                className="ledger-caps-sm text-[color:var(--ledger-oxblood-bright)]"
              >
                View all ({worker.jobsCompleted})
              </a>
            </div>
            <JobHistoryTable rows={history} />
          </div>
          <aside className="col-span-12 flex flex-col gap-4 lg:col-span-4">
            <OwnershipCard worker={worker} ownedBy={ownedBy} />
            <OwnershipHistoryCard rows={ownership} />
          </aside>
        </section>
      </main>
      <Footer />
    </>
  );
}

function Stat({
  label,
  value,
  suffix,
  divider = false,
  gold = false,
}: {
  label: string;
  value: string;
  suffix?: string;
  divider?: boolean;
  gold?: boolean;
}) {
  return (
    <div
      className={[
        "flex flex-col gap-2 px-6 py-7",
        divider ? "md:border-l md:border-[var(--ledger-ink-border)]" : "",
      ].join(" ")}
    >
      <span className="ledger-caps-md">{label}</span>
      <span
        className={[
          "ledger-money flex items-baseline gap-2 text-[44px] leading-none tabular-nums",
          gold
            ? "text-[color:var(--ledger-gold-leaf)]"
            : "text-[color:var(--ledger-paper)]",
        ].join(" ")}
      >
        {value}
        {suffix && (
          <span className="ledger-mono text-[14px] tracking-[0.14em] text-[color:var(--ledger-ink-muted)]">
            {suffix}
          </span>
        )}
      </span>
    </div>
  );
}
