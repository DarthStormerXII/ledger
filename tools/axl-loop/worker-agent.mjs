/**
 * Worker Agent — listens for TASK_POSTED on AXL #ledger-jobs and publishes BID.
 *
 * Each worker subscribes to gossipsub, computes a bid, and sends it directly
 * to the buyer's peer over AXL.
 *
 * One worker can additionally drive the on-chain lifecycle when LEDGER_WORKER_LEAD=1
 * and LEDGER_WORKER_PRIVATE_KEY is present:
 *
 *   1. After a quiet period (so other workers' bids land in the AXL feed for
 *      the visual auction), call LedgerEscrow.acceptTokenBid on Galileo,
 *      flipping the task status from Posted → Accepted.
 *   2. Emit BID_ACCEPTED on AXL so the auction room can render the takeover.
 *   3. After a short "work" delay, emit WORK_COMPLETE on AXL so the buyer
 *      sees the agent reporting done.
 *
 * The buyer then clicks "Release Funds" in the UI to call releasePayment.
 *
 * Run: WORKER_LABEL=worker-001 LEDGER_WORKER_LEAD=1 LEDGER_WORKER_PRIVATE_KEY=0x... \
 *      node tools/axl-loop/worker-agent.mjs
 *
 * Env:
 *   WORKER_LABEL              worker-001..worker-005 (must exist in seeded-workers.json)
 *   LEDGER_AXL_BRIDGE         default http://127.0.0.1:9002
 *   BUYER_PEER_ID             default = our own peer id (auction room polls this bridge)
 *   LEDGER_WORKER_LEAD        "1" → this worker also drives on-chain accept
 *   LEDGER_WORKER_PRIVATE_KEY hex private key for the leading worker (signs acceptTokenBid)
 *   LEDGER_ESCROW_ADDRESS     override default Galileo escrow contract
 *   LEDGER_GALILEO_RPC        default https://evmrpc-testnet.0g.ai
 *   LEDGER_BID_FACTOR         override the bid discount factor (0..1) — leader pins to 0.55 by default
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  createWalletClient,
  createPublicClient,
  http,
  parseAbi,
  parseEther,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { defineChain } from "viem";
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

// Lead-worker on-chain settings
const IS_LEAD = process.env.LEDGER_WORKER_LEAD === "1";
const ONCHAIN_PK = process.env.LEDGER_WORKER_PRIVATE_KEY ?? "";
const ESCROW_ADDR =
  process.env.LEDGER_ESCROW_ADDRESS ??
  "0x83dF0Ed0b4f3D1D057cB56494b8c7eE417265489";
const GALILEO_RPC =
  process.env.LEDGER_GALILEO_RPC ?? "https://evmrpc-testnet.0g.ai";

const galileo = defineChain({
  id: 16602,
  name: "0G Galileo",
  nativeCurrency: { name: "0G", symbol: "0G", decimals: 18 },
  rpcUrls: { default: { http: [GALILEO_RPC] } },
});

const ESCROW_ABI = parseAbi([
  "function tasks(bytes32 taskId) view returns (address buyer, address worker, uint256 payment, uint256 deadline, uint256 minReputation, uint256 bidAmount, uint256 bondAmount, bytes32 resultHash, uint8 status)",
  "function acceptTokenBid(bytes32 taskId, uint256 workerTokenId, uint256 bidAmount, uint256 bondAmount) external payable",
]);

let walletClient = null;
let publicClient = null;
let onchainAccount = null;
if (IS_LEAD && ONCHAIN_PK) {
  const pk = ONCHAIN_PK.startsWith("0x") ? ONCHAIN_PK : `0x${ONCHAIN_PK}`;
  onchainAccount = privateKeyToAccount(pk);
  walletClient = createWalletClient({
    account: onchainAccount,
    chain: galileo,
    transport: http(GALILEO_RPC, { retryCount: 5, timeout: 30_000 }),
  });
  publicClient = createPublicClient({
    chain: galileo,
    transport: http(GALILEO_RPC, { retryCount: 5, timeout: 30_000 }),
  });
  if (onchainAccount.address.toLowerCase() !== RECORD.galileoOwner.toLowerCase()) {
    console.error(
      `[${LABEL}] LEAD MODE FATAL: derived address ${onchainAccount.address} does not match seeded owner ${RECORD.galileoOwner}. iNFT.ownerOf(tokenId) check in acceptTokenBid will revert.`
    );
    process.exit(1);
  }
  console.log(`[${LABEL}] LEAD on-chain account: ${onchainAccount.address}`);
}

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

const TASK_FEED = path.resolve(__dirname, "../../tasks-feed.jsonl");
const BIDS_FEED = path.resolve(__dirname, "../../bids-feed.jsonl");

const seen = new Set();

async function handleTaskPosted(msg) {
  const taskId = msg.taskId;
  if (seen.has(taskId)) return;
  seen.add(taskId);

  // Decision: bid only if the agent's reputation passes the gate.
  const minRep = BigInt(msg.task?.minReputation ?? "0");
  const ownRep = BigInt(Math.round(RECORD.targetReputation.average * 100));
  if (ownRep * 100n < minRep) {
    console.log(
      `[${LABEL}] ↘ skipping ${taskId.slice(0, 12)}: rep gate ${minRep} > ours ${ownRep}`
    );
    return;
  }

  const payment = BigInt(msg.task?.payment ?? "0");
  if (payment === 0n) {
    console.log(`[${LABEL}] ↘ skipping ${taskId.slice(0, 12)}: payment=0`);
    return;
  }

  // Lead worker bids deterministically lower than everyone else (factor 0.55
  // vs others' 0.65–0.69) so it consistently wins the visual auction. Any
  // worker can override via LEDGER_BID_FACTOR.
  const repScore = Number(RECORD.targetReputation.average);
  const explicitFactor = process.env.LEDGER_BID_FACTOR
    ? Number(process.env.LEDGER_BID_FACTOR)
    : null;
  const factor =
    explicitFactor != null
      ? explicitFactor
      : IS_LEAD
        ? 0.55
        : Math.max(
            0.6,
            Math.min(0.95, 0.65 + (5.0 - repScore) * 0.08 + (Math.random() - 0.5) * 0.04),
          );
  const bidAmount = (payment * BigInt(Math.round(factor * 1000))) / 1000n;

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
    await runtime.submitBid(BUYER_PEER_ID, bid);
    fs.appendFileSync(BIDS_FEED, JSON.stringify(bid) + "\n");
    console.log(
      `[${LABEL}] ✓ BID ${(Number(bidAmount) / 1e18).toFixed(4)} 0G on ${taskId.slice(0, 12)}…`,
    );
  } catch (e) {
    console.error(`[${LABEL}] BID failed: ${e.message}`);
    return;
  }

  // Lead worker: schedule on-chain accept after the auction window plus
  // emit progress messages so the auction room shows the lifecycle.
  if (IS_LEAD && walletClient && publicClient) {
    scheduleOnChainAccept(taskId, bidAmount).catch((e) =>
      console.error(`[${LABEL}] lifecycle error on ${taskId.slice(0, 12)}: ${e.message}`),
    );
  }
}

async function scheduleOnChainAccept(taskId, bidAmount) {
  // Wait ~28s for sibling bids to publish in the visual auction. Workers 2/3/5
  // typically post within 1–3s, so 28s gives the UI plenty of time to
  // render all three before our on-chain action lands.
  const ACCEPT_DELAY_MS = 28_000;
  await new Promise((r) => setTimeout(r, ACCEPT_DELAY_MS));

  // Read current task state — abort if not still in Posted.
  const taskTuple = await publicClient.readContract({
    address: ESCROW_ADDR,
    abi: ESCROW_ABI,
    functionName: "tasks",
    args: [taskId],
  });
  // Status enum: 0 None, 1 Posted, 2 Accepted, 3 Released, 4 Cancelled, 5 Slashed
  const status = Number(taskTuple[8]);
  if (status !== 1) {
    console.log(
      `[${LABEL}] ↘ skip on-chain accept for ${taskId.slice(0, 12)}: status=${status} (not Posted)`,
    );
    return;
  }

  // Bond is small fixed amount (0.0001 OG) — cheap, demonstrative, never
  // exceeds bidAmount per contract require.
  const bondAmount = parseEther("0.0001");
  if (bondAmount >= bidAmount) {
    console.log(
      `[${LABEL}] ↘ skip on-chain accept: bond=${bondAmount} ≥ bid=${bidAmount} would revert`,
    );
    return;
  }

  console.log(
    `[${LABEL}] → acceptTokenBid(${taskId.slice(0, 12)}, tokenId=${RECORD.tokenId}, bid=${(Number(bidAmount) / 1e18).toFixed(4)} OG, bond=0.0001 OG)`,
  );
  let txHash;
  try {
    txHash = await walletClient.writeContract({
      address: ESCROW_ADDR,
      abi: ESCROW_ABI,
      functionName: "acceptTokenBid",
      args: [taskId, BigInt(RECORD.tokenId), bidAmount, bondAmount],
      value: bondAmount,
    });
    console.log(`[${LABEL}] ✓ acceptTokenBid sent: ${txHash}`);
  } catch (e) {
    console.error(`[${LABEL}] ✗ acceptTokenBid failed: ${e.message}`);
    return;
  }

  // Emit BID_ACCEPTED so the auction room sees the takeover before the
  // SSR cache catches up.
  appendAxlEvent({
    type: "BID_ACCEPTED",
    taskId,
    worker: RECORD.galileoOwner,
    workerINFTId: String(RECORD.tokenId),
    bidAmount: bidAmount.toString(),
    bondAmount: bondAmount.toString(),
    onchainTx: txHash,
    ts: new Date().toISOString(),
  });

  try {
    await publicClient.waitForTransactionReceipt({
      hash: txHash,
      timeout: 60_000,
    });
  } catch {
    console.warn(`[${LABEL}] receipt wait timed out for ${txHash} — continuing`);
  }

  // Simulate work: emit WORK_STARTED → wait → WORK_COMPLETE so the
  // auction room shows the agent making progress.
  appendAxlEvent({
    type: "WORK_STARTED",
    taskId,
    worker: RECORD.galileoOwner,
    estimatedCompletionSeconds: 18,
    ts: new Date().toISOString(),
  });
  await new Promise((r) => setTimeout(r, 18_000));
  appendAxlEvent({
    type: "WORK_COMPLETE",
    taskId,
    worker: RECORD.galileoOwner,
    resultSummary: `Task delivered by ${RECORD.ensName}. Buyer can release funds.`,
    ts: new Date().toISOString(),
  });
  console.log(`[${LABEL}] ✓ WORK_COMPLETE for ${taskId.slice(0, 12)} — buyer can release`);
}

function appendAxlEvent(event) {
  // Reuse BIDS_FEED for all auction events. The /api/axl/recv handler reads
  // every line of this file and forwards them to the UI; the UI's MeshLog +
  // status code paths discriminate by `type`.
  try {
    fs.appendFileSync(BIDS_FEED, JSON.stringify(event) + "\n");
  } catch (e) {
    console.error(`[${LABEL}] feed write failed: ${e.message}`);
  }
}

// Two paths to receive TASK_POSTED:
//   (a) AXL gossipsub for remote-host publishers
//   (b) local file tail for co-located task-bridge publisher
await runtime.startPubSub({ onTaskPosted: handleTaskPosted });
console.log(`[${LABEL}] subscribed to #ledger-jobs over AXL`);

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
