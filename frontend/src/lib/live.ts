/**
 * Live multi-chain data layer.
 *
 * Replaces the static data.ts mocks. Every function here issues real RPC reads
 * against Galileo (WorkerINFT + LedgerEscrow) and Base Sepolia (ERC-8004) and
 * shapes the result for the UI.
 *
 * No fallback to mocks — if the chain is unreachable, the UI shows empty state.
 * That's deliberate: we want the dashboard to be honest about what's on chain.
 */

import {
  type Address,
  type Hex,
  parseAbiItem,
  formatEther,
  formatUnits,
} from "viem";
import { galileoClient, baseSepoliaClient } from "./clients";
import {
  WORKER_INFT_ADDRESS,
  LEDGER_ESCROW_ADDRESS,
  ERC8004_REPUTATION_REGISTRY,
} from "./contracts";

// ─────────────────────────────────────────────────────────────────────────────
// Worker registry — the 5 minted iNFTs and their ERC-8004 agentIds.
// agentIds are populated after the seeder runs (see proofs/data/seeded-workers.json).
// ─────────────────────────────────────────────────────────────────────────────

export type WorkerRecord = {
  tokenId: bigint;
  label: string;
  agentName: string;
  ensName: string;
  erc8004AgentId: bigint;
  // 8 deterministic client wallets that signed feedback for this agent
  feedbackClients: Address[];
  // Optional manifest-driven listing for the marketplace. There's no on-chain
  // listing primitive yet, so the manifest is the single source of truth for
  // which iNFTs are for sale and at what price.
  listing?: {
    listed: boolean;
    askPrice?: string;
    askPriceUnit?: string;
    listedAt?: string;
  };
};

// Loaded at build time from proofs/data/seeded-workers.json (single source of truth)
import seedManifest from "./seeded-workers.json";

const FEEDBACK_CLIENTS: Address[] = (
  (seedManifest as { feedbackClients?: Address[] }).feedbackClients ?? []
).map((a) => a as Address);

const AVATAR_BY_TOKEN_ID: Record<string, string> = {
  "1": "/assets/avatars/ledger_lot_047.png",
  "2": "/assets/avatars/ledger_lot_048.png",
  "3": "/assets/avatars/ledger_lot_049.png",
  "4": "/assets/avatars/ledger_lot_050.png",
  "5": "/assets/avatars/ledger_lot_050.png",
};

function avatarForTokenId(tokenId: bigint): string {
  return (
    AVATAR_BY_TOKEN_ID[tokenId.toString()] ??
    "/assets/empty-states/ledger_empty_state_paper.png"
  );
}

export const WORKERS: WorkerRecord[] = (
  (seedManifest as { workers?: Array<Record<string, unknown>> }).workers ?? []
).map((w) => ({
  tokenId: BigInt(w.tokenId as number),
  label: w.label as string,
  agentName: w.agentName as string,
  ensName: `${w.label}.ledger.eth`,
  erc8004AgentId: BigInt((w.erc8004AgentId as string) ?? 0),
  feedbackClients: FEEDBACK_CLIENTS,
  listing: w.listing as WorkerRecord["listing"],
}));

// ─────────────────────────────────────────────────────────────────────────────
// ABIs — minimal slices for the calls we make
// ─────────────────────────────────────────────────────────────────────────────

const WORKER_INFT_ABI = [
  parseAbiItem("function ownerOf(uint256 tokenId) view returns (address)"),
  parseAbiItem(
    "function getMetadata(uint256 tokenId) view returns ((string agentName, bytes sealedKey, string memoryCID, string initialReputationRef, uint64 updatedAt))",
  ),
  parseAbiItem("function nextTokenId() view returns (uint256)"),
  parseAbiItem(
    "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
  ),
] as const;

const ESCROW_ABI = [
  parseAbiItem(
    "function tasks(bytes32 taskId) view returns (address buyer, address worker, uint256 payment, uint256 deadline, uint256 minReputation, uint256 bidAmount, uint256 bondAmount, bytes32 resultHash, uint8 status)",
  ),
  parseAbiItem(
    "event TaskPosted(bytes32 indexed taskId, address indexed buyer, uint256 payment, uint256 deadline, uint256 minReputation)",
  ),
  parseAbiItem(
    "event BidAccepted(bytes32 indexed taskId, address indexed worker, uint256 bidAmount, uint256 bondAmount)",
  ),
  parseAbiItem(
    "event PaymentReleased(bytes32 indexed taskId, address indexed worker, bytes32 resultHash)",
  ),
] as const;

