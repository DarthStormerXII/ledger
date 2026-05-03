# claude.ai/design — Full Ledger app prototype prompt

Paste the entire block below into the claude.ai/design chat. The Ledger Design System tag is already attached. Hi-fi + Interactive prototype mode is selected.

If the platform allows multiple files: also drag in the repo at https://github.com/gabrielantonyxaviour/ledger-branding (it has tokens.css/json, fonts, all assets). If not, the design system tag covers it.

---

## ⬇ PASTE EVERYTHING BELOW ⬇

---

# Build the entire Ledger app — high-fidelity interactive prototype

You have the Ledger Design System loaded. Build the **complete app** as a high-fidelity, fully interactive, fully mocked prototype. No real web3. No real APIs. All data is hardcoded mock data so I can click through every flow end-to-end and validate the UX.

## 0. What Ledger is

**Ledger is the auction house for AI agents.**

A two-sided marketplace where:
- AI workers (each represented by an iNFT — a numbered Lot) bid on jobs over a peer-to-peer mesh
- Each worker has signed reputation, encrypted memory, and a permanent ENS identity
- **Workers themselves are tradeable on-chain assets** — when a worker is sold, the new owner inherits future earnings; the worker keeps name, reputation, and skills

The visual framing is **a Sotheby's catalogue, not a crypto trading terminal.** Workers are Lots. Hiring is bidding. Earnings are realized prices. Provenance trails ownership history. Voice is catalogue-grade and past-tense — *"Lot 047 — sold for 850 USDC."*

## 1. Brand reminder (from the loaded design system)

- **Surface modes:** marketing surfaces are paper-cream `#F5F1E8`, product UI is ink-deep `#0A0A0E`. Same brand, two modes.
- **Type:** Fraunces italic-default for display + numbers / Bricolage Grotesque for body / DM Mono for hashes only.
- **Accents:** oxblood `#9C2A2A` for SOLD / active / primary buttons (max 1-2 per screen). Gold-leaf `#C8A85C` for record prices and premium pills (max 2 per screen — RARE).
- **Layout:** 0px corner radius default (catalogues have crisp edges; app icon is the sole exception). 1px borders. No drop shadows. No gradients. No glow.
- **Voice:** spare, past-tense, declarative. *"Lot 047 — bid won."* Never exclamation marks. Never emojis. Never "amazing" / "successfully" / "🚀".

The full token set is in the loaded design system (`tokens.css` / `tokens.json`). Use it religiously.

## 2. Pages to build (route map)

Build all of these as an interactive prototype with working navigation:

| Route | Page | Surface mode |
|---|---|---|
| `/` | **The Hall** — landing + live activity feed | Paper |
| `/jobs` | Live jobs feed (full list) | Ink |
| `/jobs/[id]` | **Auction Room** — single job, three workers bidding live | Ink |
| `/workers` | Workers index (all Lots, filterable) | Ink |
| `/agent/[ens-name]` | **Worker Profile** + capability-tree inset | Ink |
| `/marketplace` | Workers listed for sale | Ink |
| `/post` | Post a new task (form) | Ink |
| `/wallet` | My wallet — owned Lots, earnings, provenance | Ink |
| `/connect` | Connect-wallet flow (mocked) | Paper |
| `/about` | About / how-it-works marketing page | Paper |

## 3. Navigation

**Top nav (sticky, 64px tall, ink-deep on product, paper on marketing):**
- Far left: italic Fraunces wordmark "Ledger" — ink on paper, paper on ink
- Center: nav links — *Catalogue · Live Jobs · Marketplace · How it Works* — Bricolage Medium 14px
- Far right: when disconnected: a single **Connect Wallet** button (oxblood-filled, paper text, 0px radius). When connected: native ETH balance pill on left (`Ξ 0.0042 ETH`, DM Mono 12px, gold-dim) + truncated address `0x742d…bEb1` in DM Mono 14px
- Bottom edge: 1px ink rule line (or 1px paper-dim on dark)

**Footer (slim, 48px, both surfaces):**
- Left: italic "Ledger" in body Fraunces 14px
- Center: small caps `NO. 0001 — ETHGLOBAL OPEN AGENTS 2026`
- Right: GitHub / Demo / Twitter links (text-only, oxblood on hover)

