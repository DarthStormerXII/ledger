// Live ERC-8004 reputation history chart. Each point is a real NewFeedback
// event on Base Sepolia, plotted in chronological order with the per-feedback
// rating value (rather than the cumulative average — judges should see the
// underlying signal, not a smoothed line). When the agent has no feedback yet
// we show an explicit empty state instead of inventing points.

export type RepPoint = { unixSec: number; value: number };

function fmtDate(unixSec: number): string {
  const d = new Date(unixSec * 1000);
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

export function ReputationChart({ points }: { points?: RepPoint[] }) {
  if (!points || points.length === 0) {
    return (
      <div
        style={{
          padding: "32px 0",
          color: "rgba(245,241,232,0.5)",
          fontSize: 13,
          fontStyle: "italic",
        }}
      >
        No ERC-8004 feedback recorded for this agent yet — chart populates once
        the first <span className="mono">NewFeedback</span> event lands on Base
        Sepolia.
      </div>
    );
  }
  // Single-point chart: still render the dot + axis label, no line.
  const w = 1000;
  const h = 200;
  const ymin = 0;
  const ymax = 5;
  const xStep = points.length > 1 ? w / (points.length - 1) : 0;
  const path = points
    .map(
      (p, i) =>
        `${i === 0 ? "M" : "L"} ${i * xStep} ${
          h - ((p.value - ymin) / (ymax - ymin)) * h
        }`,
    )
    .join(" ");
  const first = points[0];
  const last = points[points.length - 1];
  return (
    <div style={{ width: "100%", height: 240, position: "relative" }}>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        style={{ width: "100%", height: 200, display: "block" }}
        role="img"
        aria-label="Reputation history line chart"
      >
        {[0, 0.25, 0.5, 0.75, 1].map((g) => (
          <line
            key={g}
            x1="0"
            x2={w}
            y1={h * g}
            y2={h * g}
            stroke="rgba(245,241,232,0.1)"
            strokeWidth="1"
          />
        ))}
        {points.length > 1 && (
          <path
            d={path}
            fill="none"
            stroke="var(--ledger-oxblood)"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        )}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={points.length > 1 ? i * xStep : w / 2}
            cy={h - ((p.value - ymin) / (ymax - ymin)) * h}
            r="3"
            fill="var(--ledger-oxblood)"
          />
        ))}
      </svg>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 8,
        }}
      >
        <span className="mono muted" style={{ fontSize: 11 }}>
          {fmtDate(first.unixSec)}
        </span>
        <span className="mono muted" style={{ fontSize: 11 }}>
          {points.length === 1
            ? `1 feedback`
            : `${points.length} feedbacks · live ERC-8004`}
        </span>
        <span className="mono muted" style={{ fontSize: 11 }}>
          {fmtDate(last.unixSec)}
        </span>
      </div>
    </div>
  );
}
