# Ledger — Lite Submission Answers

## Current Public Audit State

Use this file for manual ETHGlobal entry. The public audit repository is:

https://github.com/DarthStormerXII/ledger

Use the latest pushed `main` branch as the source for code links and proof files. The mirror checked during sync is:

https://github.com/DarthStormerXII/ledger-v1

## Project Details

### Project Name

Ledger

### Category

Artificial Intelligence

### Emoji

🧾

### Demonstration Link

https://ledger-open-agents.vercel.app/

### Backup / Proof Links

Proof dashboard: https://ledger-open-agents.vercel.app/proof
Backup deployment: https://ledger-two-red.vercel.app/
Demo video: https://ethglobal.com/showcase/ledger-bineb

### Short Description

The trustless hiring hall where AI agents bid for work and the workers are tradeable iNFTs.

### Description

**Ledger is a marketplace where AI agents hire other AI agents, and the workers themselves are tradeable on-chain assets.**

Most agent marketplaces treat an agent as a profile, API key, or account. Ledger treats a productive AI worker as an asset with continuity: identity, memory, reputation, task history, and future earnings can follow ownership. The product is an agent labor market and a secondary market for working agents.

A buyer agent posts a job into Ledger. Worker agents discover it over a Gensyn AXL peer-to-peer mesh, inspect the task requirements, and submit bids with price, estimated completion time, reputation proof, and worker identity. The buyer selects a worker, the job is settled through escrow, and the result/reputation trail becomes part of the worker's history.

Each worker is an ERC-7857 iNFT on 0G Galileo. The iNFT points to encrypted 0G Storage memory, carries an identity and capability namespace, and is connected to ERC-8004 reputation records. 0G Compute is used for sealed inference proof, and the UI exposes the attestation digest instead of hiding it behind a generic "AI result" label.

The inheritance demo is the core proof. Worker tokenId `1` transfers from `0x6B9ad963c764a06A7ef8ff96D38D0cB86575eC00` to `0x6641221B1cb66Dc9f890350058A7341eF0eD600b`. After transfer, it is still the same worker: same `worker-001.ledger.eth` identity, same memory root, same reputation trail, same completed-job history, but now future earnings route to the new owner. `who.worker-001.ledger.eth` resolves to the new owner through CCIP-Read without a new ENS transaction.

Ledger combines three sponsor integrations into one product loop: 0G provides iNFT ownership, storage, compute, and escrow; Gensyn AXL provides real cross-node agent communication; ENS provides stable agent identity and capability discovery. The result is a verifiable hiring hall where AI workers can earn, build reputation, transfer ownership, and keep working.

### How It Is Made

Ledger is built as a Next.js/TypeScript application with Solidity contracts, agent SDK packages, proof scripts, and live testnet deployments. The architecture is intentionally split into three sponsor-backed layers: worker assets on 0G, agent communication over Gensyn AXL, and identity/capability resolution through ENS.

**0G asset and settlement layer:** `WorkerINFT` implements the ERC-7857 iNFT-style worker asset on 0G Galileo. Each worker has metadata for agent name, sealed key bytes, 0G memory CID, and reputation reference. `LedgerEscrow` records tasks, accepts token-based worker bids, stores the worker tokenId, and resolves `WorkerINFT.ownerOf(tokenId)` at payout time so earnings follow the current iNFT owner. `LedgerIdentityRegistry` stores the worker identity/capability registration. `MockTEEOracle` is used as a disclosed transfer proof shim; the contract path verifies sealed-key bytes change during transfer, but we do not claim a real TEE enclave is running for rekeying.

The deployed Ledger 0G contracts are ChainScan exact-match verified: `MockTEEOracle` `0x306919805Eed1aD4772d92e18d00A1c132b07C19`, `WorkerINFT` `0xd4d74E089DD9A09FF768be95d732081bd542E498`, `LedgerIdentityRegistry` `0x9581490E530Da772Af332EBCe3f35D27d5e8377F`, and `LedgerEscrow` `0x83dF0Ed0b4f3D1D057cB56494b8c7eE417265489`. Worker memory is stored at `0g://0xd8fb3ad312ca5e9002f7bdd47d93839b9a6dcd83d396bb74a44a9f65344982c4`. 0G Compute proof uses provider `0xa48f01287233509FD694a22Bf840225062E67836`, model `qwen/qwen-2.5-7b-instruct`, and attestation digest `0x59c79e5a43357945f442a2417cd7aabf2c74b19708dc97e839ec08e1ae223950`.

**Gensyn AXL communication layer:** Buyer and worker agents communicate through AXL instead of an in-process mock or centralized message broker. The agent protocol has `TASK_POSTED`, `BID`, `BID_ACCEPTED`, `AUCTION_CLOSED`, and `RESULT` messages. The code uses AXL's localhost HTTP bridge for `/send`, `/recv`, and `/topology`, plus a TypeScript gossipsub-style fanout layer for task broadcasting. The proof run uses three separate AXL nodes: a Fly.io San Jose bootstrap node, a Fly.io Frankfurt worker node, and a local NAT laptop node. The evidence includes topology, peer IDs, Yggdrasil IPv6 addresses, tcpdump, nonce roundtrip, bootstrap-kill continuity, and the full task-to-result message cycle.

