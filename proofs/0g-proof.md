# 0G Proof

*Status: live Galileo proof complete as of May 3, 2026. All Ledger-deployed 0G contracts below are exact-match source verified on the Galileo ChainScan explorer.*

## What We Used

0G Galileo Testnet, ChainID `16602`, native `0G` token. 0G Storage stores encrypted worker memory with client-side AES-256-CTR before upload. 0G Compute runs live OpenAI-compatible inference through `@0gfoundation/0g-compute-ts-sdk` and verifies the provider attestation. Worker ownership uses ERC-7857 (0G iNFT draft standard) semantics with a mock TEE oracle proving sealed-key re-keying during transfer.

The live ERC-8004 registry reference remains `0x8004B663056A597Dffe9eCcC1965A193B7388713`; Ledger does not deploy a custom reputation registry.

## Track A Framework Proof

Track A is represented by `agents/ledger-agent-kit`, an isolated framework/tooling package rather than a rebrand of the marketplace UI.

- Runtime: `LedgerAgentRuntime` loads a worker's 0G iNFT ownership state, ENS capability snapshot, encrypted-memory reference, reasoning adapter, and optional AXL transport.
- 0G adapters: `createZeroGMemoryAdapter`, `createZeroGComputeAdapter`, and `createZeroGOwnershipAdapter`.
- Other adapters: `createEnsIdentityAdapter` and `createAxlTransportAdapter`.
- Working example agent: `agents/ledger-agent-kit/examples/research-worker-agent.ts`.
- Architecture diagram: `agents/ledger-agent-kit/docs/architecture.mmd`.

Verified locally on May 3, 2026:

```bash
cd agents/ledger-agent-kit
npm run typecheck
npm test
LEDGER_ENS_GATEWAY_URL=https://resolver.fierypools.fun npm run example:research
```

The example generated a valid Ledger AXL `BID` payload for `who.worker-001.ledger.eth`, read WorkerINFT owner `0x6641221B1cb66Dc9f890350058A7341eF0eD600b`, returned `identityMode="gateway"` and `identityVerified=true`, verified the ENS capability owner matched that owner, verified the ENS memory CID matched `0g://0xd8fb3ad312ca5e9002f7bdd47d93839b9a6dcd83d396bb74a44a9f65344982c4`, proved `pay.*` rotation with two different addresses, and attached ERC-8004 reputation evidence `47 / 4.77` from the ENS gateway. Running the example without `LEDGER_ENS_GATEWAY_URL` fails closed; local-only dry-run requires `LEDGER_AGENT_KIT_ALLOW_LOCAL_DRY_RUN=1` and emits `source="unverified"`. The reasoner is explicitly deterministic dry-run in this example; paid live 0G Compute proof is recorded separately in the compute section below.

## Deployed Contracts

| Contract | Address | Deploy tx |
| --- | --- | --- |
| `MockTEEOracle` | `0x306919805Eed1aD4772d92e18d00A1c132b07C19` | `0x91dd61a35f5fa11345948f52f9f5e78bad247713d3eccdd1530e552f1169af03` |
| `WorkerINFT` | `0xd4d74E089DD9A09FF768be95d732081bd542E498` | `0xf9178d95e15e9fd5a8e1f1810a7239436ad0b7e40c4bd3bdeaba48d93b181ee3` |
| `LedgerEscrow` | `0x83dF0Ed0b4f3D1D057cB56494b8c7eE417265489` | `0x85140cba84b7c5bc152ded0ab046f805a82d1ffcd9b2fd2c7cbaa2ecc54db21` |
| `LedgerIdentityRegistry` | `0x9581490E530Da772Af332EBCe3f35D27d5e8377F` | `0x8fce0f8b0082aa107b9f493de01e4492e4eecf0bad2c7da947e1c46b587ec285` |

Code-size readback after deploy confirmed non-empty bytecode for all deployed contracts.

Source verification readback from `https://chainscan-galileo.0g.ai/v1/contract/<address>?fields=verify,transactionHash` returned `exactMatch=true` for all four contracts with Solidity `v0.8.24+commit.e11b9ed9`, EVM `cancun`, optimizer disabled, and MIT license.

## Live Storage Proof

- Storage SDK: `@0gfoundation/0g-storage-ts-sdk`
- Flow contract observed by SDK: `0x22e03a6a89b950f1c82ec5e74f8eca321a105296`
- Upload tx: `0xc6cd5ca57b2c005114fef5705d89da67bcff578659a4ca5a8f5d50d4220eb5ca`
- Memory root hash: `0xd8fb3ad312ca5e9002f7bdd47d93839b9a6dcd83d396bb74a44a9f65344982c4`
- Memory CID used by iNFT: `0g://0xd8fb3ad312ca5e9002f7bdd47d93839b9a6dcd83d396bb74a44a9f65344982c4`
- Download proof: SDK found two storage locations, downloaded the encrypted blob, decrypted it locally, and byte-equality matched the original plaintext.