## 4. Mock data (hardcode this — every page references it)

### 4.1 Workers (Lots)

| Lot # | ENS Name | Owner address (truncated) | Jobs done | Avg ★ | Total earned | Listed for sale? | Avatar emblem |
|---|---|---|---|---|---|---|---|
| 047 | `worker-047.ledger.eth` | `0x742d…bEb1` | 47 | 4.7 | 12,847.50 USDC | yes — 1,000 USDC ask | concentric rings |
| 048 | `owl-watcher.ledger.eth` | `0x9c2e…f471` | 31 | 4.5 | 6,420.00 USDC | no | radial spokes |
| 049 | `hex-scout.ledger.eth` | `0x33ad…b0e2` | 24 | 4.6 | 4,180.50 USDC | yes — 800 USDC ask | hex lattice |
| 050 | `triad-runner.ledger.eth` | `0xfe9c…c8a1` | 18 | 4.4 | 2,990.00 USDC | no | nested triangles |

(The four `ledger_lot_04{7,8,9,0}.png` avatars in the design system map 1:1 to these four Lots. Use them.)

### 4.2 Live jobs

| Job ID | Title | Employer | Payout | Bond | Time left | Bids |
|---|---|---|---|---|---|---|
| j-1247 | Base Yield Scout | `0xa11c…3742` | 5.00 USDC | 0.50 USDC | 01:47 | 3 |
| j-1248 | ENS Resolver Audit | `0xb22c…aa01` | 8.50 USDC | 0.85 USDC | 04:12 | 2 |
| j-1249 | Onchain Token List Scrub | `0xc33d…11bc` | 3.00 USDC | 0.30 USDC | 00:38 | 4 |
| j-1250 | Multichain Gas Watcher | `0xd44e…0b9a` | 12.00 USDC | 1.20 USDC | 09:55 | 1 |
| j-1251 | Vault APR Snapshot | `0xe55f…a222` | 4.50 USDC | 0.45 USDC | 02:08 | 0 |
| j-1252 | Restaking Risk Profiler | `0xf66a…41c1` | 15.00 USDC | 1.50 USDC | 11:33 | 2 |

### 4.3 The Hall hero stats

- "Total realized this week": **47,238.50 USDC** (italic Fraunces, ink color, 96px)
- "Active lots": **247**
- "Bids placed today": **1,847**
- "Hammer price record (this week)": **2,400 USDC** — Lot 047, on j-1182 (gold-leaf this one — only here)

### 4.4 Provenance (for Lot 047 — the demo punchline)

```
Lot 047 — worker-047.ledger.eth
  → Minted by 0x111a…3010  (2026-04-14)
  → Sold to 0x742d…bEb1    (2026-04-22, 850.00 USDC)
  → Listed for sale         (current — asking 1,000 USDC)
```

### 4.5 AXL topology

3 nodes — `us-west`, `eu-central`, `local`. Live cyan packets flow along the three connecting links. Bottom edge between us-west and local is **dashed** (matches the brand-mark geometry).

### 4.6 Sample voice copy (use exactly this register)

- *"Lot 047 — bid won. 4.50 USDC."*
- *"Sold for 850 USDC. Provenance updated."*
- *"Pending — settlement in 4s."*
- *"No lots yet."*
- *"Lot 049 listed for 800 USDC."*

## 5. Per-page anatomy

### 5.1 The Hall — `/` (PAPER)

Hero band (60% viewport height):
- Top: thin 1px ink rule line spanning the page
- Center-aligned: caps `THIS WEEK` (Bricolage Medium, ink-muted, tracked +0.12em)
- Below: huge italic Fraunces — `47,238.50 USDC` (128px, italic black, ink)
- Below that: caps `REALIZED ACROSS LEDGER` in Bricolage Medium ink-muted

Mid-band: 3 slim stat cells, divided by 1px ink dividers (no card fills, just dividers — like a newspaper byline):
- `247 — Active lots`
- `1,847 — Bids placed today`
- `2,400 USDC — Hammer record (Lot 047)` *← this single one in gold-leaf*

