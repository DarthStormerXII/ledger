/**
 * The Ledger mark — three nodes in an upward triangle, two solid edges, one
 * dashed bottom edge. Inherits color from `currentColor` so it can sit on any
 * surface. Default sizes used: 16, 20, 24, 32, 40.
 */
export function Mark({
  size = 24,
  className,
  dashedColor,
}: {
  size?: number;
  className?: string;
  dashedColor?: string;
}) {
  const r = size * 0.085;
  const cx = size / 2;
  const cyTop = size * 0.18 + r;
  const cyBot = size * 0.78;
  const xLeft = size * 0.18;
  const xRight = size - xLeft;
  const stroke = Math.max(1, size * 0.04);
  const dash = `${size * 0.07} ${size * 0.05}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      aria-hidden="true"
    >
      {/* solid edges */}
      <line
        x1={xLeft}
        y1={cyBot}
        x2={cx}
        y2={cyTop}
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
        opacity={0.7}
      />
      <line
        x1={xRight}
        y1={cyBot}
        x2={cx}
        y2={cyTop}
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
        opacity={0.7}
      />
      {/* dashed live bottom */}
      <line
        x1={xLeft}
        y1={cyBot}
        x2={xRight}
        y2={cyBot}
        stroke={dashedColor ?? "currentColor"}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={dash}
      />
      {/* nodes */}
      <circle cx={cx} cy={cyTop} r={r} fill="currentColor" />
      <circle cx={xLeft} cy={cyBot} r={r} fill="currentColor" />
      <circle cx={xRight} cy={cyBot} r={r} fill="currentColor" />
    </svg>
  );
}
