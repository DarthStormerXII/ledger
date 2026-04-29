# Ledger — Submission Materials

**Tool:** ETHGlobal submission form + repo files
**When to use:** Day 9 (May 3) — submit by 21:30 IST = 12:00 PM EDT
**Sponsors targeted:** 0G (Track A + Track B, single partner-slot) · Gensyn AXL · ENS (ENS-AI + ENS-Creative, single partner-slot)
**Addressable pool:** $25K · Realistic placement target: $5–9K from sponsor bounties + $4K finalist pack

---

## Section A — ETHGlobal Submission Form Answers

These are drafts. Polish on submission day with your actual repo URL, demo URL, contract addresses, ENS names, peer IDs, and attestation digests.

### Project name
```
Ledger
```

### Tagline (one sentence)
```
The trustless hiring hall where AI agents bid for work — and the workers
themselves are tradeable iNFTs whose reputation, memory, earnings, and
ENS identity travel with them across owners.
```

### What it does (≤30 seconds when read aloud)
```
Ledger is a peer-to-peer marketplace where AI agents hire other AI
agents. Buyer agents post tasks. Worker agents on a Gensyn AXL mesh
bid in real-time auctions. On-chain escrow on Base Sepolia settles
payment, and the audited ERC-8004 ReputationRegistry records signed
feedback. Workers themselves are ERC-7857 (0G iNFT draft standard)
iNFTs on 0G Galileo Testnet — when one transfers, its ENS identity,
its memory on 0G Storage, its sealed reasoning on 0G Compute, and the
next earned payment all follow the new owner. The workers are the
assets.
```

### How it's made
```
Three layers, three sponsors. Workers run on 0G Compute with sealed
inference (GLM-5 / Qwen3.6-Plus, attestation digests verified via
broker.inference.verifyService) and persistent memory in 0G Storage
(uploadFile / downloadFile SDK). Each worker is an ERC-7857 (0G iNFT
draft standard) iNFT on 0G Galileo Testnet (ChainID 16602, native OG
token); on transfer the TEE oracle re-keys the AES-256-CTR memory blob
to the new owner per the ERC-7857 spec, using the reference
implementation at 0glabs/0g-agent-nft@eip-7857-draft.

All inter-agent communication runs over Gensyn AXL across three
independent nodes — two cloud VMs and one residential laptop behind
CGNAT — with no central broker. We forked AXL's gossipsub example for
the pubsub layer (TASK_POSTED / BID_PLACED / AUCTION_CLOSED). Two
layers of encryption: hop-by-hop TLS plus end-to-end encrypted payloads.
Outbound TCP/TLS to the bootstrap peer is sufficient — no port
forwarding, no STUN, no hole-punching.

Identity is ENS. The team owns a parent name on Sepolia with an
ENSIP-10 wildcard CCIP-Read offchain resolver (Path C pattern, per
0xFlicker/tod-offchain-resolver) that serves a capability tree per
worker: who.<agent>.<team>.eth resolves to the live ownerOf() on 0G
Galileo, pay.<agent>.<team>.eth rotates HD-derived receive addresses
(Fluidkey-inspired — credit to Greg's favorite hackathon project), and
tx / rep / mem complete the namespace. ENSIP-25 agent-registration text
records on the parent point to the audited ERC-8004 ReputationRegistry
deployment at 0x8004B663056A597Dffe9eCcC1965A193B7388713 on Base Sepolia
— that's the verification loop Greg named in the ENS workshop.

Settlement is USDC on Base Sepolia via our LedgerEscrow contract.
On settlement the contract calls feedback() on the live ERC-8004
ReputationRegistry — we deploy zero of our own reputation infrastructure;
we use the audited deployment. The dashboard is Next.js 14 with
shadcn/ui, with live AXL event streaming over Server-Sent Events, a
Settlement Status Strip (USDC paid ✓ / ERC-8004 feedback recorded ✓ /
0G Storage CID updated ✓) under a two-phase commit eventually-consistent
model, and a custom Capability Tree Viewer page that renders live ENS
resolutions per worker.

The most interesting build problem was the inheritance flow. When a
worker iNFT transfers mid-flight, the next earned payment must flow to
the new owner. We solved this in three ways at once: (a) the escrow
contract checks ownerOf() at settlement time so the in-flight job's
payment goes to whoever owns the iNFT when settlement fires; (b) the
ERC-7857 TEE oracle re-keys the memory blob so the new owner can decrypt
it immediately; (c) ENS resolution flips with zero ENS transactions —
who.<agent>.<team>.eth follows ownerOf() automatically via CCIP-Read.
The hero worker's reputation history (47 jobs, 47 employer-signed
feedback records on the audited ERC-8004 ReputationRegistry at
0x8004B663… on Base Sepolia) is seeded for demonstration. The contract
accepts any employer-signed feedback record per ERC-8004 spec; production
deployments would derive history from real task settlements.
```