Below: catalogue grid of all 4 Lots (047-050) shown as 1px-bordered plates. Each plate:
- Top-left: `LOT 047` (caps Bricolage Medium, ink, tracked)
- Center: avatar emblem (use the matching `ledger_lot_04X.png`)
- Below: italic Fraunces ENS name
- Below that: caps `47 JOBS · 4.7 ★ · 12,847.50 USDC EARNED`
- Footer of plate: oxblood `View Lot →` link (text only, no fill)

Footer band: live ticker scrolling: *"Lot 047 — bid won. 4.50 USDC.    ·    Lot 048 — listed for 800 USDC.    ·    Lot 047 — sold for 850 USDC. Provenance updated.    ·    ..."*

Hover state on a plate: 1px ink border thickens to 1.5px; oxblood `View Lot →` underlines. Click → routes to `/agent/<ens-name>`.

### 5.2 Live Jobs — `/jobs` (INK)

List of all 6 live jobs. Each row: 1px paper-dim divider, 64px tall. Layout:
- Left: italic Fraunces 24px job title. Below: DM Mono 12px employer truncated address, ink-muted.
- Right side stacked: countdown in DM Mono Medium 24px **oxblood** (turns gold-leaf when <30s); `5.00 USDC` payout in italic Fraunces 18px ink.
- Far right: `[3 bids]` caps Bricolage 11px ink-muted, hovers to oxblood `View →`.

Top of page: H1 italic Fraunces 64px `Live jobs.` (period — declarative).
Right of H1: caps `12 ACTIVE` in Bricolage Medium tracked, ink-muted.

Click a row → `/jobs/[id]` — Auction Room.

### 5.3 Auction Room — `/jobs/[id]` (INK)

This is the hero recording surface. Cinematic.

**Top section (160px):**
- Left: italic Fraunces 40px job title (`Base Yield Scout.`); below, Bricolage Regular 14px paper-dim 2-line max description.
- Right (right-aligned): countdown in DM Mono Bold 32px oxblood (`01:47`); below, two stacked rows: `PAYOUT — 5.00 USDC` and `BOND — 0.50 USDC`, all caps Bricolage Medium ink-muted labels with values in italic Fraunces 18px ink.

**Center (auto height):** Three worker bid cards horizontally, 16px gap, each 320px wide.

**Card anatomy:**
- 1px paper-dim border, 0px radius, 24px padding. No fill (ink shows through).
- Top-left: caps `LOT 047` (Bricolage Medium 11px tracked +0.12em, paper)
- Center top: 96px avatar emblem (use `ledger_lot_04X.png`)
- Below: italic Fraunces 22px ENS name center-aligned (`worker-047.ledger.eth`)
- Below: caps `4.7 ★ · 47 JOBS` (Bricolage 11px paper-dim)
- 16px gap, then current bid: italic Fraunces 36px **oxblood** (`4.50 USDC`)
- Bottom: thin 1px oxblood line, 80% width, breathing pulse (0.4 → 1.0 → 0.4 opacity over 1.2s) — "live AXL connection"

The currently-winning card has all of the above; the two losing cards drop to 60% opacity.

**Right rail (320px wide, 1px paper-dim left border):**
- Header caps `AXL TOPOLOGY` Bricolage Medium tracked, paper-dim
- Below: 3 ink filled circles arranged as upward equilateral triangle, 1px lines between. Bottom edge dashed. Cyan-replacement for D1: use **paper-dim** lines, **oxblood** packets flowing (matches brand). Labels under nodes: `us-west`, `eu-central`, `local` (caps Bricolage 10px tracked).
- Below topology, scrolling log feed (max 8 lines, DM Mono 11px):
  - `12:47:32  us-west → eu-central : BID`
  - `12:47:31  local → eu-central : BID`
  - `12:47:30  eu-central → all : GOSSIP`
  - timestamps paper-dim, addresses paper, message types **oxblood**

**Bottom status bar (40px, 1px top border):**
- Three indicators evenly spaced:
  - `[●] AXL — 3 nodes connected` (success-color dot)
  - `[●] 0G GALILEO — ready` (success dot)
  - `[●] ENS RESOLVER — live` (success dot)

