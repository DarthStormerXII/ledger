import { truncMid } from "@/lib/format";
import { Copyable } from "./Copyable";

export function AttestationBadge({ digest }: { digest: string }) {
  return (
    <div className="flex items-center justify-between border border-[color:var(--ledger-oxblood-dim)] bg-[color:var(--ledger-ink-deep)] px-4 py-3">
      <div className="flex flex-col">
        <span className="ledger-caps-sm text-[color:var(--ledger-ink-muted)]">
          0G COMPUTE · TEE ATTESTATION
        </span>
        <Copyable
          value={digest}
          display={truncMid(digest, 6, 6)}
          className="ledger-mono mt-1 text-[12px] text-[color:var(--ledger-paper)]"
          ariaLabel="Copy attestation digest"
        />
      </div>
      <div className="flex items-center gap-2">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M3 7 l3 3 l5 -6"
            stroke="var(--ledger-success)"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
        <span className="ledger-caps-sm text-[color:var(--ledger-success)]">
          VERIFIED
        </span>
      </div>
    </div>
  );
}
