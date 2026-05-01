# Stage 1 — Solo-Builder Pragmatist

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

FINAL RANKING:
1. ENS Agent Passes
2. Swap Receipt Agent
3. 0G Memory Kit
