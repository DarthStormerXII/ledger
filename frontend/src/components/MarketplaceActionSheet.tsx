"use client";

import { useEffect, useMemo, useState, type MouseEvent } from "react";
import { usePrivy } from "@privy-io/react-auth";
import {
  useAccount,
  useChainId,
  useSwitchChain,
  useWriteContract,
  useWaitForTransactionReceipt,
  useBalance,
} from "wagmi";
import { parseEther, formatEther, type Hex } from "viem";
import { galileo } from "@/lib/chains";
import {
  LEDGER_MARKETPLACE_ADDRESS,
  LEDGER_MARKETPLACE_ABI,
  WORKER_INFT_ADDRESS,
  WORKER_INFT_APPROVE_ABI,
  DEMO_TEE_SEALED_KEY,
  DEMO_TEE_PROOF,
  galileoTx,
  galileoAddr,
} from "@/lib/contracts";
import type { Lot } from "@/lib/data";
import type { LiveListing } from "@/lib/live";

type Mode = "buy" | "offer" | "list";
type Phase = "idle" | "needs-approve" | "submitted" | "confirmed" | "failed";

const MIN_GAS_OG = parseEther("0.0005");

export function MarketplaceActionSheet({
  lot,
  liveListing,
  initialMode,
  open,
  onClose,
}: {
  lot: Lot;
  liveListing: LiveListing | null;
  initialMode: Mode;
  open: boolean;
  onClose: () => void;
}) {
  const { ready, authenticated, login } = usePrivy();
  const { address } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const { data: bal } = useBalance({
    address,
    chainId: galileo.id,
    query: { enabled: !!address && open },
  });

  const tokenId = useMemo(() => {
    const n = Number.parseInt(lot.lot, 10);
    return Number.isFinite(n) ? BigInt(n) : 0n;
  }, [lot.lot]);

  const isOwner =
    !!address && address.toLowerCase() === lot.owner.toLowerCase();

  // If owner is viewing their own listing → default to "list" instead of buy
  const mode: Mode = isOwner && initialMode === "buy" ? "list" : initialMode;

  // Sheet is unmounted when closed (parent gates render), so initial state
  // recomputes on each open — no reset effect needed.
  const [bidEth, setBidEth] = useState<string>(
    liveListing?.askPriceFormatted ?? lot.askPrice ?? "0.01",
  );

  const [tx, setTx] = useState<Hex | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");

  const { writeContractAsync, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash: tx ?? undefined,
      chainId: galileo.id,
      query: { enabled: !!tx },
    });
  const effectivePhase: Phase | "signing" | "confirming" | "confirmed" =
    isPending
      ? "signing"
      : tx && isConfirming
        ? "confirming"
        : tx && isConfirmed
          ? "confirmed"
          : phase;

  // ESC closes
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const askPriceWei = (() => {
    try {
      return parseEther(bidEth || "0");
    } catch {
      return 0n;
    }
  })();
  const insufficientGas =
    !!bal && mode === "buy" && bal.value < askPriceWei + MIN_GAS_OG;
  const insufficientGasForList =
    !!bal && mode === "list" && bal.value < MIN_GAS_OG;

  const stop = (e: MouseEvent) => e.stopPropagation();

  async function ensureChain(): Promise<boolean> {
    if (chainId === galileo.id) return true;
    try {
      await switchChainAsync({ chainId: galileo.id });
      return true;
    } catch (e) {
      setErrMsg(`Could not switch to 0G Galileo: ${(e as Error).message}`);
      setPhase("failed");
      return false;
    }
  }

  async function doBuy() {
    setErrMsg(null);
    if (!ready) return;
    if (!authenticated) return login();
    if (!(await ensureChain())) return;
    if (!liveListing?.active) {
      setErrMsg(
        "Listing not on-chain yet. Ask the seller to call list() — see the disclosure below.",
      );
      setPhase("failed");
      return;
    }
    try {
      const hash = await writeContractAsync({
        address: LEDGER_MARKETPLACE_ADDRESS,
        abi: LEDGER_MARKETPLACE_ABI,
        functionName: "buy",
        args: [tokenId],
        value: liveListing.askPriceWei,
        chainId: galileo.id,
      });
      setTx(hash);
    } catch (e) {
      const m = (e as Error).message ?? "rejected";
      setErrMsg(m.length > 240 ? `${m.slice(0, 240)}…` : m);
      setPhase("failed");
    }
  }

  async function doApprove() {
    setErrMsg(null);
    if (!ready) return;
    if (!authenticated) return login();
    if (!(await ensureChain())) return;
    try {
      const hash = await writeContractAsync({
        address: WORKER_INFT_ADDRESS,
        abi: WORKER_INFT_APPROVE_ABI,
        functionName: "approve",
        args: [LEDGER_MARKETPLACE_ADDRESS, tokenId],
        chainId: galileo.id,
      });
      setTx(hash);
      setPhase("needs-approve");
    } catch (e) {
      setErrMsg((e as Error).message);
      setPhase("failed");
    }
  }

  async function doList() {
    setErrMsg(null);
    if (!ready) return;
    if (!authenticated) return login();
    if (!isOwner) {
      setErrMsg("Only the iNFT owner can list.");
      setPhase("failed");
      return;
    }
    if (askPriceWei === 0n) {
      setErrMsg("Set an ask price.");
      setPhase("failed");
      return;
    }
    if (!(await ensureChain())) return;
    try {
      const hash = await writeContractAsync({
        address: LEDGER_MARKETPLACE_ADDRESS,
        abi: LEDGER_MARKETPLACE_ABI,
        functionName: "list",
        args: [
          tokenId,
          askPriceWei,
          DEMO_TEE_SEALED_KEY as Hex,
          DEMO_TEE_PROOF as Hex,
        ],
        chainId: galileo.id,
      });
      setTx(hash);
    } catch (e) {
      const m = (e as Error).message ?? "rejected";
      setErrMsg(m.length > 240 ? `${m.slice(0, 240)}…` : m);
      setPhase("failed");
    }
  }

  return (
    <>
      <div className="mp-sheet-backdrop" onClick={onClose} aria-hidden />
      <aside
        className="mp-sheet"
        role="dialog"
        aria-modal
        aria-labelledby="mp-sheet-title"
        onClick={stop}
      >
        <header className="mp-sheet-head">
          <div>
            <div className="caps-md muted" style={{ marginBottom: 6 }}>
              {mode === "buy"
                ? "QUICK BUY"
                : mode === "offer"
                  ? "MAKE OFFER"
                  : "LIST FOR SALE"}
            </div>
            <h2 id="mp-sheet-title" className="mp-sheet-title">
              {lot.ens}
            </h2>
            <div className="mono mp-sheet-sub">
              LOT {lot.lot} · ERC-7857 iNFT on 0G Galileo
            </div>
          </div>
          <button
            className="mp-sheet-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </header>

        <div className="mp-sheet-body">
          {/* Listing status pill — honest about real vs manifest */}
          <div
            className={`mp-listing-status ${liveListing?.active ? "is-live" : "is-pending"}`}
          >
            {liveListing?.active ? (
              <>
                <strong>● ON-CHAIN LISTING</strong> &nbsp; seller{" "}
                <a
                  href={galileoAddr(liveListing.seller)}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="mono"
                  onClick={stop}
                >
                  {liveListing.seller.slice(0, 6)}…
                  {liveListing.seller.slice(-4)}
                </a>{" "}
                listed for {liveListing.askPriceFormatted} 0G
              </>
            ) : lot.listed ? (
              <>
                <strong>○ DEMO LISTING</strong> — flagged in
                seeded-workers.json, not yet on-chain.{" "}
                {isOwner
                  ? "List it now to make it buyable."
                  : "Ask the owner to list it on the marketplace."}
              </>
            ) : (
              <>
                <strong>○ NOT LISTED</strong> — this iNFT is not for sale yet.
              </>
            )}
          </div>

          {/* Wallet + chain state */}
          <div className="mp-sheet-meta">
            <div>
              <div className="caps-sm muted">YOU</div>
              <div className="mono mp-sheet-meta-val">
                {!ready
                  ? "loading…"
                  : !authenticated
                    ? "not connected"
                    : address
                      ? `${address.slice(0, 6)}…${address.slice(-4)}${isOwner ? "  · owner" : ""}`
                      : "—"}
              </div>
            </div>
            <div>
              <div className="caps-sm muted">BALANCE</div>
              <div className="mono mp-sheet-meta-val">
                {bal ? `${formatEther(bal.value).slice(0, 8)} 0G` : "—"}
              </div>
            </div>
            <div>
              <div className="caps-sm muted">CHAIN</div>
              <div className="mono mp-sheet-meta-val">
                {chainId === galileo.id ? "0G Galileo" : "wrong — will switch"}
              </div>
            </div>
          </div>

          {/* Action area */}
          {mode === "buy" && (
            <BuyArea
              liveListing={liveListing}
              insufficientGas={insufficientGas}
              isOwner={isOwner}
              ready={ready}
              authenticated={authenticated}
              onLogin={login}
              onBuy={doBuy}
              phase={effectivePhase}
            />
          )}

          {mode === "list" && (
            <ListArea
              bidEth={bidEth}
              setBidEth={setBidEth}
              isOwner={isOwner}
              insufficientGas={insufficientGasForList}
              onApprove={doApprove}
              onList={doList}
              phase={effectivePhase}
            />
          )}

          {mode === "offer" && (
            <OfferArea
              bidEth={bidEth}
              setBidEth={setBidEth}
              ready={ready}
              authenticated={authenticated}
              onLogin={login}
            />
          )}

          {/* Tx receipt */}
          {tx && (
            <div className="mp-sheet-tx">
              <div className="caps-sm muted" style={{ marginBottom: 4 }}>
                {effectivePhase === "confirmed"
                  ? "✓ CONFIRMED"
                  : effectivePhase === "confirming"
                    ? "CONFIRMING…"
                    : "SUBMITTED"}
              </div>
              <a
                href={galileoTx(tx)}
                target="_blank"
                rel="noreferrer noopener"
                className="mono mp-sheet-tx-link"
                onClick={stop}
              >
                {tx.slice(0, 14)}…{tx.slice(-8)} ↗
              </a>
            </div>
          )}

          {errMsg && (
            <div className="mp-sheet-error">
              <div
                className="caps-sm"
                style={{ color: "var(--ledger-danger)" }}
              >
                ERROR
              </div>
              <div className="mono" style={{ fontSize: 12, marginTop: 4 }}>
                {errMsg}
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

// ────────────────────────────────────────────────────────────────────────
// SUB-AREAS
// ────────────────────────────────────────────────────────────────────────
function BuyArea({
  liveListing,
  insufficientGas,
  isOwner,
  ready,
  authenticated,
  onLogin,
  onBuy,
  phase,
}: {
  liveListing: LiveListing | null;
  insufficientGas: boolean;
  isOwner: boolean;
  ready: boolean;
  authenticated: boolean;
  onLogin: () => void;
  onBuy: () => void;
  phase: string;
}) {
  const disabled =
    !ready ||
    !liveListing?.active ||
    insufficientGas ||
    isOwner ||
    phase === "signing" ||
    phase === "confirming";
  const label = !ready
    ? "Loading…"
    : !authenticated
      ? "Connect wallet to buy"
      : isOwner
        ? "You own this iNFT"
        : !liveListing?.active
          ? "Listing not on-chain"
          : insufficientGas
            ? "Insufficient gas (need price + ~0.0005 0G)"
            : phase === "signing"
              ? "Awaiting signature…"
              : phase === "confirming"
                ? "Confirming on Galileo…"
                : phase === "confirmed"
                  ? "Bought ✓"
                  : `Buy for ${liveListing.askPriceFormatted} 0G`;
  return (
    <section className="mp-sheet-action">
      <div className="caps-md muted" style={{ marginBottom: 8 }}>
        QUICK BUY
      </div>
      <p className="mp-sheet-action-blurb">
        Sends {liveListing?.askPriceFormatted ?? "—"} 0G to the seller and
        triggers a re-keyed iNFT transfer in the same transaction. Gas paid in
        0G.
      </p>
      <button
        className="mp-sheet-cta"
        onClick={!authenticated ? onLogin : onBuy}
        disabled={disabled}
      >
        {label}
      </button>
    </section>
  );
}

function ListArea({
  bidEth,
  setBidEth,
  isOwner,
  insufficientGas,
  onApprove,
  onList,
  phase,
}: {
  bidEth: string;
  setBidEth: (v: string) => void;
  isOwner: boolean;
  insufficientGas: boolean;
  onApprove: () => void;
  onList: () => void;
  phase: string;
}) {
  return (
    <section className="mp-sheet-action">
      <div className="caps-md muted" style={{ marginBottom: 8 }}>
        LIST FOR SALE
      </div>
      {!isOwner ? (
        <p
          className="mp-sheet-action-blurb"
          style={{ color: "var(--ledger-warning)" }}
        >
          Only the iNFT owner can list. Connect with the owner wallet to
          continue.
        </p>
      ) : (
        <>
          <p className="mp-sheet-action-blurb">
            Two transactions: (1) approve the marketplace contract on the iNFT,
            (2) call list() with your ask price. Buyer pays in native 0G.
          </p>
          <label className="caps-sm muted" htmlFor="mp-ask-price">
            ASK PRICE — 0G
          </label>
          <input
            id="mp-ask-price"
            className="input italic mp-sheet-input"
            value={bidEth}
            inputMode="decimal"
            onChange={(e) => setBidEth(e.target.value)}
          />
          <div className="mp-sheet-actions-row">
            <button
              className="mp-sheet-cta-ghost"
              onClick={onApprove}
              disabled={phase === "signing" || phase === "confirming"}
            >
              1. Approve marketplace
            </button>
            <button
              className="mp-sheet-cta"
              onClick={onList}
              disabled={
                phase === "signing" || phase === "confirming" || insufficientGas
              }
            >
              2. List for sale
            </button>
          </div>
          {insufficientGas && (
            <div
              className="mono"
              style={{
                fontSize: 11,
                color: "var(--ledger-warning)",
                marginTop: 8,
              }}
            >
              ⚠ need ≥ 0.0005 0G for gas
            </div>
          )}
        </>
      )}
    </section>
  );
}

function OfferArea({
  bidEth,
  setBidEth,
  ready,
  authenticated,
  onLogin,
}: {
  bidEth: string;
  setBidEth: (v: string) => void;
  ready: boolean;
  authenticated: boolean;
  onLogin: () => void;
}) {
  return (
    <section className="mp-sheet-action">
      <div className="caps-md muted" style={{ marginBottom: 8 }}>
        MAKE OFFER
      </div>
      <p className="mp-sheet-action-blurb">
        Sub-ask offers route off-chain for v1 — record your bid here and the
        owner gets pinged on the worker profile. On-chain offer registry is
        planned (will use the same{" "}
        <code style={{ fontFamily: "var(--ledger-font-mono)" }}>
          LedgerMarketplace
        </code>{" "}
        contract).
      </p>
      <label className="caps-sm muted" htmlFor="mp-offer-price">
        OFFER — 0G
      </label>
      <input
        id="mp-offer-price"
        className="input italic mp-sheet-input"
        value={bidEth}
        inputMode="decimal"
        onChange={(e) => setBidEth(e.target.value)}
      />
      <button
        className="mp-sheet-cta"
        onClick={!authenticated ? onLogin : undefined}
        disabled={!ready || authenticated}
        title={authenticated ? "Off-chain offer registry — coming soon" : ""}
      >
        {!ready
          ? "Loading…"
          : !authenticated
            ? "Connect to make offer"
            : "Submit offer (off-chain) — coming soon"}
      </button>
    </section>
  );
}
