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

1. **0G Labs** (Track A + Track B via single slot, $15K pool) — iNFT-minted swarm of worker agents on 0G Galileo
2. **Gensyn AXL** ($5,000) — real cross-node P2P comms between bidding agents
3. **ENS** (ENS-AI $2,500 + ENS-Creative $2,500) — capability-tree subnames + CCIP-Read offchain resolver tracking `ownerOf()` cross-chain

Realistic cash target: $5,000–9,000 in sponsor placements + $4,000 in finalist pack (4 team members × $1,000) = **$9,000–13,000 expected.**

## Core Thesis

Three identity primitives wired into a working two-sided market: **ERC-8004 (already-deployed audited registry on Base Sepolia at `0x8004B663…`), ERC-7857 (0G iNFT draft standard), and ENS (ENSIP-25 verification loop with ERC-8004)**. Nobody has wired all three into a working two-sided market with a secondary asset layer. Ledger does.

## Tech Stack (fixed — do not propose alternatives)

- **Chain:** 0G Galileo Testnet (ChainID 16602, native 0G token) for compute, storage, iNFTs. Base Sepolia for USDC settlement and the live audited ERC-8004 ReputationRegistry. Sepolia L1 for the ENS parent name + CCIP-Read pointer.
- **Compute:** 0G Compute (sealed inference, qwen3.6-plus or GLM-5-FP8)
- **Storage:** 0G Storage (KV + Log) for agent persistent memory; SDK `uploadFile` / `downloadFile`
- **Agent persona:** ERC-7857 (0G iNFT draft standard) on 0G Galileo
- **Comms:** Gensyn AXL across 3 separate nodes (2 cloud VMs + 1 laptop). "Service registry / tool marketplace" pattern (Jud's framing). Two layers of encryption: hop-by-hop TLS + end-to-end payload.
- **Identity/Reputation:** Minimal ERC-8004 IdentityRegistry on 0G Galileo + live audited ERC-8004 ReputationRegistry at `0x8004B663056A597Dffe9eCcC1965A193B7388713` on Base Sepolia
- **Settlement:** USDC on Base Sepolia via on-chain escrow contract
- **Identity layer:** ENS via custom CCIP-Read offchain resolver under team-owned parent name on Sepolia. Each worker iNFT becomes `worker-NNN.<team>.eth` with capability subnames `who`, `pay`, `tx`, `rep`, `mem`.
- **Frontend:** Next.js 14 + shadcn/ui + Tailwind
- **Smart contracts:** Solidity, Foundry

## Non-Goals (explicitly out of scope)

- Uniswap or any DEX integration (not a target sponsor)
- Mobile UI
- Multiple task types — one task only: "Base Yield Scout"
- Real-money exposure — testnet only
- Agent training UI — agents come pre-baked
- Onboarding for human users beyond a connect wallet flow

## Demo Concept

The demo identity is **The Inheritance.**

Hero moment: a worker iNFT with 47 jobs and 4.7 reputation gets transferred mid-demo to a new owner. The new owner's worker immediately bids on a fresh task using the same agent, same reputation — but the earnings stream now flows to the new wallet, and `who.worker-001.<team>.eth` resolves to the new owner address with zero ENS transactions (CCIP-Read picks up the new `ownerOf()` on 0G Galileo). Time anchors: **preview at 0:04 (inverted hook), tease at 1:30, payoff at 2:30–3:00 split-screen + live ENS resolution flip.** This is the punchline that wins finalist.

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

## Critical Confirmations (resolved via research briefs + sponsor workshops)

1. **ERC-7857 (0G iNFT draft standard) transfers encrypted memory** — ✅ Confirmed via 0G workshop + ENS deep research. TEE oracle re-keys metadata on transfer per spec; reference impl at `0glabs/0g-agent-nft@eip-7857-draft`.
2. **AXL Yggdrasil mesh forms from residential NAT** — ✅ Confirmed. Outbound TCP/TLS to bootstrap is sufficient. No port forwarding needed. Source: Gensyn workshop.
3. **0G Compute hackathon access** — ✅ Confirmed. Fully open. 6 mainnet models available (GLM-5, GLM-5.1, Qwen3.6+, GPT-OS, 30C, 27B). Source: 0G workshop.
4. **ETHGlobal max-3-partner-prizes rule** — ✅ Confirmed. Multiple tracks per sponsor count as one partner-prize slot. 0G Track A + Track B = 1 slot; ENS-AI + ENS-Creative = 1 slot. Source: KeeperHub research brief.
5. **ENS deep-research Path C (CCIP-Read with live `ownerOf()` on 0G Galileo) feasibility** — ✅ Confirmed feasible per `0xFlicker/tod-offchain-resolver` reference. Source: ENS deep-research brief.
