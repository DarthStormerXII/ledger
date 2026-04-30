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
- Path B (manual re-keying on Transfer): a `MemoryAccessRegistry` mapping `tokenId → encryptedKey`, with a hook on Transfer that the new owner calls.

Whichever 0G's answer to Q1 lands, the spec should freeze on one. Right now it floats.

---

## 4. What I'd cut

**Cut x402.** Already covered. Saves a half-day and removes a question the judges *will* ask.

**Cut the "Base Sepolia" leg unless USDC on Base is genuinely required.** Move USDC settlement to 0G Sepolia (or use 0G's native gas token), eliminate the cross-chain dance, and free yourself from the not-actually-atomic claim in §2.1. The only reason to keep Base Sepolia is "USDC is a recognizable currency for judges" — and you can replicate that with a wrapped/test USDC on 0G, labeled identically in the UI. This trade saves you the integration-test surface of two RPC endpoints, two faucets, two gas budgets, and the cross-chain reconciler.

**Cut the Optional Bonus Shot (sponsor sigil sequence) in `04_HIGGSFIELD_PROMPTS.md`.** The actual sponsor logos work fine and are required anyway. Higgsfield budget is finite; spend it on Shot 3 (Inheritance Handoff) which has to be perfect.

---

## 5. Document-specific changes

### 00_MASTER_BRIEF.md
Replace "x402-style for bid bonds and small fees" with "on-chain escrow for bid bonds." Drop the x402 line entirely or move it to a "Considered, deferred" footer.

### 01_PRD.md
Add §3.1.5 "Auction termination": one paragraph defining `bidExpiresAt`, the `AUCTION_CLOSED` broadcast, and what losing workers should do (free their bond commitment locally; do not re-bid until next `TASK_POSTED`).

### 02_ARCHITECTURE.md
Strike the word "atomically" from §4 step T+12. Add §4.1 "Settlement consistency model" that says: USDC settlement on Base Sepolia and reputation update on 0G Sepolia execute as two transactions; KeeperHub guarantees both fire; the dashboard surfaces a `pending_reconcile` state if one lags. Also rename `LedgerReputationRegistry.sol` to `LedgerWorkScoreRegistry.sol` and adjust the ERC-8004 framing per §2.2 above.

### 03_DEMO_SCRIPT.md
Replace "her reasoning is verifiable" with "her reasoning runs on 0G Compute" *unless* you have an attestation hash to flash. The line at 1:47 ("She pays a bid bond — half a USDC, locked in escrow") is good — keep. At the inheritance moment (2:30+), insert one specific sentence: "The escrow checks the current owner at payment time — that's how the inheritance is enforced." This pre-empts the obvious judge question.

### 04_HIGGSFIELD_PROMPTS.md
Keep Shots 1, 2, 3 as-is. **Cut the Optional Bonus Shot.** Worker iNFT artwork prompt: keep but lock seed values in advance — you cannot afford regeneration drift on Day 8.

### 05_CLAUDE_DESIGN_BRIEF.md
Add a Screen 5 prompt: "Settlement Status Strip" — a thin component that visualizes the cross-chain settlement (USDC paid on Base ✓ / Reputation updated on 0G ✓ / Bond returned ✓). This is the visual that proves §4.1 works under judge questioning. 30 minutes of design, 200 lines of code.

### 06_AI_COUNCIL_PROMPTS.md
Prompt 4 (Inheritance Mechanics Check) — add a sub-question: "What happens if the iNFT transfers between T+7 (worker accepted) and T+12 (payment released)? Does the new owner receive the in-flight payment or only the next one? Pick one answer and state it."

### 07_SUBMISSION_PACK.md
The "How it's made" copy says "we solved this by having the escrow contract look up the current iNFT owner at payment time via `ownerOf()`, rather than caching the owner address — making transfers atomic without race conditions." Keep this — it's the strongest sentence in the whole submission. **But** also delete or rewrite the cross-chain "atomically" claim if it migrates here. Add a sentence to the KeeperHub section explicitly naming the gas-spike test as the demo's KeeperHub moment, with a timestamp.

### 08_DAY0_VERIFICATION.md
Q1 has been load-bearing for 8 days now. If by today (May 2, Day 8) it has not been answered with confirmation, the inheritance demo claim has *less* on-chain backing than it should. Add a "Status" line under each Q (✅/❓/❌) and force a fill-in pass. If Q1 status is still ❓, the spec for §2.6.1 (memory permissioning) defaults to Path B (manual re-keying registry) — write that decision in.

### 09_BRAND_IDENTITY.md
Keep as-is on substance. One concrete edit: §2 "Risk note" about Ledger SAS trademark — fine for hackathon, but **delete from README**. Mentioning the trademark issue in a hackathon submission signals naivete *and* invites scrutiny that adds nothing. Keep the acknowledgment internal.

### 10_ACTION_NAVIGATOR.md
Day 9 / Day 10 are both May 3. The plan compresses recording, editing, AI Council prompt 7, final cut, upload, README polish, FEEDBACK polish, and submission into one day. Either explicitly mark Day 9 = May 3 morning and Day 10 = May 3 evening in the table headers (you did, but the dependencies aren't ordered hard enough), or pull recording forward to May 2. See §6.

---

## 6. Schedule reality check

The Day 0–10 calendar in `01_PRD.md` is internally inconsistent and, as of today (May 2, which is Day 8 in the PRD), has roughly one working day left.

Specific concerns:

- **Day 9 and Day 10 are the same calendar date (May 3).** The Action Navigator splits "morning = recording" and "evening = submission," but in the PRD §7 they are listed as two separate days. This is not a 10-day plan; it's a 9-day plan with the last day double-counted.
- **Day 8 (today) is "polish + gas spike."** The fuzz-tx wallet has to be tuned, the gas-spike has to be reproducibly triggered, and Higgsfield Shots 2 and 3 have to be generated. Higgsfield generations alone routinely eat 4–8 hours per shot when iterating to acceptable quality. Generating both today, with KeeperHub testing in parallel, is tight.
- **Day 9 (May 3 morning) is 6 hours of recording + editing for a 4-minute video.** Realistic if the demo runs cleanly on take 1, but the PRD's own §10 in `03_DEMO_SCRIPT.md` says "commit to at least 3 full passes." Three takes plus retakes plus voiceover sync plus Higgsfield insert plus color grade plus upload plus README finalize plus submission form — in about 10 elapsed clock-hours.
- **Day 10 (May 3 evening) "submission day" is a fiction.** It's the same day. There is no buffer.

What slips:

1. **Higgsfield Shot 3 (inheritance handoff)** — the most cinematically important shot, last to be generated, easiest to slip. If it's not landing by 18:00 May 2, ship Shot 3 as a still-image cross-fade with particle overlay in Resolve and stop iterating.
2. **AI Council Prompt 7 (final demo polish, scheduled Day 9 14:00)** — too late to act on. Move it to Day 8 evening so Day 9's edits can incorporate the feedback.
3. **FEEDBACK_KEEPERHUB.md final polish** — this is a $250 bounty deliverable, not a footnote. Should already be 80% complete. If it's not, prioritize 1 hour today to lock it.
4. **Pre-baked reputation history (47 jobs, 47 fake employers)** — listed Day 6, often slips. Verify it's done before recording. Without it, the worker profile shows "0 jobs" and the demo punchline lands on empty stats.

Concrete recommendation:

- **Move recording to today, May 2 evening.** Don't wait for May 3 morning. Accept a less polished take so you have a buffer day to recut.
- **Lock Higgsfield Shot 3 by EOD May 2.** If it's not converging, fall back to the still-image plan above.
- **Run AI Council Prompt 7 tonight, not Day 9 14:00.** Otherwise its findings are unactionable.
- **Submit by May 3 noon, not May 3 evening.** ETHGlobal submission forms have historically had race conditions on the deadline minute. Submit early, then iterate the README until cutoff.

The build can land. The plan as written cannot.

---

*End Stage 1.*
