# Ledger — Action Navigator

**Read this first. Every time you start a new session, every time you open Claude Code, every time you forget where you are — this is the map.**

This document is the single source of truth for: what to do, when, with which document, in which tool.

---

## Document Inventory (10 docs + execution plan + proofs)

All planning docs now live in `docs/`. The execution plan and proof artifacts live at the repo root.

| # | File | Purpose | When you need it |
|---|---|---|---|
| 00 | `docs/00_MASTER_BRIEF.md` | Project context summary | Paste at top of EVERY new AI session |
| 01 | `docs/01_PRD.md` | Product requirements | Day 0 reference |
| 02 | `docs/02_ARCHITECTURE.md` | Technical design | Day 0 — engineering reference |
| 03 | `docs/03_DEMO_SCRIPT.md` | 4-minute video script | Recording day (May 2 evening + May 3 afternoon) |
| 04 | `docs/04_HIGGSFIELD_PROMPTS.md` | Cinematic video prompts | May 2 evening video gen |
| 05 | `docs/05_CLAUDE_DESIGN_BRIEF.md` | UI design system + screen prompts | Day 0 design kickoff |
| 06 | `docs/06_AI_COUNCIL_PROMPTS.md` | Multi-model brainstorm prompts | Day 0, 4, 7, May 2 evening |
| 07 | `docs/07_SUBMISSION_PACK.md` | ETHGlobal form answers + READMEs | May 3 evening submission |
| 08 | `docs/08_DAY0_VERIFICATION.md` | Sponsor questions + Day 0 plan | Hour 0-6 of Day 0 (now resolved) |
| 09 | `docs/09_BRAND_IDENTITY.md` | Logo, fonts, colors, voice | Day 0 brand work, ongoing reference |
| 10 | `docs/10_ACTION_NAVIGATOR.md` | THIS FILE — your map | Always |
| — | `EXECUTION_PLAN.md` (repo root) | Day-by-day operational plan | Always (companion to this navigator) |
| — | `proofs/0g-proof.md` | 0G evidence artifact | May 3 evening |
| — | `proofs/axl-proof.md` | Gensyn AXL evidence artifact | May 3 evening |
| — | `proofs/ens-proof.md` | ENS evidence artifact | May 3 evening |
| — | `tools/council/` | Council pivots logged here | Reference for "why did we change X?" |

---

## Critical Rule: How to Use This Across Sessions

This conversation will run out of context. Future Claude sessions, Claude Code, Codex sessions will not remember what we discussed. **The discipline is:**

1. **Open new AI session** → first message: paste `00_MASTER_BRIEF.md`
2. **Then paste** the specific document for the task at hand
3. **Then ask** the specific question

If you skip the master brief, the AI will make different assumptions and give you misaligned advice. This wastes turns and creates inconsistency.

### Template for opening any new AI session

```
Here is the master context for my project:

[paste 00_MASTER_BRIEF.md]

Here is the specific document relevant to my current task:

[paste the relevant numbered doc, e.g., 02_ARCHITECTURE.md]

My current task: [one sentence]

My current question: [specific ask]
```

This pattern compounds quality across sessions.

---

## The Master Action Plan (compressed: through May 3, 21:30 IST)

**Submission deadline:** **May 3, 21:30 IST = 12:00 PM EDT.** Hard.

**Sponsor slate (locked post May 2 council):** **0G** + **Gensyn** + **ENS** (KeeperHub swapped out — see `tools/council/STAGE3_CHAIRMAN.md` §1).

**Each day produces evidence artifacts**, not just code that compiles. Contracts deployed AND verified on the explorer; AXL topology JSON snapshotted; ENS resolutions tested via `cast resolve`; the Inheritance flip recorded as a video clip; etc. Compiling code with no on-chain trace doesn't count.

### DAY 0 — Verification & Setup (Apr 24)

**Goal:** confirm assumptions, set up infrastructure, lock the brand. **Zero production code.**

