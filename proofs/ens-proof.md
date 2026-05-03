# ENS Proof

_Status: Sepolia ENS CCIP-Read integration live-smoked on May 3, 2026. `ledger.eth` points to the durable-URL resolver served via `resolver.fierypools.fun`; the resolver contract is source verified on Sourcify for Sepolia; `who`, `pay`, `tx`, `rep`, and `mem` namespace handlers exist; Sepolia ENS resolution smoke passed._

## What we used

Custom CCIP-Read offchain resolver under `ledger.eth` on Sepolia. Five capability namespaces per worker: `who.<worker>`, `pay.<worker>`, `tx.<txid>.<worker>`, `rep.<worker>`, `mem.<worker>`. The resolver makes live JSON-RPC calls to 0G Galileo (`ownerOf()`) and serves Base Sepolia ERC-8004 metadata per resolution. ENSIP-25 `agent-registration` text on the parent closes the verification loop with the audited ERC-8004 deployment.

## Evidence

- **Parent ENS name:** `ledger.eth` on Sepolia
- **Parent owner:** `0x32FE11d9900D63350016374BE98ff37c3Af75847`
- **Sepolia CCIP resolver contract (current):** `0xd94cC429058E5495a57953c7896661542648E1B3`
- **Resolver source verification:** Sourcify full-match verified on Sepolia chainId `11155111`
- **Set resolver tx (current pointer):** `0xc49a3288274156d826bec3898bf31c15121a90d3bf885f39a8cb74ba67d89caf`
- **CCIP gateway URL (durable):** `https://resolver.fierypools.fun/{sender}/{data}` (Cloudflare named tunnel `kosyn-cre`)
- **Resolver signer:** `0x32FE11d9900D63350016374BE98ff37c3Af75847`
- **App integration contract:** `resolver/ledger.capabilities.json`
- **Typed integration client:** `resolver/src/client.ts`
- **Live smoke artifacts:** `proofs/data/ens-live-smoke.json`, `proofs/data/ens-sepolia-resolve.json`
- **Prior resolver (superseded May 3):** `0xcfF2f12F0600CDcf1cebed43efF0A2F9a98ef531` — replaced because its `url` was set to a rotating ngrok host. The new contract bakes the durable cloudflared URL in `immutable` form via constructor.

## Contracts

- **0G Galileo chain:** `16602`; live RPC returned `eth_chainId = 0x40da`
- **WorkerINFT:** `0xd4d74E089DD9A09FF768be95d732081bd542E498`
- **LedgerEscrow:** `0x83dF0Ed0b4f3D1D057cB56494b8c7eE417265489`
- **LedgerIdentityRegistry:** `0x9581490E530Da772Af332EBCe3f35D27d5e8377F`
- **ERC-8004 ReputationRegistry:** `0x8004B663056A597Dffe9eCcC1965A193B7388713` on Base Sepolia

## Namespace Smoke

- `who.worker-001.ledger.eth` resolved to current 0G `ownerOf(1)`: `0x6641221B1cb66Dc9f890350058A7341eF0eD600b`
- `pay.worker-001.ledger.eth` resolved twice to two different HD-derived addresses:
  - latest smoke: `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC`
  - latest smoke: `0x90F79bf6EB2c4f870365E785982E1f101E93b906`
- `rep.worker-001.ledger.eth` text smoke (now backed by live ERC-8004 records, not env cache):
  - `ai.rep.registry = 0x8004B663056A597Dffe9eCcC1965A193B7388713` (ReputationRegistry on Base Sepolia)
  - `ai.rep.agent = 5444` (registered ERC-8004 IdentityRegistry tokenId for the demo worker)
  - `ai.rep.count = 47` — 47 distinct `giveFeedback` records on-chain across 8 distinct client wallets
  - `ai.rep.average = 4.77` — direct `getSummary(5444, [clients...], "", "")` returns `count=47, sumValue=224190000000000000000, decimals=18`
- `mem.worker-001.ledger.eth` text smoke:
  - `ai.mem.cid = 0g://0xd8fb3ad312ca5e9002f7bdd47d93839b9a6dcd83d396bb74a44a9f65344982c4`
