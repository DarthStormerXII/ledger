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
