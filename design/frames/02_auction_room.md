# Frame 2 — Auction Room (still composition)

The frame held during the bidding crescendo (≈1:10–1:20 of the demo). Three workers bidding live, AXL packets in flight, log feed scrolling. Must read at a glance as: *real workers · real network · real auction*.

---

## Reference

Full screen anatomy: `design/screens/02_auction_room.md`. This file specifies the held still composition.

## Composition target

A single-frame still that reads as **the moment before settlement** — when a judge says, "okay, this is real."

The story in <1 second of glance:

> "Three AI workers are bidding on a real job over a real peer-to-peer mesh. The cheapest one is winning. The auction has 1:47 remaining."

## Frame anatomy

```
┌────────────────────────────────────────────────────────────────────────┐
│                                                                        │
│  Base Yield Scout                            01:47   (cyan mono 32)    │
│  Identify the 3 highest-APY USDC vaults …    PAYOUT  5.00 USDC         │
│                                              BOND    0.50 USDC         │
│                                                                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │              │
│  │   ◉ (cyan)   │  │      ◉       │  │      ◉       │  │ AXL TOPOLOGY │
│  │              │  │              │  │              │  │              │
│  │              │  │              │  │              │  │     ●        │
│  │  fox.worker  │  │  owl.worker  │  │  jay.worker  │  │    /·\       │
│  │  4.7★ · 47   │  │  4.5★ · 31   │  │  4.6★ · 24   │  │   ●---●  (·) │
│  │              │  │              │  │              │  │              │
│  │   4.50 USDC  │  │   4.60 USDC  │  │   4.80 USDC  │  │ us-w  eu-c   │
│  │              │  │              │  │              │  │      local   │
│  │  ──────────  │  │  ──────────  │  │  ──────────  │  │              │
│  └──────────────┘  └──────────────┘  └──────────────┘  │ 12:47:32     │
│   (cyan ring)       (70% opacity)    (70% opacity)     │ us-w → eu-c  │
│                                                        │   : BID      │
│                                                        │ 12:47:31     │
│                                                        │ local → eu-c │
│                                                        │   : BID      │
│                                                        │ 12:47:30     │
│                                                        │ eu-c → all   │
│                                                        │   : GOSSIP   │
│                                                        │ 12:47:29     │
│                                                        │ us-w → eu-c  │
│                                                        │   : BID      │
│                                                        │              │
│  [●] AXL · 3 nodes connected   [●] 0G GALILEO · ready  [●] ENS · live │
└────────────────────────────────────────────────────────────────────────┘
```

## Pixel-precise rules

- **Job title:** Fraunces ExtraBold 32px white `Base Yield Scout`. Description below in Inter 14px Regular muted, 2-line max with ellipsis.
- **Countdown:** JetBrains Mono Bold 32px cyan `01:47`. Right side of header. Tabular.
- **PAYOUT and BOND:** caps-md mono muted labels with values right-aligned in JetBrains Mono 14px (gold for PAYOUT, muted for BOND).
- **Three worker cards:** 280×380px each, 16px gap, equal vertical alignment. Card 1 is the leader: 1.5px cyan ring around the 96px portrait, 100% opacity. Cards 2 and 3 at 70% opacity.
- **Worker portrait:** abstract geometric (concentric circles + hex overlay). For frame purity each worker has a slightly different hex angle (0°, 30°, 60°) — gives the row visual rhythm.
- **Worker name:** Fraunces SemiBold 20px white center-aligned (`fox.worker.<team>.eth`).
- **Reputation row:** Inter 12px muted slate (`4.7★ · 47 jobs`).
- **Bid value:** Fraunces ExtraBold 36px pale gold tabular, with `USDC` suffix JetBrains Mono 12px muted slate baseline-aligned.
- **Heartbeat line:** 2px tall cyan, full card width minus 24px, **frozen at 80% opacity** for the still — in motion the line breathes, but for the held composition we freeze it on a brighter frame.
- **AXL topology:** 3 filled cyan circles arranged as an upward equilateral triangle (matching the brand mark). Solid 1px lines top edges, dashed 1px line bottom edge. **Two cyan packets in flight** for the still — one mid-flight on the us-w → eu-c line, one mid-flight on the local → eu-c line.
- **Topology labels:** caps-sm mono muted slate.
- **AXL log feed:** 4 visible entries, JetBrains Mono 11px. Each: timestamp muted slate, addresses white, message type cyan. Most recent at top.
- **Network status bar:** 40px tall, three indicators evenly spaced, 8px emerald dots, Inter 12px Regular muted slate labels with white status words.

## Color discipline

| Element | Color |
|---|---|
| Job title | warm white |
| Countdown | cyan `#5FB3D4` |
| PAYOUT value | pale gold `#E8D4A0` |
| BOND value | muted slate |
| Card 1 portrait ring | cyan |
| Cards 2, 3 (losing) | 70% opacity overlay |
| Bid values | pale gold |
| Heartbeat lines | cyan |
| Topology nodes | cyan |
| Topology bottom edge (dashed) | cyan |
| Topology top edges (solid) | warm white at 60% opacity |
| Topology packets | cyan |
| Log message types | cyan |
| Network status dots | emerald `#4A8B6F` |
| Background | deep ink `#0A0E1A` |

Gold appears only on PAYOUT and the three bid values. Even at three bids, gold is restrained — losing-card bids fade to 70% which dampens the gold visually so the leader's `4.50 USDC` reads strongest.

## What MUST NOT appear

- No hover states on the cards
- No cursor
- No browser chrome
- No copy tooltips
- No "you are bidder N" overlay (we are observer here)
- No "Auction ends in" repeat above the countdown — the countdown alone says it
- No additional CTA below the cards

## What the camera does

Static hold for 3 seconds. **No camera move.** This frame is the moment of decision; movement would undercut it.

In post: a subtle 1px cyan flicker on the heartbeat lines stays — this is "live" energy without breaking the stillness rule. Reduced-motion fallback: the flicker becomes static.

## Why this composition works

- **The geometry of the topology view echoes the brand mark** — judges who notice get a small "ah."
- **The cyan ring on Card 1 is the only "winner" affordance needed** — no banner, no badge, no crown.
- **70% opacity on losing cards is restrained** — they're not gone, just deemphasized. Honest.
- **The log feed is what convinces engineers** — real timestamps, real peer routes, real message types. Plausibility through specificity.
- **The dashed bottom edge of the topology** mirrors the live AXL packet flow on that link — the brand mark literalized.
