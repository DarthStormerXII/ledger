/**
 * Task Bridge — Galileo `LedgerEscrow.TaskPosted` → AXL `#ledger-jobs` gossipsub.
 *
 * Watches the on-chain escrow contract for new tasks. When one lands, publishes
 * a TASK_POSTED LedgerAxlMessage onto the AXL gossipsub topic via the local
 * bridge so worker agents subscribed on the topic can react and bid.
 *
 * Run: node tools/axl-loop/task-bridge.mjs
 *
 * Env:
 *   LEDGER_AXL_BRIDGE  default http://127.0.0.1:9002
 *   GALILEO_RPC        default https://evmrpc-testnet.0g.ai
 */

import { createPublicClient, http, parseAbiItem } from "viem";
import { LedgerAxlRuntime, LEDGER_JOBS_TOPIC } from "../../agents/axl-runtime/dist/index.js";

const ESCROW = "0x12D2162F47AAAe1B0591e898648605daA186D644";
const RPC = process.env.GALILEO_RPC ?? "https://evmrpc-testnet.0g.ai";
const BRIDGE = process.env.LEDGER_AXL_BRIDGE ?? "http://127.0.0.1:9002";

const galileo = {
  id: 16602,
  name: "0G Galileo",
  nativeCurrency: { name: "0G", symbol: "0G", decimals: 18 },
  rpcUrls: { default: { http: [RPC] } },
};

const client = createPublicClient({ chain: galileo, transport: http(RPC) });
const runtime = new LedgerAxlRuntime({ baseUrl: BRIDGE });

const TaskPostedEvent = parseAbiItem(
  "event TaskPosted(bytes32 indexed taskId, address indexed buyer, uint256 payment, uint256 deadline, uint256 minReputation)"
);

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TASK_FEED = path.resolve(__dirname, "../../tasks-feed.jsonl");

async function publish(taskId, buyer, payment, deadline, minReputation) {
  const message = {
    type: "TASK_POSTED",
    version: "1.0",
    taskId,
    buyer,
    task: {
      title: `Task ${taskId.slice(0, 10)}`,
      payment: payment.toString(),
      minReputation: minReputation.toString(),
      deadlineSeconds: Number(deadline) - Math.floor(Date.now() / 1000),
    },
    postedAt: Math.floor(Date.now() / 1000),
  };
  // (a) Publish to AXL gossipsub — fans out to all remote peers (sjc + fra).
  try {
    await runtime.postTask(message);
    console.log(
      `[bridge] → TASK_POSTED gossipsub: ${taskId.slice(0, 14)}… buyer=${buyer.slice(0, 8)}… payment=${payment}`
    );
  } catch (e) {
    console.error(`[bridge] gossipsub publish failed: ${e.message}`);
  }
  // (b) Local IPC fallback for co-located worker subscribers. The TS gossipsub
  // layer is fully implemented inside JS — there's no JS process on sjc/fra
  // to rebroadcast back to us, so subscribers on this same host wouldn't
  // otherwise see their own publisher's messages. The file-tail covers that
  // gap without compromising the gossipsub fanout already happening to
  // remote nodes.
  try {
    fs.appendFileSync(TASK_FEED, JSON.stringify(message) + "\n");
  } catch (e) {
    console.error(`[bridge] feed write failed: ${e.message}`);
  }
}

console.log(`[bridge] watching ${ESCROW} on Galileo via ${RPC}`);
console.log(`[bridge] publishing to AXL bridge ${BRIDGE} topic ${LEDGER_JOBS_TOPIC}`);

// First: catch up on tasks posted in the last 200 blocks (so a recent /post still triggers bidding).
try {
  const head = await client.getBlockNumber();
  const fromBlock = head > 200n ? head - 200n : 0n;
  const logs = await client.getLogs({
    address: ESCROW,
    event: TaskPostedEvent,
    fromBlock,
    toBlock: head,
  });
  console.log(`[bridge] backfill: ${logs.length} TaskPosted events from block ${fromBlock} to ${head}`);
  for (const log of logs) {
    if (!log.args) continue;
    await publish(
      log.args.taskId,
      log.args.buyer,
      log.args.payment ?? 0n,
      log.args.deadline ?? 0n,
      log.args.minReputation ?? 0n
    );
  }
} catch (e) {
  console.error(`[bridge] backfill failed: ${e.message}`);
}

// Then: watch live.
const unwatch = client.watchEvent({
  address: ESCROW,
  event: TaskPostedEvent,
  pollingInterval: 2_000,
  onLogs: async (logs) => {
    for (const log of logs) {
      if (!log.args) continue;
      await publish(
        log.args.taskId,
        log.args.buyer,
        log.args.payment ?? 0n,
        log.args.deadline ?? 0n,
        log.args.minReputation ?? 0n
      );
    }
  },
});

process.on("SIGTERM", () => {
  console.log("[bridge] shutting down");
  unwatch();
  runtime.stopPubSub();
  process.exit(0);
});
