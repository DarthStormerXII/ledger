import { randomBytes } from "node:crypto";
import type { Address, Bytes32, Hex, ReputationSummary } from "./types.js";

// In-memory mirror of the audited ERC-8004 ReputationRegistry on Base Sepolia.
// Real address: 0x8004B663056A597Dffe9eCcC1965A193B7388713.
// Live mode: replace this with an ethers Contract pointed at that address.

export interface FeedbackInput {
  buyer: Address;
  worker: Address;
  score: number; // 1-5 stars
  resultHash: Bytes32;
  taskId: Bytes32;
}

export interface FeedbackRecord extends FeedbackInput {
  txHash: Hex;
  recordedAt: number;
}

export class MockReputationRegistry {
  private readonly records: FeedbackRecord[] = [];
  private latencyMs = 0;

  /** Set artificial network latency in ms. Used by cross-chain eventual-consistency tests. */
  setLatency(ms: number): void {
    this.latencyMs = ms;
  }

  async feedback(input: FeedbackInput): Promise<Hex> {
    if (this.latencyMs > 0)
      await new Promise((r) => setTimeout(r, this.latencyMs));
    const txHash = `0x${randomBytes(32).toString("hex")}` as Hex;
    this.records.push({ ...input, txHash, recordedAt: Date.now() });
    return txHash;
  }

  /** Synchronous read; returns aggregate the way the on-chain registry does. */
  summary(worker: Address): ReputationSummary {
    const all = this.records.filter(
      (r) => r.worker.toLowerCase() === worker.toLowerCase(),
    );
    if (all.length === 0) return { worker, jobCount: 0, avgRating: 0 };
    const total = all.reduce((acc, r) => acc + r.score, 0);
    return { worker, jobCount: all.length, avgRating: total / all.length };
  }

  seedHistory(worker: Address, jobCount: number, avgRating: number): void {
    // Used to simulate the 47-job seeded reputation for the inheritance demo.
    // Records are synthetic; only summary() needs to match.
    for (let i = 0; i < jobCount; i++) {
      this.records.push({
        buyer: ("0x" + "00".repeat(20)) as Address,
        worker,
        score: avgRating,
        resultHash: ("0x" + "00".repeat(32)) as Bytes32,
        taskId: ("0x" + "00".repeat(32)) as Bytes32,
        txHash: `0x${randomBytes(32).toString("hex")}` as Hex,
        recordedAt: Date.now(),
      });
    }
  }

  records_(): FeedbackRecord[] {
    return [...this.records];
  }
}
