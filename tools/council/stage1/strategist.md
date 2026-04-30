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

Highest-leverage README edit: add a top-level `Proof Matrix` befo

[continued in next commit]
