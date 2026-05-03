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
  valueRaw,
  sub,
  ensName,
}: {
  rowKey: string;
  label: string;
  value: ReactNode;
  /**
   * Optional unmodified version of `value` used for href derivation only.
   * Pass this when `value` is a display-shortened string (e.g.
   * `0g://0xd8f…4982c4` or `0x6641…600b`) — otherwise the link href will
   * be built from the truncated text and 404 on the explorer. When
   * absent, falls back to `value` (string-coerced) for backwards
   * compatibility.
   */
  valueRaw?: string;
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
  // Use valueRaw (unmodified source) for href derivation; only use the
  // string form of `value` as a last-resort fallback.
  const hrefSource =
    valueRaw ?? (typeof value === "string" ? value : String(value));
  const firstToken = hrefSource.trim().split(/\s+/)[0] ?? "";
  let resolvedHref: string | null = null;
  let resolvedLabel = "View on chain ↗";
  if (/^0x[a-fA-F0-9]{40}$/.test(firstToken)) {
    resolvedHref = galileoAddr(firstToken);
    resolvedLabel = "View address on Galileo ↗";
  } else if (/^0g:\/\/0x[a-fA-F0-9]{64}$/.test(firstToken)) {
    // Only treat as a real CID when the root is a full 32-byte hex —
    // catches truncated display strings (`0g://0xd8f…4982c4`) and falls
    // through to no link rather than producing a bogus URL.
    resolvedHref = ogStorageCid(firstToken);
    resolvedLabel = "View blob on 0G storage ↗";
  } else if (rowKey === "rep" && /0x8004/.test(hrefSource)) {
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
