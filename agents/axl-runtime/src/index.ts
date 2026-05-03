import {
  AxlClient,
  type AxlTopology,
  type ReceivedAxlMessage,
} from "@ledger/axl-client";
import { GossipSubChannel, type GossipSubHandler } from "@ledger/axl-gossipsub";

export const LEDGER_JOBS_TOPIC = "#ledger-jobs";
export const LEDGER_AUCTION_CLOSED_TOPIC = "#ledger-auction-closed";

export type LedgerAxlMessageType =
  | "TASK_POSTED"
  | "BID"
  | "BID_ACCEPTED"
  | "RESULT"
  | "AUCTION_CLOSED";

export type TaskPostedMessage = {
  type: "TASK_POSTED";
  version: "1.0";
  taskId: string;
  buyer: string;
  buyerSignature?: string;
  task: {
    title: string;
    description?: string;
    outputSchema?: string;
    deadlineSeconds: number;
  };
  payment?: {
    amount: string;
    token: string;
    chain: string;
  };
  bondRequirement?: {
    amount: string;
    token: string;
  };
  minReputation?: number;
  postedAt: number;
};

export type BidMessage = {
  type: "BID";
  version: "1.0";
  taskId: string;
  worker: string;
  workerINFTId: string;
  bidAmount: string;
  estimatedCompletionSeconds?: number;
  reputationProof?: {
    registry: string;
    chain: string;
    jobCount: number;
    avgRating: number;
  };
  workerSignature?: string;
  bidExpiresAt?: number;
};

export type BidAcceptedMessage = {
  type: "BID_ACCEPTED";
  version: "1.0";
  taskId: string;
  selectedWorker: string;
  acceptedBidAmount: string;
  buyerSignature?: string;
  escrowTxHash?: string;
};

export type ResultMessage = {
  type: "RESULT";
  version: "1.0";
  taskId: string;
  worker: string;
  resultHash: string;
  resultPointer: string;
  workerSignature?: string;
};

export type AuctionClosedMessage = {
  type: "AUCTION_CLOSED";
  version: "1.0";
  taskId: string;
  buyer: string;
  selectedWorker: string;
  buyerSignature?: string;
  closedAt: number;
};

export type LedgerAxlMessage =
  | TaskPostedMessage
  | BidMessage
  | BidAcceptedMessage
  | ResultMessage
  | AuctionClosedMessage;

export type DirectMessageHandler = (message: {
  fromPeerId: string;
  payload: LedgerAxlMessage;
}) => void | Promise<void>;

type AxlClientLike = {
  getTopology(): Promise<AxlTopology>;
  send(destinationPeerId: string, payload: Buffer): Promise<void>;
  receive(): Promise<ReceivedAxlMessage | null>;
};

type ChannelLike = {
  start(): Promise<void>;
  stop(): void;
  subscribe(handler: GossipSubHandler): void;
  publish(payload: Buffer): Promise<void>;
};

export type LedgerAxlRuntimeOptions = {
  client?: AxlClientLike;
  baseUrl?: string;
  channelFactory?: (topic: string, client: AxlClientLike) => ChannelLike;
};

export class LedgerAxlRuntime {
  private readonly client: AxlClientLike;
  private readonly channelFactory: (
    topic: string,
    client: AxlClientLike,
  ) => ChannelLike;
  private readonly channels = new Map<string, ChannelLike>();
  private directPolling = false;

  constructor(options: LedgerAxlRuntimeOptions = {}) {
    this.client = options.client ?? new AxlClient(options.baseUrl);
    this.channelFactory =
      options.channelFactory ??
      ((topic, client) =>
        new GossipSubChannel(topic, client as AxlClient, { heartbeatMs: 250 }));
  }

  getTopology(): Promise<AxlTopology> {
    return this.client.getTopology();
  }

  async startPubSub(handlers: {
    onTaskPosted?: (message: TaskPostedMessage) => void | Promise<void>;
    onAuctionClosed?: (message: AuctionClosedMessage) => void | Promise<void>;
  }): Promise<void> {
    if (handlers.onTaskPosted) {
      const channel = this.getChannel(LEDGER_JOBS_TOPIC);
      channel.subscribe(async (message) => {
        const decoded = decodeLedgerMessage(message.payload);
        if (decoded.type === "TASK_POSTED")
          await handlers.onTaskPosted?.(decoded);
      });
      await channel.start();
    }

    if (handlers.onAuctionClosed) {
      const channel = this.getChannel(LEDGER_AUCTION_CLOSED_TOPIC);
      channel.subscribe(async (message) => {
        const decoded = decodeLedgerMessage(message.payload);
        if (decoded.type === "AUCTION_CLOSED")
          await handlers.onAuctionClosed?.(decoded);
      });
      await channel.start();
    }
  }

  stopPubSub(): void {
    for (const channel of this.channels.values()) channel.stop();
    this.channels.clear();
  }

  async postTask(message: TaskPostedMessage): Promise<void> {
    assertLedgerMessage(message, "TASK_POSTED");
    await this.getChannel(LEDGER_JOBS_TOPIC).publish(
      encodeLedgerMessage(message),
    );
  }

