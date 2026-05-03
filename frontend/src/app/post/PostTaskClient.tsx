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
import { WalletGate } from "@/components/WalletGate";

// Local-action states only. The signing/confirming/confirmed states are
// derived from wagmi below — keeping them out of setState avoids the
// react-hooks/set-state-in-effect lint rule.
type LocalPhase = "idle" | "needs-login" | "needs-chain" | "failed";
type Phase = LocalPhase | "signing" | "confirming" | "confirmed";

const MIN_GAS_OG = parseEther("0.0005"); // tiny floor for postTask gas

type TaskCategory =
  | "research"
  | "data"
  | "code"
  | "creative"
  | "ops"
  | "trading"
  | "other";

/**
 * Per-category demoable task templates. On every fresh /post visit, one
 * template is picked at random and pre-fills the form so the live demo
 * doesn't always show the same task. The user can still edit any field.
 *
 * Hard rule: every entry must be plausible work an autonomous agent could
 * actually do. No filler, no "lorem ipsum", no joke entries — judges may
 * see any one of these in a recording.
 */
const TASK_TEMPLATES: Record<
  TaskCategory,
  Array<{ title: string; desc: string; tags: string }>
> = {
  research: [
    {
      title: "Base Yield Scout",
      desc: "Survey Base L2 yield opportunities. Return a ranked snapshot of top 12 vaults — APR, TVL, audit firm, last incident.",
      tags: "yield, base, defi",
    },
    {
      title: "ZK Stack Survey",
      desc: "Compare zkSync Era, Linea, Scroll, and Polygon zkEVM on prover throughput, finality time, EVM equivalence, and tooling maturity. Return a JSON matrix with citations.",
      tags: "zk, l2, research",
    },
    {
      title: "Restaking Risk Profile",
      desc: "Profile the top EigenLayer AVSs by slashing surface area, validator count, and operator concentration. Flag any AVS with >40% operator overlap with another.",
      tags: "restaking, eigenlayer, risk",
    },
    {
      title: "DAO Treasury Audit",
      desc: "Map current treasury composition for the top 5 governance tokens by market cap. Stables ratio, native exposure, runway in months at current burn.",
      tags: "dao, treasury, audit",
    },
  ],
  data: [
    {
      title: "DefiLlama Snapshot Cleaner",
      desc: "Pull TVL by protocol for the last 30 days, dedupe forks, normalize chain naming, return canonical CSV with one row per (protocol, day, chain).",
      tags: "defillama, tvl, etl",
    },
    {
      title: "ENS Subname Census",
      desc: "Count active subnames under the top 50 parent ENS names. Active = at least one resolver record set. Return JSON keyed by parent name with subname totals + delta vs 30d ago.",
      tags: "ens, census, data",
    },
    {
      title: "Validator Performance Stream",
      desc: "Aggregate Beacon Chain proposer effectiveness for the last 7 days. Flag validators with <90% performance. Return JSONL, one record per validator.",
      tags: "ethereum, validators, perf",
    },
  ],
  code: [
    {
      title: "Solidity Gas Audit",
      desc: "Review three Foundry contracts I'll attach for redundant SLOAD patterns and storage packing wins. Return a unified diff with measured gas savings per change.",
      tags: "solidity, gas, audit",
    },
    {
      title: "ABI to TS Generator",
      desc: "Generate a typed TS client for the LedgerEscrow ABI using viem. Single-file ESM output, zero deps beyond viem. Include JSDoc on every public function.",
      tags: "viem, codegen, typescript",
    },
    {
      title: "Subgraph Manifest Drafter",
      desc: "Draft a Graph subgraph manifest for an ERC-721 collection at the address I'll provide. Index Transfer events with metadata fetch and IPFS pinning. Return manifest.yaml + schema.graphql.",
      tags: "thegraph, subgraph, indexing",
    },
  ],
  creative: [
    {
      title: "Worker Card Cover Art",
      desc: "Generate a 6-frame cinematic cover image set for a new worker iNFT. Style: Wes Anderson + Foundation by Asimov. SVG output, 1024x1024, exported individually.",
      tags: "art, svg, brand",
    },
    {
      title: "Demo Voiceover Script",
      desc: "Write a 90-second product demo VO script for an autonomous DeFi vault scout agent. Calm tone, single voice, no hype. End on a single concrete claim a judge can verify.",
      tags: "copy, vo, demo",
    },
    {
      title: "Twitter Thread Drafter",
      desc: "Draft a 7-tweet thread explaining ERC-8004 reputation portability for a non-technical audience. End with a CTA to view a live agent profile. No emojis.",
      tags: "social, copy, erc8004",
    },
  ],
  ops: [
    {
      title: "Vercel Outage Triage",
      desc: "Bisect the last 200 deployments to find which commit introduced a TS type-check failure. Return the offending commit hash + a one-line fix sketch.",
      tags: "vercel, ci, triage",
    },
    {
      title: "Deploy Checklist Generator",
      desc: "Write a pre-flight checklist for promoting a Solidity contract from Sepolia testnet to a chain mainnet. Cover verify, source publish, monitoring, and rollback. Markdown output.",
      tags: "deploy, ops, checklist",
    },
    {
      title: "On-chain Monitoring Setup",
      desc: "Spec a Tenderly Web3Action that pages on any unusual transferFrom from our worker iNFT contract — i.e. transfer to a freshly funded wallet within 24h of mint. Include the JS handler.",
      tags: "tenderly, monitor, ops",
    },
  ],
  trading: [
    {
      title: "USDC Stablecoin Arb Window",
      desc: "Identify current arbitrage opportunities for USDC across Curve, Uniswap V3, and PancakeSwap pools with TVL > $10k. Filter by net spread > 12 bps after gas. Return JSON.",
      tags: "arbitrage, usdc, dex",
    },
    {
      title: "Funding Rate Spread Tracker",
      desc: "Compare BTC perp funding rates across Hyperliquid, dYdX v4, and GMX v2. Return the 8-hour rate snapshot with gap-to-mean and where funding is paying. JSON one row per venue.",
      tags: "perp, funding, derivatives",
    },
    {
      title: "Memecoin Sentiment Pulse",
      desc: "Scrape the last 48h of Twitter/Farcaster mentions for the top 20 BASE memecoins by 24h volume. Return polarity-scored list (-1 to 1) plus mention count delta vs prior 48h.",
      tags: "sentiment, memes, base",
    },
  ],
  other: [
    {
      title: "Open-Source Bounty Triage",
      desc: "Find 5 GitHub issues tagged 'good first issue' that match a TypeScript + viem + Next.js stack. Return ranked by repo health (stars, recent commits, PR turnaround). Markdown table.",
      tags: "oss, bounty, triage",
    },
    {
      title: "Conference Schedule Optimizer",
      desc: "Given an ETHGlobal hackathon schedule, build a 3-day attendance plan that minimizes overlap between must-see workshops and key sponsor office hours. ICS export.",
      tags: "ops, planning, ics",
    },
  ],
};

