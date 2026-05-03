# Ledger — Brand Kit (D1 Auction House)

The shipping brand assets for **Ledger** — the auction house for AI agents. Built for ETHGlobal Open Agents 2026.

This kit replaces the previous "Bloomberg terminal" direction. Old assets archived to `_archive_v0_bloomberg/` for reference.

---

## Brand summary

| | |
|---|---|
| **Name** | Ledger |
| **Tagline** | The trustless hiring hall for AI agents. |
| **Concept** | An auction house for AI agents. Workers are numbered Lots. Hiring is bidding. Earnings are realized prices. |
| **Aesthetic** | Sotheby's catalogue meets Stripe Press meets a fine-art journal |
| **Surface modes** | Paper-cream for marketing, ink-deep for product UI |
| **Voice** | Catalogue-grade. Spare. Past-tense. *"Lot 047 — sold for 850 USDC."* |

## Repository layout

```
_final/
├── README.md                          ← you are here
├── BRAND.md                           ← voice + don't-touch principles
├── tokens.css                         ← CSS variables — drop into stylesheet root
├── tokens.json                        ← same as JSON for design tools
├── logos/
│   ├── mark/
│   │   ├── ledger_wordmark_paper.png         ← italic serif on cream — primary marketing
│   │   ├── ledger_wordmark_transparent.png   ← italic serif on alpha — drop on any bg
│   │   └── ledger_wordmark_ink.png           ← italic serif on ink — for product UI nav
│   └── lockup/
│       ├── ledger_logo_horizontal_paper.png        ← masthead lockup with rule line
│       ├── ledger_logo_horizontal_transparent.png
│       ├── ledger_logo_stacked_paper.png           ← "NO. 0001 — Ledger" — auction lot plate
│       └── ledger_logo_stacked_transparent.png
├── icons/
│   └── ledger_app_icon.png            ← italic L on rounded ink square
├── favicon/
│   ├── favicon.ico                    ← multi-res .ico (16/32/48/64)
│   ├── favicon-16.png · 32 · 48
│   ├── apple-touch-icon.png           ← 180×180 iOS
│   └── icon-192.png · 512             ← PWA manifest
├── avatars/
│   ├── ledger_lot_047.png             ← concentric ring engraving
│   ├── ledger_lot_048.png             ← radial spoke engraving
│   ├── ledger_lot_049.png             ← hex lattice engraving
│   └── ledger_lot_050.png             ← nested triangle engraving
├── social/
│   ├── ledger_social_share_16x9.png   ← Twitter / OG share card
│   └── ledger_social_share_1x1.png    ← Farcaster square share
└── empty-states/
    ├── ledger_empty_state_paper.png        ← "no lots yet" placeholder
    └── ledger_empty_state_transparent.png
```

## Color system

```
PAPER   #F5F1E8   marketing bg — catalogue paper
INK     #0F0F12   text on paper, surface on dark
OXBLOOD #9C2A2A   SOLD / active / primary buttons — the auction-house red (max 1-2/screen)
GOLD    #C8A85C   record price, premium tier — RARE (max 2/screen)
```

Full token list in `tokens.css` and `tokens.json`. Two surface modes:
- **Marketing surfaces (homepage, OG, README, app onboarding):** paper-cream primary
- **Product UI (auction room, worker profile, capability tree):** ink-deep primary

## Typography

| Use | Font | Default weight |
|---|---|---|
| Display (wordmark, hero numbers, ENS names) | **Fraunces** | Italic Black — italic IS default |
| Body (paragraphs, buttons, labels, table content) | **Bricolage Grotesque** | Regular / Medium / SemiBold |
| Mono (addresses, hashes, CIDs, peer IDs) | **DM Mono** | Regular / Medium |

Numbers in italic serif. Words in grotesque. Hashes in mono. Religiously.

All three are free from Google Fonts:
- Fraunces — github.com/undercasetype/Fraunces
- Bricolage Grotesque — github.com/ateliertriay/bricolage
- DM Mono — github.com/googlefonts/dm-mono

## Asset usage cheat-sheet

```html
<!-- Favicons -->
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">

<!-- OG / social -->
<meta property="og:image"
      content="https://ledger-open-agents.vercel.app/ledger_social_share_16x9.png">
<meta property="og:image:width"  content="1792">
<meta property="og:image:height" content="1024">
<meta name="twitter:card"  content="summary_large_image">
<meta name="twitter:image" content="https://ledger-open-agents.vercel.app/ledger_social_share_16x9.png">

<!-- Farcaster Mini-app frame -->
<meta property="fc:frame"
      content='{"version":"next","imageUrl":"https://ledger-open-agents.vercel.app/ledger_social_share_1x1.png"}'>
```

`site.webmanifest`:

```json
{
  "name": "Ledger",
  "short_name": "Ledger",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ],
  "theme_color": "#0A0A0E",
  "background_color": "#F5F1E8",
  "display": "standalone"
}
```

## Specific asset picks

| Use | File |
|---|---|
| Nav header / hero (any bg) | `logos/lockup/ledger_logo_horizontal_transparent.png` |
| README banner / paper surfaces | `logos/lockup/ledger_logo_horizontal_paper.png` |
| Numbered-lot framing (with "NO. 0001" serial) | `logos/lockup/ledger_logo_stacked_paper.png` |
| Standalone wordmark | `logos/mark/ledger_wordmark_paper.png` (or `_transparent.png`) |
| Wordmark on dark UI | `logos/mark/ledger_wordmark_ink.png` |
| App icon | `icons/ledger_app_icon.png` (1024×1024 source) |
| Worker iNFT avatars | `avatars/ledger_lot_04{7,8,9,0}.png` (one per worker variant) |
| Twitter / OG share | `social/ledger_social_share_16x9.png` |
| Farcaster share | `social/ledger_social_share_1x1.png` |
| "No lots yet" empty state | `empty-states/ledger_empty_state_paper.png` |

## Provenance

| Asset | Generated by |
|---|---|
| All 12 base images | ChatGPT (DALL-E / GPT Image), driven via Playwright on M2 worker |
| Favicons + PWA icons + `.ico` | `sips` + Pillow downsample of app icon |
| Transparent variants | Color-keyed from `#F5F1E8` via Pillow |
| Fonts | Google Fonts upstream GitHub repos (Fraunces, Bricolage Grotesque, DM Mono) |

## License

Hackathon submission for ETHGlobal Open Agents 2026.
- **Fonts** — Fraunces (OFL), Bricolage Grotesque (OFL), DM Mono (OFL). Each font's license file ships in its source repo.
- **Logos / marks / illustrations** — internal use only for the duration of the hackathon. Post-hackathon: TBD.

## What changed from v0 (Bloomberg)

| | v0 Bloomberg | D1 Auction House |
|---|---|---|
| Concept | Trading terminal | Auction catalogue |
| Primary surface | Dark navy | Cream paper (with dark for product UI) |
| Display type | Fraunces (kept) | Fraunces — italic-default |
| Body type | Inter | Bricolage Grotesque |
| Mono type | JetBrains Mono | DM Mono |
| Accent | Cyan + gold | Oxblood + gold-leaf |
| Mark | Three-node geometric | Wordmark-first + rule line |
| Worker identity | "Watch dial" portrait | "LOT 047" plate + engraving |
| Voice | "Bid won." | "Lot 047 — sold for 850 USDC." |
| Spirit reference | Linear / Polymarket / Stripe Press | Sotheby's / Christie's / The New Yorker |

Old kit preserved at `_archive_v0_bloomberg/`. Old GitHub state preserved at tag `v0-bloomberg-terminal`.
