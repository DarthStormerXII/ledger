// Scenario 7 — Cross-chain eventual consistency. Payment lands on Galileo immediately;
// reputation feedback to ERC-8004 on Base Sepolia lags by ~3s. The dashboard sees
// `pending_reconcile` until reconciliation completes, then `synced` within 10s.
import { passthroughIfQualified } from "../sdk/index.js";
import {
  buildFixture,
  makeTaskSpec,
  runScenarioSafely,
  summarizeEvents,
  writeProof,
} from "./_lib.js";

export const NAME = "07_cross_chain_eventual_consistency";

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
      // Simulate 3s latency on Base Sepolia ERC-8004 writes.
      fix.adapters.reputation.setLatency(3_000);

      fix.workers[0]!.agent.setBidStrategy(
        passthroughIfQualified({ askingBid: 900_000n }),
      );
      const task = makeTaskSpec({
        payment: 1_000_000n,
        bond: 100_000n,
        minReputation: 4.0,
      });

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
      const result = await fix.workers[0]!.agent.executeAcceptedTask(task, {
        buyerAddress: fix.buyerAddress,
      });

      const t0 = Date.now();
      const settlement = await fix.buyer.settle({
        taskId: task.taskId,
        result,
        starRating: 5,
        eventualReputationConsistency: true,
      });
      const initialState = settlement.reputationReconcileState;

      // Wait for reconciliation; should complete within 10s.
      const start = Date.now();
      while (
        settlement.reputationReconcileState !== "synced" &&
        Date.now() - start < 10_000
      ) {
        await new Promise((r) => setTimeout(r, 100));
      }
      const reconcileMs = Date.now() - t0;
      const finalState = settlement.reputationReconcileState;

      const reasons: string[] = [];
      if (initialState !== "pending_reconcile")
        reasons.push(`initial state ${initialState}`);
      if (finalState !== "synced") reasons.push(`final state ${finalState}`);
      if (reconcileMs > 10_000)
        reasons.push(`reconcile took ${reconcileMs}ms (>10s)`);
      // Payment must have landed immediately, before reconciliation completed.
      if (!settlement.releaseTxHash)
        reasons.push("payment did not release immediately");

      return {
        pass: reasons.length === 0,
        reasons,
        artifacts: {
          taskId: task.taskId,
          initialState,
          finalState,
          reconcileMs,
          releaseTxHash: settlement.releaseTxHash,
          reputationFeedbackTxHash: settlement.reputationFeedbackTxHash,
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
