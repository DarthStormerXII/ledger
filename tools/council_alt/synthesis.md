# THE ONE — Alt Council Stage 3 Synthesis

*Chairman: Opus 4.7. Date: 2026-05-02. Inputs: 3 Stage 1 idea sets + 3 Stage 2 cross-critiques (this session) + parallel-session aggregate ranking from `ba135abc-e415-49e5-84bd-23249b81f9e8` + 5 sponsor workshop transcripts + KeeperHub-uncertainty signal from main Ledger team.*

---

## TL;DR

**Build a single CCIP-Read off-chain resolver that turns any agent's ENS name into its full control plane — capabilities, rotating payment addresses, and a browseable activity log, all as subnames produced by one resolver, zero on-chain writes during agent operation.**

- **Bounty:** ENS dual track — Best ENS Integration for AI Agents ($2,500) + Most Creative Use of ENS ($2,500). **$5,000 total**.
- **Build cost:** 45–55 solo hours. One long week.
- **Working name:** *Capability Subname Resolver* (or pick one — "agentname", "ensagentd", "aliasd"). I'll call it **CSR** below.
- **Sponsor reaction target:** Greg from ENS Labs screenshots it and Nick Johnson tweets it.

---

## Why this won

Three council members proposed nine ideas. The tightest convergence in the cross-critique round — confirmed by the parallel-session aggregate — was on three CCIP-Read primitives that are mechanically the same scaffold:

