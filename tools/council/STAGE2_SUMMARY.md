# Council Stage 2 — Summary

*Aggregated cross-critique across all 4 council members. Used by Chairman (Stage 3) as input.*

---

## Final Rankings (each member ranks all 4 responses)

Mapping: A = Architect (Opus 4.7), B = Strategist (Codex GPT-5.5), C = Redteam (Codex GPT-5.5), D = Director (Opus 4.7)

| Voter | 1st | 2nd | 3rd | 4th |
|---|---|---|---|---|
| Strategist (B) | A | C | D | B |
| Redteam (C) | B | A | D | C |
| Director (D) | B | A | C | D |
| Architect (A) | B | C | D | A |

### Aggregate (sum of ordinal positions; lower = better)

| Response | Sum | Avg | Rank |
|---|---|---|---|
| **B (Strategist)** | 7 | 1.75 | **🥇 #1** |
| A (Architect) | 9 | 2.25 | 🥈 #2 |
| C (Redteam) | 11 | 2.75 | 🥉 #3 |
| D (Director) | 13 | 3.25 | #4 |

**3 of 4 voters put Strategist (B) first.** The strategist response had the highest *delta-to-outcome* — its proof-matrix + per-sponsor proof-doc + 30-second elevator cut prescriptions were rated as the most actionable.

The Architect response (A) was the strongest *technical* critique — caught the cross-chain atomicity bug, ERC-8004 misuse, missing AUCTION_CLOSED, and the Day 9 = Day 10 schedule fiction. Universally seen as #2.

The Redteam (C) was the *credibility-defense* critique — found the kill-shot sentence and the radioactive lines in the docs. But faulted for being attack-only with no constructive alternatives.

The Director (D) was rated last by 3 of 4 voters — strong on demo-craft (inverted hook, muted-autoplay, 90-second cliff) but blind to the technical hazards that would implode the demo in Q&A.

---

## Cross-cutting consensus (the 5 findings with ≥ 3-way convergence)

These are the highest-priority document changes — each one was flagged by multiple lenses from independent angles, so they are the most defensible.

### 1. The Inheritance moment must be split-screen + still + with the `ownerOf()` line

**Convergence:** A (mid-flight semantics + ownerOf line), B (split-screen wallet at 2:50), C (real artifacts not assertions), D (stillness, cut "ERC-7857. An iNFT" from VO).

**Concrete edit:** rewrite `03_DEMO_SCRIPT.md` 2:00–3:15 as one sequence:
- Cut Higgsfield Shot 2 (crystal) entirely, OR trim to 8s transition wipe
- Replace 2:00–2:15 with hard cut to worker profile UI, stats rendering in 96px Fraunces, 3s of silence
- At 2:50, split-screen: old wallet fading / `+4.50 USDC` arriving in new wallet / same `WorkerINFT #12345 · 47 jobs · 4.7` in center
- Insert one VO line at 2:55: *"The escrow checks the current owner at payment time. That's how the inheritance is enforced."*
- Show real Base Sepolia tx hash and 0G explorer ownerOf result on screen

### 2. Kill the simulated KeeperHub reroute UI fallback — it's radioactive

**Convergence:** C (named radioactive), B (KeeperHub Main = 35% probability if simulated), A (sealed-inference asserted-not-proven is the same overclaim family).

**Concrete edit:** delete `03_DEMO_SCRIPT.md` lines 812–816 ("manual override that simulates the reroute UI") and `02_ARCHITECTURE.md` references to the same. Replace with: *"If the spike fails on demo day, redo the take. Do not ship a simulated reroute UI."* If real KeeperHub gas-spike reroute can't be triggered on testnet, demote the beat to a smaller *real* KeeperHub success (e.g., RPC-failure retry) and rewrite the VO. Better a smaller real moment than a faked big one.

### 3. Proof Matrix at the top of the README + 3 sponsor proof docs

**Convergence:** B (proposed it), C (every claim is a Q&A trap without evidence), A (demands hashes / consistency model / attestation).

**Concrete edit:** in `07_SUBMISSION_PACK.md` README template, insert at the top (after tagline, before "What it is"):

| Claim | Evidence |
|---|---|
| Worker is an ERC-7857 iNFT | token address + tokenId + 0G explorer link |
| Memory persists on 0G Storage | CID before/after transfer + metadata link |
| AXL is real P2P | 3 node IDs + machine locations + log excerpt path |
| KeeperHub submitted txs | request IDs + tx hashes + confirmation times |
| Ownership changes earnings | ownerBefore/ownerAfter + payment recipient tx |

Plus 3 companion files (one screen each): `/docs/0g-proof.md`, `/docs/axl-proof.md`, `/docs/keeperhub-proof.md`.

### 4. Strike "atomically" from cross-chain settlement language

**Convergence:** A (named it directly — KeeperHub cannot make 0G + Base txs atomic), B/C/D (acknowledge as part of the overclaim family).

**Concrete edit:** in `02_ARCHITECTURE.md` §4 step T+12, replace "atomically" with: *"two-phase commit, eventually consistent within ~10s. KeeperHub guarantees both txs fire; the dashboard surfaces a `pending_reconcile` state if one lags. See §4.1 Settlement consistency model."* Add §4.1 with the eventual-consistency model. Add a "Settlement Status Strip" UI in the dashboard.