| Hour | Owner | Action | Document | Tool |
|---|---|---|---|---|
| 0–1 | Gabriel | Post sponsor questions in 0G + Gensyn + ENS Discords | `docs/08_DAY0_VERIFICATION.md` | Discord |
| 0–1 | Gabriel | Register team on ETHGlobal, lock ETH stake | — | ETHGlobal site |
| 0–1 | Gabriel | Buy ledger.market (or fallback domain) | `docs/09_BRAND_IDENTITY.md` §1 | Namecheap/Porkbun |
| 1–2 | Gabriel | Create GitHub org + private repo | — | GitHub |
| 1–2 | Gabriel | Drop docs in repo's `docs/` folder, scaffold `EXECUTION_PLAN.md` + `proofs/` at root | All | Git |
| 1–3 | Friend 1 | Set up Foundry workspace, stub contracts (Escrow, WorkerINFT, IdentityRegistry — note: **no LedgerReputationRegistry**, we use the audited ERC-8004 deployment at `0x8004B663…` on Base Sepolia) | `docs/02_ARCHITECTURE.md` §2.3 | Claude Code Max |
| 1–3 | Friend 2 | Set up Next.js, configure Tailwind with brand tokens | `docs/09_BRAND_IDENTITY.md` §5, `docs/05_CLAUDE_DESIGN_BRIEF.md` | Claude Code Max |
| 1–3 | Friend 3 | Set up agent runtime skeleton (TS recommended given AXL examples are HTTP-based) | `docs/02_ARCHITECTURE.md` §2.1 | Claude Code Max |
| 2–4 | Gabriel | Spin up 2 cloud VMs, install AXL binary, test cross-VM hello | `docs/02_ARCHITECTURE.md` §2.4 | DigitalOcean + ssh |
| 3–5 | Gabriel | Generate logo assets (mark + lockup + app icon) | `docs/09_BRAND_IDENTITY.md` §3 | Higgsfield image / Flux / DALL-E |
| 3–5 | Friend 2 | Open Claude Design, set up design system | `docs/05_CLAUDE_DESIGN_BRIEF.md` §A | Claude Design |
| 4–6 | Gabriel | Run AI Council Prompts 1, 3, 5, 6 (in parallel) | `docs/06_AI_COUNCIL_PROMPTS.md` | AI Council |
| 4–6 | Gabriel | Generate Higgsfield Shot 1 (Cinematic Open) — early test of aesthetic | `docs/04_HIGGSFIELD_PROMPTS.md` Shot 1 | Higgsfield |
| 6 | Everyone | Standup. Review sponsor responses. Confirm Day 1 plan. | — | Slack/Discord |

**End of Day 0 deliverables (evidence artifacts):**
- [ ] All sponsor questions answered (or pivot decisions made) — written into `docs/08_DAY0_VERIFICATION.md`
- [ ] Domain owned — registrar receipt screenshot
- [ ] Repo initialized — `docs/`, `EXECUTION_PLAN.md`, `proofs/` directory all present
- [ ] 2 AXL nodes running — `/topology` returns 2 peer IDs, snapshot saved
- [ ] Foundry contracts stubbed — compile clean, addresses TBD on Day 1
- [ ] Next.js app booting with brand tokens — Vercel preview URL live
- [ ] Logo assets generated (3-4 variants, best one selected)
- [ ] Claude Design system configured
- [ ] AI Council feedback reviewed and gaps identified — written to `tools/council/`

---

### DAY 1 — AXL Multi-Node + Foundation (Apr 25)

| Hour | Owner | Action | Doc reference |
|---|---|---|---|
| AM | Gabriel | Add 3rd AXL node on local laptop. Validate full mesh. | `docs/02_ARCHITECTURE.md` §2.4 |
| AM | Friend 1 | Deploy `LedgerIdentityRegistry` to **0G Galileo Testnet (ChainID 16602, native 0G token)** + verify on explorer | `docs/02_ARCHITECTURE.md` §2.3 |
| AM | Friend 1 | Confirm reputation strategy: use audited ERC-8004 ReputationRegistry at `0x8004B663…` on Base Sepolia (NOT a custom deployment — 200+ lines of contract code saved per council) | `docs/02_ARCHITECTURE.md` §2.3 |
| AM | Friend 2 | Build Hall homepage in Claude Design | `docs/05_CLAUDE_DESIGN_BRIEF.md` §B Screen 1 |
| PM | Friend 3 | Implement basic AXL pubsub client wrapper (TS); fork the AXL repo's `gossipsub` example | `docs/02_ARCHITECTURE.md` §2.1, §2.4 |
| PM | Friend 3 | Test publishing TASK_POSTED message format | `docs/02_ARCHITECTURE.md` §3.1 |
| EOD | Everyone | Standup + integration test of AM + PM work | — |

