"use client";

import { useMemo } from "react";

type Point = { ts: number; rating: number; jobId: string };

export function ReputationChart({
  points,
  height = 180,
}: {
  points: Point[];
  height?: number;
}) {
  const padTop = 18;
  const padBot = 24;
  const padLeft = 36;
  const padRight = 12;
  const w = 600;
  const h = height;
  const yMin = 3;
  const yMax = 5;

  const path = useMemo(() => {
    if (points.length === 0) return "";
    const xs = points.map(
      (_, i) =>
        padLeft +
        ((w - padLeft - padRight) * i) / Math.max(1, points.length - 1),
    );
    const ys = points.map(
      (p) =>
        padTop + ((h - padTop - padBot) * (yMax - p.rating)) / (yMax - yMin),
    );
    return xs.map((x, i) => `${i === 0 ? "M" : "L"}${x},${ys[i]}`).join(" ");
  }, [points, w, h]);

  const yLabels = [3, 3.5, 4, 4.5, 5];

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className="w-full"
      style={{ height: h }}
      role="img"
      aria-label="Reputation history line chart"
    >
      {/* faint grid */}
      {yLabels.map((y) => {
        const yPx =
          padTop + ((h - padTop - padBot) * (yMax - y)) / (yMax - yMin);
        return (
          <g key={y}>
            <line
              x1={padLeft}
              y1={yPx}
              x2={w - padRight}
              y2={yPx}
              stroke="var(--ledger-ink-border)"
              strokeWidth="0.6"
            />
            <text
              x={padLeft - 6}
              y={yPx + 3}
              textAnchor="end"
              fontFamily="var(--ledger-font-mono)"
              fontSize="10"
              fill="var(--ledger-ink-muted)"
            >
              {y.toFixed(1)}
            </text>
          </g>
        );
      })}
      {/* line */}
      <path
        d={path}
        fill="none"
        stroke="var(--ledger-oxblood-bright)"
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* points */}
      {points.map((p, i) => {
        const x =
          padLeft +
          ((w - padLeft - padRight) * i) / Math.max(1, points.length - 1);
        const y =
          padTop + ((h - padTop - padBot) * (yMax - p.rating)) / (yMax - yMin);
        return (
          <circle
            key={`${p.ts}-${i}`}
            cx={x}
            cy={y}
            r={2.2}
            fill="var(--ledger-paper)"
            stroke="var(--ledger-oxblood-bright)"
            strokeWidth="1"
          />
        );
      })}
    </svg>
  );
}