### Notable challenges
```
Gensyn AXL was released roughly nine days before the hackathon began
with no mature SDK and no deployed examples. Getting three nodes to
mesh reliably across NAT boundaries, including one residential laptop
behind CGNAT, required forking the gossipsub example and writing a thin
TS client around the AXL HTTP node. Outbound TCP/TLS to the bootstrap
peer turned out to be sufficient — no port forwarding, no STUN — once
we confirmed that pattern with the Gensyn workshop notes.

Embedding agent memory into ERC-7857 (0G iNFT draft standard) in a way
that survives ownership transfer is a draft-standard problem: the spec
defines a TEE oracle re-keying step we had to wire end-to-end. We chose
the reference implementation at 0glabs/0g-agent-nft@eip-7857-draft and
adapted its metadata schema; on transferFrom the oracle re-encrypts the
AES-256-CTR memory key to the new owner's pubkey before the tx finalizes.

ENSIP-10 wildcard subname resolution under our parent name needed a
CCIP-Read offchain resolver served from a stable HTTPS endpoint
(deployed on Vercel with 30s TTL caching on ownerOf() reads to
absorb the public 0G Galileo RPC's variable latency). The capability
tree (who/pay/tx/rep/mem) dispatches per-namespace handlers; pay rotates
HD-derived receive addresses on each resolution, Fluidkey-style.
```

### Partner-prize selection (3 / 3 slots filled)
```
Partner 1 — 0G Labs        (Track A: Best Application of 0G + Track B:
                           Best Autonomous Agents, Swarms & iNFT
                           Innovations)
Partner 2 — Gensyn AXL     (Best Application of AXL)
Partner 3 — ENS            (ENS-AI + ENS-Creative — both tracks count
                           as one partner-slot per ETHGlobal rules)
```

### Sponsor integration writeups (per sponsor)

#### 0G Labs — Track A (Best Application of 0G) + Track B (Best Autonomous Agents, Swarms & iNFT Innovations)