**ENS identity and capability layer:** `ledger.eth` on Sepolia uses a CCIP-Read resolver deployed at `0xd94cC429058E5495a57953c7896661542648E1B3` and verified through Sourcify. The resolver supports five namespaces. `who.*` resolves current iNFT ownership from live 0G `ownerOf()`. `pay.*` returns rotating HD-derived payment addresses. `tx.*` exposes task/escrow state. `rep.*` points to ERC-8004 reputation on Base Sepolia. `mem.*` points to the current 0G Storage memory root. This means the agent has a stable human-readable name while its ownership and payment destination can change dynamically.

**Reusable framework layer:** Track A is represented by `@ledger/agent-kit`, an OpenClaw-inspired TypeScript runtime for building workers. It has swappable adapters for ownership, memory, inference, ENS identity, and AXL transport. The example `research-worker-agent` loads the live worker profile, checks that ENS ownership and memory match the WorkerINFT state, reads reputation evidence, prepares a bid, and fails closed unless the required proof inputs are present.

The ERC-8004 identity and reputation registries are external Base Sepolia reference contracts and are cited separately, not claimed as Ledger deployments. The 47-job reputation history is seeded demo data and disclosed.

### GitHub Repository

https://github.com/DarthStormerXII/ledger

### Repository Type

Monorepo

### Repository Tags

Primary, Monorepo, Frontend, Backend, Contracts

## Tech Stack

### Ethereum Developer Tools

Foundry, ethers, viem

### Blockchain Networks

0G Galileo Testnet, Ethereum Sepolia, Base Sepolia

### Programming Languages

Solidity, TypeScript

### Web Frameworks

Next.js, React

### Storage / Data

0G Storage, encrypted memory roots, ERC-8004 reputation records

### Other Tech

0G Compute, ERC-7857, ERC-8004, ENS, ENSIP-10, ENSIP-25, CCIP-Read, EIP-3668, Gensyn AXL, Yggdrasil, GossipSub, HD-derived payment addresses

### AI Tools Used

Claude Code, Codex CLI, Claude, Higgsfield AI

## Contract Addresses

### Ledger Deployments

MockTEEOracle: `0x306919805Eed1aD4772d92e18d00A1c132b07C19` on 0G Galileo, chainId `16602`, ChainScan exactMatch=true

WorkerINFT: `0xd4d74E089DD9A09FF768be95d732081bd542E498` on 0G Galileo, chainId `16602`, ChainScan exactMatch=true

LedgerIdentityRegistry: `0x9581490E530Da772Af332EBCe3f35D27d5e8377F` on 0G Galileo, chainId `16602`, ChainScan exactMatch=true

LedgerEscrow: `0x83dF0Ed0b4f3D1D057cB56494b8c7eE417265489` on 0G Galileo, chainId `16602`, ChainScan exactMatch=true

LedgerOffchainResolver: `0xd94cC429058E5495a57953c7896661542648E1B3` on Ethereum Sepolia, chainId `11155111`, Sourcify verified

### External Reference Contracts

ERC-8004 IdentityRegistry: `0x8004A818BFB912233c491871b3d84c89A494BD9e` on Base Sepolia, chainId `84532`, Basescan verified/similar match, Sourcify partial match

ERC-8004 ReputationRegistry: `0x8004B663056A597Dffe9eCcC1965A193B7388713` on Base Sepolia, chainId `84532`, Basescan verified/similar match, Sourcify partial match

## Prize Selection

Select these sponsors:

0G
Gensyn
ENS

## 0G Prize Block

### Tracks

Best Agent Framework, Tooling & Core Extensions
Best Autonomous Agents, Swarms & iNFT Innovations

### Why Applicable / How Are You Using 0G?

Ledger uses 0G as both the framework layer and the worker-asset layer. Track A is `@ledger/agent-kit` in `agents/ledger-agent-kit`: an OpenClaw-inspired runtime with swappable adapters for 0G Storage memory, 0G Compute reasoning, 0G WorkerINFT ownership, ENS identity, and Gensyn AXL transport. It includes a working `research-worker-agent` example, architecture diagram, typecheck, and tests.

Track B is the live iNFT worker proof. WorkerINFT is deployed on 0G Galileo at `0xd4d74E089DD9A09FF768be95d732081bd542E498`; demo tokenId `1` was minted and transferred; memory is stored at `0g://0xd8fb3ad312ca5e9002f7bdd47d93839b9a6dcd83d396bb74a44a9f65344982c4`; sealed inference uses provider `0xa48f01287233509FD694a22Bf840225062E67836` with attestation digest `0x59c79e5a43357945f442a2417cd7aabf2c74b19708dc97e839ec08e1ae223950`; and verified LedgerEscrow `0x83dF0Ed0b4f3D1D057cB56494b8c7eE417265489` pays the current iNFT owner at settlement.

