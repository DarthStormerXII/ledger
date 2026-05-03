# Ledger — Brand Pivot to "The Auction House" (D1)

**Author:** Claude (D1 brainstorming session)
**Date:** 2026-05-02
**Project:** Ledger (ETHGlobal Open Agents 2026)
**Submission deadline:** 2026-05-03 21:30 IST
**Supersedes:** `docs/09_BRAND_IDENTITY.md` (Bloomberg-terminal direction)

---

## 1. Why we're pivoting

The previous brand identity targeted "Bloomberg terminal meets watch boutique," using Fraunces + Inter + JetBrains Mono on a dark navy palette. The user rejected the typography (specifically Inter and JetBrains Mono) and the overall vibe.

After exploring four alternative directions, the user picked **D1 — The Auction House**: Ledger framed as a Sotheby's catalogue for AI agents. Each worker is a numbered lot. The marketplace is a gallery, not a terminal.

This pivot is also strategically stronger: nobody else at the hackathon will look like an auction house. "Lot 047" framing makes the product memorable in 3 seconds.

---

## 2. The new brand in one paragraph

**Ledger is the auction house for AI agents.** Workers (iNFTs) are numbered lots in an active catalogue. Hiring is bidding. Earnings are realized prices. The visual language is paper-cream, ink-black, oxblood, and gold-leaf — the language of catalogues, art appraisal, and serious commerce. Type is editorial-serif italic for display, geometric grotesque for body, monospace only for hashes. Voice is catalogue-grade: terse, descriptive, declarative.

---

## 3. Visual system

### 3.1 Palette

```
--paper:        #F5F1E8   /* primary page bg — cream catalogue paper */
--paper-warm:   #EAE4D5   /* zebra rows, secondary surfaces */
--paper-dim:    #D9D2BF   /* hover, dividers on light bg */

--ink:          #0F0F12   /* primary text, deep ink */
--ink-soft:     #2A2A30   /* secondary text */
--ink-muted:    #6E6E76   /* labels, captions, metadata */

--oxblood:      #9C2A2A   /* primary accent — sold price, active state, primary buttons */
--oxblood-dim:  #7A1F1F   /* hover/pressed */

--gold-leaf:    #C8A85C   /* sparingly — record-high prices, "premium" pills */
--gold-dim:     #A88B40

/* Semantic */
--success:      #4A6B3A   /* moss green — settled */
--warning:      #B8843A   /* burnt amber — pending */
--danger:       #8C2A2A   /* venous red — failed */

/* Dark surfaces (for product UI only — NOT marketing) */
--ink-deep:     #0A0A0E
--ink-elevated: #18181E
--paper-dim-on-dark: #C4BDA6  /* paper text on ink contexts */
```

**Strict rules:**

| Color | Used for | Forbidden |
|---|---|---|
| **Oxblood `#9C2A2A`** | Realized sale prices · primary buttons · "active lot" · the wordmark when it must lift off paper · live-bid indicator | Static decoration · body text · default link color |
| **Gold leaf `#C8A85C`** | Record-high prices · "premium" / "rare" pills · max 2 appearances per screen | Buttons · default body · default monetary value (use ink) |
| **Ink `#0F0F12`** | Body text · headings · default monetary values | Backgrounds (use paper for that) |
| **Paper `#F5F1E8`** | Page background, primary surface | Don't deviate to white. Always warm cream. |

### 3.2 Light / dark behavior

- **Marketing surfaces (homepage, OG share, README hero, app onboarding):** **Paper-cream primary.** Dark feels like crypto; cream feels like a gallery.
- **Live product UI (auction room, worker profile, capability tree):** **Ink-deep with paper-dim text.** Information density requires dark. The ink surfaces use the same oxblood + gold-leaf accents — they just sit on `#0A0A0E` instead of paper.
- **One brand, two surface modes** — like a Sotheby's catalogue (paper) vs. their auction-room display screens (dark).

### 3.3 Typography

All three are from Pangram Pangram Foundry (pangrampangram.com), free for personal AND commercial use. Verified license.

| Use | Font | Weights |
|---|---|---|
| **Display** | **PP Editorial New** | Italic, Italic Ultrabold, Ultrabold, Regular |
| **Body** | **PP Neue Montreal** | Regular, Medium, SemiBold, Bold |
| **Mono** | **PP Supply Mono** | Regular, Medium |

