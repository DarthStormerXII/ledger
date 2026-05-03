import type { Address, Hex } from "viem";
import {
  DEMO_ATTESTATION_DIGEST,
  DEMO_MEMORY_CID,
  DEMO_OWNER_A,
  DEMO_OWNER_B,
  DEMO_PAY_NONCE_0,
  DEMO_PAY_NONCE_1,
  DEMO_RELEASE_TX,
  DEMO_TASK_ID,
} from "./contracts";
import type {
  BidEnvelope,
  FeedbackRecord,
  JobHistoryEntry,
  JobSpec,
  OwnershipEntry,
  PaymentTickerEntry,
  Worker,
} from "./types";

const NOW = () => Math.floor(Date.now() / 1000);

/**
 * Realistic seed data, anchored to the live testnet contracts where possible.
 * This is replay data — the live state of the live token #1 (`worker-001.ledger.eth`)
 * is read from chain in the components that need it; surrounding catalogue
 * detail (jobs/ratings/employer addresses) is plausible-shaped seed.
 */

export const TEAM_ENS = "ledger.eth";

const employerAddrs: Address[] = [
  "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1",
  "0x9c2eA01c0eB3d65b8D63cE2A1234567890abcDEF",
  "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  "0xc02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  "0x5e3666e1d8c0a4f4f7d3a1f0e3e21f27e6c8e09f",
  "0x1f9090aaE28b8a3dCeaDf281B0F12828e676c326",
  "0x4a1A3a5EaD0a8aBd1f2BCd1e1F9E4B65Ec33a53b",
  "0x6c5B70bD4A0d2E0aeBB4dE99e7e6Aa8DDB3d0e21",
  "0x8b8ed4D3F1e6A12b0c14d5D6c9D7e0F1AaC23B45",
  "0x2C0F3c66e4eA7D8A2D6f4e9C4F38b9c43c19eC53",
];

const workerAliases = [
  "fox.worker",
  "owl.worker",
  "lynx.worker",
  "ibis.worker",
  "wren.worker",
  "stoat.worker",
  "raven.worker",
  "heron.worker",
  "hare.worker",
  "kite.worker",
];

const sampleTasks = [
  "Identify 3 highest-APY USDC vaults on Base with TVL > $10M",
  "Cross-reference Aave + Morpho positions against on-chain liquidations",
  "Audit ERC-4626 vault for inflation-attack vulnerability",
  "Snapshot governance proposal — produce executive summary",
  "Detect MEV-sandwich exposure on three swap routes",
  "Generate JSON report of top 25 stablecoin holders on Base",
  "Reconstruct missing ABI from verified contract bytecode",
  "Trace funds through Tornado mixer up to last 6 hops",
  "Score creditworthiness of a wallet against 30d behavior",
  "Translate Solidity contract to Cairo, preserving semantics",
];

/** Anchor — the live token id 1 worker. */
export const WORKER_001: Worker = {
  tokenId: 1,
  lot: 1,
  ensName: `worker-001.${TEAM_ENS}`,
  alias: "worker-001",
  owner: DEMO_OWNER_B,
  status: "active",
  jobsCompleted: 47,
  avgRating: 4.7,
  daysActive: 14,
  totalEarningsUsdc: 12847.5,
  lastSoldUsdc: 850.0,
  memCid: DEMO_MEMORY_CID,
  attestationDigest: DEMO_ATTESTATION_DIGEST as Hex,
  payRotation: [
    { address: DEMO_PAY_NONCE_1, nonce: 1 },
    { address: DEMO_PAY_NONCE_0, nonce: 0 },
  ],
  payMasterPubkey:
    "0x04a91f1b1f1d5c2c2f7c5f2b8c6c5f1c2f5d8c4a3b9c1d8e7f6a5b4c3d2e1f0a99",
  reputationHistory: rebuildRepHistory(47, 4.7),
};

function rebuildRepHistory(jobs: number, avg: number) {
  const out: { ts: number; rating: number; jobId: string }[] = [];
  const now = NOW();
  for (let i = 0; i < Math.min(jobs, 30); i++) {
    const wobble = (Math.sin(i * 1.7) + 1) / 2;
    const rating = Math.max(3, Math.min(5, avg - 0.4 + wobble * 0.8));
    out.push({
      ts: now - i * 60 * 60 * 18,
      rating: Math.round(rating * 10) / 10,
      jobId: `job-${(jobs - i).toString().padStart(3, "0")}`,
    });
  }
  return out.reverse();
}

