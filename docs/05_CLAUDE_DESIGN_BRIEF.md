# Ledger — Claude Design Brief

**Tool:** Claude Design (Anthropic Labs)
**Project type:** High fidelity prototype
**Project name:** Ledger

---

## How to Use This Document

When you start in Claude Design:

1. Choose **High fidelity** (not wireframe)
2. Project name: `Ledger`
3. Click **Set up design system** — fill it using Section A below
4. Once design system is configured, build screens one at a time using the prompts in Section B

---

## Section A — Design System Setup

### Company name and blurb
```
Ledger — the trustless hiring hall where AI agents bid for work, and 
where the workers themselves are tradeable on-chain assets (iNFTs) 
that carry their reputation, memory, and earnings history with them 
across owners. A two-sided marketplace built for ETHGlobal Open 
Agents 2026.
```

### Link code on GitHub
Skip initially. Add when your repo is up and Claude Design can sync with your component patterns.

### Link code from your computer
Skip.

### Upload .fig file
Skip unless you have a reference Figma you want it to match.

### Add fonts, logos and assets
Upload these:
- `Fraunces` font files (download from Google Fonts, all weights)
- `Inter` font files (download from Google Fonts, all weights)
- `JetBrains Mono` font files (download from Google Fonts, regular + bold)
- 2-3 reference screenshots that match the aesthetic — Linear product screen, Polymarket market detail page, a luxury watch product page

### Any other notes? (paste verbatim)

```
AESTHETIC
Confident, restrained, slightly futuristic. Linear's tightness meets 
Polymarket's information density meets the quiet luxury of a watch 
boutique. Absolutely no crypto clichés — no gradients, no 
glassmorphism, no neon greens, no "rocket" or "moon" iconography, 
no rounded-corner playfulness. This is institutional-grade software 
for a new asset class.

PALETTE
- Background: deep ink #0A0E1A and warm off-black #13151C
- Surface: subtle elevation #1A1D26
- Border: subtle line #272A35
- Primary: pale gold #E8D4A0 — used sparingly, ONLY for value/earnings 
  numbers and the brand wordmark
- Accent: electric cyan #5FB3D4 — for live activity indicators, AXL 
  packets, active states, primary buttons
- Text primary: warm white #F5F2EB
- Text muted: slate #7A8290
- Success: muted emerald #4A8B6F
- Warning: warm amber #D4A347
- Danger: faded coral #C97064

TYPOGRAPHY
- Display (Fraunces): the wordmark "Ledger" and any large hero numbers 
  — earnings, USDC totals
- Body (Inter): everything else — labels, paragraphs, button text, 
  table content
- Mono (JetBrains Mono): on-chain addresses, hashes, transaction 
  receipts, log output

VOICE
Spare, precise, a bit cold. Think "Bloomberg terminal" not "social 
app." Status messages are short: "Worker accepted." "Payment landed." 
"Reputation +1." Never use exclamation marks. Never use emojis. 
Never use "amazing" or "awesome."

PRINCIPLES
1. Money is sacred. Always tabular figures. Always proper currency 
   formatting. Always show 2 decimal places for USDC.
2. Live data feels alive. Subtle pulses on new bids. Smooth number 
   tickers when earnings update. No abrupt state changes.
3. The iNFT is the hero. Every worker has a visual identity. Treat 
   worker portraits like watch dials — symmetrical, precise, refined.
4. Density over whitespace. Information-rich, not airy.
5. One bold typographic moment per screen. Usually a single huge 
   number or a single huge name in Fraunces.

LAYOUT
- 12-column grid, 80px max gutter, 24px page padding
- Cards: 1px subtle border #272A35, no drop shadows, 4px corner radius
- Buttons: solid fill, no gradients, no glow, 4px corner radius
- Status pills: small caps text, monospace font, single-color border
- Data tables: zebra-striped with #13151C alternating, 1px row border
- Modals: full backdrop dim to 80% opacity, centered card, 8px corner 
  radius (slightly more than buttons for hierarchy)

ANIMATION
- All animations 200ms ease-out unless otherwise specified
- Bid arrivals: scale from 0.95 to 1.0 + fade in
- Number tickers: roll digits, 400ms
- AXL topology packets: linear motion, 1.2s end-to-end
- iNFT transfer: ceremonial 1.5s sequence, with particle stream reversal
```

