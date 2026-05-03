// Scenario 1 — Happy path: 1 buyer, 2 workers, lowest qualifying bid wins, settlement,
// ERC-8004 reputation +1.
import { passthroughIfQualified } from "../sdk/index.js";
import {
  buildFixture,
  makeTaskSpec,
  runScenarioSafely,
  writeProof,
  summarizeEvents,
} from "./_lib.js";

export const NAME = "01_happy_path_full_lifecycle";

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
      const task = makeTaskSpec({
        payment: 1_000_000n,
        bond: 100_000n,
        minReputation: 4.0,
      });
      fix.workers[0]!.agent.setBidStrategy(
        passthroughIfQualified({ askingBid: 950_000n, minRating: 4.8 }),
      );
      fix.workers[1]!.agent.setBidStrategy(
        passthroughIfQualified({ askingBid: 900_000n, minRating: 4.6 }),
      );

      const { txHash: postTx } = await fix.buyer.postTask({ task });
      const bids = await fix.buyer.collectBids(task.taskId, {
        windowMs: 200,
        maxBids: 2,
      });
      const winner = fix.buyer.selectWinner(task);
      if (!winner) return fail(["no winner selected"], fix);
      const winnerWorker = fix.workers.find(
        (w) => w.address.toLowerCase() === winner.worker.toLowerCase(),
      )!;
      await fix.buyer.acceptBid({
        taskId: task.taskId,
        bid: winner,
        workerPeerId: winner.workerPeerId,
      });
      // small wait for AXL roundtrip in mock bus
      await new Promise((r) => setTimeout(r, 30));
      const result = await winnerWorker.agent.executeAcceptedTask(task, {
        buyerAddress: fix.buyerAddress,
      });
      const settlement = await fix.buyer.settle({
        taskId: task.taskId,
        result,
        starRating: 5,
      });

      const reasons: string[] = [];
      if (bids.length !== 2)
        reasons.push(`expected 2 bids, got ${bids.length}`);
      if (winner.bidAmount !== 900_000n)
        reasons.push(`expected lowest bid 900_000, got ${winner.bidAmount}`);
      if (settlement.reputationReconcileState !== "synced")
        reasons.push("expected synced reputation");
      const repAfter = fix.adapters.reputation.summary(winner.worker);
      if (
        repAfter.jobCount !==
        (winnerWorker.address === fix.workers[0]!.address ? 48 : 31)
      ) {
        reasons.push(`reputation jobCount unexpected: ${repAfter.jobCount}`);
      }
      const escrowState = fix.adapters.escrow.read(task.taskId);
      if (escrowState.status !== "Released")
        reasons.push(`escrow status ${escrowState.status}`);

      return {
        pass: reasons.length === 0,
        reasons,
        artifacts: {
          taskId: task.taskId,
          postTx,
          bids: bids.map((b) => ({
            worker: b.worker,
            bid: b.bidAmount.toString(),
          })),
          winner: { worker: winner.worker, bid: winner.bidAmount.toString() },
          settlement: {
            release: settlement.releaseTxHash,
            feedback: settlement.reputationFeedbackTxHash,
            payment: settlement.payment.toString(),
            bidAmount: settlement.bidAmount.toString(),
            bondAmount: settlement.bondAmount.toString(),
          },
          reputation: { ...repAfter, worker: winner.worker },
          eventCounts: summarizeEvents(fix.events),
        },
        events: fix.events,
      };
    } finally {
      fix.shutdown();
    }
  });
}

function fail(reasons: string[], fix: ReturnType<typeof buildFixture>) {
  return { pass: false, reasons, artifacts: {}, events: fix.events };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const r = await run();
  await writeProof(NAME, r);
  console.log(
    JSON.stringify(r, (_k, v) => (typeof v === "bigint" ? v.toString() : v), 2),
  );
  process.exit(r.pass ? 0 : 1);
}
