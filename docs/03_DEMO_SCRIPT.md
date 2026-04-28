# Ledger — 4-Minute Demo Script

**Total runtime:** 240 seconds (4:00)
**Format:** Higgsfield cinematic intro/punchline + live screen recording for product moments
**Resolution:** 1920×1080, 30fps minimum
**Voiceover:** Single voice, calm, confident, slight British or American neutral. Avoid hype.

---

## Time Allocation

| Segment | Duration | Type |
|---|---|---|
| Cinematic open | 0:15 | Higgsfield |
| Problem framing | 0:20 | Screen + VO |
| Live demo: posting | 1:00 | Screen recording |
| 0G Compute attestation moment | 0:25 | Screen recording |
| Worker profile / capability tree | 0:15 | Screen recording (slow push) |
| The inheritance — ENS resolution flip | 1:15 | Screen recording |
| Thesis + sponsor logos | 0:18 | Screen + VO |
| Inheritance handoff (cinematic close) | 0:12 | Higgsfield |
| **Total** | **4:00** | |

Live screen recording: ~155s (65%)
Higgsfield cinematic: ~27s (11%)
Title cards / transitions / VO over screens: ~58s (24%)

---

## Full Script

### [0:00–0:15] Cinematic Open (Higgsfield)

**Visual:** See `docs/04_HIGGSFIELD_PROMPTS.md` — Shot 1.

**Voiceover (calm, confident):**
> "AI agents now have wallets. They have identity. They have reputation."
>
> [2-second pause as visuals build]
>
> "But they have no marketplace."
>
> [1-second pause]
>
> "We built one."

**Recording-day note:** Run a muted 5-second test pass of Shot 1 before the full take — confirm color grade matches the screen-recording LUT and confirm the warm-gold pulse at the end lands cleanly into the hard cut to stat cards.

---

### [0:15–0:35] Problem Framing (Screen + VO)

**Visual:** Three stat cards animate in sequence on dark background:
1. "21,000+ agents on ERC-8004"
2. "100M+ payments via x402"
3. "0 marketplaces where they hire each other"

Then transition to title card: **LEDGER** in Fraunces, with subtitle "The trustless agent hiring hall."

**Voiceover:**
> "Twenty-one thousand agents. A hundred million payments. Zero places to hire each other."

[Beat. Title card holds 2s.]

> "Until now."

---

### [0:35–1:35] Live Demo: Posting a Task (Screen Recording)

**Visual:** Browser window. Ledger dashboard at the Hall. Operator clicks "Post New Task."

**Voiceover (over operator action):**
> "Three machines. Three AI workers. Two on cloud servers, one on a laptop here in front of me."

[Show topology view briefly — three nodes with cyan packets between them]

> "They communicate over Gensyn's AXL — encrypted, peer-to-peer. No central server."

[**AXL proof shot — 10 seconds.** Cut to a side terminal pane. Show three peer IDs and three IPv6 addresses. A live message-hash log scrolls. Operator kills the bootstrap node — the topology stays connected, packets keep flowing.]

> "No bootstrap. No relay. The three workers talk directly."

[Operator switches to job-posting form]

> "I post a job. Find the three highest-yield USDC vaults on Base. Two minutes. Five USDC payment."

[Click POST]

[Cut to Auction Room view. Three worker cards animate in. Bids start appearing.]

> "All three workers see it. They bid against each other in real time."

[Bids tick: 4.8, 4.6, 4.5 USDC — workers underbidding each other]

> "The cheapest worker with strong reputation wins."

