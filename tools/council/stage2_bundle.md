# COUNCIL STAGE 1 — ANONYMIZED RESPONSES

*Four council members reviewed project Ledger from different lenses. Their Stage 1 outputs are bundled here, anonymized as Response A / B / C / D.*

---

## Response A

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

---

## Response B

# Ledger Stage 1 — Strategist Review

## 1. Bounty Placement Probability

### 0G Labs Track B: 55% today

This is the largest expected-value target because the project is structurally built around 0G: ERC-7857 iNFTs, 0G Storage memory, 0G Compute reasoning, and a swarm of workers. The thesis maps cleanly to "Autonomous Agents, Swarms & iNFT Innovations." The problem is not sponsor fit. The problem is proof density. Right now the plan says the right words, but the winning 0G submission needs one impossible-to-miss proof: the token transfer changes economic ownership while the same worker keeps memory and reputation.

Single change that lifts this by 20+ points: make the 0G section of the demo and README revolve around one verifiable table: `WorkerINFT tokenId`, `0G Storage memory CID`, `ownerBefore`, `ownerAfter`, `jobsBefore`, `jobsAfter`, `next payment recipient`. Put it in the README and show it in the demo. Judges should not have to infer that the iNFT carries intelligence. They should see it as an atomic before/after.

### Gensyn AXL: 45% today

The plan is credible but under-weaponized. AXL across three nodes is rare enough to place if the team shows it cleanly. The current demo gives AXL 60 seconds early, which is good, but it risks looking like decorative topology rather than real sponsor integration. Gensyn will reward actual P2P communication across independent machines, not an elegant animation.

Single change that lifts this by 20+ points: add a 10-second terminal/dashboard proof shot during 0:35-1:35 that shows three node IDs, three machine labels, and live message events matching the UI bids. Not a new feature. Just proof. The submission should say: "All bid messages in the demo are real AXL direct/pubsub messages; no HTTP broker; node logs included in `/docs/axl-proof.md`." Gensyn judges should be able to grep `AXL`, `Yggdrasil`, `pubsub`, `direct`, `node-buyer`, `node-worker-1`, `node-worker-2`.

### KeeperHub Main: 35% today

KeeperHub is the weakest main-bounty probability. The current plan says "all on-chain actions flow through KeeperHub" and includes a gas-spike moment, but the demo's emotional center is not KeeperHub. Worse, if the gas-spike reroute is simulated or flaky, KeeperHub may read as a wrapper mention rather than a decisive integration.

Single change that lifts this by 20+ points: turn the KeeperHub moment into a sponsor-grade receipt. At 1:35-2:00, the screen must show a KeeperHub request ID, chain, action, retry/reroute status, confirmation time, and tx hash. The README should include a `KeeperHub Transaction Evidence` section with 3-5 real tx hashes and the exact actions KeeperHub submitted. The main bounty is not won by "we used MCP"; it is won by "without KeeperHub this agent-economy transaction is fragile, and here is the adverse-condition proof."

### KeeperHub Feedback: 80% today

This is the highest probability cash. It is $500, almost certainly under-competed, and the docs already treat it seriously. The risk is leaving it until Day 10 and filling it with generic praise.

Single change that lifts this by 20+ points: start `FEEDBACK_KEEPERHUB.md` on Day 3 with dated entries and reproduction steps. Include one useful bug, one docs gap, one feature request grounded in the actual Ledger flow, and one concrete API ergonomics suggestion. Feedback bounty judges reward specificity more than polish.

## 2. The Single Demo Moment That Wins Finalist

The finalist-winning moment is not "agents bid for work." That is a category demo. The winning moment is:

**2:45-3:05 — Same worker, same reputation, new owner, next payment lands in the new wallet.**

Defend it brutally: this is the only moment that compresses the whole thesis into something a tired judge can repeat. "They built a marketplace where an AI worker can be sold, and the new owner immediately gets its future earnings." That is finalist-grade because it turns AI agents from software into productive assets. The 47 jobs, 4.7 rating, memory CID, iNFT transfer, and payment recipient switch all exist to make this one sentence true.

The current script serves it, but partially buries it. The script spends 0:00-2:00 establishing the labor market and KeeperHub, then uses a 15-second cinematic "Now look at her" bridge. The inheritance section is correctly placed, but the key payment-recipient switch needs more visual oxygen. Right now the line "Earnings now flow to teammate's wallet" is embedded inside another auction loop. That is too easy to miss.

Fix the edit without adding features: at 2:50, split the screen. Left: old owner wallet balance and owner address fading. Right: new owner wallet balance and owner address incrementing by `+4.50 USDC`. Center: same `WorkerINFT #12345`, same `47 jobs`, same `4.7`. The judge should not need the voiceover to understand the punchline.

## 3. Over-Delivery / Under-Delivery

### 0G

