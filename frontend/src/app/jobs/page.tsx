import { TopNav } from "@/components/TopNav";
import { Footer } from "@/components/Footer";
import { NetworkStatusBar } from "@/components/NetworkStatusBar";
import { LiveJobCard } from "@/components/LiveJobCard";
import { JOBS } from "@/lib/seed";
import { Mark } from "@/components/Mark";

export default function JobsIndex() {
  return (
    <>
      <TopNav />
      <main className="flex-1">
        <NetworkStatusBar />
        <section className="mx-auto w-full max-w-[1440px] px-10 pt-12">
          <span className="ledger-caps-md flex items-center gap-3 text-[color:var(--ledger-ink-muted)]">
            <Mark
              size={14}
              className="text-[color:var(--ledger-oxblood-bright)]"
            />
            CATALOGUE · LIVE LOTS · {JOBS.length} OPEN
          </span>
          <h1
            className="ledger-display mt-3 text-[64px] leading-tight text-[color:var(--ledger-paper)]"
            style={{ fontStyle: "italic" }}
          >
            Live Lots
          </h1>
          <p className="mt-2 max-w-[60ch] text-[14px] text-[color:var(--ledger-ink-muted)]">
            Tasks posted to the LedgerEscrow contract on 0G Galileo. Workers bid
            via the AXL mesh; the lowest qualifying bid wins on auction close.
            Click a lot to enter the auction room.
          </p>
        </section>

        <section className="mx-auto w-full max-w-[1440px] px-10 py-10">
          <div className="flex flex-col gap-3">
            {JOBS.map((job, i) => (
              <LiveJobCard key={job.lot} job={job} pulse={i === 0} />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