**End of Day 1 deliverables (evidence artifacts):**
- [ ] 3 AXL nodes meshed (2 cloud + 1 laptop) — `/topology` JSON snapshotted with 3 peer IDs + 3 Yggdrasil IPv6 addresses
- [ ] `LedgerIdentityRegistry` live on 0G Galileo (16602) — explorer link captured
- [ ] ERC-8004 reputation reads working against `0x8004B663…` on Base Sepolia — `cast call` output saved
- [ ] Hall homepage hi-fi design done
- [ ] AXL client can pub/sub TASK_POSTED messages — message-hash log captured

---

### DAY 2 — Bidding Protocol (Apr 26)

| Owner | Action | Doc reference |
|---|---|---|
| Friend 1 | Deploy LedgerEscrow contract on Base Sepolia + verify on explorer | `docs/02_ARCHITECTURE.md` §2.3 |
| Friend 3 | Implement BID message flow (worker → buyer over AXL direct) | `docs/02_ARCHITECTURE.md` §3.2 |
| Friend 3 | Implement BID_ACCEPTED + AUCTION_CLOSED flow | `docs/02_ARCHITECTURE.md` §3.3 |
| Friend 3 | Implement bid auction logic in buyer agent | `docs/02_ARCHITECTURE.md` §3 |
| Friend 2 | Build Auction Room screen in Claude Design | `docs/05_CLAUDE_DESIGN_BRIEF.md` §B Screen 2 |
| Gabriel | Wire up dashboard to AXL events via SSE proxy | `docs/02_ARCHITECTURE.md` §2.7 |
| Gabriel | Generate worker iNFT portraits (3-4 with seed variations, if time) | `docs/09_BRAND_IDENTITY.md` §10, `docs/04_HIGGSFIELD_PROMPTS.md` |

**End of Day 2 deliverables (evidence artifacts):**
- [ ] `LedgerEscrow` contract deployed on Base Sepolia — explorer link captured
- [ ] End-to-end task post → bid → accept flow over AXL works — captured as a tcpdump excerpt + AXL message-hash log
- [ ] Auction Room screen designed
- [ ] SSE pipeline streaming AXL events to frontend — recorded as a screen capture

---

### DAY 3 — ENS Resolver + Settlement (Apr 27)

| Owner | Action | Doc reference |
|---|---|---|
| Friend 1 | Wire LedgerEscrow `releasePayment` to call `feedback()` on the audited ERC-8004 ReputationRegistry on Base Sepolia | `docs/02_ARCHITECTURE.md` §2.3, §4 |
| Friend 3 | Implement on-chain bid bond escrow logic on Base Sepolia (no x402 — that was HTTP middleware, not an escrow primitive) | `docs/02_ARCHITECTURE.md` §3 |
| Friend 1 | Register parent ENS name on Sepolia (e.g. `ledger.eth` or fallback `ledger-agents.eth`) — Sepolia faucet ETH first | `docs/02_ARCHITECTURE.md` §2.5 |
| Friend 1 | Skeleton CCIP-Read offchain resolver for `who.<agent>.<parent>.eth` proxying `ownerOf()` from 0G Galileo (16602). Deploy to Vercel/Cloudflare. | `docs/02_ARCHITECTURE.md` §2.5 |
| Friend 2 | Build Worker Profile screen in Claude Design — include ENS name in 96px Fraunces + capability tree on the right | `docs/05_CLAUDE_DESIGN_BRIEF.md` §B Screen 3 |

**End of Day 3 deliverables (evidence artifacts):**
- [ ] LedgerEscrow successfully writes an ERC-8004 feedback record on Base Sepolia — tx hash captured
- [ ] Bid bonds locked + returned correctly — two tx hashes captured
- [ ] Parent ENS name owned on Sepolia — `app.ens.domains/sepolia/<name>` screenshot
- [ ] CCIP-Read resolver skeleton deployed and reachable — HTTPS endpoint live
- [ ] Worker Profile screen designed

---

### DAY 4 — 0G Compute + Real Reasoning (Apr 28)

