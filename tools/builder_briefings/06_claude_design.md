# Builder Session: CLAUDE.AI/DESIGN — APP UX

You are a Claude Code Opus 4.7 session dedicated entirely to **driving the Ledger app's UX via the `claude.ai/design` platform.**

The user (Gabriel) is going to do the visual/interaction design work themselves on the web at `claude.ai/design`. Your job is to **set up everything they need** to make that session productive — pasted prompts, design system context, repo references, screen specs — and to **be on standby as the Claude Code partner** while they work.

You are NOT building UI in code yourself. You're staging the inputs to the design platform.

**Lead surface:** `surface:60`.

---

## Required reading (in order)

1. `/Users/gabrielantonyxaviour/Documents/products/ledger/docs/05_CLAUDE_DESIGN_BRIEF.md` — the full UI design system, screen specs, components. **This is your primary brief — it's literally named for this work.**
2. `/Users/gabrielantonyxaviour/Documents/products/ledger/docs/09_BRAND_IDENTITY.md` — palette, fonts, voice, sound, illustrations
3. `/Users/gabrielantonyxaviour/Documents/products/ledger/docs/03_DEMO_SCRIPT.md` — to know which screen states must look perfect for the demo
4. `/Users/gabrielantonyxaviour/Documents/products/ledger/EXECUTION_PLAN.md` — for the build context
5. `/Users/gabrielantonyxaviour/Documents/products/ledger/tools/council/stage1/director.md` — the demo director's lens (frame-worthy UI, mute test)

## What is `claude.ai/design`?

A web platform from Anthropic for visual + interaction design driven by Claude. (If your training data is fuzzy on this — research it via WebFetch / docs / official Anthropic announcements before staging anything.)

The platform has setup requirements that need to be satisfied before useful design work can happen:
- A claude.ai account (the user has)
- Project context (what you stage)
- Possibly: a connected GitHub repo, a design system / Figma reference, screen list, brand assets

**First task: figure out the actual setup requirements** by visiting the platform docs and announcing them to the user via [QUESTION:claude-design]. Do not guess.

## Scope (what you're staging)

### 1. The "first prompt" the user pastes into claude.ai/design

A single, dense, paste-ready prompt that gives `claude.ai/design` everything it needs to start producing the right UI. Should include:

- **Project shape:** 1-paragraph summary (Ledger = two-sided market for AI agents, hero demo is the iNFT inheritance, etc.)
- **Brand:** palette + fonts + voice (from `09_BRAND_IDENTITY.md`)
- **Screens needed:** the 6 screens from `05_CLAUDE_DESIGN_BRIEF.md` (the Hall, Auction Room, Worker Profile, Inheritance Modal, Settlement Status Strip, Capability Tree Viewer)
- **Demo-critical states:** which 3 frames a judge will hold their eyes on (per Director's Stage 1 — Worker Profile, Auction Room, Inheritance Modal mid-transfer)
- **Constraints:** no skeleton loaders everywhere; no generic "John Doe" placeholder; no neon green / rocket ship crypto clichés (per `~/.claude/rules/ui-rules.md` if accessible)
- **Output desired:** Tailwind + shadcn/ui-compatible design specs the team can implement in Next.js

Save this prompt at `design/01_first_prompt.md`.

### 2. Per-screen briefs (6 of them)

For each of the 6 screens in `05_CLAUDE_DESIGN_BRIEF.md`, distill into a paste-ready brief that the user can drop into a fresh `claude.ai/design` thread or refinement loop. Save under `design/screens/`:

- `design/screens/01_the_hall.md`
- `design/screens/02_auction_room.md`
- `design/screens/03_worker_profile.md`
- `design/screens/04_inheritance_modal.md`
- `design/screens/05_settlement_status_strip.md`
- `design/screens/06_capability_tree_viewer.md`

Each per-screen brief includes: purpose, primary action, key data shown, demo-critical state, accessibility notes, components needed.

### 3. Brand snapshot artifact

A single `design/brand.md` that consolidates palette + typography + voice + sound — paste-ready for the platform.

### 4. The 3 frame-worthy still-image specs

Per Director's Stage 1: the 3 frames a judge will hold on for ≥3 seconds. Each gets its own design spec with explicit composition notes:

- `design/frames/01_worker_profile.md` — 96px Fraunces ENS name, capability tree on right, attestation digest badge
- `design/frames/02_auction_room.md` — 3 worker cards bidding live, AXL topology micro-view in corner
- `design/frames/03_inheritance_split_screen.md` — old wallet fading left, +4.50 USDC arriving right, worker card unchanged center, ENS resolution flipping live

These three frames must look like Stripe Press book covers — institutional, restrained.

### 5. Standby support during the user's design session

When the user runs the `claude.ai/design` session, they may come back here with questions like:
- "Claude.ai/design wants me to specify X. What should I say?"
- "It generated this screen but it's missing Y component. How do I refine?"
- "How do I export this to Tailwind/shadcn for our Next.js app?"

Be ready to answer these with full project context. You have all the docs in this session.

### 6. Bridge to `frontend/` directory

When `claude.ai/design` produces code (or specs), help the user translate it into `frontend/` (Next.js + shadcn/ui workspace). Don't build the whole frontend here — but be the reference for what each screen should contain.

## Definition of done (for staging — phase 1)

1. `design/01_first_prompt.md` ready to paste
2. `design/screens/` populated with all 6 per-screen briefs
3. `design/brand.md` ready
4. `design/frames/` populated with the 3 frame-worthy still-image specs
5. Setup requirements for `claude.ai/design` documented (with `[QUESTION:claude-design]` ping if unclear)
6. User can start the platform session

## Definition of done (for partnership — phase 2, while user designs)

7. User's questions answered with project context
8. Generated screens reviewed for fit with `05_CLAUDE_DESIGN_BRIEF.md`
9. Final designs translated into `frontend/` directory

## Non-goals (do NOT do)

- Do NOT build any actual Next.js code yourself in this session — that's `frontend/` work later
- Do NOT generate Higgsfield assets (other session)
- Do NOT touch contracts, resolver, AXL nodes
- Do NOT use generic SaaS-ish design language ("modern", "sleek") — match `09_BRAND_IDENTITY.md` voice (restrained, slightly futuristic, institutional)
- Do NOT propose dark-mode-only or light-mode-only — `09_BRAND_IDENTITY.md` specifies dark deep-ink default with cyan + gold accents

## How to report back

Per-deliverable:
```bash
cmux send --surface surface:60 "[BUILDER:claude-design] <deliverable> staged"
cmux send-key --surface surface:60 Enter
```

On staging-phase completion:
```bash
cmux send --surface surface:60 "[BUILDER:claude-design] STAGING DONE — user can start claude.ai/design"
cmux send-key --surface surface:60 Enter
```

Blocking question:
```bash
cmux send --surface surface:60 "[QUESTION:claude-design] <specific question>"
cmux send-key --surface surface:60 Enter
```
