# Screen 4 — The Inheritance Modal

Paste-ready brief for claude.ai/design.

---

## Purpose

The visual climax of the demo. When an iNFT transfers, this modal opens, runs a 1.5-second ceremonial particle reversal, then re-resolves `who.*` live and the address ticker-rolls from old owner to new owner. Stillness over spectacle — feel like a notary's office, not a fireworks show.

## Primary action

Confirm transfer. Secondary: cancel.

## Key data shown

- Worker portrait (centered, calm)
- FROM (old owner address) — fading
- TO (new owner address) — solid, intensifying
- Live ENS resolution panel showing `who.<agent>.<team>.eth` post-transfer flip
- Sale price, network fee, settlement chain

## Demo-critical state

This is **frame 3** of the 3 frame-worthy stills (see `design/frames/03_inheritance_split_screen.md`). The held still composition for the demo:
- Old wallet fading on the left
- Worker iNFT card unchanged in the center showing `47 jobs · 4.7 rating`
- New wallet receiving `+4.50 USDC` (digit-rolling) on the right
- ENS resolution panel below ticker-rolls `who.*` from Owner_A → Owner_B

The split-screen state is what's recorded — the modal itself is the trigger surface, the split-screen is the payoff. Both must be designed.

## Components needed

`ModalShell` · `WorkerPortrait` · `AddressDisplay` · `ParticleStream` (left + right) · `ENSResolutionPanel` · `DigitTicker` · `SummaryCard` · `ButtonPrimary` · `ButtonGhost` · `VerifyDrawer`

## Accessibility

- Modal trap-focus + ESC-to-cancel (only before confirm — disabled during the 1.5s ceremony).
- Particle streams respect `prefers-reduced-motion` — fall back to a soft cross-fade between FROM and TO addresses with no particles.
- Live resolution panel's ticker-roll respects reduced motion — snaps to final value.
- Backdrop dim is `rgba(10, 14, 26, 0.8)` (deep ink at 80%); below it the page is non-interactive but visible.
- Confirmation button has `aria-busy` during the transfer.

## Layout — full-screen takeover

- 80% backdrop dim, page underneath visible but non-interactive.
- Centered modal, max-width 720px, auto height, `#1A1D26` background, 1px `#272A35` border, 8px radius (slightly more than buttons for hierarchy). No drop shadow.

### 1. Top of modal — 80px

- Title: `TRANSFER WORKER` — Fraunces ExtraBold 24px white, letterspacing -0.01em, 24px padding from modal edge.
- Below: subtitle `All future earnings flow to the new owner.` — Inter 14px Regular muted slate.

### 2. Center section — 480px

- **Center:** worker portrait, 240×240px, with a slow breathing pulse (opacity 0.95 → 1.0 → 0.95, 2.5s).
- **Above portrait, top 80px:**
  - `FROM` label — caps-sm mono muted slate, center-aligned.
  - Old owner address below in JetBrains Mono 16px white, center-aligned.
  - During the 1.5s ceremony, the address fades to 30% opacity (linear).
- **Below portrait, bottom 80px:**
  - `TO` label — caps-sm mono cyan, center-aligned.
  - New owner address below in JetBrains Mono 16px white, center-aligned.
  - During the 1.5s ceremony, the TO block scales 0.97 → 1.00 and the address opacity goes 0 → 1.0.
- **Particle streams on either side of the portrait:**
  - LEFT (from portrait toward old owner address): pale gold `#E8D4A0` particles 2px diameter, vertical drift, fading and slowing — opacity 0.8 → 0.0 over 1.5s.
  - RIGHT (from portrait toward new owner address): pale gold particles 2px, vertical drift, intensifying and accelerating — opacity 0 → 0.8 + speed 0 → full over 1.5s.
  - Particle direction is the story: at t=0 they flow LEFT, by t=0.75s they're transitioning, by t=1.5s they flow RIGHT entirely. This is the punchline.

### 3. Live ENS resolution panel — 240px height, full modal width

Sits between the particle streams area and the summary card. 1px top border `#272A35`.

- Header: `LIVE ENS RESOLUTION` — caps-md muted slate, 16px padding from edge.
- Single row showing `who.<agent>.<team>.eth` resolving live:
  - Pre-transfer: resolves to old owner's address. JetBrains Mono 14px white. Fades to 30% opacity during the 1.5s ceremony.
  - Post-transfer (after on-chain confirmation fires the refresh trigger): the address ticker-rolls digit-by-digit (400ms) from old owner to new owner. New owner address renders solid white, JetBrains Mono 14px.
- Caption below the row: `no ENS transaction · no migration · CCIP-Read off-chain resolver follows ownerOf()` — JetBrains Mono 11px muted slate.
- Right edge: small `Verify` pill (cyan text-only). Click opens an inline drawer (modal-over-modal) with raw resolver gateway response, signed payload (per ENSIP-10), and gateway host.

### 4. Bottom section — 160px

- **Summary card** — `#13151C` background, 1px subtle inner border, 4px radius, 16px padding, 24px from modal edge:
  - Three rows, 32px tall each, evenly distributed:
    - `Sale price` (Inter 14px muted left) ............ `1,000.00 USDC` (JetBrains Mono 14px pale gold right tabular)
    - `Network fee` (Inter 14px muted left) ........... `≈ 0.0024 USDC` (JetBrains Mono 14px muted right)
    - `Settles on` (Inter 14px muted left) ............ `0G Galileo Testnet · ChainID 16602 [✓]` (Inter 14px white right, with a small cyan checkmark)
- **Below the card, two centered buttons** with 16px gap, 16px vertical padding:
  - `Confirm Transfer` — cyan filled, 44px tall, 160px wide, Inter SemiBold 14px, 4px radius.
  - `Cancel` — text-only muted slate, hover white.

## State change — after Confirm pressed

1. Both buttons replaced with `Transferring…` text + a small loading indicator (spinning 1px ring 16px diameter, cyan).
2. Modal applies a soft cyan glow pulse — `box-shadow: 0 0 0 1px rgba(95, 179, 212, 0.3)` breathing 0 → 1.0 → 0 over 2s. (One-time exception to the no-glow rule — only for this confirm state, only in this modal.)
3. Particle streams begin reversing over 1.5s.
4. On on-chain confirmation: `Live ENS Resolution` panel re-resolves `who.*`. Address ticker-rolls 400ms from old → new.
5. Buttons replaced with a single `Transferred` line in success emerald + a 16px emerald checkmark, Inter SemiBold 14px.
6. Modal auto-closes 1.5s after the flip.

## Design principles to enforce

- This screen has more theatrical animation budget than any other in the product. Spend it on the particle reversal AND the live `who.*` flip — they are the visual punchline together.
- Slow timing — 1.5s, not 400ms. Ceremonial.
- Stillness over spectacle. No celebratory effects. The ticker-roll is the celebration.
- After confirmation, the success state should be SATISFYING — slow pulse + ticker-roll, not a snappy snap-checkmark.
- Old owner address fades, doesn't disappear. New owner appears, doesn't pop.

## Iteration prompts to have ready

- "Slow particle reversal from 1.5s to 1.8s; lock the ticker-roll at 400ms unchanged."
- "Drop the cyan glow on confirm — the ring border is enough."
- "Tighten summary card row height from 32px to 28px."
- "Replace the loading indicator with three breathing dots in cyan."
- "Make the FROM and TO labels caps-md instead of caps-sm so they read at the back of the room."