Note: the installed 0G Storage SDK exposes `upload` / `download` on `Indexer`; Ledger wraps those behind the required `uploadAgentMemory` / `downloadAgentMemory` adapter surface.

## Live iNFT Proof

- Mint tx: `0x26b7de55c33f7f82730ea333b509706c1092797c65c5360d1ad5ae0027c17c96`
- Mint block: `31312412`
- Token ID: `1`
- Initial owner: `0x6B9ad963c764a06A7ef8ff96D38D0cB86575eC00`
- Transfer tx: `0xe4d697d7b8dd7c3cb01fa28544a03aecd4cd6f2f1c019c26d2219c828398e9fd`
- Transfer block: `31312433`
- New owner read from `ownerOf(1)`: `0x6641221B1cb66Dc9f890350058A7341eF0eD600b`
- Sealed key after transfer: `0x7365616c65642d666f722d726573657276652d6f776e6572`
- Reputation ref: `erc8004:0x8004B663056A597Dffe9eCcC1965A193B7388713`

This proves mint, owner transfer, metadata persistence, and sealed-key re-keying through the ERC-7857 (0G iNFT draft standard) transfer path.

## Live Compute Proof

- Compute ledger creation tx: `0xc27d4f36505320f24f60d6ab6cc0e0cf7899b374def9ee953527c2d0aac78ff2`
- Provider fund transfer txs: `0x067b9bfc4d289ab3aa83f3ef40d52cc5bda5851f115eebb452e506e63bb1a36b`, `0x95915a620dba86ee28ae7f39c4f25a67c62abfa865712c01fd7adf92785bce4e`
- Live provider used: `0xa48f01287233509FD694a22Bf840225062E67836`
- Live provider model: `qwen/qwen-2.5-7b-instruct`
- Prompt output: `Ledger 0G computes proof live.`
- Attestation digest: `0x59c79e5a43357945f442a2417cd7aabf2c74b19708dc97e839ec08e1ae223950`
- `verifyAttestation(...)`: `true`
- Attestation report file: `/tmp/ledger-0g-compute-reports-live/broker_attestation_report.json`
- App integration live smoke output: `Ledger app integration smoke passed.`

The installed live network listed two services at test time: one chatbot and one image-editing service. The requested Ledger model aliases remain in the module API; when the exact workshop alias is unavailable, the client falls back to the live chatbot provider.

## Live Identity And Escrow Proof

- Identity registration tx: `0x9530028297c6656657be2f77ab0e68841839b6db2594ffe97e5003b841d9e9e0`
- Registered ENS-style name: `worker-001.ledger.eth`
- Registered capabilities: `who,pay,tx,rep,mem`
- Upgraded `LedgerEscrow`: `0x83dF0Ed0b4f3D1D057cB56494b8c7eE417265489`
- Escrow deploy tx: `0x85140cba84b7c5bc152ded0ab046f805a82d1ffcd9b2fd2c7cbaa2ecc54db21`
- Escrow task ID: `0x005ecb1bf6cd06a9d1c7240ab1365aebedbe8104d1b530a892fd0af228c1e604`
- `postTask` tx: `0x4b36766cd44b05bbc95ebfaf188ec3cac57a8d81b3246f51526f487eb9d4007c`
- `acceptTokenBid` tx: `0x57f35f717ff8e73e2e309f9e9131f68399bad823cc773bf7e123cde8b0335c02`
- `taskWorkerTokenIds(taskId)` readback: `1`
- `payoutRecipient(taskId)` readback before release: `0x6641221B1cb66Dc9f890350058A7341eF0eD600b`
- `releasePayment` tx: `0x7f7ff8061ba4a68b6963d27abefa601fbde8d9474e8dadd8207d138fc6e1a3e2`
- `PaymentReleased` worker topic: `0x6641221B1cb66Dc9f890350058A7341eF0eD600b`
- Result hash: `0xf8d3ef6a9f1c1d8242101d18b891675e37eef6670eda143971bf69b4d4ce9fb4`
- Final task status readback: `3` (`Released`)

This proves the owner-of-at-payment inheritance payout route live on Galileo: the accepted job records worker iNFT token ID `1`, `payoutRecipient(taskId)` resolves `WorkerINFT.ownerOf(1)`, and the release event pays the current owner `0x6641...600b`.

Machine-readable proof artifact: `proofs/data/0g-token-owned-escrow.json`.

## Live ERC-8004 Reputation Proof

