# Screen 3 — Worker Profile (`/agent/<ens-name>`)

Paste-ready brief for claude.ai/design.

---

## Purpose

The detail page for a single iNFT worker. Demo holds on this screen for ≈15 seconds while VO recites *"Forty-seven jobs. Four-point-seven rating. Twelve thousand USDC earned."* Replaces what would be a "cinematic crystal" visual — the actual iNFT IS the data.

## Primary action

For the owner: list for sale. For non-owners: make offer (or copy address).

## Key data shown

- ENS name (the bold typographic moment)
- Worker portrait
- Capability tree (5 namespaces resolving live)
- Owner address + chain context pills
- Stats grid (jobs, rating, earnings, days active)
- Reputation chart over time
- Recent jobs table
- Ownership history
- 0G Compute TEE attestation digest (inset badge)

## Demo-critical state

The slow camera-push frame at 2:00–2:15 holds on this surface. Frame composition matters:
- ENS name `worker-001.<team>.eth` in 96px Fraunces white at the top
- Capability tree visible on the right
- Attestation digest badge inset
- Stats grid below shows `47 · 4.7 · 12,847.50 USDC · 14`

This is **frame 1** of the 3 frame-worthy stills (see `design/frames/01_worker_profile.md`).

## Components needed

`ENSNameDisplay` · `WorkerPortrait` · `CapabilityTreeInline` (compact mirror of Screen 6) · `ChainPill` · `StatusPill` · `StatCell` · `ReputationChart` · `JobHistoryTable` · `OwnershipCard` · `OwnershipHistoryCard` · `AttestationBadge`

## Accessibility

- ENS name has a copy-on-click affordance with tooltip; aria-label `Copy worker ENS name`.
- Capability tree rows have keyboard focus + Enter expands the verify drawer.
- Reputation chart has a tabular fallback view (toggle in card header) — never chart-only.
- Stats grid values are tabular nums, screen-reader text includes the label ("Jobs completed: 47").
- Pills: filled-circle vs outlined-ring distinguishes status, not color alone.

## Layout

### 1. Top header section — 400px

- **Top of header, full width**, 24px page padding:
  - The worker's ENS name in Fraunces Black 96px white tabular, letterspacing -0.03em: `worker-001.<team>.eth`.
  - **Copy affordance:** clicking the name copies the full ENS name; a small `Copied` toast appears bottom-right.
  - This is the bold typographic moment — replaces the previous 64px treatment.

- **Below the ENS name, two-column layout** (40% / 60%, 24px gap):
  - **LEFT — Worker portrait (40% width):**
    - 240×240px abstract geometric portrait. Watch-dial energy: concentric circles, symmetrical hex-pattern overlay, cyan and gold accents on ink.
    - 24px below portrait: current owner address in JetBrains Mono 14px muted slate, with copy affordance: `0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1`.
    - 12px below: row of three pill badges, 8px gap:
      - `ERC-7857 · 0G iNFT DRAFT` — caps-sm mono, 1px cyan border, 6px radius.
      - `0G GALILEO · 16602` — caps-sm mono, 1px gold border.
      - `[●] ACTIVE` — caps-sm mono, 1px emerald border, with a small breathing emerald dot.
  - **RIGHT — Capability tree inline (60% width):**
    - Header `CAPABILITY TREE` — caps-md muted slate.
    - Five stacked rows, 56px each:
      - Row anatomy: namespace name in caps-sm mono cyan on the left (e.g. `WHO.*`), resolved value in JetBrains Mono 14px white center, small `Verify` pill on the right (cyan text-only button).
      - The `pay.*` row shows last two rotated addresses, each tagged with their HD-derivation nonce (`@ nonce 0`, `@ nonce 1`).
    - Below the rows: small inset card 64px tall — the **TEE attestation badge**:
      - Header caps-sm muted slate: `0G COMPUTE · TEE ATTESTATION`.
      - Body: digest hash truncated middle (`0x9a4f…ec21`) in JetBrains Mono 11px white, with a faint 1px cyan border around the badge container, and a small emerald checkmark + caps-sm `VERIFIED` to the right.
      - Hover: tooltip reveals full hash; clicking copies it.

### 2. Stats grid — 160px height, 4 columns equal width

Each cell its own 1px `#272A35`-bordered container, `#13151C` background, 24px padding.

| Cell | Label (caps-sm mono muted) | Value |
|---|---|---|
| 1 | `JOBS COMPLETED` | `47` — Fraunces ExtraBold 48px white tabular |
| 2 | `AVG RATING` | `4.7★` — Fraunces ExtraBold 48px white tabular, `★` in cyan, smaller (24px) and baseline-aligned |
| 3 | `TOTAL EARNINGS` | `12,847.50 USDC` — Fraunces ExtraBold 48px pale gold tabular, `USDC` suffix in JetBrains Mono 14px muted, baseline-aligned |
| 4 | `DAYS ACTIVE` | `14` — Fraunces ExtraBold 48px white tabular |

This is the only place gold appears on the page — money is sacred.

### 3. Reputation chart section — 240px height

- Header: `REPUTATION HISTORY` — caps-md muted slate. Right edge: tabular toggle (icon-only Lucide `table` 16px).
- Line chart: cyan `#5FB3D4` 1.5px line on `#0A0E1A` background, very faint `#13151C` grid, JetBrains Mono 11px axis labels (dates X, ratings 0–5 Y).
- Hover state shows a vertical guide line + tooltip with date + rating + job ID + link.

### 4. Job history table

- Header: `RECENT JOBS` — caps-md muted slate. Right edge: `View all (47)` text-only cyan link.
- 10 visible rows, 48px tall each, zebra striped `#13151C` alternating.
- Columns: Date (mono 12px) · Employer (mono 12px truncated) · Task (Inter 14px Regular max 1 line ellipsis) · Payment (mono 14px pale gold right-aligned tabular) · Rating (5-star row, cyan filled / muted outline). 1px row border `#272A35`.

### 5. Right rail — 320px wide, sticky

Two cards, 16px vertical gap, 1px `#272A35` border, 4px radius.

- **OWNERSHIP card** — 200px tall:
  - Header: `OWNERSHIP` caps-md muted slate, 16px padding.
  - If you own it: large `List for Sale` button (cyan filled, full width, 44px tall, Inter SemiBold 14px).
  - If you don't: `Make Offer` text-only cyan button + `0x742d…bEb1 · current owner` in mono 12px muted below.
  - Below button: `Last sold for: 850.00 USDC` in JetBrains Mono 12px muted gold-dim.

- **OWNERSHIP HISTORY card**:
  - Header: `OWNERSHIP HISTORY` caps-md muted slate.
  - 4–5 rows, 40px tall, mono 12px:
    - Each row: address truncated · `42d held` · `850 USDC`. Past owner addresses muted, current owner white.

## Design principles to enforce

- The 96px ENS name dominates. Stats grid, capability tree, portrait — all supporting cast.
- Capability tree on the right is the proof surface — judges read it during the demo.
- Stats grid reads like a watch's complications dial: precise, dense, valuable.
- `Total Earnings` pale gold is the only gold on the body of the screen.
- Attestation badge is small but ALWAYS visible — it's the trust artifact for the 0G Compute moment.

## Iteration prompts to have ready

- "Increase ENS name to 104px Fraunces Black, drop letterspacing to -0.035em."
- "Tighten capability tree row height from 56px to 48px to fit the badge inline."
- "Add a 1px gold-dim divider below the stats grid before the chart section."
- "Replace the star icon in AVG RATING with a custom geometric mark — same hue."
- "Drop ownership history to 4 rows max — current row stays as a fixed top item."
