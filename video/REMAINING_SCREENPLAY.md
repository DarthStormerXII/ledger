# Ledger Demo Video — Remaining Screenplay

Current cut: approximately 3:32 total.

This file describes the remaining real app/demo footage that still needs to be recorded and inserted into the Remotion video. The opening, thesis section, sponsor proof section, and outro are already handled.

## What Is Already Complete

### 0:00-0:09 — Cinematic Open

Visual: `cinematic-open.mp4`

Audio:

"AI agents now have wallets. They have identity. They have reputation. But they still do not have a marketplace."

Status: Done.

### 0:09-0:22 — Thesis Market Gap

Visual:

`thesis-background.mp4` starts at 0:09. Remotion adds the right-side black data panel with:

- `21,000+ agents`
- `100M+ agent payments`
- "But there are still zero places where these agents can really hire each other."

Status: Done.

### 0:22-0:28 — Ledger Thesis Card

Visual:

Remotion product-unveil Ledger card.

Audio:

"Ledger is the hiring hall for AI agents, and the workers themselves are the assets."

Status: Done.

### 2:56-3:21 — Sponsor Proof Callouts

Visual:

Remotion 2x2 sponsor proof grid:

- 0G
- ERC-7857 + ERC-8004
- ENS
- Gensyn AXL

Status: Done.

### 3:21-3:31 — Closing

Visual: `outro.mp4`

Audio:

"This is Ledger. A market where AI workers can be hired, verified, transferred, and owned. Live on testnet today."

Status: Done.

## What Still Needs To Be Recorded

### 0:29-0:41 — Worker Part 1: Buyer Posts Work

Goal:

Show Ledger as a labor market where agents hire agents.

Screen recording:

Start on the Ledger market/dashboard. Show a buyer agent creating or viewing a task. The task should feel concrete, for example "Reconcile invoice ledger" or "Verify payment records." Show budget, requirements, deadline, and required capabilities.

Then show worker agents appearing as bidders. Ideally the screen shows multiple worker cards with names, skills, ratings, and bid amounts.

What must be visible:

- `Buyer Agent`
- Task title
- Budget/payment
- Worker bidders
- Bid status

Pacing:

- Hold the task screen for 3-4 seconds.
- Move to bidders for 5-6 seconds.
- Do not click too fast.

### 0:41-1:04 — Worker Part 2: Worker Is An Ownable Asset

Goal:

Prove the worker is not just an app profile.

Screen recording:

Open one worker detail page. Show the worker identity card first: name, owner wallet, token ID, and asset standard. Then scroll or switch to a proof/details area showing ERC-7857 iNFT, encrypted memory, 0G storage/memory reference, compute proof/TEE attestation, and transferability.

This section should feel like:

"This worker has state, memory, proofs, and ownership."

What must be visible:

- `ERC-7857 iNFT`
- Token ID
- Owner address
- Encrypted memory / memory CID
- Compute proof / attestation
- 0G reference

Pacing:

- First 5 seconds: worker identity.
- Next 8-10 seconds: memory/proof panel.
- Final 5 seconds: ownership/transfer asset framing.

### 1:04-1:25 — Worker Part 3: Reputation Is Market Data

Goal:

Show ERC-8004 reputation is used to choose the winning worker.

Screen recording:

Stay on the selected worker, or open a reputation tab. Show completed jobs, average rating, feedback records, and maybe signed/verifiable reputation entries. Then return to the bid list and show this worker being selected because it is qualified.

What must be visible:

- `47 completed jobs`
- `4.7` or `4.77 rating`
- Feedback records
- Reputation standard / ERC-8004
- Selected/winner state

Pacing:

Hold reputation stats long enough to read. Then show market selection. The important idea is that reputation is not decoration; it affects who wins work.

### 1:26-1:45 — ENS Capability Identity Part 1

Goal:

Show ENS as the stable name and capability interface.

Screen recording:

Open a capability/ENS identity screen for `worker-001.ledger.eth`. The name should be large and obvious. Under it, show records or resolved fields.

What must be visible:

- `worker-001.ledger.eth`
- Owner
- Payment address
- Current task
- Reputation
- Memory location

Ideal screen structure:

- Left side: worker name and identity.
- Right side: resolved capability recor


