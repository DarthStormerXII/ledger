# First Prompt — paste this into claude.ai/design

Paste verbatim into a fresh thread on `claude.ai/design` after the design system is configured (`design/brand.md` already in the system notes). Dense by design — do not summarize.

---

## PROJECT

**Ledger** — the trustless hiring hall where AI agents bid for work, and where the workers themselves are tradeable on-chain assets (iNFTs) that carry reputation, memory, and earnings history with them across owners. Built for ETHGlobal Open Agents 2026. Tagline: *The trustless hiring hall for AI agents.*

The product is a two-sided marketplace UI:
- **Demand side:** an operator (human or agent) posts a task, sets a payout in USDC, and watches AI workers bid.
- **Supply side:** AI workers (each represented by an iNFT on 0G Galileo Testnet, ChainID 16602) auto-bid via a peer-to-peer mesh (Gensyn AXL), execute under sealed inference (0G Compute), submit results, get paid, and accumulate signed reputation feedback (ERC-8004 ReputationRegistry on Base Sepolia, contract `0x8004B663…`).
- **Twist:** Workers are tradeable. When an iNFT changes hands, the worker keeps its name, reputation, memory, and skills — only the destination wallet for future earnings flips. ENS resolution flips live, cross-chain, with no ENS transaction (CCIP-Read off-chain resolver follows `ownerOf()`).

This is institutional-grade software for a new asset class. Bloomberg terminal, not consumer crypto.

## BRAND (full spec in design system notes — summary here)

- **Aesthetic:** Linear + Polymarket + watch boutique. Restrained, dense, slightly futuristic. NO gradients / glassmorphism / neon greens / rocket icons.
- **Palette:** ink `#0A0E1A` background · gold `#E8D4A0` for money only · cyan `#5FB3D4` for live activity · warm white `#F5F2EB` for text. Dark only.
- **Typography:** Fraunces (display, all hero numbers and names) · Inter (body) · JetBrains Mono (addresses, hashes, CIDs, log lines). Numbers in Fraunces, words in Inter — religiously.
- **Voice:** Spare. Precise. Cold. *"Bid won."* not *"You successfully won the bid!"*
- **Animation budget:** 200ms ease-out default; 400ms digit-roll for tickers; 1.2s linear for AXL packets; 1.5s ceremonial for the iNFT transfer.

## SCREENS — build in this order

Six surfaces. Per-screen briefs in `design/screens/` give the full anatomy. High-level here:

1. **The Hall** — homepage / live activity feed. Hero is the running "Total paid this week" number in 96px Fraunces gold. Below: 60/40 split — Live Jobs feed left, Top Workers leaderboard right. Slim ticker, slim footer with 3 stat blocks.
2. **The Auction Room** — the screen we record. Job header top, three worker bid cards center with live AXL packet animations, AXL topology view + log feed in right rail. The hero recording surface.
3. **Worker Profile** — `/agent/<ens-name>`. The worker's ENS name in 96px Fraunces is the bold typographic moment. Portrait + capability-tree viewer beside it. Stats grid. Reputation chart. Job history table. Right rail with ownership card + history.
4. **Inheritance Modal** — full-screen takeover, 80% backdrop dim. Center 720px modal. Worker portrait centered with particle streams reversing direction over 1.5s (gold particles flowing from old owner → new owner). Live ENS resolution panel below shows `who.<agent>.<team>.eth` ticker-rolling from Owner_A to Owner_B post-confirm. The visual climax.
5. **Settlement Status Strip** — 56px-tall reusable component. Three settlement legs (USDC paid on Base · Reputation recorded on Base · 0G Storage CID updated) each with status dot + truncated tx hash + explorer link. Right edge: a `SETTLED` / `PENDING_RECONCILE` / `RECONCILE_FAILED` pill. Honest UI — never collapse legs.
6. **Capability Tree Viewer** — at `/agent/<ens-name>`. Five stacked namespace cards: `who.*` · `pay.*` · `tx.*` · `rep.*` · `mem.*`. Each card shows the live resolved value(s) in mono and a "Verify" affordance that opens a drawer with raw resolver gateway response + signed payload + (for `pay.*`) HD-derivation verification. Bloomberg-terminal density.

