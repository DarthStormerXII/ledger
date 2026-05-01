# Main Council Stage 3 — Chairman Synthesis

**Chairman:** Lead session (Opus 4.7). Synthesizing across 4 lenses (Architect, Strategist, Redteam, Director) × 2 stages, 3 sponsor research briefs, 1 deep ENS research brief, 5 sponsor workshop transcripts, and the alt-council Stage 3 (which resolved the Slot-3 integration shape).

**Output:** Canonical doc-changes list applied across all 11 ledger documents + priority-ordered punch list to submission deadline (May 3, 21:30 IST = 12:00 PM EDT).

---

## 1. Executive summary

**3 partner-prize slots locked:**

| Slot | Sponsor | Pool | Why |
|---|---|---|---|
| 1 | **0G** (Track A + Track B via single slot) | $15K | The entire architecture sits on 0G. Track B's "intelligence/memory embedded" rubric is a direct hit. Free Track A cross-submission — marketplace SDK doubles as a primitive. |
| 2 | **Gensyn AXL** | $5K | Cross-machine P2P comms is on the critical path. 3-node mesh (2 cloud VMs + 1 residential laptop) is exactly what Jud's qualifying line demands. |
| 3 | **ENS** (ENS-AI + ENS-Creative via single slot) | $5K | Replaced KeeperHub. ENSIP-25 explicitly references ERC-8004 — a verification loop Greg named in the workshop. Path C CCIP-Read with live `ownerOf()` upgrades the Inheritance demo dramatically. Two prize chances on one codebase. |

**Total addressable pool: $25K** (vs. $20K with KeeperHub). Realistic placement target: $5–9K from sponsor bounties + $4K finalist pack = $9–13K.

**The KeeperHub → ENS swap rationale (final):**

KeeperHub's workshop reframing — Luka explicitly described our marketplace pattern as the ideal contribution they want — was genuinely seductive. But the geometry doesn't work: KeeperHub doesn't support 0G Galileo, and Ledger's value prop (iNFT transfer + memory survival) lives on 0G. So KeeperHub can never sit on the critical path of the hero demo. ENS, by contrast, *is* on the critical path: `who.worker-001.ledger.eth` resolves to `ownerOf()` on 0G via CCIP-Read, so when the iNFT transfers the ENS resolution flips with zero ENS transactions. That's the visible 5-second "oh" that wins the demo. Plus dual-track on ENS = 2 placement chances vs KeeperHub's 1.

---

## 2. The 5 cross-cutting consensus findings (Stage 2)

These were flagged from independent angles by ≥3 of 4 council members. Highest-priority changes.

### Finding 1 — The Inheritance moment becomes split-screen + still + `ownerOf()` line + live ENS resolution

**Convergence:** Architect (mid-flight semantics + ownerOf line), Strategist (split-screen wallet at 2:50), Redteam (real artifacts not assertions), Director (stillness, cut "ERC-7857. An iNFT" from VO). Now also: alt-council Inventor (`who.<agent>.ledger.eth` follows ownerOf live).

**Concrete edit:** rewrite `03_DEMO_SCRIPT.md` 2:00–3:15 as one sequence — see §5 of `tools/council_alt/STAGE3_CHAIRMAN.md` for the 75-second frame-by-frame.

### Finding 2 — Kill the simulated KeeperHub reroute UI fallback (now moot — KeeperHub removed entirely)

The "manual override that simulates the reroute UI" line at `03_DEMO_SCRIPT.md` 812-816 was the highest-fraud-smell line in the bundle. With KeeperHub out, this entire concern evaporates. Replace the 1:35–2:00 KeeperHub beat with a smaller, real moment: ERC-8004 reputation increment with a TEE attestation digest from 0G Compute surfaced as a UI badge. Honest, demoable, kills the redteam's "sealed inference asserted-not-proven" critique cleanly.

### Finding 3 — Proof Matrix at top of README + 3 sponsor proof docs

**Convergence:** Strategist (proposed it), Redteam (every claim is a Q&A trap without evidence), Architect (demands hashes / consistency model / attestation).

**Concrete edit:** `07_SUBMISSION_PACK.md` README template gets this table at the top, after tagline, before "What it is":