| Owner | Action | Doc reference |
|---|---|---|
| Friend 3 | Wire 0G Compute `/chat/completions` into worker agent (model: GLM-5 or Qwen3.6-Plus); surface attestation digest from `broker.inference.verifyService` SDK | `docs/02_ARCHITECTURE.md` §2.6 |
| Friend 3 | Implement Base Yield Scout task end-to-end (from prompt to JSON output) | `docs/01_PRD.md` §1, `docs/02_ARCHITECTURE.md` §3 |
| Gabriel | Run AI Council Prompt 4 (Inheritance Mechanics Check) | `docs/06_AI_COUNCIL_PROMPTS.md` Prompt 4 |
| Friend 1 | Implement RESULT message + buyer signature flow | `docs/02_ARCHITECTURE.md` §3.4 |
| Friend 2 | Polish Hall + Auction Room screens in Claude Design | — |

**End of Day 4 deliverables (evidence artifacts):**
- [ ] Worker completes a real Base Yield Scout task using 0G Compute — JSON output saved + attestation digest hash recorded
- [ ] Full job cycle (post → bid → execute → pay) works end-to-end on testnet — captured as a video clip + tx hashes
- [ ] Inheritance design pattern locked from AI Council feedback — written to `tools/council/`

---

### DAY 5 — iNFT (Apr 29)

| Owner | Action | Doc reference |
|---|---|---|
| Friend 1 | Implement `WorkerINFT.sol` per ERC-7857 (0G iNFT draft standard); reference `0glabs/0g-agent-nft@eip-7857-draft` impl | `docs/02_ARCHITECTURE.md` §2.3 |
| Friend 1 | Mint test iNFT on 0G Galileo (16602), verify metadata pointing to 0G Storage | `docs/02_ARCHITECTURE.md` §4.1 |
| Friend 3 | Implement memory storage on 0G Storage via `uploadFile` / `downloadFile` SDK (NOT flow contracts) | `docs/02_ARCHITECTURE.md` §2.6 |
| Friend 3 | Modify worker agent to read/write memory from 0G Storage; AES-256-CTR key-rebind via TEE oracle on transfer | — |
| Gabriel | Test transfer flow: mint → transfer → new owner can access memory | `docs/01_PRD.md` §3.2 |

**End of Day 5 deliverables (evidence artifacts):**
- [ ] Worker iNFT minted on **0G Galileo Testnet (ChainID 16602)** — token address + tokenId + explorer link captured
- [ ] Worker memory persists across sessions in 0G Storage — CID captured
- [ ] iNFT transfers between wallets, new owner accesses memory — CID before/after + transfer tx hash captured

---

### DAY 6 — Inheritance Flow (Apr 30)

| Owner | Action | Doc reference |
|---|---|---|
| Friend 1 | Modify LedgerEscrow to look up current iNFT owner via `ownerOf()` on 0G Galileo at payment time (mid-flight transfer semantics — payment flows to the owner at settlement time) | `docs/02_ARCHITECTURE.md` §5 |
| Friend 3 | Pre-bake hero worker reputation: 47 employer-signed feedback records seeded to the audited ERC-8004 ReputationRegistry at `0x8004B663…` on Base Sepolia | `docs/03_DEMO_SCRIPT.md` "Pre-Production" |
| Friend 2 | Build Inheritance Modal screen in Claude Design — include "Live ENS resolution" panel showing `who.<agent>.<parent>.eth` flipping owners | `docs/05_CLAUDE_DESIGN_BRIEF.md` §B Screen 4 |
| Gabriel | Test the demo's central flow: post task → mid-flight transfer → new owner earns | — |

**End of Day 6 deliverables (evidence artifacts):**
- [ ] Inheritance flow works end-to-end — recorded as a video clip showing wallet flip + payment recipient
- [ ] 47 ERC-8004 feedback records seeded on Base Sepolia — explorer link with all 47 visible
- [ ] Inheritance Modal designed

---

### DAY 7 — Frontend Wiring (May 1)

| Owner | Action | Doc reference |
|---|---|---|
| Friend 2 | Export Claude Design screens to React/Tailwind | `docs/05_CLAUDE_DESIGN_BRIEF.md` §D |
| Friend 2 | Wire Hall + Auction Room + Worker Profile + Inheritance Modal to live data | — |
| Friend 2 | Implement AXL topology visualization (animated packets) | — |
| Friend 2 | Build the Capability Tree Viewer page (`/agent/<ens-name>`) rendering live resolution of `who`, `pay`, `tx`, `rep`, `mem` namespaces — custom UI since the official ENS app may not render our text records | `docs/05_CLAUDE_DESIGN_BRIEF.md` Screen 6 |
| Friend 2 | Build the Settlement Status Strip component (USDC paid ✓ / ERC-8004 feedback ✓ / 0G Storage CID ✓ / `pending_reconcile` if a leg lags) | `docs/05_CLAUDE_DESIGN_BRIEF.md` Screen 5 |
| Gabriel | Implement "Demo Mode" toggle: pre-staged task + scripted demo controls | `docs/02_ARCHITECTURE.md` §6 |
| Gabriel | Run AI Council Prompt 5 again (gaps from Day 0 list closed?) | `docs/06_AI_COUNCIL_PROMPTS.md` Prompt 5 |
| Friend 1 + 3 | Integration testing: full demo flow on testnet, repeat 5 times | — |

