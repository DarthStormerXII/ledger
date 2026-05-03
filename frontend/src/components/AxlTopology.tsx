"use client";

import { useEffect, useState } from "react";

type Edge = {
  from: { x: number; y: number };
  to: { x: number; y: number };
  dashed?: boolean;
};

const NODE_LABELS = ["us-west", "eu-central", "local"];

/**
 * Three-node mesh topology with cyan/oxblood packets flowing along the edges.
 * Mirrors the brand mark geometry (upward triangle, dashed bottom edge).
 */
export function AxlTopology({
  width = 280,
  height = 220,
}: {
  width?: number;
  height?: number;
}) {
  const cx = width / 2;
  const padX = 36;
  const yTop = 48;
  const yBot = height - 56;
  const top = { x: cx, y: yTop };
  const left = { x: padX, y: yBot };
  const right = { x: width - padX, y: yBot };

  const edges: Edge[] = [
    { from: left, to: top },
    { from: right, to: top },
    { from: left, to: right, dashed: true },
  ];

  return (
    <div className="relative" style={{ width, height }}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="absolute inset-0"
        aria-hidden="true"
      >
        {/* edges */}
        {edges.map((e, i) => (
          <line
            key={i}
            x1={e.from.x}
            y1={e.from.y}
            x2={e.to.x}
            y2={e.to.y}
            stroke={
              e.dashed
                ? "var(--ledger-oxblood)"
                : "var(--ledger-ink-border-strong)"
            }
            strokeWidth={1.4}
            strokeDasharray={e.dashed ? "4 3" : undefined}
          />
        ))}
        {/* packets */}
        {edges.map((e, i) => (
          <Packet key={`p-${i}`} from={e.from} to={e.to} delayMs={i * 400} />
        ))}
        {/* nodes */}
        {[top, left, right].map((p, i) => (
          <g key={i}>
            <circle
              cx={p.x}
              cy={p.y}
              r={9}
              fill="var(--ledger-ink-elevated)"
              stroke="var(--ledger-paper)"
              strokeWidth={1.2}
            />
            <circle
              cx={p.x}
              cy={p.y}
              r={3}
              fill={
                i === 2 ? "var(--ledger-oxblood-bright)" : "var(--ledger-paper)"
              }
            />
          </g>
        ))}
      </svg>
      {/* labels */}
      <div
        className="ledger-mono absolute text-[10px] uppercase tracking-[0.14em] text-[color:var(--ledger-ink-muted)]"
        style={{
          left: cx - 30,
          top: yTop - 30,
          width: 60,
          textAlign: "center",
        }}
      >
        {NODE_LABELS[0]}
      </div>
      <div
        className="ledger-mono absolute text-[10px] uppercase tracking-[0.14em] text-[color:var(--ledger-ink-muted)]"
        style={{
          left: padX - 30,
          top: yBot + 12,
          width: 60,
          textAlign: "center",
        }}
      >
        {NODE_LABELS[1]}
      </div>
      <div
        className="ledger-mono absolute text-[10px] uppercase tracking-[0.14em] text-[color:var(--ledger-paper)]"
        style={{
          left: width - padX - 30,
          top: yBot + 12,
          width: 60,
          textAlign: "center",
        }}
      >
        {NODE_LABELS[2]}
      </div>
    </div>
  );
}

function Packet({
  from,
  to,
  delayMs,
}: {
  from: { x: number; y: number };
  to: { x: number; y: number };
  delayMs: number;
}) {
  const [t, setT] = useState(0);
  useEffect(() => {
    let frame = 0;
    let started = false;
    const startAt = performance.now() + delayMs;
    const duration = 1800;
    const tick = (now: number) => {
      if (now < startAt) {
        frame = requestAnimationFrame(tick);
        return;
      }
      if (!started) started = true;
      const elapsed = (now - startAt) % duration;
      setT(elapsed / duration);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [delayMs]);

  const cx = from.x + (to.x - from.x) * t;
  const cy = from.y + (to.y - from.y) * t;
  return (
    <circle
      cx={cx}
      cy={cy}
      r={3.2}
      fill="var(--ledger-oxblood-bright)"
      opacity={t < 0.05 || t > 0.95 ? 0 : 0.95}
    />
  );
}
