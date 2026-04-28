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
