# Builder Session: 0G INTEGRATION

You are a Codex session dedicated entirely to **everything 0G** for project Ledger — chain (Galileo), Storage, Compute, ERC-7857 iNFT contracts. You're the most consequential build session because 0G touches the hero demo, the iNFT spec, and the bulk of our technical claims.

**Lead surface:** `surface:60`. Use it ONLY to ping when work is done or you're blocked.

---

## Required reading (in order)

1. `/Users/gabrielantonyxaviour/Documents/products/ledger/EXECUTION_PLAN.md` (root) — the canonical action plan
2. `/Users/gabrielantonyxaviour/Documents/products/ledger/tools/research/0g.md` — deep research brief on 0G + ERC-7857 (~3.4K words, has all chainIDs, RPC URLs, faucet, contract addresses, model list, attestation API)
3. `/Users/gabrielantonyxaviour/Documents/products/ledger/docs/02_ARCHITECTURE.md` §2.3 (smart contracts) + §2.6 (0G Stack) + §2.6.1 (memory permissioning) — your canonical architecture spec
4. `/Users/gabrielantonyxaviour/Documents/products/ledger/docs/01_PRD.md` §3 (core flows) + §4.1 (0G sponsor requirements)
5. `/tmp/yt-transcripts/sponsor-workshops/zerog.txt` — Gautam's 0G workshop transcript (sponsor's own framing)

## Resources to PULL and study

- **`https://github.com/0glabs/0g-agent-nft/tree/eip-7857-draft`** — the reference implementation for ERC-7857. Clone and read carefully. Fork-compatible.
- **`https://github.com/0glabs/0g-storage-client`** — TS/Go SDKs. We use TS.
- **`https://github.com/0glabs/0g-serving-broker`** — 0G Compute broker SDK (`broker.inference.verifyService` returns the attestation digest).
- **`https://docs.0g.ai/`** — official docs.
- **`build.0gfoundation.ai`** — ecosystem hub.
- **Galileo Testnet:** ChainID 16602, native 0G token. RPC: `https://evmrpc-testnet.0g.ai` (verify in research brief). Explorer + faucet URLs in research brief.

## Scope (what you're shipping)

### 1. Foundry workspace at `contracts/`

- `forge init` (or scaffold from scratch) at `/Users/gabrielantonyxaviour/Documents/products/ledger/contracts/`
- `foundry.toml` configured with 0G Galileo as a network (RPC + chainId 16602)
- `.env.example` with the env vars we need (PRIVATE_KEY, GALILEO_RPC, BASE_SEPOLIA_RPC, ERC8004_REGISTRY_ADDR=0x8004B663056A597Dffe9eCcC1965A193B7388713)

### 2. Three contracts on 0G Galileo

**`contracts/src/WorkerINFT.sol`** — ERC-7857 (0G iNFT draft) implementation. Fork from `0g-agent-nft@eip-7857-draft`. Key functions:
- `mint(to, agentName, sealedKey, memoryCID, initialReputationRef)` 
- `transfer(from, to, tokenId, sealedKey, proof)` — re-keying flow per spec; the TEE oracle verifies `proof` and re-encrypts the memory pointer for the new owner
- `updateMemoryPointer(tokenId, newCID)` — token-owner-only
- `getMetadata(tokenId)` — returns full agent profile

**`contracts/src/LedgerEscrow.sol`** — holds bid bonds and task payments. Key functions:
- `postTask(taskId, payment, deadline, minReputation)` payable
- `acceptBid(taskId, workerAddress, bidAmount, bondAmount)` payable [worker pays bond]
- `releasePayment(taskId, resultHash)` — calls `feedback()` on the live ERC-8004 ReputationRegistry on Base Sepolia; cross-chain flow is two-phase commit (eventually consistent ~10s window)
- `slashBond(taskId)` — on timeout/failure; trust model is "buyer-trusted v1" per architect
- `cancelTask(taskId)` — buyer-only if no bids

**`contracts/src/LedgerIdentityRegistry.sol`** — minimal ERC-8004 IdentityRegistry. Functions per `02_ARCHITECTURE.md` §2.3.