### 5. Schedule reality — Day 9 and Day 10 are the same calendar date

**Convergence:** A flagged this directly. The other 3 didn't catch it but didn't dispute it.

**Concrete edit:** move recording to **today (May 2 evening)** — don't wait for May 3 morning. Lock Higgsfield Shot 3 by EOD May 2. Submit by May 3 noon, not May 3 evening. Run final-cut review tonight, not Day 9 14:00.

---

## Conflicts the team must adjudicate

These are places where two responses give incompatible advice. The team has to choose.

### Conflict 1 — Cut Base Sepolia, or keep it?

- **A says cut.** Move USDC to 0G Sepolia, eliminate the cross-chain "atomic" claim entirely.
- **B implies keep.** Base Sepolia is part of the recognizable settlement evidence; KeeperHub's gas-spike story is built on adverse-condition proof on a real EVM testnet.

**Resolution criterion** (from architect's own Stage 2 self-correction): **"A's words, B's chain choice."** Keep Base. Just rewrite "atomically" → "two-phase, eventually consistent" + Settlement Status Strip UI. Cutting the chain at Day 8 is high-risk for a defensive correctness gain that wording fixes solve.

### Conflict 2 — Higgsfield Shot 2 (iNFT crystal): cut or keep?

- **D says cut entirely.** The actual iNFT is the data, not a crystal — replace with slow camera push on profile UI in 96px Fraunces.
- **A says keep all 3 shots, only cut the optional sigil.**

**Resolution criterion:** Higgsfield credit budget AND Shot 3 quality. Shot 3 (Inheritance Handoff) is the only cinematic doing real emotional work and must be perfect. If iterating Shot 2 would burn 4–8 hours that should go to Shot 3 retakes, cut Shot 2. If Higgsfield credits are abundant and Shot 3 already lands, keep Shot 2 but trim to 8 seconds as a transition wipe.

### Conflict 3 — 47-job pre-baked reputation: drop or disclose?

- **C says drop or brutally disclose.** The 47 fake employer attestations are reputation laundering.
- **B and D's demos rely on the numbers being visible.** D's inverted hook opens on the worker stat card with 47 jobs filling the frame.

**Resolution criterion** (from architect's Stage 2): **keep the numbers, disclose them honestly.** Add one sentence to README's "How it's made":

> *"The hero worker's reputation history (47 jobs, 47 employer-signed completions) is seeded for demonstration. The reputation contract accepts any employer-signed completion; production deployments derive history from real task settlements."*

That's C's integrity bar in two sentences with no loss to B's proof matrix or D's cold open.

### Conflict 4 — Lead with cinematic globe, or D's inverted hook?

- **D says hard-invert.** Open at 0:00 with a worker stat card transferring; cinematic globe becomes a transition.
- **Original plan (and parts of B's strategy) keep the cinematic open + reveal at 2:45.**

**Resolution criterion:** muted 5-second test with 2 uninformed viewers. If they don't say "an AI worker changed owners and kept earning" within 5 seconds, use D's inverted open.

### Conflict 5 — All on-chain actions through KeeperHub, or only one high-stakes flow?

- **A says keep all-actions-through-KeeperHub** — strategically and architecturally correct.
- **B says focus KeeperHub on one adverse-condition payment release** — routing low-stakes actions can be drag.

**Resolution criterion:** demo evidence by EOD May 2. If all-actions-through-KeeperHub already works, keep — strengthens sponsor story. If not, narrow the claim to flows with real KeeperHub request IDs / tx hashes; don't leave a broad claim unproven.

---

## What changed in the architect's view between Stages 1 and 2 (self-correction)

The architect (Opus 4.7) read the other lenses and self-corrected on:

1. **Renaming `LedgerReputationRegistry → LedgerWorkScoreRegistry`** is a 2-4 hour code/deploy/test change — wrong scope for Day 8 with one day left. Downgrade to "rename in submission/README copy only."
2. **Recommending to cut Base Sepolia** — too disruptive at this stage. Keep Base, fix the wording. Architect adopted strategist's chain choice + own correctness language ("A's words, B's chain choice").
3. **Underweighted the simulated-reroute-UI fallback** in Stage 1; redteam correctly identified it as the highest-fraud-smell line in the entire bundle.

This is the kind of update that justifies the council mechanic — the architect would not have changed these positions without seeing the other lenses.

---

## What this means for Stage 3 (Chairman synthesis)

The synthesis output should be:

1. A consolidated list of **document changes to make** (the 5 consensus + the 5 conflicts resolved per their criteria).
2. A **build-vs-cut decision matrix** for the conflicts.
3. A **priority-ordered punch list** for May 2 evening / May 3 morning, given the schedule reality.

Stage 3 is held until sponsor research lands (3 background research agents on 0G+ERC-7857, Gensyn AXL, KeeperHub+ETHGlobal+ERC-8004). The research will directly resolve some open questions (testnet support, sealed-inference access, NAT traversal, ERC-7857 actual transfer semantics, "max 3 partner prizes" rule).
