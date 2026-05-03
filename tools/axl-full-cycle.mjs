import { AxlClient } from "../agents/axl-client/dist/index.js";
import { GossipSubChannel } from "../agents/axl-gossipsub/dist/index.js";

const peerIds = {
  bootstrap: "a560b12fe6e16b1c8a94bb99b3019fa6d5f490474c275a31848f022df3a170eb",
  worker: "f274bf0f8dadfa028b75f73cf7b29c927ded368b6703caf403abdb0d9aa1fa64",
  local: "590fa3b614da78d5e50939f708dea209e5cfb5e7ae69f1220611d8eefcc95f4c",
};

const clients = {
  bootstrap: new AxlClient(process.env.AXL_BOOTSTRAP_URL ?? "http://127.0.0.1:9101"),
  worker: new AxlClient(process.env.AXL_WORKER_URL ?? "http://127.0.0.1:9102"),
  local: new AxlClient(process.env.AXL_LOCAL_URL ?? "http://127.0.0.1:9002"),
};

const taskId = `0x${Buffer.from(`ledger-full-cycle-${Date.now()}`).toString("hex").slice(0, 64)}`;
const events = [];

await drainQueues();
await publishAndObserve("#ledger-jobs", {
  type: "TASK_POSTED",
  version: "1.0",
  taskId,
  buyer: "0xBuyer",
  task: { title: "AXL full-cycle proof", deadlineSeconds: 120 },
  postedAt: Math.floor(Date.now() / 1000),
});

await sendDirect("worker", "bootstrap", {
  type: "BID",
  version: "1.0",
  taskId,
  worker: "0xWorkerFra",
  workerINFTId: "1",
  bidAmount: "4500000",
});
await sendDirect("local", "bootstrap", {
  type: "BID",
  version: "1.0",
  taskId,
  worker: "0xWorkerLocal",
  workerINFTId: "2",
  bidAmount: "4700000",
});
await receiveDirect("bootstrap", "BID");
await receiveDirect("bootstrap", "BID");

await sendDirect("bootstrap", "worker", {
  type: "BID_ACCEPTED",
  version: "1.0",
  taskId,
  selectedWorker: "0xWorkerFra",
  acceptedBidAmount: "4500000",
});
await receiveDirect("worker", "BID_ACCEPTED");

await publishAndObserve("#ledger-auction-closed", {
  type: "AUCTION_CLOSED",
  version: "1.0",
  taskId,
  buyer: "0xBuyer",
  selectedWorker: "0xWorkerFra",
  closedAt: Math.floor(Date.now() / 1000),
});

await sendDirect("worker", "bootstrap", {
  type: "RESULT",
  version: "1.0",
  taskId,
  worker: "0xWorkerFra",
  resultHash: "0xResultHash",
  resultPointer: "0G-storage://phase1-proof",
});
await receiveDirect("bootstrap", "RESULT");

const report = {
  capturedAt: new Date().toISOString(),
  taskId,
  pass:
    countEvents("TASK_POSTED_RECEIVED") === 2 &&
    countEvents("BID_RECEIVED") === 2 &&
    countEvents("BID_ACCEPTED_RECEIVED") === 1 &&
    countEvents("AUCTION_CLOSED_RECEIVED") === 2 &&
    countEvents("RESULT_RECEIVED") === 1,
  events,
};

console.log(JSON.stringify(report, null, 2));
if (!report.pass) process.exitCode = 1;

async function publishAndObserve(topic, message) {
  const channels = {
    bootstrap: new GossipSubChannel(topic, clients.bootstrap, { heartbeatMs: 250 }),
    worker: new GossipSubChannel(topic, clients.worker, { heartbeatMs: 250 }),
    local: new GossipSubChannel(topic, clients.local, { heartbeatMs: 250 }),
  };

  const received = new Set();
  for (const node of ["worker", "local"]) {
    channels[node].subscribe((gossip) => {
      const decoded = JSON.parse(gossip.payload.toString("utf8"));
      if (decoded.taskId !== taskId || decoded.type !== message.type) return;
      received.add(node);
      events.push({
        at: new Date().toISOString(),
        event: `${message.type}_RECEIVED`,
        node,
        topic,
        messageId: gossip.messageId,
        latencySourcePeer: gossip.fromPeerId,
      });
    });
  }

  await Promise.all(Object.values(channels).map((channel) => channel.start()));
  await sleep(2500);
  events.push({ at: new Date().toISOString(), event: `${message.type}_PUBLISHED`, node: "bootstrap", topic });
  await channels.bootstrap.publish(Buffer.from(JSON.stringify(message)));

  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline && received.size < 2) await sleep(50);

  for (const channel of Object.values(channels)) channel.stop();
  if (received.size < 2) throw new Error(`${message.type} pubsub fanout incomplete on ${topic}`);
}

async function sendDirect(from, to, message) {
  await clients[from].send(peerIds[to], Buffer.from(JSON.stringify(message)));
  events.push({ at: new Date().toISOString(), event: `${message.type}_SENT`, from, to });
}

async function receiveDirect(node, expectedType) {
  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    const received = await clients[node].receive();
    if (!received) {
      await sleep(100);
      continue;
    }
    let decoded;
    try {
      decoded = JSON.parse(received.payload.toString("utf8"));
    } catch {
      continue;
    }
    if (decoded.taskId !== taskId || decoded.type !== expectedType) continue;
    events.push({
      at: new Date().toISOString(),
      event: `${expectedType}_RECEIVED`,
      node,
      fromPeerId: received.fromPeerId,
      payload: decoded,
    });
    return;
  }
  throw new Error(`${node} did not receive ${expectedType}`);
}

async function drainQueues() {
  for (const client of Object.values(clients)) {
    for (let i = 0; i < 50; i += 1) {
      const message = await client.receive();
      if (!message) break;
    }
  }
}

function countEvents(event) {
  return events.filter((item) => item.event === event).length;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
