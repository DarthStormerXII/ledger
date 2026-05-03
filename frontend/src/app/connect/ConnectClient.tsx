"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";

export function ConnectClient() {
  const router = useRouter();
  const { ready, authenticated, login } = usePrivy();

  useEffect(() => {
    if (ready && authenticated) {
      router.replace("/");
    }
  }, [ready, authenticated, router]);

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
            margin: "0 0 16px",
            color: "var(--ledger-ink)",
          }}
        >
          Connect.
        </h2>
        <p
          className="muted"
          style={{ margin: "0 0 28px", fontSize: 14, lineHeight: 1.6 }}
        >
          Sign in with an external wallet (MetaMask, Coinbase Wallet,
          WalletConnect) or create an embedded wallet via email or Google.
          Funded testnet 0G is required for actions on Galileo; ETH on Sepolia
          and Base Sepolia for ENS and ERC-8004 reads.
        </p>

        <button
          onClick={() => login()}
          disabled={!ready}
          className="btn"
          style={{
            width: "100%",
            padding: "14px 18px",
            fontSize: 15,
            cursor: ready ? "pointer" : "wait",
            opacity: ready ? 1 : 0.6,
          }}
        >
          {ready ? "Open wallet" : "Loading…"}
        </button>

        <div
          className="caps-sm"
          style={{
            marginTop: 24,
            color: "var(--ledger-ink-muted)",
            fontSize: 11,
            lineHeight: 1.5,
          }}
        >
          BY CONNECTING YOU AGREE TO THE NETWORK&apos;S TESTNET TERMS · YOUR
          KEYS NEVER LEAVE YOUR DEVICE
        </div>
      </div>
    </div>
  );
}
