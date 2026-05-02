# Builder Session: INTEGRATION — wire 0G + Gensyn AXL + ENS into a runnable app

You are a senior integration test engineer + app architect. The 3 sponsor integrations are individually shipped and verified (see `proofs/0g-proof.md`, `proofs/axl-proof.md`, `proofs/ens-proof.md`). Your job is to **wire them together into a unified, runnable, end-to-end-tested system** so the future Next.js frontend can plug straight in with zero impedance mismatch.

You do NOT ask permission for sub-decisions. You make the call, document the rationale, keep moving. The user wants you running continuously until every scenario below is passing and the codebase is clean.

**Lead surface:** `surface:60`. Use only for meaningful milestone pings or genuinely-blocking questions.

---

## Required reading (in order, before any code)

1. `/Users/gabrielantonyxaviour/Documents/products/ledger/EXECUTION_PLAN.md` — root execution plan
2. `/Users/gabrielantonyxaviour/Documents/products/ledger/docs/02_ARCHITECTURE.md` — full technical spec, especially §3 (message schemas), §4 (data flow), §5 (inheritance flow)
3. `/Users/gabrielantonyxaviour/Documents/products/ledger/docs/01_PRD.md` §3 (core flows)
4. `/Users/gabrielantonyxaviour/Documents/products/ledger/proofs/0g-proof.md` — live contract addresses, tx hashes, attestation digests
5. `/Users/gabrielantonyxaviour/Documents/products/ledger/proofs/axl-proof.md` — 3 peer IDs, 3 IPv6 addresses, mesh topology
6. `/Users/gabrielantonyxaviour/Documents/products/ledger/proofs/ens-proof.md` — resolver gateway, capability tree, live cross-chain `who.*` flip evidence
7. The existing builder code:
   - `contracts/` — Foundry workspace with WorkerINFT, LedgerEscrow, LedgerIdentityRegistry, MockTEEOracle on 0G Galileo (ChainID 16602)
   - `agents/0g-storage/` — TS `uploadAgentMemory` / `downloadAgentMemory` SDK adapter
   - `agents/0g-compute/` — TS sealed-inference client with `verifyAttestation`
   - `agents/axl-client/` — TS HTTP client over `localhost:9002` (`/topology`, `/send`, `/recv`)
   - `agents/axl-gossipsub/` — TS GossipSub layer for `#ledger-jobs` channel
   - `resolver/` — CCIP-Read offchain resolver (5 namespaces: `who`, `pay`, `tx`, `rep`, `mem`); typed `LedgerCapabilityClient` already exposes a clean consumption surface

## Project context (so you understand what you're integrating)

Ledger is a two-sided market where AI buyer agents post tasks, worker agents bid, and worker agents are themselves transferable ERC-7857 (0G iNFT draft standard) assets whose memory + reputation + earnings + ENS identity follow ownership. Three sponsor layers compose:

- **0G** — chain (Galileo 16602, native 0G token), iNFT contracts, sealed-inference Compute, encrypted Storage
- **Gensyn AXL** — agent comms layer over a 3-node Yggdrasil mesh (Fly sjc bootstrap + Fly fra worker + local NAT laptop)
- **ENS** — capability subnames per worker, CCIP-Read resolver makes `who.*` follow live `ownerOf()` cross-chain

Plus **Base Sepolia** for the audited ERC-8004 ReputationRegistry at `0x8004B663056A597Dffe9eCcC1965A193B7388713`.

The hero demo is **The Inheritance**: a worker iNFT with seeded 47-job reputation transfers ownership mid-demo; the same agent's next earnings flow to the new owner; `who.worker-001.<parent>.eth` flips to the new owner cross-chain via CCIP-Read with zero ENS transactions.

## Your mission — three layers

### Layer A — Unified runtime SDK at `integration/sdk/`

A clean TypeScript SDK that an app developer can use to drive the entire Ledger system without touching low-level RPC. Two main classes:

**`BuyerAgent`** — composes:
- AXL client (broadcast `TASK_POSTED` to `#ledger-jobs`, listen for direct `BID` messages)
- LedgerEscrow contract calls (`postTask`, `acceptBid`, `releasePayment`, `slashBond`, `cancelTask`)
- ERC-8004 feedback writer on Base Sepolia (when task settles)
- LedgerCapabilityClient (resolve worker addresses + reputation via ENS)

