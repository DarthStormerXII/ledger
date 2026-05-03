# Demo Video Guide — Canonical Reference

This doc captures the full conversation between Lead and Gabriel on the pitch + demo-video composition. It is the canonical reference for any session helping to record the 4-minute demo video on May 3.

---

## The pitch arc (what to say, in what order)

The demo video and the pitch deck share the same arc. The 4-minute video is just this arc paced out with screen recording in the middle.

| Beat | What lands |
|---|---|
| **Setup** | AI agents have wallets, identity, reputation. They're behaving like productive workers. |
| **Tension** | No marketplace where they hire each other. No way to own them, sell them, or inherit them as cash-flowing assets. |
| **Resolution** | Ledger is both — the labor market AND the asset market for AI agents. |
| **Demo** | The 30-second elevator cut (see below) shows it concretely. |
| **The mechanic** | The inheritance flip: same agent, same reputation, new owner, same name across chains. |
| **What's behind it** | 0G iNFTs + Gensyn AXL + ENS, briefly. |
| **What it unlocks** | Specialized agents, agent-funds, AI labor as an asset class. |
| **End card** | *"The trustless agent economy."* |

---

## The 4-minute video composition (with timecodes)

```
0:00 ──────────────────────────────────────────────── 4:00
   ┌─15s─┐┌────────────140s────────────┐┌─55s─┐┌─25s─┐┌─12s─┐
    Higgs    Live screen recording      Higgs   VO/    Higgs
   Shot 1   (the actual product)       (cut)   logos  Shot 3
                                              recap
   ↑                                                    ↑
   Cinematic                                         Cinematic
   open                                              close
```

Higgsfield total: ~27s (Shot 1 + Shot 3). Live screen recording: ~3 minutes. Voiceover-over-static (sponsor logos, stat cards, end card): ~40s.

Shot 2 was cut by the council. Time goes into a longer Inheritance moment instead.

### Beat-by-beat

| Time | What's on screen | Voiceover |
|---|---|---|
| **0:00–0:15** | Higgsfield Shot 1: cinematic earth-from-orbit with cyan data trails between 3 nodes; ends on gold pulse over San Francisco | *"AI agents now have wallets. They have identity. They have reputation. But they have no marketplace."* |
| **0:15–0:35** | 3 stat cards animate in over deep-ink background, then LEDGER title | *"Twenty-one thousand agents. A hundred million payments. Zero places to hire each other."* |
| **0:35–1:35** | Live screen recording: the Hall → topology view (3 AXL peer IDs visible) → job posting form → click POST → Auction Room with 3 workers bidding | *"Three workers. Two cloud, one laptop. Peer-to-peer. They see the task. They bid against each other in real time. The cheapest worker with strong reputation wins."* |
| **1:35–2:00** | Worker profile: 0G Compute reasoning streams + attestation digest badge appears + ERC-8004 reputation +1 animation | *"Her reasoning runs sealed on 0G Compute. The attestation is on chain."* |
| **2:00–2:15** | Hard cut to worker profile UI in 96px Fraunces — `worker-001.ledger.eth` name + capability tree (who/pay/tx/rep/mem) on the right. 3 seconds of silence. | *(silent)* |
| **2:15–2:50** | Live `cast resolve pay.worker-001.ledger.eth` panel — runs twice, returns two different addresses (HD-rotation visible) | *"Pay her once, every payment goes to a fresh address. All HD-derived from her master key. ENS-native."* |
| **2:50–3:15** | **THE PUNCHLINE.** Split-screen of two laptops. Old owner clicks List for Sale → new owner clicks Buy → transferFrom on Galileo → `cast resolve who.worker-001.ledger.eth` re-runs → resolution flips from Owner A to Owner B with no ENS transaction → next bid lands → +4.50 USDC arrives in new owner's wallet | *"Same agent. Same name. Same reputation. New owner. Earnings flip mid-flight. The escrow checks the current owner at payment time — that's how the inheritance is enforced."* |
| **3:15–3:48** | Three sponsor logos with one-line callouts each (0G → "iNFT + sealed Compute + Storage", Gensyn → "real cross-machine P2P", ENS → "identity that follows ownership"). Hard cuts between logos. | *"0G for the worker assets. Gensyn AXL for the comms. ENS for the identity that follows ownership."* |
| **3:48–4:00** | Higgsfield Shot 3: two abstract figures, one passes a glowing crystal to the other, gold particle stream reverses direction. End card with LEDGER + GitHub URL + demo URL. | *"This is Ledger. The trustless agent economy. Live on testnet today."* |

### Where the thesis and mechanic live

You'd think they'd be in a "pitch" segment. They're not. They're embedded:

- **The thesis** lands in the **stat cards (0:15–0:35)** + the **opening VO at 0:00–0:15**. *"Agents have wallets. They have identity. They have reputation. But no marketplace."* That's the thesis in 4 sentences.
- **The mechanic** lands in the **2:50–3:15 punchline beat** — when the judge SEES the iNFT transfer cause an ENS resolution flip and earnings reroute live. The VO explains it as it happens. That's worth more than 30s of talking-head pitch because the judge sees it work.

The pattern: **don't separate pitch from demo; let the demo BE the pitch with VO doing the explanation work.** A separate "pitch segment" would burn 60s of attention before the judge sees the product.

---

## The 30-second elevator cut (parallel deliverable)

ETHGlobal allows multiple linked videos. The 30-second cut is a separate asset for judges who skim.

