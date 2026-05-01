# Stage 1 — PRIMITIVE INVENTOR

The brief is "find the missing noun." I read the dossier and ENS's own examples and noticed something: ENS has been quietly shipping the most agent-shaped infrastructure in the ecosystem — CCIP-Read, wildcard resolution, namespaced text records, NameWrapper subnames — and nobody outside the ENS core team is composing them. The ENS Track 2 examples (zk-records, auto-rotating addresses, subnames as tokens) aren't a wishlist — they're a declaration of what ENS *is*, that nobody is using.

The three primitives below all start there. Each one is a 200-line library with one paragraph of README. Each one composes things sponsors have shipped but have not seen composed.

---

## 1. `subname-receipts`

**The primitive in one sentence:** A CCIP-Read resolver that mints an ephemeral ENS subname for every transaction an agent executes, such that `<txid>.<agent>.eth` resolves to a structured receipt — chain, hash, intent, outcome, signer — addressable by name instead of by hex.

**Bounty target(s):** ENS Creative ($2.5K) primary, ENS-AI ($2.5K) secondary — viable for both.

**Why it's a primitive, not an app.** Today, an agent's history is "go look at Etherscan." There's no canonical way to point at "the swap I did on Tuesday" by name, and no way for *another* agent to audit it without you handing over the tx hash. Once subname-receipts exists, every agent framework that mounts it gets a queryable, human-readable activity log for free. Auditors plug into it. Reputation systems (ERC-8004) plug into it. Wallet UIs that resolve ENS suddenly understand "show me what `marty.eth` did last week." It is the noun *agent transaction log* expressed as ENS, and once it's named that way it's obvious it should have existed.

**The composition.** ENSIP-10 CCIP-Read offchain resolver + wildcard resolution + ENSIP-5 prefix-namespaced text records (`ai.tx.intent`, `ai.tx.outcome`, `ai.tx.chain`, `ai.tx.hash`, `ai.tx.amount`) + 0G Storage as the off-chain backing store for the receipt JSON (CID embedded in `contenthash`). The on-chain footprint is one resolver contract; everything else is signed JSON the resolver returns at lookup time. No subname is ever wrapped — they exist purely as resolver responses, the way ENS *intends* CCIP-Read to be used.

**The reveal moment in the demo.** Five seconds. Judge opens app.ens.domains, types `tx-2026-05-02-001.demoagent.eth`. Page renders a clean receipt view: "Swapped 100 USDC → 0.027 ETH on Uniswap, intent: rebalance, signer: marty.eth, ✓ verified." Judge types another one that doesn't exist — clean 404 from the resolver, no gas, no error. Judge does `tx-2026-05-02-001.demoagent.eth` again — same response, deterministic. Then the *second* "oh." moment: judge does `latest.demoagent.eth` and gets the most recent receipt. The resolver is *programmable*; subnames aren't records, they're queries.

**What makes it surprising or delightful.** ENS as a structured log, not a registry. The subname is the URL, the resolver is the backend, and zero on-chain writes happen during agent operation. An ENS engineer screenshots this because it is *exactly* the use case CCIP-Read was designed for and nobody has built it. It also gives the demo a wonderful party trick: the agent's *entire history* is browseable as a namespace tree, and every leaf is signed.

**Solo-shippability.** ~30 hours. CCIP-Read offchain resolver scaffolds exist (ENS publishes one). The hard part is the receipt schema — pick five fields, ship it. 0G Storage SDK in TS is documented. No zk, no novel cryptography. Demo agent that does 3 swaps and shows their subnames is the entire video.

---

## 2. `quote-resolver`

**The primitive in one sentence:** A wildcard ENS resolver where `<amount>-<from>-to-<to>.quote.eth` returns a live Uniswap routing quote at resolution time, making swap quotes addressable as ENS names from any ENS-aware client without an SDK.

**Bounty target(s):** Uniswap ($5K) primary, ENS Creative ($2.5K) secondary.

**Why it's a primitive, not an app.** Today, getting a Uniswap quote means installing a JS SDK, holding an API key, formatting a request. Every wallet, dashboard, terminal, agent, and chat interface that wants to *display* a quote has to plumb that integration. Once `quote-resolver` exists, anything that already speaks ENS — and that is nearly every wallet ever made — can render swap quotes natively. The composition flips: instead of "wallet integrates Uniswap," it's "wallet resolves a name." It is the *price oracle as a name*, and once it's a name, every agent that already knows how to do `resolve()` knows how to ask Uniswap "what's the rate?" That's an enormous surface-area expansion for the Uniswap API for ~200 lines of code.

**The composition.** ENSIP-10 CCIP-Read offchain resolver + wildcard resolution under `quote.eth` + Uniswap Routing API (`/quote` endpoint) for the live route + ENSIP-5 text records carrying the structured response (`org.uniswap.amount-out`, `org.uniswap.route`, `org.uniswap.gas-estimate`, `org.uniswap.expires-at`). The label `100-usdc-to-eth` is parsed by the resolver, hits the Uniswap API server-side, and returns text records the same way any ENS name would.

**The reveal moment in the demo.** Judge opens any ENS-aware client (the official app, Rainbow, even raw `cast resolver`), types `1000-usdc-to-eth.quote.eth`, sees a clean record set: amount-out, route, gas, expiry. Five seconds later they refresh: the amount has changed by 0.03%. *Quotes are live names.* That's the "oh." The follow-up: judge types `1eth-to-usdc.quote.eth` from a Telegram bot that already does ENS resolution — bot says "1 ETH ≈ $3,427" with zero new code. The demo's killer line is "this works in every interface that already resolves ENS — we shipped a Uniswap UI to all of them."

