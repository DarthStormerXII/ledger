# Ledger — Execution Plan

**Single source of truth for what to do next. Read top-to-bottom on every check-in.**

---

## Status snapshot

- **Today:** 2026-05-02 (Saturday) evening
- **Submission deadline:** 2026-05-03 (Sunday) **21:30 IST = 12:00 PM EDT** (hard, ETHGlobal-confirmed)
- **Hours remaining:** ~30 wall-hours (build + record + edit + submit)
- **Plan status:** v3, frozen post-council on May 2 16:30 IST. See `tools/council/STAGE3_CHAIRMAN.md` for rationale; `tools/council_alt/STAGE3_CHAIRMAN.md` for the ENS Slot-3 integration shape.
- **Documents:** all 11 planning docs updated against the canonical change list and moved to `docs/`. See `docs/INDEX.md` for navigation.

## What's locked

| Decision | Resolution | Source |
|---|---|---|
| 3 partner-prize sponsors | **0G + Gensyn AXL + ENS** | `tools/council/STAGE3_CHAIRMAN.md` §1 |
| Network for chain + storage + iNFT | **0G Galileo Testnet (ChainID 16602, native 0G token)** | `tools/research/0g.md` |
| Reputation contract | **Live audited ERC-8004 ReputationRegistry at `0x8004B663056A597Dffe9eCcC1965A193B7388713` on Base Sepolia** (we deploy nothing) | `tools/research/keeperhub-and-rules.md` Part 3 |
| ENS integration shape | **Path C — custom CCIP-Read offchain resolver with live `ownerOf()` cross-chain** | `tools/research/ens.md` + `tools/council_alt/STAGE3_CHAIRMAN.md` §3 |
| Hero demo punchline | **Live ENS resolution flip when iNFT transfers** + **split-screen wallet balances** | `tools/council_alt/STAGE3_CHAIRMAN.md` §5 |
| Higgsfield Shot 2 | **Cut entirely**; replace with profile UI in 96px Fraunces | `tools/council/STAGE3_CHAIRMAN.md` §3 Conflict 2 |
| Higgsfield Shot 3 | **Move to 3:48–4:00**, trim to 12s | `tools/council/STAGE3_CHAIRMAN.md` §3 |
| 47-job seeded reputation | **Keep + disclose** in README "How it's made" (one sentence) | `tools/council/STAGE3_CHAIRMAN.md` §3 Conflict 3 |
| Cross-chain "atomically" claim | **Strike**; replace with "two-phase commit, eventually consistent within ~10s" | `tools/council/STAGE3_CHAIRMAN.md` §2 Finding 4 |
| x402 | **Drop** from load-bearing scope | Architect's call |

## What's NOT yet decided (recording-day calls)

- **Cinematic-vs-inverted-hook for 0:00–0:15.** Decide via muted 5-second test with 2 uninformed viewers on recording day.
- **Whether to record solo or team-on-camera for the physical handoff scene.** Director's preference is two laptops + two hands in one shot. Fallback is single-laptop window-switch if team is not co-located.

---