**Interactive demo state:** every 4-6 seconds, simulate a new bid arriving. The card scales 0.97 → 1.00, the bid value digit-rolls (500ms) to a new lower amount. New AXL log line appears at top (other lines slide down).

### 5.4 Worker Profile — `/agent/[ens-name]` (INK)

This is the demo "slow push" frame.

**Top header (480px):**
- Top-left: tiny caps `LOT 047 — listed 14 days ago` (Bricolage Medium 11px tracked, paper-dim)
- Below: huge italic Fraunces 96px ENS name `worker-047.ledger.eth` (paper-cream on ink). Letter-space -0.03em.
- Below: caps `47 jobs · 4.7 ★ · 12,847.50 USDC realized` (Bricolage Medium 14px paper-dim, tracked +0.08em)
- Bottom of band: 3 inline pills, 1px borders, caps Bricolage 10px tracked:
  - `[ERC-7857 · 0G iNFT DRAFT]` (paper border)
  - `[0G GALILEO · 16602]` (gold-leaf border — only place gold-leaf appears on this screen)
  - `[● ACTIVE]` (success-color border with breathing dot)

**Two-column body (60/40 split, 24px gap):**

LEFT (60%):
- 240×240 avatar emblem (use `ledger_lot_047.png`)
- Below avatar: caps `OWNER` then DM Mono 14px paper `0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1` (full address) with copy-on-click affordance
- Below: caps `LISTED FOR SALE — 1,000.00 USDC` italic Fraunces 24px **oxblood** + a **Buy now** button below (oxblood-filled, paper text, 44px tall, italic Fraunces label)

RIGHT (40%) — `CAPABILITY TREE` inset:
- Header caps `CAPABILITY TREE` paper-dim
- 5 stacked rows (56px each, 1px paper-dim row dividers):
  - `WHO.*` (caps 11px paper) → DM Mono 14px paper resolved value `0x742d…bEb1` → text-only oxblood `Verify →`
  - `PAY.*` → DM Mono 14px `0x9c2e…f471 @0` (with `+ 0x33ad…b0e2 @1` underneath in 12px paper-dim) → `Verify →`
  - `TX.*` → DM Mono 14px `bafyb…7e3p` → `Verify →`
  - `REP.*` → caps 11px `47 SIGNED RECORDS` → `Verify →`
  - `MEM.*` → DM Mono 14px `bafkr…81rt` → `Verify →`
- Below the rows: small inset (320×64) — TEE attestation badge:
  - Caps header `0G COMPUTE — TEE ATTESTATION`
  - DM Mono 11px `0x9a4f…ec21` paper + emerald `[✓] VERIFIED` caps tag

**Stats grid (160px tall, 4 columns equal width, divided by 1px paper-dim verticals — no cell fills):**
- Cell 1: caps `JOBS COMPLETED` then italic Fraunces 64px `47` paper
- Cell 2: caps `AVG RATING` then italic Fraunces 64px `4.7 ★` (the star in oxblood)
- Cell 3: caps `TOTAL REALIZED` then italic Fraunces 64px `12,847.50` paper, with caps `USDC` baseline-aligned 11px paper-dim
- Cell 4: caps `DAYS ACTIVE` then italic Fraunces 64px `14` paper

**Reputation chart (240px tall):**
- Caps header `REPUTATION HISTORY`
- Line graph: oxblood line 1.5px on ink bg, faint paper-dim grid, DM Mono 11px axis labels (dates X / 0-5 ratings Y)

**Recent jobs table:**
- Caps header `RECENT JOBS — LAST 10`
- Columns: Date · Employer · Title · Realized · Rating
- 10 rows, zebra paper-dim alternating row-bg at 4% opacity, 1px row borders

**Provenance section:**
- Caps header `PROVENANCE`
- 3-row provenance trail (matching mock data §4.4) — each row: caps date · DM Mono address · italic Fraunces realized price · text "owner" or "listed"

### 5.5 Workers Index — `/workers` (INK)

Catalogue grid layout — 4 columns at desktop, 2 at tablet. Each cell is a Lot plate (same anatomy as in The Hall §5.1 but with paper-dim 1px borders instead of ink).

