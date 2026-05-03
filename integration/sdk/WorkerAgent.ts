import type {
  Address,
  Bytes32,
  EventListener,
  Hex,
  LedgerEvent,
  ResultEnvelope,
  TaskSpec,
} from "./shared/types.js";
import type { LedgerAdapters } from "./shared/adapters.js";
import { hashResult, nowSeconds } from "./shared/id.js";
import { StructuredLogger } from "./shared/logger.js";
import { sleep } from "./shared/retry.js";
import type {
  BidMessage,
  ResultMessage,
  TaskPostedMessage,
  LedgerAxlMessage,
} from "@ledger/axl-runtime";

export interface WorkerAgentConfig {
  workerAddress: Address;
  workerPeerId: string;
  workerINFTId: number;
  workerLabel: string; // e.g. "worker-001"
  adapters: LedgerAdapters;
  logger?: StructuredLogger;
  /** Initial native-token balance to fund this worker for bonding. */
  initialBalance?: bigint;
  /**
   * Buyer-side biddable predicate. Returns either a desired bid amount + estimated time,
   * or null to skip this task. Defaults to a fixed-margin bidder.
   */
  bidStrategy?: (
    task: TaskPostedMessage,
    ctx: { workerAddress: Address },
  ) => Promise<{
    bidAmount: bigint;
    estimatedCompletionSeconds: number;
  } | null>;
}

export class WorkerAgent {
  private readonly cfg: WorkerAgentConfig;
  private readonly logger: StructuredLogger;
  private readonly listeners = new Set<EventListener>();
  private readonly acceptedTasks = new Map<Bytes32, { bidAmount: bigint }>();
  private readonly buyerPeerByTask = new Map<Bytes32, string>();

  constructor(cfg: WorkerAgentConfig) {
    this.cfg = cfg;
    this.logger = cfg.logger ?? new StructuredLogger({ silent: true });
    if (cfg.initialBalance)
      cfg.adapters.escrow.fund(cfg.workerAddress, cfg.initialBalance);
    cfg.adapters.axl.subscribe("#ledger-jobs", cfg.workerPeerId, async (msg) =>
      this.onJobBroadcast(msg),
    );
    cfg.adapters.axl.registerPeer(cfg.workerPeerId, async (msg) =>
      this.onDirect(msg),
    );
  }

