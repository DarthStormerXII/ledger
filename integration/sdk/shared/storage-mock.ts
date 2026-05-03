import { createHash } from "node:crypto";

// In-memory mirror of agents/0g-storage. Tracks encrypted blobs by CID and
// supports byte-equal roundtrips, mirroring the real SDK behavior.
// Live mode: use uploadAgentMemory / downloadAgentMemory from @ledger/0g-storage.

export class MockStorage {
  private readonly blobs = new Map<string, Buffer>();

  async uploadAgentMemory(
    agentId: string,
    plaintext: Buffer,
  ): Promise<{ cid: string }> {
    const digest = createHash("sha256")
      .update(`${agentId}|`)
      .update(plaintext)
      .digest("hex");
    const cid = `0g://${digest}`;
    this.blobs.set(cid, Buffer.from(plaintext));
    return { cid };
  }

  async downloadAgentMemory(cid: string): Promise<Buffer> {
    const blob = this.blobs.get(cid);
    if (!blob) throw new Error(`unknown 0G CID: ${cid}`);
    return Buffer.from(blob);
  }
}
