import { describe, expect, it } from "vitest";
import {
  LEDGER_AUCTION_CLOSED_TOPIC,
  LEDGER_JOBS_TOPIC,
  LedgerAxlRuntime,
  decodeLedgerMessage,
  encodeLedgerMessage,
  type AuctionClosedMessage,
  type BidMessage,
  type LedgerAxlMessage,
  type TaskPostedMessage,
} from "../src/index.js";
import type { AxlTopology, ReceivedAxlMessage } from "@ledger/axl-client";
import type { GossipSubHandler } from "@ledger/axl-gossipsub";

class FakeClient {
  sent: Array<{ peerId: string; payload: LedgerAxlMessage }> = [];
  queue: ReceivedAxlMessage[] = [];

  async getTopology(): Promise<AxlTopology> {
    return { selfPeerId: "a".repeat(64), selfIpv6: "200::1", peers: [], raw: {} };
  }

  async send(peerId: string, payload: Buffer): Promise<void> {
    this.sent.push({ peerId, payload: decodeLedgerMessage(payload) });
  }

  async receive(): Promise<ReceivedAxlMessage | null> {
    return this.queue.shift() ?? null;
  }
}

class FakeChannel {
  published: LedgerAxlMessage[] = [];
  handlers: GossipSubHandler[] = [];
  started = false;

  async start(): Promise<void> {
    this.started = true;
  }

  stop(): void {
    this.started = false;
  }

  subscribe(handler: GossipSubHandler): void {
    this.handlers.push(handler);
  }

  async publish(payload: Buffer): Promise<void> {
    this.published.push(decodeLedgerMessage(payload));
  }
}

describe("LedgerAxlRuntime", () => {
  it("publishes task and auction close messages to the correct topics", async () => {
    const client = new FakeClient();
    const channels = new Map<string, FakeChannel>();
    const runtime = new LedgerAxlRuntime({
      client,
      channelFactory: (topic) => {
        const channel = new FakeChannel();
        channels.set(topic, channel);
        return channel;
      },
    });

    const task = taskPosted();
    const close = auctionClosed();
    await runtime.postTask(task);
    await runtime.closeAuction(close);

    expect(channels.get(LEDGER_JOBS_TOPIC)?.published).toEqual([task]);
    expect(channels.get(LEDGER_AUCTION_CLOSED_TOPIC)?.published).toEqual([close]);
  });

  it("sends direct bid messages to the buyer peer", async () => {
    const client = new FakeClient();
    const runtime = new LedgerAxlRuntime({ client });
    const bid: BidMessage = {
      type: "BID",
      version: "1.0",
      taskId: "0x1",
      worker: "0xWorker",
      workerINFTId: "7",
      bidAmount: "4500000",
    };

    await runtime.submitBid("b".repeat(64), bid);

    expect(client.sent).toEqual([{ peerId: "b".repeat(64), payload: bid }]);
  });

  it("receives typed direct messages and waits by task id", async () => {
    const client = new FakeClient();
    const runtime = new LedgerAxlRuntime({ client });
    const bid = {
      type: "BID",
      version: "1.0",
      taskId: "0xwait",
      worker: "0xWorker",
      workerINFTId: "7",
      bidAmount: "4500000",
    } satisfies BidMessage;
    client.queue.push({ fromPeerId: "c".repeat(64), payload: encodeLedgerMessage(bid) });

    await expect(runtime.waitForDirect("BID", "0xwait", 100)).resolves.toEqual({
      fromPeerId: "c".repeat(64),
      payload: bid,
    });
  });

  it("rejects malformed messages at the app boundary", async () => {
    const runtime = new LedgerAxlRuntime({ client: new FakeClient() });
    await expect(
      runtime.postTask({
        type: "TASK_POSTED",
        version: "1.0",
        taskId: "0x1",
        buyer: "",
        task: { title: "", deadlineSeconds: 0 },
        postedAt: 1,
      }),
    ).rejects.toThrow(/TASK_POSTED requires/);
  });
});

function taskPosted(): TaskPostedMessage {
  return {
    type: "TASK_POSTED",
    version: "1.0",
    taskId: "0x1",
    buyer: "0xBuyer",
    task: { title: "Base Yield Scout", deadlineSeconds: 120 },
    postedAt: 1714000000,
  };
}

function auctionClosed(): AuctionClosedMessage {
  return {
    type: "AUCTION_CLOSED",
    version: "1.0",
    taskId: "0x1",
    buyer: "0xBuyer",
    selectedWorker: "0xWorker",
    closedAt: 1714000060,
  };
}
