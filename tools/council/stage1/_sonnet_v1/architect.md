# Stage 1 — ARCHITECT Review
**Ledger | ETHGlobal Open Agents 2026 | 2026-05-02**

---

## 1. What's Strong

**The ownerOf() inheritance pattern (02_ARCHITECTURE.md §5)**

Having the escrow contract call `WorkerINFT.ownerOf(tokenId)` at payment time — rather than caching the owner address when the job is posted — is the correct design. It eliminates the race condition where a transfer happens mid-flight and the old owner gets paid. It's atomic from the contract's perspective, requires no off-chain coordination, and is one function call. The architecture document calls this out explicitly ("preferred — simpler, more correct"). This is the right call and it's the engineering decision that makes the inheritance demo actually hold up in Q&A.

**The message schema design (02_ARCHITECTURE.md §3)**

EIP-712 typed signatures on all AXL messages, explicit version fields, bid expiry timestamps, direct-message channels for private flows vs. pubsub for broadcast — this is production-grade. Most hackathon architectures have agents sending raw JSON with no authentication. Signed messages mean the demo is honest: you can actually show a judge a bid message and prove the worker signed it. The `reputationProof` struct in the BID schema (§3.2) also matters — it makes reputation a verifiable reference, not a self-report. This schema work is worth keeping exactly as written.

**Scope discipline**

One task type. Three sponsors. Hard non-goals list. This is the right move for a 10-day build. The "Base Yield Scout" as the single task means agent reasoning can be pre-tuned and cached. The three-sponsor focus means every integration decision points at something that pays. The non-goals list (ENS, Uniswap, multiple task types, agent training UI) reads like someone who has shipped hackathon projects before and knows what scope creep looks like. Keep enforcing it.

---

## 2. What's Weak / Wrong / Risky

### Problem 1 — CRITICAL: Cross-chain escrow pays USDC on a chain where the escrow contract does not exist

**File:** `02_ARCHITECTURE.md` §2.3, §2.6, §4 (data flow diagram)

The architecture places `LedgerEscrow.sol` on **0G Sepolia**. The TASK_POSTED message schema (§3.1) specifies payment as `"chain": "base-sepolia"`. The data flow (§4) says at T+1: "Buyer calls LedgerEscrow.postTask via KeeperHub → escrow holds 5 USDC payment." But USDC doesn't exist natively on 0G Sepolia. At T+12: "KeeperHub atomically transfers 4.5 USDC to worker" — from an escrow contract on 0G Sepolia, paying USDC on Base Sepolia.

This is not an edge case. This is the payment flow. There is no bridge specified. There is no CCIP call. There is no cross-chain message in the architecture diagram. The escrow cannot hold Base Sepolia USDC unless the contract is on Base Sepolia or there is an explicit cross-chain settlement mechanism.

**Failure mode:** Either the escrow is deployed to the wrong chain (holds fake test tokens, not actual USDC), or the payment never arrives on Base Sepolia, or the demo is lying when it shows "5 USDC paid." Judges will check the explorer.

**Required fix:** Make a decision now. Option A: Move LedgerEscrow to Base Sepolia. iNFTs and reputation registries stay on 0G Sepolia. KeeperHub submits payment txs on Base Sepolia and reputation updates on 0G Sepolia as two separate (non-atomic) calls. This is the simpler fix. Option B: Keep escrow on 0G Sepolia, use a bridge/CCIP to move USDC, add a week of build surface you don't have. Option A is the only viable choice at Day 8.

### Problem 2 — HIGH: The "atomic" cross-chain settlement claim is false

**File:** `07_SUBMISSION_PACK.md` "how it's made" section; `02_ARCHITECTURE.md` §4 T+12; `03_DEMO_SCRIPT.md` (KeeperHub moment)

The submission writeup says "KeeperHub atomically: pays worker, refunds bond, increments reputation on chain." The demo script says "Five USDC paid. Bond returned. Reputation incremented on chain" — presented as one event.

Atomicity across two blockchains is impossible without a cross-chain coordination protocol. KeeperHub submits transactions sequentially. If the USDC payment on Base Sepolia confirms and the reputation update on 0G Sepolia fails (wrong gas price, nonce collision, node timeout), you have a worker who got paid but has no reputation increment. In the other direction: if reputation increments but payment fails, you have a worker whose stats go up but who doesn't get paid.

**Failure mode:** A judge asks "what happens if the reputation update fails after payment?" The honest answer is "we retry" — but the architecture has no retry specification for the second leg of a two-chain operation. In Q&A this becomes a credibility problem.

