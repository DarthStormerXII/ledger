/**
 * Abstract geometric worker portrait — concentric circles with a hex pattern
 * overlay. Watch-dial energy. Seeded by the worker's tokenId so the same
 * worker always renders the same dial.
 */
export function WorkerPortrait({
  size = 96,
  seed = 1,
  className,
  dim = false,
  ringColor,
  ringPulse = false,
}: {
  size?: number;
  seed?: number;
  className?: string;
  dim?: boolean;
  ringColor?: string;
  ringPulse?: boolean;
}) {
  const cx = size / 2;
  const cy = size / 2;
  // Pseudo-deterministic angles seeded by tokenId
  const tilt = (seed * 37) % 60; // °
  const accent = (seed * 13) % 360;
  const goldOpacity = 0.2 + ((seed * 17) % 40) / 100; // 0.2 – 0.59
  const concentricRadii = [size * 0.42, size * 0.32, size * 0.22, size * 0.1];
  const stroke = Math.max(0.6, size * 0.012);
  // hex grid points: 6 vertices around centre
  const hexR = size * 0.35;
  const hexPts = Array.from({ length: 6 }).map((_, i) => {
    const a = (Math.PI / 3) * i + (tilt * Math.PI) / 180;
    return [cx + Math.cos(a) * hexR, cy + Math.sin(a) * hexR] as const;
  });
  const hexPath =
    hexPts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ") +
    " Z";
  const opacity = dim ? 0.5 : 1;
  return (
    <div
      className={className}
      style={{ width: size, height: size, position: "relative" }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ display: "block", opacity }}
        aria-hidden="true"
      >
        <defs>
          <radialGradient id={`grad-${seed}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0f0f12" />
            <stop offset="100%" stopColor="#06060a" />
          </radialGradient>
        </defs>
        <rect
          x={0}
          y={0}
          width={size}
          height={size}
          fill={`url(#grad-${seed})`}
        />
        {concentricRadii.map((r, idx) => (
          <circle
            key={r}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={idx === 0 ? "#c8a85c" : idx === 2 ? "#79a2c4" : "#3a3a44"}
            strokeOpacity={idx === 0 ? goldOpacity : idx === 2 ? 0.5 : 0.7}
            strokeWidth={stroke}
          />
        ))}
        {/* hex inner overlay */}
        <path
          d={hexPath}
          fill="none"
          stroke="#c8a85c"
          strokeOpacity={goldOpacity * 0.7}
          strokeWidth={stroke}
        />
        {/* hex inner half lines (dial complications) */}
        {hexPts.map((p) => (
          <line
            key={`${p[0]},${p[1]}`}
            x1={cx}
            y1={cy}
            x2={p[0]}
            y2={p[1]}
            stroke="#3a3a44"
            strokeOpacity={0.6}
            strokeWidth={stroke * 0.5}
          />
        ))}
        {/* ticking marks around the rim */}
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i * Math.PI) / 6 - Math.PI / 2;
          const r1 = size * 0.46;
          const r2 = size * 0.49;
          return (
            <line
              key={i}
              x1={cx + Math.cos(a) * r1}
              y1={cy + Math.sin(a) * r1}
              x2={cx + Math.cos(a) * r2}
              y2={cy + Math.sin(a) * r2}
              stroke="#79a2c4"
              strokeOpacity={i % 3 === 0 ? 0.9 : 0.35}
              strokeWidth={i % 3 === 0 ? stroke * 1.4 : stroke}
            />
          );
        })}
        {/* center pip */}
        <circle cx={cx} cy={cy} r={size * 0.04} fill="#c8a85c" opacity={0.9} />
        <circle cx={cx} cy={cy} r={size * 0.015} fill="#0a0a0e" />
        {/* rotating accent dot — pure decoration */}
        <circle
          cx={cx + Math.cos((accent * Math.PI) / 180) * (size * 0.42)}
          cy={cy + Math.sin((accent * Math.PI) / 180) * (size * 0.42)}
          r={size * 0.025}
          fill="#9c2a2a"
        />
      </svg>
      {ringColor && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: `1.5px solid ${ringColor}`,
            pointerEvents: "none",
          }}
          className={ringPulse ? "ledger-pulse-opacity" : undefined}
        />
      )}
    </div>
  );
}
