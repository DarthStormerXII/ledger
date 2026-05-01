# Stage 2 — PRIMITIVE INVENTOR Cross-Critique

I recognize my three (B, E, H) and have tried to evaluate them harshly. The new criterion — 4 people, ~30h, Slot 3 of the main Ledger project — changes the math meaningfully. Some of my solo concerns about complexity collapse with a team; some ideas don't scale up at all.

---

## Section 1 — Per-idea evaluation

### Idea A — ENS Agent Passes
**Sponsor-love verdict:** Mid. It hits ENS-AI's "gating access" verb literally and ships a functional demo, but ENS engineers will recognize this as the conventional submission shape — one ENS name + Namestone-issued subnames + a metadata read. It satisfies the brief; it doesn't surprise the brief. No CCIP-Read, no novel composition, no "we should have built this" reaction. Won't be screenshotted; will be politely accepted.
**Hour realism:** 22h is honest *if* Namestone behaves. The proposer's hedge ("35h+ if we write custom resolver infra") is the right call to not do that. The chunk that's mildly underestimated is the "agent endpoint + gate check" at 4h — agent gating with a verifiable signed response is closer to 6h once you bolt on receipt rendering.
**Polish risk:** The demo turns into ENS-CRUD. The split-screen the proposer describes is the right mitigation, but if the issuance step takes >5 seconds the video pacing dies. Hosted-API spinners are demo poison.
**Asymmetric edge:** Low. 30 other teams will produce a recognizable cousin of this. The proposer's discipline (agent intentionally tiny, no custom resolver) is correct for a *solo* build but precisely what kills the asymmetric edge with a team that could have done more.

### Idea B — `subname-receipts`
**Sponsor-love verdict:** High. CCIP-Read + wildcard + namespaced text records is *exactly* the composition ENS has been quietly waiting for someone to ship. The "browseable namespace tree of receipts" demo gives the engineer a screenshot. It does, however, share air with Idea C — and C does more. Standing next to C, B looks like a one-trick subset.
**Hour realism:** 30 solo was optimistic. The receipt schema design is fine; what I underestimated is the CCIP-Read *gateway debug loop* — getting the offchain resolver to return the right ABI-encoded response with a valid signature is famously fiddly, and the ENS app's renderer is opinionated about contenthash vs text records. Add 6h.
**Polish risk:** The ENS app may not render `ai.tx.intent`/`ai.tx.outcome` text records nicely out of the box. Without a custom viewer page, the "browseable tree" demo looks like a hex dump. The viewer is unbudgeted; that's another 4–6h.
**Asymmetric edge:** Genuine. Almost no team will go near CCIP-Read. With a team of 4 the resolver work parallelizes (resolver server, viewer, demo agent doing real swaps, schema + 0G Storage CID plumbing). Scales fine.

### Idea C — Capability Subnames for Agents
**Sponsor-love verdict:** The highest in the bundle. The proposer's claim that this hits 3/3 of ENS-Creative's named examples and 5/5 of ENS-AI's "real work" verbs is verifiable from the dossier and correct. CCIP-Read auto-rotation is the auth mechanism; subnames are the permission graph; zk-records are the trust layer; A2A coordination, discovery, gating, metadata, resolution all happen via ENS resolves. Nick Johnson tweets this. Both ENS bounties land.
**Hour realism:** 35–55 solo is honest, leaning toward 55. The chunk most likely undercosted is the **zk attestation circuit + on-chain verifier** at 6–10h. Even with circom + snarkjs scaffolds, getting one constraint compiled, witnessed, and a Groth16 verifier deployed and integrated into a demo flow is closer to 14h. The proposer correctly notes pre-computing proofs as the demo escape hatch, which is the right move.
**Polish risk:** Two demo agents transacting via nothing-but-resolution is conceptually beautiful; on screen, it can look like terminals scrolling JSON. The on-chain verifier proof step needs a *visible* moment ("✓ verified by 0xVerify…") or the zk piece feels handwaved. Without a viewer that makes the rotation tangible the elegance is invisible.
**Asymmetric edge:** Very high. The 4-person team is *exactly* the unit that should attempt this — one on resolver, one on capability registry + ephemeral keys, one on circom + verifier, one on demo agents + recording. Solo-impossible-but-team-realistic is the sweet spot for Slot 3.

