# ETHGlobal Open Agents — Untargeted Bounty Dossier

*Compiled 2026-05-02 for the Alt Council. Source: https://ethglobal.com/events/openagents/prizes plus sponsor docs.*

The Ledger team is targeting 0G Track B + Gensyn AXL + KeeperHub. The four bounties below are **NOT targeted by Ledger** — they are the council's solution space. Total available pool: $25,000.

The brief is: ONE strong solo-buildable idea that targets 1–2 of these bounties such that the sponsor would *love* it (not just accept it).

---

## 0G Labs — Best Agent Framework, Tooling & Core Extensions ($15,000)

**5 prizes:** $2,500 / $2,000 / $1,500 / $1,000 / $500

**Verbatim ask:** *"Build the best core extensions, improvements, forks, or entirely new open agent frameworks inspired by OpenClaw (or alternatives like ZeroClaw, NullClaw, etc.) and deployed on 0G."*

**Focus areas they explicitly name:**
- Hierarchical planning modules
- Self-evolving frameworks with persistent 0G Storage memory
- Modular agent brain libraries
- No-code / low-code visual builders

**Qualification gates:**
- Public GitHub with README + setup instructions
- Demo video & live demo (under 3 min)
- Architecture diagram (strongly recommended)
- At least one working example agent built with your framework
- Contract deployment addresses on 0G

**Resources:** `build.0g.ai`, 0G Telegram support

**Reading between lines:**
- "Inspired by OpenClaw" + 5-prize tier → they expect 5+ submissions, prize tiers reward *diversity of frameworks* not just the single best
- Solo dev's path is **3rd–5th place** ($500–$1,500). Beating fully-staffed teams to 1st is unlikely.
- Differentiation lever: a *narrow-but-polished* primitive that obviously fills a real gap. NOT a kitchen-sink framework.

**0G stack reality:**
- Compute (sealed inference), Storage (KV + Log), Chain (Sepolia/Galileo testnets)
- TS + Go SDKs for Storage; CLI for fine-tuning
- No first-party "agent SDK" — agent narrative is light on docs page
- ERC-7857 iNFT spec referenced but reference implementations are early

---

## Uniswap Foundation — Best Uniswap API Integration ($5,000)

**3 prizes:** $2,500 / $1,500 / $1,000

**Verbatim ask:** *"Build the future of agentic finance with Uniswap. Integrate the Uniswap API to give your agent the ability to swap and settle value onchain with transparency, composability, and real execution."*

**Mandatory gate:** Every submission must include a `FEEDBACK.md` in repo root. Quote: *"Tell us everything about your builder experience with the Uniswap API and Developer Platform: what worked, what didn't, bugs you hit, docs gaps, DX friction, missing endpoints, and what you wish existed."* — Uniswap is using this hackathon as DX research. Treating FEEDBACK.md as a checkbox = no win. Treating it as a serious post-mortem with 5+ specific friction points = differentiation.

**APIs available:**
- Trading API (swap integration)
- Routing API (quote/route)
- UniswapX (intent-based fills)
- Permit2 (token approval abstraction)
- Universal Router (protocol-level routing)
- Subgraphs (data querying)
- Free API key after account creation at `developers.uniswap.org/dashboard`

**Newer in 2025–2026:**
- Unichain (L2 protocol, newly documented)
- "Uniswap AI" framework (skill-based agent reference)

**Gaps an agent dev would feel:**
- No WebSocket subscriptions for real-time pool/price events (subgraph polling only)
- UniswapX filler logic = bespoke implementation
- Hook creation requires custom pool logic
- No agent-friendly auth / capability scoping on the API key

**Reading between lines:**
- $5K with 3 prizes = ~$1.5K average → solo dev 2nd-3rd plausible if (a) genuinely uses the API, (b) ships clean DX feedback
- "Agentic finance" framing ≠ "agent that trades." Uniswap wants the agent's value-loop to *include* settling value onchain. Trading-only is fine but boring.

---

## ENS — Best ENS Integration for AI Agents ($2,500)

**3 prizes:** $1,250 / $750 / $500

**Verbatim ask:** *"AI agents need persistent, human-readable identities too. Build a functional project where ENS is the identity mechanism for one or more AI agents. ENS should be doing real work — resolving the agent's address, storing its metadata, gating access, enabling discovery, or coordinating agent-to-agent interaction."*

**Mandatory gate:** *"It should be obvious how ENS improves your agent's identity or discoverability — not just a cosmetic add-on. Demo must be functional (no hard-coded values)."*

The five "real work" verbs ENS lists are the rubric: **resolving / storing metadata / gating access / enabling discovery / coordinating A2A**. Hit at least 2.

---

## ENS — Most Creative Use of ENS ($2,500)

**3 prizes:** $1,250 / $750 / $500

**Verbatim ask:** *"Most people know ENS for name → address lookups. We want to see what else it can do."*

**Three concrete examples ENS gives** (these are huge tells about what they'll reward):
- **Verifiable credentials or zk proofs in text records**
- **Privacy features with auto-rotating addresses on each resolution** (CCIP-Read magic)
- **Subnames as access tokens**
- *"Surprise us!"*

**Mandatory gate:** *"ENS should clearly improve the product. Demo must be functional (no hard-coded values)."*

---

## ENS primitives the council should know exist

- **Text records (ENSIP-5)** — arbitrary key/value on a name. Standard keys: avatar, description, com.twitter, com.github, url, header. Any custom key allowed if prefix-namespaced (`org.x`, `ai.x`).
- **CCIP-Read (ENSIP-10)** — off-chain resolver: client asks resolver → resolver returns redirect URL → client fetches off-chain data → on-chain verifier accepts. Enables auto-rotating addresses, dynamic responses, gasless reads.
- **Wildcard resolution + NameWrapper** — issue subnames cheaply or programmatically.
- **Universal Resolver** — single entry point for resolution across L1 + L2.
- **L2 ENS / Durin / Namestone** — namespace issuance on L2; Namestone is a hosted offchain subname API.
- **ENSv2** — current focus on L2 scaling.
- **llms-full.txt** — ENS publishes a docs file specifically for LLMs at `docs.ens.domains/llms-full.txt`. Multiple ENS-MCP servers exist already.

The "Most Creative" examples ENS gave are not random — they're precisely the primitives ENS has been building. **A project that uses CCIP-Read + custom resolver + dynamic text records is using ENS the way ENS wants to be used in 2026.** Cosmetic-only ENS use will lose. Static text record key-value will be middle of the pack.

---

## Strategic combinations (DO NOT pre-decide; council should rank)

| Combo | Bounty pool | Solo viability | Sponsor-love ceiling |
|---|---|---|---|
| ENS Track 1 + ENS Track 2 (both ENS) | $5,000 | High — single sponsor, shared infra | Very high if uses CCIP-Read / zk-records / subname-tokens |
| Uniswap solo | $5,000 (3rd: $1K) | High — small focused agent | Medium — feedback quality is differentiator |
| 0G Track A solo | $15,000 (5th: $500 / 3rd: $1.5K) | Medium — framework competition | Medium — narrow polished primitive |
| 0G + ENS combo | $17,500 | Lower — two domains to nail | Variable — if ENS is identity FOR a 0G agent framework |
| Uniswap + ENS | $7,500 | Medium | Low unless ENS angle is non-cosmetic |

**Constraint reminder for the council:** SOLO DEV. ALT PATH. Polish > complexity. 1–2 bounties MAX. The sponsor must *love* it — meaning a sponsor engineer would PR it into their own ecosystem repos if asked.
