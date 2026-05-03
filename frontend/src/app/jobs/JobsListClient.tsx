"use client";

import {
  useEffect,
  useState,
  useSyncExternalStore,
  type MouseEvent,
} from "react";
import { useRouter } from "next/navigation";
import type { Job } from "@/lib/data";
import {
  InspectDrawer,
  InspectPill,
  type InspectGroup,
} from "@/components/InspectDrawer";
import {
  LEDGER_ESCROW_ADDRESS,
  DEMO_TASK_ID,
  DEMO_RELEASE_TX,
  galileoTx,
  galileoAddr,
} from "@/lib/contracts";

type DerivedStatus = "open" | "accepted" | "settled" | "cancelled" | "slashed";
type ViewMode = "grid" | "table";
type Category =
  | "research"
  | "data"
  | "code"
  | "creative"
  | "ops"
  | "trading"
  | "other";

type Brief = {
  title: string;
  description: string;
  category: Category;
  tags?: string[];
  postedBy?: string;
};
type BriefEntry = {
  taskId: string;
  cid: string;
  pinned: boolean;
  brief: Brief;
};
type BriefsResponse = {
  ok?: boolean;
  briefs?: BriefEntry[];
};

const CATEGORY_LABEL: Record<Category, string> = {
  research: "Research",
  data: "Data",
  code: "Code",
  creative: "Creative",
  ops: "Ops",
  trading: "Trading",
  other: "Other",
};
const CATEGORIES: Category[] = [
  "research",
  "data",
  "code",
  "creative",
  "ops",
  "trading",
  "other",
];

const VIEW_STORAGE_KEY = "ledger.jobs.view";

// Status comes straight from the LedgerEscrow.tasks() readback now (Job.status).
// We used to derive it from the synthesized title string, but Job.title is now
// reserved for the actual pinned brief title — empty string means "no brief
// pinned for this taskId" rather than a status hint.
function deriveStatus(j: Job): DerivedStatus {
  switch (j.status) {
    case "Accepted":
      return "accepted";
    case "Released":
      return "settled";
    case "Cancelled":
      return "cancelled";
    case "Slashed":
      return "slashed";
    case "Posted":
    default:
      return "open";
  }
}

const STATUS_LABEL: Record<DerivedStatus, string> = {
  open: "OPEN",
  accepted: "ACCEPTED",
  settled: "SETTLED",
  cancelled: "CANCELLED",
  slashed: "SLASHED",
};

// < 1 min  → "Xs"           (terse, for live-tail urgency)
// < 1 h    → "MM:SS"         (canonical countdown)
// < 24 h   → "Xh YYm"        (e.g. "12h 04m")
// ≥ 24 h   → "Xd Yh"         (e.g. "3d 7h")
function formatCountdown(s: number): string {
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
}

const stop = (e: MouseEvent) => e.stopPropagation();

