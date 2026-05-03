import type { BidMessage } from "../../axl-runtime/src/index.js";
import type {
  AgentKitAdapters,
  AgentKitBidDecision,
  AgentKitIntegrityPolicy,
  AgentKitTask,
  AgentKitWorkerConfig,
  AgentKitWorkerContext,
  AgentMemoryInput,
} from "./types.js";

export type LedgerAgentRuntimeOptions = {
  worker: AgentKitWorkerConfig;
  adapters: AgentKitAdapters;
  clock?: () => number;
  integrity?: AgentKitIntegrityPolicy;
};

export class LedgerAgentRuntime {
  private readonly worker: AgentKitWorkerConfig;
  private readonly adapters: AgentKitAdapters;
  private readonly clock: () => number;
  private readonly integrity: AgentKitIntegrityPolicy;

  constructor(options: LedgerAgentRuntimeOptions) {
    this.worker = options.worker;
    this.adapters = options.adapters;
    this.clock = options.clock ?? (() => Date.now());
    this.integrity = options.integrity ?? {};
  }

  async loadContext(txId?: string): Promise<AgentKitWorkerContext> {
    const [profile, capabilities] = await Promise.all([
      this.adapters.ownership.readWorker(this.worker.tokenId),
      this.adapters.identity.snapshot({
        workerLabel: this.worker.label,
        tokenId: this.worker.tokenId,
        txId,
      }),
    ]);
    return { worker: this.worker, profile, capabilities };
  }

  prepareMemory(input: AgentMemoryInput) {
    return this.adapters.memory.prepare(input);
  }

  assertMemoryRoundTrip(input: { agentId: string; plaintext: Buffer }) {
    return this.adapters.memory.assertRoundTrip(input);
  }

  async createBidForTask(
    task: AgentKitTask,
    context?: AgentKitWorkerContext,
  ): Promise<AgentKitBidDecision> {
    const workerContext = context ?? (await this.loadContext(task.taskId));
    verifyContext(workerContext, this.integrity);
    const reputation = deriveReputation(workerContext.capabilities.repCount);
    if (task.minReputation && reputation.jobCount < task.minReputation) {
      throw new Error(
        `Worker reputation ${reputation.jobCount} is below required minimum ${task.minReputation}`,
      );
    }
    const bidAmount = priceTask(task, reputation.avgRating);
    const prompt = buildBidPrompt(task, workerContext, bidAmount);
    const reasoning = await this.adapters.inference.reason(prompt);
    const bid: BidMessage = {
      type: "BID",
      version: "1.0",
      taskId: task.taskId,
      worker: workerContext.capabilities.names.who,
      workerINFTId: workerContext.worker.tokenId.toString(),
      bidAmount,
      estimatedCompletionSeconds: estimateCompletion(task),
      reputationProof: {
        registry: "ERC-8004",
        chain: "base-sepolia",
        jobCount: reputation.jobCount,
        avgRating: reputation.avgRating,
      },
      bidExpiresAt: this.clock() + 120_000,
    };
    return {
      bid,
      reasoning,
      evidence: {
        owner: workerContext.profile.owner,
        memoryCID: workerContext.profile.memoryCID,
        ensName: workerContext.capabilities.names.who,
        capabilityOwner: workerContext.capabilities.whoOwner as
          | `0x${string}`
          | undefined,
        capabilityMemoryCID: workerContext.capabilities.memoryCid,
        payAddresses: workerContext.capabilities.payAddresses,
        payChanged: workerContext.capabilities.payAddresses
          ? workerContext.capabilities.payAddresses[0].toLowerCase() !==
            workerContext.capabilities.payAddresses[1].toLowerCase()
          : undefined,
        identityVerified: Boolean(
          workerContext.capabilities.whoOwner &&
            addressesEqual(
              workerContext.capabilities.whoOwner,
              workerContext.profile.owner,
            ),
        ),
        reputation,
      },
    };
  }

  async handleTaskPosted(input: {
    buyerPeerId: string;
    task: AgentKitTask;
    context?: AgentKitWorkerContext;
  }): Promise<AgentKitBidDecision> {
    if (!this.adapters.transport) {
      throw new Error("Agent transport adapter is required to submit bids");
    }
    const decision = await this.createBidForTask(input.task, input.context);
    await this.adapters.transport.submitBid(input.buyerPeerId, decision.bid);
    return decision;
  }
}

function priceTask(task: AgentKitTask, avgRating: number): string {
  const maxPayment = Number(task.payment?.amount ?? "1");
  const qualityDiscount =
    avgRating >= 4.75 ? 0.88 : avgRating >= 4.5 ? 0.92 : 0.98;
  const bid = Math.max(0.001, maxPayment * qualityDiscount);
  return bid.toFixed(4);
}

function estimateCompletion(task: AgentKitTask): number {
  const title = task.task.title.toLowerCase();
  if (title.includes("audit") || title.includes("research")) return 900;
  if (title.includes("summary")) return 300;
  return Math.min(1800, Math.max(180, task.task.deadlineSeconds / 4));
}

function deriveReputation(repCount?: string): {
  jobCount: number;
  avgRating: number;
  source: "ens-gateway" | "unverified";
} {
  const parsed = Number.parseInt(repCount ?? "", 10);
  if (!Number.isFinite(parsed)) {
    return { jobCount: 0, avgRating: 0, source: "unverified" };
  }
  return {
    jobCount: parsed,
    avgRating: parsed >= 40 ? 4.77 : 4.5,
    source: "ens-gateway",
  };
}

function verifyContext(
  context: AgentKitWorkerContext,
  policy: AgentKitIntegrityPolicy,
): void {
  const capabilityOwner = context.capabilities.whoOwner;
  if (policy.requireCapabilityOwner && !capabilityOwner) {
    throw new Error("ENS capability owner proof is required but missing");
  }
  if (
    capabilityOwner &&
    !addressesEqual(capabilityOwner, context.profile.owner)
  ) {
    throw new Error(
      `ENS owner ${capabilityOwner} does not match WorkerINFT owner ${context.profile.owner}`,
    );
  }

  const capabilityMemory = context.capabilities.memoryCid;
  if (policy.requireCapabilityMemory && !capabilityMemory) {
    throw new Error("ENS memory CID proof is required but missing");
  }
  if (capabilityMemory && capabilityMemory !== context.profile.memoryCID) {
    throw new Error(
      `ENS memory CID ${capabilityMemory} does not match WorkerINFT memory CID ${context.profile.memoryCID}`,
    );
  }

  if (policy.requireReputationProof && !context.capabilities.repCount) {
    throw new Error("ENS reputation proof is required but missing");
  }
}

function addressesEqual(left: string, right: string): boolean {
  return left.toLowerCase() === right.toLowerCase();
}

function buildBidPrompt(
  task: AgentKitTask,
  context: AgentKitWorkerContext,
  bidAmount: string,
): string {
  return [
    `Worker: ${context.worker.agentName}`,
    `ENS: ${context.capabilities.names.who}`,
    `Owner: ${context.profile.owner}`,
    `Memory: ${context.profile.memoryCID}`,
    `Task: ${task.task.title}`,
    `Description: ${task.task.description ?? "none"}`,
    `Bid amount: ${bidAmount} ${task.payment?.token ?? "0G"}`,
    "Return a concise bid rationale and risk note.",
  ].join("\n");
}