**What makes it surprising or delightful.** It crosses two ecosystems with a single contract. Uniswap's lead engineer screenshots it because they have spent two years thinking about how to get *more agents* to use the API, and here is a primitive that lets agents use it through the most universal Web3 namespace already. ENS engineers screenshot it because it's a textbook CCIP-Read use case that's *useful*, not a demo.

**Solo-shippability.** ~25 hours. Offchain resolver is the same scaffold as Idea 1. The Uniswap Routing API is REST and well-documented. The label parser is a regex. The FEEDBACK.md writes itself — building this *will* surface five real friction points (the API doesn't have a "minimum freshness" header, the response shape doesn't include a quote-id you can later settle against, the rate-limit policy is undocumented, etc.). All of which are gold for the Uniswap track's actual scoring rubric.

---

## 3. `agent-forwarder`

**The primitive in one sentence:** A CCIP-Read resolver where `pay.<agent>.eth` resolves to a *fresh deterministic address* on each lookup, derived from a master pubkey + a nonce served by an off-chain signer, so an agent can publish a single payable name that never reuses an address but remains fully self-custodial.

**Bounty target(s):** ENS Creative ($2.5K) primary, ENS-AI ($2.5K) secondary.

**Why it's a primitive, not an app.** ENS Track 2 *literally lists* "auto-rotating addresses on each resolution" as one of three concrete examples. Nobody has shipped a clean reusable version. Today, agents that want privacy or per-payment accounting have to either (a) use one address for everything (terrible privacy, no tagging) or (b) hand out addresses out-of-band (terrible UX, breaks ENS). Once `agent-forwarder` exists, every agent that publishes one ENS name gets fresh-address-per-payment for free, and the receipts all link back via a signed delegation chain to the master key. It is the noun *payable handle with built-in address rotation*, and the receipt graph is auditable.

**The composition.** ENSIP-10 CCIP-Read + BIP-32-style HD derivation off the agent's master pubkey + a single text record (`ai.payment.scheme = "hd-rotating-v1"`) + an on-chain `delegate` registry mapping each derived child address back to the master (lazily populated when funds are first swept). The off-chain resolver server holds the master pubkey, derives `child_n = derive(master, n)` where `n` is `keccak(timestamp_window || requester_ip)` truncated, and returns the child as the address. The chain only learns about a child address when it's used.

**The reveal moment in the demo.** Judge resolves `pay.alice.eth` in the official ENS app — gets address `0x1f3a…`. Judge resolves it again 30 seconds later — gets `0x9c44…`. Both addresses are different, both verifiably derive from the same parent (judge clicks "verify" and sees the proof). The five-second "oh" is the second resolution. The follow-up: judge sends 0.01 ETH to each. App shows a unified balance under `alice.eth` because the resolver *also* publishes a `ai.payment.history` text record listing all derived children. Privacy + accounting in one primitive.

**What makes it surprising or delightful.** ENS shipped CCIP-Read *for this* and the docs literally use it as an example. Building it cleanly — with a real HD scheme, a real verifier, a real demo wallet that resolves it — is the exact work the ENS team would PR into their own examples repo. It's also a primitive that fixes a genuine agent problem: agents that earn money over time want fresh addresses but a stable public handle, and right now they have to choose. This eliminates the choice.

**Solo-shippability.** ~35 hours. The HD derivation is `ethers.HDNodeWallet`. The CCIP-Read resolver is the same shape as Ideas 1 and 2. The trickiest piece is the verification UI — proving on-demand that `0x1f3a` derives from `master`. ethers has primitives for this. Skippable for v1: the on-chain `delegate` registry; v1 can publish the proof in a text record and let the verifier do it client-side. No zk required.

---

## Cross-cutting observations

All three primitives share the same scaffold: **ENSIP-10 offchain resolver + wildcard resolution + namespaced text records.** That means once I've built one, the second and third are dramatically cheaper. If I time-boxed it, building all three in parallel as a "Composable Resolvers" microsuite is genuinely possible in 50–60 hours, but the brief says 1–2 bounties, so I am not proposing that.

The asymmetry that matters: each one stacks on infrastructure ENS already shipped. None of them require ENS to do anything new. That is what makes the sponsor screenshot it.

---

## Self-ranking

The ranking lens is `elegance × sponsor-love × solo-shippability`. I weight sponsor-love highest because the brief says the sponsor must *love* it, not just accept it.

**`subname-receipts`** wins because it answers an unspoken question — "where is my agent's history?" — with the most ENS-native answer possible, and it composes cleanly into both ENS tracks. The "browseable namespace tree of receipts" demo is the strongest "oh" moment of the three. It also has incidental utility for the Ledger team's own work later, which is a tiebreaker.

**`agent-forwarder`** is second because it directly hits one of the three named ENS examples, which is the closest thing to a guaranteed sponsor-love signal we have. It's slightly riskier on shippability (HD derivation + verification UI + a wallet demo that consumes it) but every hour invested goes straight into the rubric.

**`quote-resolver`** is third *only* because the Uniswap track is more crowded with serious teams shipping trading agents, and "addressable quotes" is conceptually further from what Uniswap's brief literally asks for ("agentic finance"). It is the most original of the three and the one I'd personally most want to build, but for *sponsor-love-per-hour* it ranks below the two ENS plays.

```
FINAL RANKING:
1. subname-receipts
2. agent-forwarder
3. quote-resolver
```
