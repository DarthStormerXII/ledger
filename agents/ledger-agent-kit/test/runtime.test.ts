import { describe, expect, it, vi } from "vitest";
import {
  LedgerAgentRuntime,
  createAxlTransportAdapter,
  createZeroGMemoryAdapter,
  type AgentIdentityAdapter,
  type AgentInferenceAdapter,
  type AgentKitTask,
  type AgentMemoryAdapter,
  type AgentOwnershipAdapter,
  type AgentTransportAdapter,
} from "../src/index.js";

const task: AgentKitTask = {
  type: "TASK_POSTED",
  version: "1.0",
  taskId: "task-001",
  buyer: "buyer.ledger.eth",
  task: {
    title: "Research vault risk",
    description: "Review three 0G vault strategies and return a risk table.",
    deadlineSeconds: 3600,
  },
  payment: {
    amount: "1.0000",
    token: "0G",
    chain: "0g-galileo",
  },
  postedAt: 1777777777000,
};

describe("LedgerAgentRuntime", () => {
  it("creates an ENS-backed bid with 0G/iNFT evidence", async () => {
    const runtime = new LedgerAgentRuntime({
      worker: {
        tokenId: 1n,
        label: "worker-001",
        agentName: "Ledger Research Worker 001",
        ensParent: "ledger.eth",
      },
      adapters: {
        memory: fakeMemoryAdapter(),
        inference: fakeInferenceAdapter(),
        ownership: fakeOwnershipAdapter(),
        identity: fakeIdentityAdapter(),
      },
      clock: () => 1777777777000,
      integrity: {
        requireCapabilityOwner: true,
        requireCapabilityMemory: true,
        requireReputationProof: true,
      },
    });

    const decision = await runtime.createBidForTask(task);

    expect(decision.bid).toMatchObject({
      type: "BID",
      taskId: "task-001",
      worker: "who.worker-001.ledger.eth",
      workerINFTId: "1",
      bidAmount: "0.8800",
    });
    expect(decision.evidence).toMatchObject({
      owner: "0x6641221B1cb66Dc9f890350058A7341eF0eD600b",
      memoryCID: "0g://memory-root",
      ensName: "who.worker-001.ledger.eth",
      capabilityOwner: "0x6641221B1cb66Dc9f890350058A7341eF0eD600b",
      capabilityMemoryCID: "0g://memory-root",
      identityVerified: true,
    });
    expect(decision.reasoning.attestationDigest).toMatch(/^0x[0-9a-f]{64}$/);
  });

  it("fails closed when ENS owner proof disagrees with the iNFT owner", async () => {
    const runtime = new LedgerAgentRuntime({
      worker: workerConfig(),
      adapters: {
        memory: fakeMemoryAdapter(),
        inference: fakeInferenceAdapter(),
        ownership: fakeOwnershipAdapter(),
        identity: fakeIdentityAdapter({
          whoOwner: "0x000000000000000000000000000000000000dEaD",
        }),
      },
      integrity: { requireCapabilityOwner: true },
    });

    await expect(runtime.createBidForTask(task)).rejects.toThrow(
      /does not match WorkerINFT owner/,
    );
  });

  it("does not invent reputation when the ENS proof is missing", async () => {
    const runtime = new LedgerAgentRuntime({
      worker: workerConfig(),
      adapters: {
        memory: fakeMemoryAdapter(),
        inference: fakeInferenceAdapter(),
        ownership: fakeOwnershipAdapter(),
        identity: fakeIdentityAdapter({ repCount: undefined }),
      },
      integrity: { requireReputationProof: true },
    });

    await expect(runtime.createBidForTask(task)).rejects.toThrow(
      /reputation proof is required but missing/,
    );
  });

  it("submits the bid through the transport adapter", async () => {
    const transport = fakeTransportAdapter();
    const runtime = new LedgerAgentRuntime({
      worker: {
        ...workerConfig(),
      },
      adapters: {
        memory: fakeMemoryAdapter(),
        inference: fakeInferenceAdapter(),
        ownership: fakeOwnershipAdapter(),
        identity: fakeIdentityAdapter(),
        transport,
      },
      clock: () => 1777777777000,
    });

    await runtime.handleTaskPosted({ buyerPeerId: "peer-buyer", task });

    expect(transport.submitBid).toHaveBeenCalledWith(
      "peer-buyer",
      expect.objectContaining({ type: "BID", taskId: "task-001" }),
    );
  });

  it("wraps the AXL runtime instead of bypassing transport", async () => {
    const runtime = {
      submitBid: vi.fn(async () => undefined),
      postTask: vi.fn(async () => undefined),
    };
    const adapter = createAxlTransportAdapter({ runtime: runtime as any });
    const decision = await new LedgerAgentRuntime({
      worker: workerConfig(),
      adapters: {
        memory: fakeMemoryAdapter(),
        inference: fakeInferenceAdapter(),
        ownership: fakeOwnershipAdapter(),
        identity: fakeIdentityAdapter(),
      },
      clock: () => 1777777777000,
    }).createBidForTask(task);

    await adapter.submitBid("peer-buyer", decision.bid);
    await adapter.postTask?.(task);

    expect(runtime.submitBid).toHaveBeenCalledWith("peer-buyer", decision.bid);
    expect(runtime.postTask).toHaveBeenCalledWith(task);
  });

  it("round-trips encrypted worker memory through the memory adapter", async () => {
    const adapter = createZeroGMemoryAdapter();
    const result = await adapter.assertRoundTrip({
      agentId: "worker-001",
      plaintext: Buffer.from("agent memory proof"),
    });

    expect(result.byteEqual).toBe(true);
    expect(result.cid).toMatch(/^0g:\/\/local-/);
  });
});

