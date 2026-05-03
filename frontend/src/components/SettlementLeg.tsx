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
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span className={`live-dot ${pending ? "warn" : "success"}`}></span>
      <span
        className="caps-sm"
        style={{
          color: pending ? "var(--ledger-warning)" : "var(--ledger-paper)",
        }}
      >
        {pending ? "PENDING_RECONCILE" : label}
      </span>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer noopener"
          className="mono"
          style={{
            fontSize: 11,
            color: "rgba(245,241,232,0.55)",
          }}
        >
          {hash} ↗
        </a>
      ) : (
        <span
          className="mono"
          style={{ fontSize: 11, color: "rgba(245,241,232,0.55)" }}
        >
          {hash} ↗
        </span>
      )}
    </div>
  );
}