**Required fix:** Remove the word "atomically" from every document where it describes cross-chain operations. Replace with "sequentially submits three transactions." Document in FEEDBACK_KEEPERHUB.md that multi-chain atomic batching is a missing feature you wanted. This turns a false claim into an honest one and earns you the KeeperHub feedback bounty simultaneously.

### Problem 3 — HIGH: "Verifiable reasoning" is a false claim with no mechanism

**File:** `03_DEMO_SCRIPT.md` (1:00–1:35 segment); `02_ARCHITECTURE.md` §2.6; `07_SUBMISSION_PACK.md` 0G writeup

The demo voiceover says: "She runs on 0G Compute — sealed inference. Her reasoning is verifiable." The 0G submission writeup says "ensuring outputs are verifiable and tamper-proof."

Sealed inference means the compute provider cannot see plaintext inputs/outputs. It does not mean a third party can verify that a specific output came from a specific model on 0G's infrastructure. The RESULT message (§3.4) contains a `resultHash` — this is a hash of what the worker *claims* to have produced. There is no on-chain attestation from 0G Compute that ties that hash to a specific inference run. The buyer verifying "result schema" (T+11) is checking that the JSON has the right fields — not that the inference actually ran.

**Failure mode:** A judge who knows how sealed inference actually works asks "where's the attestation?" The answer is "the hash is in the message" — which proves nothing except that the worker computed a hash.

**Required fix:** Drop "verifiable" from the demo voiceover. Change to: "Her reasoning runs on 0G's sealed inference network — the compute provider can't see her work." That's true and still impressive. In the 0G submission writeup, remove "verifiable and tamper-proof" unless you can point to an actual attestation mechanism in the code.

### Problem 4 — MEDIUM: AXL Python client is a Day 1 deliverable with zero documentation

**File:** `02_ARCHITECTURE.md` §2.4 engineering decisions; `07_SUBMISSION_PACK.md` "notable challenges"; `10_ACTION_NAVIGATOR.md` Day 1 tasks

The submission writeup acknowledges: "AXL was released nine days before the hackathon began... no mature SDK, no deployed examples, 6 GitHub stars." Friend 3 is assigned to "implement basic AXL HTTP wrapper" on Day 1. This wrapper is the dependency for every agent communication flow: task posting, bidding, acceptance, result submission.

If this takes 3 days instead of 0.5 days — which is plausible given the documentation state — Days 2, 3, and 4 slip proportionally. The entire auction flow, KeeperHub integration, and 0G Compute reasoning loop all depend on AXL working.

**Failure mode:** AXL wrapper incomplete on Day 2 means bidding protocol can't be tested. Bidding protocol not tested means the demo's central sequence (post → bid → accept) is being assembled on Day 7-8 rather than verified on Day 3.

**Status check required:** Is the AXL wrapper working as of Day 8? If yes, this risk has been absorbed. If not, every downstream dependency is in trouble.

### Problem 5 — MEDIUM: iNFT memory re-permissioning after transfer has no implementation path

**File:** `08_DAY0_VERIFICATION.md` Q1; `01_PRD.md` §3.2; `02_ARCHITECTURE.md` §5

The Day 0 verification document asks explicitly: "If 0G Storage data is permissioned by the original owner's address, what's the recommended pattern for making it accessible to the new owner post-transfer?" The pivot trigger says "+1 day of work" — but this underestimates the problem.

If 0G Storage uses address-based ACLs on the memory blob, the new owner's worker agent will fail to read memory on its first run after transfer. The inheritance demo depends on the new owner immediately bidding successfully — which requires the agent to load its memory (bidding strategy, past job context). A worker that can't read its own memory either crashes or bids randomly.

**Failure mode:** The inheritance demo moment shows the new owner's worker successfully bidding. But if memory isn't accessible, the agent is running without its learned state. This is functionally a new agent wearing the old agent's reputation badge. In Q&A: "Is the worker actually using its previous memory or just its reputation score?" If the answer is "the memory pointer is in the metadata but the agent defaults on first use," the inheritance claim is hollow.

---

## 3. What's Missing

**Result verification / dispute mechanism**

The architecture has no answer for: what happens if a worker submits a malformed or fraudulent result? The buyer "verifies result schema" (T+11) but schema validation is not result validation. For "Base Yield Scout," the buyer agent could check that 3 vault addresses are returned, but it can't verify the APYs are real without re-running the same web queries. There is no slashing path for bad results, no arbitration, no stake requirement beyond the bid bond.

