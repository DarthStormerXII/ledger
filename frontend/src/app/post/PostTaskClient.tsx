"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import {
  useAccount,
  useBalance,
  useChainId,
  useSwitchChain,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { keccak256, parseEther, toHex, formatUnits, type Hex } from "viem";
import { galileo } from "@/lib/chains";
import {
  LEDGER_ESCROW_ABI,
  LEDGER_ESCROW_ADDRESS,
  galileoTx,
} from "@/lib/contracts";

// Local-action states only. The signing/confirming/confirmed states are
// derived from wagmi below — keeping them out of setState avoids the
// react-hooks/set-state-in-effect lint rule.
type LocalPhase = "idle" | "needs-login" | "needs-chain" | "failed";
type Phase = LocalPhase | "signing" | "confirming" | "confirmed";

const MIN_GAS_OG = parseEther("0.0005"); // tiny floor for postTask gas

export function PostTaskClient() {
  const router = useRouter();
  const { ready, authenticated, login } = usePrivy();
  const { address } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const onGalileo = chainId === galileo.id;
  const { data: bal } = useBalance({
    address,
    chainId: galileo.id,
    query: { enabled: !!address },
  });

  const [form, setForm] = useState({
    title: "Base Yield Scout",
    desc: "Surveying Base Layer-2 yield opportunities. Returns ranked APR snapshot of top 12 vaults.",
    payout: "0.005", // native OG (the LedgerEscrow takes msg.value=payment)
    bond: "0.0005",
    timeLimit: "02:00", // mm:ss; converted to deadline below
    minRep: "0",
    minJobs: "0",
    tags: "yield, base, defi",
  });
  // `localPhase` only holds states the UI sets directly. The wagmi-driven
  // states are derived in `phase` below — that avoids mirroring external
  // state with setState (react-hooks/set-state-in-effect).
  const [localPhase, setLocalPhase] = useState<LocalPhase>("idle");
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [submittedTx, setSubmittedTx] = useState<Hex | null>(null);
  const [submittedTaskId, setSubmittedTaskId] = useState<Hex | null>(null);

  const set = <K extends keyof typeof form>(k: K, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const { writeContractAsync, isPending: isSigning } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash: submittedTx ?? undefined,
      chainId: galileo.id,
      query: { enabled: !!submittedTx },
    });

  const phase: Phase = isSigning
    ? "signing"
    : submittedTx && isConfirming
      ? "confirming"
      : submittedTx && isConfirmed
        ? "confirmed"
        : localPhase;

  // Fire the redirect exactly once after the receipt confirms.
  const redirectedRef = useRef(false);
  useEffect(() => {
    if (!isConfirmed || !submittedTaskId || redirectedRef.current) return;
    redirectedRef.current = true;
    const t = window.setTimeout(() => {
      router.push(`/jobs/${submittedTaskId}`);
    }, 1400);
    return () => window.clearTimeout(t);
  }, [isConfirmed, submittedTaskId, router]);

  // Validation
  const payoutWei = (() => {
    try {
      return parseEther(form.payout || "0");
    } catch {
      return 0n;
    }
  })();
  const insufficientGas = !!bal && bal.value < payoutWei + MIN_GAS_OG;
  const validPayout = payoutWei > 0n;
  const validTimeLimit = /^(\d{1,2}):(\d{2})$/.test(form.timeLimit);
  const canSubmit =
    ready && authenticated && validPayout && validTimeLimit && !insufficientGas;

  const submit = async () => {
    setErrMsg(null);
    if (!ready) return;
    if (!authenticated) {
      setLocalPhase("needs-login");
      login();
      return;
    }
    if (!onGalileo) {
      setLocalPhase("needs-chain");
      try {
        await switchChainAsync({ chainId: galileo.id });
      } catch (e) {
        setErrMsg(`Could not switch to 0G Galileo: ${(e as Error).message}`);
        setLocalPhase("failed");
        return;
      }
    }
    if (!validPayout) {
      setErrMsg("Payout must be greater than 0.");
      setLocalPhase("failed");
      return;
    }
    if (!validTimeLimit) {
      setErrMsg("Time limit must be in MM:SS form (e.g. 02:00).");
      setLocalPhase("failed");
      return;
    }
    // Derive a unique taskId from buyer + title + nonce.
    const seed = `${address}-${form.title.trim()}-${Date.now()}-${Math.random()}`;
    const taskId = keccak256(toHex(seed));
    // Convert MM:SS time-limit into an absolute deadline (unix seconds, on-chain time).
    const [mm, ss] = form.timeLimit.split(":").map((n) => parseInt(n, 10));
    const deadlineSec = BigInt(Math.floor(Date.now() / 1000) + mm * 60 + ss);
    const minReputation = BigInt(
      Math.max(0, Math.floor(parseFloat(form.minRep || "0") * 100)),
    );

    setLocalPhase("idle"); // wagmi `isSigning` will drive phase from here
    redirectedRef.current = false; // allow the post-confirm redirect to fire for this submission
    try {
      const hash = await writeContractAsync({
        address: LEDGER_ESCROW_ADDRESS,
        abi: LEDGER_ESCROW_ABI,
        functionName: "postTask",
        args: [taskId, payoutWei, deadlineSec, minReputation],
        value: payoutWei,
        chainId: galileo.id,
      });
      setSubmittedTx(hash);
      setSubmittedTaskId(taskId);
    } catch (e) {
      const msg = (e as Error).message ?? "Transaction rejected";
      setErrMsg(msg.length > 200 ? `${msg.slice(0, 200)}…` : msg);
      setLocalPhase("failed");
    }
  };

  return (
    <div className="page" style={{ padding: 40, maxWidth: 1100 }}>
      <h1
        style={{
          fontFamily: "var(--ledger-font-display)",
          fontStyle: "italic",
          fontWeight: 900,
          fontSize: 64,
          letterSpacing: "-0.03em",
          margin: "0 0 32px",
          color: "var(--ledger-paper)",
        }}
      >
        Post a task.
      </h1>

      <Section label="TASK BRIEF">
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}
        >
          <Field label="TITLE">
            <input
              className="input italic"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
            />
          </Field>
          <Field label="DESCRIPTION">
            <textarea
              className="input"
              rows={2}
              style={{ resize: "vertical" }}
              value={form.desc}
              onChange={(e) => set("desc", e.target.value)}
            />
          </Field>
        </div>
      </Section>

      <Section label="PAYOUT TERMS">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 32,
          }}
        >
          <Field label="PAYOUT — 0G">
            <input
              className="input italic"
              value={form.payout}
              onChange={(e) => set("payout", e.target.value)}
              inputMode="decimal"
            />
          </Field>
          <Field label="BOND — 0G (worker-locked at acceptBid)">
            <input
              className="input italic"
              value={form.bond}
              onChange={(e) => set("bond", e.target.value)}
              inputMode="decimal"
            />
          </Field>
          <Field label="TIME LIMIT — MM:SS">
            <input
              className="input mono"
              value={form.timeLimit}
              onChange={(e) => set("timeLimit", e.target.value)}
            />
          </Field>
        </div>
      </Section>

      <Section label="REQUIREMENTS">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 32,
          }}
        >
          <Field label="MIN REPUTATION (0–5)">
            <input
              className="input italic"
              value={form.minRep}
              onChange={(e) => set("minRep", e.target.value)}
              inputMode="decimal"
            />
          </Field>
          <Field label="MIN JOBS DONE">
            <input
              className="input italic"
              value={form.minJobs}
              onChange={(e) => set("minJobs", e.target.value)}
              inputMode="numeric"
            />
          </Field>
          <Field label="CAPABILITY TAGS">
            <input
              className="input"
              value={form.tags}
              onChange={(e) => set("tags", e.target.value)}
            />
          </Field>
        </div>
      </Section>

      <Section label="REVIEW">
        <div style={{ padding: "16px 0" }}>
          <div
            style={{
              fontFamily: "var(--ledger-font-display)",
              fontStyle: "italic",
              fontWeight: 800,
              fontSize: 32,
              color: "var(--ledger-paper)",
              marginBottom: 12,
            }}
          >
            {form.title}.
          </div>
          <div
            style={{
              color: "rgba(245,241,232,0.6)",
              marginBottom: 18,
              maxWidth: 720,
            }}
          >
            {form.desc}
          </div>
          <div style={{ display: "flex", gap: 48 }}>
            <ReviewItem label="PAYOUT" value={`${form.payout} 0G`} />
            <ReviewItem label="BOND" value={`${form.bond} 0G`} />
            <ReviewItem label="TIME LIMIT" value={form.timeLimit} mono />
            <ReviewItem label="MIN REPUTATION" value={form.minRep} />
          </div>
        </div>

        <ChainStateLine
          ready={ready}
          authenticated={authenticated}
          onGalileo={onGalileo}
          balance={bal ? formatUnits(bal.value, bal.decimals) : null}
          balSymbol={bal?.symbol ?? "0G"}
          insufficientGas={insufficientGas}
          payout={form.payout}
        />

        <button
          onClick={submit}
          disabled={
            !ready ||
            (authenticated && !canSubmit) ||
            phase === "signing" ||
            phase === "confirming"
          }
          className="btn btn-italic"
          style={{
            width: "100%",
            height: 56,
            fontSize: 20,
            marginTop: 16,
            cursor:
              !ready ||
              (authenticated && !canSubmit) ||
              phase === "signing" ||
              phase === "confirming"
                ? "not-allowed"
                : "pointer",
            opacity:
              !ready ||
              (authenticated && !canSubmit) ||
              phase === "signing" ||
              phase === "confirming"
                ? 0.6
                : 1,
          }}
        >
          {!ready
            ? "Loading…"
            : !authenticated
              ? "Connect to post"
              : !onGalileo
                ? "Switch to 0G Galileo + post task"
                : phase === "signing"
                  ? "Awaiting signature…"
                  : phase === "confirming"
                    ? "Confirming on chain…"
                    : phase === "confirmed"
                      ? "Posted ✓ — opening auction"
                      : "Post task on 0G Galileo"}
        </button>

        {errMsg && (
          <div
            style={{
              marginTop: 16,
              padding: "12px 16px",
              border: "1px solid var(--ledger-danger)",
              color: "var(--ledger-danger)",
              fontSize: 13,
              fontFamily: "var(--ledger-font-mono)",
            }}
          >
            {errMsg}
          </div>
        )}
      </Section>

      {/* Tx step dialog */}
      {(phase === "signing" ||
        phase === "confirming" ||
        phase === "confirmed") && (
        <TxStepsDialog
          phase={phase}
          tx={submittedTx}
          onClose={() => {
            if (phase === "confirmed") {
              setLocalPhase("idle");
              setSubmittedTx(null);
              setSubmittedTaskId(null);
            }
          }}
        />
      )}
    </div>
  );
}

