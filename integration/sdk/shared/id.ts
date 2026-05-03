import { randomBytes, createHash } from "node:crypto";
import type { Bytes32, Hex } from "./types.js";

export function newTaskId(): Bytes32 {
  return `0x${randomBytes(32).toString("hex")}` as Bytes32;
}

export function newCorrelationId(): string {
  return randomBytes(8).toString("hex");
}

export function hashResult(payload: string | Buffer): Bytes32 {
  const buf = typeof payload === "string" ? Buffer.from(payload) : payload;
  return `0x${createHash("sha256").update(buf).digest("hex")}` as Bytes32;
}

export function nowSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

export function asHex(buf: Buffer | Uint8Array): Hex {
  return `0x${Buffer.from(buf).toString("hex")}` as Hex;
}
