import type { Address, Hex } from "viem";

export type WorkerStatus = "active" | "idle" | "transferring";

export interface Worker {
  /** iNFT token id on 0G Galileo. */
  tokenId: number;
  /** Lot number — catalogue index, formatted as `LOT 047`. */
  lot: number;
  /** ENS name (e.g. `worker-001.ledger.eth`). */
  ensName: string;
  /** Short alias used in the leaderboard ticker. */
  alias: string;
  /** Current owner — read live from `WorkerINFT.ownerOf(tokenId)`. */
  owner: Address;
  status: WorkerStatus;
  jobsCompleted: number;
  avgRating: number;
  daysActive: number;
  totalEarningsUsdc: number;
  /** Last realized sale price, if ever sold (for ownership rail). */
  lastSoldUsdc?: number;
  /** Memory pointer — 0G Storage CID. */
  memCid: string;
  /** Live TEE attestation digest from `verifyService` (0G Compute). */
  attestationDigest: Hex;
  /** Two recent rotated payment addresses (HD-derived). */
  payRotation: { address: Address; nonce: number }[];
  /** Master pubkey for the pay rotation. */
  payMasterPubkey: Hex;
  /** Reputation series — last 30 entries, ratings 0–5. */
  reputationHistory: { ts: number; rating: number; jobId: string }[];
}

export interface JobSpec {
  /** Lot number for the auction catalogue. */
  lot: number;
  /** bytes32 task id from LedgerEscrow. */
  taskId: Hex;
  title: string;
  description: string;
  /** Output schema hint (e.g. JSON, CSV, freeform). */
  outputSchema?: string;
  /** Buyer/employer address. */
  employer: Address;
  /** Payout in USDC, displayed value. */
  payoutUsdc: number;
  /** Worker bond in USDC. */
  bondUsdc: number;
  /** Unix seconds when bidding closes. */
  closesAtSec: number;
  /** Whether the auction's closed and a winner declared. */
  status: "live" | "settled" | "expired";
  /** Bid envelope. */
  bids: BidEnvelope[];
  /** Winning bid id, if settled. */
  winnerWorkerId?: number;
}

export interface BidEnvelope {
  workerTokenId: number;
  workerEns: string;
  workerAlias: string;
  reputation: { jobCount: number; avgRating: number };
  bidUsdc: number;
  estimatedSeconds: number;
  receivedAt: number;
}

export type PaymentTickerEntry = {
  amountUsdc: number;
  toEns: string;
  atUnix: number;
};

export type AxlMessageType =
  | "BID"
  | "CONFIRM"
  | "HEARTBEAT"
  | "GOSSIP"
  | "RESULT_SUBMITTED"
  | "TASK_POSTED";

export interface AxlLogEntry {
  ts: number; // unix ms
  from: AxlNodeId;
  to: AxlNodeId;
  type: AxlMessageType;
}

export type AxlNodeId = "us-west" | "eu-central" | "local";

export interface SettlementLegs {
  usdcPaidTx: Hex | null;
  reputationTx: Hex | null;
  storageCid: string | null;
}

export type SettlementState =
  | "settled"
  | "pending_reconcile"
  | "reconcile_failed";

export interface FeedbackRecord {
  employer: Address;
  rating: number;
  comment: string;
  txHash: Hex;
  ts: number;
}

export interface OwnershipEntry {
  owner: Address;
  daysHeld: number;
  salePriceUsdc: number;
  current: boolean;
}

export interface JobHistoryEntry {
  date: number;
  employer: Address;
  task: string;
  paymentUsdc: number;
  rating: number;
}
