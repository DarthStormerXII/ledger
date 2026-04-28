# Ledger — AI Council Prompts

**Tool:** AI Council (multiple models in parallel)
**Goal:** Interrogate the plan from multiple angles before committing 10 days of build effort.

---

## How to Use AI Council Effectively

Run the same prompt across multiple models simultaneously. Don't read each response in isolation — read them side-by-side and look for:
1. **Consensus** = probably true
2. **Disagreement** = a thing you need to verify yourself
3. **Unique findings** = the model with deeper context on that specific topic

For each prompt below, paste the **Master Brief** (file `00_MASTER_BRIEF.md`) first, then the prompt.

---

## Prompt 1 — Architecture Stress Test

**When to run:** Day 0, before any code is written.

```
Here is the technical architecture for Ledger [paste 02_ARCHITECTURE.md].

Identify the THREE highest-risk technical decisions in this architecture 
that could cause the system to fail in a live demo at ETHGlobal Open 
Agents 2026 (April 24 – May 6, 2026 hackathon).

For each risk:
1. State the failure mode in one sentence
2. Estimate probability of occurrence (low/medium/high)
3. Estimate impact severity if it occurs (low/medium/high)
4. Propose a specific mitigation that can be implemented in under 
   1 day of work
5. Propose a fallback if the mitigation fails

Be ruthless. The goal is to find the things that will actually break, 
not to be polite.
```

---

## Prompt 2 — Demo Killer-Question Simulation

**When to run:** Day 8 (before demo recording).

```
You are a judge at ETHGlobal Open Agents 2026 with deep technical 
expertise in:
- AI agents and multi-agent systems
- Decentralized systems and peer-to-peer networking
- ERC standards (especially ERC-8004, ERC-7857 (0G iNFT draft standard), ERC-721)
- ENS, ENSIP-10 (wildcard resolution), ENSIP-25 (agent-registration text records), CCIP-Read
- DeFi and on-chain settlement
- Hackathon project evaluation

You have just watched the 4-minute demo video for "Ledger" — the 
trustless agent hiring hall.

[Paste 03_DEMO_SCRIPT.md]

List the FIVE hardest questions you would ask the team in the 
3-minute Q&A round following their finalist pitch. For each question:

1. State the question as a judge would phrase it (skeptical, probing)
2. Identify the underlying concern the question is testing for
3. Write the IDEAL 30-second answer that would satisfy a skeptical 
   judge
4. Identify any honest weakness the team should acknowledge in their 
   answer (because honesty under questioning is more credible than 
   defensiveness)

Focus your hardest questions on the INHERITANCE flow specifically — 
this is the demo's central claim and the judges will press on it.
```

---

## Prompt 3 — Hidden Vulnerabilities

**When to run:** Day 0 + Day 5 (re-run when implementation gets concrete).

```
[Paste 02_ARCHITECTURE.md]

Identify the assumptions in this architecture that could be technically 
INCORRECT. For each assumption:

1. State the assumption explicitly (the team is taking it as given)
2. Explain why it might be wrong
3. Suggest how to verify it before committing build time

Specifically focus on these five claims:

A. Gensyn's AXL Yggdrasil mesh actually traverses residential NAT 
   reliably without port forwarding. (Real-world test required.)

B. ERC-7857 (0G iNFT draft standard) on 0G actually supports 
   transferring encrypted memory pointers atomically with the token, 
   such that the new owner can immediately use the transferred memory 
   via the TEE oracle re-keying mechanism.

C. ENS via CCIP-Read offchain resolver (Path C) actually serves a live 
   `ownerOf()` call against the iNFT contract on 0G Galileo Testnet 
   (ChainID 16602, native 0G token), and a real ENS-aware client 
   (Rainbow / app.ens.domains / `cast resolve`) honors the signed 
   response and resolves `who.worker-001.<team>.eth` to the current 
   iNFT owner.

D. 0G Compute sealed inference is accessible to hackathon participants 
   without an enterprise contract or credit grant.

E. The "demo flow where the new owner immediately receives earnings 
   from the next job" actually works, given that the worker agent 
   process must somehow detect the ownership change in real-time.

For each, state your level of confidence (high/medium/low) that the 
assumption holds, and suggest the simplest verification test.
```

---

