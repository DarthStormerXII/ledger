# Ledger — Technical Architecture Spec

**Audience:** Claude Code / Codex / engineering team
**Status:** Working draft for Day 0 review
**Goal:** This document is the engineering brief. Architecture, contracts, message schemas, and integration points all live here.

---

## 1. System Overview

```
┌──────────────────────────────────────────────────────────────────────────┐
│                            LEDGER SYSTEM                                  │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│   Buyer Agent              Worker Agent A      Worker Agent B             │
│   (laptop, NAT)            (cloud VM 1)        (cloud VM 2)               │
│        │                         │                   │                    │
│        └──── AXL Yggdrasil Mesh (peer-to-peer, gossipsub fork) ──┘        │
│                              │                                            │
│                              ▼                                            │
│                    ┌──────────────────┐                                   │
│                    │  0G Compute API  │ ← agent reasoning (sealed)        │
│                    │  0G Storage API  │ ← persistent memory               │
│                    │  (uploadFile /   │                                   │
│                    │   downloadFile)  │                                   │
│                    └──────────────────┘                                   │
│                              │                                            │
│       ┌──────────────────────┼─────────────────────────┐                  │
│       ▼                      ▼                         ▼                  │
│  ┌──────────────┐   ┌──────────────────┐   ┌─────────────────────┐        │
│  │ 0G Galileo   │   │  Base Sepolia    │   │ Sepolia L1 (ENS)    │        │
│  │ (16602, 0G)   │   │  - USDC          │   │ - <team>.eth parent │        │
│  │ - iNFTs      │   │  - LedgerEscrow  │   │ - CCIP-Read pointer │        │
│  │   ERC-7857   │   │  - ERC-8004 Rep  │   │   to resolver       │        │
│  │ - IdentityReg│   │    @0x8004B663…  │   │ - ENSIP-25 text rec │        │
│  └──────────────┘   │    (live audited)│   └─────────────────────┘        │
│         ▲           └──────────────────┘              ▲                   │
│         │                                             │                   │
│         │       ┌─────────────────────────────────────┘                   │
│         │       │                                                         │
│         │       ▼                                                         │
│         │  ┌────────────────────────────────┐                             │
│         └──┤  ENS Resolver Gateway          │                             │
│            │  (CCIP-Read offchain server,   │                             │
│            │   ENSIP-10 signed responses)   │                             │
│            │  who/pay/tx/rep/mem dispatch   │                             │
│            └────────────────────────────────┘                             │
│                              │                                            │
│                              ▼                                            │
│              ┌────────────────────────────────┐                           │
│              │  Next.js Dashboard             │                           │
│              │  - Live activity feed          │                           │
│              │  - Auction room                │                           │
│              │  - iNFT marketplace            │                           │
│              │  - AXL topology viz            │                           │
│              │  - Settlement Status Strip     │                           │
│              │  - Capability Tree Viewer      │                           │
│              └────────────────────────────────┘                           │
└──────────────────────────────────────────────────────────────────────────┘
```

## 2. Component Breakdown

### 2.1 Agent Runtime (TypeScript)

A long-running process per agent. Each agent owns:
- An ed25519 keypair (its AXL identity)
- An EVM keypair (its on-chain identity, registered via ERC-8004)
- A pointer to its memory blob in 0G Storage
- A reputation reference (its address in the live audited ERC-8004 ReputationRegistry at `0x8004B663…` on Base Sepolia)
- A configurable bidding strategy (default: cheapest-bid-above-cost-floor)

Lifecycle:
1. Boot, connect to AXL node, subscribe to `#ledger-jobs`
2. Listen for tasks
3. Decide whether to bid (based on strategy + reputation requirements)
4. Submit bid via direct AXL message
5. If selected, execute task (calls 0G Compute)
6. Submit result + payment claim; buyer triggers `LedgerEscrow.releasePayment` on Base Sepolia
7. Persist any new memory to 0G Storage via `uploadFile`; update memory pointer in iNFT metadata if needed

### 2.2 Buyer Agent

Same as worker but in posting mode. Posts task (calls `LedgerEscrow.postTask` on Base Sepolia BEFORE AXL broadcast — see §4.3 for `taskId` derivation), listens for bids, selects winner, signs acceptance, broadcasts `AUCTION_CLOSED`, monitors completion, releases payment by calling `LedgerEscrow.releasePayment` directly.

### 2.3 Smart Contracts

**LedgerEscrow.sol** (on Base Sepolia) — holds bid bonds and task payments; on settlement calls `feedback()` on the live audited ERC-8004 ReputationRegistry
```
- postTask(taskId, payment, deadline, minReputation) payable
- acceptBid(taskId, workerAddress, bidAmount, bondAmount) payable [worker pays bond]
- releasePayment(taskId, resultHash) [also calls ERC-8004 feedback() with buyer signature]
- slashBond(taskId) [on timeout/failure]
- cancelTask(taskId) [callable by buyer if no bids]
```

**WorkerINFT.sol** (on 0G Galileo Testnet, ChainID 16602) — ERC-7857 (0G iNFT draft standard) iNFT for worker agents
```
- mint(to, agentName, memoryPointer, initialReputation)
- transfer (standard ERC-721; TEE oracle re-keys metadata on transfer per ERC-7857 spec)
- updateMemoryPointer(tokenId, newPointer) [callable by token owner]
- getMetadata(tokenId) returns full agent profile
```

**LedgerIdentityRegistry.sol** (on 0G Galileo Testnet, ChainID 16602) — minimal ERC-8004 IdentityRegistry
```
- registerAgent(agentAddress, ensName, capabilities)
- getAgent(agentAddress) returns identity record
```