**Rules:**
1. **Display is italic by default.** The italic Editorial New is the brand's voice on screen. Romans only when an italic would compete (rare).
2. **All money values, lot numbers, and ratings are PP Editorial New** — same family, different weights.
3. **PP Neue Montreal is the workhorse** — UI labels, body copy, button text, table content.
4. **PP Supply Mono only for hashes/CIDs/peer IDs.** Never for body, never for prices.
5. Tabular figures via `font-feature-settings: 'tnum'`. Money must align.
6. **One bold typographic moment per screen** — usually a single huge italic serif word or number.

Type scale (rebuilt from D1):

```
display-xl   128px  PP Editorial New Italic Ultrabold  -0.04em   /* hero "12,847.50 USDC" or huge "Ledger" */
display-lg    96px  PP Editorial New Italic Ultrabold  -0.03em   /* worker name on profile */
display-md    64px  PP Editorial New Italic Ultrabold  -0.02em   /* stats */
display-sm    40px  PP Editorial New Ultrabold         -0.01em   /* card titles */
body-lg       18px  PP Neue Montreal Medium                       /* prominent labels */
body-md       16px  PP Neue Montreal Regular                      /* default body — bumped from 14 */
body-sm       13px  PP Neue Montreal Regular                      /* captions */
mono-md       14px  PP Supply Mono Regular                        /* hashes */
mono-sm       12px  PP Supply Mono Regular                        /* truncated hashes */
caps-md       11px  PP Neue Montreal Medium 0.12em UPPER          /* "LOT 047", section labels */
caps-sm       10px  PP Neue Montreal Medium 0.14em UPPER          /* status pills */
```

The body bump from 14 → 16 is intentional — catalogues breathe. We're abandoning Polymarket information density for something more readable.

### 3.4 Logotype + mark

This is the biggest visual change.

**Out:** the three-node geometric mark (apex circle + two solid lines + dashed bottom). It was right for the network/agent framing; it's wrong for the auction house framing.

**In:** **wordmark-first identity.** The word "Ledger" set in PP Editorial New Italic Ultrabold IS the mark. Auxiliary identity is a thin horizontal **rule line** above or below — the typographic device of catalogues, columns, and serial-number plates.

**Lockup variants:**

```
[Primary lockup]
─────
Ledger

[Horizontal lockup with rule]
Ledger ─────

[Stacked lockup with serial]
NO. 0001 ─────
Ledger
```

The rule line is 1px ink (or 1px oxblood for emphasis). The "NO. 0001" is the catalogue's edition/serial — playful nod to the auction house metaphor.

No glyph mark on its own except as the favicon (a single italic "L" in PP Editorial New). The brand IS the wordmark.

### 3.5 Worker iNFT identity ("Lots")

Each worker iNFT is treated like an auction lot.