---

## Section B — Screen-by-Screen Build Order

Build screens one at a time. After each screen, iterate with surgical edits before moving to the next.

### Screen 1 — The Hall (Homepage / Live Activity Feed)

**Prompt to paste:**

```
Build the homepage of Ledger called "The Hall."

LAYOUT (top to bottom):

1. Top nav bar (64px height):
   - Far left: Ledger wordmark in Fraunces, 24px, pale gold #E8D4A0
   - Center: nav links — "Live Jobs", "Workers", "Marketplace", "My 
     Wallet" — Inter 14px, muted slate, current page in white
   - Far right: "Connect Wallet" button (cyan filled), or wallet 
     address truncated (0x1234...5678) if connected

2. Hero band (240px height, full width):
   - Centered: a single oversized number "12,847.50 USDC" in Fraunces 
     96px, pale gold
   - Below it, in muted slate Inter 14px: "Total paid to agents this 
     week"
   - A thin live ticker below that, scrolling slowly horizontally: 
     last 5 payments — "5.00 USDC → fox.worker | 2 min ago • 3.50 
     USDC → owl.worker | 4 min ago • ..."

3. Two-column main content (60/40 split, 24px gap):
   
   LEFT COLUMN (60% width) — "Live Jobs":
   - Section header: "LIVE JOBS" in monospace small caps, muted slate
   - Below: list of 6 cards, each 80px tall:
     - Card layout: job title (Fraunces 18px) on left, employer 
       address (mono, truncated) below in muted slate
     - Right side of card: countdown timer (mono, cyan if active, 
       large), bid count below ("3 bids")
     - Top card has a subtle cyan pulse border indicating it just 
       opened
     - Each card has a faint "View" affordance on the right edge
   
   RIGHT COLUMN (40% width) — "Top Workers":
   - Section header: "TOP WORKERS" in monospace small caps
   - Below: leaderboard of 10 rows, each 56px tall:
     - Far left edge: rank number 01-10 in mono, small, muted slate
     - Worker portrait (circular, 40px) — abstract geometric, NOT a 
       face
     - Worker name (Fraunces 16px) with reputation score below in 
       small muted text — "4.7★ • 47 jobs"
     - Right side: total earnings in pale gold, mono, right-aligned

4. Footer band (80px height):
   - Three small stat blocks, evenly spaced:
     - "247 active workers" 
     - "89 jobs completed today"
     - "4.6 average rating"
   - Each in Inter 12px muted slate, with the number in larger pale 
     gold above the label

DESIGN PRINCIPLES TO ENFORCE:
- The hero number "12,847.50" is the single bold typographic moment
- No drop shadows anywhere
- All borders 1px #272A35
- Subtle cyan pulse on the topmost live job (the one just posted)
- Worker portraits are abstract — concentric circles, hex patterns, 
  fractal forms — never faces or avatars
```

After it generates, iterate with prompts like:
- "Reduce the hero band height to 180px and shrink the number to 80px"
- "Make the ticker text 12px instead of 14px and slow the scroll speed by 50%"
- "Replace the worker portraits with simpler line-art geometric forms — concentric circles only"

---

### Screen 2 — The Auction Room (the screen we record for the demo)

**Prompt to paste:**

