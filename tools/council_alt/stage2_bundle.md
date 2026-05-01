# ALT-COUNCIL STAGE 1 — ANONYMIZED BUNDLE (9 IDEAS)

*Three council members (Whisperer / Pragmatist / Inventor) each proposed 3 distinct ideas for a solo-buildable alt-path submission targeting some combination of: 0G Track A ($15K), Uniswap ($5K), ENS-AI ($2.5K), ENS-Creative ($2.5K). Their 9 ideas are bundled here, anonymized as Idea A through Idea I.*

*Constraint reminder: Solo dev. ~24-40h budget. Polish > complexity. 1–2 bounties max. Sponsor must LOVE it (not just accept it).*

---

## Idea A
## Idea 1: ENS Agent Passes

**Bounty target(s):** ENS-AI + ENS-Creative.

**What ships:** A polished web demo where an AI agent lives at `agent.<owned-name>.eth`, exposes a small public endpoint, and gates actions through ENS subnames used as access passes. In the demo, the user requests access, the app mints or issues a subname like `gabriel.agent.<owned-name>.eth` through Namestone or another hosted subname flow, writes metadata text records for the agent and pass, then the agent endpoint checks ENS resolution before returning a signed response. The visible demo is simple: discover the agent by ENS name, inspect its metadata, issue a pass, POST a task to the agent, and see "accepted because subname pass resolved" with a verifiable receipt. This is 18–22h if hosted ENS issuance works; 35h+ if we decide to write custom resolver infrastructure.

| Chunk | Hours |
|---|---:|
| repo + scaffolding | 2 |
| ENS name/text-record read flow | 3 |
| hosted subname issuance integration | 4 |
| agent endpoint + gate check | 4 |
| receipt page + copy polish | 3 |
| demo data + fallback script | 2 |
| architecture diagram + README | 2 |
| demo recording | 2 |
| **Total** | **22** |

**What I'd cut to ship faster:** If hour 12 looks bad, cut multi-user issuance and show one pre-owned subname pass being checked live. That saves 3–4h and still keeps ENS doing real work. If the hosted subname API gets weird, cut write-path automation and keep only live resolution against preconfigured subnames; that is less impressive, but it avoids a broken demo. I would not cut the agent endpoint, because without that this becomes an ENS toy in 10h instead of an AI-agent identity product in 22h.

**What's already commodified vs. needs custom build:** ENS reads are commodified through viem, ethers, the Universal Resolver, and public RPC. Text records are a 1–2h integration if the name already exists and records are set through a dashboard or script. Subname issuance is commodified if Namestone or a similar hosted API can be used; budget 4h including account setup, API testing, and demo hardening. A custom CCIP-Read resolver is not weekend-safe; that is 16h minimum before polish and 24h if debugging client compatibility. A custom NameWrapper contract path is also too expensive for this brief. The AI part should be intentionally tiny: a deterministic endpoint with an LLM-flavored response, not a full planning agent. Budget 2h for the "agent" behavior and spend the real hours on ENS identity, gating, and demo clarity.

**The polish risk:** The biggest polish risk is that ENS operations are slow or invisible. A judge watching a spinner while records propagate will not care that the architecture is clean. The demo needs a tight split-screen: left side shows `agent.<name>.eth` identity and pass status; right side shows the accepted/rejected agent request. The other risk is looking like "just subnames." The UI has to make the product truth obvious in 20 seconds: ENS is the agent directory, metadata layer, and access-control mechanism. If that message is buried in README prose, this loses polish even if the code works.


---

## Idea B
## 1. `subname-receipts`

**The primitive in one sentence:** A CCIP-Read resolver that mints an ephemeral ENS subname for every transaction an agent executes, such that `<txid>.<agent>.eth` resolves to a structured receipt — chain, hash, intent, outcome, signer — addressable by name instead of by hex.

**Bounty target(s):** ENS Creative ($2.5K) primary, ENS-AI ($2.5K) secondary — viable for both.