**End of Day 7 deliverables (evidence artifacts):**
- [ ] Frontend connected to all backend systems — live deployment URL
- [ ] AXL topology visualization animated and live
- [ ] Capability Tree Viewer renders all 5 namespaces — `cast resolve` outputs verified for `who`, `pay`, `tx`, `rep`, `mem`
- [ ] Settlement Status Strip shows three legs correctly
- [ ] Demo Mode toggles work
- [ ] Full demo flow runs end-to-end without manual intervention — recorded as a B-roll fallback take

---

### DAY 8 — Polish + Recording Prep (May 2 evening — TONIGHT, ~5 hours)

This is the night before the deadline. **Recording, polish, sponsor-Discord posts, and AI Council Prompt 7 all happen TONIGHT** — not Day 9 — so findings are actionable on the May 3 sprint.

| Owner | Action | Doc reference |
|---|---|---|
| Friend 2 | Final visual polish on all UI screens (typography, spacing, motion) — Hall, Auction Room, Worker Profile, Inheritance Modal, Settlement Status Strip, Capability Tree Viewer | `docs/09_BRAND_IDENTITY.md` |
| Friend 3 | Generate Higgsfield Shot 1 (Cinematic Open) and Shot 3 (Inheritance Handoff, 12s) — multi-model image stage in Soul 2 / Cinema Studio, then i2v. Shot 2 (iNFT crystal) is **CUT** per council. | `docs/04_HIGGSFIELD_PROMPTS.md` |
| Gabriel | Lock the Higgsfield Shot 3 cut by EOD May 2 (no retakes after tonight) | — |
| Gabriel | Sponsor Discord posts: 1-line update with WIP repo link to **0G + Gensyn + ENS** Discord channels. ENS especially — Greg mentioned a project feedback session in his workshop; surface that time and submit our WIP for feedback before final cut. | — |
| Gabriel | Run **AI Council Prompt 7 (final demo polish)** TONIGHT. Findings need to be actionable on May 3 morning — running it Day 9 14:00 leaves them stranded. Lead-only execution; council mechanic burns wall-time we don't have. | `docs/06_AI_COUNCIL_PROMPTS.md` Prompt 7 |
| Everyone | Pre-recording dress rehearsal: full 4-min run-through. Capture B-roll fallback + cache `cast resolve` outputs for ENS namespaces (in case the resolver gateway flickers during recording) | `docs/03_DEMO_SCRIPT.md` |

**End of Day 8 (May 2 evening) deliverables (evidence artifacts):**
- [ ] All UI screens at production quality — Vercel preview URL + Polish-gate score ≥90 per route
- [ ] Higgsfield Shot 1 + Shot 3 generated and locked — files in repo
- [ ] AI Council Prompt 7 findings written to `tools/council/`
- [ ] Sponsor Discord posts sent (0G + Gensyn + ENS); ENS feedback-session time captured if surfaced
- [ ] Pre-cached `cast resolve` outputs saved to `/tmp` for fallback during recording
- [ ] Inheritance flip recorded as a video clip (proof-of-flow, even before final demo)

---

### DAY 9 — May 3: Finish Features → Record → Submit (single calendar day, hard deadline 21:30 IST = 12:00 PM EDT)

Day 9 and Day 10 in the original plan were the same calendar date. Compressed into one. Schedule below splits into morning / afternoon / evening sub-blocks.

#### May 3 morning (09:00 IST → 13:00 IST, ~4 hours): finish features