export const WORKERS: Worker[] = [
  WORKER_001,
  ...workerAliases.slice(0, 9).map((alias, i) => {
    const tokenId = i + 2;
    const jobs = 32 + Math.round(Math.random() * 30);
    const avg = 3.9 + Math.round(Math.random() * 9) / 10;
    return {
      tokenId,
      lot: tokenId,
      ensName: `${alias}.${TEAM_ENS}`,
      alias,
      owner: employerAddrs[i % employerAddrs.length],
      status: "active" as const,
      jobsCompleted: jobs,
      avgRating: avg,
      daysActive: 6 + i,
      totalEarningsUsdc:
        Math.round((600 + i * 410 + Math.random() * 1300) * 100) / 100,
      lastSoldUsdc:
        Math.round((300 + i * 80 + Math.random() * 200) * 100) / 100,
      memCid: `0g://${randomHex(64)}`,
      attestationDigest: ("0x" + randomHex(64)) as Hex,
      payRotation: [
        { address: employerAddrs[(i + 1) % employerAddrs.length], nonce: 1 },
        { address: employerAddrs[(i + 2) % employerAddrs.length], nonce: 0 },
      ],
      payMasterPubkey: ("0x04" + randomHex(128)) as Hex,
      reputationHistory: rebuildRepHistory(jobs, avg),
    };
  }),
]
  .sort((a, b) => b.totalEarningsUsdc - a.totalEarningsUsdc)
  .map((w, idx) => ({ ...w, lot: idx + 1 }));

function randomHex(chars: number): string {
  let out = "";
  const lex = "0123456789abcdef";
  for (let i = 0; i < chars; i++) out += lex[Math.floor(Math.random() * 16)];
  return out;
}

/* === Live jobs catalogue === */

function buildBids(seedIdx: number, count: number): BidEnvelope[] {
  const bids: BidEnvelope[] = [];
  for (let i = 0; i < count; i++) {
    const w = WORKERS[(seedIdx + i) % WORKERS.length];
    bids.push({
      workerTokenId: w.tokenId,
      workerEns: w.ensName,
      workerAlias: w.alias,
      reputation: { jobCount: w.jobsCompleted, avgRating: w.avgRating },
      bidUsdc: Math.round((4.5 + i * 0.25 + Math.random() * 0.5) * 100) / 100,
      estimatedSeconds: 60 + i * 30,
      receivedAt: NOW() - i * 7,
    });
  }
  return bids;
}

export const JOBS: JobSpec[] = [
  {
    lot: 47,
    taskId: DEMO_TASK_ID as Hex,
    title: "Base Yield Scout",
    description:
      "Identify the 3 highest-APY USDC vaults on Base with TVL > $10M and audit history. Return JSON report with sources cited.",
    outputSchema: "JSON",
    employer: employerAddrs[0],
    payoutUsdc: 5.0,
    bondUsdc: 0.5,
    closesAtSec: NOW() + 107,
    status: "live",
    bids: buildBids(0, 3),
  },
  {
    lot: 46,
    taskId: ("0x" + randomHex(64)) as Hex,
    title: "Aave Liquidation Risk Index",
    description:
      "Cross-reference top-100 Aave borrower positions against current price feeds; produce a risk index ordered by health factor margin.",
    outputSchema: "CSV",
    employer: employerAddrs[1],
    payoutUsdc: 12.0,
    bondUsdc: 1.2,
    closesAtSec: NOW() + 412,
    status: "live",
    bids: buildBids(2, 5),
  },
  {
    lot: 45,
    taskId: ("0x" + randomHex(64)) as Hex,
    title: "Stable.fi Vault Audit",
    description:
      "Audit the latest ERC-4626 deployment under Stable.fi for the inflation-attack class; return findings in markdown.",
    outputSchema: "Markdown",
    employer: employerAddrs[2],
    payoutUsdc: 25.0,
    bondUsdc: 2.5,
    closesAtSec: NOW() + 1840,
    status: "live",
    bids: buildBids(4, 2),
  },
  {
    lot: 44,
    taskId: ("0x" + randomHex(64)) as Hex,
    title: "Snapshot Proposal Digest",
    description:
      "Read the latest 5 active snapshot proposals on Optimism; produce one-paragraph executive summaries with vote-pressure scoring.",
    outputSchema: "JSON",
    employer: employerAddrs[3],
    payoutUsdc: 3.5,
    bondUsdc: 0.35,
    closesAtSec: NOW() + 2740,
    status: "live",
    bids: buildBids(1, 4),
  },
  {
    lot: 43,
    taskId: ("0x" + randomHex(64)) as Hex,
    title: "Sandwich Exposure Report",
    description:
      "Analyze MEV-sandwich exposure on 3 supplied USDC swap routes over the last 24 hours; annotate with attacker addresses and amounts.",
    outputSchema: "JSON",
    employer: employerAddrs[4],
    payoutUsdc: 8.0,
    bondUsdc: 0.8,
    closesAtSec: NOW() + 3480,
    status: "live",
    bids: buildBids(3, 3),
  },
  {
    lot: 42,
    taskId: ("0x" + randomHex(64)) as Hex,
    title: "Holder Distribution Snapshot",
    description:
      "Produce a top-25 stablecoin-holder snapshot on Base, with first-seen block timestamps and contract-classification labels.",
    outputSchema: "JSON",
    employer: employerAddrs[5],
    payoutUsdc: 4.0,
    bondUsdc: 0.4,
    closesAtSec: NOW() + 5130,
    status: "live",
    bids: buildBids(5, 6),
  },
];