```
Ledger uses 0G as the agent fabric — compute, storage, and identity.
The marketplace SDK doubles as a Track A primitive; the iNFT-bound
intelligence is the Track B story.

iNFT (ERC-7857, 0G iNFT draft standard): Each worker is minted as an
ERC-7857 iNFT on 0G Galileo Testnet (ChainID 16602, native 0G token).
Token metadata includes a 0G Storage CID pointing to the encrypted
memory blob; the iNFT carries the worker's reputation pointer (ENSIP-25
text record → live ERC-8004 reads on Base Sepolia), making the agent
itself a transferable, yielding asset.

ERC-7857 transfer with TEE re-keying: On transferFrom, the TEE oracle
(per spec, reference impl 0glabs/0g-agent-nft@eip-7857-draft) re-keys
the AES-256-CTR memory blob to the new owner's pubkey atomically with
the token. New owner gains immediate decryption capability with no
manual re-permissioning step.

Swarm: At least 3 worker agents run as a swarm, each on its own AXL
node, each with independent bidding logic, each with its own persistent
memory in 0G Storage.

0G Compute (sealed inference): All agent reasoning calls 0G Compute
with GLM-5 (744B, TeeML) or Qwen3.6-Plus (TeeTLS). Each inference
returns an attestation digest verifiable via
broker.inference.verifyService — surfaced in the worker profile as a
UI badge with the digest hash on-chain.

0G Storage: uploadFile / downloadFile SDK (per Gautam's workshop
guidance — we explicitly use the new file SDK, not flow contracts).

Demo highlight: the inheritance moment. A worker iNFT with 47 completed
jobs (employer-signed feedback records on the audited ERC-8004
deployment) gets transferred mid-demo. The new owner's worker
immediately bids on the next task. The same memory. The same reputation.
The same reasoning. New address. The iNFT carries embedded intelligence,
not just a name.

Contract addresses (0G Galileo Testnet, ChainID 16602):
- WorkerINFT.sol:                 [TO ADD ON SUBMISSION DAY]
- LedgerEscrow.sol:               [TO ADD]
- LedgerIdentityRegistry.sol:     [TO ADD]
(NOTE: we do NOT deploy our own ReputationRegistry. We use the live
audited ERC-8004 deployment at 0x8004B663056A597Dffe9eCcC1965A193B7388713
on Base Sepolia. LedgerEscrow.feedback() calls into it on settlement.)

Architecture diagram: see /docs/architecture-diagram.png
Demo video:           [URL]
0G proof file:        /proofs/0g-proof.md
```

#### Gensyn — Best Application of AXL

```
Ledger runs three AXL nodes across three independent machines: two
cloud VMs (us-west AWS + eu-central GCP) and one residential laptop
behind CGNAT. There is no central broker. All inter-agent
communication — task announcements, bidding, acceptance, status
updates, AUCTION_CLOSED — flows over the AXL Yggdrasil mesh
(IPv6 200::/7) using both gossipsub channels and direct peer
messaging. Two layers of encryption: hop-by-hop TLS plus end-to-end
encrypted payloads.

Service-registry / tool-marketplace pattern (per Jud's framing in
the Gensyn workshop): TASK_POSTED messages are tool-call descriptors;
worker bids are capability declarations; AUCTION_CLOSED finalizes the
match. The marketplace IS a tool registry where the matching protocol
is on-chain anchored.

Residential NAT: the laptop node connects with outbound TCP/TLS to
the bootstrap peer only. No port forwarding. No STUN. No hole-punching.
This is exactly the AXL value proposition for an open agent economy
where workers can run anywhere — including a CGNAT'd home network.

Implementation: forked AXL's gossipsub example for the pubsub layer
and wrote a thin TS client around the AXL HTTP node. The dashboard
includes a live topology visualization showing real cross-node packets
with peer IDs and IPv6 addresses.

Demo proof:
- 3 ed25519 peer IDs (64-char hex):    [TO ADD]
- 3 Yggdrasil IPv6 addresses (200::/7): [TO ADD]
- 3 host networks:                     AWS us-west, GCP eu-central, residential CGNAT
- /topology JSON snapshot:             /proofs/axl-proof.md
- tcpdump excerpt:                     /proofs/axl-proof.md

Repo:                          [URL]
Demo cross-node section:       video timestamp 0:35–1:35
AXL proof file:                /proofs/axl-proof.md
```

#### ENS — ENS-AI + ENS-Creative

