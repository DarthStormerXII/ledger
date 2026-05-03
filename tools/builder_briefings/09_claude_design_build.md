# Builder Session: CLAUDE DESIGN — implement the Ledger App from claude.ai/design

**Mode change.** This session was previously in staging mode (preparing prompts for the user to drive `claude.ai/design`). The user has now finished `claude.ai/design` and produced the design file. **Switch to BUILD mode.**

**Effort:** xHigh thinking. Set via `/effort xhigh` if not already.

**Lead surface:** `surface:60`. Use only for major milestones or genuinely-blocking questions.

---

## What you're building

A Next.js **16** (NOT 14, NOT 15 — explicitly the latest 16) frontend that implements the design the user just produced at `claude.ai/design`. The design is at:

```
https://api.anthropic.com/v1/design/h/AyH9pKYenzrykS73guBMIA?open_file=Ledger+App.html
```

Specifically the file: **`Ledger App.html`**

Try fetching this URL via WebFetch first. If it requires authentication (claude.ai design API may not be publicly accessible without the user's session), inform Lead via `[QUESTION:claude-design]` and propose alternatives — e.g. ask the user to copy the HTML into the repo.

The design is the source of truth for the visual surface. Match it as closely as possible. The previously-staged briefs at `design/screens/`, `design/brand.md`, and `design/frames/` describe what we asked the platform to produce; the actual output is in the URL above.

---

## Required reading (in order)

1. The design URL above — fetch and read
2. `/Users/gabrielantonyxaviour/Documents/products/ledger/docs/05_CLAUDE_DESIGN_BRIEF.md` — the canonical UI spec; describes the 6 screens that should exist (the Hall, Auction Room, Worker Profile, Inheritance Modal, Settlement Status Strip, Capability Tree Viewer)
3. `/Users/gabrielantonyxaviour/Documents/products/ledger/docs/09_BRAND_IDENTITY.md` — palette, fonts, voice
4. `/Users/gabrielantonyxaviour/Documents/products/ledger/tools/builder_briefings/08_demo_video_guide.md` — the demo video composition; specifically which screens hold for ≥3 seconds (Worker Profile, Auction Room, Inheritance Modal mid-transfer) — those need to be **frame-perfect**
5. `/Users/gabrielantonyxaviour/Documents/products/ledger/proofs/0g-proof.md` — live contract addresses
6. `/Users/gabrielantonyxaviour/Documents/products/ledger/proofs/axl-proof.md` — live AXL endpoints + peer IDs
7. `/Users/gabrielantonyxaviour/Documents/products/ledger/proofs/ens-proof.md` — live ENS resolver gateway URL + parent name
8. The integration SDK at `integration/sdk/` (the integration session is building `BuyerAgent` + `WorkerAgent` classes) — your frontend consumes these as the data layer. If they're not yet shipped, scaffold to consume the shape they're going to expose; coordinate with the integration session via `cmux send --surface surface:91` if needed.

---

## Setup — Next.js 16 specifically

The user explicitly wants **Next.js 16**, not 14 or 15. Verify the version before scaffolding. Use:

```bash
npx create-next-app@latest frontend --typescript --tailwind --app --turbopack --use-pnpm
```

This should give you Next.js 16+ with the App Router. Verify via `cat frontend/package.json | grep next` after scaffolding.

If `create-next-app@latest` doesn't pull 16+, pin explicitly: `npx create-next-app@16 frontend ...`

Add to dependencies:

```bash
cd frontend
pnpm add ethers viem wagmi
pnpm add @tanstack/react-query
pnpm add -D @types/node
```

Plus shadcn/ui setup per the standard pattern.

---

## Live integrations to wire

The frontend reads + writes from the live testnet stack. Concrete addresses + endpoints:

```
# 0G Galileo Testnet (chainId 16602, native 0G token)
GALILEO_RPC=https://evmrpc-testnet.0g.ai
GALILEO_CHAIN_ID=16602
WORKER_INFT_ADDRESS=0x48B051F3e565E394ED8522ac453d87b3Fa40ad62
LEDGER_ESCROW_ADDRESS=0x12D2162F47AAAe1B0591e898648605daA186D644
LEDGER_IDENTITY_REGISTRY_ADDRESS=0xa6a621e9C92fb8DFC963d2C20e8C5CB4C5178cBb
MOCK_TEE_ORACLE_ADDRESS=0x229869949693f1467b8b43d2907bDAE3C58E3047

# Base Sepolia (chainId 84532)
BASE_SEPOLIA_RPC=https://sepolia.base.org
ERC8004_REPUTATION_REGISTRY=0x8004B663056A597Dffe9eCcC1965A193B7388713

# Ethereum Sepolia L1 (chainId 11155111) — for ENS
SEPOLIA_RPC=https://ethereum-sepolia-rpc.publicnode.com
LEDGER_ENS_PARENT=ledger.eth
LEDGER_ENS_RESOLVER_CONTRACT=0xcfF2f12F0600CDcf1cebed43efF0A2F9a98ef531
LEDGER_ENS_GATEWAY_URL=<ngrok URL — get from ENS builder via surface:86 or proofs/ens-proof.md>

# Gensyn AXL
AXL_BOOTSTRAP_TLS=tls://66.51.123.38:9001
AXL_LOCAL_API=http://localhost:9002

# Demo state
DEMO_TOKEN_ID=1
DEMO_OWNER_A=0x6B9ad963c764a06A7ef8ff96D38D0cB86575eC00
DEMO_OWNER_B=0x6641221B1cb66Dc9f890350058A7341eF0eD600b
DEMO_MEMORY_CID=0g://0xd8fb3ad312ca5e9002f7bdd47d93839b9a6dcd83d396bb74a44a9f65344982c4
DEMO_ATTESTATION_DIGEST=0x59c79e5a43357945f442a2417cd7aabf2c74b19708dc97e839ec08e1ae223950
```

Put these in `frontend/.env.local` (NOT committed) and `frontend/.env.example` (committed, with placeholder values).

For the resolver gateway URL, ask the ENS builder via cmux send if it's not in `proofs/ens-proof.md` yet, OR just resolve `who.worker-001.ledger.eth` from a Sepolia RPC client side and you'll go through the Universal Resolver automatically.

---

## What the frontend must do

The 6 screens from `docs/05_CLAUDE_DESIGN_BRIEF.md`, mapped to App Router pages:

| Route | Screen | Demo-critical? |
|---|---|---|
| `/` | The Hall (live activity feed, top workers) | Yes — opening shot of demo |
| `/jobs/[id]` | Auction Room (live bidding visualization) | Yes — held for ~30s in demo |
| `/workers/[id]` | Worker Profile (the iNFT detail page in 96px Fraunces) | **YES — hero frame, held 3+ seconds in 96px Fraunces with capability tree on right** |
| `/transfer/[id]` | Inheritance Modal (live ENS resolution flip during transfer) | **YES — the 2:50–3:15 punchline** |
| Component | Settlement Status Strip (per-leg ✓/⏳ visualization) | Yes — visible during settlement |
| `/agent/[ens-name]` | Capability Tree Viewer (custom ENS text-record renderer) | **YES — judges should be able to deep-link here** |

For demo-critical screens, match the design EXACTLY — pixel parity matters when the camera holds for 3+ seconds.

### Data layer

Two options for how the frontend reads chain state:

**Option A (recommended):** Consume the integration SDK at `integration/sdk/` directly. Import `BuyerAgent` and `WorkerAgent` and use them in client components (with proper "use client" directives) for live updates. Use `@tanstack/react-query` for caching and revalidation.

**Option B (fallback if integration SDK isn't ready):** Hit RPCs directly via `viem` + `wagmi`. Use Server Actions for mutations, client components for live data with SWR-style polling.

Coordinate with the integration session (`surface:91`) — they're building the SDK shape now. If they have it ready, import it. If not, scaffold to consume the shape they document in `integration/README.md`.

### Specific component requirements (from the design + briefs)

- **Worker Profile** opens with the ENS name `worker-001.ledger.eth` in **96px Fraunces** at the top. Capability tree (`who/pay/tx/rep/mem`) on the right side, each row showing the resolved value.
- **Settlement Status Strip** is a thin component showing per-leg settlement (`USDC paid on Base ✓ / Reputation feedback recorded on Base ✓ / 0G Storage CID updated ✓`) with `pending_reconcile` state if any lags.
- **Inheritance Modal** has a "Live ENS Resolution" panel showing `who.worker-001.ledger.eth` resolving to old owner pre-transfer, then to new owner post-transfer with a real-time refresh trigger.
- **Capability Tree Viewer** at `/agent/[ens-name]` renders all 5 namespaces with verify-derivation buttons for the rotating `pay.*` HD-derivation chain.

### Brand discipline

Per `docs/09_BRAND_IDENTITY.md`:
- Background: deep ink `#0A0E1A`
- Primary: pale gold `#E8D4A0` (sparingly, for value/earnings)
- Accent: electric cyan `#5FB3D4` (for live activity)
- Display font: Fraunces (serif)
- Body font: Inter
- Mono: JetBrains Mono

Do NOT use:
- Generic placeholder values ("John Doe", "Lorem ipsum", "0x000…")
- Skeleton loaders everywhere (only where data genuinely loads async)
- Search input with magnifying-glass icon inside (banned per `~/.claude/rules/ui-rules.md`)
- Stat-card grid as a hero on the dashboard (the Hall)

---

## Definition of done

1. Next.js 16 frontend scaffolded at `frontend/`, `pnpm dev` works
2. All 6 screens implemented per the design
3. Live data flowing from the testnet stack — at least: Worker Profile reads `ownerOf(1)` from Galileo, Capability Tree Viewer renders all 5 namespaces resolving live
4. Inheritance Modal demonstrates the cross-chain ENS resolution flip in a UI test
5. Settlement Status Strip shows real per-leg settlement state during a test task
6. Brand discipline (palette + fonts + voice) is correct
7. No `console.log`, no `any`, no broken imports
8. `pnpm build` succeeds
9. `pnpm lint` passes
10. Deployed to Vercel (or comparable) with environment variables set
11. README at `frontend/README.md` explaining how to run + what's wired

---

## Coordination

The integration session (`surface:91`) is building `BuyerAgent` + `WorkerAgent` SDK that you should consume. If you need their interface signatures, send `cmux send --surface surface:91 "[QUESTION-FE-TO-INT] need BuyerAgent + WorkerAgent type signatures for frontend consumption"`.

The ENS session (`surface:86`) has the resolver gateway URL. If it's not in `proofs/ens-proof.md`, ask via `[QUESTION-FE-TO-ENS]`.

---

## Tone

- Don't ask permission. Make decisions, document them, keep moving.
- Don't stop after first pass. Iterate. Pixel parity with the design matters for hero frames.
- The user wants this **xHigh effort** — take the time to think through component architecture, state management, and live data wiring carefully before writing code.

## How to report back

Per major milestone:
```bash
cmux send --surface surface:60 "[BUILDER:claude-design] <milestone> done"
cmux send-key --surface surface:60 Enter
```

On full completion:
```bash
cmux send --surface surface:60 "[BUILDER:claude-design] FRONTEND DONE — Next.js 16 at frontend/, deployed at <url>"
cmux send-key --surface surface:60 Enter
```

Blocking question:
```bash
cmux send --surface surface:60 "[QUESTION:claude-design] <specific question>"
cmux send-key --surface surface:60 Enter
```

Begin. Switch effort to xHigh first.
