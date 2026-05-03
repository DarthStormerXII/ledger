# Frame 3 — Inheritance Split-Screen (still composition)

The visual punchline of the demo. Held during 3:15–3:30 while VO says *"Same agent. Same name. Same reputation. New owner. Earnings flip mid-flight."* This is the frame a judge will remember as a still.

---

## Reference

Full screen anatomy: `design/screens/04_inheritance_modal.md`. This file specifies the held still composition for the **post-modal split-screen state** (after the transfer modal closes and the live operating UI shows the consequence).

## Composition target

A single-frame still that reads as **the law of the new economy** — assets carry value across owners; the agent doesn't notice the change.

The story in <1 second of glance:

> "The worker is unchanged in the middle. The old owner is fading out on the left. The new owner is receiving the next payment on the right. The ENS resolution flipped. Live. No migration."

## Frame anatomy

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌──────────────────┐ │
│  │ OWNER_A WALLET      │  │  WORKER iNFT CARD   │  │ OWNER_B WALLET   │ │
│  │ (fading 30% opacity)│  │   (unchanged)       │  │  (active)        │ │
│  │                     │  │                     │  │                  │ │
│  │ 0x742d…bEb1         │  │   ◉ (portrait)      │  │ 0x9c2e…f471      │ │
│  │                     │  │                     │  │                  │ │
│  │ Balance             │  │   worker-001        │  │ Balance          │ │
│  │ 4,521.00 USDC       │  │   .<team>.eth       │  │ 1,200.00 USDC    │ │
│  │ (frozen)            │  │                     │  │ +4.50 (rolling)  │ │
│  │                     │  │   47 jobs           │  │                  │ │
│  │ Last received       │  │   4.7 ★             │  │ Just received    │ │
│  │ 4.50 USDC           │  │                     │  │ 4.50 USDC        │ │
│  │ (4 min ago)         │  │   12,847.50 USDC    │  │ (just now · cyan)│ │
│  │                     │  │   earned            │  │                  │ │
│  └─────────────────────┘  └─────────────────────┘  └──────────────────┘ │
│                                                                         │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │ LIVE ENS RESOLUTION                                                │ │
│  │                                                                    │ │
│  │ who.worker-001.<team>.eth   →   0x9c2e…f471      [✓] VERIFIED      │ │
│  │ (rolled from 0x742d…bEb1 · 1.2s ago)                               │ │
│  │                                                                    │ │
│  │ no ENS transaction · no migration · CCIP-Read off-chain resolver   │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Layout

- Three-column layout, equal widths, 24px gap, 24px page padding.
- Below the columns: a 120px-tall ENS resolution panel spanning full width.
- Total frame height ≈ 720px at 1080p.

## Pixel-precise rules

### LEFT COLUMN — Owner_A wallet (fading)

- 1px `#272A35` border, `#13151C` background, 4px radius, 24px padding.
- Container at **30% opacity** (everything inside fades together).
- `OWNER_A WALLET` caps-md muted slate.
- Owner address `0x742d…bEb1` JetBrains Mono 14px white.
- `Balance` caps-sm muted, value `4,521.00 USDC` Fraunces ExtraBold 32px pale gold tabular, `USDC` suffix JetBrains Mono 12px muted baseline-aligned.
- `(frozen)` Inter 11px muted slate annotation.
- `Last received` caps-sm muted, value `4.50 USDC` Fraunces SemiBold 16px gold tabular.
- `4 min ago` Inter 11px muted slate.

### CENTER COLUMN — Worker iNFT card (unchanged)