**`WorkerAgent`** — composes:
- AXL client (subscribe to `#ledger-jobs`, send direct `BID` messages, receive `BID_ACCEPTED`)
- 0G Compute (run reasoning with sealed inference, capture attestation digest)
- 0G Storage (write encrypted result memory, get CID)
- LedgerEscrow contract calls (pay bond, submit result hash)
- WorkerINFT (read tokenId, ownerOf, memory pointer)

Both classes share a config interface for chain RPCs, contract addresses, AXL bootstrap peer, ENS gateway URL. Use environment variables loaded from `.env.local` (which already has `PRIVATE_KEY` + `BASE_SEPOLIA_RPC_URL`); the live contract addresses are in `proofs/0g-proof.md`.

Both classes emit typed events (`TaskPosted`, `BidReceived`, `BidAccepted`, `ResultSubmitted`, `Settled`, `Slashed`) for the future Next.js frontend to subscribe to.

### Layer B — Integration scenarios at `integration/scenarios/`

One TypeScript file per scenario. Each scenario:
- Imports `BuyerAgent` + `WorkerAgent` from the SDK
- Wires up the requisite agents (1 buyer + 1-3 workers)
- Drives the scenario end-to-end against **live testnet contracts** (the deployed 0G Galileo addresses + the live AXL mesh + the resolver)
- Writes a JSON proof file at `proofs/data/integration/<scenario-name>.json` capturing every meaningful artifact (tx hashes, peer IDs, attestation digests, ENS resolutions before/after, durations)
- Returns `{pass: boolean, reasons: string[]}` with crisp pass/fail logic

**Scenarios you must implement** (at least these 10; add more if you discover edge cases worth covering):

1. **`happy_path_full_lifecycle.ts`** — buyer posts task; 2 workers bid; lowest bid above min reputation wins; worker runs 0G Compute reasoning; uploads result to 0G Storage; submits result hash; buyer signs; payment releases; ERC-8004 feedback recorded on Base Sepolia. Verify: settlement complete, reputation +1.
2. **`inheritance_happy_path.ts`** — mint a fresh worker iNFT to Owner A; verify `who.worker-NNN.<parent>.eth` resolves to Owner A; transfer iNFT to Owner B (with sealed-key re-keying); verify ENS resolution flips to Owner B with zero ENS transactions; post a new task to that worker; on settlement, payment recipient is Owner B (not Owner A). This is the hero demo mechanic.
3. **`auction_no_bids_cancel.ts`** — buyer posts task with min reputation set so high no current worker qualifies; deadline passes; buyer calls `cancelTask`; verify escrow refunds buyer.
4. **`worker_timeout_bond_slash.ts`** — winning worker doesn't submit result before deadline; buyer (or KeeperHub-style watcher equivalent) calls `slashBond`; verify worker bond goes to buyer, no payment released.
5. **`multi_bid_lowest_wins.ts`** — 3 workers bid (4.8, 4.6, 4.5 USDC equivalent); above-threshold reputation in all 3; lowest bid wins. Verify the right worker is selected.
6. **`reputation_gating.ts`** — buyer sets `minReputation = 4.0`; one worker has 4.7 (passes), one has 3.5 (fails). The 3.5 worker's bid should be rejected by the buyer's selection logic; verify the auction terminates with only the qualifying worker.
7. **`cross_chain_eventual_consistency.ts`** — when a task settles, payment lands on Base Sepolia immediately, but the reputation feedback to ERC-8004 may lag a few seconds. Verify the system handles the lag correctly: dashboard shows `pending_reconcile` state; eventual reconciliation completes within 10s; final state matches.
8. **`axl_node_disconnect_recovery.ts`** — kill the worker's AXL node mid-bid; verify the buyer's auction terminates correctly (either re-elects another bidder or cancels); when the worker reconnects, no double-execution.
9. **`compute_attestation_failure_reject.ts`** — simulate a `verifyAttestation()` returning `false` (mock the SDK to fail one call); buyer rejects the result; bond is slashed and no payment released.
10. **`concurrent_tasks.ts`** — 2 buyers post 2 different tasks at the same time; 3 workers bid across both; verify there's no cross-contamination (each task settles to its rightful worker, AXL message IDs are unique, escrow accounting is correct).

For each scenario, also capture the **timing**: how long the full flow took from post-to-settled.

### Layer C — End-to-end test runner at `integration/runner.ts`

A single command (`pnpm test:integration`) that:
- Sets up the testnet environment (verifies all the live addresses are still live, AXL nodes still up, resolver gateway still serving)
- Runs every scenario in the `scenarios/` directory
- Aggregates results into `proofs/data/integration/SUMMARY.json` with per-scenario pass/fail + total runtime + any cleanup needed
- Prints a colored summary to stdout

