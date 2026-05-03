// Scenario 10 — Two buyers post two distinct tasks at the same time. Three workers bid
// across both. Verify no cross-contamination: each task settles to its rightful worker,
// AXL message taskIds are unique, escrow accounting is correct.
import {
  BuyerAgent,
  WorkerAgent,
  passthroughIfQualified,
  createMockAdapters,
  StructuredLogger,
} from "../sdk/index.js";
import {
  makeTaskSpec,
  runScenarioSafely,
  summarizeEvents,
  writeProof,
} from "./_lib.js";
import type { Address, LedgerEvent, TaskSpec } from "../sdk/index.js";

export const NAME = "10_concurrent_tasks";

export async function run() {
  return runScenarioSafely(NAME, async () => {
    const adapters = createMockAdapters();
    const logger = new StructuredLogger({ silent: true });
    const events: LedgerEvent[] = [];

    const buyer1Addr = "0xb1B1B1B1B1B1B1B1B1B1B1B1B1B1B1B1B1B1B1B1" as Address;
    const buyer2Addr = "0xb2B2B2B2B2B2B2B2B2B2B2B2B2B2B2B2B2B2B2B2" as Address;

    const buyer1 = new BuyerAgent({
      buyerAddress: buyer1Addr,
      buyerPeerId: "buyer-1",
      adapters,
      logger,
      initialBalance: 1_000_000_000_000n,
    });
    const buyer2 = new BuyerAgent({
      buyerAddress: buyer2Addr,
      buyerPeerId: "buyer-2",
      adapters,
      logger,
      initialBalance: 1_000_000_000_000n,
    });
    buyer1.on((e) => events.push(e));
    buyer2.on((e) => events.push(e));

    const workersInput = [
      {
        address: "0x1111111111111111111111111111111111111111" as Address,
        peerId: "wp-1",
        label: "worker-001",
        bid: 700_000n,
        jobCount: 47,
        rating: 4.8,
      },
      {
        address: "0x2222222222222222222222222222222222222222" as Address,
        peerId: "wp-2",
        label: "worker-002",
        bid: 800_000n,
        jobCount: 30,
        rating: 4.7,
      },
      {
        address: "0x3333333333333333333333333333333333333333" as Address,
        peerId: "wp-3",
        label: "worker-003",
        bid: 850_000n,
        jobCount: 20,
        rating: 4.5,
      },
    ];
    const workers = workersInput.map((wi) => {
      const tokenId = adapters.inft.seedDemoWorker({
        owner: wi.address,
        agentName: wi.label,
        memoryCID: `0g://${wi.label}`,
      });
      adapters.ens.bindWorkerLabel(wi.label, tokenId);
      adapters.reputation.seedHistory(wi.address, wi.jobCount, wi.rating);
      const agent = new WorkerAgent({
        workerAddress: wi.address,
        workerPeerId: wi.peerId,
        workerINFTId: tokenId,
        workerLabel: wi.label,
        adapters,
        initialBalance: 1_000_000_000_000n,
      });
      agent.setBidStrategy(passthroughIfQualified({ askingBid: wi.bid }));
      agent.on((e) => events.push(e));
      return { ...wi, agent, tokenId };
    });

    try {
      const taskA = makeTaskSpec({
        payment: 1_000_000n,
        bond: 100_000n,
        minReputation: 4.0,
      });
      const taskB = makeTaskSpec({
        payment: 1_000_000n,
        bond: 100_000n,
        minReputation: 4.0,
      });

      // Concurrent posting.
      await Promise.all([
        buyer1.postTask({ task: taskA }),
        buyer2.postTask({ task: taskB }),
      ]);

      // Wait for bids to settle on both tasks.
      const [bidsA, bidsB] = await Promise.all([
        buyer1.collectBids(taskA.taskId, { windowMs: 250, maxBids: 3 }),
        buyer2.collectBids(taskB.taskId, { windowMs: 250, maxBids: 3 }),
      ]);
      const bidsAByTask = bidsA.length;
      const bidsBByTask = bidsB.length;

      // Each buyer picks their own lowest bid.
      const winnerA = buyer1.selectWinner(taskA);
      const winnerB = buyer2.selectWinner(taskB);
      if (!winnerA || !winnerB) throw new Error("missing winner");

      const settleOne = async (
        buyer: BuyerAgent,
        task: TaskSpec,
        winner: NonNullable<ReturnType<BuyerAgent["selectWinner"]>>,
        buyerAddress: Address,
      ) => {
        const winnerWorker = workers.find(
          (w) => w.address.toLowerCase() === winner.worker.toLowerCase(),
        )!;
        await buyer.acceptBid({
          taskId: task.taskId,
          bid: winner,
          workerPeerId: winner.workerPeerId,
        });
        await new Promise((r) => setTimeout(r, 30));
        const result = await winnerWorker.agent.executeAcceptedTask(task, {
          buyerAddress,
        });
        return buyer.settle({ taskId: task.taskId, result, starRating: 5 });
      };

      // Two settlements concurrently. Either order is acceptable; what matters is no cross-contamination.
      const [settA, settB] = await Promise.all([
        settleOne(buyer1, taskA, winnerA, buyer1Addr),
        settleOne(buyer2, taskB, winnerB, buyer2Addr),
      ]);

      const reasons: string[] = [];
      if (settA.taskId !== taskA.taskId)
        reasons.push(`taskA crossed: ${settA.taskId}`);
      if (settB.taskId !== taskB.taskId)
        reasons.push(`taskB crossed: ${settB.taskId}`);
      if (settA.worker !== winnerA.worker)
        reasons.push(`taskA paid wrong worker`);
      if (settB.worker !== winnerB.worker)
        reasons.push(`taskB paid wrong worker`);
      // taskIds in AXL message log must all be unique to their task.
      const allTaskIds = new Set(
        adapters.axl.messageLog.map((m) => m.payload.taskId),
      );
      if (!(allTaskIds.has(taskA.taskId) && allTaskIds.has(taskB.taskId))) {
        reasons.push("AXL messageLog missing one of the taskIds");
      }
      // No message must reference both tasks.
      const mismatch = adapters.axl.messageLog.find(
        (m) =>
          m.payload.taskId !== taskA.taskId &&
          m.payload.taskId !== taskB.taskId,
      );
      if (mismatch)
        reasons.push(
          `unexpected taskId in messageLog: ${mismatch.payload.taskId}`,
        );
      // Escrow accounting: both must be Released.
      if (adapters.escrow.read(taskA.taskId).status !== "Released")
        reasons.push("taskA not released");
      if (adapters.escrow.read(taskB.taskId).status !== "Released")
        reasons.push("taskB not released");

      return {
        pass: reasons.length === 0,
        reasons,
        artifacts: {
          taskA: {
            id: taskA.taskId,
            winner: settA.worker,
            releaseTx: settA.releaseTxHash,
          },
          taskB: {
            id: taskB.taskId,
            winner: settB.worker,
            releaseTx: settB.releaseTxHash,
          },
          axlMessageCount: adapters.axl.messageLog.length,
          uniqueTaskIdsSeen: allTaskIds.size,
          bidsCollectedPerTask: { A: bidsAByTask, B: bidsBByTask },
          eventCounts: summarizeEvents(events),
        },
        events,
      };
    } finally {
      buyer1.shutdown();
      buyer2.shutdown();
      for (const w of workers) w.agent.shutdown();
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
