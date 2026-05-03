# Frame 1 — Worker Profile (still composition)

The frame held during 2:00–2:15 of the demo while VO recites *"Forty-seven jobs. Four-point-seven rating. Twelve thousand USDC earned. An identity that resolves live, on-chain."* Must look like a Stripe Press book cover.

---

## Reference

Full screen anatomy: `design/screens/03_worker_profile.md`. This file specifies the held still composition — the frozen frame a judge can study.

## Composition target

A single-frame still that reads as **institutional luxury, not consumer crypto** even when paused on a frame grab. The story it must tell in <1 second of glance:

> "This is a worker. It has a permanent ENS identity. It has 47 jobs of history. It earns money. Its capabilities resolve live. The reasoning is attested under TEE."

## Frame anatomy

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│   worker-001.<team>.eth                            (96px Fraunces) │
│   ──────────────────────                                         │
│                                                                  │
│   ┌──────────────┐    ┌────────────────────────────────────┐    │
│   │              │    │ CAPABILITY TREE                    │    │
│   │   PORTRAIT   │    │ WHO.*   0x742d…bEb1     [Verify]   │    │
│   │   240×240    │    │ PAY.*   0x9c2e…f471 @0  [Verify]   │    │
│   │   (watch     │    │         0x33ad…b0e2 @1             │    │
│   │    dial)     │    │ TX.*    bafyb…7e3p      [Verify]   │    │
│   │              │    │ REP.*   ★4.7 · 47 records [Verify] │    │
│   └──────────────┘    │ MEM.*   bafkr…81rt      [Verify]   │    │
│                       │ ┌──────────────────────────────┐   │    │
│   0x742d…bEb1         │ │ 0G COMPUTE · TEE ATTESTATION │   │    │
│                       │ │ 0x9a4f…ec21         ✓ VERIFIED │   │    │
│   [ERC-7857] [GALILEO]│ └──────────────────────────────┘   │    │
│   [● ACTIVE]          └────────────────────────────────────┘    │
│                                                                  │
│   ┌─────────┬─────────┬────────────────┬──────────┐             │
│   │ JOBS    │ RATING  │ EARNINGS       │ DAYS     │             │
│   │  47     │  4.7★   │ 12,847.50 USDC │   14     │             │
│   └─────────┴─────────┴────────────────┴──────────┘             │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## Pixel-precise rules

- **ENS name:** Fraunces Black 96px, letterspacing -0.03em, warm white `#F5F2EB`, tabular nums on the digits. Top of frame, 24px from top edge, 24px from left edge.
- **Portrait:** 240×240px, abstract geometric. **Concentric circles only** — drop the hex pattern overlay for this still (the hex adds noise; we want watch-dial purity). Cyan inner ring, gold outer ring, ink fill, single 1px subtle radial line at 30°.
- **Capability tree:** five rows perfectly aligned on the resolved value column. Latency pills HIDDEN for this still (they jitter and add noise on a frozen frame).
- **TEE attestation badge:** inset card 320×64px, 1px cyan `#5FB3D4` border (raised from default to make it more legible at hold), digest `0x9a4f…ec21` mono 14px white, `✓ VERIFIED` caps-md emerald `#4A8B6F` to its right.
- **Stats grid:** 4 cells equal width, each 1px bordered. The earnings cell is the only gold on the entire frame — `12,847.50 USDC` in Fraunces ExtraBold 48px pale gold tabular, with `USDC` in JetBrains Mono 14px muted gold-dim baseline-aligned.
- **Reputation chart:** **HIDDEN below the fold** for this still. The fold is the bottom of the stats grid.
- **No motion in this still:** breathing portrait pulse, ACTIVE pulse dot, AXL particles — all FROZEN at their median state for the still composition. (In the live demo the motion is fine; for the held-frame composition we want stillness.)

## Color discipline (gold appears only here)

| Element | Color |
|---|---|
| ENS name | warm white `#F5F2EB` |
| Portrait inner detail | cyan `#5FB3D4` |
| Portrait outer detail | pale gold `#E8D4A0` |
| Capability tree namespace tags (`WHO.*`, `PAY.*`, etc.) | cyan |
| Capability tree resolved values | warm white |
| TEE attestation digest | warm white on cyan border |
| Stat values 1, 2, 4 | warm white |
| Stat value 3 (earnings) | pale gold |
| Pills | cyan / gold / emerald borders, 1px |
| Background | deep ink `#0A0E1A` |

## What MUST NOT appear in this frame

- No reputation chart (below fold)
- No job history table (below fold)
- No right rail (cropped out)
- No copy tooltip overlays
- No browser chrome (recording crop excludes window chrome)
- No cursor
- No hover states on capability tree rows
- No latency pills

## What the camera does

Slow push-in over 3 seconds: from 100% scale at the start of the hold to 102% scale at the end. Subtle. Makes the still feel alive without breaking the stillness rule. Easing: linear over the 3 seconds — no ease-in/out (ease creates a pulsing feel that competes with the data).

## Why this composition works

- **One typographic moment:** the 96px ENS name. Everything else supports it.
- **One color moment:** the gold earnings. Everything else is white/cyan/muted.
- **Density without clutter:** every block answers a different question (who · what · how skilled · how much).
- **Proof is visible:** the TEE attestation badge is on screen — judges can see the digest while the VO is still talking.
- **Restraint:** at this scale the worker portrait reads as mark, not illustration. A face would have wrecked it.