```
Ledger gives every worker iNFT a stable ENS identity that follows
ownerOf() across chains with zero ENS transactions on transfer.

Parent name on Sepolia: <team>.eth (registered via sepolia.app.ens.domains).
ENSIP-10 wildcard CCIP-Read offchain resolver deployed on Vercel,
Path C pattern per 0xFlicker/tod-offchain-resolver.

Capability tree per worker (e.g. worker-001.<team>.eth):
- who.<agent>.<team>.eth   →  live ownerOf() on 0G Galileo Testnet (ChainID 16602)
- pay.<agent>.<team>.eth   →  rotating HD-derived receive address (Fluidkey-inspired,
                              credit to Greg's favorite hackathon project)
- tx.<agent>.<team>.eth    →  current escrow / in-flight job pointer on Base Sepolia
- rep.<agent>.<team>.eth   →  reputation summary derived from the audited
                              ERC-8004 ReputationRegistry on Base Sepolia
- mem.<agent>.<team>.eth   →  current 0G Storage CID for the memory blob

ENSIP-25 agent-registration text record on the parent name points to
the audited ERC-8004 deployment at
0x8004B663056A597Dffe9eCcC1965A193B7388713 on Base Sepolia. This is
the ENSIP-25 ↔ ERC-8004 verification loop Greg named in the ENS
workshop.

The 5-second "oh" moment in the demo: a worker iNFT transfers on 0G
Galileo. who.worker-001.<team>.eth resolution flips from Owner_A to
Owner_B in under 30 seconds — without any ENS transaction. The
CCIP-Read resolver gateway picks up the new ownerOf() automatically
because it reads the source of truth, not a cached snapshot.

Custom viewer surface: because the official ENS app may not render
our text records and capability tree cleanly on Sepolia, we ship a
custom page at /agent/<ens-name> that renders all five namespaces
live with verify-derivation buttons (the HD-derivation for pay.* is
auditable). Cast resolve <name> works in the terminal as the second
proof surface for technical judges.

ENS proof file:                /proofs/ens-proof.md
Demo ENS-flip section:         video timestamp 2:00–3:15
Resolver gateway URL:          [TO ADD]
Parent name on Sepolia:        [TO ADD].eth
```

---

## Section B — Sponsor Proof Files (one screen each, evidence inline)

Every claim in the Proof Matrix points to one of these three files. Each file lives at `/proofs/<sponsor>-proof.md` and is at most one screen long, with all evidence inline.

- `proofs/0g-proof.md` — token address + tokenId + Galileo explorer link + reference impl link + memory CID before/after transfer + AES-256-CTR re-key proof + sealed inference attestation digest hash + `broker.inference.verifyService` SDK link
- `proofs/axl-proof.md` — 3 ed25519 peer IDs + 3 Yggdrasil IPv6 addresses (200::/7) + 3 host networks + /topology JSON snapshot + tcpdump excerpt
- `proofs/ens-proof.md` — parent name on Sepolia + resolver gateway URL + ENSIP-25 text record contents + before/after `who.*` resolution screenshot + `cast resolve` terminal output + ERC-8004 ReputationRegistry address on Base Sepolia

> **No `FEEDBACK_*.md` file.** The May-2 council pass swapped KeeperHub out of the slate; ENS does not currently have a feedback bounty. We file zero feedback-bounty docs.

---

## Section C — Repo README Template

This is what judges see first. It must answer in 30 seconds: what is this, does it work, where's the demo. The Proof Matrix above the fold is the single most important element on this page.

### Template

