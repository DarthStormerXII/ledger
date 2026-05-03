"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useBalance, useChainId, useSwitchChain } from "wagmi";
import { formatUnits } from "viem";
import { galileo, baseSepolia, sepolia } from "@/lib/chains";

const NAV_LINKS = [
  { label: "Catalogue", route: "/" },
  { label: "Live Jobs", route: "/jobs" },
  { label: "Marketplace", route: "/marketplace" },
  { label: "How it Works", route: "/about" },
];

const SUPPORTED_CHAINS = [
  { id: galileo.id, name: "0G Galileo" },
  { id: baseSepolia.id, name: "Base Sepolia" },
  { id: sepolia.id, name: "Sepolia" },
] as const;

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
  const activeChain =
    SUPPORTED_CHAINS.find((c) => c.id === chainId) ?? SUPPORTED_CHAINS[0];

  const { data: bal } = useBalance({ address, chainId: activeChain.id });
  const balText = bal
    ? `${Number(formatUnits(bal.value, bal.decimals)).toFixed(4)} ${bal.symbol}`
    : "…";

  const [chainOpen, setChainOpen] = useState(false);
  const [acctOpen, setAcctOpen] = useState(false);
  const chainRef = useRef<HTMLDivElement>(null);
  const acctRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (chainRef.current && !chainRef.current.contains(e.target as Node))
        setChainOpen(false);
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
            {/* Chain switcher */}
            <div ref={chainRef} style={{ position: "relative" }}>
              <button
                className="nav-bal"
                onClick={() => setChainOpen((v) => !v)}
                style={{
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  border: "1px solid rgba(255,255,255,0.16)",
                  background: "transparent",
                  color: "inherit",
                }}
              >
                <span>{activeChain.name}</span>
                <span style={{ opacity: 0.5 }}>▾</span>
              </button>
              {chainOpen && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "calc(100% + 6px)",
                    minWidth: 180,
                    background: "var(--ledger-ink)",
                    border: "1px solid rgba(255,255,255,0.16)",
                    boxShadow: "0 12px 32px rgba(0,0,0,0.4)",
                    zIndex: 50,
                  }}
                >
                  {SUPPORTED_CHAINS.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        switchChain({ chainId: c.id });
                        setChainOpen(false);
                      }}
                      style={{
                        display: "block",
                        width: "100%",
                        textAlign: "left",
                        padding: "10px 14px",
                        background:
                          c.id === activeChain.id
                            ? "rgba(169,27,13,0.16)"
                            : "transparent",
                        color: "var(--ledger-paper)",
                        border: 0,
                        cursor: "pointer",
                        fontSize: 13,
                      }}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Native balance pill */}
            <span
              className="nav-bal"
              title={`${activeChain.name} native balance`}
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