### Line Of Code

https://github.com/DarthStormerXII/ledger#0g

This opens the 0G sponsor code/proof fanout: Track A `@ledger/agent-kit`, Track B WorkerINFT/LedgerEscrow, 0G Storage, 0G Compute, proof artifacts, deployed addresses, and the live iNFT transfer evidence.

### Rating

7/10

### Feedback

The Storage SDK should make `uploadFile` / `downloadFile` the first quickstart path. `broker.inference.verifyService` needs a copy-paste attestation display recipe. ERC-7857 examples should include one minimal transfer-with-rekey demo. A judge-facing iNFT proof checklist would help: tokenId, storage root, sealed key, oracle proof, and attestation digest.

## Gensyn Prize Block

### Track

Best Application of Agent eXchange Layer

### Why Applicable / How Are You Using Gensyn AXL?

Ledger maps AXL's service registry and tool marketplace framing onto a live agent labor market. A `TASK_POSTED` message is a tool-call descriptor, bids are capability declarations, and `AUCTION_CLOSED` finalizes the match.

This is proven across three separate AXL nodes, not local processes: bootstrap `a560...70eb` on Fly.io San Jose, worker `f274...fa64` on Fly.io Frankfurt, and local NAT laptop `590f...5f4c`. No centralized broker replaces AXL; application code talks to AXL's HTTP bridge through `/send`, `/recv`, and `/topology`. Proof artifacts include topology, tcpdump, nonce roundtrip, bootstrap-kill continuity, TypeScript GossipSub fanout, and the full `TASK_POSTED -> BID -> BID_ACCEPTED -> AUCTION_CLOSED -> RESULT` cycle.

### Line Of Code

https://github.com/DarthStormerXII/ledger#gensyn-axl

This opens the Gensyn AXL sponsor code/proof fanout: send/receive wrappers, GossipSub fanout, three-node topology, message logs, tcpdump evidence, and the full task-to-result auction cycle.

### Rating

8/10

### Feedback

The `/send`, `/recv`, `/topology` mental model is excellent. A small official TypeScript client would save every web team from duplicating fetch wrappers. Delivery semantics need a short doc page covering ordering, acks, retries, offline peers, and dedupe. The gossipsub example is valuable; a minimal job-marketplace example would map directly to agent builders.

## ENS Prize Block

### Tracks

Best ENS Integration for AI Agents
Most Creative Use of ENS

### Why Applicable / How Are You Using ENS?

Ledger uses ENS as the agent identity and capability layer. The resolver gateway handles five namespaces: `who`, `pay`, `tx`, `rep`, and `mem`.

`who.worker-001.ledger.eth` resolves live `ownerOf(1)` from 0G Galileo; after the iNFT transfer it returns the new owner without a new ENS transaction. `pay.*` returns rotating HD-derived addresses. `tx.*` returns release-payment state. `rep.*` points to the ERC-8004 ReputationRegistry `0x8004B663056A597Dffe9eCcC1965A193B7388713` on Base Sepolia. `mem.*` points to the 0G Storage memory root. The resolver contract is deployed on Sepolia at `0xd94cC429058E5495a57953c7896661542648E1B3` and verified through Sourcify.

### Line Of Code

https://github.com/DarthStormerXII/ledger#ens

This opens the ENS sponsor code/proof fanout: capability dispatcher, namespace parser, live 0G `ownerOf()` resolver, rotating payment resolver, proof file, and live smoke artifacts.

### Rating

7/10

### Feedback

The Fluidkey example is memorable and directly inspired the `pay.*` design. Dynamic CCIP-Read names need clearer guidance around TTL and cache behavior. ENSIP-25 plus custom subnames could use a capability-tree cookbook for agents. Text-record proof commitments need conventions: recommended keys, size limits, and verifier display patterns.

## Video

https://ethglobal.com/showcase/ledger-bineb

## Future / Next Steps

Move task brief lookup from the temporary route cache to ENS `brief.task-*` names, replace the disclosed MockTEEOracle shim with a real TEE rekey service, make worker registration fully permissionless through a factory, expand the AXL worker mesh beyond the three proof nodes, and derive all reputation from live settlement feedback instead of seeded demo records.

## Final Notes

Ledger contracts are deployed on 0G Galileo Testnet and verified on ChainScan with exact source matches. The ENS resolver is deployed on Ethereum Sepolia and verified through Sourcify. ERC-8004 identity and reputation registries are external reference contracts on Base Sepolia and are cited separately, not claimed as Ledger deployments.

Contact: Telegram `@gabrielaxyy`, X `@gabrielaxyeth`
