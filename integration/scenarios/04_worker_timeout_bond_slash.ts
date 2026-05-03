// Scenario 4 — Winning worker doesn't submit a result before deadline. Buyer slashBonds;
// worker bond + payment go to buyer; no result released.
import { passthroughIfQualified } from "../sdk/index.js";
import {
  buildFixture,
  makeTaskSpec,
  runScenarioSafely,
  summarizeEvents,
  writeProof,
} from "./_lib.js";

export const NAME = "04_worker_timeout_bond_slash";

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
      ],
    });
    try {
      fix.workers[0]!.agent.setBidStrategy(
        passthroughIfQualified({ askingBid: 900_000n }),
      );

      const task = makeTaskSpec({
        payment: 1_000_000n,
        bond: 100_000n,
        minReputation: 4.0,
      });
      const buyerBalBefore = fix.adapters.escrow.balanceOf(fix.buyerAddress);
      await fix.buyer.postTask({ task });
      await fix.buyer.collectBids(task.taskId, { windowMs: 200, maxBids: 1 });
      const winner = fix.buyer.selectWinner(task);
      if (!winner) throw new Error("no winner");
      await fix.buyer.acceptBid({
        taskId: task.taskId,
        bid: winner,
        workerPeerId: winner.workerPeerId,
      });
      await new Promise((r) => setTimeout(r, 30));

      // Worker pays bond but never submits a result.
      fix.adapters.escrow.acceptBid({
        sender: winner.worker,
        taskId: task.taskId,
        workerAddress: winner.worker,
        bidAmount: winner.bidAmount,
        bondAmount: task.bondRequirement,
        valueSent: task.bondRequirement,
      });

      // Time travel past deadline.
      fix.adapters.escrow.expireAllDeadlines();
      const slashTx = await fix.buyer.slashBond(task.taskId);

      const buyerBalAfter = fix.adapters.escrow.balanceOf(fix.buyerAddress);
      const final = fix.adapters.escrow.read(task.taskId);

      const reasons: string[] = [];
      if (final.status !== "Slashed")
        reasons.push(`escrow status ${final.status}`);
      // Buyer should have received: payment refund + bond = task.payment + task.bondRequirement
      const expected = buyerBalBefore + task.bondRequirement; // payment was already debited at postTask, refunded here, plus bond
      if (buyerBalAfter !== expected)
        reasons.push(
          `buyer balance: expected ${expected}, got ${buyerBalAfter}`,
        );

      return {
        pass: reasons.length === 0,
        reasons,
        artifacts: {
          taskId: task.taskId,
          slashTx,
          finalStatus: final.status,
          buyerBalanceDelta: (buyerBalAfter - buyerBalBefore).toString(),
          bondAmount: task.bondRequirement.toString(),
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
