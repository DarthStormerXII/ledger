# Screen 6 — Capability Tree Viewer (`/agent/<ens-name>`)

Paste-ready brief for claude.ai/design.

---

## Purpose

The proof surface. Judges land here during the Inheritance demo to verify the ENS integration. Stand-in for the official ENS app — that app does NOT render `pay.*` and `tx.*` capability namespaces nicely, so we ship our own viewer. Bloomberg-terminal density, not a marketing surface.

## Primary action

Re-resolve all namespaces (the trigger we hit during the demo to flip `who.*` post-transfer). Secondary: open verify-drawer for any namespace.

## Key data shown

Five namespaces, each resolving live:
- `who.<agent>.<team>.eth` → `ownerOf(tokenId)` on 0G Galileo Testnet
- `pay.<agent>.<team>.eth` → auto-rotating address per resolution (HD-derivation)
- `tx.<txid>.<agent>.<team>.eth` → receipt JSON for a task, pulled from 0G Storage
- `rep.<agent>.<team>.eth` → ERC-8004 ReputationRegistry on Base Sepolia (`0x8004B663…`)
- `mem.<agent>.<team>.eth` → 0G Storage CID for encrypted memory blob

Plus: resolution timing chart, refresh button.

## Demo-critical state

The post-transfer `who.*` flip happens here. After Owner_A clicks *Transfer* and Owner_B confirms, the demo presses the `Re-resolve all` button. The `who.*` row's resolved value ticker-rolls from Owner_A to Owner_B. Each card flashes its border cyan for 200ms during re-resolution.

## Components needed

`ENSNameDisplay` · `NamespaceCard` · `ResolvedValueRow` · `VerifyDrawer` · `HDDerivationPanel` · `ResolutionTimingChart` · `RefreshAllButton` · `ReceiptKVTable`

## Accessibility

- Each namespace card is a landmark; verify-button has `aria-expanded`.
- Re-resolve all button has `aria-busy` during in-flight requests.
- Timing chart has tabular fallback (toggle in card header).
- Resolved values are tabular nums where they're numbers; mono everywhere for addresses/hashes.
- Live updates announced via a single `aria-live="polite"` region — debounced.

## Layout

### 1. Top header — 120px

- The ENS name in Fraunces Black 80px white, letterspacing -0.03em, tabular: `worker-001.<team>.eth`.
- Copy affordance (click name → toast).
- Below in JetBrains Mono 14px muted slate: `ENSIP-10 CCIP-Read · resolver gateway: <gateway-host>`.
- Right edge: a small `Live` pill — emerald 1px border, breathing dot, caps-sm mono — confirming the resolver gateway is responding.

### 2. Capability tree main area — auto height

Five horizontally tall cards stacked vertically with 16px gap. Each card 1px `#272A35` border, no shadow, 4px corner radius, `#13151C` background, 24px internal padding.

### Card heights (variable — depends on payload):

- `who.*` — 160px
- `pay.*` — 200px (5 rotated rows + master pubkey row)
- `tx.*` — 240px (parsed receipt KV table)
- `rep.*` — 240px (5 latest signed feedback records)
- `mem.*` — 160px

### Card anatomy (per namespace)

**Header row (40px):**
- Namespace name in caps-md mono cyan: `WHO.*`
- 12px gutter.
- One-line description in Inter 12px Regular muted slate: `live ownerOf() against 0G Galileo Testnet`
- Right edge: small latency pill — JetBrains Mono 11px muted (`84ms`) — green if < 200ms, amber if 200–800ms, red if > 800ms or stale.

**Resolved value(s) section (variable):**

#### `who.*`
- Single row, 32px tall.
- Resolved value in JetBrains Mono 14px white: `0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1`.
- Right edge of the row: `Verify resolution` text-only cyan button.

#### `pay.*`
- Master pubkey row (32px, 8px below header):
  - Caps-sm mono muted: `MASTER PUBKEY`
  - 8px gap, value in JetBrains Mono 12px muted gold-dim, truncated middle.
