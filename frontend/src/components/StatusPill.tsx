import type { ReactNode } from "react";
import { PulseDot } from "./Pulse";

type Tone = "neutral" | "live" | "settled" | "pending" | "failed" | "premium";

const TONE_BORDER: Record<Tone, string> = {
  neutral: "var(--ledger-ink-border-strong)",
  live: "var(--ledger-oxblood)",
  settled: "var(--ledger-success)",
  pending: "var(--ledger-warning)",
  failed: "var(--ledger-danger)",
  premium: "var(--ledger-gold-leaf)",
};

const TONE_TEXT: Record<Tone, string> = {
  neutral: "var(--ledger-paper)",
  live: "var(--ledger-oxblood-bright)",
  settled: "var(--ledger-success)",
  pending: "var(--ledger-warning)",
  failed: "var(--ledger-danger)",
  premium: "var(--ledger-gold-leaf)",
};

export function StatusPill({
  children,
  tone = "neutral",
  withDot = false,
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  withDot?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`ledger-mono inline-flex items-center gap-1.5 border px-2 py-1 text-[10px] uppercase tracking-[0.14em] ${className ?? ""}`}
      style={{
        borderColor: TONE_BORDER[tone],
        color: TONE_TEXT[tone],
      }}
    >
      {withDot && <PulseDot color={TONE_TEXT[tone]} size={6} />}
      {children}
    </span>
  );
}
