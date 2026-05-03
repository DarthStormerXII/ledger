# Setup — claude.ai/design for Ledger

What to do when you open `claude.ai/design` for the first time. Distilled from `docs/05_CLAUDE_DESIGN_BRIEF.md` Section A.

## 1. New project

- **Project type:** High fidelity prototype (NOT wireframe)
- **Project name:** `Ledger`
- **Company blurb:** paste verbatim from `design/01_first_prompt.md` § Project shape
- **Link GitHub:** skip on first launch — connect later when `frontend/` is initialized so it can sync component patterns
- **Link local repo:** skip
- **Upload .fig:** skip (no Figma reference; the docs ARE the spec)

## 2. Design system

Click **Set up design system** and paste the contents of `design/brand.md` into the "Any other notes?" field.

## 3. Asset uploads

Before starting screens, upload:

- **Fonts** (download from Google Fonts, all weights):
  - Fraunces — variable; include 9pt optical size
  - Inter — variable
  - JetBrains Mono — Regular + Bold
- **Reference screenshots** (3 total, drop these in to anchor the aesthetic — fetch and stage in `design/refs/`):
  - A Linear product screen (workspace inbox or roadmap view)
  - A Polymarket market detail page (dark surface, dense data)
  - A luxury watch product page (institutional restraint)

## 4. First prompt

Once the design system is configured, open a new design thread and paste `design/01_first_prompt.md` verbatim. That prompt:
- Establishes project shape, brand, screen list, demo-critical states, constraints
- Is dense by design — do not summarize before pasting

## 5. Per-screen iteration

After the first prompt lands, build screens one at a time. Use the per-screen briefs in `design/screens/` (each one is paste-ready). Refine with surgical edits — never "make it better." Reference `docs/05_CLAUDE_DESIGN_BRIEF.md` Section C for good vs bad edit examples.

## 6. Frame-worthy stills

The 3 frames a judge holds on for ≥3 seconds during the demo are speced in `design/frames/`. After Auction Room, Worker Profile, and Inheritance Modal are designed, do a dedicated still-image pass against the frame specs.

## 7. Export

When screens are signed off:
- Connect the GitHub repo (`ledger/`)
- Export each screen as a Next.js page component
- Drop into `frontend/app/`
- Wire real data sources (AXL SSE, viem on-chain reads) in Claude Code, not in claude.ai/design

## 8. If you hit setup friction

If `claude.ai/design` requires anything not covered above (account verification, beta gate, payment, a missing field), come back to this Claude Code session — we have the full project context to answer it. The Code session is on `surface:60` standby.
