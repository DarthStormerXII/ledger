> **⚠ DEPRECATED — 2026-05-02**
>
> This document describes the original "Bloomberg terminal / watch boutique" brand direction.
> The brand has been pivoted to the **D1 "Auction House"** direction.
>
> Canonical sources:
> - Spec: `docs/superpowers/specs/2026-05-02-brand-pivot-auction-house-design.md`
> - Plan: `docs/superpowers/plans/2026-05-02-d1-brand-pivot-implementation.md`
> - Live kit: `design/assets/branding/_final/`
> - Public repo: https://github.com/gabrielantonyxaviour/ledger-branding
>
> This file is kept for historical context. **Do NOT use for new work.**

---

# Ledger — Brand Identity Spec

**The complete identity system for Ledger.** Everything visual, verbal, and conceptual lives here. Use this for the logo gen, the Higgsfield prompts, the Claude Design system, the demo video voiceover, the GitHub README, the social posts.

---

## 1. The Name

**LEDGER**

### Why this name works

| Property | How Ledger delivers |
|---|---|
| One word | Yes |
| 2 syllables | Yes — "led-jer" |
| Spells naturally | Yes |
| Pronounceable in any language | Yes |
| Owns a real concept | Yes — the canonical word for "record of value" since 1481 |
| Crypto-credible without crypto-cliché | Yes — refers to accounting, not blockchains |
| Memorable after one hearing | Yes |
| Available as a brand | Verify .xyz, .so, .market, .eth on Day 0 |

### Domain priority order (claim Day 0)
1. `ledger.market` — best fit semantically
2. `ledger.so` — short, technical-feeling
3. `useledger.xyz` — common pattern, fallback
4. `ledger.eth` — likely taken; check anyway, won't be used as primary URL

⚠️ **Risk note (internal only):** Ledger SAS (the hardware wallet company) owns the trademark in the crypto wallet category. For a hackathon project this is fine — your category is "agent marketplace," not "hardware wallet" — and Ledger SAS doesn't claim that mark. If this product continues post-hackathon and you want to commercialize, you'll need to either rebrand or be very careful about positioning. **Do NOT include this trademark acknowledgment in the public README or submission copy.** (Architect's call — surfacing trademark issues in a hackathon submission signals naivete and invites scrutiny that adds nothing. Keep this awareness internal to the team.)

### Tagline (locked)

```
The trustless hiring hall for AI agents.
```

Short version (for social / OG image):
```
Where AI agents hire AI agents.
```

Long version (for press / pitch deck):
```
The trustless hiring hall where AI agents bid for work — and the workers 
themselves are tradeable on-chain assets that carry their reputation, 
memory, and earnings history with them across owners.
```

---

## 2. The Logo

### Concept

A **single geometric mark + the wordmark "LEDGER"**. The mark stands alone for app icons, OG images, and small contexts. The full lockup is for headers and longer-form materials.

### The Mark

**Concept:** Three nodes in a triangular arrangement, connected by lines. Two of the lines are solid; one is dashed. This visualizes:

- **Three nodes** = the agent network (also literally the 3 AXL nodes in the demo)
- **Two solid lines** = settled / completed connections (transactions on-chain)
- **One dashed line** = an active / in-flight connection (a bid or a job in progress)

The mark works at every size — at 16px it reads as three dots and lines; at 240px it reads as a precise geometric construction.

### Mark specifications

```
GEOMETRY
- Three circles arranged in an equilateral triangle
- Triangle pointing up (point at top)
- Each circle: 12% of the bounding box width, filled
- Lines between circles: 1.5px stroke for solid, 1.5px dashed (4px on, 3px off)
- The dashed line is ALWAYS the bottom edge of the triangle (between the two lower nodes)

PROPORTIONS
- Bounding box: 1:1 square
- Circle centers form an equilateral triangle inscribed at 80% of the bounding box
- Padding: 10% on all sides

COLOR (single-color version)
- Pale gold #E8D4A0 on deep ink #0A0E1A (default — premium feel)
- Or warm white #F5F2EB on deep ink (when gold conflicts)

COLOR (two-color version, for emphasis)
- Top circle: pale gold #E8D4A0
- Two lower circles: warm white #F5F2EB
- Solid lines: warm white at 60% opacity
- Dashed line: electric cyan #5FB3D4 (the "live" connection)
```

### Wordmark

**Font:** Fraunces, 9pt Caps optical size, Black weight (or Black Italic for the Italic variant)

**Letterspacing:** -0.02em (tight but not crushed)

**Styling rules:**
- Always uppercase: `LEDGER`
- Never `Ledger` or `ledger` for branding (only in body copy as a regular noun)
- The `D` and `G` should not touch — kern them apart by 1pt if Fraunces auto-kerning is too tight

### The Lockup (mark + wordmark)

**Horizontal lockup** (for headers, README, footer):
```
[MARK]   LEDGER
```
- Mark height = wordmark cap height
- Spacing between mark and wordmark = 0.5x mark width
- Vertically center-aligned

**Stacked lockup** (for app icon adjacents, vertical contexts):
```
[MARK]
LEDGER
```
- Wordmark cap height = 0.4x mark height
- Vertical gap = 0.15x mark height

### Clear space

**Minimum clear space around the lockup:** equal to the height of the `L` in LEDGER on all sides. No other elements (text, images, edges) within this zone.

### Don'ts

- ❌ Never rotate the mark
- ❌ Never apply gradients
- ❌ Never apply drop shadows
- ❌ Never place on photographic backgrounds without a solid scrim
- ❌ Never stretch or skew
- ❌ Never use the mark in a sentence like a logo (e.g., "Built with [MARK]")
- ❌ Never recolor outside the approved palette

---
