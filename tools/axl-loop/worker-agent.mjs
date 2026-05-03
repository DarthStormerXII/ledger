/**
 * Worker Agent — listens for TASK_POSTED on AXL #ledger-jobs and publishes BID.
 *
 * Each worker has an on-chain wallet (one of the 5 minted iNFT owners) and an
 * ERC-8004 reputation profile. The agent process subscribes to gossipsub,
 * computes a bid, and sends it directly to the buyer's peer over AXL.
 *
 * Run: WORKER_LABEL=worker-002 node tools/axl-loop/worker-agent.mjs
 *
 * Env:
 *   WORKER_LABEL       worker-001..worker-005 (must exist in seeded-workers.json)
 *   LEDGER_AXL_BRIDGE  default http://127.0.0.1:9002
 *   BUYER_PEER_ID      default = our own peer id (auction room polls this bridge)
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { LedgerAxlRuntime } from "../../agents/axl-runtime/dist/index.js";
import { AxlClient } from "../../agents/axl-client/dist/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");
const MANIFEST = JSON.parse(
  fs.readFileSync(path.join(REPO_ROOT, "proofs/data/seeded-workers.json"), "utf8")
);

const LABEL = process.env.WORKER_LABEL;
if (!LABEL) {
  console.error("WORKER_LABEL env required (e.g. worker-002)");
  process.exit(1);
}
const RECORD = MANIFEST.workers.find((w) => w.label === LABEL);
if (!RECORD) {
  console.error(`worker '${LABEL}' not found in seeded-workers.json`);
  process.exit(1);
}

const BRIDGE = process.env.LEDGER_AXL_BRIDGE ?? "http://127.0.0.1:9002";
const client = new AxlClient(BRIDGE);
const runtime = new LedgerAxlRuntime({ baseUrl: BRIDGE });

// Our own peer id IS the buyer's bridge — the auction room polls /api/axl/recv
// against this same bridge. Sending direct to our own peer puts the BID in our
// own /recv queue, which the AuctionRoomClient drains and renders.
const topology = await client.getTopology();
const BUYER_PEER_ID =
  process.env.BUYER_PEER_ID ?? topology.selfPeerId ?? topology.our_public_key;
if (!BUYER_PEER_ID) {
  console.error(
    `[${LABEL}] cannot resolve buyer peer id from topology: ${JSON.stringify(topology).slice(0, 200)}`
  );
  process.exit(1);
}

console.log(
  `[${LABEL}] tokenId=${RECORD.tokenId} agentId=${RECORD.erc8004AgentId} owner=${RECORD.galileoOwner.slice(
    0,
    8
  )}…`
);
console.log(`[${LABEL}] bridge=${BRIDGE} buyerPeer=${BUYER_PEER_ID.slice(0, 12)}…`);

const seen = new Set();

async function handleTaskPosted(msg) {
    const taskId = msg.taskId;
    if (seen.has(taskId)) return;
    seen.add(taskId);

    // Decision: bid only if the agent's reputation passes the gate.
    const minRep = BigInt(msg.task?.minReputation ?? "0");
    const ownRep = BigInt(Math.round(RECORD.targetReputation.average * 100)); // scaled 0..500
    if (ownRep * 100n < minRep) {
      console.log(
        `[${LABEL}] ↘ skipping ${taskId.slice(0, 12)}: rep gate ${minRep} > ours ${ownRep}`
      );
      return;
    }

    // Bid: discount the payment proportional to inverse reputation —
    // higher-rep agents bid lower (they can win cheaper).
    const payment = BigInt(msg.task?.payment ?? "0");
    if (payment === 0n) {
      console.log(`[${LABEL}] ↘ skipping ${taskId.slice(0, 12)}: payment=0`);
      return;
    }
    // Discount factor: 0.65–0.92 range, lower for better reputation.
    // worker-005 (4.87 avg) → most aggressive; worker-002 (4.59) → least aggressive.
    const repScore = Number(RECORD.targetReputation.average); // 4.59..4.87
    const discountBase = 0.65 + (5.0 - repScore) * 0.08; // 0.66..0.69
    const jitter = (Math.random() - 0.5) * 0.04; // ±2% sneeze
    const factor = Math.max(0.6, Math.min(0.95, discountBase + jitter));
    const bidAmount = (payment * BigInt(Math.round(factor * 1000))) / 1000n;

    // Tiny think-time so the auction room sees bids trickle in, not all at once.
    const delay = 600 + Math.random() * 1800;
    await new Promise((r) => setTimeout(r, delay));

    const bid = {
      type: "BID",
      version: "1.0",
      taskId,
      worker: RECORD.galileoOwner,
      workerINFTId: String(RECORD.tokenId),
      bidAmount: bidAmount.toString(),
      estimatedCompletionSeconds: 90 + Math.floor(Math.random() * 60),
      reputationProof: {
        agentId: String(RECORD.erc8004AgentId),
        ensName: RECORD.ensName,
        registry: "0x8004B663056A597Dffe9eCcC1965A193B7388713",
        avgRating: repScore,
        jobCount: RECORD.targetReputation.count,
      },
    };

    try {
      // (1) Real AXL submission — this is the gossipsub/direct AXL story.
      await runtime.submitBid(BUYER_PEER_ID, bid);
      // (2) Local sidecar feed so the auction room (which polls the bridge
      //     remotely from Vercel) actually sees the BID. AXL drops
      //     self-addressed messages from /recv, so a co-located bridge can't
      //     surface its own subscribers' BIDs without this fallback.
      fs.appendFileSync(BIDS_FEED, JSON.stringify(bid) + "\n");
      console.log(
        `[${LABEL}] ✓ BID ${(Number(bidAmount) / 1e18).toFixed(4)} 0G on ${taskId.slice(0, 12)}…`,
      );
    } catch (e) {
      console.error(`[${LABEL}] BID failed: ${e.message}`);
    }
}

// Two paths to receive TASK_POSTED:
//   (a) AXL gossipsub for remote-host publishers
//   (b) local file tail for co-located task-bridge publisher
await runtime.startPubSub({ onTaskPosted: handleTaskPosted });
console.log(`[${LABEL}] subscribed to #ledger-jobs over AXL`);

const TASK_FEED = path.resolve(__dirname, "../../tasks-feed.jsonl");
const BIDS_FEED = path.resolve(__dirname, "../../bids-feed.jsonl");
let pos = 0;
try {
  pos = fs.statSync(TASK_FEED).size;
} catch {
  /* file may not exist yet */
}
console.log(`[${LABEL}] tailing ${TASK_FEED} from byte ${pos}`);

setInterval(() => {
  let stat;
  try {
    stat = fs.statSync(TASK_FEED);
  } catch {
    return;
  }
  if (stat.size <= pos) return;
  const fd = fs.openSync(TASK_FEED, "r");
  const buf = Buffer.alloc(stat.size - pos);
  fs.readSync(fd, buf, 0, buf.length, pos);
  fs.closeSync(fd);
  pos = stat.size;
  for (const line of buf.toString().split("\n")) {
    if (!line.trim()) continue;
    try {
      const msg = JSON.parse(line);
      if (msg?.type === "TASK_POSTED") handleTaskPosted(msg);
    } catch {
      /* skip malformed */
    }
  }
}, 800);

process.on("SIGTERM", () => {
  console.log(`[${LABEL}] shutting down`);
  runtime.stopPubSub();
  process.exit(0);
});
