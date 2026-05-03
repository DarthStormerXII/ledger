import type { Address } from "./types.js";
import type { MockWorkerINFTRegistry } from "./inft-mock.js";
import type { MockReputationRegistry } from "./reputation-mock.js";

// In-memory mirror of the resolver/ CCIP-Read gateway. Live mode points at the deployed
// gateway URL via LedgerCapabilityClient. Same surface, same return shapes — so the
// frontend has zero impedance mismatch when swapping.

export interface CapabilityNames {
  who: string;
  pay: string;
  rep: string;
  mem: string;
  tx?: string;
}

export class MockEnsResolver {
  constructor(
    private readonly parentName: string,
    private readonly inft: MockWorkerINFTRegistry,
    private readonly reputation: MockReputationRegistry,
    private readonly workerLabelToTokenId: Map<string, number> = new Map(),
  ) {}

  bindWorkerLabel(label: string, tokenId: number): void {
    this.workerLabelToTokenId.set(label, tokenId);
  }

  names(workerLabel: string, txId?: string): CapabilityNames {
    return {
      who: `who.${workerLabel}.${this.parentName}`,
      pay: `pay.${workerLabel}.${this.parentName}`,
      rep: `rep.${workerLabel}.${this.parentName}`,
      mem: `mem.${workerLabel}.${this.parentName}`,
      tx: txId ? `tx.${txId}.${workerLabel}.${this.parentName}` : undefined,
    };
  }

  /** `who.<worker>.<parent>.eth` → live owner via ownerOf cross-chain. */
  resolveWho(workerLabel: string): Address {
    const tokenId = this.requireToken(workerLabel);
    return this.inft.ownerOf(tokenId);
  }

  /** `mem.<worker>.<parent>.eth` ai.mem.cid → memory CID. */
  resolveMem(workerLabel: string): string {
    const tokenId = this.requireToken(workerLabel);
    return this.inft.getMetadata(tokenId).memoryCID;
  }

  /** `rep.<worker>.<parent>.eth` ai.rep.count and ai.rep.avg. */
  resolveRep(workerLabel: string): { count: number; avgRating: number } {
    const tokenId = this.requireToken(workerLabel);
    const owner = this.inft.ownerOf(tokenId);
    const summary = this.reputation.summary(owner);
    return { count: summary.jobCount, avgRating: summary.avgRating };
  }

  /** `pay.<worker>.<parent>.eth` → HD-derived rotating address per resolution. */
  resolvePay(workerLabel: string): Address {
    const tokenId = this.requireToken(workerLabel);
    const owner = this.inft.ownerOf(tokenId);
    // Mock HD-derivation: deterministic per call by using nonce; for parity with live
    // resolver we just rotate on each call.
    const nonce = this.payNonces.get(workerLabel) ?? 0;
    this.payNonces.set(workerLabel, nonce + 1);
    const last4 = nonce.toString(16).padStart(4, "0");
    return (owner.slice(0, 38) + last4) as Address;
  }
  private readonly payNonces = new Map<string, number>();

  private requireToken(workerLabel: string): number {
    const id = this.workerLabelToTokenId.get(workerLabel);
    if (id === undefined)
      throw new Error(`unknown worker label ${workerLabel}`);
    return id;
  }
}
