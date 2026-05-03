import Link from "next/link";
import { Shell } from "@/components/Shell";
import { LotPlate } from "@/components/LotPlate";
import {
  getHallStats,
  getAllLots,
  getRecentEvents,
  liveLotToLot,
} from "@/lib/live";
import { formatEther } from "viem";

// Live testnet reads — never cache for the demo window.
export const revalidate = 0;

export default async function HallPage() {
  // Run reads in parallel; tolerate failures so the page still renders.
  const [stats, lots, events] = await Promise.all([
    getHallStats().catch(() => ({
      activeLots: 0,
      realizedTotal: 0n,
      bidsToday: 0,
      hammerRecord: 0n,
      hammerLot: undefined,
    })),
    getAllLots().catch(() => []),
    getRecentEvents(12).catch(() => []),
  ]);

  const realized = formatNum(formatEther(stats.realizedTotal));
  const hammer = formatNum(formatEther(stats.hammerRecord));
  const ticker = events.length
    ? [...events, ...events, ...events]
    : [
        {
          text: "Live testnet — no recent events yet. Mint or post a task to see the feed.",
          txHash: "0x0",
        },
      ];

  return (
    <Shell>
      <div className="page">
        <hr className="rule rule-strong" />

        {/* HERO BAND */}
        <section className="home-hero-section">
          <div
            className="caps-md"
            style={{ color: "var(--ledger-ink-muted)", marginBottom: 24 }}
          >
            REALIZED ON CHAIN
          </div>
          <div className="home-hero-num">
            {realized} <span className="home-hero-num-suffix">0G</span>
          </div>
          <div
            className="caps-md"
            style={{ color: "var(--ledger-ink-muted)", marginTop: 24 }}
          >
            ACROSS ALL LEDGER ESCROW RELEASES
          </div>
        </section>

        {/* MID STAT BAND — live counts */}
        <hr className="rule rule-strong" />
        <section className="home-stat-band">
          <StatItem
            value={String(stats.activeLots)}
            label="Active lots (iNFTs minted)"
          />
          <StatItem
            value={String(stats.bidsToday)}
            label="Bids accepted · last 24h"
          />
          <StatItem
            value={hammer}
            label={`0G · Largest single release${stats.hammerLot ? ` (${stats.hammerLot})` : ""}`}
            gold
          />
        </section>
        <hr className="rule rule-strong" />

        {/* CATALOGUE GRID */}
        <section className="home-catalogue-section">
          <div className="home-catalogue-head">
            <h2>The catalogue.</h2>
            <Link
              href="/workers"
              className="btn-text"
              style={{ color: "var(--ledger-oxblood)", fontSize: 14 }}
            >
              View all {lots.length} lots →
            </Link>
          </div>
          {lots.length === 0 ? (
            <EmptyHint message="No iNFTs on chain yet. Run tools/register.ts to mint one." />
          ) : (
            <div className="catalogue-grid">
              {lots.slice(0, 4).map((l) => (
                <LotPlate key={l.lot} lot={liveLotToLot(l)} />
              ))}
            </div>
          )}
        </section>

        {/* TICKER — live event tail */}
        <div
          className="ticker"
          style={{ background: "var(--ledger-paper-warm)" }}
        >
          <div className="ticker-track">
            {ticker.map((e, i) => (
              <span
                key={i}
                className="ticker-item"
                style={{ color: "var(--ledger-ink)" }}
              >
                {e.text}{" "}
                <span className="ticker-sep" style={{ marginLeft: 64 }}>
                  ·
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </Shell>
  );
}

function formatNum(s: string) {
  const n = Number(s);
  if (!Number.isFinite(n)) return "0.00";
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });
}

function EmptyHint({ message }: { message: string }) {
  return (
    <div
      style={{
        padding: "60px 40px",
        textAlign: "center",
        border: "1px dashed rgba(15,15,18,0.2)",
        borderRadius: 8,
        color: "var(--ledger-ink-muted)",
        fontSize: 14,
      }}
    >
      {message}
    </div>
  );
}

function StatItem({
  value,
  label,
  gold = false,
}: {
  value: string;
  label: string;
  gold?: boolean;
}) {
  return (
    <div className="divcol" style={{ padding: "0 32px" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
        <span
          className={`italic-num italic-num-black${gold ? " text-gold" : ""}`}
          style={{
            fontSize: 48,
            color: gold ? undefined : "var(--ledger-ink)",
          }}
        >
          {value}
        </span>
        <span
          style={{
            fontFamily: "var(--ledger-font-body)",
            fontSize: 13,
            color: "var(--ledger-ink-muted)",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            fontWeight: 500,
          }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}
