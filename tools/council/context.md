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
- [ ] Builder Feedback bounty subm