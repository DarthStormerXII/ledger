"use client";

import { type ReactNode, useState } from "react";

export function CapabilityRow({
  rowKey,
  label,
  value,
  sub,
  ensName,
}: {
  rowKey: string;
  label: string;
  value: ReactNode;
  sub?: string;
  ensName: string;
}) {
  const [open, setOpen] = useState(false);
  const valueText = typeof value === "string" ? value : String(value);
  return (
    <div style={{ borderBottom: "1px solid rgba(245,241,232,0.16)" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "100px 1fr auto",
          alignItems: "center",
          padding: "16px 0",
          minHeight: 56,
        }}
      >
        <span className="caps-md" style={{ color: "var(--ledger-paper)" }}>
          {label}
        </span>
        <div>
          <div
            className="mono"
            style={{ fontSize: 14, color: "var(--ledger-paper)" }}
          >
            {value}
          </div>
          {sub && (
            <div className="mono muted" style={{ fontSize: 12 }}>
              {sub}
            </div>
          )}
        </div>
        <button
          className="btn-text"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          Verify →
        </button>
      </div>
      {open && (
        <div
          style={{
            padding: "14px 16px 18px",
            background: "rgba(245,241,232,0.03)",
            animation: "slidedown 200ms ease-out",
          }}
        >
          <div className="caps-sm muted" style={{ marginBottom: 6 }}>
            RESOLUTION SOURCE
          </div>
          <div
            className="mono"
            style={{
              fontSize: 11,
              lineHeight: 1.6,
              color: "var(--ledger-paper)",
              opacity: 0.85,
              wordBreak: "break-all",
            }}
          >
            {`{"node":"${rowKey}.${ensName}","value":"${valueText.split(" ")[0]}","source":"live-or-explicitly-disclosed"}`}
          </div>
        </div>
      )}
    </div>
  );
}
