"use client";

import { usePrivy, useWallets } from "@privy-io/react-auth";
import Link from "next/link";
import { Shell } from "@/components/Shell";
import { LotPlate } from "@/components/LotPlate";
import { LOTS, USER, WALLET_ACTIVITY } from "@/lib/data";

export default function WalletPage() {
  const { ready, authenticated, login } = usePrivy();
  const { wallets } = useWallets();
  const wallet = wallets[0];
  const address = wallet?.address;

  const ownedSet = new Set<string>(USER.ownedLots);
  const owned = LOTS.filter((l) => ownedSet.has(l.lot));

  if (ready && !authenticated) {
    return (
      <Shell>
        <div
          className="page"
          style={{
            padding: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "calc(100vh - 200px)",
          }}
        >
          <div style={{ textAlign: "center", maxWidth: 480 }}>
            <h1
              style={{
                fontFamily: "var(--ledger-font-display)",
                fontStyle: "italic",
                fontWeight: 900,
                fontSize: 56,
                letterSpacing: "-0.03em",
                margin: "0 0 16px",
                color: "var(--ledger-paper)",
              }}
            >
              Wallet locked.
            </h1>
            <p className="muted" style={{ margin: "0 0 28px", fontSize: 15 }}>
              Connect a wallet to see owned worker iNFTs, accrued earnings, and
              recent on-chain activity.
            </p>
            <button
              onClick={() => login()}
              className="btn"
              style={{ padding: "14px 24px", fontSize: 14, cursor: "pointer" }}
            >
              Connect Wallet
            </button>
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="page" style={{ padding: 40 }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <h1
            style={{
              fontFamily: "var(--ledger-font-display)",
              fontStyle: "italic",
              fontWeight: 900,
              fontSize: 64,
              letterSpacing: "-0.03em",
              margin: 0,
              color: "var(--ledger-paper)",
            }}
          >
            My wallet.
          </h1>
          {wallet?.walletClientType && (
            <span className="caps-sm muted">
              VIA {wallet.walletClientType.toUpperCase()}
            </span>
          )}
        </div>
        <div className="mono muted" style={{ marginBottom: 40, fontSize: 14 }}>
          {address ?? "…"}
        </div>

        {/* Owned (demo data) */}
        <div style={{ marginBottom: 56 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: 18,
            }}
          >
            <span className="caps-md muted">OWNED LOTS — {owned.length}</span>
            <span className="caps-md muted">
              REALIZED THIS MONTH ·{" "}
              <span className="italic-num text-gold" style={{ fontSize: 18 }}>
                1,847.50 USDC
              </span>
            </span>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 24,
            }}
          >
            {owned.map((l) => (
              <WalletLot key={l.lot} lot={l} />
            ))}
          </div>
        </div>

        {/* Activity */}
        <div>
          <div className="caps-md muted" style={{ marginBottom: 18 }}>
            ACTIVITY
          </div>
          <div>
            {WALLET_ACTIVITY.map((a, i) => (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  padding: "14px 0",
                  borderBottom: "1px solid rgba(245,241,232,0.08)",
                  alignItems: "baseline",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--ledger-font-display)",
                    fontStyle: "italic",
                    fontWeight: 700,
                    fontSize: 18,
                    color: "var(--ledger-paper)",
                  }}
                >
                  {a.event}
                </span>
                <span className="caps-sm muted">{a.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Shell>
  );
}

function WalletLot({ lot }: { lot: import("@/lib/data").Lot }) {
  const earnedThisMonth = (lot.earnedNum * 0.12).toFixed(2);
  return (
    <div>
      <LotPlate lot={lot} />
      <div
        style={{
          marginTop: 10,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
        }}
      >
        <span className="caps-sm muted">THIS MONTH</span>
        <span
          className="italic-num"
          style={{ fontSize: 18, color: "var(--ledger-paper)" }}
        >
          +{earnedThisMonth} USDC
        </span>
      </div>
      <Link
        href={`/agent/${encodeURIComponent(lot.ens)}`}
        className="btn-text"
        style={{
          display: "block",
          marginTop: 12,
          border: "1px solid rgba(245,241,232,0.3)",
          padding: "10px 20px",
          color: "var(--ledger-paper)",
          width: "100%",
          textAlign: "center",
        }}
      >
        Manage →
      </Link>
    </div>
  );
}
