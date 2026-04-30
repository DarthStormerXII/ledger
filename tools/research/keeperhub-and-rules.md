# KeeperHub + ETHGlobal + ERC-8004 — Research Brief

Research date: 2026-05-02. Build window for ETHGlobal Open Agents: April 24 – May 3 2026 (submissions close 12:00 EDT May 3). Authoritative sources cited inline; `[UNVERIFIED]` flags facts that could not be confirmed against a primary source within the time available.

---

## TL;DR

1. **KeeperHub MCP endpoint is real and public**: `https://app.keeperhub.com/mcp` over HTTP, dual-auth (OAuth 2.1 or Bearer `kh_…` API key). Plug-in command for Claude Code is `claude mcp add --transport http keeperhub https://app.keeperhub.com/mcp`.
2. **Tool catalog is workflow-shaped, not transaction-shaped.** The MCP exposes ~20 tools centered on `create_workflow`, `execute_workflow`, `get_execution_status`, `get_execution_logs`, `ai_generate_workflow`, plus direct on-chain actions (`execute_transfer`, `execute_contract_call`, `execute_check_and_execute`). There is **no first-class `submit_tx` / `cancel_tx`**; the unit of work is a Workflow, and each Workflow run produces an Execution with a polled status.
3. **Testnet support is the biggest open question.** The docs only confirm Ethereum Sepolia (`11155111`) on the testnet side. **Base Sepolia is not listed in any KeeperHub doc page reachable today**, and **0G Sepolia / Newton / Galileo is definitely not supported** (KeeperHub advertises EVM only; 0G Newton chain ID `16600` does not appear in any KeeperHub registry). [UNVERIFIED] whether Base Sepolia is silently supported via a generic RPC config — this needs sponsor confirmation in Discord.
4. **"Reroute via private mempool" is marketing language for an EVM-mainnet feature.** KeeperHub's own copy describes guarantees as "exponential backoff, nonce management, multi-RPC failover, gas priced off network averages, ~30% savings vs baseline" — operational reliability, not Flashbots Protect. There is no documented private-relay integration for testnets, because **private mempools effectively don't exist on testnets** — Flashbots and bloXroute don't operate Sepolia relays in a meaningful way.
5. **Audit trail is good.** KeeperHub records "trigger event, submitted tx, gas used, outcome, timestamp" per execution and exposes them via `get_execution_status` + `get_execution_logs`, plus a dashboard at `app.keeperhub.com`. That's enough material for a README evidence section *if* we can drive workflows on the chains we need.
6. **KeeperHub bounty: $4,500 main + $500 feedback.** Main is split 1st $2,500 / 2nd $1,500 / 3rd $500 across two focus areas (Best Innovative Use, Best Integration). Feedback bounty is **2 × $250** for "specific, actionable" feedback — generic praise disqualifies. Format is not pinned to a single artifact; treat it as a structured `FEEDBACK.md` in the repo *plus* a Discord post, to be safe.
7. **ETHGlobal partner-prize cap is "up to 3" but multi-track sponsors count as one.** Selecting "0G" once covers BOTH Track A and Track B — so our targeted slate (0G + Gensyn AXL + KeeperHub) fits cleanly inside the cap with one slot to spare.
8. **Submission video: 2–4 minutes**, 720p minimum, must include spoken narration (no TTS, no music-only). Outside the 2–4 min range = automatic rejection.
9. **Judging rubric (overall hackathon)**: technicality, originality, practicality, usability, "wow factor". Partner prizes are judged independently by each sponsor against their own criteria; KeeperHub specifically grades on functional delivery, real-world utility, depth of KeeperHub integration, code quality.
10. **ERC-8004 is Draft, created 2025-08-13.** Three registries — Identity (ERC-721), Reputation, Validation — by De Rossi (MetaMask), Crapis, Ellis, Reppel. Audited by Cyfrin, Nethermind, EF Security Team. Vanity-deployed at `0x8004A818…` (Identity) and `0x8004B663…` (Reputation) on **Base Sepolia and Ethereum Sepolia confirmed**. **No 0G deployment exists in the official repo.**
11. **The architect's concern is correct: a star-rating ReputationRegistry is wrong.** ERC-8004 reputation is a *signed feedback record* — `(int128 value, uint8 valueDecimals, tag1, tag2, feedbackURI, feedbackHash)` with a server-issued pre-authorization. It's an attestation pointer with off-chain JSON evidence behind a `feedbackHash`, not a star average. Calling our minimal contract "ERC-8004 conformant" without the auth flow + feedbackURI/Hash is a defensible *minimal subset* claim at best, and a misrepresentation at worst.
12. **Demo viability verdict:** the gas-spike scenario is *theatrical on Base Sepolia* unless KeeperHub confirms private routing on that chain — which it almost certainly doesn't have. Reframe the demo as **retry/backoff/multi-RPC failover under simulated congestion**, which IS what KeeperHub actually does on testnet. Don't claim Flashbots-style MEV protection on Sepolia in the README.

