"use client";

import { type ReactNode, useState } from "react";
import {
  ensSepoliaName,
  galileoAddr,
  baseSepoliaAddr,
  ogStorageCid,
} from "@/lib/contracts";

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
  // The fully-qualified subname that the ENS app should open. e.g. for
  // rowKey="who" and ensName="worker-001.ledger.eth" we want
  // "who.worker-001.ledger.eth".
  const subname = rowKey === "parent" ? ensName : `${rowKey}.${ensName}`;
  const ensAppUrl = ensSepoliaName(subname);
  // For rows whose value is an address or CID, build a chain-specific deep
  // link so judges can verify the resolved value too, not just the name.
  const valueText = typeof value === "string" ? value : String(value);
  const firstToken = valueText.trim().split(/\s+/)[0] ?? "";
  let resolvedHref: string | null = null;
  let resolvedLabel = "View on chain ↗";
  if (/^0x[a-fA-F0-9]{40}$/.test(firstToken)) {
    resolvedHref = galileoAddr(firstToken);
    resolvedLabel = "View address on Galileo ↗";
  } else if (/^0g:\/\//.test(firstToken)) {
    resolvedHref = ogStorageCid(firstToken);
    resolvedLabel = "View blob on 0G storage ↗";
  } else if (rowKey === "rep" && /0x8004/.test(valueText)) {
    resolvedHref = baseSepoliaAddr(
      "0x8004B663056A597Dffe9eCcC1965A193B7388713",
    );
    resolvedLabel = "View ERC-8004 registry on Base ↗";
  }
  const [open, setOpen] = useState(false);
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
            {`{"node":"${subname}","value":"${firstToken}","source":"live-or-explicitly-disclosed"}`}
          </div>
          <div
            style={{
              display: "flex",
              gap: 16,
              flexWrap: "wrap",
              marginTop: 12,
              fontSize: 12,
            }}
          >
            <a
              href={ensAppUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="btn-text"
              style={{
                color: "var(--ledger-gold-leaf)",
                borderBottom: "1px solid var(--ledger-gold-dim)",
                paddingBottom: 2,
              }}
            >
              Open {subname} on ENS app ↗
            </a>
            {resolvedHref ? (
              <a
                href={resolvedHref}
                target="_blank"
                rel="noreferrer noopener"
                className="btn-text"
                style={{
                  color: "var(--ledger-gold-leaf)",
                  borderBottom: "1px solid var(--ledger-gold-dim)",
                  paddingBottom: 2,
                }}
              >
                {resolvedLabel}
              </a>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