```
Build the live auction room screen for Ledger. This screen is what we 
record for the demo video — it must feel cinematic, not utilitarian.

LAYOUT:

1. Top section (160px height):
   - Job title "Base Yield Scout" in Fraunces 32px, white
   - Job description below in Inter 14px, muted slate, max 2 lines: 
     "Identify the 3 highest-APY USDC vaults on Base with TVL > $10M 
     and audit history. Return JSON report with sources cited."
   - Right-aligned in this band:
     - Countdown timer in JetBrains Mono 32px cyan: "01:47"
     - Below: "PAYOUT 5.00 USDC" in pale gold mono
     - Below: "BOND 0.50 USDC" in muted mono

2. Center main area (auto height, takes remaining vertical space):
   - Three worker bid cards arranged horizontally with 16px gap, 
     each card 280px wide:
     
     CARD ANATOMY (each):
     - Top: worker portrait (circular, 96px) — abstract geometric. 
       Currently-winning worker has a thin cyan ring around the 
       portrait
     - Worker name in Fraunces 20px center-aligned below portrait
     - Reputation row: "4.7★ • 47 jobs" in Inter 12px muted slate
     - Current bid in Fraunces 36px pale gold center-aligned, with 
       "USDC" suffix in mono small
     - Bottom of card: thin animated cyan line, 2px tall, pulsing 
       like a heartbeat — represents live AXL connection
   
   - When a new bid arrives, the card subtly scales (0.97 → 1.00) 
     and the bid number tickers digit-by-digit to the new value
   - Currently-losing cards have 70% opacity to deemphasize them

3. Right rail (320px wide, separated by 1px border):
   - Header: "AXL TOPOLOGY" in mono small caps muted slate
   - Topology visualization: 3 nodes drawn as small filled circles 
     (16px), labeled below in mono small caps: "us-west", 
     "eu-central", "local". Lines between all 3 nodes. Animated 
     cyan packets (small dots) flow along the lines in real-time.
   - Below topology: log of recent AXL messages in JetBrains Mono 
     11px, scrolling, max 8 visible:
     - Each line: timestamp + sender + message type
     - Example: "12:47:32 us-west → eu-central : BID"

4. Bottom status bar (40px height):
   - Three indicators evenly spaced:
     - "AXL: 3 nodes connected" — green dot
     - "0G GALILEO: ready" — green dot
     - "ENS RESOLVER: live" — green dot
   - Each in mono 12px

DESIGN PRINCIPLES:
- This is the hero screen. Spend extra detail on the bidding cards.
- Live animations matter — convey real-time activity through subtle 
  motion, not loud effects
- The AXL topology visualization is what proves "this is really P2P" 
  to judges. Make it visually substantial but elegant.
```

---

### Screen 3 — Worker Profile (iNFT Detail Page)

**Prompt to paste:**

