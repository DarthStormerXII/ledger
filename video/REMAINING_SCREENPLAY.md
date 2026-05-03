# Ledger Demo Video - Remaining Screenplay

Updated: 2026-05-03.

Canonical production URL: `https://ledger-open-agents.vercel.app`

Current Remotion cut: approximately 3:31. The opening, thesis cards, sponsor proof grid, and outro are already handled. What remains is app footage for `0:29-2:55`.

## Current Live Proof State

Use the stable production surfaces, not a risky fresh live transaction take.

- Demo worker: `worker-001.ledger.eth`
- Demo task ID: `0x005ecb1bf6cd06a9d1c7240ab1365aebedbe8104d1b530a892fd0af228c1e604`
- WorkerINFT: `0xd4d74E089DD9A09FF768be95d732081bd542E498`
- LedgerEscrow: `0x83dF0Ed0b4f3D1D057cB56494b8c7eE417265489`
- LedgerIdentityRegistry: `0x9581490E530Da772Af332EBCe3f35D27d5e8377F`
- MockTEEOracle: `0x306919805Eed1aD4772d92e18d00A1c132b07C19`
- ENS resolver: `0xd94cC429058E5495a57953c7896661542648E1B3`
- ERC-8004 ReputationRegistry: `0x8004B663056A597Dffe9eCcC1965A193B7388713`

Do not show or mention any previous unverified escrow address.

## Already Complete

### 0:00-0:09 - Cinematic Open

Visual: `video/public/cinematic-open.mp4`

Status: done.

### 0:09-0:22 - Thesis Market Gap

Visual: `video/public/thesis-background.mp4` plus Remotion right-side data panel:

- `21,000+ agents`
- `100M+ agent payments`
- `But there are still zero places where these agents can really hire each other.`

Status: done.

### 0:22-0:28 - Ledger Thesis Card

Visual: Remotion product-unveil Ledger card.

Status: done.

### 2:56-3:21 - Sponsor Proof Callouts

Visual: Remotion 2x2 sponsor proof grid:

- 0G
- ERC-7857 + ERC-8004
- ENS
- Gensyn AXL

Status: done.

### 3:21-3:31 - Closing

Visual: `video/public/outro.mp4`

Status: done.

## Recording Settings

Record 16:9 full-screen browser footage, ideally 1920x1080 at 30 fps or higher.

Before recording:

- Hide browser bookmarks/sidebar.
- Silence notifications.
- Use the production URL above unless a local server is explicitly needed.
- Keep the Ledger nav/logo visible when possible.
- Use slow cursor movement. Hold the start and end frame of every clip for 1 second.
- Do not open random external explorer tabs in the main recording. The in-app proof links are enough.
- If text feels too small on your monitor, use browser zoom `90%` or `80%`, but keep it consistent across all clips.

## Record These Clips Now

Record these as separate files so they can be placed cleanly in Remotion. Add 1-2 seconds of handle at the beginning and end of each clip.

### Clip 01 - Market + Posted Task

Target slot: `0:29-0:41`

Target recording length: 14-16 seconds.

Start URL:

`https://ledger-open-agents.vercel.app/jobs`

Action:

1. Start on `/jobs`.
2. Hold the `Live jobs.` header for 2 seconds.
3. Let the settled task card be readable: `SETTLED`, `PAYOUT 0.0005 0G`, `WINNING BID 0.0003 0G bid`, `BIDS 1`.
4. Move cursor slowly to `Open auction`.
5. Click into the task.
6. Hold the auction header for 2 seconds.

Must be visible:

- `Live jobs.`
- `Every row is an on-chain LedgerEscrow task on 0G Galileo`
- `SETTLED`
- payout and winning bid
- `LedgerEscrow` link using `0x83dF...5489`

Do not:

- Use `/post` for this rushed final take unless you already have wallet/network ready. The existing settled task is the safer live proof.

Suggested filename:

`app-01-market-posted-task.mp4`

### Clip 02 - Worker Is The Ownable Asset

Target slot: `0:41-1:04`

Target recording length: 25-27 seconds.

Start URL:

`https://ledger-open-agents.vercel.app/agent/worker-001.ledger.eth`

Action:

1. Start at the top of the worker page.
2. Hold the settlement strip for 2 seconds: `0G ESCROW RELEASE`, `REPUTATION REGISTRY`, `0G STORAGE CID`.
3. Hold the hero: `worker-001.ledger.eth`, `47 JOBS`, `4.77`, `0.0003 0G REALIZED`.
4. Show the pills: `ERC-7857 · 0G iNFT DRAFT`, `0G GALILEO · 16602`, `ACTIVE`.
5. Move down to the owner and capability tree.
6. Hold `WHO.*`, `PAY.*`, `TX.*`, `REP.*`, `MEM.*`.
7. End with `0G COMPUTE - TEE SHIM DISCLOSED` / `MockTEEOracle`.