| Claim | Evidence |
|---|---|
| Worker is an ERC-7857 (0G iNFT draft standard) iNFT | token address + tokenId + Galileo explorer link + `0glabs/0g-agent-nft` reference impl link |
| Memory persists on 0G Storage | CID before/after transfer + 0G Storage retrieval link + AES-256-CTR key-rebind via TEE oracle |
| Reasoning runs sealed on 0G Compute | model name (GLM-5 / Qwen3.6-Plus) + attestation digest hash + `broker.inference.verifyService` SDK link |
| AXL is real cross-machine P2P | 3 ed25519 peer IDs (64-char hex) + 3 Yggdrasil IPv6 addresses (200::/7) + AWS / GCP / residential ISP labels + `/topology` JSON snapshot + tcpdump excerpt |
| ENS identity follows ownerOf cross-chain | `worker-001.ledger.eth` Sepolia resolver address + Galileo iNFT contract + before/after `who.*` resolution showing owner flip |
| Reputation lives on the audited ERC-8004 deployment | `0x8004B663056A597Dffe9eCcC1965A193B7388713` Base Sepolia explorer link + ENSIP-25 verification text record |
| Ownership changes earnings flow | ownerBefore + ownerAfter + payment recipient tx hash on Base Sepolia |

Plus 3 companion files (one screen each): `/docs/0g-proof.md`, `/docs/axl-proof.md`, `/docs/ens-proof.md`. (Note: ENS proof, not KeeperHub proof.)

### Finding 4 — Strike "atomically" from cross-chain settlement language

**Architect's flag:** `02_ARCHITECTURE.md` §4 step T+12 says "atomically" but USDC on Base Sepolia and reputation on Base Sepolia/0G Galileo (mixed) cannot be made atomic across chains.

**Resolution per architect's Stage 2 self-correction ("A's words, B's chain choice"):** keep Base Sepolia, fix the wording. Replace "atomically" with: *"two-phase commit, eventually consistent within ~10s. Both transactions guaranteed to fire; the dashboard surfaces a `pending_reconcile` state if one lags."* Add §4.1 "Settlement consistency model" capturing this. Add a thin "Settlement Status Strip" UI component to the dashboard that shows ✓/✓/⏳ per-leg.

### Finding 5 — Schedule reality: Day 9 = Day 10 = May 3

**Architect's flag:** Day 9 and Day 10 are the same calendar date. The 10-day plan is a 9-day plan with the last day double-counted.

**Resolution:** Move recording to **tonight (May 2 evening)** — don't wait for May 3 morning. Lock Higgsfield Shot 3 by EOD May 2. Submit by May 3, **21:30 IST = 12:00 PM EDT** (the actual deadline confirmed by research). Treat May 3 morning as edit + README + submission, not record.

---

## 3. Conflicts resolved

### Conflict 1 — Base Sepolia: cut or keep?

**Resolution: keep.** "A's words, B's chain choice." Strike "atomically," replace with "two-phase commit, eventually consistent." Settlement Status Strip UI handles the visualization. ERC-8004 ReputationRegistry is *already deployed audited* at `0x8004B663…` on Base Sepolia — cutting Base means deploying our own ReputationRegistry on 0G, which costs 4-6h vs. a 10-minute wording fix.

### Conflict 2 — Higgsfield Shot 2 (iNFT crystal): cut or keep?

**Resolution: cut entirely.** Director's Opus-4.7 Stage 1 was right — the actual iNFT IS the data, not a crystal. Replace 2:00–2:15 with the slow camera push on the worker profile UI in 96px Fraunces, **rendering the ENS capability tree (`who`, `pay`, `tx`, `rep`, `mem`) on the right side**. That's the new Tron Legacy elegance. Higgsfield credits saved → spend on Shot 3 retakes.

### Conflict 3 — 47-job pre-baked reputation: drop or disclose?

**Resolution: keep + disclose.** Add one sentence to README "How it's made":

> *"The hero worker's reputation history (47 jobs, 47 employer-signed feedback records on the audited ERC-8004 ReputationRegistry at `0x8004B663…` on Base Sepolia) is seeded for demonstration. The contract accepts any employer-signed feedback record per ERC-8004 spec; production deployments would derive history from real task settlements."*

Two sentences satisfy redteam's integrity bar without losing strategist's proof matrix or director's cold-open numbers.

### Conflict 4 — Lead with cinematic globe, or D's inverted hook?