## Prompt 4 — The Inheritance Mechanics Check

**When to run:** Day 4 (when contracts are being designed).

```
[Paste relevant sections of 02_ARCHITECTURE.md, especially section 5]

Walk through the inheritance flow step by step. The critical question 
is: when the worker iNFT transfers from Owner_A to Owner_B mid-flight, 
how does the system ensure that the NEXT earned payment flows to 
Owner_B, not Owner_A?

There are three plausible designs:
1. The worker agent process listens for Transfer events and updates 
   its payout address in-memory
2. The smart contract escrow looks up the current iNFT owner at 
   payment time using ownerOf()
3. The buyer agent sends payment directly to the worker's address, 
   not the iNFT owner — and the worker forwards earnings to its 
   current owner via a separate flow

Which design is correct for our use case? What are the failure modes 
of each? What's the simplest implementation that's robust enough for 
a 3-minute demo without being naive enough to break in Q&A?

Specifically address: race conditions if the transfer happens during 
an in-flight job, MEV/frontrunning concerns, and whether to use the 
ERC-7857 (0G iNFT draft standard) memory pointer or a separate registry.
```

---

## Prompt 5 — What's Missing That Should Concern Us

**When to run:** Day 0 and Day 7.

```
[Paste 00_MASTER_BRIEF.md and 01_PRD.md]

This is a hackathon project plan for ETHGlobal Open Agents 2026, 
targeting finalist + 3 sponsor bounties (0G, Gensyn AXL, ENS).

What is MISSING from this plan that an experienced hackathon judge 
or an experienced founder would notice?

Consider:
- Things that should be in the PRD but aren't
- Sponsor integration requirements that are under-specified
- Demo scenarios that haven't been thought through
- "Boring" infrastructure work that's been hand-waved (deployment, 
  monitoring, testnet faucet logistics)
- Edge cases in the user flow that judges will ask about
- Story / pitch elements that aren't strong enough to win finalist
- Claims in the demo that aren't backed by the actual implementation

Produce a list of 10 specific gaps, ordered by severity. For each, 
state how to close the gap.
```

---

## Prompt 6 — Competitive Field Modeling

**When to run:** Day 1.

```
[Paste 00_MASTER_BRIEF.md]

ETHGlobal Open Agents 2026 will likely have 200-500 submissions. 
Model the competitive field:

1. What FRACTION of submissions will be:
   a. LLM-wrapper-with-a-wallet (no real on-chain execution)
   b. Single-agent DeFi tools
   c. Multi-agent prediction-market projects (the DIVE clone)
   d. Memecoin-launch agents
   e. Generic AgentKit + Base demos
   f. Genuinely novel multi-agent coordination projects

2. Of the genuinely novel projects (your category f), what FRACTION 
   will likely:
   - Use AXL across separate nodes (the Gensyn DQ filter)
   - Mint actual iNFTs (ERC-7857, 0G iNFT draft standard) with embedded intelligence
   - Have a memorable demo moment that judges remember at deliberation

3. Where does Ledger sit in this distribution? What are the 1-3 
   projects most likely to be similar to Ledger, and how should we 
   differentiate?

4. Given that finalist selection is roughly top 5% (10 finalists out 
   of 200-500), what specific elements does Ledger need to nail to 
   end up in that top 5%?
```

---

## Prompt 7 — Final Demo Polish Check

**When to run:** Day 9 (after demo recording, before submission).

```
[Paste 03_DEMO_SCRIPT.md and the actual recorded video transcript]

You are watching the Ledger demo for the first time. You have 4 
minutes of attention and you are tired (you've watched 30 demos 
today).

1. In the first 15 seconds, do you understand what this product is? 
   What's clear, what's confusing?

2. By the 1-minute mark, do you trust that this is real (not a 
   mockup)? What signals trust, what undermines it?

3. At the inheritance moment (around 2:30), does the punchline land? 
   Does it feel novel and important, or does it feel like a feature 
   the product just happens to have?

4. By 4:00, what's the one thing you remember? If you had to summarize 
   this project in a sentence to your fellow judge, what would you 
   say?

5. What are the 3 most impactful edits to make before submission?

Be a tough critic. Hackathon demo videos win or lose at the 15-second 
mark and at the punchline. Tell us if either is failing.
```

---
