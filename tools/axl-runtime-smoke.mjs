import {
  LedgerAxlRuntime,
  LEDGER_JOBS_TOPIC,
} from "../agents/axl-runtime/dist/index.js";

const bootstrap = new LedgerAxlRuntime({ baseUrl: "http://127.0.0.1:9101" });
const worker = new LedgerAxlRuntime({ baseUrl: "http://127.0.0.1:9102" });
const local = new LedgerAxlRuntime({ baseUrl: "http://127.0.0.1:9002" });

const taskId = `0x${Buffer.from(`runtime-smoke-${Date.now()}`).toString("hex").slice(0, 64)}`;
const task = {
  type: "TASK_POSTED",
  version: "1.0",
  taskId,
  buyer: "0xBuyer",
  task: {
    title: "Runtime smoke",
    deadlineSeconds: 120,
  },
  postedAt: Math.floor(Date.now() / 1000),
};

const received = [];
await worker.startPubSub({
  onTaskPosted: (message) => {
    if (message.taskId === taskId) received.push({ node: "worker", message });
  },
});
await local.startPubSub({
  onTaskPosted: (message) => {
    if (message.taskId === taskId) received.push({ node: "local", message });
  },
});

await sleep(2500);
const publishedAt = Date.now();
await bootstrap.postTask(task);

while (Date.now() - publishedAt < 10_000 && received.length < 2) {
  await sleep(50);
}

bootstrap.stopPubSub();
worker.stopPubSub();
local.stopPubSub();

const report = {
  capturedAt: new Date().toISOString(),
  api: "LedgerAxlRuntime.postTask/startPubSub",
  topic: LEDGER_JOBS_TOPIC,
  taskId,
  latencyMs: Date.now() - publishedAt,
  received,
  pass: received.some((item) => item.node === "worker") && received.some((item) => item.node === "local"),
};

console.log(JSON.stringify(report, null, 2));
if (!report.pass) process.exitCode = 1;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
