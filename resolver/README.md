# Ledger ENS Resolver

CCIP-Read gateway for the ENS integration in `../tools/builder_briefings/04_sponsor_ens.md`.

## Scope

- `who.worker-NNN.<parent>.eth` resolves to `WorkerINFT.ownerOf(NNN)` on 0G Galileo chain ID `16602`.
- `pay.worker-NNN.<parent>.eth` resolves to a fresh HD-derived address per resolution.
- `tx.<txid>.worker-NNN.<parent>.eth` exposes task receipt text records from `TX_RECEIPTS_JSON`.
- `rep.worker-NNN.<parent>.eth` exposes ERC-8004 reputation text records from `REP_SUMMARIES_JSON`, defaulting registry metadata to the audited Base Sepolia deployment.
- `mem.worker-NNN.<parent>.eth` exposes the 0G memory pointer from `WorkerINFT.getMemoryPointer` or `MEMORY_POINTERS_JSON`.
- Responses are encoded for the standard ENS `addr(bytes32)` and `addr(bytes32,uint256)` resolver functions.
- Responses are signed for the `OffchainResolver` contract pattern from `0xFlicker/tod-offchain-resolver`.

## Text Record Keys

| Namespace | Keys |
|---|---|
| `pay.*` | `ai.pay.address`, `ai.pay.nonce`, `ai.pay.path`, `ai.pay.master`, `ai.pay.scheme` |
| `tx.*` | `ai.tx.cid`, `ai.tx.intent`, `ai.tx.outcome`, `ai.tx.chain`, `ai.tx.amount`, `ai.tx.receipt` |
| `rep.*` | `ai.rep.count`, `ai.rep.average`, `ai.rep.tags`, `ai.rep.registry`, `ai.rep.agent`, `ai.rep.summary` |
| `mem.*` | `ai.mem.cid`, `ai.mem.pointer` |

## Environment

```bash
RESOLVER_PRIVATE_KEY=0x...
PARENT_ENS_NAME=ledger-demo.eth
OG_RPC_URL=https://evmrpc-testnet.0g.ai
OG_CHAIN_ID=16602
WORKER_INFT_ADDRESS=0x...
PAY_MASTER_MNEMONIC="test test test test test test test test test test test junk"
TX_RECEIPTS_JSON='{"task-001":{"cid":"0g://receipt-cid","intent":"Base Yield Scout","outcome":"complete","chain":"base-sepolia","amount":"5 USDC"}}'
REP_SUMMARIES_JSON='{"worker-001":{"count":47,"average":4.7,"tags":{"ledger-job":47}}}'
MEMORY_POINTERS_JSON='{"worker-001":"0g://memory-cid"}'
PORT=8787
```

For local smoke tests before the live `WorkerINFT` deployment exists:

```bash
MOCK_OWNER_ADDRESS=0x0000000000000000000000000000000000000001
```

## Local

```bash
npm install
npm test
npm run build
npm run dev
```

## App Integration

Use `LedgerCapabilityClient` from `src/client.ts` to build the namespace tree and query either live 0G ownership or a deployed gateway:

```ts
import { LedgerCapabilityClient } from "./resolver/src/client";

const client = new LedgerCapabilityClient({
  parentName: "ledger-demo.eth",
  gatewayUrl: "https://<resolver-host>",
  resolverAddress: "0x<sepolia-resolver-contract>",
  workerInftAddress: "0x48B051F3e565E394ED8522ac453d87b3Fa40ad62"
});

const snapshot = await client.snapshot("worker-001", 1n, "task-001");
```

The machine-readable integration contract is `ledger.capabilities.json`.

## Live Smoke

Before wiring the frontend, run:

```bash
RESOLVER_PRIVATE_KEY=0x... \
WORKER_INFT_ADDRESS=0x48B051F3e565E394ED8522ac453d87b3Fa40ad62 \
GALILEO_RPC=https://evmrpc-testnet.0g.ai \
GALILEO_CHAIN_ID=16602 \
MEMORY_POINTERS_JSON='{"worker-001":"0g://0xd8fb3ad312ca5e9002f7bdd47d93839b9a6dcd83d396bb74a44a9f65344982c4"}' \
npm run smoke:live
```

This writes `../proofs/data/ens-live-smoke.json`.

The deployed resolver contract URL template should point to:

```text
https://<host>/<sender>/<callData>
```
