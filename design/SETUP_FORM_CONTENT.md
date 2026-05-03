# claude.ai/design — "Set up your design system" form content

Open the form, then fill in these fields verbatim. Skip the rows marked Skip.

---

## Field 1 — Company name and blurb

Paste this into the first textarea (it's a small box but accepts a paragraph fine):

```
Ledger — the trustless hiring hall for AI agents. A two-sided marketplace built for ETHGlobal Open Agents 2026 where AI workers (each represented by an iNFT on 0G Galileo Testnet) bid on jobs over a peer-to-peer mesh, execute under sealed inference, and accumulate signed reputation. Workers themselves are tradeable: when an iNFT changes hands, the worker keeps its name, reputation, memory, and skills — only the destination wallet for future earnings flips, with ENS resolution following ownerOf() live and cross-chain. Bloomberg-terminal aesthetic, not consumer crypto. Dark, restrained, institutional.
```

---

## Field 2 — Link code on GitHub

**Skip.** Repo isn't public yet. Connect later when `frontend/` is initialized so the platform can sync component patterns.

---

## Field 3 — Link code from your computer

**Skip.** No frontend code to attach yet.

---

## Field 4 — Upload a .fig file

**Skip.** No Figma reference. The screen briefs in `design/screens/*.md` ARE the spec.

---

## Field 5 — Add fonts, logos and assets

Drag-drop the TTFs from `design/assets/fonts/` (already downloaded for you):

- `design/assets/fonts/Fraunces/` — 2 variable TTFs (roman + italic, all weights)
- `design/assets/fonts/Inter/` — 2 variable TTFs (roman + italic)
- `design/assets/fonts/JetBrainsMono/` — 5 TTFs (Regular, Medium, SemiBold, Bold, Italic)

You can drag the three folder contents in one go — the platform will accept multi-file drops. **Total: 9 font files.**

**No logo to upload yet** — the brand mark is on the Day 0 to-do list. When you generate the standalone mark via Higgsfield/image-gen, drop it back into the design system later.

**Reference screenshots (optional, recommended):** if you want to anchor the aesthetic visually, drop in:
- A Linear app screen (workspace inbox or roadmap)
- A Polymarket market detail page (dark, dense)
- A luxury watch product page (institutional restraint)

These haven't been pre-fetched. Skip if you don't have them on hand — the brand notes below carry the aesthetic.

---

## Field 6 — Any other notes?

Paste this verbatim into the bottom textarea. It's the brand contract — palette, typography, voice, layout, animation — all the constraints the platform needs to stop generating generic SaaS UI:

```
AESTHETIC
Confident, restrained, slightly futuristic. Linear's tightness meets Polymarket's information density meets the quiet luxury of a watch boutique. Bloomberg-terminal energy, not consumer-crypto energy. Institutional-grade software for a new asset class.

BANNED: gradients, glassmorphism, neon greens, rounded blob shapes, rocket/moon iconography, drop shadows, glow effects, robot/brain emoji icons, sparkles, stock photography, exclamation marks, emojis, "amazing"/"awesome"/"sleek" copy, search-icon-inside-search-bar, back-buttons-on-detail-pages, stat-card hero grids, 2x2/3x3 feature card grids, bento layouts, generic placeholders ("John Doe", "Lorem ipsum").

PALETTE (dark only — no light mode)
- Background: deep ink #0A0E1A
- Section bg: warm off-black #13151C
- Surface (cards/modals): #1A1D26
- Border: #272A35 (1px, no shadows)
- Text primary: warm white #F5F2EB (NEVER #FFFFFF)
- Text muted: slate #7A8290
- Text disabled: #4A5060
- GOLD #E8D4A0: money values only + brand wordmark. Max 3 appearances per screen. Never for buttons, decoration, or icons.
- CYAN #5FB3D4: live activity, primary buttons, links, AXL packets. Never for money. Never for static decoration.
- Success #4A8B6F · Warning #D4A347 · Danger #C97064 — status badges only.

TYPOGRAPHY
- Display: Fraunces — wordmark, hero numbers, names. Black, ExtraBold, SemiBold weights.
- Body: Inter — paragraphs, labels, buttons. Regular, Medium, SemiBold.
- Mono: JetBrains Mono — addresses, hashes, CIDs, log lines, peer IDs.
- Numbers in Fraunces, words in Inter — religiously. Money/counts/ratings → serif. Everything else → grotesque.
- Tabular figures (font-feature-settings: 'tnum') on every number that can change.
- Mono for anything copy-pasteable. Body font on a hash = reject.
- One bold typographic moment per screen. Don't compete with it.

TYPE SCALE
- display-xl: 96px Fraunces Black, -0.03em — hero numbers + the ENS name on Worker Profile
- display-md: 48px Fraunces ExtraBold, -0.02em — stats grid values
- display-sm: 32px Fraunces SemiBold, -0.01em — modal headers
- body-lg: 18px Inter Medium — job titles
- body-md: 14px Inter Regular — default body
- mono-md: 14px JetBrains Mono — addresses, hashes
- caps-md: 12px Inter SemiBold UPPERCASE 0.08em — section headers
- caps-sm: 10px Inter SemiBold UPPERCASE 0.10em — pills, status badges

VOICE
Spare. Precise. Cold. Confident. Bloomberg terminal, not social app. Status messages: "Worker accepted." "Payment landed in 4s." "Reputation +1." "Bid won." NEVER "Successfully completed transaction" / "🎉 Yay!" / "We've updated...". Never exclamation marks. Never emojis.

LAYOUT
- 12-column grid, 80px max gutter, 24px page padding
- Cards: 1px border #272A35, no drop shadows, 4px radius
- Buttons: solid fill, 4px radius, no gradients, no glow
- Modals: 80% backdrop dim (rgba(10,14,26,0.8)), 8px radius
- Data tables: zebra-striped #13151C alternating, 1px row border
- Status pills: small caps mono, single-color 1px border

ANIMATION
- Default: 200ms ease-out
- Bid arrivals: scale 0.95 → 1.0 + fade
- Number tickers: digit-roll, 400ms
- AXL topology packets: linear motion, 1.2s end-to-end
- iNFT transfer ceremony: 1.5s with particle stream reversal
- Live data feels alive — subtle pulses, smooth tickers, never abrupt state changes
- Respect prefers-reduced-motion (snap to final value)

ICONOGRAPHY
- Lucide React for utility ONLY (close, search, settings, copy, external-link, chevron). Stroke 1.5, muted slate, white on hover.
- Custom geometric forms for hero/identity contexts. Worker portraits look like watch dials — concentric circles + hex pattern overlays. NEVER faces. NEVER robots. NEVER avatars. NEVER emoji-style.

PRINCIPLES
1. Money is sacred. Gold appears only on the single most important monetary value, the wordmark, and at most one scoped earnings figure.
2. Live data feels alive — subtle pulses on new bids, smooth number tickers, no abrupt state changes.
3. The iNFT is the hero. Every worker has a visual identity. Treat portraits like watch dials — symmetrical, precise, refined.
4. Density over whitespace. Information-rich, not airy.
5. One bold typographic moment per screen, usually a single huge number or huge name in Fraunces.

PHOTOGRAPHY: NONE. No stock photos. No abstract data photographs. No gradient hero images. Every visual is custom geometric, cinematic (used sparingly), pure typography, or on-chain data rendered as UI. This signals: software, not lifestyle.

SCREENS TO BUILD (in order — full briefs to follow per screen):
1. The Hall (homepage / live activity feed) — hero is "12,847.50 USDC" in 96px Fraunces gold
2. The Auction Room (live bidding screen we record for the demo) — three worker bid cards + AXL topology
3. Worker Profile (/agent/<ens-name>) — 96px Fraunces ENS name, capability tree, stats grid, attestation badge
4. Inheritance Modal (visual climax of the demo) — particle stream reversal, live ENS resolution flip
5. Settlement Status Strip (56px component) — 3 settlement legs, honest "PENDING_RECONCILE" UI
6. Capability Tree Viewer (/agent/<ens-name>) — 5 namespace cards with live resolution + verify drawers
```

---

## After clicking "Continue" or "Save"

Open a fresh thread on `claude.ai/design` and paste the contents of `design/01_first_prompt.md` to start Screen 1 (The Hall).

Each subsequent screen has its own paste-ready brief in `design/screens/*.md`. The 3 demo-critical still compositions are in `design/frames/*.md`.

Standby on this Claude Code session for refinement questions during your design run.
