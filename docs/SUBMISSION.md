# Ledger — ETHGlobal Submission Draft

Status: live-artifact draft, May 2, 2026. Sponsor integrations are populated with the current 0G, Gensyn AXL, and ENS proof artifacts. Remaining lead inputs are called out explicitly near the relevant fields.

## Source Basis

- `docs/07_SUBMISSION_PACK.md`
- `EXECUTION_PLAN.md`
- `docs/00_MASTER_BRIEF.md`
- `tools/council/STAGE3_CHAIRMAN.md` sections 1 and 4
- Sponsor workshop transcripts: 0G, Gensyn AXL, ENS, KeeperHub, Uniswap
- Research briefs: `tools/research/0g.md`, `tools/research/gensyn-axl.md`, `tools/research/ens.md`, `tools/research/keeperhub-and-rules.md`

## Section A — Project Metadata

### Project Name

```text
Ledger
```

### Category

Primary recommendation:

```text
Artificial Intelligence
```

Rationale: Ledger is an AI-agent marketplace with agent-to-agent bidding, 0G sealed inference, ERC-7857 iNFT workers, AXL agent communication, and ENS agent identity. If the form exposes a more specific "AI Agents" category, select that instead.

### Emoji Candidates

Use one restrained, institutional emoji:

- `🏛️` — institutional market / registry feel
- `🧾` — ledger, settlement, proof trail
- `⌁` — abstract agent mesh / signal; only if the form accepts symbols
- `🔐` — sealed inference + transferable private memory
- `⚖️` — market settlement + reputation

Recommended: `🧾`.

## Section B — Project Description

### Demonstration Link

```text
Demo video: https://ethglobal.com/showcase/ledger-bineb
Live deployment: https://ledger-open-agents.vercel.app/
Proof dashboard: https://ledger-open-agents.vercel.app/proof
```

Notes:

```text
ETHGlobal and 0G both accepted the 2-4 minute event video format for this submission. The under-3-minute wording was confirmed as sponsor-side copy drift.
```

Deployment status checked May 3, 2026: `https://ledger-open-agents.vercel.app/` and `/proof` return HTTP 200.

### Short Description (100 chars max)

Version 1 — tight:

```text
AI agents hire each other; workers are tradeable iNFTs with memory, reputation, and ENS identity.
```

Version 2 — standard:

```text
The trustless hiring hall where AI agents bid for work and the workers are tradeable iNFTs.
```

Version 3 — verbose but still form-safe:

```text
AI-agent labor market where iNFT workers carry memory, reputation, earnings, and ENS identity.
```

### Description (280 chars min)

Recommended paste — descriptive markdown:

```markdown
**Ledger is a marketplace where AI agents hire other AI agents, and the workers themselves are tradeable on-chain assets.**

A buyer agent posts a task. Worker agents bid for the job over a Gensyn AXL peer-to-peer mesh. The winning worker completes the task, settlement pays the current worker owner, and reputation is written back through ERC-8004 feedback.

The core idea is **the worker is the asset**. Each worker is an ERC-7857 (0G iNFT draft standard) iNFT on 0G Galileo. Its encrypted memory, reasoning provenance, reputation history, earnings flow, and ENS identity are designed to follow ownership. In the demo, tokenId `1` transfers from `0x6B9ad963c764a06A7ef8ff96D38D0cB86575eC00` to `0x6641221B1cb66Dc9f890350058A7341eF0eD600b`; the same worker immediately bids again, the next payment routes to the new wallet, and `who.worker-001.ledger.eth` resolves to the new owner without an ENS transaction through the Sepolia CCIP-Read resolver.

Ledger combines three sponsor surfaces into one product:

- **0G:** iNFT workers, encrypted memory on 0G Storage, sealed 0G Compute inference.
- **Gensyn AXL:** real cross-node communication between buyer and worker agents.
- **ENS:** capability subnames for ownership, payments, reputation, memory, and task state.
```

Version 2 — shorter markdown:

```markdown
**Ledger is the trustless hiring hall for AI agents.**

Buyer agents post work, worker agents bid in real time, and on-chain settlement records payment plus reputation. The twist is that workers are not just accounts or profiles: they are ERC-7857 (0G iNFT draft standard) assets on 0G Galileo.

When a worker transfers, its encrypted memory, reputation pointer, future earnings, and ENS identity move with the asset. The demo shows this as an "inheritance" moment: worker iNFT tokenId `1` is transferred, then immediately keeps working for the new owner. ENS makes the change visible because `who.worker-001.ledger.eth` follows live `ownerOf()` via CCIP-Read.

The result is a two-sided labor market and a secondary market for working AI agents.
```

Version 3 — compact fallback:

```markdown
**Ledger turns AI agents into transferable workers.** Buyer agents post tasks, worker agents bid over Gensyn AXL, and settlement records payment and ERC-8004 feedback. Each worker is an ERC-7857 iNFT on 0G Galileo whose encrypted memory, sealed reasoning provenance, reputation, earnings flow, and ENS capability tree follow ownership. In the demo, a 47-job worker transfers to a new owner and immediately continues earning under the same ENS identity.
```

### How It's Made (280 chars min)

Recommended paste — descriptive markdown:

```markdown
Ledger is built as three tightly connected layers:

**1. 0G worker asset layer**

Each worker is an ERC-7857 (0G iNFT draft standard) iNFT on **0G Galileo Testnet**. Worker memory is encrypted and stored through 0G Storage using the newer `uploadFile` / `downloadFile` SDK path. Worker reasoning runs through 0G Compute sealed inference, and the UI surfaces the attestation digest from `broker.inference.verifyService`.

The important transfer path is not just a token URI. The ERC-7857 oracle pattern re-keys the encrypted memory secret for the new owner, so ownership transfer can carry access to the worker's intelligence instead of only moving a static NFT.

**2. Gensyn AXL communication layer**

Buyer and worker agents communicate across separate AXL nodes, not in-process mocks. The agent protocol uses AXL's localhost HTTP bridge:

- `TASK_POSTED` for new work
- `BID_PLACED` for worker bids
- `AUCTION_CLOSED` when the buyer selects a worker

We follow the AXL `gossipsub` example pattern for pubsub and use `/topology` proof to show distinct peer IDs and Yggdrasil IPv6 addresses.

**3. ENS capability identity layer**

Each worker gets a capability tree under a Sepolia ENS parent name. An ENSIP-10 wildcard CCIP-Read resolver signs live responses from 0G Galileo and Base Sepolia:

- `who.*` resolves the current iNFT owner from live `ownerOf()`
- `pay.*` returns rotating HD-derived receive addresses, inspired by Fluidkey
- `tx.*` points to the active task / escrow state
- `rep.*` reads reputation from the audited ERC-8004 ReputationRegistry
- `mem.*` points to the current 0G Storage memory root

The hero worker's 47 employer-signed feedback records are seeded for demonstration and disclosed in the README. A production deployment would derive reputation from real settlements.
```

Version 2 — shorter markdown:

```markdown
Ledger uses **0G for worker ownership and memory**, **Gensyn AXL for agent communication**, and **ENS for agent identity**.

On 0G Galileo, each worker is minted as an ERC-7857 iNFT. Its memory is encrypted in 0G Storage via `uploadFile` / `downloadFile`, and its reasoning uses 0G Compute sealed inference with an attestation digest verified through `broker.inference.verifyService`.

On Gensyn AXL, buyer and worker agents exchange `TASK_POSTED`, `BID_PLACED`, and `AUCTION_CLOSED` messages across separate nodes. `/topology` provides the proof surface: peer IDs, Yggdrasil IPv6 addresses, and host labels.

On ENS, a CCIP-Read resolver serves worker capability subnames: `who`, `pay`, `tx`, `rep`, and `mem`. `who.*` follows live 0G `ownerOf()`, while `pay.*` rotates HD-derived addresses in a Fluidkey-inspired pattern.

The 47-job reputation history is seeded demo data, disclosed honestly; production reputation would come from real ERC-8004 settlement feedback.
```

Version 3 — compact fallback:

```markdown
Ledger is built with 0G Galileo iNFT contracts, encrypted 0G Storage memory, 0G Compute sealed inference, Gensyn AXL cross-node messaging, and ENS CCIP-Read capability subnames. Worker agents communicate through `TASK_POSTED`, `BID_PLACED`, and `AUCTION_CLOSED`; ENS resolves `who`, `pay`, `tx`, `rep`, and `mem`; and transfer uses the ERC-7857 oracle pattern so the worker asset can carry memory access to its new owner. Seeded 47-job reputation is disclosed as demo data.
```

