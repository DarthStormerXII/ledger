# Builder Session: ENS INTEGRATION

You are a Codex session dedicated entirely to **everything ENS** for project Ledger — the CCIP-Read offchain resolver, the 5 capability namespaces (`who`, `pay`, `tx`, `rep`, `mem`), the parent name registration on Sepolia, and the ENSIP-25 verification loop with the audited ERC-8004 deployment.

**This is the highest sponsor-love-per-hour session.** ENS Track 2 named CCIP-Read auto-rotating addresses + subnames-as-tokens + zk-records as their three Most Creative examples. Our Path C hits all three. Greg from ENS Labs (workshop) named ENSIP-25 + ERC-8004 verification loop as the bullseye. Build it right.

**Lead surface:** `surface:60`.

---

## Required reading (in order)

1. `/Users/gabrielantonyxaviour/Documents/products/ledger/EXECUTION_PLAN.md` (root)
2. `/Users/gabrielantonyxaviour/Documents/products/ledger/tools/research/ens.md` — **deep research brief (~4.3K words)** with all ENSIPs, contract addresses on Sepolia, three integration paths costed, definitive verdict on Path C
3. `/Users/gabrielantonyxaviour/Documents/products/ledger/tools/council_alt/STAGE3_CHAIRMAN.md` §3 + §4 + §5 — the canonical Slot-3 integration shape, the 4-builder allocation, and the demo flow
4. `/Users/gabrielantonyxaviour/Documents/products/ledger/docs/02_ARCHITECTURE.md` §2.5 (ENS Resolver Gateway) + §2.7 Screen 6 (Capability Tree Viewer)
5. `/tmp/yt-transcripts/sponsor-workshops/ens.txt` — Greg's ENS workshop transcript — note Fluidkey is named as Greg's favorite hackathon project (validates Idea H pattern); ENSIP-25 verification loop is named explicitly

## Resources to PULL and study