const ERC8004_ABI = [
  parseAbiItem(
    "function getSummary(uint256 agentId, address[] clientAddresses, string tag1, string tag2) view returns (uint64 count, int128 sumValue, uint8 valueDecimals)",
  ),
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Hall stats — live counts from on-chain
// ─────────────────────────────────────────────────────────────────────────────

export type HallStats = {
  activeLots: number; // total minted iNFTs
  realizedTotal: bigint; // sum of payments in PaymentReleased events (wei)
  bidsToday: number; // BidAccepted events in last 24h
  hammerRecord: bigint; // max payment in any PaymentReleased event
  hammerLot?: string; // worker label that earned the hammer record
};

export async function getHallStats(): Promise<HallStats> {
  // 1. nextTokenId - 1 = total minted (since tokenIds start at 1)
  const next = (await galileoClient.readContract({
    address: WORKER_INFT_ADDRESS,
    abi: WORKER_INFT_ABI,
    functionName: "nextTokenId",
  })) as bigint;
  const activeLots = Number(next) - 1;

  // 2. Scan PaymentReleased events for realized + hammer
  const releasedLogs = await galileoClient.getLogs({
    address: LEDGER_ESCROW_ADDRESS,
    event: ESCROW_ABI[3],
    fromBlock: 0n,
  });

  let realizedTotal = 0n;
  let hammerRecord = 0n;
  let hammerWorker: Address | undefined;
  for (const log of releasedLogs) {
    // Need the matching task to get payment amount
    if (!log.args?.taskId) continue;
    const t = (await galileoClient.readContract({
      address: LEDGER_ESCROW_ADDRESS,
      abi: ESCROW_ABI,
      functionName: "tasks",
      args: [log.args.taskId as Hex],
    })) as readonly [
      Address,
      Address,
      bigint,
      bigint,
      bigint,
      bigint,
      bigint,
      Hex,
      number,
    ];
    const payment = t[5]; // bidAmount (released amount)
    realizedTotal += payment;
    if (payment > hammerRecord) {
      hammerRecord = payment;
      hammerWorker = t[1]; // worker address
    }
  }

  // 3. BidAccepted in last 24h
  const latestBlock = await galileoClient.getBlockNumber();
  // Galileo block time ~2s, 24h ≈ 43200 blocks
  const fromBlock = latestBlock > 43200n ? latestBlock - 43200n : 0n;
  const bidLogs = await galileoClient.getLogs({
    address: LEDGER_ESCROW_ADDRESS,
    event: ESCROW_ABI[2],
    fromBlock,
  });
  const bidsToday = bidLogs.length;

  // Map hammer worker address → worker label
  const hammerLot = hammerWorker
    ? WORKERS.find(
        (w) =>
          w.feedbackClients.includes(hammerWorker as Address) ||
          // owner-derived match
          false,
      )?.label
    : undefined;

  return { activeLots, realizedTotal, bidsToday, hammerRecord, hammerLot };
}

// ─────────────────────────────────────────────────────────────────────────────
// Live worker list — the catalogue, marketplace, workers grid all read this
// ─────────────────────────────────────────────────────────────────────────────

export type LiveLot = {
  lot: string; // "001", "002", …
  tokenId: bigint;
  label: string;
  agentName: string;
  ensName: string;
  owner: Address;
  ownerShort: string;
  memoryCID: string;
  // ERC-8004 reputation (live)
  jobs: number;
  rating: number; // 0-5
  ratingRaw: bigint; // sum value
  agentId: bigint;
  // Earnings: sum of bidAmount in PaymentReleased events where worker == owner
  earnedNum: number;
  earned: string; // formatted "12.50"
  // For UI dressing
  avatar: string;
};

// Maps LiveLot → the legacy Lot interface that existing components consume.
// Lets us swap data.ts for live.ts without rewriting LotPlate / wallet card UI.
import type { Lot } from "./data";

export function liveLotToLot(l: LiveLot): Lot {
  // Marketplace listings are manifest-driven for the demo (no on-chain
  // listing primitive yet). The manifest at proofs/data/seeded-workers.json
  // holds `listing.listed` + `listing.askPrice` for each worker that's up
  // for sale.
  const record = WORKERS.find((w) => w.tokenId === l.tokenId);
  const listed = record?.listing?.listed === true;
  // LotPlate renders "{lot.askPrice} 0G" — pass the bare numeric string,
  // not "1.2 0G", or the card would render "1.2 0G 0G".
  const askPrice = record?.listing?.askPrice;
  return {
    lot: l.lot,
    ens: l.ensName,
    owner: l.owner,
    ownerShort: l.ownerShort,
    jobs: l.jobs,
    rating: l.rating,
    earned: l.earned,
    earnedNum: l.earnedNum,
    listed,
    askPrice,
    avatar: l.avatar,
    mintedAt: "—",
    daysActive: 0,
    emblem: "ledger",
  };
}

export async function getAllLots(): Promise<LiveLot[]> {
  const next = (await galileoClient.readContract({
    address: WORKER_INFT_ADDRESS,
    abi: WORKER_INFT_ABI,
    functionName: "nextTokenId",
  })) as bigint;

  // Aggregate worker → earned total from PaymentReleased + tasks lookups
  const earnedByWorker = new Map<string, bigint>();
  try {
    const releases = await galileoClient.getLogs({
      address: LEDGER_ESCROW_ADDRESS,
      event: ESCROW_ABI[3],
      fromBlock: 0n,
    });
    for (const r of releases) {
      if (!r.args?.taskId || !r.args?.worker) continue;
      const t = (await galileoClient.readContract({
        address: LEDGER_ESCROW_ADDRESS,
        abi: ESCROW_ABI,
        functionName: "tasks",
        args: [r.args.taskId as Hex],
      })) as readonly [
        Address,
        Address,
        bigint,
        bigint,
        bigint,
        bigint,
        bigint,
        Hex,
        number,
      ];
      const worker = (r.args.worker as Address).toLowerCase();
      earnedByWorker.set(worker, (earnedByWorker.get(worker) ?? 0n) + t[5]);
    }
  } catch {
    // earnings best-effort
  }

  const tokenIds = [];
  for (let i = 1n; i < next; i++) tokenIds.push(i);

  const lots: LiveLot[] = [];
  for (const tokenId of tokenIds) {
    try {
      const [owner, metadata] = await Promise.all([
        galileoClient.readContract({
          address: WORKER_INFT_ADDRESS,
          abi: WORKER_INFT_ABI,
          functionName: "ownerOf",
          args: [tokenId],
        }) as Promise<Address>,
        galileoClient.readContract({
          address: WORKER_INFT_ADDRESS,
          abi: WORKER_INFT_ABI,
          functionName: "getMetadata",
          args: [tokenId],
        }) as Promise<{
          agentName: string;
          memoryCID: string;
          initialReputationRef: string;
        }>,
      ]);

      const record = WORKERS.find((w) => w.tokenId === tokenId);
      const label =
        record?.label ?? `worker-${String(Number(tokenId)).padStart(3, "0")}`;

      // Pull live ERC-8004 reputation
      let jobs = 0;
      let rating = 0;
      let ratingRaw = 0n;
      const agentId = record?.erc8004AgentId ?? 0n;
      if (agentId > 0n && record?.feedbackClients.length) {
        try {
          const summary = (await baseSepoliaClient.readContract({
            address: ERC8004_REPUTATION_REGISTRY,
            abi: ERC8004_ABI,
            functionName: "getSummary",
            args: [agentId, record.feedbackClients, "", ""],
          })) as readonly [bigint, bigint, number];
          jobs = Number(summary[0]);
          ratingRaw = summary[1];
          const decimals = summary[2];
          if (jobs > 0) {
            // ERC-8004's `sumValue` field returns the running AVERAGE
            // already scaled by 10^valueDecimals, despite the misleading
            // name. Confirmed empirically: 47 records targeting 4.77 avg
            // returns sumValue=4770212765957446808 (= 4.77e18), not
            // 47*4.77e18. So we format directly without dividing by count.
            rating =
              Math.round(Number(formatUnits(ratingRaw, decimals)) * 100) / 100;
          }
        } catch {
          // leave 0 — UI will show "no reputation yet"
        }
      }

      const earnedWei = earnedByWorker.get(owner.toLowerCase()) ?? 0n;
      const earnedNum = Number(formatEther(earnedWei));

      lots.push({
        lot: String(Number(tokenId)).padStart(3, "0"),
        tokenId,
        label,
        agentName: metadata.agentName,
        ensName: `${label}.ledger.eth`,
        owner,
        ownerShort: `${owner.slice(0, 6)}…${owner.slice(-4)}`,
        memoryCID: metadata.memoryCID,
        jobs,
        rating,
        ratingRaw,
        agentId,
        earnedNum,
        earned: earnedNum.toFixed(4),
        avatar: avatarForTokenId(tokenId),
      });
    } catch {
      // skip token if any read fails
    }
  }
  return lots;
}

// ─────────────────────────────────────────────────────────────────────────────
// Live job/task list
// ─────────────────────────────────────────────────────────────────────────────

export type TaskStatus =
  | "Posted"
  | "Accepted"
  | "Released"
  | "Cancelled"
  | "Slashed";

const STATUS_LABEL: Record<number, TaskStatus> = {
  0: "Posted",
  1: "Posted",
  2: "Accepted",
  3: "Released",
  4: "Cancelled",
  5: "Slashed",
};

export type LiveJob = {
  taskId: Hex;
  buyer: Address;
  worker: Address | null;
  payment: bigint;
  deadline: bigint;
  minReputation: bigint;
  bidAmount: bigint;
  resultHash: Hex;
  status: TaskStatus;
  postedTx: Hex;
  postedBlock: bigint;
  releaseTx?: Hex;
  releaseBlock?: bigint;
};

// Maps a LiveJob → the legacy Job shape consumed by JobsListClient.
import type { Job } from "./data";

export function liveJobToJob(j: LiveJob): Job {
  const now = Math.floor(Date.now() / 1000);
  const timeLeft = Math.max(0, Number(j.deadline) - now);
  // No invented titles or descriptions. Every posted task MUST have a title,
  // description, and category pinned to the brief (0G Storage). We leave
  // `title` and `desc` empty here; the rendering layer is responsible for
  // showing a "(no title pinned)" placeholder when the brief lookup fails.
  // Status (Posted / Accepted / etc.) is shown separately as a status pill,
  // which is fact, not a stand-in title.
  return {
    id: j.taskId,
    title: "",
    desc: "",
    employer: `${j.buyer.slice(0, 6)}…${j.buyer.slice(-4)}`,
    payout: `${formatEther(j.payment)} 0G`,
    bond: j.bidAmount > 0n ? `${formatEther(j.bidAmount)} 0G bid` : "—",
    timeLeft,
    bids: j.worker ? 1 : 0,
    status: j.status,
  };
}

export async function getAllJobs(): Promise<LiveJob[]> {
  const [postedLogs, releaseLogs] = await Promise.all([
    galileoClient.getLogs({
      address: LEDGER_ESCROW_ADDRESS,
      event: ESCROW_ABI[1],
      fromBlock: 0n,
    }),
    galileoClient.getLogs({
      address: LEDGER_ESCROW_ADDRESS,
      event: ESCROW_ABI[3],
      fromBlock: 0n,
    }),
  ]);
  const releaseByTask = new Map<Hex, { txHash: Hex; blockNumber: bigint }>();
  for (const release of releaseLogs) {
    if (!release.args?.taskId || !release.transactionHash) continue;
    releaseByTask.set(release.args.taskId as Hex, {
      txHash: release.transactionHash,
      blockNumber: release.blockNumber ?? 0n,
    });
  }

  const jobs: LiveJob[] = [];
  for (const log of postedLogs) {
    if (!log.args?.taskId) continue;
    try {
      const t = (await galileoClient.readContract({
        address: LEDGER_ESCROW_ADDRESS,
        abi: ESCROW_ABI,
        functionName: "tasks",
        args: [log.args.taskId as Hex],
      })) as readonly [
        Address,
        Address,
        bigint,
        bigint,
        bigint,
        bigint,
        bigint,
        Hex,
        number,
      ];
      const release = releaseByTask.get(log.args.taskId as Hex);
      jobs.push({
        taskId: log.args.taskId as Hex,
        buyer: t[0],
        worker:
          t[1] === "0x0000000000000000000000000000000000000000" ? null : t[1],
        payment: t[2],
        deadline: t[3],
        minReputation: t[4],
        bidAmount: t[5],
        resultHash: t[7],
        status: STATUS_LABEL[t[8]] ?? "Posted",
        postedTx: log.transactionHash ?? "0x0",
        postedBlock: log.blockNumber ?? 0n,
        releaseTx: release?.txHash,
        releaseBlock: release?.blockNumber,
      });
    } catch {
      // skip
    }
  }
  // Most recent first
  return jobs.sort((a, b) => Number(b.postedBlock - a.postedBlock));
}

// ─────────────────────────────────────────────────────────────────────────────
// Live event ticker — recent activity across all contracts
// ─────────────────────────────────────────────────────────────────────────────

export type LiveEvent = {
  kind: "minted" | "transferred" | "task-posted" | "bid-accepted" | "released";
  text: string;
  txHash: Hex;
  blockNumber: bigint;
};

export async function getRecentEvents(limit = 12): Promise<LiveEvent[]> {
  const latestBlock = await galileoClient.getBlockNumber();
  const fromBlock = latestBlock > 200_000n ? latestBlock - 200_000n : 0n;

  const [transfers, posts, bids, releases] = await Promise.all([
    galileoClient.getLogs({
      address: WORKER_INFT_ADDRESS,
      event: WORKER_INFT_ABI[3],
      fromBlock,
    }),
    galileoClient.getLogs({
      address: LEDGER_ESCROW_ADDRESS,
      event: ESCROW_ABI[1],
      fromBlock,
    }),
    galileoClient.getLogs({
      address: LEDGER_ESCROW_ADDRESS,
      event: ESCROW_ABI[2],
      fromBlock,
    }),
    galileoClient.getLogs({
      address: LEDGER_ESCROW_ADDRESS,
      event: ESCROW_ABI[3],
      fromBlock,
    }),
  ]);

  const events: LiveEvent[] = [];
  for (const e of transfers) {
    const isMint = e.args.from === "0x0000000000000000000000000000000000000000";
    const tokenId = e.args.tokenId ?? 0n;
    const lot = String(Number(tokenId)).padStart(3, "0");
    events.push({
      kind: isMint ? "minted" : "transferred",
      text: isMint
        ? `Lot ${lot} — minted. Catalogue +1.`
        : `Lot ${lot} — transferred to ${e.args.to?.slice(0, 6)}…${e.args.to?.slice(-4)}.`,
      txHash: e.transactionHash ?? "0x0",
      blockNumber: e.blockNumber ?? 0n,
    });
  }
  for (const e of posts) {
    const tid = (e.args.taskId as Hex)?.slice(0, 10) ?? "?";
    const pay = e.args.payment ? formatEther(e.args.payment) : "?";
    events.push({
      kind: "task-posted",
      text: `Task ${tid} — posted for ${pay} OG.`,
      txHash: e.transactionHash ?? "0x0",
      blockNumber: e.blockNumber ?? 0n,
    });
  }
  for (const e of bids) {
    const tid = (e.args.taskId as Hex)?.slice(0, 10) ?? "?";
    const bid = e.args.bidAmount ? formatEther(e.args.bidAmount) : "?";
    events.push({
      kind: "bid-accepted",
      text: `Task ${tid} — bid ${bid} OG won.`,
      txHash: e.transactionHash ?? "0x0",
      blockNumber: e.blockNumber ?? 0n,
    });
  }
  for (const e of releases) {
    const tid = (e.args.taskId as Hex)?.slice(0, 10) ?? "?";
    events.push({
      kind: "released",
      text: `Task ${tid} — payment released. Reputation +1.`,
      txHash: e.transactionHash ?? "0x0",
      blockNumber: e.blockNumber ?? 0n,
    });
  }

  return events
    .sort((a, b) => Number(b.blockNumber - a.blockNumber))
    .slice(0, limit);
}