Under-delivering on proof of iNFT intelligence transfer. Over-delivering on broad 0G surface area if all of compute, storage, chain, ERC-8004, iNFTs, and memory are treated equally. 0G Track B wants iNFT innovation and autonomous swarms. The team should spend time proving the worker is a transferable intelligent asset, not perfecting generic compute claims.

Spend less time on "all reasoning runs on sealed inference" unless access is confirmed and easy. Spend more time on the transfer proof and README evidence.

### Gensyn

Under-delivering on AXL judge readability. Over-delivering on "residential NAT authenticity" if it burns more than a few hours. A local laptop behind NAT is a nice proof point, but three independent nodes across VMs still beats a broken NAT story. Gensyn wants AXL to matter. They need to see that bids and acceptances actually flow over AXL.

Spend less time making topology pretty. Spend more time making the packet/log proof undeniable.

### KeeperHub

Under-delivering on why KeeperHub is necessary. Over-delivering on "every on-chain action goes through KeeperHub" if that becomes engineering drag. Judges care about a meaningful transaction-execution problem solved by KeeperHub, not exhaustive plumbing.

Spend less time routing low-stakes actions through KeeperHub if it slows the build. Spend more time making one high-stakes flow, payment release under adverse gas, look real and documented.

## 4. Submission / README / Video Edits

The submission pack is directionally strong, but it currently reads like a polished plan. Judges need proof artifacts.

Highest-leverage README edit: add a top-level `Proof Matrix` before the architecture section:

| Claim | Evidence |
|---|---|
| Worker is an ERC-7857 iNFT | token address, tokenId, explorer link |
| Memory persists on 0G Storage | CID before/after, metadata link |
| AXL is real P2P | three node IDs, machine locations, log excerpt |
| KeeperHub submitted txs | request IDs, tx hashes, confirmation times |
| Ownership changes earnings | ownerBefore/ownerAfter, payment recipient tx |

Highest-leverage submission edit: replace generic "first secondary market" language with the demo sentence: "In the video, WorkerINFT #12345 completes 47 jobs under Owner A, transfers to Owner B, then earns the next payment into Owner B's wallet without changing agent identity." That is the hook.

Highest-leverage video edit: reduce cinematic time if needed to give the inheritance proof an extra 10-15 seconds. Higgsfield helps finalist polish, but sponsor judges pay for proofs.

## 5. Scope Cuts

Delete the optional sponsor sigil sequence. It costs generation and editing time and does not move any bounty probability. Use actual sponsor logos or simple text callouts.

Cut the full marketplace listing flow beyond the one demo sale. A generic marketplace UI is not rewarded. The only market interaction that matters is "List for Sale" then "Buy" for the inheritance moment.

Cut elaborate worker portrait generation from 10 portraits to 3-4. The demo needs three credible workers, not ten collectibles.

Cut residential NAT if it fails early. Do not spend a day debugging home networking. Use three cloud VMs and disclose the topology.

Cut x402 purity if it becomes build drag. Bid bonds can be x402-style in the story, but the prizes are 0G, Gensyn, and KeeperHub. Do not let non-sponsor payment plumbing threaten sponsor proof.

Cut the 4-minute-first mindset if 0G requires under 3 minutes. Make the tight 3-minute sponsor cut first; the 4-minute version can be secondary.

## 6. Document-Specific Changes

`00_MASTER_BRIEF.md`: add a "Sponsor Proofs Required" table with one concrete evidence artifact per sponsor. This forces every later doc to optimize for judging evidence.

`01_PRD.md`: in Sponsor Integration Requirements, add "README evidence required" bullets for each sponsor: tx hash, node log, token ID, CID, request ID.

`02_ARCHITECTURE.md`: mark non-sponsor complexities as "only if time": marketplace contract details, x402 facilitator purity, and residential NAT. This prevents engineering pride from stealing prize time.

`03_DEMO_SCRIPT.md`: move the final payment-recipient switch into a named beat at 2:50 with split-screen wallet balances. This is the finalist moment; timestamp it explicitly.

`04_HIGGSFIELD_PROMPTS.md`: label the optional sponsor sigil shot as "cut unless all sponsor proof footage is already recorded." It is nice-to-have, not strategic.

`05_CLAUDE_DESIGN_BRIEF.md`: add a required "Evidence Mode" overlay for demo screens: node IDs, token ID, CID, KeeperHub request ID, tx hash. Tasteful, small, but visible.

`06_AI_COUNCIL_PROMPTS.md`: add a sponsor-judge prompt that asks, "What proof would make you award this bounty?" The existing prompts are broad; add one that is explicitly prize-scoring.

`07_SUBMISSION_PACK.md`: add the Proof Matrix to the README template and contract-address section. Judges skim; this should be above fold.

`08_DAY0_VERIFICATION.md`: add a rule that Discord answers must be screenshotted or copied into `/docs/sponsor-confirmations.md`. Sponsor confirmation is submission evidence, not just team planning.