Top of page: H1 italic Fraunces 64px `The catalogue.` (period). Right of H1: caps `247 ACTIVE LOTS · 89 LISTED FOR SALE`.

Filter bar (sticky below H1):
- All / Listed for sale / Top earners / Recently minted (segmented button row, 0px radius, oxblood underline on selected)
- Sort dropdown: by realized · by rating · by recency

Click any plate → `/agent/<ens-name>`.

### 5.6 Marketplace — `/marketplace` (INK)

Same catalogue grid as `/workers` but only shows Lots with `Listed for sale = yes` (047 and 049 in mock). Each plate has the asking price prominently in italic Fraunces oxblood.

Each plate has TWO buttons:
- `Buy now` (oxblood-filled, primary)
- `Make offer` (text-only oxblood)

### 5.7 Post a task — `/post` (INK)

A 2-column form. Catalogue-grade layout: 1px paper-dim section dividers, 0px radius inputs, 16px section gaps. Ink bg.

Sections (each labeled with caps header):
1. **TASK BRIEF** — title (italic Fraunces input), description (Bricolage 16px multiline)
2. **PAYOUT TERMS** — payout (USDC, italic Fraunces input with `USDC` suffix), bond (USDC), time limit (DM Mono input mm:ss)
3. **REQUIREMENTS** — minimum reputation, minimum jobs done, optional capability tags
4. **REVIEW** — readback in catalogue layout: italic Fraunces title, payout, bond, time limit. Below: oxblood **Post task** button (full-width, 56px tall, italic Fraunces label).

After submit → routes to `/jobs/[new-id]` (Auction Room) with the just-posted job. Show a brief paper-cream toast at the top of the Auction Room: *"Lot listed. Bidding open."*

### 5.8 My Wallet — `/wallet` (INK)

Two-section layout:

**Top: Owned Lots**
- Catalogue grid of 1-3 Lots the user "owns" (mock as Lot 047 + Lot 049). Each plate shows realized-this-month and `Manage` button.

**Bottom: Activity feed**
- Reverse-chronological list of events: bids won, sales completed, payments received. Each row in catalogue voice: *"Lot 047 — bid won. 4.50 USDC. 4 minutes ago."*

### 5.9 Connect Wallet — `/connect` (PAPER, modal-style overlay)

Centered 480px-wide card on paper bg. 1px ink border, 0px radius, 32px padding.

Header: italic Fraunces 32px `Connect.` (period).
Below: 3 wallet options as catalogue rows (1px paper-dim dividers): MetaMask · WalletConnect · Coinbase Wallet. Each row hover: oxblood underline.
Click any → 2s loading state (spinning 1px ring, no fill, oxblood) → success state: *"Connected. 0x742d…bEb1."* italic Fraunces 18px paper-dim. Auto-redirect to `/`.

### 5.10 About / How it Works — `/about` (PAPER)

Marketing page. 4 sections, each a full viewport tall, separated by 1px ink rule lines:

1. **Hero** — italic Fraunces 128px `An auction house for AI agents.` Tagline below in Bricolage 18px ink. CTA `Browse the catalogue →` (oxblood underline link, no button fill).
2. **The Lot** — a single rendered Lot plate at large scale, with annotations pointing to: Lot number · Avatar · ENS name · Provenance · Reputation. Each annotation in caps Bricolage Medium tracked.
3. **The auction** — embedded mini Auction Room frame demonstrating live bidding (looped state).
4. **The inheritance** — split-screen showing Lot 047 transferring from Owner_A to Owner_B with provenance updating live. (Static visualization, but trigger on scroll.)

Footer with the standard slim footer.

## 6. Interactive states (must work in the prototype)

These need to actually fire — no mocked-static stuff:

1. **Live ticker on `/`** — scrolls horizontally at 80px/s; pauses on hover.
2. **Bid arrival on `/jobs/[id]`** — every 4-6 seconds, one of the 3 worker cards "wins" the leadership; bid value digit-rolls to a lower amount (500ms); cyan ring transfers between cards.
3. **AXL packets** — animated dots flowing along the topology lines, 1.2s linear, multiple in flight simultaneously.
4. **AXL log feed** — new entry every 2-3 seconds, oldest fades out.
5. **Settlement Status Strip** — embed at the top of `/agent/[ens-name]` with mock data:
   - `[●] USDC PAID ON BASE — 0x9a4f…ec21 ↗`
   - `[●] REPUTATION RECORDED — 0x33ad…b0e2 ↗`
   - `[●] 0G STORAGE CID — bafy…7e3p ↗`
   - Right edge pill: `[SETTLED]` (success border)
   - Demo state: every 8s, briefly flip one leg to `[●] PENDING_RECONCILE` (warning), spinner, then back. So judges see the multi-chain coordination is real.
6. **Inheritance modal** — clickable from `/agent/[ens-name]` via the `Buy now` button. Modal anatomy:
   - 80% backdrop dim (`rgba(10,10,14,0.85)`)
   - Centered 720×auto card on ink-elevated, 1px paper-dim border, 8px radius (one of the few non-zero radii — ceremonial hierarchy)
   - Title: italic Fraunces 32px `Transfer Lot 047.`
   - Center: 240×240 avatar with subtle breathing pulse (0.95 → 1.0, 2.5s)
   - Above: caps `FROM` then DM Mono 16px owner_a address (paper-cream → fades to 30% over 1.5s during transfer)
   - Below: caps `TO` then DM Mono 16px owner_b address (scales 0.97 → 1.00, opacity 0 → 1 during transfer)
   - Side particle streams: oxblood particles flowing from old owner side to new owner side over 1.5s — REVERSING DIRECTION at t=0.75s. This is the visual punchline.
   - Below particles: caps header `LIVE ENS RESOLUTION` then a single row showing `who.worker-047.ledger.eth → 0x742d…bEb1` that ticker-rolls to `0x9c2e…f471` (500ms) at the moment of transfer
   - Caption below the row: DM Mono 11px paper-dim *"no ENS transaction · no migration · CCIP-Read off-chain resolver follows ownerOf()"*
   - Bottom: summary card with `Sale price — 1,000.00 USDC`, `Network fee — ≈0.0024 USDC`, `Settles on — 0G Galileo Testnet · ChainID 16602 [✓]`
   - Two buttons: `Confirm Transfer` (oxblood-filled, primary) and `Cancel` (text-only, paper-dim)
7. **Make Offer modal** — clickable from `/marketplace` plates. Smaller form-style modal, oxblood `Place offer` button.
8. **Capability Tree verify drawers** — each `Verify →` button on `/agent/[ens-name]` opens an inline drawer (200ms ease-out) showing raw resolver gateway response in DM Mono, signed payload, and (for `pay.*`) the HD-derivation client-side check.

## 7. Three "demo-critical frames" — these MUST look perfect at hold

Judges will hold their eyes on these for 3+ seconds. Compose them like Sotheby's catalogue covers:

1. **Worker Profile static frame** — at `/agent/worker-047.ledger.eth`, the top header band, scrolled to top. The 96px italic ENS name fills the top, the Lot plate avatar + capability tree visible below, attestation digest legible. Held for 3 seconds during demo.
2. **Auction Room mid-bid** — at `/jobs/j-1247`, three worker cards visible, the leading card with oxblood line breathing, AXL topology with 2 packets in flight, log feed showing 4 recent entries. Held for 3 seconds.
3. **Inheritance split-screen mid-transfer** — modal mid-ceremony at t=0.75s of the 1.5s transfer: left wallet faded to 30% opacity, center Lot card unchanged, right wallet active with the +1,000.00 USDC delta in oxblood. ENS resolution row mid-ticker-roll. Held for 3 seconds.

These three frames need to be the kind of stills that look like book covers if you screenshot them.

## 8. Constraints (read carefully)

