# Alt-Council Stage 3 — Chairman Synthesis

**Chairman:** Lead session (Opus 4.7). Synthesizing across 3 lenses (Whisperer, Pragmatist, Inventor), 9 ideas, 2 stages. Re-criterion'd at Stage 2 from "solo dev" to "**Slot-3 sponsor for the main Ledger project, 4 builders, ~30 hours**."

---

## 1. Aggregate ranking (Stage 2 final)

| Rank | Idea | Source | Avg pos | Range |
|---|---|---|---|---|
| 🥇 1 (tied) | E (`quote-resolver`) | Inventor | 2.67 | 1, 1, 6 |
| 🥇 1 (tied) | H (`agent-forwarder`) | Inventor | 2.67 | 2, 2, 4 |
| 🥉 3 | C (Capability Subnames for Agents) | Whisperer | 3.00 | 1, 3, 5 |
| 4 | B (`subname-receipts`) | Inventor | 3.67 | 3, 3, 5 |
| 5 | F (Treasury-Rebalance + DX Forensics) | Whisperer | 4.33 | 2, 4, 7 |
| 6 | A (ENS Agent Passes) | Pragmatist | 5.67 | 5, 6, 6 |
| 7 | I (0G Memory Anchor) | Whisperer | 6.67 | 4, 8, 8 |
| 8 | G (0G Memory Kit) | Pragmatist | 8.00 | 7, 8, 9 |
| 9 | D (Swap Receipt Agent) | Pragmatist | 8.33 | 7, 9, 9 |

**Self-corrections worth noting:**

- **Pragmatist** demoted their own #1 (Idea A = ENS Agent Passes) to #6 and demoted their own #2 (Idea D = Swap Receipt Agent) to dead last #9. Honest self-correction unlocked.
- **Inventor** demoted their own original #3 (Idea E = `quote-resolver`) to #6 with the brutal reasoning that Uniswap's brief explicitly says "swap and settle value onchain" and `quote-resolver` does *neither* — it's a "price oracle wearing an ENS hat."
- **Whisperer** demoted their own #1 (Idea C = Capability Subnames) to #5, citing scope overload and that the rotating-address + capability-namespace combo is delivered cleaner by H + B together.

The council mechanic worked exactly as designed.

---

## 2. The chairman's verdict on synthesis

Three different synthesis paths were proposed in Stage 2:

| Voter | Synthesis | Targets | Theoretical pool |
|---|---|---|---|
| Pragmatist | C + H = "Capability Paynames" (cuts zk + A2A from C, narrows to capabilities + rotating addresses) | ENS-AI + ENS-Creative | $5K |
| Inventor | C-as-umbrella (B + H are *inside* C as capability flavors) | ENS-AI + ENS-Creative | $5K |
| Whisperer | B + E = "ENS as universal queryable interface" | Uniswap + ENS-Creative + ENS-AI | $10K theoretical |

**Whisperer's $10K-theoretical synthesis is geometrically infeasible.** Our 3 partner-prize slots are: Slot 1 = 0G (locked), Slot 2 = Gensyn (locked), Slot 3 = exactly one of {KeeperHub, Uniswap, ENS}. Whisperer's B+E merge would require both Uniswap AND ENS as separate slots, which means dropping 0G or Gensyn — neither acceptable. Their idea is brilliant for an unconstrained slate; not for ours.

**Between Pragmatist's C+H merge and Inventor's C-as-umbrella, Inventor's wins.** Two reasons:

1. **C-as-umbrella scales better to 4 builders.** Pragmatist's merge cuts zk (correct for solo) but loses one of ENS-Creative's three named-example primitives. With a 4-dev team, one builder can specialize on the zk path full-time — cutting it pre-emptively gives back budget without earning it back in deliverable.
2. **The umbrella framing produces a coherent narrative**, which the merged narrower form does not. "Capability Subnames as the agent control plane, with three concrete capability flavors shipped as case studies (read/swap, rotating-pay, tx-receipt)" is a headline. "Capability Paynames" is a feature.

**Inventor's synthesis is the chairman's recommendation.** With one specific tightening (next section).

---

## 3. The integration shape, mapped to Ledger

The umbrella becomes Ledger's **identity layer**. Each worker iNFT minted on 0G Galileo gets a corresponding ENS subname under our team-owned parent (`ledger.eth` if claimable, or `ledger-demo.<sponsor-issued>.eth` as Path C — see ENS deep research). Under each subname, a fixed set of capability namespaces:

```
worker-001.ledger.eth
├── who.worker-001.ledger.eth   → resolves live ownerOf(tokenId) on 0G Galileo (Inventor's "live ownerOf" pattern)
├── pay.worker-001.ledger.eth   → returns auto-rotating address per resolution (HD-derivation, Idea H)
├── tx.<txid>.worker-001.ledger.eth → returns receipt JSON for that task (Idea B specialization)
├── rep.worker-001.ledger.eth   → returns ERC-8004 reputation from Base Sepolia (Greg's ENSIP-25 verification loop)
└── mem.worker-001.ledger.eth   → returns 0G Storage memory CID (live, follows iNFT)
```

**One CCIP-Read offchain resolver** queried on every name resolution. Resolver server logic per request:

1. Parse the label (e.g. `pay.worker-001`)
2. Dispatch by namespace:
   - `who.*` → JSON-RPC call to 0G Galileo `ownerOf(tokenId)` → return as `addr` text record
   - `pay.*` → derive child address from master pubkey + per-resolution nonce → return as `addr`
   - `tx.<txid>.*` → 0G Storage `download(receiptCID)` → return text records
   - `rep.*` → JSON-RPC call to ERC-8004 ReputationRegistry `0x8004B663…` on Base Sepolia → return signed-feedback summary as text records
   - `mem.*` → query iNFT contract for current memory pointer → return text record
3. Sign the response with the gateway key (per ENSIP-10 CCIP-Read spec)
4. Return to client

**Why this maps perfectly to Ledger's hero demo:**

- When iNFT transfers from Owner A → Owner B mid-demo, **`who.worker-001.ledger.eth` immediately starts resolving to Owner B's address.** No subdomain transfer, no ENS transaction, no migration. The ENS resolution follows `ownerOf()` automatically via CCIP-Read. That's a 5-second on-screen "oh."
- `pay.worker-001.ledger.eth` resolves to a fresh address every time → judges resolve twice, see two different addresses, both verifiably HD-derived from the same master. Implements Greg's named ENS-Creative example (auto-rotating addresses) AND his favorite hackathon project (Fluidkey).
- `tx.*` namespace is the receipt log Inventor's Idea B describes — a queryable history of every job the worker has completed.
- `rep.*` and ENSIP-25 text records close the verification loop between the ENS name and the ERC-8004 ReputationRegistry — Greg's exact bullseye.

---

## 4. The 4-person, 30-hour build plan