- 1px `#272A35` border, `#13151C` background, 4px radius, 24px padding.
- Container at 100% opacity (the agent doesn't notice).
- 96px circular portrait, abstract geometric (concentric circles + hex overlay), cyan inner / gold outer accents.
- `worker-001.<team>.eth` Fraunces SemiBold 20px white tabular, center-aligned.
- Reputation row Inter 12px muted slate `47 jobs · 4.7 ★`.
- `12,847.50 USDC` Fraunces ExtraBold 24px pale gold tabular, `USDC` suffix JetBrains Mono 12px muted.
- Caption Inter 11px muted slate `total earned`.

### RIGHT COLUMN — Owner_B wallet (active, receiving)

- 1px `#272A35` border, `#13151C` background, 4px radius, 24px padding.
- Container at 100% opacity.
- A subtle 1px cyan inner border pulse on the whole card (frozen at 80% opacity for the still).
- `OWNER_B WALLET` caps-md muted slate.
- Owner address `0x9c2e…f471` JetBrains Mono 14px white.
- `Balance` caps-sm muted, value `1,200.00 USDC` Fraunces ExtraBold 32px pale gold tabular.
- Below the balance, on the same line, in cyan: `+4.50` Fraunces ExtraBold 32px cyan tabular, with a small upward arrow `↑` glyph.
- `(rolling)` Inter 11px muted slate annotation — the digit-roll is happening live; for the held still we freeze at the moment the roll has just completed and the cyan `+4.50` is still rendered.
- `Just received` caps-sm cyan, value `4.50 USDC` Fraunces SemiBold 16px gold tabular.
- `just now` Inter 11px cyan.

### BELOW — ENS resolution panel (full width)

- 120px tall, 1px top border `#272A35`, full page width, 24px horizontal padding.
- Header `LIVE ENS RESOLUTION` caps-md muted slate.
- Resolution row, JetBrains Mono 14px:
  - Left: `who.worker-001.<team>.eth` muted slate.
  - Arrow `→` muted slate.
  - Resolved value: `0x9c2e…f471` warm white. **The previous value `0x742d…bEb1` should NOT be visible at this point** — the ticker-roll has completed.
  - Right edge: small emerald `[✓] VERIFIED` pill, caps-sm mono.
- Annotation row Inter 11px muted slate: `(rolled from 0x742d…bEb1 · 1.2s ago)`.
- Caption row JetBrains Mono 11px muted slate: `no ENS transaction · no migration · CCIP-Read off-chain resolver`.

## Color discipline

| Element | Color |
|---|---|
| Owner_A column (faded) | 30% opacity over everything |
| Worker portrait inner | cyan |
| Worker portrait outer | pale gold |
| Worker name | warm white |
| Worker earnings (center column) | pale gold |
| Owner_B balance | pale gold |
| Owner_B `+4.50` delta | **cyan** (the only cyan number on a balance, makes the inflow legible at a glance) |
| Owner_B card border pulse | cyan, frozen at 80% |
| ENS resolution resolved value | warm white |
| ENS resolution `VERIFIED` pill | emerald |
| Background | deep ink `#0A0E1A` |

The choice to render Owner_B's `+4.50` delta in cyan rather than gold is deliberate: cyan = "live, in-flight, just happened." Gold = "stored value." The delta is a signal, not a balance — it earns the cyan.

## What MUST NOT appear

- No celebratory animation on the worker card — *the worker doesn't notice*. Stillness.
- No green checkmark explosion on the new owner's wallet.
- No "Transferred!" toast.
- No cursor.
- No browser chrome.
- No previous resolution value (`0x742d…`) lingering in the ENS panel — the ticker-roll has completed by the time we hold this frame.
- No motion lines / arrows between the three columns. The narrative is communicated by opacity (left) + cyan delta (right). No comic-book directional cues.

## What the camera does

Static hold for 3 seconds. **No move.** The columns are the move — left fades, center holds, right activates — and the camera being still is what makes the composition feel inevitable, not theatrical.

In post: the cyan `+4.50` on the right column has a single 200ms inner glow pulse just before the hold begins (matching the modal's exit), then frozen for the duration of the hold.

## Why this composition works

- **The center is unchanged.** That is the entire thesis: agents are property; the agent doesn't notice the change of owner. By holding the worker card identical to its pre-transfer state, the still says it without words.
- **Opacity does the work color usually does.** Owner_A is fading, not red, not crossed-out — fading. Honest, restrained.
- **The cyan delta on the right is the punchline number.** It's small (32px) but it's the only cyan numeric value on a balance anywhere in the product. That singularity is what makes it legible.
- **The ENS resolution panel underneath converts the visual claim to a verifiable claim.** Judges who want proof get it inline.
- **Three-column symmetry mirrors the AXL topology** — 3 nodes, 3 wallets. The visual language of the product holds across surfaces.
