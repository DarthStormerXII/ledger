"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type State = "idle" | "loading" | "connected";
const WALLETS = ["MetaMask", "WalletConnect", "Coinbase Wallet"] as const;

export function ConnectClient() {
  const router = useRouter();
  const [state, setState] = useState<State>("idle");
  const [chosen, setChosen] = useState<string | null>(null);

  const choose = (w: string) => {
    setChosen(w);
    setState("loading");
    window.setTimeout(() => {
      setState("connected");
      window.setTimeout(() => router.push("/"), 1200);
    }, 2000);
  };

  return (
    <div
      className="page"
      style={{
        padding: 40,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "calc(100vh - 112px)",
      }}
    >
      <div
        style={{
          width: 480,
          padding: 32,
          border: "1px solid var(--ledger-ink)",
          background: "var(--ledger-paper)",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--ledger-font-display)",
            fontStyle: "italic",
            fontWeight: 900,
            fontSize: 32,
            letterSpacing: "-0.02em",
            margin: "0 0 24px",
            color: "var(--ledger-ink)",
          }}
        >
          Connect.
        </h2>

        {state === "idle" && (
          <div>
            {WALLETS.map((w, i) => (
              <div
                key={w}
                onClick={() => choose(w)}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "18px 0",
                  borderBottom:
                    i < 2 ? "1px solid rgba(15,15,18,0.16)" : "none",
                  cursor: "pointer",
                }}
                className="hover-oxblood"
              >
                <span
                  style={{
                    fontFamily: "var(--ledger-font-display)",
                    fontStyle: "italic",
                    fontWeight: 700,
                    fontSize: 22,
                    color: "var(--ledger-ink)",
                  }}
                >
                  {w}
                </span>
                <span
                  className="caps-sm"
                  style={{ color: "var(--ledger-ink-muted)" }}
                >
                  →
                </span>
              </div>
            ))}
          </div>
        )}

        {state === "loading" && chosen && (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div
              style={{
                width: 32,
                height: 32,
                border: "1px solid var(--ledger-oxblood)",
                borderTopColor: "transparent",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
                margin: "0 auto 18px",
              }}
            />
            <div
              className="caps-md"
              style={{ color: "var(--ledger-ink-muted)" }}
            >
              CONNECTING TO {chosen.toUpperCase()}
            </div>
          </div>
        )}

        {state === "connected" && (
          <div style={{ padding: "24px 0", textAlign: "center" }}>
            <div
              style={{
                fontFamily: "var(--ledger-font-display)",
                fontStyle: "italic",
                fontWeight: 700,
                fontSize: 18,
                color: "var(--ledger-ink-soft)",
              }}
            >
              Connected. 0x742d…bEb1.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