**Resolution: muted 5-second test.** Recording day, before locking the cut: 2 uninformed viewers watch first 5 seconds with audio off. If they don't say something like "an AI worker changed owners and kept earning," use Director's inverted hook (worker stat card → transfer → cinematic). This is a recording-day decision, not a planning decision.

### Conflict 5 — All-actions-through-KeeperHub or one high-stakes flow? — **MOOT (KeeperHub removed)**

---

## 4. Workshop-derived sponsor-language edits

Sponsor judges grep for their own language. From the 5 workshop transcripts:

| Edit | Source | Where |
|---|---|---|
| Call AXL pattern *"service registry / tool marketplace"* in README + submission | Jud, Gensyn workshop | `07_SUBMISSION_PACK.md` `00_MASTER_BRIEF.md` |
| Use ENSIP-25 `agent-registration` text records pointing to ERC-8004 deployment | Greg, ENS workshop | `02_ARCHITECTURE.md` §2 (new subsection) + `07_SUBMISSION_PACK.md` |
| Build `pay.<agent>.ledger.eth` with auto-rotating addresses; cite Fluidkey as inspiration in How-it's-made | Greg, ENS workshop | `07_SUBMISSION_PACK.md` |
| Use 0G's new `uploadFile` / `downloadFile` SDK (drop "flow contracts" references) | Gautam, 0G workshop | `02_ARCHITECTURE.md` §2.6 |
| Surface attestation digest from `broker.inference.verifyService` as UI badge in worker profile | Gautam, 0G workshop | `05_CLAUDE_DESIGN_BRIEF.md` |
| Mention "100 delegated users per token without transfer" as future-work | Gautam, 0G workshop | `01_PRD.md` §6 (Non-Goals → "Considered for v2") |
| Fork the AXL repo's `gossipsub` example rather than writing from scratch | Jud, Gensyn workshop | `02_ARCHITECTURE.md` §2.4 |
| Explicit "two layers of encryption: hop-by-hop TLS + end-to-end payload" framing for AXL section | Jud, Gensyn workshop | `02_ARCHITECTURE.md` §2.4 |

---

## 5. Per-document changes (all 11 docs)

### `00_MASTER_BRIEF.md`

