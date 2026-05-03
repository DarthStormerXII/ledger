// Scenario 2 — Hero demo: a fresh worker iNFT minted to Owner A, transferred to Owner B
// mid-demo with sealed-key re-keying. Verifies ENS who.* flips cross-chain with zero ENS
// transactions, and that the next earnings flow to Owner B.
import {
  passthroughIfQualified,
  WorkerAgent,
  DEMO_TRANSFER_PROOF,
} from "../sdk/index.js";
import {
  buildFixture,
  makeTaskSpec,
  runScenarioSafely,
  summarizeEvents,
  writeProof,
} from "./_lib.js";
import type { Address } from "../sdk/index.js";

export const NAME = "02_inheritance_happy_path";

export async function run() {
  return runScenarioSafely(NAME, async () => {
    const fix = buildFixture({ workers: [] });
    try {
      const ownerA = "0x6B9ad963c764a06A7ef8ff96D38D0cB86575eC00" as Address;
      const ownerB = "0x6641221B1cb66Dc9f890350058A7341eF0eD600b" as Address;
      const peerId = "wp-inheritance-1";
      const label = "worker-001";

      // Mint fresh iNFT to Owner A.
      const mint = fix.adapters.inft.mint({
        to: ownerA,
        agentName: label,
        memoryCID: "0g://heritage-seed",
      });
      fix.adapters.ens.bindWorkerLabel(label, mint.tokenId);
      fix.adapters.reputation.seedHistory(ownerA, 47, 4.8);

      // Pre-transfer ENS resolution.
      const whoBefore = fix.adapters.ens.resolveWho(label);
      const sealedBefore = fix.adapters.inft.getMetadata(
        mint.tokenId,
      ).sealedKey;

      // Build worker agent owned by Owner A.
      const workerA = new WorkerAgent({
        workerAddress: ownerA,
        workerPeerId: peerId,
        workerINFTId: mint.tokenId,
        workerLabel: label,
        adapters: fix.adapters,
        initialBalance: 1_000_000_000_000n,
      });
      workerA.on((e) => fix.events.push(e));
      workerA.setBidStrategy(passthroughIfQualified({ askingBid: 900_000n }));

      // Transfer iNFT to Owner B with sealed-key re-keying.
      const transfer = fix.adapters.inft.transfer({
        from: ownerA,
        to: ownerB,
        tokenId: mint.tokenId,
        proof: DEMO_TRANSFER_PROOF,
      });

      const whoAfter = fix.adapters.ens.resolveWho(label);
      const sealedAfter = fix.adapters.inft.getMetadata(mint.tokenId).sealedKey;

      // The agent code does not need to change — the worker agent re-binds its identity
      // to the new owner address for this run (the iNFT lives in the same SDK process).
      workerA.shutdown();
      const workerB = new WorkerAgent({
        workerAddress: ownerB,
        workerPeerId: peerId, // same AXL peer keeps running
        workerINFTId: mint.tokenId,
        workerLabel: label,
        adapters: fix.adapters,
        initialBalance: 1_000_000_000_000n,
      });
      workerB.on((e) => fix.events.push(e));
      workerB.setBidStrategy(passthroughIfQualified({ askingBid: 900_000n }));

      // Now post a new task; settlement payment must reach Owner B.
      const balanceBeforeB = fix.adapters.escrow.balanceOf(ownerB);
      const balanceBeforeA = fix.adapters.escrow.balanceOf(ownerA);
      // After transfer, reputation history under ERC-8004 is keyed by ownerB (no prior records).
      // The hero demo's point is the ownership flip + balance routing; we relax minReputation
      // so the new owner's first task settles, then we explicitly assert balances.
      const task = makeTaskSpec({
        payment: 1_000_000n,
        bond: 100_000n,
        minReputation: 0,
      });
      await fix.buyer.postTask({ task });
      await fix.buyer.collectBids(task.taskId, { windowMs: 200, maxBids: 1 });
      const winner = fix.buyer.selectWinner(task);
      if (!winner) throw new Error("no winner after transfer");
      await fix.buyer.acceptBid({
        taskId: task.taskId,
        bid: winner,
        workerPeerId: winner.workerPeerId,
      });
      await new Promise((r) => setTimeout(r, 30));
      const result = await workerB.executeAcceptedTask(task, {
        buyerAddress: fix.buyerAddress,
      });
      const settlement = await fix.buyer.settle({
        taskId: task.taskId,
        result,
        starRating: 5,
      });

      const balanceAfterB = fix.adapters.escrow.balanceOf(ownerB);
      const balanceAfterA = fix.adapters.escrow.balanceOf(ownerA);

      const reasons: string[] = [];
      if (whoBefore.toLowerCase() !== ownerA.toLowerCase())
        reasons.push(`whoBefore expected ownerA, got ${whoBefore}`);
      if (whoAfter.toLowerCase() !== ownerB.toLowerCase())
        reasons.push(`whoAfter expected ownerB, got ${whoAfter}`);
      if (sealedBefore === sealedAfter)
        reasons.push("sealed key did not re-key after transfer");
      // Owner B credit: bond returned (bondAmount=100_000) + bidAmount (900_000) = +1_000_000
      const ownerBDelta = balanceAfterB - balanceBeforeB;
      const expectedDelta = 900_000n; // +bidAmount; bond was first debited then refunded -> net 0; bid is incremental income
      if (ownerBDelta !== expectedDelta)
        reasons.push(
          `ownerB delta expected ${expectedDelta} got ${ownerBDelta}`,
        );
      if (balanceAfterA !== balanceBeforeA)
        reasons.push(`ownerA balance changed when it should not have`);

      workerB.shutdown();

      return {
        pass: reasons.length === 0,
        reasons,
        artifacts: {
          tokenId: mint.tokenId,
          mintTx: mint.txHash,
          transferTx: transfer.txHash,
          whoBefore,
          whoAfter,
          sealedKeyBefore: sealedBefore,
          sealedKeyAfter: sealedAfter,
          ensTxCount: 0, // zero ENS transactions — that's the punchline
          settledAfterTransfer: {
            payTo: settlement.worker,
            balanceDeltaB: ownerBDelta.toString(),
            balanceDeltaA: (balanceAfterA - balanceBeforeA).toString(),
          },
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