---

## Part 1 — KeeperHub

### MCP server (URL, auth, tool catalog)

**Endpoint:** `https://app.keeperhub.com/mcp` (HTTP transport, not SSE in current main).

**Auth:**
- **OAuth 2.1** via the standard MCP browser flow. Discovery at `/.well-known/oauth-authorization-server`. Tokens auto-managed (1-hour access, 30-day refresh).
- **API key** for headless / CI. Org-scoped keys with a `kh_` prefix, sent as `Authorization: Bearer kh_…`. Generated in the dashboard under Settings → API Keys → Organisation.

**Install line for Claude Code** (per the GitHub README before it was archived):
```
claude mcp add --transport http keeperhub https://app.keeperhub.com/mcp
```

**Tool catalog** (from `docs.keeperhub.com/ai-tools/mcp-server`):

| Category | Tool | Notable params |
|---|---|---|
| Workflow CRUD | `list_workflows` | `limit`, `offset` |
| | `get_workflow` | `id` |
| | `create_workflow` | `nodes`, `edges` |
| | `update_workflow` | `id`, `name`, `description`, `nodes`, `edges`, `enabled` |
| | `delete_workflow` | `id`, `force` |
| Execution | `execute_workflow` | `id` |
| | `get_execution_status` | `executionId` |
| | `get_execution_logs` | `executionId` |
| AI | `ai_generate_workflow` | `prompt`, optional existing workflow |
| Action schemas | `list_action_schemas` | category filter (`web3`, `discord`, `sendgrid`, `webhook`, `system`) |
| Plugins | `search_plugins`, `get_plugin`, `validate_plugin_config` | — |
| Templates | `search_templates`, `get_template`, `deploy_template` | — |
| Integrations | `list_integrations`, `get_wallet_integration` | — |
| Docs | `tools_documentation` | dumps the full tool list as JSON |

**Direct on-chain action types** (via `web3` action schemas, used inside workflow nodes):
- Read (no wallet): `web3/check-balance`, `web3/check-token-balance`, `web3/read-contract`
- Write (wallet-backed): `web3/transfer-funds`, `web3/transfer-token`, `web3/write-contract`

**The mental model**: KeeperHub is *not* a transaction relay you submit a raw tx to. It's a **workflow engine** where each "node" can be a web3 action, a webhook, a Discord message, etc. The agent writes a workflow via `create_workflow` (or `ai_generate_workflow`), kicks it off with `execute_workflow`, then polls `get_execution_status` until terminal. Every run lives behind an `executionId` and produces structured logs accessible via `get_execution_logs`.

This is the most important architectural fact and the team needs to absorb it: **Ledger does not "send a tx through KeeperHub"; Ledger creates a Workflow whose nodes are tx-shaped, and KeeperHub executes the Workflow with retries / failover / gas optimization**.

### Supported chains (testnet specifically — 0G Sepolia? Base Sepolia?)

Authoritative-as-of-today picture pieced from `docs.keeperhub.com/`, `keeperhub.com/`, and the archived `KeeperHub/mcp` README:

**Mainnet (confirmed):** Ethereum (`1`), Base (`8453`), Arbitrum (`42161`), Polygon (`137`), and "additional EVM-compatible networks" — total advertised as "12 EVM chains" on the marketing site.

