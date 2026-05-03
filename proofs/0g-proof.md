# 0G Proof

*Status: live Galileo proof complete as of May 3, 2026. Source verification on the Galileo explorer is still pending a real explorer API key.*

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

The example generated a valid Ledger AXL `BID` payload for `who.worker-001.ledger.eth`, read WorkerINFT owner `0x6641221B1cb66Dc9f890350058A7341eF0eD600b`, verified the ENS capability owner matched that owner, verified the ENS memory CID matched `0g://0xd8fb3ad312ca5e9002f7bdd47d93839b9a6dcd83d396bb74a44a9f65344982c4`, proved `pay.*` rotation with two different addresses, and attached ERC-8004 reputation evidence `47 / 4.77` from the ENS gateway. The reasoner is explicitly deterministic dry-run in this example; paid live 0G Compute proof is recorded separately in the compute section below.

## Deployed Contracts

| Contract | Address | Deploy tx |
| --- | --- | --- |
| `MockTEEOracle` | `0x229869949693f1467b8b43d2907bDAE3C58E3047` | `0x3ad5dce58ee111a54768ef2e35fe9576c6bad578080719e70a080a198634bcde` |
| `WorkerINFT` | `0x48B051F3e565E394ED8522ac453d87b3Fa40ad62` | `0x753fe54efcbbaea020ca5e8dd101cb849a636d5f837f9d2004d6441b4680427a` |
| `LedgerEscrow` | `0xCAe1c804932AB07d3428774058eC14Fb4dfb2baB` | `0x8189e5a075ce73092abc1c654f95572d39928ea8c358f8a1ce983b39f597fb99` |
| `LedgerIdentityRegistry` | `0xa6a621e9C92fb8DFC963d2C20e8C5CB4C5178cBb` | `0x7384dc15a1dd17b52e92f8d8df71222d149c3b35579169a6f05282f217d77f2f` |

Code-size readback after deploy confirmed non-empty bytecode for all deployed contracts.

## Live Storage Proof

- Storage SDK: `@0gfoundation/0g-storage-ts-sdk`
- Flow contract observed by SDK: `0x22e03a6a89b950f1c82ec5e74f8eca321a105296`
- Upload tx: `0xc6cd5ca57b2c005114fef5705d89da67bcff578659a4ca5a8f5d50d4220eb5ca`
- Memory root hash: `0xd8fb3ad312ca5e9002f7bdd47d93839b9a6dcd83d396bb74a44a9f65344982c4`
- Memory CID used by iNFT: `0g://0xd8fb3ad312ca5e9002f7bdd47d93839b9a6dcd83d396bb74a44a9f65344982c4`
- Download proof: SDK found two storage locations, downloaded the encrypted blob, decrypted it locally, and byte-equality matched the original plaintext.

Note: the installed 0G Storage SDK exposes `upload` / `download` on `Indexer`; Ledger wraps those behind the required `uploadAgentMemory` / `downloadAgentMemory` adapter surface.

## Live iNFT Proof

- Mint tx: `0xc41cebd48d86382bba75d08fa514da2e151924c3f03dd7d2652992c693bd001f`
- Mint block: `31130502`
- Token ID: `1`
- Initial owner: `0x6B9ad963c764a06A7ef8ff96D38D0cB86575eC00`
- Transfer tx: `0x3e6b0e4f27ee0796460407d084d9bc99f94a033f5b18073291af5899a8053a79`
- Transfer block: `31130543`
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

- Identity registration tx: `0x7ce676a250246781d6f3095963cde1331dee0ac4c33fbba2201ed602724f28ed`
- Registered ENS-style name: `worker-001.ledger.eth`
- Registered capabilities: `who,pay,tx,rep,mem`
- Upgraded `LedgerEscrow`: `0xCAe1c804932AB07d3428774058eC14Fb4dfb2baB`
- Escrow deploy tx: `0x8189e5a075ce73092abc1c654f95572d39928ea8c358f8a1ce983b39f597fb99`
- Escrow task ID: `0x44ed5f980b1b92cde2970f38708dd17f0aaf31f814f3b2328badd2dc8dc2c7ae`
- `postTask` tx: `0x01111fa6852b084f96e514475ee99950be7f909e58174308e3c366229dc49cfe`
- `acceptTokenBid` tx: `0x327e0bffc45ee801a6676b69e85e5fd1cf83e9cc9e2ec9fc75e3d35f15f570cb`
- `taskWorkerTokenIds(taskId)` readback: `1`
- `payoutRecipient(taskId)` readback before release: `0x6641221B1cb66Dc9f890350058A7341eF0eD600b`
- `releasePayment` tx: `0xe91e0b52dd0ba6095794f33cb77a9027c3cc97d78170f940d47b348fc1f8a95d`
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
- Reserve/current owner balance after the token-owned settlement proof: `4.000103251998955691` OG
- Deployer wallet balance after the token-owned settlement proof: `0.076645849226710328` OG
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

cast call 0x48B051F3e565E394ED8522ac453d87b3Fa40ad62 \
  "ownerOf(uint256)(address)" 1 \
  --rpc-url https://evmrpc-testnet.0g.ai

cast call 0xCAe1c804932AB07d3428774058eC14Fb4dfb2baB \
  "tasks(bytes32)(address,address,uint256,uint256,uint256,uint256,uint256,bytes32,uint8)" \
  0x44ed5f980b1b92cde2970f38708dd17f0aaf31f814f3b2328badd2dc8dc2c7ae \
  --rpc-url https://evmrpc-testnet.0g.ai

cast call 0xCAe1c804932AB07d3428774058eC14Fb4dfb2baB \
  "taskWorkerTokenIds(bytes32)(uint256)" \
  0x44ed5f980b1b92cde2970f38708dd17f0aaf31f814f3b2328badd2dc8dc2c7ae \
  --rpc-url https://evmrpc-testnet.0g.ai

cast call 0xCAe1c804932AB07d3428774058eC14Fb4dfb2baB \
  "payoutRecipient(bytes32)(address)" \
  0x44ed5f980b1b92cde2970f38708dd17f0aaf31f814f3b2328badd2dc8dc2c7ae \
  --rpc-url https://evmrpc-testnet.0g.ai
```

## Known Limitation

Source verification on `https://chainscan-galileo.0g.ai` is not completed because this environment does not have a real `GALILEO_EXPLORER_API_KEY`. Deployment and runtime behavior are proven by transaction receipts and direct RPC readbacks.
