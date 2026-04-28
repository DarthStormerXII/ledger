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