| Hour | Owner | Action | Doc reference |
|---|---|---|---|
| 09:00 | Friend 1 | Add remaining ENS resolver namespace handlers: `pay`, `tx`, `rep`, `mem`. Wire HD-derivation for `pay.<agent>.<parent>.eth` (auto-rotating receive addresses; cite Fluidkey as inspiration in How-it's-made) | `docs/02_ARCHITECTURE.md` §2.5 |
| 09:00 | Friend 1 | Set ENSIP-25 `agent-registration` text record on parent name pointing to ERC-8004 deployment at `0x8004B663…` on Base Sepolia | `docs/02_ARCHITECTURE.md` §2 |
| 09:00 | Friend 2 | Final Capability Tree Viewer page polish — verify-derivation buttons, real-time refresh on transfer | `docs/05_CLAUDE_DESIGN_BRIEF.md` Screen 6 |
| 11:00 | Friend 3 | Wire AXL topology view into the dashboard; confirm 3 peer IDs render | — |
| 11:00 | Gabriel | Final smoke test of full demo flow on Vercel preview URL | — |

**Note:** KeeperHub MCP integration is **OUT** (sponsor swapped). The slot is replaced by ENS resolver work, ENSIP-25 text record, and the Capability Tree Viewer page above.

**Morning evidence artifacts:**
- [ ] All 5 ENS namespace handlers live — `cast resolve` for each captured
- [ ] ENSIP-25 text record set on parent — `cast call` output captured
- [ ] Capability Tree Viewer renders all 5 namespaces in the UI

#### May 3 afternoon (13:00 IST → 17:00 IST, ~4 hours): record + edit

| Hour | Owner | Action | Doc reference |
|---|---|---|---|
| 13:00 | Friend 3 | Record voiceover via Eleven Labs (multiple takes) | `docs/03_DEMO_SCRIPT.md` |
| 13:00 | Gabriel + team | Record demo screencast — 3+ full takes minimum. **Muted 5-second test** on first take to decide cinematic-first vs. inverted-hook-first opening (see `docs/03_DEMO_SCRIPT.md` 0:00–0:15). | `docs/03_DEMO_SCRIPT.md` |
| 15:00 | Friend 3 | Edit video: voiceover + screen recording + Higgsfield Shot 1 + Shot 3. Apply hard-cut sponsor logo sequence (0G + Gensyn + ENS, 3s each, no crossfade). | — |
| 16:00 | Everyone | Watch first cut, identify 3 most impactful edits, apply | — |
| 17:00 | Friend 3 | Final cut locked. Upload to YouTube/Vimeo, get share link. Custom thumbnail set (split-screen, two laptops, wallet→wallet, worker stat card). | — |

Target completion: ≤17:00 IST. That leaves a 4-hour evening buffer for README + proofs + submission.

**Afternoon evidence artifacts:**
- [ ] Final 4-minute demo video uploaded — YouTube/Vimeo URL
- [ ] Custom thumbnail uploaded
- [ ] Voiceover audio archived in repo as backup

#### May 3 evening (17:00 IST → 21:30 IST hard deadline, ~4.5 hours): README + proofs + submit

| Hour | Owner | Action | Doc reference |
|---|---|---|---|
| 17:00 | Gabriel | Build the **30-second elevator cut** alongside the 4-min cut (judges sometimes only watch first 30s) | — |
| 17:30 | Gabriel | README final pass: Pull quote ("The workers are the assets.") + **Proof Matrix populated with real artifacts** (token IDs, CIDs, attestation digests, peer IDs, contract addresses, ENS names) + What-it-is + Architecture diagram + Sponsor sections (0G / Gensyn / ENS) + How-it's-made + Future work. **Do NOT include the Ledger SAS trademark acknowledgment** (architect's call — invites scrutiny). | `docs/07_SUBMISSION_PACK.md` §C |
| 18:30 | Gabriel | Sponsor proof docs at repo root: `proofs/0g-proof.md`, `proofs/axl-proof.md`, `proofs/ens-proof.md` — each ≤1 screen, evidence inline | — |
| 19:00 | Friend 1 + 3 | Final smoke test of live deployment URL (incognito window) | — |
| 19:30 | Gabriel | Verify repo public, all commits dated April 24+, all 4 team wallets listed for prize disbursement | — |
| 20:00 | Gabriel | Fill ETHGlobal submission form. **Partner prizes: 0G + Gensyn + ENS** (KeeperHub removed). | `docs/07_SUBMISSION_PACK.md` §A |
| **20:30** | **Gabriel** | **SUBMIT — 1 hour buffer before 21:30 IST hard deadline.** | — |
| 20:30–21:30 | Gabriel | Iterate README until cutoff. Post in ETHGlobal Discord #showcase. | — |