function workerConfig() {
  return {
    tokenId: 1n,
    label: "worker-001",
    agentName: "Ledger Research Worker 001",
    ensParent: "ledger.eth",
  };
}

function fakeMemoryAdapter(): AgentMemoryAdapter {
  return {
    async prepare() {
      return { cid: "0g://memory-root", sealedKey: `0x${"1".repeat(64)}` };
    },
    async assertRoundTrip() {
      return { cid: "0g://memory-root", byteEqual: true };
    },
  };
}

function fakeInferenceAdapter(): AgentInferenceAdapter {
  return {
    async reason() {
      return {
        model: "0g-qwen3.6-plus",
        output: "Bid with high confidence.",
        attestationDigest: `0x${"a".repeat(64)}`,
      };
    },
  };
}

function fakeOwnershipAdapter(): AgentOwnershipAdapter {
  return {
    async readWorker() {
      return {
        tokenId: 1n,
        owner: "0x6641221B1cb66Dc9f890350058A7341eF0eD600b",
        agentName: "Ledger Research Worker 001",
        sealedKey: `0x${"b".repeat(64)}`,
        memoryCID: "0g://memory-root",
        initialReputationRef: "erc8004:base-sepolia:5444",
        updatedAt: 1777777777n,
      };
    },
  };
}

function fakeIdentityAdapter(
  overrides: Partial<Awaited<ReturnType<AgentIdentityAdapter["snapshot"]>>> = {},
): AgentIdentityAdapter {
  return {
    async snapshot() {
      return {
        names: {
          who: "who.worker-001.ledger.eth",
          pay: "pay.worker-001.ledger.eth",
          tx: "tx.task-001.worker-001.ledger.eth",
          rep: "rep.worker-001.ledger.eth",
          mem: "mem.worker-001.ledger.eth",
        },
        whoOwner: "0x6641221B1cb66Dc9f890350058A7341eF0eD600b",
        repCount: "47",
        memoryCid: "0g://memory-root",
        ...overrides,
      };
    },
  };
}

function fakeTransportAdapter(): AgentTransportAdapter {
  return {
    submitBid: vi.fn(async () => undefined),
  };
}