// localStorage-backed view-mode store. useSyncExternalStore handles SSR
// (server snapshot = "grid"), the storage event keeps tabs in sync, and
// mount-time hydration happens without a setState-in-effect.
function readStoredViewMode(): ViewMode {
  try {
    const v = window.localStorage.getItem(VIEW_STORAGE_KEY);
    return v === "table" ? "table" : "grid";
  } catch {
    return "grid";
  }
}
function subscribeToViewMode(onChange: () => void) {
  const handler = (e: StorageEvent) => {
    if (e.key === VIEW_STORAGE_KEY) onChange();
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}
function useStoredViewMode(): [ViewMode, (v: ViewMode) => void] {
  const stored = useSyncExternalStore<ViewMode>(
    subscribeToViewMode,
    readStoredViewMode,
    () => "grid" as ViewMode,
  );
  const set = (v: ViewMode) => {
    try {
      window.localStorage.setItem(VIEW_STORAGE_KEY, v);
      // Local writes don't fire `storage` in the same tab — nudge subscribers.
      window.dispatchEvent(
        new StorageEvent("storage", { key: VIEW_STORAGE_KEY }),
      );
    } catch {
      /* ignore */
    }
  };
  return [stored, set];
}

export function JobsListClient({ jobs }: { jobs: Job[] }) {
  const router = useRouter();
  const [tick, setTick] = useState(0);
  const [inspectJobId, setInspectJobId] = useState<string | null>(null);
  const [viewMode, setView] = useStoredViewMode();

  // Fetch all known briefs once on mount and re-poll every 6s so newly-posted
  // tasks pick up their brief shortly after the buyer redirects here.
  const [briefs, setBriefs] = useState<Map<string, BriefEntry>>(new Map());
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const r = await fetch("/api/jobs/brief", { cache: "no-store" });
        if (!r.ok) return;
        const body: BriefsResponse = await r.json();
        if (cancelled || !body.briefs) return;
        const next = new Map<string, BriefEntry>();
        for (const b of body.briefs) next.set(b.taskId.toLowerCase(), b);
        setBriefs(next);
      } catch {
        /* best-effort */
      }
    };
    load();
    const id = window.setInterval(load, 6000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  const [activeCategory, setActiveCategory] = useState<Category | "all">("all");

  const hasLive = jobs.some((j) => {
    const s = deriveStatus(j);
    return s === "open" || s === "accepted";
  });
  useEffect(() => {
    if (!hasLive) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 1000);
    return () => window.clearInterval(id);
  }, [hasLive]);

  const visibleJobs =
    activeCategory === "all"
      ? jobs
      : jobs.filter(
          (j) =>
            briefs.get(j.id.toLowerCase())?.brief.category === activeCategory,
        );

  const inspectJob = jobs.find((j) => j.id === inspectJobId);

  const counts = jobs.reduce(
    (acc, j) => {
      const s = deriveStatus(j);
      acc[s] = (acc[s] ?? 0) + 1;
      return acc;
    },
    {} as Record<DerivedStatus, number>,
  );

  // Per-category counts (over all jobs, not just the visible filtered set).
  const categoryCounts = (() => {
    const c: Partial<Record<Category, number>> = {};
    for (const j of jobs) {
      const cat = briefs.get(j.id.toLowerCase())?.brief.category;
      if (cat) c[cat] = (c[cat] ?? 0) + 1;
    }
    return c;
  })();

  const briefedCount = Array.from(briefs.values()).filter((b) =>
    jobs.some((j) => j.id.toLowerCase() === b.taskId),
  ).length;

  const openInspect = (id: string) => setInspectJobId(id);
  const openAuction = (id: string) => router.push(`/jobs/${id}`);

  return (
    <div className="page jobs-page-wrap">
      <div className="jobs-page-header">
        <div>
          <h1>Live jobs.</h1>
          <p className="jobs-page-sub">
            Every row is an on-chain LedgerEscrow task on 0G Galileo. Click a
            card to enter the auction room, or inspect for the full receipt
            chain.
          </p>
        </div>
        <div className="jobs-page-meta">
          <div className="jobs-page-counts">
            <span>
              <strong>{counts.open ?? 0}</strong> open
            </span>
            <span className="dot-sep">·</span>
            <span>
              <strong>{counts.accepted ?? 0}</strong> accepted
            </span>
            <span className="dot-sep">·</span>
            <span>
              <strong>{counts.settled ?? 0}</strong> settled
            </span>
            <a
              href={galileoAddr(LEDGER_ESCROW_ADDRESS)}
              target="_blank"
              rel="noreferrer noopener"
              className="caps-sm jobs-escrow-link"
              onClick={stop}
              title="Open LedgerEscrow on Galileo explorer"
            >
              ESCROW ↗
            </a>
          </div>
          <div
            className="jobs-view-toggle"
            role="tablist"
            aria-label="Jobs view"
          >
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === "grid"}
              className={`jobs-view-toggle-btn ${viewMode === "grid" ? "is-active" : ""}`}
              onClick={() => setView("grid")}
            >
              <ViewIconGrid /> Grid
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === "table"}
              className={`jobs-view-toggle-btn ${viewMode === "table" ? "is-active" : ""}`}
              onClick={() => setView("table")}
            >
              <ViewIconTable /> Table
            </button>
          </div>
        </div>
      </div>

      {jobs.length > 0 && (
        <div className="jobs-filter-bar">
          <button
            type="button"
            className={`jobs-filter-chip ${activeCategory === "all" ? "is-active" : ""}`}
            onClick={() => setActiveCategory("all")}
          >
            All <span className="jobs-filter-count">{jobs.length}</span>
          </button>
          {CATEGORIES.map((cat) => {
            const n = categoryCounts[cat] ?? 0;
            return (
              <button
                key={cat}
                type="button"
                disabled={n === 0}
                className={`jobs-filter-chip ${activeCategory === cat ? "is-active" : ""}`}
                onClick={() => setActiveCategory(cat)}
              >
                {CATEGORY_LABEL[cat]}{" "}
                <span className="jobs-filter-count">{n}</span>
              </button>
            );
          })}
          <span className="jobs-filter-meta">
            {briefedCount} of {jobs.length} have a 0G-pinned brief
          </span>
        </div>
      )}

      {jobs.length === 0 && (
        <div className="job-empty">
          <div className="caps-md muted" style={{ marginBottom: 8 }}>
            NO TASKS YET
          </div>
          <div style={{ color: "var(--ledger-ink-muted)", marginBottom: 16 }}>
            Live testnet — no escrow events yet. Be the first to post.
          </div>
          <button
            className="btn btn-italic"
            onClick={() => router.push("/post")}
          >
            Post a task →
          </button>
        </div>
      )}

      {jobs.length > 0 && visibleJobs.length === 0 && (
        <div className="job-empty">
          <div className="caps-md muted" style={{ marginBottom: 8 }}>
            NO TASKS IN{" "}
            {CATEGORY_LABEL[activeCategory as Category].toUpperCase()}
          </div>
          <div style={{ color: "var(--ledger-ink-muted)", marginBottom: 16 }}>
            Try a different category or clear the filter.
          </div>
          <button
            className="btn btn-italic"
            onClick={() => setActiveCategory("all")}
          >
            Clear filter →
          </button>
        </div>
      )}

      {visibleJobs.length > 0 && viewMode === "grid" && (
        <JobsGrid
          jobs={visibleJobs}
          briefs={briefs}
          tick={tick}
          onInspect={openInspect}
          onOpen={openAuction}
        />
      )}

      {visibleJobs.length > 0 && viewMode === "table" && (
        <JobsTable
          jobs={visibleJobs}
          briefs={briefs}
          tick={tick}
          onInspect={openInspect}
          onOpen={openAuction}
        />
      )}

      <InspectDrawer
        open={inspectJob !== undefined}
        onClose={() => setInspectJobId(null)}
        title={inspectJob?.title ?? ""}
        subtitle={
          inspectJob
            ? `${inspectJob.id} · auction over Gensyn AXL · escrow on 0G Galileo`
            : undefined
        }
        groups={inspectJob ? buildJobInspectGroups(inspectJob) : []}
      />
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// GRID VIEW
// ────────────────────────────────────────────────────────────────────────────
function JobsGrid({
  jobs,
  briefs,
  tick,
  onInspect,
  onOpen,
}: {
  jobs: Job[];
  briefs: Map<string, BriefEntry>;
  tick: number;
  onInspect: (id: string) => void;
  onOpen: (id: string) => void;
}) {
  return (
    <div className="jobs-grid">
      {jobs.map((j) => {
        const status = deriveStatus(j);
        const isLive = status === "open" || status === "accepted";
        const t = isLive ? Math.max(0, j.timeLeft - tick) : 0;
        const expired = isLive && t === 0;
        const timerColor =
          t < 30 && t > 0 ? "var(--ledger-gold-leaf)" : "var(--ledger-oxblood)";
        const brief = briefs.get(j.id.toLowerCase())?.brief;
        const titleText = brief?.title ?? "(no title pinned)";
        const descText =
          brief?.description ?? "(no description pinned for this task)";
        const briefMissing = !brief;
        return (
          <div
            key={j.id}
            className={`job-card status-${status}`}
            onClick={() => onOpen(j.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter") onOpen(j.id);
            }}
          >
            <div className="job-card-head">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  flexWrap: "wrap",
                }}
              >
                <span className={`job-status-pill status-${status}`}>
                  ● {STATUS_LABEL[status]}
                </span>
                {brief ? (
                  <span
                    className={`category-chip is-static cat-${brief.category}`}
                  >
                    {CATEGORY_LABEL[brief.category]}
                  </span>
                ) : (
                  <span className="job-card-no-brief">No 0G brief</span>
                )}
              </div>
              {isLive ? (
                <div className="job-card-timer">
                  <span
                    className="mono"
                    style={{
                      fontSize: 22,
                      fontWeight: 500,
                      color: expired ? "var(--ledger-ink-muted)" : timerColor,
                    }}
                  >
                    {expired ? "EXPIRED" : formatCountdown(t)}
                  </span>
                  {!expired && (
                    <span
                      className="caps-sm muted"
                      style={{ fontSize: 10, marginLeft: 6 }}
                    >
                      LEFT
                    </span>
                  )}
                </div>
              ) : (
                <a
                  className="caps-sm job-card-receipt"
                  href={galileoAddr(LEDGER_ESCROW_ADDRESS)}
                  target="_blank"
                  rel="noreferrer noopener"
                  onClick={stop}
                >
                  RECEIPT ↗
                </a>
              )}
            </div>

            <div>
              <div
                className="job-card-title"
                style={
                  briefMissing
                    ? {
                        color: "rgba(245,241,232,0.4)",
                        fontStyle: "italic",
                      }
                    : undefined
                }
              >
                {briefMissing ? titleText : `${titleText}.`}
              </div>
              <div
                className="job-card-desc"
                style={
                  briefMissing
                    ? {
                        color: "rgba(245,241,232,0.4)",
                        fontStyle: "italic",
                      }
                    : undefined
                }
              >
                {descText}
              </div>
            </div>

            <div className="job-card-band">
              <div className="job-card-stat">
                <div className="caps-sm muted">PAYOUT</div>
                <div className="italic-num job-card-stat-val">{j.payout}</div>
              </div>
              {j.bond !== "—" && (
                <div className="job-card-stat">
                  <div className="caps-sm muted">
                    {status === "settled" ? "WINNING BID" : "BID"}
                  </div>
                  <div className="italic-num job-card-stat-val-sm">
                    {j.bond}
                  </div>
                </div>
              )}
              <div className="job-card-stat">
                <div className="caps-sm muted">BIDS</div>
                <div className="italic-num job-card-stat-val-sm">{j.bids}</div>
              </div>
            </div>

            <div className="job-card-foot">
              <div className="job-card-buyer">
                <span className="caps-sm muted">BUYER</span>
                <a
                  href={galileoAddr(j.employer)}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="mono job-card-buyer-link"
                  onClick={stop}
                  title="Open buyer on Galileo explorer"
                >
                  {j.employer}
                </a>
              </div>
              <div className="job-card-actions">
                <span onClick={stop}>
                  <InspectPill onClick={() => onInspect(j.id)} />
                </span>
                <button
                  className="job-card-cta"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpen(j.id);
                  }}
                >
                  Open auction →
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// TABLE VIEW (shadcn-style)
// ────────────────────────────────────────────────────────────────────────────
function JobsTable({
  jobs,
  briefs,
  tick,
  onInspect,
  onOpen,
}: {
  jobs: Job[];
  briefs: Map<string, BriefEntry>;
  tick: number;
  onInspect: (id: string) => void;
  onOpen: (id: string) => void;
}) {
  return (
    <div className="jobs-table-wrap">
      <table className="jobs-table">
        <thead>
          <tr>
            <th>Status</th>
            <th>Task</th>
            <th>Category</th>
            <th className="num">Payout</th>
            <th className="num">Bid</th>
            <th className="num">Bids</th>
            <th className="num">Time</th>
            <th>Buyer</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((j) => {
            const status = deriveStatus(j);
            const isLive = status === "open" || status === "accepted";
            const t = isLive ? Math.max(0, j.timeLeft - tick) : 0;
            const expired = isLive && t === 0;
            const timerColor =
              t < 30 && t > 0
                ? "var(--ledger-gold-leaf)"
                : "var(--ledger-oxblood)";
            const taskIdShort = `${j.id.slice(0, 8)}…${j.id.slice(-4)}`;
            const brief = briefs.get(j.id.toLowerCase())?.brief;
            const titleText = brief?.title ?? "(no title pinned)";
            const briefMissing = !brief;
            return (
              <tr
                key={j.id}
                className={`jobs-table-row status-${status}`}
                onClick={() => onOpen(j.id)}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onOpen(j.id);
                }}
              >
                <td>
                  <span className={`job-status-pill status-${status}`}>
                    ● {STATUS_LABEL[status]}
                  </span>
                </td>
                <td>
                  <div
                    className="jobs-table-task"
                    style={
                      briefMissing
                        ? {
                            color: "rgba(245,241,232,0.4)",
                            fontStyle: "italic",
                          }
                        : undefined
                    }
                  >
                    {titleText}
                  </div>
                  <div className="mono jobs-table-task-id">{taskIdShort}</div>
                </td>
                <td>
                  {brief ? (
                    <span
                      className={`category-chip is-static cat-${brief.category}`}
                    >
                      {CATEGORY_LABEL[brief.category]}
                    </span>
                  ) : (
                    <span className="muted" style={{ fontSize: 11 }}>
                      —
                    </span>
                  )}
                </td>
                <td className="num italic-num jobs-table-payout">{j.payout}</td>
                <td className="num mono jobs-table-bid">
                  {j.bond === "—" ? <span className="muted">—</span> : j.bond}
                </td>
                <td className="num italic-num">{j.bids}</td>
                <td className="num jobs-table-time">
                  {isLive ? (
                    <span
                      className="mono"
                      style={{
                        color: expired ? "var(--ledger-ink-muted)" : timerColor,
                      }}
                    >
                      {expired ? "EXPIRED" : formatCountdown(t)}
                    </span>
                  ) : (
                    <a
                      className="mono jobs-table-receipt"
                      href={galileoAddr(LEDGER_ESCROW_ADDRESS)}
                      target="_blank"
                      rel="noreferrer noopener"
                      onClick={stop}
                    >
                      receipt ↗
                    </a>
                  )}
                </td>
                <td>
                  <a
                    href={galileoAddr(j.employer)}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="mono jobs-table-buyer"
                    onClick={stop}
                    title="Open buyer on Galileo explorer"
                  >
                    {j.employer}
                  </a>
                </td>
                <td className="jobs-table-actions">
                  <span onClick={stop}>
                    <InspectPill onClick={() => onInspect(j.id)} />
                  </span>
                  <button
                    className="jobs-table-open"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpen(j.id);
                    }}
                    aria-label="Open auction"
                  >
                    →
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Toggle icons (inline SVG, no extra deps)
// ────────────────────────────────────────────────────────────────────────────
function ViewIconGrid() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <rect x="1.5" y="1.5" width="5" height="5" />
      <rect x="9.5" y="1.5" width="5" height="5" />
      <rect x="1.5" y="9.5" width="5" height="5" />
      <rect x="9.5" y="9.5" width="5" height="5" />
    </svg>
  );
}
function ViewIconTable() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <rect x="1.5" y="2.5" width="13" height="11" />
      <line x1="1.5" y1="6.2" x2="14.5" y2="6.2" />
      <line x1="1.5" y1="9.5" x2="14.5" y2="9.5" />
      <line x1="6" y1="2.5" x2="6" y2="13.5" />
    </svg>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Inspect drawer content
// ────────────────────────────────────────────────────────────────────────────
function buildJobInspectGroups(job: Job): InspectGroup[] {
  return [
    {
      title: "AUCTION (AXL MESH)",
      rows: [
        { label: "Job ID", value: job.id, mono: true },
        { label: "Buyer", value: job.employer },
        {
          label: "Channel",
          value: "#ledger-jobs (gossipsub fork)",
          mono: true,
        },
        {
          label: "Message types",
          value: "TASK_POSTED → BID → BID_ACCEPTED → AUCTION_CLOSED → RESULT",
          mono: true,
        },
        {
          label: "Encryption",
          value: "Hop-by-hop TLS + end-to-end payload (two layers)",
        },
        {
          label: "Bootstrap",
          value: "tls://66.51.123.38:9001 (sjc) — kill-resilient",
          mono: true,
        },
      ],
    },
    {
      title: "ESCROW (0G GALILEO)",
      rows: [
        {
          label: "LedgerEscrow contract",
          value: LEDGER_ESCROW_ADDRESS,
          href: galileoAddr(LEDGER_ESCROW_ADDRESS),
          mono: true,
        },
        { label: "Payment", value: job.payout },
        { label: "Worker bid", value: job.bond },
        { label: "Time left", value: `${job.timeLeft}s · deadline-anchored` },
        {
          label: "taskId derivation",
          value: "keccak256(buyer ‖ nonce ‖ block.timestamp)",
          mono: true,
        },
        {
          label: "Settlement model",
          value:
            "Native 0G escrow settlement plus ERC-8004 feedback on Base Sepolia.",
        },
      ],
    },
    {
      title: "REPRESENTATIVE LIVE TASK",
      rows: [
        {
          label: "Demo taskId",
          value: DEMO_TASK_ID,
          mono: true,
        },
        {
          label: "Demo releasePayment tx",
          value: DEMO_RELEASE_TX,
          href: galileoTx(DEMO_RELEASE_TX),
          mono: true,
        },
        {
          label: "Note",
          value:
            "Auction posting, token-owned bid acceptance, and releasePayment are live on Galileo. The representative task attaches tokenId 1 and payoutRecipient resolves to the current iNFT owner.",
        },
      ],
    },
  ];
}