`09_BRAND_IDENTITY.md`: reduce brand-generated asset ambition from 10 worker portraits to "3 required, 10 if time." The brand should serve the demo, not become a parallel project.

`10_ACTION_NAVIGATOR.md`: move "record proof artifacts" into each day-end deliverable. Every day should produce evidence for submission, not just working code.

## 7. What We're Missing

The low-effort, high-payoff missing move is sponsor-specific proof documentation started on Day 0, not Day 10.

Create three tiny files immediately:

- `/docs/0g-proof.md`
- `/docs/axl-proof.md`
- `/docs/keeperhub-proof.md`

Each file should have the same structure: what we used, why it matters, evidence links, screenshots/logs, known limitations. This is not new scope. It is packaging. It changes judge behavior because sponsor reviewers can jump straight to their section and verify fit in under 60 seconds.

Second missing move: post sponsor-specific progress updates in Discord once, after there is real evidence. Not "look at our project." Instead: "We got three AXL nodes bidding over pubsub/direct messages; here are logs; any best-practice suggestions before final submission?" Sponsors remember teams that build in public and ask sharp implementation questions. This can move placement because the reviewer may already know the project before judging.

Third missing move: add one metric to the demo: "Post to paid in 38 seconds across 3 AXL nodes." Judges remember numbers. If the demo only says "works," it blends in. If it says "3 nodes, 47 prior jobs, 4.7 reputation, payment landed in 4s, ownership switched before next payment," it becomes legible under fatigue.

Here's what to fix: make sponsor proof visible, make the inheritance payment switch impossible to miss, cut anything that does not increase the odds of 0G, Gensyn, KeeperHub, or finalist placement.

---

## Response C

# Ledger Red-Team Review — Stage 1

The worst attack is simple: Ledger's central claim is "working, owned, intelligent agents," but the docs repeatedly leave themselves an escape hatch where the demo becomes a choreographed UI over pre-baked reputation, cached reasoning, possible local wrappers, and metadata pointers. A judge does not need deep malice to collapse this. They only need to ask whether the intelligence, network, settlement, and reputation are real at the same time.

## 1. Demo-day failure modes

1. **The iNFT inheritance does not actually transfer intelligence.** The project says the worker's memory, reputation, earnings, and learned strategy weights transfer with ownership in the inherit flow (01_PRD lines 144-153), then admits ERC-7857 may not transfer encrypted intelligence and proposes "store memory pointer in iNFT metadata" as the workaround (01_PRD lines 233-240). That mitigation is not sufficient. A pointer in token metadata is not an intelligence transfer. It is a location string. If storage permissions, decryption keys, and runtime authority do not follow the token, the hero moment is an ERC-721 transfer with a story pasted on top.

2. **AXL drops or fails to prove cross-machine P2P under pressure.** The plan depends on three nodes, including a local laptop behind residential NAT (02_ARCHITECTURE lines 366-378), and the verification doc calls this high-risk because failure loses authenticity (08_DAY0_VERIFICATION lines 2121-2124). The current mitigation is "use 3 cloud VMs" if residential NAT fails (01_PRD line 238; 10_ACTION_NAVIGATOR lines 3163-3164). That preserves a technical checkbox, but it weakens the claim that this is an agent network functioning in messy real-world conditions. Worse, the demo proof is currently a topology visualization, which can be animated without proving packet origin.

3. **KeeperHub reroute is a fake button.** The architecture says "Spike Gas" fires a fuzz-tx wallet to flood Base Sepolia and trigger reroute (02_ARCHITECTURE lines 536-542). The demo script then explicitly says that if the spike fails, the team should have a manual override that simulates the reroute UI (03_DEMO_SCRIPT lines 812-816). That is radioactive. If a judge sees a hidden "Spike Gas" button and asks for the Base Sepolia transaction sequence, the project either has real mempool evidence or it has theater.

4. **0G Compute is not available or too slow, so reasoning becomes replay.** The PRD says all reasoning runs on 0G Compute sealed inference (01_PRD lines 159-163), and the demo voiceover claims "Her reasoning is verifiable" (03_DEMO_SCRIPT lines 694-696). But the risk table admits a fallback to local inference or future-work claims (01_PRD line 240), and the recording plan allows "reasoning replay" with pre-recorded tokens (03_DEMO_SCRIPT lines 812-816). That mitigation is not sufficient for a sponsor track that cares about actual 0G integration. It converts the reasoning panel into animation unless the repo and video show live request IDs, responses, and storage writes.

5. **The 47-job reputation history collapses under provenance review.** The demo intends to show 47 jobs, 4.7 rating, and 12,847 USDC earned (03_DEMO_SCRIPT lines 732-739), while the pre-production note says to fire 47 fake completions signed by 47 fake employer agents (03_DEMO_SCRIPT lines 795-810). The mitigation is to make the chain show the numbers. That is not sufficient if the submission copy presents those jobs as earned history. A skeptical judge will ask who the employers were, whether tasks existed, whether payments settled, and why 47 fake employers are not just forged social proof.

