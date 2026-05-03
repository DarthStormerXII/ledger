import type {
  Address,
  BidEnvelope,
  Bytes32,
  EventListener,
  Hex,
  LedgerEvent,
  ResultEnvelope,
  SettlementRecord,
  TaskSpec,
} from "./shared/types.js";
import type { LedgerAdapters } from "./shared/adapters.js";
import { newCorrelationId, nowSeconds, hashResult } from "./shared/id.js";
import { StructuredLogger } from "./shared/logger.js";
import { retry, sleep } from "./shared/retry.js";
import type {
  TaskPostedMessage,
  BidAcceptedMessage,
  LedgerAxlMessage,
} from "@ledger/axl-runtime";

export interface BuyerAgentConfig {
  buyerAddress: Address;
  buyerPeerId: string;
  adapters: LedgerAdapters;
  logger?: StructuredLogger;
  /** Initial native-token balance to fund this buyer in the mock escrow ledger. */
  initialBalance?: bigint;
}

export interface PostTaskInput {
  task: TaskSpec;
}

export interface AcceptBidInput {
  taskId: Bytes32;
  bid: BidEnvelope;
  workerPeerId: string;
}

export interface SettleInput {
  taskId: Bytes32;
  result: ResultEnvelope;
  starRating: number; // 1-5 for ERC-8004 feedback
  /** If true, mark reputation feedback as eventually-consistent (cross-chain lag). */
  eventualReputationConsistency?: boolean;
}

export class BuyerAgent {
  private readonly cfg: BuyerAgentConfig;
  private readonly logger: StructuredLogger;
  private readonly listeners = new Set<EventListener>();
  private readonly bidsByTask = new Map<Bytes32, BidEnvelope[]>();
  private readonly correlationByTask = new Map<Bytes32, string>();

  constructor(cfg: BuyerAgentConfig) {
    this.cfg = cfg;
    this.logger = cfg.logger ?? new StructuredLogger({ silent: true });
    if (cfg.initialBalance)
      cfg.adapters.escrow.fund(cfg.buyerAddress, cfg.initialBalance);
    cfg.adapters.axl.registerPeer(cfg.buyerPeerId, async (msg) =>
      this.onDirectMessage(msg),
    );
  }

