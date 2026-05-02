# ENS Proof

*Status: Sepolia ENS CCIP-Read integration live-smoked on May 2, 2026. `ledger.eth` is wired to the deployed Sepolia resolver; `who`, `pay`, `tx`, `rep`, and `mem` namespace handlers exist; Sepolia ENS resolution smoke passed.*

## What we used

Custom CCIP-Read offchain resolver under `ledger.eth` on Sepolia. Five capability namespaces per worker: `who.<worker>`, `pay.<worker>`, `tx.<txid>.<worker>`, `rep.<worker>`, `mem.<worker>`. The resolver makes live JSON-RPC calls to 0G Galileo (`ownerOf()`) and serves Base Sepolia ERC-8004 metadata per resolution. ENSIP-25 `agent-registration` text on the parent closes the verification loop with the audited ERC-8004 deployment.

## Evidence

- **Parent ENS name:** `ledger.eth` on Sepolia
- **Parent owner:** `0x32FE11d9900D63350016374BE98ff37c3Af75847`
- **Sepolia CCIP resolver contract:** `0xcfF2f12F0600CDcf1cebed43efF0A2F9a98ef531`
- **Resolver deploy tx:** `0x74d55556d94084420fdcb928d7cea8c76c434c1d5cc074a58c8fb3a54106193d`
- **Set resolver tx:** `0x9758ba4bc7c1583d5590000d219443330c4122ae2ac7a9dc2670dee7ce8695f5`
- **CCIP gateway URL:** `https://9e04-124-123-105-119.ngrok-free.app/{sender}/{data}` for the demo window
- **Resolver signer:** `0x3f37270ef375c20CD0b218B94454557005CfB248`
- **App integration contract:** `resolver/ledger.capabilities.json`
- **Typed integration client:** `resolver/src/client.ts`
- **Live smoke artifacts:** `proofs/data/ens-live-smoke.json`, `proofs/data/ens-sepolia-resolve.json`

## Contracts

- **0G Galileo chain:** `16602`; live RPC returned `eth_chainId = 0x40da`
- **WorkerINFT:** `0x48B051F3e565E394ED8522ac453d87b3Fa40ad62`
- **LedgerEscrow:** `0x12D2162F47AAAe1B0591e898648605daA186D644`
- **LedgerIdentityRegistry:** `0xa6a621e9C92fb8DFC963d2C20e8C5CB4C5178cBb`
- **ERC-8004 ReputationRegistry:** `0x8004B663056A597Dffe9eCcC1965A193B7388713` on Base Sepolia

## Namespace Smoke

- `who.worker-001.ledger.eth` resolved to current 0G `ownerOf(1)`: `0x6641221B1cb66Dc9f890350058A7341eF0eD600b`
- `pay.worker-001.ledger.eth` resolved twice to two different HD-derived addresses:
  - latest smoke: `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC`
  - latest smoke: `0x90F79bf6EB2c4f870365E785982E1f101E93b906`
- `rep.worker-001.ledger.eth` text smoke:
  - `ai.rep.registry = 0x8004B663056A597Dffe9eCcC1965A193B7388713`
  - `ai.rep.count = 47`
- `mem.worker-001.ledger.eth` text smoke:
  - `ai.mem.cid = 0g://0xd8fb3ad312ca5e9002f7bdd47d93839b9a6dcd83d396bb74a44a9f65344982c4`
- `ledger.eth` parent text smoke:
  - `agent-registration = {"standard":"ENSIP-25","registry":"0x8004B663056A597Dffe9eCcC1965A193B7388713","chain":"base-sepolia","chainId":84532,"agentId":"1"}`

## Inheritance Flip

Historical on-chain proof from the already-completed transfer:

- Block `31130502`: `ownerOf(1)` returned `0x6B9ad963c764a06A7ef8ff96D38D0cB86575eC00`
- Mint tx at block `31130502`: `0xc41cebd48d86382bba75d08fa514da2e151924c3f03dd7d2652992c693bd001f`
- Block `31130543`: `ownerOf(1)` returned `0x6641221B1cb66Dc9f890350058A7341eF0eD600b`
- Transfer tx at block `31130543`: `0x3e6b0e4f27ee0796460407d084d9bc99f94a033f5b18073291af5899a8053a79`
- Latest Sepolia ENS smoke through `who.worker-001.ledger.eth` returned `0x6641221B1cb66Dc9f890350058A7341eF0eD600b`

## Known Limitations

- This Foundry install exposes `cast resolve-name`, not `cast resolve`, and `cast resolve-name` did not follow ENSIP-10 wildcard parents. Final smoke uses `ethers` against the Sepolia ENS registry with CCIP-Read enabled; artifact: `proofs/data/ens-sepolia-resolve.json`.
- Direct `getMemoryPointer(1)` on the deployed `WorkerINFT` currently reverts; resolver `mem.*` is using the lead-provided memory CID via `MEMORY_POINTERS_JSON`.
- Gateway uptime currently depends on the local resolver process plus ngrok tunnel staying alive. For production durability, deploy `resolver/` to Vercel or a Cloudflare named tunnel with the same env values and then deploy/update the resolver URL.

## Reproduction

```bash
cd resolver
npm run smoke:ens
```
