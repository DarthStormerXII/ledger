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
| `/` | The Hall — live minted iNFT count, realized 0G, recent chain events, workers leaderboard | live 0G + ERC-8004 reads |
| `/jobs` | Live jobs index | live `TaskPosted` / `PaymentReleased` reads from 0G Galileo |
| `/jobs/[id]` | Auction Room — AXL topology, bridge status, BID message stream, countdown | live `/api/axl/*`; captured proof only when the local bridge is unreachable |
| `/workers` | Workers index — full minted catalogue | live `ownerOf()`, `getMetadata()`, ERC-8004 summary reads |
| `/agent/[ens-name]` | Worker Profile — capability tree, TEE disclosure, reputation, jobs, ownership rail | live iNFT + escrow + ERC-8004 reads |
| component | Settlement Status Strip — escrow release, reputation registry, 0G CID | live release tx when available; explicit empty state otherwise |

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
NEXT_PUBLIC_LEDGER_ENS_RESOLVER_CONTRACT=0xd94cC429058E5495a57953c7896661542648E1B3
NEXT_PUBLIC_LEDGER_ENS_GATEWAY_URL=https://resolver.fierypools.fun/{sender}/{data}
```

The gateway URL is now the durable `resolver.fierypools.fun` Cloudflare tunnel.

## Architecture notes

- **Server vs client.** Page shells (`app/**/page.tsx`) are Server Components.
  Live-data surfaces (`CapabilityTreeViewer`, `CapabilityTreeInline`,
  `LiveOwnerBanner`, `InheritanceCeremony`, `Ticker`, `AxlTopology`,
  `AxlLogFeed`, `WorkerBidCard`, `JobCountdown`) are `"use client"` and read
  chain state via the public `viem` clients in `src/lib/clients.ts`.
- **Wallet.** `/post` signs real `postTask` transactions through wagmi/Privy on
  0G Galileo. The wallet activity screen is intentionally marked as a coming
  soon live-events surface rather than rendering fake history.
- **ENS resolution.** `src/lib/ens.ts` synthesises live `who.*` from
  `WorkerINFT.ownerOf(tokenId)` on Galileo and renders the other four
  namespaces from the worker's live metadata/proof configuration
  (HD-derivation chain for `pay.*`, ERC-8004 reference for `rep.*`,
  0G Storage CID for `mem.*`, task receipt for `tx.*`). Each namespace renders independently as it
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
