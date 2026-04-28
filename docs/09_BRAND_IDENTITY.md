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

## 3. Logo Generation Prompts

### For your image gen tool (DALL-E, Midjourney, Imagen, Higgsfield image, Flux)

#### Prompt for the standalone mark

```
Minimalist vector logo mark on deep navy black background. Three small 
filled circles arranged in an equilateral triangle, point facing up. 
The two top connections (left circle to top circle, right circle to top 
circle) are solid thin lines. The bottom edge connecting the two lower 
circles is a dashed line. The top circle is pale gold #E8D4A0, the two 
lower circles are warm off-white #F5F2EB, the solid lines are off-white 
at 60% opacity, the dashed line is electric cyan #5FB3D4. Geometric, 
precise, mathematical. Reference: Massimo Vignelli logo design, Pentagram 
graphic identity, Bauhaus geometric purity. Square format 1024x1024. 
Vector aesthetic, NO photorealism, NO 3D effects, NO gradients, NO 
shadows, NO glow effects.
```

#### Prompt for the horizontal lockup

```
Premium minimalist logo lockup. Left side: a small geometric mark — 
three circles in an upward triangle, two solid lines on the upper 
edges, one dashed line on the bottom edge. Right side: the wordmark 
"LEDGER" in a chunky modern serif font (Fraunces Black or similar), 
all uppercase, tight letterspacing. Both rendered in pale gold 
#E8D4A0 on a deep navy black #0A0E1A background. Generous clear space 
around the lockup. Reference: the Stripe Press logo, the Substack 
wordmark, the Robinhood Gold lockup. Wide horizontal format 1920x600. 
NO gradients, NO shadows, NO 3D, NO additional graphics or 
embellishments.
```

#### Prompt for the app icon

```
Square app icon, 1024x1024. Centered on a deep navy black #0A0E1A 
background: three small filled circles arranged in an equilateral 
upward triangle, with two solid thin lines on the upper edges and 
one dashed line on the bottom edge. All three circles and lines 
rendered in pale gold #E8D4A0. Geometric, precise, no other elements. 
Slightly rounded corners on the icon background (iOS-style 22% radius). 
Reference: the Linear app icon, the Notion icon, the Things icon. 
Premium, restrained, institutional. NO text, NO additional graphics.
```

#### If those don't land — alternative concept (the L-monogram)

If the three-node mark doesn't generate well, fall back to a typographic monogram:

```
Premium typographic monogram. The capital letter "L" rendered in a 
chunky modern serif (Fraunces Black weight), but with a small detail: 
the horizontal serif at the base of the L extends rightward and 
terminates in three small filled dots forming a triangle pattern. 
Pale gold #E8D4A0 on deep navy black #0A0E1A. Square format 1024x1024. 
Reference: the Mailchimp Freddie monogram, the Stripe S, the New York 
Times T. Geometric, refined. NO gradients, NO 3D, NO shadows.
```

### Iteration tips

After first generation:
1. **Reject anything cute, friendly, or playful.** Push toward "institutional luxury."
2. **Reject anything with extra elements.** If it adds sparkles, gradients, glow — re-prompt with "remove all decorative effects, pure geometric forms only."
3. **The mark should pass the squint test.** Squint at the result; if it looks like generic abstract art, the geometry isn't disciplined enough.

---

## 4. Typography System

### Type stack

| Use | Font | Weight | Source |
|---|---|---|---|
| Display (wordmark, hero numbers) | **Fraunces** | Black, ExtraBold | Google Fonts (free) |
| Body (paragraphs, labels, buttons) | **Inter** | Regular, Medium, SemiBold | Google Fonts (free) |
| Monospace (addresses, hashes, code) | **JetBrains Mono** | Regular, Bold | Google Fonts (free) |

### Why these specific fonts

- **Fraunces** — A Google-Fonts variable serif by Phaedra Charles. It has a "9pt" optical size axis at small sizes that's perfect for the wordmark, plus a "soft" axis that lets you control how friendly vs. severe the letters feel. Set softness to 0 (severe) for institutional vibes. Free, open-source, won't have licensing issues.
- **Inter** — Rasmus Andersson's grotesque designed for screens. The default for serious crypto / fintech UIs. Massive weight range, perfect screen rendering, free.
- **JetBrains Mono** — Mono with high legibility for hex addresses and tx hashes. Distinguishes 0/O, 1/l/I clearly. The mono font of choice for crypto.

### Type scale

| Token | Size | Use |
|---|---|---|
| `display-xl` | 96px / Fraunces Black / -0.03em | The "12,847.50 USDC" hero number on the Hall |
| `display-lg` | 64px / Fraunces ExtraBold / -0.02em | Worker name on Worker Profile |
| `display-md` | 48px / Fraunces ExtraBold / -0.02em | Stats grid values |
| `display-sm` | 32px / Fraunces SemiBold / -0.01em | Card titles, modal headers |
| `body-lg` | 18px / Inter Medium / -0.005em | Job titles, prominent labels |
| `body-md` | 14px / Inter Regular | Default body text, paragraph copy |
| `body-sm` | 12px / Inter Regular | Captions, metadata |
| `mono-md` | 14px / JetBrains Mono Regular | Addresses (full), tx hashes |
| `mono-sm` | 12px / JetBrains Mono Regular | Truncated addresses, log lines |
| `caps-md` | 12px / Inter SemiBold / 0.08em / uppercase | Section headers ("LIVE JOBS") |
| `caps-sm` | 10px / Inter SemiBold / 0.1em / uppercase | Pill labels, status badges |

### Typography rules

1. **Numbers in Fraunces, words in Inter.** Discipline this religiously. Money, counts, ratings → serif. Everything else → grotesque.
2. **Tabular figures everywhere a number could change.** Use the `tabular-nums` Tailwind class or `font-feature-settings: 'tnum'` so `9.99` and `10.00` align.
3. **Monospace for anything copy-pasteable.** Addresses, hashes, contract IDs, seed phrases (never display, but in code samples).
4. **Never underline links.** Use color (cyan) and hover state instead.
5. **Letter-spacing tightens with size.** Bigger text = tighter letter-spacing, all the way down to -0.03em on `display-xl`.

---
