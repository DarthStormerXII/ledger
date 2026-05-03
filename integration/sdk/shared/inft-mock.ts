import { randomBytes, createHmac } from "node:crypto";
import type { Address, Hex } from "./types.js";

// In-memory mirror of contracts/src/WorkerINFT.sol — including ERC-7857 sealed-key re-keying.
// Live mode: replace with ethers Contract calls against the deployed Galileo address
// 0x48B051F3e565E394ED8522ac453d87b3Fa40ad62.

export interface WorkerMetadata {
  agentName: string;
  sealedKey: Hex;
  memoryCID: string;
  initialReputationRef: string;
  updatedAt: number;
}

const VALID_PROOF_DEMO = Buffer.from("ledger-valid-tee-proof");

export class MockWorkerINFTRegistry {
  private nextTokenId = 1;
  private readonly owners = new Map<number, Address>();
  private readonly metadata = new Map<number, WorkerMetadata>();
  private readonly masterKeys = new Map<number, Buffer>();
  public readonly txLog: { type: string; tokenId: number; txHash: Hex }[] = [];

  /** Pre-seed the canonical demo worker (tokenId=1) to mirror the deployed Galileo state. */
  seedDemoWorker(input: {
    owner: Address;
    agentName: string;
    memoryCID: string;
    masterKey?: Buffer;
  }): number {
    const tokenId = this.nextTokenId++;
    const masterKey = input.masterKey ?? randomBytes(32);
    this.masterKeys.set(tokenId, masterKey);
    const sealedKey = sealKeyForOwner(masterKey, input.owner);
    this.owners.set(tokenId, input.owner);
    this.metadata.set(tokenId, {
      agentName: input.agentName,
      sealedKey,
      memoryCID: input.memoryCID,
      initialReputationRef: `erc8004:0x8004B663056A597Dffe9eCcC1965A193B7388713`,
      updatedAt: Math.floor(Date.now() / 1000),
    });
    this.recordTx("mint", tokenId);
    return tokenId;
  }

  mint(input: {
    to: Address;
    agentName: string;
    memoryCID: string;
    masterKey?: Buffer;
  }): { tokenId: number; sealedKey: Hex; txHash: Hex } {
    const tokenId = this.nextTokenId++;
    const masterKey = input.masterKey ?? randomBytes(32);
    this.masterKeys.set(tokenId, masterKey);
    const sealedKey = sealKeyForOwner(masterKey, input.to);
    this.owners.set(tokenId, input.to);
    this.metadata.set(tokenId, {
      agentName: input.agentName,
      sealedKey,
      memoryCID: input.memoryCID,
      initialReputationRef: `erc8004:0x8004B663056A597Dffe9eCcC1965A193B7388713`,
      updatedAt: Math.floor(Date.now() / 1000),
    });
    const txHash = this.recordTx("mint", tokenId);
    return { tokenId, sealedKey, txHash };
  }

  transfer(input: {
    from: Address;
    to: Address;
    tokenId: number;
    proof: Buffer;
  }): { sealedKey: Hex; txHash: Hex } {
    const owner = this.owners.get(input.tokenId);
    if (!owner) throw new Error("InvalidToken");
    if (owner.toLowerCase() !== input.from.toLowerCase())
      throw new Error("NotAuthorized");
    if (Buffer.compare(input.proof, VALID_PROOF_DEMO) !== 0) {
      throw new Error("InvalidProof");
    }
    const masterKey = this.masterKeys.get(input.tokenId);
    if (!masterKey) throw new Error("InvalidToken");
    const newSealedKey = sealKeyForOwner(masterKey, input.to);
    this.owners.set(input.tokenId, input.to);
    const meta = this.metadata.get(input.tokenId)!;
    meta.sealedKey = newSealedKey;
    meta.updatedAt = Math.floor(Date.now() / 1000);
    const txHash = this.recordTx("transfer", input.tokenId);
    return { sealedKey: newSealedKey, txHash };
  }

  ownerOf(tokenId: number): Address {
    const owner = this.owners.get(tokenId);
    if (!owner) throw new Error("InvalidToken");
    return owner;
  }

  getMetadata(tokenId: number): WorkerMetadata {
    const m = this.metadata.get(tokenId);
    if (!m) throw new Error("InvalidToken");
    return { ...m };
  }

  private recordTx(type: string, tokenId: number): Hex {
    const txHash = `0x${randomBytes(32).toString("hex")}` as Hex;
    this.txLog.push({ type, tokenId, txHash });
    return txHash;
  }
}

export const DEMO_TRANSFER_PROOF: Buffer = VALID_PROOF_DEMO;

function sealKeyForOwner(masterKey: Buffer, owner: Address): Hex {
  return `0x${createHmac("sha256", masterKey).update(`ledger-owner:${owner.toLowerCase()}`).digest("hex")}` as Hex;
}