| Builder | Owns | Hours |
|---|---|---|
| **Builder A — Resolver core** | CCIP-Read offchain resolver server (Node/TS), ENSIP-10 signed-response handler, label parser dispatching to namespaces, deployment as a stable HTTPS gateway | 14h |
| **Builder B — Capability backends** | The 5 namespace handlers (`who`, `pay`, `tx`, `rep`, `mem`); HD-derivation for `pay`; JSON-RPC clients for 0G Galileo + Base Sepolia; 0G Storage retrieval for `tx`/`mem`; ENSIP-5 text-record encoding | 14h |
| **Builder C — On-chain anchor** | Parent name registration (`ledger.eth` or sub-issued) on Sepolia via `sepolia.app.ens.domains`; CCIP-Read resolver pointer wired to Builder A's gateway; ENSIP-25 `agent-registration` text record on parent name pointing to ERC-8004 deployment; verification-link records | 8h |
| **Builder D — Demo + viewer UI + receipts** | Custom viewer page rendering capability namespace tree (so judges don't see raw hex dumps in the official ENS app), demo flow integration into Ledger dashboard showing live resolution flipping post-transfer, verification UI proving HD-derivation chain for `pay.*` rotation | 14h |

**Total: 50 builder-hours across 4 devs in 30 wall-hours.** Achievable with one builder slightly over-allocated (A or B). Critical path: Builder A's resolver gateway must be live by hour 18 for Builders C and D to integrate.

**Items pre-emptively cut for scope:**

- **Live zk circuit + on-chain Groth16 verifier** for ENSIP-25 trust proofs. Replaced with a precomputed signed attestation (TEE-attestation digest from 0G Compute) embedded in the `agent-registration` text record. Same end-to-end verifiability story for the demo, ~14h saved. (If Builder D finishes early, fold the live verifier back in.)
- **The `<amount>-<from>-to-<to>.quote.eth` Uniswap path from Idea E.** Geometrically incompatible with our slot budget — Uniswap is not a partner-prize for us. Skip.

---

## 5. Demo flow (60 seconds inside the main 4-min cut)

The Inheritance moment in `03_DEMO_SCRIPT.md` 2:00–3:15 absorbs the ENS integration as follows:

1. **2:00–2:10** — Hard cut from KeeperHub-replacement scene to worker profile UI. VO: *"She's `worker-001.ledger.eth`."* Display the ENS profile rendering the capability tree on the right side of the screen — `who`, `pay`, `tx`, `rep`, `mem`. Hold 3 seconds.
2. **2:10–2:30** — Cut to a side panel running `cast resolve` calls live. Resolve `pay.worker-001.ledger.eth` → address A. Resolve again → address B. VO: *"Pay her once, every payment goes to a fresh address. All HD-derived from her master key. ENS-native."*
3. **2:30–2:45** — Cut to the iNFT transfer screen recording. Owner A clicks *List for Sale*; Owner B clicks *Buy*. Transfer settles on 0G Galileo.
4. **2:45–3:00** — Cut back to the live resolver panel. Re-resolve `who.worker-001.ledger.eth`. **The address flips from Owner A to Owner B in real time, with no ENS transaction, no migration, no waiting.** VO: *"She's still `worker-001.ledger.eth`. The ENS resolution follows ownerOf — cross-chain, live."* Hold 3 seconds on the new owner address.
5. **3:00–3:15** — Cut to split-screen: left = old owner wallet balance (frozen / fading), right = new owner wallet balance, with worker iNFT card unchanged in center showing same `47 jobs · 4.7 rating`. Settlement lands in Owner B's wallet for the next bid. VO: *"Same agent. Same name. Same reputation. New owner. Earnings flip mid-flight."*

That single 75-second beat hits both ENS bounty rubrics simultaneously:

- **ENS-AI**: ENS resolves identity, stores metadata via text records, gates access via capability namespaces, enables discovery (the receipt log), coordinates A2A interaction (live `who` lookups for routing). 5/5 of Greg's named verbs.
- **ENS-Creative**: CCIP-Read auto-rotating addresses (✓), subnames-as-capability-tokens (✓), structured queryable namespace as a *new* primitive use of ENS (Greg's "surprise us"). 3/3 of Greg's named examples.

---

## 6. Risks + mitigations

| Risk | Mitigation |
|---|---|
| 0G Galileo public RPC unreliable during demo recording | Builder C runs a private Galileo node OR the resolver caches `ownerOf()` reads with 30s TTL during recording window |
| ENS app's official UI doesn't render `pay.*`/`tx.*` text records nicely | Builder D ships a custom viewer page (`ledger-app.vercel.app/agent/<name>`) that renders the capability tree explicitly. Demo uses this surface, not the official app. README links to both. |
| `sepolia.app.ens.domains` registration friction | Builder C registers parent name **first thing tonight (May 2 evening)** — should take 15 min with Sepolia faucet ETH. Don't leave for Day 9. |
| HD-derivation verification UI looks like a hex dump | Builder D's viewer renders rotation as: `[address A · derived from master @ nonce 0] [address B · derived from master @ nonce 1] ...` with a "Verify derivation" button that checks client-side. |
| ERC-8004 ReputationRegistry on Base Sepolia returns empty for our worker | Builder B seeds 47 employer-signed feedback records to the live `0x8004B663…` deployment on Day 8 evening (this is the "47 fake employers" baking step from `03_DEMO_SCRIPT` 795-810, restated against the actual audited contract). Disclose seeding in README "How it's made" per main-council Stage 3 conflict resolution. |

---

## 7. What's deferred to the main-council Stage 3

The alt-council resolved **the Slot-3 integration shape**. Three things remain for the main-council chairman synthesis:

1. **The full doc-changes list** across all 11 ledger documents (text edits, contract renames, removed claims, etc.).
2. **The non-ENS conflict resolutions** — Base Sepolia keep/cut, Higgsfield Shot 2 keep/cut, 47-job disclose, all-actions-through-KeeperHub vs one flow (now moot since KeeperHub is out), etc.
3. **The submission punch list** — the 30-hour priority-ordered build plan for the entire team, not just the ENS slot.

See `tools/council/STAGE3_CHAIRMAN.md` for those.

---

*Alt-council closed. All 3 teammate tabs released. Synthesis frozen at this state for execution.*
