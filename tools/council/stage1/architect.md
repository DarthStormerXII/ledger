# Stage 1 — Architect Review of Ledger

**Reviewer:** Architect (council seat 1)
**Date:** 2026-05-02
**Lens:** systems-design correctness, message-schema integrity, failure-mode coverage, build feasibility in the remaining window.

---

## 1. What's strong

Three architectural choices are right, and they're load-bearing for the demo.

**1.1 `ownerOf()` at payment time, not cached payout addresses.** Section 5 of `02_ARCHITECTURE.md` chooses "the smart contract escrow looks up the current iNFT owner at payment time using `ownerOf()`" over an in-memory listener inside the worker process. This is the only correct choice. The agent runtime cannot be authoritative for "where do earnings go" because (a) it can lag a Transfer event, (b) it might be offline at exactly the wrong moment, and (c) it can be impersonated. Putting the lookup in the settlement path makes the inheritance flow atomic by construction. Keep this. Defend it under judge questioning — it is the smartest line in the spec.

**1.2 Single-task scope ("Base Yield Scout"), single auction shape.** The PRD section 6 explicitly bans extra task types, mobile UI, multi-chain UX, and agent training. This is correct discipline for a 10-day window. A two-sided agent market is already three sponsor integrations and four contracts; adding task-type polymorphism would have killed the build by Day 5.

**1.3 KeeperHub as the *only* tx execution layer.** Section 2.5 routes every on-chain action — payment release, bond slash, reputation update, optional iNFT transfer — through KeeperHub MCP. This is what makes the gas-spike scene a *product moment* instead of a side feature. If KeeperHub were used for one tx and direct-RPC for another, the demo would be a lie. Centralizing on one execution layer is the correct architectural decision and it's also the right submission strategy.

---

## 2. What's weak / wrong / risky

Ranked by severity.

### 2.1 (CRITICAL) The cross-chain settlement is not atomic and the spec pretends it is

`02_ARCHITECTURE.md` §4 step T+12 reads:

> Buyer calls LedgerEscrow.releasePayment via KeeperHub
> -> KeeperHub atomically:
>    - transfers 4.5 USDC to worker
>    - returns 0.5 USDC bond to worker
>    - calls ReputationRegistry.recordCompletion(worker, 5_stars)

The escrow is on **0G Sepolia**. The USDC is on **Base Sepolia**. KeeperHub cannot make a transaction on chain A and a transaction on chain B atomic. Period. Even with a bundler, you have two separate L1/L2 transactions; either can succeed without the other. The word "atomically" in this spec is wrong and the architecture has not specified a reconciler.

Failure mode: payment lands on Base Sepolia, reputation update fails on 0G, your "47 jobs" demo metric desyncs from actual paid jobs. Or the inverse: reputation increments but USDC transfer reverts and the worker thinks it was paid.

**Fix:** either (a) keep escrow + USDC on the same chain (move USDC to 0G Sepolia, lose the Base Sepolia integration — small cost), or (b) explicitly model this as a 2-phase commit with idempotent retry on the trailing chain, and write the words "eventual consistency, ~10s window" in the spec. Stop calling it atomic.

### 2.2 (CRITICAL) ERC-8004 is not what the spec thinks it is

`02_ARCHITECTURE.md` §2.3 defines:

```
- recordCompletion(workerAddress, employerSig, taskId, rating)
- getReputation(workerAddress) returns (jobCount, avgRating, totalEarnings)
```

ERC-8004 is a *trust-attestation registry* — identity + validation + reputation pointers — not a star-rating database. A judge with EIP context will press on this in 30 seconds. You are using ERC-8004 as a brand sticker on a custom rating contract. That's fine if you say so honestly, but the brief calls it a "minimal ERC-8004 ReputationRegistry," which it is not.

**Fix:** rename to `LedgerReputationLedger` or `LedgerWorkScoreRegistry`; in the README and submission, say "we extend the ERC-8004 reputation pattern with a star-rating model on top." Don't claim conformance you don't have. The 0G Track B judges and any ERC-aware judge will distinguish.

### 2.3 (HIGH) The bid-acceptance protocol has no termination signal for losers

§3.3 has `BID_ACCEPTED` going from buyer to *the selected worker*. Nothing goes to the losing workers. They sit on an open bid commitment, with their bond unstaked but their decision logic blocked, until they time out — and the timeout isn't specified anywhere. In a 3-worker swarm this is tolerable. In any growth scenario it is a denial-of-service surface. Also: there's no `AUCTION_CLOSED` pubsub message, so a worker that boots after T+5 will see the task in `#ledger-jobs` and bid on a closed auction.