function ChainStateLine({
  ready,
  authenticated,
  onGalileo,
  balance,
  balSymbol,
  insufficientGas,
  payout,
}: {
  ready: boolean;
  authenticated: boolean;
  onGalileo: boolean;
  balance: string | null;
  balSymbol: string;
  insufficientGas: boolean;
  payout: string;
}) {
  return (
    <div
      className="mono"
      style={{
        marginTop: 12,
        padding: "10px 14px",
        border: "1px solid rgba(245,241,232,0.16)",
        background: "rgba(245,241,232,0.04)",
        fontSize: 12,
        color: "rgba(245,241,232,0.7)",
        display: "flex",
        gap: 18,
        flexWrap: "wrap",
      }}
    >
      <span>
        chain:{" "}
        <strong style={{ color: "var(--ledger-paper)" }}>
          {onGalileo ? "0G Galileo (16602)" : "wrong chain — will switch"}
        </strong>
      </span>
      <span>
        wallet:{" "}
        <strong style={{ color: "var(--ledger-paper)" }}>
          {!ready ? "loading…" : authenticated ? "connected" : "not connected"}
        </strong>
      </span>
      <span>
        balance:{" "}
        <strong
          style={{
            color: insufficientGas
              ? "var(--ledger-danger)"
              : "var(--ledger-paper)",
          }}
        >
          {balance ? `${balance} ${balSymbol}` : "—"}
        </strong>
      </span>
      <span>
        msg.value:{" "}
        <strong style={{ color: "var(--ledger-paper)" }}>{payout} 0G</strong>
      </span>
      {insufficientGas && (
        <span style={{ color: "var(--ledger-danger)" }}>
          ⚠ need ≥ payout + ~0.0005 0G for gas — fund this wallet on Galileo
        </span>
      )}
    </div>
  );
}

