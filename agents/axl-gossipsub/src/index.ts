import type { AxlClient } from "@ledger/axl-client";

export type GossipSubHandler = (message: {
  topic: string;
  fromPeerId: string;
  originPeerId: string;
  messageId: string;
  payload: Buffer;
  hop: number;
}) => void | Promise<void>;

type GossipConfig = {
  degree: number;
  degreeLow: number;
  degreeHigh: number;
  heartbeatMs: number;
};

type GossipEnvelope = {
  type: "gossipsub";
  msg_type: "MESSAGE" | "GRAFT" | "PRUNE" | "IHAVE" | "IWANT";
  topic?: string;
  msg_id?: string;
  origin?: string;
  from?: string;
  hop?: number;
  data?: string;
  peers?: string[];
  msg_ids?: string[];
};

export class GossipSubChannel {
  private readonly channelName: string;
  private readonly axlClient: AxlClient;
  private readonly config: GossipConfig;
  private selfPeerId = "";
  private readonly peers = new Set<string>();
  private readonly mesh = new Set<string>();
  private readonly seenMessages = new Set<string>();
  private readonly messageCache = new Map<string, GossipEnvelope>();
  private readonly handlers = new Set<GossipSubHandler>();
  private messageCounter = 0;
  private heartbeat: NodeJS.Timeout | null = null;
  private polling = false;

  constructor(channelName: string, axlClient: AxlClient, config: Partial<GossipConfig> = {}) {
    this.channelName = channelName;
    this.axlClient = axlClient;
    this.config = {
      degree: config.degree ?? 3,
      degreeLow: config.degreeLow ?? 2,
      degreeHigh: config.degreeHigh ?? 4,
      heartbeatMs: config.heartbeatMs ?? 1000,
    };
  }

  async start(): Promise<void> {
    await this.refreshPeers();
    if (this.heartbeat) return;
    this.polling = true;
    this.poll().catch(() => undefined);
    this.heartbeat = setInterval(() => {
      this.refreshPeers().catch(() => undefined);
      this.maintainMesh().catch(() => undefined);
    }, this.config.heartbeatMs);
  }

  stop(): void {
    this.polling = false;
    if (this.heartbeat) clearInterval(this.heartbeat);
    this.heartbeat = null;
  }

  subscribe(handler: GossipSubHandler): void {
    this.handlers.add(handler);
  }

  unsubscribe(handler: GossipSubHandler): void {
    this.handlers.delete(handler);
  }

  async publish(payload: Buffer): Promise<void> {
    await this.ensureSelfPeerId();
    const messageId = `${this.selfPeerId.slice(0, 8)}:${++this.messageCounter}`;
    const envelope: GossipEnvelope = {
      type: "gossipsub",
      msg_type: "MESSAGE",
      topic: this.channelName,
      msg_id: messageId,
      origin: this.selfPeerId,
      from: this.selfPeerId,
      hop: 0,
      data: payload.toString("base64"),
    };

    this.seenMessages.add(messageId);
    this.messageCache.set(messageId, envelope);
    const targets = this.mesh.size > 0 ? this.mesh : this.peers;
    await Promise.all([...targets].map((peerId) => this.sendEnvelope(peerId, envelope)));
  }

  private async refreshPeers(): Promise<void> {
    const topology = await this.axlClient.getTopology();
    this.selfPeerId = topology.selfPeerId;
    for (const peer of topology.peers) {
      if (peer.peerId !== this.selfPeerId) this.peers.add(peer.peerId);
    }
  }

  private async ensureSelfPeerId(): Promise<void> {
    if (!this.selfPeerId) await this.refreshPeers();
    if (!this.selfPeerId) throw new Error("AXL topology did not return self peer id");
  }

  private async poll(): Promise<void> {
    while (this.polling) {
      const message = await this.axlClient.receive();
      if (message) {
        await this.handleRaw(message.fromPeerId, message.payload);
      } else {
        await sleep(50);
      }
    }
  }

