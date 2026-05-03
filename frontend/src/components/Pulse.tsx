/** Small breathing dot used for live state indicators. */
export function PulseDot({
  color = "var(--ledger-success)",
  size = 6,
  className,
}: {
  color?: string;
  size?: number;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={`ledger-pulse-dot inline-block rounded-full align-middle ${className ?? ""}`}
      style={{
        width: size,
        height: size,
        background: color,
      }}
    />
  );
}
