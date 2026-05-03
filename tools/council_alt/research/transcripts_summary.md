# Workshop Transcript Highlights — Sponsor Intent Signals

*Distilled from 5 ETHGlobal Open Agents sponsor workshops. Source files in `tools/council_alt/research/transcripts/`. Read the raw transcripts for context; this is the actionable extract.*

---

## ⚠ CORRECTION TO DOSSIER: 0G prize numbers were wrong

The original ETHGlobal prize summary said "0G — Track A — $15,000." That was a sum; the actual breakdown per track is **$7,500 per track** (5 prizes: $2,500 / $2,000 / $1,500 / $1,000 / $500). 0G has TWO tracks each at $7.5K, totaling $15K.

**Track A (untargeted by Ledger) is therefore $7,500, not $15,000.** Re-rank the bounty pool accordingly.

The 0G workshop speaker (Gautam, 0G developer) confirmed verbatim: *"first one is 7.5K dollars, second one is also 7.5K dollars. The first is for the framework and tooling, the second is for like the agents you build."*

Updated untargeted pool:

| Bounty | Prize | Note |
|---|---|---|
| 0G Track A — Framework & Tooling | **$7,500** (5 tiers) | corrected |
| Uniswap — Best API Integration | $5,000 (3 tiers) | unchanged |
| ENS — Best AI Agent Integration | $2,500 (3 tiers) | unchanged |
| ENS — Most Creative Use | $2,500 (3 tiers) | unchanged |
| **Total untargeted** | **$17,500** | down from $25K |

The strategic shape changes: ENS-double ($5K) is now ~67% of 0G Track A's prize pool, not 33%. ENS-double becomes more attractive relative to 0G framework competition.

---

## ENS — Greg from ENS Labs (the most actionable signals of the entire workshop set)

The ENS workshop is gold. Read the full transcript at `transcripts/ens.txt`. Greg is hands-on, explicitly invites things to build, and names them.

**Things Greg explicitly invited builders to play with:**

1. **ENSIP-25 — ENS ↔ ERC-8004 verification** — *"this is kind of a new interesting thing that's worth looking at for the hackathon."* Brand new. Closes the verification loop between an ENS name and the ERC-8004 agent registry across chains. Demo at `ENSIP-25.ens.domains`. **An idea that uses ENSIP-25 as a primary mechanism is using exactly what Greg wants used.**

2. **`on.eth` chain-specific naming** — only 2-character ENS name in existence. Pattern: `vitalik.eth@base.on.eth` resolves Vitalik specifically on Base. Greg said: *"on the newer side and there's not great adoption for it now, but it's an interesting thing to think about and therefore a great thing to play around with at a hackathon."* Explicit hackathon invitation.

3. **Durin (`durin.dev`)** — framework for issuing ENS subnames on any EVM chain. Greg said: *"This is a popular one at hackathons. People seem to really like it."* Sponsor signals approval.

4. **Stealth-address agents (Fluidkey pattern)** — every resolution of an ENS name returns a different stealth address. ENS owner can spend across all of them. Greg called Fluidkey *"my favorite hackathon project of all time on ENS"* and it's now a business. Direct match for ENS-Creative track example "privacy features with auto-rotating addresses on each resolution."

5. **Naming smart contracts** — *"underexplored thing that we'd love to see people use at hackathons."*

6. **Decentralized agent frontends** — content hash text record → IPFS → `eth.limo` gateway. Greg has a whole separate talk on this. An agent with its own ENS-resolved decentralized frontend would tick this box.

**The framing line — pin to the wall:**

> *"ENS is used to improve the user experience of existing apps. It is less common to build something specifically on ENS, and more common to use it to improve your existing app."*

Anti-pattern: a project that exists *only* to demo ENS. Right pattern: a project where ENS is the identity layer of something otherwise functional.

**Double-bounty confirmed possible:**

> *"There's a chance that most creative use and best agent use are actually kind of the same thing, in which case there are just six winners overall."*

ENS explicitly tells us a single project can win both tracks ($1,250 + $1,250 = $2,500 max, $500 + $500 = $1,000 min if 3rd in both).

**Subagent hierarchy pattern Greg loves:**

```
project.eth
└── greg.agent.project.eth
    ├── travel.agent.project.eth
    └── trade.agent.project.eth
```

**Text records as decentralized database** — *"where you might think your decentralized application might need a database, it could actually be solved by just storing the data in ENS text records instead."*

---

## Uniswap — Angela at Uniswap Labs DevRel

**Key signal — Uniswap shipped a Claude Code plugin.** Angela live-demoed using `/plugins` → search Uniswap → install **"Uniswap Trading"** plugin → Claude Code agent then swaps via Uniswap API in seconds. There's an existing Uniswap-AI ecosystem on Claude Code. **A project that builds *another* useful Claude Code plugin on top of Uniswap (or extends the existing one) is on Uniswap's exact current direction.**

**Other signals:**