  private async handleRaw(fromPeerId: string, raw: Buffer): Promise<void> {
    let envelope: GossipEnvelope;
    try {
      envelope = JSON.parse(raw.toString("utf8")) as GossipEnvelope;
    } catch {
      return;
    }
    if (envelope.type !== "gossipsub") return;

    if (envelope.msg_type === "MESSAGE") await this.handleMessage(fromPeerId, envelope);
    if (envelope.msg_type === "GRAFT" && envelope.topic === this.channelName) this.mesh.add(fromPeerId);
    if (envelope.msg_type === "PRUNE" && envelope.topic === this.channelName) this.mesh.delete(fromPeerId);
    if (envelope.msg_type === "IHAVE" && envelope.topic === this.channelName) await this.handleIHave(fromPeerId, envelope);
    if (envelope.msg_type === "IWANT") await this.handleIWant(fromPeerId, envelope);
  }

  private async handleMessage(fromPeerId: string, envelope: GossipEnvelope): Promise<void> {
    if (envelope.topic !== this.channelName || !envelope.msg_id || !envelope.data) return;
    if (this.seenMessages.has(envelope.msg_id)) return;

    this.seenMessages.add(envelope.msg_id);
    this.messageCache.set(envelope.msg_id, envelope);
    const payload = Buffer.from(envelope.data, "base64");
    await Promise.all(
      [...this.handlers].map((handler) =>
        handler({
          topic: this.channelName,
          fromPeerId,
          originPeerId: envelope.origin ?? fromPeerId,
          messageId: envelope.msg_id ?? "",
          payload,
          hop: envelope.hop ?? 0,
        }),
      ),
    );

    const forward: GossipEnvelope = {
      ...envelope,
      from: this.selfPeerId,
      hop: (envelope.hop ?? 0) + 1,
    };
    const candidates = [...this.mesh].filter((peerId) => peerId !== fromPeerId && peerId !== envelope.origin);
    await Promise.all(candidates.slice(0, 1).map((peerId) => this.sendEnvelope(peerId, forward)));
    await Promise.all(
      candidates.slice(1).map((peerId) =>
        this.sendEnvelope(peerId, {
          type: "gossipsub",
          msg_type: "IHAVE",
          topic: this.channelName,
          msg_ids: [envelope.msg_id ?? ""],
        }),
      ),
    );
  }

  private async handleIHave(fromPeerId: string, envelope: GossipEnvelope): Promise<void> {
    const wanted = (envelope.msg_ids ?? []).filter((messageId) => !this.seenMessages.has(messageId));
    if (wanted.length === 0) return;
    await this.sendEnvelope(fromPeerId, {
      type: "gossipsub",
      msg_type: "IWANT",
      msg_ids: wanted.slice(0, 64),
    });
  }

  private async handleIWant(fromPeerId: string, envelope: GossipEnvelope): Promise<void> {
    for (const messageId of envelope.msg_ids ?? []) {
      const cached = this.messageCache.get(messageId);
      if (cached) await this.sendEnvelope(fromPeerId, { ...cached, from: this.selfPeerId });
    }
  }

  private async maintainMesh(): Promise<void> {
    for (const peerId of [...this.mesh]) {
      if (!this.peers.has(peerId)) this.mesh.delete(peerId);
    }

    if (this.mesh.size < this.config.degreeLow) {
      for (const peerId of [...this.peers].filter((peer) => !this.mesh.has(peer)).slice(0, this.config.degree - this.mesh.size)) {
        this.mesh.add(peerId);
        await this.sendEnvelope(peerId, { type: "gossipsub", msg_type: "GRAFT", topic: this.channelName });
      }
    }

    if (this.mesh.size > this.config.degreeHigh) {
      for (const peerId of [...this.mesh].slice(this.config.degree)) {
        this.mesh.delete(peerId);
        await this.sendEnvelope(peerId, {
          type: "gossipsub",
          msg_type: "PRUNE",
          topic: this.channelName,
          peers: [],
        });
      }
    }
  }

  private async sendEnvelope(peerId: string, envelope: GossipEnvelope): Promise<void> {
    await this.axlClient.send(peerId, Buffer.from(JSON.stringify(envelope)));
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
