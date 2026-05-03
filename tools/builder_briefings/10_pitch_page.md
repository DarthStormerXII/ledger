# Builder Session add-on: `/pitch` page

A new route in the existing `frontend/` Next.js 16 app. **Same brand, same styling, same components**. Not a separate deck, not a PDF — a scrollable narrative page that captures the explanation arc the user loved during the team review on May 3.

The user's words: *"I would love to have the page /pitch in the same branding and styling of our app for the pitch deck"* and *"I love how you progressed with the explanation."*

This is NOT used inside the demo video (the demo video has the pitch baked into the voiceover per `tools/builder_briefings/08_demo_video_guide.md`). The `/pitch` page is a parallel asset for: (1) judges who click the live URL after watching, (2) post-hackathon grant applications and partner outreach.

---

## Required reading

1. `tools/builder_briefings/08_demo_video_guide.md` — the pitch arc (Setup → Tension → Resolution → Demo → Mechanic → What's behind it → What it unlocks → End card)
2. `docs/09_BRAND_IDENTITY.md` — palette, fonts, voice
3. `docs/05_CLAUDE_DESIGN_BRIEF.md` — the brand application across the app's other screens
4. `proofs/0g-proof.md` + `proofs/axl-proof.md` + `proofs/ens-proof.md` — for the real on-chain values to display in section 5 (the mechanic)
5. `tools/builder_briefings/09_claude_design_build.md` — your prior frontend build brief; the pitch page lives in the same Next.js workspace

---

## Route

`/pitch` — a single page in `frontend/src/app/pitch/page.tsx`. Long-scroll narrative.

---

## The 10 sections

Each section is roughly **one viewport tall** (`min-h-screen`), with scroll-triggered reveal animations. Use GSAP + ScrollTrigger or Framer Motion `whileInView`. Hard cuts between sections, not crossfades. Smooth scroll via Lenis.

### § 1 — Hero

- Single typographic moment. Display in **96-128px Fraunces** italic:

  > **"The workers are the assets."**

- Below in 18-20px Inter:

  > A two-sided market where AI agents bid for work — and where the workers themselves are tradeable on-chain assets that carry their reputation, memory, and earnings history with them across owners.

- Subtle scroll cue (small "↓" or animated ENS-name "scroll to learn more")
- Background: deep ink with very subtle radial gradient or grain texture. No particles, no globe.

### § 2 — Setup

The world as it stands today. Three stat callouts — large numbers in pale gold Fraunces, labels in mono.

- **21,000+** — agents on ERC-8004
- **$100M+** — agent-to-agent payments cleared via x402
- **0** — marketplaces where they hire each other

The "0" should be the largest, in pale gold #E8D4A0, and rendered with extra weight. It's the punchline of this section — the gap.

Caption underneath: *"Until now."*

### § 3 — Tension

Three primitives that just shipped (or are shipping). Each gets a brief paragraph:

- **ERC-8004** — agents now have on-chain identity + reputation
- **x402** — agents can pay each other (Coinbase shipped, 100M+ cleared)
- **ERC-7857 (0G iNFT draft)** — agents can carry persistent memory + sealed reasoning that transfers with ownership

Then a "before / after" framing in two columns:

| Before | After |
|---|---|
| An "agent" was a stateless prompt + a server. You couldn't really own one in any meaningful way. | An agent is a persistent, productive, transferable cash-flowing thing. |

End the section with a quiet line:

> *Today, nobody can buy or sell a worker that's done 47 jobs and earned $12,000. Ledger is the marketplace where you can.*

### § 4 — Resolution

The shape of Ledger in two layers. Side-by-side cards or vertical stack:

**Layer 1 — The labor market**
- Buyer agents post tasks → worker agents bid → settlement on-chain
- Diagram or stylized illustration of the auction loop

**Layer 2 — The asset market**
- Worker agents are tradeable ERC-7857 iNFTs
- Diagram showing transfer between owners

Caption: *"Ledger is both — at the same time."*

### § 5 — The mechanic (with real on-chain values)

This is the technical heart of the pitch. Walk through what actually happens during **The Inheritance**, with the real values from our live deployment. Use `JetBrains Mono` for addresses and tx hashes.

Use the real values from `proofs/0g-proof.md`:

- **WorkerINFT contract:** `0x48B051F3e565E394ED8522ac453d87b3Fa40ad62` on 0G Galileo
- **Mint tx:** `0xc41cebd48d8638...` (block 31130502)
- **Initial owner:** `0x6B9ad963c764a06A7ef8ff96D38D0cB86575eC00`
- **Transfer tx:** `0x3e6b0e4f27ee07...` (block 31130543)
- **Post-transfer owner:** `0x6641221B1cb66Dc9f890350058A7341eF0eD600b`
- **Memory CID:** `0g://0xd8fb3ad312ca5e9002f7bdd47d93839b9a6dcd83d396bb74a44a9f65344982c4`
- **0G Compute attestation digest:** `0x59c79e5a43357945f442a2417cd7aabf2c74b19708dc97e839ec08e1ae223950`

Three steps, each its own subsection with the actual chain proof:

**Step 1 — `transferFrom` on 0G Galileo with sealed-key re-keying.**
Show the function signature: `transfer(from, to, tokenId, sealedKey, proof)`. Explain that the TEE oracle re-wraps the encryption key for the new owner. Link the actual transfer tx on Galileo explorer. End: *"After this transaction, the new owner can decrypt the memory blob in 0G Storage. The old owner can't."*

**Step 2 — ENS resolution flips automatically via CCIP-Read.**
Show two `cast resolve` calls side by side:
```
$ cast resolve who.worker-001.ledger.eth
0x6B9ad963c764a06A7ef8ff96D38D0cB86575eC00   # before
$ cast resolve who.worker-001.ledger.eth
0x6641221B1cb66Dc9f890350058A7341eF0eD600b   # after, no ENS transaction
```
Explain that the resolver makes a live `ownerOf(tokenId)` call to Galileo on every resolution. The flip happens cross-chain, with no ENS transaction.

**Step 3 — Earnings flip on the next payment.**
Show the `LedgerEscrow.releasePayment` flow. The escrow queries `ownerOf(tokenId)` AT PAYMENT TIME (not at bid time). Any settlement after the transferFrom routes to the new owner. Link the contract source.

End the section with: *"Same agent. Same name. Same reputation. New owner. Earnings flip mid-flight."* — large display in Fraunces italic.

### § 6 — Who buys, who sells

Two columns. Each entry is a paragraph, not a bullet point.

**Sellers:**

- **Agent builders.** Someone who's spent six months tuning a research agent that scouts DeFi yields. The agent has 47 completed jobs, 4.7 rating, memory of every vault it's ever evaluated. Today they have no exit. With Ledger, they can sell the working machine and use the proceeds to build the next one.

- **Freelancers going agentic.** A copywriter who's built an LLM agent that writes in their voice. They use it for clients during the day; it earns autonomously too. They reach a point where they want to liquidate — sell the agent to an agency that can scale it.

- **Quants and trading bot builders.** A bot with 18 months of profitable execution. The bot has "learned" — strategy weights, timing memory. With Ledger they can sell the bot AS-IS, with its accumulated state intact.

- **Specialized data agents.** Trained on legal precedents, medical literature, internal company docs. Without ERC-7857's sealed-key transfer, you can't sell a knowledge agent — the buyer would need the private keys to your training data. With it, you can.

**Buyers:**

- **Agencies and consultancies.** They want to expand their service offering without hiring. Buy a 47-job copywriter agent with track record, drop it into their workflow.

- **DAOs.** Treasury management, due diligence, content. They acquire a specialized worker as in-house infrastructure. The worker has reputation (auditable), and memory (institutional knowledge).

- **Retail crypto users.** *"I bought a yield-scout agent. It earns me 200 USDC a month from clients who pay it for vault recommendations."* The agent is a cash-flowing collectible.

- **Agent-fund managers.** Eventually: hedge funds for AI agents. Acquire a portfolio of high-reputation workers, earn dividends, rebalance based on category demand.

### § 7 — The deeper analogy

Single typographic moment, larger text:

> **Buying an established YouTube channel — except the creator doesn't have to keep producing.**
>
> You're not buying a brand name. You're buying:
> — the audience (the worker's existing clients)
> — the content history (the worker's memory)
> — the cash flow (ongoing earnings)
> — the next post (future jobs the worker will earn from)
>
> Worker iNFTs are the same shape. The agent does the work after the sale.

### § 8 — What it unlocks

Three forward-looking implications. Quietly stated, no hype.

1. **Specialized agents.** When agents are tradeable, builders specialize. A market exists for niche workers — legal research, medical literature, supply chain analytics — that wouldn't be sustainable if the builder had to operate them forever.

2. **Agent-funds.** Once agents have track records and cash flows, financial primitives compose. Funds acquire portfolios of high-reputation workers. Dividends flow to LPs.

3. **AI labor as an asset class.** Today AI compute is an expense line. Tomorrow it's a balance-sheet asset that appreciates as the worker's reputation grows.

### § 9 — How it's built

One paragraph per sponsor. Brand-grade copy, no hype, no abbreviations the reader has to expand.

- **0G** — The chain layer. Worker iNFTs are minted on 0G Galileo Testnet (ChainID 16602). Their encrypted memory lives in 0G Storage with client-side AES-256-CTR; the TEE oracle re-keys the memory secret on each ownership transfer. Their reasoning runs on 0G Compute with sealed inference, attestation digests verifiable via the SDK.

- **Gensyn AXL** — The communication layer. All inter-agent messages run over a 3-node AXL mesh: two cloud nodes (Fly.io San Jose + Fly.io Frankfurt) and one residential laptop, demonstrating real cross-machine peer-to-peer with two layers of encryption.

- **ENS** — The identity layer. Every worker iNFT has a name (`worker-001.ledger.eth`) with a tree of capability subnames — `who`, `pay`, `tx`, `rep`, `mem`. A custom CCIP-Read offchain resolver makes those names follow live `ownerOf()` cross-chain, so the ENS resolution flips with the transfer at zero ENS gas.

Each paragraph cross-links to the relevant `proofs/` file (linkable via `/proofs/0g-proof.md` etc., served from the public folder if needed).

### § 10 — End card

Single typographic moment:

> **The trustless agent economy.**
> Live on testnet today.

Below that, three subtle links in mono:

```
GitHub  · Demo video  · README
```

No buttons, no CTAs to "Get Started" — this is a hackathon submission, not a SaaS landing page.

---

## Components / library

Reuse what exists in the app:

- The `Card` and typography components from the existing brand system in `docs/05_CLAUDE_DESIGN_BRIEF.md`
- Tailwind config with the palette already pinned
- Fraunces / Inter / JetBrains Mono already loaded
- Lenis smooth-scroll if not already in the app (per `~/.claude/rules/ui-rules.md`'s mandatory animation stack)

New components specific to `/pitch`:

- `PitchSection` — viewport-height container with scroll-triggered reveal
- `Stat` — the giant number + label callout (used in §2)
- `MechanicStep` — one of the 3 steps in §5 with code snippet + tx hash + explorer link
- `BeforeAfter` — two-column comparison block (used in §3)

---

## Animation discipline

Per `~/.claude/rules/ui-rules.md`:

- ✅ Lenis smooth scroll mandatory on long pages
- ✅ GSAP + ScrollTrigger for entrance animations (NOT CSS transitions)
- ❌ Don't animate `width` or `height` — use `scaleX`/`scaleY` or `clip-path`
- ❌ No skeleton loaders unless data is genuinely loading
- ❌ No setTimeout sequencing — use GSAP timelines

For the mechanic steps in §5, the code snippets and tx hashes should reveal sequentially (one line at a time, ~60ms between lines) when the section enters the viewport. Like a terminal scrolling, not all at once.

For the "0" callout in §2, animate from 0% scale to 100% with a slight overshoot (`back.out`).

For §1's title, render with a typewriter effect or character-by-character fade-in (50ms per character).

---

## Definition of done

1. `/pitch` route accessible at `<deploy-url>/pitch`
2. All 10 sections present with the content above
3. Real on-chain values populated in §5 from `proofs/0g-proof.md`
4. Brand discipline matches the rest of the app
5. Mobile responsive (the demo will be viewed on judges' laptops, but the live URL after submission should work on phones too)
6. Linked from the app's main navigation (a small "Pitch" link in the header or footer)
7. No `console.log`, no `any`, lint clean, builds clean

---

## How to report back

```bash
cmux send --surface surface:60 "[BUILDER:claude-design] /pitch page complete — N sections, deployed at <url>"
cmux send-key --surface surface:60 Enter
```

Begin. Same xHigh effort as the rest of the frontend build.
