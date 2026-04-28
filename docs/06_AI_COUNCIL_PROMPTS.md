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
