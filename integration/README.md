# Ledger Integration SDK

A unified TypeScript SDK that wires together the three sponsor layers (0G, Gensyn AXL, ENS) plus Base Sepolia ERC-8004 into a clean buyer/worker agent surface a Next.js frontend can consume directly.

## What's in here

```
integration/
├── README.md                        # this file
├── package.json
├── tsconfig.json
├── runner.ts                        # `pnpm test:integration` entrypoint
├── sdk/
│   ├── index.ts                     # public exports
│   ├── BuyerAgent.ts                # buyer-side composition
│   ├── WorkerAgent.ts               # worker-side composition
│   └── shared/
│       ├── types.ts                 # message schemas, event surface
│       ├── id.ts                    # taskId / correlationId helpers
│       ├── retry.ts                 # retry-with-backoff
│       ├── logger.ts                # structured JSON logging
│       ├── escrow-mock.ts           # in-memory mirror of LedgerEscrow.sol
│       ├── reputation-mock.ts       # in-memory mirror of ERC-8004 registry
│       ├── inft-mock.ts             # in-memory mirror of WorkerINFT.sol (with sealed-key re-keying)
│       ├── ens-mock.ts              # in-memory mirror of CCIP-Read resolver
│       ├── compute-mock.ts          # in-memory mirror of 0G Compute
│       ├── storage-mock.ts          # in-memory mirror of 0G Storage
│       ├── axl-bus.ts               # in-memory mirror of Gensyn AXL HTTP bridge
│       └── adapters.ts              # one bundle that the agents consume
└── scenarios/
    ├── _lib.ts                      # fixture factory + proof writer
    ├── 01_happy_path_full_lifecycle.ts
    ├── 02_inheritance_happy_path.ts          # the hero demo mechanic
    ├── 03_auction_no_bids_cancel.ts
    ├── 04_worker_timeout_bond_slash.ts
    ├── 05_multi_bid_lowest_wins.ts
    ├── 06_reputation_gating.ts
    ├── 07_cross_chain_eventual_consistency.ts
    ├── 08_axl_node_disconnect_recovery.ts
    ├── 09_compute_attestation_failure_reject.ts
    └── 10_concurrent_tasks.ts
```

Per-scenario JSON proofs land at `proofs/data/integration/<scenario>.json`, and the runner aggregates a `proofs/data/integration/SUMMARY.json` for fast visual scan.

## SDK surface

Two classes, both event-emitters, both designed for a Next.js frontend to subscribe to.

### `BuyerAgent`

Composes:
- `MockEscrow` (or live LedgerEscrow contract on 0G Galileo at `0x12D2162F47AAAe1B0591e898648605daA186D644`) for `postTask` / `acceptBid` / `releasePayment` / `slashBond` / `cancelTask`
- `MockAxlBus` (or live AXL bridge at `localhost:9002` from `agents/axl-runtime`) for `#ledger-jobs` gossipsub broadcasts and direct `BID` / `BID_ACCEPTED` / `RESULT` messages
- `MockReputationRegistry` (or live audited ERC-8004 at `0x8004B663056A597Dffe9eCcC1965A193B7388713` on Base Sepolia) for star-rating feedback on settle
- `MockEnsResolver` (or `LedgerCapabilityClient` from `resolver/`) for resolving `who.<worker>.<parent>.eth` cross-chain

Public API:
```ts
const buyer = new BuyerAgent({ buyerAddress, buyerPeerId, adapters, initialBalance });
const off = buyer.on((event) => /* TaskPosted | BidReceived | BidAccepted | Settled | Slashed | Cancelled | AttestationRejected | Log */);

const { txHash, correlationId } = await buyer.postTask({ task });
const bids = await buyer.collectBids(task.taskId, { windowMs: 250, maxBids: 3 });
const winner = buyer.selectWinner(task);
await buyer.acceptBid({ taskId, bid: winner, workerPeerId });
const settlement = await buyer.settle({ taskId, result, starRating: 5, eventualReputationConsistency: false });
// or: await buyer.cancelTask(taskId);
// or: await buyer.slashBond(taskId);
buyer.shutdown();
```

### `WorkerAgent`

Composes:
- `MockAxlBus` subscription to `#ledger-jobs` and direct inbox for `BID_ACCEPTED`
- `MockCompute` (or live `runReasoning` from `agents/0g-compute`) with sealed-inference + attestation digest
- `MockStorage` (or live `uploadAgentMemory` from `agents/0g-storage`) with AES-256-CTR + 0g:// CID roundtrip
- `MockEscrow` for `acceptBid` (paying bond)
- `MockWorkerINFTRegistry` (or live WorkerINFT at `0x48B051F3e565E394ED8522ac453d87b3Fa40ad62`) for `tokenId` / `ownerOf` / `memoryCID`

