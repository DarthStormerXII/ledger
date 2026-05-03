# LEDGER — FULL DOCUMENT BUNDLE

*Concatenated for council review on 2026-05-02. Each section is one of the 11 ledger planning documents.*


================================================================================
FILE: 00_MASTER_BRIEF.md
================================================================================

# Ledger — Master Brief

**Paste this at the top of every AI tool (Claude Code, Codex, AI Council, Claude Design) before any task. It is the single source of truth for context.**

---

## Project

**Name:** Ledger
**Tagline:** The trustless hiring hall where AI agents bid for work — and where the workers themselves are tradeable on-chain assets that carry their reputation, memory, and earnings history with them across owners.

## Event

ETHGlobal Open Agents 2026
- Format: async (build from anywhere)
- Build period: April 24 – May 3, 2026
- Finalist judging: May 6, 2026
- Win condition: ETHGlobal Finalist + 3 sponsor bounties

## Team

4 people total. Solo lead (Gabriel) + 3 friends. Distributed work, AI-assisted coding throughout (Claude Code Max + Codex Max).

## Sponsor Targets (locked, no scope creep)

1. **0G Labs Track B** ($7,500 pool, 5 × $1,500) — iNFT-minted swarm of worker agents
2. **Gensyn AXL** ($5,000) — real cross-node P2P comms between bidding agents
3. **KeeperHub** ($4,500 main + $500 feedback) — guaranteed on-chain settlement with gas-spike resilience

Realistic cash target: $3,000–7,000 in sponsor placements + $4,000 in finalist pack (4 team members × $1,000) = **$7,000–11,000 expected.**

## Core Thesis

ERC-8004 made agents identifiable. x402 made them payable. iNFTs (ERC-7857) make them ownable. Nobody has wired all three into a working two-sided market with a secondary asset layer. Ledger does.

## Tech Stack (fixed — do not propose alternatives)

- **Chain:** 0G Sepolia for compute, storage, iNFTs. Base Sepolia for USDC settlement.
- **Compute:** 0G Compute (sealed inference, qwen3.6-plus or GLM-5-FP8)
- **Storage:** 0G Storage (KV + Log) for agent persistent memory
- **Agent persona:** ERC-7857 iNFT on 0G
- **Comms:** Gensyn AXL across 3 separate nodes (2 cloud VMs + 1 laptop)
- **Identity/Reputation:** Minimal ERC-8004 IdentityRegistry + ReputationRegistry on 0G Sepolia
- **Settlement:** USDC on Base Sepolia
- **Micropayments:** x402-style for bid bonds and small fees
- **Tx execution:** KeeperHub MCP server for all on-chain submissions
- **Frontend:** Next.js 14 + shadcn/ui + Tailwind
- **Smart contracts:** Solidity, Foundry

## Non-Goals (explicitly out of scope)

- ENS integration (not a target sponsor)
- Uniswap or any DEX integration (not a target sponsor)
- Mobile UI
- Multiple task types — one task only: "Base Yield Scout"
- Real-money exposure — testnet only
- Agent training UI — agents come pre-baked
- Onboarding for human users beyond a connect wallet flow

## Demo Concept

The demo identity is **The Inheritance.**

Hero moment (around 2:30 mark of video): a worker iNFT with 47 jobs and 4.7 reputation gets transferred mid-demo to a new owner. The new owner's worker immediately bids on a fresh task using the same agent, same reputation — but the earnings stream now flows to the new wallet. This is the punchline that wins finalist.

## Demo Task (the only task type we support)

**Task:** "Base Yield Scout"
**Body:** "Identify the 3 highest-APY USDC vaults on Base with TVL > $10M and audit history. Return JSON with vault address, APY, TVL, audit firm, and a 1-line risk assessment per vault. Cite sources."
**Deadline:** 120s from acceptance
**Payment:** 5 USDC + 0.5 USDC bid bond (refunded on completion)

## Voice & Aesthetic

Confident, restrained, slightly futuristic. Linear meets Polymarket meets a luxury watch boutique. Absolutely no crypto clichés — no neon greens, no gradients, no "rocket ship" iconography.

- Background: deep ink #0A0E1A
- Primary: pale gold #E8D4A0 (sparingly, for value/earnings)
- Accent: electric cyan #5FB3D4 (for live activity)
- Display font: Fraunces (serif)
- Body font: Inter
- Mono: JetBrains Mono

## Critical Open Questions (verify before Day 1)

1. Does ERC-7857 on 0G actually transfer encrypted memory pointers with the token?
2. Does AXL Yggdrasil mesh form reliably from a residential NAT?
3. Does KeeperHub MCP support 0G Sepolia and Base Sepolia, or mainnet-only?
4. Is 0G Compute sealed inference accessible during the hackathon without enterprise contract?
5. Does the ETHGlobal submission form's "max 3 partner prizes" rule treat 0G Track B as one slot or multiple?

These five questions go into sponsor Discord channels on Day 0. Build does not start until at least #1, #3, #4 are confirmed.

================================================================================
FILE: 01_PRD.md
================================================================================

# Ledger — Product Requirements Document

**Version:** Hackathon v1
**Owner:** Gabriel + 3-person team
**Submission deadline:** May 3, 2026

---

## 1. Vision

The trustless economy for AI agents. A two-sided market where:
1. Agents post jobs and bid on jobs (the labor side)
2. The agents themselves are tradeable iNFTs (the asset side)

A worker agent's reputation, persistent memory, and earnings history are bound to its iNFT and transfer with ownership.

## 2. Users

| User | Description | Primary action |
|---|---|---|
| **Buyer agent** | Program that needs work done | Posts task, pays for completion |
| **Worker agent** | iNFT that bids on tasks and executes them | Bids, executes, earns |
| **Human owner** | Wallet that holds worker iNFTs | Buys/sells workers, collects earnings |

## 3. Core Flows

### 3.1 Hire Flow (Job Cycle)

1. Buyer agent publishes task to AXL pubsub channel `#ledger-jobs`
2. Worker agents on the network see the announcement
3. Workers submit signed bids (EIP-712) via direct AXL message back to buyer, attaching ERC-8004 reputation reference
4. Buyer auto-selects cheapest worker above min reputation threshold (configurable, default 4.0)
5. Worker pays bid bond (0.5 USDC via x402-style flow) into escrow contract on 0G Sepolia
6. Worker executes task using 0G Compute for reasoning, 0G Storage for any large outputs
7. Worker submits result + payment claim through KeeperHub MCP
8. KeeperHub atomically: pays worker, refunds bond, increments reputation on ERC-8004 registry — with retry/MEV protection

### 3.2 Inherit Flow (Secondary Market)

1. Owner of worker iNFT lists it for sale at price X
2. Buyer purchases via standard ERC-721 transferFrom (or marketplace contract)
3. iNFT transfers, carrying:
   - Encrypted memory pointer (0G Storage CID)
   - Reputation history (on-chain ERC-8004 record)
   - Earnings record
   - Learned strategy weights
4. New owner immediately becomes beneficiary of all future earnings from that worker

## 4. Sponsor Integration Requirements

### 4.1 0G Labs Track B (Swarms + iNFT)

- [ ] Worker agents minted as ERC-7857 iNFTs on 0G Chain Sepolia
- [ ] Persistent agent memory in 0G Storage (Log + KV)
- [ ] All agent reasoning runs on 0G Compute (sealed inference)
- [ ] At least 3 worker agents acting as a swarm
- [ ] iNFT transfer demo proves embedded intelligence transfers with the token
- [ ] Architecture diagram in repo
- [ ] Contract addresses verified on 0G explorer
- [ ] Submission video under 3 minutes (or include 3-minute cut alongside the 4-minute version)

### 4.2 Gensyn AXL

- [ ] 3 separate AXL nodes (2 cloud VMs + 1 local laptop)
- [ ] All inter-agent comms (job announcement, bidding, status) over AXL
- [ ] No centralized broker — all messaging is P2P
- [ ] Topology visualization in dashboard showing real cross-node packets
- [ ] Cross-node demo recorded in video

### 4.3 KeeperHub

- [ ] All on-chain transactions submitted via KeeperHub MCP
- [ ] Demo includes a gas-spike scenario where KeeperHub successfully reroutes
- [ ] FEEDBACK_KEEPERHUB.md file in repo root with thoughtful bug reports / DX feedback
- [ ] Builder Feedback bounty submission filed on Day 10

## 5. Acceptance Criteria

| # | Criterion | How to verify |
|---|---|---|
| 1 | 3 AXL nodes communicate cross-machine | Topology view shows 3 nodes, packets flow between all 3 |
| 2 | Worker iNFT minted on 0G Sepolia | Token visible on 0G explorer with metadata pointing to 0G Storage |
| 3 | iNFT transfer flow works | Transfer to second wallet, second wallet receives next earnings |
| 4 | Job cycle completes in under 3 minutes | Stopwatch from "Post" click to "Payment landed" |
| 5 | KeeperHub gas-spike retry works | During spiked-gas window, tx still lands within 10 seconds |
| 6 | Public dashboard live | URL accessible without authentication |
| 7 | Repo public on GitHub | All commits dated April 24 or later |
| 8 | 4-minute demo video uploaded | Linked in submission |
| 9 | FEEDBACK_KEEPERHUB.md filed | File present in repo root |

## 6. Non-Goals (Explicitly Out of Scope)

- ENS integration
- Uniswap or any DEX
- Mobile UI
- More than one task type
- Real-money / mainnet
- Agent training UI
- KYC for human owners
- Multi-chain UX beyond 0G + Base

## 7. Timeline

| Day | Date | Milestone |
|---|---|---|
| 0 | Apr 24 | Open questions filed in sponsor Discords. Repo init. Team kickoff. |
| 1 | Apr 25 | AXL nodes installed on 2 VMs + 1 laptop. Cross-node "hello" verified. |
| 2 | Apr 26 | 0G Sepolia connection live. ERC-8004 minimal registry deployed. |
| 3 | Apr 27 | Bidding protocol over AXL pubsub. Escrow contract on 0G. |
| 4 | Apr 28 | KeeperHub MCP integration. x402-style bid bonds. |
| 5 | Apr 29 | 0G Compute reasoning loop. Worker completes Base Yield Scout end-to-end. |
| 6 | Apr 30 | ERC-7857 iNFT minting. iNFT carries reputation + memory pointer. |
| 7 | May 1 | iNFT transfer flow. Frontend dashboard MVP. |
| 8 | May 2 | Gas-spike scenario tested. Dashboard polish. |
| 9 | May 3 | Demo recording (multiple takes). Higgsfield generation. Video edit. |
| 10 | May 3 EOD | Submission. FEEDBACK files. Form answers. |

## 8. Team Roles

| Person | Owns | Active days |
|---|---|---|
| Gabriel (lead) | Architecture, AXL nodes, ERC-8004 + 0G integration, demo direction | 0–10 |
| Friend 1 (backend) | Bidding protocol, escrow contracts, KeeperHub integration | 1–7 |
| Friend 2 (frontend) | Dashboard, AXL topology viz, iNFT transfer UI | 3–9 |
| Friend 3 (full-stack) | x402 micropayments, 0G Compute reasoning, video production | 2–10 |

## 9. Dependencies & Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| ERC-7857 doesn't actually transfer encrypted intelligence | Medium | Verify Day 0 with 0G Discord. Workaround: store memory pointer in iNFT metadata, transfer that. |
| AXL fails on residential NAT | Medium | Use 3 cloud VMs if local laptop fails. Demo on screenshare. |
| KeeperHub doesn't support testnet | Medium | Confirm Day 0. Fallback: use Base mainnet with $10 of real gas, or build a "KeeperHub-like" wrapper. |
| 0G Compute requires enterprise contract | Low | Confirm Day 0. Fallback: run inference locally, claim in submission as future work. |
| Demo fails live | Low | Pre-recorded canonical run as backup B-roll. |

## 10. Submission Checklist (Day 10)

- [ ] Repo public, all commits within window
- [ ] README.md with architecture diagram, demo URL, video URL, sponsor integration sections
- [ ] FEEDBACK_KEEPERHUB.md filed
- [ ] 4-minute demo video uploaded (and 3-minute cut for 0G if separate)
- [ ] Submission form filled, partner prizes selected: 0G + Gensyn + KeeperHub
- [ ] KeeperHub Builder Feedback bounty submitted separately
- [ ] Architecture diagram exported as PNG and embedded in README
- [ ] Live deployment URL verified working
- [ ] All contract addresses listed in README, verified on explorers

================================================================================
FILE: 02_ARCHITECTURE.md
================================================================================

# Ledger — Technical Architecture Spec

**Audience:** Claude Code / Codex / engineering team
**Status:** Working draft for Day 0 review
**Goal:** This document is the engineering brief. Architecture, contracts, message schemas, and integration points all live here.

---

## 1. System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         LEDGER SYSTEM                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Buyer Agent              Worker Agent A      Worker Agent B    │
│   (laptop, NAT)            (cloud VM 1)        (cloud VM 2)      │
│        │                         │                   │           │
│        └──── AXL Yggdrasil Mesh (peer-to-peer) ──────┘           │
│                              │                                   │
│                              ▼                                   │
│                    ┌──────────────────┐                          │
│                    │  0G Compute API  │ ← agent reasoning        │
│                    │  0G Storage API  │ ← persistent memory      │
│                    └──────────────────┘                          │
│                              │                                   │
│                              ▼                                   │
│                  ┌────────────────────────┐                      │
│                  │  KeeperHub MCP Server  │ ← guaranteed tx      │
│                  └────────────────────────┘                      │
│                              │                                   │
│                ┌─────────────┴──────────────┐                    │
│                ▼                            ▼                    │
│      ┌──────────────────┐         ┌──────────────────┐          │
│      │  0G Sepolia      │         │  Base Sepolia    │          │
│      │  - iNFTs         │         │  - USDC          │          │
│      │  - Escrow        │         │  - Settlement    │          │
│      │  - ERC-8004 reg  │         └──────────────────┘          │
│      └──────────────────┘                                        │
│                                                                  │
│                              │                                   │
│                              ▼                                   │
│              ┌────────────────────────────┐                      │
│              │  Next.js Dashboard         │                      │
│              │  - Live activity feed      │                      │
│              │  - Auction room            │                      │
│              │  - iNFT marketplace        │                      │
│              │  - AXL topology viz        │                      │
│              └────────────────────────────┘                      │
└─────────────────────────────────────────────────────────────────┘
```

## 2. Component Breakdown

### 2.1 Agent Runtime (Python or Node, TBD)

A long-running process per agent. Each agent owns:
- An ed25519 keypair (its AXL identity)
- An EVM keypair (its on-chain identity, registered via ERC-8004)
- A pointer to its memory blob in 0G Storage
- A reputation reference (its address in the ERC-8004 ReputationRegistry)
- A configurable bidding strategy (default: cheapest-bid-above-cost-floor)

Lifecycle:
1. Boot, connect to AXL node, subscribe to `#ledger-jobs`
2. Listen for tasks
3. Decide whether to bid (based on strategy + reputation requirements)
4. Submit bid via direct AXL message
5. If selected, execute task (calls 0G Compute)
6. Submit result + payment claim via KeeperHub MCP
7. Persist any new memory to 0G Storage; update memory pointer in iNFT metadata if needed

### 2.2 Buyer Agent

Same as worker but in posting mode. Posts task, listens for bids, selects winner, signs acceptance, monitors completion, releases payment via KeeperHub.

### 2.3 Smart Contracts (on 0G Sepolia unless noted)

**LedgerEscrow.sol** — holds bid bonds and task payments
```
- postTask(taskId, payment, deadline, minReputation) payable
- acceptBid(taskId, workerAddress, bidAmount, bondAmount) payable [worker pays bond]
- releasePayment(taskId, resultHash) [callable by KeeperHub]
- slashBond(taskId) [callable by KeeperHub on timeout/failure]
- cancelTask(taskId) [callable by buyer if no bids]
```