**Testnet (confirmed):** Ethereum **Sepolia** (`11155111`) only.

**Base Sepolia (`84532`):** Not listed on any of the four KeeperHub doc/landing pages I read. The marketing site's "Ethereum Mainnet, Sepolia, Base, Arbitrum, and more" formulation pointedly *separates* "Base" (mainnet) from "Sepolia" (Ethereum testnet). [UNVERIFIED] whether the chains-API endpoint silently lists Base Sepolia, or whether a workflow can be configured against an arbitrary RPC + chainId — this needs a direct answer from KeeperHub support before we lock the architecture.

**0G Sepolia / Newton (`16600`) / Galileo:** Not supported. KeeperHub advertises EVM-only and the 0G testnet chain IDs do not appear anywhere in their docs. **This is a blocker for the original plan of running KeeperHub against 0G escrow contracts.**

**Implication for Ledger:** if we want every on-chain tx to flow through KeeperHub, we have two options:
- **Option A (recommended):** put escrow + reputation on Base Sepolia (where KeeperHub *might* work and ERC-8004 contracts already exist at canonical addresses), and accept that the 0G angle becomes a "0G storage / inference" angle, not a 0G-execution angle.
- **Option B:** keep 0G for escrow + reputation, and have only the USDC payment flow on Base Sepolia go through KeeperHub. The README has to say so honestly.

Either way the demo's "every on-chain tx goes through KeeperHub" claim needs softening to "every Base Sepolia tx goes through KeeperHub."

### Gas-spike / reroute behavior — technical reality vs marketing

KeeperHub's marketing copy says "guaranteed onchain execution with retry logic, gas optimization, private routing, and full audit trails." The *actually documented* mechanisms are:

- **Exponential backoff** between retries
- **Nonce management** so re-broadcasts don't collide
- **Multi-RPC failover** (probably the single most useful feature on testnet — Sepolia RPCs flake constantly)
- **Gas priced off network averages** — claim is ~30% savings vs naive baseline
- **Replayability** — every run can be re-fetched as a structured event log

What is **not documented** anywhere I could reach:
- Flashbots Protect / private builder relays
- bloXroute, Eden, or other custom MEV relays
- Any "private mempool" integration on a specific chain
- MEV-bundle submission

**Verdict on "private mempool" claim**: it is real *somewhere* on KeeperHub's roadmap or maybe a mainnet-only feature, but for our demo's purposes on Base Sepolia, **it is not a thing**. Public-mempool retries with smarter gas pricing and multi-RPC failover is what we'll actually demo.

**On the gas-spike demo specifically**: a "private mempool reroute" demo on Sepolia is theatrical because:
1. Sepolia has no meaningful MEV; there are no searchers competing for blockspace.
2. Flashbots does not run a Sepolia relay (Flashbots Protect is mainnet-only, with limited Holesky support).
3. Even if KeeperHub wanted to "reroute privately" on Base Sepolia, there's no L2 sequencer-private-relay product to route to.

**Reframe the demo** as: *Adverse network conditions trigger KeeperHub's retry / multi-RPC failover / re-priced-gas behavior. Without KeeperHub, the tx hangs on a flaky RPC; with KeeperHub, the same tx lands within N seconds and an audit-trail log proves the fallback path.* That is HONEST and STILL impressive.

### Audit trail + request IDs (how to get evidence for README)

Per the marketing site: *"Trigger event, submitted tx, gas used, outcome, timestamp. Every run is replayable from one place."*

Practically:
- Every `execute_workflow` call returns an `executionId`.
- `get_execution_status` returns the current state plus the on-chain tx hash(es) it has emitted.
- `get_execution_logs` returns a structured list of node executions with timing, gas, retries.
- The dashboard at `app.keeperhub.com` provides the same data visually.

For the README evidence section, the canonical artifact is:
```
KeeperHub execution: <executionId>
Workflow: <workflowId>
Outcome: success
On-chain tx: <txHash>  (Base Sepolia | basescan link)
Retries: 2  (RPC #1 timeout → failover → RPC #2 success)
Gas: <gas> @ <gwei>
Trigger: <demo-trigger>
Replay link: https://app.keeperhub.com/executions/<executionId>
```