**Evening evidence artifacts:**
- [ ] README has Proof Matrix populated (every claim → evidence link)
- [ ] `proofs/0g-proof.md`, `proofs/axl-proof.md`, `proofs/ens-proof.md` filed
- [ ] 30-second elevator cut available as separate link
- [ ] Submission form filled and **submitted by 20:30 IST**

**End of May 3:**
- [ ] Submitted ✅ (≥1h before 21:30 IST)
- [ ] Repo public ✅
- [ ] 4-min demo + 30s elevator cut both live ✅
- [ ] Partner prizes applied: **0G + Gensyn + ENS** ✅
- [ ] No `FEEDBACK_KEEPERHUB.md`. No `FEEDBACK_ENS.md` either (ENS has no feedback-bounty). ✅
- [ ] Beer ✅

---

## Cross-Session Continuity Workflow

When you start a new Claude Code session for any task, follow this exact pattern:

### Pattern A — Working on a feature (most common)

```
Session opens →
  Step 1: Paste docs/00_MASTER_BRIEF.md
  Step 2: Paste docs/01_PRD.md (full PRD context)
  Step 3: Paste docs/02_ARCHITECTURE.md (technical reference)
  Step 4: Paste docs/09_BRAND_IDENTITY.md ONLY IF doing UI work
  Step 5: Tell Claude what specifically you're working on
  Step 6: Reference the specific Day's tasks from this navigator
```

### Pattern B — Stuck or debugging

```
Session opens →
  Step 1: Paste docs/00_MASTER_BRIEF.md
  Step 2: Paste only the relevant section of docs/02_ARCHITECTURE.md
  Step 3: Paste your error / what's failing
  Step 4: Don't paste the entire codebase — let Claude ask for files
```

### Pattern C — Decision / strategy questions

```
Session opens →
  Step 1: Paste docs/00_MASTER_BRIEF.md
  Step 2: Paste docs/06_AI_COUNCIL_PROMPTS.md if running a brainstorm
  Step 3: Skim tools/council/STAGE3_CHAIRMAN.md for prior council decisions
  Step 4: State the decision you're trying to make
```

### Pattern D — Final submission day

```
Session opens →
  Step 1: Paste docs/00_MASTER_BRIEF.md
  Step 2: Paste docs/07_SUBMISSION_PACK.md
  Step 3: Ask for help filling the specific form section
```

---

## Tools-to-Documents Map

Quick reference of which tool consumes which document:

| Tool | Documents to feed in |
|---|---|
| **Claude Code Max** (primary) | `docs/00`, `docs/01`, `docs/02`, `docs/09` + relevant code files |
| **Codex Max** | `docs/00`, `docs/01`, `docs/02` (architecture only, for one-shot scripts) |
| **AI Council** | `docs/00` + the specific prompt from `docs/06` + the relevant context document |
| **Claude Design** | `docs/05` (and `docs/09` brand identity uploaded as assets) |
| **Higgsfield (image)** | `docs/09` §3 (logo prompts), `docs/09` §10 (asset list) |
| **Higgsfield (video)** | `docs/04` (cinematic shot prompts — Shot 1 + Shot 3 only; Shot 2 is cut) |
| **Eleven Labs (voice)** | `docs/03` (demo script as voiceover input) |
| **DaVinci Resolve / Editor** | `docs/03` (demo script as edit guide) + Higgsfield clips + screen recording |

---

## What to Do When Things Break

| Symptom | Likely cause | Fix |
|---|---|---|
| Claude session forgets the project | Didn't paste `docs/00_MASTER_BRIEF.md` | Paste it. Always paste it. |
| Claude suggests technologies you removed (KeeperHub, x402, Uniswap) | Brief outdated or not pasted | Paste `docs/00` + restate: "Sponsor slate is 0G + Gensyn + ENS. KeeperHub and x402 are removed. See `tools/council/STAGE3_CHAIRMAN.md`." |
| Different AI tools give conflicting architecture advice | Each session built different mental models | Run AI Council Prompt 1 to surface conflicts, then make a decision and lock it in `docs/02_ARCHITECTURE.md` |
| You're running out of time | Likely AXL multi-node or ENS resolver gateway flaky | Pivot to single-machine simulation for AXL; for ENS, use pre-cached `cast resolve` outputs in `/tmp` from dress rehearsal. Document honestly in submission. |
| The video feels like a generic crypto demo | Higgsfield prompts not aggressive enough about restraint | Re-read `docs/09` §6 (voice) and `docs/04` (negative prompts) — push hard against neon, sparkles, "epic" |
| Demo recording keeps failing | Not enough buffer time on May 3 | Always have a pre-recorded canonical run as B-roll fallback (captured during May 2 evening dress rehearsal) |
| 0G Galileo public RPC unreliable | Public node congestion | Builder C's private node + 30s TTL cache on `ownerOf()` reads covers it |
| ENS resolver gateway down | Vercel/Cloudflare blip | Fall back to pre-cached `cast resolve` outputs captured during dress rehearsal |

