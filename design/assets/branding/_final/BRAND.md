# Ledger — Brand Voice & Principles (D1 Auction House)

The non-visual side of the brand. Read this before writing copy, naming a UI element, or making a judgment call about whether something fits.

## Voice

**Catalogue-grade. Spare. Past-tense. Confident. Never sells.**

Sotheby's catalogue, not crypto pitch. State the lot, the realized price, the provenance.

### Don't / Do

| Don't | Do |
|---|---|
| "Successfully completed transaction" | "Sold for 850 USDC." |
| "🎉 Your worker just won a bid!" | "Lot 047 — bid won." |
| "We've updated your reputation, congratulations!" | "Provenance +1." |
| "Launch your AI agent today!" | "List a lot. Bid. Settle." |
| "Bid won." (v0 voice) | "Lot 047 — bid won. 4.50 USDC." |
| "Our amazing reputation system makes everything trustable!" | "Reputation feedback signed by employers. Verifiable on-chain." |

### Status patterns (lock these)

- `Lot [N] — [verb-past].` — *Lot 047 — listed.*
- `Sold for [amount].` — *Sold for 850 USDC.*
- `[Stat] [delta].` — *Provenance +1.*
- `[Lot] · [provenance trace]` — *Lot 047 · 0x742d…bEb1 → 0x9c2e…f471*

### Banned everywhere

- Exclamation marks
- Emojis
- The words: "amazing", "awesome", "sleek", "modern" (in product copy)
- "🚀" / "🌙" / any rocket / moon imagery
- "Successfully" (just say what happened)
- "We're thrilled to announce…"
- Marketing-deck adjectives

## Visual principles

1. **Oxblood is sold.** `#9C2A2A` appears only on realized prices, primary buttons, "active lot," and live-bid indicators. Never decorative. Max 1-2 prominent uses per screen.

2. **Gold leaf is rare.** `#C8A85C` marks record prices and premium-tier pills. Max 2 per screen. Never the default monetary color (use ink for default).

3. **Italic serif is the brand voice.** Display type (Fraunces) is italic-default. Romans only when italic would compete with adjacent italic copy.

4. **Numbers in italic serif, words in grotesque.** Religiously. Money / counts / ratings → italic Fraunces. Everything else → Bricolage.

5. **Tabular figures everywhere.** `font-feature-settings: 'tnum'`. `9.99` and `10.00` align.

6. **Mono only for chain artifacts.** Addresses, hashes, CIDs, peer IDs. Body font on a hash = reject. Mono on a price = reject.

7. **One bold typographic moment per screen.** Usually a single huge italic word or number. Don't compete.

8. **Density via vertical rhythm, not cramming.** 16px body, 40px page padding. Catalogues breathe. We don't.

9. **No photography. No stock images. No gradients.** Custom geometric / line-engraving / pure typography only. The brand is paper, ink, oxblood, and gold leaf — nothing else.

10. **Crisp edges.** 0px corner radius by default. The app icon is the one exception (iOS 22%).

## Banned visual treatments

- Gradients (anywhere, ever)
- Glassmorphism / frosted glass effects
- Drop shadows
- Glow / bloom / outer halos
- 3D effects, beveling, embossing, foil-stamp simulations
- Sparkle / star particles
- Rounded blob shapes
- Stat-card hero grids — lead with the active lot
- 2×2 / 3×3 feature card grids ("bento" layouts)
- Search-icon-inside-search-bar
- Back-buttons at top of detail/new pages — use Cancel/Close in context
- Generic placeholders ("John Doe", "Lorem ipsum", "user@example.com")
- Robot heads / brain emojis for "AI agent"
- Cube / blockchain illustrations
- Rocket ships / moons

## Iconography

- **Lucide React** for utility icons only (close, search, settings, copy, external-link, chevron). Stroke 1.25 (thinner — catalogue feel). Color: ink, oxblood on hover.
- **No custom geometric icons for "AI agent."** The Lot plate IS the agent's identity.
- No emoji. No sparkle. No rocket.

## The Lot plate

Every worker iNFT is treated as a numbered Lot. Anatomy:

```
┌────────────────────────────┐
│ LOT 047 ── (caps muted)    │
│                            │
│   [line-engraving emblem]  │
│                            │
│ worker-001.<team>.eth      │ (italic Fraunces)
│ 47 jobs · 4.7 ★            │
│                            │
│ Sold for 850.00 USDC       │ (italic Fraunces, oxblood)
│ Provenance: 0x742d → 0x9c2e│ (mono)
└────────────────────────────┘
```

Default: 1px ink border, no fill (paper shows through), 0px radius. The "LOT [N]" label is upper-left.

## Empty states & placeholders

- Real-shape data, not "John Doe" / "Lorem ipsum"
- ENS names: `worker-001.<team>.eth`
- Addresses: real Base / 0G shape
- USDC values: actual amounts to 2 decimals

## When in doubt

> Sotheby's catalogue, not crypto pitch. Stripe Press, not VC deck.

If a decision feels "amazing", "sleek", "fun", or "energetic" — reconsider. Restraint is the brand.

If a number is changing — italic Fraunces, tabular, in ink (or oxblood if it's a sale). Hash on a number — never.

If you're tempted to add an icon for "AI agent" — don't. The Lot plate is the agent.