function TxStepsDialog({
  phase,
  tx,
  onClose,
}: {
  phase: Phase;
  tx: Hex | null;
  onClose: () => void;
}) {
  const steps = [
    { id: "sign", label: "Sign postTask in wallet" },
    { id: "confirm", label: "Confirm on 0G Galileo" },
    { id: "open", label: "Open the auction" },
  ];
  const current =
    phase === "signing"
      ? 0
      : phase === "confirming"
        ? 1
        : phase === "confirmed"
          ? 2
          : -1;

  return (
    <div
      role="dialog"
      aria-modal
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(10,10,14,0.78)",
        zIndex: 40,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          background: "var(--ledger-ink-elevated)",
          border: "1px solid rgba(245,241,232,0.16)",
          padding: 28,
        }}
      >
        <div className="caps-md muted" style={{ marginBottom: 16 }}>
          POSTING LOT — 0G GALILEO
        </div>
        <ol
          style={{
            listStyle: "none",
            padding: 0,
            margin: "0 0 22px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {steps.map((s, i) => {
            const status =
              i < current ? "done" : i === current ? "active" : "idle";
            return (
              <li
                key={s.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  fontSize: 14,
                  color:
                    status === "done"
                      ? "var(--ledger-success)"
                      : status === "active"
                        ? "var(--ledger-paper)"
                        : "rgba(245,241,232,0.5)",
                }}
              >
                <span
                  aria-hidden
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    border:
                      status === "active"
                        ? "1.5px solid var(--ledger-oxblood)"
                        : status === "done"
                          ? "1.5px solid var(--ledger-success)"
                          : "1px solid rgba(245,241,232,0.3)",
                    background:
                      status === "done"
                        ? "var(--ledger-success)"
                        : "transparent",
                    display: "inline-block",
                    animation:
                      status === "active"
                        ? "spin 0.9s linear infinite"
                        : "none",
                    borderTopColor:
                      status === "active" ? "transparent" : undefined,
                  }}
                />
                <span>{s.label}</span>
              </li>
            );
          })}
        </ol>
        {tx && (
          <a
            href={galileoTx(tx)}
            target="_blank"
            rel="noreferrer noopener"
            className="mono"
            style={{
              display: "block",
              fontSize: 11,
              color: "var(--ledger-oxblood)",
              wordBreak: "break-all",
              marginBottom: 14,
            }}
          >
            tx: {tx} ↗
          </a>
        )}
        {phase === "confirmed" && (
          <button
            onClick={onClose}
            className="btn-text"
            style={{
              fontSize: 12,
              color: "rgba(245,241,232,0.6)",
            }}
          >
            Stay on this page
          </button>
        )}
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div
      style={{
        padding: "32px 0",
        borderBottom: "1px solid rgba(245,241,232,0.16)",
      }}
    >
      <div className="caps-md muted" style={{ marginBottom: 24 }}>
        {label}
      </div>
      {children}
    </div>
  );
}
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="caps-sm muted" style={{ marginBottom: 6 }}>
        {label}
      </div>
      {children}
    </div>
  );
}
function ReviewItem({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <div className="caps-sm muted" style={{ marginBottom: 4 }}>
        {label}
      </div>
      <div
        className={mono ? "mono" : "italic-num"}
        style={{ fontSize: 22, color: "var(--ledger-paper)" }}
      >
        {value}
      </div>
    </div>
  );
}