**[UNVERIFIED]** that the dashboard URL pattern is exactly `/executions/<id>` — the docs index references an executions page but I didn't reach the deep link. Confirm in the dashboard once an API key is provisioned.

### Bounty rules ($4,500 main + $500 feedback) — exact requirements

From `https://ethglobal.com/events/openagents/prizes/keeperhub`:

**Main prize — Best Use of KeeperHub: $4,500**
- 1st: $2,500
- 2nd: $1,500
- 3rd: $500

Two focus areas (judged together, ranked by quality):
1. **Best Innovative Use** — agents, workflows, dApps, dev tools, novel solutions using KeeperHub's execution layer.
2. **Best Integration** — payment-rail bridges (x402, MPP) or framework plugins (ElizaOS, OpenClaw, LangChain, CrewAI).

**Submission requirements** (per the KeeperHub bounty page):
- Working demo (live or recorded)
- Public GitHub repo with README detailing setup + architecture
- Brief explanation of approach + KeeperHub usage
- Project name, team members, contact info

**Judging:**
- Functional delivery
- Real-world utility (not just novelty)
- Depth of KeeperHub integration
- Code quality + documentation

**Feedback bounty: $500 (2 × $250)**
- Open to *any* team that uses KeeperHub, regardless of main-prize placement.
- Must be *specific and actionable* — UX/UI friction, reproducible bugs, doc gaps, feature requests.
- Generic praise disqualifies.

### What the feedback bounty rewards (specifically)

The bounty page does NOT pin the format. Treating it as defensible-belt-and-suspenders:

- **Primary artifact:** a `FEEDBACK.md` at the root of the repo, structured as: (1) bugs encountered with reproducer steps, (2) docs gaps with the page URL where we got stuck, (3) UX friction in the dashboard / MCP, (4) concrete feature requests with the use-case that motivated them, (5) what worked well (short — this section is praise-eligible but not the meat).
- **Secondary artifact:** post the same content (lightly edited) into KeeperHub's hackathon Discord channel — the bounty page hints feedback is "while integrating," which implies they want the conversation, not just a file dump.
- **Specificity standard:** every bullet should reference a specific tool/page/error message + a screenshot or reproducer command. Bad: "docs are confusing." Good: "`docs.keeperhub.com/ai-tools/mcp-server` — the OAuth flow doesn't say which port to bind, and `kh_…` keys aren't documented as Bearer-prefixed; we lost 40 minutes."

### Past submissions / examples

This is KeeperHub's **first hackathon** ("Our first hackathon" — title of `keeperhub.com/blog/008-first-hackathon-openagents`), so there are no public reference apps to copy. The community implementations live in `KeeperHub/agentic-wallet`, `KeeperHub/cli`, and `KeeperHub/claude-plugins` — those are the closest thing to example integrations.

### Support

- **Discord:** linked from the landing page; [UNVERIFIED] direct invite URL — pull from `keeperhub.com` footer when first opening the dashboard.
- **Office hours:** the partnership blog promises workshops + office hours during the build window. [UNVERIFIED] specific times — check ETHGlobal Discord and the KeeperHub X account `@KeeperHubApp` for live schedule.
- **GitHub issues** on `KeeperHub/keeperhub` are public and active.

### Verdict: viable for our gas-spike demo? Where are the gotchas?

**Viable with reframing.** Three gotchas to lock down before architecture freezes:

1. **Confirm Base Sepolia chain support** — ask in Discord, before spending engineering hours wiring workflows. If Base Sepolia isn't supported, the entire "every Ledger tx goes through KeeperHub" narrative shifts: we'd have to move USDC settlement to Sepolia, which is uglier.
2. **Drop "private mempool reroute" from the demo script.** Replace with "RPC failover + retry + smarter gas" under simulated congestion (we can simulate by pointing a fake RPC at a slow / 500-throwing endpoint and watching KeeperHub fail over).
3. **0G is no longer "where on-chain execution happens via KeeperHub."** 0G becomes a storage + inference layer; KeeperHub drives only the Base Sepolia flow. The README needs to say this clearly.

---

