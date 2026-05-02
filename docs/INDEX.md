# Docs Index

Navigation guide for the 11 planning documents. All paths are relative to `docs/`.

## When to read what

| Trigger | Read this |
|---|---|
| New AI session — paste at top | `00_MASTER_BRIEF.md` |
| Need to know what to build today | `../EXECUTION_PLAN.md` (root) + `10_ACTION_NAVIGATOR.md` |
| Building UI | `05_CLAUDE_DESIGN_BRIEF.md` + `09_BRAND_IDENTITY.md` |
| Building backend / contracts | `02_ARCHITECTURE.md` + `01_PRD.md` |
| Recording the demo video | `03_DEMO_SCRIPT.md` + `04_HIGGSFIELD_PROMPTS.md` |
| Stuck on a decision | `06_AI_COUNCIL_PROMPTS.md` + `../tools/council/STAGE3_CHAIRMAN.md` |
| Day 10 submission | `07_SUBMISSION_PACK.md` |
| Sponsor questions before build | `08_DAY0_VERIFICATION.md` (now mostly closed; all 5 questions answered) |

## What changed on May 2 council pass

All 11 docs were updated based on the chairman synthesis at `../tools/council/STAGE3_CHAIRMAN.md`. The headline deltas:

1. **Slot-3 sponsor swap: KeeperHub → ENS.** 0G + Gensyn + ENS are the locked 3.
2. **Network correction: "0G Sepolia" everywhere → "0G Galileo Testnet (ChainID 16602, native 0G token)."**
3. **ERC-7857 qualifier:** every bare reference is now "ERC-7857 (0G iNFT draft standard)."
4. **Reputation registry:** dropped our custom `LedgerReputationRegistry.sol`. Use the live audited ERC-8004 deployment at `0x8004B663056A597Dffe9eCcC1965A193B7388713` on Base Sepolia.
5. **Demo restructure:** Higgsfield Shot 2 cut entirely. Inheritance moment rebuilt around live ENS resolution flip + split-screen wallets.
6. **"Atomically" struck from cross-chain settlement language.** Replaced with "two-phase commit, eventually consistent."
7. **Schedule compressed:** Day 9 + Day 10 collapsed into May 3 (single calendar day with 21:30 IST hard deadline).
8. **x402 dropped** from load-bearing scope (architect's call — wrong primitive shape for on-chain escrow).

For per-doc edit lists, see `../tools/council/STAGE3_CHAIRMAN.md` §5.

## Related

- `../EXECUTION_PLAN.md` — the canonical 22-step build plan (consumes this doc set as input)
- `../tools/council/STAGE3_CHAIRMAN.md` — the chairman synthesis that produced the May 2 updates
- `../tools/council_alt/STAGE3_CHAIRMAN.md` — the ENS Slot-3 integration shape
- `../proofs/` — sponsor-grade evidence files (built during execution)
- `../tools/research/` — deep sponsor research briefs (0G, Gensyn, KeeperHub-no-longer-targeted, ENS)
<!-- updated 2026-05-02 with council pivot summary -->
<!-- 2026-05-02 11:24 IST joanna: docs/INDEX: timestamp post-council update --> (1)
