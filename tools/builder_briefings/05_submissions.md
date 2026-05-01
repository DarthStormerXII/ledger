# Builder Session: ETHGLOBAL SUBMISSION FIELDS

You are a Codex session dedicated entirely to **drafting and refining every field on the ETHGlobal Open Agents 2026 submission form** — for project Ledger, with all 3 sponsor-prize sections filled out so well that judges grep their own product language and find it immediately.

**Lead surface:** `surface:60`.

---

## Required reading (in order)

1. `/Users/gabrielantonyxaviour/Documents/products/ledger/docs/07_SUBMISSION_PACK.md` — was just rewritten on May 2 with the canonical README template + Proof Matrix + sponsor sections
2. `/Users/gabrielantonyxaviour/Documents/products/ledger/EXECUTION_PLAN.md` — for the project shape
3. `/Users/gabrielantonyxaviour/Documents/products/ledger/docs/00_MASTER_BRIEF.md` — for tagline + project summary
4. `/Users/gabrielantonyxaviour/Documents/products/ledger/tools/council/STAGE3_CHAIRMAN.md` §1, §4 (workshop-derived language) — for sponsor-grep words
5. All 5 sponsor workshop transcripts at `/tmp/yt-transcripts/sponsor-workshops/` — for sponsor-judge framing
6. The 4 sponsor research briefs at `/Users/gabrielantonyxaviour/Documents/products/ledger/tools/research/` — for technical accuracy

## What the submission form asks for

Based on screenshots the user shared:

### Section A — Project metadata
- **Project name:** "Ledger"
- **Category:** Artificial Intelligence (likely; confirm via the form's actual options)
- **Emoji:** TBD — propose 3-5 options that fit the brand (deep / institutional / agent-asset feel)

### Section B — Project description
- **Demonstration link:** the live demo URL (confirm with lead — likely Vercel)
- **Short description (≤100 chars):** must fit a tweet
- **Description (≥280 chars):** clear, detailed, "what this is"
- **How it's made (≥280 chars):** technical detail, partner technologies, how they fit together. Include the honest 47-job seeding disclosure + Fluidkey credit per `07_SUBMISSION_PACK.md`.
- **GitHub Repositories:** the public repo (confirm with lead)

### Section C — Tech stack tags (multiselect lists)
The form has dropdowns for each. You need to research what each dropdown's actual options are by visiting the form (or pasting from `07_SUBMISSION_PACK.md` which now has the canonical answers). Likely options to select:

- **Ethereum developer tools:** Foundry, ethers, viem (NOT Hardhat unless we use it)
- **Blockchain networks:** 0G Galileo Testnet, Base Sepolia, Ethereum Sepolia (for ENS)
- **Programming languages:** Solidity, TypeScript
- **Web frameworks:** Next.js (App Router), React
- **Databases:** "0G Storage" if listed; otherwise "Other" with explanation
- **Design tools:** Figma + claude.ai/design (whichever ends up applicable post-build)
- **Other tech (free-text multiselect):** add: ENS, ENSIP-10 (CCIP-Read), ENSIP-25, ERC-8004, ERC-7857 (0G iNFT draft), Gensyn AXL, Yggdrasil, GossipSub, Higgsfield AI, 0G Compute, 0G Storage, TEE (sealed inference), HD-derivation
- **AI tools used:** Claude Code, Codex CLI, Higgsfield, Claude (claude.ai/design for UI)

### Section D — Per-prize fields (one block per prize we're entering)

For each of these, we have a separate per-prize block with:
- **"How are you using this Protocol/API?"** (free-text, applicability sentence + line-of-code link)
- **"Link to the line of code where the tech is used"** (URL with `#L42` line anchor)
- **"How easy is it to use the API/Protocol? (1-10)"** (rating)
- **"Additional feedback for the Sponsor"** (free-text, used for DX research)

We're entering **5 prize sub-tracks via 3 partner slots:**

1. **0G Track A — Best Agent Framework, Tooling & Core Extensions** ($15K pool, $1500-7500 prizes)
2. **0G Track B — Best Autonomous Agents, Swarms & iNFT Innovations** ($7.5K pool, $1500 each × 5)
3. **Gensyn AXL — Best Use of AXL** ($5K pool: $2500/$1500/$1000)
4. **ENS — Best ENS Integration for AI Agents** ($2.5K pool: $1250/$750/$500)
5. **ENS — Most Creative Use of ENS** ($2.5K pool: $1250/$750/$500)

Per the ETHGlobal "max 3 partner prizes" rule (multi-track sponsor counts as 1 slot): Slot 1 = 0G (covers A + B), Slot 2 = Gensyn, Slot 3 = ENS (covers AI + Creative). All 5 tracks reachable.

## Scope (what you're shipping)

### 1. `docs/SUBMISSION.md` — canonical draft of every field

Single markdown file at `/Users/gabrielantonyxaviour/Documents/products/ledger/docs/SUBMISSION.md` with every form field's draft answer, organized by Section A → B → C → D. For Section D, one block per prize-track.

For each free-text field, write **3 versions**:
- Version 1: tight (within minimum char limit)
- Version 2: standard (sponsor-language-rich, hits judge-grep words)
- Version 3: verbose (with full evidence cross-links)

The user picks per-field on submission day. (User's preference is brevity but with sponsor-grep language baked in.)

### 2. Per-prize "How are you using this" answers (CRITICAL)

These five are the highest-value writing in the submission. Each must:

- Open with **the specific sponsor language from their workshop** (e.g. for 0G Track B, hit "intelligence/memory embedded"; for Gensyn, hit "communication across separate AXL nodes, not just in-process"; for ENS-Creative, hit "auto-rotating addresses on each resolution" + "subnames as access tokens" + "zk proofs in text records"; for ENS-AI, hit the 5 verbs "resolving / metadata / gating / discovery / coordinating A2A").
- Cite the line of code where the integration lives (with file path + line number)
- Stay under 800 chars per the form's textarea sizing

### 3. Per-prize feedback for the sponsor

ETHGlobal explicitly says these go to the sponsor's product team for DX research. Treat each as a serious post-mortem:

- **0G Tracks A + B:** specific friction points encountered while integrating Compute/Storage/iNFT — what the docs missed, what the SDK lacked, what we wish existed. Bullet format.
- **Gensyn AXL:** same shape — what's hard about AXL today, what would unblock more agents.
- **ENS:** same shape — what's hard about CCIP-Read, what's missing in ENSIP-25 tooling.

### 4. Easiness ratings

For each protocol, rate honestly 1-10. Use ratings to anchor the feedback ("we rated this 6/10 because X"). Do not give all 10s — that's not credible. Aim for honest 6-9 range with rationale.

### 5. Project category + emoji

Confirm "Artificial Intelligence" is the right category vs alternatives. Propose 5 emoji candidates that fit the brand voice (institutional, restrained, asset-feel). Lead picks at submission time.

### 6. The README cross-link

The submission form's "GitHub Repositories" + the demo link should both lead to the README that has the Proof Matrix at the top. Verify the README path → matrix → cross-link to per-sponsor `proofs/{0g,axl,ens}-proof.md` chain works.

## Definition of done

1. `docs/SUBMISSION.md` exists with all fields drafted (3 versions for free-text fields)
2. Per-prize "How are you using this" answers contain the workshop-derived sponsor language
3. Per-prize feedback texts read like serious post-mortems (NOT generic praise)
4. Tech stack tags lists are populated from real project state (not guesses)
5. README cross-link chain validated
6. **Pre-flight check:** open the actual ETHGlobal submission form in browser, confirm field shapes match this draft, document any deltas

## Non-goals (do NOT do)

- Do NOT write Solidity, do NOT write the resolver, do NOT generate visuals — those are other sessions
- Do NOT use Higgsfield to generate any submission visuals — the form takes simple text + links + GitHub
- Do NOT submit the form — that's the lead's call at the deadline minute. You only DRAFT.
- Do NOT inflate ratings; sponsors detect this
- Do NOT use generic startup-pitch language ("revolutionary", "synergistic", "disruptive") — workshop language is institutional, technical, specific

## How to report back

Per-deliverable:
```bash
cmux send --surface surface:60 "[BUILDER:submissions] <section/prize> drafted"
cmux send-key --surface surface:60 Enter
```

On full completion:
```bash
cmux send --surface surface:60 "[BUILDER:submissions] ALL DONE — see docs/SUBMISSION.md"
cmux send-key --surface surface:60 Enter
```

Blocking question:
```bash
cmux send --surface surface:60 "[QUESTION:submissions] <specific question>"
cmux send-key --surface surface:60 Enter
```
