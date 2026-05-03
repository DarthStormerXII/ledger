export function Spinner({
  size = 12,
  color = "var(--ledger-paper)",
  className,
}: {
  size?: number;
  color?: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={`ledger-spin inline-block rounded-full border ${className ?? ""}`}
      style={{
        width: size,
        height: size,
        borderColor: `${color} transparent ${color} ${color}`,
        borderWidth: 1,
      }}
    />
  );
}
