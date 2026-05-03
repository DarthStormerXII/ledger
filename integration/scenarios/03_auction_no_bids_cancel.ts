// Scenario 3 — Buyer posts a task with min reputation higher than any current worker;
// no bids qualify; buyer cancels; escrow refunds buyer.
import { passthroughIfQualified } from "../sdk/index.js";
import {
  buildFixture,
  makeTaskSpec,
  runScenarioSafely,
  summarizeEvents,
  writeProof,
} from "./_lib.js";

export const NAME = "03_auction_no_bids_cancel";

export async function run() {
  return runScenarioSafely(NAME, async () => {
    const fix = buildFixture({
      workers: [
        {
          address:
            "0x1111111111111111111111111111111111111111" as `0x${string}`,
          peerId: "wp-1",
          label: "worker-001",
          jobCount: 5,
          avgRating: 3.0,
        },
        {
          address:
            "0x2222222222222222222222222222222222222222" as `0x${string}`,
          peerId: "wp-2",
          label: "worker-002",
          jobCount: 3,
          avgRating: 3.5,
        },
      ],
    });
    try {
      // Workers do bid, but buyer's minReputation gates them out.
      fix.workers[0]!.agent.setBidStrategy(
        passthroughIfQualified({ askingBid: 800_000n }),
      );
      fix.workers[1]!.agent.setBidStrategy(
        passthroughIfQualified({ askingBid: 850_000n }),
      );

      const task = makeTaskSpec({
        payment: 1_000_000n,
        bond: 100_000n,
        minReputation: 4.9,
      });
      const balanceBefore = fix.adapters.escrow.balanceOf(fix.buyerAddress);
      const { txHash: postTx } = await fix.buyer.postTask({ task });

      const bids = await fix.buyer.collectBids(task.taskId, { windowMs: 200 });
      const winner = fix.buyer.selectWinner(task);

      const cancelTx = await fix.buyer.cancelTask(task.taskId);
      const balanceAfter = fix.adapters.escrow.balanceOf(fix.buyerAddress);
      const final = fix.adapters.escrow.read(task.taskId);

      const reasons: string[] = [];
      if (winner !== null)
        reasons.push(`expected no qualifying winner, got ${winner.worker}`);
      if (final.status !== "Cancelled")
        reasons.push(`escrow status ${final.status}`);
      if (balanceAfter !== balanceBefore)
        reasons.push(
          `buyer not refunded: before=${balanceBefore} after=${balanceAfter}`,
        );

      return {
        pass: reasons.length === 0,
        reasons,
        artifacts: {
          taskId: task.taskId,
          postTx,
          cancelTx,
          bidsReceived: bids.length,
          qualifyingBids: fix.buyer.qualifyingBids(task).length,
          finalStatus: final.status,
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