```
Build the worker profile page for a single iNFT worker on Ledger.

LAYOUT:

1. Top header section (400px height):
   - **Top of header, full width:** the worker's ENS name rendered in
     Fraunces 96px, white: `worker-001.<team>.eth`. This is the screen's
     bold typographic moment, replacing the previous 64px Fraunces name.
   - Left side (40% width, below the ENS name): worker portrait, large,
     240×240px. Treat this like a watch dial — abstract geometric,
     symmetrical, precise. Concentric circles with hex pattern overlay,
     cyan and gold accents on deep ink background.
   - Right side (60% width, below the ENS name): **the capability tree
     viewer** — see Screen 6. Render the live resolution of `who`, `pay`,
     `tx`, `rep`, `mem` as five stacked rows. Each row: namespace in
     mono small caps cyan, current resolved value in mono 14px white,
     and a small "Verify" pill on the right. The `pay.*` row shows the
     last two rotated addresses with their HD-derivation nonces.
   - Below portrait + capability tree: current owner address in
     JetBrains Mono 14px muted: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1"
   - Below that: a row of small pill badges:
     - "ERC-7857 (0G iNFT draft standard)" pill (cyan border)
     - "0G GALILEO TESTNET — ChainID 16602" pill (gold border)
     - "ACTIVE" pill (emerald border, with small pulse dot)

2. Stats grid (160px height, 4 columns):
   - "JOBS COMPLETED" label small mono muted, value "47" in 
     Fraunces 48px white
   - "AVG RATING" label, value "4.7" in Fraunces 48px white, with 
     a small "★" in cyan after
   - "TOTAL EARNINGS" label, value "12,847.50 USDC" in Fraunces 
     48px pale gold
   - "DAYS ACTIVE" label, value "14" in Fraunces 48px white
   
   Each stat in its own bordered cell with 1px subtle border.

3. Reputation chart section (240px height):
   - Section header: "REPUTATION HISTORY" in mono small caps
   - Chart: line graph showing rating over time. Cyan line, dark 
     background grid (very faint), JetBrains Mono axis labels. 
     X-axis: dates. Y-axis: rating 0-5. Hover should show specific 
     job ratings.

4. Job history table:
   - Section header: "RECENT JOBS"
   - Table with columns: Date (mono small), Employer (mono truncated 
     address), Task (Inter 14px, max 1 line), Payment (mono pale 
     gold right-aligned), Rating (5 small stars in cyan/muted)
   - 10 rows visible. Zebra striped with #13151C alternating.

5. Right rail (sticky, 320px wide):
   - Card 1: "OWNERSHIP"
     - If you own it: large "List for Sale" button (cyan filled)
     - If you don't: "Make Offer" button (text only, cyan)
     - Below: "Last sold for: 850.00 USDC" in muted mono
   - Card 2: "OWNERSHIP HISTORY"
     - List of past owners as rows: address, dates held, sale price
     - 4-5 rows, mono small text

DESIGN PRINCIPLES:
- The ENS name in 96px Fraunces is the bold typographic moment of this
  screen — the portrait is supporting cast.
- The capability tree on the right is the proof surface — judges will
  read it during the demo.
- Stats grid should read like a watch's complications dial — precise,
  refined, valuable
- The "Total Earnings" pale gold is the only gold on the screen.
  Everything else white or cyan. Money is sacred.

ATTESTATION BADGE:
In the worker reasoning panel (small inset card on this profile), surface
the TEE attestation digest from `broker.inference.verifyService` (0G
Compute) as a small UI badge — mono 11px, faint cyan border, with a
"verified" checkmark. The digest itself is truncated middle (first 6 ·
last 6). Hover reveals the full hash. This badge is what we hold on
screen during the 0G Compute attestation moment in the demo.
```

---

### Screen 4 — The Inheritance Modal (Demo Punchline)

**Prompt to paste:**

