"use client";

import { useEffect, useState } from "react";
import type { Address } from "viem";
import { galileoClient } from "@/lib/clients";
import { WORKER_INFT_ABI, WORKER_INFT_ADDRESS } from "@/lib/contracts";

/**
 * Live `ownerOf(tokenId)` from the deployed iNFT on 0G Galileo.
 * Returns the chain owner once the RPC settles; null while loading.
 */
export function useLiveOwner(tokenId: number, fallback?: Address) {
  const [owner, setOwner] = useState<Address | null>(fallback ?? null);
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState(false);

  useEffect(() => {
    let cancelled = false;
    galileoClient
      .readContract({
        address: WORKER_INFT_ADDRESS,
        abi: WORKER_INFT_ABI,
        functionName: "ownerOf",
        args: [BigInt(tokenId)],
      })
      .then((addr) => {
        if (cancelled) return;
        setOwner(addr as Address);
        setLive(true);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tokenId]);

  return { owner, loading, live };
}

export function shortAddr(addr: string): string {
  if (!addr || addr.length < 10) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}