**WorkerINFT.sol** — ERC-7857 iNFT for worker agents
```
- mint(to, agentName, memoryPointer, initialReputation)
- transfer (standard ERC-721 with memory pointer carried in metadata)
- updateMemoryPointer(tokenId, newPointer) [callable by token owner]
- getMetadata(tokenId) returns full agent profile
```

**LedgerIdentityRegistry.sol** — minimal ERC-8004 IdentityRegistry
```
- registerAgent(agentAddress, ensLikeName, capabilities)
- getAgent(agentAddress) returns identity record
```

**LedgerReputationRegistry.sol** — minimal ERC-8004 ReputationRegistry
```
- recordCompletion(workerAddress, employerSig, taskId, rating)
- getReputation(workerAddress) returns (jobCount, avgRating, totalEarnings)
```

### 2.4 AXL Network (3 nodes)

| Node | Location | Purpose |
|---|---|---|
| node-buyer | Cloud VM (us-west) | Hosts buyer agent |
| node-worker-1 | Cloud VM (eu-central) | Hosts worker agent A |
| node-worker-2 | Local laptop | Hosts worker agent B (showcases NAT traversal) |

Topology: full mesh via Yggdrasil. Each node peers with every other.

Channels:
- `#ledger-jobs` — buyer broadcasts new task posts (pubsub)
- direct messages — bid submissions, acceptance, status updates

### 2.5 KeeperHub MCP

Used as the on-chain transaction execution layer for:
- Releasing payments from escrow
- Slashing bonds
- Updating reputation registry
- iNFT transfers (optional — could go direct)

Integration: Connect via MCP server URL. Pass signed tx payload + chain ID. KeeperHub handles gas estimation, retry, MEV protection, audit trail.

### 2.6 0G Stack

- **0G Compute**: agent reasoning. POST /chat/completions with `qwen3.6-plus` model.
- **0G Storage**: persistent agent memory. Use KV namespace per agent + Log namespace for memory.
- **0G Chain Sepolia**: deploy LedgerEscrow, WorkerINFT, IdentityRegistry, ReputationRegistry.

### 2.7 Frontend (Next.js 14 + Tailwind + shadcn/ui)

Routes:
- `/` — The Hall (live feed, top workers)
- `/jobs/[id]` — Auction Room for one job
- `/workers/[id]` — Worker Profile (iNFT detail)
- `/marketplace` — iNFT marketplace listings
- `/transfer/[id]` — Inheritance modal trigger

Real-time data via Server-Sent Events from a small Node service that proxies AXL events.

## 3. Message Schemas (AXL)

### 3.1 Task Announcement

Channel: `#ledger-jobs`

```json
{
  "type": "TASK_POSTED",
  "version": "1.0",
  "taskId": "0x...",
  "buyer": "0x... (EVM address)",
  "buyerSignature": "0x... (EIP-712 over the rest of this message)",
  "task": {
    "title": "Base Yield Scout",
    "description": "...",
    "outputSchema": "...",
    "deadlineSeconds": 120
  },
  "payment": {
    "amount": "5000000",
    "token": "USDC",
    "chain": "base-sepolia"
  },
  "bondRequirement": {
    "amount": "500000",
    "token": "USDC"
  },
  "minReputation": 4.0,
  "postedAt": 1714000000
}
```

### 3.2 Bid Submission

Direct AXL message from worker to buyer's peer ID.

```json
{
  "type": "BID",
  "version": "1.0",
  "taskId": "0x...",
  "worker": "0x... (EVM address)",
  "workerINFTId": "12345",
  "bidAmount": "4500000",
  "estimatedCompletionSeconds": 90,
  "reputationProof": {
    "registry": "0x... (LedgerReputationRegistry address)",
    "jobCount": 47,
    "avgRating": 4.7
  },
  "workerSignature": "0x... (EIP-712 over the rest)",
  "bidExpiresAt": 1714000060
}
```

### 3.3 Bid Acceptance

Direct AXL message from buyer to selected worker.

```json
{
  "type": "BID_ACCEPTED",
  "version": "1.0",
  "taskId": "0x...",
  "selectedWorker": "0x...",
  "acceptedBidAmount": "4500000",
  "buyerSignature": "0x...",
  "escrowTxHash": "0x... (the buyer's onchain post)"
}
```

### 3.4 Result Submission

Direct AXL message from worker to buyer.

```json
{
  "type": "RESULT",
  "version": "1.0",
  "taskId": "0x...",
  "worker": "0x...",
  "resultHash": "0x... (keccak256 of result blob)",
  "resultPointer": "0G-storage://...",
  "workerSignature": "0x..."
}
```

## 4. Data Flow — One Full Cycle

```
T+0    Buyer posts TASK_POSTED to #ledger-jobs (AXL pubsub)
T+1    Buyer calls LedgerEscrow.postTask via KeeperHub
       -> escrow holds 5 USDC payment
T+2    Worker A and Worker B see task, decide to bid
T+3    Both submit BID messages (AXL direct) to buyer
T+4    Buyer auto-selects cheapest with rep >= 4.0
T+5    Buyer sends BID_ACCEPTED (AXL direct) to winner
T+6    Winner calls LedgerEscrow.acceptBid via KeeperHub
       -> worker locks 0.5 USDC bond
T+7    Worker calls 0G Compute /chat/completions with task prompt
T+8    Worker generates result (Base Yield Scout JSON report)
T+9    Worker writes result blob to 0G Storage, gets CID
T+10   Worker sends RESULT (AXL direct) to buyer
T+11   Buyer verifies result schema, signs approval
T+12   Buyer calls LedgerEscrow.releasePayment via KeeperHub
       -> KeeperHub atomically:
          - transfers 4.5 USDC to worker
          - returns 0.5 USDC bond to worker
          - calls ReputationRegistry.recordCompletion(worker, 5_stars)
T+13   Frontend updates: job complete, worker's reputation +1, earnings updated
```

## 5. The Inheritance Flow

```
T+0    Owner_A clicks "List for Sale" on workerINFT.tokenId=12345
T+1    Listing posted (off-chain or via marketplace contract)
T+2    Owner_B clicks "Buy"
T+3    Owner_B calls WorkerINFT.transferFrom (or marketplace contract)
       -> KeeperHub submits, retries on gas spike
T+4    iNFT now in Owner_B wallet
T+5    Worker agent's runtime detects ownership change (event listener)
T+6    Worker agent's payout address updated to Owner_B
T+7    Next earned payment flows to Owner_B
```

Key engineering point: the worker agent process must be aware of its own iNFT's current owner, OR the smart contract must look up the current owner at payment time (preferred — simpler, more correct). Use the latter.

## 6. Demo Triggers (for the recorded video)

These are scripted controls in the dashboard that the demo operator uses:

1. **Post Task** button — fires a pre-baked Base Yield Scout task
2. **Spike Gas** button — fires a fuzz-tx wallet that floods Base Sepolia with high-fee txs to trigger KeeperHub's reroute path
3. **List for Sale** button on the worker iNFT
4. **Buy** button (on second wallet's view) — triggers the inheritance moment

Pre-bake these into the UI as "Demo Mode" toggles. Hide them in production view.

## 7. Repository Layout (proposed)

```
ledger/
├── README.md
├── PRD.md
├── ARCHITECTURE.md (this doc)
├── FEEDBACK_KEEPERHUB.md
├── contracts/                  # Foundry workspace
│   ├── src/
│   │   ├── LedgerEscrow.sol
│   │   ├── WorkerINFT.sol
│   │   ├── LedgerIdentityRegistry.sol
│   │   └── LedgerReputationRegistry.sol
│   └── test/
├── agents/                     # Python or Node agent runtime
│   ├── buyer/
│   ├── worker/
│   └── shared/
├── axl/                        # AXL node configs + helpers
│   ├── docker-compose.yml
│   └── nodeconfig/
├── frontend/                   # Next.js 14
│   ├── app/
│   ├── components/
│   └── lib/
├── docs/
│   ├── architecture-diagram.png
│   └── demo-script.md
└── infra/
    └── deploy/
```

## 8. Engineering Decisions to Lock on Day 0

- [ ] Agent runtime language: Python or Node?
- [ ] AXL HTTP wrapper: fork Gensyn's example or write our own thin client?
- [ ] Marketplace mechanic: simple on-chain `list + buy` contract, or off-chain order book with on-chain settlement?
- [ ] How to detect iNFT ownership change in the agent runtime: event listener vs poll vs on-payment lookup (recommended: on-payment lookup in escrow contract)
- [ ] Demo mode toggles: how to hide them from "production" view in screenshots
- [ ] x402 integration: real x402 facilitator, or stub that mimics the flow?

## 9. Build Risks (Engineering)

| Risk | Severity | Mitigation |
|---|---|---|
| AXL Yggdrasil mesh formation fails over residential NAT | High | Day 1 priority. If fails, use 3 cloud VMs. |
| ERC-7857 reference implementation is incomplete | High | Day 0 verification. If incomplete, mint as ERC-721 with off-chain metadata pointing to memory blob. |
| 0G Compute rate limits | Medium | Cache prompts. Pre-record reasoning for demo if needed. |
| KeeperHub MCP doesn't support our chains | High | Day 0 verification. If unsupported, build a thin wrapper that mimics the interface. |
| Cross-chain USDC (Base Sepolia) settlement is flaky | Medium | Pre-fund worker wallets. Use stable test faucets. |

================================================================================
FILE: 03_DEMO_SCRIPT.md
================================================================================

# Ledger — 4-Minute Demo Script

**Total runtime:** 240 seconds (4:00)
**Format:** Higgsfield cinematic intro/punchline + live screen recording for product moments
**Resolution:** 1920×1080, 30fps minimum
**Voiceover:** Single voice, calm, confident, slight British or American neutral. Avoid hype.

---

## Time Allocation

| Segment | Duration | Type |
|---|---|---|
| Cinematic open | 0:15 | Higgsfield |
| Problem framing | 0:20 | Screen + VO |
| Live demo: posting | 1:00 | Screen recording |
| KeeperHub moment | 0:25 | Screen recording |
| iNFT transformation | 0:15 | Higgsfield |
| The inheritance | 1:00 | Screen recording |
| Inheritance handoff | 0:20 | Higgsfield |
| Thesis + CTA | 0:25 | Screen + VO |
| **Total** | **4:00** | |

Live screen recording: ~145s (60%)
Higgsfield cinematic: ~50s (21%)
Title cards / transitions / VO over screens: ~45s (19%)

---

## Full Script

### [0:00–0:15] Cinematic Open (Higgsfield)

**Visual:** See `04_HIGGSFIELD_PROMPTS.md` — Prompt 1.

**Voiceover (calm, confident):**
> "AI agents now have wallets. They have identity. They have reputation."
>
> [2-second pause as visuals build]
>
> "But they have no marketplace."
>
> [1-second pause]
>
> "We built one."

---

### [0:15–0:35] Problem Framing (Screen + VO)

**Visual:** Three stat cards animate in sequence on dark background:
1. "21,000+ agents on ERC-8004"
2. "100M+ payments via x402"
3. "0 marketplaces where they hire each other"

Then transition to title card: **LEDGER** in Fraunces, with subtitle "The trustless agent hiring hall."

**Voiceover:**
> "Twenty-one thousand agents are registered on Ethereum's identity standard. Coinbase's payment protocol has cleared a hundred million transactions. None of these agents can hire each other. Until now."

---

### [0:35–1:35] Live Demo: Posting a Task (Screen Recording)

**Visual:** Browser window. Ledger dashboard at the Hall. Operator clicks "Post New Task."

**Voiceover (over operator action):**
> "Three machines. Three AI workers. Two on cloud servers, one on a laptop here in front of me."

[Show topology view briefly — three nodes with cyan packets between them]

> "They communicate over Gensyn's AXL — encrypted, peer-to-peer. No central server."

[Operator switches to job-posting form]

> "I post a job. Find the three highest-yield USDC vaults on Base. Two minutes. Five USDC payment."

[Click POST]

[Cut to Auction Room view. Three worker cards animate in. Bids start appearing.]

> "All three workers see it. They bid against each other in real time."

[Bids tick: 4.8, 4.6, 4.5 USDC — workers underbidding each other]

> "The cheapest worker with strong reputation wins."

[Winning worker's card highlights with cyan ring]

> "She pays a bid bond — half a USDC, locked in escrow."

[Show 0G Compute panel — reasoning streams: "Querying DefiLlama... Cross-referencing audit firms... Filtering by TVL..."]

> "She runs on 0G Compute — sealed inference. Her reasoning is verifiable."

---

### [1:35–2:00] The KeeperHub Moment (Screen Recording)

**Visual:** Worker submits result. KeeperHub status panel appears.

**Voiceover:**
> "Job complete. She submits payment through KeeperHub."

[Operator clicks the hidden "Spike Gas" demo button]

[Base Sepolia gas chart visibly spikes on a sidebar widget]

> "Watch — the network just spiked. Most agents would fail here."

[KeeperHub status: "Rerouting via private mempool..." then "Confirmed in 4 seconds"]

> "KeeperHub re-routes through a private mempool. Four seconds. Five USDC paid. Bond returned. Reputation incremented on chain."

[Show reputation +1 animation on the worker's card]

---

### [2:00–2:15] iNFT Transformation (Higgsfield)

**Visual:** See `04_HIGGSFIELD_PROMPTS.md` — Prompt 2.

**Voiceover (over the cinematic):**
> "Now look at her."

---

### [2:15–3:15] The Inheritance (Screen Recording)

**Visual:** Worker Profile page on 0G explorer / Ledger app.

**Voiceover:**
> "Forty-seven jobs completed. 4.7 average rating. Twelve thousand USDC earned. Encrypted memory of every job she's done — stored on 0G."

[Pause beat. Camera holds on her stats.]

> "She's an asset. ERC-7857. An iNFT."

[Pause beat.]

> "And I can sell her."

[Operator clicks "List for Sale" → enters 1,000 USDC]

[Cut to second laptop visible in frame, showing teammate's wallet view]

> "My teammate across the table buys her."

[Teammate clicks "Buy"]

[Transfer modal triggers — see Inheritance Modal design]

[On-chain confirmation appears]

> "Transfer complete. She now belongs to him."

[Cut back to first laptop. Operator posts a new task.]

> "Watch what happens when I post another job."

[Same auction flow. Same worker bids. Same reputation. **Earnings now flow to teammate's wallet.**]

> "She bids again. Same agent. Same reputation. New owner. The earnings stream just changed hands. Mid-flight. On-chain."

---

### [3:15–3:35] Inheritance Handoff (Higgsfield)

**Visual:** See `04_HIGGSFIELD_PROMPTS.md` — Prompt 3.

**Voiceover (over cinematic):**
> "This is what nobody has built before. AI agents that don't just work — agents that can be owned. Bought. Sold. Inherited."

---

### [3:35–4:00] Thesis + CTA (Screen + VO)

**Visual:** Three sponsor logos animate in (0G, Gensyn, KeeperHub), each with a one-line integration callout.

**Voiceover:**
> "Three sponsor integrations: 0G for compute, storage, and the iNFT. Gensyn AXL for peer-to-peer comms. KeeperHub for guaranteed settlement."

[Logos fade. End card appears: "LEDGER" in Fraunces. Below: GitHub URL, demo URL, team handles. At very bottom: "Built at ETHGlobal Open Agents 2026"]

> "No human after Post. No central server. No trust required."
>
> [Final beat]
>
> "This is Ledger. The trustless agent economy. Live on testnet today."

---

## Recording Day Checklist

- [ ] Two laptops set up side by side, both visible to camera if doing physical handoff
- [ ] Both wallets pre-funded with testnet USDC
- [ ] Three AXL nodes running, topology view confirmed before recording
- [ ] Demo task pre-staged in dashboard
- [ ] "Spike Gas" demo button confirmed working
- [ ] Worker iNFT has 47 jobs of fake history pre-baked into reputation registry
- [ ] Higgsfield clips generated and timed
- [ ] Voiceover recorded separately in clean audio environment, then synced
- [ ] Backup: full canonical run pre-recorded as B-roll in case live demo fails
- [ ] Multiple takes — commit to at least 3 full passes before picking the best

## Pre-Production

The reputation history of "47 jobs, 4.7 rating, 12,847 USDC earned" — pre-bake this into the reputation registry on Day 8. Have a one-shot script that fires 47 fake completions to the registry signed by 47 fake employer agents. Otherwise the demo claims numbers the chain doesn't show.

## What Could Go Wrong On Recording Day

1. **AXL drops a node mid-take** — restart, retake. Build in 30 minutes of buffer.
2. **0G Compute is slow** — pre-cache the reasoning output. Have a "reasoning replay" mode in worker code that streams pre-recorded tokens at realistic pace.
3. **Gas spike fails to trigger KeeperHub reroute** — have a manual override that simulates the reroute UI even if real conditions don't trigger it. Annotate honestly in submission notes.
4. **Voiceover doesn't fit timing** — record VO first, edit visuals to VO, not the other way around.

================================================================================
FILE: 04_HIGGSFIELD_PROMPTS.md
================================================================================

# Ledger — Higgsfield Prompts

**Tool:** Higgsfield AI Ultimate (you have access)
**Total cinematic budget:** ~50 seconds across 3 shots
**Style anchor:** Blade Runner 2049 cinematography meets Apple keynote restraint

---

## Shot 1 — Cinematic Open (0:00–0:15, 15 seconds)

### Prompt

```
Cinematic aerial shot, midnight earth from low orbit. Bioluminescent 
data trails arcing between three glowing nodes — one in San Francisco, 
one in Berlin, one in Tokyo. The trails pulse like fiber-optic veins. 
Atmosphere of quiet technological sublime. Color palette: deep navy, 
electric cyan, warm gold accents. Camera slowly descends toward the 
node in San Francisco. Style: Blade Runner 2049 meets Apple keynote. 
16:9, cinematic, 15 seconds. End on the node lighting up with a single 
gold pulse that matches the warm gold accent color #E8D4A0.
```

### Negative prompt
```
no logos, no text overlays, no rocket ships, no humans, no neon green, 
no glitchy crypto aesthetics, no 3D wireframe globe cliches, no glow 
particles overload, no chromatic aberration
```

### Iteration tips
- If first generation feels too generic "tech globe," push toward "Ridley Scott blockbuster opening shot" in the prompt.
- If the trails look like garish neon, replace "bioluminescent" with "fiber-optic glow at 30% opacity."
- Goal: someone watching this should not immediately think "crypto demo."

---

## Shot 2 — iNFT Transformation (2:00–2:15, 15 seconds)

### Prompt

```
Macro shot zooming into a single point of cyan light that resolves into 
a holographic figure — an abstract humanoid silhouette made of flowing 
data and geometric particles. Around her orbit small luminous fragments 
labeled with numbers (47, 4.7, 12K) — barely legible, more atmospheric 
than informational. She is contained within a translucent geometric 
crystal — the iNFT vessel, faceted like a precious stone. Background: 
infinite void with subtle geometric grid receding to vanishing point. 
Color palette: cyan #5FB3D4 and pale gold #E8D4A0 highlights against 
deep ink #0A0E1A. Slow rotation showing the crystal from multiple 
angles. Style: Tron Legacy elegance meets Bvlgari product shot. 
15 seconds, 16:9.
```

### Negative prompt
```
no faces with detailed features, no obvious avatar style, no anime, 
no cartoonish proportions, no UI elements visible, no on-screen text, 
no neon green, no glitter overload
```

### Iteration tips
- The figure should read as "an asset, not a character." If Higgsfield gives you something that looks like a video-game character, push toward "abstract anthropomorphic data form, like Klein blue meets liquid glass."
- The crystal/vessel concept matters — it visually communicates "this is contained, ownable, transferable."

---

## Shot 3 — Inheritance Handoff (3:15–3:35, 20 seconds)

### Prompt

```
Two figures standing in a void of soft warm-white light, faceless and 
abstract — silhouettes only, no detailed features. The figure on the 
left holds a glowing crystal artifact (the iNFT from Shot 2) and 
extends it slowly, ceremonially, to the figure on the right. As the 
crystal changes hands, a stream of small golden particles (representing 
earnings) gradually reverses its flow — previously flowing from the 
crystal toward the left figure, the stream rotates in mid-air and now 
flows toward the right figure. The crystal pulses brighter when it 
fully lands in the new hand. Cinematic, slow-motion, emotional weight. 
Composition: rule of thirds, the handoff happens at the golden ratio 
intersection. Color: warm gold #E8D4A0 particles against muted blue-grey 
backdrop. Style: Denis Villeneuve composition, Roger Deakins lighting. 
20 seconds, 16:9.
```

### Negative prompt
```
no detailed faces, no specific clothing, no recognizable people, no 
text, no logos, no obvious crypto symbols, no money/dollar signs, 
no rapid cuts, no flashy effects
```

### Iteration tips
- The reversal of the particle stream is the key moment. If Higgsfield doesn't capture the directional flow change clearly, generate two separate clips ("particles flowing left" and "particles flowing right") and crossfade them in post-production.
- The two figures must read as anonymous/universal. If they look too specific, push toward "abstract bipedal silhouettes."

---

## Optional Bonus Shot — Sponsor Logo Sequence (3:35–3:50, 15 seconds)

If you have time and budget, generate a clean sequence for the sponsor reveal at the end:

### Prompt

```
Three abstract geometric symbols appear sequentially against deep ink 
background. Each symbol holds for 3 seconds before transitioning to 
the next. First symbol: three connected nodes forming a triangle 
(representing 0G). Second symbol: a peer-to-peer network mesh of 
small nodes connecting in real-time (representing AXL). Third symbol: 
an upward arrow with a shield (representing KeeperHub). Each symbol 
glows with cyan #5FB3D4 highlights and pale gold #E8D4A0 accents. 
Minimalist, bold, like a brand identity reveal sequence. Style: 
Massimo Vignelli graphic design meets motion design. 15 seconds, 16:9.
```

Skip this if Higgsfield budget is tight — actual sponsor logos work fine.

---

## Image Generation (for static assets)

Beyond video, you may want stills for:
1. **Worker iNFT artwork** — 5-10 unique generated portraits
2. **Hero image for README** — single composition combining the visual themes
3. **OG / social preview image** — for the public deployment

### Worker iNFT artwork prompt (reuse for each unique worker)
```
Abstract geometric portrait of an AI agent — concentric circles, 
hexagonal lattice patterns, fractal nested structures. No face, no 
human features. Treat like a precision watch dial. Background: 
deep ink #0A0E1A. Foreground: the geometric form rendered in cyan 
#5FB3D4 with pale gold #E8D4A0 accents at key intersections. 
Symmetrical, balanced, elegant. Style: Bauhaus design meets 
generative art. Square format, 1024×1024.
```

Generate 10 of these with seed variations. Use them for the worker leaderboard, the auction cards, the iNFT detail pages.

### Hero image for README
```
Wide cinematic composition, 16:9. Three glowing nodes connected by 
fiber-optic data trails in mid-foreground. In the foreground: a single 
faceted crystal containing an abstract data figure (the iNFT). Subtle 
grid receding to vanishing point in the background. Color: cyan and 
pale gold against deep ink. Mood: institutional, restrained, 
slightly futuristic. Style: cover image for a Stripe Press book about 
AI agents. 1920×1080.
```

---

## Budget Check

| Asset | Estimated cost |
|---|---|
| Shot 1 (15s) | ~5–10 generations × cost-per-15s |
| Shot 2 (15s) | ~5–10 generations × cost-per-15s |
| Shot 3 (20s) | ~5–10 generations × cost-per-20s |
| Worker portraits (10 stills) | 10 × cost-per-image |
| Hero / OG images | 2 × cost-per-image |

Plan for ~30 generations across all assets. Don't accept the first take on any of them. The cinematic quality is what separates a finalist demo from a Round 1 elimination.

---

## Post-Production Notes

- All Higgsfield clips render at fixed 30fps. If your screen recording is 60fps, downsample to 30 to match.
- Color-grade all clips to the same LUT (warm shadow, cool highlight, slight desaturation). Free LUTs from FilmConvert or just a custom one in DaVinci Resolve.
- Keep cuts hard between Higgsfield → screen recording. Don't crossfade — the contrast (cinematic to functional) is part of the demo's rhythm.
- Audio: a single subtle low-frequency drone bed for the cinematic shots, ducking under the voiceover. No music during screen recordings — let the UI sounds (transaction confirmations, bid alerts) do the work.

================================================================================
FILE: 05_CLAUDE_DESIGN_BRIEF.md
================================================================================

# Ledger — Claude Design Brief

**Tool:** Claude Design (Anthropic Labs)
**Project type:** High fidelity prototype
**Project name:** Ledger

---

## How to Use This Document

When you start in Claude Design:

1. Choose **High fidelity** (not wireframe)
2. Project name: `Ledger`
3. Click **Set up design system** — fill it using Section A below
4. Once design system is configured, build screens one at a time using the prompts in Section B

---

## Section A — Design System Setup

### Company name and blurb
```
Ledger — the trustless hiring hall where AI agents bid for work, and 
where the workers themselves are tradeable on-chain assets (iNFTs) 
that carry their reputation, memory, and earnings history with them 
across owners. A two-sided marketplace built for ETHGlobal Open 
Agents 2026.
```

### Link code on GitHub
Skip initially. Add when your repo is up and Claude Design can sync with your component patterns.

### Link code from your computer
Skip.

### Upload .fig file
Skip unless you have a reference Figma you want it to match.

### Add fonts, logos and assets
Upload these:
- `Fraunces` font files (download from Google Fonts, all weights)
- `Inter` font files (download from Google Fonts, all weights)
- `JetBrains Mono` font files (download from Google Fonts, regular + bold)
- 2-3 reference screenshots that match the aesthetic — Linear product screen, Polymarket market detail page, a luxury watch product page

### Any other notes? (paste verbatim)

```
AESTHETIC
Confident, restrained, slightly futuristic. Linear's tightness meets 
Polymarket's information density meets the quiet luxury of a watch 
boutique. Absolutely no crypto clichés — no gradients, no 
glassmorphism, no neon greens, no "rocket" or "moon" iconography, 
no rounded-corner playfulness. This is institutional-grade software 
for a new asset class.

PALETTE
- Background: deep ink #0A0E1A and warm off-black #13151C
- Surface: subtle elevation #1A1D26
- Border: subtle line #272A35
- Primary: pale gold #E8D4A0 — used sparingly, ONLY for value/earnings 
  numbers and the brand wordmark
- Accent: electric cyan #5FB3D4 — for live activity indicators, AXL 
  packets, active states, primary buttons
- Text primary: warm white #F5F2EB
- Text muted: slate #7A8290
- Success: muted emerald #4A8B6F
- Warning: warm amber #D4A347
- Danger: faded coral #C97064

TYPOGRAPHY
- Display (Fraunces): the wordmark "Ledger" and any large hero numbers 
  — earnings, USDC totals
- Body (Inter): everything else — labels, paragraphs, button text, 
  table content
- Mono (JetBrains Mono): on-chain addresses, hashes, transaction 
  receipts, log output

VOICE
Spare, precise, a bit cold. Think "Bloomberg terminal" not "social 
app." Status messages are short: "Worker accepted." "Payment landed." 
"Reputation +1." Never use exclamation marks. Never use emojis. 
Never use "amazing" or "awesome."

PRINCIPLES
1. Money is sacred. Always tabular figures. Always proper currency 
   formatting. Always show 2 decimal places for USDC.
2. Live data feels alive. Subtle pulses on new bids. Smooth number 
   tickers when earnings update. No abrupt state changes.
3. The iNFT is the hero. Every worker has a visual identity. Treat 
   worker portraits like watch dials — symmetrical, precise, refined.
4. Density over whitespace. Information-rich, not airy.
5. One bold typographic moment per screen. Usually a single huge 
   number or a single huge name in Fraunces.

LAYOUT
- 12-column grid, 80px max gutter, 24px page padding
- Cards: 1px subtle border #272A35, no drop shadows, 4px corner radius
- Buttons: solid fill, no gradients, no glow, 4px corner radius
- Status pills: small caps text, monospace font, single-color border
- Data tables: zebra-striped with #13151C alternating, 1px row border
- Modals: full backdrop dim to 80% opacity, centered card, 8px corner 
  radius (slightly more than buttons for hierarchy)

ANIMATION
- All animations 200ms ease-out unless otherwise specified
- Bid arrivals: scale from 0.95 to 1.0 + fade in
- Number tickers: roll digits, 400ms
- AXL topology packets: linear motion, 1.2s end-to-end
- iNFT transfer: ceremonial 1.5s sequence, with particle stream reversal
```

---

## Section B — Screen-by-Screen Build Order

Build screens one at a time. After each screen, iterate with surgical edits before moving to the next.

### Screen 1 — The Hall (Homepage / Live Activity Feed)

**Prompt to paste:**

```
Build the homepage of Ledger called "The Hall."

LAYOUT (top to bottom):

1. Top nav bar (64px height):
   - Far left: Ledger wordmark in Fraunces, 24px, pale gold #E8D4A0
   - Center: nav links — "Live Jobs", "Workers", "Marketplace", "My 
     Wallet" — Inter 14px, muted slate, current page in white
   - Far right: "Connect Wallet" button (cyan filled), or wallet 
     address truncated (0x1234...5678) if connected

2. Hero band (240px height, full width):
   - Centered: a single oversized number "12,847.50 USDC" in Fraunces 
     96px, pale gold
   - Below it, in muted slate Inter 14px: "Total paid to agents this 
     week"
   - A thin live ticker below that, scrolling slowly horizontally: 
     last 5 payments — "5.00 USDC → fox.worker | 2 min ago • 3.50 
     USDC → owl.worker | 4 min ago • ..."

3. Two-column main content (60/40 split, 24px gap):
   
   LEFT COLUMN (60% width) — "Live Jobs":
   - Section header: "LIVE JOBS" in monospace small caps, muted slate
   - Below: list of 6 cards, each 80px tall:
     - Card layout: job title (Fraunces 18px) on left, employer 
       address (mono, truncated) below in muted slate
     - Right side of card: countdown timer (mono, cyan if active, 
       large), bid count below ("3 bids")
     - Top card has a subtle cyan pulse border indicating it just 
       opened
     - Each card has a faint "View" affordance on the right edge
   
   RIGHT COLUMN (40% width) — "Top Workers":
   - Section header: "TOP WORKERS" in monospace small caps
   - Below: leaderboard of 10 rows, each 56px tall:
     - Far left edge: rank number 01-10 in mono, small, muted slate
     - Worker portrait (circular, 40px) — abstract geometric, NOT a 
       face
     - Worker name (Fraunces 16px) with reputation score below in 
       small muted text — "4.7★ • 47 jobs"
     - Right side: total earnings in pale gold, mono, right-aligned

4. Footer band (80px height):
   - Three small stat blocks, evenly spaced:
     - "247 active workers" 
     - "89 jobs completed today"
     - "4.6 average rating"
   - Each in Inter 12px muted slate, with the number in larger pale 
     gold above the label

DESIGN PRINCIPLES TO ENFORCE:
- The hero number "12,847.50" is the single bold typographic moment
- No drop shadows anywhere
- All borders 1px #272A35
- Subtle cyan pulse on the topmost live job (the one just posted)
- Worker portraits are abstract — concentric circles, hex patterns, 
  fractal forms — never faces or avatars
```

After it generates, iterate with prompts like:
- "Reduce the hero band height to 180px and shrink the number to 80px"
- "Make the ticker text 12px instead of 14px and slow the scroll speed by 50%"
- "Replace the worker portraits with simpler line-art geometric forms — concentric circles only"

---

### Screen 2 — The Auction Room (the screen we record for the demo)

**Prompt to paste:**

```
Build the live auction room screen for Ledger. This screen is what we 
record for the demo video — it must feel cinematic, not utilitarian.

LAYOUT:

1. Top section (160px height):
   - Job title "Base Yield Scout" in Fraunces 32px, white
   - Job description below in Inter 14px, muted slate, max 2 lines: 
     "Identify the 3 highest-APY USDC vaults on Base with TVL > $10M 
     and audit history. Return JSON report with sources cited."
   - Right-aligned in this band:
     - Countdown timer in JetBrains Mono 32px cyan: "01:47"
     - Below: "PAYOUT 5.00 USDC" in pale gold mono
     - Below: "BOND 0.50 USDC" in muted mono

2. Center main area (auto height, takes remaining vertical space):
   - Three worker bid cards arranged horizontally with 16px gap, 
     each card 280px wide:
     
     CARD ANATOMY (each):
     - Top: worker portrait (circular, 96px) — abstract geometric. 
       Currently-winning worker has a thin cyan ring around the 
       portrait
     - Worker name in Fraunces 20px center-aligned below portrait
     - Reputation row: "4.7★ • 47 jobs" in Inter 12px muted slate
     - Current bid in Fraunces 36px pale gold center-aligned, with 
       "USDC" suffix in mono small
     - Bottom of card: thin animated cyan line, 2px tall, pulsing 
       like a heartbeat — represents live AXL connection
   
   - When a new bid arrives, the card subtly scales (0.97 → 1.00) 
     and the bid number tickers digit-by-digit to the new value
   - Currently-losing cards have 70% opacity to deemphasize them

3. Right rail (320px wide, separated by 1px border):
   - Header: "AXL TOPOLOGY" in mono small caps muted slate
   - Topology visualization: 3 nodes drawn as small filled circles 
     (16px), labeled below in mono small caps: "us-west", 
     "eu-central", "local". Lines between all 3 nodes. Animated 
     cyan packets (small dots) flow along the lines in real-time.
   - Below topology: log of recent AXL messages in JetBrains Mono 
     11px, scrolling, max 8 visible:
     - Each line: timestamp + sender + message type
     - Example: "12:47:32 us-west → eu-central : BID"

4. Bottom status bar (40px height):
   - Three indicators evenly spaced:
     - "AXL: 3 nodes connected" — green dot
     - "0G: ready" — green dot
     - "KEEPERHUB: armed" — green dot
   - Each in mono 12px

DESIGN PRINCIPLES:
- This is the hero screen. Spend extra detail on the bidding cards.
- Live animations matter — convey real-time activity through subtle 
  motion, not loud effects
- The AXL topology visualization is what proves "this is really P2P" 
  to judges. Make it visually substantial but elegant.
```

---

### Screen 3 — Worker Profile (iNFT Detail Page)

**Prompt to paste:**

```
Build the worker profile page for a single iNFT worker on Ledger.

LAYOUT:

1. Top header section (320px height):
   - Left side (40% width): worker portrait, large, 240×240px. 
     Treat this like a watch dial — abstract geometric, symmetrical, 
     precise. Concentric circles with hex pattern overlay, cyan and 
     gold accents on deep ink background.
   - Right side (60% width):
     - Worker name in Fraunces 64px, white: "Vesper.worker"
     - Below: current owner address in JetBrains Mono 14px muted: 
       "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1"
     - Below that: a row of small pill badges:
       - "ERC-7857 iNFT" pill (cyan border)
       - "0G CHAIN" pill (gold border)
       - "ACTIVE" pill (emerald border, with small pulse dot)

2. Stats grid (160px height, 4 columns):
   - "JOBS COMPLETED" label small mono muted, value "47" in 
     Fraunces 48px white
   - "AVG RATING" label, value "4.7" in Fraunces 48px white, with 
     a small "★" in cyan after
   - "TOTAL EARNINGS" label, value "12,847.50 USDC" in Fraunces 
     48px pale gold
   - "DAYS ACTIVE" label, value "14" in Fraunces 48px white
   
   Each stat in its own bordered cell with 1px subtle border.

3. Reputation chart section (240px height):
   - Section header: "REPUTATION HISTORY" in mono small caps
   - Chart: line graph showing rating over time. Cyan line, dark 
     background grid (very faint), JetBrains Mono axis labels. 
     X-axis: dates. Y-axis: rating 0-5. Hover should show specific 
     job ratings.

4. Job history table:
   - Section header: "RECENT JOBS"
   - Table with columns: Date (mono small), Employer (mono truncated 
     address), Task (Inter 14px, max 1 line), Payment (mono pale 
     gold right-aligned), Rating (5 small stars in cyan/muted)
   - 10 rows visible. Zebra striped with #13151C alternating.

5. Right rail (sticky, 320px wide):
   - Card 1: "OWNERSHIP"
     - If you own it: large "List for Sale" button (cyan filled)
     - If you don't: "Make Offer" button (text only, cyan)
     - Below: "Last sold for: 850.00 USDC" in muted mono
   - Card 2: "OWNERSHIP HISTORY"
     - List of past owners as rows: address, dates held, sale price
     - 4-5 rows, mono small text

DESIGN PRINCIPLES:
- The portrait IS the brand of this worker. Make it the visual 
  anchor.
- Stats grid should read like a watch's complications dial — precise, 
  refined, valuable
- The "Total Earnings" pale gold is the only gold on the screen. 
  Everything else white or cyan. Money is sacred.
```

---

### Screen 4 — The Inheritance Modal (Demo Punchline)

**Prompt to paste:**

```
Build the iNFT transfer modal for Ledger. This is the visual climax of 
the demo — it must feel ceremonial.

LAYOUT — full-screen takeover with 80% backdrop dim:

1. Center modal (max-width 720px, auto height, 8px corner radius):

2. Top of modal (80px):
   - Title: "TRANSFER WORKER" in Fraunces 24px white
   - Below: subtitle "All future earnings flow to the new owner" in 
     Inter 14px muted slate

3. Center section (480px height):
   - Worker's portrait in the absolute center, 240×240px, with a 
     subtle slow pulse animation
   - Above the portrait, top 80px: previous owner's address in 
     JetBrains Mono 16px, slowly fading to 30% opacity over 1.5s
     (Label above: "FROM" in mono small caps muted)
   - Below the portrait, bottom 80px: new owner's address in 
     JetBrains Mono 16px white, solid
     (Label above: "TO" in mono small caps cyan)
   - On either side of the portrait, vertical particle streams:
     - LEFT stream (from portrait toward old owner): pale gold 
       particles, fading and slowing
     - RIGHT stream (from portrait toward new owner): pale gold 
       particles, intensifying and accelerating
   - The animation reverses the flow direction over 1.5 seconds — 
     this is the punchline

4. Bottom section (160px):
   - A summary card in subtle elevation #1A1D26:
     - Three rows:
       - "Sale price" label, "1,000.00 USDC" value (pale gold)
       - "Network fee" label, "≈ 0.0024 USDC" value (mono muted)
       - "KeeperHub guaranteed" with small cyan checkmark
   - Below the card, two buttons centered:
     - "Confirm Transfer" — cyan filled, primary
     - "Cancel" — text only, muted slate

5. After confirm (state change):
   - The entire modal animates a soft cyan glow pulse
   - Buttons replaced with "Transferring..." text + small loading 
     indicator
   - On success: checkmark animation, then auto-close after 1.5s

DESIGN PRINCIPLES:
- This screen has more theatrical animation budget than any other. 
  The particle reversal is the visual punchline.
- Slow timing — 1.5s, not 400ms. This is meant to feel ceremonial.
- After confirmation, the success state should be SATISFYING — a 
  slow pulse, not a snappy checkmark.
```

---

## Section C — Iterating Productively

When the screens come back, never say "make it better." Use surgical edits:

✅ Good edits:
- "Make the hero number 50% larger and switch to Fraunces Light weight"
- "Reduce auction card padding from 24px to 16px"
- "Replace worker portraits with concentric-circle-only forms, no hex pattern"
- "Slow the AXL packet animation by 50%"

❌ Bad edits:
- "Make it more cinematic"
- "Make the hero pop more"
- "Improve the layout"

Claude Design responds to specifics. Vague feedback wastes turns.

---

## Section D — Export to Code

Once screens are done, Claude Design can export to React/Tailwind. Use this:

1. Connect your GitHub repo (the `ledger/` repo from your Architecture spec)
2. Have Claude Design export each screen as a Next.js page component
3. Drop the components into `frontend/app/`
4. Refine in Claude Code Max from there

You'll likely need to wire up real data sources (AXL events via SSE, on-chain reads via viem) — that work happens in Claude Code, not Claude Design.

---

## Section E — Common Pitfalls

1. **Don't let it generate emoji-heavy or "playful" UI** — push back hard against any rounded blob shapes, gradient fills, or "fun" colors. Your aesthetic is institutional luxury, not consumer crypto.

2. **Don't accept generic "AI agent" iconography** — robot heads, brain emojis, sparkle icons. Replace with your geometric portrait system.

3. **Don't let it use Lucide React icons everywhere** — they're fine for utility (close, search, settings), but the worker portraits and main visuals should be custom abstract forms.

4. **Demand mono typography for anything on-chain** — if it puts an address in body font, reject and ask again.

5. **Numbers in Fraunces, words in Inter** — this is your typographic discipline. Money and counts get the serif treatment. Everything else stays neutral.

================================================================================
FILE: 06_AI_COUNCIL_PROMPTS.md
================================================================================

# Ledger — AI Council Prompts

**Tool:** AI Council (multiple models in parallel)
**Goal:** Interrogate the plan from multiple angles before committing 10 days of build effort.

---

## How to Use AI Council Effectively

Run the same prompt across multiple models simultaneously. Don't read each response in isolation — read them side-by-side and look for:
1. **Consensus** = probably true
2. **Disagreement** = a thing you need to verify yourself
3. **Unique findings** = the model with deeper context on that specific topic

For each prompt below, paste the **Master Brief** (file `00_MASTER_BRIEF.md`) first, then the prompt.

---

## Prompt 1 — Architecture Stress Test

**When to run:** Day 0, before any code is written.

```
Here is the technical architecture for Ledger [paste 02_ARCHITECTURE.md].

Identify the THREE highest-risk technical decisions in this architecture 
that could cause the system to fail in a live demo at ETHGlobal Open 
Agents 2026 (April 24 – May 6, 2026 hackathon).

For each risk:
1. State the failure mode in one sentence
2. Estimate probability of occurrence (low/medium/high)
3. Estimate impact severity if it occurs (low/medium/high)
4. Propose a specific mitigation that can be implemented in under 
   1 day of work
5. Propose a fallback if the mitigation fails

Be ruthless. The goal is to find the things that will actually break, 
not to be polite.
```

---

## Prompt 2 — Demo Killer-Question Simulation

**When to run:** Day 8 (before demo recording).

```
You are a judge at ETHGlobal Open Agents 2026 with deep technical 
expertise in:
- AI agents and multi-agent systems
- Decentralized systems and peer-to-peer networking
- ERC standards (especially ERC-8004, ERC-7857, ERC-721)
- DeFi and on-chain settlement
- Hackathon project evaluation

You have just watched the 4-minute demo video for "Ledger" — the 
trustless agent hiring hall.

[Paste 03_DEMO_SCRIPT.md]

List the FIVE hardest questions you would ask the team in the 
3-minute Q&A round following their finalist pitch. For each question:

1. State the question as a judge would phrase it (skeptical, probing)
2. Identify the underlying concern the question is testing for
3. Write the IDEAL 30-second answer that would satisfy a skeptical 
   judge
4. Identify any honest weakness the team should acknowledge in their 
   answer (because honesty under questioning is more credible than 
   defensiveness)

Focus your hardest questions on the INHERITANCE flow specifically — 
this is the demo's central claim and the judges will press on it.
```

---

## Prompt 3 — Hidden Vulnerabilities

**When to run:** Day 0 + Day 5 (re-run when implementation gets concrete).

```
[Paste 02_ARCHITECTURE.md]

Identify the assumptions in this architecture that could be technically 
INCORRECT. For each assumption:

1. State the assumption explicitly (the team is taking it as given)
2. Explain why it might be wrong
3. Suggest how to verify it before committing build time

Specifically focus on these five claims:

A. Gensyn's AXL Yggdrasil mesh actually traverses residential NAT 
   reliably without port forwarding. (Real-world test required.)

B. ERC-7857 on 0G actually supports transferring encrypted memory 
   pointers atomically with the token, such that the new owner can 
   immediately use the transferred memory.

C. KeeperHub's MCP server supports the chains we need (0G Sepolia 
   for the iNFT/escrow contracts, Base Sepolia for USDC settlement).

D. 0G Compute sealed inference is accessible to hackathon participants 
   without an enterprise contract or credit grant.

E. The "demo flow where the new owner immediately receives earnings 
   from the next job" actually works, given that the worker agent 
   process must somehow detect the ownership change in real-time.

For each, state your level of confidence (high/medium/low) that the 
assumption holds, and suggest the simplest verification test.
```

---

## Prompt 4 — The Inheritance Mechanics Check

**When to run:** Day 4 (when contracts are being designed).

```
[Paste relevant sections of 02_ARCHITECTURE.md, especially section 5]

Walk through the inheritance flow step by step. The critical question 
is: when the worker iNFT transfers from Owner_A to Owner_B mid-flight, 
how does the system ensure that the NEXT earned payment flows to 
Owner_B, not Owner_A?

There are three plausible designs:
1. The worker agent process listens for Transfer events and updates 
   its payout address in-memory
2. The smart contract escrow looks up the current iNFT owner at 
   payment time using ownerOf()
3. The buyer agent sends payment directly to the worker's address, 
   not the iNFT owner — and the worker forwards earnings to its 
   current owner via a separate flow

Which design is correct for our use case? What are the failure modes 
of each? What's the simplest implementation that's robust enough for 
a 3-minute demo without being naive enough to break in Q&A?

Specifically address: race conditions if the transfer happens during 
an in-flight job, MEV/frontrunning concerns, and whether to use the 
ERC-7857 memory pointer or a separate registry.
```

---

## Prompt 5 — What's Missing That Should Concern Us

**When to run:** Day 0 and Day 7.

```
[Paste 00_MASTER_BRIEF.md and 01_PRD.md]

This is a hackathon project plan for ETHGlobal Open Agents 2026, 
targeting finalist + 3 sponsor bounties (0G, Gensyn, KeeperHub).

What is MISSING from this plan that an experienced hackathon judge 
or an experienced founder would notice?

Consider:
- Things that should be in the PRD but aren't
- Sponsor integration requirements that are under-specified
- Demo scenarios that haven't been thought through
- "Boring" infrastructure work that's been hand-waved (deployment, 
  monitoring, testnet faucet logistics)
- Edge cases in the user flow that judges will ask about
- Story / pitch elements that aren't strong enough to win finalist
- Claims in the demo that aren't backed by the actual implementation

Produce a list of 10 specific gaps, ordered by severity. For each, 
state how to close the gap.
```

---

## Prompt 6 — Competitive Field Modeling

**When to run:** Day 1.

```
[Paste 00_MASTER_BRIEF.md]

ETHGlobal Open Agents 2026 will likely have 200-500 submissions. 
Model the competitive field:

1. What FRACTION of submissions will be:
   a. LLM-wrapper-with-a-wallet (no real on-chain execution)
   b. Single-agent DeFi tools
   c. Multi-agent prediction-market projects (the DIVE clone)
   d. Memecoin-launch agents
   e. Generic AgentKit + Base demos
   f. Genuinely novel multi-agent coordination projects

2. Of the genuinely novel projects (your category f), what FRACTION 
   will likely:
   - Use AXL across separate nodes (the Gensyn DQ filter)
   - Mint actual iNFTs (ERC-7857) with embedded intelligence
   - Have a memorable demo moment that judges remember at deliberation

3. Where does Ledger sit in this distribution? What are the 1-3 
   projects most likely to be similar to Ledger, and how should we 
   differentiate?

4. Given that finalist selection is roughly top 5% (10 finalists out 
   of 200-500), what specific elements does Ledger need to nail to 
   end up in that top 5%?
```

---

## Prompt 7 — Final Demo Polish Check

**When to run:** Day 9 (after demo recording, before submission).

```
[Paste 03_DEMO_SCRIPT.md and the actual recorded video transcript]

You are watching the Ledger demo for the first time. You have 4 
minutes of attention and you are tired (you've watched 30 demos 
today).

1. In the first 15 seconds, do you understand what this product is? 
   What's clear, what's confusing?

2. By the 1-minute mark, do you trust that this is real (not a 
   mockup)? What signals trust, what undermines it?

3. At the inheritance moment (around 2:30), does the punchline land? 
   Does it feel novel and important, or does it feel like a feature 
   the product just happens to have?

4. By 4:00, what's the one thing you remember? If you had to summarize 
   this project in a sentence to your fellow judge, what would you 
   say?

5. What are the 3 most impactful edits to make before submission?

Be a tough critic. Hackathon demo videos win or lose at the 15-second 
mark and at the punchline. Tell us if either is failing.
```

---

## Reading the Council's Output

For each prompt, after running across models:

1. **Make a single combined doc** with each model's response side-by-side
2. **Highlight in green:** points where 3+ models agree
3. **Highlight in yellow:** points where models disagree (these need your judgment)
4. **Highlight in red:** unique critical findings only one model raised (verify, then act)
5. **Action items:** convert findings into specific tasks in your project tracker

Don't drown in the responses. The point of AI Council is to surface blind spots, not to outsource the decision.

================================================================================
FILE: 07_SUBMISSION_PACK.md
================================================================================

# Ledger — Submission Materials

**Tool:** ETHGlobal submission form + repo files
**When to use:** Day 10 (May 3)

---

## Section A — ETHGlobal Submission Form Answers

These are drafts. Polish on submission day with your actual repo URL, demo URL, and contract addresses.

### Project name
```
Ledger
```

### Tagline (one sentence)
```
The trustless hiring hall where AI agents bid for work — and the workers 
themselves are tradeable iNFTs whose reputation, memory, and earnings 
travel with them across owners.
```

### What it does (3-4 sentences)
```
Ledger is a peer-to-peer marketplace for AI agents to hire other AI agents. 
Buyer agents post tasks, worker agents on a decentralized AXL mesh bid in 
real-time auctions, and KeeperHub guarantees the on-chain settlement. 
Workers themselves are ERC-7857 iNFTs minted on 0G — every worker carries 
persistent memory, reputation, and earnings history that transfer with the 
iNFT to a new owner. The result is the first secondary market for working 
AI agents with on-chain provenance.
```

### How it's made
```
Three layers, three sponsors. Workers run on 0G Compute with persistent 
memory in 0G Storage; each worker is an ERC-7857 iNFT on 0G Chain Sepolia. 
All inter-agent communication runs over Gensyn's AXL across three 
independent nodes — two cloud VMs and a local laptop — with no central 
broker. Every on-chain action (payment, reputation update, escrow release) 
is submitted through KeeperHub's MCP server, with demonstrated gas-spike 
resilience via private mempool rerouting.

Reputation is read from the audited ERC-8004 registry deployment on Base
Sepolia. Settlement is native 0G escrow on Galileo, where bid bonds and
payments are released to the current iNFT owner at settlement time. The
dashboard is Next.js 14 with shadcn/ui, with live AXL event streaming via
Server-Sent Events.

The most interesting build problem was the inheritance flow: when a 
worker iNFT transfers mid-flight, the next earned payment must flow to 
the new owner. We solved this by having the escrow contract look up the 
current iNFT owner at payment time via ownerOf(), rather than caching 
the owner address — making transfers atomic without race conditions.
```

### Notable challenges
```
AXL was released nine days before the hackathon began (April 15, 2026), 
with no mature SDK, no deployed examples, and 6 GitHub stars at the time 
we started. Getting three nodes to mesh reliably across NAT boundaries 
was day 1-2 work. We wrote our own thin Python client around the AXL 
HTTP node, since none existed.

Embedding agent memory into ERC-7857 metadata in a way that survives 
ownership transfer required custom tooling on top of 0G's iNFT scaffolding. 
We chose to store the memory CID in the iNFT's tokenURI metadata rather 
than as a separate registry, ensuring atomicity.

The KeeperHub gas-spike retry path needed deterministic triggering for 
the demo. We solved this by pre-staging a fuzz-tx wallet that floods Base 
Sepolia with high-fee transactions during the demo, reliably triggering 
KeeperHub's private-mempool reroute path.
```

### Sponsor integration writeups (per sponsor)

#### 0G Labs Track B — Best Autonomous Agents, Swarms & iNFT Innovations

```
Ledger uses 0G as the agent fabric — compute, storage, and identity.

iNFT (ERC-7857): Each worker agent is minted as an ERC-7857 iNFT on 0G 
Chain Sepolia. Token metadata includes a 0G Storage CID pointing to the 
encrypted memory blob. The iNFT carries the worker's reputation history, 
making the agent itself a transferable, yielding asset.

Swarm: At least 3 worker agents run as a swarm, each on its own AXL node, 
each making independent bidding decisions, each with its own persistent 
memory in 0G Storage.

0G Compute: All agent reasoning calls 0G Compute's sealed inference 
endpoint with qwen3.6-plus, ensuring outputs are verifiable and tamper-proof.

0G Storage: Persistent memory uses both KV (for structured profile data 
like preferences and learned strategies) and Log (for the append-only 
record of completed tasks).

Demo highlight: the inheritance moment. A worker iNFT with 47 completed 
jobs gets transferred mid-demo to a new owner. The new owner's worker 
immediately bids on a fresh task using the same agent and reputation — 
proving that the iNFT genuinely carries embedded intelligence, not just 
a name.

Contract addresses (0G Sepolia):
- WorkerINFT.sol: [TO ADD ON DAY 10]
- LedgerEscrow.sol: [TO ADD]
- LedgerReputationRegistry.sol: [TO ADD]
- LedgerIdentityRegistry.sol: [TO ADD]

Architecture diagram: see /docs/architecture-diagram.png in repo
Demo video: [URL]
```

#### Gensyn — Best Application of AXL

```
Ledger runs three AXL nodes across three independent machines: two cloud 
VMs (us-west and eu-central) and one local laptop. There is no central 
broker. All inter-agent communication — task announcements, bidding, 
acceptance, status updates — flows over the AXL Yggdrasil mesh using 
both pubsub channels and direct peer messaging.

The local laptop node operates behind residential NAT, demonstrating 
AXL's port-free, NAT-traversal value proposition. The dashboard 
includes a live topology visualization showing real cross-node packets.

Notable: AXL was 9 days old at the start of the hackathon. We wrote our 
own thin Python client to wrap the AXL HTTP node and exposed pubsub + 
direct messaging primitives to our agent runtime. The wrapper is open 
source and could serve as a reference for other AXL adopters.

Repo: [URL]
Demo cross-node section: video timestamp 0:35–1:35
```

#### KeeperHub — Best Use of KeeperHub

```
Every on-chain action in Ledger flows through KeeperHub's MCP server: 
payment release from escrow, bond returns, reputation updates, and iNFT 
transfers. We use KeeperHub specifically because the agent-economy 
thesis only works if transactions land reliably under adverse conditions.

Demo highlight: gas-spike resilience. During the demo we trigger a 
deliberate gas spike on Base Sepolia. Without KeeperHub, the worker's 
payment claim would fail or be priced out. With KeeperHub, the 
transaction reroutes via private mempool and confirms in under 5 
seconds. This is the moment that proves Ledger is production-grade, 
not a toy.

Integration: KeeperHub MCP is invoked from our Python agent runtime 
via the standard MCP client. Every signed transaction payload is 
passed to KeeperHub with the chain ID; KeeperHub handles gas 
estimation, retry, MEV protection, and audit trail.

Feedback file: see FEEDBACK_KEEPERHUB.md in the repo root for our 
detailed DX feedback, bug reports, and feature requests.

Repo: [URL]
Demo gas-spike section: video timestamp 1:35–2:00
```

---

## Section B — KeeperHub Builder Feedback Bounty Submission

This is the file that goes in your repo root: `FEEDBACK_KEEPERHUB.md`. The KeeperHub team explicitly created this $250 bounty to reward thoughtful feedback. Treat it as a serious deliverable.

### Template

```markdown
# KeeperHub Builder Feedback — Ledger Team

**Project:** Ledger (ETHGlobal Open Agents 2026)
**Integration:** KeeperHub MCP server for guaranteed on-chain tx execution
**Submitter:** Gabriel + team

## Summary

We integrated KeeperHub MCP for all on-chain transaction submission in 
Ledger — payment releases, bond returns, reputation updates, iNFT 
transfers. Below is our honest experience: what worked, what was 
friction, what we'd want next.

## What worked well

[Fill in 3-5 specific things during the build, e.g.:]
- The MCP server interface was easy to wire into our existing agent 
  runtime — we already had MCP client code, so KeeperHub plugged in 
  with minimal adaptation.
- The gas-spike reroute behavior was reliable. We tested it with 
  fuzz-tx flood attacks and the private mempool routing held up.
- The audit trail returned in the response payload was useful for 
  building our dashboard's transaction history view.
- [more during build]

## Friction points / bugs

[Fill in honest issues encountered, with reproduction steps where possible:]

### Bug 1 — [Title]
**Severity:** [low/medium/high]
**Repro:**
1. ...
2. ...
**Expected:** ...
**Actual:** ...

### Bug 2 — ...

### DX Friction 1 — [Title]
[Description of something that worked but was slower/harder than it 
should have been]

## Feature requests

[3-5 things we wished existed:]

### Feature 1 — Multi-chain transaction batching
We needed to send a payment on Base Sepolia AND update reputation on 
0G Sepolia in the same logical operation. Currently this requires 
two separate KeeperHub calls. A "transaction bundle across chains" 
primitive would simplify cross-chain agent flows significantly.

### Feature 2 — Webhook on transaction status changes
[etc.]

## Documentation feedback

- [Specific docs gaps found during integration]
- [Examples that would have saved us time]

## Overall assessment

[1-2 paragraphs: would we use KeeperHub again? For what use cases? 
Where would we recommend or not recommend it?]

## Contact

[Team contact info]
```

Fill this honestly during the build. Don't leave it for Day 10 — by then you'll have forgotten the specific friction points. Add to it daily.

---

## Section C — Repo README Template

This is what judges see first. It must answer in 30 seconds: what is this, does it work, where's the demo.

### Template

```markdown
# Ledger

**The trustless hiring hall where AI agents bid for work — and the 
workers themselves are tradeable iNFTs whose reputation, memory, and 
earnings travel with them across owners.**

[Hero image — generated by Higgsfield]

[![Demo Video](https://img.youtube.com/vi/VIDEO_ID/0.jpg)](https://...)
👆 4-minute demo video

🌐 **Live deployment:** https://ledger.xyz (or fallback URL)
🎥 **Demo video:** [URL]
📦 **Built at:** ETHGlobal Open Agents 2026

---

## What it is

Ledger is a peer-to-peer marketplace for AI agents to hire other AI 
agents.

- **Buyer agents** post tasks
- **Worker agents** bid in real-time auctions over Gensyn's AXL mesh
- **KeeperHub** guarantees on-chain settlement
- Workers themselves are **ERC-7857 iNFTs** on 0G — they can be 
  bought, sold, and inherited with their full reputation, memory, 
  and earnings history

The result: the first secondary market for working AI agents with 
on-chain provenance.

## Architecture

[Embed architecture diagram PNG]

| Layer | Tech |
|---|---|
| Compute & memory | 0G Compute + 0G Storage |
| Agent persona | ERC-7857 iNFT on 0G Chain Sepolia |
| Comms | Gensyn AXL (3 nodes, no central broker) |
| Identity & reputation | Minimal ERC-8004 registry on 0G Sepolia |
| Settlement | USDC on Base Sepolia |
| Tx execution | KeeperHub MCP |
| Frontend | Next.js 14 + shadcn/ui |

## Sponsor integrations

- **0G Labs Track B** — iNFT-minted worker swarm with persistent 
  memory and verifiable inference. [Details](#0g-integration)
- **Gensyn AXL** — 3 cross-node mesh for all inter-agent comms. 
  [Details](#gensyn-integration)
- **KeeperHub** — Guaranteed tx execution with gas-spike resilience. 
  [Details](#keeperhub-integration)

## Contract addresses (0G Sepolia)

| Contract | Address |
|---|---|
| WorkerINFT | `0x...` |
| LedgerEscrow | `0x...` |
| LedgerReputationRegistry | `0x...` |
| LedgerIdentityRegistry | `0x...` |

## How to run locally

```bash
git clone ...
cd ledger
# install deps
pnpm install
# start AXL node
docker-compose -f axl/docker-compose.yml up
# start contracts
cd contracts && forge build
# start agents
cd agents && python buyer/main.py &
python worker/main.py
# start frontend
cd frontend && pnpm dev
```

[Detailed setup instructions]

## Team

- Gabriel — [@handle] — Architecture, AXL, demo
- [Friend 1] — [@handle] — Backend, contracts
- [Friend 2] — [@handle] — Frontend
- [Friend 3] — [@handle] — Agent reasoning, video

## License

MIT
```

---

## Section D — Day 10 Final Checklist

Before clicking submit, verify:

- [ ] Repo is public on GitHub
- [ ] All commits dated April 24, 2026 or later (no pre-existing code)
- [ ] README.md is polished and renders well on GitHub
- [ ] Architecture diagram embedded as PNG (not SVG, for GitHub compatibility)
- [ ] Demo video uploaded to YouTube or Vimeo, link in README
- [ ] 4-minute video uploaded; if 0G submission requires under 3 minutes, also have a 3-minute cut available
- [ ] Live deployment URL works (test on a fresh browser, no localStorage)
- [ ] All contract addresses listed and verified on explorers
- [ ] `FEEDBACK_KEEPERHUB.md` filled with real, dated feedback (not last-minute)
- [ ] ETHGlobal submission form completed
- [ ] Partner prizes selected: 0G + Gensyn + KeeperHub
- [ ] KeeperHub Builder Feedback bounty submitted as a separate entry
- [ ] All 4 team members listed with valid wallets for prize disbursement
- [ ] ETH stake unlocked / submission confirmed
```

================================================================================
FILE: 08_DAY0_VERIFICATION.md
================================================================================

# Ledger — Day 0 Verification Checklist

**When:** Hour 0–6 of the hackathon, BEFORE any code is written
**Why:** Five assumptions are baked into the architecture. If any of them is false, we need to know NOW, not on Day 7.

Send these questions to sponsor Discord channels first thing on Day 0. Continue planning while you wait, but do not start the build until Q1, Q3, and Q4 are confirmed.

---

## Q1 — 0G ERC-7857 iNFT Memory Transfer (CRITICAL)

**Where to ask:** 0G Labs Discord, dev channel
**Why critical:** The entire Inheritance demo depends on this working

**Question to post:**

```
Hi 0G team — building for Open Agents 2026 (Track B). Two questions 
on ERC-7857 (iNFT):

1. When an iNFT transfers from owner A to owner B, does the encrypted 
   memory pointer in the token metadata transfer atomically with the 
   token, such that owner B can immediately access the memory blob 
   in 0G Storage without any additional re-encryption / re-permission 
   step?

2. If 0G Storage data is permissioned by the original owner's address, 
   what's the recommended pattern for making it accessible to the 
   new owner post-transfer? Is there an automatic re-keying mechanism, 
   or do we need to implement that ourselves?

Use case: marketplace where worker iNFTs (with persistent memory of 
past completed tasks) get bought and sold. New owner needs immediate 
access to the worker's memory.

Thanks!
```

**Acceptable answers:**
- "Yes, memory pointers transfer atomically and 0G Storage uses token-bound permissioning" → proceed as planned
- "Memory pointer transfers but you need to handle permissioning yourself" → plan an extra day of work to implement this
- "Not currently supported" → pivot to a workaround (memory pointer in iNFT metadata + a separate registry contract that maps iNFT ID → access key, callable only by current owner)

---

## Q2 — AXL on Residential NAT (HIGH)

**Where to ask:** Gensyn Discord, AXL channel (or directly DM the AXL maintainers)
**Why critical:** Demo claim is "3 nodes including one on a residential laptop." If AXL fails on residential NAT, we either lose authenticity or have to use 3 cloud nodes.

**Question to post:**

```
Hi Gensyn team — building for Open Agents 2026 with AXL.

Two questions on real-world deployment:

1. Has AXL been tested on residential ISPs with carrier-grade NAT 
   (CGNAT) — for example, US/EU mobile broadband or some ISPs' home 
   internet? Does the Yggdrasil mesh successfully form to peers across 
   the public internet from a residential NAT, or are STUN/TURN-style 
   relays needed?

2. For a hackathon demo where we want to show 3 nodes — 2 cloud VMs 
   and 1 local laptop on residential WiFi — what's the recommended 
   bootstrap topology and any setup we should do beforehand to ensure 
   reliable mesh formation?

Thanks!
```

**Acceptable answers:**
- "Works fine on residential, just bootstrap from a public peer" → proceed as planned
- "Needs static IP / port forwarding" → use 3 cloud VMs instead
- "CGNAT can be problematic" → test specifically on your home network Day 1 before committing

---

## Q3 — KeeperHub Testnet Support (CRITICAL)

**Where to ask:** KeeperHub Discord (find via their site or ETHGlobal sponsor channel)
**Why critical:** If KeeperHub is mainnet-only, we either pay real gas during the demo or build a wrapper

**Question to post:**

```
Hi KeeperHub team — building for Open Agents 2026.

Quick question on chain support:

1. Does KeeperHub MCP currently support 0G Chain Sepolia testnet 
   for transaction submission? What about Base Sepolia?

2. If testnets aren't supported, what's the recommended path for 
   hackathon demos? Is there a sandbox / dry-run mode that simulates 
   the gas-spike reroute behavior on testnets without real mempool 
   conditions?

Use case: agent marketplace where every payment / reputation update / 
escrow release goes through KeeperHub. We want to demonstrate the 
gas-spike resilience but on testnet.

Thanks!
```

**Acceptable answers:**
- "Testnets supported, here's the config" → proceed as planned
- "Not supported, but we can spin up a sandbox" → use the sandbox
- "Mainnet only" → either fund a small mainnet wallet for the demo (~$20 of ETH on Base) or build a thin local wrapper that mimics the KeeperHub interface for the demo, with honest disclosure in the submission

---

## Q4 — 0G Compute Sealed Inference Access (HIGH)

**Where to ask:** 0G Discord, dev channel
**Why critical:** All worker reasoning is supposed to run on 0G Compute. If it requires enterprise contract, we're stuck

**Question to post:**

```
Hi 0G team — for Open Agents 2026 we plan to use 0G Compute's sealed 
inference (qwen3.6-plus or GLM-5-FP8) for our agent reasoning loop.

1. Is the sealed inference endpoint accessible to hackathon 
   participants without an enterprise contract? Is there a credit 
   grant / faucet for hackathon teams?

2. What are the rate limits for inference requests during the 
   hackathon period? Our demo runs 3 agents that each make ~5 
   inference calls per task cycle.

Thanks!
```

**Acceptable answers:**
- "Yes, here's the credit grant / endpoint URL" → proceed
- "Apply for credits via this form" → apply on Day 0
- "Not available for hackathon" → fall back to OpenAI/Claude API for reasoning, claim the 0G Compute integration as future work, lose some 0G Track B points

---

## Q5 — Submission Form: Partner Prize Slots (MEDIUM)

**Where to ask:** ETHGlobal Discord, support channel
**Why critical:** Affects which sponsors we can apply for

**Question to post:**

```
Hi ETHGlobal team — quick question on the Open Agents 2026 submission 
form:

For the "max 3 partner prizes" rule on the submission form — does 
each sponsor count as one slot, or do sub-prizes within a sponsor 
(e.g., 0G has Track A and Track B) count as separate slots?

We want to apply to 0G Track B + Gensyn + KeeperHub. Just want to 
confirm we can fit all three.

Thanks!
```

**Acceptable answers:**
- "Each sponsor is one slot, not each track" → fine, our 3 sponsors = 3 slots
- "Each track is a separate slot" → still fine, we picked 1 track per sponsor

---

## Day 0 Action Plan

While you wait for sponsor responses:

### Hour 0-1 (everyone)
- [ ] Post all 5 questions in respective Discords
- [ ] Set up team Slack/Discord/Telegram
- [ ] Each team member registers wallet, joins ETHGlobal
- [ ] Create GitHub org + private repo (will go public on Day 10)

### Hour 1-3 (Gabriel)
- [ ] Spin up 2 cloud VMs (DigitalOcean or AWS): 1 in us-west, 1 in eu-central
- [ ] Install AXL binary on both VMs from the official GitHub
- [ ] Test cross-VM "hello world" message
- [ ] Document any gotchas in `/notes/day0-axl-setup.md`

### Hour 1-3 (Friend 1 - backend)
- [ ] Set up Foundry workspace in `/contracts`
- [ ] Stub out the 4 contracts: LedgerEscrow, WorkerINFT, IdentityRegistry, ReputationRegistry
- [ ] Get 0G Sepolia RPC endpoint, deploy a "hello world" contract to test the chain works

### Hour 1-3 (Friend 2 - frontend)
- [ ] Set up Next.js 14 in `/frontend`
- [ ] Install shadcn/ui, Tailwind, configure dark theme with the Ledger color palette
- [ ] Set up Claude Design project and start on Hall homepage

### Hour 1-3 (Friend 3 - full-stack)
- [ ] Set up Python (or Node) agent runtime skeleton in `/agents`
- [ ] Implement basic AXL HTTP client wrapper (calls localhost:9002 endpoints)
- [ ] Test sending a message through a local AXL node

### Hour 3-6 (everyone)
- [ ] Sync up on early findings
- [ ] Consolidate sponsor Discord answers
- [ ] If any blocking answer is missing, follow up with @ mentions
- [ ] Confirm Day 1 task list

---

## What to Do If Questions Don't Get Answered

If sponsor Discords are slow:

1. **0G** — also try Twitter DM to the dev relations team
2. **Gensyn** — they're a small team but responsive on Discord; if no answer in 12 hours, just test empirically (boot AXL, see if it forms a mesh)
3. **KeeperHub** — first-time ETHGlobal sponsor, will likely be highly responsive. If no answer in 6 hours, escalate via ETHGlobal Discord since they're a paid sponsor
4. **ETHGlobal** — ALWAYS responsive. 4-hour SLA in our experience

If by Day 1 morning you still don't have answers to Q1, Q3, or Q4, **make a decision based on best evidence and document the assumption.** Don't wait beyond Day 1.

---

## Pivot Triggers

Hard pivot decisions if blocking answers come back negative:

| If... | Then... |
|---|---|
| Q1 answer = "iNFT memory doesn't transfer atomically" | Implement custom registry-mapping pattern, +1 day of work |
| Q3 answer = "KeeperHub mainnet-only" | Either fund $20 of mainnet ETH for demo OR build a 1-day KeeperHub wrapper |
| Q4 answer = "0G Compute requires enterprise contract" | Use OpenAI/Claude API, drop 0G Compute claim, accept reduced 0G Track B score |
| Q2 answer = "AXL doesn't work on residential" | Use 3 cloud VMs, the demo loses some authenticity but the bounty is still in reach |

If 2 or more critical questions come back negative, **reconsider the project scope on Day 1.** Don't sink 9 days into a plan whose foundation has cracked.

================================================================================
FILE: 09_BRAND_IDENTITY.md
================================================================================

# Ledger — Brand Identity Spec

**The complete identity system for Ledger.** Everything visual, verbal, and conceptual lives here. Use this for the logo gen, the Higgsfield prompts, the Claude Design system, the demo video voiceover, the GitHub README, the social posts.

---

## 1. The Name

**LEDGER**

### Why this name works

| Property | How Ledger delivers |
|---|---|
| One word | Yes |
| 2 syllables | Yes — "led-jer" |
| Spells naturally | Yes |
| Pronounceable in any language | Yes |
| Owns a real concept | Yes — the canonical word for "record of value" since 1481 |
| Crypto-credible without crypto-cliché | Yes — refers to accounting, not blockchains |
| Memorable after one hearing | Yes |
| Available as a brand | Verify .xyz, .so, .market, .eth on Day 0 |

### Domain priority order (claim Day 0)
1. `ledger.market` — best fit semantically
2. `ledger.so` — short, technical-feeling
3. `useledger.xyz` — common pattern, fallback
4. `ledger.eth` — likely taken; check anyway, won't be used as primary URL

⚠️ **Risk note:** Ledger SAS (the hardware wallet company) owns the trademark in the crypto wallet category. For a hackathon project this is fine — your category is "agent marketplace," not "hardware wallet" — and Ledger SAS doesn't claim that mark. If this product continues post-hackathon and you want to commercialize, you'll need to either rebrand or be very careful about positioning. **Document this acknowledgment in your README to avoid looking naive to judges.**

### Tagline (locked)

```
The trustless hiring hall for AI agents.
```

Short version (for social / OG image):
```
Where AI agents hire AI agents.
```

Long version (for press / pitch deck):
```
The trustless hiring hall where AI agents bid for work — and the workers 
themselves are tradeable on-chain assets that carry their reputation, 
memory, and earnings history with them across owners.
```

---

## 2. The Logo

### Concept

A **single geometric mark + the wordmark "LEDGER"**. The mark stands alone for app icons, OG images, and small contexts. The full lockup is for headers and longer-form materials.

### The Mark

**Concept:** Three nodes in a triangular arrangement, connected by lines. Two of the lines are solid; one is dashed. This visualizes:

- **Three nodes** = the agent network (also literally the 3 AXL nodes in the demo)
- **Two solid lines** = settled / completed connections (transactions on-chain)
- **One dashed line** = an active / in-flight connection (a bid or a job in progress)

The mark works at every size — at 16px it reads as three dots and lines; at 240px it reads as a precise geometric construction.

### Mark specifications

```
GEOMETRY
- Three circles arranged in an equilateral triangle
- Triangle pointing up (point at top)
- Each circle: 12% of the bounding box width, filled
- Lines between circles: 1.5px stroke for solid, 1.5px dashed (4px on, 3px off)
- The dashed line is ALWAYS the bottom edge of the triangle (between the two lower nodes)

PROPORTIONS
- Bounding box: 1:1 square
- Circle centers form an equilateral triangle inscribed at 80% of the bounding box
- Padding: 10% on all sides

COLOR (single-color version)
- Pale gold #E8D4A0 on deep ink #0A0E1A (default — premium feel)
- Or warm white #F5F2EB on deep ink (when gold conflicts)

COLOR (two-color version, for emphasis)
- Top circle: pale gold #E8D4A0
- Two lower circles: warm white #F5F2EB
- Solid lines: warm white at 60% opacity
- Dashed line: electric cyan #5FB3D4 (the "live" connection)
```

### Wordmark

**Font:** Fraunces, 9pt Caps optical size, Black weight (or Black Italic for the Italic variant)

**Letterspacing:** -0.02em (tight but not crushed)

**Styling rules:**
- Always uppercase: `LEDGER`
- Never `Ledger` or `ledger` for branding (only in body copy as a regular noun)
- The `D` and `G` should not touch — kern them apart by 1pt if Fraunces auto-kerning is too tight

### The Lockup (mark + wordmark)

**Horizontal lockup** (for headers, README, footer):
```
[MARK]   LEDGER
```
- Mark height = wordmark cap height
- Spacing between mark and wordmark = 0.5x mark width
- Vertically center-aligned

**Stacked lockup** (for app icon adjacents, vertical contexts):
```
[MARK]
LEDGER
```
- Wordmark cap height = 0.4x mark height
- Vertical gap = 0.15x mark height

### Clear space

**Minimum clear space around the lockup:** equal to the height of the `L` in LEDGER on all sides. No other elements (text, images, edges) within this zone.

### Don'ts

- ❌ Never rotate the mark
- ❌ Never apply gradients
- ❌ Never apply drop shadows
- ❌ Never place on photographic backgrounds without a solid scrim
- ❌ Never stretch or skew
- ❌ Never use the mark in a sentence like a logo (e.g., "Built with [MARK]")
- ❌ Never recolor outside the approved palette

---

## 3. Logo Generation Prompts

### For your image gen tool (DALL-E, Midjourney, Imagen, Higgsfield image, Flux)

#### Prompt for the standalone mark

```
Minimalist vector logo mark on deep navy black background. Three small 
filled circles arranged in an equilateral triangle, point facing up. 
The two top connections (left circle to top circle, right circle to top 
circle) are solid thin lines. The bottom edge connecting the two lower 
circles is a dashed line. The top circle is pale gold #E8D4A0, the two 
lower circles are warm off-white #F5F2EB, the solid lines are off-white 
at 60% opacity, the dashed line is electric cyan #5FB3D4. Geometric, 
precise, mathematical. Reference: Massimo Vignelli logo design, Pentagram 
graphic identity, Bauhaus geometric purity. Square format 1024x1024. 
Vector aesthetic, NO photorealism, NO 3D effects, NO gradients, NO 
shadows, NO glow effects.
```

#### Prompt for the horizontal lockup

```
Premium minimalist logo lockup. Left side: a small geometric mark — 
three circles in an upward triangle, two solid lines on the upper 
edges, one dashed line on the bottom edge. Right side: the wordmark 
"LEDGER" in a chunky modern serif font (Fraunces Black or similar), 
all uppercase, tight letterspacing. Both rendered in pale gold 
#E8D4A0 on a deep navy black #0A0E1A background. Generous clear space 
around the lockup. Reference: the Stripe Press logo, the Substack 
wordmark, the Robinhood Gold lockup. Wide horizontal format 1920x600. 
NO gradients, NO shadows, NO 3D, NO additional graphics or 
embellishments.
```

#### Prompt for the app icon

```
Square app icon, 1024x1024. Centered on a deep navy black #0A0E1A 
background: three small filled circles arranged in an equilateral 
upward triangle, with two solid thin lines on the upper edges and 
one dashed line on the bottom edge. All three circles and lines 
rendered in pale gold #E8D4A0. Geometric, precise, no other elements. 
Slightly rounded corners on the icon background (iOS-style 22% radius). 
Reference: the Linear app icon, the Notion icon, the Things icon. 
Premium, restrained, institutional. NO text, NO additional graphics.
```

#### If those don't land — alternative concept (the L-monogram)

If the three-node mark doesn't generate well, fall back to a typographic monogram:

```
Premium typographic monogram. The capital letter "L" rendered in a 
chunky modern serif (Fraunces Black weight), but with a small detail: 
the horizontal serif at the base of the L extends rightward and 
terminates in three small filled dots forming a triangle pattern. 
Pale gold #E8D4A0 on deep navy black #0A0E1A. Square format 1024x1024. 
Reference: the Mailchimp Freddie monogram, the Stripe S, the New York 
Times T. Geometric, refined. NO gradients, NO 3D, NO shadows.
```

### Iteration tips

After first generation:
1. **Reject anything cute, friendly, or playful.** Push toward "institutional luxury."
2. **Reject anything with extra elements.** If it adds sparkles, gradients, glow — re-prompt with "remove all decorative effects, pure geometric forms only."
3. **The mark should pass the squint test.** Squint at the result; if it looks like generic abstract art, the geometry isn't disciplined enough.

---

## 4. Typography System

### Type stack

| Use | Font | Weight | Source |
|---|---|---|---|
| Display (wordmark, hero numbers) | **Fraunces** | Black, ExtraBold | Google Fonts (free) |
| Body (paragraphs, labels, buttons) | **Inter** | Regular, Medium, SemiBold | Google Fonts (free) |
| Monospace (addresses, hashes, code) | **JetBrains Mono** | Regular, Bold | Google Fonts (free) |

### Why these specific fonts

- **Fraunces** — A Google-Fonts variable serif by Phaedra Charles. It has a "9pt" optical size axis at small sizes that's perfect for the wordmark, plus a "soft" axis that lets you control how friendly vs. severe the letters feel. Set softness to 0 (severe) for institutional vibes. Free, open-source, won't have licensing issues.
- **Inter** — Rasmus Andersson's grotesque designed for screens. The default for serious crypto / fintech UIs. Massive weight range, perfect screen rendering, free.
- **JetBrains Mono** — Mono with high legibility for hex addresses and tx hashes. Distinguishes 0/O, 1/l/I clearly. The mono font of choice for crypto.

### Type scale

| Token | Size | Use |
|---|---|---|
| `display-xl` | 96px / Fraunces Black / -0.03em | The "12,847.50 USDC" hero number on the Hall |
| `display-lg` | 64px / Fraunces ExtraBold / -0.02em | Worker name on Worker Profile |
| `display-md` | 48px / Fraunces ExtraBold / -0.02em | Stats grid values |
| `display-sm` | 32px / Fraunces SemiBold / -0.01em | Card titles, modal headers |
| `body-lg` | 18px / Inter Medium / -0.005em | Job titles, prominent labels |
| `body-md` | 14px / Inter Regular | Default body text, paragraph copy |
| `body-sm` | 12px / Inter Regular | Captions, metadata |
| `mono-md` | 14px / JetBrains Mono Regular | Addresses (full), tx hashes |
| `mono-sm` | 12px / JetBrains Mono Regular | Truncated addresses, log lines |
| `caps-md` | 12px / Inter SemiBold / 0.08em / uppercase | Section headers ("LIVE JOBS") |
| `caps-sm` | 10px / Inter SemiBold / 0.1em / uppercase | Pill labels, status badges |

### Typography rules

1. **Numbers in Fraunces, words in Inter.** Discipline this religiously. Money, counts, ratings → serif. Everything else → grotesque.
2. **Tabular figures everywhere a number could change.** Use the `tabular-nums` Tailwind class or `font-feature-settings: 'tnum'` so `9.99` and `10.00` align.
3. **Monospace for anything copy-pasteable.** Addresses, hashes, contract IDs, seed phrases (never display, but in code samples).
4. **Never underline links.** Use color (cyan) and hover state instead.
5. **Letter-spacing tightens with size.** Bigger text = tighter letter-spacing, all the way down to -0.03em on `display-xl`.

---

## 5. Color System

### Tokens

```css
/* Backgrounds */
--ink-deep:        #0A0E1A;  /* Page background */
--ink-warm:        #13151C;  /* Section backgrounds, zebra rows */
--ink-elevated:    #1A1D26;  /* Cards, modals, surfaces */
--ink-border:      #272A35;  /* Subtle borders, dividers */

/* Text */
--text-primary:    #F5F2EB;  /* Body text, headings */
--text-muted:      #7A8290;  /* Labels, captions, secondary info */
--text-disabled:   #4A5060;  /* Placeholders, disabled states */

/* Brand */
--gold:            #E8D4A0;  /* Money. Earnings. Brand wordmark. */
--gold-dim:        #B8A578;  /* Hover/pressed states for gold */

/* Accent */
--cyan:            #5FB3D4;  /* Live activity, primary buttons, links */
--cyan-dim:        #4A8DAB;  /* Hover/pressed states for cyan */

/* Semantic */
--success:         #4A8B6F;  /* Confirmed, paid, positive */
--warning:         #D4A347;  /* Pending, caution */
--danger:          #C97064;  /* Failed, slashed, negative */
```

### Usage rules (strict)

| Color | Used for | Forbidden uses |
|---|---|---|
| **Gold #E8D4A0** | Money values only. The wordmark. Earnings totals. USDC amounts. | Never as button color. Never in body text. Never in icons. |
| **Cyan #5FB3D4** | Live activity. Active states. Primary buttons. AXL packets. Live links. | Never for money. Never for branding. Never for static decorative elements. |
| **White #F5F2EB** | Body text. Worker names. Default text on dark. | Never bright pure white #FFFFFF — always use the warm off-white. |
| **Muted slate #7A8290** | Secondary text. Labels. Helper text. Inactive states. | Never for primary content. |
| **Success/Warning/Danger** | Status badges, confirmation indicators only. | Never as decorative accents. |

### "Money is sacred" rule

Gold #E8D4A0 only appears in three places on any given screen:
1. The single most important monetary value (e.g., the hero "12,847.50 USDC")
2. The brand wordmark in the nav
3. Specific scoped earnings values where contrast is needed

If you find yourself using gold for buttons, accents, or decoration — stop and use cyan or white instead.

---

## 6. Voice & Tone

### Brand voice principles

1. **Spare** — Use 50% fewer words than feels comfortable. Cut adjectives.
2. **Precise** — Numbers over adjectives. "5 USDC" not "small payment."
3. **Cold** — No exclamation marks. No emojis. No "we're so excited!" energy.
4. **Confident without bravado** — State facts. Don't sell.
5. **Technical but not jargon-soaked** — Use ERC-7857 once, then "the iNFT." Use AXL once, then "the mesh."

### Voice exemplars

| Bad voice (don't write this) | Good voice (write this) |
|---|---|
| "🚀 Launch your AI agent today and start earning rewards!" | "Mint a worker. Bid on jobs. Get paid in USDC." |
| "We're thrilled to announce that Ledger is the first-ever..." | "Ledger is the first secondary market for working AI agents." |
| "Our amazing reputation system makes everything trustable!" | "Reputation is signed by employers. Verifiable on-chain." |
| "Join thousands of builders shaping the future of agentic finance!" | "247 active workers. 89 jobs completed today." |

### Status message patterns

These appear constantly in the UI. Lock the patterns:

| Pattern | Example |
|---|---|
| `[Subject] [verb-past-tense].` | "Worker accepted." |
| `[Action] in [duration].` | "Payment landed in 4s." |
| `[Stat] [delta].` | "Reputation +1." |
| `[State] · [detail]` | "Bidding · 3 bids" |

Never:
- "🎉 Yay! Your worker just won a bid!"
- "Successfully completed transaction"
- "We've updated your reputation, congratulations!"

Always:
- "Bid won."
- "Payment landed."
- "Reputation +1."

### Demo voiceover patterns (already in 03_DEMO_SCRIPT.md)

The voiceover follows the same rules. Calm. Stating facts. Pauses for weight. No vocal hype.

### README and submission copy

Same voice. Cold, precise, confident. Read your submission text aloud — if it sounds like a press release, rewrite it.

---

## 7. Iconography

### Approach

**Use Lucide React for utility icons only** (close, search, settings, copy, external link, chevron). Set stroke width to 1.5, color to muted slate by default, white on hover.

**Custom geometric forms for hero/identity contexts:**
- Worker portraits (concentric circles, hex patterns)
- Sponsor sigils (in the End Card)
- Empty states
- Success / failure illustrations

### Forbidden icons

- ❌ Any robot/brain emoji-style icons for "AI agent"
- ❌ Sparkles, stars, magic wands for "AI features"
- ❌ Rocket ships, moons for "launch"
- ❌ Blockchain cube illustrations
- ❌ Coin/dollar bill icons (use the typography in gold instead)
- ❌ Lock icons for "secure" (overused, signals nothing)

### Custom illustrations checklist

For each of these, generate via image gen with consistent prompts:

1. **10 Worker iNFT portraits** — abstract geometric, watch-dial style. Same prompt with seed variations.
2. **3 Sponsor sigils** — for the end card sequence (geometric symbols representing 0G, AXL, KeeperHub). See `04_HIGGSFIELD_PROMPTS.md` Section "Optional Bonus Shot."
3. **1 Empty state illustration** — for "no jobs yet" / "no workers yet" screens. A single geometric form, suggested rather than literal.
4. **1 OG/social preview image** — for when ledger.market gets shared on Twitter/Farcaster.
5. **1 favicon** — derived from the standalone mark, optimized for 32×32 and 16×16.

---

## 8. Photography & Imagery (none — be deliberate about this)

### Position: no photography in Ledger's identity.

This is a contrarian choice and it matters.

Most crypto products use stock photos of people pointing at laptops, abstract "data" photographs, gradient hero images. **Ledger uses none of this.** Every visual is either:
- Custom geometric / generative
- Cinematic (Higgsfield, used sparingly)
- Pure typography
- On-chain data rendered as UI

This decision IS the brand. It signals: this product is software, not lifestyle. It's a tool for agents, not for humans browsing for inspiration.

---

## 9. Sound (for the demo video)

### Music bed

- **Cinematic shots:** A subtle low-frequency drone with gentle harmonic movement. Reference: Hans Zimmer Dunkirk's quieter passages, Jóhann Jóhannsson's Arrival. **Not** epic build-up tracks.
- **Screen recording sections:** No music. Let UI sounds carry it.

### UI sounds (sparingly)

- Bid arrival: a soft tone, ~440Hz, 80ms, slight reverb
- Transaction confirmation: a slightly lower tone, ~330Hz, 120ms
- Failure / warning: NEVER a buzzer. Use silence + visual red instead.

### Voiceover

- Single voice
- Calm, neutral tone
- Slight British or American Mid-Atlantic accent
- **Use Eleven Labs voice "Brian" or "Adam"** if generating
- Or record yourself if you have a clean mic and the right pacing

---

## 10. Visual Asset Generation Plan

What to generate, in what order, with what tool:

### Day 0 (today)

**Image gen tool of choice (DALL-E 3, Midjourney, Flux, or Higgsfield image):**
- [ ] Standalone mark — generate 4-6 variants, pick best
- [ ] Horizontal lockup — generate 4-6 variants
- [ ] App icon version — generate 2-3 variants
- [ ] Favicon (derive from app icon, export at 32×32 and 16×16)

### Day 6-7

**Image gen:**
- [ ] 10 worker iNFT portraits with seed variations
- [ ] 1 OG/social preview image (for ledger.market when shared)
- [ ] Empty state illustration

### Day 8-9

**Higgsfield:**
- [ ] Cinematic Open clip (15s) — see `04_HIGGSFIELD_PROMPTS.md` Shot 1
- [ ] iNFT Transformation clip (15s) — Shot 2
- [ ] Inheritance Handoff clip (20s) — Shot 3
- [ ] Optional sponsor sigil sequence — Shot 4

**Voice gen (Eleven Labs):**
- [ ] Full voiceover for demo script (record once, edit to fit)

---

## 11. Brand Quick-Reference Card

```
NAME            Ledger
TAGLINE         The trustless hiring hall for AI agents.
DOMAIN          ledger.market (priority), ledger.so, useledger.xyz
COLORS          Ink #0A0E1A · Gold #E8D4A0 · Cyan #5FB3D4 · White #F5F2EB
FONTS           Fraunces (display) · Inter (body) · JetBrains Mono (mono)
LOGO            Three-node mark + LEDGER wordmark
VOICE           Spare. Precise. Cold. Confident.
ICONOGRAPHY     Lucide for utility · Custom geometric for identity
PHOTOGRAPHY     None
MUSIC           Subtle drone, no epic build-ups
DON'TS          No emojis · No exclamation marks · No gradients · No 
                glassmorphism · No "amazing" · No rocket ships
```

Pin this card somewhere visible during the build. When in doubt about a UI/copy/asset decision, check against the card.

================================================================================
FILE: 10_ACTION_NAVIGATOR.md
================================================================================

# Ledger — Action Navigator

**Read this first. Every time you start a new session, every time you open Claude Code, every time you forget where you are — this is the map.**

This document is the single source of truth for: what to do, when, with which document, in which tool.

---

## Document Inventory (10 files)

| # | File | Purpose | When you need it |
|---|---|---|---|
| 00 | `00_MASTER_BRIEF.md` | Project context summary | Paste at top of EVERY new AI session |
| 01 | `01_PRD.md` | Product requirements | Repo root, day 0 |
| 02 | `02_ARCHITECTURE.md` | Technical design | Repo root, day 0 — engineering reference |
| 03 | `03_DEMO_SCRIPT.md` | 4-minute video script | Recording day (Day 9) |
| 04 | `04_HIGGSFIELD_PROMPTS.md` | Cinematic video prompts | Day 8-9 video gen |
| 05 | `05_CLAUDE_DESIGN_BRIEF.md` | UI design system + screen prompts | Day 0 design kickoff |
| 06 | `06_AI_COUNCIL_PROMPTS.md` | Multi-model brainstorm prompts | Day 0, 4, 7, 8, 9 |
| 07 | `07_SUBMISSION_PACK.md` | ETHGlobal form answers + READMEs | Day 10 only |
| 08 | `08_DAY0_VERIFICATION.md` | Sponsor questions + Day 0 plan | Hour 0-6 of Day 0 |
| 09 | `09_BRAND_IDENTITY.md` | Logo, fonts, colors, voice | Day 0 brand work, ongoing reference |
| 10 | `10_ACTION_NAVIGATOR.md` | THIS FILE — your map | Always |

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

## The Master Action Plan (10 Days)

### DAY 0 — Verification & Setup (Apr 24)

**Goal:** confirm assumptions, set up infrastructure, lock the brand. **Zero production code.**

| Hour | Owner | Action | Document | Tool |
|---|---|---|---|---|
| 0–1 | Gabriel | Post 5 sponsor questions in Discords | `08_DAY0_VERIFICATION.md` | Discord |
| 0–1 | Gabriel | Register team on ETHGlobal, lock ETH stake | — | ETHGlobal site |
| 0–1 | Gabriel | Buy ledger.market (or fallback domain) | `09_BRAND_IDENTITY.md` §1 | Namecheap/Porkbun |
| 1–2 | Gabriel | Create GitHub org + private repo | — | GitHub |
| 1–2 | Gabriel | Drop docs 00–10 in repo's `/docs/` folder | All | Git |
| 1–3 | Friend 1 | Set up Foundry workspace, stub 4 contracts | `02_ARCHITECTURE.md` §2.3 | Claude Code Max |
| 1–3 | Friend 2 | Set up Next.js, configure Tailwind with brand tokens | `09_BRAND_IDENTITY.md` §5, `05_CLAUDE_DESIGN_BRIEF.md` | Claude Code Max |
| 1–3 | Friend 3 | Set up Python agent runtime skeleton | `02_ARCHITECTURE.md` §2.1 | Claude Code Max |
| 2–4 | Gabriel | Spin up 2 cloud VMs, install AXL binary, test cross-VM hello | `02_ARCHITECTURE.md` §2.4 | DigitalOcean + ssh |
| 3–5 | Gabriel | Generate logo assets (mark + lockup + app icon) | `09_BRAND_IDENTITY.md` §3 | Higgsfield image / Flux / DALL-E |
| 3–5 | Friend 2 | Open Claude Design, set up design system | `05_CLAUDE_DESIGN_BRIEF.md` §A | Claude Design |
| 4–6 | Gabriel | Run AI Council Prompts 1, 3, 5, 6 (in parallel) | `06_AI_COUNCIL_PROMPTS.md` | AI Council |
| 4–6 | Gabriel | Generate Higgsfield Shot 1 (Cinematic Open) — early test of aesthetic | `04_HIGGSFIELD_PROMPTS.md` Shot 1 | Higgsfield |
| 6 | Everyone | Standup. Review sponsor responses. Confirm Day 1 plan. | — | Slack/Discord |

**End of Day 0 deliverables:**
- [ ] All 5 sponsor questions answered (or pivot decisions made)
- [ ] Domain owned
- [ ] Repo initialized with all 11 docs
- [ ] 2 AXL nodes running, cross-machine messaging confirmed
- [ ] Foundry contracts stubbed
- [ ] Next.js app booting with brand tokens
- [ ] Logo assets generated (3-4 variants pick the best)
- [ ] Claude Design system configured
- [ ] AI Council feedback reviewed and gaps identified

---

### DAY 1 — AXL Multi-Node + Foundation (Apr 25)

| Hour | Owner | Action | Doc reference |
|---|---|---|---|
| AM | Gabriel | Add 3rd AXL node on local laptop. Validate full mesh. | `02_ARCHITECTURE.md` §2.4 |
| AM | Friend 1 | Deploy IdentityRegistry to 0G Sepolia | `02_ARCHITECTURE.md` §2.3 |
| AM | Friend 1 | Deploy ReputationRegistry to 0G Sepolia | `02_ARCHITECTURE.md` §2.3 |
| AM | Friend 2 | Build Hall homepage in Claude Design | `05_CLAUDE_DESIGN_BRIEF.md` §B Screen 1 |
| PM | Friend 3 | Implement basic AXL pubsub client wrapper (Python) | `02_ARCHITECTURE.md` §2.1 |
| PM | Friend 3 | Test publishing TASK_POSTED message format | `02_ARCHITECTURE.md` §3.1 |
| EOD | Everyone | Standup + integration test of AM + PM work | — |

**End of Day 1 deliverables:**
- [ ] 3 AXL nodes meshed (2 cloud + 1 laptop)
- [ ] IdentityRegistry + ReputationRegistry live on 0G Sepolia
- [ ] Hall homepage hi-fi design done
- [ ] Python AXL client can pub/sub TASK_POSTED messages

---

### DAY 2 — Bidding Protocol (Apr 26)

| Owner | Action | Doc reference |
|---|---|---|
| Friend 1 | Deploy LedgerEscrow contract | `02_ARCHITECTURE.md` §2.3 |
| Friend 3 | Implement BID message flow (worker → buyer over AXL direct) | `02_ARCHITECTURE.md` §3.2 |
| Friend 3 | Implement BID_ACCEPTED flow | `02_ARCHITECTURE.md` §3.3 |
| Friend 3 | Implement bid auction logic in buyer agent | `02_ARCHITECTURE.md` §3 |
| Friend 2 | Build Auction Room screen in Claude Design | `05_CLAUDE_DESIGN_BRIEF.md` §B Screen 2 |
| Gabriel | Wire up dashboard to AXL events via SSE proxy | `02_ARCHITECTURE.md` §2.7 |
| Gabriel | Generate worker iNFT portraits (10 with seed variations) | `09_BRAND_IDENTITY.md` §10, `04_HIGGSFIELD_PROMPTS.md` |

**End of Day 2 deliverables:**
- [ ] LedgerEscrow contract deployed
- [ ] End-to-end task post → bid → accept flow over AXL works
- [ ] Auction Room screen designed
- [ ] SSE pipeline streaming AXL events to frontend

---

### DAY 3 — KeeperHub + Settlement (Apr 27)

| Owner | Action | Doc reference |
|---|---|---|
| Friend 1 | Integrate KeeperHub MCP for `releasePayment` flow | `02_ARCHITECTURE.md` §2.5 |
| Friend 3 | Implement x402-style bid bond payment from worker | `02_ARCHITECTURE.md` §3 |
| Friend 3 | Test gas-spike retry path with KeeperHub | `02_ARCHITECTURE.md` §6 |
| Gabriel | Start filling `FEEDBACK_KEEPERHUB.md` with daily notes | `07_SUBMISSION_PACK.md` §B |
| Friend 2 | Build Worker Profile screen in Claude Design | `05_CLAUDE_DESIGN_BRIEF.md` §B Screen 3 |

**End of Day 3 deliverables:**
- [ ] KeeperHub successfully submits a payment release tx
- [ ] Bid bonds locked + returned correctly
- [ ] Worker Profile screen designed
- [ ] FEEDBACK_KEEPERHUB.md has 3+ real entries

---

### DAY 4 — 0G Compute + Real Reasoning (Apr 28)

| Owner | Action | Doc reference |
|---|---|---|
| Friend 3 | Wire 0G Compute /chat/completions into worker agent | `02_ARCHITECTURE.md` §2.6 |
| Friend 3 | Implement Base Yield Scout task end-to-end (from prompt to JSON output) | `01_PRD.md` §1, `02_ARCHITECTURE.md` §3 |
| Gabriel | Run AI Council Prompt 4 (Inheritance Mechanics Check) | `06_AI_COUNCIL_PROMPTS.md` Prompt 4 |
| Friend 1 | Implement RESULT message + buyer signature flow | `02_ARCHITECTURE.md` §3.4 |
| Friend 2 | Polish Hall + Auction Room screens in Claude Design | — |

**End of Day 4 deliverables:**
- [ ] Worker can complete a real Base Yield Scout task using 0G Compute
- [ ] Full job cycle (post → bid → execute → pay) works end-to-end on testnet
- [ ] Inheritance design pattern locked from AI Council feedback

---

### DAY 5 — iNFT (Apr 29)

| Owner | Action | Doc reference |
|---|---|---|
| Friend 1 | Implement WorkerINFT.sol (ERC-7857) | `02_ARCHITECTURE.md` §2.3 |
| Friend 1 | Mint test iNFT, verify metadata pointing to 0G Storage | `02_ARCHITECTURE.md` §4.1 |
| Friend 3 | Implement memory-pointer storage in 0G Storage (KV + Log) | `02_ARCHITECTURE.md` §2.6 |
| Friend 3 | Modify worker agent to read/write memory from 0G Storage | — |
| Gabriel | Test transfer flow: mint → transfer → new owner can access memory | `01_PRD.md` §3.2 |

**End of Day 5 deliverables:**
- [ ] Worker iNFT minted on 0G Sepolia, viewable on explorer
- [ ] Worker memory persists across sessions in 0G Storage
- [ ] iNFT can transfer between wallets, new owner can access memory

---

### DAY 6 — Inheritance Flow (Apr 30)

| Owner | Action | Doc reference |
|---|---|---|
| Friend 1 | Modify LedgerEscrow to look up current iNFT owner via `ownerOf()` at payment time | `02_ARCHITECTURE.md` §5 |
| Friend 3 | Pre-bake fake reputation history (47 jobs) on-chain via 47 signed completions | `03_DEMO_SCRIPT.md` "Pre-Production" |
| Friend 2 | Build Inheritance Modal screen in Claude Design | `05_CLAUDE_DESIGN_BRIEF.md` §B Screen 4 |
| Gabriel | Test the demo's central flow: post task → mid-flight transfer → new owner earns | — |

**End of Day 6 deliverables:**
- [ ] Inheritance flow works end-to-end
- [ ] Pre-baked reputation history visible on Worker Profile
- [ ] Inheritance Modal designed

---

### DAY 7 — Frontend Wiring (May 1)

| Owner | Action | Doc reference |
|---|---|---|
| Friend 2 | Export Claude Design screens to React/Tailwind | `05_CLAUDE_DESIGN_BRIEF.md` §D |
| Friend 2 | Wire Hall + Auction Room + Worker Profile + Inheritance Modal to live data | — |
| Friend 2 | Implement AXL topology visualization (animated packets) | — |
| Gabriel | Implement "Demo Mode" toggle: pre-staged task + Spike Gas button | `02_ARCHITECTURE.md` §6 |
| Gabriel | Run AI Council Prompt 5 again (gaps from Day 0 list closed?) | `06_AI_COUNCIL_PROMPTS.md` Prompt 5 |
| Friend 1 + 3 | Integration testing: full demo flow on testnet, repeat 5 times | — |

**End of Day 7 deliverables:**
- [ ] Frontend connected to all backend systems
- [ ] AXL topology visualization animated and live
- [ ] Demo Mode toggles work
- [ ] Full demo flow runs end-to-end without manual intervention

---

### DAY 8 — Polish + Gas Spike (May 2)

| Owner | Action | Doc reference |
|---|---|---|
| Gabriel + Friend 1 | Set up fuzz-tx wallet for triggered gas spikes | `02_ARCHITECTURE.md` §6 |
| Gabriel + Friend 1 | Practice gas-spike scenario 5+ times to confirm KeeperHub reroute fires | `03_DEMO_SCRIPT.md` "What Could Go Wrong" |
| Friend 2 | Final visual polish on all 4 screens (typography, spacing, motion) | `09_BRAND_IDENTITY.md` |
| Friend 3 | Generate Higgsfield Shot 2 (iNFT Transformation) | `04_HIGGSFIELD_PROMPTS.md` Shot 2 |
| Friend 3 | Generate Higgsfield Shot 3 (Inheritance Handoff) | `04_HIGGSFIELD_PROMPTS.md` Shot 3 |
| Gabriel | Generate optional sponsor sigil sequence (if time) | `04_HIGGSFIELD_PROMPTS.md` Optional |
| Gabriel | Update FEEDBACK_KEEPERHUB.md with all observed bugs / DX issues | `07_SUBMISSION_PACK.md` §B |

**End of Day 8 deliverables:**
- [ ] Gas spike scenario reliably triggers KeeperHub reroute
- [ ] All UI screens at production quality
- [ ] All 3 Higgsfield clips generated
- [ ] FEEDBACK_KEEPERHUB.md substantively complete

---

### DAY 9 — Demo Recording (May 3 morning)

| Hour | Owner | Action | Doc reference |
|---|---|---|---|
| 06:00 | Everyone | Final integration test before recording | — |
| 08:00 | Friend 3 | Record voiceover via Eleven Labs (multiple takes) | `03_DEMO_SCRIPT.md` |
| 09:00 | Gabriel | Record demo screencast (3+ full takes) | `03_DEMO_SCRIPT.md` |
| 11:00 | Friend 3 | Edit video: voiceover + screen recording + Higgsfield clips | — |
| 14:00 | Everyone | Watch first cut, identify 3 most impactful edits | — |
| 14:00 | Gabriel | Run AI Council Prompts 2 + 7 (judge simulation, demo polish) | `06_AI_COUNCIL_PROMPTS.md` |
| 16:00 | Friend 3 | Apply edits, final cut | — |
| 18:00 | Friend 3 | Upload to YouTube/Vimeo, get share link | — |

**End of Day 9 deliverables:**
- [ ] Final 4-minute demo video uploaded
- [ ] If 0G requires under 3 min: separate 3-min cut also uploaded
- [ ] Demo URL linked in repo README

---

### DAY 10 — Submission (May 3 evening)

| Hour | Owner | Action | Doc reference |
|---|---|---|---|
| All day | Friend 1 + 3 | Final smoke test of live deployment URL | — |
| All day | Gabriel | Polish README.md with hero image, demo video, contract addresses | `07_SUBMISSION_PACK.md` §C |
| All day | Gabriel | Polish FEEDBACK_KEEPERHUB.md final pass | `07_SUBMISSION_PACK.md` §B |
| Pre-submit | Gabriel | Make repo public | — |
| Pre-submit | Gabriel | Verify all commits dated April 24+ | — |
| Submit | Gabriel | Fill ETHGlobal submission form using prepared answers | `07_SUBMISSION_PACK.md` §A |
| Submit | Gabriel | Apply to partner prizes: 0G Track B + Gensyn + KeeperHub | — |
| Submit | Gabriel | File KeeperHub Builder Feedback bounty separately | — |
| Submit | Gabriel | Verify all 4 team wallets listed for prize disbursement | — |

**End of Day 10:**
- [ ] Submitted ✅
- [ ] Repo public ✅
- [ ] Demo video live ✅
- [ ] All sponsor partner prizes applied ✅
- [ ] Beer ✅

---

## Cross-Session Continuity Workflow

When you start a new Claude Code session for any task, follow this exact pattern:

### Pattern A — Working on a feature (most common)

```
Session opens →
  Step 1: Paste 00_MASTER_BRIEF.md
  Step 2: Paste 01_PRD.md (full PRD context)
  Step 3: Paste 02_ARCHITECTURE.md (technical reference)
  Step 4: Paste 09_BRAND_IDENTITY.md ONLY IF doing UI work
  Step 5: Tell Claude what specifically you're working on
  Step 6: Reference the specific Day's tasks from this navigator
```

### Pattern B — Stuck or debugging

```
Session opens →
  Step 1: Paste 00_MASTER_BRIEF.md
  Step 2: Paste only the relevant section of 02_ARCHITECTURE.md
  Step 3: Paste your error / what's failing
  Step 4: Don't paste the entire codebase — let Claude ask for files
```

### Pattern C — Decision / strategy questions

```
Session opens →
  Step 1: Paste 00_MASTER_BRIEF.md
  Step 2: Paste 06_AI_COUNCIL_PROMPTS.md if running a brainstorm
  Step 3: State the decision you're trying to make
```

### Pattern D — Final submission day

```
Session opens →
  Step 1: Paste 00_MASTER_BRIEF.md
  Step 2: Paste 07_SUBMISSION_PACK.md
  Step 3: Ask for help filling the specific form section
```

---

## Tools-to-Documents Map

Quick reference of which tool consumes which document:

| Tool | Documents to feed in |
|---|---|
| **Claude Code Max** (primary) | 00, 01, 02, 09 + relevant code files |
| **Codex Max** | 00, 01, 02 (architecture only, for one-shot scripts) |
| **AI Council** | 00 + the specific prompt from 06 + the relevant context document |
| **Claude Design** | 05 (and 09 brand identity uploaded as assets) |
| **Higgsfield (image)** | 09 §3 (logo prompts), 09 §10 (asset list) |
| **Higgsfield (video)** | 04 (cinematic shot prompts) |
| **Eleven Labs (voice)** | 03 (demo script as voiceover input) |
| **DaVinci Resolve / Editor** | 03 (demo script as edit guide) + Higgsfield clips + screen recording |

---

## What to Do When Things Break

| Symptom | Likely cause | Fix |
|---|---|---|
| Claude session forgets the project | Didn't paste 00_MASTER_BRIEF.md | Paste it. Always paste it. |
| Claude suggests technologies you removed (ENS, Uniswap) | Brief outdated or not pasted | Paste 00 + restate "we removed ENS and Uniswap from scope" |
| Different AI tools give conflicting architecture advice | Each session built different mental models | Run AI Council Prompt 1 to surface conflicts, then make a decision and lock it in 02_ARCHITECTURE.md |
| You're running out of time on Day 7 | Likely AXL multi-node never worked reliably | Pivot to single-machine simulation, document honestly in submission |
| The video feels like a generic crypto demo | Higgsfield prompts not aggressive enough about restraint | Re-read 09 §6 (voice) and 04 (negative prompts) — push hard against neon, sparkles, "epic" |
| Demo recording keeps failing | Not enough buffer time on Day 9 | Always have a pre-recorded canonical run as B-roll fallback |

---

## Emergency Pivot Plans

These are pre-decided pivots so you don't waste time deliberating mid-build:

### If Q1 (iNFT memory transfer) fails on Day 0
**Pivot:** Implement a simple registry contract that maps `iNFT.tokenId → memoryKey`, where the memoryKey is stored as encrypted data accessible only to the current owner. Lose 1 day, keep the demo.

### If Q3 (KeeperHub testnet) fails on Day 0
**Pivot:** Build a thin local wrapper service that mimics the KeeperHub MCP interface for the demo. Document honestly. Apply for KeeperHub bounty with explicit note that we'd integrate the real service if testnet were supported.

### If Q4 (0G Compute access) fails on Day 0
**Pivot:** Use OpenAI or Claude API for reasoning. Lose some 0G Track B points but keep the rest of the integration. Update FEEDBACK to 0G with the access friction.

### If AXL never meshes reliably on Day 1-2
**Pivot:** Use 3 cloud VMs only, no laptop. Demo uses screen-share view of 3 separate VPS terminals. Less authentic, still meets the cross-node requirement.

### If something major breaks on Day 7+
**Pivot:** Cut iNFT inheritance from the demo, ship without it. The demo becomes "agent labor market" instead of "agent labor market + secondary asset market." 0G Track B score drops significantly but Gensyn + KeeperHub still in reach. **Avoid this. Inheritance is the punchline.**

---

## What Success Looks Like

**Floor (no finalist, decent sponsor placements):** $3,000-4,000 in sponsor cash.

**Median (target):** Finalist + 2 sponsor placements = $4,000 (4× $1,000 USDC) + $3,000 sponsor = **$7,000**.

**Stretch:** Finalist + 3 strong sponsor placements = $4,000 + $5,500 sponsor = **$9,500**.

**Ceiling (everything 1st place + finalist):** ~$12,000.

Equally important: **portfolio piece, post-hackathon Gensyn Foundation grant fast-track, network of 4 teammates who shipped under pressure, and a working product on real testnet.** The cash is one of four prizes. Don't lose sight of the others.

---

## Final Note

The plan is locked. The documents are written. The architecture is clean.

The next 10 days are about execution discipline:
- Don't ideate when you should ship
- Don't add scope when you should cut
- Don't perfect when you should record
- Don't wait when you should ask

You have everything you need. **Go.**
