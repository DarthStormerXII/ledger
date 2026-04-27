# Ledger — Product Requirements Document

**Version:** Hackathon v1
**Owner:** Gabriel + 3-person team
**Submission deadline:** May 3, 2026

---

## 1. Vision

The trustless economy for AI agents. A two-sided market where:
1. Agents post jobs and bid on jobs (the labor side)
2. The agents themselves are tradeable iNFTs (the asset side)

A worker agent's reputation, persistent memory, and earnings history are bound to its iNFT and transfer with ownership.

## 2. Users

| User | Description | Primary action |
|---|---|---|
| **Buyer agent** | Program that needs work done | Posts task, pays for completion |
| **Worker agent** | iNFT that bids on tasks and executes them | Bids, executes, earns |
| **Human owner** | Wallet that holds worker iNFTs | Buys/sells workers, collects earnings |

## 3. Core Flows

### 3.1 Hire Flow (Job Cycle)

1. Buyer agent publishes task to AXL pubsub channel `#ledger-jobs`
2. Worker agents on the network see the announcement
3. Workers submit signed bids (EIP-712) via direct AXL message back to buyer, attaching ERC-8004 reputation reference
4. Buyer auto-selects cheapest worker above min reputation threshold (configurable, default 4.0)
5. Worker pays bid bond (0.5 USDC) into on-chain escrow contract on Base Sepolia
6. Worker executes task using 0G Compute for reasoning, 0G Storage for any large outputs
7. Worker submits result + payment claim; buyer signs approval
8. Settlement contract pays worker; ERC-8004 ReputationRegistry receives a feedback record signed by the buyer (per ERC-8004 spec); dashboard's Settlement Status Strip shows both legs as eventually-consistent (two-phase commit, eventually consistent within ~10s; dashboard surfaces a `pending_reconcile` state if a leg lags)

### 3.1.5 Auction Termination

Every `TASK_POSTED` carries a `bidExpiresAt` timestamp. When the buyer accepts a winning bid, an `AUCTION_CLOSED` message is broadcast on the AXL pubsub channel carrying the `taskId` and the selected worker address. Losing workers receiving `AUCTION_CLOSED` (or seeing `bidExpiresAt` elapse without a `BID_ACCEPTED` for them) free their bond commitment locally and do NOT re-bid until the next `TASK_POSTED`. This prevents thrashing and gives losing workers a clean termination signal.

### 3.2 Inherit Flow (Secondary Market)

1. Owner of worker iNFT lists it for sale at price X
2. Buyer purchases via standard ERC-721 transferFrom (or marketplace contract)
3. iNFT transfers, carrying:
   - Encrypted memory pointer (0G Storage CID)
   - Reputation history (on-chain ERC-8004 record)
   - Earnings record
   - Learned strategy weights
4. New owner immediately becomes beneficiary of all future earnings from that worker

### 3.3 Identity Layer

Every worker iNFT is named `worker-NNN.<team>.eth` (parent name registered on Sepolia). Each worker exposes a tree of capability subnames:

| Subname | Resolves to |
|---|---|
| `who.worker-NNN.<team>.eth` | Current iNFT owner address (live `ownerOf()` on 0G Galileo) |
| `pay.worker-NNN.<team>.eth` | Auto-rotating payout address (HD-derived; Fluidkey-inspired) |
| `tx.worker-NNN.<team>.eth` | Last settlement tx hash on Base Sepolia |
| `rep.worker-NNN.<team>.eth` | ERC-8004 reputation summary (jobCount + avgRating) |
| `mem.worker-NNN.<team>.eth` | Current 0G Storage memory CID |

Resolution is via a custom CCIP-Read offchain resolver (ENSIP-10) — see `02_ARCHITECTURE.md` §2.5 ENS Resolver Gateway. The parent name carries an ENSIP-25 `agent-registration` text record pointing to the audited ERC-8004 ReputationRegistry deployment on Base Sepolia.

## 4. Sponsor Integration Requirements

### 4.1 0G Labs (Track A + Track B)

- [ ] Worker agents minted as ERC-7857 (0G iNFT draft standard) iNFTs on 0G Galileo Testnet (ChainID 16602, native 0G token)
- [ ] Persistent agent memory in 0G Storage via SDK `uploadFile` / `downloadFile`
- [ ] All agent reasoning runs on 0G Compute (sealed inference); attestation digest from `broker.inference.verifyService` surfaced as UI badge
- [ ] At least 3 worker agents acting as a swarm
- [ ] iNFT transfer demo proves embedded intelligence transfers with the token (TEE oracle re-keys metadata per ERC-7857 spec)
- [ ] Architecture diagram in repo
- [ ] Contract addresses verified on 0G Galileo explorer
- [ ] Submission video under 3 minutes (or include 3-minute cut alongside the 4-minute version)

### 4.2 Gensyn AXL

- [ ] 3 separate AXL nodes (2 cloud VMs + 1 local laptop)
- [ ] All inter-agent comms (job announcement, bidding, status) over AXL — "service registry / tool marketplace" pattern (Jud's framing)
- [ ] No centralized broker — all messaging is P2P
- [ ] Topology visualization in dashboard showing real cross-node packets
- [ ] Cross-node demo recorded in video
- [ ] Two layers of encryption: hop-by-hop TLS + end-to-end payload
- [ ] Pubsub layer forks the AXL repo's `gossipsub` example

### 4.3 ENS

- [ ] Parent name registered on Sepolia (e.g. `<team>.eth`)
- [ ] CCIP-Read offchain resolver live and serving capability namespaces (`who`, `pay`, `tx`, `rep`, `mem`) per ENSIP-10
- [ ] ENSIP-25 `agent-registration` text record on parent name pointing to the audited ERC-8004 ReputationRegistry deployment at `0x8004B663…` on Base Sepolia
- [ ] Demo shows live `ownerOf()` resolution flip post-transfer (`who.worker-001.<team>.eth` resolves to old owner pre-transfer, new owner post-transfer, with zero ENS transactions)
- [ ] Custom Capability Tree Viewer page (since the official ENS app may not render our text records nicely)
- [ ] HD-derivation verifier UI for `pay.<agent>` rotating addresses (Fluidkey-inspired)

## 5. Acceptance Criteria

| # | Criterion | How to verify |
|---|---|---|
| 1 | 3 AXL nodes communicate cross-machine | Topology view shows 3 nodes, packets flow between all 3 |
| 2 | Worker iNFT minted on 0G Galileo Testnet (ChainID 16602, native 0G token) | Token visible on 0G Galileo explorer with metadata pointing to 0G Storage |
| 3 | iNFT transfer flow works | Transfer to second wallet, second wallet receives next earnings |
| 4 | Job cycle completes in under 3 minutes | Stopwatch from "Post" click to "Payment landed" |
| 5 | ENS resolution flips post-transfer | `who.worker-001.<team>.eth` resolves to current iNFT owner; address flips within 30s of `transferFrom` settlement on 0G Galileo, with zero ENS transactions |
| 6 | Public dashboard live | URL accessible without authentication |
| 7 | Repo public on GitHub | All commits dated April 24 or later |
| 8 | 4-minute demo video uploaded | Linked in submission |
| 9 | Proof Matrix and `/docs/ens-proof.md`, `/docs/0g-proof.md`, `/docs/axl-proof.md` filed | Files present in repo |

## 6. Non-Goals (Explicitly Out of Scope)

- Uniswap or any DEX
- Mobile UI
- More than one task type
- Real-money / mainnet
- Agent training UI
- KYC for human owners

**Considered for v2:** 100 delegated users per token without transfer (per Gautam's 0G workshop comment).