  on(listener: EventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  shutdown(): void {
    this.cfg.adapters.axl.unregisterPeer(this.cfg.workerPeerId);
  }

  /** Read this worker's reputation summary from the ERC-8004 mirror. */
  reputationSummary(): { jobCount: number; avgRating: number } {
    const s = this.cfg.adapters.reputation.summary(this.cfg.workerAddress);
    return { jobCount: s.jobCount, avgRating: s.avgRating };
  }

  /** Look up the live owner of this worker's iNFT via ENS resolver. */
  resolveOwnerViaEns(): Address {
    return this.cfg.adapters.ens.resolveWho(this.cfg.workerLabel);
  }

  /** Bond + run reasoning + upload memory + submit result for an accepted task. */
  async executeAcceptedTask(
    task: TaskSpec,
    opts: { buyerAddress: Address },
  ): Promise<ResultEnvelope> {
    const accepted = this.acceptedTasks.get(task.taskId);
    if (!accepted) {
      throw new Error(
        `worker ${this.cfg.workerAddress} did not win task ${task.taskId}`,
      );
    }

    // Pay bond on-chain with the actual accepted bid amount.
    this.cfg.adapters.escrow.acceptBid({
      sender: this.cfg.workerAddress,
      taskId: task.taskId,
      workerAddress: this.cfg.workerAddress,
      bidAmount: accepted.bidAmount,
      bondAmount: task.bondRequirement,
      valueSent: task.bondRequirement,
    });

    // Run sealed-inference reasoning.
    const { output, attestationDigest } =
      await this.cfg.adapters.compute.runReasoning(
        `${task.title}\n${task.description ?? ""}`,
      );

    // Encrypt + upload memory.
    const { cid } = await this.cfg.adapters.storage.uploadAgentMemory(
      `worker-${this.cfg.workerINFTId}`,
      Buffer.from(output),
    );

    const resultHash = hashResult(output);
    const result: ResultEnvelope = {
      taskId: task.taskId,
      worker: this.cfg.workerAddress,
      resultHash,
      resultPointer: cid,
      attestationDigest,
    };

    // Send RESULT direct to buyer.
    const buyerPeerId = this.buyerPeerByTask.get(task.taskId);
    if (buyerPeerId) {
      const message: ResultMessage = {
        type: "RESULT",
        version: "1.0",
        taskId: task.taskId,
        worker: this.cfg.workerAddress,
        resultHash,
        resultPointer: cid,
      };
      await this.cfg.adapters.axl.sendDirect(
        this.cfg.workerPeerId,
        buyerPeerId,
        message,
      );
    }

    this.emit({ type: "ResultSubmitted", result, submittedAt: nowSeconds() });
    void opts; // reserved for future signing; opts.buyerAddress would be used for ECDSA
    return result;
  }

  /** Override the no-op default to actually bid. */
  setBidStrategy(strategy: WorkerAgentConfig["bidStrategy"]): void {
    this.cfg.bidStrategy = strategy;
  }

  private async onJobBroadcast(msg: {
    fromPeerId: string;
    payload: LedgerAxlMessage;
  }): Promise<void> {
    if (msg.payload.type !== "TASK_POSTED") return;
    const taskMsg = msg.payload as TaskPostedMessage;
    const strategy = this.cfg.bidStrategy ?? defaultBidStrategy;
    const decision = await strategy(taskMsg, {
      workerAddress: this.cfg.workerAddress,
    });
    if (!decision) return;
    // small jitter so multiple workers don't deliver in lockstep
    await sleep(Math.floor(Math.random() * 25));
    this.buyerPeerByTask.set(msg.payload.taskId as Bytes32, msg.fromPeerId);
    const summary = this.reputationSummary();
    const bid: BidMessage = {
      type: "BID",
      version: "1.0",
      taskId: msg.payload.taskId,
      worker: this.cfg.workerAddress,
      workerINFTId: String(this.cfg.workerINFTId),
      bidAmount: decision.bidAmount.toString(),
      estimatedCompletionSeconds: decision.estimatedCompletionSeconds,
      reputationProof: {
        registry: "0x8004B663056A597Dffe9eCcC1965A193B7388713",
        chain: "eip155:84532",
        jobCount: summary.jobCount,
        avgRating: summary.avgRating,
      },
      bidExpiresAt: nowSeconds() + 60,
    };
    await this.cfg.adapters.axl.sendDirect(
      this.cfg.workerPeerId,
      msg.fromPeerId,
      bid,
    );
  }

  private onDirect(msg: {
    fromPeerId: string;
    payload: LedgerAxlMessage;
  }): void {
    if (msg.payload.type !== "BID_ACCEPTED") return;
    const accepted = msg.payload;
    if (
      accepted.selectedWorker.toLowerCase() ===
      this.cfg.workerAddress.toLowerCase()
    ) {
      this.acceptedTasks.set(accepted.taskId as Bytes32, {
        bidAmount: BigInt(accepted.acceptedBidAmount),
      });
      this.emit({
        type: "BidAccepted",
        taskId: accepted.taskId as Bytes32,
        worker: this.cfg.workerAddress,
        bidAmount: BigInt(accepted.acceptedBidAmount),
        acceptedAt: nowSeconds(),
      });
    }
  }

  private emit(event: LedgerEvent): void {
    for (const l of this.listeners) {
      try {
        l(event);
      } catch (err) {
        this.logger.warn("emit", "worker", "listener threw", {
          err: String(err),
        });
      }
    }
  }
}

const defaultBidStrategy: NonNullable<
  WorkerAgentConfig["bidStrategy"]
> = async (task) => {
  const offered = BigInt(task.payment?.amount ?? "0");
  if (offered === 0n) return null;
  // bid 95% of payment
  return { bidAmount: (offered * 95n) / 100n, estimatedCompletionSeconds: 30 };
};

export function fixedBidStrategy(
  amount: bigint,
  etaSec = 30,
): NonNullable<WorkerAgentConfig["bidStrategy"]> {
  return async () => ({
    bidAmount: amount,
    estimatedCompletionSeconds: etaSec,
  });
}

export function passthroughIfQualified(args: {
  askingBid: bigint;
  minRating?: number;
}): NonNullable<WorkerAgentConfig["bidStrategy"]> {
  return async (task) => {
    if (
      typeof task.minReputation === "number" &&
      args.minRating !== undefined
    ) {
      if (args.minRating < task.minReputation) return null;
    }
    return { bidAmount: args.askingBid, estimatedCompletionSeconds: 30 };
  };
}

export type Address_ = Address; // re-export marker for downstream typing
export type Hex_ = Hex;