The 0G iNFT references reputation via the canonical ERC-8004 ReputationRegistry on Base Sepolia (`0x8004B663056A597Dffe9eCcC1965A193B7388713`). The demo worker is registered in the ERC-8004 IdentityRegistry (`0x8004A818BFB912233c491871b3d84c89A494BD9e`) at agentId `5444`, and 47 distinct `giveFeedback` records have been submitted by 8 different client wallets to back the "47 jobs, 4.77 average" demo claim.

- IdentityRegistry: `0x8004A818BFB912233c491871b3d84c89A494BD9e`
- ReputationRegistry: `0x8004B663056A597Dffe9eCcC1965A193B7388713`
- Demo agentId: `5444`
- Distinct client wallets: `8`
- Total feedback records on-chain: `47`
- `getSummary(5444, [clients...], "", "")` returns: `count=47, sumValue=224190000000000000000, decimals=18` → average `4.77`
- Read command:

```bash
cast call 0x8004B663056A597Dffe9eCcC1965A193B7388713 \
  "getSummary(uint256,address[],string,string)(uint64,int128,uint8)" \
  5444 "[<8 client addresses>]" "" "" \
  --rpc-url https://sepolia.base.org
```

## App Integration Readiness

- App-facing package: `agents/0g-integration`
- Exports: canonical Galileo config, deployed contract readers/writers, worker profile shaping, encrypted memory preparation, memory roundtrip assertion, and live compute reasoning wrapper.
- Local regression: `pnpm test && pnpm typecheck` passed in `agents/0g-integration`.
- Read-only live smoke: `pnpm run smoke:live` read token `1` from Galileo and confirmed local memory byte equality.
- Optional live compute smoke: `LEDGER_LIVE_COMPUTE=1 pnpm run smoke:live` returned `Ledger app integration smoke passed.`

## Budget Guardrail

Per Gabriel's instruction, `7.0` OG was moved to a reserve wallet and was not spent during testing.

- Reserve wallet: `0x6641221B1cb66Dc9f890350058A7341eF0eD600b`
- Reserve transfer tx: `0xa3fecd88a663cf8bb5e6dc0515e87c7ebe6e6b9c441ea93dd524824c5695237b`
- Reserve/current owner balance after the token-owned settlement proof: `4.000007167998031495` OG
- Deployer wallet balance after the token-owned settlement proof: `0.052124845682478845` OG
- Compute ledger/provider allocation used from the testing budget: ledger created with `3.0` OG; `3.0` OG transferred to the live compute provider sub-account by the SDK across two live compute smokes.

Do not spend this current-owner wallet further unless Gabriel explicitly authorizes it.

## Verification Commands

```bash
cd contracts
forge test -vvv

cd ../agents/0g-storage
pnpm test
pnpm typecheck

cd ../0g-compute
pnpm test
pnpm typecheck

cd ../ledger-agent-kit
npm run typecheck
npm test
LEDGER_ENS_GATEWAY_URL=https://resolver.fierypools.fun npm run example:research

cast call 0xd4d74E089DD9A09FF768be95d732081bd542E498 \
  "ownerOf(uint256)(address)" 1 \
  --rpc-url https://evmrpc-testnet.0g.ai

cast call 0x83dF0Ed0b4f3D1D057cB56494b8c7eE417265489 \
  "tasks(bytes32)(address,address,uint256,uint256,uint256,uint256,uint256,bytes32,uint8)" \
  0x005ecb1bf6cd06a9d1c7240ab1365aebedbe8104d1b530a892fd0af228c1e604 \
  --rpc-url https://evmrpc-testnet.0g.ai

cast call 0x83dF0Ed0b4f3D1D057cB56494b8c7eE417265489 \
  "taskWorkerTokenIds(bytes32)(uint256)" \
  0x005ecb1bf6cd06a9d1c7240ab1365aebedbe8104d1b530a892fd0af228c1e604 \
  --rpc-url https://evmrpc-testnet.0g.ai

cast call 0x83dF0Ed0b4f3D1D057cB56494b8c7eE417265489 \
  "payoutRecipient(bytes32)(address)" \
  0x005ecb1bf6cd06a9d1c7240ab1365aebedbe8104d1b530a892fd0af228c1e604 \
  --rpc-url https://evmrpc-testnet.0g.ai
```

## Source Verification

The judge-facing 0G contracts are deployed from single-file sources in `contracts/verified/` because the Galileo ChainScan verifier currently accepts single-file Solidity input. ChainScan verification is complete for `MockTEEOracle`, `WorkerINFT`, `LedgerIdentityRegistry`, and `LedgerEscrow`; each explorer API response returned `exactMatch=true`.
