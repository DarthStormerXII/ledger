# Ledger Sponsor Deep-Dive Video Plan

These are supporting cuts, separate from the main 2-4 minute ETHGlobal demo. Use them as README/proof links or sponsor follow-up material if the submission form allows extra links.

## 0G Deep Dive — 90 Seconds

Goal: make 0G judges see both tracks immediately.

Sequence:

1. Open `agents/ledger-agent-kit/README.md` and show the Track A architecture diagram.
2. Run or show `LEDGER_ENS_GATEWAY_URL=https://resolver.fierypools.fun npm run example:research`: a framework-built worker creates a valid `BID` after strict ENS/WorkerINFT consistency checks.
3. Cut to `/proof#0g`: WorkerINFT, tokenId `1`, memory CID, compute digest, transfer tx.
4. Show token-owned escrow payout route: `taskWorkerTokenIds(taskId) = 1`, `payoutRecipient(taskId) = new owner`.

Must be visible:

- `@ledger/agent-kit`
- `identityMode=gateway`
- `identityVerified=true`
- `payChanged=true`
- 0G Storage memory CID
- 0G Compute attestation digest
- ERC-7857 / WorkerINFT token ID
- Current-owner payout route

## Gensyn AXL Deep Dive — 75 Seconds

Goal: make the separate-node AXL requirement impossible to miss.

Sequence:

1. Open the auction room and show the AXL status.
2. Show topology: Fly sjc, Fly fra, residential NAT laptop.
3. Show full lifecycle: `TASK_POSTED -> BID -> BID_ACCEPTED -> AUCTION_CLOSED -> RESULT`.
4. Show `proofs/data/axl-full-cycle.json` or `/proof#axl` with peer IDs and no centralized broker statement.

Must be visible:

- Three peer IDs
- Three host/network labels
- `/send`, `/recv`, `/topology`
- Worker bids and winner
- No centralized broker replacing AXL

## ENS Deep Dive — 75 Seconds

Goal: make ENS feel like infrastructure, not a label.

Sequence:

1. Open the worker profile and show `worker-001.ledger.eth`.
2. Show capability tree: `who`, `pay`, `tx`, `rep`, `mem`.
3. Resolve `who.worker-001.ledger.eth` before and after transfer.
4. Show the same ENS name resolving to the new owner without a new ENS transaction.
5. Show `pay.*` rotating receive addresses and `rep.*` pointing to ERC-8004.

Must be visible:

- `who.worker-001.ledger.eth`
- Old owner and new owner
- `CCIP-Read` / live resolver
- No ENS transaction
- Rotating `pay.*`
- `rep.*` and `mem.*`

## Main Demo Interaction

The main demo should stay product-led. These deep dives are proof-led. Do not overload the main cut with every hash if the sponsor cuts can carry that depth.