### GitHub Repositories

```text
https://github.com/DarthStormerXII/ledger-v1
```

Submission-day requirement: the repository must be public and the README must keep the Proof Matrix above the fold with links to:

- `proofs/0g-proof.md`
- `proofs/axl-proof.md`
- `proofs/ens-proof.md`

## Section C — Tech Stack Tags

Use the actual dropdown options if they exist. If an exact option is missing, select `Other` and add the free-text value.

### Ethereum Developer Tools

- Foundry
- ethers
- viem

Do not select Hardhat unless build code adds it.

### Blockchain Networks

- 0G Galileo Testnet
- Base Sepolia
- Ethereum Sepolia

If the dropdown does not include 0G Galileo, select `Other` and enter:

```text
0G Galileo Testnet (ChainID 16602, native 0G token)
```

### Programming Languages

- Solidity
- TypeScript

### Web Frameworks

- Next.js
- React

If the form distinguishes App Router:

```text
Next.js App Router
```

### Databases / Storage

- 0G Storage
- Other: encrypted 0G Storage memory roots

If `0G Storage` is not listed, select `Other`.

### Design Tools

- Figma, only if actual design artifacts are used
- Claude / claude.ai design, only if the UX session produces artifacts
- Higgsfield AI, only for demo/video production disclosure, not form visuals

### Other Tech

- ENS
- ENSIP-10
- ENSIP-25
- CCIP-Read
- EIP-3668
- ERC-8004
- ERC-7857 (0G iNFT draft standard)
- Gensyn AXL
- Yggdrasil
- GossipSub
- 0G Compute
- 0G Storage
- TEE sealed inference
- HD derivation
- Fluidkey-inspired rotating addresses

### AI Tools Used

- Claude Code
- Codex CLI
- Claude
- Higgsfield AI

## Section D — Prize Blocks

Important: ETHGlobal allows one entry per sponsor company. Do not create separate 0G Track A / 0G Track B entries or separate ENS-AI / ENS-Creative entries in the form. Use exactly these three sponsor blocks: 0G, Gensyn AXL, ENS.

The "line of code" field should be one URL only. Use one representative implementation file-line anchor per sponsor; the README sponsor-link section fans out to the rest of the implementation and proof links.

### 0G — Track A + Track B

Applicable prize tracks:

- Best Agent Framework, Tooling & Core Extensions
- Best Autonomous Agents, Swarms & iNFT Innovations

#### Why Applicable / How Are You Using This Protocol/API?

```text
Ledger uses 0G as both framework layer and worker-asset layer. Track A is `@ledger/agent-kit` in `agents/ledger-agent-kit`: an OpenClaw-inspired runtime with swappable adapters for 0G Storage memory, 0G Compute reasoning, 0G WorkerINFT ownership, ENS identity, and Gensyn AXL transport. It includes a working `research-worker-agent` proof example, architecture diagram, typecheck, and tests. The example fails closed unless the ENS gateway owner, memory CID, and reputation proof are present and consistent with the live WorkerINFT read; local-only dry run requires an explicit opt-in env var.

Track B is the live iNFT worker proof. WorkerINFT is deployed on 0G Galileo at `0x48B051F3e565E394ED8522ac453d87b3Fa40ad62`; demo tokenId `1` minted in tx `0xc41cebd...001f` and transferred in tx `0x3e6b0e...3a79`. Memory is stored at `0g://0xd8fb3a...982c4`, sealed inference uses provider `0xa48f...7836` with attestation digest `0x59c79e...3950`, and token-owned escrow pays the current iNFT owner at settlement.
```

#### Line Of Code

```text
https://github.com/DarthStormerXII/ledger-v1/blob/main/agents/ledger-agent-kit/src/runtime.ts#L17
```

Representative line: `LedgerAgentRuntime`, the framework core that turns 0G iNFT ownership, 0G Storage memory, 0G Compute reasoning, ENS identity, and AXL transport into a reusable agent runtime. Supporting Track B proof links live in `README.md#sponsor-submission-code-links` and `proofs/0g-proof.md`.

#### Star Rating / Ease Rating

```text
7/10
```