- **Line 26-29 (Sponsor Targets):** Replace "KeeperHub ($4,500 main + $500 feedback)" with "**ENS (ENS-AI $2,500 + ENS-Creative $2,500)**." Update placement target accordingly.
- **Line 37-49 (Tech Stack):** Replace "**Chain:** 0G Sepolia for compute, storage, iNFTs" with "**Chain:** 0G Galileo Testnet (ChainID 16602, native 0G token) for compute, storage, iNFTs." Replace "USDC on Base Sepolia" — keep. **Remove** the "x402-style for bid bonds and small fees" line entirely (architect's call — x402 is HTTP middleware, not on-chain escrow primitive). **Remove** "Tx execution: KeeperHub MCP server" — replace with "**Identity layer: ENS via custom CCIP-Read offchain resolver under team-owned parent name on Sepolia.**"
- **Line 41-43 (Core Thesis):** Replace "ERC-8004, x402, ERC-7857" with "**ERC-8004 (already-deployed audited registry on Base Sepolia), ERC-7857 (0G iNFT draft standard), and ENS (ENSIP-25 verification loop with ERC-8004)**" — three identity primitives wired into a working two-sided market.
- **Line 64 (Demo Concept):** Update the hero-moment time anchor to "preview at 0:04 (inverted hook), tease at 1:30, payoff at 2:30–3:00 split-screen + live ENS resolution flip."
- **Line 84-92 (Critical Open Questions):** All 5 are now answered. Replace with a "**Critical Confirmations**" section citing the research briefs and workshop sources for each answer.

### `01_PRD.md`

- **Line 26-37 (3.1 Hire Flow):** Step 5 — replace "x402-style flow" with "on-chain escrow contract on Base Sepolia." Step 8 — replace "KeeperHub atomically" with "settlement contract pays worker; ERC-8004 ReputationRegistry receives a feedback record signed by the buyer (per ERC-8004 spec); dashboard's Settlement Status Strip shows both legs as eventually-consistent."
- **Add §3.1.5 (Auction termination):** add `bidExpiresAt`, `AUCTION_CLOSED` AXL pubsub broadcast, and what losing workers do (free their bond commitment locally; do not re-bid until next `TASK_POSTED`). Architect's 30-line fix.
- **Add §3.3 (Identity layer):** every worker iNFT is named `worker-NNN.ledger.eth` (or whatever parent we register) with a tree of capability subnames. Resolution is via CCIP-Read offchain resolver — see ARCHITECTURE §X.
- **Line 50-89 (4. Sponsor Integration Requirements):** Remove §4.3 (KeeperHub) entirely. Replace with §4.3 (ENS) listing requirements: parent name registered on Sepolia; CCIP-Read resolver live and serving capability namespaces; ENSIP-25 text record on parent pointing to ERC-8004 deployment; demo shows live `ownerOf()` resolution flip post-transfer.
- **Line 91-99 (Acceptance Criteria):** Replace #5 (KeeperHub gas-spike) with: "5. ENS subname `who.worker-001.ledger.eth` resolves to current iNFT owner; address flips within 30s of `transferFrom` settlement on 0G Galileo." Replace any remaining KeeperHub references.
- **Line 102-117 (Timeline):** Compress Day 9 + Day 10 into "Day 9 (May 3): morning record + edit; afternoon README + Proof Matrix + sponsor proof docs; submit by 21:30 IST." Move pre-baked reputation, contract deploys, AXL mesh verification to "Day 8 (May 2 evening)."
- **§6 (Non-Goals):** Remove "Multi-chain UX beyond 0G + Base" (we now also use Sepolia for ENS — three chains, not two). Update accordingly.
- **§9 (Risks):** Remove KeeperHub risk row. Add ENS risks: parent name acquisition friction (mitigation: register tonight); ENS app rendering of custom text records (mitigation: ship custom viewer page); HD-derivation verification UI (mitigation: explicit verifier button).

### `02_ARCHITECTURE.md`

- **Line 11-51 (System Overview ASCII):** Redraw without KeeperHub. Add ENS resolver gateway box pointing at 0G Galileo (read-only `ownerOf()`) and Base Sepolia (read-only ERC-8004 reputation). New box: "ENS L1 Sepolia: parent name + CCIP-Read pointer."
- **§2.3 (Smart Contracts):** Rename `LedgerReputationRegistry.sol` → **delete entirely.** Use the live audited ERC-8004 deployment at `0x8004B663…` on Base Sepolia. Save 200+ lines of contract code + audit-story-by-default. (This is the biggest engineering simplification of the entire pivot.) Keep `LedgerEscrow.sol`, `WorkerINFT.sol`, `LedgerIdentityRegistry.sol`. Note that `LedgerEscrow.sol` calls `feedback()` on the live ERC-8004 contract on settlement.
- **§2.4 (AXL Network):** Update language: "two layers of encryption: hop-by-hop TLS + end-to-end payload." Mention forking the gossipsub.py example. Add `AUCTION_CLOSED` pubsub message to channel list.
- **§2.5 (KeeperHub MCP):** **Delete this entire subsection.** Replace with §2.5 (**ENS Resolver Gateway**): describes the CCIP-Read offchain resolver — request shape, ENSIP-10 signed-response handler, namespace dispatch table, deployment as stable HTTPS endpoint, key management.
- **§2.6 (0G Stack):** Replace "0G Sepolia" everywhere with "0G Galileo Testnet (ChainID 16602, native 0G token)." Update Storage section to reference `uploadFile` / `downloadFile` (NOT flow contracts). Add a §2.6.1 "Memory permissioning" subsection: TEE oracle re-keys metadata on transfer (per ERC-7857 spec, confirmed by Gautam workshop); cite `0glabs/0g-agent-nft@eip-7857-draft` as reference impl.
- **§2.7 (Frontend):** Add Screen 5 "Settlement Status Strip" component. Add Screen 6 "Capability Tree Viewer" rendering `worker-NNN.ledger.eth/<namespace>` resolutions live (custom viewer page, since the official ENS app may not render our text records nicely).
- **§3 (Message Schemas):** Add `AUCTION_CLOSED` schema. Update other schemas if they referenced x402 or KeeperHub.
- **§4 (Data Flow):** Strike "atomically" from step T+12. Insert §4.1 "Settlement consistency model" with the two-phase commit language.
- **Add §4.2 (Mid-flight transfer semantics):** Architect's request — explicitly state that any payment released after `transferFrom` lands flows to the new owner (including the in-flight job's payment, since `ownerOf()` is checked at settlement time). Match this to the demo VO claim ("next payment").
- **Add §4.3 (`taskId` derivation):** `taskId = keccak256(abi.encodePacked(buyer, nonce, block.timestamp))`; buyer must call `LedgerEscrow.postTask` *before* AXL pubsub broadcast so AXL `TASK_POSTED` carries a chain-anchored ID.
- **§5 (Inheritance Flow):** Add the ENS resolution flip beat. T+5: "ENS `who.<agent>.ledger.eth` next resolution returns Owner_B address (zero ENS transactions; CCIP-Read picks up new `ownerOf()` on Galileo)."
- **§7 (Repository Layout):** Add `resolver/` directory for the CCIP-Read offchain server. Remove any KeeperHub references.
- **§8 (Engineering Decisions):** Most are now decided per the research and synthesis. Update list to show closed decisions with rationale, plus the few still-open ones (e.g. agent runtime language: TS recommended given AXL examples are HTTP-based).
- **§9 (Build Risks):** Remove KeeperHub risk row. Add ENS resolver gateway uptime risk (mitigation: deploy on Vercel/Cloudflare; cache `ownerOf()` reads with 30s TTL).