**Why it's a primitive, not an app.** Today, an agent's history is "go look at Etherscan." There's no canonical way to point at "the swap I did on Tuesday" by name, and no way for *another* agent to audit it without you handing over the tx hash. Once subname-receipts exists, every agent framework that mounts it gets a queryable, human-readable activity log for free. Auditors plug into it. Reputation systems (ERC-8004) plug into it. Wallet UIs that resolve ENS suddenly understand "show me what `marty.eth` did last week." It is the noun *agent transaction log* expressed as ENS, and once it's named that way it's obvious it should have existed.

**The composition.** ENSIP-10 CCIP-Read offchain resolver + wildcard resolution + ENSIP-5 prefix-namespaced text records (`ai.tx.intent`, `ai.tx.outcome`, `ai.tx.chain`, `ai.tx.hash`, `ai.tx.amount`) + 0G Storage as the off-chain backing store for the receipt JSON (CID embedded in `contenthash`). The on-chain footprint is one resolver contract; everything else is signed JSON the resolver returns at lookup time. No subname is ever wrapped — they exist purely as resolver responses, the way ENS *intends* CCIP-Read to be used.

**The reveal moment in the demo.** Five seconds. Judge opens app.ens.domains, types `tx-2026-05-02-001.demoagent.eth`. Page renders a clean receipt view: "Swapped 100 USDC → 0.027 ETH on Uniswap, intent: rebalance, signer: marty.eth, ✓ verified." Judge types another one that doesn't exist — clean 404 from the resolver, no gas, no error. Judge does `tx-2026-05-02-001.demoagent.eth` again — same response, deterministic. Then the *second* "oh." moment: judge does `latest.demoagent.eth` and gets the most recent receipt. The resolver is *programmable*; subnames aren't records, they're queries.

**What makes it surprising or delightful.** ENS as a structured log, not a registry. The subname is the URL, the resolver is the backend, and zero on-chain writes happen during agent operation. An ENS engineer screenshots this because it is *exactly* the use case CCIP-Read was designed for and nobody has built it. It also gives the demo a wonderful party trick: the agent's *entire history* is browseable as a namespace tree, and every leaf is signed.

**Solo-shippability.** ~30 hours. CCIP-Read offchain resolver scaffolds exist (ENS publishes one). The hard part is the receipt schema — pick five fields, ship it. 0G Storage SDK in TS is documented. No zk, no novel cryptography. Demo agent that does 3 swaps and shows their subnames is the entire video.

---


---

## Idea C
## Idea 1 — Capability Subnames for Agents

