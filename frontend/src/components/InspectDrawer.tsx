"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * InspectDrawer — progressive-disclosure side panel.
 *
 * Mounted on worker cards and job cards so the marketplace UI stays clean
 * while every technical artifact (tx hashes, peer IDs, attestation digests,
 * storage CIDs, ENS namespace responses) is one click away. Linear / Vercel
 * deployment-detail pattern.
 */

export type InspectGroup = {
  title: string;
  rows: {
    label: string;
    value: string;
    href?: string;
    mono?: boolean;
    caption?: string;
  }[];
};

export function InspectDrawer({
  open,
  onClose,
  title,
  subtitle,
  groups,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  groups: InspectGroup[];
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(10, 10, 14, 0.72)",
          backdropFilter: "blur(2px)",
          zIndex: 60,
        }}
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-label={`Technical details for ${title}`}
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          height: "100vh",
          width: "min(560px, 100vw)",
          background: "var(--ledger-ink-deep)",
          borderLeft: "1px solid var(--ledger-border-on-dark)",
          zIndex: 70,
          overflowY: "auto",
          color: "var(--ledger-paper)",
          fontFamily: "var(--ledger-font-body)",
          boxShadow: "-12px 0 40px rgba(0, 0, 0, 0.4)",
        }}
      >
        {/* Header */}
        <header
          style={{
            position: "sticky",
            top: 0,
            background: "var(--ledger-ink-deep)",
            borderBottom: "1px solid var(--ledger-border-on-dark)",
            padding: "20px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 24,
          }}
        >
          <div>
            <div
              className="caps-md"
              style={{
                color: "var(--ledger-gold-leaf)",
                marginBottom: 6,
                letterSpacing: "0.14em",
                fontSize: 11,
              }}
            >
              INSPECT · TECHNICAL RECORD
            </div>
            <div
              style={{
                fontFamily: "var(--ledger-font-display)",
                fontStyle: "italic",
                fontWeight: 800,
                fontSize: 28,
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
              }}
            >
              {title}
            </div>
            {subtitle ? (
              <div
                style={{
                  fontFamily: "var(--ledger-font-mono)",
                  fontSize: 12,
                  color: "var(--ledger-ink-muted)",
                  marginTop: 6,
                  wordBreak: "break-all",
                }}
              >
                {subtitle}
              </div>
            ) : null}
          </div>
          <button
            onClick={onClose}
            aria-label="Close inspect drawer"
            style={{
              background: "transparent",
              border: "1px solid var(--ledger-border-on-dark)",
              color: "var(--ledger-paper)",
              padding: "6px 12px",
              fontSize: 14,
              fontFamily: "var(--ledger-font-mono)",
              flexShrink: 0,
            }}
          >
            ESC ✕
          </button>
        </header>

        {/* Body */}
        <div style={{ padding: "8px 24px 64px" }}>
          {groups.map((g, gi) => (
            <section key={gi} style={{ paddingTop: 24 }}>
              <div
                className="caps-md"
                style={{
                  color: "var(--ledger-ink-muted)",
                  fontSize: 11,
                  letterSpacing: "0.14em",
                  marginBottom: 12,
                }}
              >
                {g.title}
              </div>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 13,
                }}
              >
                <tbody>
                  {g.rows.map((r, ri) => (
                    <tr
                      key={ri}
                      style={{
                        borderBottom: "1px solid var(--ledger-border-on-dark)",
                      }}
                    >
                      <td
                        style={{
                          padding: "12px 16px 12px 0",
                          verticalAlign: "top",
                          color: "var(--ledger-ink-muted)",
                          fontSize: 12,
                          width: 160,
                          lineHeight: 1.5,
                        }}
                      >
                        {r.label}
                      </td>
                      <td style={{ padding: "12px 0", verticalAlign: "top" }}>
                        {r.href ? (
                          <Link
                            href={r.href}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              fontFamily: r.mono
                                ? "var(--ledger-font-mono)"
                                : "var(--ledger-font-body)",
                              fontSize: r.mono ? 11 : 13,
                              color: "var(--ledger-gold-leaf)",
                              borderBottom: "1px solid var(--ledger-gold-dim)",
                              wordBreak: "break-all",
                              lineHeight: 1.5,
                            }}
                          >
                            {r.value}
                          </Link>
                        ) : (
                          <span
                            style={{
                              fontFamily: r.mono
                                ? "var(--ledger-font-mono)"
                                : "var(--ledger-font-body)",
                              fontSize: r.mono ? 11 : 13,
                              color: "var(--ledger-paper)",
                              wordBreak: "break-all",
                              lineHeight: 1.5,
                            }}
                          >
                            {r.value}
                          </span>
                        )}
                        {r.caption ? (
                          <div
                            style={{
                              marginTop: 4,
                              fontSize: 11,
                              color: "var(--ledger-ink-muted)",
                              lineHeight: 1.5,
                            }}
                          >
                            {r.caption}
                          </div>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          ))}

          <p
            style={{
              fontSize: 12,
              color: "var(--ledger-ink-muted)",
              lineHeight: 1.6,
              marginTop: 32,
            }}
          >
            Want the full set of artifacts across all sponsors?{" "}
            <Link
              href="/proof"
              style={{
                color: "var(--ledger-gold-leaf)",
                borderBottom: "1px solid var(--ledger-gold-dim)",
              }}
            >
              See /proof
            </Link>
            .
          </p>
        </div>
      </aside>
    </>
  );
}

/**
 * Compact "Inspect ↗" pill — drop next to a card title or in a tray.
 */
export function InspectPill({
  onClick,
  label = "Inspect",
}: {
  onClick: () => void;
  label?: string;
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      style={{
        background: "transparent",
        border: "1px solid var(--ledger-border-on-dark)",
        color: "var(--ledger-paper)",
        padding: "4px 10px",
        fontSize: 11,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        fontFamily: "var(--ledger-font-mono)",
        cursor: "pointer",
        whiteSpace: "nowrap",
      }}
    >
      {label} ↗
    </button>
  );
}