This matters because the "trustless" claim in the tagline is specifically about the labor side. A hiring hall is only trustless if workers can't commit fraud and get paid. The architecture as written is trustless for payment delivery but not for result quality. Judges will notice this gap. Add a one-sentence acknowledgment in the architecture and submission: "Result quality verification is out of scope for v0; the current trust model relies on reputation as the disincentive for fraud." This is honest and doesn't require building anything.

**SSE proxy specification**

`02_ARCHITECTURE.md` §2.7 says: "Real-time data via Server-Sent Events from a small Node service that proxies AXL events." This service has no spec. No endpoint list. No reconnection behavior. No error handling. No authentication. Who builds it? It's assigned to Gabriel in Day 2 of 10_ACTION_NAVIGATOR.md, one line: "Wire up dashboard to AXL events via SSE proxy." If this service doesn't exist or is flaky, the entire dashboard shows static data. The "live packets flowing across AXL topology" visualization in the demo is the visual proof that this is real P2P — not a mockup. A broken SSE connection kills the demo's credibility. This needs a 10-line spec minimum: endpoint URLs, event envelope format, heartbeat interval, client reconnect strategy.

**Demo operator runbook**

`02_ARCHITECTURE.md` §6 lists four demo triggers (Post Task, Spike Gas, List for Sale, Buy) but there is no specification of: what wallet the Spike Gas fuzz-tx floods from, how many transactions it sends, what gas price multiplier triggers KeeperHub's reroute threshold, or how long the spike lasts. These are not implementation details — they are demo correctness requirements. If the gas spike doesn't exceed KeeperHub's threshold, KeeperHub doesn't reroute, and the demo's central sponsor moment doesn't fire. The `03_DEMO_SCRIPT.md` pre-production section says "practice the gas-spike scenario 5+ times" but doesn't specify what "working" means. Add a one-page runbook that defines the exact trigger parameters and the observable KeeperHub response that confirms success.

---

## 4. What to Cut

**x402 as a real integration**

`00_MASTER_BRIEF.md` lists x402 as part of the tech stack. `02_ARCHITECTURE.md` §8 has an open decision: "x402 integration: real x402 facilitator, or stub?" The bid bond is 0.5 USDC. x402 is not a sponsor. Implementing real x402 adds protocol surface for zero judging benefit. Cut it. Implement bid bonds as direct `IERC20.approve() + transferFrom()` from the worker wallet to the escrow contract. Call it "x402-inspired bond mechanics" in the submission copy. The judges evaluating this are from 0G, Gensyn, and KeeperHub — none of them are evaluating x402 compliance.

**LedgerIdentityRegistry.sol as a standalone contract**

`02_ARCHITECTURE.md` §2.3 specifies a separate `LedgerIdentityRegistry.sol` with `registerAgent()` and `getAgent()`. This contract appears nowhere in the demo flow. The AXL bidding protocol uses `reputationProof` (pointing to LedgerReputationRegistry). The iNFT carries agent identity. The escrow uses worker address directly. The IdentityRegistry is dead code in the demo. It adds one more contract to deploy, one more address to verify on explorer, and one more surface to debug. Fold `registerAgent()` into the iNFT mint function — mint the iNFT, register identity, both in one call. Drop the standalone contract.

---

## 5. Document-Specific Changes

**00_MASTER_BRIEF.md** — The "Critical Open Questions" section still shows all five questions as unresolved. Today is Day 8. Add a "Day 0 answers" block under each question showing what you actually learned. Leaving them open makes it look like the team never asked.

**01_PRD.md** — Add a "Current State (Day 8)" section at the very top — one line per Day 0-7 milestone: hit, partial, or missed. The navigator is aspirational; the PRD should reflect reality. Judges who read this document should see honest status, not a wishlist.

**02_ARCHITECTURE.md** — Resolve the cross-chain escrow problem before anything else in this document is relevant. Add a "Chain Layout" table: which contracts live on which chain, which chain holds USDC, and the explicit separation between 0G Sepolia (iNFTs, reputation, identity) and Base Sepolia (USDC escrow, settlement). This single addition clarifies the entire payment flow.

**03_DEMO_SCRIPT.md** — Change "Her reasoning is verifiable" (1:00–1:35 segment) to "Her reasoning runs on 0G's sealed inference." Remove the verifiability claim. Also: the "4.7 rating" and "47 jobs" figures are referenced in the demo voiceover but specified as "pre-baked on Day 8" — the pre-production section should be updated to say whether this script was actually run or whether those numbers are still fake in the UI.

