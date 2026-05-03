// Scenario 6 — One worker qualifies (4.7 avg), one is below threshold (3.5 avg) and is
// rejected by the buyer's qualifyingBids filter. Auction terminates with only the
// qualifying winner.
import { passthroughIfQualified } from "../sdk/index.js";
import {
  buildFixture,
  makeTaskSpec,
  runScenarioSafely,
  summarizeEvents,
  writeProof,
} from "./_lib.js";

export const NAME = "06_reputation_gating";

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
          avgRating: 4.7,
        },
        {
          address:
            "0x2222222222222222222222222222222222222222" as `0x${string}`,
          peerId: "wp-2",
          label: "worker-002",
          jobCount: 8,
          avgRating: 3.5,
        },
      ],
    });
    try {
      // Both workers WILL bid (passthrough doesn't gate from worker side); the buyer's
      // selection logic enforces minReputation = 4.0.
      fix.workers[0]!.agent.setBidStrategy(
        passthroughIfQualified({ askingBid: 900_000n }),
      );
      fix.workers[1]!.agent.setBidStrategy(
        passthroughIfQualified({ askingBid: 800_000n }),
      ); // tries to undercut

      const task = makeTaskSpec({
        payment: 1_000_000n,
        bond: 100_000n,
        minReputation: 4.0,
      });
      await fix.buyer.postTask({ task });
      const bids = await fix.buyer.collectBids(task.taskId, {
        windowMs: 200,
        maxBids: 2,
      });
      const eligible = fix.buyer.qualifyingBids(task);
      const winner = fix.buyer.selectWinner(task);

      const reasons: string[] = [];
      if (bids.length !== 2)
        reasons.push(`expected 2 bids submitted, got ${bids.length}`);
      if (eligible.length !== 1)
        reasons.push(`expected 1 qualifying bid, got ${eligible.length}`);
      if (!winner) reasons.push("no winner");
      else if (winner.worker !== fix.workers[0]!.address) {
        reasons.push(`expected worker-001 (4.7) to win, got ${winner.worker}`);
      }

      return {
        pass: reasons.length === 0,
        reasons,
        artifacts: {
          taskId: task.taskId,
          bids: bids.map((b) => ({
            worker: b.worker,
            bid: b.bidAmount.toString(),
            avgRating: b.reputation.avgRating,
          })),
          eligible: eligible.length,
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
