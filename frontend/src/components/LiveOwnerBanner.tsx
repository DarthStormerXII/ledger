"use client";

import { useEffect, useState } from "react";
import { resolveWho } from "@/lib/ens";
import { truncAddr } from "@/lib/format";
import type { Address } from "viem";

/**
 * Reads `ownerOf(tokenId)` directly from 0G Galileo, falling back to the
 * provided initial owner if the chain is unreachable. Never blocks paint.
 */
export function LiveOwnerBanner({
  tokenId,
  initialOwner,
}: {
  tokenId: number;
  initialOwner: Address;
}) {
  const [owner, setOwner] = useState<Address>(initialOwner);
  const [live, setLive] = useState(false);

  useEffect(() => {
    let cancelled = false;
    resolveWho(tokenId)
      .then((resolved) => {
        if (cancelled) return;
        setOwner(resolved);
        setLive(true);
      })
      .catch(() => {
        // Keep the seeded owner — the offline path is fine.
      });
    return () => {
      cancelled = true;
    };
  }, [tokenId]);

  return (
    <div className="ledger-mono flex items-center gap-2 text-[14px] text-[color:var(--ledger-ink-muted)]">
      <span className="ledger-caps-md">CURRENT OWNER</span>
      <span className="text-[color:var(--ledger-paper)]">
        {truncAddr(owner)}
      </span>
      {live && (
        <span className="ledger-caps-sm text-[color:var(--ledger-success)]">
          · live
        </span>
      )}
    </div>
  );
}
