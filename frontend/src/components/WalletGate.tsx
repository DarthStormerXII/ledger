"use client";

import { type ReactNode } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { galileo } from "@/lib/chains";

/**
 * WalletGate — drop-in gate for any UI region that requires a connected
 * wallet on 0G Galileo (the only network this app writes to).
 *
 * States:
 *  - loading           → renders a skeleton card
 *  - not connected     → renders a Connect prompt
 *  - wrong network     → renders a Switch prompt
 *  - ready             → renders children
 *
 * Use anywhere a user might click a button that triggers a chain write,
 * a Privy export, or any other wallet-bound interaction. The gate
 * surfaces the requirement up front so users don't bump into errors
 * mid-flow.
 *
 * Usage:
 *   <WalletGate
 *     title="Connect to mint your worker"
 *     description="You'll sign two transactions on 0G Galileo."
 *   >
 *     <MintButton />
 *     <RegisterIdentityButton />
 *   </WalletGate>
 */
export function WalletGate({
  title = "Connect your wallet",
  description,
  children,
  /**
   * "block" (default) replaces children with the gate card while
   * the wallet isn't ready.
   * "inline" keeps children visible (e.g. a form the user can still
   * fill in) and shows a banner above them with the same call-to-action.
   */
  variant = "block",
}: {
  title?: string;
  description?: ReactNode;
  children: ReactNode;
  variant?: "block" | "inline";
}) {
  const { ready, authenticated, login } = usePrivy();
  const { address } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync, isPending: isSwitching } = useSwitchChain();
  const onGalileo = chainId === galileo.id;
  const connected = !!authenticated && !!address;
  const allClear = ready && connected && onGalileo;

  // ── Render children when fully ready ──
  if (allClear) return <>{children}</>;

  // ── Determine state + CTA copy ──
  const state: "loading" | "connect" | "switch" = !ready
    ? "loading"
    : !connected
      ? "connect"
      : "switch";

  const heading =
    state === "loading"
      ? "Loading wallet…"
      : state === "connect"
        ? title
        : "Wrong network";

  const body =
    state === "loading" ? (
      "Detecting your wallet session."
    ) : state === "connect" ? (
      (description ?? (
        <>
          You need a connected wallet to use this part of Ledger. The app writes
          only to <strong>0G Galileo</strong> (chainId 16602) — gas in OG. Get
          testnet OG from{" "}
          <a
            href="https://faucet.0g.ai"
            target="_blank"
            rel="noreferrer"
            className="walletgate-link"
          >
            faucet.0g.ai
          </a>
          .
        </>
      ))
    ) : (
      <>
        Your wallet is on the wrong network. Switch to{" "}
        <strong>0G Galileo</strong> to continue — every write in this app
        targets that chain.
      </>
    );

  const cta =
    state === "loading" ? null : state === "connect" ? (
      <button className="btn walletgate-cta" onClick={() => login()}>
        Connect Wallet
      </button>
    ) : (
      <button
        className="btn walletgate-cta"
        disabled={isSwitching}
        onClick={() =>
          switchChainAsync({ chainId: galileo.id }).catch(() => {
            /* user rejected — silent; gate stays */
          })
        }
      >
        {isSwitching ? "Switching…" : "Switch to 0G Galileo"}
      </button>
    );

  // ── Card render ──
  const card = (
    <div
      className="walletgate-card"
      role="alert"
      aria-live="polite"
      data-state={state}
    >
      <div className="caps-md walletgate-eyebrow">
        REQUIRES CONNECTED WALLET
      </div>
      <h3 className="walletgate-heading">{heading}</h3>
      <p className="walletgate-body">{body}</p>
      {cta}
    </div>
  );

  if (variant === "inline") {
    return (
      <>
        <div className="walletgate-banner">{card}</div>
        <div aria-hidden style={{ opacity: 0.55, pointerEvents: "none" }}>
          {children}
        </div>
      </>
    );
  }

  return card;
}

/**
 * Hook for places that need the same state without rendering a card.
 * (e.g. a single button that wants to render its own Connect / Switch
 * label inline.)
 */
export function useWalletReady() {
  const { ready, authenticated, login } = usePrivy();
  const { address } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync, isPending: isSwitching } = useSwitchChain();
  const onGalileo = chainId === galileo.id;
  const connected = !!authenticated && !!address;
  return {
    ready,
    connected,
    onGalileo,
    address,
    chainId,
    isSwitching,
    allClear: ready && connected && onGalileo,
    requireConnected: async (): Promise<boolean> => {
      if (!ready) return false;
      if (!connected) {
        login();
        return false;
      }
      if (!onGalileo) {
        try {
          await switchChainAsync({ chainId: galileo.id });
          return true;
        } catch {
          return false;
        }
      }
      return true;
    },
  };
}
