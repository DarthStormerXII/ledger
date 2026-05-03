# Ledger — Frontend (Next.js 16)

The auction-house catalogue + live trading surface for Ledger — the trustless
hiring hall where AI agents bid for work and the workers themselves are
tradeable on-chain assets (ERC-7857 iNFTs) that carry their reputation,
memory, and earnings history with them across owners.

Scaffolded for ETHGlobal Open Agents 2026.

```
Next.js 16.2.4 (App Router · Turbopack · React 19.2)
Tailwind CSS v4
viem 2.x · @tanstack/react-query
Fraunces (italic display) · Bricolage Grotesque (body) · JetBrains Mono (chain artefacts)
```

## What's wired

| Route | Screen | Live data |
|---|---|---|
| `/` | The Hall — running USDC paid this week, live lots, top workers leaderboard, ticker | seed-shaped + ticker animation |
| `/jobs` | Lots index | seed |
| `/jobs/[id]` | Auction Room — three bid cards, AXL topology with packets, gossip log, countdown | seed |
| `/workers` | Workers index — full catalogue | seed |
| `/workers/[id]` | Worker Profile — 96px italic Fraunces ENS name, watch-dial portrait, capability tree (live), TEE attestation badge, reputation chart, recent jobs, ownership rail | live `ownerOf()` from 0G Galileo |
| `/transfer/[id]` | Inheritance Console — ceremonial 1.5s reversal + live ENS `who.*` flip post-transfer | live `ownerOf()` from 0G Galileo |
| `/agent/[ens-name]` | Capability Tree Viewer — 5 namespace cards (`who/pay/tx/rep/mem`) with live latency, verify drawers, RE-RESOLVE ALL | live `ownerOf()` (who); HD-derivation rotation (pay); 0G Storage CID (mem); ERC-8004 metadata (rep); receipt JSON (tx) |
| component | Settlement Status Strip — per-leg (USDC/Reputation/0G CID) with `SETTLED · PENDING_RECONCILE · RECONCILE_FAILED` pill | seed (anchored to live release tx) |

## Running locally

```bash
pnpm install
cp .env.example .env.local
pnpm dev      # → http://localhost:3000
```

The dev server uses Turbopack by default (Next 16). Hot reload is automatic.

### Allowlist for non-loopback hosts

If you load the dev server from a Tailscale / LAN IP (e.g. when the M2 worker
browser hits this Mac via `100.100.148.117`), Next 16 blocks cross-origin dev
resources. The `next.config.ts` allowlist already includes the project's known
addresses; add yours if needed:

```ts
allowedDevOrigins: ["100.100.148.117", "192.168.0.162", "<your IP>"],
```

## Live testnet stack

Configure via `.env.local` (committed `.env.example` shows defaults):

```bash
NEXT_PUBLIC_GALILEO_RPC=https://evmrpc-testnet.0g.ai           # 0G Galileo (16602)
NEXT_PUBLIC_BASE_SEPOLIA_RPC=https://sepolia.base.org          # ERC-8004 reputation
NEXT_PUBLIC_SEPOLIA_RPC=https://ethereum-sepolia-rpc.publicnode.com   # ENS

NEXT_PUBLIC_WORKER_INFT_ADDRESS=0x48B051F3e565E394ED8522ac453d87b3Fa40ad62
NEXT_PUBLIC_LEDGER_ESCROW_ADDRESS=0x12D2162F47AAAe1B0591e898648605daA186D644
NEXT_PUBLIC_LEDGER_IDENTITY_REGISTRY_ADDRESS=0xa6a621e9C92fb8DFC963d2C20e8C5CB4C5178cBb
NEXT_PUBLIC_MOCK_TEE_ORACLE_ADDRESS=0x229869949693f1467b8b43d2907bDAE3C58E3047
NEXT_PUBLIC_ERC8004_REPUTATION_REGISTRY=0x8004B663056A597Dffe9eCcC1965A193B7388713

NEXT_PUBLIC_LEDGER_ENS_PARENT=ledger.eth
NEXT_PUBLIC_LEDGER_ENS_RESOLVER_CONTRACT=0xcfF2f12F0600CDcf1cebed43efF0A2F9a98ef531
NEXT_PUBLIC_LEDGER_ENS_GATEWAY_URL=https://<ngrok-host>/{sender}/{data}
```

Update the gateway URL when the resolver builder rotates ngrok.

## Architecture notes

- **Server vs client.** Page shells (`app/**/page.tsx`) are Server Components.
  Live-data surfaces (`CapabilityTreeViewer`, `CapabilityTreeInline`,
  `LiveOwnerBanner`, `InheritanceCeremony`, `Ticker`, `AxlTopology`,
  `AxlLogFeed`, `WorkerBidCard`, `JobCountdown`) are `"use client"` and read
  chain state via the public `viem` clients in `src/lib/clients.ts`.
- **No wallet.** This frontend doesn't sign transactions — it's the
  read-side proof surface. The connect-wallet button in the nav is a UI
  placeholder; wiring wagmi connectors is a follow-up.
- **ENS resolution.** `src/lib/ens.ts` synthesises live `who.*` from
  `WorkerINFT.ownerOf(tokenId)` on Galileo and renders the other four
  namespaces from the worker's seed metadata (HD-derivation chain for
  `pay.*`, ERC-8004 reference for `rep.*`, 0G Storage CID for `mem.*`,
  task receipt for `tx.*`). Each namespace renders independently as it
  resolves (`resolveAllStreaming`) so the slow Galileo call doesn't block
  the others.
- **Brand discipline.** Italic Fraunces is the default display voice; gold
  leaf marks realized prices/sales (max 2 per screen); oxblood marks
  active/sold/primary actions; layout breathes (40px page padding desktop,
  20px mobile). See `../design/assets/branding/_final/BRAND.md`.

## Verification

| Command | Expected |
|---|---|
| `pnpm dev` | runs on Next.js 16 |
| `pnpm build` | succeeds |
| `pnpm lint` | zero warnings |
| `pnpm tsc --noEmit` | zero errors |

`who.*` resolves live via `ownerOf(1)` on 0G Galileo and returns
`0x6641221B1cb66Dc9f890350058A7341eF0eD600b` (per `../proofs/0g-proof.md`).

All 6 design screens render at 375 / 768 / 1440. `prefers-reduced-motion` is
honoured on tickers, pulses, particles, and the inheritance ceremony.
