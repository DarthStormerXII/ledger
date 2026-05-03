import { PulseDot } from "./Pulse";

const ITEMS = [
  { label: "AXL", detail: "3 nodes connected" },
  { label: "0G GALILEO", detail: "ChainID 16602 · ready" },
  { label: "ENS RESOLVER", detail: "ledger.eth · live" },
];

export function NetworkStatusBar() {
  return (
    <div
      className="ledger-scrollbar-hidden w-full overflow-x-auto border-y border-[var(--ledger-ink-border)] bg-[color:var(--ledger-ink-deep)]"
      role="region"
      aria-label="Network status"
    >
      <div className="mx-auto flex h-10 min-w-max items-center justify-between gap-6 px-5 md:px-10 lg:max-w-[1440px]">
        {ITEMS.map((item) => (
          <div
            key={item.label}
            className="ledger-mono flex shrink-0 items-center gap-2 whitespace-nowrap text-[12px] text-[color:var(--ledger-ink-muted)]"
          >
            <PulseDot color="var(--ledger-success)" size={6} />
            <span className="uppercase tracking-[0.14em] text-[color:var(--ledger-ink-muted)]">
              {item.label}
            </span>
            <span className="text-[color:var(--ledger-paper)]">
              {item.detail}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