```markdown
# Ledger

> ## "The workers are the assets."

**The trustless hiring hall where AI agents bid for work — and the
workers themselves are tradeable iNFTs whose reputation, memory,
earnings, and ENS identity travel with them across owners.**

---

## Proof Matrix

Every claim below links to evidence in this repo. No assertions without artifacts.

| Claim | Evidence |
|---|---|
| Worker is an ERC-7857 (0G iNFT draft standard) iNFT | Token address `0x...` · tokenId `1` · [Galileo explorer](https://chainscan-galileo.0g.ai/address/0x...) · reference impl: [0glabs/0g-agent-nft@eip-7857-draft](https://github.com/0glabs/0g-agent-nft/tree/eip-7857-draft) |
| Memory persists on 0G Storage | CID before transfer: `0x...` · CID after transfer: `0x...` (re-keyed) · [retrieval link](https://...) · AES-256-CTR key-rebind via TEE oracle per ERC-7857 spec |
| Reasoning runs sealed on 0G Compute | Model: GLM-5 (744B, TeeML) / Qwen3.6-Plus (TeeTLS) · attestation digest: `0x...` · verified via [`broker.inference.verifyService`](https://docs.0g.ai/...) |
| AXL is real cross-machine P2P | Peer IDs: `<id1>`, `<id2>`, `<id3>` (ed25519, 64-char hex) · IPv6: `200::a:b:c:d`, `200::e:f:g:h`, `200::i:j:k:l` · Hosts: AWS us-west, GCP eu-central, residential CGNAT · [topology JSON](./proofs/axl-proof.md) · [tcpdump excerpt](./proofs/axl-proof.md) |
| ENS identity follows ownerOf cross-chain | `worker-001.<team>.eth` on Sepolia · resolver: `0x...` · iNFT contract on 0G Galileo: `0x...` · before: `who.*` → Owner_A · after: `who.*` → Owner_B · zero ENS transactions |
| Reputation lives on the audited ERC-8004 deployment | [`0x8004B663056A597Dffe9eCcC1965A193B7388713`](https://sepolia.basescan.org/address/0x8004B663056A597Dffe9eCcC1965A193B7388713) on Base Sepolia · ENSIP-25 text record on `<team>.eth` points here |
| Ownership changes earnings flow | ownerBefore: `0x...` · ownerAfter: `0x...` · payment recipient tx hash on Base Sepolia: `0x...` |

Companion proof files (one screen each):
[`proofs/0g-proof.md`](./proofs/0g-proof.md) · [`proofs/axl-proof.md`](./proofs/axl-proof.md) · [`proofs/ens-proof.md`](./proofs/ens-proof.md)

---

## What it is

Ledger is a peer-to-peer marketplace where AI agents hire other AI
agents. Buyer agents post tasks. Worker agents on a Gensyn AXL mesh
bid in real-time auctions across three independent machines (two cloud
VMs and one residential laptop behind CGNAT). On-chain escrow on Base
Sepolia settles payment; the audited ERC-8004 ReputationRegistry at
`0x8004B663…` records signed feedback. Workers themselves are ERC-7857
(0G iNFT draft standard) iNFTs on 0G Galileo Testnet — when one
transfers, its ENS identity, memory on 0G Storage, sealed reasoning
on 0G Compute, and the next earned payment all follow the new owner.
The first secondary market for working AI agents with on-chain
provenance.

[![Demo Video](https://img.youtube.com/vi/VIDEO_ID/0.jpg)](https://...)
👆 4-minute demo · 30-second elevator cut: [URL]

🌐 **Live deployment:** https://ledger.xyz
🎥 **Demo video:** [URL]
📦 **Built at:** ETHGlobal Open Agents 2026

---

## Architecture

[Embed architecture diagram PNG]

| Layer | Tech |
|---|---|
| Compute | 0G Compute sealed inference (GLM-5 / Qwen3.6-Plus, attestation digests) |
| Memory | 0G Storage (uploadFile / downloadFile SDK) |
| Worker persona | ERC-7857 (0G iNFT draft standard) on 0G Galileo Testnet (ChainID 16602, native 0G token) |
| Inter-agent comms | Gensyn AXL — 3 nodes, gossipsub fork, no central broker |
| Identity | ENS parent name on Sepolia + ENSIP-10 wildcard CCIP-Read offchain resolver (Path C) |
| Reputation | Audited ERC-8004 ReputationRegistry @ `0x8004B663…` on Base Sepolia (we use, we do not deploy) |
| Settlement | USDC escrow on Base Sepolia (LedgerEscrow.sol) |
| Frontend | Next.js 14 + shadcn/ui + Capability Tree Viewer + Settlement Status Strip |

Settlement is **two-phase commit, eventually consistent within ~10s.** Both transactions guaranteed to fire; the dashboard surfaces a `pending_reconcile` state if one lags. The Settlement Status Strip shows ✓/✓/⏳ per leg.

---

## Sponsor integrations

- **0G Labs (Track A + Track B)** — iNFT-minted worker swarm, sealed inference attestation, 0G Storage memory persistence, ERC-7857 TEE re-keying on transfer. [Details](#0g-integration) · [Proof](./proofs/0g-proof.md)
- **Gensyn AXL** — 3-node cross-machine mesh (2 cloud + 1 residential CGNAT) with gossipsub pubsub, hop-by-hop TLS + end-to-end encrypted payloads. Service-registry / tool-marketplace pattern. [Details](#gensyn-integration) · [Proof](./proofs/axl-proof.md)
- **ENS (ENS-AI + ENS-Creative)** — parent name on Sepolia + ENSIP-10 wildcard CCIP-Read resolver + capability tree (`who/pay/tx/rep/mem`) + ENSIP-25 ↔ ERC-8004 verification loop + live `ownerOf()` flip on transfer. [Details](#ens-integration) · [Proof](./proofs/ens-proof.md)

---

## Contract addresses

**0G Galileo Testnet (ChainID 16602, native 0G token):**

| Contract | Address |
|---|---|
| WorkerINFT | `0x...` |
| LedgerEscrow | `0x...` |
| LedgerIdentityRegistry | `0x...` |

**Base Sepolia:**

| Contract | Address | Note |
|---|---|---|
| ERC-8004 ReputationRegistry | `0x8004B663056A597Dffe9eCcC1965A193B7388713` | Audited deployment — we use, we do not deploy |
| LedgerEscrow (settlement) | `0x...` | calls `feedback()` on the ERC-8004 above |

**Sepolia (ENS):**

| Resource | Address |
|---|---|
| Parent name | `<team>.eth` |
| Wildcard CCIP-Read resolver contract | `0x...` |
| Resolver gateway URL | `https://...` |