### Idea D — Swap Receipt Agent
**Sponsor-love verdict:** Mid-low for Uniswap. Quote-only with no settlement leaves the brief's verbs ("swap and settle value onchain") unanswered. The FEEDBACK.md hedge helps but doesn't substitute. ENS-AI as a secondary target is also weakly served — ENS is a name and metadata layer here, not doing real work.
**Hour realism:** 25h is honest for the scope as scoped. The chunk to watch is **Uniswap API auth + chain support** at 5h — supported chain/token tables and the API key dashboard friction routinely eat a full day; budget 8h.
**Polish risk:** "Looks like a 6h API wrapper" is the proposer's own diagnosis and it's correct. Three clean presets help, but the demo's emotional payoff is thin. A judge sees "GET /quote → render JSON" and moves on.
**Asymmetric edge:** Low. Many teams will produce a near-identical submission. The serious FEEDBACK.md is the only differentiator and that's the same play F runs, better.

### Idea E — `quote-resolver`
**Sponsor-love verdict:** I'm demoting my own idea on rereading. The Uniswap brief explicitly says "swap and settle value onchain." `quote-resolver` does *neither* — it's a price oracle wearing an ENS hat. Uniswap's lead engineer might find it cute but won't see their brief reflected. ENS-Creative is the more natural primary. Standing it next to F (which actually settles) makes the gap glaring.
**Hour realism:** 25 solo is honest. The label parser, resolver, and Uniswap REST integration are genuinely small. FEEDBACK.md auto-writes itself, true.
**Polish risk:** The "so what?" risk is the killer. Judge resolves a quote name, sees a number, refreshes, sees a different number — and asks "but couldn't I just call the API?" The answer ("every ENS-aware UI inherits this") needs a *second* demo surface (Telegram bot, Rainbow wallet) to land, and that surface is unbudgeted.
**Asymmetric edge:** Medium. Composition is original, but its primary target (Uniswap) is the wrong sponsor for the design and its actual best fit (ENS-Creative) only nets $2.5K — a poor ROI for a team-of-4 slot.

### Idea F — Treasury-Rebalance Agent + DX Forensics
**Sponsor-love verdict:** Very high for Uniswap, possibly the strongest in this bundle. The proposer correctly reads that FEEDBACK.md is *the* hidden scoring axis and that 90% of teams will checkbox it. Combined with using underused surface area (UniswapX intents, Permit2, Universal Router, Unichain), this is a Uniswap PM's "ship it" submission. Single-bounty discipline is correct.
**Hour realism:** 25–40 solo is honest with one undercosted chunk: **UniswapX intent integration at 8h** is probably 14h. Filler discovery, intent encoding, settlement waiting, and the Unichain RPC are each their own quiet half-day. With 4 devs this dilutes — one person can specialize in UniswapX for the full 30h.
**Polish risk:** Unichain testnet liquidity might not exist for the long-tail token, forcing the demo into Universal Router fallback for both scenarios — losing the intent vs instant decision narrative. Pre-flight liquidity validation matters before recording.
**Asymmetric edge:** High. Treating FEEDBACK.md as half the deliverable is uncopiable in 30 hours by a team that didn't plan for it. Scales beautifully to 4 devs (UniswapX, Universal Router/Permit2, dashboard, FEEDBACK.md author shadowing the build).

### Idea G — 0G Memory Kit
**Sponsor-love verdict:** Mid. The proposer is realistic — framework category is crowded, narrow extension is the only honest angle. It hits 0G's "Self-evolving frameworks with persistent 0G Storage memory" line but reads as "we wrapped the SDK." Sponsors won't dislike it; they won't fight to fund it either.
**Hour realism:** 35h is honest, possibly slightly low — the "0G chain deployment/address gate" at 5h is the kind of thing that's 8h once faucet/RPC/verification quirks surface. Storage SDK at 6h is correctly hedged.
**Polish risk:** "Storage demo with 'agent' pasted on top" is the proposer's own diagnosis and they're right. Memory has to feel tangible — fresh-session reload + a recall that obviously *needs* the memory — or the demo is uninteresting.
**Asymmetric edge:** Low. And critically: **the main Ledger project already targets 0G Track B**. Adding 0G Track A as Slot 3 means putting 75% of the team's bounty exposure on one sponsor's mood. That's portfolio risk, not asymmetry.

### Idea H — `agent-forwarder`
**Sponsor-love verdict:** High for ENS-Creative — it directly implements one of three named examples ("auto-rotating addresses on each resolution"). ENS engineers will absolutely recognize and respect a clean execution. But it's a *narrower* primitive than C, and standing next to C it looks like a single feature that C already includes.
**Hour realism:** 35 solo was undercosted. The HD derivation is `ethers.HDNodeWallet` (cheap), but the **verification UI + on-chain delegate registry + a demo wallet that consumes the rotating output** is closer to 45h. The "skip the on-chain registry for v1" hedge is correct but means the demo loses the "unified balance under alice.eth" payoff, which is the second "oh."
**Polish risk:** The privacy/accounting benefit needs to be communicated in 30 seconds or the demo lands as "address changed, so what?" Without a wallet UI showing the unified-balance-from-many-children moment, this collapses to a CCIP-Read curiosity.
**Asymmetric edge:** High in isolation, but largely subsumed by C. As a standalone, scales well to 4 (resolver, HD/verifier, on-chain registry, demo wallet); as a feature inside C, it's already there.

