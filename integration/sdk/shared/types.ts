// Shared types for the Ledger integration SDK.
// Mirrors message schemas from agents/axl-runtime and contract state from contracts/.

export type Address = `0x${string}`;
export type Bytes32 = `0x${string}`;
export type Hex = `0x${string}`;

export type EscrowStatus =
  | "None"
  | "Posted"
  | "Accepted"
  | "Released"
  | "Slashed"
  | "Cancelled";

export interface EscrowTask {
  taskId: Bytes32;
  buyer: Address;
  worker: Address | null;
  payment: bigint;
  deadline: number; // unix seconds
  minReputation: number;
  bidAmount: bigint;
  bondAmount: bigint;
  resultHash: Bytes32 | null;
  status: EscrowStatus;
}

export interface TaskSpec {
  taskId: Bytes32;
  title: string;
  description?: string;
  outputSchema?: string;
  payment: bigint; // wei (or 0G base unit)
  bondRequirement: bigint;
  deadlineSeconds: number; // relative
  minReputation: number; // 0-5
}

export interface BidEnvelope {
  taskId: Bytes32;
  worker: Address;
  workerINFTId: string;
  workerPeerId: string;
  bidAmount: bigint;
  estimatedCompletionSeconds: number;
  reputation: { jobCount: number; avgRating: number };
  bidExpiresAt: number;
}

export interface ResultEnvelope {
  taskId: Bytes32;
  worker: Address;
  resultHash: Bytes32;
  resultPointer: string; // 0g:// CID
  attestationDigest: Hex;
}

export interface SettlementRecord {
  taskId: Bytes32;
  buyer: Address;
  worker: Address;
  payment: bigint;
  bidAmount: bigint;
  bondAmount: bigint;
  resultHash: Bytes32;
  releaseTxHash?: Hex;
  reputationFeedbackTxHash?: Hex;
  reputationReconcileState: "synced" | "pending_reconcile";
  settledAt: number;
}

export interface ReputationSummary {
  worker: Address;
  jobCount: number;
  avgRating: number;
}

// Event surface emitted by both agents — the future Next.js frontend subscribes here.
export type LedgerEvent =
  | { type: "TaskPosted"; task: TaskSpec; postedAt: number; buyer: Address }
  | { type: "BidReceived"; bid: BidEnvelope; receivedAt: number }
  | {
      type: "BidAccepted";
      taskId: Bytes32;
      worker: Address;
      bidAmount: bigint;
      acceptedAt: number;
    }
  | { type: "ResultSubmitted"; result: ResultEnvelope; submittedAt: number }
  | { type: "Settled"; record: SettlementRecord }
  | {
      type: "Slashed";
      taskId: Bytes32;
      buyer: Address;
      bondAmount: bigint;
      slashedAt: number;
    }
  | { type: "Cancelled"; taskId: Bytes32; cancelledAt: number }
  | { type: "AttestationRejected"; taskId: Bytes32; reason: string }
  | {
      type: "Log";
      level: "info" | "warn" | "error";
      correlationId: string;
      msg: string;
      data?: unknown;
    };

export type EventListener = (event: LedgerEvent) => void;