function pickRandomTemplate(): {
  category: TaskCategory;
  title: string;
  desc: string;
  tags: string;
} {
  const cats = Object.keys(TASK_TEMPLATES) as TaskCategory[];
  const cat = cats[Math.floor(Math.random() * cats.length)]!;
  const pool = TASK_TEMPLATES[cat];
  const t = pool[Math.floor(Math.random() * pool.length)]!;
  return { category: cat, title: t.title, desc: t.desc, tags: t.tags };
}

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

  // Static SSR defaults — first paint matches whatever Vercel cached for
  // the static /post page. Once the client mounts we swap in a random
  // template from TASK_TEMPLATES so each demo run shows something
  // different. Doing the swap in useEffect (not useState's lazy
  // initializer) avoids a hydration mismatch between server-rendered
  // HTML and the random pick on the client.
  const [form, setForm] = useState({
    title: "Base Yield Scout",
    desc: "Survey Base L2 yield opportunities. Return a ranked snapshot of top 12 vaults — APR, TVL, audit firm, last incident.",
    payout: "0.005", // native OG (the LedgerEscrow takes msg.value=payment)
    bond: "0.0005",
    timeLimit: "02:00", // mm:ss; converted to deadline below
    minRep: "0",
    minJobs: "0",
    tags: "yield, base, defi",
    category: "research" as TaskCategory,
  });
  // Pick a random template exactly once on first client render so the
  // form lands on something fresh per demo. We DON'T use a deps array
  // that includes any state — only first mount.
  // Ref guards against the swap firing twice (e.g. React strict-mode
  // double-render in dev) which would double-randomise after the user
  // started typing.
  const randomedRef = useRef(false);
  useEffect(() => {
    if (randomedRef.current) return;
    randomedRef.current = true;
    const t = pickRandomTemplate();
    setForm((prev) => ({
      ...prev,
      title: t.title,
      desc: t.desc,
      tags: t.tags,
      category: t.category,
    }));
  }, []);
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
    // Derive a unique taskId from buyer + title + a browser-crypto nonce.
    const nonce = crypto.getRandomValues(new Uint32Array(4)).join("-");
    const seed = `${address}-${form.title.trim()}-${Date.now()}-${nonce}`;
    const taskId = keccak256(toHex(seed));
    // Convert MM:SS time-limit into an absolute deadline (unix seconds, on-chain time).
    const [mm, ss] = form.timeLimit.split(":").map((n) => parseInt(n, 10));
    const deadlineSec = BigInt(Math.floor(Date.now() / 1000) + mm * 60 + ss);
    const minReputation = BigInt(
      Math.max(0, Math.floor(parseFloat(form.minRep || "0") * 100)),
    );

    setLocalPhase("idle"); // wagmi `isSigning` will drive phase from here
    redirectedRef.current = false; // allow the post-confirm redirect to fire for this submission
    const onSubmitted = (hash: Hex) => {
      setSubmittedTx(hash);
      setSubmittedTaskId(taskId);
      const tags = form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const briefBody = {
        taskId,
        brief: {
          title: form.title.trim(),
          description: form.desc.trim(),
          category: form.category,
          tags,
          minReputation: form.minRep,
          minJobs: form.minJobs,
          payoutOg: form.payout,
          bondOg: form.bond,
          deadlineSec: Number(deadlineSec),
          postedAtMs: Date.now(),
          postedBy: address,
        },
      };
      fetch("/api/jobs/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(briefBody),
      }).catch((err) => {
        // Brief pinning is best-effort — the on-chain task is already posted.
        // The auction room shows a "brief not pinned" disclosure if it 404s.
        console.warn("[post-task] brief pin failed", err);
      });
    };
    try {
      const hash = await writeContractAsync({
        address: LEDGER_ESCROW_ADDRESS,
        abi: LEDGER_ESCROW_ABI,
        functionName: "postTask",
        args: [taskId, payoutWei, deadlineSec, minReputation],
        value: payoutWei,
        chainId: galileo.id,
      });
      onSubmitted(hash);
    } catch (e) {
      const msg = (e as Error).message ?? "Transaction rejected";
      // Galileo's read replica sometimes lags the sequencer by 5–15s, so
      // viem's waitForTransactionReceipt times out before the receipt
      // surfaces — even though the tx is mining successfully. Privy
      // bubbles that as "Transaction receipt with hash 0x… could not be
      // found." Recover by extracting the hash and treating it as a
      // submit; useWaitForTransactionReceipt will catch up on its own
      // (transports retry for 90s).
      const hashMatch = msg.match(/0x[0-9a-fA-F]{64}/);
      const isReceiptDelay =
        /receipt.+could not be found|may not be processed on a block|no matching receipts found/i.test(
          msg,
        );
      if (hashMatch && isReceiptDelay) {
        onSubmitted(hashMatch[0] as Hex);
        return;
      }
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
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 3fr",
            gap: 32,
          }}
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
        <div style={{ marginTop: 24 }}>
          <Field label="CATEGORY">
            <div
              role="radiogroup"
              aria-label="Job category"
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              {(
                [
                  ["research", "Research"],
                  ["data", "Data"],
                  ["code", "Code"],
                  ["creative", "Creative"],
                  ["ops", "Ops"],
                  ["trading", "Trading"],
                  ["other", "Other"],
                ] as const
              ).map(([value, label]) => {
                const selected = form.category === value;
                return (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={`category-chip ${selected ? "is-selected" : ""}`}
                    onClick={() => setForm((f) => ({ ...f, category: value }))}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
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

        <div style={{ marginTop: 16 }}>
          <WalletGate
            title="Connect to post a task"
            description={
              <>
                Posting fires <code>LedgerEscrow.postTask</code> on 0G Galileo
                and locks your payout into escrow until the auction settles.
                You&rsquo;ll sign once.
              </>
            }
          >
            <button
              onClick={submit}
              disabled={
                !canSubmit || phase === "signing" || phase === "confirming"
              }
              className="btn btn-italic"
              style={{
                width: "100%",
                height: 56,
                fontSize: 20,
                cursor:
                  !canSubmit || phase === "signing" || phase === "confirming"
                    ? "not-allowed"
                    : "pointer",
                opacity:
                  !canSubmit || phase === "signing" || phase === "confirming"
                    ? 0.6
                    : 1,
              }}
            >
              {phase === "signing"
                ? "Awaiting signature…"
                : phase === "confirming"
                  ? "Confirming on chain…"
                  : phase === "confirmed"
                    ? "Posted ✓ — opening auction"
                    : "Post task on 0G Galileo"}
            </button>
          </WalletGate>
        </div>

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
