# Ledger — Day 0 Verification Checklist (CLOSED)

**Status (May 2, 2026):** ALL critical questions are now answered. This file is preserved as a verification trail and a citation index — every closed question links back to the workshop transcript or research brief that resolved it.

**Original framing:** "Hour 0–6 of the hackathon, BEFORE any code is written. Five assumptions are baked into the architecture. If any of them is false, we need to know NOW, not on Day 7."

The questions sat unanswered for 8 days. The May-2 council pass — Stage 1, Stage 2, Stage 3 across 4 lenses (Architect, Strategist, Redteam, Director), 3 sponsor research briefs, 1 deep ENS research brief, and 5 sponsor workshop transcripts — closed them all. The slate also changed: **KeeperHub was swapped out for ENS** as Slot-3 sponsor on May 2; see `tools/council/STAGE3_CHAIRMAN.md` §1 for the rationale.

**Process incoherence note:** earlier versions of this file flagged a "build before Q1/Q3/Q4 confirmed" inconsistency between this file (which said do not start the build until Q1, Q3, Q4 are answered) and `docs/10_ACTION_NAVIGATOR.md` (which scheduled build work in parallel). With every question now answered, that inconsistency is resolved — the build can proceed without gating on verification.

---

## Q1 — 0G ERC-7857 (0G iNFT draft standard) iNFT Memory Transfer

**Status:** ✅ **ANSWERED. Proceed as planned.**

**Original concern:** The entire Inheritance demo depends on this working. When an iNFT transfers from owner A to owner B, can owner B immediately access the encrypted memory blob in 0G Storage without manual re-permissioning?

**Resolution:** Yes. ERC-7857 (0G iNFT draft standard) defines a TEE oracle that re-keys the AES-256-CTR-encrypted metadata to the new owner's pubkey atomically with the `transferFrom` call. New owner gains immediate decryption capability with no manual re-permissioning step.

