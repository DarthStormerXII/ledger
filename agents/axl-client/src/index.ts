export type AxlPeer = {
  peerId: string;
  ipv6: string;
  uri?: string;
};

export type AxlTopology = {
  selfPeerId: string;
  selfIpv6: string;
  peers: AxlPeer[];
  raw: unknown;
};

export type LedgerMessageType =
  | "TASK_POSTED"
  | "BID"
  | "BID_ACCEPTED"
  | "RESULT"
  | "AUCTION_CLOSED";

export type LedgerMessage<
  TPayload extends Record<string, unknown> = Record<string, unknown>,
> = {
  type: LedgerMessageType;
  version: "1.0";
  taskId: string;
  sentAt: number;
  payload: TPayload;
};

export type ReceivedAxlMessage = {
  fromPeerId: string;
  payload: Buffer;
};

type RawTopologyPeer = {
  key?: string;
  public_key?: string;
  peer_id?: string;
  ipv6?: string;
  address?: string;
  uri?: string;
};

type RawTopology = {
  our_public_key?: string;
  self_public_key?: string;
  public_key?: string;
  our_ipv6?: string;
  self_ipv6?: string;
  ipv6?: string;
  peers?: RawTopologyPeer[];
  tree?: RawTopologyPeer[];
};

export class AxlClient {
  private readonly baseUrl: string;

  constructor(baseUrl = "http://127.0.0.1:9002") {
    this.baseUrl = baseUrl.replace(/\/+$/, "");
  }

  async getTopology(): Promise<AxlTopology> {
    const response = await fetch(`${this.baseUrl}/topology`);
    if (!response.ok) {
      throw new Error(
        `AXL topology failed: ${response.status} ${response.statusText}`,
      );
    }

    const raw = (await response.json()) as RawTopology;
    const peers = new Map<string, AxlPeer>();
    for (const peer of [...(raw.peers ?? []), ...(raw.tree ?? [])]) {
      const peerId = peer.key ?? peer.public_key ?? peer.peer_id;
      if (!peerId) continue;
      peers.set(peerId, {
        peerId,
        ipv6: peer.ipv6 ?? peer.address ?? "",
        uri: peer.uri,
      });
    }

    return {
      selfPeerId:
        raw.our_public_key ?? raw.self_public_key ?? raw.public_key ?? "",
      selfIpv6: raw.our_ipv6 ?? raw.self_ipv6 ?? raw.ipv6 ?? "",
      peers: [...peers.values()],
      raw,
    };
  }

  async send(destinationPeerId: string, payload: Buffer): Promise<void> {
    if (!/^[0-9a-fA-F]{64}$/.test(destinationPeerId)) {
      throw new Error(
        "AXL destination peer id must be a 64-character hex ed25519 public key",
      );
    }

    const response = await fetch(`${this.baseUrl}/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
        "X-Destination-Peer-Id": destinationPeerId,
      },
      body: new Uint8Array(payload),
    });

    if (!response.ok) {
      throw new Error(
        `AXL send failed: ${response.status} ${response.statusText}`,
      );
    }
  }

  async receive(): Promise<ReceivedAxlMessage | null> {
    const response = await this.fetchReceive();
    if (response.status === 204) return null;
    if (!response.ok) {
      throw new Error(
        `AXL receive failed: ${response.status} ${response.statusText}`,
      );
    }

    const fromPeerId = response.headers.get("X-From-Peer-Id") ?? "";
    if (!fromPeerId) {
      throw new Error("AXL receive response missing X-From-Peer-Id header");
    }

    return {
      fromPeerId,
      payload: Buffer.from(await response.arrayBuffer()),
    };
  }

  encodeLedgerMessage<TPayload extends Record<string, unknown>>(
    type: LedgerMessageType,
    taskId: string,
    payload: TPayload,
  ): Buffer {
    const message: LedgerMessage<TPayload> = {
      type,
      version: "1.0",
      taskId,
      sentAt: Math.floor(Date.now() / 1000),
      payload,
    };
    return Buffer.from(JSON.stringify(message));
  }

  decodeLedgerMessage(payload: Buffer): LedgerMessage {
    const message = JSON.parse(payload.toString("utf8")) as LedgerMessage;
    if (
      !isLedgerMessageType(message.type) ||
      message.version !== "1.0" ||
      !message.taskId
    ) {
      throw new Error("Invalid Ledger AXL message envelope");
    }
    return message;
  }

  private async fetchReceive(): Promise<Response> {
    const recv = await fetch(`${this.baseUrl}/recv`);
    if (recv.status !== 404) return recv;
    return fetch(`${this.baseUrl}/receive`);
  }
}

function isLedgerMessageType(value: string): value is LedgerMessageType {
  return (
    value === "TASK_POSTED" ||
    value === "BID" ||
    value === "BID_ACCEPTED" ||
    value === "RESULT" ||
    value === "AUCTION_CLOSED"
  );
}