## Part 2 — ETHGlobal Open Agents 2026

### Official site URL + dates

- Event hub: `https://ethglobal.com/events/openagents`
- Prizes: `https://ethglobal.com/events/openagents/prizes`
- Info / details: `https://ethglobal.com/events/openagents/info/details`
- **Build window:** April 24 – May 3, 2026
- **Submission deadline:** Sunday May 3, 2026 at 12:00 pm EDT
- **Finalist judging:** May 6, 2026 (per team brief; the info page only confirms the close date and "judging shortly after")
- Format: async, build-from-anywhere
- Total pool: $50,000+

### Bounty page (canonical)

`https://ethglobal.com/events/openagents/prizes` is the canonical page. Per-sponsor pages live at `/prizes/<sponsor>` (e.g. `/prizes/keeperhub`).

Confirmed sponsors and pools:

| Sponsor | Pool | Tracks |
|---|---|---|
| 0G | $15,000 | Track A "Best Agent Framework, Tooling & Core Extensions" $7,500 (5 places); Track B "Best Autonomous Agents, Swarms & iNFT Innovations" $7,500 (up to 5 × $1,500) |
| Uniswap Foundation | $5,000 | Best Uniswap API integration (3 places) |
| Gensyn | $5,000 | Best Application of Agent eXchange Layer (AXL) (3 places) |
| ENS | $5,000 | Best ENS Integration for AI Agents + Most Creative Use of ENS |
| KeeperHub | $5,000 | Best Use of KeeperHub $4,500 + Builder Feedback Bounty $500 |

Our targeted slate (0G Track B + Gensyn AXL + KeeperHub) sums to **$7,500 (0G B max as 1 of 5 winners) + $5,000 (Gensyn 1st) + $4,500 + $500 (KeeperHub) = up to $17,500** if we sweep — realistic upside more like $1,500 + $1,500 + $2,500 + $250 = **$5,750** for placing-but-not-winning across all four.

### "Max 3 partner prizes" rule — definitive answer

From the official info page (`/events/openagents/info/details`):

> *"On the last step of the submission form, you can select up to 3 Partner Prizes to apply for. If a partner has multiple tracks, you can be eligible for all of them while only counting as 1 Partner Prize."*

**Definitive answer for Ledger:** selecting "0G" *once* makes us eligible for both Track A and Track B. So our slate (0G + Gensyn + KeeperHub) consumes exactly 3 of 3 slots — fits perfectly, no headroom but no conflict.

If we want a 4th sponsor (e.g. ENS for an agent-naming play), we'd have to drop one of the three. **Recommendation: don't dilute. Keep the focused 3.**

### Submission form fields

Per the info page (partial — full form only visible at submission time):
- Project title
- Project description
- Public repository link
- Demo video URL
- Live demo link (where applicable)
- Team members (names + Telegram + X)
- Partner prize selections (up to 3, last step of the form)
- Sponsor-specific fields (e.g. Uniswap requires a `FEEDBACK.md`, Gensyn requires evidence of cross-AXL-node communication, KeeperHub requires working demo)

### Judging criteria (finalist + partner prize)

**Overall hackathon (finalist round):**
1. **Technicality** — problem complexity, solution sophistication
2. **Originality** — novelty, creative problem-solving
3. **Practicality** — functional, real-world usable
4. **Usability** — intuitive UX
5. **WOW factor** — distinctive, memorable

**Partner prizes** — judged independently by each sponsor against their own criteria. KeeperHub: functional delivery, real-world utility, depth of integration, code quality. 0G: per-track (Track B emphasizes agent autonomy + iNFT innovation). Gensyn: cross-node AXL communication. There is no "partner prize council" — each sponsor scores their own pool separately, so optimizing for one sponsor doesn't help with another.

### Video rules (max length, required content)