**Sources:**
- 0G workshop transcript (Gautam) — explicitly walked through the TEE re-keying step.
- ENS deep-research brief at `tools/research/ens.md` — independently confirmed the spec behavior.
- Reference implementation: [`0glabs/0g-agent-nft@eip-7857-draft`](https://github.com/0glabs/0g-agent-nft/tree/eip-7857-draft).

**Architectural impact:** No pivot needed. The Inheritance flow uses the reference impl directly. See `docs/02_ARCHITECTURE.md` §2.6.1 (Memory permissioning).

---

## Q2 — AXL on Residential NAT

**Status:** ✅ **ANSWERED. Proceed as planned.**

**Original concern:** Demo claim is "3 nodes including one on a residential laptop." If AXL fails on residential NAT (especially CGNAT), we either lose authenticity or have to use 3 cloud nodes.

**Resolution:** Outbound TCP/TLS to the bootstrap peer is sufficient. No port forwarding. No STUN. No hole-punching. AXL's Yggdrasil mesh forms successfully from a residential CGNAT'd network as long as outbound TCP/TLS to a known public bootstrap peer is allowed (which is the universal default).

**Sources:**
- Gensyn workshop transcript (Jud) — qualifying line: "outbound TCP/TLS to bootstrap is enough."
- AXL research brief at `tools/research/gensyn-axl.md` — confirmed via reading the `gossipsub` example and the bootstrap discovery code.

**Architectural impact:** No pivot needed. The 3-node topology is 2 cloud VMs (AWS us-west + GCP eu-central) + 1 residential CGNAT'd laptop. See `docs/02_ARCHITECTURE.md` §2.4 (AXL Network).

---

## Q3 — KeeperHub Testnet Support

**Status:** N/A — **STRUCK FROM SLATE.**

KeeperHub was replaced by ENS as Slot-3 sponsor on May 2. The KeeperHub-specific questions (testnet support, gas-spike reroute on testnet, MCP server chain coverage) are no longer architecturally relevant. The "Tx execution" layer in the architecture is removed entirely; transaction submission happens directly via the agent runtime.

**See:** `tools/council/STAGE3_CHAIRMAN.md` §1 (Executive summary) for the full KeeperHub → ENS swap rationale. Briefly: KeeperHub doesn't support 0G Galileo, so it could never sit on the critical path of the hero demo. ENS, by contrast, IS on the critical path: `who.<agent>.<team>.eth` resolves to `ownerOf()` on 0G via CCIP-Read, so when the iNFT transfers the ENS resolution flips with zero ENS transactions. That's the visible 5-second "oh" moment in the demo.

---

## Q4 — 0G Compute Sealed Inference Access

**Status:** ✅ **ANSWERED. Proceed as planned.**

**Original concern:** All worker reasoning is supposed to run on 0G Compute sealed inference. If it requires an enterprise contract or credit grant we don't have, we're stuck.

**Resolution:** Fully open. No enterprise gating. No application required. 6 mainnet models available, including:
- **GLM-5** (744B, TeeML)
- **Qwen3.6-Plus** (TeeTLS)
- GLM-5.1, GPT-OS, 30C, 27B (others)

All accessible via the standard 0G Compute SDK. Each inference returns an attestation digest verifiable via `broker.inference.verifyService` — we surface this digest as a UI badge in the worker profile.

**Sources:**
- 0G workshop transcript (Gautam) — confirmed open access + named the 6 models.
- 0G research brief at `tools/research/0g.md` — independently confirmed via the docs.

**Architectural impact:** No pivot needed. We use GLM-5 and/or Qwen3.6-Plus. See `docs/02_ARCHITECTURE.md` §2.6 (0G Stack) and `docs/05_CLAUDE_DESIGN_BRIEF.md` Screen 3 (Worker Profile, attestation badge).

---

## Q5 — ETHGlobal Submission Form: Partner Prize Slots

**Status:** ✅ **ANSWERED. Proceed as planned.**

**Original concern:** The "max 3 partner prizes" rule on the submission form — does each sponsor count as one slot, or does each track count separately?

**Resolution:** Multiple tracks per sponsor count as **one** partner-slot. So our slate fits exactly:
- Slot 1 — **0G** (Track A: Best Application of 0G + Track B: Best Autonomous Agents, Swarms & iNFT Innovations) — 1 slot
- Slot 2 — **Gensyn AXL** (Best Application of AXL) — 1 slot
- Slot 3 — **ENS** (ENS-AI + ENS-Creative) — 1 slot

= 3 / 3 slots filled. Total addressable pool: $25K (0G $15K + Gensyn $5K + ENS $5K).

**Sources:**
- KeeperHub research brief — surfaced this rule via the ETHGlobal Discord support thread.
- Confirmed in `tools/council/STAGE3_CHAIRMAN.md` §1.

**Architectural impact:** None. Selection on submission form: 0G + Gensyn + ENS.

---

## Q6 — ENS Path C (CCIP-Read with live `ownerOf()` on 0G Galileo)

**Status:** ✅ **ANSWERED. Feasible. Proceed as planned.**

**Original concern (added May 2):** With ENS as Slot-3 sponsor, the critical path for the Inheritance demo runs through an ENSIP-10 wildcard CCIP-Read offchain resolver (Path C pattern) that serves a live `ownerOf()` call against the iNFT contract on 0G Galileo Testnet (ChainID 16602, native 0G token). Does this actually work end-to-end in a real ENS-aware client?

**Resolution:** Yes. The Path C pattern with live cross-chain `ownerOf()` reads has a working reference implementation. The resolver gateway runs as a stable HTTPS endpoint (deployable to Vercel/Cloudflare) with a 30-second TTL cache on `ownerOf()` reads to absorb 0G Galileo public RPC latency variance. ENSIP-10 wildcard resolution + signed-response handlers are within the standard Path C flow.

**Sources:**
- ENS deep-research brief at `tools/research/ens.md` — surfaced the reference implementation.
- Reference impl: [`0xFlicker/tod-offchain-resolver`](https://github.com/0xFlicker/tod-offchain-resolver).
- ENS workshop transcript (Greg) — confirmed Path C is the right pattern; named ENSIP-25 ↔ ERC-8004 as the "verification loop" he wants to see; named Fluidkey's rotating-address pattern as his favorite hackathon project (we credit it in `pay.*`).

**Architectural impact:** Adds the `resolver/` directory to the repo (CCIP-Read offchain server). See `docs/02_ARCHITECTURE.md` §2.5 (ENS Resolver Gateway) and `docs/05_CLAUDE_DESIGN_BRIEF.md` Screen 6 (Capability Tree Viewer).

---

## Closed-question summary

| # | Question | Status | Source |
|---|---|---|---|
| Q1 | ERC-7857 (0G iNFT draft standard) memory transfer | ✅ Answered | 0G workshop (Gautam) + ENS deep-research brief + `0glabs/0g-agent-nft@eip-7857-draft` |
| Q2 | AXL on residential NAT | ✅ Answered | Gensyn workshop (Jud) + AXL research brief |
| Q3 | KeeperHub testnet support | ✗ Struck — KeeperHub removed from slate May 2 | `tools/council/STAGE3_CHAIRMAN.md` §1 |
| Q4 | 0G Compute hackathon access | ✅ Answered (open access, 6 mainnet models) | 0G workshop (Gautam) + 0G research brief |
| Q5 | ETHGlobal max-3-partner-prizes rule | ✅ Answered (multiple tracks per sponsor = 1 slot) | KeeperHub research brief + ETHGlobal Discord |
| Q6 | ENS Path C (CCIP-Read with live `ownerOf()` on 0G Galileo) | ✅ Answered (feasible, reference impl exists) | ENS deep-research brief + `0xFlicker/tod-offchain-resolver` |

---

## What this file used to do

Originally this file scheduled five Discord posts on Day 0 of the hackathon to verify each assumption. With the May-2 council pass closing all five (and Q3 becoming N/A), there is nothing left to ask. The Discord-post templates for each question are preserved below as historical record only — do NOT post them.

### Historical Q1 template (DO NOT POST — answered)

```
Hi 0G team — building for Open Agents 2026 (Track B). Two questions
on ERC-7857 (0G iNFT draft standard):

1. When an iNFT transfers from owner A to owner B, does the encrypted
   memory pointer in the token metadata transfer atomically with the
   token, such that owner B can immediately access the memory blob
   in 0G Storage without any additional re-encryption / re-permission
   step?

2. If 0G Storage data is permissioned by the original owner's address,
   what's the recommended pattern for making it accessible to the
   new owner post-transfer? Is there an automatic re-keying mechanism,
   or do we need to implement that ourselves?
```

### Historical Q2 template (DO NOT POST — answered)

```
Hi Gensyn team — building for Open Agents 2026 with AXL.

1. Has AXL been tested on residential ISPs with carrier-grade NAT
   (CGNAT) — for example, US/EU mobile broadband or some ISPs' home
   internet? Does the Yggdrasil mesh successfully form to peers across
   the public internet from a residential NAT, or are STUN/TURN-style
   relays needed?

2. For a hackathon demo where we want to show 3 nodes — 2 cloud VMs
   and 1 local laptop on residential WiFi — what's the recommended
   bootstrap topology and any setup we should do beforehand to ensure
   reliable mesh formation?
```

### Historical Q3 (STRUCK — KeeperHub removed from slate)

KeeperHub was swapped out for ENS as Slot-3 sponsor on May 2; see `tools/council/STAGE3_CHAIRMAN.md` §1 for rationale.

### Historical Q4 template (DO NOT POST — answered)

```
Hi 0G team — for Open Agents 2026 we plan to use 0G Compute's sealed
inference (GLM-5 or Qwen3.6-Plus) for our agent reasoning loop.

1. Is the sealed inference endpoint accessible to hackathon
   participants without an enterprise contract? Is there a credit
   grant / faucet for hackathon teams?

2. What are the rate limits for inference requests during the
   hackathon period? Our demo runs 3 agents that each make ~5
   inference calls per task cycle.
```

### Historical Q5 template (DO NOT POST — answered)

```
Hi ETHGlobal team — quick question on the Open Agents 2026 submission
form:

For the "max 3 partner prizes" rule on the submission form — does
each sponsor count as one slot, or do sub-prizes within a sponsor
(e.g., 0G has Track A and Track B) count as separate slots?

We want to apply to 0G (Track A + Track B) + Gensyn AXL + ENS (ENS-AI
+ ENS-Creative). Just want to confirm we can fit all three.
```

### Historical Q6 template (DO NOT POST — answered)

```
Hi ENS team — for Open Agents 2026 we plan to ship a CCIP-Read
offchain resolver under our parent name on Sepolia, with ENSIP-10
wildcard resolution and a `who.<agent>.<team>.eth` subname that
resolves to a live `ownerOf()` call on 0G Galileo Testnet (ChainID
16602, native 0G token).

1. Has anyone already built a Path C-style cross-chain `ownerOf()`
   resolver under ENS? What's the production-ready reference impl?

2. For ENSIP-25 agent-registration text records, what's the canonical
   key and shape for pointing at an ERC-8004 ReputationRegistry
   deployment (ours points at the audited deployment at
   `0x8004B663…` on Base Sepolia)?
```

---

## Pivot Triggers — historical, no longer active

| Original trigger | Original mitigation | Final outcome |
|---|---|---|
| Q1 = "iNFT memory doesn't transfer atomically" | Custom registry-mapping pattern, +1 day | Not triggered. TEE oracle re-keying confirmed. |
| Q3 = "KeeperHub mainnet-only" | Fund $20 of mainnet ETH OR build wrapper | N/A — KeeperHub removed from slate. |
| Q4 = "0G Compute requires enterprise contract" | Use OpenAI/Claude API | Not triggered. Open access confirmed. |
| Q2 = "AXL doesn't work on residential" | Use 3 cloud VMs | Not triggered. Outbound TCP/TLS sufficient. |

No pivots required. The plan remains executable as designed (after the May-2 KeeperHub → ENS swap).