Must be visible:

- worker name
- owner address `0x664122...600b`
- `ERC-7857 · 0G iNFT DRAFT`
- `0G GALILEO · 16602`
- `MEM.*` with the `0g://...` memory pointer
- `MockTEEOracle` disclosure

Suggested filename:

`app-02-worker-ownable-asset.mp4`

### Clip 03 - Reputation Becomes Market Data

Target slot: `1:04-1:25`

Target recording length: 23-25 seconds.

Start URL:

`https://ledger-open-agents.vercel.app/agent/worker-001.ledger.eth`

Action:

1. Start on the worker hero or scroll directly to the stats grid.
2. Hold `JOBS COMPLETED 47`, `AVG RATING 4.77`, `TOTAL REALIZED 0.0003`.
3. Scroll gently to `REPUTATION HISTORY`.
4. Hold the chart for 3 seconds.
5. Scroll to `RECENT JOBS - LAST 10`.
6. Hold the settled job row showing employer, realized `0.0003 0G`, and rating `4.77`.
7. Optional last 3 seconds: cut or navigate to the task page and show `PAYOUT RECIPIENT worker-001.ledger.eth` with `47 jobs · 4.77`.

Must be visible:

- `47`
- `4.77`
- `REPUTATION HISTORY`
- `RECENT JOBS`
- ERC-8004 is better shown in Clip 04/08, so do not over-scroll here.

Suggested filename:

`app-03-reputation-market-data.mp4`

### Clip 04 - ENS Capability Identity

Target slot: `1:26-1:45`

Target recording length: 21-23 seconds.

Start URL:

`https://ledger-open-agents.vercel.app/agent/worker-001.ledger.eth`

Action:

1. Start with `worker-001.ledger.eth` visible.
2. Move to the capability tree.
3. Click `Verify` on `WHO.*`; hold the JSON resolution source.
4. Click `Verify` on `PAY.*`; hold the two payment addresses.
5. Click `Verify` on `REP.*`; hold `47 ERC-8004 RECORDS`.
6. Click `Verify` on `MEM.*`; hold the `0g://...` memory CID.

Must be visible:

- `worker-001.ledger.eth`
- `WHO.*`, `PAY.*`, `TX.*`, `REP.*`, `MEM.*`
- `CCIP-Read resolves live ownerOf(tokenId)`
- `HD-derived receive address rotates by nonce`
- `47 ERC-8004 RECORDS`
- `WorkerINFT.getMetadata().memoryCID`

Suggested filename:

`app-04-ens-capability-tree.mp4`

### Clip 05 - Stable Name, Changing Answers

Target slot: `1:45-1:57.19`

Target recording length: 14-15 seconds.

Start URL:

`https://ledger-open-agents.vercel.app/proof#ens`

Action:

1. Start on the ENS section of `/proof`.
2. Hold the ENS blurb if visible.
3. Scroll or position so these rows are readable:
   - `who.worker-001.ledger.eth`
   - `pay.worker-001.ledger.eth (rotation 0)`
   - `pay.worker-001.ledger.eth (rotation 1)`
   - `rep.worker-001.ledger.eth`
   - `mem.worker-001.ledger.eth`
4. End on the line that says ownership flips without a new ENS transaction.

Must be visible:

- same stable name: `worker-001.ledger.eth`
- changing records: owner, payment, reputation, memory
- `CCIP-Read` / no ENS transaction language

Suggested filename:

`app-05-ens-stable-changing.mp4`

### Clip 06 - One-Second Pause

Target slot: `1:57.19-1:58.19`

No separate recording needed.

Use a 1-second held frame from the end of Clip 05 or the beginning of Clip 07.

### Clip 07 - Market Mechanics + Gensyn AXL

Target slot: `1:58.19-2:16`

Target recording length: 20-22 seconds.

Start URL:

`https://ledger-open-agents.vercel.app/jobs/0x005ecb1bf6cd06a9d1c7240ab1365aebedbe8104d1b530a892fd0af228c1e604`

Action:

1. Start on the task page.
2. Hold the top status: `SETTLED · PAID`, `Released 0.0003 0G`, task ID.
3. Hold the `PAYOUT RECIPIENT` card showing `worker-001.ledger.eth`.
4. Hold the `ON-CHAIN TRAIL` card showing `postTask`, `LedgerEscrow 0x83dF...5489`, and `ERC-8004 feedback registry`.
5. Move down/right to the AXL topology.
6. Hold `AXL TOPOLOGY`, the three-node graph, and the mesh log/captured proof state.

Must be visible:

- `postTask`
- `LedgerEscrow 0x83dF...5489`
- `PAYOUT RECIPIENT worker-001.ledger.eth`
- `47 jobs · 4.77`
- `AXL TOPOLOGY`
- `Fly sjc`, `Fly fra`, `NAT laptop`

Suggested filename:

`app-07-market-axl-mechanics.mp4`

### Clip 08 - Transfer Begins

Target slot: `2:16-2:21`

Target recording length: 7-8 seconds.

Start URL:

`https://ledger-open-agents.vercel.app/proof#0g`

Action:

1. Start in the 0G section of `/proof`.
2. Position around `Transfer tx (Owner_A -> Owner_B)`.
3. Hold the transfer row and the caption about ownerOf flipping.

Must be visible:

- `Transfer tx (Owner_A -> Owner_B)`
- Owner_A `0x6B9a...`
- Owner_B `0x6641...`
- transfer tx hash

Suggested filename:

`app-08-transfer-begins.mp4`

### Clip 09 - Same Worker After Transfer

Target slot: `2:21-2:25`

Target recording length: 6-7 seconds.

Start URL:

`https://ledger-open-agents.vercel.app/agent/worker-001.ledger.eth`

Action:

1. Hold the hero page.
2. Make sure `worker-001.ledger.eth`, `47 JOBS`, `4.77`, and owner `0x6641...600b` are visible.

Must be visible:

- same worker name
- same reputation
- new owner

Suggested filename:

`app-09-same-worker-new-owner.mp4`

### Clip 10 - ENS Owner Flip

Target slot: `2:26-2:45`

Target recording length: 21-23 seconds.

Start URL:

`https://ledger-open-agents.vercel.app/proof#ens`

Action:

1. Start on the ENS section.
2. Hold `Resolver contract` and `Gateway URL` briefly if visible.
3. Position on `who.worker-001.ledger.eth`.
4. Hold the caption: `Reads ownerOf(1) on Galileo... Ownership flips without a new ENS transaction.`
5. Move to `rep.worker-001.ledger.eth` and `mem.worker-001.ledger.eth`.
6. End on `ledger.eth ENSIP-25 text record` if visible.

Must be visible:

- `who.worker-001.ledger.eth`
- current owner `0x664122...600b`
- `Ownership flips without a new ENS transaction`
- `rep.worker-001.ledger.eth`
- `mem.worker-001.ledger.eth`
- `ENSIP-25`

Suggested filename:

`app-10-ens-owner-flip.mp4`

### Clip 11 - Earnings Flow To New Owner

Target slot: `2:45-2:55`

Target recording length: 12-13 seconds.

Start URL:

`https://ledger-open-agents.vercel.app/jobs/0x005ecb1bf6cd06a9d1c7240ab1365aebedbe8104d1b530a892fd0af228c1e604`

Action:

1. Start on the task receipt panel.
2. Hold `PAYOUT RECIPIENT worker-001.ledger.eth`.
3. Hold the new owner wallet `0x664122...600b`.
4. Hold `RELEASED 0.0003 0G`.
5. Hold the `LedgerEscrow 0x83dF...5489` and `ERC-8004 feedback registry` links.

Must be visible:

- payout recipient
- released amount
- current owner address
- `LedgerEscrow 0x83dF...5489`
- ERC-8004 feedback registry

Suggested filename:

`app-11-earnings-flow.mp4`

## Optional Backup Clip

Only record this if there is time and the above is complete.

URL:

`https://ledger-open-agents.vercel.app/pitch`

Goal:

Scroll to `How The Inheritance actually works.` and record the three explanatory steps:

- `transferFrom on 0G Galileo with sealed-key re-keying`
- `ENS resolution flips automatically via CCIP-Read`
- `Earnings flip on the next payment`

Use this as fallback if the proof page feels too dense on video.

Suggested filename:

`app-12-pitch-inheritance-backup.mp4`

## Final Recording Order

Record in this order:

1. `app-01-market-posted-task.mp4`
2. `app-02-worker-ownable-asset.mp4`
3. `app-03-reputation-market-data.mp4`
4. `app-04-ens-capability-tree.mp4`
5. `app-05-ens-stable-changing.mp4`
6. `app-07-market-axl-mechanics.mp4`
7. `app-08-transfer-begins.mp4`
8. `app-09-same-worker-new-owner.mp4`
9. `app-10-ens-owner-flip.mp4`
10. `app-11-earnings-flow.mp4`

Clip 06 is just a held frame. Do not record it separately.

## Quality Bar

The footage is good if a judge can pause at any point and read one concrete proof:

- a live task or receipt
- an iNFT owner
- an ENS capability record
- a reputation number
- an AXL topology/proof row
- an escrow payment to the new owner

The footage is bad if it only shows fast scrolling, unreadable addresses, wallet connection setup, or generic marketing screens.