  on(listener: EventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /** Accumulate bids received during the auction window. */
  bidsFor(taskId: Bytes32): BidEnvelope[] {
    return [...(this.bidsByTask.get(taskId) ?? [])];
  }

  /** Filter bids that meet the buyer's minimum reputation requirement. */
  qualifyingBids(task: TaskSpec): BidEnvelope[] {
    return this.bidsFor(task.taskId).filter(
      (b) => b.reputation.avgRating >= task.minReputation,
    );
  }

  /** Pick lowest-bid above-threshold worker, deterministic tie-break by peerId. */
  selectWinner(task: TaskSpec): BidEnvelope | null {
    const eligible = this.qualifyingBids(task);
    if (eligible.length === 0) return null;
    eligible.sort((a, b) => {
      if (a.bidAmount === b.bidAmount)
        return a.workerPeerId.localeCompare(b.workerPeerId);
      return a.bidAmount < b.bidAmount ? -1 : 1;
    });
    return eligible[0]!;
  }

  async postTask(
    input: PostTaskInput,
  ): Promise<{ txHash: Hex; correlationId: string }> {
    const correlationId = newCorrelationId();
    this.correlationByTask.set(input.task.taskId, correlationId);
    this.logger.info(correlationId, "buyer", "postTask", {
      taskId: input.task.taskId,
    });

    const txHash = await retry(() =>
      Promise.resolve(
        this.cfg.adapters.escrow.postTask({
          sender: this.cfg.buyerAddress,
          taskId: input.task.taskId,
          payment: input.task.payment,
          deadline: nowSeconds() + input.task.deadlineSeconds,
          minReputation: input.task.minReputation,
          valueSent: input.task.payment,
        }),
      ),
    );

    const message: TaskPostedMessage = {
      type: "TASK_POSTED",
      version: "1.0",
      taskId: input.task.taskId,
      buyer: this.cfg.buyerAddress,
      task: {
        title: input.task.title,
        description: input.task.description,
        outputSchema: input.task.outputSchema,
        deadlineSeconds: input.task.deadlineSeconds,
      },
      payment: {
        amount: input.task.payment.toString(),
        token: "0G",
        chain: `eip155:${this.cfg.adapters.galileoChainId}`,
      },
      bondRequirement: {
        amount: input.task.bondRequirement.toString(),
        token: "0G",
      },
      minReputation: input.task.minReputation,
      postedAt: nowSeconds(),
    };
    await this.cfg.adapters.axl.publish(
      "#ledger-jobs",
      this.cfg.buyerPeerId,
      message,
    );
    this.emit({
      type: "TaskPosted",
      task: input.task,
      postedAt: nowSeconds(),
      buyer: this.cfg.buyerAddress,
    });
    return { txHash, correlationId };
  }

  /** Block while collecting bids until window elapses or maxBids satisfied. */
  async collectBids(
    taskId: Bytes32,
    opts: { windowMs: number; maxBids?: number },
  ): Promise<BidEnvelope[]> {
    const start = Date.now();
    while (Date.now() - start < opts.windowMs) {
      const have = this.bidsFor(taskId);
      if (opts.maxBids && have.length >= opts.maxBids) break;
      await sleep(20);
    }
    return this.bidsFor(taskId);
  }

  async acceptBid(input: AcceptBidInput): Promise<void> {
    const correlationId =
      this.correlationByTask.get(input.taskId) ?? newCorrelationId();
    this.logger.info(correlationId, "buyer", "acceptBid", {
      taskId: input.taskId,
      worker: input.bid.worker,
    });
    const message: BidAcceptedMessage = {
      type: "BID_ACCEPTED",
      version: "1.0",
      taskId: input.taskId,
      selectedWorker: input.bid.worker,
      acceptedBidAmount: input.bid.bidAmount.toString(),
    };
    await this.cfg.adapters.axl.sendDirect(
      this.cfg.buyerPeerId,
      input.workerPeerId,
      message,
    );
    this.emit({
      type: "BidAccepted",
      taskId: input.taskId,
      worker: input.bid.worker,
      bidAmount: input.bid.bidAmount,
      acceptedAt: nowSeconds(),
    });
  }

  async settle(input: SettleInput): Promise<SettlementRecord> {
    const correlationId =
      this.correlationByTask.get(input.taskId) ?? newCorrelationId();
    const task = this.cfg.adapters.escrow.read(input.taskId);
    if (!task.worker) throw new Error("settle: task has no worker assigned");

    const verified = await this.cfg.adapters.compute.verifyAttestation(
      input.result.attestationDigest,
    );
    if (!verified) {
      this.logger.warn(correlationId, "buyer", "attestation rejected", {
        taskId: input.taskId,
      });
      this.emit({
        type: "AttestationRejected",
        taskId: input.taskId,
        reason: "verifyAttestation returned false",
      });
      // Force deadline expiry so slashBond is callable.
      this.cfg.adapters.escrow.expireAllDeadlines();
      const slashTx = this.cfg.adapters.escrow.slashBond({
        taskId: input.taskId,
      });
      this.emit({
        type: "Slashed",
        taskId: input.taskId,
        buyer: this.cfg.buyerAddress,
        bondAmount: task.bondAmount,
        slashedAt: nowSeconds(),
      });
      throw new AttestationRejectedError(slashTx);
    }

    const releaseTxHash = this.cfg.adapters.escrow.releasePayment({
      sender: this.cfg.buyerAddress,
      taskId: input.taskId,
      resultHash: input.result.resultHash,
    });

    const reputationFeedback = async () =>
      this.cfg.adapters.reputation.feedback({
        buyer: this.cfg.buyerAddress,
        worker: task.worker!,
        score: input.starRating,
        resultHash: input.result.resultHash,
        taskId: input.taskId,
      });

    let reputationFeedbackTxHash: Hex | undefined;
    let reputationReconcileState: SettlementRecord["reputationReconcileState"] =
      "synced";
    if (input.eventualReputationConsistency) {
      reputationReconcileState = "pending_reconcile";
      // Fire-and-resolve later; the scenario will await reconcile().
      void reputationFeedback().then((tx) => {
        reputationFeedbackTxHash = tx;
        reputationReconcileState = "synced";
      });
    } else {
      reputationFeedbackTxHash = await reputationFeedback();
    }

    const record: SettlementRecord = {
      taskId: input.taskId,
      buyer: this.cfg.buyerAddress,
      worker: task.worker!,
      payment: task.payment,
      bidAmount: task.bidAmount,
      bondAmount: task.bondAmount,
      resultHash: input.result.resultHash,
      releaseTxHash,
      reputationFeedbackTxHash,
      reputationReconcileState,
      settledAt: nowSeconds(),
    };

    // Use a getter so the consumer always sees the live reconcile state.
    Object.defineProperty(record, "reputationReconcileState", {
      get: () => reputationReconcileState,
      enumerable: true,
    });
    Object.defineProperty(record, "reputationFeedbackTxHash", {
      get: () => reputationFeedbackTxHash,
      enumerable: true,
    });

    this.emit({ type: "Settled", record });
    this.logger.info(correlationId, "buyer", "settled", {
      taskId: input.taskId,
    });
    return record;
  }

  async cancelTask(taskId: Bytes32): Promise<Hex> {
    const correlationId =
      this.correlationByTask.get(taskId) ?? newCorrelationId();
    this.logger.info(correlationId, "buyer", "cancelTask", { taskId });
    const tx = this.cfg.adapters.escrow.cancelTask({
      sender: this.cfg.buyerAddress,
      taskId,
    });
    this.emit({ type: "Cancelled", taskId, cancelledAt: nowSeconds() });
    return tx;
  }

  /** Slash a worker's bond after the deadline expires. */
  async slashBond(taskId: Bytes32): Promise<Hex> {
    const correlationId =
      this.correlationByTask.get(taskId) ?? newCorrelationId();
    this.logger.info(correlationId, "buyer", "slashBond", { taskId });
    const task = this.cfg.adapters.escrow.read(taskId);
    const tx = this.cfg.adapters.escrow.slashBond({ taskId });
    this.emit({
      type: "Slashed",
      taskId,
      buyer: this.cfg.buyerAddress,
      bondAmount: task.bondAmount,
      slashedAt: nowSeconds(),
    });
    return tx;
  }

  shutdown(): void {
    this.cfg.adapters.axl.unregisterPeer(this.cfg.buyerPeerId);
  }

  private onDirectMessage(msg: {
    fromPeerId: string;
    payload: LedgerAxlMessage;
  }): void {
    if (msg.payload.type === "BID") {
      const bid: BidEnvelope = {
        taskId: msg.payload.taskId as Bytes32,
        worker: msg.payload.worker as Address,
        workerINFTId: msg.payload.workerINFTId,
        workerPeerId: msg.fromPeerId,
        bidAmount: BigInt(msg.payload.bidAmount),
        estimatedCompletionSeconds: msg.payload.estimatedCompletionSeconds ?? 0,
        reputation: {
          jobCount: msg.payload.reputationProof?.jobCount ?? 0,
          avgRating: msg.payload.reputationProof?.avgRating ?? 0,
        },
        bidExpiresAt: msg.payload.bidExpiresAt ?? 0,
      };
      const list = this.bidsByTask.get(bid.taskId) ?? [];
      list.push(bid);
      this.bidsByTask.set(bid.taskId, list);
      this.emit({ type: "BidReceived", bid, receivedAt: nowSeconds() });
    } else if (msg.payload.type === "RESULT") {
      const result: ResultEnvelope = {
        taskId: msg.payload.taskId as Bytes32,
        worker: msg.payload.worker as Address,
        resultHash: msg.payload.resultHash as Bytes32,
        resultPointer: msg.payload.resultPointer,
        attestationDigest: hashResult(msg.payload.resultPointer),
      };
      this.emit({ type: "ResultSubmitted", result, submittedAt: nowSeconds() });
    }
  }

  private emit(event: LedgerEvent): void {
    for (const l of this.listeners) {
      try {
        l(event);
      } catch (err) {
        this.logger.warn("emit", "buyer", "listener threw", {
          err: String(err),
        });
      }
    }
  }
}

export class AttestationRejectedError extends Error {
  constructor(public readonly slashTxHash: Hex) {
    super("attestation rejected, bond slashed");
  }
}
