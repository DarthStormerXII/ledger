"use client";

import { usePrivy, useWallets } from "@privy-io/react-auth";
import Link from "next/link";
import { Shell } from "@/components/Shell";
import { LotPlate } from "@/components/LotPlate";
import type { Lot } from "@/lib/data";

export default function WalletClient({ allLots }: { allLots: Lot[] }) {
  const { ready, authenticated, login } = usePrivy();
  const { wallets } = useWallets();
  const wallet = wallets[0];
  const address = wallet?.address?.toLowerCase();

  // Live filter: lots whose owner == connected address
  const owned = address
    ? allLots.filter((l) => l.owner.toLowerCase() === address)
    : [];
  const realizedTotal = owned
    .reduce((acc, l) => acc + l.earnedNum, 0)
    .toFixed(4);

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
              Connect a wallet to see your owned worker iNFTs and on-chain
              earnings.
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
          {wallet?.address ?? "…"}
        </div>

        {/* Owned — live derived from chain */}
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
              EARNED ON CHAIN ·{" "}
              <span className="italic-num text-gold" style={{ fontSize: 18 }}>
                {realizedTotal} 0G
              </span>
            </span>
          </div>
          {owned.length === 0 ? (
            <div
              style={{
                padding: "40px 24px",
                border: "1px dashed rgba(245,241,232,0.16)",
                borderRadius: 8,
                textAlign: "center",
                color: "var(--ledger-ink-muted)",
                fontSize: 13,
              }}
            >
              You don&rsquo;t own any worker iNFTs on this address. Mint one
              with{" "}
              <code style={{ fontFamily: "var(--ledger-font-mono)" }}>
                pnpm tsx tools/register.ts
              </code>{" "}
              or browse{" "}
              <Link href="/marketplace" className="text-gold">
                the marketplace
              </Link>
              .
            </div>
          ) : (
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
          )}
        </div>

        {/* Activity — placeholder until we wire per-address event scan */}
        <div>
          <div className="caps-md muted" style={{ marginBottom: 18 }}>
            ACTIVITY · LIVE EVENTS COMING SOON
          </div>
          <div
            style={{
              padding: "24px",
              color: "var(--ledger-ink-muted)",
              fontSize: 13,
              borderTop: "1px solid rgba(245,241,232,0.08)",
            }}
          >
            Per-address Transfer + escrow event scan ships next iteration. For
            now, the global feed lives on{" "}
            <Link href="/" className="text-gold">
              the catalogue
            </Link>{" "}
            ticker.
          </div>
        </div>
      </div>
    </Shell>
  );
}

function WalletLot({ lot }: { lot: Lot }) {
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
        <span className="caps-sm muted">EARNED</span>
        <span
          className="italic-num"
          style={{ fontSize: 18, color: "var(--ledger-paper)" }}
        >
          +{lot.earned} 0G
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