## 2. Sponsor integration slideware attack surface

**0G Track B.** Claim: "Each worker agent is minted as an ERC-7857 iNFT on 0G Chain Sepolia" and carries persistent memory, reputation, and earnings history (07_SUBMISSION_PACK lines 1769-1804). Challenge: "Show the exact ERC-7857 encrypted intelligence handoff. Where is the encrypted intelligence transferred, who can decrypt it before and after transfer, and what on-chain event proves access changed?" Current docs only show metadata pointers and a fallback registry concept. That is not enough.

**Gensyn AXL.** Claim: "all inter-agent communication runs over Gensyn's AXL across three independent nodes ... with no central broker" (07_SUBMISSION_PACK lines 1814-1830). Challenge: "Kill the SSE proxy and one local process. Do the other two remote nodes still exchange direct messages? Show logs from separate machines with peer IDs, public IPs, and message hashes matching the UI." The architecture has an SSE proxy feeding the dashboard (02_ARCHITECTURE lines 396-405). That proxy is enough for a hostile reviewer to suspect the dashboard is centralizing the evidence even if AXL exists underneath.

**KeeperHub.** Claim: "Every on-chain action in Ledger flows through KeeperHub's MCP server" and the demo triggers a deliberate gas spike that reroutes via private mempool (07_SUBMISSION_PACK lines 1836-1853). Challenge: "Open the KeeperHub audit trail and the Base Sepolia explorer. Which transaction was priced out, which route did KeeperHub select, and what objective gas data proves the spike?" The docs do not define what "reroute" means on testnet, and the verification doc worries KeeperHub may not support the required testnets (08_DAY0_VERIFICATION lines 2154-2184).

## 3. The iNFT critique

The hostile reviewer's line is correct: the current fallback reads like ERC-721 plus metadata, not ERC-7857. The PRD says "Owner_B clicks Buy" and the purchase happens via "standard ERC-721 transferFrom" (01_PRD lines 144-149). The architecture describes WorkerINFT transfer as "standard ERC-721 with memory pointer carried in metadata" (02_ARCHITECTURE lines 346-351). That is not encrypted intelligence transfer. That is tokenURI continuity.

There is no defensible answer in the current docs that satisfies a strict ERC-7857 critique. The best current answer is rhetorical: reputation is on-chain, memory CID is in metadata, ownerOf controls future earnings. That may defend "transferable worker asset," but it does not defend "encrypted intelligence transfer." A defensible answer would need docs and code proving token-bound memory access, key rotation or permission rebinding on transfer, and a runtime that loads the transferred encrypted memory as the same agent under the new owner. The current docs identify that need in Day 0 verification (08_DAY0_VERIFICATION lines 2085-2117), but they do not prove it.

## 4. The AXL critique

The "three processes on the same machine pretending" attack is obvious. The demo's planned proof is a topology view and log feed (03_DEMO_SCRIPT lines 665-674; 05_CLAUDE_DESIGN_BRIEF lines 1235-1256). That is not convincing by itself. A UI can draw three nodes. A local SSE service can emit "us-west -> eu-central : BID" without a packet ever leaving localhost. The architecture does say two cloud VMs and a local laptop (02_ARCHITECTURE lines 366-372), and the master brief repeats that commitment (00_MASTER_BRIEF lines 47-52), but the demo evidence as written is visual, not forensic. The judge will ask for terminal logs, peer IDs, machine boundaries, and message correlation. The current docs do not require those to be shown.

## 5. The KeeperHub critique

The gas-spike demo has the highest fraud smell because the documents literally instruct the team to include a hidden Spike Gas button (02_ARCHITECTURE lines 536-542) and a manual override that simulates reroute UI if real conditions do not trigger it (03_DEMO_SCRIPT lines 812-816). The demo as written shows a gas chart spike and status text saying "Rerouting via private mempool" and "Confirmed in 4 seconds" (03_DEMO_SCRIPT lines 700-715). That proves nothing. The docs do not say how the gas chart is sourced, how fuzz transactions are linked to Base Sepolia, what KeeperHub response payload contains, or whether private mempool rerouting is even meaningful on the selected testnet. The verification doc explicitly asks if testnet gas-spike reroute can be demonstrated (08_DAY0_VERIFICATION lines 2154-2184), so the current proof is not convincing.

## 6. The 47-jobs / 4.7-rating critique

The team is currently papering over this unless the README is edited with brutal honesty. The demo checklist says the worker iNFT has "47 jobs of fake history pre-baked into reputation registry" (03_DEMO_SCRIPT lines 795-802). The pre-production note says to create those completions using 47 fake employer agents (03_DEMO_SCRIPT lines 808-810). The README template, however, says workers can be bought and inherited with their "full reputation, memory, and earnings history" (07_SUBMISSION_PACK lines 1954-1980) without disclosing that the hero worker's history is synthetic. A hostile reviewer will call it reputation laundering. If the chain contains 47 fake attestations, "on-chain" makes the theater permanent, not credible.

