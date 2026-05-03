// Scenario 5 — 3 workers all qualified; lowest bid wins.
import { passthroughIfQualified } from "../sdk/index.js";
import {
  buildFixture,
  makeTaskSpec,
  runScenarioSafely,
  summarizeEvents,
  writeProof,
} from "./_lib.js";

export const NAME = "05_multi_bid_lowest_wins";

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
        {
          address:
            "0x3333333333333333333333333333333333333333" as `0x${string}`,
          peerId: "wp-3",
          label: "worker-003",
          jobCount: 20,
          avgRating: 4.5,
        },
      ],
    });
    try {
      // Bids: 480_000 / 460_000 / 450_000 USDC-equivalent (we use raw bigint, scaled).
      fix.workers[0]!.agent.setBidStrategy(
        passthroughIfQualified({ askingBid: 480_000n }),
      );
      fix.workers[1]!.agent.setBidStrategy(
        passthroughIfQualified({ askingBid: 460_000n }),
      );
      fix.workers[2]!.agent.setBidStrategy(
        passthroughIfQualified({ askingBid: 450_000n }),
      );

      const task = makeTaskSpec({
        payment: 500_000n,
        bond: 50_000n,
        minReputation: 4.0,
      });
      await fix.buyer.postTask({ task });
      const bids = await fix.buyer.collectBids(task.taskId, {
        windowMs: 200,
        maxBids: 3,
      });
      const winner = fix.buyer.selectWinner(task);

      const reasons: string[] = [];
      if (bids.length !== 3)
        reasons.push(`expected 3 bids, got ${bids.length}`);
      if (!winner) reasons.push("no winner");
      else {
        if (winner.bidAmount !== 450_000n)
          reasons.push(`expected lowest 450_000, got ${winner.bidAmount}`);
        if (winner.worker !== fix.workers[2]!.address)
          reasons.push(`expected worker-003 to win, got ${winner.worker}`);
      }

      return {
        pass: reasons.length === 0,
        reasons,
        artifacts: {
          taskId: task.taskId,
          bids: bids.map((b) => ({
            worker: b.worker,
            bid: b.bidAmount.toString(),
          })),
          winner: winner
            ? { worker: winner.worker, bid: winner.bidAmount.toString() }
            : null,
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
