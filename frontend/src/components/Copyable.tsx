"use client";

import { useEffect, useState } from "react";

export function Copyable({
  value,
  display,
  className,
  ariaLabel,
}: {
  value: string;
  display?: string;
  className?: string;
  ariaLabel?: string;
}) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 1200);
    return () => window.clearTimeout(t);
  }, [copied]);
  return (
    <button
      type="button"
      aria-label={ariaLabel ?? `Copy ${value}`}
      onClick={(e) => {
        e.preventDefault();
        if (typeof navigator !== "undefined" && navigator.clipboard) {
          navigator.clipboard.writeText(value).catch(() => {});
        }
        setCopied(true);
      }}
      className={`group relative inline-flex items-center gap-1 transition-colors duration-150 hover:text-[color:var(--ledger-paper)] ${className ?? ""}`}
    >
      <span>{display ?? value}</span>
      {copied && (
        <span
          className="ledger-caps-sm absolute left-1/2 -top-6 -translate-x-1/2 whitespace-nowrap border border-[var(--ledger-success)] bg-[color:var(--ledger-ink-elevated)] px-1.5 py-0.5 text-[color:var(--ledger-success)]"
          aria-live="polite"
        >
          Copied
        </span>
      )}
    </button>
  );
}