## 7. Document-specific weaknesses

**00_MASTER_BRIEF.md:** The "Core Thesis" claims nobody has wired ERC-8004, x402, and ERC-7857 into a working market and that Ledger does (lines 41-43). The bundle has not established that Ledger can actually implement ERC-7857 encrypted intelligence transfer or real x402.

**01_PRD.md:** The inherit flow claims memory, reputation, earnings, and strategy weights transfer with the iNFT (lines 144-153), but the risk table admits the workaround is just a metadata pointer (lines 233-240). That is a central contradiction.

**02_ARCHITECTURE.md:** WorkerINFT is described as "standard ERC-721 with memory pointer carried in metadata" (lines 346-351). That undercuts the ERC-7857/iNFT sponsor claim before implementation starts.

**03_DEMO_SCRIPT.md:** The gas-reroute fallback explicitly allows a simulated reroute UI (lines 812-816). That is exactly the kind of line a judge would screenshot if they saw the repo.

**04_HIGGSFIELD_PROMPTS.md:** The iNFT transformation shot includes atmospheric labels "47, 4.7, 12K" (lines 860-878). It visually amplifies numbers the docs say are fake.

**05_CLAUDE_DESIGN_BRIEF.md:** It says the AXL topology visualization is what proves "this is really P2P" (lines 1235-1256). A visualization does not prove P2P. It proves the frontend can draw moving dots.

**06_AI_COUNCIL_PROMPTS.md:** The hidden-vulnerabilities prompt already names the five assumptions that could be wrong, including AXL NAT, ERC-7857 memory transfer, KeeperHub chain support, 0G Compute access, and ownership-change mechanics (lines 1516-1547). The weakness is that these are not peripheral; they are the whole project.

**07_SUBMISSION_PACK.md:** The 0G sponsor writeup says the iNFT "genuinely carries embedded intelligence, not just a name" (lines 1798-1804), but the architecture only shows metadata pointers. This is overclaiming.

**08_DAY0_VERIFICATION.md:** It says do not start the build until Q1, Q3, and Q4 are confirmed (lines 2076-2085), but the action navigator simultaneously assigns code setup in hours 1-3 while answers are still pending (lines 2850-2868). That is process incoherence.

**09_BRAND_IDENTITY.md:** The trademark note admits Ledger SAS risk and says to document the acknowledgment in README (lines 2319-2336). The README template later does not include that acknowledgment.

**10_ACTION_NAVIGATOR.md:** The final note says "The plan is locked" and "The architecture is clean" (lines 3185-3195), while the same file contains emergency pivots for failed iNFT, KeeperHub, 0G Compute, and AXL foundations (lines 3150-3167). That confidence is unearned.

## 8. The 30-second judge brutality

The sentence that tanks the submission is: **"This is a beautiful demo of an ERC-721 metadata pointer and a scripted dashboard, not a working market for intelligent agents."**

The current documents cannot fully defend against that sentence. They can defend ambition, visual quality, and a plausible architecture. They cannot yet defend the exact claims that matter: ERC-7857 encrypted intelligence transfer, real AXL cross-node communication, real KeeperHub gas-spike rerouting, real 0G Compute inference, and non-theatrical reputation history. Until those are evidenced directly in the repo and video, the project is vulnerable to being judged as polished slideware.

---

## Response D

# DIRECTOR — Stage 1 Review

A demo director's pass on the Ledger demo plan. Filmic, second-marked, structurally ruthless. The brief asked for 1,500–2,500 words. This is that.

---

## 1. The hook (0:00–0:15)

**Verdict: it doesn't survive a 4-second test. Not yet.**

The plan opens with an aerial shot of "midnight earth from low orbit, bioluminescent data trails arcing between three glowing nodes." That is a beautiful 15-second shot in isolation. As a hook, it is **the most-generated piece of crypto-demo b-roll on the internet in 2026.** A finalist judge has seen this exact frame in roughly 40% of the agentic submissions they pre-screened this week. Glowing nodes. Pulsing trails. Camera descends. Cut.

The voiceover doesn't save it: "AI agents now have wallets. They have identity. They have reputation." That is three statements of fact about the *category*, not about *Ledger*. By the time the VO says "But they have no marketplace," we are 9 seconds in and we still don't know what we are watching.

**The fix:** invert the open. Lead with the punchline.

Hard cut, frame zero: a worker iNFT card with **47 jobs, 4.7 rating, $12,847 earned** filling the screen. A silent half-second beat. Then the card *transfers* — visually slides from one wallet avatar to another in the same frame. Earnings stream reverses direction. Hard cut to title: **LEDGER.** That is your 4 seconds. Now you have permission to do the cinematic globe shot — but you've already told the judge this is the demo with the on-chain inheritance. They'll watch the next 3:56.