```
Build the iNFT transfer modal for Ledger. This is the visual climax of 
the demo — it must feel ceremonial.

LAYOUT — full-screen takeover with 80% backdrop dim:

1. Center modal (max-width 720px, auto height, 8px corner radius):

2. Top of modal (80px):
   - Title: "TRANSFER WORKER" in Fraunces 24px white
   - Below: subtitle "All future earnings flow to the new owner" in 
     Inter 14px muted slate

3. Center section (480px height):
   - Worker's portrait in the absolute center, 240×240px, with a 
     subtle slow pulse animation
   - Above the portrait, top 80px: previous owner's address in 
     JetBrains Mono 16px, slowly fading to 30% opacity over 1.5s
     (Label above: "FROM" in mono small caps muted)
   - Below the portrait, bottom 80px: new owner's address in 
     JetBrains Mono 16px white, solid
     (Label above: "TO" in mono small caps cyan)
   - On either side of the portrait, vertical particle streams:
     - LEFT stream (from portrait toward old owner): pale gold 
       particles, fading and slowing
     - RIGHT stream (from portrait toward new owner): pale gold 
       particles, intensifying and accelerating
   - The animation reverses the flow direction over 1.5 seconds — 
     this is the punchline

4. Live ENS resolution panel (240px height, full modal width, between
   the particle stream and the summary card):
   - Header: "LIVE ENS RESOLUTION" in mono small caps muted slate
   - Single row showing `who.<agent>.<team>.eth` resolving live:
     - Pre-transfer state: resolves to old owner's address (mono 14px,
       fading to 30% opacity over the 1.5s reversal).
     - Post-transfer state: refresh trigger fires after the on-chain
       confirmation. The resolved address ticker-rolls (digit by digit,
       400ms) from old owner to new owner. New owner address renders in
       white, 14px mono.
   - Caption below the row, mono 11px muted slate: "no ENS transaction ·
     no migration · CCIP-Read off-chain resolver follows ownerOf()"
   - Small "Verify" pill on the right — opens a modal-over-modal showing
     the resolver gateway response and signed payload (per ENSIP-10).

5. Bottom section (160px):
   - A summary card in subtle elevation #1A1D26:
     - Three rows:
       - "Sale price" label, "1,000.00 USDC" value (pale gold)
       - "Network fee" label, "≈ 0.0024 USDC" value (mono muted)
       - "Settles on 0G Galileo Testnet (ChainID 16602)" with small
         cyan checkmark
   - Below the card, two buttons centered:
     - "Confirm Transfer" — cyan filled, primary
     - "Cancel" — text only, muted slate

6. After confirm (state change):
   - The entire modal animates a soft cyan glow pulse
   - Buttons replaced with "Transferring..." text + small loading
     indicator
   - On success: checkmark animation. The Live ENS Resolution panel
     (section 4) re-resolves `who.*` and the address ticker-rolls from
     old owner to new owner. Modal auto-closes 1.5s after the flip.

DESIGN PRINCIPLES:
- This screen has more theatrical animation budget than any other.
  The particle reversal AND the live `who.*` flip together are the
  visual punchline.
- Slow timing — 1.5s, not 400ms. This is meant to feel ceremonial.
- After confirmation, the success state should be SATISFYING — a
  slow pulse + ticker-roll, not a snappy checkmark.
```

---

### Screen 5 — Settlement Status Strip (component, not a full page)

**Prompt to paste:**

```
Build a thin reusable settlement-status strip component for Ledger.
This component appears in two contexts: (a) inline in the Auction Room
after a job completes, and (b) at the top of the Worker Profile when a
new job has just settled. It is NEVER a full page — it is a 56px-tall
horizontal strip.

LAYOUT:

1. Container: full width of parent, 56px height, 1px subtle border
   #272A35, deep ink #0A0E1A background, no corner radius.

2. Three settlement legs evenly spaced across the strip, each rendered
   as a small group of:
   - Status dot (8px circle): emerald if ✓, warm amber if pending,
     faded coral if failed
   - Leg label in mono small caps muted slate, 11px
   - Leg detail in mono 12px white (a tx hash truncated middle, or a
     CID truncated middle, or a "—" if no value yet)
   - Tiny "↗" affordance to open the relevant explorer in a new tab

   The three legs:
   - "USDC PAID ON BASE" → tx hash on Base Sepolia
   - "REPUTATION RECORDED ON BASE" → ERC-8004 ReputationRegistry
     `0x8004B663…` feedback record tx hash on Base Sepolia
   - "0G STORAGE CID UPDATED" → 0G Storage CID for the worker's
     updated memory pointer

3. Right edge of the strip: a single state pill.
   - All three ✓ → "SETTLED" pill, emerald border, mono small caps
   - Any leg pending → "PENDING_RECONCILE" pill, warm amber border,
     mono small caps, with a small spinner
   - Any leg failed → "RECONCILE_FAILED" pill, faded coral border

4. Subtle behavior: when a leg flips from pending → settled, the dot
   scales 0.95 → 1.0 + the detail text ticker-rolls in the new value
   over 400ms.

DESIGN PRINCIPLES:
- This is the trust surface — every settlement leg is independently
  verifiable on-chain. Mono everywhere for hashes/CIDs.
- Never collapse the three legs into one "✓ settled" — judges need to
  see the multi-chain coordination explicitly.
- The "PENDING_RECONCILE" state is honest UI: if the reputation feedback
  is recorded but the 0G Storage CID hasn't propagated yet, the strip
  must say so, not lie.
```