### Idea I — 0G Memory Anchor
**Sponsor-love verdict:** Higher than G. "Drop-in library, not a framework" is the right read of the 0G focus list — it makes Storage look easy and slots into other people's runtimes. The on-chain Merkle-root checkpoint trail is the touch that elevates it from "wrapped SDK" to "actual primitive."
**Hour realism:** 30–45 solo is honest. The piece undercosted is the **"recall semantics" at 8h** — exact-key lookup is fine, but if any embedding/semantic index is in scope, that's 16h once you handle chunking, embedding service, and storage layout. Stick to exact-key + optional embedding-add-on or this slips.
**Polish risk:** The kill-the-process-on-machine-A-resume-on-machine-B demo is genuinely good *if* network/RPC cooperate during recording. Same testnet-fragility risk as G.
**Asymmetric edge:** Medium. The asymmetric edge claimed (restraint vs framework-fatigue) is real and well-articulated. Same Slot-3 portfolio concern as G — adding a second 0G bounty concentrates risk.

---

## Section 2 — Top 3

**1. Idea C — Capability Subnames for Agents.** Beat the field on raw sponsor-love (3/3 named ENS-Creative examples + 5/5 ENS-AI verbs); the dual-track design is forced, not bolted on. Specific weakness: the zk demo can collapse into JSON-on-screen if the verifier moment isn't visualized. The hour-pain the proposer didn't fully count: a custom **viewer page** showing rotation + verification visibly — at 6h on top of their estimate — without which the elegance is invisible to a 90-second judge.

**2. Idea F — Treasury-Rebalance Agent + DX Forensics.** Beat the field for Uniswap because it actually *settles* and treats FEEDBACK.md as a serious deliverable, not a checkbox — both directly named in the brief. Specific weakness: Unichain testnet liquidity for long-tail tokens may force a degraded demo. The hour-pain the proposer didn't count: **pre-flight liquidity validation + a fallback liquidity plan** (~4h before recording) so the intent-vs-instant narrative doesn't get neutered live.

**3. Idea B — `subname-receipts`.** Beat A/D/E/G/H/I because it's the cleanest "we should have built this" primitive after C, with a tight reveal moment and clear ENS sponsor-love. Specific weakness: it's narrower than C and shares the same scaffold, so submitting both would be silly — B is the safe sibling of C, not an independent play. The hour-pain the proposer didn't count: a **custom receipt viewer page** (~6h) because the ENS app won't render `ai.tx.*` text records nicely on its own.

---

## Section 3 — Synthesis opportunity

**Yes. The productive observation is that B and H are already inside C.**

`subname-receipts` (B) and `agent-forwarder` (H) are both single-purpose CCIP-Read resolvers built on the same scaffold (offchain resolver + wildcard + namespaced text records). C — Capability Subnames — *is* the merged framework that does both: receipts can be one capability namespace under C (`tx-001.alice.openagents.eth`), payment can be another (`pay.alice.openagents.eth`), with the same auth and rotation primitives. The merge isn't "B + H = something new"; it's "C is what you get when you take B and H seriously and add zk-attestations."

**Implication for Slot 3:** if the team picks C, B's receipts schema and H's HD-derivation logic become two of the capability namespaces shipped *inside* the C demo. That gives C three concrete capability flavors (read/swap, pay-rotating, tx-receipt) instead of one or two — a richer demo without scope creep, because the resolver and wildcard logic are written once and instantiated three times. That's the scaling argument: with 4 devs you can ship C *plus* the B and H specializations as case studies in the same submission.

No other productive merges. F is single-bounty by design and shouldn't be diluted. G/I are both 0G plays competing for the same slot. A and D are functional cousins of the stronger ideas above them.

---

## Section 4 — Final ranking

Re-ranked under the new criterion (4 devs, ~30h, Slot 3 of main Ledger): I'm weighting (a) sponsor-love ceiling, (b) team-of-4 build realism, (c) sponsor diversification — main Ledger already targets 0G Track B, so 0G Track A as Slot 3 over-concentrates exposure to one sponsor.

```
FINAL RANKING:
1. C
2. F
3. B
4. H
5. A
6. E
7. D
8. I
9. G
```