Alternative hook, equally strong: open on the **physical handoff** itself. Two laptops, one camera, two hands, the literal moment the iNFT changes wallets. No CGI. The crypto demo that opens with hands and hardware is the one judges remember.

The current open is ornamental. Make it diagnostic.

## 2. The pacing curve

Mentally graph attention-density second by second. Where the curve dips, attention dips. Here's where it dips:

- **0:00–0:15** — flat. Cinematic but unspecific. Curve starts low.
- **0:15–0:35** — *climbs* on the three stat cards (21K agents, 100M tx, 0 marketplaces — the punchline of "0" is the strongest beat in the first minute), then **flatlines** the moment the title card replaces it. We just earned the cliffhanger and we cut away from it.
- **0:35–1:35** — **this is the sag.** A full minute of operator-clicks-form, bid-tickers, reasoning streams. Three new concepts (AXL, sealed inference, bid bonds) compete for the same VO breath. The VO is too dense, the visuals are too quiet.
- **1:35–2:00** — the KeeperHub gas-spike beat is the **first real surprise of the video.** Curve spikes hard. This is the second-best 25 seconds in the cut.
- **2:00–2:15** — Higgsfield iNFT crystal. Curve dips. It's pretty, but it's a "transition" right when we should be accelerating into the punchline.
- **2:15–3:15** — the Inheritance beat. Curve climbs steadily. Should peak. *Doesn't, because the cinematic at 2:00 broke the rhythm.*
- **3:15–3:35** — second Higgsfield (handoff). Curve dips again.
- **3:35–4:00** — sponsor logos, end card. Curve flatlines to zero. The VO ends on "live on testnet today" which is a true statement and an unsatisfying button.

**Net:** the video has two peaks (KeeperHub, Inheritance) separated by a forced cinematic dip in between. The end falls off a cliff. **You want one big peak at 2:30, sustained, not two small peaks broken by a 15-second crystal-rotation.**

## 3. The Inheritance moment (2:00–3:35)

This is supposed to be the punchline. Right now it is **buried under technical exposition.**

Read 2:15–3:15 aloud. Six VO lines:
1. "Forty-seven jobs completed. 4.7 average rating. Twelve thousand USDC earned. Encrypted memory of every job she's done — stored on 0G."
2. "She's an asset. ERC-7857. An iNFT."
3. "And I can sell her."
4. "My teammate across the table buys her."
5. "Watch what happens when I post another job."
6. "She bids again. Same agent. Same reputation. New owner. The earnings stream just changed hands. Mid-flight. On-chain."

That is **six narrative beats in 60 seconds, four of which are technical.** The judge needs to *feel* one thing: *this agent is property and you can hand it to someone and it keeps working for them.* Right now the script tells them six things and trusts them to assemble the feeling.

**What it should feel like:** the cold inevitability of a deed transfer at a notary's office. A signature. A small physical object changes hands. The new owner does nothing — they just exist now as the recipient of a working machine's earnings. **Stillness.** Not dramatic music. Not a cinematic cut. *Stillness.*

**Concrete edits:**
- Cut "ERC-7857. An iNFT." Cut it entirely. The judge knows. If they don't, the README tells them. Keeping the acronym in the VO at the emotional peak signals you're afraid the technical credit isn't being earned. Earn it elsewhere.
- Replace VO line 2 with **silence + a hard cut to her stats filling the frame in Fraunces.** Numbers. No words. 3 seconds. That is the iNFT moment. Not the crystal.
- "And I can sell her" → make this the **first** spoken line of the segment. Not the fourth. Lead with the verb that breaks the audience's mental model.
- The "across the table" buy: this *must* show two laptops in one shot. If you cut to the second laptop in a separate frame, you've lost the ceremony. Camera holds wide. We see one human reach for the other's screen. No cuts.
- The re-bid: at 3:00, when the same worker bids again under new ownership, the screen should split — left half shows worker bidding (unchanged), right half shows the *destination wallet* of the earnings updating from one address to another, **with the same animation as the bid arrival.** Visual rhyme. Earnings have the same status as a bid: a thing the agent does on someone's behalf.

The Inheritance is the only beat in the demo nobody else is shipping. Treat it like the only beat. Strip everything else around it.

## 4. The Higgsfield shots, individually

**Shot 1 (Cinematic Open, 15s) — cut to 5 seconds, or replace.**
The bioluminescent globe trails are a stock crypto-demo aesthetic at this point. If kept at full 15s, you spend 6% of your runtime on b-roll that says nothing the title card doesn't. **Trim to 5s and use it as a transition between the cold-open hook and the problem framing.** Or replace it entirely with the abstract hand-on-crystal motif from Shot 3 — preview the punchline visually in the open, then pay it off at 3:15. Cinematic foreshadowing > cinematic decoration.