- **`https://github.com/0xFlicker/tod-offchain-resolver`** — the reference impl Path C is based on. Clone and study; this is your starting point.
- **ENS docs:** `https://docs.ens.domains/` and the LLM-friendly `https://docs.ens.domains/llms-full.txt`.
- **ENSIP-10 (CCIP-Read):** `https://docs.ens.domains/ensip/10`.
- **ENSIP-5 (text records):** `https://docs.ens.domains/ensip/5`.
- **ENSIP-25 (agent registration / ERC-8004 verification loop):** linked in the research brief.
- **Sepolia ENS contracts:** Registry, BaseRegistrar, NameWrapper, Public Resolver, Universal Resolver — addresses in research brief §1.
- **`https://sepolia.app.ens.domains`** — for parent name registration.
- **Audited ERC-8004 ReputationRegistry on Base Sepolia:** `0x8004B663056A597Dffe9eCcC1965A193B7388713` (we don't deploy our own).

## Scope (what you're shipping)

### 1. Parent ENS name registered on Sepolia

Register a parent name via `sepolia.app.ens.domains`. Need Sepolia faucet ETH first. Choose a name that's available — **DO NOT** assume `ledger.eth` is available; pick something like `ledger-demo.eth` or `ledgermarket.eth` if needed. Document the choice.

After registration:
- Set the resolver to a CCIP-Read enabled resolver (PublicResolver supports this; or we deploy our own thin wrapper)
- Set the resolver pointer to our gateway URL (see deliverable 3)

**Output:** parent name + Sepolia explorer link → `proofs/ens-proof.md`.

### 2. CCIP-Read offchain resolver server at `resolver/` (Node/TS)

Fork structure from `0xFlicker/tod-offchain-resolver`. Key components:

- **HTTP gateway endpoint:** receives ENSIP-10 lookup requests `/{sender}/{callData}` (signed-response handler)
- **Label parser:** parses `<namespace>.<worker>.<parent>.eth` into namespace + worker + parent
- **Namespace dispatcher:** routes to one of 5 handlers
- **ENSIP-5 text-record encoder:** wraps responses
- **Signing key management:** the resolver server holds an ECDSA signing key whose address is registered as a "trusted gateway" via the on-chain CCIP-Read verifier

Deploy to Vercel or Cloudflare Workers. Stable HTTPS endpoint required.

### 3. Five namespace handlers

Inside the resolver, dispatch by namespace:

- **`who.<worker>`** → JSON-RPC call to 0G Galileo `WorkerINFT.ownerOf(tokenId)`. Return the owner address as `addr` text record. **This is the live cross-chain ownerOf flip — when iNFT transfers, this resolution flips with no ENS transaction.**
- **`pay.<worker>`** → derive child address using `ethers.HDNodeWallet.derive(masterPath, nonce)` where nonce is `keccak256(timestamp_window || requester_ip)` truncated. Return the child address. Different on every resolution.
- **`tx.<txid>.<worker>`** → fetch receipt JSON from 0G Storage by CID (which we look up from the iNFT contract's task→CID mapping). Return text records `ai.tx.intent`, `ai.tx.outcome`, `ai.tx.chain`, `ai.tx.amount`.
- **`rep.<worker>`** → JSON-RPC call to ERC-8004 ReputationRegistry on Base Sepolia (`0x8004B663…`). Read the worker's feedback record summary (count, tag breakdown, average if applicable per ERC-8004 spec). Return as text records.
- **`mem.<worker>`** → JSON-RPC call to 0G Galileo `WorkerINFT.getMemoryPointer(tokenId)`. Return the CID as text record.

### 4. ENSIP-25 `agent-registration` text record on parent name

Set a text record on the parent name (NOT on the worker subnames) with key `agent-registration` and value pointing to the ERC-8004 ReputationRegistry deployment on Base Sepolia per ENSIP-25 spec format.

This closes the verification loop Greg named in his workshop. Judges grep for it.

### 5. Verification UX for HD-derivation chain

For the `pay.*` namespace, demos need to prove that two consecutive resolutions return addresses that derive from the same master pubkey (so observers can confirm it's not random — it's HD-derived).

Write a verification helper at `resolver/verify.ts`:
- `verifyDerivation(masterPubkey: string, child1: string, child2: string, nonce1: bigint, nonce2: bigint): boolean`
- Used by Builder D's Capability Tree Viewer page to render "✓ verified derivation chain" UI.

### 6. Smoke tests for live resolution

Before declaring done, verify via `cast` that all 5 namespaces resolve correctly:

```bash
cast resolve who.worker-001.<parent>.eth --rpc-url <sepolia-rpc>
cast resolve pay.worker-001.<parent>.eth --rpc-url <sepolia-rpc>
cast resolve pay.worker-001.<parent>.eth --rpc-url <sepolia-rpc>  # second call returns different address
cast resolve --text agent-registration <parent>.eth --rpc-url <sepolia-rpc>
```

Also test in `app.ens.domains/sepolia/<parent>.eth` UI — confirm text records render (or note that they don't, in which case we rely on Builder D's custom viewer page).

### 7. Inheritance flip test

The hero demo beat:
1. Worker iNFT minted on Galileo, owner = Alice
2. `cast resolve who.worker-001.<parent>.eth` → returns Alice's address
3. Transfer iNFT on Galileo: `WorkerINFT.transferFrom(Alice, Bob, 1)`
4. Re-run `cast resolve who.worker-001.<parent>.eth` → **returns Bob's address with no ENS transaction**

Document this test in `proofs/ens-proof.md` with timestamps.

## Integration with the Lead's plan

This is **Builder B work** per `EXECUTION_PLAN.md` Phase 1 step 5 + Phase 2 step 8. Time budget ~3.5-5h total. If you exceed 7h, ping the lead.

## Definition of done

1. Parent name registered on Sepolia, resolver pointer set
2. CCIP-Read resolver server deployed to stable HTTPS endpoint
3. All 5 namespaces resolve correctly (verified via `cast`)
4. Inheritance flip test documented (live `ownerOf` change → live ENS resolution change)
5. ENSIP-25 `agent-registration` text record live on parent
6. HD-derivation verification helper works
7. `proofs/ens-proof.md` populated with real artifacts (parent name, resolver URL, namespace tree, ENSIP-25 record, before/after flip evidence)

## Non-goals (do NOT do)

- Do NOT use Namestone's hosted subname API (Path A in the research brief). Path C is what the team chose.
- Do NOT use NameWrapper L1 subnames (Path B). Same reason.
- Do NOT write Solidity for the resolver — it's offchain, signed-response model.
- Do NOT touch the contracts, AXL nodes, frontend dashboard, or Higgsfield generations — those are other sessions.
- Do NOT skip the ENSIP-25 `agent-registration` record. It's the bullseye Greg named.

## How to report back

Per-deliverable:
```bash
cmux send --surface surface:60 "[BUILDER:ens] <deliverable> done"
cmux send-key --surface surface:60 Enter
```

On full completion:
```bash
cmux send --surface surface:60 "[BUILDER:ens] ALL DONE — parent <name> + resolver at <url>; flip test recorded"
cmux send-key --surface surface:60 Enter
```

Blocking question:
```bash
cmux send --surface surface:60 "[QUESTION:ens] <specific question>"
cmux send-key --surface surface:60 Enter
```