ds.
- Bottom or side: status showing these are live/resolved values.

Pacing:

Do not scroll too much. This should look like a clean identity inspector. The judge should immediately understand that ENS is being used as a stable agent interface.

### 1:45-1:57.19 — ENS Capability Identity Part 2

Goal:

Show the name stays stable while state changes.

Screen recording:

Keep `worker-001.ledger.eth` visible. Change or refresh the resolved values: task changes, owner/payment/memory/reputation values update, or show before/after states. The name must remain fixed on screen.

What must be visible:

- Same ENS name
- Changed underlying records
- Transition toward labor market

Pacing:

Use this as a bridge. Start calm, then move toward the task/bid flow. At the end, land on a market/task screen ready for the next section.

### 1:57.19-1:58.19 — One-Second Pause

Goal:

Create a beat before the market mechanics.

Visual requirement:

Do not record a separate complex action. Either hold the previous screen, hold a clean market screen, or use a subtle Remotion transition.

Best option:

Hold on a task card or market overview with no fast movement.

### 1:58.19-2:16 — Market Mechanics + Gensyn AXL

Goal:

Show the full labor-market loop.

Screen recording:

Start with a task going out. Show workers discovering it. Then show bids arriving. Then show a winner selected. If you have an AXL proof/log/topology screen, cut to it briefly or show it side-by-side.

What must be visible:

- Task broadcast
- Workers discover
- Worker bids
- Winner chosen
- Gensyn AXL message/log/mesh proof

Ideal sequence:

1. Task card appears as "broadcasted."
2. Worker list updates to "discovered."
3. Bids appear with amounts/ratings.
4. Best worker becomes "winner."
5. AXL proof/log confirms job and bid messages moved peer to peer.

Pacing:

This is a mechanics section, so motion is useful, but keep it readable. Each state should hold for at least 2 seconds.

### 2:16-2:21 — Inheritance Part 1: Transfer Begins

Goal:

Introduce ownership transfer.

Screen recording:

Open the same worker asset page. Click or show transfer action. Show old owner and new owner.

What must be visible:

- Worker name
- Current owner
- New owner
- Transfer action

Pacing:

Short and direct. This is setup, not the whole explanation.

### 2:21-2:25 — Inheritance Part 2: Same Worker

Goal:

Prove transfer does not reset the worker.

Screen recording:

Show before/after comparison or same worker profile after transfer.

What must be visible:

- Same worker name
- Same reputation
- Same completed jobs
- New owner

Pacing:

Hold a clean before/after visual. This should feel like continuity.

### 2:26-2:45 — Inheritance Part 3: ENS Owner Flip

Goal:

Show ownership changes through ENS resolution.

Screen recording:

Open ENS resolution panel for `who.worker-001.ledger.eth`. Show before owner wallet, then after transfer show new owner wallet. The key line in narration says no ENS transaction, so if the UI can show "resolved dynamically" or "CCIP-read/live resolver," include that.

What must be visible:

- `who.worker-001.ledger.eth`
- Old wallet
- New wallet
- No ENS transaction / dynamic resolution if available

Pacing:

This is the most technical part. Make it visually simple: name at top, old owner/new owner, resolved result.

### 2:45-2:55 — Inheritance Part 4: Earnings Flow

Goal:

Final product punchline before sponsor proof.

Screen recording:

Show escrow/payment screen. A new job pays the worker. The escrow checks current owner and routes earnings to the new owner.

What must be visible:

- Escrow
- Payment amount
- Current owner check
- Earnings routed to new owner

Pacing:

This should feel satisfying. Show the payment moving to the new owner and hold the final state for a second.

## Overall Recording Rules

Record clean 16:9 full-screen footage.

Avoid:

- Browser tabs
- Dev tools
- Notifications
- Messy local URLs if possible
- Fast cursor movement
- Over-scrolling

Prefer:

- Ledger branding visible in the app
- Slow, deliberate cursor movement
- Stable first and last frames for every clip
- One clear idea per clip
- Readable values, addresses, task titles, and proof labels

The strongest visual story is:

Task posted -> worker bids -> worker is an iNFT asset -> worker has reputation -> ENS gives stable identity -> AXL coordinates bids -> ownership transfers -> earnings follow the new owner.
