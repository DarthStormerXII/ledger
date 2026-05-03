import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  BuyerAgent,
  WorkerAgent,
  createMockAdapters,
  newTaskId,
  StructuredLogger,
  type Address,
  type LedgerAdapters,
  type LedgerEvent,
  type TaskSpec,
} from "../sdk/index.js";

export const PROOFS_DIR = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "proofs",
  "data",
  "integration",
);

export interface ScenarioResult {
  scenario: string;
  pass: boolean;
  reasons: string[];
  durationMs: number;
  artifacts: Record<string, unknown>;
  events: LedgerEvent[];
}

export async function writeProof(
  name: string,
  result: ScenarioResult,
): Promise<string> {
  await mkdir(PROOFS_DIR, { recursive: true });
  const path = resolve(PROOFS_DIR, `${name}.json`);
  await writeFile(path, JSON.stringify(result, jsonReplacer, 2), "utf8");
  return path;
}

export function jsonReplacer(_k: string, v: unknown): unknown {
  if (typeof v === "bigint") return v.toString();
  return v;
}

export interface FixtureOptions {
  parentEnsName?: string;
  buyer?: { address?: Address; peerId?: string; balance?: bigint };
  workers?: {
    address: Address;
    peerId: string;
    label: string;
    balance?: bigint;
    jobCount?: number;
    avgRating?: number;
  }[];
  silent?: boolean;
}

export interface Fixture {
  adapters: LedgerAdapters;
  logger: StructuredLogger;
  buyer: BuyerAgent;
  buyerAddress: Address;
  buyerPeerId: string;
  workers: {
    agent: WorkerAgent;
    address: Address;
    peerId: string;
    label: string;
    tokenId: number;
  }[];
  events: LedgerEvent[];
  collectEvents: () => LedgerEvent[];
  shutdown: () => void;
}

export function buildFixture(opts: FixtureOptions = {}): Fixture {
  const adapters = createMockAdapters({ parentEnsName: opts.parentEnsName });
  const logger = new StructuredLogger({ silent: opts.silent ?? true });

  const buyerAddress = (opts.buyer?.address ??
    "0xbBBBbBBbbBbbBbBBBBBBBBbBBbBbbbbBBbbBBBbb") as Address;
  const buyerPeerId = opts.buyer?.peerId ?? "buyer-peer-001";

  const buyer = new BuyerAgent({
    buyerAddress,
    buyerPeerId,
    adapters,
    logger,
    initialBalance: opts.buyer?.balance ?? 1_000_000_000_000_000_000n, // 1 native unit
  });

  const events: LedgerEvent[] = [];
  buyer.on((e) => events.push(e));

  const workersInput = opts.workers ?? [
    {
      address: "0x1111111111111111111111111111111111111111" as Address,
      peerId: "worker-peer-001",
      label: "worker-001",
      jobCount: 47,
      avgRating: 4.8,
    },
    {
      address: "0x2222222222222222222222222222222222222222" as Address,
      peerId: "worker-peer-002",
      label: "worker-002",
      jobCount: 12,
      avgRating: 4.6,
    },
  ];

  const workers = workersInput.map((wi) => {
    const tokenId = adapters.inft.seedDemoWorker({
      owner: wi.address,
      agentName: wi.label,
      memoryCID: `0g://seed-${wi.label}`,
    });
    adapters.ens.bindWorkerLabel(wi.label, tokenId);
    if (wi.jobCount && wi.avgRating !== undefined) {
      adapters.reputation.seedHistory(wi.address, wi.jobCount, wi.avgRating);
    }
    const agent = new WorkerAgent({
      workerAddress: wi.address,
      workerPeerId: wi.peerId,
      workerINFTId: tokenId,
      workerLabel: wi.label,
      adapters,
      logger,
      initialBalance: wi.balance ?? 1_000_000_000_000_000_000n,
    });
    agent.on((e) => events.push(e));
    return {
      agent,
      address: wi.address,
      peerId: wi.peerId,
      label: wi.label,
      tokenId,
    };
  });

  return {
    adapters,
    logger,
    buyer,
    buyerAddress,
    buyerPeerId,
    workers,
    events,
    collectEvents: () => [...events],
    shutdown: () => {
      buyer.shutdown();
      workers.forEach((w) => w.agent.shutdown());
    },
  };
}

export function makeTaskSpec(input: {
  payment: bigint;
  bond: bigint;
  deadlineSeconds?: number;
  minReputation?: number;
  title?: string;
}): TaskSpec {
  return {
    taskId: newTaskId(),
    title: input.title ?? "Summarize the latest 0G changelog",
    description:
      "Return a 200-word executive summary suitable for an AI buyer.",
    outputSchema: "{ summary: string }",
    payment: input.payment,
    bondRequirement: input.bond,
    deadlineSeconds: input.deadlineSeconds ?? 300,
    minReputation: input.minReputation ?? 4.0,
  };
}

export async function runScenarioSafely<T>(
  name: string,
  fn: () => Promise<{
    pass: boolean;
    reasons: string[];
    artifacts: Record<string, unknown>;
    events: LedgerEvent[];
  }>,
  _typeAnchor?: T,
): Promise<ScenarioResult> {
  const start = Date.now();
  try {
    const out = await fn();
    return {
      scenario: name,
      pass: out.pass,
      reasons: out.reasons,
      durationMs: Date.now() - start,
      artifacts: out.artifacts,
      events: out.events,
    };
  } catch (err) {
    return {
      scenario: name,
      pass: false,
      reasons: [
        `uncaught: ${err instanceof Error ? err.message : String(err)}`,
      ],
      durationMs: Date.now() - start,
      artifacts: {},
      events: [],
    };
  }
}

export function summarizeEvents(events: LedgerEvent[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const e of events) counts[e.type] = (counts[e.type] ?? 0) + 1;
  return counts;
}