| Idea | Author | What it adds |
|---|---|---|
| Capability Subnames for Agents | Whisperer (#1) | The control-plane framing; capabilities-as-subnames |
| `subname-receipts` | Inventor (#1) | The activity-log dimension; receipts as subnames |
| `agent-forwarder` | Inventor (#2) | The auto-rotating payment address |

All three use the same machinery: **ENSIP-10 CCIP-Read off-chain resolver + wildcard resolution + namespaced text records.** Build the resolver once, you get all three for the price of one.

The 9-idea aggregate ranking from cross-critique put `quote-resolver` and `agent-forwarder` tied at #1 (avg rank 2.67), Capability Subnames at #3 (3.00), and `subname-receipts` at #4 (3.67). The top 4 are all CCIP-Read primitives. The synthesis isn't picking one — it's recognizing that the council is voting for **the resolver**, and the resolver should expose all three faces simultaneously.

This is the "C as umbrella with B and H as namespaces inside it" that the Inventor proposed in cross-critique, made concrete.

---

## The shape

A single agent's namespace under this resolver:

```
alice.openagents.eth                          ← primary identity (avatar, description)
├── caps.alice.openagents.eth                 ← capability registry (text records list every capability)
├── swap.alice.openagents.eth                 ← capability: spec + ephemeral signing address (60s rotation)
├── read.alice.openagents.eth                 ← capability: spec + ephemeral signing address
├── pay.alice.openagents.eth                  ← rotating payment address (HD-derived, fresh each lookup)
├── tx-2026-05-02-001.alice.openagents.eth    ← activity receipt: chain, hash, intent, outcome, signer
├── latest.alice.openagents.eth               ← always resolves to most recent receipt
└── history.alice.openagents.eth              ← list of recent tx subnames
```

**ALL of these are produced by ONE off-chain CCIP-Read resolver.** No subnames are wrapped on-chain. They exist purely as resolver responses — the way ENSIP-10 was designed to be used. Zero on-chain writes during agent operation.

---

## Why ENS will love this specifically

Greg from ENS Labs ran their workshop. He explicitly invited builders to play with five things. This project hits all five:

| Greg's invitation | How CSR uses it |
|---|---|
| "ENSIP-25 — verify agents against ERC-8004" | `caps.alice.eth` text record carries the ENSIP-25 attestation closing the verification loop |
| "Stealth-address agents (Fluidkey pattern) — my favorite hackathon project of all time" | `pay.alice.eth` is exactly Fluidkey for agents — fresh HD-derived address every resolution |
| "Subname hierarchies for agents (`travel.agent.workman.eth`)" | Capabilities are subnames — `swap.alice.eth`, `read.alice.eth` |
| "Text records as a database, not just decoration" | Receipts, capability specs, and attestations are all text records |
| "Naming smart contracts — underexplored" | The capability registry contract gets its own ENS name (`registry.openagents.eth`) |

ENS's own ENS-Creative brief listed three concrete examples ("Surprise us!"). CSR uses **all three at once, none decoratively:**

1. ✅ **Auto-rotating addresses on each resolution** — `pay.alice.eth` rotates per resolution (HD derivation off the agent's master pubkey)
2. ✅ **Subnames as access tokens** — `swap.alice.eth` returns an ephemeral signing address valid 60 seconds; subname IS the temporary capability bearer
3. ✅ **zk proofs / verifiable credentials in text records** — capability text records carry signed (or zk-attested) trust claims

ENS-AI's brief lists five "real work" verbs. CSR hits all five:

- ✅ Resolving address → `pay.alice.eth` returns the agent's address
- ✅ Storing metadata → `caps.alice.eth` text records list capabilities and specs
- ✅ Gating access → `swap.alice.eth`'s ephemeral address is the only key authorized for the next 60s
- ✅ Enabling discovery → `agents.openagents.eth` lists all registered agents
- ✅ Coordinating A2A → two agents transact via ENS resolutions alone, no shared backend

This is **the demo Greg wants to see.** The line in his workshop: *"ENS is used to improve the user experience of existing apps. It is less common to build something specifically on ENS."* CSR isn't a project specifically on ENS — it's the missing primitive that lets every agent project be radically improved by ENS.

---

## The 90-second demo

```
0:00  ENS app open. Type "alice.openagents.eth"
0:03  Profile renders: avatar, description, capability list (3 caps)
0:08  Type "swap.alice.openagents.eth"
0:12  Resolves to ephemeral address 0x1f3a... + text records (spec, scope, attestation)
0:18  Send 100 USDC to that address from a real wallet → settlement lands
0:25  Refresh "swap.alice.openagents.eth" — address is now 0x9c44...
       (5-second "oh" moment — addresses rotated)
0:32  Type "latest.alice.openagents.eth"
0:36  Receipt: "Swapped 100 USDC → 0.027 ETH on Uniswap, intent: rebalance,
       signer: marty.eth, ✓ verified"
0:44  Type "tx-2026-05-02-001.alice.openagents.eth"
0:48  Same receipt — addressable forever, deterministic
       (5-second "oh" — agent history as namespace tree)
0:55  Split screen: two agents bootstrap a paid task using only ENS resolutions
       Agent A: "I need a swap" → resolves agents.openagents.eth, finds Bob has cap
            → resolves swap.bob.openagents.eth, gets ephemeral addr
            → submits tx → settlement
            → resolves latest.bob.openagents.eth, sees receipt
1:25  End card: "ENS as the agent control plane. No backend. No registry.
       Just resolution."
```

Two distinct "oh" moments, both readable in <2 seconds without reading captions.

---

## Build budget — 1 long week, solo

| Chunk | Hours | Notes |
|---|---:|---|
| Repo + scaffolding | 2 | TS + Next.js + viem |
| **CCIP-Read off-chain resolver** | **16** | The wall. Signed responses, wildcard, ENSIP-10 compliance. ENS publishes scaffold code; still 16h to get signing right and pass client compatibility (ethers, viem, ENS app). This is the moat. |
| On-chain resolver + verifier contract | 4 | Verifies the off-chain server's sig |
| Capability registry contract + schema | 3 | One mapping; capability spec is JSON in text record |
| HD derivation for rotating addresses | 4 | `ethers.HDNodeWallet`; off-chain server holds master pubkey |
| Receipt schema + index storage | 3 | KV map subname → receipt JSON |
| 0G Storage integration (receipts backing store) | 3 | Optional but adds cross-bounty 0G angle if useful |
| Demo agent that exercises all caps | 5 | One agent that swaps via Uniswap, generates receipts |
| ENS-app demo recording + cuts | 4 | The two "oh" moments need to land |
| README + architecture diagram | 3 | One-page README with copy-paste integration snippet |
| Optional: zk attestation (Groth16 mock) | 4 | Cut if hour 30 looks bad; replace with master-signed attestation |
| **Total realistic** | **47** | |
| **With zk** | **51** | |

**Pragmatist's discipline:** if hour 30 looks bad, cut the zk attestation, drop receipts to "last 10" instead of full history, and ship. The capability + rotation + receipt triad is still intact. Bounty hits both ENS tracks with or without zk.

**What I am NOT building** (pragmatist veto):
- ❌ A full agent runtime / framework (that's 0G Track A's bait, not relevant here)
- ❌ Custom NameWrapper subname issuance (CCIP-Read makes it unnecessary)
- ❌ Live token execution beyond the demo agent's own swap
- ❌ Multi-chain CCIP-Read (single-chain is enough for ENS bounty)
- ❌ A pretty marketing site (README + 90s demo is the deliverable)

---

## Why competing builders won't ship this

The default ENS submission this hackathon will be: register `mybot.eth`, write `description` + `avatar` text records, call it ENS-integrated. That'll be 60% of submissions.

The next 30% will add a static text-record-based registry ("agents.eth has a `agents` text record with a JSON list").

**Almost nobody will touch CCIP-Read off-chain resolvers** because:
- They require running a small off-chain HTTP service that signs redirected responses correctly
- ENSIP-10 wildcard + signed offchain answer flow is real ~16h work before anything looks polished
- Most builders default to "I'll just write text records" and call it done

A solo dev who clears the CCIP-Read wall once gets capabilities, rotating addresses, AND receipts for the price of one resolver. That asymmetry is the entire moat.

The Inventor put it cleanly: *"ENS shipped CCIP-Read for this and the docs literally use it as an example. Building it cleanly — with a real HD scheme, a real verifier, a real demo — is the exact work the ENS team would PR into their own examples repo."*

---

## On the KeeperHub uncertainty (Ledger main project)

The user flagged that the Ledger team has second thoughts on KeeperHub after the parallel-session research surfaced:

- KeeperHub testnet support is only confirmed on Ethereum Sepolia (not Base Sepolia, not 0G)
- "Reroute via private mempool" is mainnet marketing — there is no private builder relay on Sepolia/Base Sepolia
- KeeperHub is EVM-only; doesn't touch the 0G stack at all
- The "every Ledger tx flows through KeeperHub" architectural claim collapses to "every Base Sepolia tx flows through KeeperHub" — assuming Base Sepolia is even supported

**This does not change the alt-project answer.** ENS dual is still the strongest play with or without Ledger keeping KeeperHub.

But it raises a question the user should answer: **does Ledger drop KeeperHub and pick up ENS as its third sponsor slot, OR does the alt project remain a separate ENS submission?**

Three configurations:

| Config | Ledger | Alt | Notes |
|---|---|---|---|
| **A. Status quo** | 0G + Gensyn + KeeperHub | ENS dual via CSR | Two clean submissions; ENS bounty fully on the alt |
| **B. Ledger absorbs ENS** | 0G + Gensyn + ENS via CSR | (no alt) | Save the ENS slot for Ledger; CSR becomes Ledger's ENS angle. Loses the alt project entirely. |
| **C. Both ship** | 0G + Gensyn + ENS (light integration) | ENS dual via CSR | Risky — same sponsor on two submissions could be flagged as double-dipping. **Avoid this one.** |

**My recommendation:** **Config A** unless the Ledger team has bandwidth for Config B. The CSR primitive is sized for one solo dev's long week; cramming it into the main Ledger team's already-saturated build doesn't gain anything. Two submissions targeting non-overlapping bounty pools maximize total expected prize money. The alt being **fully separate from Ledger** is also cleaner for ETHGlobal's submission rules.

If you go Config B and Ledger picks up ENS via CSR, the trade-off is: one less submission entered, but Ledger gains a third sponsor it can show off. Cash math: Config A's ENS-dual ceiling is $2,500 (1st place both tracks), Config B's gain is the same $2,500 but inside Ledger which already has finalist potential. Config A is more cash-EV-protective if Ledger is shaky on KeeperHub anyway — alt project becomes the safety net.

---

## Sponsor-judge prompts (script for Discord/office hours)

**ENS office hours / project review (Greg, ENS Labs):**

> "Built a CCIP-Read off-chain resolver that exposes any agent's full control plane as ENS subnames — capabilities, rotating payment addresses (Fluidkey-style), and an addressable activity log — all wildcard-resolved through one resolver, zero on-chain writes during agent operation. Demo at `<URL>`, repo at `<URL>`. Hits all three of your Track 2 examples. Would love a sanity check before final submission — particularly on the resolver's ENSIP-10 compliance and whether the ENSIP-25 / 8004 verification loop is wired the way you'd expect."

The "sanity check on ENSIP-25 wiring" is the lure — Greg explicitly named ENSIP-25 as the new thing he wants people to play with, so a question framed around it gets engagement and signals taste.

---

## What goes in the repo

```
csr/
├── README.md                        ← 90s demo, 4-line integration snippet, architecture diagram
├── packages/
│   ├── resolver-server/             ← off-chain CCIP-Read resolver (Node.js)
│   ├── resolver-contract/           ← on-chain verifier (Solidity)
│   ├── csr-client/                  ← thin TS client (publish to npm)
│   └── demo-agent/                  ← reference agent that exercises all caps
├── docs/
│   ├── ensip-10-flow.md             ← how the off-chain flow signs and is verified
│   ├── ensip-25-attestation.md      ← how the 8004 verification loop closes
│   └── why-no-zk-yet.md             ← (if zk gets cut) what the v1 attestation actually proves
└── demo.mp4                         ← 90s recording
```

ENS sponsor judges grep: `ENSIP-10`, `wildcard`, `CCIP-Read`, `ENSIP-5`, `ENSIP-25`, `subname`, `text record`, `stealth`, `Durin` (mention it as alternative), `Fluidkey` (in inspirations).

---

## Bottom line

The strongest single solo idea for the alt path is **CSR — a single CCIP-Read resolver that exposes capabilities, rotating addresses, and an activity log for any agent.** Targets ENS dual = $5,000. Build cost ~50h. Hits every primitive Greg explicitly invited builders to play with.

It's not the highest theoretical pool ($10K with Whisperer's B+E synthesis would be higher, but that synthesis was geometrically inflated — see parallel session). It's not the biggest absolute bounty (0G Track A is $7.5K but solo loses there). It's the highest **probability × sponsor-love × shippability** product, by a margin.

If KeeperHub gets dropped from Ledger, this is also the natural ENS pickup — but keep it as a separate submission unless the team explicitly wants to bring CSR inside Ledger.