- **No skeleton loaders everywhere.** Use them only where data genuinely loads async with a meaningful wait (2+ seconds). Most data is hardcoded mock — no skeletons.
- **No back buttons at the top of pages.** Use the top nav. Detail pages use Cancel/Close in context.
- **No search-icon-inside-search-bar.** Plain `<Input>` with descriptive placeholder.
- **No stat-card hero grids.** The Hall leads with the 128px italic number. Stats are 3 slim cells in the secondary band.
- **No 2×2 / 3×3 feature grids.** Each section gets its own moment.
- **Worker emblems are abstract geometric only** — concentric rings, radial spokes, hex lattice, nested triangles. NEVER faces. NEVER robots. NEVER avatars.
- **No gradients, no drop shadows, no glassmorphism, no glow, no rounded blob shapes.**
- **Tabular figures on every number that can change.** Religious.
- **DM Mono only for hashes, addresses, CIDs, peer IDs.** Body Bricolage on a hash → reject.
- **Italic Fraunces is the brand voice.** Display type defaults to italic. Roman variants only when an italic would compete.
- **Voice is past-tense, terse, catalogue-grade.** No exclamations, no emojis, no "successfully", no "amazing".
- **Oxblood appears max 1-2 prominent uses per screen.** Gold-leaf max 2 (and rarely).
- **0px corner radius default.** App icon is the only exception.

## 9. What NOT to wire up (mocked only)

- **No real wallet connection** — the `/connect` flow is a 2s mock that always succeeds.
- **No real chain reads** — `who.*`, `pay.*`, `tx.*`, `rep.*`, `mem.*` resolved values are all hardcoded.
- **No real bid submission** — bids "arrive" on a 4-6 second interval timer, hardcoded sequence.
- **No real settlement** — the Settlement Status Strip cycles its mock states on an 8s interval.
- **No real ENS gateway** — the live resolution row in the Inheritance modal is a hardcoded 1.5s animation.

It's a prototype to validate UX. The goal is for me to click through every flow and feel the product without any backend.

## 10. Output expected

- High-fidelity Tailwind + shadcn/ui-compatible designs that I can drop into a Next.js (`frontend/app/`) workspace.
- All routes in §2 wired up with working in-prototype navigation.
- All interactive states in §6 actually firing (timer-driven mock data is fine).
- All three demo-critical frames (§7) looking like book covers.
- A consistent global layout (top nav + footer) shared across all pages, with surface mode (paper vs ink) switching based on route.

## 11. Build order (start here)

Do these in order — they let me validate the brand before scaling out:

1. **The Hall (`/`)** — landing page, paper surface, hero + 3 stat cells + 4-Lot catalogue grid + footer ticker
2. **Worker Profile (`/agent/worker-047.ledger.eth`)** — most complex single page; if this lands, the system works
3. **Auction Room (`/jobs/j-1247`)** — the recording surface; needs the live-bid + AXL animations
4. **Marketplace + Workers index** — both share the catalogue grid pattern; quick after #2
5. **Live Jobs (`/jobs`)** — list view
6. **Post a task (`/post`)** — form
7. **My Wallet (`/wallet`)**
8. **Connect (`/connect`)** + About (`/about`)
9. **Inheritance modal** (overlay on Worker Profile) — last because it's the demo punchline; nail it once everything else is right

After #2 (Worker Profile), pause and let me review before continuing — that page is the brand smoke test. If it lands, the rest follows. If it doesn't, we fix the system before scaling out.

---

⬆ END OF PASTED PROMPT ⬆

---

## Tips for the conversation after pasting

- After it produces #1 (The Hall), pause to do surgical edits — *"reduce hero to 96px, drop the third stat cell, tighten the catalogue grid to 3 columns"*.
- Don't say "make it more cinematic" — say *"the avatar emblem is too noisy, use the rings-only variant"* or *"the stacked lockup needs more breathing space below NO. 0001"*.
- Reference the loaded design system tokens directly: *"use --ledger-oxblood for the Buy now button, not red"*.
- For the Inheritance modal, ask for a slow-mo / scrubbable version so you can check the particle reversal at t=0.75s.

If the prototype output is too plain, prompt: *"Spend more detail on the catalogue plate borders and rule-line typography — these are the brand."*
If it's too crypto, prompt: *"This is a Sotheby's catalogue, not a trading dashboard. Restrain it."*

After the prototype is in good shape, Claude Design can export each page to a Next.js page component. Drop those into `frontend/app/` and refine in Claude Code from there.
