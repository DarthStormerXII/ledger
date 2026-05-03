# Screen 2 — The Auction Room

Paste-ready brief for claude.ai/design.

---

## Purpose

The hero recording surface. Where bids happen live, the AXL mesh is visible, and the audience sees three workers competing in real time. Must feel cinematic, not utilitarian. This is the screen judges hold their eyes on.

## Primary action

Watch the auction settle. Operator passively observes; workers bid via AXL.

## Key data shown

- Job title, description, payout, bond, countdown
- Three worker bid cards (portrait, name, reputation, current bid, live AXL pulse)
- AXL topology view (3 nodes, animated packets)
- AXL message log (last 8 events)
- Network status indicators (AXL · 0G Galileo · ENS Resolver)

## Demo-critical state

This screen is the entire bidding section of the demo (≈0:35–1:35). Three frames matter:
1. The moment after **POST** — three cards just appeared, all bids dashed.
2. **Mid-bid** — three live cards, one in cyan-ring lead, packets flowing.
3. **Winner** — losing cards faded to 70% opacity, winner card stable with reputation tick incoming.

## Components needed

`JobHeader` · `WorkerBidCard` · `AXLTopologyView` · `AXLLogFeed` · `NetworkStatusBar` · `Pulse` · `DigitTicker`

## Accessibility

- AXL packet animation respects `prefers-reduced-motion` — packets fade in/out at endpoints instead of traversing.
- AXL log feed is a live region (`aria-live="polite"`) with rate limit (max 1 announcement / 800ms).
- Bid digit-roll respects reduced motion — snap to final value if set.
- Network status dots have non-color affordance (filled vs outlined ring).

## Layout

### 1. Top section — 160px

- **Left (70% width):**
  - Job title in Fraunces ExtraBold 32px white, letterspacing -0.02em (`Base Yield Scout`).
  - Job description below in Inter 14px Regular muted slate, max 2 lines, ellipsis: `Identify the 3 highest-APY USDC vaults on Base with TVL > $10M and audit history. Return JSON report with sources cited.`
- **Right (30% width), right-aligned, three stacked rows:**
  - Countdown `01:47` — JetBrains Mono 32px Bold cyan, tabular. When < 30s remaining, switches to warm amber `#D4A347`.
  - `PAYOUT  5.00 USDC` — caps-md label in muted slate, value in JetBrains Mono 14px pale gold tabular.
  - `BOND    0.50 USDC` — caps-md label in muted slate, value in JetBrains Mono 14px muted.
  - All three vertically aligned on the value column.

### 2. Center main — auto height

- Three worker bid cards in a row, 16px gap, each card 280px wide, 380px tall.
- 1px border `#272A35`, `#13151C` background, 4px radius, 24px internal padding.

**Card anatomy (each):**
- Top: circular worker portrait, 96px diameter, abstract geometric (concentric circles + hex overlay). Currently-winning worker's portrait has a 1.5px cyan ring with a slow breathing pulse (opacity 0.6 → 1.0 → 0.6, 2s). Other two: no ring.
- 16px below portrait: worker name center-aligned, Fraunces SemiBold 20px white (`fox.worker.<team>.eth`).
- 4px below: reputation row center-aligned, Inter 12px muted slate (`4.7★ · 47 jobs`).
- 24px below: current bid, center-aligned, Fraunces ExtraBold 36px pale gold tabular (`4.50`), with `USDC` suffix in JetBrains Mono 12px muted slate, baseline-aligned to the digits' baseline. Letterspacing -0.02em on the digits.
- Bottom of card: a thin animated cyan line, 2px tall, full card width minus 24px, "heartbeat" pulsing — 1.0 → 0.4 → 1.0 opacity over 1.2s linear. Represents live AXL connection.

**Behavior:**
- New bid arrival: card scales 0.97 → 1.00 (200ms ease-out), bid value digit-rolls to new figure (400ms).
- Currently-losing cards: 70% opacity to deemphasize.
- The cyan ring transfers to the new leader with a 200ms ease-out cross-fade if leadership changes.

### 3. Right rail — 320px wide, separated by 1px `#272A35` border

- **Header:** `AXL TOPOLOGY` — caps-md muted slate, 16px top padding, 24px horizontal.
- **Topology visualization** (240px tall, full rail width minus padding):
  - Three filled circles 16px diameter, arranged in an equilateral triangle pointing up (matches the brand mark geometry exactly).
  - Node labels below each: `us-west` · `eu-central` · `local` — caps-sm mono muted slate.
  - 1px lines between all three pairs of nodes; the bottom edge (between the two lower nodes) is dashed (4px on, 3px off) per the brand mark spec.
  - Cyan packets (4px filled circles) flow along lines in real time. Packet speed: 1.2s end-to-end. Multiple packets can be in flight. Linear motion, no easing.
- **AXL log feed** (rest of rail, scrolling, max 8 visible):
  - Each line: timestamp `12:47:32` + sender + arrow + receiver + colon + message type. JetBrains Mono 11px muted slate for timestamps, white for body, cyan for the message type token.
  - Example: `12:47:32  us-west → eu-central : BID`
  - 4px line height. New entries fade in from 0 → 100% opacity over 200ms; oldest fades out when the 9th lands.

### 4. Bottom status bar — 40px

- Full-width strip across the screen, 1px top border, `#0A0E1A` background.
- Three indicators evenly spaced left to right:
  - `[●] AXL · 3 nodes connected`
  - `[●] 0G GALILEO · ready`
  - `[●] ENS RESOLVER · live`
- Dot 8px diameter, success `#4A8B6F` filled when connected. Inter 12px Regular muted slate for the label, with the status word in white.

## Design principles to enforce

- The bidding cards are the hero. Spend extra detail on the card anatomy, bid animation, and cyan-ring transitions.
- AXL topology must look like an instrument readout, not a marketing diagram. Use the brand-mark geometry exactly.
- AXL log feed reinforces "this is real" — keep entries plausible (ms-precision timestamps, real peer names, plausible message types: BID · CONFIRM · HEARTBEAT · GOSSIP).
- One bold typographic moment: tied between the three live bids in 36px Fraunces. They share the moment because they're the moment.

## Iteration prompts to have ready

- "Slow the AXL packet animation by 50% (1.2s → 1.8s)."
- "Reduce worker card width from 280px to 240px and tighten internal padding to 16px."
- "Make the cyan ring on the leading card 2px instead of 1.5px."
- "Add a fourth AXL log line type: `RESULT_SUBMITTED` rendered in pale gold."
- "Crop the topology visualization to 200px tall and let the log feed take the extra 40px."