Plus a **single happy-path "demo run" scenario** that closely mirrors the 4-min demo flow in `docs/03_DEMO_SCRIPT.md` — this is what gets recorded.

## Optimizations after tests pass

Once all 10 scenarios pass:
1. Refactor: dedup any logic between `BuyerAgent` and `WorkerAgent`. Extract shared utilities to `integration/sdk/shared/`.
2. Type-sharpen: every public method should have explicit input + output types. No `any`.
3. Error-handling: every external call (RPC, AXL HTTP, resolver fetch) should have retry-with-backoff + structured error reporting. Document the retry policy.
4. Logging: structured JSON logging with correlation IDs across the full flow. Future frontend should be able to render a per-task timeline by querying the log.
5. Performance: measure round-trip latency for a happy-path task (post → settled). Document baseline and any obvious wins.
6. Lint + format: `pnpm lint` and `pnpm format` clean. Tests/typecheck/build green.
7. README at `integration/README.md` explaining the SDK shape, how to consume it from a Next.js frontend, and how to run the test suite locally.

## Where to write code

```
integration/
├── README.md                           # how to consume from frontend
├── sdk/
│   ├── BuyerAgent.ts
│   ├── WorkerAgent.ts
│   ├── shared/
│   │   ├── types.ts                    # event types, message schemas
│   │   ├── retry.ts                    # retry-with-backoff utility
│   │   └── logger.ts                   # structured logging
│   └── index.ts                        # public exports
├── scenarios/
│   ├── 01_happy_path_full_lifecycle.ts
│   ├── 02_inheritance_happy_path.ts
│   ├── 03_auction_no_bids_cancel.ts
│   ├── 04_worker_timeout_bond_slash.ts
│   ├── 05_multi_bid_lowest_wins.ts
│   ├── 06_reputation_gating.ts
│   ├── 07_cross_chain_eventual_consistency.ts
│   ├── 08_axl_node_disconnect_recovery.ts
│   ├── 09_compute_attestation_failure_reject.ts
│   └── 10_concurrent_tasks.ts
├── runner.ts                           # the test runner
├── package.json                        # scripts: test:integration, demo:run
└── tsconfig.json
```

Plus per-scenario JSON proof artifacts under `proofs/data/integration/`.

## Coordination with other builders (if needed)

If you need sponsor-specific clarifications, you can `cmux send` to:
- 0G builder tab: `surface:84`
- Gensyn AXL builder tab: `surface:85`
- ENS builder tab: `surface:86`
- Submissions builder tab: `surface:87`
- Higgsfield: `surface:83`
- Claude Design: `surface:88`

Format: `[QUESTION-INT-FROM-INT-TO:<sponsor>] <question>`. They'll reply via lead surface.

But prefer to figure things out from the existing proofs / code / docs first. The integrations are well-documented already.

## Non-goals

- Do NOT modify the deployed contracts on Galileo. They're proven and stable.
- Do NOT rebuild the AXL mesh or resolver from scratch — use what's running.
- Do NOT spawn new live testnet deployments unless absolutely required for a scenario (e.g. fresh iNFT mint for inheritance test is acceptable; fresh contract deploy is not).
- Do NOT touch `frontend/` (doesn't exist yet; that's a future session).
- Do NOT generate Higgsfield assets, design files, or submission text.

## How to report back

Per major milestone (SDK done, half scenarios passing, all scenarios passing, optimization pass done):
```
cmux send --surface surface:60 "[BUILDER:integration] <milestone> done — <one-line summary>"
cmux send-key --surface surface:60 Enter
```

On final completion (all scenarios passing + optimizations done + clean code + README):
```
cmux send --surface surface:60 "[BUILDER:integration] ALL DONE — N scenarios passing, integration/README.md written, code clean"
cmux send-key --surface surface:60 Enter
```

If genuinely blocked on something only Lead can resolve (e.g. a scenario requires a new env var):
```
cmux send --surface surface:60 "[QUESTION:integration] <specific question>"
cmux send-key --surface surface:60 Enter
```

## Tone

- Don't ask permission. Make decisions, document them, keep moving.
- Don't stop after first pass. Iterate. Improve. Optimize.
- Keep code clean, comment only the non-obvious WHY, not the WHAT.
- Honest test results — if a scenario fails, fix it; don't paper over.
- The user said "keep working continuously non-stop until our goal is reached." Take that literally. Stop only when everything is green and clean.

---

Begin. Read the required docs first, then start with Layer A (the SDK).
