// Scenario 9 — verifyAttestation() returns false (one-shot via the mock). Buyer rejects
// the result; bond is slashed; no payment released.
import {
  passthroughIfQualified,
  AttestationRejectedError,
} from "../sdk/index.js";
import {
  buildFixture,
  makeTaskSpec,
  runScenarioSafely,
  summarizeEvents,
  writeProof,
} from "./_lib.js";

export const NAME = "09_compute_attestation_failure_reject";

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

      // Configure the next verifyAttestation to fail.
      fix.adapters.compute.rejectNextAttestation();

      let caught: AttestationRejectedError | null = null;
      try {
        await fix.buyer.settle({ taskId: task.taskId, result, starRating: 5 });
      } catch (err) {
        if (err instanceof AttestationRejectedError) caught = err;
        else throw err;
      }

      const finalEscrow = fix.adapters.escrow.read(task.taskId);
      const reputationRecords = fix.adapters.reputation.summary(winner.worker);

      const reasons: string[] = [];
      if (!caught) reasons.push("expected AttestationRejectedError");
      if (finalEscrow.status !== "Slashed")
        reasons.push(`escrow status ${finalEscrow.status}`);
      if (reputationRecords.jobCount !== 47)
        reasons.push("reputation should not have advanced on rejection");

      return {
        pass: reasons.length === 0,
        reasons,
        artifacts: {
          taskId: task.taskId,
          slashTx: caught?.slashTxHash,
          escrowStatus: finalEscrow.status,
          attestationRejectedEvents: fix.events.filter(
            (e) => e.type === "AttestationRejected",
          ).length,
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