1. **Title:** Capability Subnames for Agents
2. **Bounty target(s):** ENS-Creative + ENS-AI (dual-track, $5K pool). The pairing is forced by the design: the primitive itself satisfies BOTH briefs simultaneously. ENS-Creative wants surprising primitive use; this uses three of their three named examples. ENS-AI wants ENS doing real identity work for agents; this has agents discover, scope, and delegate authority entirely through ENS resolution.
3. **The 60-second pitch:** Every agent gets one ENS name (`alice.openagents.eth`). Every *capability* it exposes is a subname: `swap.alice.openagents.eth`, `read.alice.openagents.eth`, `pay.alice.openagents.eth`. When another agent resolves a capability subname, ENS — via CCIP-Read — returns three things: (a) an **ephemeral address** that rotates per resolution and is the only key authorized to act for that capability for the next 60 seconds; (b) a **text record** with the capability's machine-readable spec (inputs, scope, rate limits); (c) a **text record carrying a zk attestation** that the agent satisfies some operator-defined constraint (e.g., "audited," "daily volume < X," "owner is not on a sanctions list"). The demo: two agents bootstrap a paid task between themselves using nothing but ENS resolutions — no central registry, no API keys, no shared backend. Subnames are the access tokens. CCIP-Read is the session manager. zk proofs in text records are the trust layer. The recording: terminal split-screen, Agent A asks "who can do X?" → agent B's `skills.bob.openagents.eth` resolves a list → A resolves `do.bob.openagents.eth`, gets an ephemeral signing address, pays the proof-bound capability, refreshes the resolver, the address has rotated to a new one. ENS log scrolls underneath showing actual on-chain reads.
4. **Why ENS would love it specifically:** Their ENS-Creative brief lists three examples. This idea uses all three, none decoratively. CCIP-Read auto-rotating addresses is the core auth mechanism (not a gimmick — without rotation the design fails open). Subnames-as-access-tokens is literally what subnames *are* in this system; the namespace IS the permission graph. zk proofs in text records carry the trust-bounded capability claims. ENS-AI's brief lists five "real work" verbs (resolving / storing metadata / gating access / enabling discovery / coordinating A2A) — this hits FIVE of five. ENS is not a name lookup; it's the entire control plane. This is the demo Nick Johnson tweets.
5. **Why competing builders likely WON'T do it:** The default "ENS for agents" submission this hackathon is going to be a bot that registers `mybot.eth` and writes `ai.bio` to its text records. That'll be 60% of submissions. The next 30% will add some kind of agent-to-agent registry on top of static text records. Almost nobody will touch CCIP-Read because it requires running a small off-chain resolver service and signing redirected responses correctly — that's a real day-one wall. Even fewer will design subnames as a *capability namespace* rather than a directory. And almost zero solo devs will ship a working zk attestation in a text record because (a) the zk circuit takes time, (b) they'll think it's overkill. The asymmetric edge here is taste and tolerance for one hard piece (CCIP-Read resolver). The zk part can be a Groth16 mock for the demo and ENS engineers will still recognize the right *shape*.
6. **Build cost estimate:** 35–55 solo hours. CCIP-Read off-chain resolver is the slowest piece (~12–18h including signature handling). Capability registry contract + ephemeral key derivation logic ~10h. Two demo agents that actually pay each other ~8h. zk proof — ship a circom→Groth16 attestation for one constraint (e.g., "address has KYC token"), pre-compute proofs for demo, ~6–10h. Polish + 3-min screen recording ~5h.
7. **Minimum viable demo:** 60-second screen recording. Title card: "Two agents that have never met, transact via ENS." Cut to terminal: Agent A on left, Agent B on right, ENS event log centered. A: "I need a swap." A queries `agents.openagents.eth` (a directory subname). Resolved list shows B has the `swap` capability. A resolves `swap.bob.openagents.eth` — output shows ephemeral address `0xabc...` and text records: scope, rate-limit, attestation hash. A submits transaction to that ephemeral address with required payload. Settlement happens. A re-resolves immediately — ephemeral address is now `0xdef...`, the previous one is dead. Last 5 seconds: zoom on the text record block showing the zk proof bytes verifying against an on-chain verifier. End card: "ENS as the agent control plane. No backend. No registry. Just resolution."

---


---

## Idea D
## Idea 2: Swap Receipt Agent

**Bounty target(s):** Uniswap + ENS-AI.

**What ships:** An agent with an ENS name that accepts a token-swap intent, fetches a live Uniswap API quote, returns a transparent quote receipt, and stores or exposes that receipt under ENS-resolvable agent metadata. The demo does not need to execute a real mainnet swap. It should show a live quote request like "swap 0.1 ETH to USDC on supported test or live quote network," the Uniswap quote response within the UI, an agent decision note, and an ENS-linked receipt URL or text record proving this named agent produced the quote. The repo includes a serious `FEEDBACK.md` with specific Uniswap Developer Platform friction points from building the demo. This is 20–26h if quote-only; 36–44h if execution, approvals, and settlement are included. For solo polish, quote-plus-receipt is the build.

| Chunk | Hours |
|---|---:|
| repo + scaffolding | 2 |
| Uniswap API key + quote integration | 5 |
| agent request/response endpoint | 3 |
| ENS identity + metadata reads | 3 |
| receipt generation page | 3 |
| FEEDBACK.md with real DX notes | 3 |
| UI polish + empty/error states | 4 |
| demo recording | 2 |
| **Total** | **25** |

**What I'd cut to ship faster:** If hour 12 looks bad, cut ENS writebacks and use ENS only for resolving the agent name plus metadata. That preserves the ENS-AI target at a basic but functional level, though it weakens the second bounty. If the Uniswap API authentication or chain support burns time, cut the interactive input form and ship three supported quote presets with live refresh. I would also cut swap execution immediately. Permit2, Universal Router, approvals, test liquidity, and wallet UX can eat 10–14h and still produce a demo that judges distrust.