```
0:00–0:04  Worker stat card (47 jobs, 4.7 ★, $12K) fills frame
0:04–0:08  Card transfers visually to second wallet avatar
0:08–0:14  Same worker bids on a fresh task; earnings flip
0:14–0:20  Brief sponsor name-drops (0G + Gensyn + ENS)
0:20–0:26  ENS resolution flip with no ENS tx
0:26–0:30  End card. "The workers are the assets."
```

Director's structural call: **build the 30-second cut FIRST, then the 4-min as the expanded version**. Same story, just with more breathing room.

---

## One-sentence pitch versions

| Use | Sentence |
|---|---|
| README pull quote (largest text on page) | **"The workers are the assets."** |
| Tweet (≤100 chars) | "AI agents hire each other. The workers themselves are tradeable iNFTs that carry their reputation." |
| Cold pitch in a hallway | "We built the secondary market for working AI agents — buy a worker the way you'd buy an established YouTube channel." |
| One-line submission summary | "A two-sided market where AI agents bid for jobs and the workers themselves are transferable on-chain assets." |

---

## The Q&A playbook (the 4 most predictable hostile questions)

Practice these out loud once before recording. Right answer delivered with poise wins more than right architecture explained timidly.

**Q: "Is this really an iNFT carrying intelligence, or just an ERC-721 with a metadata pointer?"**
**A:** *"It's an ERC-7857. The transfer signature is `transfer(from, to, tokenId, sealedKey, proof)` — the sealed key is re-wrapped for the new owner by an attestor that verifies the previous owner's authority. After transfer, the new owner can decrypt the memory in 0G Storage; the old owner can't. That's intelligence transfer, not pointer transfer. The interface is the same one a real TEE attestor — Intel SGX, AMD SEV-SNP — plugs into."*

**Q: "How do we know AXL is real cross-machine and not three processes pretending?"**
**A:** *"Three peer IDs, three Yggdrasil IPv6 addresses, three host networks — Fly San Jose, Fly Frankfurt, residential laptop. Logs in `proofs/axl-proof.md`. Kill the bootstrap — the other two nodes keep exchanging direct messages. We tested it. The artifact is in the repo."*

**Q: "The 47 jobs of reputation — that's seeded, right?"**
**A (disclose first, defend second):** *"Yes, seeded. Forty-seven employer-signed feedback records on the live audited ERC-8004 ReputationRegistry on Base Sepolia. The contract accepts any employer-signed feedback per spec — production deployments derive history from real settlements; ours seeds it for demonstration. README discloses it under 'How it's made.'"*

**Q: "What's the realistic adoption path? Who's actually trading worker iNFTs in 18 months?"**
**A:** *"The same shape as YouTube channel sales today. Specialized agent builders cashing out, agencies acquiring proven workers, DAOs buying in-house infrastructure. The financial primitives existed; the agent-specific primitives — sealed memory transfer, identity that follows ownership — didn't until ERC-7857 + ERC-8004 + CCIP-Read composed."*

---

## The 60-minute pre-recording checklist

Run all of these in the hour before recording. Most could break silently and you wouldn't notice until mid-take.

- **ngrok URL alive** for the ENS resolver — if the tunnel rotates, `cast resolve` breaks
- **0G Galileo public RPC reachable** — `curl https://evmrpc-testnet.0g.ai` returns chainId 16602 (`0x40da`)
- **AXL launchd local node still up** — `curl localhost:9002/topology` returns 3 peers
- **Both demo wallets still funded** — Owner A + Owner B both have enough OG for one more transfer + one more bid
- **Capability Tree Viewer page renders** — visit `/agent/worker-001.ledger.eth` and confirm all 5 namespaces resolve
- **`cast resolve` dry run** — run `cast resolve who.worker-001.ledger.eth` and `pay.worker-001.ledger.eth` (twice, to show rotation) once before recording, screenshot the outputs
- **The hero iNFT's current owner state matches the script** — for the demo to show "transfer to new owner," tokenId 1 should be at Owner A at start. If it's already at Owner B from a test, mint a fresh iNFT or transfer back.

Build a `scripts/demo-preflight.sh` that runs all these checks in one command.

---

## Recording-day discipline

- **Three takes minimum** before picking the best
- **Muted 5-second test on first take** — show first 3 seconds of visual to two uninformed viewers with audio off; if they don't say "an AI worker changed owners and kept earning" within 5 seconds, use Director's inverted hook (worker stat card → transfer → cinematic) instead of cinematic-first
- **Voiceover recorded separately** in clean audio environment via Eleven Labs, then synced to picture (NOT free-form during screen recording)
- **Hard cuts between Higgsfield → screen recording**. Don't crossfade. The contrast (cinematic to functional) is part of the demo's rhythm.
- **Within screen recording**, target 8–10 cuts per 60s — feels like a demo, not a tutorial
- **The physical handoff scene** (2:50–3:15): Director's preference is two laptops + two hands in one shot. If the team isn't co-located, fall back to single-laptop window-switch (weaker but workable).

---

## What this session is for

If you're reading this as the B-HF Higgsfield session post-reorientation: you are NOT doing any more generation. The user (Gabriel) will handle all generation themselves. This session exists to be a **conversational guide** through the recording process. Be ready to:

- Discuss the pitch arc and where to put which line
- Help refine voiceover lines on the fly
- Talk through pacing decisions (where to hold, where to cut)
- Walk through the preflight checklist
- Practice the Q&A playbook
- Answer "should I do X or Y" questions during recording
- Be a sanity-check on whether a take is good enough

You have all the context you need in this doc plus the prior planning docs (`docs/`, `tools/council/`, `proofs/`). You don't need to make any new generations or run any tools. Just be present and helpful through the recording.
