import type {
  BidMessage,
  TaskPostedMessage,
} from "../../axl-runtime/src/index.js";
import type {
  PreparedWorkerMemory,
  WorkerProfile,
} from "../../0g-integration/src/index.js";
import type { CapabilitySnapshot } from "../../../resolver/src/client.js";

export type Address = `0x${string}`;

export type AgentKitWorkerConfig = {
  tokenId: bigint;
  label: string;
  agentName: string;
  ensParent: string;
};

export type AgentKitTask = TaskPostedMessage;

export type AgentKitWorkerContext = {
  worker: AgentKitWorkerConfig;
  profile: WorkerProfile;
  capabilities: CapabilitySnapshot;
};

export type AgentKitBidDecision = {
  bid: BidMessage;
  reasoning: {
    model: string;
    output: string;
    attestationDigest?: string;
  };
  evidence: {
    owner: Address;
    memoryCID: string;
    ensName: string;
    capabilityOwner?: Address;
    capabilityMemoryCID?: string;
    payAddresses?: [string, string];
    payChanged?: boolean;
    identityMode?: "names-only" | "direct-ownerOf" | "gateway";
    identityVerified: boolean;
    reputation: {
      jobCount: number;
      avgRating: number;
      source: "ens-gateway" | "unverified";
    };
  };
};

export type AgentKitIntegrityPolicy = {
  requireCapabilityOwner?: boolean;
  requireCapabilityMemory?: boolean;
  requireReputationProof?: boolean;
};

export type AgentMemoryInput = {
  agentId: string;
  plaintext: Buffer;
  owner: Address;
};

export interface AgentMemoryAdapter {
  prepare(input: AgentMemoryInput): Promise<PreparedWorkerMemory>;
  assertRoundTrip(input: {
    agentId: string;
    plaintext: Buffer;
  }): Promise<{ cid: string; byteEqual: true }>;
}

export interface AgentInferenceAdapter {
  reason(prompt: string): Promise<{
    output: string;
    attestationDigest?: string;
    model: string;
  }>;
}

export interface AgentOwnershipAdapter {
  readWorker(tokenId: bigint): Promise<WorkerProfile>;
}

export interface AgentIdentityAdapter {
  snapshot(input: {
    workerLabel: string;
    tokenId: bigint;
    txId?: string;
  }): Promise<CapabilitySnapshot>;
}

export interface AgentTransportAdapter {
  submitBid(buyerPeerId: string, bid: BidMessage): Promise<void>;
  postTask?(task: TaskPostedMessage): Promise<void>;
}

export type AgentKitAdapters = {
  memory: AgentMemoryAdapter;
  inference: AgentInferenceAdapter;
  ownership: AgentOwnershipAdapter;
  identity: AgentIdentityAdapter;
  transport?: AgentTransportAdapter;
};