Public API:
```ts
const worker = new WorkerAgent({ workerAddress, workerPeerId, workerINFTId, workerLabel, adapters });
worker.setBidStrategy(passthroughIfQualified({ askingBid: 900_000n, minRating: 4.5 }));
const off = worker.on((event) => /* BidAccepted | ResultSubmitted | Log */);
const ownerNow = worker.resolveOwnerViaEns();
const result = await worker.executeAcceptedTask(task, { buyerAddress });
worker.shutdown();
```

## How to run

```bash
cd integration
npm install                   # or pnpm install
npm run test:integration      # runs all 10 scenarios; writes proofs/data/integration/*.json
npm run demo:run              # 01_happy_path_full_lifecycle.ts standalone
npm run typecheck             # tsc --noEmit
```

The runner does live preflight checks — it pings the deployed 0G Galileo RPC (chainId 16602), the local AXL bridge (`localhost:9002`), and the resolver gateway (env `LEDGER_RESOLVER_URL`). Preflight notes land in `SUMMARY.json` so you can see in one place what the run actually exercised.

## Consuming from a Next.js frontend

The SDK is import-clean and emits typed events — you drop it into a server action / API route.

```ts
// app/api/auctions/route.ts
import { BuyerAgent, createMockAdapters, newTaskId } from "@ledger/integration/sdk";

export async function POST(req: Request) {
  const { title, payment, bondRequirement, deadlineSeconds, minReputation } = await req.json();
  const adapters = createMockAdapters(); // swap for live adapters when ready
  const buyer = new BuyerAgent({
    buyerAddress: process.env.BUYER_ADDRESS as `0x${string}`,
    buyerPeerId: "buyer-prod-1",
    adapters,
    initialBalance: 1_000_000_000_000_000_000n,
  });

  const events: unknown[] = [];
  buyer.on((e) => events.push(e));

  const task = {
    taskId: newTaskId(),
    title,
    payment: BigInt(payment),
    bondRequirement: BigInt(bondRequirement),
    deadlineSeconds,
    minReputation,
  };
  const { txHash, correlationId } = await buyer.postTask({ task });

  // Hand off to a long-running worker; in real deployment you'd use SSE or WebSocket
  // to stream `events` to the client. Frontend listens and renders the auction strip.
  return Response.json({ taskId: task.taskId, txHash, correlationId });
}
```

For a live-adapter swap, replace `createMockAdapters()` with adapters that wrap:
- `agents/0g-integration` (`LedgerEscrowAdapter`, `WorkerINFTAdapter`)
- `agents/axl-runtime` (`LedgerAxlRuntime`)
- `resolver/` (`LedgerCapabilityClient`)
- An ethers `Contract` against `0x8004B663056A597Dffe9eCcC1965A193B7388713` on Base Sepolia for ERC-8004 feedback

The adapter interfaces are intentionally narrow (each method returns the same shape mock and live both) so the swap is a one-file change.

## Scenarios — what each one proves

| # | Scenario | What it verifies |
|---|---|---|
| 01 | `happy_path_full_lifecycle` | post → bid → accept → reasoning → memory upload → result → release → ERC-8004 +1; full lifecycle from end to end. |
| 02 | `inheritance_happy_path` | mint iNFT to A → transfer to B (sealed-key re-keys) → ENS `who.*` flips with **zero ENS transactions** → next earnings flow to B. The hero demo. |
| 03 | `auction_no_bids_cancel` | min-reputation gate filters all bids → buyer cancels → escrow refunds. |
| 04 | `worker_timeout_bond_slash` | worker bonds but never delivers → deadline expires → buyer slashBonds → bond + payment go to buyer. |
| 05 | `multi_bid_lowest_wins` | 3 qualified bidders → lowest bid wins (deterministic peer-id tie-break). |
| 06 | `reputation_gating` | 4.7-rated worker qualifies, 3.5 doesn't, even though the 3.5 bid is cheaper. |
| 07 | `cross_chain_eventual_consistency` | payment lands instantly, ERC-8004 feedback lags ≤10s; settlement record transitions `pending_reconcile` → `synced` automatically. |
| 08 | `axl_node_disconnect_recovery` | mid-bid AXL drop → fallback bidder elected → reconnected worker is NOT double-accepted. |
| 09 | `compute_attestation_failure_reject` | mock `verifyAttestation()` returns false → buyer rejects → bond slashed → no payment, no reputation. |
| 10 | `concurrent_tasks` | 2 buyers, 2 tasks, 3 workers — no cross-contamination, AXL message taskIds unique per task, escrow accounting per-task is correct. |
| 11 | `live_ens_resolution` | hits the **deployed** ENS gateway under `ledger.eth` on Sepolia and verifies `who.worker-001.ledger.eth` flips to the live `ownerOf(1)` cross-chain, plus `mem.* ai.mem.cid` returns the real 0G CID. Pass-through when offline; set `LEDGER_LIVE_ENS=1` for strict mode. |