- **Duration: 2–4 minutes.** Outside this range = **automatic rejection**. (This is stricter than the "under 3 minutes" assumption in the team docs — it's actually a *minimum* of 2 minutes too.)
- **Resolution: 720p minimum.**
- **Spoken narration required.** No TTS. No music-only. No silent screen-recording.
- Avoid mobile recording (lower-quality flag).
- Should cover: what it does, demo of working flow, brief tech overview, and (implicitly) which sponsor integrations are used.

### Required README sections

The info page does NOT pin a README template. Across sponsor pages, the *de facto* expectations are:
- **Project description** — what + why
- **Architecture** — diagram or prose, especially showing where each sponsor's tech sits
- **Setup instructions** — how to run locally
- **Demo evidence** — link to video + live URL + (for KeeperHub) execution IDs / replay links
- **Sponsor-specific section** — per-sponsor: how we used 0G / Gensyn / KeeperHub, with file/contract references
- **Contracts deployed** — addresses on each chain, with explorer links
- **Team + contact**

For our build, add a `FEEDBACK.md` (KeeperHub feedback bounty + Uniswap-style discipline even though we're not entering Uniswap), and an "Evidence" section in the main README with at least 2–3 sample KeeperHub execution IDs.

---

## Part 3 — ERC-8004

### Spec status (EIP number, status)

- **Number:** ERC-8004
- **Title:** Trustless Agents
- **Status:** **Draft** (Standards Track: ERC) — `https://eips.ethereum.org/EIPS/eip-8004`
- **Created:** 2025-08-13
- **Authors:** Marco De Rossi (`@MarcoMetaMask`), Davide Crapis (`@dcrapis`), Jordan Ellis, Erik Reppel
- **Discussion:** `https://ethereum-magicians.org/t/erc-8004-trustless-agents/25098`

**Implication for our claim:** "ERC-8004 conformant" is fine *as long as* we say "conformant to ERC-8004 (Draft, August 2025) at v0.x." Don't claim conformance to "the standard" without status — Draft means the spec can still change.

### Components (IdentityRegistry, ReputationRegistry, ValidationRegistry)

**IdentityRegistry** — ERC-721-based, makes every agent an NFT.
- Functions: `register(agentURI, metadata[])` / `register(agentURI)` / `register()` → `agentId`; `setAgentURI`; `setMetadata` / `getMetadata`; `setAgentWallet(agentId, newWallet, deadline, signature)` / `getAgentWallet` / `unsetAgentWallet`.
- Events: `Registered(agentId, agentURI, owner)`, `URIUpdated`, `MetadataSet`.
- Agent ID format: `"{namespace}:{chainId}:{identityRegistry}"` e.g. `eip155:1:0x742…` so an agentId is portable across chains.

**ReputationRegistry** — feedback ledger (NOT a star-rating db).
- Functions: `giveFeedback(agentId, value:int128, valueDecimals:uint8, tag1, tag2, endpoint, feedbackURI, feedbackHash)`; `revokeFeedback(agentId, feedbackIndex)`; `appendResponse(agentId, clientAddress, feedbackIndex, responseURI, responseHash)`; read paths: `getSummary`, `readFeedback`, `readAllFeedback`, `getClients`, `getLastIndex`.
- Events: `NewFeedback(agentId, clientAddress, feedbackIndex, value, decimals, tag1, tag2, endpoint, feedbackURI, feedbackHash)`, `FeedbackRevoked`, `ResponseAppended`.
- **Pre-authorization:** before a client can `giveFeedback`, the *agent* must sign a feedback authorization (EIP-191 or ERC-1271). This stops feedback spam. **If our minimal ReputationRegistry has no auth check, it's not really 8004-conformant.**

**ValidationRegistry** — independent verification (stake/zkML/TEE).
- Functions: `validationRequest(validatorAddress, agentId, requestURI, requestHash)`; `validationResponse(requestHash, response:uint8, responseURI, responseHash, tag)`; `getValidationStatus`, `getSummary`, `getAgentValidations`, `getValidatorRequests`.
- Response scale: 0–100 (0=fail, 100=pass, intermediate=spectrum).

### What "reputation" means in the standard

Per the spec text and the Composable Security explainer:

Reputation is **NOT** a star rating, an aggregate score, a moving average, or a "reviews count." It is a **stream of signed feedback records**, each containing:

- a bounded **score** (`int128 value` + `uint8 valueDecimals`)
- two optional context **tags** (`tag1`, `tag2`)
- an **endpoint** label (e.g. which API / interaction was rated)
- a **feedbackURI** pointing to off-chain JSON (logs, artifacts, receipts)
- a **feedbackHash** (KECCAK-256) so the off-chain payload is tamper-evident
- the **clientAddress** (who rated)

Reputation is intentionally **non-universal**: "Alice's trust for Bob differs from Charlie's trust for Bob, and Alice's trust varies by context." Aggregation is delegated to *consumers* — they can run `readAllFeedback` and compute their own score per their own policy (filter by tag, weight by client trust, time-decay, etc.).

A canonical on-chain record looks like:
```json
{
  "agentRegistry": "eip155:1:{identityRegistry}",
  "agentId": 22,
  "clientAddress": "eip155:1:{clientAddress}",
  "createdAt": "2025-09-23T12:00:00Z",
  "value": 87,
  "valueDecimals": 0,
  "tag1": "delivery-quality",
  "tag2": "on-time"
}
```

### Reference implementations

- **Official:** `https://github.com/erc-8004/erc-8004-contracts` — audited by **Cyfrin, Nethermind, EF Security Team**, license CC0. Vanity-deployed at `0x8004A818BFB912233c491871b3d84c89A494BD9e` (IdentityRegistry) and `0x8004B663056A597Dffe9eCcC1965A193B7388713` (ReputationRegistry) on Ethereum Sepolia, Base Sepolia, Linea Sepolia, Hedera Testnet (and 20+ networks total when including mainnets).
- **ChaosChain:** `https://github.com/ChaosChain/trustless-agents-erc-ri` — community implementation with end-to-end demo.
- **Phala TEE-based:** `https://github.com/HashWarlock/erc-8004-ex-phala/`.
- **M2M TRC-8004 for TRON:** `https://github.com/M2M-TRC8004-Registry/smart-contracts`.
- Curated index: `https://github.com/sudeepb02/awesome-erc8004`.

**For Ledger:** instead of building our own minimal ReputationRegistry, **use the official deployed contracts at `0x8004B663…` on Base Sepolia**. Cost is zero, audit story is automatic, and we can claim "we use the official ERC-8004 reference deployment" — much stronger narrative than "we wrote our own minimal version."

### Known integrations

From the awesome list:
- **UFX Agentic Commerce** (uses ERC-8183 hooks on top)
- **Azeth** (non-custodial smart accounts with guardian guardrails)
- **Primev** (x402 payment facilitator)
- **Helixa** (1,000+ agents minted with a Cred Score system)
- **Agent Arena** (22,000+ indexed agents across 16 chains)
- **Theagora** (atomic escrow with 4-tier verification — closest analog to Ledger's escrow concept)
- **Verity Protocol** (on-chain reliability scoring)

Mainnet went live **2026-01-29**. Total indexed agents across Base / BSC / Ethereum: **~107k** at time of writing.

### Verdict: are we using ERC-8004 correctly?

**No, the architect is right.** A "minimal ERC-8004 ReputationRegistry" implemented as a star-rating database is not 8004-conformant; it's a different thing wearing the standard's name.

What "right" looks like for Ledger:

1. **Drop the custom ReputationRegistry.** Use the official `0x8004B663…` deployment on Base Sepolia. Zero contract code to write, zero audit risk, zero standards-compliance argument.
2. **Implement the feedback flow as the spec describes**: when a job completes, the WORKER signs a feedback-authorization (EIP-191), the CLIENT calls `giveFeedback(agentId, score, decimals, tag1='ledger-job', tag2=jobType, endpoint, feedbackURI=ipfs://…, feedbackHash)`, the URI points to a JSON blob with the job receipt + delivery hash.
3. **Optional but high-value:** also use the IdentityRegistry — register every Ledger worker as an ERC-8004 agent. That gives them portable identity across other 8004-aware platforms.
4. **README claim:** "Ledger uses the audited ERC-8004 reference deployment for worker reputation. Each completed job emits a `NewFeedback` event with an off-chain `feedbackURI` pinned on 0G storage." That's an honest, strong claim.

If we keep a custom contract, we should call it something like "Ledger LegacyRatings (pre-8004 stub)" and not claim 8004 conformance.

---
