export function SettlementLeg({
  pending,
  label,
  hash,
  href,
}: {
  pending: boolean;
  label: string;
  hash: string;
  href?: string;
}) {
  return (
    <div className="settlement-leg">
      <span className={`live-dot ${pending ? "warn" : "success"}`}></span>
      <span
        className="caps-sm"
        style={{
          color: pending ? "var(--ledger-warning)" : "var(--ledger-paper)",
        }}
      >
        {pending ? "PENDING" : label}
      </span>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer noopener"
          className="mono settlement-leg-hash"
        >
          {hash} ↗
        </a>
      ) : (
        <span className="mono settlement-leg-hash">{hash} ↗</span>
      )}
    </div>
  );
}
