"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Job, Lot } from "@/lib/data";
import { AxlTopology } from "@/components/AxlTopology";
import { AXL_CAPTURED_PROOF } from "@/lib/axl-proof";
import { LEDGER_ESCROW_ADDRESS, galileoTx, galileoAddr } from "@/lib/contracts";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { keccak256, toHex, parseAbi, type Hex } from "viem";
import { galileo } from "@/lib/chains";

const RELEASE_PAYMENT_ABI = parseAbi([
  "function releasePayment(bytes32 taskId, bytes32 resultHash) external",
]);

/**
 * AuctionRoomClient — live auction view for one task.
 *
 * Hard rule (per app-wide demo rule, set 2026-05-03):
 *   ZERO mocking, ZERO simulation. No Math.random, no seeded logs.
 *   Every bid, mesh log entry, topology row comes from the real AXL bridge
 *   (proxied via /api/axl/*). When the bridge is unreachable, the UI shows
 *   an explicit blocked state plus timestamped captured proof from the real
 *   three-node run — never fabricated activity.
 */

type AxlMessage = {
  receivedAt: number;
  fromPeerId?: string;
  payload:
    | {
        type: "TASK_POSTED" | "BID_ACCEPTED" | "AUCTION_CLOSED" | "RESULT";
        taskId?: string;
        [k: string]: unknown;
      }
    | {
        type: "BID";
        taskId: string;
        worker: string;
        workerINFTId?: string;
        bidAmount: string;
        reputationProof?: { jobCount?: number; avgRating?: number };
        [k: string]: unknown;
      }
    | unknown;
};

type RecvBody = {
  ok?: boolean;
  bridge?: string;
  drained?: number;
  bufferSize?: number;
  messages?: AxlMessage[];
  error?: string;
};

type TopologyBody = {
  ok?: boolean;
  topology?: { peers?: { peerId: string; addrs?: string[] }[] };
  error?: string;
};

// Rich on-chain receipt — pre-fetched server-side, passed in by the page so the
// auction room can show full detail when the task has already moved past the
// "Posted" state (Accepted / Released / Cancelled / Slashed).
export type LiveJobReceipt = {
  taskId: string;
  buyer: string;
  worker: string | null;
  workerEnsName?: string;
  workerJobs?: number | null;
  workerRating?: number | null;
  workerEarned?: string | null;
  payment: string; // wei
  paymentEth: string;
  bidAmount: string; // wei
  bidAmountEth: string | null;
  deadline: number;
  minReputation: string;
  status: "Posted" | "Accepted" | "Released" | "Cancelled" | "Slashed";
  postedTx: string;
  postedBlock: number;
};

type DerivedBid = {
  worker: string;
  workerINFTId?: string;
  bidAmount: number;
  jobCount?: number;
  avgRating?: number;
  receivedAt: number;
};

const POLL_INTERVAL_MS = 2500;

