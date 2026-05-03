import {
  assertMemoryRoundTrip,
  prepareWorkerMemory,
  readDemoWorker,
  readWorkerProfile,
  runWorkerReasoning,
  type PreparedWorkerMemory,
  type WorkerProfile,
  type ZeroGIntegrationConfig,
} from "../../0g-integration/src/index.js";
import type { StorageAdapter } from "../../0g-storage/src/index.js";
import {
  LedgerAxlRuntime,
  type BidMessage,
  type TaskPostedMessage,
} from "../../axl-runtime/src/index.js";
import {
  LedgerCapabilityClient,
  type CapabilitySnapshot,
  type LedgerCapabilityClientOptions,
} from "../../../resolver/src/client.js";
import type {
  AgentIdentityAdapter,
  AgentInferenceAdapter,
  AgentMemoryAdapter,
  AgentOwnershipAdapter,
  AgentTransportAdapter,
} from "./types.js";

export function createZeroGMemoryAdapter(options: {
  storage?: StorageAdapter;
} = {}): AgentMemoryAdapter {
  return {
    prepare(input): Promise<PreparedWorkerMemory> {
      return prepareWorkerMemory({ ...input, storage: options.storage });
    },
    assertRoundTrip(input): Promise<{ cid: string; byteEqual: true }> {
      return assertMemoryRoundTrip({ ...input, storage: options.storage });
    },
  };
}

export function createZeroGComputeAdapter(options: {
  model?: "0g-glm-5" | "0g-qwen3.6-plus";
} = {}): AgentInferenceAdapter {
  const model = options.model ?? "0g-qwen3.6-plus";
  return {
    async reason(prompt) {
      const result = await runWorkerReasoning(prompt, model);
      return { ...result, model };
    },
  };
}

export function createDeterministicReasoner(options: {
  model?: string;
  output?: string;
  attestationDigest?: string;
} = {}): AgentInferenceAdapter {
  return {
    async reason(prompt) {
      return {
        model: options.model ?? "deterministic-dry-run",
        output:
          options.output ??
          `Bid only if the task matches the worker mandate. Prompt bytes: ${Buffer.byteLength(prompt)}`,
        attestationDigest: options.attestationDigest,
      };
    },
  };
}

export function createZeroGOwnershipAdapter(options: {
  config?: ZeroGIntegrationConfig;
  demoOnly?: boolean;
} = {}): AgentOwnershipAdapter {
  return {
    readWorker(tokenId): Promise<WorkerProfile> {
      if (options.demoOnly || tokenId === 1n)
        return readDemoWorker(options.config);
      return readWorkerProfile(tokenId, options.config);
    },
  };
}

export function createEnsIdentityAdapter(
  options: LedgerCapabilityClientOptions,
): AgentIdentityAdapter {
  const client = new LedgerCapabilityClient(options);
  return {
    snapshot(input): Promise<CapabilitySnapshot> {
      return client.snapshot(input.workerLabel, input.tokenId, input.txId);
    },
  };
}

export function createAxlTransportAdapter(options: {
  runtime?: LedgerAxlRuntime;
  baseUrl?: string;
} = {}): AgentTransportAdapter {
  const runtime =
    options.runtime ?? new LedgerAxlRuntime({ baseUrl: options.baseUrl });
  return {
    submitBid(buyerPeerId: string, bid: BidMessage): Promise<void> {
      return runtime.submitBid(buyerPeerId, bid);
    },
    postTask(task: TaskPostedMessage): Promise<void> {
      return runtime.postTask(task);
    },
  };
}