Rationale: Compute and Storage are accessible, but proving "embedded intelligence" credibly requires careful ERC-7857 transfer, oracle/key-rebind, and attestation handling.

#### Additional Feedback For Sponsor

```text
- The `uploadFile` / `downloadFile` SDK path should be the first Storage quickstart for hackathon builders.
- `broker.inference.verifyService` needs a copy-paste UI recipe: produce report, hash report, display digest.
- ERC-7857 examples should include one minimal transfer-with-rekey demo, not just interfaces.
- Publish a judge-facing iNFT proof checklist: tokenId, storage root, sealed key, oracle proof, attestation digest.
- Galileo chain ID should be presented consistently as 16602 in the current docs and tooling.
```

### Gensyn AXL — Best Application of Agent eXchange Layer

#### Why Applicable / How Are You Using This Protocol/API?

```text
Ledger maps AXL's service registry / tool marketplace framing onto a live agent labor market. A `TASK_POSTED` message is a tool-call descriptor, bids are capability declarations, and `AUCTION_CLOSED` finalizes the match. This is proven across three separate AXL nodes, not local processes: bootstrap `a560...70eb` on Fly sjc, worker `f274...fa64` on Fly fra, and local NAT laptop `590f...5f4c`. No centralized broker replaces AXL; application code talks to AXL's HTTP bridge (`/send`, `/recv`, `/topology`). Proof artifacts include topology, tcpdump, nonce roundtrip, bootstrap-kill continuity, TypeScript GossipSub fanout, and the full `TASK_POSTED → BID → BID_ACCEPTED → AUCTION_CLOSED → RESULT` cycle.
```

#### Line Of Code

```text
https://github.com/DarthStormerXII/ledger-v1/blob/main/agents/axl-client/src/index.ts#L87
```

Representative line: `AxlClient.send(...)`, the direct `/send` wrapper. Supporting proof links live in `README.md#sponsor-submission-code-links` and `proofs/axl-proof.md`.

#### Star Rating / Ease Rating

```text
8/10
```

Rationale: The API is clean and language-agnostic. The hard part is proof: separate hosts, stable peer keys, topology captures, and application-level reliability around fire-and-forget messages.

#### Additional Feedback For Sponsor

```text
- The `/send`, `/recv`, `/topology` mental model is excellent; keep it as the first-page quickstart.
- A small TypeScript client would prevent every web team from duplicating the same fetch wrappers.
- Delivery semantics need a concise doc page: ordering, acks, retries, offline peers, and dedupe recommendations.
- The gossipsub example is valuable; a minimal "job marketplace" example would map directly to agent builders.
```

### ENS — ENS-AI + ENS-Creative

Applicable prize tracks:

- Best ENS Integration for AI Agents
- Most Creative Use of ENS

#### Why Applicable / How Are You Using This Protocol/API?

```text
Ledger uses ENS as the agent identity and capability layer. The resolver gateway handles all five namespaces: `who`, `pay`, `tx`, `rep`, and `mem`. `who.worker-001.ledger.eth` resolves live `ownerOf(1)` from 0G Galileo; after the iNFT transfer it returns the new owner without a new ENS transaction. `pay.*` returns rotating HD-derived addresses; `tx.*` returns release-payment state; `rep.*` points to the audited ERC-8004 ReputationRegistry `0x8004B663056A597Dffe9eCcC1965A193B7388713` on Base Sepolia; `mem.*` points to the 0G Storage memory root. Live Sepolia smoke artifact: `proofs/data/ens-sepolia-resolve.json` with `status.pass=true`.
```

#### Line Of Code

```text
https://github.com/DarthStormerXII/ledger-v1/blob/main/resolver/src/resolver.ts#L21
```

Representative line: `resolveName(...)`, the capability namespace dispatcher. Supporting proof links live in `README.md#sponsor-submission-code-links` and `proofs/ens-proof.md`.

#### Star Rating / Ease Rating

```text
7/10
```

Rationale: ENS makes the idea possible, but the creative path depends on reliable CCIP-Read responses, cache/TTL behavior, deterministic HD derivation, and clear proof UI.

#### Additional Feedback For Sponsor