---

## Emergency Pivot Plans

These are pre-decided pivots so you don't waste time deliberating mid-build:

**Note (May 2):** All 5 Day-0 questions are now resolved per `docs/08_DAY0_VERIFICATION.md`. Q3 (KeeperHub testnet) is moot — KeeperHub is no longer in the slate. Pivots below cover late-stage failure modes.

### If iNFT memory transfer fails (late discovery)
**Pivot:** Implement a simple registry contract that maps `iNFT.tokenId → memoryKey`, where the memoryKey is stored as encrypted data accessible only to the current owner. Lose 1 day, keep the demo.

### If 0G Compute access flickers
**Pivot:** Pre-record the compute call output, replay deterministically in demo. Update `proofs/0g-proof.md` with the observed friction.

### If AXL never meshes reliably
**Pivot:** Use 3 cloud VMs only, no laptop. Demo uses screen-share view of 3 separate VPS terminals. Less authentic, still meets the cross-node requirement.

### If ENS CCIP-Read resolver gateway flakes during recording
**Pivot:** Use pre-cached `cast resolve` outputs captured during dress rehearsal. The owner-flip moment can be visualized via the Capability Tree Viewer reading from cached data. Document the flake honestly in the submission How-it's-made section.

### If something major breaks late
**Pivot:** Cut iNFT inheritance from the demo, ship without it. The demo becomes "agent labor market" instead of "agent labor market + secondary asset market." 0G Track B score drops significantly but Gensyn + ENS still in reach. **Avoid this. Inheritance is the punchline (and is the visible 5-second "oh" — the ENS resolution flip that makes the demo win).**

---

## What Success Looks Like

Sponsor slate (post May 2 council): **0G** ($15K pool, dual-track) + **Gensyn AXL** ($5K) + **ENS** ($5K, dual-track). Total addressable pool: **$25K** (up from $20K under the prior KeeperHub slate).

**Floor (no finalist, decent sponsor placements):** $3,000-4,000 in sponsor cash.

**Median (target):** Finalist + 2 sponsor placements = $4,000 (4× $1,000 USDC) + $3,000–5,000 sponsor = **$7,000–9,000**.

**Stretch:** Finalist + 3 strong sponsor placements = $4,000 + $5,500–9,000 sponsor = **$9,500–13,000**.

**Ceiling (everything 1st place + finalist):** ~$12,000–15,000.

Equally important: **portfolio piece, post-hackathon Gensyn Foundation grant fast-track, network of 4 teammates who shipped under pressure, and a working product on real testnet.** The cash is one of four prizes. Don't lose sight of the others.

---

## Final Note

This is the **v3 plan** — the result of 4-lens council review (Architect, Strategist, Redteam, Director) across Stages 1-3 of the May 2 council pass, plus alt-council Stage 3 input. Pivots are logged in `tools/council/`. The architecture is the result of structured review, not a fresh draft. That's not the same as "locked" — surprises are still possible. But the structural decisions (sponsor slate, sponsor swap KeeperHub → ENS, schedule compression to a single May 3 day, "atomically" struck from cross-chain language, audited ERC-8004 instead of custom registry, Higgsfield Shot 2 cut) all have explicit rationale captured.

The remaining time is about **execution discipline**:
- Don't ideate when you should ship
- Don't add scope when you should cut
- Don't perfect when you should record
- Don't wait when you should ask
- Each day produces evidence artifacts, not just compiling code
- When a council decision feels wrong in the moment, re-read `tools/council/STAGE3_CHAIRMAN.md` before re-litigating

You have everything you need. **Go.**
