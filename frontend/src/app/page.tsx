import Link from "next/link";
import { Shell } from "@/components/Shell";
import { LotPlate } from "@/components/LotPlate";
import { LOTS, TICKER_EVENTS } from "@/lib/data";

export default function HallPage() {
  // Triple the ticker so the marquee loop reads as continuous.
  const ticker = [...TICKER_EVENTS, ...TICKER_EVENTS, ...TICKER_EVENTS];

  return (
    <Shell>
      <div className="page">
        {/* Top rule */}
        <hr className="rule rule-strong" />

        {/* HERO BAND */}
        <section style={{ padding: "120px 40px 100px", textAlign: "center" }}>
          <div
            className="caps-md"
            style={{ color: "var(--ledger-ink-muted)", marginBottom: 24 }}
          >
            THIS WEEK
          </div>
          <div
            style={{
              fontFamily: "var(--ledger-font-display)",
              fontStyle: "italic",
              fontWeight: 900,
              fontSize: 128,
              lineHeight: 0.92,
              letterSpacing: "-0.04em",
              color: "var(--ledger-ink)",
              fontFeatureSettings: '"tnum"',
            }}
          >
            47,238.50{" "}
            <span
              style={{
                fontFamily: "var(--ledger-font-body)",
                fontStyle: "normal",
                fontSize: 28,
                fontWeight: 500,
                color: "var(--ledger-ink-muted)",
                letterSpacing: 0,
                marginLeft: 12,
              }}
            >
              USDC
            </span>
          </div>
          <div
            className="caps-md"
            style={{ color: "var(--ledger-ink-muted)", marginTop: 24 }}
          >
            REALIZED ACROSS LEDGER
          </div>
        </section>

        {/* MID STAT BAND */}
        <hr className="rule rule-strong" />
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            padding: "32px 40px",
          }}
        >
          <StatItem value="247" label="Active lots" />
          <StatItem value="1,847" label="Bids placed today" />
          <StatItem value="2,400" label="USDC · Hammer record (Lot 047)" gold />
        </section>
        <hr className="rule rule-strong" />

        {/* CATALOGUE GRID */}
        <section style={{ padding: "64px 40px 80px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: 32,
            }}
          >
            <h2
              style={{
                fontFamily: "var(--ledger-font-display)",
                fontStyle: "italic",
                fontWeight: 900,
                fontSize: 48,
                letterSpacing: "-0.03em",
                margin: 0,
                color: "var(--ledger-ink)",
              }}
            >
              The catalogue.
            </h2>
            <Link
              href="/workers"
              className="btn-text"
              style={{ color: "var(--ledger-oxblood)", fontSize: 14 }}
            >
              View all 247 lots →
            </Link>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 24,
            }}
          >
            {LOTS.map((l) => (
              <LotPlate key={l.lot} lot={l} />
            ))}
          </div>
        </section>

        {/* TICKER */}
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
                {e}{" "}
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
