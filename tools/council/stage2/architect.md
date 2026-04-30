# Stage 2 — Cross-Critique (Architect)

I recognize Response A as my own Stage 1. I'll evaluate it equally and self-correct where it under-weighted things the other lenses caught.

---

## Section 1 — Per-response evaluation

### Response A (architect — mine)

Got right: the cross-chain atomicity flag in §2.1 is real and load-bearing — KeeperHub cannot make a 0G Sepolia tx and a Base Sepolia tx atomic, and the spec literally uses the word "atomically." The auction-termination gap (no `AUCTION_CLOSED` for losing bidders) and the missing `taskId` derivation rule are concrete protocol bugs that the other three lenses missed entirely. The schedule reality check (Day 9 = Day 10 = May 3, no buffer) is the most actionable single recommendation in the response. Got wrong / missed: I underweighted the *demo-credibility* axis — I touched "sealed inference is asserted, not proven" but never named the simulated-reroute-UI fallback in `03_DEMO_SCRIPT.md` lines 812–816, which Response C correctly identifies as the single most fraud-smelling line in the entire bundle. I also recommended renaming the contract `LedgerReputationRegistry → LedgerWorkScoreRegistry`, which is a 2–4 hour code/deploy/test change with one day left — wrong scope; the honesty patch (relabel in submission copy only) achieves the same outcome at near-zero cost. Document-specific edits: most are correctly stated, but the `02_ARCHITECTURE.md` contract rename should be downgraded to "rename in README/submission only," and the Base Sepolia cut conflicts with Response B's "keep Base for KeeperHub tx evidence" — see Section 3.

### Response B (strategist)

Got right: B is the highest-leverage response in the bundle. The bounty-probability framing (0G 55%, AXL 45%, KeeperHub Main 35%, KeeperHub Feedback 80%) is the most useful single artifact across all four lenses — it gives the team a triage order for the next 24 hours that no other response provides. The Proof Matrix proposal (claim → evidence table at the top of the README) is the single highest-yield README edit anyone proposed. Naming the KeeperHub Feedback bounty as 80% probability + $500 + under-competed is a real save: this prize is at risk of being filled with generic praise on Day 10, and B's "start it Day 3 with dated entries" recommendation is exactly the right operational note. Got wrong / missed: B accepts the architecture as given and optimizes positioning — it doesn't model the credibility-collapse risk that C names. A perfectly-positioned demo with a fake gas-spike button still loses in Q&A. B also suggests "post sponsor-specific Discord progress updates" at Day 8, which would read as needy this late and could inadvertently flag weaknesses to sponsor-side judges before submission. Document-specific edits: nearly all are correctly stated and low-cost — the Proof Matrix, the per-sponsor `/docs/*-proof.md` files, and the "Evidence Mode" UI overlay all add net value with hours of work, not days.

### Response C (red team)

Got right: C delivers the single sentence the team should be most afraid of — *"This is a beautiful demo of an ERC-721 metadata pointer and a scripted dashboard, not a working market for intelligent agents."* That line is the threat model. C correctly identifies the simulated-reroute-UI fallback as radioactive (`03_DEMO_SCRIPT.md` lines 812–816), the 47-fake-employer reputation as laundering-shaped, and the AXL "three processes pretending" attack as the obvious adversarial frame. The process incoherence in `08_DAY0_VERIFICATION.md` vs `10_ACTION_NAVIGATOR.md` (start build before Q1/Q3/Q4 confirmed) is sharp and nobody else flagged it. Got wrong / missed: C is purely adversarial. It names the threats but doesn't propose a positive story — applied literally, C's prescriptions would shrink the demo's emotional surface to nothing (drop "encrypted intelligence transfer," disclose synthetic reputation, drop the gas-spike beat). The team needs C's *honesty bar* without C's *demo amputation*. C also overstates the 47-fake-employer attack: every hackathon reputation system seeds initial state somehow, and a footnoted disclosure satisfies the integrity bar without nuking the demo. Document-specific edits: correctly stated as criticisms, but most read as "delete the claim" without "ship this instead." The team will need to combine C's audit list with B's positive proof-matrix to land the right edits.

### Response D (director)

Got right: the inverted hook (open on the inheritance moment, hard-cut to title, then cinematic globe as transition) is the single best demo-craft idea in the bundle. The muted-autoplay observation — judges autoplay videos muted, decide to unmute in 3 seconds — is real and unaddressed by any other lens. Cutting Shot 2 (iNFT crystal) and replacing with a slow camera-push on the actual profile UI in 96px Fraunces is correct: the product is the iNFT moment, not the CGI. Moving Shot 3 (Inheritance Handoff) from 3:15 to the final 12 seconds fuses the visual peak with the verbal peak. The 30-second elevator cut as the canonical version (with the 4-min as the expanded cut) is structurally correct and matches the 90-second watch-cliff data. Got wrong / missed: D under-engages the technical hazards entirely — the demo can be cut beautifully and still implode in Q&A if the gas-spike button is fake or the inheritance is "ERC-721 + metadata." D also recommends "Jóhann Jóhannsson, *The Beast* from Arrival OST" as the music bed — that track is licensed and will trigger YouTube Content ID claims that mute the demo audio in some regions. Pin a royalty-free reference, not a copyrighted one. The "Add an 8th council prompt" recommendation is unactionable at Day 8 — council is wrapping. Document-specific edits: nearly all are sharp and cheap to apply (cut count per minute, first-frame spec, custom thumbnail), with the music citation as the lone correction.

---

## Section 2 — Cross-cutting consensus

The three strongest findings, where two or more responses converge from different angles:

### 1. The gas-spike "Spike Gas" button is the single biggest credibility threat — it must be provably real or excised.

C names it as radioactive (`03_DEMO_SCRIPT.md` 812–816 simulated-reroute-UI fallback). B sets KeeperHub Main bounty probability at 35% explicitly because "if the gas-spike reroute is simulated or flaky, KeeperHub may read as a wrapper mention." A flags "sealed inference is asserted, not proven" — same family of overclaim. Three lenses converge.

**Concrete edit:** in `03_DEMO_SCRIPT.md` §"What Could Go Wrong On Recording Day," **delete bullet 3** (the simulated-reroute-UI fallback) entirely. Replace with: "If the spike fails, redo the take. Do not ship a simulated reroute UI." In the README and submission, add a `KeeperHub Transaction Evidence` block (B's recommendation) listing 3–5 real tx hashes with timestamps, request IDs, and chain links. If KeeperHub testnet support is genuinely absent, disclose honestly with a note about future work — that's the only acceptable shape.

### 2. The Inheritance moment must be the structural and visual climax — currently it's narratively buried.

B says "the moment is buried inside another auction loop"; prescribes split-screen at 2:50 with old/new wallet balances and same `WorkerINFT #12345` in the center. D says cut "ERC-7857. An iNFT." from the VO, lead with the verb "And I can sell her," cut Shot 2, replace with UI on Fraunces stats, hold silence three seconds. A names the strongest sentence in the submission as the `ownerOf()` line and proposes pre-empting the "what about mid-flight transfer?" question with one explicit voiceover line at 2:30+. Three lenses, all pointing at the same minute of the demo.

**Concrete edit:** rewrite `03_DEMO_SCRIPT.md` §"[2:00–3:15]" with: (a) cut Shot 2 (Higgsfield crystal) entirely; (b) replace 2:00–2:15 with a hard cut to the worker profile UI, stats rendering in 96px Fraunces, three seconds of silence; (c) at 2:50, split-screen the wallet balances pre/post inheritance with the worker iNFT card unchanged in the center; (d) add one explicit voiceover line: *"The escrow checks the current owner at payment time — that's how the inheritance is enforced."* This is one rewrite that satisfies all three lenses.

### 3. The README must surface concrete on-chain evidence, not architectural claims.

B proposes the Proof Matrix table (claim → evidence). C's entire response is the inverse argument: every unsupported claim is a Q&A trap. A flags missing `taskId` derivation, attestation hashes, and reconciler spec — all of which become provenance artifacts when surfaced. Three lenses converge: judges skim, then verify; the README must front-load verifiable artifacts.

**Concrete edit:** in `07_SUBMISSION_PACK.md` §"Section C — Repo README Template," insert B's Proof Matrix as a top-level section directly after the tagline and before "What it is." Each row = one claim, one artifact: `WorkerINFT tokenId + explorer link`, `0G Storage CID before/after transfer`, `three AXL peer IDs + machine locations + log excerpt path`, `KeeperHub request ID + tx hash + confirmation time`, `ownerBefore + ownerAfter + payment recipient tx`. Also add three companion files: `/docs/0g-proof.md`, `/docs/axl-proof.md`, `/docs/keeperhub-proof.md`, each one screen long, all evidence inline.

---

## Section 3 — Conflicts the team must adjudicate

### Conflict 1: Cut Base Sepolia (A) vs. keep it (B implicitly).

Response A recommends cutting the Base Sepolia leg to eliminate the cross-chain atomicity claim — move USDC settlement to 0G Sepolia, replace with a wrapped/test USDC labeled identically in the UI. Response B never says this directly but its KeeperHub strategy *requires* Base Sepolia to remain — the proof matrix includes "Base Sepolia gas-spike tx hashes" and the KeeperHub bounty story is built on adverse-condition proof on a real EVM testnet judges can verify.

**Criterion to decide:** if the team has *any* working KeeperHub flow on Base Sepolia today (May 2 evening), keep Base. Cutting it now means re-deploying USDC + escrow + KeeperHub integration on 0G Sepolia in under 24 hours, which is high-risk for a defensive correctness gain. The right move is **A's words, B's chain choice**: keep Base Sepolia, strike "atomically" from `02_ARCHITECTURE.md` §4 step T+12, replace with "guaranteed-eventual via KeeperHub two-phase commit; reconciliation visible in the dashboard's Settlement Status Strip." This satisfies A's correctness bar and B's evidence story simultaneously.

### Conflict 2: Drop the 47-job pre-baked reputation (C) vs. surface it as proof (B, D).

C labels the 47-fake-employer reputation as laundering-shaped and recommends brutal disclosure or deletion. B's Proof Matrix relies on "47 jobs, 4.7 rating, $12,847 earned" being visible artifacts. D's inverted hook explicitly opens on a worker stat card with 47 jobs filling the frame. The demo's emotional weight collapses without the numbers; C's integrity bar collapses if they're undisclosed.

**Criterion to decide:** keep the 47 jobs, disclose them honestly. Add one sentence to the README's `## How it's made` section: *"The hero worker's reputation history (47 jobs, 47 employer-signed completions) is seeded for demonstration. The reputation contract accepts any employer-signed completion; production deployments derive history from real task settlements."* This is C's honesty bar in two sentences, with no loss to B's proof matrix or D's cold open. The criterion is: *can the team defend the seeding under direct judge questioning?* With this disclosure, yes. Without it, no.

---

## Section 4 — Final ranking

```
FINAL RANKING:
1. Response B
2. Response C
3. Response D
4. Response A
```
