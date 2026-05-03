"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useBalance, useChainId, useSwitchChain } from "wagmi";
import { formatUnits } from "viem";
import { galileo } from "@/lib/chains";

const NAV_LINKS = [
  { label: "Register", route: "/register" },
  { label: "Catalogue", route: "/" },
  { label: "Live Jobs", route: "/jobs" },
  { label: "Marketplace", route: "/marketplace" },
  { label: "How it Works", route: "/about" },
  { label: "Pitch", route: "/pitch" },
];

// Ledger is single-chain on the wallet side. All writes (postTask, mint,
// transferFrom, releasePayment) go to 0G Galileo. ERC-8004 reputation reads
// on Base Sepolia and ENS reads on Sepolia happen server-side via public
// clients — the user's wallet never needs to be on those networks.
const PRIMARY_CHAIN = { id: galileo.id, name: "0G Galileo" } as const;

function shortAddr(a?: string) {
  if (!a) return "";
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

export function Nav() {
  const router = useRouter();
  const path = usePathname();
  const isActive = (r: string) =>
    r === "/" ? path === "/" : path.startsWith(r);

  const { ready, authenticated, login, logout, exportWallet } = usePrivy();
  const { wallets } = useWallets();
  const activeWallet = wallets[0];
  const address = activeWallet?.address as `0x${string}` | undefined;

  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const onPrimary = chainId === PRIMARY_CHAIN.id;

  // Always display the Galileo balance (single source of truth for the demo).
  const { data: bal } = useBalance({ address, chainId: PRIMARY_CHAIN.id });
  const balText = bal
    ? `${Number(formatUnits(bal.value, bal.decimals)).toFixed(4)} ${bal.symbol}`
    : "…";

  const [acctOpen, setAcctOpen] = useState(false);
  const acctRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (acctRef.current && !acctRef.current.contains(e.target as Node))
        setAcctOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const avatarUrl = address
    ? `https://api.dicebear.com/9.x/shapes/svg?seed=${address}`
    : null;

  const copyAddress = async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setAcctOpen(false);
  };

  return (
    <header className="nav">
      <div style={{ display: "flex", alignItems: "center" }}>
        <button
          className="nav-wm"
          onClick={() => router.push("/")}
          aria-label="Ledger — home"
        >
          Ledger
        </button>
      </div>
      <nav className="nav-links" aria-label="Primary">
        {NAV_LINKS.map((l) => (
          <Link
            key={l.route}
            href={l.route}
            className={isActive(l.route) ? "active" : ""}
          >
            {l.label}
          </Link>
        ))}
      </nav>
      <div className="nav-right">
        {!ready ? (
          <span className="nav-bal" style={{ opacity: 0.5 }}>
            …
          </span>
        ) : !authenticated ? (
          <button
            className="btn"
            onClick={() => login()}
            style={{ cursor: "pointer" }}
          >
            Connect Wallet
          </button>
        ) : (
          <>
            {/* Network indicator. Single chain (Galileo). If the wallet is on a
                different network, surface an explicit wrong-network pill so the
                user can fix it before /post forces a switch. */}
            {onPrimary ? (
              <span
                className="nav-bal"
                title={`${PRIMARY_CHAIN.name} · the only network this app uses`}
              >
                {PRIMARY_CHAIN.name}
              </span>
            ) : (
              <button
                className="nav-bal"
                onClick={() => switchChain({ chainId: PRIMARY_CHAIN.id })}
                title="Wrong network — click to switch to 0G Galileo"
                style={{
                  cursor: "pointer",
                  border: "1px solid var(--ledger-oxblood)",
                  color: "var(--ledger-oxblood)",
                  background: "transparent",
                }}
              >
                Wrong network · switch to {PRIMARY_CHAIN.name}
              </button>
            )}

            {/* Native balance pill (always shows Galileo balance). */}
            <span
              className="nav-bal"
              title={`${PRIMARY_CHAIN.name} native balance`}
            >
              {balText}
            </span>

            {/* Wallet button + dropdown */}
            <div ref={acctRef} style={{ position: "relative" }}>
              <button
                className="nav-addr"
                onClick={() => setAcctOpen((v) => !v)}
                style={{
                  cursor: "pointer",
                  background: "transparent",
                  border: 0,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  color: "inherit",
                }}
              >
                {avatarUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt=""
                    width={20}
                    height={20}
                    style={{ borderRadius: "50%" }}
                  />
                )}
                <span>{shortAddr(address)}</span>
              </button>
              {acctOpen && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "calc(100% + 6px)",
                    minWidth: 220,
                    background: "var(--ledger-ink)",
                    border: "1px solid rgba(255,255,255,0.16)",
                    boxShadow: "0 12px 32px rgba(0,0,0,0.4)",
                    zIndex: 50,
                  }}
                >
                  <Link
                    href="/wallet"
                    onClick={() => setAcctOpen(false)}
                    style={menuItemStyle}
                  >
                    Wallet
                  </Link>
                  {activeWallet?.walletClientType === "privy" && (
                    <button
                      onClick={() => {
                        exportWallet();
                        setAcctOpen(false);
                      }}
                      style={menuButtonStyle}
                    >
                      Manage Wallet
                    </button>
                  )}
                  <button onClick={copyAddress} style={menuButtonStyle}>
                    Copy address
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      setAcctOpen(false);
                    }}
                    style={{ ...menuButtonStyle, color: "#E07B6A" }}
                  >
                    Disconnect
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
}

const menuItemStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  textAlign: "left",
  padding: "10px 14px",
  color: "var(--ledger-paper)",
  textDecoration: "none",
  fontSize: 13,
  cursor: "pointer",
};

const menuButtonStyle: React.CSSProperties = {
  ...menuItemStyle,
  background: "transparent",
  border: 0,
};