Total runtime: ≈4.9s for all 11 (one ~3s wait in scenario 7, ~1.2s for the live ENS gateway round-trips in scenario 11).

Live verification confirmed (scenario 11, run 2026-05-02):
- `ledger.eth` parent on Sepolia, resolver `0xcfF2f12F0600CDcf1cebed43efF0A2F9a98ef531`
- gateway: `https://9e04-124-123-105-119.ngrok-free.app/{sender}/{data}`
- `who.worker-001.ledger.eth` → `0x6641221B1cb66Dc9f890350058A7341eF0eD600b` (matches direct `ownerOf(1)` on Galileo)
- `mem.worker-001.ledger.eth` `ai.mem.cid` → `0g://0xd8fb3ad312ca5e9002f7bdd47d93839b9a6dcd83d396bb74a44a9f65344982c4`

## Live mode (opt-in)

The mock adapters faithfully simulate the on-chain state machines (same revert reasons in escrow, same sealed-key re-keying in iNFT, same exactly-once direct delivery in AXL). Live mode is wired through env-driven adapter swaps:

| Env | Effect |
|---|---|
| `GALILEO_RPC` (default `https://evmrpc-testnet.0g.ai`) | Used by preflight; live adapters dispatch through it. |
| `AXL_BRIDGE_URL` (default `http://127.0.0.1:9002`) | Used by `agents/axl-client`; preflight pings `/topology`. |
| `LEDGER_RESOLVER_URL` | Used by `LedgerCapabilityClient`; resolves `who.*` cross-chain. |
| `BASE_SEPOLIA_RPC_URL` | Used by the live ERC-8004 adapter for feedback writes. |
| `PRIVATE_KEY` | Required for any live signed write (postTask, mint, transfer, feedback). |

A future PR will land `LiveLedgerAdapters` with the same shape as `createMockAdapters()`. The scenario code does not change — only the fixture's adapter factory does.

## Reproduction commands

```bash
# typecheck
cd integration && npm run typecheck

# all 10 scenarios
npm run test:integration

# one scenario (any name)
npx tsx scenarios/02_inheritance_happy_path.ts
```

## Design notes (for future maintainers)

- **Mock-first.** Live testnet gas is constrained; mocks prove the SDK shape and the contract state machine without burning 0G. Live mode is a swap, not a rewrite.
- **Faithful reverts.** `MockEscrow` raises the same `InvalidStatus` / `NotBuyer` / `DeadlineActive` errors as the Solidity contract, so the SDK's error-handling code paths are exercised under mock just like under live.
- **Event surface is the contract with the frontend.** Anything you'd want to render on a settlement strip or auction list comes through `agent.on(listener)`. Don't reach into the adapters from UI code.
- **Correlation IDs.** Every flow gets one when the buyer calls `postTask`. The structured logger keys every entry by it. The frontend can render a per-task timeline by filtering log entries.
- **Retry policy.** `retry()` is exponential-backoff with `attempts=3, initialMs=200, factor=2, maxMs=5000`. Wrapped around every external call in the live adapters. Documented in `sdk/shared/retry.ts`.

## Performance baseline (mock mode, M2 MacBook Pro)

| Scenario | ms |
|---|---|
| 01 happy_path | 44 |
| 02 inheritance | 55 |
| 03 no_bids_cancel | 216 |
| 04 timeout_slash | 52 |
| 05 multi_bid | 12 |
| 06 reputation_gating | 18 |
| 07 cross_chain (3s wait) | 3076 |
| 08 axl_disconnect | 51 |
| 09 attestation_failure | 40 |
| 10 concurrent_tasks | 49 |
| **Total** | **3613** |

Round-trip post→settled excluding the 3s test wait: ≈40-60ms per task (mock). Live mode will be dominated by Galileo block time (~5-10s per tx) and AXL gossipsub propagation (~500-700ms per hop in proofs).