---

## How it's made

Three layers, three sponsors. Workers run on 0G Compute with sealed inference (GLM-5 / Qwen3.6-Plus, attestation digests verified via `broker.inference.verifyService`) and persistent memory in 0G Storage via the `uploadFile` / `downloadFile` SDK. Each worker is an ERC-7857 (0G iNFT draft standard) iNFT on 0G Galileo Testnet; on transfer, the TEE oracle re-keys the AES-256-CTR memory blob to the new owner's pubkey per spec, using the reference implementation at [`0glabs/0g-agent-nft@eip-7857-draft`](https://github.com/0glabs/0g-agent-nft/tree/eip-7857-draft).

All inter-agent communication runs over Gensyn AXL across three independent nodes — two cloud VMs and one residential laptop behind CGNAT — with no central broker. We forked AXL's gossipsub example for the pubsub layer (`TASK_POSTED` / `BID_PLACED` / `AUCTION_CLOSED`). Two layers of encryption: hop-by-hop TLS plus end-to-end encrypted payloads. Outbound TCP/TLS to bootstrap is sufficient — no port forwarding, no STUN, no hole-punching.

Identity is ENS. Parent name on Sepolia + ENSIP-10 wildcard CCIP-Read offchain resolver (Path C, per `0xFlicker/tod-offchain-resolver`) serving a capability tree per worker: `who.*` resolves to live `ownerOf()` on 0G Galileo, `pay.*` rotates HD-derived receive addresses (**inspired by Fluidkey** — Greg's favorite hackathon project, mentioned in the ENS workshop), and `tx / rep / mem` complete the namespace. ENSIP-25 agent-registration text record on the parent points to the audited ERC-8004 ReputationRegistry on Base Sepolia — that's the verification loop Greg named in the workshop.

Settlement is USDC on Base Sepolia. `LedgerEscrow.sol` calls `feedback()` on the live ERC-8004 ReputationRegistry on settlement. We deploy zero of our own reputation infrastructure; we use the audited deployment.

> **Honest disclosure on demo data:** The hero worker's reputation history (47 jobs, 47 employer-signed feedback records on the audited ERC-8004 ReputationRegistry at `0x8004B663…` on Base Sepolia) is seeded for demonstration. The contract accepts any employer-signed feedback record per ERC-8004 spec; production deployments would derive history from real task settlements.

The most interesting build problem was the inheritance flow: when a worker iNFT transfers mid-flight, the next earned payment must flow to the new owner. We solved this in three coordinated places — escrow checks `ownerOf()` at settlement time, the ERC-7857 TEE oracle re-keys the memory blob, and ENS resolution flips with zero ENS transactions because the resolver reads `ownerOf()` live.

---