- Below that, divider `#272A35` 1px.
- Five rotation rows, 24px tall each:
  - `[address @ nonce 0]` — JetBrains Mono 12px white, address truncated middle, with `@ nonce 0` in muted slate.
  - Most recent rotation at top.
- Right edge of each row: tiny `Verify derivation` text-only cyan button. Drawer reveals client-side HD-derivation check (master pubkey, nonce, derived child address, ✓ if match).

#### `tx.*`
- Parsed receipt as a KV table.
- 4 rows minimum: `task_id` · `submitted_at` · `worker_signature` · `result_cid`.
- Each row 32px: caps-sm mono muted slate label left, JetBrains Mono 12px white value right (truncated where appropriate).
- Right edge of card: `Open raw JSON` text-only cyan button — opens a drawer with the full unparsed receipt.

#### `rep.*`
- Five signed feedback records, 28px tall each.
- Each row: `[employer-address-truncated]  ★4.7  "delivered as spec'd"`
  - Mono 12px for the address, Inter 12px white for the comment, cyan stars (5 max, filled vs muted).
  - Right edge: tx hash truncated + `↗` to BaseScan Sepolia.

#### `mem.*`
- Single row showing the current 0G Storage CID in JetBrains Mono 14px white.
- Below: caption Inter 12px muted slate `encrypted memory blob · last updated 4 min ago`.
- Right edge: `Open in 0G Storage` text-only cyan button.

**Verify drawer (per row):**
- Inline below the row, 1px top divider, expands on click with 200ms ease-out.
- Contains: raw resolver gateway response (formatted JSON, JetBrains Mono 11px), signed payload (mono), and for `pay.*` the HD-derivation check UI.
- HD-derivation check renders rotation as `[address A · derived from master @ nonce 0] [address B · derived from master @ nonce 1] …` with a `✓` if the client-side check matches.
- Never a hex dump.

### 3. Right rail — 320px wide, sticky

Two cards, 16px vertical gap.

- **`RESOLUTION TIMING` card** — 240px tall:
  - Header: `RESOLUTION TIMING` caps-md muted slate.
  - Small line graph (180px tall): five colored lines (one per namespace, each in a distinct cyan/gold/white tint) over the last 60 seconds. JetBrains Mono 11px axis labels. Hover shows specific lookup latency + namespace name.
- **`REFRESH` card** — 96px tall:
  - Header: `REFRESH` caps-md muted slate.
  - Single full-width cyan filled button: `Re-resolve all` — Inter SemiBold 14px, 44px tall, 4px radius.
  - This is the trigger we press during the demo to flip `who.*` post-transfer.
  - Below the button: `~ 240ms typical` in JetBrains Mono 11px muted.

## Behavior

- On `Re-resolve all` press: each namespace card flashes its border cyan for 200ms ease-out. Latency pills re-render. Resolved values that change ticker-roll digit-by-digit (400ms). The `who.*` flip post-transfer is the punchline.
- Cards never collapse — always show their full payload. No accordion behavior.

## Design principles to enforce

- **Bloomberg terminal, not ENS app skin.** Mono everywhere for resolved values, addresses, hashes, CIDs.
- **No marketing surface energy.** No "Verified by ENS" decorative badges. No celebratory check confetti.
- **The `Re-resolve all` button must feel weighty** — pressing it during the demo is the trigger that flips `who.*`. Make the press sequence satisfying without being cute.
- **HD-derivation verification UI must NOT look like a hex dump.** Render rotation with explicit labels — `[address · @ nonce N]` — never just a list of bare addresses.

## Iteration prompts to have ready

- "Tighten card vertical gap from 16px to 12px."
- "Drop ENS name to 72px; the data underneath is the hero, not the name."
- "Add a `Pause auto-refresh` toggle next to the `Re-resolve all` button."
- "Reduce `pay.*` rotation rows from 5 to 3 — most recent + previous two."
- "Make the latency pill render `<` symbols (e.g. `<200ms`) so it doesn't jitter on each re-resolve."
