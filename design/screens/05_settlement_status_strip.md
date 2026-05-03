# Screen 5 — Settlement Status Strip

Paste-ready brief for claude.ai/design. This is a **component**, not a full page.

---

## Purpose

The trust surface. Every settlement leg is independently verifiable on-chain; this strip never lies about which legs are settled. Used in two contexts:
- (a) Inline in the Auction Room after a job completes
- (b) At the top of the Worker Profile when a new job has just settled

## Primary action

None — informational. Each leg has a click affordance to open the relevant block explorer in a new tab.

## Key data shown

Three settlement legs:
1. `USDC PAID ON BASE` → tx hash on Base Sepolia
2. `REPUTATION RECORDED ON BASE` → ERC-8004 `ReputationRegistry` (`0x8004B663…`) feedback record tx hash on Base Sepolia
3. `0G STORAGE CID UPDATED` → 0G Storage CID for the worker's updated memory pointer

## Demo-critical state

The "PENDING_RECONCILE" state matters for credibility — when the architect says "two-phase commit, eventually consistent within ~10s", this strip is the UI proof of that. During the demo, judges should briefly see one leg in pending before all three flip to settled.

## Components needed

`SettlementStrip` · `SettlementLeg` · `StatusDot` · `ExternalLink` · `StatePill` · `Spinner`

## Accessibility

- Strip is a live region (`aria-live="polite"`) — announces leg flips at most every 800ms.
- Status dots have shape distinction in addition to color: filled dot for settled, outlined ring for pending, slashed dot for failed.
- All hashes/CIDs are mono and copyable (click to copy with toast). The `↗` external-link affordance is keyboard-focusable separately.
- The state pill has explicit text — never icon-only.

## Layout

### Container

- Full width of parent.
- 56px height — strict.
- 1px subtle border `#272A35` (top + bottom; if used inline at the top of a page, use bottom border only).
- Background `#0A0E1A`.
- No corner radius — flush.
- 24px horizontal padding.
- 0 vertical padding — content vertically centered.

### Three settlement legs — evenly spaced across the strip

Each leg is a small horizontal group, vertically centered:

```
[●]  USDC PAID ON BASE      0x9a4f…ec21  ↗
```

**Per-leg anatomy (left to right):**

- **Status dot** — 8px circle, 4px right margin:
  - Settled: filled, success `#4A8B6F`.
  - Pending: outlined ring 1.5px, warning `#D4A347`, with a slow rotation (1s linear).
  - Failed: filled with a thin diagonal slash, danger `#C97064`.
- **Leg label** — caps-sm Inter SemiBold 11px muted slate, 0.10em tracking, UPPERCASE:
  - `USDC PAID ON BASE`
  - `REPUTATION RECORDED ON BASE`
  - `0G STORAGE CID UPDATED`
- **8px gap.**
- **Leg detail** — JetBrains Mono 12px white, truncated middle (`0x9a4f…ec21` for hashes, `bafy…7e3p` for CIDs). When no value yet (pending): single `—` em dash in muted slate.
- **4px gap.**
- **External-link affordance** — Lucide `arrow-up-right` 12px muted slate, hover white, 200ms ease-out. Click opens the relevant explorer in a new tab:
  - Legs 1 & 2 → BaseScan Sepolia
  - Leg 3 → 0G Storage explorer (or a fallback CID-resolver page)

### Right edge of the strip — single state pill

- Vertically centered, 0 right margin (flush to padding).
- Pill: 28px tall, auto width, 4px radius, 1px border, 12px horizontal padding inside.
- Three states:
  - **All three legs settled** → `SETTLED` pill, emerald `#4A8B6F` 1px border, emerald text, caps-sm mono.
  - **Any leg pending** → `PENDING_RECONCILE` pill, warning `#D4A347` 1px border, warning text, caps-sm mono, with a small 12px spinner (1px ring, 1s rotation) on the left of the label.
  - **Any leg failed** → `RECONCILE_FAILED` pill, danger `#C97064` 1px border, danger text, caps-sm mono.

## Subtle behavior

- When a leg flips from pending → settled: the dot scales 0.95 → 1.0 (200ms ease-out) AND the detail text ticker-rolls in the new value digit-by-digit (400ms).
- When the state pill flips from `PENDING_RECONCILE` → `SETTLED`: the pill border ticks emerald 200ms ease-out, the spinner exits with a fade.
- Hover on any leg: the entire group lifts opacity 1.0 (from 0.95 default), the external-link arrow nudges 1px up + 1px right (200ms ease-out).

## Design principles to enforce

- **Never collapse the three legs into one `✓ settled` summary.** Judges need to see the multi-chain coordination explicitly. This is the UI proof that "two-phase commit" isn't hand-waving.
- **Mono everywhere for hashes and CIDs.** No body font ever on a hash.
- **The PENDING_RECONCILE state is honest UI** — if reputation is recorded but the 0G Storage CID hasn't propagated yet, the strip says so. Don't lie.
- **No gold anywhere on this strip** — it is not a money surface, it is a proof surface.

## Iteration prompts to have ready

- "Drop strip height from 56px to 48px; tighten leg label to 10px."
- "Replace the slashed-dot for failed with a hollow-ring + cross icon."
- "Add a `RECONCILE_RETRY` state — same look as PENDING_RECONCILE but the spinner is dotted instead of solid."
- "Inline-context variant: drop the top border, keep the bottom; reduce side padding to 16px."
- "Make the truncated-middle hash format show 6 chars on each side instead of 4."