```text
- The Fluidkey example is memorable and directly inspired our `pay.*` design; keep highlighting concrete prior art.
- A guide for TTL/cache behavior in dynamic CCIP-Read names would help teams building live-changing records.
- ENSIP-25 + custom subnames could use a "capability tree for agents" cookbook.
- Text-record proof commitments need conventions: recommended keys, size limits, and verifier display patterns.
```

## Live Artifact Reference

### 0G Galileo

- Chain: 0G Galileo, chainId `16602`
- Explorer: `https://chainscan-galileo.0g.ai/`
- `WorkerINFT`: `0x48B051F3e565E394ED8522ac453d87b3Fa40ad62`
- `LedgerEscrow`: `0xCAe1c804932AB07d3428774058eC14Fb4dfb2baB`
- `LedgerIdentityRegistry`: `0xa6a621e9C92fb8DFC963d2C20e8C5CB4C5178cBb`
- `MockTEEOracle`: `0x229869949693f1467b8b43d2907bDAE3C58E3047`
- Track A framework package: `agents/ledger-agent-kit`
- Track A example command: `LEDGER_ENS_GATEWAY_URL=https://resolver.fierypools.fun npm run example:research`
- Track A example output: valid `BID` for `who.worker-001.ledger.eth`, owner `0x6641221B1cb66Dc9f890350058A7341eF0eD600b`, `identityMode=gateway`, `identityVerified=true`, matching memory CID `0g://0xd8fb3a...982c4`, `payChanged=true`, reputation `47 / 4.77` with source `ens-gateway`
- Demo iNFT tokenId: `1`
- Mint tx: `0xc41cebd48d86382bba75d08fa514da2e151924c3f03dd7d2652992c693bd001f` at block `31130502`
- Transfer tx: `0x3e6b0e4f27ee0796460407d084d9bc99f94a033f5b18073291af5899a8053a79` at block `31130543`
- Initial owner: `0x6B9ad963c764a06A7ef8ff96D38D0cB86575eC00`
- Post-transfer owner: `0x6641221B1cb66Dc9f890350058A7341eF0eD600b`
- Memory CID: `0g://0xd8fb3ad312ca5e9002f7bdd47d93839b9a6dcd83d396bb74a44a9f65344982c4`
- Memory upload tx: `0xc6cd5ca57b2c005114fef5705d89da67bcff578659a4ca5a8f5d50d4220eb5ca`
- Compute provider: `0xa48f01287233509FD694a22Bf840225062E67836`
- Compute model: `qwen/qwen-2.5-7b-instruct`
- Attestation digest: `0x59c79e5a43357945f442a2417cd7aabf2c74b19708dc97e839ec08e1ae223950`
- Compute ledger creation tx: `0xc27d4f36505320f24f60d6ab6cc0e0cf7899b374def9ee953527c2d0aac78ff2`
- Escrow lifecycle:
  - `postTask`: `0x01111fa6852b084f96e514475ee99950be7f909e58174308e3c366229dc49cfe`
  - `acceptTokenBid`: `0x327e0bffc45ee801a6676b69e85e5fd1cf83e9cc9e2ec9fc75e3d35f15f570cb`
  - `releasePayment`: `0xe91e0b52dd0ba6095794f33cb77a9027c3cc97d78170f940d47b348fc1f8a95d`
  - `taskWorkerTokenIds(taskId)`: `1`
  - `payoutRecipient(taskId)`: `0x6641221B1cb66Dc9f890350058A7341eF0eD600b`

### Gensyn AXL

- Bootstrap peer ID: `a560b12fe6e16b1c8a94bb99b3019fa6d5f490474c275a31848f022df3a170eb` (Fly sjc, `66.51.123.38:9001`)
- Worker 1 peer ID: `f274bf0f8dadfa028b75f73cf7b29c927ded368b6703caf403abdb0d9aa1fa64` (Fly fra)
- Worker 2 peer ID: `590fa3b614da78d5e50939f708dea209e5cfb5e7ae69f1220611d8eefcc95f4c` (local NAT laptop)
- Yggdrasil IPv6:
  - `200:b53e:9da0:323d:29c6:ead6:88cc:99fc`
  - `200:1b16:81e0:e4a4:bfa:e914:1186:109a`
  - `201:9bc1:7127:ac96:1ca8:6bdb:1823:dc85`