**04_HIGGSFIELD_PROMPTS.md** — Keep as-is. These are production quality and correctly scoped. The negative prompts are strong.

**05_CLAUDE_DESIGN_BRIEF.md** — Keep as-is. Thorough, correct, well-sequenced.

**06_AI_COUNCIL_PROMPTS.md** — Keep as-is. Prompt 4 (Inheritance Mechanics Check) was the most important and should have been run on Day 4 as specified.

**07_SUBMISSION_PACK.md** — Two edits: (1) Remove "atomically" from the KeeperHub "how it's made" section, as analyzed above. (2) Add an honest note under the 0G Labs integration writeup: "Result quality verification is a known gap in v0 — we rely on reputation as the disincentive for fraud. Verification attestations are planned for v1." This is stronger than silence on the topic.

**08_DAY0_VERIFICATION.md** — This document is a Day 0 artifact. Today is Day 8. Either archive it as-is (it served its purpose) or add a "Resolution Log" section at the top with one line per question: what the answer was and which pivot (if any) was taken. Leaving it in its original form makes it look like an artifact from a project that never started.

**09_BRAND_IDENTITY.md** — Add the Ledger SAS trademark note (§1 risk note) into the README template in `07_SUBMISSION_PACK.md`. It's in the brand doc but not in the actual README template that judges will see. One sentence: "Note: Ledger SAS holds trademarks in the hardware wallet category. This project operates in the agent marketplace category; no trademark conflict is intended." Preempting this looks mature.

**10_ACTION_NAVIGATOR.md** — The navigator is a plan, not a status board. Add a single "Status" column to the Day 0-8 milestone tables: ✅ done / ⚠️ partial / ❌ blocked. Ten minutes of honest fill-in will tell you exactly what's at risk for the final 48 hours.

---

## 6. Schedule Reality Check

The deadline is May 3 EOD. Today is May 2. That is approximately 30-36 hours remaining.

**What must be true by end of Day 8 (tonight) to ship:**
- AXL three-node mesh is running reliably. If it isn't, the entire bidding sequence is broken.
- LedgerEscrow is deployed on the correct chain (Base Sepolia for USDC, or an honest workaround is documented).
- iNFT minted on 0G Sepolia, memory pointer in metadata, transfer tested at least once.
- Full job cycle (post → bid → execute → pay) has run end-to-end at least once on testnet.

**What is at risk:**
- The gas-spike KeeperHub moment. This requires KeeperHub testnet support (unconfirmed open question from Day 0). If KeeperHub is mainnet-only and a wrapper was built, the wrapper needs to be visually indistinguishable from the real service during demo recording. Document this honestly in the submission.
- The inheritance demo. The "new owner immediately earns" flow requires the escrow to call `ownerOf()` correctly, which requires the escrow to be on the right chain, which requires the cross-chain problem to have been solved. If it was solved via Option A (escrow on Base Sepolia), this works. If the problem was ignored, the demo will fail to show earnings going to the new owner.
- The SSE topology visualization. If the proxy service isn't built, the demo shows three static nodes. That's survivable but weakens the "real P2P" proof.

**What will slip regardless:**
- Pre-baking 47 fake job completions on-chain (Day 6 task). This requires 47 signed transactions from 47 fake employer addresses. If this hasn't been done, the "47 jobs, 4.7 rating" numbers the demo voiceover cites are not on-chain. The demo can still show the numbers in the UI, but they won't be verifiable on the explorer — and the Day 10 checklist says "all contract addresses verified on explorers." Judges will check.

**Timeline verdict:**

The Day 0-6 plan was achievable if the AXL wrapper worked and the cross-chain escrow was resolved early. The architecture as written has a critical gap (cross-chain payment) that would have consumed 1-2 unplanned days if discovered late. The schedule is recoverable only if that gap was caught and fixed before Day 5. If it's still open as of Day 8, the demo's central payment flow cannot be demonstrated honestly.

The Higgsfield clips, voiceover, and video edit on Day 9 are the only tasks with no dependencies on unresolved architecture questions — and they're the tasks that determine whether this looks like a finalist or a Round 1 elimination. Do not let architecture debugging on Day 8-9 crowd out recording time. Pre-record a canonical run tonight regardless of whether everything is clean. You need that B-roll.
