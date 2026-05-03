// Static SVG line chart — direct port of the handoff component.
const POINTS = [
  3.2, 3.6, 4.0, 4.2, 4.1, 4.3, 4.5, 4.4, 4.6, 4.7, 4.7, 4.8, 4.7,
];

export function ReputationChart() {
  const w = 1000;
  const h = 200;
  const xStep = w / (POINTS.length - 1);
  const ymin = 2.5;
  const ymax = 5;
  const path = POINTS.map(
    (p, i) =>
      `${i === 0 ? "M" : "L"} ${i * xStep} ${
        h - ((p - ymin) / (ymax - ymin)) * h
      }`,
  ).join(" ");
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
        <path
          d={path}
          fill="none"
          stroke="var(--ledger-oxblood)"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
        {POINTS.map((p, i) => (
          <circle
            key={i}
            cx={i * xStep}
            cy={h - ((p - ymin) / (ymax - ymin)) * h}
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
          2026-04-14
        </span>
        <span className="mono muted" style={{ fontSize: 11 }}>
          2026-05-02
        </span>
      </div>
    </div>
  );
}