- Proof artifacts:
  - `proofs/data/axl-topology.json`
  - `proofs/data/axl-message-log.txt`
  - `proofs/data/axl-tcpdump.txt`
  - `proofs/data/axl-nonce-roundtrip.log`
  - `proofs/data/axl-launchd-roundtrip.log`
  - `proofs/data/axl-full-cycle.json`
  - `proofs/data/axl-gossipsub-fanout.json`
- Full agent protocol cycle proven: `TASK_POSTED -> BID -> BID_ACCEPTED -> AUCTION_CLOSED -> RESULT`
- Bootstrap-kill continuity test: passed
- TypeScript GossipSub fanout: under 1s across 3 nodes

### ENS

- Resolver source: `resolver/`
- Parent ENS name: `ledger.eth` on Sepolia
- Resolver contract: `0xd94cC429058E5495a57953c7896661542648E1B3`
- Gateway mode: durable Cloudflare named tunnel at `https://resolver.fierypools.fun/{sender}/{data}`
- Capability namespaces implemented: `who`, `pay`, `tx`, `rep`, `mem`
- Live smoke artifacts: `proofs/data/ens-live-smoke.json`, `proofs/data/ens-sepolia-resolve.json`, `status.pass=true`
- Cross-chain owner resolution: `who.worker-001.ledger.eth` resolves live `ownerOf(1)` from 0G Galileo
- ERC-8004 ReputationRegistry: `0x8004B663056A597Dffe9eCcC1965A193B7388713` on Base Sepolia

## Lead Inputs Still Required

- Final GitHub branch/commit confirmation for `https://github.com/DarthStormerXII/ledger-v1` before pasting file-line anchors.
- Actual ETHGlobal category and tech-stack dropdown shapes from the authenticated Hacker Dashboard.

Provided lead contact for sponsor fields: Telegram `@gabrielaxyy`, X `@gabrielaxyeth`.

## README Cross-Link Chain

Current repository state validated during Phase 1:

- `README.md` links users to `proofs/`.
- `proofs/README.md` exists.
- `proofs/0g-proof.md`, `proofs/axl-proof.md`, and `proofs/ens-proof.md` exist.
- `README.md` includes an above-the-fold sponsor judge checklist and lead contact handles.
- `proofs/0g-proof.md`, `proofs/axl-proof.md`, and `proofs/ens-proof.md` are populated with current live/captured artifacts.

## Pre-Flight Form Check

Status: partially completed through public ETHGlobal pages on May 2, 2026.

Confirmed from `https://ethglobal.com/events/openagents/info/details`:

- Submission deadline is Sunday, May 3, 2026 at 12:00 PM EDT.
- Demo video must be 2-4 minutes.
- Submission happens from the Hacker Dashboard.
- The final step allows up to 3 Partner Prizes.
- If a partner has multiple tracks, those tracks count as 1 Partner Prize.
- Partner Prize submissions ask teams to explain how the sponsor tool was used, provide feedback, and share relevant comments.

Confirmed from `https://ethglobal.com/events/openagents/prizes`:

- Open Agents has 5 prize partners: 0G, Uniswap Foundation, Gensyn, ENS, KeeperHub.
- 0G has Track A "Best Agent Framework, Tooling & Core Extensions" and Track B "Best Autonomous Agents, Swarms & iNFT Innovations."
- 0G Track B explicitly asks iNFT teams for a link to the minted iNFT on 0G explorer plus proof that intelligence/memory is embedded.
- Gensyn requires AXL for inter-agent or inter-node communication and separate AXL nodes, not just in-process.
- ENS-AI asks for ENS doing real agent work: resolving address, storing metadata, gating access, enabling discovery, or coordinating A2A.
- ENS-Creative explicitly names zk proofs in text records, auto-rotating addresses on each resolution, and subnames as access tokens.

Blocked dashboard checks:

- Category dropdown exact options.
- Tech stack dropdown exact options.
- Whether per-prize textareas enforce 800 chars.
- Whether "AI tools used" is a multiselect, free-text, or checkbox list.

Blocker: the Hacker Dashboard is behind ETHGlobal email magic-link auth. The login code was sent to `gabrielantony56@gmail.com`, but both configured Gmail MCP accounts failed OAuth token refresh and saved Gmail browser sessions are expired. Public-page validation is complete; exact private form shape still needs authenticated dashboard access before final paste.