- `tx.escrow-release-001.worker-001.ledger.eth` text smoke (5th namespace):
  - `ai.tx.intent = release-payment`
  - `ai.tx.outcome = released`
  - `ai.tx.chain = 0g-galileo:16602`
  - `ai.tx.amount = 0.1`
  - `ai.tx.cid = 0g://0xd8fb3ad312ca5e9002f7bdd47d93839b9a6dcd83d396bb74a44a9f65344982c4`
  - `ai.tx.receipt` includes the on-chain `releasePayment` tx hash `0x7f7ff8061ba4a68b6963d27abefa601fbde8d9474e8dadd8207d138fc6e1a3e2` and the escrow taskId `0x005ecb1bf6cd06a9d1c7240ab1365aebedbe8104d1b530a892fd0af228c1e604`
- `ledger.eth` parent text smoke:
  - `agent-registration = {"standard":"ENSIP-25","registry":"0x8004B663056A597Dffe9eCcC1965A193B7388713","chain":"base-sepolia","chainId":84532,"agentId":"5444","identityRegistry":"0x8004A818BFB912233c491871b3d84c89A494BD9e"}`

## Judge Path

The fastest way to evaluate the ENS integration is:

1. Open `/agent/worker-001.ledger.eth` in the live app and verify the capability tree shows `who`, `pay`, `tx`, `rep`, and `mem`.
2. Run `cd resolver && npm run smoke:ens` to resolve the Sepolia ENS name through CCIP-Read.
3. Compare `who.worker-001.ledger.eth` with `WorkerINFT.ownerOf(1)` on 0G Galileo. They should match the current owner `0x6641221B1cb66Dc9f890350058A7341eF0eD600b`.
4. Confirm the ownership flip happened through the 0G iNFT transfer tx, not through a new ENS tx. ENS remains the stable name while `ownerOf(1)` changes underneath.
5. Confirm `pay.worker-001.ledger.eth` rotates receive addresses and `rep.worker-001.ledger.eth` points to the live ERC-8004 registry data.

## Inheritance Flip

Historical on-chain proof from the already-completed transfer:

- Block `31312412`: `ownerOf(1)` returned `0x6B9ad963c764a06A7ef8ff96D38D0cB86575eC00`
- Mint tx at block `31312412`: `0x26b7de55c33f7f82730ea333b509706c1092797c65c5360d1ad5ae0027c17c96`
- Block `31312433`: `ownerOf(1)` returned `0x6641221B1cb66Dc9f890350058A7341eF0eD600b`
- Transfer tx at block `31312433`: `0xe4d697d7b8dd7c3cb01fa28544a03aecd4cd6f2f1c019c26d2219c828398e9fd`
- Latest Sepolia ENS smoke through `who.worker-001.ledger.eth` returned `0x6641221B1cb66Dc9f890350058A7341eF0eD600b`

## Known Limitations

- This Foundry install exposes `cast resolve-name`, not `cast resolve`, and `cast resolve-name` did not follow ENSIP-10 wildcard parents. Final smoke uses `ethers` against the Sepolia ENS registry with CCIP-Read enabled; artifact: `proofs/data/ens-sepolia-resolve.json`.
- Direct `getMemoryPointer(1)` on the deployed `WorkerINFT` currently reverts; resolver `mem.*` is using the lead-provided memory CID via `MEMORY_POINTERS_JSON`.
- Gateway uptime is now durable: served via the `kosyn-cre` Cloudflare named tunnel routing `resolver.fierypools.fun → localhost:8787`. Both the Node resolver and `cloudflared` are supervised by `launchd` (`com.ledger.resolver`, `com.cloudflared.kosyn-cre`) with `KeepAlive: true`, so they survive Mac sleep, reboots, and accidental kills. See `resolver/supervise/README.md` for setup. The signing key lives in `~/.config/ledger-resolver/env` (mode 0600), outside the repo.

## Reproduction

```bash
cd resolver
npm run smoke:ens
```