**What's already commodified vs. needs custom build:** Quote and route calls are commodified if the Uniswap Developer Platform key is available and docs match reality; budget 5h because auth, supported chains, token addresses, and response shape always cost more than expected. The web app shell, API route, and receipt rendering are boring Next.js work at 6–8h total. ENS read integration is commodified at 3h. ENS writeback is not worth depending on unless records are already under our control. Swap execution is the expensive custom part: approvals, transaction construction, wallet signing, failure states, and testnet liquidity put it outside the 24h polished path. UniswapX filler logic is a trap for this brief and should not be touched.

**The polish risk:** The main polish risk is that quote-only can look incomplete beside the bounty phrase "swap and settle value onchain." This can be mitigated by being honest: the agent produces transparent, composable quote receipts and documents exactly what blocked settlement in `FEEDBACK.md`. But it still risks feeling like an API wrapper. The second risk is token/chain friction. If the demo opens with chain selectors, token addresses, and failed quotes, it feels like infrastructure plumbing. The polished version needs three clean presets, fast loading, a crisp receipt, and a visibly thoughtful feedback file. Without that, this is a 25h build that looks like a 6h wrapper.


---

## Idea E
## 2. `quote-resolver`

**The primitive in one sentence:** A wildcard ENS resolver where `<amount>-<from>-to-<to>.quote.eth` returns a live Uniswap routing quote at resolution time, making swap quotes addressable as ENS names from any ENS-aware client without an SDK.

**Bounty target(s):** Uniswap ($5K) primary, ENS Creative ($2.5K) secondary.

**Why it's a primitive, not an app.** Today, getting a Uniswap quote means installing a JS SDK, holding an API key, formatting a request. Every wallet, dashboard, terminal, agent, and chat interface that wants to *display* a quote has to plumb that integration. Once `quote-resolver` exists, anything that already speaks ENS — and that is nearly every wallet ever made — can render swap quotes natively. The composition flips: instead of "wallet integrates Uniswap," it's "wallet resolves a name." It is the *price oracle as a name*, and once it's a name, every agent that already knows how to do `resolve()` knows how to ask Uniswap "what's the rate?" That's an enormous surface-area expansion for the Uniswap API for ~200 lines of code.

**The composition.** ENSIP-10 CCIP-Read offchain resolver + wildcard resolution under `quote.eth` + Uniswap Routing API (`/quote` endpoint) for the live route + ENSIP-5 text records carrying the structured response (`org.uniswap.amount-out`, `org.uniswap.route`, `org.uniswap.gas-estimate`, `org.uniswap.expires-at`). The label `100-usdc-to-eth` is parsed by the resolver, hits the Uniswap API server-side, and returns text records the same way any ENS name would.

**The reveal moment in the demo.** Judge opens any ENS-aware client (the official app, Rainbow, even raw `cast resolver`), types `1000-usdc-to-eth.quote.eth`, sees a clean record set: amount-out, route, gas, expiry. Five seconds later they refresh: the amount has changed by 0.03%. *Quotes are live names.* That's the "oh." The follow-up: judge types `1eth-to-usdc.quote.eth` from a Telegram bot that already does ENS resolution — bot says "1 ETH ≈ $3,427" with zero new code. The demo's killer line is "this works in every interface that already resolves ENS — we shipped a Uniswap UI to all of them."

**What makes it surprising or delightful.** It crosses two ecosystems with a single contract. Uniswap's lead engineer screenshots it because they have spent two years thinking about how to get *more agents* to use the API, and here is a primitive that lets agents use it through the most universal Web3 namespace already. ENS engineers screenshot it because it's a textbook CCIP-Read use case that's *useful*, not a demo.

**Solo-shippability.** ~25 hours. Offchain resolver is the same scaffold as Idea 1. The Uniswap Routing API is REST and well-documented. The label parser is a regex. The FEEDBACK.md writes itself — building this *will* surface five real friction points (the API doesn't have a "minimum freshness" header, the response shape doesn't include a quote-id you can later settle against, the rate-limit policy is undocumented, etc.). All of which are gold for the Uniswap track's actual scoring rubric.