**Shot 2 (iNFT Transformation, 15s) — cut. Replace with a UI moment.**
This is the most dispensable shot in the cut. A floating crystal with orbiting numbers does *less* emotional work than a static frame of the worker's profile page with her stats rendering in 96px Fraunces. The crystal is "what an iNFT looks like" rendered as kitsch. The actual iNFT is the data. **Cut Shot 2 entirely.** Replace 2:00–2:15 with a slow camera-push on her profile UI, numbers ticking up to their final values, total silence except UI sound. *That* is the Tron Legacy elegance you're aiming for, and it's also the actual product.

**Shot 3 (Inheritance Handoff, 20s) — keep, but trim to 12s and move it.**
This is the one Higgsfield shot that earns its runtime. The reversing particle stream is the most evocative single image in the plan. **But it shouldn't be at 3:15.** It should be the **last shot of the video**, at 3:48–4:00, replacing the sponsor-logo button. Hard cut from screen recording → handoff cinematic → end card. Currently the cinematic happens *before* the thesis VO, which means the visual peak and the verbal peak are separated. Fuse them.

**Optional Shot 4 (sponsor logos) — drop.**
Hand-animated text in After Effects beats Higgsfield-generated abstract symbols for sponsor reveals. Higgsfield will give you something glossy-but-generic. Three logos, three lines of clean kerning, three seconds each. Done.

## 5. The voiceover

Read every line aloud. The pattern emerges fast: **the VO over-narrates the visuals.**

Examples of over-writing (cut or trim):
- "Three machines. Three AI workers. Two on cloud servers, one on a laptop here in front of me." — The visual already shows a topology view with three nodes. Cut to: *"Three workers. Two cloud, one laptop."* You shaved 2 seconds.
- "They communicate over Gensyn's AXL — encrypted, peer-to-peer. No central server." — Three claims. Cut to: *"Peer-to-peer. No central server."* The "encrypted" you can show in the topology view as a key icon. Don't say it.
- "She runs on 0G Compute — sealed inference. Her reasoning is verifiable." — Cut to: *"Sealed inference on 0G. Verifiable."* Two seconds saved.
- "KeeperHub re-routes through a private mempool. Four seconds. Five USDC paid. Bond returned. Reputation incremented on chain." — Five facts in one breath. Cut to: *"Private mempool. Four seconds. Paid."* The reputation +1 is on screen, the bond return is on screen — let the UI carry them.

Examples of under-trusting visuals:
- "Watch — the network just spiked." — The chart on screen does this. Either say it or show it, not both. Show it.
- "Forty-seven jobs completed. 4.7 average rating. Twelve thousand USDC earned." — Numbers on screen. **Read them silently.** Hold three full seconds of UI, no VO. Audiences trust silence.

Examples of too sparse:
- The hook ("AI agents now have wallets. They have identity. They have reputation. But they have no marketplace.") is paradoxically *too* spare for the visual it's paired with. The cinematic globe is so generic that the VO is the only thing carrying meaning, and four short statements aren't enough lift.
- The end ("This is Ledger. The trustless agent economy. Live on testnet today.") needs **one more beat** — a number, a stat, a closing claim that gives the judge something to remember. *"Forty-seven jobs. One agent. Two owners. One ledger."* Or similar. Give them an artifact.

## 6. The cuts

Currently the script implies (correctly) hard cuts between Higgsfield and screen recording. Good. But within the screen recording sections, there's no cut rhythm specified. **Default Claude/scripted cut rhythm = far too few cuts.** A 60-second screen recording with only 2–3 visual changes feels like a tutorial. A 60-second screen recording with **8–10 cuts** feels like a demo. Specify the cuts in the script, beat by beat.

For 0:35–1:35, target rhythm:
- 0:35 (Hall view) → 0:42 (topology) → 0:50 (job form) → 0:58 (POST click, hard zoom) → 1:02 (Auction Room) → 1:12 (bid ticks, push-in) → 1:20 (winner highlight) → 1:25 (compute panel) → 1:35 (cut to KeeperHub).

That is **8 cuts in 60 seconds.** Currently the script implies 4. Double it.

Crossfades: only two acceptable in the entire video, both at the Higgsfield → screen-rec boundary. Everywhere else, hard cuts. **The 04_HIGGSFIELD_PROMPTS file already says this.** Make sure the editor honors it.

## 7. The hidden problem

The team is talking about the demo as a **video.** The judge experiences it as **a video embedded inside a submission page, with a play button, an autoplay-muted preview, and a thumbnail.**

Three problems nobody is solving:

1. **The thumbnail.** What is the YouTube/Vimeo thumbnail? Right now there is no plan for it. The thumbnail is the first frame the judge sees before they click play. If it's a frame from the cinematic globe, you've competed against every other crypto demo's thumbnail. *Make a custom thumbnail*: split-screen, two laptops, one wallet → another wallet, the worker stat card visible. Generated as a single composite still, not a frame from the video.