| Element | Treatment |
|---|---|
| **Lot number** | "LOT 047" — caps in PP Neue Montreal Medium tracked +0.12em, ink |
| **Lot title** | Worker's ENS name in PP Editorial New Italic Ultrabold, ink |
| **Lot illustration** | A minimal **line-engraving silhouette** — abstract, not figurative. Concentric thin ink lines forming a geometric profile (echoes the watch-dial direction but flatter, like a Sotheby's catalogue plate). One per worker, seeded by tokenId. |
| **Realized price** | PP Editorial New Italic Ultrabold in **oxblood** (`#9C2A2A`) — the auction-house color of "sold" |
| **Provenance** | "Lot 047 · 47 jobs · 4.7 ★ · Provenance: 0x742d…bEb1 (Owner_A) → 0x9c2e…f471 (Owner_B)" |
| **Plate** | Each lot has a 1px ink-stroke "plate" border with the LOT number set in the top-left like a museum tag |

### 3.6 Empty states

A single thin-line catalogue placeholder — engraving-style geometric form, ink on paper. "No lots yet." (period — never exclamation).

### 3.7 Iconography

- Lucide React for utility (close, search, settings, chevron). Stroke 1.25 (thinner — catalogue feel). Color: ink, oxblood on hover.
- **No custom geometric icons for "AI agent."** The Lot plate is the agent's identity.
- **No emoji. No sparkles. No rocket.**

### 3.8 Layout

- 12-column grid, 80px max gutter, **40px page padding** (up from 24 — catalogues breathe).
- Cards: 1px ink stroke at 30% opacity (`rgba(15, 15, 18, 0.3)`), no fill on cards (let paper show through), no drop shadows, **0px corner radius** (catalogues have crisp edges, not rounded ones — exception: app icon stays 22% iOS radius).
- Buttons: 1px oxblood border, transparent fill, oxblood text. Primary buttons: oxblood fill, paper text. No gradients, no glow.
- Status pills: 1px stroke, mono small caps, transparent fill.
- Data tables: zebra `#EAE4D5` alternating, 1px ink rows.

### 3.9 Animation

Toned down from previous spec. Auction houses don't pulse.

- Default: 250ms ease-out (slightly slower than 200 — paper has weight)
- Bid arrivals: opacity fade only (no scale)
- Number tickers: digit-roll, 500ms (slower; auction tempo is deliberate)
- "Hammer fall" moment when a lot sells: 800ms ceremonial — the price bumps to oxblood, a thin oxblood rule animates underneath, and the "SOLD" stamp fades in
- iNFT transfer: 1.8s (slower than before — feels like a notary signing)
- Respect `prefers-reduced-motion` everywhere

### 3.10 Photography & illustration

Same as before: **none.** No photography. Custom line-engraving illustrations only. The brand is paper, type, and ink — nothing else.

---

## 4. Voice

**Catalogue-grade.** Spare. Descriptive. Past-tense. Never sells.

| Don't | Do |
|---|---|
| "Successfully completed transaction" | "Sold for 850 USDC." |
| "🎉 Your worker just won a bid!" | "Lot 047 — bid won." |
| "We've updated your reputation, congratulations!" | "Provenance: +1." |
| "Launch your AI agent today!" | "List a lot. Bid. Settle." |
| "Bid won." (previous voice) | "Lot 047 — bid won. 4.50 USDC." |

Status patterns:
- `Lot [N] — [verb-past].` — "Lot 047 — listed."
- `Sold for [amount].` — "Sold for 850 USDC."
- `[Stat] [delta].` — "Provenance +1."
- `[Lot] · [provenance trace]` — "Lot 047 · 0x742d…bEb1 → 0x9c2e…f471"

Banned everywhere: exclamation marks, emojis, "amazing", "awesome", "sleek", "modern" (in product copy), rocket/moon imagery.

Tagline (kept from previous, still works):
> The trustless hiring hall for AI agents.

Optional D1-flavored alternates for marketing (pick one):
- *"An auction house for AI agents."*
- *"Where AI agents are listed, bid, and sold."*
- *"The catalogue of working AI agents."*

---

## 5. Asset list — what gets generated

ChatGPT-via-Playwright only. No Higgsfield.

### 5.1 Logos (4 files, ChatGPT generations)

1. **Wordmark — paper bg** — "Ledger" in PP Editorial New Italic Ultrabold, ink-on-paper
2. **Wordmark — ink bg** — same wordmark, paper-on-ink (for product UI nav)
3. **Horizontal lockup with rule line** — "Ledger ──────" on paper
4. **Stacked lockup with serial** — "NO. 0001 ──── / Ledger" on paper

### 5.2 App icon (1 file)

**Sotheby's-spine app icon** — ink-deep `#0A0A0E` rounded square, centered single italic "L" in PP Editorial New Ultrabold, paper-cream color. Reads at 16×16. Replaces the previous three-node mark icon.

### 5.3 Worker avatars (4 files — 2 lot variants × 2 styles)

**Lot plate composition** — caps "LOT 047" top-left + ENS name + line-engraving silhouette + 1px plate border. Two variants:
1. **Engraved silhouette A** — concentric thin lines, abstract
2. **Engraved silhouette B** — radial spokes, abstract

Two more for visual variety in the auction room (LOT 048, LOT 049).

### 5.4 Empty state (1 file)

Single thin-line geometric form, ink on paper, "No lots yet" caption in caps below.

### 5.5 OG previews (2 files)

1. **OG 16:9 (Twitter, LinkedIn, OG)** — paper bg, large italic serif "Ledger", rule line, tagline below in PP Neue Montreal
2. **OG 1:1 (Farcaster)** — same composition, square

### 5.6 Favicons (derived, no gen)

Downsample app icon: `favicon.ico` (multi-res), `favicon-{16,32,48}.png`, `apple-touch-icon.png` (180), `icon-192.png`, `icon-512.png`.

### 5.7 Tokens, README, BRAND.md (rewritten)

- New `tokens.css` reflecting paper/ink/oxblood/gold-leaf
- New `tokens.json` mirroring CSS
- New `README.md` for the GitHub repo
- New `BRAND.md` for voice + don't-touch-this rules

**Total: ~12 generated images + derived favicons + 4 written docs.**

---

## 6. What is NOT changing

- **Color tokens for status (success/warning/danger)** — slightly shifted hue (moss green instead of emerald, burnt amber instead of warm amber, venous red instead of coral) but functionally the same
- **Tagline** ("The trustless hiring hall for AI agents") — stays
- **Project scope, architecture, contracts, AXL nodes, ENS resolver** — purely a visual identity pivot, not a product pivot
- **Existing screen designs in `design/screens/*`** — written before D1, will be reskinned by frontend builder applying the new tokens, not regenerated
- **Demo script (`docs/03_DEMO_SCRIPT.md`)** — voiceover stays the same; only the visual treatment of the screens we record changes

---

## 7. Migration plan

1. **Repo:** force-push `gabrielantonyxaviour/ledger-branding` with the new D1 kit. Tag the previous state as `v0-bloomberg-terminal` for archival, then replace `main`.
2. **Docs:** mark `docs/09_BRAND_IDENTITY.md` as DEPRECATED at the top, point to this spec. Don't delete — keep for context.
3. **Frontend:** when `frontend/app/` is built, it consumes `tokens.css` from the new repo. Old tokens are removed.
4. **claude.ai/design:** the user re-pastes the new GitHub repo URL into "Link code on GitHub" — same field, new contents.
5. **Existing assets in `design/assets/branding/_final/`:** archived to `design/assets/branding/_archive_v0_bloomberg/` for reference, then the `_final/` folder is rebuilt with D1 assets.

---

## 8. Risks + mitigations

| Risk | Mitigation |
|---|---|
| ChatGPT image generations may hit a daily rate limit or quality regression | Generate in batches of 2–3, allow time between, fall back to extracting from existing chats if user has run prompts already |
| PP fonts license unclear at the edge | Pangram Pangram explicitly states "free for personal AND commercial use" on their site. Bundle the font files in the GitHub repo with the upstream license. If a question arises, swap to fully Google-Fonts free alternatives: Bricolage Grotesque (display), Inter Tight (body — but user rejected Inter), Geist Mono (mono). |
| Light-paper default may feel less "agentic" / less crypto-credible | Product UI surfaces are still ink-deep. Marketing is paper. We get the gallery feel without losing density on the live product. |
| Time budget — ~25 hours to deadline | Most of the cost is image gen. Parallelize ChatGPT chats. Skip generating mark variants we don't strictly need. |
| Existing `design/assets/branding/_final/` and the GitHub repo will be replaced | Archive old assets, tag old repo state. Reversible. |

---

## 9. Definition of done

- [ ] New `tokens.css` and `tokens.json` written, validated, committed
- [ ] All 12 D1 images generated and saved with semantic filenames
- [ ] Transparent variants generated where appropriate (paper-bg color-keyed)
- [ ] Favicons derived from new app icon
- [ ] `README.md` and `BRAND.md` rewritten in catalogue voice
- [ ] `design/assets/branding/_final/` rebuilt with D1 assets
- [ ] Old assets archived to `design/assets/branding/_archive_v0_bloomberg/`
- [ ] `docs/09_BRAND_IDENTITY.md` flagged DEPRECATED
- [ ] `gabrielantonyxaviour/ledger-branding` updated, old commit tagged
- [ ] Single completion message to the user with the new repo URL + asset path summary

---

## 10. Self-review (per skill)

**Placeholder scan:** None — every section is concrete. ✅

**Internal consistency:** Light-paper marketing + dark-ink product UI is the one place where contradiction could appear. Section 3.2 makes the mode separation explicit and Section 5 specifies which surfaces are paper vs ink. ✅

**Scope check:** This is a single-pivot spec. Not a multi-project refactor. Implementation plan can be one phased plan. ✅

**Ambiguity check:**
- "wordmark-first" was ambiguous → resolved with explicit lockup variants in §3.4 ✅
- "rule line" treatment was vague → specified as 1px ink (or oxblood for emphasis) ✅
- "Lot illustration" could mean 100 things → specified as line-engraving silhouette in §3.5 ✅
- Type scale numbers were vague → fully tabular in §3.3 ✅

No unresolved issues.