- *"Most of the crypto and fintech products needs to swap. Agents needs to swap. Agents needs to pay."*
- API aggregates V2/V3/V4 + UniswapX + 25+ market makers
- 17 chains, 97% fill rate
- Bounty ask is verbatim: *"crazy simple. We want you to integrate the Uniswap API and all of your agents' ideas."*
- **FEEDBACK.md is real and personally read** — *"if you can give me feedback in that feedback.md file in your repo, dude, I'll be more than happy to work after this hackathon to improve the experience."* Treat as a serious DX critique, not a checkbox.
- New endpoint added in last 6 months: **LP endpoint** (added because hackers requested it). Sponsor is responsive.
- **"Pay with any token"** route via export — agent can pay in any token.
- Sepolia testnet support is real but needs $300+ liquidity in L2 pools, $1000+ mainnet to avoid 404 errors. Practical gotcha.
- Angela personally answers Discord/TG.

**Likely highest-leverage Uniswap angle for a solo dev:** an opinionated agent-payment primitive (subscription bot, savings agent, treasury rebalancer) that uses Uniswap API + Permit2 + the "pay-with-any-token" route, ships as a Claude Code plugin or open-source CLI, with a brutal 5-page FEEDBACK.md.

---

## 0G — Gautam at 0G

**Track A wants:** *"core extensions, improvements, forks, or entirely new open agent frameworks inspired by OpenClaw (or alternatives like ZeroClaw, NullClaw, etc.) and deployed on 0G."* Focus areas:
- Hierarchical planning modules
- Self-evolving frameworks with persistent 0G Storage memory
- Modular agent brain libraries
- No-code / low-code visual builders

**0G stack reality (workshop confirmed):**
- Aristotle mainnet live since September 2025; Galileo testnet for builders
- 400+ ecosystem integrations claimed
- GLM 5.1 went live the day of the workshop
- Available models on testnet: GLM 5, GLM 5.1, GPT OS, 23.6, 30C, 27B
- TS + Go SDKs for Storage; new "uploadOf"/"downloadOf" functions remove old flow-contract requirement
- Storage 80-90% cheaper than AWS S3 with verifiability
- Block time <1s, chain TPS 11K, DA throughput 50 GBPS
- **Sealed inference** in TEE
- **Encryption recently launched** for storage
- KV storage requires running own nodes; large-blob storage doesn't (this is a meaningful builder gotcha)
- **ERC-7857 "agentic IDs"** — re-encryption on transfer via TEE oracle, up to 100 delegated users per token

**Sponsor encouragement:**

> *"Anytime if you need support with any MVP that you've completed and you want us to help get reviewed... please do DM us with the demo link and we can review it as a team and we can give you some feedbacks before you go into the final demos."*

DM the team a demo link before final submission for an early review pass. Free signal.

**`build.0gfoundation.ai`** — post-hackathon ecosystem grant program. Builder-Hub link.

**Why solo dev faces a steep climb in Track A:** 5-prize tier with explicit "framework" framing means competition will include teams with multi-week head starts (the workshop opener said "I know it's already been like a few days since you guys started"). Realistic solo position: 4th–5th = $500–$1,000.

---

## AXL + KeeperHub (relevant only if Ledger council respawns)

Skipping detailed extraction — these are Ledger's targeted bounties. Transcripts are in `transcripts/axl.txt` and `transcripts/keeperhub.txt` if needed for the Ledger council later.

---

## Strategic re-ranking after transcripts

| Combo | Prize ceiling | Sponsor-love after transcripts | Solo viability |
|---|---|---|---|
| **ENS double (creative + AI)** | $2,500 | **Very high** — Greg gave us the exact patterns (ENSIP-25, on.eth, Durin, stealth) | High |
| **Uniswap solo (Claude plugin angle)** | $2,500 | **High** — directly extends Uniswap's existing Claude Code plugin direction | High |
| **0G Track A solo (narrow primitive)** | $1,000 (4th–5th) | Medium — competing against multi-week framework teams | Medium |
| **0G + ENS combo** | $3,500 (3rd 0G + 3rd ENS) | Low–medium — split focus, neither sponsor sees full love | Lower |
| **Uniswap + ENS combo** | $3,500 | Medium — only if ENS is non-cosmetic (`agent.uniswap-bot.eth` with stealth resolution per swap) | Medium |

**Top candidates for THE ONE idea (council should decide):**

1. **An agent identity/discovery primitive built on ENSIP-25 + ERC-8004** that gives any AI agent a verifiable, stealth-addressed ENS identity with capability metadata in text records. Hits both ENS bounties. Solo-buildable. Greg would love it because it uses three things he explicitly named (ENSIP-25, stealth, custom text records).

2. **A Claude Code plugin for autonomous Uniswap operations** (subscription bot / treasury rebalancer / savings agent) with a brutal FEEDBACK.md. Uniswap track only. Builds on top of Uniswap's current Claude Code plugin direction.

3. **A combo: an agent that gets an ENS subname on signup, that subname stores the agent's Uniswap trading rules (text records), and the agent executes via Uniswap API.** Hits ENS-AI + Uniswap, but spreads thin on creativity.

The council should rank these and propose better alternatives.