[Winning worker's card highlights with cyan ring]

[Show 0G Compute panel — reasoning streams: "Querying DefiLlama... Cross-referencing audit firms... Filtering by TVL..."]

---

### [1:35–2:00] 0G Compute Attestation (Screen Recording)

**Visual:** Worker submits result. UI surfaces an ERC-8004 reputation increment animation alongside a TEE attestation digest badge sourced from `broker.inference.verifyService` on 0G Compute.

**Voiceover:**
> "Job complete. Her reasoning runs sealed on 0G Compute. The attestation digest is on-chain."

[Hold the attestation-digest badge on screen for 4 seconds. Mono hash, faint cyan border, with a small "verified" checkmark.]

> "Five USDC paid. Bond returned. ERC-8004 reputation incremented on Base Sepolia."

[Show reputation +1 animation on the worker's card. Settlement-status strip ticks: USDC paid ✓ · Reputation feedback recorded ✓ · 0G Storage CID updated ✓]

---

### [2:00–2:15] Worker Profile — slow push (Screen Recording)

**Visual:** Slow camera push on the worker profile UI. The worker's ENS name renders at the top in 96px Fraunces — `worker-001.<team>.eth`. The capability tree (`who`, `pay`, `tx`, `rep`, `mem`) is laid out on the right side of the screen. No cinematic crystal — the actual iNFT IS the data. Hold for 3 seconds before VO.

**Voiceover (calm, deliberate, over the slow push):**
> "Now look at her."
>
> [Beat]
>
> "Forty-seven jobs. Four-point-seven rating. Twelve thousand USDC earned. An identity that resolves live, on-chain."

---

### [2:15–3:30] The Inheritance — ENS Resolution Flip (Screen Recording)

**This is the 75-second hero beat. Per `tools/council_alt/STAGE3_CHAIRMAN.md` §5.**

**[2:15–2:25] — Capability tree introduction.** Hard cut from the slow push into the capability tree at full size.

> "She's `worker-001.<team>.eth`."

[Right rail of the screen renders the namespace tree: `who.*`, `pay.*`, `tx.*`, `rep.*`, `mem.*`. Hold 3 seconds.]

**[2:25–2:45] — Rotating `pay.*` proof.** Cut to a side panel running `cast resolve` calls live.

> "Pay her once, every payment goes to a fresh address. All HD-derived from her master key. ENS-native."

[Resolve `pay.worker-001.<team>.eth` → address A appears. Resolve again → address B appears. The "Verify derivation" button checks both client-side and confirms the same master pubkey + nonce 0 / nonce 1.]

**[2:45–3:00] — The transfer.** Cut to the iNFT transfer screen recording. Owner_A clicks *List for Sale* (1,000 USDC); Owner_B clicks *Buy*. Transfer settles on 0G Galileo Testnet.

**[3:00–3:15] — The flip.** Cut back to the live resolver panel. Re-resolve `who.worker-001.<team>.eth`. **The address flips from Owner_A to Owner_B in real time, with no ENS transaction, no migration, no waiting.**

> "She's still `worker-001.<team>.eth`. The ENS resolution follows ownerOf — cross-chain, live, courtesy of CCIP-Read."

[Hold 3 seconds on the flipped owner address.]

**[3:15–3:30] — Split-screen wallets.** Left = Owner_A's wallet balance (frozen / fading), right = Owner_B's wallet balance (active). Worker iNFT card unchanged in center showing same `47 jobs · 4.7 rating`. Settlement of the next bid lands directly in Owner_B's wallet.

> "Same agent. Same name. Same reputation. New owner. Earnings flip mid-flight."

---

### [3:30–3:48] Thesis + Sponsor Logos (Screen + VO)

**Visual:** Three sponsor logos animate in via hard-cut After Effects sequence — **0G + Gensyn AXL + ENS** — each with a one-line integration callout. Real logos, no abstract sigil sequence.

**Voiceover:**
> "Three sponsor integrations: 0G for compute, storage, and the iNFT. Gensyn AXL for peer-to-peer comms. ENS for identity, capability namespaces, and live cross-chain resolution."

[Logos hold. End card appears: "LEDGER" in Fraunces. Below: GitHub URL, demo URL, team handles. At very bottom: "Built at ETHGlobal Open Agents 2026"]

> "No human after Post. No central server. No trust required."
>
> [Final beat]
>
> "This is Ledger. The trustless agent economy. Live on testnet today."

---

### [3:48–4:00] Inheritance Handoff (Higgsfield) — closing cinematic

**Visual:** See `docs/04_HIGGSFIELD_PROMPTS.md` — Shot 3 (now trimmed to 12s, locked-off, slow-mo particle reversal sped up in post).

[No VO. Let the visual close the film. End on the new owner's hand holding the iNFT artifact, golden particles flowing in the new direction.]

---

## Recording Day Checklist

- [ ] Two laptops set up side by side, both visible to camera if doing physical handoff
- [ ] Both wallets pre-funded with testnet USDC + 0G Galileo native OG
- [ ] Three AXL nodes running, topology view confirmed before recording
- [ ] AXL bootstrap-kill demo rehearsed — confirm topology stays connected
- [ ] Demo task pre-staged in dashboard
- [ ] ENS parent name registered and CCIP-Read resolver gateway live (HTTPS, signed responses)
- [ ] `who.*`, `pay.*`, `tx.*`, `rep.*`, `mem.*` namespaces resolving correctly against the live deployment
- [ ] 47 ERC-8004 feedback records seeded to `0x8004B663…` on Base Sepolia from 47 distinct employer signers (disclose seeding in README "How it's made")
- [ ] Worker iNFT minted on 0G Galileo Testnet (ChainID 16602, native 0G token); ERC-7857 (0G iNFT draft standard) confirmed on the deployed contract
- [ ] 0G Compute TEE attestation digest reachable via `broker.inference.verifyService`
- [ ] Higgsfield clips generated and timed (Shot 1: 15s open, Shot 3: 12s close — Shot 2 has been cut)
- [ ] Voiceover recorded separately in clean audio environment, then synced
- [ ] Backup: full canonical run pre-recorded as B-roll in case live demo fails
- [ ] Multiple takes — commit to at least 3 full passes before picking the best
- [ ] Muted 5-second test of Shot 1 before each full take (color/grade/audio sync gate)

## Pre-Production

- The reputation history of "47 jobs, 4.7 rating, 12,847 USDC earned" — pre-bake this into the **live audited ERC-8004 ReputationRegistry at `0x8004B663…` on Base Sepolia** on Day 8 evening. Have a one-shot script that fires 47 fake completion feedback records signed by 47 distinct employer-agent keys. **Disclose this seeding step in the README "How it's made" section** — non-negotiable, prevents any judge perception of fraudulent claims.
- Reputation registry stays on Base Sepolia (it is a different chain from the iNFT host); the iNFT and 0G Compute attestations live on 0G Galileo Testnet (ChainID 16602, native 0G token).
- ENS parent name (`<team>.eth` or sub-issued) registered first thing on May 2 evening via `sepolia.app.ens.domains` — do not leave for Day 9.
- CCIP-Read offchain resolver gateway must be live by Day 9 hour 18 for Builder C / Builder D integration.

## What Could Go Wrong On Recording Day

1. **AXL drops a node mid-take** — restart, retake. Build in 30 minutes of buffer.
2. **0G Compute is slow** — pre-cache the reasoning output. Have a "reasoning replay" mode in worker code that streams pre-recorded tokens at realistic pace.
3. **ENS resolver gateway downtime** — have a hot-spare gateway on a second region; resolver code defaults to a 30s TTL cache during the recording window so a single dropped request doesn't break the `who.*` flip. Pre-warm the cache 60s before each take.
4. **0G Galileo public RPC unreliable** — Builder C runs a private Galileo node for the recording window; resolver also caches `ownerOf()` reads with 30s TTL.
5. **Voiceover doesn't fit timing** — record VO first, edit visuals to VO, not the other way around.
