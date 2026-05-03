import { AxlClient } from "../agents/axl-client/dist/index.js";
import { GossipSubChannel } from "../agents/axl-gossipsub/dist/index.js";

const clients = {
  bootstrap: new AxlClient(process.env.AXL_BOOTSTRAP_URL ?? "http://127.0.0.1:9101"),
  worker: new AxlClient(process.env.AXL_WORKER_URL ?? "http://127.0.0.1:9102"),
  local: new AxlClient(process.env.AXL_LOCAL_URL ?? "http://127.0.0.1:9002"),
};

const topic = "#ledger-jobs";
const nonce = `gossipsub-${new Date().toISOString()}-${Math.random().toString(16).slice(2)}`;
const payload = Buffer.from(JSON.stringify({ type: "TASK_POSTED", topic, nonce }));

await drainQueues();

const channels = {
  bootstrap: new GossipSubChannel(topic, clients.bootstrap, { heartbeatMs: 250 }),
  worker: new GossipSubChannel(topic, clients.worker, { heartbeatMs: 250 }),
  local: new GossipSubChannel(topic, clients.local, { heartbeatMs: 250 }),
};

const received = new Map();
const startedAt = Date.now();

channels.worker.subscribe((message) => record("worker", message));
channels.local.subscribe((message) => record("local", message));

await Promise.all(Object.values(channels).map((channel) => channel.start()));
await sleep(2500);

const publishedAt = Date.now();
await channels.bootstrap.publish(payload);

while (Date.now() - publishedAt < 10_000 && received.size < 2) {
  await sleep(50);
}

for (const channel of Object.values(channels)) {
  channel.stop();
}

const report = {
  capturedAt: new Date().toISOString(),
  topic,
  nonce,
  publisher: "bootstrap",
  setupMs: publishedAt - startedAt,
  received: Object.fromEntries(received.entries()),
  pass: received.has("worker") && received.has("local"),
  withinOneSecond:
    (received.get("worker")?.latencyMs ?? Infinity) <= 1000 &&
    (received.get("local")?.latencyMs ?? Infinity) <= 1000,
};

console.log(JSON.stringify(report, null, 2));

if (!report.pass || !report.withinOneSecond) {
  process.exitCode = 1;
}

function record(nodeName, message) {
  if (received.has(nodeName)) return;
  const text = message.payload.toString("utf8");
  if (!text.includes(nonce)) return;
  received.set(nodeName, {
    latencyMs: Date.now() - publishedAt,
    fromPeerId: message.fromPeerId,
    originPeerId: message.originPeerId,
    messageId: message.messageId,
    hop: message.hop,
    payload: text,
  });
}

async function drainQueues() {
  for (const client of Object.values(clients)) {
    for (let i = 0; i < 20; i += 1) {
      const message = await client.receive();
      if (!message) break;
    }
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
