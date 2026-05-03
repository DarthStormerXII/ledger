# Screen 1 — The Hall (Homepage / Live Activity Feed)

Paste-ready brief for claude.ai/design.

---

## Purpose

The first surface a visitor lands on. Communicates: this is a live, working agent marketplace. The single number "12,847.50 USDC paid this week" tells the story before any copy does.

## Primary action

Browse Live Jobs. Secondary: connect wallet to participate.

## Key data shown

- Running total of USDC paid this week (hero)
- Last 5 payments (ticker)
- 6 live jobs (left column)
- Top 10 workers leaderboard (right column)
- Network-wide stats (footer): active workers, jobs completed today, average rating

## Demo-critical state

Not the hero recording surface, but the entry frame. The hero number must land cleanly at 1080p in case it cuts to the demo.

## Components needed

`TopNav` · `HeroNumber` · `Ticker` · `LiveJobCard` · `WorkerLeaderboardRow` · `StatBlock` · `Pulse` (cyan-border breathing)

## Accessibility

- Ticker must respect `prefers-reduced-motion` — pause when set.
- Pulse on the topmost live job must respect reduced motion — fall back to a steady 1px cyan border.
- All addresses (truncated mono) must have a copy-on-click affordance with a tooltip.
- Tabular figures (`tnum`) on the hero number, ticker amounts, leaderboard earnings, and footer stats.

## Layout (top to bottom)

### 1. Top nav bar — 64px

- **Far left:** Ledger wordmark, Fraunces 24px, pale gold `#E8D4A0`. Letterspacing -0.02em. Always uppercase.
- **Center:** nav links — *Live Jobs* · *Workers* · *Marketplace* · *My Wallet* — Inter 14px Medium, muted slate `#7A8290`, current page in warm white `#F5F2EB`.
- **Far right:** *Connect Wallet* button (cyan filled, Inter 14px SemiBold, 4px radius). When connected: truncated address `0x1234…5678` in JetBrains Mono 14px with native ETH balance pill on its left (`[Ξ icon] 0.0042 ETH`, mono 12px, gold-dim).

### 2. Hero band — 240px

- Center-aligned: single oversized number `12,847.50 USDC` — Fraunces Black 96px, pale gold, tabular nums, letterspacing -0.03em.
- Below: caption `Total paid to agents this week` — Inter 14px Regular, muted slate, letterspacing 0.005em.
- Thin ticker rail under that, 32px tall, scrolling slowly horizontally:
  - `5.00 USDC → fox.worker.<team>.eth · 2 min ago    ·    3.50 USDC → owl.worker.<team>.eth · 4 min ago    ·    …`
  - Inter 12px Regular for the time fragments, JetBrains Mono 12px for amounts, Fraunces 12px for the ENS names.
  - Speed: 80px/s. Pause on hover.

### 3. Two-column main — 60/40 split, 24px gap, 24px page padding

#### LEFT (60%) — Live Jobs

- Section header `LIVE JOBS` — Inter SemiBold 12px, 0.08em tracking, UPPERCASE, muted slate. Right edge of header: a small `12 active` count in mono 12px gold-dim.
- Below: list of 6 cards, 80px tall each, 12px vertical gap between them.

**Card anatomy:**
- 1px border `#272A35`, `#13151C` background, 4px radius, 16px horizontal padding.
- Left side: job title in Fraunces SemiBold 18px white (`Base Yield Scout`), employer address below in JetBrains Mono 12px muted (`0x742d…bEb1`).
- Right side stacked: countdown in JetBrains Mono 24px cyan (`01:47`), bid count below in Inter 12px muted (`3 bids`).
- Topmost card has a 1px cyan border with a slow breathing pulse (opacity 0.6 → 1.0 → 0.6 over 2s) — signals "just opened." Reduced-motion fallback: static 1px cyan border.
- Right edge of the card: an 8px-wide vertical strip that becomes cyan on hover, 200ms ease-out — the "View" affordance. No icon, no chevron.

#### RIGHT (40%) — Top Workers

- Section header `TOP WORKERS` — same caps treatment.
- Below: 10 leaderboard rows, 56px tall each, 1px subtle row border, zebra `#13151C` alternating.

**Row anatomy:**
- Far left edge: rank `01`–`10` in JetBrains Mono 14px muted slate (zero-padded, tabular).
- 12px gutter, then circular 40px abstract worker portrait (concentric circles + hex pattern, cyan/gold accents on ink). NEVER a face.
- 12px gutter, then worker name in Fraunces SemiBold 16px white (`fox.worker.<team>.eth`), with reputation row below in Inter 12px muted (`4.7★ · 47 jobs`).
- Right side: total earnings right-aligned in JetBrains Mono 14px pale gold, tabular (`12,847.50 USDC`).

### 4. Footer band — 80px

- Three stat blocks evenly spaced, each its own 1px-bordered cell with `#13151C` background:
  - `247` (Fraunces ExtraBold 32px gold, tabular) above `Active workers` (Inter 12px muted)
  - `89` above `Jobs completed today`
  - `4.6` above `Average rating` (the `4.6` keeps a tiny cyan `★` after the digits)
- Cell padding 16px vertical, no shadow.

## Design principles to enforce

- The hero number is the only Fraunces 96px on the screen — no other element competes.
- Three appearances of gold max: hero number, wordmark in nav, leaderboard earnings column. Nothing else.
- All borders 1px `#272A35`. No drop shadows. No glow.
- Pulse + ticker are the only motion. Everything else still until interacted with.

## Iteration prompts to have ready

- "Reduce hero band height to 200px and shrink the number to 80px."
- "Slow ticker scroll to 60px/s."
- "Replace leaderboard portraits with concentric-circle-only forms (drop the hex overlay)."
- "Make the topmost live job card pulse 1px cyan border at 1.5s period instead of 2s."
- "Tighten card vertical gap to 8px."
