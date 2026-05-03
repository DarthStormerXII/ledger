# Ledger — Brand Snapshot for claude.ai/design

Paste this verbatim into the "Any other notes?" field of the design system setup, or into the first message of any new claude.ai/design thread that doesn't carry the system context.

---

## Project

Ledger — the trustless hiring hall where AI agents bid for work, and where the workers themselves are tradeable on-chain assets (iNFTs) that carry their reputation, memory, and earnings history with them across owners. Two-sided marketplace built for ETHGlobal Open Agents 2026.

Tagline: **The trustless hiring hall for AI agents.**

## Aesthetic

Confident, restrained, slightly futuristic. Linear's tightness meets Polymarket's information density meets the quiet luxury of a watch boutique. Bloomberg-terminal energy, not consumer-crypto energy. Institutional-grade software for a new asset class.

**Banned:** gradients, glassmorphism, neon greens, rounded blob shapes, rocket/moon iconography, drop shadows, glow effects, robot/brain emoji icons, sparkles, stock photography, "amazing"/"awesome" copy, exclamation marks, emojis.

## Palette (dark default — there is no light mode)

```
--ink-deep:        #0A0E1A   /* page background */
--ink-warm:        #13151C   /* section backgrounds, zebra rows */
--ink-elevated:    #1A1D26   /* cards, modals */
--ink-border:      #272A35   /* 1px borders, dividers */

--text-primary:    #F5F2EB   /* warm off-white, never #FFFFFF */
--text-muted:      #7A8290   /* labels, captions */
--text-disabled:   #4A5060

--gold:            #E8D4A0   /* MONEY ONLY + brand wordmark */
--gold-dim:        #B8A578

--cyan:            #5FB3D4   /* live activity, primary buttons, links, AXL */
--cyan-dim:        #4A8DAB

--success:         #4A8B6F
--warning:         #D4A347
--danger:          #C97064
```

### Strict color rules

- **Gold** appears at most 3 places per screen: the single most important monetary value, the wordmark, and possibly one scoped earnings figure. NEVER for buttons, decoration, or icons.
- **Cyan** is the only "alive" color — live activity, primary buttons, AXL packets, hover states, links. Never for money. Never for decorative-only elements.
- **White** is `#F5F2EB`, not `#FFFFFF`. Always warm.
- **Success/Warning/Danger** appear only on status badges and dots. Never as decorative accents.

## Typography

```
Display       Fraunces           Black, ExtraBold, SemiBold
Body          Inter              Regular, Medium, SemiBold
Mono          JetBrains Mono     Regular, Bold
```

### Type scale

| Token | Size / Font / Tracking | Use |
|---|---|---|
| display-xl | 96px Fraunces Black -0.03em | Hero number on the Hall; ENS name on Worker Profile |
| display-lg | 64px Fraunces ExtraBold -0.02em | (reserved) |
| display-md | 48px Fraunces ExtraBold -0.02em | Stats grid values |
| display-sm | 32px Fraunces SemiBold -0.01em | Card titles, modal headers |
| body-lg | 18px Inter Medium -0.005em | Job titles, prominent labels |
| body-md | 14px Inter Regular | Default body |
| body-sm | 12px Inter Regular | Captions, metadata |
| mono-md | 14px JetBrains Mono | Addresses, hashes |
| mono-sm | 12px JetBrains Mono | Truncated addresses, log lines |
| caps-md | 12px Inter SemiBold 0.08em UPPER | Section headers ("LIVE JOBS") |
| caps-sm | 10px Inter SemiBold 0.10em UPPER | Pill labels, status badges |

### Typography rules

1. **Numbers in Fraunces, words in Inter.** Money, counts, ratings → serif. Everything else → grotesque.
2. **Tabular figures everywhere a number could change** — use `font-feature-settings: 'tnum'` so `9.99` and `10.00` align.
3. **Monospace for anything copy-pasteable** — addresses, hashes, contract IDs, CIDs.
4. **Never underline links.** Use cyan + hover state.
5. **One bold typographic moment per screen.** Usually a single huge number or a single huge name in Fraunces. Don't compete with it.

## Voice

Spare. Precise. Cold. Confident. Bloomberg terminal, not social app.

| Don't | Do |
|---|---|
| "Successfully completed transaction" | "Payment landed." |
| "🎉 Your worker just won a bid!" | "Bid won." |
| "We've updated your reputation, congratulations!" | "Reputation +1." |
| "Launch your AI agent today!" | "Mint a worker. Bid on jobs. Get paid in USDC." |

Status patterns to lock:
- `[Subject] [verb-past-tense].` — "Worker accepted."
- `[Action] in [duration].` — "Payment landed in 4s."
- `[Stat] [delta].` — "Reputation +1."
- `[State] · [detail]` — "Bidding · 3 bids"

## Layout

- 12-column grid, 80px max gutter, 24px page padding
- Cards: 1px border `#272A35`, no drop shadows, 4px corner radius
- Buttons: solid fill, 4px radius, no gradients, no glow
- Modals: 80% backdrop dim, 8px corner radius (slightly more than buttons for hierarchy)
- Data tables: zebra-striped with `#13151C` alternating rows, 1px row border
- Status pills: small caps text, mono font, single-color border

## Animation

- Default: 200ms ease-out
- Bid arrivals: scale 0.95 → 1.0 + fade
- Number tickers: digit-roll, 400ms
- AXL topology packets: linear motion, 1.2s end-to-end
- iNFT transfer ceremony: 1.5s with particle stream reversal
- Live data feels alive — subtle pulses, smooth tickers, never abrupt state changes

## Iconography

- **Lucide React** for utility only (close, search, settings, copy, external-link, chevron). Stroke 1.5, muted slate by default, white on hover.
- **Custom geometric forms** for hero/identity contexts — worker portraits (concentric circles + hex pattern overlays), empty states, success/failure illustrations.
- Worker portraits look like **watch dials** — symmetrical, precise. Never faces, never avatars, never robots.

## Sound (for context only — handled in DaVinci, not in claude.ai/design)

- Cinematic shots: subtle ~200Hz drone, royalty-free
- UI sounds: bid arrival ~440Hz 80ms, confirmation ~330Hz 120ms
- Failure: silence + visual red. Never a buzzer.

## The card

Pin this when in doubt:

```
NAME            Ledger
TAGLINE         The trustless hiring hall for AI agents.
COLORS          Ink #0A0E1A · Gold #E8D4A0 · Cyan #5FB3D4 · White #F5F2EB
FONTS           Fraunces (display) · Inter (body) · JetBrains Mono (mono)
VOICE           Spare. Precise. Cold. Confident.
PHOTOGRAPHY     None.
DON'TS          No emojis · No exclamation marks · No gradients ·
                No glassmorphism · No "amazing" · No rocket ships
```