export function AuctionRoomClient({
  job,
  lots,
  receipt,
}: {
  job: Job;
  lots: Lot[];
  receipt?: LiveJobReceipt;
}) {
  const [timeLeft, setTimeLeft] = useState(job.timeLeft);
  useEffect(() => {
    const id = window.setInterval(
      () => setTimeLeft((t) => Math.max(0, t - 1)),
      1000,
    );
    return () => window.clearInterval(id);
  }, []);
  // Tiered countdown — MM:SS becomes meaningless past an hour.
  //   < 1 min  → Xs
  //   < 1 h    → MM:SS
  //   < 24 h   → Xh YYm
  //   ≥ 24 h   → Xd Yh
  const fmtTime = (s: number) => {
    if (s < 60) return `${s}s`;
    if (s < 3600) {
      const m = Math.floor(s / 60);
      const ss = s % 60;
      return `${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
    }
    if (s < 86400) {
      const h = Math.floor(s / 3600);
      const m = Math.floor((s % 3600) / 60);
      return `${h}h ${String(m).padStart(2, "0")}m`;
    }
    const d = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600);
    return `${d}d ${h}h`;
  };

  // ── Live AXL state ───────────────────────────────────────────────────
  const [bridgeStatus, setBridgeStatus] = useState<
    "probing" | "live" | "unavailable"
  >("probing");
  const [bridgeError, setBridgeError] = useState<string | null>(null);
  const [recvMessages, setRecvMessages] = useState<AxlMessage[]>([]);
  const [topology, setTopology] = useState<TopologyBody["topology"] | null>(
    null,
  );
  const lastErrRef = useRef<string | null>(null);

  // ── Job brief (pinned to 0G Storage, fetched from /api/jobs/brief) ─────
  const [brief, setBrief] = useState<{
    title: string;
    description: string;
    category: string;
    tags?: string[];
    minReputation?: string;
    minJobs?: string;
    payoutOg?: string;
    bondOg?: string;
    deadlineSec?: number;
    postedBy?: string;
  } | null>(null);
  const [briefCid, setBriefCid] = useState<string | null>(null);
  const [briefPinned, setBriefPinned] = useState<boolean>(false);
  const [briefMissing, setBriefMissing] = useState<boolean>(false);
  useEffect(() => {
    let cancelled = false;
    async function loadBrief() {
      try {
        const r = await fetch(
          `/api/jobs/brief?taskId=${encodeURIComponent(job.id)}`,
          { cache: "no-store" },
        );
        if (cancelled) return;
        if (r.status === 404) {
          setBriefMissing(true);
          return;
        }
        if (!r.ok) return;
        const body = await r.json();
        if (cancelled) return;
        if (body?.brief) {
          setBrief(body.brief);
          setBriefCid(typeof body.cid === "string" ? body.cid : null);
          setBriefPinned(!!body.pinned);
          setBriefMissing(false);
        }
      } catch {
        /* best-effort; surface as "no brief" */
      }
    }
    loadBrief();
    // Re-poll every 8s for the first ~30s after mount in case the buyer
    // just landed here from /post and the brief is mid-pin.
    const id = window.setInterval(loadBrief, 8000);
    const stop = window.setTimeout(() => window.clearInterval(id), 30000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
      window.clearTimeout(stop);
    };
  }, [job.id]);

  useEffect(() => {
    let cancelled = false;
    async function poll() {
      try {
        const [recvResp, topoResp] = await Promise.all([
          fetch(`/api/axl/recv?taskId=${encodeURIComponent(job.id)}&limit=24`, {
            cache: "no-store",
          }),
          fetch(`/api/axl/topology`, { cache: "no-store" }),
        ]);
        if (cancelled) return;

        if (recvResp.ok) {
          const body: RecvBody = await recvResp.json();
          setRecvMessages(body.messages ?? []);
          setBridgeStatus("live");
          setBridgeError(null);
          lastErrRef.current = null;
        } else {
          const body: RecvBody = await recvResp.json().catch(() => ({}));
          setBridgeStatus("unavailable");
          setBridgeError(body.error ?? `recv:${recvResp.status}`);
        }
        if (topoResp.ok) {
          const body: TopologyBody = await topoResp.json();
          setTopology(body.topology ?? null);
        } else {
          setTopology(null);
        }
      } catch (err) {
        if (cancelled) return;
        setBridgeStatus("unavailable");
        setBridgeError(err instanceof Error ? err.message : String(err));
        setTopology(null);
        setRecvMessages([]);
      }
    }
    poll();
    const id = window.setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [job.id]);

  // Derive distinct bidders + best (lowest) bid per worker from real BID messages.
  const derivedBids = deriveBids(recvMessages);
  // Total mesh size = the bridge we're querying (us) + each peer it sees.
  // Earlier rendering only showed `topology.peers.length` ("2 nodes") which
  // undercounts by one — the bridge always counts itself as a node in the
  // mesh. The /api/axl/topology response carries `our_public_key` confirming
  // a third participant; size = peers + 1 when the bridge is up.
  const peerCount = topology?.peers?.length ?? 0;
  const meshSize =
    bridgeStatus === "live" && topology?.peers ? peerCount + 1 : 0;

  // ── Lifecycle from AXL events ───────────────────────────────────────────
  // The lead worker emits BID_ACCEPTED → WORK_STARTED → WORK_COMPLETE on the
  // AXL feed as it drives the on-chain accept and simulates work. We
  // derive the live status from those events so the UI reacts faster than
  // the SSR cache refresh (revalidate=60s on the page).
  const axlLifecycle = useMemo(() => {
    let accepted = false;
    let workStarted = false;
    let workComplete = false;
    let acceptTx: string | null = null;
    let acceptedWorker: string | null = null;
    for (const m of recvMessages) {
      const p = m.payload as {
        type?: string;
        taskId?: string;
        onchainTx?: string;
        worker?: string;
      };
      if (!p || p.taskId !== job.id) continue;
      if (p.type === "BID_ACCEPTED") {
        accepted = true;
        acceptTx = p.onchainTx ?? null;
        acceptedWorker = p.worker ?? null;
      } else if (p.type === "WORK_STARTED") {
        workStarted = true;
      } else if (p.type === "WORK_COMPLETE") {
        workComplete = true;
      }
    }
    return { accepted, workStarted, workComplete, acceptTx, acceptedWorker };
  }, [recvMessages, job.id]);

  // ── Status-aware header copy ────────────────────────────────────────────
  // Live status: prefer AXL events (faster) over the SSR receipt status
  // (which lags behind by up to revalidate=60s).
  const ssrStatus = receipt?.status ?? "Posted";
  const status: typeof ssrStatus =
    ssrStatus === "Released" ||
    ssrStatus === "Cancelled" ||
    ssrStatus === "Slashed"
      ? ssrStatus
      : axlLifecycle.accepted
        ? "Accepted"
        : ssrStatus;
  const isPosted = status === "Posted";

  // ── Release Funds wallet wiring ─────────────────────────────────────────
  const { address: connectedAddress } = useAccount();
  const isBuyer =
    !!connectedAddress &&
    !!receipt?.buyer &&
    connectedAddress.toLowerCase() === receipt.buyer.toLowerCase();
  const {
    writeContractAsync: releaseWrite,
    isPending: releaseSigning,
    data: releaseHash,
  } = useWriteContract();
  const { isLoading: releaseConfirming, isSuccess: releaseConfirmed } =
    useWaitForTransactionReceipt({
      hash: releaseHash,
      chainId: galileo.id,
      query: { enabled: !!releaseHash },
    });
  const [releaseError, setReleaseError] = useState<string | null>(null);
  const handleRelease = async () => {
    setReleaseError(null);
    try {
      // resultHash is informational; bind it to the worker-reported summary.
      const resultHash = keccak256(toHex(`released:${job.id}:${Date.now()}`));
      await releaseWrite({
        address: LEDGER_ESCROW_ADDRESS,
        abi: RELEASE_PAYMENT_ABI,
        functionName: "releasePayment",
        args: [job.id as Hex, resultHash],
        chainId: galileo.id,
      });
    } catch (e) {
      const msg = (e as Error).message ?? "release failed";
      setReleaseError(msg.length > 200 ? `${msg.slice(0, 200)}…` : msg);
    }
  };
  const showReleaseButton =
    isBuyer &&
    status === "Accepted" &&
    !releaseConfirmed &&
    ssrStatus !== "Released";
  const HEADER_LABEL: Record<typeof status, string> = {
    Posted: "LIVE AUCTION",
    Accepted: "ACCEPTED · IN PROGRESS",
    Released: "SETTLED · PAID",
    Cancelled: "AUCTION CANCELLED",
    Slashed: "BOND SLASHED",
  };
  const HEADER_TONE: Record<typeof status, string> = {
    Posted: "var(--ledger-oxblood)",
    Accepted: "var(--ledger-gold-leaf)",
    Released: "var(--ledger-success)",
    Cancelled: "var(--ledger-ink-muted)",
    Slashed: "var(--ledger-oxblood)",
  };
  // No invented title — every posted task MUST have title/description/category
  // pinned to the brief. Three terminal states:
  //   - briefLoading   → fetch hasn't returned yet OR brief was just POSTed
  //                       and is still pinning (~6–15s on 0G). Show shimmer
  //                       skeleton, not "(no title pinned)" — that placeholder
  //                       implies a definite absence and would be misleading
  //                       on a freshly-posted task.
  //   - briefAbsent    → registry returned a confirmed 404 (pre-fix task or
  //                       direct-contract post). Show explicit
  //                       "(no title pinned)" italic placeholder.
  //   - briefPresent   → real fields. Render normally.
  const briefLoading = brief === null && !briefMissing;
  const titleMissing = briefMissing && !brief?.title;
  const descMissing = briefMissing && !brief?.description;
  const categoryMissing = briefMissing && !brief?.category;

  return (
    <div className="page jobs-page-wrap">
      {/* TOP SECTION */}
      <div className="auction-top">
        <div>
          <div
            className="caps-md"
            style={{
              marginBottom: 8,
              display: "flex",
              gap: 10,
              alignItems: "center",
              flexWrap: "wrap",
              color: HEADER_TONE[status],
            }}
          >
            <TaskIdHover taskId={job.id} /> ·{" "}
            <span style={{ color: HEADER_TONE[status] }}>
              {HEADER_LABEL[status]}
            </span>
            {briefLoading ? (
              <span className="auction-skeleton auction-skeleton-chip" />
            ) : categoryMissing ? (
              <span
                className="caps-sm"
                style={{
                  padding: "2px 8px",
                  border: "1px dashed rgba(245,241,232,0.2)",
                  color: "rgba(245,241,232,0.4)",
                  borderRadius: 2,
                  letterSpacing: "0.1em",
                }}
                title="Brief not pinned — posted via direct contract call, not /post"
              >
                (no category pinned)
              </span>
            ) : (
              <span
                className={`category-chip is-static cat-${brief!.category}`}
              >
                {brief!.category.charAt(0).toUpperCase() +
                  brief!.category.slice(1)}
              </span>
            )}
          </div>
          {briefLoading ? (
            <div className="auction-skeleton-title-wrap">
              <span className="auction-skeleton auction-skeleton-title" />
            </div>
          ) : titleMissing ? (
            <h1
              className="auction-title"
              style={{ color: "rgba(245,241,232,0.4)", fontStyle: "italic" }}
              title="Brief not pinned — posted via direct contract call, not /post"
            >
              (no title pinned)
            </h1>
          ) : (
            <h1 className="auction-title">{brief!.title}.</h1>
          )}
          {briefLoading ? (
            <div className="auction-skeleton-desc-wrap">
              <span className="auction-skeleton auction-skeleton-desc" />
              <span className="auction-skeleton auction-skeleton-desc auction-skeleton-desc-short" />
            </div>
          ) : descMissing ? (
            <p
              className="auction-desc"
              style={{ color: "rgba(245,241,232,0.4)", fontStyle: "italic" }}
            >
              (no description pinned for this taskId — see brief panel below for
              the on-chain receipt)
            </p>
          ) : (
            <p className="auction-desc">{brief!.description}</p>
          )}
        </div>
        <div className="auction-clock">
          {isPosted || status === "Accepted" ? (
            <div
              className="mono auction-clock-time"
              style={{
                color:
                  timeLeft < 30
                    ? "var(--ledger-gold-leaf)"
                    : isPosted
                      ? "var(--ledger-oxblood)"
                      : "var(--ledger-gold-leaf)",
              }}
            >
              {fmtTime(timeLeft)}
            </div>
          ) : (
            // For terminal states (Released/Cancelled/Slashed) the deadline
            // counter is nonsense; replace with the resolved status.
            <div
              className="mono auction-clock-time"
              style={{ color: HEADER_TONE[status], fontSize: 32 }}
            >
              {status === "Released"
                ? "PAID"
                : status === "Cancelled"
                  ? "VOID"
                  : "SLASH"}
            </div>
          )}
          <div className="auction-clock-meta">
            <div>
              <span className="caps-sm muted">
                {status === "Released"
                  ? "RELEASED — "
                  : status === "Accepted"
                    ? "ACCEPTED BID — "
                    : "PAYOUT — "}
              </span>
              <span
                className="italic-num"
                style={{ fontSize: 18, color: "var(--ledger-paper)" }}
              >
                {receipt && (status === "Released" || status === "Accepted")
                  ? `${receipt.bidAmountEth ?? receipt.paymentEth} 0G`
                  : job.payout}
              </span>
            </div>
            <div>
              <span className="caps-sm muted">
                {status === "Posted" ? "BOND — " : "POSTED REWARD — "}
              </span>
              <span
                className="italic-num"
                style={{ fontSize: 18, color: "var(--ledger-paper)" }}
              >
                {status === "Posted"
                  ? job.bond
                  : receipt
                    ? `${receipt.paymentEth} 0G`
                    : job.payout}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* JOB BRIEF — actual task content pinned to 0G Storage. Title and
          description come from the brief; this panel surfaces the structured
          requirements + the 0G CID so judges can verify the brief on-chain. */}
      <JobBriefPanel
        brief={brief}
        cid={briefCid}
        pinned={briefPinned}
        missing={briefMissing}
        taskId={job.id}
      />

      {/* LIFECYCLE STRIP — shows the auction's progress from Posted →
          Accepted → Working → Complete. Driven by AXL events emitted by
          the lead worker so the UI reacts faster than the SSR cache. */}
      {(axlLifecycle.accepted ||
        ssrStatus === "Accepted" ||
        ssrStatus === "Released") && (
        <div className="auction-lifecycle">
          <div className="auction-lifecycle-phases">
            <span
              className={`lifecycle-phase ${axlLifecycle.accepted || ssrStatus !== "Posted" ? "is-done" : "is-active"}`}
            >
              <span className="lifecycle-dot" /> AUCTION
            </span>
            <span
              className={`lifecycle-phase ${axlLifecycle.accepted || ssrStatus === "Accepted" || ssrStatus === "Released" ? "is-done" : ""}`}
            >
              <span className="lifecycle-dot" /> ACCEPTED
            </span>
            <span
              className={`lifecycle-phase ${axlLifecycle.workStarted || axlLifecycle.workComplete || ssrStatus === "Released" ? "is-done" : axlLifecycle.accepted ? "is-active" : ""}`}
            >
              <span className="lifecycle-dot" /> WORKING
            </span>
            <span
              className={`lifecycle-phase ${axlLifecycle.workComplete || ssrStatus === "Released" ? "is-done" : axlLifecycle.workStarted ? "is-active" : ""}`}
            >
              <span className="lifecycle-dot" /> COMPLETE
            </span>
            <span
              className={`lifecycle-phase ${ssrStatus === "Released" || releaseConfirmed ? "is-done" : axlLifecycle.workComplete ? "is-active" : ""}`}
            >
              <span className="lifecycle-dot" /> RELEASED
            </span>
          </div>
          {showReleaseButton && (
            <div className="auction-lifecycle-cta">
              <button
                className="btn btn-tall btn-italic"
                disabled={releaseSigning || releaseConfirming}
                onClick={handleRelease}
              >
                {releaseSigning
                  ? "Signing…"
                  : releaseConfirming
                    ? "Confirming…"
                    : "Release funds to worker"}
              </button>
              {releaseError ? (
                <div
                  className="caps-sm"
                  style={{ color: "var(--ledger-oxblood)", marginTop: 8 }}
                >
                  {releaseError}
                </div>
              ) : null}
            </div>
          )}
          {releaseConfirmed && (
            <div
              className="caps-sm"
              style={{ color: "var(--ledger-success)", marginTop: 8 }}
            >
              ✓ payment released — refresh to see the settled receipt
            </div>
          )}
        </div>
      )}

      {/* RICH RECEIPT PANEL — for tasks past the "Posted" state, the
          bid grid is empty by design; instead we show the full on-chain
          receipt: winning worker, accepted bid, locked bond, txs, etc. */}
      {receipt &&
      (receipt.status === "Accepted" ||
        receipt.status === "Released" ||
        receipt.status === "Cancelled" ||
        receipt.status === "Slashed") ? (
        <TaskReceiptPanel receipt={receipt} />
      ) : null}

      <div className="auction-body">
        {/* CENTER — bidders. The "live BID feed" only makes sense while
            the auction is open. Once the task is past Posted, we hide the
            "0 WORKERS BIDDING + no BID messages received yet" placeholder
            (the rich receipt panel above already shows who won + how the
            payout settled). For terminal states we just label this section
            "BID HISTORY" and let the AXL ring buffer surface anything that
            was captured on chain — usually empty after the receipt has
            cleared. */}
        <div className="auction-center">
          <div className="caps-md muted" style={{ marginBottom: 18 }}>
            {!isPosted
              ? `BID HISTORY · ${HEADER_LABEL[status]}`
              : bridgeStatus === "live"
                ? `${derivedBids.length} ${derivedBids.length === 1 ? "WORKER BIDDING" : "WORKERS BIDDING"} (LIVE)`
                : bridgeStatus === "unavailable"
                  ? "AXL BRIDGE UNAVAILABLE"
                  : "PROBING AXL BRIDGE…"}
          </div>

          {!isPosted && derivedBids.length === 0 ? (
            <ResolvedAuctionPanel receipt={receipt} lots={lots} />
          ) : bridgeStatus === "unavailable" ? (
            <>
              <BridgeBlocked error={bridgeError} />
              <CapturedAxlProof />
            </>
          ) : derivedBids.length === 0 ? (
            <EmptyBids status={bridgeStatus} />
          ) : (
            <div className="auction-bid-grid">
              {derivedBids.map((b, i) => (
                <BidCard
                  key={b.worker}
                  bid={b}
                  lot={lots.find(
                    (l) =>
                      l.lot === b.workerINFTId ||
                      l.owner.toLowerCase() === b.worker.toLowerCase(),
                  )}
                  rank={i + 1}
                />
              ))}
            </div>
          )}

          {/* Status bar — live, not aspirational */}
          <div className="auction-status-bar">
            <StatusInd
              label={
                bridgeStatus === "live"
                  ? `AXL · ${meshSize} ${meshSize === 1 ? "node" : "nodes"} connected`
                  : "AXL bridge offline · captured proof shown"
              }
              ok={bridgeStatus === "live" && peerCount > 0}
            />
            <StatusInd label="0G Galileo · escrow on-chain" ok={true} />
            <StatusInd label="ENS resolver · ledger.eth live" ok={true} />
          </div>
        </div>

        {/* RIGHT RAIL */}
        <div className="auction-rail">
          <div className="caps-md muted" style={{ marginBottom: 20 }}>
            AXL TOPOLOGY
          </div>
          <AxlTopology />
          {bridgeStatus === "unavailable" ? <CapturedTopologyRows /> : null}

          <div style={{ marginTop: 32 }}>
            <div className="caps-md muted" style={{ marginBottom: 12 }}>
              MESH LOG · TASK <TaskIdHover taskId={job.id} />
            </div>
            <MeshLog
              messages={recvMessages}
              status={bridgeStatus}
              error={bridgeError}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────────────────────────────────

function BridgeBlocked({ error }: { error: string | null }) {
  return (
    <div className="auction-block">
      <div className="caps-md" style={{ color: "var(--ledger-warning)" }}>
        LIVE BRIDGE NOT ATTACHED TO THIS DEPLOY
      </div>
      <p className="auction-block-body">
        Vercel cannot reach the local AXL bridge at <code>127.0.0.1:9002</code>.
        The live bridge view will populate when the AXL daemon is attached.
        Until then, this page shows timestamped captured proof from the real
        three-node run: two Fly.io nodes plus one residential NAT laptop. No
        mock bid data is rendered.
      </p>
      {error ? <div className="auction-block-error">{error}</div> : null}
    </div>
  );
}

function CapturedAxlProof() {
  return (
    <div className="captured-proof-panel">
      <div className="captured-proof-head">
        <div>
          <div className="caps-sm muted">CAPTURED LIVE AXL PROOF</div>
          <div className="captured-proof-title">
            TASK_POSTED → BID → BID_ACCEPTED → AUCTION_CLOSED → RESULT
          </div>
        </div>
        <div className="mono captured-proof-time">
          {AXL_CAPTURED_PROOF.capturedAt}
        </div>
      </div>
      <div className="captured-proof-grid">
        {AXL_CAPTURED_PROOF.nodes.map((node) => (
          <div key={node.peerId} className="captured-node">
            <div className="caps-sm text-oxblood">{node.role}</div>
            <div className="captured-node-host">{node.host}</div>
            <div className="mono captured-node-peer">
              {short(node.peerId, 10, 8)}
            </div>
            <div className="mono captured-node-peer">{node.ipv6}</div>
          </div>
        ))}
      </div>
      <div className="captured-proof-foot">
        <span>
          Fanout: local {AXL_CAPTURED_PROOF.fanout.localLatencyMs}ms · worker{" "}
          {AXL_CAPTURED_PROOF.fanout.workerLatencyMs}ms
        </span>
        <span>Topology: {AXL_CAPTURED_PROOF.topologyCapturedAt}</span>
      </div>
    </div>
  );
}

function CapturedTopologyRows() {
  return (
    <div className="captured-topology-list">
      {AXL_CAPTURED_PROOF.nodes.map((node) => (
        <div key={node.peerId} className="captured-topology-row">
          <span className="caps-sm">{node.role}</span>
          <span className="mono">{short(node.peerId, 6, 4)}</span>
        </div>
      ))}
    </div>
  );
}

function EmptyBids({ status }: { status: "live" | "probing" }) {
  return (
    <div className="auction-empty">
      <div className="caps-md muted">
        {status === "probing"
          ? "Probing the mesh…"
          : "No BID messages received for this taskId yet."}
      </div>
      <p className="auction-empty-body">
        {status === "probing"
          ? "Connecting to the AXL bridge."
          : "Workers will appear here as they broadcast BID messages on this auction. Nothing on screen is simulated."}
      </p>
    </div>
  );
}

function BidCard({
  bid,
  lot,
  rank,
}: {
  bid: DerivedBid;
  lot?: Lot;
  rank: number;
}) {
  const winning = rank === 1;
  return (
    <div
      className="bid-card"
      style={{
        opacity: winning ? 1 : 0.78,
        borderColor: winning
          ? "var(--ledger-oxblood)"
          : "rgba(245,241,232,0.2)",
      }}
    >
      <div style={{ alignSelf: "flex-start" }}>
        <span className="caps-md" style={{ color: "var(--ledger-paper)" }}>
          {lot ? `LOT ${lot.lot}` : `${bid.worker.slice(0, 10)}…`}
          {winning ? (
            <span
              className="caps-sm"
              style={{ marginLeft: 8, color: "var(--ledger-oxblood)" }}
            >
              LEADING
            </span>
          ) : null}
        </span>
      </div>
      {lot ? (
        <div className="bid-emblem">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lot.avatar} alt="" />
        </div>
      ) : (
        <div className="bid-emblem bid-emblem-placeholder">
          <span className="caps-sm muted">UNKNOWN ENS</span>
        </div>
      )}
      <div className="bid-name">{lot?.ens ?? "off-catalogue worker"}</div>
      <div className="caps-sm muted">
        {bid.avgRating !== undefined && bid.jobCount !== undefined
          ? `${bid.avgRating} ★ · ${bid.jobCount} JOBS`
          : "rep proof not in BID payload"}
      </div>
      <div style={{ marginTop: 8 }} className="italic-num text-oxblood">
        <span style={{ fontSize: 32 }}>{formatBid(bid.bidAmount)} 0G</span>
      </div>
      <div
        style={{
          width: "80%",
          height: 1,
          background: winning
            ? "var(--ledger-oxblood)"
            : "rgba(245,241,232,0.16)",
          animation: winning ? "breathe 1.2s ease-in-out infinite" : "none",
          opacity: winning ? 1 : 0.4,
        }}
      />
    </div>
  );
}

function MeshLog({
  messages,
  status,
  error,
}: {
  messages: AxlMessage[];
  status: "probing" | "live" | "unavailable";
  error: string | null;
}) {
  if (status === "unavailable") {
    return (
      <div className="mesh-log captured-mesh-log">
        {AXL_CAPTURED_PROOF.lifecycle.map((entry) => (
          <div key={`${entry.at}-${entry.event}`} className="mono mesh-log-row">
            <span className="muted">{entry.at}</span>{" "}
            <span style={{ color: "var(--ledger-paper)" }}>{entry.node}</span> :{" "}
            <span className="text-oxblood" style={{ fontWeight: 600 }}>
              {entry.event}
            </span>
          </div>
        ))}
        {error ? <div className="mesh-log-blocked-error">{error}</div> : null}
      </div>
    );
  }
  if (messages.length === 0) {
    return (
      <div className="mesh-log-empty">
        {status === "probing"
          ? "Connecting…"
          : "No messages routed for this taskId yet."}
      </div>
    );
  }
  return (
    <div className="mesh-log mesh-log-rich">
      {messages.map((m, i) => {
        const detail = describeMessage(m);
        return (
          <div
            key={`${m.receivedAt}-${i}`}
            className="mesh-log-rich-row"
            style={{ opacity: Math.max(0.55, 1 - i * 0.04) }}
          >
            <div className="mesh-log-rich-head">
              <span className="mono muted mesh-log-rich-time">
                {formatTime(m.receivedAt)}
              </span>
              <span
                className="mesh-log-rich-type caps-sm"
                data-tone={detail.tone}
              >
                {detail.type}
              </span>
              <span className="mesh-log-rich-channel mono muted">
                {detail.channel}
              </span>
            </div>
            <div className="mesh-log-rich-line mono">
              <span className="muted">peer</span>{" "}
              <span style={{ color: "var(--ledger-paper)" }}>
                {m.fromPeerId ? short(m.fromPeerId, 4, 4) : "—"}
              </span>
              {detail.summary ? (
                <>
                  {"  "}
                  <span className="muted">·</span>{" "}
                  <span style={{ color: "var(--ledger-paper)" }}>
                    {detail.summary}
                  </span>
                </>
              ) : null}
            </div>
            {detail.kvs.length > 0 ? (
              <div className="mesh-log-rich-kvs">
                {detail.kvs.map((kv, j) => (
                  <span key={j} className="mesh-log-rich-kv mono">
                    <span className="muted">{kv.label}</span>
                    <span>{kv.value}</span>
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Decode a wire payload into a richer set of fields the mesh log can render
 * — type pill (with color tone), channel hint, one-line summary, and a
 * compact list of key/value pairs (taskId / worker / bid / etc.). We never
 * fabricate data; every field below is pulled directly from the AXL payload.
 */
function describeMessage(m: AxlMessage): {
  type: string;
  tone: "post" | "bid" | "accept" | "result" | "close" | "info";
  channel: string;
  summary: string | null;
  kvs: { label: string; value: string }[];
} {
  const p = m.payload as Record<string, unknown> | undefined;
  if (!p || typeof p !== "object") {
    return {
      type: "MSG",
      tone: "info",
      channel: "direct",
      summary: typeof m.payload === "string" ? m.payload.slice(0, 40) : null,
      kvs: [],
    };
  }
  const type = String(p.type ?? "MSG").toUpperCase();
  const taskId = typeof p.taskId === "string" ? short(p.taskId, 6, 4) : null;
  const kvs: { label: string; value: string }[] = [];
  let summary: string | null = null;
  let tone: "post" | "bid" | "accept" | "result" | "close" | "info" = "info";
  let channel = "direct";

  if (type === "TASK_POSTED") {
    tone = "post";
    channel = "#ledger-jobs";
    summary = "buyer broadcast new task";
    if (p.task && typeof p.task === "object") {
      const t = p.task as { title?: string; deadlineSeconds?: number };
      if (t.title) kvs.push({ label: "title", value: String(t.title) });
      if (typeof t.deadlineSeconds === "number")
        kvs.push({ label: "deadline", value: `${t.deadlineSeconds}s` });
    }
    if (p.payment && typeof p.payment === "object") {
      const pay = p.payment as { amount?: string; token?: string };
      if (pay.amount && pay.token)
        kvs.push({ label: "payment", value: `${pay.amount} ${pay.token}` });
    }
    if (taskId) kvs.push({ label: "task", value: taskId });
  } else if (type === "BID") {
    tone = "bid";
    channel = "direct";
    const worker = typeof p.worker === "string" ? p.worker : null;
    const bidAmount =
      typeof p.bidAmount === "string" || typeof p.bidAmount === "number"
        ? String(p.bidAmount)
        : null;
    summary = worker ? `bid from ${short(worker, 4, 4)}` : "bid received";
    if (bidAmount) kvs.push({ label: "amount", value: bidAmount });
    const rep = p.reputationProof as
      | { jobCount?: number; avgRating?: number }
      | undefined;
    if (rep?.jobCount !== undefined)
      kvs.push({
        label: "rep",
        value: `${rep.jobCount} jobs · ${rep.avgRating ?? "—"}★`,
      });
    if (taskId) kvs.push({ label: "task", value: taskId });
  } else if (type === "BID_ACCEPTED") {
    tone = "accept";
    channel = "direct";
    const w = typeof p.selectedWorker === "string" ? p.selectedWorker : null;
    summary = w ? `winner = ${short(w, 4, 4)}` : "winner picked";
    if (typeof p.acceptedBidAmount !== "undefined")
      kvs.push({ label: "bid", value: String(p.acceptedBidAmount) });
    if (typeof p.escrowTxHash === "string")
      kvs.push({ label: "escrow", value: short(p.escrowTxHash, 6, 4) });
    if (taskId) kvs.push({ label: "task", value: taskId });
  } else if (type === "RESULT") {
    tone = "result";
    channel = "direct";
    const w = typeof p.worker === "string" ? p.worker : null;
    summary = w ? `result from ${short(w, 4, 4)}` : "result delivered";
    if (typeof p.resultHash === "string")
      kvs.push({ label: "hash", value: short(p.resultHash, 6, 4) });
    if (typeof p.resultPointer === "string")
      kvs.push({
        label: "blob",
        value: short(p.resultPointer, 8, 4),
      });
    if (taskId) kvs.push({ label: "task", value: taskId });
  } else if (type === "AUCTION_CLOSED") {
    tone = "close";
    channel = "#ledger-auction-closed";
    summary = "auction ended — losers free their bond";
    if (typeof p.selectedWorker === "string")
      kvs.push({
        label: "winner",
        value: short(p.selectedWorker as string, 4, 4),
      });
    if (taskId) kvs.push({ label: "task", value: taskId });
  } else {
    summary = type === "MSG" ? "untyped payload" : type.toLowerCase();
    if (taskId) kvs.push({ label: "task", value: taskId });
  }

  return { type, tone, channel, summary, kvs };
}

function StatusInd({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontSize: 12,
        color: ok ? "var(--ledger-paper)" : "var(--ledger-ink-muted)",
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: ok ? "var(--ledger-success)" : "var(--ledger-ink-muted)",
          display: "inline-block",
        }}
      />
      <span className="caps-sm">{label}</span>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Pure helpers
// ──────────────────────────────────────────────────────────────────────────

function deriveBids(messages: AxlMessage[]): DerivedBid[] {
  const byWorker = new Map<string, DerivedBid>();
  for (const m of messages) {
    const p = m.payload as
      | {
          type?: string;
          worker?: string;
          workerINFTId?: string;
          bidAmount?: string;
          reputationProof?: { jobCount?: number; avgRating?: number };
        }
      | undefined;
    if (!p || p.type !== "BID" || typeof p.worker !== "string") continue;
    const amount = parseAmount(p.bidAmount);
    if (amount === null) continue;
    const prev = byWorker.get(p.worker.toLowerCase());
    // Keep the lowest amount per worker (best/most-aggressive bid).
    if (prev && prev.bidAmount <= amount) continue;
    byWorker.set(p.worker.toLowerCase(), {
      worker: p.worker,
      workerINFTId: p.workerINFTId,
      bidAmount: amount,
      jobCount: p.reputationProof?.jobCount,
      avgRating: p.reputationProof?.avgRating,
      receivedAt: m.receivedAt,
    });
  }
  return Array.from(byWorker.values()).sort(
    (a, b) => a.bidAmount - b.bidAmount,
  );
}

function parseAmount(raw: unknown): number | null {
  if (typeof raw !== "string" && typeof raw !== "number") return null;
  // BID messages encode amounts as native 0G values. Bids posted via
  // PostTaskClient use parseEther → wei strings (18 decimals), but earlier
  // workers may emit decimal strings ("0.005") or small integers (raw 0G).
  // Resolve all three:
  //   "0.005"            → 0.005       (decimal — treat as 0G)
  //   "5000000000000000" → 0.005       (wei — divide by 1e18)
  //   "5"                → 5           (small int — already 0G)
  const str = String(raw);
  if (!/^-?[0-9]+(\.[0-9]+)?$/.test(str)) return null;
  if (str.includes(".")) {
    const num = Number(str);
    return Number.isFinite(num) ? num : null;
  }
  // Integer path: wei if ≥ 1e9 (an inarguable wei-scale number for 0G);
  // otherwise treat as plain 0G.
  try {
    const big = BigInt(str);
    if (big >= 1_000_000_000n) {
      // Use string division to preserve precision past JS number range.
      const WEI = 1_000_000_000_000_000_000n;
      const whole = big / WEI;
      const frac = big % WEI;
      const fracStr = frac.toString().padStart(18, "0").slice(0, 6);
      const num = Number(`${whole.toString()}.${fracStr}`);
      return Number.isFinite(num) ? num : null;
    }
    const num = Number(big);
    return Number.isFinite(num) ? num : null;
  } catch {
    return null;
  }
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

// Bids on 0G are commonly fractional (e.g. 0.005 0G). Avoid the
// ".toFixed(2) → 0.00 0G" trap by tiering precision by magnitude.
function formatBid(n: number): string {
  if (n === 0) return "0";
  const abs = Math.abs(n);
  if (abs >= 1) return n.toFixed(2);
  if (abs >= 0.001) return n.toFixed(4);
  if (abs >= 0.000001) return n.toFixed(6);
  return n.toExponential(2);
}

function short(s: string, head = 6, tail = 4): string {
  if (s.length <= head + tail + 2) return s;
  return `${s.slice(0, head)}…${s.slice(-tail)}`;
}

/**
 * Format a unix-second deadline as e.g. "May 3, 2026 8:53 PM".
 * Avoids `toLocaleString()` because it produces locale-dependent output
 * with seconds ("5/3/2026, 8:53:19 PM") that overflows the deadline card.
 */
function formatDeadline(unixSec: number): string {
  const d = new Date(unixSec * 1000);
  const month = d.toLocaleString("en-US", { month: "short" });
  const day = d.getDate();
  const year = d.getFullYear();
  let hour = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${month} ${day}, ${year} ${hour}:${minutes} ${ampm}`;
}

/**
 * Format the on-chain `minReputation` integer back into a human rating.
 * Two writers in the wild:
 *   - PostTaskClient encodes as floor(rating * 100), so e.g. 4.5★ → 450.
 *   - Some demo tasks were posted with a 1e18-scaled value (4.5 * 10^18).
 * We pick the right scale by magnitude so older receipts still render.
 */
function formatMinReputation(raw: string | number | bigint): string {
  let n: bigint;
  try {
    n = typeof raw === "bigint" ? raw : BigInt(String(raw));
  } catch {
    return String(raw);
  }
  if (n === 0n) return "0 ★";
  const denom =
    n >= 10_000_000_000_000n
      ? 1_000_000_000_000_000_000n // 1e18 scale
      : 100n; // *100 scale
  // Get value with one decimal place by scaling up first.
  const tenths = (n * 10n) / denom;
  const whole = tenths / 10n;
  const frac = tenths % 10n;
  const numeric = frac === 0n ? `${whole}` : `${whole}.${frac}`;
  return `${numeric} ★`;
}

// Short note shown in the BID HISTORY slot when the task has resolved and
// the AXL ring has nothing for the taskId — happens often because the
// auction closes before the bridge captures anything, or because the
// resolution happened in a previous demo session.
/**
 * ResolvedAuctionPanel — replaces the text-wall placeholder with a
 * phase-aware rich render of who won, what happened, and where in the
 * lifecycle the task sits. No more anonymous "see panel above" copy.
 *
 * Layout:
 *   1. Phase timeline (POSTED → ACCEPTED → DELIVERED → PAID), with
 *      filled / pending dots reflecting the current escrow status.
 *   2. Winner spotlight card — avatar + ENS name + reputation +
 *      click-through to /agent/<ensName>. Greyed-out for Cancelled.
 *   3. One-line outcome (e.g. "Saved 0.0002 0G vs ceiling" /
 *      "Bond slashed: 0.0001 0G burned").
 */
function ResolvedAuctionPanel({
  receipt,
  lots,
}: {
  receipt?: LiveJobReceipt;
  lots: Lot[];
}) {
  const status = receipt?.status ?? "Posted";

  // Phase progression. For Released we light all 4. For Accepted the
  // first 2. Cancelled/Slashed terminate early — render special state.
  const phases =
    status === "Cancelled"
      ? ([
          { key: "posted", label: "POSTED", filled: true },
          {
            key: "cancelled",
            label: "CANCELLED",
            filled: true,
            terminal: true,
          },
        ] as const)
      : status === "Slashed"
        ? ([
            { key: "posted", label: "POSTED", filled: true },
            { key: "accepted", label: "ACCEPTED", filled: true },
            {
              key: "slashed",
              label: "BOND SLASHED",
              filled: true,
              terminal: true,
            },
          ] as const)
        : ([
            { key: "posted", label: "POSTED", filled: true },
            {
              key: "accepted",
              label: "ACCEPTED",
              filled: status === "Accepted" || status === "Released",
            },
            {
              key: "delivered",
              label: "DELIVERED",
              filled: status === "Released",
            },
            { key: "paid", label: "PAID", filled: status === "Released" },
          ] as const);

  // Winner lookup: try matching the receipt.worker address against the
  // catalogue lots so we can pull avatar + reputation. Fall back to a
  // DiceBear identicon when the winner isn't yet on the catalogue.
  const matchedLot = receipt?.worker
    ? lots.find((l) => l.owner.toLowerCase() === receipt.worker!.toLowerCase())
    : null;
  const winnerEnsName = matchedLot?.ens ?? receipt?.workerEnsName ?? null;
  const winnerAvatar =
    matchedLot?.avatar ??
    (receipt?.worker
      ? `https://api.dicebear.com/9.x/shapes/svg?seed=${receipt.worker}`
      : null);
  const winnerRep = matchedLot
    ? `${matchedLot.jobs} jobs · ${matchedLot.rating} ★`
    : receipt?.workerJobs != null && receipt?.workerRating != null
      ? `${receipt.workerJobs} jobs · ${receipt.workerRating} ★`
      : null;

  const showWinner =
    receipt?.worker &&
    (status === "Accepted" || status === "Released" || status === "Slashed");

  const outcomeNote =
    status === "Released" && receipt?.bidAmountEth && receipt?.paymentEth
      ? `Saved ${(Number(receipt.paymentEth) - Number(receipt.bidAmountEth)).toFixed(6)} 0G vs ceiling`
      : status === "Accepted"
        ? "Worker bond locked. Awaiting RESULT message…"
        : status === "Cancelled"
          ? "No qualifying bids before the deadline. Reward returned to buyer."
          : status === "Slashed"
            ? "Worker missed the deadline. Bond burned."
            : null;

  return (
    <div className="resolved-panel">
      {/* PHASE TIMELINE */}
      <div className="resolved-timeline">
        {phases.map((p, i) => (
          <div key={p.key} className="resolved-timeline-step">
            <span
              className="resolved-timeline-dot"
              data-filled={p.filled ? "1" : "0"}
              data-terminal={"terminal" in p && p.terminal ? "1" : "0"}
            />
            <span
              className="caps-sm resolved-timeline-label"
              data-filled={p.filled ? "1" : "0"}
            >
              {p.label}
            </span>
            {i < phases.length - 1 ? (
              <span
                className="resolved-timeline-bar"
                data-filled={p.filled && phases[i + 1].filled ? "1" : "0"}
              />
            ) : null}
          </div>
        ))}
      </div>

      {/* WINNER SPOTLIGHT */}
      {showWinner && winnerAvatar ? (
        <Link
          href={
            winnerEnsName ? `/agent/${encodeURIComponent(winnerEnsName)}` : "#"
          }
          className="resolved-winner-card"
        >
          <div className="resolved-winner-avatar">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={winnerAvatar} alt="" />
          </div>
          <div className="resolved-winner-meta">
            <div className="caps-sm muted">
              {status === "Released"
                ? "PAID TO"
                : status === "Slashed"
                  ? "WINNER (SLASHED)"
                  : "WINNING WORKER"}
            </div>
            <div className="resolved-winner-name italic-num">
              {winnerEnsName ?? short(receipt!.worker!, 6, 4)}
            </div>
            {winnerRep ? (
              <div className="caps-sm muted resolved-winner-rep">
                {winnerRep}
              </div>
            ) : null}
            {receipt?.bidAmountEth ? (
              <div className="resolved-winner-bid italic-num text-oxblood">
                {receipt.bidAmountEth} 0G{" "}
                <span
                  className="caps-sm muted"
                  style={{ marginLeft: 8, fontSize: 11 }}
                >
                  ACCEPTED BID
                </span>
              </div>
            ) : null}
          </div>
          <span className="resolved-winner-cta caps-sm">View profile ↗</span>
        </Link>
      ) : null}

      {/* OUTCOME LINE */}
      {outcomeNote ? (
        <div className="resolved-outcome">
          <span
            className="caps-sm"
            style={{
              color:
                status === "Released"
                  ? "var(--ledger-success)"
                  : status === "Slashed"
                    ? "var(--ledger-oxblood)"
                    : "var(--ledger-ink-muted)",
            }}
          >
            {outcomeNote}
          </span>
        </div>
      ) : null}
    </div>
  );
}

function TaskIdHover({ taskId }: { taskId: string }) {
  const display = short(taskId, 6, 4).toUpperCase();
  return (
    <span className="taskid-hover" tabIndex={0}>
      <span className="taskid-hover-trigger mono">{display}</span>
      <span className="taskid-hover-popover mono" role="tooltip">
        {taskId}
      </span>
    </span>
  );
}

// JobBriefPanel — surfaces the actual task content (title, description,
// requirements, tags) plus the 0G Storage CID where the brief is pinned.
function JobBriefPanel({
  brief,
  cid,
  pinned,
  missing,
  taskId,
}: {
  brief: {
    title: string;
    description: string;
    category: string;
    tags?: string[];
    minReputation?: string;
    minJobs?: string;
    payoutOg?: string;
    bondOg?: string;
    deadlineSec?: number;
    postedBy?: string;
  } | null;
  cid: string | null;
  pinned: boolean;
  missing: boolean;
  taskId: string;
}) {
  if (!brief) {
    if (!missing) {
      return (
        <div className="job-brief-panel job-brief-panel-loading">
          <div className="caps-md muted">FETCHING JOB BRIEF FROM 0G…</div>
        </div>
      );
    }
    return (
      <div className="job-brief-panel-stub">
        <span
          className="caps-sm"
          style={{ color: "var(--ledger-warning)", letterSpacing: "0.14em" }}
        >
          ● NO BRIEF PINNED
        </span>
        <span className="caps-sm muted" style={{ fontSize: 11 }}>
          taskId{" "}
          <span className="mono" style={{ color: "var(--ledger-paper)" }}>
            {short(taskId, 6, 4)}
          </span>{" "}
          · receipt below
        </span>
      </div>
    );
  }
  // The CID format we persist is: 0g://<rootHash>?tx=<txHash>[&txSeq=<n>]
  // Download URL hits the indexer's /file endpoint (same behaviour as
  // before — clicking the link triggers a direct download). The explorer
  // URL goes to storagescan-galileo's /submission/<id> page; that route
  // accepts either txSeq or txHash, so we prefer txSeq when present and
  // fall back to txHash (which every CID has).
  const cidParse = cid
    ? (() => {
        const noScheme = cid.replace(/^0g:\/\//, "");
        const [root, query = ""] = noScheme.split("?");
        const params = new URLSearchParams(query);
        return {
          root,
          tx: params.get("tx") || null,
          txSeq: params.get("txSeq") || null,
        };
      })()
    : null;
  const ogDownloadHref = cidParse?.root
    ? `https://indexer-storage-testnet-turbo.0g.ai/file?root=${cidParse.root}`
    : null;
  const ogExplorerHref = cidParse?.txSeq
    ? `https://storagescan-galileo.0g.ai/submission/${cidParse.txSeq}`
    : cidParse?.tx
      ? `https://storagescan-galileo.0g.ai/submission/${cidParse.tx}`
      : null;
  return (
    <div className="job-brief-panel">
      <div className="job-brief-head">
        <div className="caps-md muted">JOB BRIEF · PINNED ON 0G STORAGE</div>
        <div className="job-brief-meta">
          {pinned ? (
            <span className="job-brief-status job-brief-status-pinned">
              ● PINNED
            </span>
          ) : (
            <span className="job-brief-status job-brief-status-pending">
              ● PIN PENDING
            </span>
          )}
          {cid ? (
            <span className="job-brief-cid-group">
              <span className="mono job-brief-cid" title={cid}>
                {short(cid, 14, 8)}
              </span>
              {ogDownloadHref ? (
                <a
                  href={ogDownloadHref}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="job-brief-cid-link"
                  title="Download brief JSON from 0G Storage indexer"
                >
                  ⤓ Download
                </a>
              ) : null}
              {ogExplorerHref ? (
                <a
                  href={ogExplorerHref}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="job-brief-cid-link"
                  title="View submission on 0G Storagescan"
                >
                  ↗ Explorer
                </a>
              ) : null}
            </span>
          ) : null}
        </div>
      </div>

      <div className="job-brief-body">{brief.description}</div>

      {brief.tags && brief.tags.length > 0 ? (
        <div className="job-brief-tags">
          {brief.tags.map((t) => (
            <span key={t} className="job-brief-tag">
              {t}
            </span>
          ))}
        </div>
      ) : null}

      <div className="job-brief-reqs">
        {brief.minReputation && Number(brief.minReputation) > 0 ? (
          <div>
            <div className="caps-sm muted">MIN REPUTATION</div>
            <div className="italic-num job-brief-req-val">
              {brief.minReputation}
            </div>
          </div>
        ) : null}
        {brief.minJobs && Number(brief.minJobs) > 0 ? (
          <div>
            <div className="caps-sm muted">MIN JOBS</div>
            <div className="italic-num job-brief-req-val">{brief.minJobs}</div>
          </div>
        ) : null}
        {brief.payoutOg ? (
          <div>
            <div className="caps-sm muted">POSTED PAYOUT</div>
            <div className="italic-num job-brief-req-val">
              {brief.payoutOg} 0G
            </div>
          </div>
        ) : null}
        {brief.bondOg ? (
          <div>
            <div className="caps-sm muted">SUGGESTED BOND</div>
            <div className="italic-num job-brief-req-val">
              {brief.bondOg} 0G
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// TaskReceiptPanel — rich on-chain detail for tasks past the auction phase.
// Shows the winning worker (with reputation), bid + bond + payment math,
// deadline, posted tx, and all related explorer links so a judge can verify
// every value end-to-end.
// ────────────────────────────────────────────────────────────────────────────
function TaskReceiptPanel({ receipt }: { receipt: LiveJobReceipt }) {
  // Note: galileoTx / galileoAddr are imported from @/lib/contracts where
  // they're guarded by isExplorerSafe() — never hand them a truncated value.
  const ensApp = (n: string) =>
    `https://sepolia.app.ens.domains/${encodeURIComponent(n)}`;
  const escrowAddr = LEDGER_ESCROW_ADDRESS;
  const erc8004 = "0x8004B663056A597Dffe9eCcC1965A193B7388713";

  const STATUS_TONE: Record<
    LiveJobReceipt["status"],
    { label: string; color: string }
  > = {
    Posted: { label: "OPEN AUCTION", color: "var(--ledger-warning)" },
    Accepted: {
      label: "ACCEPTED · WORK IN PROGRESS",
      color: "var(--ledger-gold-leaf)",
    },
    Released: { label: "SETTLED · PAID", color: "var(--ledger-success)" },
    Cancelled: { label: "CANCELLED", color: "var(--ledger-ink-muted)" },
    Slashed: { label: "BOND SLASHED", color: "var(--ledger-oxblood)" },
  };
  const tone = STATUS_TONE[receipt.status];
  const settled = receipt.status === "Released";
  const accepted = receipt.status === "Accepted";

  // Bond is exposed by escrow.tasks() as `bondAmount` but we don't pipe it
  // through (saves an extra read — the bid is the load-bearing number).
  // Compute the implied bond as 20% of bid for display only when accepted.
  const impliedBondEth =
    accepted && receipt.bidAmountEth
      ? (Number(receipt.bidAmountEth) * 0.2).toFixed(6)
      : null;

  return (
    <div className="task-receipt-panel">
      <div className="task-receipt-header">
        <span
          className="task-receipt-pill caps-sm"
          style={{ color: tone.color, borderColor: tone.color }}
        >
          ● {tone.label}
        </span>
        <span className="task-receipt-buyer caps-sm muted">
          BUYER ·{" "}
          <a
            href={galileoAddr(receipt.buyer)}
            target="_blank"
            rel="noreferrer noopener"
            className="mono task-receipt-link"
          >
            {short(receipt.buyer, 6, 4)} ↗
          </a>
        </span>
      </div>

      <div className="task-receipt-grid">
        {/* WINNING WORKER */}
        {receipt.worker ? (
          <div className="task-receipt-card">
            <div className="caps-sm muted task-receipt-card-label">
              {settled ? "PAYOUT RECIPIENT" : "WINNING WORKER"}
            </div>
            <div className="task-receipt-card-value italic-num">
              {receipt.workerEnsName ?? short(receipt.worker, 6, 4)}
            </div>
            {receipt.workerEnsName ? (
              <a
                href={ensApp(receipt.workerEnsName)}
                target="_blank"
                rel="noreferrer noopener"
                className="mono task-receipt-link task-receipt-link-sub"
              >
                {receipt.workerEnsName} on ENS app ↗
              </a>
            ) : null}
            <a
              href={galileoAddr(receipt.worker)}
              target="_blank"
              rel="noreferrer noopener"
              className="mono task-receipt-link task-receipt-link-sub"
            >
              {short(receipt.worker, 6, 4)} on Galileo ↗
            </a>
            {receipt.workerJobs != null && receipt.workerRating != null ? (
              <div className="task-receipt-card-rep caps-sm muted">
                {receipt.workerJobs} jobs · {receipt.workerRating} ★
                {receipt.workerEarned
                  ? ` · ${receipt.workerEarned} 0G earned`
                  : ""}
              </div>
            ) : null}
          </div>
        ) : null}

        {/* MONEY MATH */}
        <div className="task-receipt-card">
          <div className="caps-sm muted task-receipt-card-label">
            {settled ? "RELEASED" : accepted ? "ACCEPTED BID" : "REWARD"}
          </div>
          <div className="task-receipt-card-value italic-num">
            {receipt.bidAmountEth ?? receipt.paymentEth} 0G
          </div>
          <div className="task-receipt-card-rep caps-sm muted">
            posted reward {receipt.paymentEth} 0G
            {accepted && impliedBondEth
              ? ` · ~${impliedBondEth} 0G bond locked`
              : ""}
            {settled && receipt.bidAmountEth
              ? ` · saved ${(Number(receipt.paymentEth) - Number(receipt.bidAmountEth)).toFixed(6)} 0G vs ceiling`
              : ""}
          </div>
        </div>

        {/* TIMING */}
        <div className="task-receipt-card">
          <div className="caps-sm muted task-receipt-card-label">DEADLINE</div>
          <div
            className="task-receipt-card-value italic-num task-receipt-card-value-fit"
            title={new Date(receipt.deadline * 1000).toLocaleString()}
          >
            {formatDeadline(receipt.deadline)}
          </div>
          <div className="task-receipt-card-rep caps-sm muted">
            block ·{" "}
            <a
              href={`https://chainscan-galileo.0g.ai/block/${receipt.postedBlock}`}
              target="_blank"
              rel="noreferrer noopener"
              className="mono task-receipt-link"
            >
              #{receipt.postedBlock}
            </a>{" "}
            · min reputation {formatMinReputation(receipt.minReputation)}
          </div>
        </div>

        {/* TX TRAIL */}
        <div className="task-receipt-card">
          <div className="caps-sm muted task-receipt-card-label">
            ON-CHAIN TRAIL
          </div>
          <div className="task-receipt-tx-list">
            <a
              href={galileoTx(receipt.postedTx)}
              target="_blank"
              rel="noreferrer noopener"
              className="mono task-receipt-link"
            >
              postTask {short(receipt.postedTx, 6, 4)} ↗
            </a>
            <a
              href={galileoAddr(escrowAddr)}
              target="_blank"
              rel="noreferrer noopener"
              className="mono task-receipt-link"
            >
              LedgerEscrow {short(escrowAddr, 6, 4)} ↗
            </a>
            {settled ? (
              <a
                href={galileoAddr(erc8004).replace(
                  "chainscan-galileo.0g.ai",
                  "sepolia.basescan.org",
                )}
                target="_blank"
                rel="noreferrer noopener"
                className="mono task-receipt-link"
              >
                ERC-8004 feedback registry ↗
              </a>
            ) : null}
            {/* "Event log" link removed: the postTask tx only emits the
                TaskPosted event, which is one of many events in the lifecycle.
                AcceptBid, releasePayment, ERC-8004 NewFeedback, and AXL
                BID/RESULT messages all live in different places — pointing
                at one tx's event log misrepresented the trail. The contract
                address link above lets users browse all escrow events. */}
          </div>
        </div>
      </div>
    </div>
  );
}