---

### Screen 6 — Capability Tree Viewer (custom page at `/agent/<ens-name>`)

**Prompt to paste:**

```
Build the capability tree viewer page at `/agent/<ens-name>` for Ledger.
This is the demo surface for the Inheritance moment — judges land here
to verify the ENS integration. It is the official ENS app's stand-in
because the official app does not render `pay.*` and `tx.*` capability
namespaces nicely.

LAYOUT:

1. Top header (120px height):
   - The ENS name in Fraunces 80px white: `worker-001.<team>.eth`
   - Below in mono 14px muted slate: "ENSIP-10 CCIP-Read · resolver
     gateway: <gateway-host>"

2. Capability tree main area (auto height, full width with 24px page
   padding). Render the five namespaces as five horizontally tall cards
   stacked vertically with 16px gap. Each card 1px border #272A35, no
   shadow, 4px corner radius. Each card 160-200px tall depending on
   payload.

   CARD ANATOMY (per namespace):
   - Header row (40px): namespace name in mono small caps cyan (e.g.
     "WHO.*"), followed by a one-line description in Inter 12px muted
     slate (e.g. "live ownerOf() against 0G Galileo Testnet").
   - Resolved value(s) in mono 14px white. For namespaces that resolve
     to a single value: a single row. For `pay.*`: render the last 5
     rotated addresses with their HD-derivation nonces, each on its own
     row, with the most recent at top.
   - Per row, a "Verify derivation" or "Verify resolution" button on
     the right edge (text-only, cyan). Click reveals an inline drawer
     with the raw resolver gateway response, the signed payload, and
     for `pay.*` the client-side HD-derivation check (master pubkey,
     nonce, derived child address, ✓ if match).

   THE FIVE NAMESPACES:
   - `who.<agent>.<team>.eth` → live `ownerOf(tokenId)` on 0G Galileo
     Testnet (ChainID 16602, native 0G token)
   - `pay.<agent>.<team>.eth` → auto-rotating address per resolution
     (HD-derivation chain). Render the rotation as `[address @ nonce 0]
     [address @ nonce 1] ...` with the master pubkey shown above the
     list.
   - `tx.<txid>.<agent>.<team>.eth` → receipt JSON for that task,
     pulled from 0G Storage. Render the parsed receipt as a small
     key/value table.
   - `rep.<agent>.<team>.eth` → ERC-8004 (0G iNFT draft standard
     adjacent — note this is the ReputationRegistry on Base Sepolia at
     `0x8004B663…`, a different chain). Render the latest 5 signed
     feedback records with employer signer and rating.
   - `mem.<agent>.<team>.eth` → current 0G Storage CID for the worker's
     encrypted memory blob.

3. Right rail (320px, sticky):
   - Card 1: "RESOLUTION TIMING" — small line graph showing latency of
     each namespace lookup over the last 60 seconds, mono axis labels.
   - Card 2: "REFRESH" — single cyan button "Re-resolve all". This is
     the trigger we hit during the demo to flip `who.*` post-transfer.

DESIGN PRINCIPLES:
- This page is the proof surface, not a marketing surface. It must look
  like a Bloomberg terminal, not an ENS app skin.
- Mono everywhere for resolved values, addresses, hashes, CIDs.
- The "Re-resolve all" button must feel weighty — pressing it during
  the demo is the trigger that flips `who.*` from old owner to new
  owner. After press: each namespace card flashes its border cyan for
  200ms while it re-resolves, then the resolved value ticker-rolls if
  it changed.
- The HD-derivation verification UI must NOT look like a hex dump.
  Render rotation as `[address A · derived from master @ nonce 0]
  [address B · derived from master @ nonce 1] ...` with explicit
  labels.

THIS PAGE'S URL:
The page lives at `/agent/<ens-name>` (e.g. `/agent/worker-001.<team>.eth`).
Demo references this URL in the closing card. README links to it.
```

---
