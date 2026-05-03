import type {
  TaskPostedMessage,
  BidMessage,
  BidAcceptedMessage,
  ResultMessage,
  AuctionClosedMessage,
  LedgerAxlMessage,
} from "@ledger/axl-runtime";

// In-memory message bus that implements the same delivery semantics as Gensyn AXL:
// - publish to #ledger-jobs gossipsub topic = fanout to all subscribers
// - direct send by peerId = exactly-once delivery to that peer's inbox
// Live mode swaps this for the real AXL HTTP bridge on localhost:9002.

export type GossipTopic = "#ledger-jobs" | "#ledger-auction-closed";

export type DirectMessage = {
  fromPeerId: string;
  toPeerId: string;
  payload: LedgerAxlMessage;
};

type GossipHandler = (msg: {
  fromPeerId: string;
  payload: LedgerAxlMessage;
}) => void | Promise<void>;
type DirectHandler = (msg: {
  fromPeerId: string;
  payload: LedgerAxlMessage;
}) => void | Promise<void>;

export class MockAxlBus {
  private readonly gossipSubs = new Map<
    GossipTopic,
    Map<string, GossipHandler>
  >();
  private readonly directSubs = new Map<string, DirectHandler>();
  private readonly disconnected = new Set<string>();
  public readonly messageLog: {
    kind: "gossip" | "direct";
    topic?: GossipTopic;
    from: string;
    to?: string;
    payload: LedgerAxlMessage;
    ts: number;
  }[] = [];

  registerPeer(peerId: string, onDirect: DirectHandler): void {
    this.directSubs.set(peerId, onDirect);
  }

  unregisterPeer(peerId: string): void {
    this.directSubs.delete(peerId);
    for (const subs of this.gossipSubs.values()) subs.delete(peerId);
  }

  /** Simulate AXL node disconnect; messages targeting this peer are dropped. */
  disconnect(peerId: string): void {
    this.disconnected.add(peerId);
  }

  reconnect(peerId: string): void {
    this.disconnected.delete(peerId);
  }

  subscribe(topic: GossipTopic, peerId: string, handler: GossipHandler): void {
    if (!this.gossipSubs.has(topic)) this.gossipSubs.set(topic, new Map());
    this.gossipSubs.get(topic)!.set(peerId, handler);
  }

  async publish(
    topic: GossipTopic,
    fromPeerId: string,
    payload: TaskPostedMessage | AuctionClosedMessage,
  ): Promise<void> {
    this.messageLog.push({
      kind: "gossip",
      topic,
      from: fromPeerId,
      payload,
      ts: Date.now(),
    });
    const subs = this.gossipSubs.get(topic);
    if (!subs) return;
    const handlers = [...subs.entries()].filter(
      ([peer]) => peer !== fromPeerId && !this.disconnected.has(peer),
    );
    // simulate async fanout so handlers behave like real network delivery
    await Promise.all(
      handlers.map(([, h]) =>
        Promise.resolve().then(() => h({ fromPeerId, payload })),
      ),
    );
  }

  async sendDirect(
    fromPeerId: string,
    toPeerId: string,
    payload: BidMessage | BidAcceptedMessage | ResultMessage,
  ): Promise<void> {
    this.messageLog.push({
      kind: "direct",
      from: fromPeerId,
      to: toPeerId,
      payload,
      ts: Date.now(),
    });
    if (this.disconnected.has(toPeerId)) return; // dropped
    const handler = this.directSubs.get(toPeerId);
    if (!handler) return;
    await Promise.resolve().then(() => handler({ fromPeerId, payload }));
  }
}