**Fix:** add `AUCTION_CLOSED { taskId, winner, closedAt }` to `#ledger-jobs` in §3, and add a hard `bidExpiresAt` enforcement in the buyer's accept logic. This is a 30-line change.

### 2.4 (HIGH) `slashBond` has no dispute path; the buyer is unilaterally trusted

§2.3 lists `slashBond(taskId) [callable by KeeperHub on timeout/failure]`. Who decides "failure"? The PRD §3.1 step 8 says payment lands when the buyer signs an approval (§3.4 implied — "buyer verifies result schema, signs approval"). So a malicious or buggy buyer can refuse to sign, the worker eats a slashed bond, and there's no recourse. There's also no schema validator on chain — "verifies result schema" is an off-chain promise.

This isn't a bug to fix in 10 days, but it *is* a question a judge will ask, and the answer "we punted on dispute mechanics" is acceptable only if you say it before they say it.

**Fix (architecture, not code):** add one paragraph to §2.3 titled "Trust model: buyer-trusted v1" stating the assumption. Add a future-work note that v2 introduces a 2-of-3 oracle or a `disputeWindow`. This is a one-paragraph honesty patch.

### 2.5 (MEDIUM) "x402-style for bid bonds" is a misapplication of x402

x402 is an HTTP 402 Payment Required middleware — it gates HTTP responses on payment proof. It is not a primitive for on-chain escrow. §2.3 has bid bonds as `acceptBid(...) payable [worker pays bond]`, which is an on-chain escrow flow. The "x402-style" framing in 00_MASTER_BRIEF and §4.2 is decorative; it's there for the buzzword, not because x402 actually moves bid bonds. There is no x402 sponsor in this hackathon, so the cost of the misnomer is just judge skepticism.

**Fix:** delete the x402 references unless x402 is actually facilitating the worker's HTTP-served bid endpoint. If you want x402 in the story, use it for the *result-fetch* step (worker serves the result blob behind a 402 paywall, buyer pays to unwrap it). That's the right shape. Otherwise, drop the term.

### 2.6 (MEDIUM) "Sealed inference" is asserted, not proven

`03_DEMO_SCRIPT.md` says "she runs on 0G Compute — sealed inference. Her reasoning is verifiable." Verifiable how? Where is the attestation surfaced in the UI? Where is the proof posted on chain? The architecture has 0G Compute as `POST /chat/completions` and that's it. If you cannot show a TEE attestation hash or a verification button, "sealed inference" is a claim with no artifact.

**Fix:** either (a) display the attestation hash in the worker's reasoning panel and link it to the 0G explorer, or (b) edit the voiceover to "she runs on 0G Compute" and drop "sealed / verifiable." A 4-second pause where you click a hash and it resolves is worth more than 30 seconds of words.

---

## 3. What's missing

### 3.1 A reconciler / state machine spec for in-flight jobs across iNFT transfer

The hero demo is "iNFT transfers mid-flight, next earnings flow to new owner." That's correct as a *between-jobs* claim. But what if transfer happens *during* T+7..T+12 (worker is mid-execution or mid-settlement)? The spec does not say. The escrow's `releasePayment` will look up `ownerOf()` at the moment of payment, which means if the transfer lands at T+11.5, the new owner gets the *current* job's payment, not just the next one. That's a feature, not a bug — but you have to *say* it, and you have to *test* it, and it has to match the demo claim ("**next** job's earnings").

**Add:** §5.1 "Mid-flight transfer semantics" — explicitly state that any payment released after `transferFrom` lands flows to the new owner, including the in-flight job. Decide deliberately whether the demo claim is "next job" or "next payment." These are not the same.

### 3.2 An on-chain `taskId` derivation rule

Tasks are referenced by `taskId` everywhere — in escrow, in AXL messages, in reputation. Nothing says how `taskId` is computed. If buyer A and buyer B both post tasks at the same instant with similar payloads, what stops a collision? Recommend `taskId = keccak256(buyer || nonce || timestamp)` and require the buyer to register the `taskId` on-chain via `postTask` *before* broadcasting on AXL — so AXL's `TASK_POSTED` carries a chain-anchored ID, not a self-asserted one. Otherwise, reputation entries can be forged off-chain.

### 3.3 An explicit memory-permissioning section

§2.6 says "Persistent agent memory in 0G Storage (KV + Log)." `08_DAY0_VERIFICATION.md` Q1 is exactly the question of *whether* 0G Storage permissioning is owner-bound. That's pre-build verification — fine — but the architecture spec itself never names the design. There should be a §2.6.1 with two paths:

- Path A (token-bound permissioning): rely on 0G's native pattern.
- Path B (manual re-keying on Transfer): a `M

[continued in next commit]