2. **The first 5 seconds of audio.** Most judges autoplay the video muted, see the first 3 seconds of visual, decide to unmute or not. **Your first frame and your first 3 seconds of motion need to work without audio.** Right now they don't — the cinematic is meaningful only with the VO over it. Re-engineer the open so a muted viewer still grasps "agent → transfers → keeps earning" in 3 seconds.

3. **The 90-second cutoff.** ETHGlobal judges have, in past cohorts, watched roughly the first 90 seconds before deciding whether to finish. The Inheritance moment lands at 2:30 — **a full minute past the watch-cliff.** This is the structural problem and nobody has named it. The fix is preview at 0:00 (the inverted hook above), tease at 1:30, full payoff at 2:30. Three contact points instead of one.

## 8. The 30-second elevator cut

Yes, easily. Here it is:

- **0:00–0:04** — Hard cut on worker stat card filling frame. *"Forty-seven jobs. 4.7 rating."* (VO)
- **0:04–0:08** — Card transfers visually to a second wallet avatar. Earnings particles reverse direction. *"Now she belongs to him."*
- **0:08–0:14** — Same worker bids on a fresh task. Earnings flow to new wallet. *"Same agent. New owner. Earnings change hands mid-flight."*
- **0:14–0:20** — KeeperHub gas-spike moment, condensed to 6 seconds. *"Settled in four seconds. On-chain."*
- **0:20–0:26** — Three sponsor logos with one-line callouts. *"0G. Gensyn. KeeperHub."*
- **0:26–0:30** — End card. *"Ledger. The trustless agent economy."*

That is the demo if a judge only watches 30 seconds. **It still wins.** Treat this as the canonical version and the 4-minute as the expanded cut. Build the long version backward from the 30-second cut, not forward from the cinematic open.

## 9. Document-specific edits

One concrete demo-craft edit for each of the 11 documents:

1. **00_MASTER_BRIEF** — The "Demo Concept" section says the hero moment is "around 2:30." Change to "preview at 0:04, tease at 1:30, payoff at 2:30." Make the structural decision visible at the top of the doc.

2. **01_PRD** — Acceptance Criteria should include: "30-second elevator cut exists as a separate deliverable." Currently it doesn't.

3. **02_TECH_ARCH** — The "Demo Triggers" section lists what UI events fire during the recording but doesn't list the **camera framing for each.** Add a column: which laptop, which crop, push-in or static.

4. **03_DEMO_SCRIPT** — Add cut-count per minute to the time-allocation table (currently only duration). Target 8/10/8/6 cuts across the four minutes. Add a row at the top: **First-Frame Spec** — exactly what the muted-autoplay viewer sees in the first 0.5 seconds.

5. **04_HIGGSFIELD_PROMPTS** — Drop Shot 2 entirely. Re-budget that 15s of Higgsfield credits into 3–4 alternate takes of Shot 3. Best Inheritance handoff > average iNFT crystal.

6. **05_CLAUDE_DESIGN_BRIEF** — Add a section: "Frame-worthy UI." Specifically design the 3 frames in the demo where a screen recording is held for 3+ seconds (worker profile, auction room, transfer modal). These three frames are the ones a judge will remember as still images.

7. **06_AI_COUNCIL_PROMPTS** — Add an 8th prompt: "Watch the demo with no audio. What do you understand?" The muted-autoplay test should be a council prompt.

8. **07_SUBMISSION_MATERIALS — README** — The current template opens with tagline, hero image, demo video link, **then "What it is."** Move "What it is" *above* the demo video. The first paragraph should be the elevator pitch in 60 words, then the video. A judge who doesn't want to play the video should still understand the project from the README's first 100 words. Currently they have to scroll past a video embed and a hero image to find a sentence.

9. **07_SUBMISSION_MATERIALS — ETHGlobal form answers** — Read the "describe your project" answer aloud at the same speed as the VO. If it takes more than 30 seconds, cut it. Submission text is read at VO cadence by judges, not at silent-reading speed.

10. **08_DAY0_VERIFICATION** — Add a Day 9 row: "Record a 5-second alternate cold-open (the inverted hook) regardless of whether the cinematic open is also kept." Lock the option to swap if test screenings don't land.

11. **09_BRAND_IDENTITY** — Section 9 (Sound) names Hans Zimmer / Jóhannsson references, which is correct but vague. Pin the *exact track*. Reference: Jóhann Jóhannsson, "The Beast" from Arrival OST, 0:00–0:30. That is the drone profile. Hand the editor a file, not a vibe.

(The 11th doc, **10_ACTION_NAVIGATOR**, is process-only — no demo-craft edit needed beyond making sure the demo script is locked by Day 8, not Day 9.)

---

Stage 1, signed.
