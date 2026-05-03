"use client";

import { sepoliaClient, galileoClient, baseSepoliaClient } from "./clients";
import {
  WORKER_INFT_ABI,
  WORKER_INFT_ADDRESS,
} from "./contracts";
import type { Address } from "viem";
import { namehash, normalize } from "viem/ens";

export type Namespace = "who" | "pay" | "tx" | "rep" | "mem";

export interface NamespaceResolution {
  namespace: Namespace;
  /** The label-prefixed name being resolved (e.g. `who.worker-001.ledger.eth`). */
  fullName: string;
  /** Resolved string value (address, CID, json, or summary). */
  value: string;
  /** Latency of the resolution in ms. */
  latencyMs: number;
  /** Did it succeed? */
  ok: boolean;
  /** Optional secondary lines (e.g. pay rotation). */
  rows?: { label: string; value: string }[];
  /** Raw payload, if any (drawer view). */
  raw?: unknown;
}

/**
 * Resolve a single namespace for a worker iNFT. Falls back to live chain
 * reads when client-side ENS CCIP-Read is not the most reliable path.
 */
export async function resolveNamespace(
  ns: Namespace,
  workerLabel: string,
  parent: string,
  workerSeed: {
    tokenId: number;
    memoryCID?: string;
  },
): Promise<NamespaceResolution> {
  const t0 = performance.now();
  const fullName = `${ns}.${workerLabel}.${parent}`;

  try {
    if (ns === "who") {
      const owner = (await galileoClient.readContract({
        address: WORKER_INFT_ADDRESS,
        abi: WORKER_INFT_ABI,
        functionName: "ownerOf",
        args: [BigInt(workerSeed.tokenId)],
      })) as Address;
      return {
        namespace: ns,
        fullName,
        value: owner,
        latencyMs: Math.round(performance.now() - t0),
        ok: true,
        raw: { method: "ownerOf", chainId: 16602, tokenId: workerSeed.tokenId },
      };
    }

    if (ns === "pay") {
      return {
        namespace: ns,
        fullName,
        value: "not configured",
        latencyMs: Math.round(performance.now() - t0),
        ok: false,
        raw: { reason: "No live pay resolver record is configured." },
      };
    }

    if (ns === "tx") {
      return {
        namespace: ns,
        fullName,
        value: "not selected",
        latencyMs: Math.round(performance.now() - t0),
        ok: false,
        raw: { reason: "Choose a live escrow task before resolving tx.*." },
      };
    }

    if (ns === "rep") {
      return {
        namespace: ns,
        fullName,
        value: "read through live.ts",
        latencyMs: Math.round(performance.now() - t0),
        ok: false,
        raw: { reason: "ERC-8004 summaries are read by the live data layer." },
      };
    }

    if (ns === "mem") {
      const metadata = (await galileoClient.readContract({
        address: WORKER_INFT_ADDRESS,
        abi: WORKER_INFT_ABI,
        functionName: "getMetadata",
        args: [BigInt(workerSeed.tokenId)],
      })) as { memoryCID?: string };
      return {
        namespace: ns,
        fullName,
        value: metadata.memoryCID ?? workerSeed.memoryCID ?? "",
        latencyMs: Math.round(performance.now() - t0),
        ok: true,
        raw: { method: "getMetadata", chainId: 16602 },
      };
    }
  } catch (err) {
    return {
      namespace: ns,
      fullName,
      value: "—",
      latencyMs: Math.round(performance.now() - t0),
      ok: false,
      raw: { error: String(err) },
    };
  }

  return {
    namespace: ns,
    fullName,
    value: "—",
    latencyMs: Math.round(performance.now() - t0),
    ok: false,
  };
}

/** Resolve all five namespaces in parallel. */
export async function resolveAll(
  workerLabel: string,
  parent: string,
  workerSeed: Parameters<typeof resolveNamespace>[3],
): Promise<NamespaceResolution[]> {
  return Promise.all(
    (["who", "pay", "tx", "rep", "mem"] as Namespace[]).map((ns) =>
      resolveNamespace(ns, workerLabel, parent, workerSeed),
    ),
  );
}

/**
 * Resolve all five namespaces, calling `onResult` as each lands. Use this for
 * incremental rendering so the slow `who.*` chain RPC doesn't block the others.
 */
export function resolveAllStreaming(
  workerLabel: string,
  parent: string,
  workerSeed: Parameters<typeof resolveNamespace>[3],
  onResult: (r: NamespaceResolution) => void,
): Promise<NamespaceResolution[]> {
  return Promise.all(
    (["who", "pay", "tx", "rep", "mem"] as Namespace[]).map(async (ns) => {
      const r = await resolveNamespace(ns, workerLabel, parent, workerSeed);
      onResult(r);
      return r;
    }),
  );
}

/**
 * Resolve `who.<worker>.<parent>` only (used for the inheritance flip).
 * Returns the live ownerOf() result.
 */
export async function resolveWho(tokenId: number): Promise<Address> {
  return (await galileoClient.readContract({
    address: WORKER_INFT_ADDRESS,
    abi: WORKER_INFT_ABI,
    functionName: "ownerOf",
    args: [BigInt(tokenId)],
  })) as Address;
}

/* eslint-disable @typescript-eslint/no-unused-vars */
const _unused = { sepoliaClient, baseSepoliaClient, namehash, normalize };