**ERC-8004 ReputationRegistry** — **NOT deployed by us.** We use the live audited deployment at `0x8004B663056A597Dffe9eCcC1965A193B7388713` on Base Sepolia. `LedgerEscrow.sol` calls its `feedback()` function on settlement, passing the buyer-signed feedback record per ERC-8004 spec. This saves 200+ lines of contract code and gives us audit-by-default, plus matches the canonical ERC-8004 behavior sponsor judges expect.

### 2.4 AXL Network (3 nodes)

| Node | Location | Purpose |
|---|---|---|
| node-buyer | Cloud VM (us-west) | Hosts buyer agent |
| node-worker-1 | Cloud VM (eu-central) | Hosts worker agent A |
| node-worker-2 | Local laptop | Hosts worker agent B (showcases NAT traversal) |

Topology: full mesh via Yggdrasil. Each node peers with every other. Pattern is Jud's "service registry / tool marketplace" framing from the Gensyn workshop.

Encryption: **two layers — hop-by-hop TLS + end-to-end payload encryption** (per Jud's workshop framing). Hop-by-hop secures peer-to-peer transport; end-to-end ensures only the addressed peer can read message contents.

Implementation note: **fork the AXL repo's `gossipsub` example** for the pubsub layer rather than writing our own — saves time and matches sponsor expectations.

Channels:
- `#ledger-jobs` — buyer broadcasts new task posts (pubsub)
- `#ledger-auction-closed` — buyer broadcasts `AUCTION_CLOSED` to terminate losing bidders cleanly
- direct messages — bid submissions, acceptance, status updates, results

### 2.5 ENS Resolver Gateway

Replaces the previous KeeperHub MCP role with the ENS identity layer. The gateway is a CCIP-Read offchain server that serves capability subnames under our parent name on Sepolia L1.

**Architecture:**
- Parent name: `<team>.eth` registered on Sepolia, with a CCIP-Read pointer to the gateway URL
- Gateway URL: stable HTTPS endpoint deployed on Vercel/Cloudflare
- Implements ENSIP-10 signed-response handler (responses signed with a key the parent name's resolver trusts)

**Namespace dispatch table:**

| Subname pattern | Handler logic |
|---|---|
| `who.worker-NNN.<team>.eth` | Read `ownerOf(NNN)` from `WorkerINFT` on 0G Galileo (ChainID 16602). 30s TTL cache. |
| `pay.worker-NNN.<team>.eth` | HD-derive next payout address from a parent xpub indexed by NNN + rotation counter. Fluidkey-inspired. |
| `tx.worker-NNN.<team>.eth` | Latest `LedgerEscrow.releasePayment` tx hash for tokenId NNN, queried from Base Sepolia logs. |
| `rep.worker-NNN.<team>.eth` | Read summary from ERC-8004 ReputationRegistry at `0x8004B663…` on Base Sepolia. |
| `mem.worker-NNN.<team>.eth` | Current 0G Storage memory CID for tokenId NNN. |

**Request shape:** standard ENSIP-10 — client receives `OffchainLookup` revert, calls gateway with the encoded name + callback function, gateway returns signed response, client verifies signature and accepts.

**Key management:** signer key stored as Vercel/Cloudflare secret env var; never committed. Public key set as the resolver's trusted signer on the parent name's resolver contract.

**Caching:** 30s TTL on `ownerOf()` reads to keep the resolution flip beat live (≤30s lag from chain to resolution).

### 2.6 0G Stack

- **0G Compute**: agent reasoning. POST /chat/completions with `qwen3.6-plus` or GLM-5-FP8. Surface attestation digest from `broker.inference.verifyService` as a UI badge in the worker profile.
- **0G Storage**: persistent agent memory. SDK: `uploadFile` / `downloadFile` (NOT flow contracts — that's the old API, per Gautam's 0G workshop).
- **0G Galileo Testnet (ChainID 16602, native 0G token)**: deploy `WorkerINFT.sol` and `LedgerIdentityRegistry.sol`.

#### 2.6.1 Memory permissioning (ERC-7857 spec)

When an iNFT is transferred, the TEE oracle re-keys the encrypted memory metadata so only the new owner's key can decrypt it. This is per the ERC-7857 (0G iNFT draft standard) specification, confirmed by Gautam in the 0G workshop. Reference implementation: `0glabs/0g-agent-nft@eip-7857-draft`. The 0G Storage CID itself does not change; only the wrapping key rotates, with the TEE oracle bridging old-owner → new-owner re-encryption inside the enclave.

### 2.7 Frontend (Next.js 14 + Tailwind + shadcn/ui)

Routes:
- `/` — The Hall (live feed, top workers)
- `/jobs/[id]` — Auction Room for one job
- `/workers/[id]` — Worker Profile (iNFT detail) with capability tree on the right side and ENS name in 96px Fraunces at the top
- `/marketplace` — iNFT marketplace listings
- `/transfer/[id]` — Inheritance modal trigger
- `/agent/[ens-name]` — **Capability Tree Viewer** (Screen 6) — custom page rendering live resolution of all 5 namespaces (`who`, `pay`, `tx`, `rep`, `mem`) with verify-derivation buttons. This is the demo surface for the Inheritance moment because the official ENS app may not render our text records nicely.

Components:
- **Settlement Status Strip** (Screen 5) — thin component showing per-leg settlement: USDC paid on Base ✓ / ERC-8004 feedback recorded on Base ✓ / 0G Storage CID updated ✓ — with `pending_reconcile` state if any leg lags.

Real-time data via Server-Sent Events from a small Node service that proxies AXL events.