/* === Recent payments ticker (5 most recent) === */

export const PAYMENTS_TICKER: PaymentTickerEntry[] = WORKERS.slice(0, 6).map(
  (w, i) => ({
    amountUsdc: Math.round((1.5 + i * 0.6 + Math.random() * 1.2) * 100) / 100,
    toEns: w.ensName,
    atUnix: NOW() - 60 * (1 + i * 2 + Math.floor(Math.random() * 3)),
  }),
);

/* === Hero figure: USDC paid this week. Tied loosely to ticker totals. === */

export const TOTAL_PAID_THIS_WEEK_USDC = 12847.5;

/* === Network status (read live; this is fallback) === */

export const NETWORK_STATS = {
  activeWorkers: 247,
  jobsCompletedToday: 89,
  averageRating: 4.6,
};

/* === Worker job history seed === */

const DEMO_TASKS = sampleTasks;

export function buildJobHistory(worker: Worker): JobHistoryEntry[] {
  const out: JobHistoryEntry[] = [];
  let ts = NOW();
  for (let i = 0; i < Math.min(worker.jobsCompleted, 12); i++) {
    ts -= 60 * 60 * 22 + Math.floor(Math.random() * 60 * 60 * 6);
    const baseRating = worker.avgRating;
    const rating =
      Math.round((baseRating - 0.3 + Math.random() * 0.6) * 10) / 10;
    out.push({
      date: ts,
      employer: employerAddrs[i % employerAddrs.length],
      task: DEMO_TASKS[i % DEMO_TASKS.length],
      paymentUsdc: Math.round((4 + i * 0.4 + Math.random() * 8) * 100) / 100,
      rating: Math.max(3, Math.min(5, rating)),
    });
  }
  return out;
}

export function buildOwnershipHistory(worker: Worker): OwnershipEntry[] {
  return [
    {
      owner: worker.owner,
      daysHeld: worker.daysActive,
      salePriceUsdc: worker.lastSoldUsdc ?? 0,
      current: true,
    },
    {
      owner: DEMO_OWNER_A,
      daysHeld: 23,
      salePriceUsdc:
        worker.lastSoldUsdc != null
          ? Math.max(120, worker.lastSoldUsdc * 0.7)
          : 600,
      current: false,
    },
    {
      owner: "0x4a1A3a5EaD0a8aBd1f2BCd1e1F9E4B65Ec33a53b",
      daysHeld: 41,
      salePriceUsdc: 460,
      current: false,
    },
    {
      owner: "0x6c5B70bD4A0d2E0aeBB4dE99e7e6Aa8DDB3d0e21",
      daysHeld: 18,
      salePriceUsdc: 320,
      current: false,
    },
  ];
}

export function buildFeedback(worker: Worker): FeedbackRecord[] {
  const comments = [
    "delivered as spec'd",
    "clean JSON, sources cited",
    "found edge case we missed",
    "fast, accurate",
    "minor formatting nit, otherwise solid",
  ];
  return Array.from({ length: 5 }).map((_, i) => ({
    employer: employerAddrs[i % employerAddrs.length],
    rating: Math.max(
      3,
      Math.min(
        5,
        Math.round((worker.avgRating - 0.2 + Math.random() * 0.4) * 10) / 10,
      ),
    ),
    comment: comments[i % comments.length],
    txHash: ("0x" + randomHex(64)) as Hex,
    ts: NOW() - i * 3600 * 14,
  }));
}

/* === Settlement record (anchored to live release tx) === */

export const DEMO_SETTLEMENT_LEGS = {
  usdcPaidTx: DEMO_RELEASE_TX as Hex,
  reputationTx: ("0x" + randomHex(64)) as Hex,
  storageCid: DEMO_MEMORY_CID,
};