**Note: there is NO `LedgerReputationRegistry.sol`.** We use the live audited ERC-8004 deployment at `0x8004B663056A597Dffe9eCcC1965A193B7388713` on Base Sepolia. Save 200+ lines of contract code + audit-by-default story.

### 3. Foundry tests for each contract

Real tests, not stubs. At minimum:
- WorkerINFT: mint → transfer (with mock TEE oracle returning a valid proof) → assert ownership flipped + memory pointer re-keyed
- LedgerEscrow: full task lifecycle with realistic timing
- LedgerIdentityRegistry: register + lookup

Run `forge test -vvv` and ensure all green.

### 4. 0G Storage TS client at `agents/0g-storage/`

Per Gautam's workshop, use the **new SDK methods** `uploadFile` / `downloadFile` (NOT the old flow-contract path). Module exports:

- `uploadAgentMemory(agentId: string, plaintext: Buffer): Promise<{cid: string}>`
- `downloadAgentMemory(cid: string): Promise<Buffer>`
- `wrapKeyForOwner(masterKey, ownerAddr): Promise<{sealedKey: bytes}>` — used by the TEE oracle simulation in WorkerINFT.transfer
- Client-side AES-256-CTR encryption before upload; decryption on download

Test: upload a known buffer, retrieve, assert byte-equal.

### 5. 0G Compute TS client at `agents/0g-compute/`

Module exports:

- `runReasoning(prompt: string, model: '0g-glm-5' | '0g-qwen3.6-plus'): Promise<{output: string, attestationDigest: string}>` — uses `@0glabs/0g-serving-broker` SDK; calls `/v1/chat/completions` (OpenAI-compatible)
- `verifyAttestation(digest: string): Promise<boolean>` — uses `broker.inference.verifyService`

Test: send a real prompt to the live Galileo Compute endpoint, verify attestation returns true.

### 6. Deploy script + verification

- `script/Deploy.s.sol` Foundry deploy script for the 3 contracts on Galileo
- After deploy: print contract addresses, verify on the Galileo explorer
- Output addresses to `proofs/0g-proof.md` (which is currently a stub — populate the placeholders)

## Integration with the Lead's plan

This is **Builder C work** (contracts) + part of **Builder B work** (0G Compute/Storage clients) per `EXECUTION_PLAN.md` Phase 1 step 3 + Phase 2 step 8. Time budget is ~4-6h. If you exceed 8h on any single sub-task, ping the lead.

## Definition of done

When you can demonstrate, end-to-end:

1. WorkerINFT contract deployed on Galileo, verified on explorer
2. Memory upload to 0G Storage with client-side AES, retrieval works
3. Reasoning call to 0G Compute returns output + attestation digest
4. `broker.inference.verifyService` returns `true` for that digest
5. iNFT transfer with sealed-key re-keying simulation works (mock TEE oracle)
6. All foundry tests passing
7. `proofs/0g-proof.md` populated with real addresses, CIDs, attestation digests

## Non-goals (do NOT do)

- Do NOT build the resolver, the AXL nodes, the frontend dashboard, or anything ENS-related — those are other sessions
- Do NOT deploy a custom ReputationRegistry — we use the live audited ERC-8004 at `0x8004B663056A597Dffe9eCcC1965A193B7388713`
- Do NOT use any "0G Sepolia" terminology — it's "0G Galileo Testnet, ChainID 16602, native 0G token"
- Do NOT use "ERC-7857" without the qualifier "(0G iNFT draft standard)"
- Do NOT touch code outside `contracts/`, `agents/0g-storage/`, `agents/0g-compute/`, and `proofs/0g-proof.md`

## How to report back

Per-deliverable:
```bash
cmux send --surface surface:60 "[BUILDER:0g] <deliverable> done"
cmux send-key --surface surface:60 Enter
```

On full completion:
```bash
cmux send --surface surface:60 "[BUILDER:0g] ALL DONE — contracts deployed at <addrs>; storage + compute verified"
cmux send-key --surface surface:60 Enter
```

Blocking question:
```bash
cmux send --surface surface:60 "[QUESTION:0g] <specific question>"
cmux send-key --surface surface:60 Enter
```
