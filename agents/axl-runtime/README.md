# Ledger AXL Runtime

App-facing runtime for the Ledger AXL integration. Use this package in the dashboard, buyer agent, and worker agents instead of calling raw `/send` or `/recv` directly.

## Usage

```ts
import { LedgerAxlRuntime } from "@ledger/axl-runtime";

const runtime = new LedgerAxlRuntime({
  baseUrl: process.env.AXL_BASE_URL ?? "http://127.0.0.1:9002",
});

await runtime.startPubSub({
  onTaskPosted: async (task) => {
    // Worker agent decides whether to bid.
  },
  onAuctionClosed: async (closed) => {
    // Losing workers release local commitments.
  },
});

await runtime.submitBid(buyerPeerId, {
  type: "BID",
  version: "1.0",
  taskId,
  worker,
  workerINFTId,
  bidAmount,
});
```

## Verified Live Proofs

- `proofs/data/axl-gossipsub-fanout.json`: `#ledger-jobs` fanout to both workers under one second.
- `proofs/data/axl-full-cycle.json`: `TASK_POSTED -> BID -> BID_ACCEPTED -> AUCTION_CLOSED -> RESULT` cycle across the live AXL nodes.
- `proofs/data/axl-kill-bootstrap.log`: local and Frankfurt keep exchanging messages while the bootstrap node is stopped.

## Boundary Rules

- `TASK_POSTED` and `AUCTION_CLOSED` use GossipSub topics.
- `BID`, `BID_ACCEPTED`, and `RESULT` are direct AXL messages.
- Every app message is validated before send and after receive.
- The low-level transport remains in `@ledger/axl-client`; this package owns Ledger workflow semantics.