  async submitBid(buyerPeerId: string, message: BidMessage): Promise<void> {
    assertLedgerMessage(message, "BID");
    await this.sendDirect(buyerPeerId, message);
  }

  async acceptBid(
    workerPeerId: string,
    message: BidAcceptedMessage,
  ): Promise<void> {
    assertLedgerMessage(message, "BID_ACCEPTED");
    await this.sendDirect(workerPeerId, message);
  }

  async closeAuction(message: AuctionClosedMessage): Promise<void> {
    assertLedgerMessage(message, "AUCTION_CLOSED");
    await this.getChannel(LEDGER_AUCTION_CLOSED_TOPIC).publish(
      encodeLedgerMessage(message),
    );
  }

  async submitResult(
    buyerPeerId: string,
    message: ResultMessage,
  ): Promise<void> {
    assertLedgerMessage(message, "RESULT");
    await this.sendDirect(buyerPeerId, message);
  }

  async sendDirect(peerId: string, message: LedgerAxlMessage): Promise<void> {
    assertLedgerMessage(message);
    await this.client.send(peerId, encodeLedgerMessage(message));
  }

  async receiveDirect(): Promise<{
    fromPeerId: string;
    payload: LedgerAxlMessage;
  } | null> {
    const received = await this.client.receive();
    if (!received) return null;
    return {
      fromPeerId: received.fromPeerId,
      payload: decodeLedgerMessage(received.payload),
    };
  }

  startDirectPolling(
    handler: DirectMessageHandler,
    intervalMs = 100,
  ): () => void {
    this.directPolling = true;
    const poll = async () => {
      while (this.directPolling) {
        const message = await this.receiveDirect();
        if (message) await handler(message);
        else await sleep(intervalMs);
      }
    };
    poll().catch(() => undefined);
    return () => {
      this.directPolling = false;
    };
  }

  async waitForDirect(
    type: LedgerAxlMessageType,
    taskId: string,
    timeoutMs = 10_000,
  ): Promise<{
    fromPeerId: string;
    payload: LedgerAxlMessage;
  }> {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const message = await this.receiveDirect();
      if (message?.payload.type === type && message.payload.taskId === taskId)
        return message;
      await sleep(100);
    }
    throw new Error(`Timed out waiting for ${type} on task ${taskId}`);
  }

  private getChannel(topic: string): ChannelLike {
    const existing = this.channels.get(topic);
    if (existing) return existing;
    const channel = this.channelFactory(topic, this.client);
    this.channels.set(topic, channel);
    return channel;
  }
}

export function encodeLedgerMessage(message: LedgerAxlMessage): Buffer {
  assertLedgerMessage(message);
  return Buffer.from(JSON.stringify(message));
}

export function decodeLedgerMessage(payload: Buffer): LedgerAxlMessage {
  const parsed = JSON.parse(payload.toString("utf8")) as LedgerAxlMessage;
  assertLedgerMessage(parsed);
  return parsed;
}

export function assertLedgerMessage(
  message: LedgerAxlMessage,
  expectedType?: LedgerAxlMessageType,
): void {
  if (!message || typeof message !== "object")
    throw new Error("Ledger AXL message must be an object");
  if (expectedType && message.type !== expectedType)
    throw new Error(`Expected ${expectedType}, got ${message.type}`);
  if (!isLedgerAxlMessageType(message.type))
    throw new Error(
      `Unsupported Ledger AXL message type: ${String(message.type)}`,
    );
  if (message.version !== "1.0")
    throw new Error("Ledger AXL message version must be 1.0");
  if (!message.taskId) throw new Error("Ledger AXL message taskId is required");

  if (
    message.type === "TASK_POSTED" &&
    (!message.buyer || !message.task?.title || !message.task.deadlineSeconds)
  ) {
    throw new Error(
      "TASK_POSTED requires buyer, task.title, and task.deadlineSeconds",
    );
  }
  if (
    message.type === "BID" &&
    (!message.worker || !message.workerINFTId || !message.bidAmount)
  ) {
    throw new Error("BID requires worker, workerINFTId, and bidAmount");
  }
  if (
    message.type === "BID_ACCEPTED" &&
    (!message.selectedWorker || !message.acceptedBidAmount)
  ) {
    throw new Error(
      "BID_ACCEPTED requires selectedWorker and acceptedBidAmount",
    );
  }
  if (
    message.type === "RESULT" &&
    (!message.worker || !message.resultHash || !message.resultPointer)
  ) {
    throw new Error("RESULT requires worker, resultHash, and resultPointer");
  }
  if (
    message.type === "AUCTION_CLOSED" &&
    (!message.buyer || !message.selectedWorker || !message.closedAt)
  ) {
    throw new Error(
      "AUCTION_CLOSED requires buyer, selectedWorker, and closedAt",
    );
  }
}

function isLedgerAxlMessageType(value: string): value is LedgerAxlMessageType {
  return (
    value === "TASK_POSTED" ||
    value === "BID" ||
    value === "BID_ACCEPTED" ||
    value === "RESULT" ||
    value === "AUCTION_CLOSED"
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
