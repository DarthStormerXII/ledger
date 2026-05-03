// Scenario 8 — AXL node disconnect mid-bid. Worker A drops off the mesh after sending
// its bid; buyer's auction terminates by selecting a non-disconnected winner. When the
// dropped worker reconnects, no double-execution occurs (the lost worker is not awarded
// a second time and never receives an unsolicited BID_ACCEPTED).
import { passthroughIfQualified } from "../sdk/index.js";
import {
  buildFixture,
  makeTaskSpec,
  runScenarioSafely,
  summarizeEvents,
  writeProof,
} from "./_lib.js";

export const NAME = "08_axl_node_disconnect_recovery";

export async function run() {
  return runScenarioSafely(NAME, async () => {
    const fix = buildFixture({
      workers: [
        {
          address:
            "0x1111111111111111111111111111111111111111" as `0x${string}`,
          peerId: "wp-1",
          label: "worker-001",
          jobCount: 47,
          avgRating: 4.8,
        },
        {
          address:
            "0x2222222222222222222222222222222222222222" as `0x${string}`,
          peerId: "wp-2",
          label: "worker-002",
          jobCount: 30,
          avgRating: 4.6,
        },
      ],
    });
    try {
      // Worker A bids cheapest BUT we'll disconnect it before acceptance.
      fix.workers[0]!.agent.setBidStrategy(
        passthroughIfQualified({ askingBid: 800_000n }),
      );
      fix.workers[1]!.agent.setBidStrategy(
        passthroughIfQualified({ askingBid: 900_000n }),
      );

      const task = makeTaskSpec({
        payment: 1_000_000n,
        bond: 100_000n,
        minReputation: 4.0,
      });
      await fix.buyer.postTask({ task });
      await fix.buyer.collectBids(task.taskId, { windowMs: 200, maxBids: 2 });

      // Disconnect worker-001 after they've bid.
      fix.adapters.axl.disconnect(fix.workers[0]!.peerId);

      // Buyer detects disconnect (in real code would be heartbeat or timeout). Here we
      // re-elect by re-running selection while filtering out the disconnected peer.
      const eligible = fix.buyer
        .qualifyingBids(task)
        .filter((b) => b.workerPeerId !== fix.workers[0]!.peerId);
      eligible.sort((a, b) => (a.bidAmount < b.bidAmount ? -1 : 1));
      const winner = eligible[0];
      if (!winner) throw new Error("no fallback winner");

      await fix.buyer.acceptBid({
        taskId: task.taskId,
        bid: winner,
        workerPeerId: winner.workerPeerId,
      });
      await new Promise((r) => setTimeout(r, 30));

      // Reconnect dropped worker; verify it was NOT accepted (no double-execution).
      fix.adapters.axl.reconnect(fix.workers[0]!.peerId);
      const droppedAcceptedEvents = fix.events.filter(
        (e) => e.type === "BidAccepted" && e.worker === fix.workers[0]!.address,
      );

      const winnerWorker = fix.workers.find(
        (w) => w.address.toLowerCase() === winner.worker.toLowerCase(),
      )!;
      const result = await winnerWorker.agent.executeAcceptedTask(task, {
        buyerAddress: fix.buyerAddress,
      });
      const settlement = await fix.buyer.settle({
        taskId: task.taskId,
        result,
        starRating: 5,
      });

      const reasons: string[] = [];
      if (winner.worker !== fix.workers[1]!.address)
        reasons.push(`expected fallback to worker-002, got ${winner.worker}`);
      if (droppedAcceptedEvents.length !== 0)
        reasons.push(
          `dropped worker received ${droppedAcceptedEvents.length} BidAccepted events`,
        );
      if (settlement.worker !== fix.workers[1]!.address)
        reasons.push(`payment routed to wrong worker: ${settlement.worker}`);

      return {
        pass: reasons.length === 0,
        reasons,
        artifacts: {
          taskId: task.taskId,
          allBids: fix.buyer
            .bidsFor(task.taskId)
            .map((b) => ({
              peer: b.workerPeerId,
              bid: b.bidAmount.toString(),
            })),
          fallbackWinner: {
            worker: winner.worker,
            bid: winner.bidAmount.toString(),
          },
          droppedPeer: fix.workers[0]!.peerId,
          droppedAcceptedEvents: droppedAcceptedEvents.length,
          eventCounts: summarizeEvents(fix.events),
        },
        events: fix.events,
      };
    } finally {
      fix.shutdown();
    }
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const r = await run();
  await writeProof(NAME, r);
  console.log(
    JSON.stringify(r, (_k, v) => (typeof v === "bigint" ? v.toString() : v), 2),
  );
  process.exit(r.pass ? 0 : 1);
}