---


---

## Idea F
## Idea 2 — Treasury-Rebalance Agent + DX Forensics

1. **Title:** Treasury-Rebalance Agent + DX Forensics
2. **Bounty target(s):** Uniswap solo ($5K, 3 prizes). Single bounty by design — pairing Uniswap with anything else dilutes the FEEDBACK.md, which is the real prize. Trying to also nail an ENS angle here would split focus and the agent would feel like a college project.
3. **The 60-second pitch:** A solo-runnable agent that manages a multi-token treasury (think: an EOA holding stablecoins + ETH + a long-tail token) and executes scheduled rebalances using UniswapX intents on Unichain, with Permit2 batched approvals and Universal Router for any non-X path. The agent's value loop is real: it reads target weights, computes drift, decides whether to fill via UniswapX (better price, slower) or Universal Router (instant, slippage cost), submits the batch, settles, logs. Then — and this is the win — it ships a `FEEDBACK.md` that is NOT a checkbox. It's a 25–40 page forensic document: every API friction point hit during the build, with timestamped repros, request/response screenshots, missing endpoint specs ("here's the WebSocket subscription contract that should exist, here's why polling subgraphs every 4s costs me 12 RPC calls per decision cycle"), and a section called "what changes if you ship this" estimating impact. A Uniswap PM forwards this internally.
4. **Why Uniswap would love it specifically:** The brief makes the FEEDBACK.md mandatory. Every team will produce one. 90% will be three paragraphs of "the docs were nice but I wish there were more examples." A serious post-mortem with reproducible bugs and a missing-endpoint spec sheet is exactly what they're paying for — they used the word "DX research" in spirit if not in writing. Combine that with the agent itself using *underused* surface area (UniswapX, Permit2, Unichain, Universal Router — not just `swap`), and a Uniswap engineer reading it has two reactions in sequence: "this builder shipped on the new stuff we want validated" → "this feedback is going on next sprint's planning doc." The other emotional beat: "agentic finance" is in their headline and most submissions will fake it (an agent that places one swap is not agentic). A treasury-rebalance loop running on a timer with intent vs. instant routing decisions is a *real* agent value loop.
5. **Why competing builders likely WON'T do it:** Most builders will write an agent that does a single swap on a chat trigger and call it agentic. They'll use `Trading API` only and ignore UniswapX/Permit2 entirely because UniswapX requires understanding fillers and intents. Their FEEDBACK.md will be cursory because they treat it as a checkbox. The asymmetric edge here is *seriousness about feedback as a deliverable* — most builders psychologically can't justify spending 4 hours writing a doc when they could be coding. A solo dev who treats the FEEDBACK.md as half the submission's surface area wins on a dimension nobody else competes on. Also: very few will deploy on Unichain because it's new and they'll default to mainnet/Sepolia.
6. **Build cost estimate:** 25–40 solo hours. Agent loop + decision logic ~10h. UniswapX intent integration (the gnarly piece) ~8h. Permit2 batching + Universal Router fallback ~5h. Unichain deploy + RPC plumbing ~3h. Live dashboard for demo (web UI showing agent's recent decisions + drift + executions) ~5h. **FEEDBACK.md ~6h** — written *during* the build, not after, so the friction is captured fresh.
7. **Minimum viable demo:** Live dashboard top-half of screen showing target weights / current weights / drift bar. Bottom-half: agent's reasoning log streaming. Trigger: timer fires, drift exceeds 2%. Agent decides: "Use UniswapX, expected savings 11bps over Universal Router." Intent broadcast on Unichain. Filler picks up, settlement lands, dashboard updates. Cut to a second scenario: drift in long-tail token, no UniswapX liquidity, agent falls back to Universal Router with explicit slippage tolerance. Settlement lands. End card: "Uniswap API, real settlement loop, full FEEDBACK.md in repo." On-screen QR or link to FEEDBACK.md. Judges who click that link are sold.

---


---

## Idea G
## Idea 3: 0G Memory Kit

**Bounty target(s):** 0G Track A.

**What ships:** A tiny agent framework extension called "0G Memory Kit" that gives one example agent persistent memory on 0G Storage: append event, retrieve context, summarize memory, and replay a session. The demo shows an agent receiving three tasks, writing memory events to 0G Storage, reloading from a fresh browser/session, and using prior memory to answer a fourth task. The deliverable is a public repo with a minimal SDK wrapper, one working example agent, setup instructions, deployed 0G contract addresses if required by the bounty gate, and a simple architecture diagram. This is 30–38h if 0G Storage SDK behaves; 45h+ if chain deployment and storage docs are rough.

| Chunk | Hours |
|---|---:|
| repo + scaffolding | 2 |
| 0G SDK setup + storage smoke test | 6 |
| memory wrapper API | 6 |
| example agent | 5 |
| 0G chain deployment/address gate | 5 |
| replay UI + state visualization | 6 |
| README + architecture diagram | 3 |
| demo recording | 2 |
| **Total** | **35** |

**What I'd cut to ship faster:** If hour 12 looks bad, cut the SDK wrapper abstraction and ship only the example agent with three well-named storage functions. That saves 5h and reduces the framework claim, but it keeps the demo alive. If the 0G chain deployment gate gets sticky, cut any custom contract logic and deploy the smallest possible marker contract or documented example contract so the address requirement is satisfied. I would cut hierarchical planning immediately. I would also cut no-code builder ideas immediately. Those are 20h polish sinks before the first useful demo frame.

**What's already commodified vs. needs custom build:** Basic web scaffolding and local agent behavior are commodified. The unknown is 0G. Storage may be 2–4h if the SDK examples work, but the briefing should budget 6h because auth, testnet funding, CLI friction, and docs drift are real. Persistent memory semantics are custom but small: append, list, summarize, and replay can be built in 6h if we avoid generalized framework design. Contract deployment on 0G is likely commodified at the EVM level but still costs 5h with faucet, RPC, verification, and README proof. A full OpenClaw-inspired framework is not solo-weekend-safe. A narrow extension with one example agent is the only honest 0G Track A route.

**The polish risk:** This risks looking like a storage demo with "agent" pasted on top. The UI has to make memory feel tangible: timeline, storage transaction or object IDs, fresh-session reload, and one answer that clearly depends on previous context. Another polish risk is testnet fragility. If 0G RPC or storage is slow during recording, the demo needs cached display of object IDs plus a live "refresh from 0G" button, not a blank waiting state. The final risk is prize competitiveness. 0G has the biggest pool, but framework submissions will be crowded. This can place only if it is narrow, well-documented, and visibly useful in under three minutes.


---

## Idea H
## 3. `agent-forwarder`

**The primitive in one sentence:** A CCIP-Read resolver where `pay.<agent>.eth` resolves to a *fresh deterministic address* on each lookup, derived from a master pubkey + a nonce served by an off-chain signer, so an agent can publish a single payable name that never reuses an address but remains fully self-custodial.

**Bounty target(s):** ENS Creative ($2.5K) primary, ENS-AI ($2.5K) secondary.

**Why it's a primitive, not an app.** ENS Track 2 *literally lists* "auto-rotating addresses on each resolution" as one of three concrete examples. Nobody has shipped a clean reusable version. Today, agents that want privacy or per-payment accounting have to either (a) use one address for everything (terrible privacy, no tagging) or (b) hand out addresses out-of-band (terrible UX, breaks ENS). Once `agent-forwarder` exists, every agent that publishes one ENS name gets fresh-address-per-payment for free, and the receipts all link back via a signed delegation chain to the master key. It is the noun *payable handle with built-in address rotation*, and the receipt graph is auditable.

**The composition.** ENSIP-10 CCIP-Read + BIP-32-style HD derivation off the agent's master pubkey + a single text record (`ai.payment.scheme = "hd-rotating-v1"`) + an on-chain `delegate` registry mapping each derived child address back to the master (lazily populated when funds are first swept). The off-chain resolver server holds the master pubkey, derives `child_n = derive(master, n)` where `n` is `keccak(timestamp_window || requester_ip)` truncated, and returns the child as the address. The chain only learns about a child address when it's used.

**The reveal moment in the demo.** Judge resolves `pay.alice.eth` in the official ENS app — gets address `0x1f3a…`. Judge resolves it again 30 seconds later — gets `0x9c44…`. Both addresses are different, both verifiably derive from the same parent (judge clicks "verify" and sees the proof). The five-second "oh" is the second resolution. The follow-up: judge sends 0.01 ETH to each. App shows a unified balance under `alice.eth` because the resolver *also* publishes a `ai.payment.history` text record listing all derived children. Privacy + accounting in one primitive.

**What makes it surprising or delightful.** ENS shipped CCIP-Read *for this* and the docs literally use it as an example. Building it cleanly — with a real HD scheme, a real verifier, a real demo wallet that resolves it — is the exact work the ENS team would PR into their own examples repo. It's also a primitive that fixes a genuine agent problem: agents that earn money over time want fresh addresses but a stable public handle, and right now they have to choose. This eliminates the choice.

**Solo-shippability.** ~35 hours. The HD derivation is `ethers.HDNodeWallet`. The CCIP-Read resolver is the same shape as Ideas 1 and 2. The trickiest piece is the verification UI — proving on-demand that `0x1f3a` derives from `master`. ethers has primitives for this. Skippable for v1: the on-chain `delegate` registry; v1 can publish the proof in a text record and let the verifier do it client-side. No zk required.

---


---

## Idea I
## Idea 3 — 0G Memory Anchor

1. **Title:** 0G Memory Anchor
2. **Bounty target(s):** 0G Track A solo ($15K, 5 prizes). I'll be honest with the chairman: this is my third-ranked idea. Solo against teams in this category is an uphill grade. But for completeness, the narrow-polished-primitive play is the only solo-viable angle here.
3. **The 60-second pitch:** A drop-in TypeScript library that gives ANY agent (ElizaOS, MCP servers, custom loops, LangChain, whatever) durable, verifiable, recall-deterministic memory anchored to 0G Storage. One API: `memory.write(scope, key, value)`, `memory.recall(scope, query)`. Under the hood: chunked writes to 0G Log + KV store, content-addressed, with a Merkle root snapshotted on 0G Chain every N writes so the agent's memory has an on-chain checkpoint trail. Demo: an agent process is killed mid-conversation and restarted on a different machine; it picks up exactly where it left off, and the user verifies on-chain that the recalled memory matches the snapshotted root. Not a framework — a *primitive*.
4. **Why 0G would love it specifically:** Their focus areas list literally names "Self-evolving frameworks with persistent 0G Storage memory." This is the persistent-memory primitive, isolated as a library, drop-in-able. They reward it because (a) it makes their Storage product look *easy* — the killer demo for any storage product is "look how simple agent memory becomes" — and (b) it slots cleanly into other people's frameworks, multiplying their ecosystem reach. A small primitive that becomes the de-facto memory layer for 0G is more valuable to them than another full framework that competes with their own narrative.
5. **Why competing builders likely WON'T do it:** Most teams will build a *framework* — full agent runtime, planner, tools, the works. Frameworks are sexier and look more impressive at a glance. But they're also a known crowded category (everyone's building one) and judges have framework fatigue. A library that does ONE thing well, with a beautiful README and three example integrations (ElizaOS, MCP, plain Node), reads as adult engineering. The asymmetric edge is restraint — solo devs trying to look impressive build frameworks; solo devs trying to win build the right small thing.
6. **Build cost estimate:** 30–45 solo hours. Library API + 0G Storage SDK plumbing ~12h. On-chain checkpoint contract ~5h. Recall semantics (semantic search over chunks, or just exact-key lookup with optional embedding index) ~8h. Three example integrations ~9h. Killer README + docs site ~6h. Demo recording ~3h.
7. **Minimum viable demo:** Terminal recording. Agent in conversation: "what was my user's favorite color?" Agent answers from memory. SIGKILL. Switch to second machine. `npm install @0g/memory-anchor && node restart-agent.js`. Same conversation resumes, same answer. Cut to 0G chainscan showing the Merkle root checkpoint. README on right side of screen showing the 4-line integration snippet. End card: "Persistent memory for any agent. One npm install."

---

