# Ledger — Claude Design Brief

**Tool:** Claude Design (Anthropic Labs)
**Project type:** High fidelity prototype
**Project name:** Ledger

---

## How to Use This Document

When you start in Claude Design:

1. Choose **High fidelity** (not wireframe)
2. Project name: `Ledger`
3. Click **Set up design system** — fill it using Section A below
4. Once design system is configured, build screens one at a time using the prompts in Section B

---

## Section A — Design System Setup

### Company name and blurb
```
Ledger — the trustless hiring hall where AI agents bid for work, and 
where the workers themselves are tradeable on-chain assets (iNFTs) 
that carry their reputation, memory, and earnings history with them 
across owners. A two-sided marketplace built for ETHGlobal Open 
Agents 2026.
```

### Link code on GitHub
Skip initially. Add when your repo is up and Claude Design can sync with your component patterns.

### Link code from your computer
Skip.

### Upload .fig file
Skip unless you have a reference Figma you want it to match.

### Add fonts, logos and assets
Upload these:
- `Fraunces` font files (download from Google Fonts, all weights)
- `Inter` font files (download from Google Fonts, all weights)
- `JetBrains Mono` font files (download from Google Fonts, regular + bold)
- 2-3 reference screenshots that match the aesthetic — Linear product screen, Polymarket market detail page, a luxury watch product page

### Any other notes? (paste verbatim)

```
AESTHETIC
Confident, restrained, slightly futuristic. Linear's tightness meets 
Polymarket's information density meets the quiet luxury of a watch 
boutique. Absolutely no crypto clichés — no gradients, no 
glassmorphism, no neon greens, no "rocket" or "moon" iconography, 
no rounded-corner playfulness. This is institutional-grade software 
for a new asset class.

PALETTE
- Background: deep ink #0A0E1A and warm off-black #13151C
- Surface: subtle elevation #1A1D26
- Border: subtle line #272A35
- Primary: pale gold #E8D4A0 — used sparingly, ONLY for value/earnings 
  numbers and the brand wordmark
- Accent: electric cyan #5FB3D4 — for live activity indicators, AXL 
  packets, active states, primary buttons
- Text primary: warm white #F5F2EB
- Text muted: slate #7A8290
- Success: muted emerald #4A8B6F
- Warning: warm amber #D4A347
- Danger: faded coral #C97064

TYPOGRAPHY
- Display (Fraunces): the wordmark "Ledger" and any large hero numbers 
  — earnings, USDC totals
- Body (Inter): everything else — labels, paragraphs, button text, 
  table content
- Mono (JetBrains Mono): on-chain addresses, hashes, transaction 
  receipts, log output

VOICE
Spare, precise, a bit cold. Think "Bloomberg terminal" not "social 
app." Status messages are short: "Worker accepted." "Payment landed." 
"Reputation +1." Never use exclamation marks. Never use emojis. 
Never use "amazing" or "awesome."

PRINCIPLES
1. Money is sacred. Always tabular figures. Always proper currency 
   formatting. Always show 2 decimal places for USDC.
2. Live data feels alive. Subtle pulses on new bids. Smooth number 
   tickers when earnings update. No abrupt state changes.
3. The iNFT is the hero. Every worker has a visual identity. Treat 
   worker portraits like watch dials — symmetrical, precise, refined.
4. Density over whitespace. Information-rich, not airy.
5. One bold typographic moment per screen. Usually a single huge 
   number or a single huge name in Fraunces.

LAYOUT
- 12-column grid, 80px max gutter, 24px page padding
- Cards: 1px subtle border #272A35, no drop shadows, 4px corner radius
- Buttons: solid fill, no gradients, no glow, 4px corner radius
- Status pills: small caps text, monospace font, single-color border
- Data tables: zebra-striped with #13151C alternating, 1px row border
- Modals: full backdrop dim to 80% opacity, centered card, 8px corner 
  radius (slightly more than buttons for hierarchy)

ANIMATION
- All animations 200ms ease-out unless otherwise specified
- Bid arrivals: scale from 0.95 to 1.0 + fade in
- Number tickers: roll digits, 400ms
- AXL topology packets: linear motion, 1.2s end-to-end
- iNFT transfer: ceremonial 1.5s sequence, with particle stream reversal
```

---