### `03_DEMO_SCRIPT.md`

- **Time Allocation table:** Remove the "KeeperHub moment 0:25" row. Allocate that time to the ENS resolution flip beat (now part of the Inheritance section, see §5 of `tools/council_alt/STAGE3_CHAIRMAN.md`). Update segment table.
- **0:00–0:15 (Cinematic Open):** Add "muted 5-second test" decision criterion at recording-day. Pre-prepare both versions: cinematic-first AND inverted-hook-first.
- **0:15–0:35 (Problem Framing):** Update third stat card from "0 marketplaces" to something stronger if we have a pithier line. Director suggested "*Twenty-one thousand agents. A hundred million payments. Zero places to hire each other.*" — keep this.
- **0:35–1:35 (Live Demo Posting):** Add a 10-second AXL proof shot — terminal showing 3 peer IDs, 3 IPv6 addresses, message-hash log, kill-the-bootstrap moment. Strategist's bounty-grade evidence call. Cut the bid-bond VO line; the UI shows it.
- **1:35–2:00 (was KeeperHub moment):** Replace entirely. New beat: ERC-8004 reputation increment with TEE-attestation digest from 0G Compute surfaced as a UI badge. VO: *"Her reasoning runs sealed on 0G Compute. The attestation digest is on-chain."* Show the badge for 4 seconds.
- **2:00–3:15 (The Inheritance):** Replace fully per the alt-council Stage 3 §5 — 75-second beat with ENS capability tree, live `pay.*` rotation, transfer event, `who.*` resolution flip, split-screen wallets.
- **3:15–3:35 (Inheritance Handoff Higgsfield):** Move to the END (3:48–4:00) per Director's Opus-4.7 recommendation. Sponsor logos handled with hard cuts (After Effects), not Higgsfield.
- **3:35–4:00 (Thesis + CTA):** Update sponsor logo trio: 0G + Gensyn + **ENS** (was KeeperHub). Update VO closing line if needed.
- **What Could Go Wrong On Recording Day** section: **DELETE bullet 3** (the simulated-reroute-UI fallback) entirely. Add: "ENS resolver gateway down — fallback to pre-cached `cast resolve` outputs in /tmp captured during dress rehearsal." Add: "0G Galileo public RPC unreliable — Builder C's private node + 30s TTL cache covers."
- **Pre-Production:** Update the "47 jobs of fake history pre-baked" note to "47 employer-signed ERC-8004 feedback records seeded to `0x8004B663…` on Day 8 evening." Add disclosure-sentence requirement for README.

### `04_HIGGSFIELD_PROMPTS.md`

- **Shot 2 (iNFT Transformation):** **Cut entirely** per consensus #1 + Conflict 2 resolution. Reallocate Higgsfield budget to Shot 3 retakes.
- **Shot 3 (Inheritance Handoff):** Move to 3:48–4:00 (final shot, replaces sponsor sigil). Trim to 12s. Generate slow-mo + speed-up in post for the particle-stream reversal (per Higgsfield video learnings).
- **Optional Bonus Shot (sponsor sigil):** Cut. Use real sponsor logos with hard-cut After Effects animation.
- **Two-stage pipeline integration:** Apply the YouTube-workshop learnings — Stage A: image generation in Soul 2 OR Cinema Studio image tab + multi-model comparison (try GPT-Image, Nano Banana Pro, Seedream, Soul 2). Stage B: image-to-video with Cinema Studio camera/lens + camera move from menu. Per-shot table:

| Shot | Image stage | Video stage |
|---|---|---|
| 1 (Cinematic Open) | Soul 2 + Cinema Studio: full-frame cine, 24mm | i2v: slow dolly down + slight push in, gold pulse on impact, low ambient drone, no dialogue |
| 3 (Inheritance Handoff) | Soul 2 + Cinema Studio: anamorphic, 50mm | i2v: locked-off, almost still, particle reversal in slow-mo (will speed up in post), no dialogue, low ambient drone |

- **Worker iNFT artwork prompt:** Reduce 10 portraits → 3-4 (strategist's call). Generate via multi-model comparison; pick best.

### `05_CLAUDE_DESIGN_BRIEF.md`

- **Add Screen 5 (Settlement Status Strip):** thin component showing per-leg settlement (USDC paid on Base ✓ / Reputation feedback recorded on Base ✓ / 0G Storage CID updated ✓) with `pending_reconcile` state if any lags.
- **Add Screen 6 (Capability Tree Viewer):** custom page at `/agent/<ens-name>` rendering live resolution of all 5 namespaces (`who`, `pay`, `tx`, `rep`, `mem`) with verify-derivation buttons. This is the demo surface for the Inheritance moment.
- **Worker Profile (Screen 3):** add ENS-name display at the top in 96px Fraunces — `worker-001.ledger.eth` — and show the capability tree on the right side.
- **Inheritance Modal:** add a "Live ENS resolution" panel showing `who.<agent>.ledger.eth` resolving to old owner address pre-transfer, then to new owner address post-transfer with a real-time refresh trigger.
- **Sound section:** specify Jóhann Jóhannsson "*The Beast*" from Arrival OST 0:00–0:30 as drone reference (Director's call). **Architect's note:** that track is YouTube-Content-ID-flagged. Pin a royalty-free reference instead — search FilmConvert / Artlist for "ominous low-frequency drone, 200Hz, 400ms tail, slight reverb."

### `06_AI_COUNCIL_PROMPTS.md`

This file is the *prompts* used to drive the AI council. It served its purpose. Add to the file:
- **A new prompt 8: "Watch the demo with audio off."** (Director's muted-autoplay test.)
- **A new prompt 9: "If you were a sponsor judge from <X>, what's the single sentence you'd grep the README for?"** (Strategist's grep-test for sponsor language.)
- Replace any KeeperHub-specific prompts with ENS-specific ones (e.g. "Does the ENS resolution flip beat work in a real ENS-aware client at 1:1 playback?").

### `07_SUBMISSION_PACK.md`

- **README template:** Insert the **Proof Matrix** at the top, after tagline, before "What it is." (See §2 Finding 3 above.)
- **Above the proof matrix:** insert the sentence Director called out — *"The workers are the assets."* — as a display-styled pull quote in the largest text on the page.
- **"What it is" section:** Move above the demo video embed. First 100 words must communicate the project without playing the video. Director's call.
- **Sponsor sections:** Replace KeeperHub section with ENS section. ENS section narrates: parent name, capability tree, ENSIP-25 verification loop with ERC-8004, Path C CCIP-Read pattern, live `ownerOf()` flip behavior, custom viewer page.
- **"How it's made" section:** Add the disclosure sentence about the 47 seeded feedback records (see Conflict 3 resolution). Cite Fluidkey as inspiration for the rotating `pay.*` pattern.
- **Submission form fields:** Partner-prize selection: 0G + Gensyn + ENS (drop KeeperHub). Project description: re-aligned to the new 3-sponsor pitch.
- **FEEDBACK_KEEPERHUB.md → DELETE.** Replace with `FEEDBACK_ENS.md` if ENS ever introduces a feedback-bounty (currently they don't, so this file just doesn't exist — saves 30+ minutes of writing).

### `08_DAY0_VERIFICATION.md`

All 5 critical Day-0 questions are now answered. Update the file:
- **Q1 (ERC-7857 transfer of encrypted memory):** ✅ Confirmed via 0G workshop + ENS deep research. TEE oracle re-keys on transfer per spec; reference impl at `0glabs/0g-agent-nft`. Cite source.
- **Q2 (AXL residential NAT):** ✅ Confirmed. Outbound TCP/TLS to bootstrap is sufficient. No port forwarding needed. Cite Gensyn workshop.
- **Q3 (KeeperHub testnet support):** **N/A — KeeperHub removed from slate.** Strike question.
- **Q4 (0G Compute hackathon access):** ✅ Confirmed. Fully open. 6 mainnet models (GLM-5, GLM-5.1, Qwen3.6+, GPT-OS, 30C, 27B). Cite 0G workshop.
- **Q5 (ETHGlobal max-3-partner-prizes rule):** ✅ Confirmed. Multiple tracks per sponsor = 1 partner-prize slot. Cite KeeperHub research brief.
- **Add Q6:** "Does the ENS deep-research Path C (CCIP-Read with live `ownerOf()` on 0G Galileo) actually work?" — Status: confirmed feasible per `0xFlicker/tod-offchain-resolver` reference. Cite ENS deep-research brief.
- Process incoherence (build vs verification): now resolved since all questions are answered.

### `09_BRAND_IDENTITY.md`

- **Worker portraits ambition:** reduce from "10 unique portraits" to "3-4 if time" per strategist.
- **Sound section:** correct the Jóhann Jóhannsson reference per architect's content-ID warning (above).
- **Trademark note (Ledger SAS):** delete from README (architect's call — mentioning trademark issue in hackathon submission signals naivete).

### `10_ACTION_NAVIGATOR.md`

- Replace Day 9 / Day 10 split with the new compressed schedule (see Finding 5).
- Update the day-by-day deliverables to require *evidence artifacts* per day (strategist's call) — not just code that compiles.
- Remove "the plan is locked / architecture is clean" overconfidence per redteam's call. Replace with "this is the v3 plan after council Stages 1-3; pivots logged in `tools/council/`."
- Move "AI Council Prompt 7 (final demo polish)" to **tonight (Day 8 evening)** so its findings are actionable, not stranded on Day 9 14:00 (architect's call).
- Update sponsor-confirmation requirements: KeeperHub Discord no longer needed; ENS Discord office-hours mentioned in Greg's workshop ("project feedback session tomorrow") — surface the time.

---

## 6. Priority-ordered punch list (May 2 evening → May 3 21:30 IST)

This is the canonical execution order. Marked by which builder owns it where roles are obvious.

### Tonight (May 2 evening, ~5 hours)

1. **[Lead]** Apply the full doc-changes list above to all 11 files. Commit. ~1.5h.
2. **[Lead]** Register parent ENS name on Sepolia via `sepolia.app.ens.domains` (need Sepolia faucet ETH). 15 min.
3. **[Builder C]** Deploy `LedgerEscrow.sol` + `WorkerINFT.sol` + `LedgerIdentityRegistry.sol` on **0G Galileo (16602)**. Verify on explorer. ~1h. **(NOT `LedgerReputationRegistry` — we use the live audited deployment at `0x8004B663…` on Base Sepolia.)**
4. **[Builder A]** Spin up 2 cloud VMs + local laptop running AXL nodes. Verify mesh formation (`/topology` returns 3 peers). Fork the `gossipsub` example from the AXL repo for pubsub layer. ~2h.
5. **[Builder B]** Start the CCIP-Read offchain resolver server skeleton — bare `who.*` namespace handler that proxies `ownerOf()` from 0G Galileo. Deploy to Vercel/Cloudflare. ~1.5h.
6. **[Builder D]** Generate Higgsfield Shot 1 + Shot 3 (the only two we're keeping). Multi-model image comparison for Shot 1 start frame. ~3h.
7. **[Lead]** Run AI Council Prompt 7 (final demo polish prompt) **tonight**, not Day 9.

### May 3 morning (May 3 09:00 IST → 13:00 IST, ~4 hours)

8. **[Builder B]** Add remaining namespace handlers: `pay`, `tx`, `rep`, `mem`. Wire HD-derivation for `pay`. ~3h.
9. **[Builder C]** Set ENSIP-25 `agent-registration` text record on parent name pointing to the audited ERC-8004 deployment on Base Sepolia. ~30 min.
10. **[Builder D]** Build Capability Tree Viewer page (custom UI, since official ENS app may not render our text records nicely). ~2h.
11. **[Builder A]** Wire the Settlement Status Strip + AXL topology view + worker profile pages. ~2h.
12. **[Builder B]** Seed 47 employer-signed feedback records to ERC-8004 on Base Sepolia. ~30 min (assumes script ready).
13. **[Lead]** Sponsor Discord posts: 1-line update to 0G + Gensyn + ENS Discord channels with a link to the work-in-progress repo. (Strategist's call: "We got X working, here are logs, any best-practice suggestions?")

### May 3 afternoon (13:00 IST → 18:00 IST, ~5 hours)

14. **[All]** Demo recording — 3+ takes minimum. Muted 5-second test on first take. Pick best per scene, edit. ~3h.
15. **[Lead]** Voiceover via Eleven Labs, synced to picture. ~1h.
16. **[Builder D]** Color grade, audio mix, hard-cut sponsor logo sequence (3 logos × 3 seconds each, hard cuts no crossfade). ~1h.

### May 3 evening (18:00 IST → 21:30 IST, ~3.5 hours)

17. **[Lead]** Build the 30-second elevator cut alongside the 4-min cut (Director's call — judges sometimes only watch first 30s).
18. **[Lead]** README final pass: Proof Matrix populated with real artifacts (token IDs, CIDs, attestation digests, peer IDs, contract addresses, ENS names).
19. **[Lead]** `/docs/0g-proof.md`, `/docs/axl-proof.md`, `/docs/ens-proof.md` finalize. Each ≤ 1 screen, evidence inline.
20. **[Lead]** Custom YouTube/Vimeo thumbnail composite (split-screen, two laptops, wallet→wallet, worker stat card). Director's call — nobody else's submission solves this.
21. **[Lead]** Submission form filled. Partner prizes: 0G + Gensyn + ENS. Submit by **20:30 IST** (1 hour buffer before deadline at 21:30 IST = 12:00 PM EDT).
22. **[Lead]** Iterate README until cutoff at 21:30 IST.

---

## 7. Submission checklist (final hour: 20:30 → 21:30 IST)

- [ ] Repo public on GitHub, all commits dated April 24 or later
- [ ] README: Pull quote + Proof Matrix + What-it-is (above video) + Architecture diagram + Sponsor sections (0G / Gensyn / ENS) + How-it's-made + Future work
- [ ] Demo video uploaded (YouTube/Vimeo) — 4-min cut. Custom thumbnail set.
- [ ] 30-second elevator cut available as a separate link.
- [ ] `/docs/0g-proof.md`, `/docs/axl-proof.md`, `/docs/ens-proof.md` filed.
- [ ] Architecture diagram exported as PNG, embedded in README.
- [ ] Live deployment URL verified working (open in incognito browser).
- [ ] All contract addresses listed in README — verified on explorers.
- [ ] ENS parent name + 1-2 demo workers' subnames resolve correctly via `cast resolve` and via `app.ens.domains/sepolia/<name>`.
- [ ] AXL `/topology` returns 3 distinct peer IDs from 3 distinct hosts.
- [ ] At least one settlement workflow has a verifiable on-chain tx hash on Base Sepolia for the ERC-8004 feedback record.
- [ ] Submission form: partner prizes selected = **0G + Gensyn + ENS**. Project description ≤ 30 seconds when read aloud.
- [ ] ETHGlobal Discord post in #showcase or equivalent.
- [ ] Submitted ≥1h before 21:30 IST hard deadline.

---

## 8. What this synthesis does NOT cover

The chairman explicitly declines to override these, leaving them to the user's judgment:

- **The cinematic-vs-inverted-hook decision** — defer to the muted 5-second test on recording day.
- **Whether to do AI Council Prompt 7 with the council tabs reopened, or just inline by lead.** Suggest: lead alone, since the council mechanic adds wall-time we don't have.
- **Whether to record solo (lead) or with the team on camera for the physical-handoff scene.** Director's preference is two laptops + two hands in one shot — but if the team isn't physically together tonight, the handoff scene becomes a single-laptop window-switch, which is weaker but workable.

---

*Main council Stage 3 synthesis frozen. All 4 teammate tabs already closed. Council mechanic complete. Execution begins.*
