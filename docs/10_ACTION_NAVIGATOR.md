# Ledger — Action Navigator

**Read this first. Every time you start a new session, every time you open Claude Code, every time you forget where you are — this is the map.**

This document is the single source of truth for: what to do, when, with which document, in which tool.

---

## Document Inventory (10 docs + execution plan + proofs)

All planning docs now live in `docs/`. The execution plan and proof artifacts live at the repo root.

| # | File | Purpose | When you need it |
|---|---|---|---|
| 00 | `docs/00_MASTER_BRIEF.md` | Project context summary | Paste at top of EVERY new AI session |
| 01 | `docs/01_PRD.md` | Product requirements | Day 0 reference |
| 02 | `docs/02_ARCHITECTURE.md` | Technical design | Day 0 — engineering reference |
| 03 | `docs/03_DEMO_SCRIPT.md` | 4-minute video script | Recording day (May 2 evening + May 3 afternoon) |
| 04 | `docs/04_HIGGSFIELD_PROMPTS.md` | Cinematic video prompts | May 2 evening video gen |
| 05 | `docs/05_CLAUDE_DESIGN_BRIEF.md` | UI design system + screen prompts | Day 0 design kickoff |
| 06 | `docs/06_AI_COUNCIL_PROMPTS.md` | Multi-model brainstorm prompts | Day 0, 4, 7, May 2 evening |
| 07 | `docs/07_SUBMISSION_PACK.md` | ETHGlobal form answers + READMEs | May 3 evening submission |
| 08 | `docs/08_DAY0_VERIFICATION.md` | Sponsor questions + Day 0 plan | Hour 0-6 of Day 0 (now resolved) |
| 09 | `docs/09_BRAND_IDENTITY.md` | Logo, fonts, colors, voice | Day 0 brand work, ongoing reference |
| 10 | `docs/10_ACTION_NAVIGATOR.md` | THIS FILE — your map | Always |
| — | `EXECUTION_PLAN.md` (repo root) | Day-by-day operational plan | Always (companion to this navigator) |
| — | `proofs/0g-proof.md` | 0G evidence artifact | May 3 evening |
| — | `proofs/axl-proof.md` | Gensyn AXL evidence artifact | May 3 evening |
| — | `proofs/ens-proof.md` | ENS evidence artifact | May 3 evening |
| — | `tools/council/` | Council pivots logged here | Reference for "why did we change X?" |

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