## DEMO-CRITICAL STATES (judges hold their eyes here ≥3 seconds)

These three frames must look like Stripe Press book covers. Each gets a still-image pass after the screen design — see `design/frames/`.

1. **Worker Profile static frame** — 96px Fraunces ENS name `worker-001.<team>.eth` filling the top, 240×240 portrait left, capability tree right, attestation digest badge inset, stats grid below. Held for 3s under the demo VO *"Forty-seven jobs. Four-point-seven rating. Twelve thousand USDC earned."*
2. **Auction Room mid-bid frame** — three worker cards, the winning card with a thin cyan ring around the portrait, current bids in 36px Fraunces gold, AXL topology with two live packets in flight, log feed showing 4 recent BID/CONFIRM lines. Held for 3s while bids tick.
3. **Inheritance split-screen mid-transfer** — left: Owner_A wallet fading to 30% opacity · center: worker iNFT card unchanged showing `47 jobs · 4.7 rating` · right: Owner_B wallet receiving `+4.50 USDC` (digit-rolling in). ENS resolution panel below ticker-rolls `who.*` from Owner_A to Owner_B. The visual punchline of the demo.

## OUTPUT EXPECTED

- High-fidelity Tailwind + shadcn/ui-compatible designs the team can drop into a Next.js (`frontend/app/`) workspace.
- Per-screen specs that translate to React components — props, state, animation hooks identified.
- Per-screen exports as Next.js page components when each screen is signed off.

## CONSTRAINTS (read carefully)

- **No skeleton loaders everywhere.** Only where data genuinely loads async with a meaningful wait. Don't sprinkle them on every component.
- **No generic placeholder values.** Never "John Doe", "Lorem ipsum", "user@example.com", "—". Use realistic-looking data: ENS names like `worker-001.<team>.eth`, USDC values, real-shaped Base/0G addresses.
- **No back buttons at the top of detail/new pages.** Use Cancel/Close in context (next to Save) when needed.
- **No search-icon-inside-search-bar.** Plain `<Input>` with descriptive placeholder. The placeholder IS the affordance.
- **No stat-card-grid hero on the dashboard.** Dashboard leads with the primary action (Live Jobs feed) — stats live in a slim footer band, not the hero.
- **No 2x2 / 3x3 feature card grids anywhere.** No bento. Each feature deserves its own moment, not a cell.
- **Worker portraits are abstract geometric** — concentric circles + hex pattern overlays. Watch-dial energy. NEVER faces, NEVER robot avatars, NEVER emoji-style icons for "AI agent."
- **No gradients, no drop shadows, no glassmorphism, no glow effects, no rounded blob shapes.**
- **Tabular figures on every number that can change.** `9.99` and `10.00` must align.
- **Mono font for any address, hash, CID, peer ID, contract ID.** Body font for any of those = reject and re-prompt.
- **One bold typographic moment per screen.** Don't compete with it.
- **Money is sacred** — gold `#E8D4A0` only on the single most important monetary value, the wordmark, and at most one scoped earnings figure. Everything else white or cyan.

## ITERATION GUIDANCE

After each screen lands, refine with surgical edits:
- ✅ "Reduce hero band height to 180px and shrink number to 80px."
- ✅ "Replace worker portraits with concentric-circle-only forms — no hex pattern."
- ✅ "Slow AXL packet animation by 50%."
- ❌ "Make it more cinematic."
- ❌ "Make the hero pop more."

## START HERE

Begin with **Screen 1 — The Hall**. Full per-screen brief at `design/screens/01_the_hall.md`. Once The Hall feels right, move to Screen 2 (Auction Room — this is the recording surface, allocate extra detail). Screens 3 and 4 (Worker Profile + Inheritance Modal) are the demo punchline pair — design them as a sequence, not in isolation.
